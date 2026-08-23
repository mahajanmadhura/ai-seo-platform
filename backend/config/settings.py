from pathlib import Path
from datetime import timedelta
from decouple import config
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / '.env')

SECRET_KEY = 'django-insecure-change-this-in-production-123456789'

DEBUG = True

ALLOWED_HOSTS = ['*']


# EMAIL / BREVO CONFIG (FINAL)

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL")
DOMAIN_NAME = os.getenv("DOMAIN_NAME", "SEO Ecosystem")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# ==================================
# APPS
# ==================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'django_celery_results',
    'channels',
    'rest_framework',
    'accounts',
    'websites',
    'audits',
    'payments',
    'audit_results',
    'ai_recommendations',
    'process_status',
    'reports',
    'system',
    'ai_engine',
]

try:
    import django_filters
    INSTALLED_APPS.append('django_filters')
except ImportError:
    pass

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

try:
    import whitenoise  # noqa: F401
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
except ImportError:
    pass

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

import socket

# ==================================
# DATABASE CONFIGURATION
# ==================================
try:
    import dj_database_url
except ImportError:
    dj_database_url = None

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://seo_user:seo_pass@localhost:5432/seo_db')

# Local Docker Postgres defaults. Override with your hosted DB env vars if needed.
DB_NAME = os.getenv('DB_NAME', 'seo_db')
DB_USER = os.getenv('DB_USER', 'seo_user')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'seo_pass')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

if DATABASE_URL and dj_database_url:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=False,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': DB_NAME,
            'USER': DB_USER,
            'PASSWORD': DB_PASSWORD,
            'HOST': DB_HOST,
            'PORT': DB_PORT,
            'CONN_MAX_AGE': 600,
        }
    }

AUTH_USER_MODEL = 'accounts.User'

# ==================================
# REST FRAMEWORK + JWT
# ==================================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    )
}

CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0'

# Where Celery should store the results of the tasks once they are done
CELERY_RESULT_BACKEND = 'django-db'
TIME_ZONE = 'UTC'
# Accept content in JSON format
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Django Channels WebSockets
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}



# ==================================
# STATIC & WHITENOISE
# ==================================
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

try:
    import whitenoise  # noqa: F401
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
except ImportError:
    pass

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if FRONTEND_URL and FRONTEND_URL not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)

CORS_EXPOSE_HEADERS = [
    "Content-Disposition",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if FRONTEND_URL and FRONTEND_URL not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append(FRONTEND_URL)

# Email Configuration for Brevo
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp-relay.brevo.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")  # Your Brevo login email
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")  # SMTP key, not API key


from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', '')

# Groq AI Engine Configuration
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
GROQ_MODEL = os.getenv('GROQ_MODEL', 'openai/gpt-oss-20b')

RUN_LEGACY_AUDIT_AI = False
