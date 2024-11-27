import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./ProfileInfo.css";

const ProfileInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    height_feet: "",
    height_inches: "",
    weight: "",
    age: "",
    fitness_goals: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8000/api/users/${userId}/profile/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-info-container">
        <h2>Update Profile Information</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="profile-info-form">
          <div className="height-group">
            <div className="form-group">
              <label htmlFor="height_feet">Height (ft)</label>
              <input
                type="number"
                id="height_feet"
                name="height_feet"
                value={formData.height_feet}
                onChange={handleChange}
                min="0"
                max="8"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="height_inches">Inches</label>
              <input
                type="number"
                id="height_inches"
                name="height_inches"
                value={formData.height_inches}
                onChange={handleChange}
                min="0"
                max="11"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="weight">Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fitness_goals">Fitness Goals</label>
            <textarea
              id="fitness_goals"
              name="fitness_goals"
              value={formData.fitness_goals}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            Save Profile Info
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default ProfileInfo;