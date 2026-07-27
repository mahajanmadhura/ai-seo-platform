# support/serializers.py
from rest_framework import serializers
from .models import Ticket

class AdminTicketSerializer(serializers.ModelSerializer):
    """Serializer for the Admin Support Tickets list."""
    user_id = serializers.PrimaryKeyRelatedField(source='user', read_only=True)

    class Meta:
        model = Ticket
        # Exposing exactly the fields requested: id, user_id, subject, status, priority, created_at
        fields = ['id', 'user_id', 'subject', 'status', 'priority', 'created_at']