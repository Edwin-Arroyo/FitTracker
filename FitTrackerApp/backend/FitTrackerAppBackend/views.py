from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import FitTrackerUser, TrainerClient, WorkoutHistory, Nutrition
from .serializers import (
    UserSerializer, 
    NutritionSerializer,
    ExerciseSerializer,
    WorkoutHistorySerializer
)
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from django.utils import timezone
from django.db.models import Sum
from datetime import datetime

@csrf_exempt
@api_view(['GET', 'POST'])
def user_list(request):
    if request.method == 'POST':
        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                return Response({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'created_at': user.created_at.isoformat()
                }, status=status.HTTP_201_CREATED)
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'GET':
        users = FitTrackerUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
@csrf_exempt
@api_view(['POST'])
def login_user(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = FitTrackerUser.objects.get(email=email)
            if user.password == password:
                return Response({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'isAdmin': user.role == 'admin',
                    'created_at': user.created_at.isoformat()
                }, status=status.HTTP_200_OK)
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except FitTrackerUser.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@csrf_exempt
@api_view(['GET'])
def user_detail(request, user_id):
    try:
        user = FitTrackerUser.objects.get(pk=user_id)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'created_at': user.created_at.isoformat()
        }, status=status.HTTP_200_OK)
    except FitTrackerUser.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@csrf_exempt
@api_view(['POST'])
def log_exercise(request):
    try:
        serializer = ExerciseSerializer(data=request.data)
        if serializer.is_valid():
            exercise = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
def log_workout(request, user_id):
    try:
        # First create the exercise
        exercise_data = {
            'name': request.data.get('exerciseName'),
            'description': request.data.get('description')
        }
        exercise_serializer = ExerciseSerializer(data=exercise_data)
        if exercise_serializer.is_valid():
            exercise = exercise_serializer.save()
            
            # Then create the workout history
            workout_data = {
                'user': user_id,
                'duration': request.data.get('duration'),
                'calories': request.data.get('calories')
            }
            workout_serializer = WorkoutHistorySerializer(data=workout_data)
            if workout_serializer.is_valid():
                workout = workout_serializer.save()
                return Response({
                    'exercise': exercise_serializer.data,
                    'workout': workout_serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response(workout_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(exercise_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
def log_nutrition(request, user_id):
    try:
        data = request.data.copy()
        data['user'] = user_id
        serializer = NutritionSerializer(data=data)
        if serializer.is_valid():
            nutrition = serializer.save()
            return Response({
                'total_calories': nutrition.total_calories,
                **serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET'])
def get_user_stats(request, user_id):
    try:
        # Get today's date
        today = timezone.now().date()
        
        # Get today's workouts
        today_workouts = WorkoutHistory.objects.filter(
            user_id=user_id,
            workout_date__date=today
        )
        
        # Get total workouts for today
        total_workouts = today_workouts.count()
        
        # Get total workout duration for today
        total_duration = today_workouts.aggregate(
            total_duration=Sum('duration')
        )['total_duration'] or 0
        
        # Get total calories burned today
        calories_burned = today_workouts.aggregate(
            calories_burned=Sum('calories')
        )['calories_burned'] or 0
        
        # Get today's nutrition entry
        today_nutrition = Nutrition.objects.filter(
            user_id=user_id,
            recorded_at=today
        ).first()
        
        total_calories = today_nutrition.total_calories if today_nutrition else 0
        
        return Response({
            'total_workouts': total_workouts,
            'total_duration': total_duration,
            'total_calories': total_calories,
            'calories_burned': calories_burned
        }, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error in get_user_stats: {str(e)}")  # Add debugging
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET'])
def admin_dashboard(request):
    try:
        # Filter out admin users
        users = FitTrackerUser.objects.exclude(role='admin')
        user_data = []
        
        for user in users:
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'is_approved': user.is_approved,
                'created_at': user.created_at.isoformat()
            })
            
        return Response({
            'users': user_data,
            'total_users': len(user_data),
            'pending_approvals': FitTrackerUser.objects.exclude(role='admin').filter(is_approved=False).count()
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )