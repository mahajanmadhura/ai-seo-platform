from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from audits.models import Audit, CrawledPage, SEOIssues
from .serializers import (
    AuditListSerializer,
    AuditDetailSerializer,
    CrawledPageSerializer,
    SEOIssueSerializer
)

class AuditResultsViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Audit.objects.filter(website__owner=self.request.user).order_by('-started_at')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AuditDetailSerializer
        return AuditListSerializer

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        audit = self.get_object()
        return Response({
            'audit_id': audit.id,
            'status': audit.status,
            'message': f"Audit is {audit.status.lower()}"
        })

    @action(detail=True, methods=['get'])
    def pages(self, request, pk=None):
        audit = self.get_object()
        pages = CrawledPage.objects.filter(audit=audit)
        serializer = CrawledPageSerializer(pages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def issues(self, request, pk=None):
        audit = self.get_object()
        issues = SEOIssues.objects.filter(Q(audit=audit) | Q(url__audit=audit))
        serializer = SEOIssueSerializer(issues, many=True)
        return Response(serializer.data)
