from django.urls import path
from .views import (
    CreditBalanceView, CreatePaymentView, ConfirmPaymentView, 
    DeductCreditView, CreditTransactionHistoryView
)
from .admin_views import (
    AdminAnalyticsView, AdminUserListView, 
    AdminCreditAdjustmentView, AdminSystemAuditLogsView
)

urlpatterns = [
    path('credits/', CreditBalanceView.as_view(), name='credit-balance'),
    path('create/', CreatePaymentView.as_view(), name='create-payment'),
    path('<int:payment_id>/confirm/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('deduct/', DeductCreditView.as_view(), name='deduct-credit'),
    path('transactions/', CreditTransactionHistoryView.as_view(), name='credit-transactions'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/credits/', AdminCreditAdjustmentView.as_view(), name='admin-credit-adjust'),
    path('admin/audit-logs/', AdminSystemAuditLogsView.as_view(), name='admin-audit-logs'),
]

