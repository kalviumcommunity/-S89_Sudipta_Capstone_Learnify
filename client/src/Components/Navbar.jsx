import React from "react";
import "./Navbar.css"; // Assuming you have a CSS file for styling
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        LEARN<span>IFY</span>
      </div>
      <ul className="nav-links">
        <li><a href="#">Home</a></li>
        <li><a href="#">Mock Tests</a></li>
        <li><a href="#">Leaderboard</a></li>
        <li><a href="#">Dashboard</a></li>
        <li><a href="#">DSA</a></li>
      </ul>
      <div className="auth-buttons">
        <button className="signup">Sign Up</button>
        <button className="signin">Sign In</button>
      </div>
    </nav>
  );
};

export default Navbar;
