# backend/system/admin_urls.py
from django.urls import path
from .admin_views import CrawlerQueueStatsView, ProcessStatusView, SystemLogsView

urlpatterns = [
    path('queue/', CrawlerQueueStatsView.as_view(), name='admin-crawler-queue'),
    path('processes/', ProcessStatusView.as_view(), name='admin-process-status'),
    path('logs/', SystemLogsView.as_view(), name='admin-system-logs'),
]
