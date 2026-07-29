from rest_framework import serializers
from .models import Website


class WebsiteSerializer(serializers.ModelSerializer):
    url = serializers.CharField(read_only=True)

    class Meta:
        model = Website
        fields = ['id', 'domain', 'url', 'owner', 'is_verified', 'verification_token', 'created_at']
        read_only_fields = ['owner', 'url', 'created_at']


class AdminWebsiteSerializer(serializers.ModelSerializer):
    """Serializer for the Admin Websites List page."""
    total_audits = serializers.SerializerMethodField()
    owner_id = serializers.PrimaryKeyRelatedField(source='owner', read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)

    class Meta:
        model = Website
        fields = ['id', 'domain', 'owner_id', 'owner_email', 'total_audits', 'is_verified', 'created_at']

    def get_total_audits(self, obj):
        return obj.audit_set.count()
