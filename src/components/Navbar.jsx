import "./Navbar.scss";
import logo from "../assets/logo.png";

const Navbar = () => {
  return (
    <nav aria-label="Main Navigation">
      <div className="container">
        <img src={logo} className="navbar-logo" alt="CreativeJourneys Logo" />
        <ul>
          <li>Home</li>
          <li>About</li>
          <li>Services</li>
          <li>Contact</li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
