# audits/serializers.py
from rest_framework import serializers
from .models import Audit

class AdminAuditSerializer(serializers.ModelSerializer):
    """Serializer for the Admin Audits Monitoring page."""
    # Map 'score' from the architecture doc to your 'overall_Score' model field
    score = serializers.IntegerField(source='overall_Score', read_only=True)
    website_id = serializers.PrimaryKeyRelatedField(source='website', read_only=True)
    error = serializers.SerializerMethodField()
    
    class Meta:
        model = Audit
        fields = ['id', 'website_id', 'status', 'score', 'started_at', 'completed_at', 'error']

    def get_error(self, obj):
        # Since there is no explicit error field on the model, we can infer it
        if obj.status == "FAILED":
            return "Audit failed. Check system logs or Crawler SEOIssues."
        return None