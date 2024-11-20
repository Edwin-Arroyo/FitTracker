import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import WorkoutLog from "./pages/WorkoutLog";
import Macros from "./pages/Macros";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import ClientProfile from "./pages/trainer/ClientProfile";
import ProfileInfo from "./pages/ProfileInfo";

// Protected Route component for admin access
const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/WorkoutLog"
            element={
              <ProtectedRoute allowedRoles={["user", "trainer", "admin"]}>
                <WorkoutLog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Macros"
            element={
              <ProtectedRoute allowedRoles={["user", "trainer", "admin"]}>
                <Macros />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["user", "trainer", "admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/info"
            element={<ProfileInfo />}
          />

          <Route
            path="/trainer/*"
            element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                <Routes>
                  <Route path="/dashboard" element={<TrainerDashboard />} />
                  <Route path="/client/:clientId" element={<ClientProfile />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/settings" element={<SystemSettings />} />
                  <Route
                    path="/dashboard"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
