from rest_framework import serializers
from .models import AIRecommendation

class AIRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIRecommendation
        fields = [
            'id',
            'audit',
            'summary',
            'critical_issues',
            'impact',
            'recommended_fix',
            'priority',
            'quick_wins',
            'client_friendly_explanation',
            'seo_score',
            'created_at'
        ]
