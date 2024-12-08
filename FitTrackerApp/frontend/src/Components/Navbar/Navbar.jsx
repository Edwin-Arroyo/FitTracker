// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, logout } = useAuth();

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate("/login");
  };

  const renderAuthButtons = () => {
    if (!isAuthenticated) {
      return (
        <>
          <button className="nav-button" onClick={() => navigate("/register")}>
            Register
          </button>
          <button className="nav-button" onClick={() => navigate("/login")}>
            Login
          </button>
        </>
      );
    }

    // User is authenticated, show role-specific buttons
    switch (userRole) {
      case "trainer":
        return (
          <>
            <button
              className="nav-button"
              onClick={() => navigate("/trainer/dashboard")}
            >
              Dashboard
            </button>
            <button className="nav-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        );

      case "admin":
        return (
          <>
            <button
              className="nav-button"
              onClick={() => navigate("/admin/dashboard")}
            >
              Dashboard
            </button>
            <button className="nav-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        );

      case "user":
        return (
          <>
            <button className="nav-button" onClick={() => navigate("/profile")}>
              Profile
            </button>
            <button className="nav-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1 onClick={() => navigate("/")}>FitTracker</h1>
      </div>
      <div className="navbar-links">{renderAuthButtons()}</div>
    </nav>
  );
};

export default Navbar;
