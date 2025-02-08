import banner_1 from "../assets/carousel_01.jpg";
import banner_2 from "../assets/carousel_02.jpg";
import banner_3 from "../assets/carousel_03.jpg";
import "./ImageSlider.scss";
import { useState } from "react";

const IMAGES = [banner_1, banner_2, banner_3];

const ImageSlider = () => {
  const [imageIndex, setImageIndex] = useState(0);

  const showNextImage = () => {
    setImageIndex((index) => {
      if (index === IMAGES.length - 1) return 0;
      return index + 1;
    });
  };

  const showPrevImage = () => {
    setImageIndex((index) => {
      if (index === 0) return IMAGES.length - 1;
      return index - 1;
    });
  };

  return (
    <section className="banner-container">
      {IMAGES.map((_, index) => (
        <img src={IMAGES[imageIndex]} key={index} className="img-slider" />
      ))}
      <button onClick={showPrevImage} className="slider-btn">
        <i className="bx bx-chevron-left" />
      </button>
      <button
        onClick={showNextImage}
        className="slider-btn"
        style={{ right: 0 }}
      >
        <i className="bx bx-chevron-right" />
      </button>
    </section>
  );
};

export default ImageSlider;
