from django.urls import path
from .views import (
    GenerateReportView,
    DownloadReportView,
    EmailReportView,
    CSVExportView,
    JSONExportView,
    BrandingSettingsView,
)
from .admin_views import AdminReportDataView, AdminReportExportView

urlpatterns = [
    path('data/', AdminReportDataView.as_view(), name='reports-data'),
    path('export/', AdminReportExportView.as_view(), name='reports-export'),
    path('<int:audit_id>/pdf/', GenerateReportView.as_view(), name='generate-report'),
    path('<int:audit_id>/download/', DownloadReportView.as_view(), name='download-report'),
    path('<int:audit_id>/email/', EmailReportView.as_view(), name='email-report'),
    path('<int:audit_id>/csv/', CSVExportView.as_view(), name='csv-export'),
    path('<int:audit_id>/json/', JSONExportView.as_view(), name='json-export'),
    path('branding/', BrandingSettingsView.as_view(), name='branding-settings'),
]