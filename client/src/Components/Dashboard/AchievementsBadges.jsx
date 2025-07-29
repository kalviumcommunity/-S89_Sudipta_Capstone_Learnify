
import React, { useState } from 'react';

const AchievementsBadges = ({ achievements = [], stats }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Define all possible achievements with their criteria
  const allAchievements = [
    {
      id: 'first_test',
      name: 'First Steps',
      description: 'Complete your first test',
      icon: '🎯',
      category: 'milestone',
      criteria: { testsAttempted: 1 },
      rarity: 'common'
    },
    {
      id: 'test_master_10',
      name: 'Test Master',
      description: 'Complete 10 tests',
      icon: '📚',
      category: 'milestone',
      criteria: { testsAttempted: 10 },
      rarity: 'common'
    },
    {
      id: 'test_master_50',
      name: 'Test Veteran',
      description: 'Complete 50 tests',
      icon: '🏆',
      category: 'milestone',
      criteria: { testsAttempted: 50 },
      rarity: 'rare'
    },
    {
      id: 'test_master_100',
      name: 'Test Legend',
      description: 'Complete 100 tests',
      icon: '👑',
      category: 'milestone',
      criteria: { testsAttempted: 100 },
      rarity: 'legendary'
    },
    {
      id: 'accuracy_80',
      name: 'Sharp Shooter',
      description: 'Achieve 80%+ accuracy',
      icon: '🎯',
      category: 'performance',
      criteria: { accuracy: 80 },
      rarity: 'uncommon'
    },
    {
      id: 'accuracy_90',
      name: 'Precision Master',
      description: 'Achieve 90%+ accuracy',
      icon: '🏹',
      category: 'performance',
      criteria: { accuracy: 90 },
      rarity: 'rare'
    },
    {
      id: 'accuracy_95',
      name: 'Perfect Aim',
      description: 'Achieve 95%+ accuracy',
      icon: '💎',
      category: 'performance',
      criteria: { accuracy: 95 },
      rarity: 'legendary'
    },
    {
      id: 'dsa_beginner',
      name: 'Code Warrior',
      description: 'Solve 10 DSA problems',
      icon: '💻',
      category: 'dsa',
      criteria: { dsaProblemsSolved: 10 },
      rarity: 'common'
    },
    {
      id: 'dsa_intermediate',
      name: 'Algorithm Expert',
      description: 'Solve 50 DSA problems',
      icon: '🧠',
      category: 'dsa',
      criteria: { dsaProblemsSolved: 50 },
      rarity: 'uncommon'
    },
    {
      id: 'dsa_advanced',
      name: 'Data Structure Master',
      description: 'Solve 100 DSA problems',
      icon: '🚀',
      category: 'dsa',
      criteria: { dsaProblemsSolved: 100 },
      rarity: 'rare'
    },
    {
      id: 'dsa_legend',
      name: 'Coding Legend',
      description: 'Solve 500 DSA problems',
      icon: '⭐',
      category: 'dsa',
      criteria: { dsaProblemsSolved: 500 },
      rarity: 'legendary'
    },
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      category: 'streak',
      criteria: { streak: 7 },
      rarity: 'uncommon'
    },
    {
      id: 'streak_30',
      name: 'Month Master',
      description: 'Maintain a 30-day streak',
      icon: '🌟',
      category: 'streak',
      criteria: { streak: 30 },
      rarity: 'rare'
    },
    {
      id: 'streak_100',
      name: 'Consistency King',
      description: 'Maintain a 100-day streak',
      icon: '👑',
      category: 'streak',
      criteria: { streak: 100 },
      rarity: 'legendary'
    },
    {
      id: 'time_saver',
      name: 'Speed Demon',
      description: 'Complete a test in under 10 minutes',
      icon: '⚡',
      category: 'performance',
      criteria: { fastCompletion: true },
      rarity: 'uncommon'
    },
    {
      id: 'study_time_10h',
      name: 'Dedicated Learner',
      description: 'Study for 10+ hours total',
      icon: '📖',
      category: 'time',
      criteria: { studyTime: 600 }, // 10 hours in minutes
      rarity: 'common'
    },
    {
      id: 'study_time_50h',
      name: 'Study Master',
      description: 'Study for 50+ hours total',
      icon: '🎓',
      category: 'time',
      criteria: { studyTime: 3000 }, // 50 hours in minutes
      rarity: 'uncommon'
    },
    {
      id: 'study_time_100h',
      name: 'Knowledge Seeker',
      description: 'Study for 100+ hours total',
      icon: '🧙‍♂️',
      category: 'time',
      criteria: { studyTime: 6000 }, // 100 hours in minutes
      rarity: 'rare'
    }
  ];

  // Check which achievements the user has earned
  const checkAchievement = (achievement) => {
    if (!stats) return false;
    
    const criteria = achievement.criteria;
    
    if (criteria.testsAttempted && stats.totalTestsAttempted >= criteria.testsAttempted) return true;
    if (criteria.accuracy && stats.overallAccuracy >= criteria.accuracy) return true;
    if (criteria.dsaProblemsSolved && stats.totalDSAProblemsSolved >= criteria.dsaProblemsSolved) return true;
    if (criteria.streak && stats.longestStreak >= criteria.streak) return true;
    if (criteria.studyTime && stats.totalStudyTime >= criteria.studyTime) return true;
    
    return false;
  };

  const earnedAchievements = allAchievements.filter(achievement => 
    checkAchievement(achievement) || 
    achievements.some(earned => earned.badgeName === achievement.name)
  );

  const unearnedAchievements = allAchievements.filter(achievement => 
    !checkAchievement(achievement) && 
    !achievements.some(earned => earned.badgeName === achievement.name)
  );

  const categories = ['all', 'milestone', 'performance', 'dsa', 'streak', 'time'];

  const filterAchievements = (achievementList) => {
    if (selectedCategory === 'all') return achievementList;
    return achievementList.filter(achievement => achievement.category === selectedCategory);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#4CAF50';
      case 'uncommon': return '#2196F3';
      case 'rare': return '#9C27B0';
      case 'legendary': return '#FF9800';
      default: return '#757575';
    }
  };

  const getProgressToNextAchievement = (achievement) => {
    if (!stats) return 0;
    
    const criteria = achievement.criteria;
    
    if (criteria.testsAttempted) {
      return Math.min((stats.totalTestsAttempted / criteria.testsAttempted) * 100, 100);
    }
    if (criteria.accuracy) {
      return Math.min((stats.overallAccuracy / criteria.accuracy) * 100, 100);
    }
    if (criteria.dsaProblemsSolved) {
      return Math.min((stats.totalDSAProblemsSolved / criteria.dsaProblemsSolved) * 100, 100);
    }
    if (criteria.streak) {
      return Math.min((stats.longestStreak / criteria.streak) * 100, 100);
    }
    if (criteria.studyTime) {
      return Math.min((stats.totalStudyTime / criteria.studyTime) * 100, 100);
    }
    
    return 0;
  };

  return (
    <div className="achievements-badges">
      <div className="achievements-header">
        <h3>🏆 Achievements & Badges</h3>
        <div className="achievements-stats">
          <div className="stat-item">
            <span className="stat-label">Earned:</span>
            <span className="stat-value">{earnedAchievements.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{allAchievements.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Progress:</span>
            <span className="stat-value">
              {Math.round((earnedAchievements.length / allAchievements.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="achievements-sections">
        {/* Earned Achievements */}
        <div className="achievements-section">
          <h4>✅ Earned Achievements ({filterAchievements(earnedAchievements).length})</h4>
          <div className="achievements-grid">
            {filterAchievements(earnedAchievements).map((achievement, index) => (
              <div key={achievement.id} className={`achievement-card earned ${achievement.rarity}`}>
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <h5 className="achievement-name">{achievement.name}</h5>
                  <p className="achievement-description">{achievement.description}</p>
                  <div className="achievement-meta">
                    <span className={`rarity-badge ${achievement.rarity}`}>
                      {achievement.rarity}
                    </span>
                    <span className="earned-date">
                      {achievements.find(a => a.badgeName === achievement.name)?.earnedDate 
                        ? new Date(achievements.find(a => a.badgeName === achievement.name).earnedDate).toLocaleDateString()
                        : 'Recently earned'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unearned Achievements */}
        <div className="achievements-section">
          <h4>🎯 Available Achievements ({filterAchievements(unearnedAchievements).length})</h4>
          <div className="achievements-grid">
            {filterAchievements(unearnedAchievements).map((achievement, index) => {
              const progress = getProgressToNextAchievement(achievement);
              return (
                <div key={achievement.id} className={`achievement-card unearned ${achievement.rarity}`}>
                  <div className="achievement-icon locked">{achievement.icon}</div>
                  <div className="achievement-content">
                    <h5 className="achievement-name">{achievement.name}</h5>
                    <p className="achievement-description">{achievement.description}</p>
                    <div className="achievement-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: getRarityColor(achievement.rarity)
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">{Math.round(progress)}%</span>
                    </div>
                    <div className="achievement-meta">
                      <span className={`rarity-badge ${achievement.rarity}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievement Summary */}
      <div className="achievements-summary">
        <h4>📊 Achievement Summary</h4>
        <div className="summary-grid">
          {categories.slice(1).map(category => {
            const categoryAchievements = allAchievements.filter(a => a.category === category);
            const earnedInCategory = earnedAchievements.filter(a => a.category === category);
            return (
              <div key={category} className="summary-item">
                <h5>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                <div className="summary-progress">
                  <span>{earnedInCategory.length}/{categoryAchievements.length}</span>
                  <div className="mini-progress-bar">
                    <div 
                      className="mini-progress-fill"
                      style={{ 
                        width: `${(earnedInCategory.length / categoryAchievements.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsBadges;
