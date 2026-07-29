from django.urls import path
from .views import (
    WebsiteCreateView, WebsiteListView, WebsiteDetailView,
    WebsiteUpdateView, WebsiteDeleteView, WebsiteVerifyView, WebsiteVerificationStatus
)

urlpatterns = [
    path("", WebsiteCreateView.as_view()),
    path("get_all/", WebsiteListView.as_view()),
    path("<int:pk>/", WebsiteDetailView.as_view()),
    path("<int:pk>/update/", WebsiteUpdateView.as_view()),
    path("<int:pk>/delete/", WebsiteDeleteView.as_view()),
    path("<int:pk>/verify/", WebsiteVerifyView.as_view()),
    path("<int:pk>/verification-status/", WebsiteVerificationStatus.as_view()),
]