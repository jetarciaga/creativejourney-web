import "./Footer.scss";

const Footer = () => {
  return (
    <section className="footer-container">
      <div className="top-row">
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
      </div>
    </section>
  );
};

export default Footer;
