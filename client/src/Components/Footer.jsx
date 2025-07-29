import React from 'react';
import '../Styles/Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <Link to="/" className="footer-logo">Learnify</Link>
        <p>Your gateway to smarter learning.</p>
      </div>

      <div className="footer-links">
        <div className="footer-column">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/MockTests">Mock Tests</Link>
          <Link to="/DSA">DSA Hub</Link>
          <Link to="/Leaderboard">Leaderboard</Link>
        </div>

        <div className="footer-column">
          <h4>Account</h4>
          <Link to="/SignIn">Sign In</Link>
          <Link to="/SignUp">Sign Up</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>

        <div className="footer-column">
          <h4>Contact</h4>
          <p>Email: support@learnify.in</p>
          <p>Phone: +91-99999-99999</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Learnify. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
