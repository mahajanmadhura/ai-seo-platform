# support/admin_views.py
from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response

from .models import Ticket
from .serializers import AdminTicketSerializer
# Reusing the standard pagination class from Phase 1
from payments.pagination import AdminStandardPagination

class AdminTicketListView(generics.ListAPIView):
    """GET /api/v1/support/admin/tickets/"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminTicketSerializer
    pagination_class = AdminStandardPagination
    
    # Enable filtering by status and priority
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'priority'] 

    def get_queryset(self):
        return Ticket.objects.all().order_by('-created_at')

class AdminFeedbackListView(generics.ListAPIView):
    """GET /api/v1/support/admin/feedback/"""
    permission_classes = [IsAdminUser]
    # The architecture doc outlines this route in the URL list, but there's no model spec yet.
    # This acts as a placeholder until the Product team specs it out.
    
    def get(self, request, *args, **kwargs):
        return Response({"message": "Feedback module coming soon."})