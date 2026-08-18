# ai_engine/models.py
from django.db import models
from audits.models import Audit

class AIRecommendation(models.Model):
    audit = models.ForeignKey(Audit, on_delete=models.CASCADE)
    issue_category = models.CharField(max_length=100) # e.g., 'meta_tags', 'speed', 'links'
    recommendation_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class LLMRequestLog(models.Model):
    audit = models.ForeignKey(Audit, on_delete=models.SET_NULL, null=True, blank=True)
    prompt_tokens = models.IntegerField(default=0)
    completion_tokens = models.IntegerField(default=0)
    total_tokens = models.IntegerField(default=0)
    latency_ms = models.IntegerField(default=0)
    is_successful = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def cost_estimate(self):
        # Groq GPT-OSS 120B Pricing Calculation
        # Input: $0.59 / 1M tokens | Output: $0.79 / 1M tokens
        input_cost = (self.prompt_tokens / 1_000_000) * 0.59
        output_cost = (self.completion_tokens / 1_000_000) * 0.79
        return input_cost + output_cost