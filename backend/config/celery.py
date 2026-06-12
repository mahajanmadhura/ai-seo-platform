import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Celery application 
app = Celery('config')

# read settings, 'namespace="CELERY"' means all celery-related settings in settings.py 
app.config_from_object('django.conf:settings', namespace='CELERY')

# 4. Tell Celery to automatically look for background tasks in all your Django apps
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')