from rest_framework import serializers
from .models import UserCredit, Payment, CreditTransaction


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