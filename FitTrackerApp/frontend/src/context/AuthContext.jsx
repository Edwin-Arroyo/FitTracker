// Import necessary hooks from React
import { createContext, useContext, useState, useEffect } from "react";

// Create a new context for authentication
// Initialize with null as default value
const AuthContext = createContext(null);

// AuthProvider component that wraps the app and provides authentication state
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    setIsAuthenticated(!!userRole);
  }, []);

  const login = (role) => {
    setIsAuthenticated(true);
    localStorage.setItem("userRole", role || "user");
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
// Components can import this to access auth state and functions
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
