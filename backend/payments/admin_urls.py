# backend/payments/admin_urls.py
from django.urls import path
from .admin_views import (
    AdminUserListView,
    AdminCreditAdjustmentView,
    AdminAnalyticsView,
    AdminSystemAuditLogsView,
    AdminDashboardAnalyticsView,
    AdminUserDetailAnalyticsView,
    AdminRevenueOverviewView
)

urlpatterns = [
    path('revenue/', AdminRevenueOverviewView.as_view(), name='admin-revenue-overview'),
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('users/<int:user_id>/credits/', AdminCreditAdjustmentView.as_view(), name='admin-credit-adjust'),
    path('users/<int:user_id>/analytics/', AdminUserDetailAnalyticsView.as_view(), name='admin-user-detail-analytics'),
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('dashboard/analytics/', AdminDashboardAnalyticsView.as_view(), name='admin-dashboard-analytics'),
    path('audit-logs/', AdminSystemAuditLogsView.as_view(), name='admin-audit-logs'),
]
