# Generated by Django 5.1.3 on 2024-12-09 21:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('FitTrackerAppBackend', '0005_exercise_calories_exercise_duration_exercise_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='workouthistory',
            name='exercise',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='workout_history', to='FitTrackerAppBackend.exercise'),
        ),
    ]
