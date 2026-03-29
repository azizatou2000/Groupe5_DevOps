from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'user_type', 'student_id', 'phone', 'is_active', 'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'password',
            'password_confirm', 'user_type', 'student_id', 'phone',
        ]
        read_only_fields = ['id']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError(
                {"password_confirm": "Les mots de passe ne correspondent pas."}
            )
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'user_type', 'student_id', 'phone', 'is_active', 'date_joined',
        ]
        read_only_fields = ['id', 'email', 'date_joined']
