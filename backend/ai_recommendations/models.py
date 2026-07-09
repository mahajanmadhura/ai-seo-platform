from django.db import models
from audits.models import Audit

class AIRecommendation(models.Model):
    audit = models.OneToOneField(Audit, on_delete=models.CASCADE, related_name='structured_recommendation')
    summary = models.TextField()
    critical_issues = models.JSONField(default=list)
    impact = models.TextField()
    recommended_fix = models.JSONField(default=list)
    priority = models.CharField(max_length=50)
    quick_wins = models.JSONField(default=list)
    client_friendly_explanation = models.TextField(default="")
    seo_score = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Recommendation for Audit {self.audit_id}"
