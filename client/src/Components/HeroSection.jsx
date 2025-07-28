import React from "react";
import "./HeroSection.css"; // Assuming you have a CSS file for styling
const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="tagline">Learn. Compete. Conquer.</h1>
        <p className="description">
          Your all-in-one platform for mastering concepts, cracking mock tests,
          and climbing leaderboards — the smarter way to success.
        </p>
        <div className="cta-buttons">
          <button className="cta signup-btn">Sign Up for free</button>
          <button className="cta demo-btn">Take a Demo Test</button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
