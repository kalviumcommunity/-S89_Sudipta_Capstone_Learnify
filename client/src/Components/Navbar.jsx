import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Styles/Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        LEARN<span>IFY</span>
      </Link>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/mocktests">Mock Tests</Link></li>
        <li><Link to="/leaderboard">Leaderboard</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/dsa">DSA</Link></li>
      </ul>

      <div className="auth-buttons">
        {isAuthenticated ? (
          <>
            <span className="user-greeting">Hi, {user?.name}!</span>
            <button onClick={logout} className="btn btn-logout">Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/signup" className="btn signup">Sign Up</Link>
            <Link to="/signin" className="btn signin">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
}
