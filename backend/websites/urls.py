
from django.urls import path
from .admin_views import AdminWebsiteListView

urlpatterns = [
    # ... your existing website endpoints here ...

    # Admin Endpoints (Namespace-segregated)
    path('admin/websites/', AdminWebsiteListView.as_view(), name='admin-websites-list'),
]