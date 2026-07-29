import logging
import hashlib
import secrets
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .utils import generate_token, async_task, send_verification_email
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

logger = logging.getLogger(__name__)

User = get_user_model()

class AdminRoleUpdateSerializer(serializers.ModelSerializer):
    groups = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = User
        fields = ['id', 'is_staff', 'groups']

    def update(self, instance, validated_data):
        group_names = validated_data.pop('groups', None)
        
        # Update standard user fields (like is_staff)
        instance = super().update(instance, validated_data)
        
        # Handle dynamic Group assignment
        if group_names is not None:
            instance.groups.clear()
            for name in group_names:
                group, _ = Group.objects.get_or_create(name=name)
                instance.groups.add(group)
                
        return instance
    
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "User with this email already exists."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)

        user.is_active = True
        user.is_verified = False

        # Generate token ONLY HERE
        raw_token, hashed_token = generate_token()

        user.verification_token = hashed_token
        user.verification_token_expiry = (
            timezone.now() + timedelta(minutes=15)
        )

        user.save()

        # Send verification email
        verification_link = (
            f"{settings.FRONTEND_URL}/verify-email/{raw_token}"
        )

        send_verification_email(user.email, verification_link)

        logger.info(f"Verification email sent to {user.email}.")

        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        
        if not user.is_verified:
            raise serializers.ValidationError("Email not verified. Please check your inbox.")
        
        refresh = RefreshToken.for_user(user)
        user.refresh_token = hashlib.sha256(str(refresh).encode()).hexdigest()
        user.save()

        return {
            'refresh_token': str(refresh),
            'access_token': str(refresh.access_token),
            'user': {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            }
        }
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'is_staff', 'is_superuser']


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)

 
    