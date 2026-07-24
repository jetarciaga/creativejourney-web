import { Link } from "react-router-dom";
import "./Card.scss";

const Card = ({ title, imgUrl, imgWebp, tagline, linkTo }) => {
  return (
    <section className="card-wrapper">
      <article className="card">
        <h2>{title}</h2>
        <picture>
          {imgWebp && <source srcSet={imgWebp} type="image/webp" />}
          <img src={imgUrl} alt="" loading="lazy" />
        </picture>
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
