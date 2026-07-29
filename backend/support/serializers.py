from rest_framework import serializers
from .models import Ticket, TicketReply
from django.contrib.auth import get_user_model

User = get_user_model()

class TicketReplySerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)

    class Meta:
        model = TicketReply
        fields = ['id', 'ticket', 'user', 'user_email', 'is_staff', 'message', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class TicketSerializer(serializers.ModelSerializer):
    replies = TicketReplySerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'user', 'user_email', 'subject', 'description', 'status', 'priority', 'created_at', 'updated_at', 'replies']
        read_only_fields = ['id', 'user', 'status', 'created_at', 'updated_at', 'replies']

class AdminTicketSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    replies = TicketReplySerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'user_id', 'user_email', 'subject', 'description', 'status', 'priority', 'created_at', 'updated_at', 'replies']