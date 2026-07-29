# backend/ai_engine/admin_urls.py
from django.urls import path
from .admin_views import AIRecommendationStatsView, GroqUsageStatsView

urlpatterns = [
    path('stats/', AIRecommendationStatsView.as_view(), name='admin-ai-stats'),
    path('groq-usage/', GroqUsageStatsView.as_view(), name='admin-groq-usage'),
]
