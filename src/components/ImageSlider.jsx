import banner_1 from "../assets/carousel_01.jpg";
import banner_2 from "../assets/carousel_02.jpg";
import banner_3 from "../assets/carousel_03.jpg";
import "./ImageSlider.scss";
import { useState, useEffect } from "react";

const IMAGES = [banner_1, banner_2, banner_3];

const ImageSlider = () => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const showNextImage = () => {
    // setIsPaused(true);
    setImageIndex((index) => {
      if (index === IMAGES.length - 1) return 0;
      return index + 1;
    });
  };

  const showPrevImage = () => {
    // setIsPaused(true);
    setImageIndex((index) => {
      if (index === 0) return IMAGES.length - 1;
      return index - 1;
    });
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      imageIndex < IMAGES.length - 1
        ? setImageIndex((prevIndex) => prevIndex + 1)
        : setImageIndex(0);
    }, 5000);

    return () => clearInterval(interval);
  }, [imageIndex, isPaused]);

  return (
    <section className="banner-container">
      <div className="slide-wrapper">
        {IMAGES.map((img, index) => (
          <img
            src={img}
            key={index}
            className="img-slider"
            style={{ translate: `${-100 * imageIndex}%` }}
          />
        ))}
      </div>
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
