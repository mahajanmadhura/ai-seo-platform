from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/v1/", include("websites.urls")),
    path('api/v1/payments/', include('payments.urls')),
    path("api/v1/audits/", include("audits.urls")),
    path("api/v1/audits/", include("audit_results.urls")),
    path("api/v1/ai-recommendations/", include("ai_recommendations.urls")),
    path("api/v1/process-status/", include("process_status.urls")),
    path('api/v1/reports/', include('reports.urls')),
    path('api/v1/websites/', include('websites.urls')),
    path("api/v1/audits/", include("audits.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
