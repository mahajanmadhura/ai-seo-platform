from rest_framework import serializers
from .models import ProcessStatus

class ProcessStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessStatus
        fields = [
            'process_type',
            'object_id',
            'status',
            'current_step',
            'message',
            'progress_percent',
            'metadata',
            'started_at',
            'updated_at',
            'completed_at'
        ]
