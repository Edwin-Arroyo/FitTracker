// src/components/Navbar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav>
      <div className="nav-container">
        <h1>FitTracker</h1>
        <ul>
          <li
            className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
          >
            <Link to="/">Home</Link>
          </li>
          <li
            className={`nav-item ${
              location.pathname === "/about" ? "active" : ""
            }`}
          >
            <Link to="/about">About</Link>
          </li>
          <li
            className={`nav-item ${
              location.pathname === "/contact" ? "active" : ""
            }`}
          >
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
        <div className="auth-buttons">
          <Link to="/login" className="nav-button">
            Login
          </Link>
          <Link to="/register" className="nav-button">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
