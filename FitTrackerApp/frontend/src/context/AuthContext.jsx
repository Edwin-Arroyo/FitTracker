// Import necessary hooks from React
import { createContext, useContext, useState, useEffect } from "react";

// Create a new context for authentication
// Initialize with null as default value
const AuthContext = createContext(null);

// Helper function to check authentication status
const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token || !userRole) {
    return {
      isAuthenticated: false,
      userRole: null
    };
  }
  
  return {
    isAuthenticated: true,
    userRole: userRole
  };
};

// authentication state 
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Check authentication status when the app loads
  useEffect(() => {
    const { isAuthenticated: authStatus, userRole: role } = checkAuthStatus();
    setIsAuthenticated(authStatus);
    setUserRole(role);
  }, []);

  const login = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
