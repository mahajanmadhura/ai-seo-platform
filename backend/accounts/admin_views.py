# accounts/admin_views.py
from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from .serializers import AdminRoleUpdateSerializer

User = get_user_model()

class AdminRoleUpdateView(generics.UpdateAPIView):
    """PUT /api/v1/admin/roles/<user_id>/"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminRoleUpdateSerializer
    queryset = User.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'