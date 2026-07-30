from django.urls import path
from .views import (
    CreditBalanceView,
    CreatePaymentView,
    ConfirmPaymentView,
    CancelPaymentView,
    FailPaymentView,
    PaymentHistoryView,
    DeductCreditView,
    CreditTransactionHistoryView,
    GenerateAPIKeyView
)
from .admin_views import (
    AdminUserListView,
    AdminCreditAdjustmentView,
    AdminAnalyticsView,
    AdminSystemAuditLogsView
)

urlpatterns = [
    path('credits/', CreditBalanceView.as_view(), name='credit-balance'),
    path('create/', CreatePaymentView.as_view(), name='create-payment'),
    path('<int:payment_id>/confirm/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('<int:payment_id>/cancel/', CancelPaymentView.as_view(), name='cancel-payment'),
    path('<int:payment_id>/fail/', FailPaymentView.as_view(), name='fail-payment'),
    path('history/', PaymentHistoryView.as_view(), name='payment-history'),
    path('deduct/', DeductCreditView.as_view(), name='deduct-credit'),
    path('transactions/', CreditTransactionHistoryView.as_view(), name='credit-transactions'),
    path('ledger/', CreditTransactionHistoryView.as_view(), name='credit-ledger'),
    path('users/me/api-key/', GenerateAPIKeyView.as_view(), name='api-key'),

    # Admin Endpoints
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/credits/', AdminCreditAdjustmentView.as_view(), name='admin-credit-adjust'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('admin/audit-logs/', AdminSystemAuditLogsView.as_view(), name='admin-audit-logs'),
]
