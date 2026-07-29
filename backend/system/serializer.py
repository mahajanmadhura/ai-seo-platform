# system/serializers.py
from rest_framework import serializers
from .models import ErrorLog

class ErrorLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ErrorLog
        # Exposing timestamp, level, message, traceback as required
        fields = ['id', 'timestamp', 'level', 'message', 'traceback']