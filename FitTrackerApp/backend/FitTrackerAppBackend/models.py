from django.db import models
from django.utils import timezone

# User information 
class FitTrackerUser(models.Model):
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, default='user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_approved = models.BooleanField(default=False)
    
    def __str__(self):
        return self.username
    


# Exercise information inputted by the user
class Exercise(models.Model):
    user = models.ForeignKey(
        FitTrackerUser, 
        on_delete=models.CASCADE, 
        related_name='exercises',
        null=True,  # Allow null for existing records
        blank=True  # Allow blank in forms
    )
    name = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    duration = models.IntegerField(default=0)  # Duration in minutes
    calories = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} - {self.name}"

# Workout information inputted by the user
class Workout(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
# User's workout history
class WorkoutHistory(models.Model):
    user = models.ForeignKey(FitTrackerUser, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.SET_NULL, null=True, related_name='workout_history')
    workout_date = models.DateTimeField(default=timezone.now)
    calories = models.IntegerField(default=0)
    duration = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-workout_date']
    
    def __str__(self):
        return f"{self.user.username} - {self.calories} calories on {self.workout_date.date()}"
    
# trainer client relationship model, trainer can view the information of their clients that are assigned to them by the admin 
class TrainerClient(models.Model):
    trainer = models.ForeignKey(FitTrackerUser, related_name='trainer_clients', on_delete=models.CASCADE)
    client = models.ForeignKey(FitTrackerUser, related_name='client_trainers', on_delete=models.CASCADE)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    class Meta:
        unique_together = ('trainer', 'client')  # Prevent duplicate relationships
        unique_together = ('trainer', 'client')  # Prevent duplicate relationships
    def __str__(self):
        return f"{self.trainer.username} - {self.client.username}"



# TODO: Create UserProfile model
# - Should store user's physical information (height, weight, age)
# - Should store fitness goals
# - One-to-one relationship with FitTrackerUser
# UserProfile model
class UserProfile(models.Model):
    user = models.OneToOneField(FitTrackerUser, on_delete=models.CASCADE, related_name='profile')
    height_feet = models.IntegerField(null=True, blank=True, default=0)  # Height in feet (e.g., 5)
    height_inches = models.IntegerField(null=True, blank=True, default=0)  # Height in inches (e.g., 6)
    weight = models.FloatField()  # Weight in LBS e.g (125.7 lbs)
    age = models.IntegerField()
    fitness_goals = models.TextField()  # Store goals as text

    @property
    def full_height(self):
        if self.height_feet is None or self.height_inches is None:
            return "Not set"
        return f"{self.height_feet}'{self.height_inches}\""

    def __str__(self):
        return f"{self.user.username}'s Profile - {self.full_height}"

# TODO: Create WorkoutPlan model
# - Should store workout routines created by trainers, or user created
# - Should include duration, difficulty level
# - Foreign key to trainer who created it
# - Many-to-many relationship with exercises

class WorkoutPlan(models.Model):
    class DifficultyLevel(models.TextChoices):
        EASY = 'Easy', 'Easy'
        MEDIUM = 'Medium', 'Medium'
        HARD = 'Hard', 'Hard'

    name = models.CharField(max_length=100)
    description = models.TextField()
    duration = models.IntegerField()  # Duration in mins
    difficulty_level = models.CharField(
        max_length=6,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.MEDIUM
    )
    trainer = models.ForeignKey(FitTrackerUser, on_delete=models.CASCADE, null=True, blank=True, related_name='created_plans')
    exercises = models.ManyToManyField(Exercise, related_name='workout_plans')

    def __str__(self):
        return self.name

# TODO: Create Progress model
# - Should track user's weight changes
# - Should track workout completion
# - Should store progress photos (optional)
# - Foreign key to user

# Progress model with date field
class Progress(models.Model):
    user = models.ForeignKey(FitTrackerUser, on_delete=models.CASCADE, related_name='progress')
    weight = models.FloatField()  # Weight in lbs check UserProfile 
    workout_completion = models.IntegerField()  # Track workout sessions completed
    progress_photo = models.ImageField(upload_to='progress_photos/', null=True, blank=True)  # Optional photo
    recorded_at = models.DateTimeField(auto_now_add=True)  # Automatically records the date when entry is created

    def __str__(self):
        return f"{self.user.username} - Progress on {self.recorded_at.date()}"


# TODO: Create ExerciseLog model
# - Should track sets, reps, weight for each exercise
# - Should be linked to specific workout session
# - Foreign keys to user and exercise

# ExerciseLog model with date field
class ExerciseLog(models.Model):
    user = models.ForeignKey(FitTrackerUser, on_delete=models.CASCADE, related_name='exercise_logs')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='logs')
    workout_session = models.ForeignKey(WorkoutHistory, on_delete=models.CASCADE, related_name='exercise_logs')
    sets = models.IntegerField()
    reps = models.IntegerField()
    weight = models.FloatField()  # Weight used in lbs
    recorded_at = models.DateTimeField(auto_now_add=True)  # Automatically records the date when entry is created

    def __str__(self):
        return f"{self.user.username} - {self.exercise.name} log on {self.recorded_at.date()}"


# TODO: Create Nutrition model
# - Should track daily macronutrient intake (carbs, protein, fat)
# - Should auto-calculate total calories (carbs*4 + protein*4 + fat*9)
# - Foreign key to user

# Nutrition model
class Nutrition(models.Model):
    user = models.ForeignKey(FitTrackerUser, on_delete=models.CASCADE, related_name='nutrition')
    carbs = models.FloatField()  # Carbohydrates in grams
    protein = models.FloatField()  # Protein in grams
    fat = models.FloatField()  # Fat in grams
    recorded_at = models.DateField(auto_now_add=True)

    @property
    def total_calories(self):
        return (self.carbs * 4) + (self.protein * 4) + (self.fat * 9)

    def __str__(self):
        return f"{self.user.username} - Nutrition on {self.recorded_at}"
    
    # Trainer assigned workouts to clients 
class AssignedWorkout(models.Model):
    trainer = models.ForeignKey(FitTrackerUser, on_delete=models.CASCADE, related_name='assigned_workouts')
    client = models.ForeignKey(FitTrackerUser, on_delete=models.CASCADE, related_name='received_workouts')
    exercise_name = models.CharField(max_length=100)
    description = models.TextField()
    duration = models.IntegerField()  # Duration in minutes
    calories = models.IntegerField()
    assigned_date = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    completed_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.trainer.username} assigned {self.exercise_name} to {self.client.username}"