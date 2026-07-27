# ai_engine/urls.py
from django.urls import path
from .admin_views import AIRecommendationStatsView, GroqUsageStatsView

urlpatterns = [
    path('admin/stats/', AIRecommendationStatsView.as_view(), name='admin-ai-stats'),
    path('admin/groq-usage/', GroqUsageStatsView.as_view(), name='admin-groq-usage'),
]