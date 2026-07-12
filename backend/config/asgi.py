import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
import audits.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yourproject.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter(audits.routing.websocket_urlpatterns),
})