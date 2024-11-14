import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import Card from "../Components/card/Card";
import "./Home.css";
const Home = () => {
  const cardData = [
    {
      image: "/src/assets/line_graph.png",
      title: "Track Progress",
      description:
        "Monitor your fitness journey with detailed progress tracking",
    },
    {
      image: "/src/assets/trainer.jpg",
      title: "Custom Workouts",
      description: "Create and follow personalized workout plans",
    },
    {
      image: "/src/assets/track_cals.png",
      title: "Set Goals",
      description:
        "Set and achieve your fitness goals with our goal tracking system",
    },
  ];

  return (
    <>
      <Navbar />
      <header className="home-header">
        <h1>Welcome to FitTracker</h1>
        <p>Your personalized fitness tracking app</p>
        <div className="cards-container">
          {cardData.map((card, index) => (
            <Card
              key={index}
              image={card.image}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
        <Link to="/register">
          <button>Get Started</button>
        </Link>
      </header>
      <Footer />
    </>
  );
};

export default Home;
