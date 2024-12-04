import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Trainer.css";

const TrainerDashboard = () => {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate('/login');
  };

  // Fetch trainer's clients from the backend
  const fetchClients = async () => {
    try {
      const trainerId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      
      if (!trainerId || !token) {
        throw new Error("No trainer ID found");
      }

      const response = await fetch(
        `http://localhost:8000/api/trainer/${trainerId}/clients/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      const data = await response.json();
      setClients(data.clients);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch clients 
  useEffect(() => {
    fetchClients();
  }, []);

  // Navigate to client profile
  const handleClientClick = (clientId) => {
    navigate(`/trainer/client/${clientId}`);
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!clients) return <div>Loading...</div>;

  return (
    <div className="trainer-dashboard">
      <div className="dashboard-header">
        <h1>Trainer Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      {/* Client Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Clients</h3>
          <p>{clients.length}</p>
        </div>
      </div>

      {/* Clients List */}
      <div className="clients-table">
        <h2>My Clients</h2>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Start Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.username}</td>
                <td>{client.email}</td>
                <td>{new Date(client.start_date).toLocaleDateString()}</td>
                <td>
                  <span className={`status ${client.is_active ? 'active' : 'inactive'}`}>
                    {client.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className="view-profile-btn"
                    onClick={() => handleClientClick(client.id)}
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainerDashboard;
