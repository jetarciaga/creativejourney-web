import { Link } from "react-router-dom";
import "./Card.scss";

const Card = ({ title, imgUrl, tagline, linkTo }) => {
  return (
    <section className="card-wrapper">
      <article className="card">
        <h2>{title}</h2>
        <img src={imgUrl} alt="" />
        <p>
          {tagline}
          <Link to={linkTo} className="card-link">
            Click to see more...
          </Link>
        </p>
      </article>
    </section>
  );
};

export default Card;
