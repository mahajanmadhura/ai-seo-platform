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


class GenerateReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, audit_id):
        try:
            audit = Audit.objects.get(id=audit_id)
        except Audit.DoesNotExist:
            return Response({'error': 'Audit not found'}, status=status.HTTP_404_NOT_FOUND)

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
            audit = Audit.objects.get(id=audit_id)
        except Audit.DoesNotExist:
            return Response({'error': 'Audit not found'}, status=status.HTTP_404_NOT_FOUND)

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
            audit = Audit.objects.get(id=audit_id)
        except Audit.DoesNotExist:
            return Response({'error': 'Audit not found'}, status=status.HTTP_404_NOT_FOUND)

        email_to = request.data.get('email')
        if not email_to:
            return Response({'error': 'Email address required'}, status=status.HTTP_400_BAD_REQUEST)

        pdf_filename = get_pdf_filename(audit_id, audit.website)
        pdf_path = os.path.join(settings.MEDIA_ROOT, 'reports', 'pdfs', pdf_filename)

        if not os.path.exists(pdf_path):
            return Response({'error': 'PDF not found, generate first'}, status=status.HTTP_404_NOT_FOUND)

        email = EmailMessage(
            subject=f'SEO Audit Report',
            body='Please find attached the SEO Audit Report.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email_to]
        )
        email.attach_file(pdf_path)
        email.send()

        return Response({'message': f'Report sent to {email_to}'})


class CSVExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, audit_id):
        try:
            audit = Audit.objects.get(id=audit_id)
        except Audit.DoesNotExist:
            return Response({'error': 'Audit not found'}, status=status.HTTP_404_NOT_FOUND)

        total_issues = SEOIssues.objects.filter(audit=audit).count()
        critical_issues = SEOIssues.objects.filter(audit=audit, issue_type='ERROR').count()

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="seo_report_{audit_id}.csv"'

        writer = csv.writer(response)
        writer.writerow(['Field', 'Value'])
        writer.writerow(['Website URL', str(audit.website)])
        writer.writerow(['SEO Score', audit.overall_Score or 0])
        writer.writerow(['Total Issues', total_issues])
        writer.writerow(['Critical Issues', critical_issues])
        writer.writerow(['Total Pages', audit.total_pages])
        writer.writerow(['Generated At', audit.started_at])

        return response


class JSONExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, audit_id):
        try:
            audit = Audit.objects.get(id=audit_id)
        except Audit.DoesNotExist:
            return Response({'error': 'Audit not found'}, status=status.HTTP_404_NOT_FOUND)

        total_issues = SEOIssues.objects.filter(audit=audit).count()
        critical_issues = SEOIssues.objects.filter(audit=audit, issue_type='ERROR').count()

        data = {
            'website_url': str(audit.website),
            'seo_score': audit.overall_Score or 0,
            'total_issues': total_issues,
            'critical_issues': critical_issues,
            'total_pages': audit.total_pages,
            'generated_at': str(audit.started_at),
        }

        response = HttpResponse(json.dumps(data, indent=2), content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename="seo_report_{audit_id}.json"'
        return response


class BrandingSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        branding, created = BrandingSettings.objects.get_or_create(user=request.user)
        branding.company_name = request.data.get('company_name', branding.company_name)
        branding.primary_color = request.data.get('primary_color', branding.primary_color)
        branding.is_white_label = request.data.get('is_white_label', branding.is_white_label)
        branding.save()

        return Response({
            'message': 'Branding updated successfully',
            'company_name': branding.company_name,
            'primary_color': branding.primary_color,
            'is_white_label': branding.is_white_label,
        })