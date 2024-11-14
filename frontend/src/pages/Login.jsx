import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./Login.css";
import { useAuth } from "../context/AuthContext";

// Login component handles user authentication
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // State management for form inputs using useState hook
  // Initialize with empty email and password fields
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Event handler for input changes
  // Updates the formData state when user types in any input field
  const handleChange = (e) => {
    const { name, value } = e.target; // Destructure name and value from event target
    setFormData((prev) => ({
      ...prev, // Spread existing form data
      [name]: value, // Update only the changed field
    }));
  };

  // Event handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors
    console.log("Attempting login with:", formData); // Debug log

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      console.log("Login successful:", data); // Debug log

      // Store user data
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userRole", data.role || "user");

      // Update authentication state to log in user
      login();

      // Redirect to profile once user is logged in
      navigate("/profile");
    } catch (error) {
      console.error("Login error:", error); // Debug log
      setError(error.message || "Login failed");
    }
  };

  return (
    <>
      {/* Layout components */}
      <Navbar />
      <div className="auth-container">
        <div className="auth-form-container">
          <h2>Login to FitTracker</h2>
          {error && <div className="error-message">{error}</div>}
          {/* Login form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email input group */}
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
            {/* Password input group */}
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
            {/* Submit button */}
            <button type="submit" className="auth-button">
              Login
            </button>
          </form>
          {/* Registration redirect link */}
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
