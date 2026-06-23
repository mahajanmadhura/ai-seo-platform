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

class SEOIssues(models.Model):
    issue_choices=[
        ("ERROR","❌ Error"),
        ("WARNING","⚠️ Warning"),
        ("NOTICE", "📢 Notice")
    ]
    url=models.ForeignKey(CrawledPage,on_delete=models.CASCADE)
    issue_type=models.CharField(max_length=20,choices=issue_choices)
    description=models.TextField()
    is_fixed=models.BooleanField(default=False)
