// reusable card component to display the features of the app
import "./Card.css";

function Card({ image, title, description }) {
  return (
    <div className="card">
      <img className="card-image" src={image} alt={title}></img>
      <h2 className="card-title">{title}</h2>
      <p className="card-text">{description}</p>
    </div>
  );
}

export default Card;
