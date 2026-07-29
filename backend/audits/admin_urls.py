# backend/audits/admin_urls.py
from django.urls import path
from .admin_views import AdminAuditListView

urlpatterns = [
    path('', AdminAuditListView.as_view(), name='admin-audits-list'),
]
