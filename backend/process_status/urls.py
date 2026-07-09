from django.urls import path
from .views import AuditProcessStatusDetailView

urlpatterns = [
    path('audit/<int:audit_id>/', AuditProcessStatusDetailView.as_view(), name='audit-process-status-detail'),
]
