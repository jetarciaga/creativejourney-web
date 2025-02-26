import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import "./Footer.scss";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <div className="footer-main">
      <div className="footer-container">
        <section className="social">
          <figure>
            <img src="" alt="" />
          </figure>
          <p style={{ fontWeight: 600 }}>
            We specialize in personalized travel programs for FIT,GIT, and MICE.
            Our commitment is to offerexceptional service at competitive prices,
            ensuringevery aspect of your travel experience is handledwith care
            and attention to detail.
          </p>
          <div className="social-links">
            <p>FOLLOW US:</p>
            <ul>
              <li
                onClick={() =>
                  window.open(
                    "https://www.facebook.com/creativejourneysph",
                    "_blank"
                  )
                }
              >
                <i className="bx bxl-facebook-circle" />
              </li>
              <li
                onClick={() =>
                  window.open(
                    "https://www.linkedin.com/in/creativejourneysph/",
                    "_blank"
                  )
                }
              >
                <i className="bx bxl-linkedin-square" />
              </li>
            </ul>
          </div>
        </section>
        <section className="navigation">
          <header>
            <h2>Creative Journeys PH</h2>
          </header>
          <ul>
            <li onClick={() => navigate("/about")}>About</li>
            <li onClick={() => navigate("/services")}>Services</li>
            <li onClick={() => navigate("/contact")}>Contact</li>
          </ul>
        </section>
        <section className="contact">
          <header>
            <h2>Talk To Us</h2>
          </header>
          <ul>
            <li>
              #4 San Guillermo Street, <br />
              Brgy. Bayanan, Muntinlupa City
            </li>
            <li style={{ fontWeight: 600 }}>hello@creativejourneysph.com</li>
            <li>
              <i className="bx bxl-whatsapp" />
              <span>+63 998 9629 055</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Footer;

{
  /* <div className="top-row">
        <div className="column">
          <h3>Connect with us</h3>
          <ul>
            <li>
              <i className="bx bxl-linkedin-square" />
            </li>
            <li>
              <i className="bx bxl-facebook-square" />
            </li>
          </ul>
        </div>
        <div className="column">
          <h3>How It Works</h3>
        </div>
        <div className="column">
          <h3>
            Why <br />
            Creative Journeys
          </h3>
          <ul>
            <li>Our Story</li>
            <li>Why Philippines?</li>
          </ul>
        </div>
        <div className="column">
          <h3>Services</h3>
          <ul>
            <li>Book & Travel</li>
            <li>Quotations</li>
          </ul>
        </div>
        <div className="column">
          <h3>Success Stories</h3>
        </div>
        <div className="column">
          <h3>Talk To Us</h3>
          <ul>
            <li>#4 San Guillermo Street, Brgy. Bayanan, Muntinlupa City</li>
            <li>hello@creativejourneysph.com</li>
            <li>+639610059847</li>
          </ul>
        </div>
      </div>
      <div className="bottom-row">
        <p>Copyright © 2025.</p>
        <p>Creative Journeys Travel</p>
      </div> */
}
