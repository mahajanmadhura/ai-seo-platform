from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from audits.models import Audit
from .models import ProcessStatus
from .serializers import ProcessStatusSerializer

class AuditProcessStatusDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, audit_id):
        try:
            audit = Audit.objects.get(id=audit_id)
        except Audit.DoesNotExist:
            return Response({"error": "Audit not found"}, status=status.HTTP_404_NOT_FOUND)

        if audit.website.owner != request.user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        proc_status = ProcessStatus.objects.filter(process_type='audit', object_id=audit_id).first()
        if not proc_status:
            return Response({"error": "Process status not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProcessStatusSerializer(proc_status)
        return Response(serializer.data)
