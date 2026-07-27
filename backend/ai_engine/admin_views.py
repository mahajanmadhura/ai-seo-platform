# ai_engine/admin_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser, BasePermission
from django.db.models import Count, Sum, Avg

from .models import AIRecommendation, LLMRequestLog

class IsSuperUser(BasePermission):
    """Allows access only to superusers."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class AIRecommendationStatsView(APIView):
    """GET /api/v1/ai/admin/stats/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Aggregate the data on types of SEO issues
        stats = AIRecommendation.objects.values('issue_category').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Format dictionary exactly as specified: {"meta_tags": 450, "speed": 110}
        response_data = {item['issue_category']: item['count'] for item in stats}
        
        return Response(response_data, status=status.HTTP_200_OK)


class GroqUsageStatsView(APIView):
    """GET /api/v1/ai/admin/groq-usage/"""
    permission_classes = [IsSuperUser]

    def get(self, request):
        logs = LLMRequestLog.objects.all()
        
        if not logs.exists():
            return Response({
                "total_tokens": 0,
                "cost_estimate": 0.0,
                "average_latency_ms": 0,
                "error_rate": 0.0
            }, status=status.HTTP_200_OK)

        # Database aggregations
        total_tokens = logs.aggregate(Sum('total_tokens'))['total_tokens__sum'] or 0
        average_latency = logs.aggregate(Avg('latency_ms'))['latency_ms__avg'] or 0
        
        # Calculate error rate percentage
        total_requests = logs.count()
        failed_requests = logs.filter(is_successful=False).count()
        error_rate = round((failed_requests / total_requests) * 100, 2) if total_requests > 0 else 0.0
        
        # Calculate total cost using the model property
        total_cost = sum(log.cost_estimate for log in logs)

        return Response({
            "total_tokens": total_tokens,
            "cost_estimate": round(total_cost, 4),
            "average_latency_ms": int(average_latency),
            "error_rate": error_rate
        }, status=status.HTTP_200_OK)