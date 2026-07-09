from rest_framework import serializers
from audits.models import Audit, CrawledPage, SEOIssues

class AuditListSerializer(serializers.ModelSerializer):
    website_domain = serializers.CharField(source='website.domain', read_only=True)
    overall_score = serializers.SerializerMethodField()

    class Meta:
        model = Audit
        fields = [
            'id',
            'website',
            'website_domain',
            'key_word',
            'status',
            'overall_score',
            'started_at',
            'completed_at'
        ]

    def get_overall_score(self, obj):
        if obj.overall_Score is not None:
            return obj.overall_Score
        pages = obj.crawledpage_set.all()
        if pages.exists():
            scores = [p.on_page_score for p in pages if p.on_page_score is not None]
            if scores:
                return int(sum(scores) / len(scores))
        return 0

class AuditDetailSerializer(serializers.ModelSerializer):
    website_domain = serializers.CharField(source='website.domain', read_only=True)
    overall_score = serializers.SerializerMethodField()
    ai_summary = serializers.CharField(source='ai_recommendation', read_only=True)
    crawled_pages_count = serializers.SerializerMethodField()
    issues_count = serializers.SerializerMethodField()

    class Meta:
        model = Audit
        fields = [
            'id',
            'website_domain',
            'status',
            'overall_score',
            'ai_summary',
            'crawled_pages_count',
            'issues_count',
            'started_at',
            'completed_at'
        ]

    def get_overall_score(self, obj):
        if obj.overall_Score is not None:
            return obj.overall_Score
        pages = obj.crawledpage_set.all()
        if pages.exists():
            scores = [p.on_page_score for p in pages if p.on_page_score is not None]
            if scores:
                return int(sum(scores) / len(scores))
        return 0

    def get_crawled_pages_count(self, obj):
        return obj.crawledpage_set.count()

    def get_issues_count(self, obj):
        return SEOIssues.objects.filter(audit=obj).count() + SEOIssues.objects.filter(url__audit=obj).count()

class CrawledPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrawledPage
        fields = [
            'id',
            'url',
            'title',
            'meta_description',
            'load_time',
            'on_page_score',
            'performance_score',
            'core_web_vitals_performance_score',
            'status_code',
            'word_count'
        ]

class SEOIssueSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='issue_type', read_only=True)
    severity = serializers.CharField(source='issue_type', read_only=True)
    message = serializers.CharField(source='description', read_only=True)
    page_url = serializers.CharField(source='url.url', read_only=True, allow_null=True)

    class Meta:
        model = SEOIssues
        fields = [
            'id',
            'category',
            'severity',
            'message',
            'page_url',
            'is_fixed'
        ]
