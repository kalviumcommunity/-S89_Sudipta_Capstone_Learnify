<<<<<<< HEAD
import React, { useState } from 'react';
import '../Styles/HeroSection.css';
import FeatureShowcase from './FeatureShowcase';

export default function HeroSection() {
  const [showFeatures, setShowFeatures] = useState(false);

  const handleExploreClick = () => {
    setShowFeatures(true);
  };

  const handleCloseFeatures = () => {
    setShowFeatures(false);
  };

  return (
    <>
      <div className="hero">
        <h1>Welcome to Learnify</h1>
        <p>Your one-stop platform for Mock Tests, DSA, and much more!</p>
        <button className="hero-btn" onClick={handleExploreClick}>
          Explore Now
        </button>
      </div>

      {showFeatures && (
        <FeatureShowcase onClose={handleCloseFeatures} />
      )}
    </>
  );
}
=======
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
>>>>>>> ed4d2209b2996fb09f96f64591b8d2341ccb34c7
