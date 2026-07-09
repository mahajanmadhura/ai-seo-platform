from django.db import models
from django.utils import timezone

class ProcessStatus(models.Model):
    process_type = models.CharField(max_length=50, default='audit')
    object_id = models.IntegerField()
    status = models.CharField(max_length=50, default='PENDING')
    current_step = models.CharField(max_length=100)
    message = models.TextField()
    progress_percent = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    started_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('process_type', 'object_id')

    def __str__(self):
        return f"{self.process_type} {self.object_id} - {self.status} ({self.progress_percent}%)"
