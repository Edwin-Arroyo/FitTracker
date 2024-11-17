"""
URL configuration for FitTracker project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from .views import (
    user_list, 
    login_user, 
    user_detail, 
    log_exercise, 
    log_workout, 
    log_nutrition, 
    get_user_stats,
    admin_dashboard
)
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('users/', user_list, name='user_list'),
        path('users/<int:user_id>/', user_detail, name='user_detail'),
        path('login/', login_user, name='login'),
        path('exercises/', log_exercise, name='log_exercise'),
        path('users/<int:user_id>/workouts/', log_workout, name='log_workout'),
        path('users/<int:user_id>/macros/', log_nutrition, name='log_nutrition'),
        path('users/<int:user_id>/stats/', get_user_stats, name='get_user_stats'),
        path('admin/dashboard/', admin_dashboard, name='admin_dashboard'),
    ])),
]

urlpatterns = format_suffix_patterns(urlpatterns)