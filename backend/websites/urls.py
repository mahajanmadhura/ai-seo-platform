from django.urls import path
from .views import *

urlpatterns = [
    path("websites/", WebsiteCreateView.as_view()),
    path("websites/get_all/", WebsiteListView.as_view()),
    path("websites/<int:pk>/", WebsiteDetailView.as_view()),
    path("websites/<int:pk>/update/", WebsiteUpdateView.as_view()),
    path("websites/<int:pk>/delete/", WebsiteDeleteView.as_view()),
    path("websites/<int:pk>/verify/", WebsiteVerifyView.as_view()),
    path("websites/<int:pk>/verification-status/", WebsiteVerificationStatus.as_view()),
]