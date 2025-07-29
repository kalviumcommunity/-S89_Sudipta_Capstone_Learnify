import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/FeatureShowcase.css';

const FeatureShowcase = ({ onClose }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();

  const features = [
    {
      id: 'mock-tests',
      title: 'Mock Tests',
      subtitle: 'Practice Like the Real Exam',
      description: 'Comprehensive mock tests for NEET, JEE, UPSC, SSC and more. Get instant results, detailed analysis, and performance insights.',
      highlights: [
        'Real exam patterns and difficulty levels',
        'Instant scoring and detailed analysis',
        'Subject-wise performance tracking',
        'Time management practice',
        'Comprehensive question banks'
      ],
      action: 'Start Mock Test',
      route: '/mocktests',
      icon: '📝',
      gradient: 'from-blue-500 to-cyan-600',
      stats: { tests: '500+', questions: '50,000+', users: '10,000+' }
    },
    {
      id: 'dsa-hub',
      title: 'DSA Practice Hub',
      subtitle: 'Master Data Structures & Algorithms',
      description: 'Interactive coding environment with 1000+ problems, visual learning, and real-time feedback to build strong programming fundamentals.',
      highlights: [
        'Interactive code editor with syntax highlighting',
        'Visual algorithm demonstrations',
        'Progressive difficulty levels',
        'Real-time code execution and testing',
        'Comprehensive problem categorization'
      ],
      action: 'Start Coding',
      route: '/dsa',
      icon: '💻',
      gradient: 'from-purple-500 to-pink-600',
      stats: { problems: '1000+', topics: '50+', solutions: '5000+' }
    },
    {
      id: 'leaderboard',
      title: 'Competitive Leaderboard',
      subtitle: 'Compete and Excel',
      description: 'Track your progress, compete with peers, and climb the rankings. Gamified learning experience with badges and achievements.',
      highlights: [
        'Real-time ranking updates',
        'Achievement badges and rewards',
        'Subject-wise leaderboards',
        'Weekly and monthly competitions',
        'Performance analytics and insights'
      ],
      action: 'View Rankings',
      route: '/leaderboard',
      icon: '🏆',
      gradient: 'from-yellow-500 to-orange-600',
      stats: { active: '5000+', competitions: '100+', badges: '25+' }
    },
    {
      id: 'dashboard',
      title: 'Personal Dashboard',
      subtitle: 'Track Your Journey',
      description: 'Comprehensive analytics dashboard showing your learning progress, test history, strengths, weaknesses, and personalized recommendations.',
      highlights: [
        'Detailed performance analytics',
        'Learning streak tracking',
        'Personalized study recommendations',
        'Progress visualization charts',
        'Goal setting and achievement tracking'
      ],
      action: 'View Dashboard',
      route: '/dashboard',
      icon: '📊',
      gradient: 'from-green-500 to-emerald-600',
      stats: { insights: '20+', charts: '15+', metrics: '50+' }
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, features.length]);

  const handleFeatureClick = (index) => {
    setCurrentFeature(index);
    setIsAutoPlaying(false);
  };

  const handleActionClick = (route) => {
    navigate(route);
    onClose();
  };

  const currentFeatureData = features[currentFeature];

  return (
    <div className="feature-showcase-overlay" onClick={onClose}>
      <div className="feature-showcase" onClick={(e) => e.stopPropagation()}>
        <div className="showcase-header">
          <h2>Discover Learnify's Features</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="showcase-content">
          <div className="feature-navigation">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                className={`nav-item ${index === currentFeature ? 'active' : ''}`}
                onClick={() => handleFeatureClick(index)}
              >
                <span className="nav-icon">{feature.icon}</span>
                <span className="nav-title">{feature.title}</span>
              </button>
            ))}
          </div>

          <div className="feature-display">
            <div className={`feature-card bg-gradient-to-br ${currentFeatureData.gradient}`}>
              <div className="feature-header">
                <div className="feature-icon">{currentFeatureData.icon}</div>
                <div>
                  <h3>{currentFeatureData.title}</h3>
                  <p className="feature-subtitle">{currentFeatureData.subtitle}</p>
                </div>
              </div>

              <p className="feature-description">{currentFeatureData.description}</p>

              <div className="feature-highlights">
                <h4>Key Features:</h4>
                <ul>
                  {currentFeatureData.highlights.map((highlight, index) => (
                    <li key={index}>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="feature-stats">
                {Object.entries(currentFeatureData.stats).map(([key, value]) => (
                  <div key={key} className="stat-item">
                    <span className="stat-value">{value}</span>
                    <span className="stat-label">{key}</span>
                  </div>
                ))}
              </div>

              <button 
                className="feature-action-btn"
                onClick={() => handleActionClick(currentFeatureData.route)}
              >
                {currentFeatureData.action}
              </button>
            </div>
          </div>
        </div>

        <div className="showcase-footer">
          <div className="progress-indicators">
            {features.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index === currentFeature ? 'active' : ''}`}
                onClick={() => handleFeatureClick(index)}
              />
            ))}
          </div>
          <button 
            className="auto-play-toggle"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          >
            {isAutoPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
