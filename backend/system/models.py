from django.db import models

# Create your models here.
# system/models.py
from django.db import models

class ErrorLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    level = models.CharField(max_length=50)
    message = models.TextField()
    traceback = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.level}] {self.timestamp} - {self.message[:50]}"