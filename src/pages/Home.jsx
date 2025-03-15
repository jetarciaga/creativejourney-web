import TourPackage from "../components/TourPackage";
import ImageSlider from "../components/ImageSlider";
import "./Home.scss";

const Home = () => {
  return (
    <>
      <ImageSlider />
      <h1 style={{ fontFamily: "Amatic SC", fontWeight: 900, fontSize: "5em" }}>
        - Your Wonderful Journey Starts Here -{" "}
      </h1>
      <TourPackage />
    </>
  );
};

export default Home;
