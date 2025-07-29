import React, { useState } from 'react';

const ActivityCalendar = ({ calendarData, onRefresh }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  if (!calendarData) {
    return (
      <div className="activity-calendar">
        <div className="calendar-loading">Loading calendar...</div>
      </div>
    );
  }

  const { calendarData: days, summary, monthName } = calendarData;

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getActivityLevel = (day) => {
    if (!day.isActive) return 'none';
    const totalActivity = day.mockTestsAttempted + day.dsaProblemsAttempted;
    if (totalActivity >= 5) return 'high';
    if (totalActivity >= 3) return 'medium';
    if (totalActivity >= 1) return 'low';
    return 'none';
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  const navigateMonth = (direction) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    // Here you would typically call the API to fetch new month data
    // onRefresh && onRefresh(newYear, newMonth + 1);
  };

  return (
    <div className="activity-calendar">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button onClick={() => navigateMonth(-1)} className="nav-btn">
            ← Previous
          </button>
          <h3 className="calendar-title">
            📅 {monthName} {calendarData.year}
          </h3>
          <button onClick={() => navigateMonth(1)} className="nav-btn">
            Next →
          </button>
        </div>
        
        <div className="calendar-summary">
          <div className="summary-item">
            <span className="summary-label">Active Days:</span>
            <span className="summary-value">{summary.totalActiveDays}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Mock Tests:</span>
            <span className="summary-value">{summary.totalMockTests}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">DSA Problems:</span>
            <span className="summary-value">{summary.totalDSAProblems}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Study Time:</span>
            <span className="summary-value">{formatTime(summary.totalStudyTime)}</span>
          </div>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {days.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${getActivityLevel(day)} ${
                selectedDate?.date === day.date ? 'selected' : ''
              }`}
              onClick={() => handleDateClick(day)}
              title={`${day.date}: ${day.mockTestsAttempted} tests, ${day.dsaProblemsAttempted} DSA problems`}
            >
              <span className="day-number">{day.day}</span>
              {day.isActive && (
                <div className="activity-indicators">
                  {day.mockTestsAttempted > 0 && (
                    <span className="indicator test-indicator" title={`${day.mockTestsAttempted} tests`}>
                      📝
                    </span>
                  )}
                  {day.dsaProblemsAttempted > 0 && (
                    <span className="indicator dsa-indicator" title={`${day.dsaProblemsAttempted} DSA problems`}>
                      💻
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="activity-legend">
        <h4>Activity Level:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color none"></div>
            <span>No activity</span>
          </div>
          <div className="legend-item">
            <div className="legend-color low"></div>
            <span>1-2 activities</span>
          </div>
          <div className="legend-item">
            <div className="legend-color medium"></div>
            <span>3-4 activities</span>
          </div>
          <div className="legend-item">
            <div className="legend-color high"></div>
            <span>5+ activities</span>
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="selected-date-details">
          <h4>📅 {new Date(selectedDate.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</h4>
          
          <div className="date-stats">
            <div className="date-stat">
              <span className="stat-icon">📝</span>
              <span className="stat-text">Mock Tests: {selectedDate.mockTestsAttempted}</span>
            </div>
            <div className="date-stat">
              <span className="stat-icon">💻</span>
              <span className="stat-text">DSA Problems: {selectedDate.dsaProblemsAttempted}</span>
            </div>
            <div className="date-stat">
              <span className="stat-icon">✅</span>
              <span className="stat-text">DSA Solved: {selectedDate.dsaProblemsSolved}</span>
            </div>
            <div className="date-stat">
              <span className="stat-icon">⏱️</span>
              <span className="stat-text">Study Time: {formatTime(selectedDate.totalTimeSpent)}</span>
            </div>
          </div>

          {selectedDate.tests && selectedDate.tests.length > 0 && (
            <div className="date-tests">
              <h5>Tests Taken:</h5>
              <div className="test-list">
                {selectedDate.tests.map((test, index) => (
                  <div key={index} className="test-item">
                    <span className="test-type">
                      {test.type === 'mocktest' ? '📝' : '💻'}
                    </span>
                    <span className="test-name">
                      {test.type === 'mocktest' 
                        ? `${test.exam?.toUpperCase()} - ${test.subject}`
                        : `DSA - ${test.dsaTopic}`
                      }
                    </span>
                    <span className="test-score">{test.accuracy}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="goals-status">
            <h5>Daily Goals:</h5>
            <div className="goals-grid">
              <div className={`goal-item ${selectedDate.goalsAchieved.mockTestsGoal ? 'achieved' : ''}`}>
                <span className="goal-icon">
                  {selectedDate.goalsAchieved.mockTestsGoal ? '✅' : '⏳'}
                </span>
                <span>Mock Tests Goal</span>
              </div>
              <div className={`goal-item ${selectedDate.goalsAchieved.dsaProblemsGoal ? 'achieved' : ''}`}>
                <span className="goal-icon">
                  {selectedDate.goalsAchieved.dsaProblemsGoal ? '✅' : '⏳'}
                </span>
                <span>DSA Problems Goal</span>
              </div>
              <div className={`goal-item ${selectedDate.goalsAchieved.studyTimeGoal ? 'achieved' : ''}`}>
                <span className="goal-icon">
                  {selectedDate.goalsAchieved.studyTimeGoal ? '✅' : '⏳'}
                </span>
                <span>Study Time Goal</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityCalendar;
