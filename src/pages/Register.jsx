import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./Login.css";

// Register component handles new user registration
const Register = () => {
  // State management for form inputs using useState hook
  // Tracks name, email, password, and password confirmation
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Handle input changes in form fields
  // Updates the formData state while preserving other field values
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  // Validates password match and navigates to profile on success
  const handleSubmit = (e) => {
    e.preventDefault();
    // Check if passwords match before proceeding
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Temporary: Navigate to profile (will be replaced with API call)
    navigate("/profile");
  };

  return (
    <>
      <Navbar />
      {/* Main container for authentication form */}
      <div className="auth-container">
        <div className="auth-form-container">
          <h2>Create an Account</h2>
          {/* Registration form with input fields */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name input field */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
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
            {/* Password confirmation field */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="auth-button">
              Register
            </button>
          </form>
          {/* Login redirect for existing users */}
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
