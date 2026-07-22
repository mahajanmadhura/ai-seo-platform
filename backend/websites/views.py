from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Website
from .serializers import WebsiteSerializer


class WebsiteListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WebsiteSerializer

    def get_queryset(self):
        return Website.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class WebsiteDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WebsiteSerializer

    def get_queryset(self):
        return Website.objects.filter(owner=self.request.user)