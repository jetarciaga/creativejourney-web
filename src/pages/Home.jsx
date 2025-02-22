import TourPackage from "../components/TourPackage";
import ImageSlider from "../components/ImageSlider";
import "./Home.scss";

const Home = () => {
  return (
    <>
      <ImageSlider />
      <h1>Your Trusted DMC partner in the Philippines</h1>
      <TourPackage />
    </>
  );
};

export default Home;
