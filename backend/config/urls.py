from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.urls import re_path
from django.conf.urls.static import static
from payments.admin_views import (
    AdminUserListView,
    AdminCreditAdjustmentView,
    AdminDashboardAnalyticsView,
    AdminUserDetailAnalyticsView
)
from django.views.generic import TemplateView

from reports.admin_views import AdminReportDataView, AdminReportExportView

# Dedicated Unified Admin URL Router (/api/v1/admin/...)
admin_urlpatterns = [
    path('dashboard/analytics/', AdminDashboardAnalyticsView.as_view(), name='admin-dashboard-analytics'),
    path('users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('users/<int:user_id>/credits/', AdminCreditAdjustmentView.as_view(), name='admin-user-credits'),
    path('users/<int:user_id>/analytics/', AdminUserDetailAnalyticsView.as_view(), name='admin-user-detail-analytics'),

    path('reports/data/', AdminReportDataView.as_view(), name='admin-reports-data-direct'),
    path('reports/export/', AdminReportExportView.as_view(), name='admin-reports-export-direct'),

    path('roles/', include('accounts.admin_urls')),
    path('websites/', include('websites.admin_urls')),
    path('audits/', include('audits.admin_urls')),
    path('payments/', include('payments.admin_urls')),
    path('system/', include('system.admin_urls')),
    path('ai/', include('ai_engine.admin_urls')),
    path('reports/', include('reports.admin_urls')),
]

urlpatterns = [
    # Top-Level Direct Export and Data Routers (Absolute Resolution Guarantee)
    path("api/v1/admin/reports/export/", AdminReportExportView.as_view(), name='top-admin-reports-export'),
    path("api/v1/admin/reports/data/", AdminReportDataView.as_view(), name='top-admin-reports-data'),

    # Django Built-in Admin Panel
    path('django-admin/', admin.site.urls),

    # Authentication & Client APIs (100% Backward Compatible)
    path("api/auth/", include("accounts.urls")),
    path("api/v1/accounts/", include("accounts.urls")),
    path("api/v1/websites/", include("websites.urls")),
    path("api/v1/audits/", include("audits.urls")),
    path("api/v1/audits/", include("audit_results.urls")),
    path("api/v1/ai-recommendations/", include("ai_recommendations.urls")),
    path("api/v1/process-status/", include("process_status.urls")),
    path("api/v1/reports/", include("reports.urls")),
    path("api/v1/payments/", include("payments.urls")),

    # Unified Enterprise Admin Namespace (/api/v1/admin/...)
    path("api/v1/admin/", include(admin_urlpatterns)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# Must be last – serves React's index.html for any unknown route
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

    
