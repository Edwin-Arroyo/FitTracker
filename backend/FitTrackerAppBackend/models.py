from django.db import models

# User information 
class FitTrackerUser(models.Model):
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, default='user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Trainer specific fields
    is_approved = models.BooleanField(default=False)  # For trainer approval process
  
    
    
    def __str__(self):
        return self.username
    


# Exercise information inputted by the user
class Exercise(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

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
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE) # using foreign key to connect the workout to the user and multiple workouts to the same user
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.workout.name}"
    

    def __str__(self):
        return f"{self.user.username} - {self.calories} calories"
    
# Add a trainer-client relationship model
class TrainerClient(models.Model):
    trainer = models.ForeignKey(FitTrackerUser, related_name='trainer_clients', on_delete=models.CASCADE)
    client = models.ForeignKey(FitTrackerUser, related_name='client_trainers', on_delete=models.CASCADE)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
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
    height = models.FloatField()  # Height in feet e.g (5.6 is five and a falf feet)
    weight = models.FloatField()  # Weight in LBS e.g (125.7 lbs)
    age = models.IntegerField()
    fitness_goals = models.TextField()  # Store goals as text

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
    weight = models.FloatField()  # Weight used in kilograms
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


