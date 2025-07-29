import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './MockTestLanding.css';

const MockTestLanding = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalTests: 0,
    totalStudents: 0,
    averageScore: 0,
    testsToday: 0
  });

  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalTests: 15000,
      totalStudents: 50000,
      averageScore: 78,
      testsToday: 1250
    });
  }, []);

  const featuredExams = [
    {
      id: 'neet',
      name: 'NEET',
      fullName: 'National Eligibility cum Entrance Test',
      description: 'Medical entrance exam for MBBS, BDS, and other medical courses',
      subjects: ['Biology', 'Physics', 'Chemistry'],
      totalQuestions: 180,
      duration: '3 hours',
      difficulty: 'High',
      icon: '🏥',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'jee',
      name: 'JEE Main',
      fullName: 'Joint Entrance Examination',
      description: 'Engineering entrance exam for NITs, IIITs, and other engineering colleges',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      totalQuestions: 90,
      duration: '3 hours',
      difficulty: 'High',
      icon: '⚙️',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'wbjee',
      name: 'WBJEE',
      fullName: 'West Bengal Joint Entrance Examination',
      description: 'State-level engineering and medical entrance exam for West Bengal',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      totalQuestions: 155,
      duration: '2 hours',
      difficulty: 'Medium',
      icon: '🎓',
      color: 'from-purple-500 to-violet-600'
    }
  ];

  const handleStartTest = () => {
    navigate('/mocktests/exams');
  };

  const handleExamSelect = (examId) => {
    navigate(`/mocktests/exams/${examId}`);
  };

  return (
    <div className="mocktest-landing">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Master Your <span className="gradient-text">Mock Tests</span>
            </h1>
            <p className="hero-description">
              Practice with real exam patterns, get instant results, and track your progress 
              with our comprehensive mock test platform designed for competitive exams.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={handleStartTest}>
                Start Practice Test
              </button>
              <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                View Progress
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card">
              <div className="card-header">
                <span className="exam-badge">NEET</span>
                <span className="time-badge">⏱ 3:00:00</span>
              </div>
              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '65%'}}></div>
                </div>
                <span className="progress-text">65% Complete</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">{stats.totalTests.toLocaleString()}+</div>
            <div className="stat-label">Practice Tests</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.totalStudents.toLocaleString()}+</div>
            <div className="stat-label">Students</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.averageScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.testsToday.toLocaleString()}</div>
            <div className="stat-label">Tests Today</div>
          </div>
        </div>
      </section>

      <section className="featured-exams">
        <div className="section-header">
          <h2>Popular Entrance Exams</h2>
          <p>Choose from our most popular competitive exam preparations</p>
        </div>
        <div className="exams-grid">
          {featuredExams.map((exam) => (
            <div 
              key={exam.id} 
              className="exam-card"
              onClick={() => handleExamSelect(exam.id)}
            >
              <div className={`exam-header bg-gradient-to-r ${exam.color}`}>
                <div className="exam-icon">{exam.icon}</div>
                <div className="exam-title">
                  <h3>{exam.name}</h3>
                  <p>{exam.fullName}</p>
                </div>
              </div>
              <div className="exam-content">
                <p className="exam-description">{exam.description}</p>
                <div className="exam-details">
                  <div className="detail-item">
                    <span className="detail-label">Subjects:</span>
                    <span className="detail-value">{exam.subjects.join(', ')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Questions:</span>
                    <span className="detail-value">{exam.totalQuestions}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{exam.duration}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Difficulty:</span>
                    <span className={`difficulty-badge ${exam.difficulty.toLowerCase()}`}>
                      {exam.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              <div className="exam-footer">
                <button className="start-exam-btn">
                  Start Practice
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose Our Mock Tests?</h2>
          <p>Comprehensive features designed to boost your exam performance</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Detailed Analytics</h3>
            <p>Get comprehensive performance analysis with topic-wise breakdown and improvement suggestions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Real Exam Experience</h3>
            <p>Practice with actual exam patterns, time limits, and difficulty levels to build confidence.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your improvement over time with detailed progress reports and performance trends.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Personalized Practice</h3>
            <p>Focus on your weak areas with customized practice sessions and targeted question sets.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Preparation?</h2>
          <p>Join thousands of students who have improved their scores with our mock tests</p>
          <div className="cta-buttons">
            <button className="btn-primary" onClick={handleStartTest}>
              Start Free Test
            </button>
            {!isAuthenticated && (
              <button className="btn-outline" onClick={() => navigate('/signup')}>
                Create Account
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MockTestLanding;
