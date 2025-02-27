import "./Navbar.scss";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav aria-label="Main Navigation">
      <div className="container">
        <img
          src={logo}
          className="navbar-logo"
          alt="CreativeJourneys Logo"
          onClick={() => navigate("/")}
        />
        <ul className={`nav-links ${isOpen ? "open" : ""}`}>
          <li onClick={() => navigate("/")}>Home</li>
          <li onClick={() => navigate("/about")}>About</li>
          <li onClick={() => navigate("/services")}>Services</li>
          <li onClick={() => navigate("/contact")}>Contact</li>
        </ul>

        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <i className="bx bx-x" /> : <i className="bx bx-menu" />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
