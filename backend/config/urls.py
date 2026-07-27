from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path('api/v1/payments/', include('payments.urls')),
    path("api/v1/audits/",include("audits.urls")),
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/websites/', include('websites.urls')),
    path('api/v1/system/', include('system.urls')),
    path('api/v1/ai/', include('ai_engine.urls')),
    path('api/v1/support/', include('support.urls')),
]