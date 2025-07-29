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
