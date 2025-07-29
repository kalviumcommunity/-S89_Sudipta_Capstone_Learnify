import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DSALanding.css';

const DSALanding = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalProblems: 0,
    totalTopics: 0,
    averageCompletion: 0,
    activeUsers: 0
  });

  useEffect(() => {
    // Simulate loading stats - in production, fetch from API
    setStats({
      totalProblems: 500,
      totalTopics: 15,
      averageCompletion: 65,
      activeUsers: 2500
    });
  }, []);

  const featuredTopics = [
    {
      id: 'arrays',
      name: 'Arrays',
      description: 'Master array manipulation and algorithms',
      difficulty: 'Beginner',
      problems: 45,
      estimatedTime: '2 hours',
      icon: '📊',
      color: 'from-blue-500 to-cyan-600',
      progress: user ? 75 : 0
    },
    {
      id: 'linked-lists',
      name: 'Linked Lists',
      description: 'Learn dynamic data structures and pointer manipulation',
      difficulty: 'Beginner',
      problems: 32,
      estimatedTime: '2.5 hours',
      icon: '🔗',
      color: 'from-green-500 to-emerald-600',
      progress: user ? 45 : 0
    },
    {
      id: 'trees',
      name: 'Trees',
      description: 'Understand hierarchical data structures',
      difficulty: 'Intermediate',
      problems: 58,
      estimatedTime: '4 hours',
      icon: '🌳',
      color: 'from-purple-500 to-violet-600',
      progress: user ? 20 : 0
    },
    {
      id: 'dynamic-programming',
      name: 'Dynamic Programming',
      description: 'Master optimization and memoization techniques',
      difficulty: 'Advanced',
      problems: 67,
      estimatedTime: '6 hours',
      icon: '🧠',
      color: 'from-red-500 to-pink-600',
      progress: user ? 5 : 0
    }
  ];

  const handleStartLearning = () => {
    navigate('/dsa/topics');
  };

  const handleTopicSelect = (topicId) => {
    navigate(`/dsa/topics/${topicId}`);
  };

  const handleDailyChallenge = () => {
    navigate('/dsa/daily-challenge');
  };

  return (
    <div className="dsa-landing">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Master <span className="gradient-text">Data Structures</span> & Algorithms
            </h1>
            <p className="hero-description">
              Build strong programming fundamentals with our comprehensive DSA learning platform. 
              Practice problems, learn concepts, and track your progress with interactive visualizations.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={handleStartLearning}>
                Start Learning
              </button>
              <button className="btn-secondary" onClick={handleDailyChallenge}>
                Daily Challenge
              </button>
              {isAuthenticated && (
                <button className="btn-outline" onClick={() => navigate('/dsa/progress')}>
                  View Progress
                </button>
              )}
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card">
              <div className="card-header">
                <span className="topic-badge">Arrays</span>
                <span className="difficulty-badge easy">Easy</span>
              </div>
              <div className="problem-preview">
                <h4>Two Sum</h4>
                <p>Find two numbers that add up to target</p>
              </div>
              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '75%'}}></div>
                </div>
                <span className="progress-text">75% Complete</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">{stats.totalProblems}+</div>
            <div className="stat-label">Practice Problems</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.totalTopics}</div>
            <div className="stat-label">DSA Topics</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.averageCompletion}%</div>
            <div className="stat-label">Avg Completion</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.activeUsers.toLocaleString()}</div>
            <div className="stat-label">Active Learners</div>
          </div>
        </div>
      </section>

      <section className="featured-topics">
        <div className="section-header">
          <h2>Popular DSA Topics</h2>
          <p>Start your journey with these fundamental data structures and algorithms</p>
        </div>
        <div className="topics-grid">
          {featuredTopics.map((topic) => (
            <div 
              key={topic.id} 
              className="topic-card"
              onClick={() => handleTopicSelect(topic.id)}
            >
              <div className={`topic-header bg-gradient-to-r ${topic.color}`}>
                <div className="topic-icon">{topic.icon}</div>
                <div className="topic-title">
                  <h3>{topic.name}</h3>
                  <span className={`difficulty-badge ${topic.difficulty.toLowerCase()}`}>
                    {topic.difficulty}
                  </span>
                </div>
              </div>
              <div className="topic-content">
                <p className="topic-description">{topic.description}</p>
                <div className="topic-details">
                  <div className="detail-item">
                    <span className="detail-label">Problems:</span>
                    <span className="detail-value">{topic.problems}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Est. Time:</span>
                    <span className="detail-value">{topic.estimatedTime}</span>
                  </div>
                </div>
                {isAuthenticated && topic.progress > 0 && (
                  <div className="topic-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${topic.progress}%`}}
                      ></div>
                    </div>
                    <span className="progress-text">{topic.progress}% Complete</span>
                  </div>
                )}
              </div>
              <div className="topic-footer">
                <button className="start-topic-btn">
                  {isAuthenticated && topic.progress > 0 ? 'Continue' : 'Start Learning'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <h2>Why Learn DSA with Learnify?</h2>
          <p>Comprehensive features designed to accelerate your programming journey</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Interactive Learning</h3>
            <p>Learn concepts with visual explanations, animations, and hands-on coding exercises.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your learning journey with detailed analytics and achievement milestones.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Daily Challenges</h3>
            <p>Stay consistent with daily coding challenges and compete on the leaderboard.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Guided Roadmap</h3>
            <p>Follow structured learning paths tailored to your skill level and career goals.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3>Hints & Solutions</h3>
            <p>Get progressive hints and detailed editorial solutions for every problem.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Feedback</h3>
            <p>Test your code instantly with comprehensive test cases and performance metrics.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Level Up Your Programming Skills?</h2>
          <p>Join thousands of developers who have mastered DSA with our platform</p>
          <div className="cta-buttons">
            <button className="btn-primary" onClick={handleStartLearning}>
              Start Learning Now
            </button>
            {!isAuthenticated && (
              <button className="btn-outline" onClick={() => navigate('/signup')}>
                Create Free Account
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DSALanding;
