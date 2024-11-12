import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./Home.css";

const Home = () => {
  return (
    <>
      <Navbar />
      <header className="home-header">
        <h1>Welcome to FitTracker</h1>
        <p>Your personalized fitness tracking app</p>
        <Link to="/register">
          <button>Get Started</button>
        </Link>
      </header>
      <Footer />
    </>
  );
};

export default Home;
