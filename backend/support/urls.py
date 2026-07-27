# support/urls.py
from django.urls import path
from .admin_views import AdminTicketListView, AdminFeedbackListView

urlpatterns = [
    path('admin/tickets/', AdminTicketListView.as_view(), name='admin-tickets-list'),
    path('admin/feedback/', AdminFeedbackListView.as_view(), name='admin-feedback-list'),
]