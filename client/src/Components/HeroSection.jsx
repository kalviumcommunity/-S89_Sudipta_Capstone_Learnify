import React, { useState } from 'react';
import './HeroSection.css';
import FeatureShowcase from './FeatureShowcase';
import { Link } from 'react-router-dom';

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
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="tagline">Learn. Compete. Conquer.</h1>
          <p className="description">
            Your all-in-one platform for mastering concepts, cracking mock tests,
            and climbing leaderboards — the smarter way to success.
          </p>
          <div className="cta-buttons">
            <Link to="/mocktests" className="cta demo-btn">Take a Demo Test</Link>
            <button className="cta explore-btn" onClick={handleExploreClick}>Explore Features</button>
          </div>
        </div>
      </section>

      {showFeatures && (
        <FeatureShowcase onClose={handleCloseFeatures} />
      )}
    </>
  );
}
