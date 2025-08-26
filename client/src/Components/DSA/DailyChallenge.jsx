import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStreak } from '../../hooks/useProgress';
import axios from 'axios';
import './DailyChallenge.css';

const DailyChallenge = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { streak, updateStreak } = useStreak();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participating, setParticipating] = useState(false);

  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  const fetchDailyChallenge = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/dsa/daily-challenge');
      setChallenge(response.data.data.challenge);
    } catch (err) {
      console.error('Error fetching daily challenge:', err);
      // Fallback to mock data when API is not available
      setChallenge(getMockDailyChallenge());
      setError(null); // Don't show error, just use fallback data
    } finally {
      setLoading(false);
    }
  };

  const getMockDailyChallenge = () => {
    return {
      _id: 'daily-challenge-1',
      date: new Date().toISOString().split('T')[0],
      problem: {
        _id: 'two-sum',
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'easy',
        tags: ['array', 'hash-table'],
        topic: {
          name: 'Arrays',
          slug: 'arrays'
        },
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          }
        ]
      },
      difficulty: 'easy',
      bonusPoints: 50,
      totalParticipants: 1247,
      participants: [],
      completions: [
        { user: 'user1', score: 100, rank: 1, completedAt: new Date() },
        { user: 'user2', score: 95, rank: 2, completedAt: new Date() },
        { user: 'user3', score: 90, rank: 3, completedAt: new Date() }
      ],
      userCompleted: false,
      userScore: null,
      userRank: null,
      isActive: true
    };
  };

  const handleParticipate = async () => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    try {
      setParticipating(true);
      await axios.post('/dsa/daily-challenge/participate');
      // Refresh challenge data
      await fetchDailyChallenge();
    } catch (err) {
      console.error('Error participating in challenge:', err);

      // Show more specific error messages
      let errorMessage = 'Failed to join challenge. Please try again.';
      if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'You may already be participating in today\'s challenge.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please sign in to participate in the daily challenge.';
      } else if (err.response?.status === 404) {
        errorMessage = 'No daily challenge is available today.';
      }

      alert(errorMessage);
    } finally {
      setParticipating(false);
    }
  };

  const handleSolveProblem = () => {
    if (challenge?.problem?._id) {
      navigate(`/dsa/problems/${challenge.problem._id}`);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="daily-challenge-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading today's challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="daily-challenge-container">
        <div className="error-state">
          <h3>No Challenge Available</h3>
          <p>No daily challenge is available today.</p>
          <button onClick={() => navigate('/dsa/problems')} className="browse-btn">
            Browse Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-challenge-container">
      <div className="challenge-header">
        <div className="header-content">
          <h1>🎯 Daily Challenge</h1>
          <p>Solve today's problem and compete with other developers!</p>
          <div className="challenge-date">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      <div className="challenge-content">
        <div className="challenge-card">
          <div className="challenge-problem">
            <div className="problem-header">
              <h2>{challenge.problem.title}</h2>
              <div className="problem-badges">
                <span className={`difficulty-badge ${getDifficultyColor(challenge.difficulty || challenge.problem.difficulty)}`}>
                  {(challenge.difficulty || challenge.problem.difficulty)?.charAt(0).toUpperCase() + (challenge.difficulty || challenge.problem.difficulty)?.slice(1)}
                </span>
                <span className="topic-badge">
                  {challenge.problem.topic?.name || 'General'}
                </span>
                <span className="bonus-badge">
                  +{challenge.bonusPoints || 50} bonus points
                </span>
              </div>
            </div>

            <div className="problem-description">
              <p>{challenge.problem.description}</p>
            </div>

            <div className="challenge-stats">
              <div className="stat-item">
                <span className="stat-number">{challenge.totalParticipants}</span>
                <span className="stat-label">Participants</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{challenge.completions?.length || 0}</span>
                <span className="stat-label">Solved</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {challenge.totalParticipants > 0 
                    ? Math.round(((challenge.completions?.length || 0) / challenge.totalParticipants) * 100)
                    : 0}%
                </span>
                <span className="stat-label">Success Rate</span>
              </div>
            </div>

            <div className="challenge-actions">
              {!isAuthenticated ? (
                <div className="auth-prompt">
                  <p>Sign in to participate in the daily challenge!</p>
                  <button onClick={() => navigate('/signin')} className="signin-btn">
                    Sign In
                  </button>
                </div>
              ) : challenge.userCompleted ? (
                <div className="completed-state">
                  <div className="completion-badge">
                    ✅ Challenge Completed!
                  </div>
                  <div className="user-stats">
                    <span>Your Score: {challenge.userScore}</span>
                    {challenge.userRank && (
                      <span>Rank: #{challenge.userRank}</span>
                    )}
                  </div>
                  <button onClick={handleSolveProblem} className="view-solution-btn">
                    View Problem
                  </button>
                </div>
              ) : (
                <div className="participation-actions">
                  {challenge.participants?.includes(isAuthenticated?.user?._id) ? (
                    <button onClick={handleSolveProblem} className="solve-btn">
                      Solve Problem
                    </button>
                  ) : (
                    <button 
                      onClick={handleParticipate}
                      disabled={participating}
                      className="participate-btn"
                    >
                      {participating ? 'Joining...' : 'Join Challenge'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {challenge.completions && challenge.completions.length > 0 && (
            <div className="leaderboard-preview">
              <h3>🏆 Today's Leaders</h3>
              <div className="leaders-list">
                {challenge.completions.slice(0, 5).map((completion, index) => (
                  <div key={index} className="leader-item">
                    <span className="rank">#{completion.rank || index + 1}</span>
                    <span className="username">User {completion.user}</span>
                    <span className="score">{completion.score} pts</span>
                    <span className="time">
                      {new Date(completion.completedAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/leaderboard')}
                className="view-full-leaderboard"
              >
                View Full Leaderboard
              </button>
            </div>
          )}
        </div>

        <div className="challenge-sidebar">
          <div className="tips-card">
            <h3>💡 Daily Challenge Tips</h3>
            <ul>
              <li>Read the problem statement carefully</li>
              <li>Think about edge cases</li>
              <li>Start with a brute force solution</li>
              <li>Optimize for time and space complexity</li>
              <li>Test your solution thoroughly</li>
            </ul>
          </div>

          <div className="streak-card">
            <h3>🔥 Your Streak</h3>
            <div className="streak-info">
              <div className="streak-number">{streak}</div>
              <div className="streak-label">Days</div>
            </div>
            <p>Solve daily challenges to build your streak!</p>
          </div>

          <div className="navigation-card">
            <h3>🚀 Quick Actions</h3>
            <div className="quick-actions">
              <button 
                onClick={() => navigate('/dsa/problems')}
                className="action-btn"
              >
                Browse Problems
              </button>
              <button 
                onClick={() => navigate('/dsa/topics')}
                className="action-btn"
              >
                Learn Topics
              </button>
              <button 
                onClick={() => navigate('/dsa/progress')}
                className="action-btn"
              >
                View Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;
