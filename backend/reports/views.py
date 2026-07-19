from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse, HttpResponse
from django.core.mail import EmailMessage
from django.conf import settings
import csv
import json
import os

from .models import Report, BrandingSettings
from .utils import generate_pdf_report


class GenerateReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, audit_id):
        # Dummy data for now (actual audit data Diyan Sir ke module se aayega)
        branding = BrandingSettings.objects.filter(user=request.user).first()

        report = Report.objects.create(
            user=request.user,
            website_url=request.data.get('website_url', 'https://example.com'),
            seo_score=request.data.get('seo_score', 68),
            performance_score=request.data.get('performance_score', 45),
            mobile_score=request.data.get('mobile_score', 72),
            security_score=request.data.get('security_score', 95),
            total_issues=request.data.get('total_issues', 90),
            critical_issues=request.data.get('critical_issues', 8),
            status='pending'
        )

        try:
            pdf_path, pdf_filename = generate_pdf_report(report, branding)
            report.pdf_file = f"reports/pdfs/{pdf_filename}"
            report.status = 'generated'
            report.save()

            return Response({
                'report_id': report.id,
                'message': 'Report generated successfully',
                'status': 'generated'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            report.status = 'failed'
            report.save()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DownloadReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id, user=request.user)
        except Report.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

        if not report.pdf_file:
            return Response({'error': 'PDF not generated yet'}, status=status.HTTP_400_BAD_REQUEST)

        pdf_path = os.path.join(settings.MEDIA_ROOT, str(report.pdf_file))
        if not os.path.exists(pdf_path):
            return Response({'error': 'PDF file not found'}, status=status.HTTP_404_NOT_FOUND)

        response = FileResponse(open(pdf_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="seo_report_{report.id}.pdf"'
        return response


class DeleteReportView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id, user=request.user)
            report.delete()
            return Response({'message': 'Report deleted successfully'})
        except Report.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)


class EmailReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id, user=request.user)
        except Report.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

        email_to = request.data.get('email')
        if not email_to:
            return Response({'error': 'Email address required'}, status=status.HTTP_400_BAD_REQUEST)

        pdf_path = os.path.join(settings.MEDIA_ROOT, str(report.pdf_file))

        email = EmailMessage(
            subject=f'SEO Audit Report - {report.website_url}',
            body=f'Please find attached the SEO Audit Report for {report.website_url}.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email_to]
        )
        email.attach_file(pdf_path)
        email.send()

        return Response({'message': f'Report sent to {email_to}'})


class CSVExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id, user=request.user)
        except Report.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="seo_report_{report.id}.csv"'

        writer = csv.writer(response)
        writer.writerow(['Field', 'Value'])
        writer.writerow(['Website URL', report.website_url])
        writer.writerow(['SEO Score', report.seo_score])
        writer.writerow(['Performance Score', report.performance_score])
        writer.writerow(['Mobile Score', report.mobile_score])
        writer.writerow(['Security Score', report.security_score])
        writer.writerow(['Total Issues', report.total_issues])
        writer.writerow(['Critical Issues', report.critical_issues])
        writer.writerow(['Generated At', report.created_at])

        return response


class JSONExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id, user=request.user)
        except Report.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

        data = {
            'website_url': report.website_url,
            'seo_score': report.seo_score,
            'performance_score': report.performance_score,
            'mobile_score': report.mobile_score,
            'security_score': report.security_score,
            'total_issues': report.total_issues,
            'critical_issues': report.critical_issues,
            'generated_at': str(report.created_at),
        }

        response = HttpResponse(json.dumps(data, indent=2), content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename="seo_report_{report.id}.json"'
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
