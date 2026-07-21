from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/audit/(?P<audit_id>\d+)/$', consumers.AuditProgressConsumer.as_asgi()),
]