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

from audits.models import Audit, CrawledPage, SEOIssues, Link

class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Link
        fields = [
            'id',
            'target_url',
            'anchor_text',
            'rel',
            'is_internal',
            'is_broken',
            'status_code',
            'redirects',
            'redirect_target'
        ]

class CrawledPageSerializer(serializers.ModelSerializer):
    links = LinkSerializer(many=True, read_only=True)

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
            'word_count',
            'largest_contentful_paint',
            'cumulative_layout_shift',
            'first_contentful_paint',
            'time_to_first_byte',
            'first_input_delay',
            'mobile_font_readability',
            'mobile_tap_targets',
            'has_mobile_viewport_configuration',
            'has_valid_SSL',
            'has_strict_transport_security',
            'has_content_security_policy',
            'has_x_frame_options',
            'has_mixed_content',
            'hreflang_data',
            'is_schema_json',
            'is_hreflang',
            'is_crawlable',
            'technical_score',
            'links'
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
