import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./AdminDashboard.css";

const UserManagement = () => {
  //  managing users data
  const [users, setUsers] = useState([]); // Array to store user data
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); // API errors
  const [searchUser, setSearchUser] = useState(""); //  admin can search for users by username

 
  useEffect(() => {
    fetchUsers();
  }, []); 

  // fetch all users from the backend 
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      // Make API request with authentication token
      const response = await fetch("http://localhost:8000/api/users/", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched users:", data); 
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search User
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchUser.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchUser(e.target.value);
  };

  // Show error message if something went wrong
  if (error) return (
    <>
      <Navbar />
      <div className="error-message">Error: {error}</div>
      <Footer />
    </>
  );

  if (isLoading) return (
    <>
      <Navbar />
      <div>Loading users...</div>
      <Footer />
    </>
  );

  // Main render of the user management interface
  return (
    <>
      <Navbar />
      <div className="admin-container">
        <h1>User Management</h1>
        
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by username"
            value={searchUser}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        
        {/* Users Table */}
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleViewUser(user.id)}>View</button>
                  <button onClick={() => handleEditUser(user.id)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="no-results">
            No users found matching "{searchUser}"
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default UserManagement;
