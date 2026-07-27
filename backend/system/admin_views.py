# system/admin_views.py
import time
import redis
from django.db import connection
from django.conf import settings
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from celery import current_app

from .models import ErrorLog
from .serializers import ErrorLogSerializer
# Importing the standard pagination from earlier
from payments.pagination import AdminStandardPagination


class IsSuperUser(BasePermission):
    """Allows access only to superusers, as defined by the architecture doc."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class CrawlerQueueStatsView(APIView):
    """GET /api/v1/system/admin/crawler/queue/"""
    permission_classes = [IsSuperUser]

    def get(self, request):
        # Inspect Celery nodes dynamically
        inspector = current_app.control.inspect()
        
        # Celery inspect returns a dict keyed by worker node name. 
        # If no workers are running, it returns None.
        active = inspector.active() or {}
        reserved = inspector.reserved() or {}
        
        active_tasks = sum(len(tasks) for tasks in active.values())
        pending_tasks = sum(len(tasks) for tasks in reserved.values())
        queue_depth = active_tasks + pending_tasks

        return Response({
            "active_tasks": active_tasks,
            "pending_tasks": pending_tasks,
            # Note: Celery doesn't natively track failed tasks or average wait time 
            # in real-time without a monitor like Flower, so we return defaults.
            "failed_tasks": 0, 
            "queue_depth": queue_depth,
            "average_wait_time": "N/A" 
        }, status=status.HTTP_200_OK)


class ProcessStatusView(APIView):
    """GET /api/v1/system/admin/processes/"""
    permission_classes = [IsSuperUser]

    def get(self, request):
        services = []
        
        # 1. Check PostgreSQL Health
        start_time = time.time()
        try:
            connection.ensure_connection()
            db_latency = int((time.time() - start_time) * 1000)
            services.append({"service": "PostgreSQL", "status": "up", "latency_ms": db_latency})
        except Exception:
            services.append({"service": "PostgreSQL", "status": "down", "latency_ms": None})
            
        # 2. Check Redis Health
        start_time = time.time()
        try:
            # Assuming CELERY_BROKER_URL is defined in settings, default to localhost
            broker_url = getattr(settings, 'CELERY_BROKER_URL', 'redis://localhost:6379/0')
            r = redis.Redis.from_url(broker_url)
            r.ping()
            redis_latency = int((time.time() - start_time) * 1000)
            services.append({"service": "Redis", "status": "up", "latency_ms": redis_latency})
        except Exception:
            services.append({"service": "Redis", "status": "down", "latency_ms": None})
            
        # 3. Check Celery Worker Health
        start_time = time.time()
        try:
            # Ping workers to ensure they are responsive
            ping_result = current_app.control.ping(timeout=1.0)
            celery_latency = int((time.time() - start_time) * 1000)
            if ping_result:
                services.append({"service": "Celery Worker", "status": "up", "latency_ms": celery_latency})
            else:
                services.append({"service": "Celery Worker", "status": "down", "latency_ms": None})
        except Exception:
            services.append({"service": "Celery Worker", "status": "down", "latency_ms": None})
            
        return Response(services, status=status.HTTP_200_OK)


class SystemLogsView(generics.ListAPIView):
    """GET /api/v1/system/admin/logs/"""
    permission_classes = [IsSuperUser]
    serializer_class = ErrorLogSerializer
    pagination_class = AdminStandardPagination
    
    def get_queryset(self):
        return ErrorLog.objects.all().order_by('-timestamp')