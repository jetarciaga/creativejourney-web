// import { useState } from "react";

import "./App.scss";
import Navbar from "./components/Navbar";
// import Banner from "./components/Banner";
import Cards from "./components/Cards";
import ImageSlider from "./components/ImageSlider";

function App() {
  // const [count, setCount] = useState(0);

  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        {/* <img src={img} alt="Sample" /> */}
        <ImageSlider />
        {/* <Banner /> */}
        <Cards />
      </main>
    </>
  );
}

export default App;
