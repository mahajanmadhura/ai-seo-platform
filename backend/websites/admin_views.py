# websites/admin_views.py
from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from .models import Website
from .serializers import AdminWebsiteSerializer
# Importing the pagination class you created in Phase 1
from payments.pagination import AdminStandardPagination

class AdminWebsiteListView(generics.ListAPIView):
    """GET /api/v1/websites/admin/websites/"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminWebsiteSerializer
    pagination_class = AdminStandardPagination
    
    # Adding global search and filtering capabilities
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status', 'user'] # Allows filtering by ?status=active or ?user=123
    search_fields = ['domain'] # Allows searching via ?search=example.com

    def get_queryset(self):
        return Website.objects.all().order_by('-created_at')