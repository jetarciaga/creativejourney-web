import "./Cards.scss";
import bohol1 from "../assets/images/hinagdanan-cave.jpg";
import bohol2 from "../assets/images/pahangog-twin-falls.jpg";
import bohol3 from "../assets/images/Rice-Terraces.jpg";

const Cards = () => {
  const data = {
    title: "Bohol",
    tagline:
      "Escape to Bohol – Where Pristine Beaches, Chocolate Hills, and Adventure Await!",
  };

  return (
    <section className="card-container">
      <div className="card-wrapper">
        <div className="card">
          <h2>{data.title}</h2>
          <img src={bohol3} alt="" />
          <p>
            {data.tagline}
            <span>Click to see more...</span>
          </p>
        </div>
      </div>
      <div className="card-wrapper">
        <div className="card">
          <img src={bohol1} alt="" />
        </div>
      </div>
      <div className="card-wrapper">
        <div className="card">
          <img src={bohol1} alt="" />
        </div>
      </div>
    </section>
  );
};

export default Cards;
