# system/urls.py
from django.urls import path
from .admin_views import CrawlerQueueStatsView, ProcessStatusView, SystemLogsView

urlpatterns = [
    path('admin/crawler/queue/', CrawlerQueueStatsView.as_view(), name='admin-crawler-queue'),
    path('admin/processes/', ProcessStatusView.as_view(), name='admin-process-status'),
    path('admin/logs/', SystemLogsView.as_view(), name='admin-system-logs'),
]