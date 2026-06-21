from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import * 
from .serializers import *
import random
import string
import requests


from rest_framework.response import Response
from rest_framework import status
import random, string

class WebsiteCreateView(generics.CreateAPIView):
    serializer_class = WebsiteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        token = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
        serializer.save(owner=self.request.user, verification_token=token)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response({
            "success": True,
            "message": "Website created successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


class WebsiteListView(generics.ListAPIView):
    serializer_class = WebsiteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Website.objects.filter(owner=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "success": True,
            "message": "Websites fetched successfully",
            "data": serializer.data
        })
    

class WebsiteDetailView(generics.RetrieveAPIView):
    serializer_class = WebsiteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Website.objects.filter(owner=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        return Response({ "success": True, "message": "Website detail fetched successfully", "data": serializer.data})


class WebsiteUpdateView(generics.UpdateAPIView):
    serializer_class = WebsiteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Website.objects.filter(owner=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response({"success": True,"message": "Website updated successfully","data": serializer.data})
    


from rest_framework.response import Response
from rest_framework import status

class WebsiteDeleteView(generics.DestroyAPIView):
    serializer_class = WebsiteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Website.objects.filter(owner=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)

        return Response({"message": "Website deleted successfully"},status=status.HTTP_200_OK)
    

class WebsiteVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
     website = Website.objects.get(id=pk, owner=request.user)

     try:
            headers = {"User-Agent": "Mozilla/5.0"}
            res = requests.get(website.domain, headers=headers, timeout=10)
            html = res.text

            token = website.verification_token

            if token in html:
                website.is_verified = True
                website.save()
                return Response({"verified": True})

            return Response({
                "verified": False,
                "reason": "Token not found in page"
            }, status=400)

     except Exception as e:
            return Response({"error": str(e)}, status=500)



class WebsiteVerificationStatus(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        website = Website.objects.get(id=pk, owner=request.user)
        return Response({
            "domain": website.domain,
            "is_verified": website.is_verified
        })