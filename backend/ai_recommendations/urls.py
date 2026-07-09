from django.urls import path
from .views import GenerateAIRecommendationView, RetrieveAIRecommendationView

urlpatterns = [
    path('audits/<int:id>/generate/', GenerateAIRecommendationView.as_view(), name='ai-recommendation-generate'),
    path('audits/<int:id>/', RetrieveAIRecommendationView.as_view(), name='ai-recommendation-retrieve'),
]
