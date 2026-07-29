# audits/admin_views.py
from .models import Audit 
from .serializers import AdminAuditSerializer
from config.admin_base import AdminBaseListAPIView


class AdminAuditListView(AdminBaseListAPIView):
    """GET /api/v1/admin/audits/ - Supports ?status=FAILED / DONE / PENDING / RUNNING"""
    serializer_class = AdminAuditSerializer

    def get_queryset(self):
        queryset = Audit.objects.all().order_by('-started_at')
        status_param = self.request.query_params.get('status')
        if status_param and status_param.upper() != 'ALL':
            queryset = queryset.filter(status__iexact=status_param)
        return queryset