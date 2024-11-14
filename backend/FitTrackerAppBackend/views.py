from django.http import JsonResponse
from .models import FitTrackerUser, WorkoutHistory
from .serializers import UserSerializer
from django.urls import path
from django.contrib import admin
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

ALLOWED_ROLES = ['user', 'trainer']  # admin not included, only admin can approve trainers

@api_view(['GET', 'POST'])
def user_list(request, format=None):
    if request.method == 'POST':
        data = request.data
        role = data.get('role', 'user')
        
        if role not in ALLOWED_ROLES:
            return JsonResponse({
                'error': 'Invalid role specified'
            }, status=400)
            
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at.isoformat()
            }, status=201)
        return JsonResponse(serializer.errors, status=400)

@api_view(['GET'])
def user_detail(request, id):
    try:
        user = FitTrackerUser.objects.get(pk=id)
        serializer = UserSerializer(user)
        return JsonResponse({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'created_at': user.created_at.isoformat(),
        })
    except FitTrackerUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
@api_view(['GET'])
def admin_user_list(request):
    # Check if user is admin
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    users = FitTrackerUser.objects.all()
    serializer = UserSerializer(users, many=True)
    return JsonResponse(serializer.data, safe=False)
    
# user/trainer login
@api_view(['POST'])
def login_user(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            user = FitTrackerUser.objects.get(email=email)
            if user.password == password:  
                # Check if the user is a trainer and has been approved
                if user.role == 'trainer':
                    
                    # if not user.is_approved:
                    #     return JsonResponse({'error': 'Trainer account pending approval'}, status=401)
                    return JsonResponse({
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'role': 'trainer',
                        'created_at': user.created_at,
                        
                        'clients_count': WorkoutHistory.objects.filter(trainer=user).values('user').distinct().count()
                    })
                else:
                    # Regular user login
                    return JsonResponse({
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'role': user.role,
                        'created_at': user.created_at,
                    })
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
        except FitTrackerUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
# approve trainer - admin only, trainer id is passed in the url
@api_view(['POST'])
def approve_trainer(request, trainer_id):
    # Check if user is admin
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    try:
        trainer = FitTrackerUser.objects.get(pk=trainer_id, role='trainer')
        trainer.is_approved = True
        trainer.save()
        return JsonResponse({
            'message': 'Trainer approved successfully',
            'trainer_id': trainer_id
        })
    except FitTrackerUser.DoesNotExist:
        return JsonResponse({'error': 'Trainer not found'}, status=404)