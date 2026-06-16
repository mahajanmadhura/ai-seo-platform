from django.urls import path
from .views import (
    CreditBalanceView,
    CreatePaymentView,
    ConfirmPaymentView,
    DeductCreditView,
    CreditTransactionHistoryView,
)

urlpatterns = [
    path('credits/', CreditBalanceView.as_view(), name='credit-balance'),
    path('create/', CreatePaymentView.as_view(), name='create-payment'),
    path('<int:payment_id>/confirm/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('deduct/', DeductCreditView.as_view(), name='deduct-credit'),
    path('transactions/', CreditTransactionHistoryView.as_view(), name='credit-transactions'),
]