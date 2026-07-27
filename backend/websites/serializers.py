# websites/serializers.py
from rest_framework import serializers
from .models import Website

class AdminWebsiteSerializer(serializers.ModelSerializer):
    """Serializer for the Admin Websites List page."""
    total_audits = serializers.SerializerMethodField()
    owner_id = serializers.PrimaryKeyRelatedField(source='user', read_only=True) 

    class Meta:
        model = Website
        # Exposing exactly the fields requested in the architecture doc
        fields = ['id', 'domain', 'owner_id', 'total_audits', 'created_at', 'status']

    def get_total_audits(self, obj):
        # Assuming you have a reverse relation to an Audit model.
        # Adjust 'audit_set' if your related_name is different (e.g., 'audits')
        return obj.audit_set.count()