from django.db import models
from django.conf import settings


class Website(models.Model):
    url = models.URLField(unique=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='websites',
        null=True, blank=True
    )

    def __str__(self):
        return self.url