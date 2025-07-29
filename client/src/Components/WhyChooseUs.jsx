import React from 'react';
import '../Styles/WhyChooseUs.css';

const WhyChooseUs = () => {
  return (
    <section className="why-section">
      <h2 className="why-heading">Why Choose Us?</h2>
      <p className="why-subheading">Your journey to excellence starts with us</p>

      <div className="why-features">
        <div className="why-card">
          <h3>Mock Tests</h3>
          <p>Simulate real exam patterns with instant score analysis.</p>
        </div>
        <div className="why-card">
          <h3>DSA Practice Hub</h3>
          <p>Curated DSA problems, coding challenges & contests.</p>
        </div>
        <div className="why-card">
          <h3>Leaderboard</h3>
          <p>Compete, grow, and see where you stand.</p>
        </div>
        <div className="why-card">
          <h3>Organization Exams</h3>
          <p>Take exams created by institutions or organizations.</p>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
