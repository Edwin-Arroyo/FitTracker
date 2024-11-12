import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./Profile.css";

// Profile component displays user information and fitness statistics
const Profile = () => {
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Handler for logout button click
  // Redirects user to home page
  const handleLogout = () => {
    navigate("/");
  };

  // Mock user data (will be replaced with API data later)
  const userData = {
    name: "John Doe",
    email: "john@example.com",
    joinDate: "January 2024",
    stats: {
      workoutsCompleted: 12,
      currentStreak: 3,
      totalMinutes: 360,
      caloriesBurned: 4800,
    },
  };

  return (
    <>
      <Navbar />
      {/* Main profile container */}
      <div className="profile-container">
        {/* Header section with user info */}
        <div className="profile-header">
          <div className="profile-info">
            <h1>Profile</h1>
            <p>Welcome back, {userData.name}!</p>
            <p className="profile-email">{userData.email}</p>
            <p className="join-date">Member since: {userData.joinDate}</p>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>

        {/* Statistics section */}
        <div className="stats-container">
          <h2>Your Fitness Stats</h2>
          {/* Grid layout for statistics cards */}
          <div className="stats-grid">
            {/* Individual stat cards */}
            <div className="stat-card">
              <h3>Workouts</h3>
              <p className="stat-number">{userData.stats.workoutsCompleted}</p>
              <p className="stat-label">Completed</p>
            </div>
            <div className="stat-card">
              <h3>Current Streak</h3>
              <p className="stat-number">{userData.stats.currentStreak}</p>
              <p className="stat-label">Days</p>
            </div>
            <div className="stat-card">
              <h3>Total Time</h3>
              <p className="stat-number">{userData.stats.totalMinutes}</p>
              <p className="stat-label">Minutes</p>
            </div>
            <div className="stat-card">
              <h3>Calories</h3>
              <p className="stat-number">{userData.stats.caloriesBurned}</p>
              <p className="stat-label">Burned</p>
            </div>
          </div>
        </div>

        {/* Action buttons section */}
        <div className="profile-actions">
          <button className="action-button">Edit Profile</button>
          <button className="action-button">View Workout History</button>
          <button className="action-button">Set New Goals</button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
