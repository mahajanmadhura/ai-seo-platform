from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Audit, CrawledPage, SEOIssues
from accounts.models import User
from websites.models import Website
from .tasks import run_seo_audit

@api_view(['POST'])
def start_audit(request):
    # DRF parses the incoming JSON into request.data automatically
    website_id = request.data.get('website_id')
    
    if not website_id:
        return Response({"error": "Website ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    target_website=Website.objects.get(id=website_id)
    new_audit=Audit.objects.create(website=target_website)
    run_seo_audit.delay(new_audit.id)

    return Response({"audit_id":new_audit.id})