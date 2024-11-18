import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  // State management for dashboard data, error handling, and form visibility
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showTrainerForm, setShowTrainerForm] = useState(false);

  // State for trainer creation form
  const [trainerData, setTrainerData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Fetch dashboard data from the backend
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/admin/dashboard/"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle trainer creation form submission
  const handleCreateTrainer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/api/admin/create-trainer/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(trainerData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create trainer");
      }

      // Refresh dashboard data and reset form
      await fetchDashboardData();
      setShowTrainerForm(false);
      setTrainerData({ username: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper function to display user roles in a readable format
  const getRoleDisplay = (role) => {
    switch (role) {
      case "trainer":
        return "Trainer";
      case "user":
        return "Basic User";
      default:
        return role;
    }
  };

  // Error and loading states
  if (error) return <div className="error-message">{error}</div>;
  if (!dashboardData) return <div>Loading...</div>;

  // Main dashboard render
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{dashboardData.total_users}</p>
        </div>
        <div className="stat-card">
          <h3>Total Trainers</h3>
          <p>{dashboardData.total_trainers}</p>
        </div>
      </div>

      {/* Trainer Creation Button */}
      <div className="admin-actions">
        <button
          className="create-trainer-btn"
          onClick={() => setShowTrainerForm(!showTrainerForm)}
        >
          {showTrainerForm ? "Cancel" : "Create New Trainer"}
        </button>
      </div>

      {/* Conditional Trainer Creation Form */}
      {showTrainerForm && (
        <div className="trainer-form-container">
          <h2>Create New Trainer</h2>
          <form onSubmit={handleCreateTrainer}>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                value={trainerData.username}
                onChange={(e) =>
                  setTrainerData({ ...trainerData, username: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={trainerData.email}
                onChange={(e) =>
                  setTrainerData({ ...trainerData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={trainerData.password}
                onChange={(e) =>
                  setTrainerData({ ...trainerData, password: e.target.value })
                }
                required
              />
            </div>
            <button type="submit">Create Trainer</button>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table">
        <h2>User Management</h2>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Type</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{getRoleDisplay(user.role)}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
