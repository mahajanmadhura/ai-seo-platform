from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditResultsViewSet

router = DefaultRouter()
router.register(r'', AuditResultsViewSet, basename='audit-results')

urlpatterns = [
    path('', include(router.urls)),
]
