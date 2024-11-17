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

  // useEffect hook to fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("No user ID found");
        }

        const response = await fetch(
          `http://localhost:8000/api/users/${userId}/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user data");
        }

        const data = await response.json();
        console.log("Fetched user data:", data); // Debug log
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

  // Handler for logout button
  const handleLogout = () => {
    logout();
    navigate("/");
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
              <h3>Total Time</h3>
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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;