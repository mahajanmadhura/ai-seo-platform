from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse, HttpResponse
from django.core.mail import EmailMessage
from django.conf import settings
from django.db.models import Avg
import csv
import json
import os

from .models import BrandingSettings
from .utils import generate_pdf_report
from audits.models import Audit, CrawledPage, SEOIssues


def get_pdf_filename(audit_id, website_url):
    return f"report_{audit_id}_{str(website_url)}".replace('/', '_').replace(':', '') + ".pdf"


def get_owned_audit(audit_id, user):
    """
    Fetch an Audit but only if it belongs to the requesting user.

    Ownership chain: Audit -> Website (website_id) -> owner_id (User).
    There is no direct user/created_by/owner field on Audit itself.
    """
    return Audit.objects.get(id=audit_id, website__owner=user)


class GenerateReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, audit_id):
        try:
            audit = get_owned_audit(audit_id, request.user)
        except Audit.DoesNotExist:
            return Response({'error': 'Audit not found'}, status=status.HTTP_404_NOT_FOUND)

        if audit.status != 'DONE':
            return Response(
                {'error': 'Audit is still in progress. Reports can only be generated after completion.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        branding = BrandingSettings.objects.filter(user=request.user).first()

        try:
            pdf_path, pdf_filename = generate_pdf_report(audit, branding)
            return Response({
                'message': 'Report generated successfully',
                'pdf_file': pdf_filename,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DownloadReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, audit_id):
        try:
            audit = get_owned_audit(audit_id, request.user)
        except Audit.DoesNotExist:
            return Response({'error': 'Audit not found'}, status=status.HTTP_404_NOT_FOUND)

        if audit.status != 'DONE':
            return Response(
                {'error': 'Audit is still in progress. Reports can only be downloaded after completion.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        pdf_filename = get_pdf_filename(audit_id, audit.website)
        pdf_path = os.path.join(settings.MEDIA_ROOT, 'reports', 'pdfs', pdf_filename)

        if not os.path.exists(pdf_path):
            return Response({'error': 'PDF not found, generate first'}, status=status.HTTP_404_NOT_FOUND)

        response = FileResponse(open(pdf_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="seo_report_{audit_id}.pdf"'
        return response


class EmailReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, audit_id):
        try:
            audit = get_owned_audit(audit_id, request.user)
        except Audit.DoesNotExist:
            return Response({'error': 'Audit not found'}, status=status.HTTP_404_NOT_FOUND)

        if audit.status != 'DONE':
            return Response(
                {'error': 'Audit is still in progress. Email reports can only be sent after completion.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        email_to = request.data.get('email')
        if not email_to:
            return Response({'error': 'Email address required'}, status=status.HTTP_400_BAD_REQUEST)

        pdf_filename = get_pdf_filename(audit_id, audit.website)
        pdf_path = os.path.join(settings.MEDIA_ROOT, 'reports', 'pdfs', pdf_filename)

        if not os.path.exists(pdf_path):
            return Response({'error': 'PDF not found, generate first'}, status=status.HTTP_404_NOT_FOUND)

        import base64
        import requests

        try:
            with open(pdf_path, 'rb') as f:
                encoded_pdf = base64.b64encode(f.read()).decode('utf-8')

            payload = {
                "sender": {
                    "name": getattr(settings, 'DOMAIN_NAME', 'SEO Ecosystem'),
                    "email": getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com')
                },
                "to": [{"email": email_to}],
                "subject": f"SEO Audit Report - {audit.website}",
                "htmlContent": "<p>Please find attached your detailed SEO Audit Report PDF.</p>",
                "attachment": [
                    {
                        "content": encoded_pdf,
                        "name": f"seo_report_{audit_id}.pdf"
                    }
                ]
            }

            headers = {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": getattr(settings, 'BREVO_API_KEY', '')
            }

            api_res = requests.post("https://api.brevo.com/v3/smtp/email", json=payload, headers=headers)

            if api_res.status_code in [200, 201, 202]:
                return Response({'message': f'Report sent to {email_to}'})
            else:
                return Response(
                    {'error': f'Brevo Email API failed: {api_res.text}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _build_report_context(audit, branding=None):
    """
    Single source of truth for report data, shared by CSV and JSON exports.
    Mirrors exactly what generate_pdf_report() calculates, so all three
    formats (PDF/CSV/JSON) always stay in sync.
    """
    from django.utils import timezone

    pages = CrawledPage.objects.filter(audit=audit)
    issues = SEOIssues.objects.filter(audit=audit)
    total_pages = pages.count()

    overall_score = getattr(audit, 'overall_Score', getattr(audit, 'overall_score', 0)) or 0
    performance_score = int(pages.aggregate(avg=Avg('performance_score'))['avg'] or 0)
    mobile_score = int(pages.filter(is_mobile_friendly=True).count() / max(total_pages, 1) * 100)
    security_score = int(pages.filter(has_valid_SSL=True).count() / max(total_pages, 1) * 100)

    first_page = pages.first()

    company_name = branding.company_name if branding and branding.is_white_label else 'AI SEO Audit Platform'

    summary = {
        'website_url': str(audit.website),
        'audit_id': audit.id,
        'started_at': str(getattr(audit, 'started_at', getattr(audit, 'created_at', ''))),
        'report_generated_at': timezone.now().isoformat(),
        'generated_by': company_name,
        'overall_seo_score': overall_score,
        'performance_score': performance_score,
        'mobile_score_percent': mobile_score,
        'security_score_percent': security_score,
        'total_pages_crawled': total_pages,
        'total_issues': issues.count(),
        'critical_issues': issues.filter(issue_type='ERROR').count(),
        'warnings': issues.filter(issue_type='WARNING').count(),
        'has_sitemap': bool(getattr(audit, 'has_sitemap', False)),
        'has_robots_txt': bool(getattr(audit, 'has_robots', False)),
    }

    core_web_vitals = {}
    mobile_security_checks = {}
    if first_page:
        core_web_vitals = {
            'largest_contentful_paint_s': getattr(first_page, 'largest_contentful_paint', None),
            'first_input_delay_ms': getattr(first_page, 'first_input_delay', None),
            'cumulative_layout_shift': getattr(first_page, 'cumulative_layout_shift', None),
            'first_contentful_paint_s': getattr(first_page, 'first_contentful_paint', None),
            'time_to_first_byte_s': getattr(first_page, 'time_to_first_byte', None),
            'avg_word_count': getattr(first_page, 'word_count', None),
        }
        mobile_security_checks = {
            'mobile_responsive': bool(getattr(first_page, 'is_mobile_friendly', False)),
            'ssl_certificate_valid': bool(getattr(first_page, 'has_valid_SSL', False)),
            'viewport_configured': bool(getattr(first_page, 'has_mobile_viewport_configuration', False)),
            'https_hsts_enabled': bool(getattr(first_page, 'has_strict_transport_security', False)),
            'mobile_font_readability_good': bool(getattr(first_page, 'mobile_font_readability', False)),
            'content_security_policy_enabled': bool(getattr(first_page, 'has_content_security_policy', False)),
        }

    ai_recommendation = getattr(audit, 'ai_recommendation', None) or \
        'AI Recommendations and action items will be updated post full-crawl evaluation.'

    pages_list = []
    for page in pages:
        pages_list.append({
            'url': getattr(page, 'url', ''),
            'status_code': getattr(page, 'status_code', None),
            'title': getattr(page, 'title', ''),
            'h1': getattr(page, 'h1_header', getattr(page, 'h1_models', '')),
            'word_count': getattr(page, 'word_count', 0),
            'load_time': getattr(page, 'load_time', 0.0),
            'on_page_score': getattr(page, 'on_page_score', 0),
            'technical_score': getattr(page, 'technical_score', 0),
            'performance_score': getattr(page, 'performance_score', 0),
        })

    issues_list = []
    for issue in issues:
        issues_list.append({
            'type': getattr(issue, 'issue_type', ''),
            'description': getattr(issue, 'description', getattr(issue, 'issue_description', '')),
            'page_url': getattr(issue.crawled_page, 'url', '') if hasattr(issue, 'crawled_page') and issue.crawled_page else None
        })

    return {
        'summary': summary,
        'core_web_vitals': core_web_vitals,
        'mobile_security_checks': mobile_security_checks,
        'ai_recommendation': str(ai_recommendation)[:1200],
        'crawled_pages': pages_list,
        'seo_issues': issues_list,
    }


class CSVExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, audit_id):
        try:
            audit = get_owned_audit(audit_id, request.user)
        except Audit.DoesNotExist:
            return Response({'error': 'Audit not found'}, status=status.HTTP_404_NOT_FOUND)

        if audit.status != 'DONE':
            return Response(
                {'error': 'Audit is still in progress. CSV exports can only be downloaded after completion.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        branding = BrandingSettings.objects.filter(user=request.user).first()
        ctx = _build_report_context(audit, branding)
        s = ctx['summary']

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="seo_report_{audit_id}.csv"'

        writer = csv.writer(response)

        # 1. High-Level Summary Section
        writer.writerow(['--- AUDIT SUMMARY ---'])
        writer.writerow(['Website URL', s['website_url']])
        writer.writerow(['Overall SEO Score', s['overall_seo_score']])
        writer.writerow(['Performance Score', s['performance_score']])
        writer.writerow(['Mobile Score (%)', s['mobile_score_percent']])
        writer.writerow(['Security Score (%)', s['security_score_percent']])
        writer.writerow(['Total Issues', s['total_issues']])
        writer.writerow(['Critical Issues', s['critical_issues']])
        writer.writerow(['Warnings', s['warnings']])
        writer.writerow(['Total Pages Crawled', s['total_pages_crawled']])
        writer.writerow(['Started At', s['started_at']])
        writer.writerow(['Sitemap Found', 'Yes' if s['has_sitemap'] else 'No'])
        writer.writerow(['Robots.txt Found', 'Yes' if s['has_robots_txt'] else 'No'])
        writer.writerow(['Report Generated At', s['report_generated_at']])
        writer.writerow(['Generated By', s['generated_by']])
        writer.writerow([])

        # 2. Core Web Vitals Section
        if ctx['core_web_vitals']:
            cwv = ctx['core_web_vitals']
            writer.writerow(['--- CORE WEB VITALS (Sample Page) ---'])
            writer.writerow(['Metric', 'Value'])
            writer.writerow(['LCP (Largest Contentful Paint)', f"{cwv['largest_contentful_paint_s']}s"])
            writer.writerow(['FID (First Input Delay)', f"{cwv['first_input_delay_ms']}ms"])
            writer.writerow(['CLS (Cumulative Layout Shift)', cwv['cumulative_layout_shift']])
            writer.writerow(['FCP (First Contentful Paint)', f"{cwv['first_contentful_paint_s']}s"])
            writer.writerow(['TTFB (Time to First Byte)', f"{cwv['time_to_first_byte_s']}s"])
            writer.writerow(['Avg Word Count', cwv['avg_word_count']])
            writer.writerow([])

        # 3. Mobile & Security Checks Section
        if ctx['mobile_security_checks']:
            msc = ctx['mobile_security_checks']
            writer.writerow(['--- MOBILE & SECURITY CHECKS ---'])
            writer.writerow(['Check', 'Status'])
            writer.writerow(['Mobile Responsive', 'Yes' if msc['mobile_responsive'] else 'No'])
            writer.writerow(['SSL Certificate Valid', 'Yes' if msc['ssl_certificate_valid'] else 'No'])
            writer.writerow(['Viewport Configured', 'Yes' if msc['viewport_configured'] else 'No'])
            writer.writerow(['HTTPS / HSTS Enabled', 'Yes' if msc['https_hsts_enabled'] else 'No'])
            writer.writerow(['Mobile Font Readability Good', 'Yes' if msc['mobile_font_readability_good'] else 'No'])
            writer.writerow(['Content Security Policy Enabled', 'Yes' if msc['content_security_policy_enabled'] else 'No'])
            writer.writerow([])

        # 4. AI Recommendations Section
        writer.writerow(['--- AI RECOMMENDATIONS ---'])
        writer.writerow([ctx['ai_recommendation']])
        writer.writerow([])

        # 5. Detailed Crawled Pages Section
        writer.writerow(['--- CRAWLED PAGES BREAKDOWN ---'])
        writer.writerow(['URL', 'Status Code', 'Title', 'H1 Header', 'Word Count', 'Load Time',
                          'On-Page Score', 'Technical Score', 'Performance Score'])
        for page in ctx['crawled_pages']:
            writer.writerow([
                page['url'], page['status_code'], page['title'], page['h1'],
                page['word_count'], page['load_time'],
                page['on_page_score'], page['technical_score'], page['performance_score'],
            ])
        writer.writerow([])

        # 6. SEO Issues Section
        writer.writerow(['--- DETAILED SEO ISSUES ---'])
        writer.writerow(['Issue Type', 'Description', 'Page URL'])
        for issue in ctx['seo_issues']:
            writer.writerow([issue['type'], issue['description'], issue['page_url']])

        return response


class JSONExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, audit_id):
        try:
            audit = get_owned_audit(audit_id, request.user)
        except Audit.DoesNotExist:
            return Response({'error': 'Audit not found'}, status=status.HTTP_404_NOT_FOUND)

        if audit.status != 'DONE':
            return Response(
                {'error': 'Audit is still in progress. JSON exports can only be downloaded after completion.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        branding = BrandingSettings.objects.filter(user=request.user).first()
        ctx = _build_report_context(audit, branding)

        response = HttpResponse(json.dumps(ctx, indent=2, default=str), content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename="seo_report_{audit_id}.json"'
        return response


class BrandingSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        branding, created = BrandingSettings.objects.get_or_create(user=request.user)
        return Response({
            'company_name': branding.company_name,
            'primary_color': branding.primary_color,
            'is_white_label': branding.is_white_label,
        })

    def put(self, request):
        branding, created = BrandingSettings.objects.get_or_create(user=request.user)
        branding.company_name = request.data.get('company_name', branding.company_name)
        branding.primary_color = request.data.get('primary_color', branding.primary_color)
        branding.is_white_label = request.data.get('is_white_label', True)
        branding.save()

        return Response({
            'message': 'Branding updated successfully',
            'company_name': branding.company_name,
            'primary_color': branding.primary_color,
            'is_white_label': branding.is_white_label,
        })
