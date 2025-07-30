import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOverallProgress } from '../../hooks/useProgress';
import axios from 'axios';
import './DSAProgress.css';

const DSAProgress = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    overallProgress: hookOverallProgress,
    categoryProgress: hookCategoryProgress,
    topicProgress: hookTopicProgress,
    loading,
    error: progressError,
    refresh
  } = useOverallProgress();
  const [error, setError] = useState(null);

  // Fallback mock data if hook returns nothing
  const overallProgress = hookOverallProgress || {
    percentage: 40,
    completedTopics: 3,
    totalTopics: 10,
    currentStreak: 2,
    longestStreak: 5
  };
  const categoryProgress = hookCategoryProgress || [
    { _id: 'basic', averageProgress: 60, completedTopics: 2, totalTopics: 4, totalProblemsSolved: 20 },
    { _id: 'intermediate', averageProgress: 30, completedTopics: 1, totalTopics: 3, totalProblemsSolved: 8 },
    { _id: 'advanced', averageProgress: 10, completedTopics: 0, totalTopics: 3, totalProblemsSolved: 2 }
  ];
  const topicProgress = hookTopicProgress || [
    { topic: { _id: 'arrays', name: 'Arrays' }, problemsSolved: 10, problemsAttempted: 15, timeSpent: 120, progressPercentage: 66 },
    { topic: { _id: 'linked-lists', name: 'Linked Lists' }, problemsSolved: 5, problemsAttempted: 10, timeSpent: 80, progressPercentage: 50 },
    { topic: { _id: 'trees', name: 'Trees' }, problemsSolved: 2, problemsAttempted: 8, timeSpent: 40, progressPercentage: 25 }
  ];
  const progressData = { recentSubmissions: [] };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
  }, [isAuthenticated, navigate]);

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'progress-excellent';
    if (percentage >= 60) return 'progress-good';
    if (percentage >= 30) return 'progress-fair';
    return 'progress-poor';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'basic': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="progress-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (progressError || error) {
    return (
      <div className="progress-container">
        <div className="error-state">
          <h3>Error Loading Progress</h3>
          <p>{progressError || error}</p>
          <button onClick={refresh} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!overallProgress && !categoryProgress && !topicProgress) {
    return (
      <div className="progress-container">
        <div className="empty-state">
          <h3>No Progress Data</h3>
          <p>Start solving problems to see your progress!</p>
          <button onClick={() => navigate('/dsa/topics')} className="start-btn">
            Start Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h1>Your DSA Progress</h1>
        <p>Track your learning journey and achievements</p>
      </div>

      <div className="overall-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Overall Progress</h3>
            <div className="progress-circle">
              <div className="circle-progress" style={{
                background: `conic-gradient(#9333ea 0deg ${(overallProgress?.percentage || 0) * 3.6}deg, rgba(255,255,255,0.1) ${(overallProgress?.percentage || 0) * 3.6}deg 360deg)`
              }}>
                <span className="progress-text">{overallProgress?.percentage || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Topics Completed</h3>
            <div className="stat-number">
              {overallProgress?.completedTopics || 0}/{overallProgress?.totalTopics || 0}
            </div>
            <div className="stat-label">Topics</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Current Streak</h3>
            <div className="stat-number">{overallProgress?.currentStreak || 0}</div>
            <div className="stat-label">Days</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Longest Streak</h3>
            <div className="stat-number">{overallProgress?.longestStreak || 0}</div>
            <div className="stat-label">Days</div>
          </div>
        </div>
      </div>

      <div className="category-progress">
        <h2>Progress by Category</h2>
        <div className="category-grid">
          {(categoryProgress || []).map((category) => (
            <div key={category._id} className="category-card">
              <div className="category-header">
                <span className="category-icon">{getCategoryIcon(category._id)}</span>
                <h3>{category._id.charAt(0).toUpperCase() + category._id.slice(1)}</h3>
              </div>
              <div className="category-stats">
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${getProgressColor(category.averageProgress)}`}
                    style={{ width: `${category.averageProgress}%` }}
                  ></div>
                </div>
                <div className="category-details">
                  <span>{Math.round(category.averageProgress)}% Complete</span>
                  <span>{category.completedTopics}/{category.totalTopics} Topics</span>
                  <span>{category.totalProblemsSolved} Problems Solved</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="topic-progress">
        <h2>Topic Progress</h2>
        <div className="topics-list">
          {(topicProgress || []).map((topic) => (
            <div key={topic.topic} className="topic-item">
              <div className="topic-info">
                <h4>{topic.topic?.name || 'Unknown Topic'}</h4>
                <div className="topic-meta">
                  <span className="problems-count">
                    {topic.problemsSolved}/{topic.problemsAttempted} solved
                  </span>
                  <span className="time-spent">
                    {Math.floor(topic.timeSpent / 60)}h {topic.timeSpent % 60}m spent
                  </span>
                </div>
              </div>
              <div className="topic-progress-bar">
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${getProgressColor(topic.progressPercentage)}`}
                    style={{ width: `${topic.progressPercentage}%` }}
                  ></div>
                </div>
                <span className="progress-percentage">
                  {Math.round(topic.progressPercentage)}%
                </span>
              </div>
              <button 
                onClick={() => navigate(`/dsa/topics/${topic.topic._id}`)}
                className="continue-btn"
              >
                Continue
              </button>
            </div>
          ))}
        </div>
      </div>

      {progressData.recentSubmissions && progressData.recentSubmissions.length > 0 && (
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {progressData.recentSubmissions.map((submission, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {submission.status === 'accepted' ? '✅' : '❌'}
                </div>
                <div className="activity-content">
                  <h4>{submission.problem?.title}</h4>
                  <div className="activity-meta">
                    <span className="difficulty">{submission.problem?.difficulty}</span>
                    <span className="topic">{submission.problem?.topic?.name}</span>
                    <span className="date">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="activity-status">
                  <span className={`status ${submission.status}`}>
                    {submission.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="progress-actions">
        <button 
          onClick={() => navigate('/dsa/topics')}
          className="action-btn primary"
        >
          Continue Learning
        </button>
        <button 
          onClick={() => navigate('/dsa/problems')}
          className="action-btn secondary"
        >
          Browse Problems
        </button>
        <button 
          onClick={() => navigate('/dsa/daily-challenge')}
          className="action-btn accent"
        >
          Daily Challenge
        </button>
      </div>
    </div>
  );
};

export default DSAProgress;
