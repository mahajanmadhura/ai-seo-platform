from django.db import models
from django.conf import settings


class BrandingSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='branding'
    )
    company_name = models.CharField(max_length=255, blank=True)
    logo = models.ImageField(upload_to='branding/logos/', blank=True, null=True)
    primary_color = models.CharField(max_length=7, default='#1a1a2e')
    is_white_label = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - Branding"


class Report(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('generated', 'Generated'),
        ('failed', 'Failed'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    website_url = models.URLField()
    title = models.CharField(max_length=255, default='SEO Audit Report')
    seo_score = models.IntegerField(default=0)
    performance_score = models.IntegerField(default=0)
    mobile_score = models.IntegerField(default=0)
    security_score = models.IntegerField(default=0)
    total_issues = models.IntegerField(default=0)
    critical_issues = models.IntegerField(default=0)
    pdf_file = models.FileField(upload_to='reports/pdfs/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.website_url}"
