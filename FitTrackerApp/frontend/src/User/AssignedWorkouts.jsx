import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./AssignedWorkouts.css";

// Component to display workouts assigned by trainers to clients
const AssignedWorkouts = () => {
  const [assignedWorkouts, setAssignedWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remainingWorkouts, setRemainingWorkouts] = useState(0);
  const navigate = useNavigate();

  // Fetch assigned workouts
  useEffect(() => {
    const fetchAssignedWorkouts = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `http://localhost:8000/api/users/${userId}/assigned-workouts/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch assigned workouts");
        }

        const data = await response.json();
        setAssignedWorkouts(data);

        // Calculate initial remaining workouts
        const remainingCount = data.filter(
          (workout) => !workout.completed
        ).length;
        setRemainingWorkouts(remainingCount);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedWorkouts();
  }, []);

  // marking a workout as complete
  const handleMarkComplete = async (workoutId) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:8000/api/users/${userId}/assigned-workouts/${workoutId}/complete/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error("Failed to mark workout as complete");
      }

      const completedWorkout = await response.json();

      // formatting log
      const workoutLogEntry = {
        exerciseName: completedWorkout.exercise_name,
        description: completedWorkout.description,
        duration: completedWorkout.duration,
        calories: completedWorkout.calories,
        date: completedWorkout.completed_date,
        isAssigned: true,
        assignedBy: completedWorkout.trainer_name,
        workoutId: completedWorkout.id,
        workoutHistoryId: completedWorkout.workout_history_id,
        exerciseId: completedWorkout.exercise_id,
        completed: true,
        user: parseInt(userId)
      };

      // Update assigned workouts
      setAssignedWorkouts(prevWorkouts =>
        prevWorkouts.map(workout =>
          workout.id === workoutId
            ? { ...workout, completed: true, completed_date: completedWorkout.completed_date }
            : workout
        )
      );

      // Update remaining workouts count
      setRemainingWorkouts(prevCount => prevCount - 1);

      // event for workout log entry
      const workoutCompletedEvent = new CustomEvent('workoutCompleted', {
        detail: workoutLogEntry
      });
      window.dispatchEvent(workoutCompletedEvent);

      // event for profile page - updates the remaining workouts count
      const profileUpdateEvent = new CustomEvent('assignedWorkoutCompleted', {
        detail: { workoutId }
      });
      window.dispatchEvent(profileUpdateEvent);

    } catch (err) {
      console.error("Error completing workout:", err);
      setError(err.message);
    }
};

  // error message if fetch failed
  if (error) return <div className="error">{error}</div>;

  // assigned workouts list
  return (
    <>
      <Navbar />
      <div className="assigned-workouts-container">
        <h1>Assigned Workouts</h1>

        {/* Display remaining workouts count */}
        <div className="workouts-summary">
          <h2>Remaining Workouts: {remainingWorkouts}</h2>
        </div>

        {/* if no workouts are assigned */}
        {assignedWorkouts.length === 0 ? (
          <div className="no-workouts">
            <p>No workouts have been assigned to you yet.</p>
          </div>
        ) : (
          // Display assigned workouts
          <div className="workouts-grid">
            {assignedWorkouts.map((workout) => (
              <div
                key={workout.id}
                className={`workout-card ${
                  workout.completed ? "completed" : ""
                }`}
              >
                <h2>{workout.exercise_name}</h2>
                <p className="description">{workout.description}</p>
                {/* Workout  */}
                <div className="workout-details">
                  <span>Duration: {workout.duration} minutes</span>
                  <span>Calories: {workout.calories}</span>
                </div>
                {/* Workout metadata  */}
                <div className="workout-meta">
                  <span>
                    Assigned:{" "}
                    {new Date(workout.assigned_date).toLocaleDateString()}
                  </span>
                  {workout.completed && (
                    <span className="completion-date">
                      Completed:{" "}
                      {new Date(workout.completed_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {/* Show complete button for workouts assigned to clients */}
                {!workout.completed && (
                  <button
                    className="complete-button"
                    onClick={() => handleMarkComplete(workout.id)}
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AssignedWorkouts;
