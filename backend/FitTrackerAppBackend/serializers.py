from rest_framework import serializers
from .models import FitTrackerUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = FitTrackerUser
        fields = ['id', 'username', 'email', 'password', 'role', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True}
        }

    def create(self, validated_data):
        user = FitTrackerUser.objects.create(**validated_data)
        return user
