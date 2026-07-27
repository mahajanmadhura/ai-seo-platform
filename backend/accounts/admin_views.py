# accounts/admin_views.py
from rest_framework import generics
from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model
from .serializers import AdminRoleUpdateSerializer

User = get_user_model()

class IsSuperUser(BasePermission):
    """Allows access only to superusers, as defined by the architecture doc."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class AdminRoleUpdateView(generics.UpdateAPIView):
    """PUT /api/v1/accounts/admin/roles/<user_id>/"""
    permission_classes = [IsSuperUser]
    serializer_class = AdminRoleUpdateSerializer
    queryset = User.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'