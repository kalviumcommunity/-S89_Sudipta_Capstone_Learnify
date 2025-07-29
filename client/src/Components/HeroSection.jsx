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
