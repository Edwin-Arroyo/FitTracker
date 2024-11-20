import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./ClientProfile.css";

const ClientProfile = () => {
  // State management for different types of client data
  const [clientData, setClientData] = useState(null);      // Basic user info
  const [workoutHistory, setWorkoutHistory] = useState([]); // Workout records
  const [progress, setProgress] = useState([]);             // Progress tracking
  const [error, setError] = useState("");                   // Error handling
  const [profileData, setProfileData] = useState(null);     // Profile details
  
  // Get clientId from URL parameters
  const { clientId } = useParams();
  const { user } = useAuth();

  // Fetch basic client information (username, email, etc.)
  const fetchClientData = async () => {
    try {
      // Get trainer's credentials from localStorage
      const trainerId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (!trainerId || !token) {
        throw new Error("Authentication credentials missing");
      }

      // Make API request with Bearer token authentication
      const response = await fetch(
        `http://localhost:8000/api/users/${clientId}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch client data");
      const data = await response.json();
      setClientData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch client's workout history (exercises, duration, calories)
  const fetchWorkoutHistory = async () => {
    try {
      const trainerId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `http://localhost:8000/api/users/${clientId}/workout-history/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch workout history");
      const data = await response.json();
      setWorkoutHistory(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch client's progress data (weight changes, workout completion)
  const fetchProgress = async () => {
    try {
      const trainerId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `http://localhost:8000/api/users/${clientId}/progress/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch progress data");
      const data = await response.json();
      setProgress(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch client's profile information (height, weight, age, goals)
  const fetchProfileData = async () => {
    try {
      const trainerId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (!trainerId || !token) {
        throw new Error("Authentication credentials missing");
      }

      const response = await fetch(
        `http://localhost:8000/api/users/${clientId}/profile/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch profile data");
      }
      
      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch all client data when component mounts or clientId changes
  useEffect(() => {
    fetchClientData();
    fetchWorkoutHistory();
    fetchProgress();
    fetchProfileData();
  }, [clientId]);

  // Show error message if any fetch operation fails
  if (error) return <div className="error-message">{error}</div>;
  // Show loading state while data is being fetched
  if (!clientData || !profileData) return <div>Loading...</div>;

  // Render client profile with all fetched data
  return (
    <div className="client-profile">
      <h1>Client Profile</h1>
      
      {/* Basic Information */}
      <section className="profile-section">
        <h2>Basic Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Username:</label>
            <span>{clientData?.username}</span>
          </div>
          <div className="info-item">
            <label>Height:</label>
            <span>
              {profileData?.height_feet}'{profileData?.height_inches}"
            </span>
          </div>
          <div className="info-item">
            <label>Weight:</label>
            <span>{profileData?.weight} lbs</span>
          </div>
          <div className="info-item">
            <label>Age:</label>
            <span>{profileData?.age}</span>
          </div>
        </div>
      </section>

      {/* Fitness Goals */}
      <section className="profile-section">
        <h2>Fitness Goals</h2>
        <p>{profileData?.fitness_goals}</p>
      </section>

      {/* Progress Tracking */}
      <section className="profile-section">
        <h2>Progress</h2>
        <div className="progress-chart">
          {progress.map((entry) => (
            <div key={entry.id} className="progress-entry">
              <span className="date">{new Date(entry.recorded_at).toLocaleDateString()}</span>
              <span className="weight">{entry.weight} lbs</span>
              <span className="workouts">{entry.workout_completion} workouts</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Workouts */}
      <section className="profile-section">
        <h2>Recent Workouts</h2>
        <div className="workout-list">
          {workoutHistory.map((workout) => (
            <div key={workout.id} className="workout-entry">
              <div className="workout-header">
                <span className="date">
                  {new Date(workout.workout_date).toLocaleDateString()}
                </span>
                <span className="duration">{workout.duration} minutes</span>
              </div>
              <div className="workout-details">
                <span className="calories">{workout.calories} calories</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ClientProfile;