from rest_framework import status
from rest_framework.response import Response

import razorpay
from django.conf import settings
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import UserCredit, Payment, CreditTransaction, APIKey
from .serializers import (
    UserCreditSerializer,
    PaymentSerializer,
    CreatePaymentSerializer,
    CreditTransactionSerializer,
)

class CreditBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        credit_account, created = UserCredit.objects.get_or_create(user=request.user)
        serializer = UserCreditSerializer(credit_account)
        return Response(serializer.data)


class CreatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        if serializer.is_valid():
            try:
                client = razorpay.Client(
                    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
                )
                amount = int(serializer.validated_data['amount'] * 100)
                razorpay_order = client.order.create({
                    "amount": amount,
                    "currency": "INR",
                    "payment_capture": 1
                })
                order_id = razorpay_order['id']
            except Exception:
                order_id = f"ORDER-{int(timezone.now().timestamp())}"

            payment = Payment.objects.create(
                user=request.user,
                amount=serializer.validated_data['amount'],
                credits_purchased=serializer.validated_data['credits_purchased'],
                gateway='razorpay',
                gateway_order_id=order_id,
                status='pending',
            )
            return Response({
                'payment_id': payment.id,
                'razorpay_order_id': order_id,
                'razorpay_key': settings.RAZORPAY_KEY_ID,
                'amount': int(serializer.validated_data['amount'] * 100),
                'currency': 'INR',
                'message': 'Payment created, proceed to gateway',
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ConfirmPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id, user=request.user)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

        if payment.status == 'success':
            return Response({'message': 'Already confirmed'})

        razorpay_payment_id = request.data.get('razorpay_payment_id') or request.data.get('gateway_payment_id')

        with transaction.atomic():
            payment.status = 'success'
            if razorpay_payment_id:
                payment.gateway_payment_id = razorpay_payment_id
            payment.save()

            credit_account, created = UserCredit.objects.get_or_create(user=request.user)
            credit_account.balance += payment.credits_purchased
            credit_account.save()

            CreditTransaction.objects.create(
                user=request.user,
                amount=payment.credits_purchased,
                transaction_type='purchase',
                description=f'Credits purchased via order {payment.gateway_order_id or f"#{payment.id}"}',
            )

        return Response({'message': 'Payment confirmed, credits added'})


class CancelPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id, user=request.user)
            if payment.status == 'pending':
                payment.status = 'cancelled'
                if hasattr(payment, 'failure_reason'):
                    payment.failure_reason = 'User closed Razorpay checkout modal'
                payment.save()
            return Response({'message': 'Payment marked as cancelled', 'status': payment.status})
        except Payment.DoesNotExist:
            return Response({'error': 'Payment record not found'}, status=status.HTTP_404_NOT_FOUND)


class FailPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id, user=request.user)
            if payment.status == 'pending':
                payment.status = 'failed'
                if hasattr(payment, 'failure_reason'):
                    payment.failure_reason = request.data.get('reason', 'Payment failed at gateway')
                payment.save()
            return Response({'message': 'Payment marked as failed', 'status': payment.status})
        except Payment.DoesNotExist:
            return Response({'error': 'Payment record not found'}, status=status.HTTP_404_NOT_FOUND)


class PaymentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = Payment.objects.filter(user=request.user).defer('failure_reason').order_by('-created_at')
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)


class DeductCreditView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            with transaction.atomic():
                credit_account = UserCredit.objects.select_for_update().get_or_create(user=request.user)[0]

                if credit_account.balance < 5:
                    return Response({'error': 'Insufficient credits'}, status=status.HTTP_400_BAD_REQUEST)

                credit_account.balance -= 5
                credit_account.save()

                CreditTransaction.objects.create(
                    user=request.user,
                    amount=-5,
                    transaction_type='audit_deduction',
                    description='5 credits deducted for SEO audit',
                )

            return Response({'message': 'Credit deducted', 'balance': credit_account.balance})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreditTransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = CreditTransaction.objects.filter(user=request.user).order_by('-created_at')
        serializer = CreditTransactionSerializer(transactions, many=True)
        return Response(serializer.data)


class GenerateAPIKeyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            api_key = APIKey.objects.get(user=request.user)
            return Response({
                'api_key': api_key.key,
                'message': 'API key fetched successfully'
            })
        except APIKey.DoesNotExist:
            return Response({
                'api_key': None,
                'message': 'No API key found'
            })

    def post(self, request):
        api_key, created = APIKey.objects.get_or_create(user=request.user)
        api_key.key = APIKey.generate_key()
        api_key.save()
        return Response({
            'api_key': api_key.key,
            'message': 'API key generated successfully'
        })

    def delete(self, request):
        try:
            api_key = APIKey.objects.get(user=request.user)
            api_key.delete()
            return Response({'message': 'API key revoked successfully'})
        except APIKey.DoesNotExist:
            return Response({'error': 'No API key found'}, status=status.HTTP_404_NOT_FOUND)