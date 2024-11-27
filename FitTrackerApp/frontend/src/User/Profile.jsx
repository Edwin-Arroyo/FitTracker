import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./Profile.css";

const Profile = () => {
  // React Router hook for navigation
  const navigate = useNavigate();
  // Get logout function from auth context
  const { logout } = useAuth();

  // State management for user data, loading state, and errors
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_workouts: 0,
    total_duration: 0,
    total_calories: 0,
    calories_burned: 0,
  });
  // state for user profile data
  const [profileData, setProfileData] = useState({
    height_feet: 0,
    height_inches: 0,
    weight: 0,
    age: 0,
    fitness_goals: ''
  });
  // Add new state
  const [assignedWorkouts, setAssignedWorkouts] = useState([]);

  // useEffect hook to fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        
        if (!userId || !token) {
            throw new Error("No user ID or token found");
        }

        const response = await fetch(
            `http://localhost:8000/api/users/${userId}/`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(
          `http://localhost:8000/api/users/${userId}/stats/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    const fetchAssignedWorkouts = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        
        const response = await fetch(
          `http://localhost:8000/api/users/${userId}/assigned-workouts/`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAssignedWorkouts(data);
        }
      } catch (err) {
        console.error("Error fetching assigned workouts:", err);
      }
    };

    fetchAssignedWorkouts();
  }, []);

  const fetchProfileData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      
      if (!userId || !token) {
        throw new Error("No user ID or token found");
      }

      const response = await fetch(
        `http://localhost:8000/api/users/${userId}/profile/`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
    }
  };

  // Handler for logout button
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfileUpdate = async (profileData) => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      
      if (!userId || !token) {
        throw new Error("No user ID or token found");
      }

      const response = await fetch(
        `http://localhost:8000/api/users/${userId}/profile/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      // Refresh user data after successful update
      fetchUserData();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    }
  };

  // Conditional rendering based on state
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userData) return <div>No user data found</div>;

  // Main profile page
  return (
    <>
      <Navbar />
      <div className="profile-container">
        {/* User information section */}
        <div className="profile-header">
          <div className="profile-info">
            <h1>Profile</h1>
            <p>Welcome back, {userData.username}!</p>
            <p className="profile-email">{userData.email}</p>
            <p className="join-date">
              Member since: {new Date(userData.created_at).toLocaleDateString()}
            </p>
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">Height:</span>
                <span className="detail-value">
                  {profileData.height_feet}'{profileData.height_inches}"
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Weight:</span>
                <span className="detail-value">{profileData.weight} lbs</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{profileData.age} years</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fitness Goals:</span>
                <p className="detail-value goals">{profileData.fitness_goals}</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/profile/info")}
              className="action-button"
            >
              Update Profile Info
            </button>
          </div>
        </div>

        {/* Fitness statistics section, hardcoded for now, get data from backend when model is implemented*/}
        <div className="stats-container">
          <h2>Your Fitness Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Workouts</h3>
              <p className="stat-number">{stats.total_workouts}</p>
              <p className="stat-label">Completed</p>
              <button
                onClick={() => navigate("/WorkoutLog")}
                className="action-button"
              >
                Log Workout
              </button>
            </div>
            <div className="stat-card">
              <h3>Total Workout Time</h3>
              <p className="stat-number">{stats.total_duration}</p>
              <p className="stat-label">Minutes</p>
            </div>
            <div className="stat-card">
              <h3>Calories</h3>
              <p className="stat-number">{stats.total_calories}</p>
              <p className="stat-label">Consumed</p>
              <button
                onClick={() => navigate("/Macros")}
                className="action-button"
              >
                Track Calories
              </button>
            </div>
            <div className="stat-card">
              <h3>Calories Burned</h3>
              <p className="stat-number">{stats.calories_burned}</p>
              <p className="stat-label">From Workouts</p>
            </div>
            <div className="stat-card">
              <h3>Workout History</h3>
              <button
                onClick={() => navigate("/workout-logs")}
                className="action-button"
              >
                View Workout Logs
              </button>
            </div>
            <div className="stat-card">
              <h3>Trainer Workouts</h3>
              <p className="stat-number">{assignedWorkouts.length}</p>
              <p className="stat-label">Assigned</p>
              <button
                onClick={() => navigate("/user/assigned-workouts")}
                className="action-button"
              >
                View Assigned Workouts
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
