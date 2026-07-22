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

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        user_audits = Audit.objects.filter(website__owner=request.user)
        completed_audits = user_audits.filter(status='DONE')

        overall_scores = []
        for audit in completed_audits:
            if audit.overall_Score is not None:
                overall_scores.append(audit.overall_Score)
            else:
                pages = audit.crawledpage_set.all()
                if pages.exists():
                    scores = [p.on_page_score for p in pages if p.on_page_score is not None]
                    if scores:
                        overall_scores.append(int(sum(scores) / len(scores)))

        avg_score = int(sum(overall_scores) / len(overall_scores)) if overall_scores else None

        from websites.models import Website
        total_websites = Website.objects.filter(owner=request.user).count()
        total_audits = user_audits.count()

        from payments.models import UserCredit
        credit_account = UserCredit.objects.filter(user=request.user).first()
        credits_remaining = credit_account.balance if credit_account else 0

        return Response({
            'average_seo_score': avg_score,
            'total_websites_monitored': total_websites,
            'total_audits_performed': total_audits,
            'credits_remaining': credits_remaining
        })
