import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./Admin.css";

const UserManagement = () => {
  // Initialize state variables for managing users data
  const [users, setUsers] = useState([]); // Array to store user data
  const [isLoading, setIsLoading] = useState(true); // Loading state flag
  const [error, setError] = useState(null); // Error state for handling API errors

  // Effect hook to fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array means this runs once on mount

  // Function to fetch all users from the backend API
  const fetchUsers = async () => {
    try {
      // Make API request with authentication token
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setUsers(data); // Update users state with fetched data
      setIsLoading(false); // Set loading to false after successful fetch
    } catch (err) {
      setError("Failed to fetch users"); // Set error message if fetch fails
      setIsLoading(false); // Set loading to false even if fetch fails
    }
  };

  // Function to update a user's role (e.g., from user to trainer)
  const updateUserRole = async (userId, newRole) => {
    try {
      // Make API request to update user role
      await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers(); // Refresh user list after successful update
    } catch (err) {
      setError("Failed to update user role"); // Set error if update fails
    }
  };

  // Function to toggle user account status (active/inactive)
  const toggleUserStatus = async (userId, isActive) => {
    try {
      // Make API request to update user status
      await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ isActive }),
      });
      fetchUsers(); // Refresh user list after successful status update
    } catch (err) {
      setError("Failed to update user status"); // Set error if update fails
    }
  };

  // Show loading message while fetching data
  if (isLoading) return <p>Loading users...</p>;
  // Show error message if something went wrong
  if (error) return <p>Error: {error}</p>;

  // Main render of the user management interface
  return (
    <>
      <Navbar />
      <div className="admin-container">
        <h1>User Management</h1>
        {/* Search and filter controls */}
        <div className="user-management-controls">
          <input type="text" placeholder="Search users..." />
          <select>
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {/* User list table */}
        <div className="user-list">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through users array to create table rows */}
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  {/* Role selection dropdown */}
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="trainer">Trainer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  {/* Status toggle button */}
                  <td>
                    <button
                      onClick={() => toggleUserStatus(user.id, !user.isActive)}
                      className={user.isActive ? "active" : "inactive"}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  {/* Action buttons */}
                  <td>
                    <button onClick={() => handleViewUser(user.id)}>
                      View
                    </button>
                    <button onClick={() => handleEditUser(user.id)}>
                      Edit
                    </button>
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

export default UserManagement;
