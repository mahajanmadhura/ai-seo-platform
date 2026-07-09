from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/v1/", include("websites.urls")),
    path('api/v1/payments/', include('payments.urls')),
    path("api/v1/audits/", include("audits.urls")),
    path("api/v1/audits/", include("audit_results.urls")),
    path("api/v1/ai-recommendations/", include("ai_recommendations.urls")),
    path("api/v1/process-status/", include("process_status.urls")),
]