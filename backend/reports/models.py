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
