import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchDashboardData();
  }, []);

  if (error) return <div className="error-message">{error}</div>;
  if (!dashboardData) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{dashboardData.total_users}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Approvals</h3>
          <p>{dashboardData.pending_approvals}</p>
        </div>
      </div>
      <div className="users-table">
        <h2>User Management</h2>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role === "user" ? "Basic User" : "Trainer"}</td>
                <td>
                  <span
                    className={`status ${
                      user.is_approved ? "approved" : "pending"
                    }`}
                  >
                    {user.is_approved ? "Approved" : "Pending"}
                  </span>
                </td>
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
