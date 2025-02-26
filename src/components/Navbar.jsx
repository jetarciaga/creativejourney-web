import "./Navbar.scss";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav aria-label="Main Navigation">
      <div className="container">
        <img
          src={logo}
          className="navbar-logo"
          alt="CreativeJourneys Logo"
          onClick={() => navigate("/")}
        />
        <ul>
          <li onClick={() => navigate("/")}>Home</li>
          <li onClick={() => navigate("/about")}>About</li>
          <li onClick={() => navigate("/services")}>Services</li>
          <li onClick={() => navigate("/contact")}>Contact</li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
