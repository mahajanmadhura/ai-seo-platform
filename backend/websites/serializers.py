from rest_framework import serializers
from .models import *

class WebsiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Website
        fields = '__all__'
        read_only_fields = ["owner", "is_verified", "verification_token", "created_at"]
        