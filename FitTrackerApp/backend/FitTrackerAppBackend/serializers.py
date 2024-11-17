from rest_framework import serializers
from .models import Exercise, WorkoutHistory, Nutrition, FitTrackerUser

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'description', 'created_at']

class WorkoutHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutHistory
        fields = ['id', 'user', 'workout_date', 'calories', 'duration']

class NutritionSerializer(serializers.ModelSerializer):
    total_calories = serializers.SerializerMethodField()

    def get_total_calories(self, obj):
        return obj.total_calories

    class Meta:
        model = Nutrition
        fields = ['id', 'user', 'carbs', 'protein', 'fat', 'recorded_at', 'total_calories']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = FitTrackerUser
        fields = ['id', 'username', 'email', 'role', 'created_at']
