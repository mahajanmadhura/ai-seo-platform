# backend/reports/admin_urls.py
from django.urls import path
from .admin_views import (
    AdminReportDataView,
    AdminReportExportView,
    DedicatedRevenueReportView,
    DedicatedUsersReportView,
    DedicatedTransactionsReportView,
    DedicatedAuditsReportView,
    DedicatedAiUsageReportView
)

urlpatterns = [
    path('data/', AdminReportDataView.as_view(), name='admin-reports-data'),
    path('export/', AdminReportExportView.as_view(), name='admin-reports-export'),

    # Dedicated Production-Grade Report Generation Endpoints
    path('revenue/', DedicatedRevenueReportView.as_view(), name='admin-report-revenue'),
    path('users/', DedicatedUsersReportView.as_view(), name='admin-report-users'),
    path('transactions/', DedicatedTransactionsReportView.as_view(), name='admin-report-transactions'),
    path('audits/', DedicatedAuditsReportView.as_view(), name='admin-report-audits'),
    path('ai-usage/', DedicatedAiUsageReportView.as_view(), name='admin-report-ai-usage'),
]
