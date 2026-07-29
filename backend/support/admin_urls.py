# backend/support/admin_urls.py
from django.urls import path
from .admin_views import AdminTicketListView, AdminFeedbackListView

urlpatterns = [
    path('tickets/', AdminTicketListView.as_view(), name='admin-tickets-list'),
    path('feedback/', AdminFeedbackListView.as_view(), name='admin-feedback-list'),
]
