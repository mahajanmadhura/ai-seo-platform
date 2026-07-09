from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Audit, CrawledPage, SEOIssues
from websites.models import Website
from .tasks import run_seo_audit
from payments.models import UserCredit, CreditTransaction
from process_status.services import update_process_status

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_audit(request):
    website_id = request.data.get('website_id')
    key_word = request.data.get("key_word")

    if not website_id:
        return Response({"error": "Website ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        target_website = Website.objects.get(id=website_id)
    except Website.DoesNotExist:
        return Response({"error": "Website not found"}, status=status.HTTP_404_NOT_FOUND)

    if target_website.owner != request.user:
        return Response({"error": "Website does not belong to this user"}, status=status.HTTP_403_FORBIDDEN)

    # if not target_website.is_verified:
    #     return Response({"error": "Website is not verified"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            credit_account = UserCredit.objects.select_for_update().get_or_create(user=request.user)[0]
            if credit_account.balance < 5:
                return Response({"error": "Insufficient credits"}, status=status.HTTP_400_BAD_REQUEST)

            credit_account.balance -= 5
            credit_account.save()

            new_audit = Audit.objects.create(website=target_website, key_word=key_word)

            CreditTransaction.objects.create(
                user=request.user,
                amount=-5,
                transaction_type='audit_deduction',
                description=f"SEO audit started for {target_website.domain}"
            )
            
            update_process_status(
                process_type="audit",
                object_id=new_audit.id,
                status="PENDING",
                current_step="QUEUED",
                message="Queued",
                progress_percent=5
            )
            
            task_result = run_seo_audit.delay(new_audit.id)
            task_id = task_result.id

        return Response({
            "audit_id": new_audit.id,
            "task_id": task_id,
            "status": "PENDING",
            "credits_used": 5,
            "remaining_credits": credit_account.balance,
            "message": "Audit started successfully"
        })
    except Exception as e:
        return Response({"error": f"Failed to schedule audit: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

