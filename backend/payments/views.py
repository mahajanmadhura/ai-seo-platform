from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import UserCredit, Payment, CreditTransaction
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
            payment = Payment.objects.create(
                user=request.user,
                amount=serializer.validated_data['amount'],
                credits_purchased=serializer.validated_data['credits_purchased'],
                status='pending',
            )
            # NOTE: Yahan Razorpay/Stripe order create karne ka actual gateway call aayega
            return Response({
                'payment_id': payment.id,
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

        with transaction.atomic():
            payment.status = 'success'
            payment.save()

            credit_account, created = UserCredit.objects.get_or_create(user=request.user)
            credit_account.balance += payment.credits_purchased
            credit_account.save()

            CreditTransaction.objects.create(
                user=request.user,
                amount=payment.credits_purchased,
                transaction_type='purchase',
                description=f'Credits purchased via payment #{payment.id}',
            )

        return Response({'message': 'Payment confirmed, credits added'})


class DeductCreditView(APIView):
    """Audit start karte waqt 1 credit katne ke liye internal use"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        credit_account, created = UserCredit.objects.get_or_create(user=request.user)

        if credit_account.balance < 1:
            return Response({'error': 'Insufficient credits'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            credit_account.balance -= 1
            credit_account.save()

            CreditTransaction.objects.create(
                user=request.user,
                amount=-1,
                transaction_type='audit_deduction',
                description='1 credit deducted for audit',
            )

        return Response({'message': 'Credit deducted', 'balance': credit_account.balance})


class CreditTransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = CreditTransaction.objects.filter(user=request.user).order_by('-created_at')
        serializer = CreditTransactionSerializer(transactions, many=True)
        return Response(serializer.data)
    

from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count

User = get_user_model()


class AdminUsersListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        data = []
        for user in users:
            credit_account, _ = UserCredit.objects.get_or_create(user=user)
            data.append({
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'is_active': user.is_active,
                'credits': credit_account.balance,
            })
        return Response(data)


class AdminCreditAdjustView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        new_balance = request.data.get('balance')
        if new_balance is None:
            return Response({'error': 'balance is required'}, status=status.HTTP_400_BAD_REQUEST)

        credit_account, _ = UserCredit.objects.get_or_create(user=user)
        old_balance = credit_account.balance
        credit_account.balance = new_balance
        credit_account.save()

        CreditTransaction.objects.create(
            user=user,
            amount=new_balance - old_balance,
            transaction_type='admin_adjustment',
            description=f'Admin adjusted credits from {old_balance} to {new_balance}',
        )

        return Response({'message': 'Credits adjusted', 'new_balance': credit_account.balance})


class AdminAnalyticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_revenue = Payment.objects.filter(status='success').aggregate(total=Sum('amount'))['total'] or 0
        total_credits_sold = Payment.objects.filter(status='success').aggregate(total=Sum('credits_purchased'))['total'] or 0
        total_payments = Payment.objects.filter(status='success').count()

        return Response({
            'total_users': total_users,
            'total_revenue': total_revenue,
            'total_credits_sold': total_credits_sold,
            'total_successful_payments': total_payments,
        })


class AdminAuditLogsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        transactions = CreditTransaction.objects.all().order_by('-created_at')[:100]
        serializer = CreditTransactionSerializer(transactions, many=True)
        return Response(serializer.data)