import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./Login.css";
import { useAuth } from "../context/AuthContext";

// Login component handles user authentication and form management
const Login = () => {
  // Get login function from auth context and navigation utility
  const { login } = useAuth();
  const navigate = useNavigate();

  // Initialize form state with empty credentials
  // This state will be updated as user types in the form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // State to handle and display error messages
  const [error, setError] = useState("");

  // handleChange: Updates form state when input fields change
  // - Preserves existing form data using spread operator
  // - Updates only the changed field using computed property name
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handleSubmit: Processes form submission
  // 1. Prevents default form submission
  // 2. Clears any existing errors
  // 3. Makes API call to backend login endpoint
  // 4. Handles successful login by:
  //    - Storing user data in localStorage
  //    - Updating auth context
  //    - Navigating to profile page
  // 5. Handles failed login by displaying error message
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid credentials");
        }
        throw new Error("Login failed");
      }

      const data = await response.json();
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("token", data.token);

      login(data.role);

      switch (data.role) {
        case 'admin':
          navigate("/admin/dashboard");
          break;
        case 'trainer':
          navigate("/trainer/dashboard");
          break;
        default:
          navigate("/profile");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please try again.");
    }
  };

  // Render login form with:
  // - Error message display
  // - Email and password inputs
  // - Submit button
  // - Registration link
  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-form-container">
          <h2>Login to FitTracker</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="auth-button">
              Login
            </button>
          </form>
          <p className="auth-redirect">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
