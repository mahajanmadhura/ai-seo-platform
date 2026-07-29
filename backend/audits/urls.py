from django.urls import path
from .views import start_audit
from .admin_views import AdminAuditListView

urlpatterns = [
    path("start/",start_audit,name="start_audit"),
    path('admin/audits/', AdminAuditListView.as_view(), name='admin-audits-list'),
]
