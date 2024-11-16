from django.contrib import admin
from .models import FitTrackerUser, Exercise, WorkoutPlan, Workout, WorkoutHistory, ExerciseLog, Progress, UserProfile, Nutrition, TrainerClient

# TODO: Create Admin classes
# - Register all models with admin site
# - For FitTrackerUser:
#   * List display: username, email, role, is_approved
#   * Search fields: username, email
#   * List filters: role, is_approved
# - For Workout/Exercise:
#   * List display: name, created_at
#   * Search fields: name
# - For WorkoutHistory:
#   * List display: user, workout, created_at
#   * List filters: user, workout
# - For CalorieIntake:
#   * List display: user, calories, created_at
#   * List filters: user, created_at

admin.site.register(FitTrackerUser)
# Register your models here.
admin.site.register(Exercise)
admin.site.register(WorkoutPlan)
admin.site.register(Workout)
admin.site.register(WorkoutHistory)
admin.site.register(ExerciseLog)
admin.site.register(Progress)
admin.site.register(UserProfile)
admin.site.register(Nutrition)
admin.site.register(TrainerClient)

