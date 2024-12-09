import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  //  dashboard data, error handling, and form visibility
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showTrainerForm, setShowTrainerForm] = useState(false);

  // State for trainer creation form
  const [trainerData, setTrainerData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // state for trainer assignment
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState("");

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

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch trainers for dropdown
  const fetchTrainers = async () => {
    try {
      const trainersData = dashboardData.users.filter(
        (user) => user.role === "trainer"
      );
      setTrainers(trainersData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (dashboardData) {
      fetchTrainers();
    }
  }, [dashboardData]);

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

  // Handle trainer assignment
  const handleAssignTrainer = async (clientId) => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/admin/assign-trainer/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trainer_id: selectedTrainer,
            client_id: clientId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign trainer");
      }

      // Refresh dashboard data
      await fetchDashboardData();
      setSelectedTrainer("");
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

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate("/login");
  };

  
  const handleNavigateToUserManagement = () => {
    navigate("/admin/users");
  };

  // Error and loading states
  if (error) return (
    <>
      <Navbar />
      <div className="error-message">{error}</div>
      <Footer />
    </>
  );
  
  if (!dashboardData) return (
    <>
      <Navbar />
      <div>Loading...</div>
      <Footer />
    </>
  );

  // Main dashboard 
  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{dashboardData?.total_users || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Trainers</h3>
            <p>{dashboardData?.total_trainers || 0}</p>
          </div>
        </div>

        {/* Admin Actions - Updated with new button */}
        <div className="admin-actions">
          <button
            className="create-trainer-btn"
            onClick={() => setShowTrainerForm(!showTrainerForm)}
          >
            {showTrainerForm ? "Cancel" : "Create New Trainer"}
          </button>
          <button
            className="user-management-btn"
            onClick={handleNavigateToUserManagement}
          >
            User Management
          </button>
        </div>

        {/*  Trainer Creation Form */}
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
          <h2>User-Trainer Management</h2>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Type</th>
                <th>Created At</th>
                <th>Assign Trainer</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{getRoleDisplay(user.role)}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    {user.role === "user" && (
                      <td>
                        {user.assigned_trainer ? (
                          <div className="assigned-trainer">
                            <span>
                              Assigned to: {user.assigned_trainer.username}
                            </span>
                            <button
                              className="reassign-btn"
                              onClick={() => setSelectedTrainer("")}
                            >
                              Reassign
                            </button>
                          </div>
                        ) : (
                          <div className="trainer-assignment">
                            <select
                              value={selectedTrainer}
                              onChange={(e) => setSelectedTrainer(e.target.value)}
                            >
                              <option value="">Select Trainer</option>
                              {trainers.map((trainer) => (
                                <option key={trainer.id} value={trainer.id}>
                                  {trainer.username}
                                </option>
                              ))}
                            </select>
                            <button
                              className="assign-btn"
                              onClick={() => handleAssignTrainer(user.id)}
                              disabled={!selectedTrainer}
                            >
                              Assign
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
