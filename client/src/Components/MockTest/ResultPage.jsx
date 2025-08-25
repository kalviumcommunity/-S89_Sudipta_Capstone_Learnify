import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ResultPage.css';

export default function ResultPage() {
  const { examId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, dashboardAPI } = useAuth();
  const [result, setResult] = useState(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResultData = async () => {
      // First try to get result from localStorage
      const savedResult = localStorage.getItem(`result_${examId}_${chapterId}`);
      if (savedResult) {
        setResult(JSON.parse(savedResult));
      }

      // If user is authenticated, fetch historical data
      if (isAuthenticated && user && dashboardAPI) {
        try {
          const response = await dashboardAPI.getTestHistory();
          if (response.success && Array.isArray(response.data)) {
            // Filter results for the same exam and chapter
            const chapterHistory = response.data.filter(test =>
              test.exam === examId &&
              test.chapter === chapterId &&
              test.testType === 'mocktest'
            );
            setHistoricalData(chapterHistory);
          }
        } catch (error) {
          console.error('Failed to fetch historical data:', error);
        }
      }
      setLoading(false);
    };

    loadResultData();
  }, [examId, chapterId, isAuthenticated, user, dashboardAPI]);

  if (!result) {
    return (
      <div className="result-page">
        <div className="no-result">
          <div className="no-result-icon">📊</div>
          <h2>No Result Found</h2>
          <p>Please take the test first to see your results.</p>
          <button onClick={() => navigate('/mocktests')} className="back-home-btn">
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs < 10 ? '0' : ''}${secs} sec`;
  };

  const getPerformanceLevel = (accuracy) => {
    if (accuracy >= 90) return { level: 'Excellent', color: '#22c55e', icon: '🏆' };
    if (accuracy >= 80) return { level: 'Very Good', color: '#3b82f6', icon: '🎯' };
    if (accuracy >= 70) return { level: 'Good', color: '#f59e0b', icon: '👍' };
    if (accuracy >= 60) return { level: 'Average', color: '#f97316', icon: '📈' };
    return { level: 'Needs Improvement', color: '#ef4444', icon: '📚' };
  };

  const getTimeEfficiency = (timeTaken, totalTime = 1200) => {
    const efficiency = ((totalTime - timeTaken) / totalTime) * 100;
    if (efficiency > 50) return { level: 'Excellent', color: '#22c55e' };
    if (efficiency > 25) return { level: 'Good', color: '#3b82f6' };
    if (efficiency > 0) return { level: 'Average', color: '#f59e0b' };
    return { level: 'Slow', color: '#ef4444' };
  };

  const performance = getPerformanceLevel(result.accuracy);
  const timeEfficiency = getTimeEfficiency(result.timeTaken);

  const generateRecommendations = () => {
    const recommendations = [];

    if (result.accuracy < 70) {
      recommendations.push({
        type: 'study',
        title: 'Focus on Concept Building',
        description: 'Review fundamental concepts and practice more questions',
        icon: '📖'
      });
    }

    if (result.timeTaken > 1000) {
      recommendations.push({
        type: 'speed',
        title: 'Improve Speed',
        description: 'Practice time-bound tests to improve solving speed',
        icon: '⚡'
      });
    }

    if (result.accuracy > 80) {
      recommendations.push({
        type: 'advance',
        title: 'Try Advanced Topics',
        description: 'You\'re doing great! Try more challenging questions',
        icon: '🚀'
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  // Calculate progress analytics
  const getProgressAnalytics = () => {
    if (historicalData.length === 0) return null;

    const sortedHistory = [...historicalData].sort((a, b) => new Date(a.testDate) - new Date(b.testDate));
    const firstAttempt = sortedHistory[0];
    const latestAttempt = sortedHistory[sortedHistory.length - 1];

    const accuracyImprovement = latestAttempt.accuracy - firstAttempt.accuracy;
    const timeImprovement = firstAttempt.timeTaken - latestAttempt.timeTaken;
    const averageAccuracy = sortedHistory.reduce((sum, test) => sum + test.accuracy, 0) / sortedHistory.length;

    return {
      totalAttempts: sortedHistory.length,
      accuracyImprovement,
      timeImprovement,
      averageAccuracy,
      bestScore: Math.max(...sortedHistory.map(test => test.accuracy)),
      consistencyScore: 100 - (Math.max(...sortedHistory.map(test => test.accuracy)) - Math.min(...sortedHistory.map(test => test.accuracy)))
    };
  };

  const progressAnalytics = getProgressAnalytics();

  if (loading) {
    return (
      <div className="result-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="result-page">
      {/* Result Header */}
      <div className="result-header">
        <div className="result-title">
          <h1>Test Results</h1>
          <div className="test-info">
            <span className="exam-name">{examId.toUpperCase()}</span>
            <span className="chapter-name">{chapterId.replace(/-/g, ' ')}</span>
          </div>
        </div>

        <div className="performance-badge" style={{ backgroundColor: performance.color }}>
          <span className="performance-icon">{performance.icon}</span>
          <span className="performance-text">{performance.level}</span>
        </div>
      </div>

      {/* Score Overview */}
      <div className="score-overview">
        <div className="score-circle">
          <div className="circle-progress" style={{
            background: `conic-gradient(${performance.color} ${result.accuracy * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
          }}>
            <div className="circle-inner">
              <div className="score-value">{result.accuracy}%</div>
              <div className="score-label">Accuracy</div>
            </div>
          </div>
        </div>

        <div className="score-details">
          <div className="score-item correct">
            <div className="score-number">{result.correct}</div>
            <div className="score-text">Correct</div>
          </div>
          <div className="score-item incorrect">
            <div className="score-number">{result.incorrect}</div>
            <div className="score-text">Incorrect</div>
          </div>
          <div className="score-item total">
            <div className="score-number">{result.total}</div>
            <div className="score-text">Total</div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="detailed-stats">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">⏱️</span>
            <span className="stat-title">Time Analysis</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatTime(result.timeTaken)}</div>
            <div className="stat-subtitle">Time Taken</div>
            <div className="efficiency-bar">
              <div className="efficiency-fill" style={{
                width: `${Math.min(100, (1200 - result.timeTaken) / 1200 * 100)}%`,
                backgroundColor: timeEfficiency.color
              }}></div>
            </div>
            <div className="efficiency-text" style={{ color: timeEfficiency.color }}>
              {timeEfficiency.level} Pace
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">🎯</span>
            <span className="stat-title">Performance</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">{result.correct}/{result.total}</div>
            <div className="stat-subtitle">Questions Solved</div>
            <div className="performance-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Success Rate:</span>
                <span className="breakdown-value" style={{ color: performance.color }}>
                  {result.accuracy}%
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Avg. Time/Question:</span>
                <span className="breakdown-value">
                  {Math.round(result.timeTaken / result.total)}s
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">📊</span>
            <span className="stat-title">Comparison</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">Top 25%</div>
            <div className="stat-subtitle">Your Rank</div>
            <div className="comparison-chart">
              <div className="chart-bar">
                <div className="chart-fill" style={{ width: '75%', backgroundColor: '#22c55e' }}></div>
              </div>
              <div className="chart-labels">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="comparison-text">
              Better than 75% of test takers
            </div>
          </div>
        </div>
      </div>

      {/* Progress Analytics */}
      {progressAnalytics && (
        <div className="progress-analytics">
          <h3>Progress Analytics</h3>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-header">
                <span className="analytics-icon">📈</span>
                <span className="analytics-title">Improvement Trend</span>
              </div>
              <div className="analytics-content">
                <div className="improvement-metric">
                  <span className="metric-label">Accuracy Change:</span>
                  <span className={`metric-value ${progressAnalytics.accuracyImprovement >= 0 ? 'positive' : 'negative'}`}>
                    {progressAnalytics.accuracyImprovement >= 0 ? '+' : ''}{progressAnalytics.accuracyImprovement.toFixed(1)}%
                  </span>
                </div>
                <div className="improvement-metric">
                  <span className="metric-label">Time Efficiency:</span>
                  <span className={`metric-value ${progressAnalytics.timeImprovement >= 0 ? 'positive' : 'negative'}`}>
                    {progressAnalytics.timeImprovement >= 0 ? '+' : ''}{Math.abs(progressAnalytics.timeImprovement)}s saved
                  </span>
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="analytics-header">
                <span className="analytics-icon">🎯</span>
                <span className="analytics-title">Performance Stats</span>
              </div>
              <div className="analytics-content">
                <div className="performance-metric">
                  <span className="metric-label">Total Attempts:</span>
                  <span className="metric-value">{progressAnalytics.totalAttempts}</span>
                </div>
                <div className="performance-metric">
                  <span className="metric-label">Best Score:</span>
                  <span className="metric-value">{progressAnalytics.bestScore.toFixed(1)}%</span>
                </div>
                <div className="performance-metric">
                  <span className="metric-label">Average Score:</span>
                  <span className="metric-value">{progressAnalytics.averageAccuracy.toFixed(1)}%</span>
                </div>
                <div className="performance-metric">
                  <span className="metric-label">Consistency:</span>
                  <span className="metric-value">{progressAnalytics.consistencyScore.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="recommendations">
          <h3>Recommendations for Improvement</h3>
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-card">
                <div className="rec-icon">{rec.icon}</div>
                <div className="rec-content">
                  <h4>{rec.title}</h4>
                  <p>{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Analysis Toggle */}
      <div className="analysis-section">
        <button
          className="toggle-analysis-btn"
          onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
        >
          {showDetailedAnalysis ? 'Hide' : 'Show'} Detailed Analysis
        </button>

        {showDetailedAnalysis && (
          <div className="detailed-analysis">
            <div className="analysis-grid">
              <div className="analysis-card">
                <h4>Question-wise Breakdown</h4>
                <div className="question-breakdown">
                  <div className="breakdown-row">
                    <span>Easy Questions:</span>
                    <span className="breakdown-score">8/10 (80%)</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Medium Questions:</span>
                    <span className="breakdown-score">12/15 (80%)</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Hard Questions:</span>
                    <span className="breakdown-score">3/5 (60%)</span>
                  </div>
                </div>
              </div>

              <div className="analysis-card">
                <h4>Topic-wise Performance</h4>
                <div className="topic-performance">
                  <div className="topic-item">
                    <span className="topic-name">Algebra</span>
                    <div className="topic-bar">
                      <div className="topic-fill" style={{ width: '85%' }}></div>
                    </div>
                    <span className="topic-score">85%</span>
                  </div>
                  <div className="topic-item">
                    <span className="topic-name">Geometry</span>
                    <div className="topic-bar">
                      <div className="topic-fill" style={{ width: '70%' }}></div>
                    </div>
                    <span className="topic-score">70%</span>
                  </div>
                  <div className="topic-item">
                    <span className="topic-name">Calculus</span>
                    <div className="topic-bar">
                      <div className="topic-fill" style={{ width: '90%' }}></div>
                    </div>
                    <span className="topic-score">90%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="result-actions">
        <button
          className="action-btn secondary"
          onClick={() => navigate(`/mocktests/exams/${examId}/${chapterId}`)}
        >
          🔁 Retake Test
        </button>
        <button
          className="action-btn primary"
          onClick={() => navigate('/dashboard')}
        >
          📈 View Dashboard
        </button>
        <button
          className="action-btn secondary"
          onClick={() => navigate('/mocktests/exams')}
        >
          📚 More Tests
        </button>
      </div>
    </div>
  );
}
