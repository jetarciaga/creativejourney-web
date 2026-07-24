import "./TourPackage.scss";
import hinagdanan from "../assets/images/hinagdanan-cave.jpg";
import hinagdananWebp from "../assets/images/hinagdanan-cave.webp";
import boracayBeach from "../assets/images/boracayBeach.jpg";
import boracayBeachWebp from "../assets/images/boracayBeach.webp";
import cebuWhaleShark from "../assets/images/cebuWhaleShark.jpg";
import cebuWhaleSharkWebp from "../assets/images/cebuWhaleShark.webp";
import Xinjiang from "../assets/images/xinjiang.jpg";
import XinjiangWebp from "../assets/images/xinjiang.webp";
import Card from "./Card";

const TourPackage = () => {
  return (
    <section className="card-container">
      <Card
        title="Cebu"
        imgUrl={cebuWhaleShark}
        imgWebp={cebuWhaleSharkWebp}
        tagline="Discover Cebu – Where History, Paradise, and Adventure Unite!"
        linkTo="/"
      />
      <Card
        title="Bohol"
        imgUrl={hinagdanan}
        imgWebp={hinagdananWebp}
        tagline="Escape to Bohol – Where Pristine Beaches, Chocolate Hills, and Adventure Await!"
        linkTo="/"
      />
      <Card
        title="Boracay"
        imgUrl={boracayBeach}
        imgWebp={boracayBeachWebp}
        tagline="Boracay – Where Sun, Sand, and Paradise Meet!"
        linkTo="/"
      />
      <Card
        title="Xinjiang"
        imgUrl={Xinjiang}
        imgWebp={XinjiangWebp}
        tagline="Unforgettable Adventures, Rich Cultures, and Breathtaking Landscapes Await!"
        linkTo="/"
      />
    </section>
  );
};

export default TourPackage;
