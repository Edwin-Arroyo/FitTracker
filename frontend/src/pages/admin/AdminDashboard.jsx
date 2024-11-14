import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./Admin.css";

const AdminDashboard = () => {
  // Get user context and navigation function
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initialize dashboard statistics state
  // Using a single state object to manage all dashboard data and UI states
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0, // Total number of registered users
    activeTrainers: 0, // Number of active trainers
    totalWorkouts: 0, // Total workouts created
    isLoading: true, // Loading state flag
    error: null, // Error state
  });

  // Effect hook to fetch dashboard data when component mounts
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Make API request to fetch dashboard statistics
        // TODO: Replace with actual API endpoint
        const response = await fetch("/api/admin/dashboard-stats", {
          headers: {
            // Include authentication token in request header
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Check if request was successful
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard statistics");
        }

        // Parse response data
        const data = await response.json();

        // Update state with fetched data
        setDashboardStats({
          totalUsers: data.totalUsers,
          activeTrainers: data.activeTrainers,
          totalWorkouts: data.totalWorkouts,
          isLoading: false, // Set loading to false
          error: null, // Clear any existing errors
        });
      } catch (error) {
        // Handle any errors that occur during fetch
        setDashboardStats((prev) => ({
          ...prev, // Preserve existing state
          isLoading: false, // Set loading to false
          error: error.message, // Store error message
        }));
      }
    };

    // Call the fetch function
    fetchDashboardStats();
  }, []); // Empty dependency array means this runs once on component mount

  // Render loading state while data is being fetched
  if (dashboardStats.isLoading) {
    return (
      <>
        <Navbar />
        <div className="admin-container">
          <h1>Admin Dashboard</h1>
          <p>Loading dashboard data...</p>
        </div>
        <Footer />
      </>
    );
  }

  // Render error state if fetch failed
  if (dashboardStats.error) {
    return (
      <>
        <Navbar />
        <div className="admin-container">
          <h1>Admin Dashboard</h1>
          <p className="error-message">Error: {dashboardStats.error}</p>
        </div>
        <Footer />
      </>
    );
  }

  // Main dashboard render with fetched data
  return (
    <>
      <Navbar />
      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        {/* Statistics Cards Section */}
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{dashboardStats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Active Trainers</h3>
            <p>{dashboardStats.activeTrainers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Workouts</h3>
            <p>{dashboardStats.totalWorkouts}</p>
          </div>
        </div>
        {/* Navigation Buttons Section */}
        <div className="admin-actions">
          <button onClick={() => navigate("/admin/users")}>Manage Users</button>
          <button onClick={() => navigate("/admin/trainers")}>
            Manage Trainers
          </button>
          <button onClick={() => navigate("/admin/settings")}>
            System Settings
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
