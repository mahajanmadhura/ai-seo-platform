# backend/config/admin_base.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, IsAdminUser
from payments.pagination import AdminStandardPagination


class IsSuperUser(BasePermission):
    """Allows access only to superusers."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class StandardizedResponseMixin:
    """
    Mixin that formats DRF API responses into a standard enterprise JSON envelope:
    Success:
    {
      "success": true,
      "message": "Operation completed successfully",
      "data": [...],
      "pagination": { "count": 10, "next": null, "previous": null } # optional
    }
    Error:
    {
      "success": false,
      "message": "Error details",
      "errors": {...}
    }
    """
    success_message = "Operation completed successfully"

    def get_success_message(self, data):
        return self.success_message

    def finalize_response(self, request, response, *args, **kwargs):
        if isinstance(response, Response) and response.status_code < 400:
            original_data = response.data
            
            pagination_meta = None
            data_payload = original_data
            
            if isinstance(original_data, dict) and 'results' in original_data:
                data_payload = original_data['results']
                pagination_meta = {
                    'count': original_data.get('count'),
                    'next': original_data.get('next'),
                    'previous': original_data.get('previous')
                }

            formatted_response = {
                "success": True,
                "message": self.get_success_message(data_payload),
                "data": data_payload
            }

            if pagination_meta is not None:
                formatted_response["pagination"] = pagination_meta

            response.data = formatted_response

        elif isinstance(response, Response) and response.status_code >= 400:
            original_data = response.data
            message = "An error occurred"
            
            if isinstance(original_data, dict):
                if 'detail' in original_data:
                    message = str(original_data.pop('detail'))
                elif 'message' in original_data:
                    message = str(original_data.pop('message'))

            response.data = {
                "success": False,
                "message": message,
                "errors": original_data
            }

        return super().finalize_response(request, response, *args, **kwargs)


class AdminBaseListAPIView(StandardizedResponseMixin, generics.ListAPIView):
    """Base list API view for all Admin Endpoints with standard pagination and permissions."""
    permission_classes = [IsAdminUser]
    pagination_class = AdminStandardPagination


class AdminBaseRetrieveAPIView(StandardizedResponseMixin, generics.RetrieveAPIView):
    """Base retrieve API view for single resource inspection."""
    permission_classes = [IsAdminUser]


class AdminBaseUpdateAPIView(StandardizedResponseMixin, generics.UpdateAPIView):
    """Base update API view for admin resource modifications."""
    permission_classes = [IsAdminUser]
