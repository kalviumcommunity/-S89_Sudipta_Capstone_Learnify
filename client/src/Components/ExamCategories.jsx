<<<<<<< HEAD
import React from 'react';
import '../Styles/ExamCategories.css';
import { Link } from 'react-router-dom';

const ExamCategories = () => {
  const exams = [
    { name: 'NEET', tagline: 'Dream MBBS?', class: 'neet' },
    { name: 'JEE', tagline: 'Engineer your journey!', class: 'jee' },
    { name: 'UPSC', tagline: 'Ace Civil Services', class: 'upsc' },
    { name: 'SSC', tagline: 'Secure Government Jobs', class: 'ssc' },
  ];

  return (
    <section className="exam-section">
      <h2 className="exam-heading">Your Gateway to Exam Success</h2>
      <p className="exam-subheading">No fluff, just focused practice. Begin any exam from here.</p>

      <div className="exam-cards">
        {exams.map((exam) => (
          <div className={`exam-card ${exam.class}`} key={exam.name}>
            <h3>{exam.name}</h3>
            <p>{exam.tagline}</p>
            <Link to="/MockTests">
  <button className="start-btn">Start Test</button>
</Link>
          </div>
        ))}
      </div>

      <div className="view-more">
     <Link to="/MockTests">
  <button>View all exam categories →</button>
</Link>

      </div>
=======
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
>>>>>>> ed4d2209b2996fb09f96f64591b8d2341ccb34c7
    </section>
  );
};

export default ExamCategories;
