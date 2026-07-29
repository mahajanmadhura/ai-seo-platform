# websites/admin_views.py
from django.db.models import Q
from .models import Website
from .serializers import AdminWebsiteSerializer
from config.admin_base import AdminBaseListAPIView


class AdminWebsiteListView(AdminBaseListAPIView):
    """GET /api/v1/admin/websites/ - Supports ?is_verified=true/false and ?search=query"""
    serializer_class = AdminWebsiteSerializer

    def get_queryset(self):
        queryset = Website.objects.all().order_by('-created_at')
        
        is_verified = self.request.query_params.get('is_verified')
        if is_verified is not None and is_verified.upper() != 'ALL':
            if is_verified.lower() in ['true', '1', 'verified']:
                queryset = queryset.filter(is_verified=True)
            elif is_verified.lower() in ['false', '0', 'unverified']:
                queryset = queryset.filter(is_verified=False)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(Q(domain__icontains=search) | Q(owner__email__icontains=search))

        return queryset