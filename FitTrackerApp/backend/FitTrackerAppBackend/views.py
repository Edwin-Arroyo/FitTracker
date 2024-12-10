from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from .models import FitTrackerUser, TrainerClient, WorkoutHistory, Nutrition, Progress, UserProfile, AssignedWorkout, Exercise
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
from rest_framework.permissions import IsAuthenticated


# user_list - get all users, create a new user
@csrf_exempt
@api_view(['GET', 'POST'])
def user_list(request):
    if request.method == 'POST':
        # Registration - no auth required. was reequiring authentication before
        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                
                # Create initial profile
                UserProfile.objects.create(
                    user=user,
                    height_feet=0,
                    height_inches=0,
                    weight=0,
                    age=0,
                    fitness_goals=""
                )
                
                return Response({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'token': str(user.id),  # Using ID as token for now
                    'created_at': user.created_at
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # For GET requests (listing users) - require authentication
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response(
            {'error': 'Authorization header missing or invalid'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        token = auth_header.split(' ')[1]
        requesting_user_id = int(token)
        requesting_user = FitTrackerUser.objects.get(id=requesting_user_id)
        
        # Only allow admin users to list all users
        if requesting_user.role != 'admin':
            return Response(
                {'error': 'Unauthorized access'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        users = FitTrackerUser.objects.exclude(role='admin')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
            
    except (ValueError, FitTrackerUser.DoesNotExist):
        return Response(
            {'error': 'Invalid authentication token'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        print(f"Error in user_list: {str(e)}")  # Debug log
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


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
@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, user_id):
    try:
        # Get the requesting user's ID from the token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response(
                {'error': 'Authorization header missing or invalid'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token = auth_header.split(' ')[1]
        requesting_user_id = int(token)
        
        # Get the requested user
        user = FitTrackerUser.objects.get(pk=user_id)
        
        # Check if requester is the user themselves or their trainer
        is_trainer = TrainerClient.objects.filter(
            trainer_id=requesting_user_id,
            client_id=user_id
        ).exists()
        
        if requesting_user_id != int(user_id) and not is_trainer:
            return Response(
                {'error': 'You do not have permission to access this data'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = UserSerializer(user)
        return Response(serializer.data)
            
    except Exception as e:
        print(f"Error in user_detail: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

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
@api_view(['GET', 'POST'])
def log_workout(request, user_id):
    if request.method == 'GET':
        try:
            # Get both Exercise and WorkoutHistory records for the user
            exercises = Exercise.objects.filter(user_id=user_id).order_by('-created_at')
            workout_history = WorkoutHistory.objects.filter(user_id=user_id).order_by('-workout_date')
            
            # Combine the data
            workout_logs = []
            for exercise in exercises:
                workout_logs.append({
                    'id': exercise.id,
                    'exerciseName': exercise.name,
                    'description': exercise.description,
                    'duration': exercise.duration,
                    'calories': exercise.calories,
                    'date': exercise.created_at,
                })
            
            return Response(workout_logs, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error fetching workouts: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    elif request.method == 'POST':
        try:
            current_time = timezone.now()
            
            # Create the exercise record first
            exercise_data = {
                'user': user_id,
                'name': request.data.get('exerciseName'),
                'description': request.data.get('description'),
                'duration': request.data.get('duration'),
                'calories': request.data.get('calories'),
                'created_at': current_time
            }
            exercise_serializer = ExerciseSerializer(data=exercise_data)
            if exercise_serializer.is_valid():
                exercise = exercise_serializer.save()
                
                # Create the workout history record with the same timestamp
                workout_data = {
                    'user': user_id,
                    'workout_date': current_time,
                    'duration': request.data.get('duration'),
                    'calories': request.data.get('calories'),
                    'exercise': exercise.id  # Link to the exercise
                }
                workout_serializer = WorkoutHistorySerializer(data=workout_data)
                if workout_serializer.is_valid():
                    workout = workout_serializer.save()
                    
                    return Response({
                        'id': exercise.id,
                        'exerciseName': exercise.name,
                        'description': exercise.description,
                        'duration': exercise.duration,
                        'calories': exercise.calories,
                        'date': exercise.created_at
                    }, status=status.HTTP_201_CREATED)
                return Response(workout_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(exercise_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error in log_workout: {str(e)}")
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
        # Verify trainer's token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response(
                {'error': 'Authorization header missing or invalid'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token = auth_header.split(' ')[1]
        requesting_user_id = int(token)
        
        # Verify this is the trainer's own dashboard
        if requesting_user_id != int(trainer_id):
            return Response(
                {'error': 'Unauthorized access'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Get trainer's clients through TrainerClient relationship
        trainer_clients = TrainerClient.objects.filter(trainer_id=trainer_id)
        clients_data = []
        
        for tc in trainer_clients:
            client = tc.client
            clients_data.append({
                'id': client.id,
                'username': client.username,
                'email': client.email,
                'start_date': tc.start_date,
                'is_active': tc.is_active
            })
        
        return Response({'clients': clients_data})
        
    except Exception as e:
        print(f"Error in trainer_clients: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
        # Verify token and get requesting user (trainer)
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response(
                {'error': 'Authorization header missing or invalid'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token = auth_header.split(' ')[1]
        trainer_id = int(token)
        
        # Verify trainer has access to this client
        trainer_client_exists = TrainerClient.objects.filter(
            trainer_id=trainer_id,
            client_id=client_id
        ).exists()
        
        if not trainer_client_exists:
            return Response(
                {'error': 'You do not have permission to view this client\'s workouts'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Get both Exercise and WorkoutHistory records
        workouts = WorkoutHistory.objects.filter(user_id=client_id).order_by('-workout_date')
        exercises = Exercise.objects.filter(user_id=client_id)
        
        workout_data = []
        for workout in workouts:
            # Find matching exercise
            matching_exercise = next(
                (e for e in exercises if 
                 e.created_at.date() == workout.workout_date.date() and
                 e.duration == workout.duration and
                 e.calories == workout.calories),
                None
            )
            
            workout_data.append({
                'id': workout.id,
                'workout_date': workout.workout_date,
                'exercise_name': matching_exercise.name if matching_exercise else "Unknown Exercise",
                'description': matching_exercise.description if matching_exercise else "",
                'duration': workout.duration,
                'calories': workout.calories
            })
            
        return Response(workout_data, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error in client_workout_history: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



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
        # Verify token and get requesting user
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response(
                {'error': 'Authorization header missing or invalid'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token = auth_header.split(' ')[1]
        requesting_user_id = int(token)
        
        # Check if requester is the user themselves or their trainer
        is_trainer = TrainerClient.objects.filter(
            trainer_id=requesting_user_id,
            client_id=user_id
        ).exists()
        
        if requesting_user_id != int(user_id) and not is_trainer:
            return Response(
                {'error': 'You do not have permission to access this profile'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        if request.method == 'POST':
            # Get or create the profile
            profile, created = UserProfile.objects.get_or_create(user_id=user_id)
            
            # Update the profile with the new data
            profile.height_feet = request.data.get('height_feet', profile.height_feet)
            profile.height_inches = request.data.get('height_inches', profile.height_inches)
            profile.weight = request.data.get('weight', profile.weight)
            profile.age = request.data.get('age', profile.age)
            profile.fitness_goals = request.data.get('fitness_goals', profile.fitness_goals)
            profile.save()
            
            return Response({
                'height_feet': profile.height_feet,
                'height_inches': profile.height_inches,
                'weight': profile.weight,
                'age': profile.age,
                'fitness_goals': profile.fitness_goals
            }, status=status.HTTP_200_OK)
            
        # GET request handling...
        try:
            profile = UserProfile.objects.get(user_id=user_id)
            return Response({
                'height_feet': profile.height_feet,
                'height_inches': profile.height_inches,
                'weight': profile.weight,
                'age': profile.age,
                'fitness_goals': profile.fitness_goals
            })
        except UserProfile.DoesNotExist:
            return Response({
                'height_feet': 0,
                'height_inches': 0,
                'weight': 0,
                'age': 0,
                'fitness_goals': ''
            })

    except Exception as e:
        print(f"Error in user_profile: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

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


# Client can mark a trainer assigned workout as complete
@csrf_exempt
@api_view(['POST'])
def complete_workout(request, user_id, workout_id):
    try:
        # Get the token from the request
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response(
                {'error': 'Authorization header missing or invalid'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token = auth_header.split(' ')[1]
        requesting_user_id = int(token)
        
        # Verify the requesting user is the same as the user_id in the URL
        if requesting_user_id != int(user_id):
            return Response(
                {'error': 'Unauthorized to complete this workout'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Get the workout and verify it exists
        workout = AssignedWorkout.objects.get(
            id=workout_id,
            client_id=user_id
        )
        
        if workout.completed:
            return Response(
                {'error': 'Workout already completed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Mark as complete
        workout.completed = True
        workout.completed_date = timezone.now()
        workout.save()
        
        # Create Exercise record
        exercise = Exercise.objects.create(
            user_id=user_id,
            name=workout.exercise_name,
            description=workout.description,
            duration=workout.duration,
            calories=workout.calories,
            created_at=workout.completed_date
        )
        
        # Create WorkoutHistory entry linked to the exercise
        workout_history = WorkoutHistory.objects.create(
            user_id=user_id,
            exercise=exercise,  # Link to the exercise
            workout_date=workout.completed_date,
            calories=workout.calories,
            duration=workout.duration
        )
        
        response_data = {
            'id': workout.id,
            'exercise_name': workout.exercise_name,
            'description': workout.description,
            'duration': workout.duration,
            'calories': workout.calories,
            'completed': workout.completed,
            'completed_date': workout.completed_date,
            'trainer_name': workout.trainer.username if workout.trainer else "Unknown Trainer",
            'workout_history_id': workout_history.id,
            'exercise_id': exercise.id
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error completing workout: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Add a new endpoint to get user's exercises
@csrf_exempt
@api_view(['GET'])
def get_user_exercises(request, user_id):
    try:
        exercises = Exercise.objects.filter(user_id=user_id)
        serializer = ExerciseSerializer(exercises, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)