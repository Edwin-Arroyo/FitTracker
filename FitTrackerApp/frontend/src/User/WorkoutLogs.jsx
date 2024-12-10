import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./WorkoutLog.css";

const WorkoutLogs = () => {
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Listen for completed workouts
  useEffect(() => {
    const handleWorkoutCompleted = (event) => {
      const newWorkout = event.detail;
      setWorkoutLogs(prevLogs => {
        // Check if workout already exists in logs
        const workoutExists = prevLogs.some(log => 
          log.workoutHistoryId === newWorkout.workoutHistoryId
        );
        
        if (workoutExists) {
          return prevLogs;
        }
        
        // Add new workout and sort by date
        const updatedLogs = [newWorkout, ...prevLogs];
        return updatedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
      });
    };

    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    return () => window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
  }, []);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        
        const response = await fetch(
          `http://localhost:8000/api/users/${userId}/workouts/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch workouts from backend");
        }

        const backendLogs = await response.json();
        
        // Filter and sort logs
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        const filteredLogs = backendLogs
          .filter((log) => new Date(log.date) >= fifteenDaysAgo)
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setWorkoutLogs(filteredLogs);
      } catch (err) {
        console.error("Error fetching workouts:", err);
        setError(err.message);
      }
    };

    fetchWorkouts();
  }, []);

  return (
    <>
      <Navbar />
      <div className="workout-logs-container">
        <h1>Workout Logs (Last 15 Days)</h1>
        {error && <div className="error-message">{error}</div>}
        <div className="logs-grid">
          {workoutLogs.map((log, index) => (
            <div
              key={index}
              className={`log-card ${log.isAssigned ? "assigned-workout" : ""}`}
            >
              <div className="log-header">
                <h3>{log.exerciseName}</h3>
                <span className="log-date">
                  {new Date(log.date).toLocaleDateString()}
                </span>
              </div>
              <div className="log-details">
                <p>
                  <strong>Duration:</strong> {log.duration} minutes
                </p>
                <p>
                  <strong>Calories:</strong> {log.calories} burned
                </p>
                <p className="log-description">{log.description}</p>
                {log.isAssigned && (
                  <>
                    <p className="assigned-by">
                      <strong>Assigned by:</strong> {log.assignedBy}
                    </p>
                    <p className="completion-status">
                      <strong>Status:</strong>{" "}
                      {log.completed ? "Completed" : "Pending"}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="action-button" onClick={() => navigate("/WorkoutLog")}>
          Log New Workout
        </button>
      </div>
      <Footer />
    </>
  );
};

export default WorkoutLogs;
