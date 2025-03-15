import "./TourPackage.scss";
import hinagdanan from "../assets/images/hinagdanan-cave.jpg";
import boracayBeach from "../assets/images/boracayBeach.jpg";
import cebuWhaleShark from "../assets/images/cebuWhaleShark.jpg";
import Xinjiang from "../assets/images/xinjiang.jpg";
import Card from "./Card";

const TourPackage = () => {
  return (
    <section className="card-container">
      <Card
        title="Cebu"
        imgUrl={cebuWhaleShark}
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
        imgUrl={boracayBeach}
        tagline="Boracay – Where Sun, Sand, and Paradise Meet!"
        linkTo="/"
      />
      <Card
        title="Xinjiang"
        imgUrl={Xinjiang}
        tagline="Unforgettable Adventures, Rich Cultures, and Breathtaking Landscapes Await!"
        linkTo="/"
      />
    </section>
  );
};

export default TourPackage;
