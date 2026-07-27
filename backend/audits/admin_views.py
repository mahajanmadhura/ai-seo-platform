# audits/admin_views.py
from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend

# Changed from AuditReport to Audit to match your models.py
from .models import Audit 
from .serializers import AdminAuditSerializer

# Reusing the standard pagination class from the payments app
from payments.pagination import AdminStandardPagination

class AdminAuditListView(generics.ListAPIView):
    """GET /api/v1/audits/admin/audits/"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminAuditSerializer
    pagination_class = AdminStandardPagination
    
    # Enable filtering by status
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status'] 

    def get_queryset(self):
        # Order by newest audits first using the correct Audit model
        return Audit.objects.all().order_by('-started_at')