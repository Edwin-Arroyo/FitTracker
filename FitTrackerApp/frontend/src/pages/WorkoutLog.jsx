import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./WorkoutLog.css";

const WorkoutLog = () => {
  const navigate = useNavigate();
  const [workoutData, setWorkoutData] = useState({
    duration: "",
    calories: "",
    exerciseName: "",
    description: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorkoutData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      const workoutResponse = await fetch(
        `http://localhost:8000/api/users/${userId}/workouts/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            exerciseName: workoutData.exerciseName,
            description: workoutData.description,
            duration: parseInt(workoutData.duration),
            calories: parseInt(workoutData.calories),
          }),
        }
      );

      if (!workoutResponse.ok) {
        throw new Error("Failed to log workout");
      }

      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="workout-log-container">
        <h1>Log Your Workout</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="workout-form">
          <div className="form-group">
            <label htmlFor="exerciseName">Exercise Name</label>
            <input
              type="text"
              id="exerciseName"
              name="exerciseName"
              value={workoutData.exerciseName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={workoutData.description}
              onChange={handleChange}
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration (minutes)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={workoutData.duration}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="calories">Calories Burned</label>
            <input
              type="number"
              id="calories"
              name="calories"
              value={workoutData.calories}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <button type="submit" className="submit-button">
            Log Workout
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default WorkoutLog;