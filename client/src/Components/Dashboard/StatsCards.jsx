import React from 'react';

const StatsCards = ({ stats }) => {
  if (!stats) {
    return (
      <div className="stats-cards">
        <div className="stats-loading">Loading statistics...</div>
      </div>
    );
  }

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const cards = [
    {
      title: 'Tests Attempted',
      value: stats.totalTestsAttempted,
      icon: '📝',
      color: 'blue',
      subtitle: `${stats.weeklyStats?.testsThisWeek || 0} this week`
    },
    {
      title: 'Study Time',
      value: formatTime(stats.totalStudyTime),
      icon: '⏱️',
      color: 'green',
      subtitle: `${formatTime(stats.weeklyStats?.studyTimeThisWeek || 0)} this week`
    },
    {
      title: 'DSA Problems Solved',
      value: stats.totalDSAProblemsSolved,
      icon: '💻',
      color: 'purple',
      subtitle: `${stats.weeklyStats?.dsaProblemsThisWeek || 0} this week`
    },
    {
      title: 'Overall Accuracy',
      value: `${Math.round(stats.overallAccuracy)}%`,
      icon: '🎯',
      color: 'orange',
      subtitle: `${Math.round(stats.recentMockTestAccuracy)}% recent`
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: '🔥',
      color: 'red',
      subtitle: `Best: ${stats.longestStreak} days`
    },
    {
      title: 'DSA Success Rate',
      value: `${stats.dsaSuccessRate}%`,
      icon: '✅',
      color: 'teal',
      subtitle: `${stats.totalDSAProblemsAttempted} attempted`
    }
  ];

  return (
    <div className="stats-cards">
      <h3 className="stats-title">📊 Your Statistics</h3>
      <div className="cards-grid">
        {cards.map((card, index) => (
          <div key={index} className={`stat-card ${card.color}`}>
            <div className="card-header">
              <span className="card-icon">{card.icon}</span>
              <h4 className="card-title">{card.title}</h4>
            </div>
            <div className="card-content">
              <div className="card-value">{card.value}</div>
              <div className="card-subtitle">{card.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional Info Cards */}
      <div className="info-cards">
        <div className="info-card">
          <h4>📅 Member Since</h4>
          <p>{formatDate(stats.joinedDate)}</p>
        </div>
        <div className="info-card">
          <h4>🏆 Achievements</h4>
          <p>{stats.totalAchievements} badges earned</p>
        </div>
        <div className="info-card">
          <h4>📈 Active Days</h4>
          <p>{stats.weeklyStats?.activeDaysThisWeek || 0}/7 this week</p>
        </div>
        <div className="info-card">
          <h4>⭐ Average Score</h4>
          <p>{stats.averageTestScore || 0} points</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
