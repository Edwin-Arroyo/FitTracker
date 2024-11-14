import { useAuth } from "../../context/AuthContext";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./Admin.css";

const SystemSettings = () => {
  return (
    <>
      <Navbar />
      <div className="admin-container">
        <h1>System Settings</h1>
        <div className="settings-panel">
          {/* Settings content will go here */}
          <p></p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SystemSettings;
