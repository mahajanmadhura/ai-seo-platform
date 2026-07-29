# backend/websites/admin_urls.py
from django.urls import path
from .admin_views import AdminWebsiteListView

urlpatterns = [
    path('', AdminWebsiteListView.as_view(), name='admin-websites-list'),
]
