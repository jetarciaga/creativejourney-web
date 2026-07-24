import { useNavigate } from "react-router-dom";
import "./Footer.scss";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <div className="footer-main">
      <div className="footer-container">
        <section className="social">
          <p style={{ fontWeight: 600 }}>
            We specialize in personalized travel programs for FIT, GIT, and
            MICE. Our commitment is to offer exceptional service at competitive
            prices, ensuring every aspect of your travel experience is handled
            with care and attention to detail.
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
            <li onClick={() => navigate("/privacy")}>Privacy</li>
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
      <div className="copyright">
        <section>
          Copyright <i className="bx bx-copyright" /> 2025
        </section>
      </div>
    </div>
  );
};

export default Footer;
