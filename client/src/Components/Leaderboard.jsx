import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../Styles/Leaderboard.css";

export default function Leaderboard() {
  const { user, isAuthenticated } = useAuth();

  // State management
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    exams: [],
    subjects: [],
    chapters: [],
    timeframes: []
  });

  // Filter states
  const [filters, setFilters] = useState({
    exam: 'all',
    subject: 'all',
    chapter: 'all',
    timeframe: 'all'
  });

  // UI states
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  });

  // Auto-refresh interval
  const [autoRefresh, setAutoRefresh] = useState(true);
  const REFRESH_INTERVAL = 30000; // 30 seconds

  // Fetch filter options on component mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch leaderboard data when filters change
  useEffect(() => {
    fetchLeaderboardData();
    if (isAuthenticated) {
      fetchUserPosition();
    }
    fetchTopPerformers();
  }, [filters, sortBy, sortOrder, currentPage]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!refreshing) {
        refreshLeaderboard();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshing, filters, sortBy, sortOrder, currentPage]);

  // API calls
  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('/leaderboard/filters');
      if (response.data.success) {
        setFilterOptions(response.data.filters);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        ...filters,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 20
      });

      const response = await axios.get(`/leaderboard?${params.toString()}`);

      if (response.data.success) {
        setLeaderboardData(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosition = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/leaderboard/user-position?${params.toString()}`);

      if (response.data.success) {
        setUserPosition(response.data.userPosition);
      }
    } catch (error) {
      console.error('Error fetching user position:', error);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      const params = new URLSearchParams({
        exam: filters.exam,
        timeframe: filters.timeframe
      });

      const response = await axios.get(`/leaderboard/top-performers?${params.toString()}`);

      if (response.data.success) {
        setTopPerformers(response.data.topPerformers);
      }
    } catch (error) {
      console.error('Error fetching top performers:', error);
    }
  };

  const refreshLeaderboard = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchLeaderboardData(),
      isAuthenticated ? fetchUserPosition() : Promise.resolve(),
      fetchTopPerformers()
    ]);
    setRefreshing(false);
  };

  // Event handlers
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Utility functions
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatAccuracy = (accuracy) => {
    return `${accuracy.toFixed(1)}%`;
  };

  const getBadgeColor = (badge) => {
    switch (badge.color) {
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      case 'bronze': return '#CD7F32';
      default: return '#9333ea';
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading && !refreshing) {
    return (
      <div className="leaderboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      {/* Header Section */}
      <div className="leaderboard-header">
        <div className="header-content">
          <h1 className="leaderboard-title">🏆 Leaderboard</h1>
          <p className="leaderboard-subtitle">See how you rank against other learners!</p>
        </div>

        <div className="header-controls">
          <button
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            onClick={refreshLeaderboard}
            disabled={refreshing}
          >
            {refreshing ? '🔄' : '↻'} Refresh
          </button>

          <button
            className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '⏸️' : '▶️'} Auto-refresh
          </button>
        </div>
      </div>

      {/* Top Performers Section */}
      {topPerformers.length > 0 && (
        <div className="top-performers-section">
          <h2 className="section-title">Top Performers</h2>
          <div className="top-performers-grid">
            {topPerformers.map((performer, index) => (
              <div key={performer._id} className={`top-performer-card rank-${index + 1}`}>
                <div className="performer-rank">
                  <span className="rank-badge">{performer.rankBadge}</span>
                  <span className="rank-number">#{performer.rank}</span>
                </div>
                <div className="performer-info">
                  <h3 className="performer-name">{performer.userName}</h3>
                  <div className="performer-stats">
                    <div className="stat">
                      <span className="stat-label">Score</span>
                      <span className="stat-value">{performer.totalScore}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Accuracy</span>
                      <span className="stat-value">{formatAccuracy(performer.overallAccuracy)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Tests</span>
                      <span className="stat-value">{performer.testCount}</span>
                    </div>
                  </div>
                  <div className="performer-badges">
                    {performer.badges.map((badge, badgeIndex) => (
                      <span
                        key={badgeIndex}
                        className="badge"
                        style={{ backgroundColor: getBadgeColor(badge) }}
                        title={badge.name}
                      >
                        {badge.icon}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Position Section */}
      {isAuthenticated && userPosition && (
        <div className="user-position-section">
          <div className="user-position-card">
            <div className="position-header">
              <h3>Your Current Rank</h3>
              <span className="user-rank">{getRankBadge(userPosition.rank)}</span>
            </div>
            <div className="position-stats">
              <div className="position-stat">
                <span className="stat-label">Rank</span>
                <span className="stat-value">#{userPosition.rank}</span>
              </div>
              <div className="position-stat">
                <span className="stat-label">Total Score</span>
                <span className="stat-value">{userPosition.totalScore}</span>
              </div>
              <div className="position-stat">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">{formatAccuracy(userPosition.overallAccuracy)}</span>
              </div>
              <div className="position-stat">
                <span className="stat-label">Tests Taken</span>
                <span className="stat-value">{userPosition.testCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="filters-section">
        <h3 className="filters-title">Filter & Sort</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="exam-filter">Exam</label>
            <select
              id="exam-filter"
              value={filters.exam}
              onChange={(e) => handleFilterChange('exam', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Exams</option>
              {filterOptions.exams.map(exam => (
                <option key={exam} value={exam}>{exam.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="subject-filter">Subject</label>
            <select
              id="subject-filter"
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Subjects</option>
              {filterOptions.subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="chapter-filter">Chapter</label>
            <select
              id="chapter-filter"
              value={filters.chapter}
              onChange={(e) => handleFilterChange('chapter', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Chapters</option>
              {filterOptions.chapters.map(chapter => (
                <option key={chapter} value={chapter}>{chapter}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="timeframe-filter">Timeframe</label>
            <select
              id="timeframe-filter"
              value={filters.timeframe}
              onChange={(e) => handleFilterChange('timeframe', e.target.value)}
              className="filter-select"
            >
              {filterOptions.timeframes.map(timeframe => (
                <option key={timeframe.value} value={timeframe.value}>
                  {timeframe.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Section */}
      <div className="leaderboard-table-section">
        <div className="table-header">
          <h3 className="table-title">Rankings</h3>
          <div className="sort-controls">
            <button
              className={`sort-btn ${sortBy === 'score' ? 'active' : ''}`}
              onClick={() => handleSortChange('score')}
            >
              Score {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              className={`sort-btn ${sortBy === 'accuracy' ? 'active' : ''}`}
              onClick={() => handleSortChange('accuracy')}
            >
              Accuracy {sortBy === 'accuracy' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              className={`sort-btn ${sortBy === 'time' ? 'active' : ''}`}
              onClick={() => handleSortChange('time')}
            >
              Speed {sortBy === 'time' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchLeaderboardData} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {!error && (
          <>
            {/* Desktop Table View */}
            <div className="leaderboard-table desktop-view">
              <div className="table-header-row">
                <div className="table-cell rank-cell">Rank</div>
                <div className="table-cell name-cell">Name</div>
                <div className="table-cell score-cell">Score</div>
                <div className="table-cell accuracy-cell">Accuracy</div>
                <div className="table-cell time-cell">Avg Time</div>
                <div className="table-cell tests-cell">Tests</div>
                <div className="table-cell badges-cell">Badges</div>
              </div>

              {leaderboardData.map((entry, index) => (
                <div
                  key={entry._id}
                  className={`table-row ${isAuthenticated && user?._id === entry._id ? 'current-user' : ''}`}
                >
                  <div className="table-cell rank-cell">
                    <span className="rank-display">{getRankBadge(entry.rank)}</span>
                  </div>
                  <div className="table-cell name-cell">
                    <span className="user-name">{entry.userName}</span>
                  </div>
                  <div className="table-cell score-cell">
                    <span className="score-display">{entry.totalScore}</span>
                    <span className="max-score">/{entry.totalMaxScore}</span>
                  </div>
                  <div className="table-cell accuracy-cell">
                    <span className="accuracy-display">{formatAccuracy(entry.overallAccuracy)}</span>
                  </div>
                  <div className="table-cell time-cell">
                    <span className="time-display">{formatTime(entry.averageTimePerTest)}</span>
                  </div>
                  <div className="table-cell tests-cell">
                    <span className="tests-display">{entry.testCount}</span>
                  </div>
                  <div className="table-cell badges-cell">
                    <div className="badges-container">
                      {/* Add badges based on performance */}
                      {entry.overallAccuracy >= 95 && (
                        <span className="badge accuracy-master" title="Accuracy Master">🔥</span>
                      )}
                      {entry.averageTimePerTest <= 900 && (
                        <span className="badge speedster" title="Speedster">⚡</span>
                      )}
                      {entry.testCount >= 25 && (
                        <span className="badge dedicated" title="Dedicated Learner">📚</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Card View */}
            <div className="leaderboard-cards mobile-view">
              {leaderboardData.map((entry, index) => (
                <div
                  key={entry._id}
                  className={`leaderboard-card ${isAuthenticated && user?._id === entry._id ? 'current-user' : ''}`}
                >
                  <div className="card-header">
                    <div className="rank-section">
                      <span className="rank-display">{getRankBadge(entry.rank)}</span>
                    </div>
                    <div className="name-section">
                      <h4 className="user-name">{entry.userName}</h4>
                    </div>
                    <div className="badges-section">
                      {entry.overallAccuracy >= 95 && (
                        <span className="badge accuracy-master" title="Accuracy Master">🔥</span>
                      )}
                      {entry.averageTimePerTest <= 900 && (
                        <span className="badge speedster" title="Speedster">⚡</span>
                      )}
                      {entry.testCount >= 25 && (
                        <span className="badge dedicated" title="Dedicated Learner">📚</span>
                      )}
                    </div>
                  </div>
                  <div className="card-stats">
                    <div className="stat-item">
                      <span className="stat-label">Score</span>
                      <span className="stat-value">{entry.totalScore}/{entry.totalMaxScore}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Accuracy</span>
                      <span className="stat-value">{formatAccuracy(entry.overallAccuracy)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Avg Time</span>
                      <span className="stat-value">{formatTime(entry.averageTimePerTest)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tests</span>
                      <span className="stat-value">{entry.testCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination-section">
                <div className="pagination-info">
                  <span>
                    Showing {((pagination.currentPage - 1) * 20) + 1} - {Math.min(pagination.currentPage * 20, pagination.totalUsers)} of {pagination.totalUsers} users
                  </span>
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    ← Previous
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                      if (pageNum <= pagination.totalPages) {
                        return (
                          <button
                            key={pageNum}
                            className={`page-btn ${pageNum === pagination.currentPage ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Empty State */}
      {!loading && !error && leaderboardData.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No data available</h3>
          <p>No test results found for the selected filters.</p>
          <button onClick={() => setFilters({
            exam: 'all',
            subject: 'all',
            chapter: 'all',
            timeframe: 'all'
          })} className="reset-filters-btn">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}