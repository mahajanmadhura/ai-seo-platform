from django.db import models

class Audit(models.Model):
    website=models.ForeignKey('websites.Website',on_delete=models.CASCADE)   #after merge fix needed
    status_choices=[
        ("PENDING","⏳ Pending"),
        ("RUNNING","🔄 Running"),
        ("DONE","✅ Done"),
        ("FAILED","❌ Failed")
    ]
    status=models.CharField(max_length=20,choices=status_choices,default="PENDING")
    overall_Score=models.IntegerField(null=True,blank=True)
    started_at=models.DateTimeField(auto_now_add=True)
    completed_at=models.DateTimeField(null=True,blank=True)
    total_pages=models.IntegerField(default=0)
    total_issues=models.IntegerField(default=0)
    ai_recommendation = models.TextField(null=True, blank=True)
    key_word=models.CharField(max_length=255,null=True,blank=True)
    has_sitemap=models.BooleanField(default=False)
    has_robots=models.BooleanField(default=False)
    

class CrawledPage(models.Model):
    audit=models.ForeignKey(Audit,on_delete=models.CASCADE)
    url=models.URLField(unique=False)
    status_code=models.IntegerField()
    title=models.CharField(max_length=255)
    h1=models.CharField(max_length=255)
    h2=models.IntegerField(null=True,blank=True)
    h3=models.IntegerField(null=True,blank=True)
    meta_description=models.TextField(null=True,blank=True)
    word_count=models.IntegerField()
    load_time=models.FloatField()
    on_page_score=models.IntegerField(null=True)
    technical_score=models.IntegerField(null=True)
    img_without_alt_tags=models.JSONField(null=True)
    canonical_tag_check=models.TextField()
    bold_count=models.IntegerField(default=0)
    url_structure_char_count=models.IntegerField(default=0)
    keyword_in_title=models.BooleanField(default=False)
    keyword_in_h1=models.BooleanField(default=False)
    keyword_in_meta_description=models.BooleanField(default=False)
    keyword_density=models.IntegerField(default=0)
    keyword_in_h2_h3=models.BooleanField(default=False)
    is_mobile_friendly=models.BooleanField(default=False)
    is_safe=models.BooleanField(default=False)
    performance_score=models.IntegerField(null=True, blank=True)
    redirect_chainlength=models.IntegerField(default=0)
    status_code404=models.BooleanField(default=False)
    is_crawlable=models.BooleanField(default=False)
    is_schema_json=models.BooleanField(default=False)
    is_hreflang=models.BooleanField(default=False)
    external_links_count=models.IntegerField(default=0)
    broken_links_count=models.IntegerField(default=0)
    largest_contentful_paint=models.FloatField(default=0.00)
    cumulative_layout_shift=models.FloatField(default=0.000)
    first_contentful_paint=models.FloatField(default=0.00)
    time_to_first_byte=models.FloatField(default=0.000)
    first_input_delay=models.FloatField(default=0.00)
    core_web_vitals_performance_score=models.IntegerField(default=0)
    mobile_font_readability=models.BooleanField(default=False)
    mobile_tap_targets=models.BooleanField(default=False)
    has_mobile_viewport_configuration=models.BooleanField(default=False)
    has_valid_SSL=models.BooleanField(default=False)
    has_strict_transport_security=models.BooleanField(default=False)
    has_content_security_policy=models.BooleanField(default=False)
    has_x_frame_options=models.BooleanField(default=False)

class SEOIssues(models.Model):
    issue_choices=[
        ("ERROR","❌ Error"),
        ("WARNING","⚠️ Warning"),
        ("NOTICE", "📢 Notice")
    ]
    url=models.ForeignKey(CrawledPage,on_delete=models.CASCADE,null=True,blank=True)
    audit=models.ForeignKey(Audit,on_delete=models.CASCADE,blank=True,null=True)
    issue_type=models.CharField(max_length=20,choices=issue_choices)
    description=models.TextField()
    is_fixed=models.BooleanField(default=False)
