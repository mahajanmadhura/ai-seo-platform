from django.db.models import Q
from rest_framework import serializers
from audits.models import Audit, CrawledPage, SEOIssues

class AdminAuditSerializer(serializers.ModelSerializer):
    """Serializer for the Admin Audits Monitoring page."""
    score = serializers.IntegerField(source='overall_Score', read_only=True)
    website_id = serializers.PrimaryKeyRelatedField(source='website', read_only=True)
    error = serializers.SerializerMethodField()
    has_ai_recommendations = serializers.SerializerMethodField()

    class Meta:
        model = Audit
        fields = ['id', 'website_id', 'status', 'score', 'started_at', 'completed_at', 'error', 'has_ai_recommendations']

    def get_error(self, obj):
        if obj.status == "FAILED":
            return "Audit failed. Check system logs or Crawler SEOIssues."
        return None

    def get_has_ai_recommendations(self, obj):
        from ai_recommendations.models import AIRecommendation
        return AIRecommendation.objects.filter(audit=obj).exists()