import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

// ProtectedRoute component that wraps protected pages/routes
// Parameters:
// - children: The components/pages that should be protected
// - allowedRoles: Array of roles that are allowed to access this route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserRole = localStorage.getItem("userRole");

    if (!token || !storedUserRole) {
      navigate("/login");
    } else if (!allowedRoles.includes(storedUserRole)) {
      navigate("/");
    }
    setIsLoading(false);
  }, [allowedRoles, navigate]);

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  // Check if user has required role
  const token = localStorage.getItem("token");
  const storedUserRole = localStorage.getItem("userRole");

  if (!token || !storedUserRole) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(storedUserRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
