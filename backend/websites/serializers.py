from rest_framework import serializers
from .models import Website


class WebsiteSerializer(serializers.ModelSerializer):
    url = serializers.CharField(read_only=True)

    class Meta:
        model = Website
        fields = ['id', 'domain', 'url', 'owner', 'is_verified', 'verification_token', 'created_at']
        read_only_fields = ['owner', 'url', 'created_at']
