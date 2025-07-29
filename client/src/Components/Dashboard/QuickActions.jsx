import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Take Mock Test',
      description: 'Start a new practice exam',
      icon: '📝',
      color: 'blue',
      action: () => navigate('/MockTests'),
      popular: true
    },
    {
      title: 'Solve DSA Problems',
      description: 'Practice coding challenges',
      icon: '💻',
      color: 'purple',
      action: () => navigate('/DSA'),
      popular: true
    },
    {
      title: 'View Leaderboard',
      description: 'See your ranking',
      icon: '🏆',
      color: 'gold',
      action: () => navigate('/Leaderboard'),
      popular: false
    },
    {
      title: 'NEET Biology',
      description: 'Quick NEET biology test',
      icon: '🧬',
      color: 'green',
      action: () => navigate('/MockTests/neet/biology'),
      popular: true
    },
    {
      title: 'JEE Physics',
      description: 'Quick JEE physics test',
      icon: '⚛️',
      color: 'red',
      action: () => navigate('/MockTests/jee/physics'),
      popular: false
    },
    {
      title: 'Array Problems',
      description: 'Practice array DSA problems',
      icon: '📊',
      color: 'teal',
      action: () => navigate('/DSA?topic=arrays'),
      popular: false
    },
    {
      title: 'Tree Problems',
      description: 'Practice tree DSA problems',
      icon: '🌳',
      color: 'brown',
      action: () => navigate('/DSA?topic=trees'),
      popular: false
    },
    {
      title: 'Graph Problems',
      description: 'Practice graph DSA problems',
      icon: '🕸️',
      color: 'indigo',
      action: () => navigate('/DSA?topic=graphs'),
      popular: false
    }
  ];

  const popularActions = actions.filter(action => action.popular);
  const otherActions = actions.filter(action => !action.popular);

  return (
    <div className="quick-actions">
      <h3>⚡ Quick Actions</h3>
      
      {/* Popular Actions */}
      <div className="actions-section">
        <h4>🔥 Popular</h4>
        <div className="actions-grid popular">
          {popularActions.map((action, index) => (
            <div 
              key={index} 
              className={`action-card ${action.color} popular-action`}
              onClick={action.action}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h5 className="action-title">{action.title}</h5>
                <p className="action-description">{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Actions */}
      <div className="actions-section">
        <h4>📚 More Options</h4>
        <div className="actions-grid">
          {otherActions.map((action, index) => (
            <div 
              key={index} 
              className={`action-card ${action.color}`}
              onClick={action.action}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h5 className="action-title">{action.title}</h5>
                <p className="action-description">{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Goals */}
      <div className="study-goals">
        <h4>🎯 Today's Goals</h4>
        <div className="goals-grid">
          <div className="goal-card">
            <div className="goal-icon">📝</div>
            <div className="goal-content">
              <span className="goal-title">Mock Tests</span>
              <span className="goal-target">Target: 2 tests</span>
            </div>
            <div className="goal-progress">
              <div className="progress-circle">
                <span>0/2</span>
              </div>
            </div>
          </div>
          
          <div className="goal-card">
            <div className="goal-icon">💻</div>
            <div className="goal-content">
              <span className="goal-title">DSA Problems</span>
              <span className="goal-target">Target: 5 problems</span>
            </div>
            <div className="goal-progress">
              <div className="progress-circle">
                <span>0/5</span>
              </div>
            </div>
          </div>
          
          <div className="goal-card">
            <div className="goal-icon">⏱️</div>
            <div className="goal-content">
              <span className="goal-title">Study Time</span>
              <span className="goal-target">Target: 1 hour</span>
            </div>
            <div className="goal-progress">
              <div className="progress-circle">
                <span>0h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <h4>📊 Quick Stats</h4>
        <div className="stats-row">
          <div className="quick-stat">
            <span className="stat-icon">🔥</span>
            <div className="stat-info">
              <span className="stat-value">0</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>
          
          <div className="quick-stat">
            <span className="stat-icon">📈</span>
            <div className="stat-info">
              <span className="stat-value">0%</span>
              <span className="stat-label">Avg Accuracy</span>
            </div>
          </div>
          
          <div className="quick-stat">
            <span className="stat-icon">⭐</span>
            <div className="stat-info">
              <span className="stat-value">0</span>
              <span className="stat-label">Rank</span>
            </div>
          </div>
          
          <div className="quick-stat">
            <span className="stat-icon">🏆</span>
            <div className="stat-info">
              <span className="stat-value">0</span>
              <span className="stat-label">Badges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="motivation-card">
        <div className="motivation-icon">💪</div>
        <div className="motivation-content">
          <p className="motivation-quote">
            "Success is the sum of small efforts repeated day in and day out."
          </p>
          <span className="motivation-author">- Robert Collier</span>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
