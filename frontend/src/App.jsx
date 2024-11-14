import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import SystemSettings from "./pages/admin/SystemSettings";
//import TrainerDashboard from "./pages/trainer/TrainerDashboard";
//import ClientManagement from "./pages/trainer/ClientManagement";

// protected routes are handled in the AuthProvider, used for admin and trainer dashboard so that only admins and trainers can access them
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
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["user", "trainer", "admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trainer/*"
            element={
              <ProtectedRoute allowedRoles={["trainer", "admin"]}>
                <Routes>
                  {/* TODO: Add trainer dashboard and client management components */}
                  {/*<Route path="/dashboard" element={<TrainerDashboard />} />*/}
                  {/*<Route path="/clients" element={<ClientManagement />} />*/}
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
