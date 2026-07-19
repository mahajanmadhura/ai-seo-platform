from django.urls import path
from .views import (
    GenerateReportView,
    DownloadReportView,
    DeleteReportView,
    EmailReportView,
    CSVExportView,
    JSONExportView,
    BrandingSettingsView,
)

urlpatterns = [
    path('<int:audit_id>/pdf/', GenerateReportView.as_view(), name='generate-report'),
    path('<int:report_id>/download/', DownloadReportView.as_view(), name='download-report'),
    path('<int:report_id>/delete/', DeleteReportView.as_view(), name='delete-report'),
    path('<int:report_id>/email/', EmailReportView.as_view(), name='email-report'),
    path('<int:report_id>/csv/', CSVExportView.as_view(), name='csv-export'),
    path('<int:report_id>/json/', JSONExportView.as_view(), name='json-export'),
    path('branding/', BrandingSettingsView.as_view(), name='branding-settings'),
]