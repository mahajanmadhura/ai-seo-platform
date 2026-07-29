from django.db import models
from django.conf import settings

class Website(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    domain = models.URLField()
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100,blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def url(self):
        return self.domain

    def __str__(self):
        return self.domain
