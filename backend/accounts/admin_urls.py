# backend/accounts/admin_urls.py
from django.urls import path
from .admin_views import AdminRoleUpdateView

urlpatterns = [
    path('<int:user_id>/', AdminRoleUpdateView.as_view(), name='admin-role-update'),
]
