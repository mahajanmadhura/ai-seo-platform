# support/admin_views.py
from rest_framework.response import Response
from .models import Ticket
from .serializers import AdminTicketSerializer
from config.admin_base import AdminBaseListAPIView


class AdminTicketListView(AdminBaseListAPIView):
    """GET /api/v1/admin/support/tickets/ - Supports ?status=OPEN / IN_PROGRESS / RESOLVED / CLOSED"""
    serializer_class = AdminTicketSerializer

    def get_queryset(self):
        queryset = Ticket.objects.all().order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param and status_param.upper() != 'ALL':
            queryset = queryset.filter(status__iexact=status_param)
        priority_param = self.request.query_params.get('priority')
        if priority_param and priority_param.upper() != 'ALL':
            queryset = queryset.filter(priority__iexact=priority_param)
        return queryset


class AdminFeedbackListView(AdminBaseListAPIView):
    """GET /api/v1/admin/support/feedback/"""
    def get(self, request, *args, **kwargs):
        return Response({"message": "Feedback module coming soon."})