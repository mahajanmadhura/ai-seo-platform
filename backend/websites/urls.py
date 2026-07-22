from django.urls import path
from . import views

urlpatterns = [
    path('', views.WebsiteListCreateView.as_view(), name='website-list-create'),
    path('<int:pk>/', views.WebsiteDetailView.as_view(), name='website-detail'),
]