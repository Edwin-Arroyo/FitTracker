from django.contrib import admin
from .models import FitTrackerUser


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
