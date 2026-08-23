# accounts/admin_views.py
from rest_framework import generics
from django.contrib.auth import get_user_model
from .serializers import AdminRoleUpdateSerializer
from config.admin_base import IsAdminUser

User = get_user_model()

class AdminRoleUpdateView(generics.UpdateAPIView):
    """PUT /api/v1/admin/roles/<user_id>/"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminRoleUpdateSerializer
    queryset = User.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'