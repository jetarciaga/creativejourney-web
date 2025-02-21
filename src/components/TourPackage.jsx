import "./TourPackage.scss";
import hinagdanan from "../assets/images/hinagdanan-cave.jpg";
import bohol2 from "../assets/images/pahangog-twin-falls.jpg";
import riceTerraces from "../assets/images/Rice-Terraces.jpg";
import Card from "./Card";

const TourPackage = () => {
  const data = {
    title: "Sample",
    tagline: "Sample Tagline",
  };

  return (
    <section className="card-container">
      <Card
        title="Cebu"
        imgUrl={riceTerraces}
        tagline="Discover Cebu – Where History, Paradise, and Adventure Unite!"
        linkTo="/"
      />
      <Card
        title="Bohol"
        imgUrl={hinagdanan}
        tagline="Escape to Bohol – Where Pristine Beaches, Chocolate Hills, and Adventure Await!"
        linkTo="/"
      />
      <Card
        title="Boracay"
        imgUrl={hinagdanan}
        tagline="Boracay – Where Sun, Sand, and Paradise Meet!"
        linkTo="/"
      />
    </section>
  );
};

export default TourPackage;
