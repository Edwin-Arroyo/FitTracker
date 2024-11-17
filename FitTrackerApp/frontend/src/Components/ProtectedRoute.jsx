import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";

// ProtectedRoute component that wraps protected pages/routes
// Parameters:
// - children: The components/pages that should be protected
// - allowedRoles: Array of roles that are allowed to access this route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem("userRole");
  const navigate = useNavigate();

  // If no userRole, redirect to login
  if (!userRole) {
    return <Navigate to="/login" />;
  }

  // If user's role is not allowed, redirect to home
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/profile" />;
  }

  return children;
};

export default ProtectedRoute;
