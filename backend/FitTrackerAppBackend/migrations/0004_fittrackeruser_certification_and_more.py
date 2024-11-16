# Generated by Django 5.1.3 on 2024-11-14 19:14

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('FitTrackerAppBackend', '0003_fittrackeruser_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='fittrackeruser',
            name='certification',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='fittrackeruser',
            name='is_approved',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='fittrackeruser',
            name='specialization',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.CreateModel(
            name='TrainerClient',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_date', models.DateTimeField(auto_now_add=True)),
                ('end_date', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='client_trainers', to='FitTrackerAppBackend.fittrackeruser')),
                ('trainer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trainer_clients', to='FitTrackerAppBackend.fittrackeruser')),
            ],
            options={
                'unique_together': {('trainer', 'client')},
            },
        ),
    ]