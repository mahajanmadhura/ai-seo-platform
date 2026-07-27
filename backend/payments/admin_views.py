from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from django.db import transaction
from django.db.models import Sum
from django.contrib.auth import get_user_model
from .models import UserCredit, Payment, CreditTransaction
from .serializers import AdminUserOverviewSerializer, AdminCreditAdjustmentSerializer, CreditTransactionSerializer


from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from .pagination import AdminStandardPagination
from django.contrib.auth import get_user_model
from .models import CreditTransaction
from .serializers import AdminUserOverviewSerializer, CreditTransactionSerializer

User = get_user_model()

class AdminUserListView(generics.ListAPIView):
    """GET /api/v1/payments/admin/users/"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserOverviewSerializer
    pagination_class = AdminStandardPagination

    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')


class AdminSystemAuditLogsView(generics.ListAPIView):
    """GET /api/v1/payments/admin/audit-logs/"""
    permission_classes = [IsAdminUser]
    serializer_class = CreditTransactionSerializer
    pagination_class = AdminStandardPagination

    def get_queryset(self):
        return CreditTransaction.objects.all().order_by('-created_at')
    


User = get_user_model()

class AdminAnalyticsView(APIView):
    """GET /api/v1/payments/admin/analytics/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Calculate high-level system metrics
        total_revenue = Payment.objects.filter(status='success').aggregate(Sum('amount'))['amount__sum'] or 0
        total_credits_purchased = Payment.objects.filter(status='success').aggregate(Sum('credits_purchased'))['credits_purchased__sum'] or 0
        
        data = {
            "total_revenue": total_revenue,
            "total_credits_purchased": total_credits_purchased,
            "active_users": User.objects.filter(is_active=True).count(),
            # Add subscription metrics here if applicable
        }
        return Response(data, status=status.HTTP_200_OK)


class AdminCreditAdjustmentView(APIView):
    """PUT /api/v1/payments/admin/users/<user_id>/credits/"""
    permission_classes = [IsAdminUser]

    def put(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminCreditAdjustmentSerializer(data=request.data)
        if serializer.is_valid():
            amount = serializer.validated_data['amount']
            reason = serializer.validated_data['reason']

            with transaction.atomic():
                credit_account, _ = UserCredit.objects.get_or_create(user=target_user)
                credit_account.balance += amount
                credit_account.save()

                # Log the admin action
                CreditTransaction.objects.create(
                    user=target_user,
                    amount=amount,
                    transaction_type='admin_adjustment',
                    description=f"Admin {request.user.username}: {reason}"
                )

            return Response({
                'message': 'Credits adjusted successfully',
                'new_balance': credit_account.balance
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
