# backend/system/serializers.py
from rest_framework import serializers
from .models import ErrorLog

class ErrorLogSerializer(serializers.ModelSerializer):
    """Serializer for system exception and error logs."""
    class Meta:
        model = ErrorLog
        fields = ['id', 'timestamp', 'level', 'message', 'traceback']
