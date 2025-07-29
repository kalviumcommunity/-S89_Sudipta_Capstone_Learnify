import React, { useState } from 'react';

const TestHistory = ({ testHistory, onRefresh, limit, showHeader = true }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  if (!testHistory) {
    return (
      <div className="test-history">
        <div className="history-loading">Loading test history...</div>
      </div>
    );
  }

  const { tests, total } = testHistory;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTestTypeIcon = (testType) => {
    return testType === 'mocktest' ? '📝' : '💻';
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'excellent';
    if (accuracy >= 60) return 'good';
    if (accuracy >= 40) return 'average';
    return 'poor';
  };

  const filteredTests = tests?.filter(test => {
    if (filter === 'all') return true;
    return test.testType === filter;
  }) || [];

  const sortedTests = [...filteredTests].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.testDate) - new Date(a.testDate);
      case 'accuracy':
        return b.accuracy - a.accuracy;
      case 'score':
        return b.score - a.score;
      default:
        return 0;
    }
  });

  const displayTests = limit ? sortedTests.slice(0, limit) : sortedTests;

  return (
    <div className="test-history">
      {showHeader && (
        <div className="history-header">
          <h3>📚 Test History</h3>
          <div className="history-controls">
            <div className="filter-controls">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Tests</option>
                <option value="mocktest">Mock Tests</option>
                <option value="dsa">DSA Problems</option>
              </select>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="date">Sort by Date</option>
                <option value="accuracy">Sort by Accuracy</option>
                <option value="score">Sort by Score</option>
              </select>
            </div>
            
            {onRefresh && (
              <button onClick={onRefresh} className="btn btn-refresh">
                🔄 Refresh
              </button>
            )}
          </div>
        </div>
      )}

      <div className="history-stats">
        <div className="stat-item">
          <span className="stat-label">Total Tests:</span>
          <span className="stat-value">{total || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Showing:</span>
          <span className="stat-value">{displayTests.length}</span>
        </div>
      </div>

      <div className="history-list">
        {displayTests.length === 0 ? (
          <div className="no-tests">
            <p>📭 No tests found</p>
            <p>Start taking tests to see your history here!</p>
          </div>
        ) : (
          displayTests.map((test, index) => (
            <div key={test._id || index} className="test-item">
              <div className="test-header">
                <div className="test-type">
                  <span className="type-icon">{getTestTypeIcon(test.testType)}</span>
                  <span className="type-text">
                    {test.testType === 'mocktest' ? 'Mock Test' : 'DSA Problem'}
                  </span>
                </div>
                <div className="test-date">{formatDate(test.testDate)}</div>
              </div>

              <div className="test-details">
                <div className="test-info">
                  <h4 className="test-title">
                    {test.testType === 'mocktest' 
                      ? `${test.exam?.toUpperCase()} - ${test.subject} - ${test.chapter?.replace(/-/g, ' ')}`
                      : `${test.dsaTopic} (${test.dsaDifficulty})`
                    }
                  </h4>
                  
                  <div className="test-metrics">
                    <div className="metric">
                      <span className="metric-label">Questions:</span>
                      <span className="metric-value">{test.totalQuestions}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Correct:</span>
                      <span className="metric-value correct">{test.correctAnswers}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Incorrect:</span>
                      <span className="metric-value incorrect">{test.incorrectAnswers}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Time:</span>
                      <span className="metric-value">{formatTime(test.timeTaken)}</span>
                    </div>
                  </div>
                </div>

                <div className="test-results">
                  <div className={`accuracy-badge ${getAccuracyColor(test.accuracy)}`}>
                    <span className="accuracy-value">{test.accuracy}%</span>
                    <span className="accuracy-label">Accuracy</span>
                  </div>
                  
                  <div className="score-info">
                    <span className="score-value">{test.score}</span>
                    <span className="score-max">/ {test.maxScore}</span>
                  </div>
                </div>
              </div>

              {test.strongTopics && test.strongTopics.length > 0 && (
                <div className="test-topics">
                  <div className="strong-topics">
                    <span className="topics-label">💪 Strong:</span>
                    <div className="topics-list">
                      {test.strongTopics.map((topic, idx) => (
                        <span key={idx} className="topic-tag strong">{topic}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {test.weakTopics && test.weakTopics.length > 0 && (
                <div className="test-topics">
                  <div className="weak-topics">
                    <span className="topics-label">📚 Needs Work:</span>
                    <div className="topics-list">
                      {test.weakTopics.map((topic, idx) => (
                        <span key={idx} className="topic-tag weak">{topic}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="test-actions">
                <button className="btn btn-small btn-secondary">
                  📊 View Details
                </button>
                {test.testType === 'mocktest' && (
                  <button className="btn btn-small btn-primary">
                    🔄 Retake Test
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {!limit && total > displayTests.length && (
        <div className="load-more">
          <button className="btn btn-secondary">
            Load More Tests ({total - displayTests.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default TestHistory;
