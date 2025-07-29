import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../Styles/SignUp.css";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    // Name validation
    if (name.trim().length < 2 || name.trim().length > 50) {
      setError("Name must be between 2 and 50 characters");
      return;
    }

    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name.trim())) {
      setError("Name can only contain letters and spaces");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Check password complexity requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      setError("Password must contain at least one lowercase letter, one uppercase letter, and one number");
      return;
    }

    if (!agree) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    setLoading(true);

    try {
      const result = await register(name.trim(), email.trim(), password);

      if (result && result.success) {
        navigate("/dashboard");
      } else {
        setError(result?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    if (loading) return; // Prevent multiple clicks
    setLoading(true);
    setError("");

    try {
      loginWithGoogle();
    } catch (err) {
      console.error("Google sign up error:", err);
      setError("Failed to initiate Google sign up. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="signup-bg">
      <div className="signup-container">
        {/* Left Side */}
        <div className="signup-left">
          <Link to="/" className="signup-logo">Learnify</Link>
          <h2 className="signup-left-title">Welcome to Learnify</h2>
          <p className="signup-left-desc">
           Your Gateway to Smarter Learning and Skill Mastery.
          </p>
        </div>
        {/* Right Side */}
        <div className="signup-right">
          <div className="signup-form-container">
            <h2 className="signup-title">Create Your Account</h2>

            {error && (
              <div className="signup-error">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="signup-google-btn"
              disabled={loading}
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="signup-google-icon"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline-block';
                }}
              />
              <span className="google-fallback-icon" style={{display: 'none'}}>G</span>
              {loading ? "Signing up..." : "Sign Up with Google"}
            </button>
            <div className="signup-or">OR</div>
            <form onSubmit={handleSubmit}>
              <div className="signup-form-group">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="signup-form-group">
                <input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="signup-form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <div className="signup-password-hint">
                  Must be at least 6 characters with uppercase, lowercase, and number
                </div>
              </div>
              <div className="signup-checkbox-group">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                />
                <label htmlFor="terms">
                  I agree to the <a href="#">Terms & Conditions</a>
                </label>
              </div>
              <button
                type="submit"
                className="signup-btn"
                disabled={!agree || loading}
              >
                {loading ? "Creating Account..." : "Register"}
              </button>
            </form>
            <div className="signup-footer">
              Already have an account? <a href="/signin">Sign In</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}