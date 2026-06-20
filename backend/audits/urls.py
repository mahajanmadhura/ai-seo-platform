from django.urls import path
from .views import start_audit

urlpatterns = [
    path("start/",start_audit,name="start_audit"),
]
