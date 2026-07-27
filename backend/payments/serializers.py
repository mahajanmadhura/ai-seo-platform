from rest_framework import serializers
from .models import UserCredit, Payment, CreditTransaction
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminUserOverviewSerializer(serializers.ModelSerializer):
    """Serializer for the User List & Overview admin page."""
    available_credits = serializers.SerializerMethodField()
    # Note: If you have a Subscription model linked to the user, include it here.

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active', 'available_credits']

    def get_available_credits(self, obj):
        credit_account = UserCredit.objects.filter(user=obj).first()
        return credit_account.balance if credit_account else 0

class AdminCreditAdjustmentSerializer(serializers.Serializer):
    """Serializer for manual credit adjustments by administrators."""
    amount = serializers.IntegerField(help_text="Amount of credits to add (positive) or deduct (negative)")
    reason = serializers.CharField(max_length=255, help_text="Reason for the manual adjustment")

class UserCreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCredit
        fields = ['id', 'balance', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'credits_purchased', 'gateway',
                  'gateway_order_id', 'gateway_payment_id', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']


class CreatePaymentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    credits_purchased = serializers.IntegerField()


class CreditTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditTransaction
        fields = ['id', 'amount', 'transaction_type', 'description', 'created_at']