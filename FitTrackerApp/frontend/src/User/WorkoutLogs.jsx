import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./WorkoutLog.css";

const WorkoutLogs = () => {
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get workout logs from localStorage
    const logs = JSON.parse(localStorage.getItem("workoutLogs") || "[]");
    console.log("Retrieved workout logs:", logs);

    // Filter to show only last 15 days
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const filteredLogs = logs
      .filter((log) => new Date(log.date) >= fifteenDaysAgo)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log("Filtered workout logs:", filteredLogs);
    setWorkoutLogs(filteredLogs);
  }, []);

  return (
    <>
      <Navbar />
      <div className="workout-logs-container">
        <h1>Workout Logs (Last 15 Days)</h1>
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
        <button
          className="action-button"
          onClick={() => navigate("/WorkoutLog")}
        >
          Log New Workout
        </button>
      </div>
      <Footer />
    </>
  );
};

export default WorkoutLogs;
