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
    </section>
  );
};

export default ExamCategories;