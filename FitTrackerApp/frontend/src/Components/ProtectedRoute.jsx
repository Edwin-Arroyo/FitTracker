import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// ProtectedRoute component that wraps protected pages/routes
// Parameters:
// - children: The components/pages that should be protected
// - allowedRoles: Array of roles that are allowed to access this route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (!allowedRoles.includes(userRole)) {
      navigate("/"); // or wherever you want to redirect unauthorized users
    }
  }, [isAuthenticated, userRole, allowedRoles, navigate]);

  return isAuthenticated && allowedRoles.includes(userRole) ? children : null;
};

export default ProtectedRoute;
