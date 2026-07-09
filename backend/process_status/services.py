from django.utils import timezone
from .models import ProcessStatus

def update_process_status(process_type, object_id, status, current_step, message, progress_percent, metadata=None):
    if metadata is None:
        metadata = {}

    defaults = {
        "status": status,
        "current_step": current_step,
        "message": message,
        "progress_percent": progress_percent,
        "metadata": metadata
    }

    if status == "RUNNING" and current_step == "QUEUED":
        defaults["started_at"] = timezone.now()
    elif status in ["DONE", "FAILED"]:
        defaults["completed_at"] = timezone.now()

    obj, created = ProcessStatus.objects.update_or_create(
        process_type=process_type,
        object_id=object_id,
        defaults=defaults
    )
    return obj
