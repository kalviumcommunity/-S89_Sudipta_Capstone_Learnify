import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../Styles/SignIn.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), password);

      if (result && result.success) {
        navigate("/dashboard");
      } else {
        setError(result?.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (loading) return; // Prevent multiple clicks
    setLoading(true);
    setError("");

    try {
      loginWithGoogle();
    } catch (err) {
      console.error("Google sign in error:", err);
      setError("Failed to initiate Google sign in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="signIn-bg">
      <div className="signIn-container">
        {/* Left Side with background image and left-aligned text */}
        <div className="signIn-left-bg">
          <div className="signIn-left-content">
            <h2 className="signIn-title">
              Let’s Grow Up<br />Your Future<br />With Learnify
            </h2>
            <p className="signIn-desc">
              Learn important new skills, discover passions<br />
              or hobbies, find ideas to change your careers.
            </p>
          </div>
        </div>
        {/* Right Side */}
        <div className="signIn-right">
          <div className="signIn-header">
            <div className="signIn-header-title">
              Sign in to your account
            </div>
          </div>

          {error && (
            <div className="signIn-error">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="signIn-google-btn"
            disabled={loading}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="signIn-google-icon"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline-block';
              }}
            />
            <span className="google-fallback-icon" style={{display: 'none'}}>G</span>
            {loading ? "Signing in..." : "Sign In with Google"}
          </button>
          <div className="signIn-or">OR</div>
          <form onSubmit={handleSubmit}>
            <div className="signIn-form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
              />
            </div>
            <div className="signIn-form-group">
              <label>Password</label>
              <div className="signIn-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <span
                  className="signIn-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
              <div className="signIn-forgot">
                <span style={{float:'right'}}>
                  <a href="/forgot-password" style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer' }}>Forgot Password?</a>
                </span>
              </div>
            </div>
            <div className="signIn-checkbox-group">
              <input type="checkbox" id="keepLoggedIn" />
              <label htmlFor="keepLoggedIn">
                Remember me
              </label>
            </div>
            <button type="submit" className="signIn-btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <div className="signIn-footer">
            <div className="signIn-footer-link">
              Don't have an account? <a href="/signup">Sign Up</a>
            </div>
            © 2025 Learnify. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}