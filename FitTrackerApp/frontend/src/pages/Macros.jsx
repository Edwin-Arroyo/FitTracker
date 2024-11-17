import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./Macros.css";

// Macros component handles tracking of daily macronutrient intake
const Macros = () => {
  // Initialize navigation utility for redirecting after form submission
  const navigate = useNavigate();

  // Initialize form state with empty macronutrient values
  // This state updates as user inputs their macro consumption
  const [macroData, setMacroData] = useState({
    carbs: "",
    protein: "",
    fat: "",
  });

  // State to handle and display error messages
  const [error, setError] = useState("");

  // handleChange: Updates form state when input fields change
  // - Preserves existing macro data using spread operator
  // - Updates only the changed field using computed property name
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMacroData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handleSubmit: Processes form submission
  // 1. Prevents default form submission
  // 2. Makes API call to backend macros endpoint
  // 3. Handles successful submission by redirecting to profile
  // 4. Handles failed submission by displaying error message
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `http://localhost:8000/api/users/${userId}/macros/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          // Convert string values to integers before sending
          body: JSON.stringify({
            carbs: parseInt(macroData.carbs),
            protein: parseInt(macroData.protein),
            fat: parseInt(macroData.fat),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to log macros");
      }

      // Redirect back to profile page after successful submission
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };

  // Render macro tracking form with:
  // - Error message display
  // - Input fields for carbs, protein, and fat
  // - Submit button to calculate total calories
  return (
    <>
      <Navbar />
      <div className="macros-container">
        <h1>Track Your Macros</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="macros-form">
          {/* Input groups for each macronutrient */}
          {/* Each input is a number type with minimum value of 0 */}
          <div className="form-group">
            <label htmlFor="carbs">Carbohydrates (g)</label>
            <input
              type="number"
              id="carbs"
              name="carbs"
              value={macroData.carbs}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="protein">Proteins (g)</label>
            <input
              type="number"
              id="protein"
              name="protein"
              value={macroData.protein}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fat">Fats (g)</label>
            <input
              type="number"
              id="fat"
              name="fat"
              value={macroData.fat}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <button type="submit" className="submit-button">
            Calculate Calories
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Macros;