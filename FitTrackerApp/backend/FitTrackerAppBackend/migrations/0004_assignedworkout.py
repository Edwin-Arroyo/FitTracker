# Generated by Django 5.1.3 on 2024-11-27 16:54

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('FitTrackerAppBackend', '0003_remove_userprofile_height_userprofile_height_feet_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='AssignedWorkout',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('exercise_name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('duration', models.IntegerField()),
                ('calories', models.IntegerField()),
                ('assigned_date', models.DateTimeField(auto_now_add=True)),
                ('completed', models.BooleanField(default=False)),
                ('completed_date', models.DateTimeField(blank=True, null=True)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_workouts', to='FitTrackerAppBackend.fittrackeruser')),
                ('trainer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assigned_workouts', to='FitTrackerAppBackend.fittrackeruser')),
            ],
        ),
    ]
