import React from "react";
import "./ExamCategories.css"; // Assuming you have a CSS file for styling
const ExamCategories = () => {
  return (
    <section className="exam-categories">
      <h2 className="section-title">Your Gateway to Exam Success</h2>
      <p className="section-subtitle">No fluff, just focused practice — ace any exam from here</p>
      <div className="exam-cards">
        <div className="exam-card">
          <h3>NEET</h3>
          <p>Dream MBBS? Let's make it reality</p>
          <button className="start-test-btn">Start Test</button>
        </div>
        <div className="exam-card">
          <h3>JEE</h3>
          <p>Targeting 99+ percentile? Start here</p>
          <button className="start-test-btn">Start Test</button>
        </div>
        <div className="exam-card">
          <h3>UPSC</h3>
          <p>Aiming for LBSNAA? Let's begin</p>
          <button className="start-test-btn">Start Test</button>
        </div>
        <div className="exam-card">
          <h3>SSC</h3>
          <p>Dreaming SSC? Let's make it real</p>
          <button className="start-test-btn">Start Test</button>
        </div>
      </div>
      <button className="view-all-btn">View all exam categories →</button>
    </section>
  );
};

export default ExamCategories;
