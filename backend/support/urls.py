# support/urls.py
from django.urls import path
from .views import TicketListCreateView, TicketDetailView, TicketReplyView
from .admin_views import AdminTicketListView, AdminFeedbackListView

urlpatterns = [
    path('tickets/', TicketListCreateView.as_view(), name='client-tickets-list-create'),
    path('tickets/<int:pk>/', TicketDetailView.as_view(), name='client-ticket-detail'),
    path('tickets/<int:pk>/reply/', TicketReplyView.as_view(), name='client-ticket-reply'),
    path('admin/tickets/', AdminTicketListView.as_view(), name='admin-tickets-list'),
    path('admin/feedback/', AdminFeedbackListView.as_view(), name='admin-feedback-list'),
]