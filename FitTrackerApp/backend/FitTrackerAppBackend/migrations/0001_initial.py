from django.db import migrations, models
import django.utils.timezone

class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='FitTrackerUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=100)),
                ('password', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('role', models.CharField(default='user', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_approved', models.BooleanField(default=False)),
            ],
        ),
    ]