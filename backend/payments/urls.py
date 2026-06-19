from django.urls import path
from .views import (
    CreditBalanceView,
    CreatePaymentView,
    ConfirmPaymentView,
    DeductCreditView,
    CreditTransactionHistoryView,
    AdminUsersListView,
    AdminCreditAdjustView,
    AdminAnalyticsView,
    AdminAuditLogsView,
)

urlpatterns = [
    path('credits/', CreditBalanceView.as_view(), name='credit-balance'),
    path('create/', CreatePaymentView.as_view(), name='create-payment'),
    path('<int:payment_id>/confirm/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('deduct/', DeductCreditView.as_view(), name='deduct-credit'),
    path('transactions/', CreditTransactionHistoryView.as_view(), name='credit-transactions'),

    # Admin APIs
    path('admin/users/', AdminUsersListView.as_view(), name='admin-users-list'),
    path('admin/users/<int:user_id>/credits/', AdminCreditAdjustView.as_view(), name='admin-credit-adjust'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('admin/audit-logs/', AdminAuditLogsView.as_view(), name='admin-audit-logs'),
]