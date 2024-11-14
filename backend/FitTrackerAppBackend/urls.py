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
from .views import user_list, user_detail, login_user, approve_trainer
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('users/', user_list, name='user_list'),
        path('users/<int:id>/', user_detail, name='user_detail'),
        path('login/', login_user),
         path('trainers/<int:trainer_id>/approve/', approve_trainer),
    ])),
]

urlpatterns = format_suffix_patterns(urlpatterns)