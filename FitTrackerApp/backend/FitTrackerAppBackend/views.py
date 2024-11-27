from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import FitTrackerUser, TrainerClient, WorkoutHistory, Nutrition, Progress, UserProfile, AssignedWorkout
from .serializers import (
    UserSerializer, 
    NutritionSerializer,
    ExerciseSerializer,
    WorkoutHistorySerializer,
    AssignedWorkoutSerializer,
)
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from django.utils import timezone
from django.db.models import Sum
from datetime import datetime


# user_list - get all users, create a new user
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


# login_user - login a user, uses userID for token, no expiration or refresh token
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
                    'token': str(user.id),
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
        print(f"Login error: {str(e)}")  # Debug log
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

# user_detail - get a user's details can be used to get a user's profile information for a trainer
@csrf_exempt
@api_view(['GET'])
def user_detail(request, user_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        trainer_id = None
        try:
            trainer_id = int(token)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        user = FitTrackerUser.objects.get(pk=user_id)
        
        # Check if requesting user is a trainer assigned to this user
        trainer_client = TrainerClient.objects.filter(
            trainer_id=trainer_id,
            client=user,
            is_active=True
        ).exists()
        
        if not trainer_client and trainer_id != user_id:
            return Response({'error': 'Not authorized to view this profile'}, 
                          status=status.HTTP_403_FORBIDDEN)

        profile = UserProfile.objects.filter(user=user).first()
        
        response_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'created_at': user.created_at.isoformat(),
            'profile': None
        }
        
        if profile:
            response_data['profile'] = {
                'height_feet': profile.height_feet,
                'height_inches': profile.height_inches,
                'weight': profile.weight,
                'age': profile.age,
                'fitness_goals': profile.fitness_goals
            }
            
        return Response(response_data, status=status.HTTP_200_OK)
    except FitTrackerUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# log_exercise - log an exercise
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
        users = FitTrackerUser.objects.exclude(role='admin')
        user_data = []
        
        for user in users:
            # Get assigned trainer for users
            trainer_info = None
            if user.role == 'user':
                trainer_client = TrainerClient.objects.filter(
                    client=user,
                    is_active=True
                ).first()
                if trainer_client:
                    trainer_info = {
                        'id': trainer_client.trainer.id,
                        'username': trainer_client.trainer.username
                    }
            
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at.isoformat(),
                'assigned_trainer': trainer_info
            })
            
        return Response({
            'users': user_data,
            'total_users': len(user_data),
            'total_trainers': FitTrackerUser.objects.filter(role='trainer').count()
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
def create_trainer(request):
    try:
        data = request.data
        data['role'] = 'trainer'
        data['is_approved'] = True
        
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = FitTrackerUser.objects.create(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                role='trainer',
                is_approved=True
            )
            
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


# trainer can view their clients information for when they train them 
@csrf_exempt
@api_view(['GET'])
def trainer_clients(request, trainer_id):
    try:
        # Get all active client relationships for this trainer
        trainer_clients = TrainerClient.objects.filter(
            trainer_id=trainer_id,
            is_active=True
        ).select_related('client')
        
        clients_data = []
        for tc in trainer_clients:
            clients_data.append({
                'id': tc.client.id,
                'username': tc.client.username,
                'email': tc.client.email,
                'start_date': tc.start_date.isoformat(),
                'is_active': tc.is_active
            })
            
        return Response({
            'clients': clients_data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

# admin will assign a trainer to a client 
@csrf_exempt
@api_view(['POST'])
def assign_trainer(request):
    try:
        trainer_id = request.data.get('trainer_id')
        client_id = request.data.get('client_id')
        
        if not trainer_id or not client_id:
            return Response(
                {'error': 'Trainer ID and Client ID are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Verify trainer exists and is actually a trainer
        trainer = FitTrackerUser.objects.get(id=trainer_id, role='trainer')
        client = FitTrackerUser.objects.get(id=client_id)
        
        # Create trainer-client relationship
        TrainerClient.objects.create(
            trainer=trainer,
            client=client,
            is_active=True
        )
        
        return Response({
            'message': f'Trainer {trainer.username} assigned to {client.username}'
        }, status=status.HTTP_201_CREATED)
        
    except FitTrackerUser.DoesNotExist:
        return Response(
            {'error': 'Trainer or client not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# trainer can view their clients workout history 
@csrf_exempt
@api_view(['GET'])
def client_workout_history(request, client_id):
    try:
        workouts = WorkoutHistory.objects.filter(user_id=client_id)
        serializer = WorkoutHistorySerializer(workouts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



# trainer can view their clients progress || might not actually implement this (ask Prof)
@csrf_exempt
@api_view(['GET'])
def client_progress(request, client_id):
    try:
        progress = Progress.objects.filter(user_id=client_id).order_by('-recorded_at')
        return Response([{
            'id': p.id,
            'weight': p.weight,
            'workout_completion': p.workout_completion,
            'recorded_at': p.recorded_at.isoformat()
        } for p in progress], status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
# user_profile - info about the user e.g height, weight, age, fitness goals(maybe)
@csrf_exempt
@api_view(['GET', 'POST'])
def user_profile(request, user_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Authorization header missing or invalid'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        requesting_user_id = None
        try:
            requesting_user_id = int(token)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid token'}, 
                          status=status.HTTP_401_UNAUTHORIZED)

        user = FitTrackerUser.objects.get(pk=user_id)

        # Check if requesting user is a trainer assigned to this user
        trainer_client = TrainerClient.objects.filter(
            trainer_id=requesting_user_id,
            client=user,
            is_active=True
        ).exists()
        
        if not trainer_client and str(requesting_user_id) != str(user_id):
            return Response({'error': 'Not authorized'}, 
                          status=status.HTTP_403_FORBIDDEN)

        if request.method == 'POST':
            # Convert string values to appropriate types
            try:
                height_feet = int(request.data.get('height_feet', 0))
                height_inches = int(request.data.get('height_inches', 0))
                weight = float(request.data.get('weight', 0))
                age = int(request.data.get('age', 0))
                fitness_goals = request.data.get('fitness_goals', '')
            except (ValueError, TypeError):
                return Response({'error': 'Invalid data format'}, 
                              status=status.HTTP_400_BAD_REQUEST)

            # Update or create profile with validated data
            profile, created = UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    'height_feet': height_feet,
                    'height_inches': height_inches,
                    'weight': weight,
                    'age': age,
                    'fitness_goals': fitness_goals
                }
            )
            
            profile_data = {
                'height_feet': profile.height_feet,
                'height_inches': profile.height_inches,
                'weight': profile.weight,
                'age': profile.age,
                'fitness_goals': profile.fitness_goals,
            }
            return Response(profile_data, status=status.HTTP_200_OK)

        # GET request handling
        try:
            profile = UserProfile.objects.get(user=user)
            profile_data = {
                'height_feet': profile.height_feet,
                'height_inches': profile.height_inches,
                'weight': profile.weight,
                'age': profile.age,
                'fitness_goals': profile.fitness_goals,
            }
            return Response(profile_data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    except FitTrackerUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@csrf_exempt
@api_view(['POST'])
def assign_workout(request, client_id):
    try:
        trainer_id = request.headers.get('Authorization').split(' ')[1]
        workout_data = {
            'trainer': trainer_id,
            'client': client_id,
            'exercise_name': request.data.get('exerciseName'),
            'description': request.data.get('description'),
            'duration': request.data.get('duration'),
            'calories': request.data.get('calories')
        }
        serializer = AssignedWorkoutSerializer(data=workout_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET'])
def get_assigned_workouts(request, user_id):
    try:
        workouts = AssignedWorkout.objects.filter(client_id=user_id)
        serializer = AssignedWorkoutSerializer(workouts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)