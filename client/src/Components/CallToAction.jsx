import React from 'react';
import '../Styles/CallToAction.css';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2>Ready to Boost Your Learning?</h2>
        <p>Join thousands of students already improving with Learnify’s mock tests, DSA hub, and more!</p>
        <Link to="/MockTests">
          <button className="cta-btn">Start Mock Tests Now</button>
        </Link>
      </div>
    </section>
  );
};

export default CallToAction;
