import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Initialize form state with empty values
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  // State for handling error messages
  const [error, setError] = useState("");

  // Handle input changes in form fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any existing errors

    try {
      const response = await fetch("http://localhost:8000/api/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: "user",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await response.json();
      
      // Store all necessary data in localStorage
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("token", data.id); // Using ID as token for now
      localStorage.setItem("username", data.username);
      
      // Update auth context
      login(data.role);

      // Create initial profile
      const profileResponse = await fetch(
        `http://localhost:8000/api/users/${data.id}/profile/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${data.id}`,
          },
          body: JSON.stringify({
            height_feet: 0,
            height_inches: 0,
            weight: 0,
            age: 0,
            fitness_goals: "",
          }),
        }
      );

      if (!profileResponse.ok) {
        console.error("Failed to create initial profile");
      }

      // Navigate to profile page
      navigate("/profile");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Registration failed");
    }
  };

  // registration form
  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-form-container">
          <h2>Create an Account</h2>
          {/* Display error message if any */}
          {error && <div className="error-message">{error}</div>}

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username input field */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email input field */}
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

            {/* Password input field */}
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
              Register
            </button>
          </form>

          {/* Login redirect link */}
          <p className="auth-redirect">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
