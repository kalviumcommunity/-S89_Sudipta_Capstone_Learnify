<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Styles/Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">LEARNIFY</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/mocktests">Mock Tests</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/dsa">DSA</Link>
      </div>
      <div className="auth-buttons">
        {isAuthenticated ? (
          <>
            <span className="user-greeting">Hi, {user?.name}!</span>
            <button onClick={logout} className="btn btn-logout">Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/signup" className="btn">Sign Up</Link>
            <Link to="/signin" className="btn">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
}
=======
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
>>>>>>> ed4d2209b2996fb09f96f64591b8d2341ccb34c7
