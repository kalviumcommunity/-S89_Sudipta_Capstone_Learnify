import React, { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import "../Styles/Dashboard.css";

// Dashboard Components
import PerformanceChart from "./Dashboard/PerformanceChart";

export default function Dashboard() {
  const { user, isAuthenticated, dashboardAPI, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const [studyDistributionPeriod, setStudyDistributionPeriod] = useState('Monthly');
  const [studyStreakPeriod, setStudyStreakPeriod] = useState('Weekly');
  const [refreshing, setRefreshing] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);

  // Refs for debouncing and request management
  const debounceTimeoutRef = useRef(null);
  const lastFetchTimeRef = useRef(0);
  const isCurrentlyFetchingRef = useRef(false);
  const retryTimeoutRef = useRef(null);

  const fetchDashboardData = useCallback(async (force = false) => {
    if (!isAuthenticated || !user || !dashboardAPI) {
      return;
    }

    // Prevent duplicate requests
    if (isCurrentlyFetchingRef.current && !force) {
      console.log('Dashboard data fetch already in progress, skipping...');
      return;
    }

    // Debouncing: don't fetch if we just fetched recently (unless forced)
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    const minInterval = 2000; // Minimum 2 seconds between fetches

    if (timeSinceLastFetch < minInterval && !force) {
      console.log('Dashboard data fetched recently, skipping...');
      return;
    }

    try {
      isCurrentlyFetchingRef.current = true;
      lastFetchTimeRef.current = now;
      setLoading(true);
      setError(null);

      // Fetch all dashboard data
      const [stats, testHistory, calendarData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getTestHistory({ limit: 10 }),
        dashboardAPI.getCalendarData()
      ]);

      console.log('Dashboard stats received:', stats);
      console.log('Stats data:', stats.data);
      setDashboardData({
        stats: stats.data, // Extract the actual data from the response
        testHistory,
        calendarData
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response && err.response.status === 429) {
        // Show mock data and a warning
        setDashboardData({
          stats: {
            totalTestsAttempted: 12,
            averageTestScore: 78,
            overallAccuracy: 85,
            totalTimeSpentDSA: 320,
            totalTimeSpentMockTests: 180,
            totalDSAProblemsSolved: 45,
            currentStreak: 5
          },
          testHistory: { tests: [] },
          calendarData: {}
        });
        setError({
          type: 'rate_limit',
          message: 'Too many requests. Showing sample data. Please wait a moment and try again for live data.',
          retryAfter: 30 // seconds
        });

        // Start countdown timer
        setRetryCountdown(30);
        const countdownInterval = setInterval(() => {
          setRetryCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              // Auto-retry when countdown reaches zero
              setTimeout(() => {
                setError(null);
                fetchDashboardData(true);
              }, 1000);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError({
          type: 'general',
          message: `Failed to load dashboard data: ${err.message}`,
          retryAfter: null
        });
      }
    } finally {
      setLoading(false);
      isCurrentlyFetchingRef.current = false;
    }
  }, [isAuthenticated, user, dashboardAPI]);

  // Debounced version for event handlers
  const debouncedFetchDashboardData = useCallback(() => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      fetchDashboardData();
    }, 500); // 500ms debounce
  }, [fetchDashboardData]);

  // Load dashboard data when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user, authLoading, fetchDashboardData]);

  // Refresh dashboard data when component becomes visible (e.g., navigating back from test)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && user && dashboardAPI) {
        debouncedFetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Clear debounce timeout on cleanup
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [isAuthenticated, user, dashboardAPI, debouncedFetchDashboardData]);

  // Listen for dashboard data updates (e.g., after test submission)
  useEffect(() => {
    const handleDashboardUpdate = () => {
      if (isAuthenticated && user && dashboardAPI) {
        console.log('Dashboard update event received, forcing refresh...');
        fetchDashboardData(true); // Force refresh bypassing cache
      }
    };

    window.addEventListener('dashboardDataUpdate', handleDashboardUpdate);

    return () => {
      window.removeEventListener('dashboardDataUpdate', handleDashboardUpdate);
    };
  }, [isAuthenticated, user, dashboardAPI, fetchDashboardData]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Force refresh bypasses debouncing and duplicate request prevention
      await fetchDashboardData(true);
    } finally {
      setRefreshing(false);
    }
  };

  // Show loading state while fetching dashboard data
  if (loading || (!dashboardData && !error && !authLoading)) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && error.type !== 'rate_limit') {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <h2>⚠️ Error</h2>
          <p>{typeof error === 'string' ? error : error.message}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Dashboard</h1>
          <div className="period-controls">
            <select
              className="period-selector"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
              <option value="Daily">Daily</option>
            </select>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-filter" aria-label="Filter dashboard data">Filter</button>
          <button className="btn-export" aria-label="Export dashboard data">Export</button>
          <button
            onClick={handleRefresh}
            className="btn-refresh"
            title="Refresh Dashboard"
            aria-label="Refresh dashboard data"
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Rate Limit Warning Banner */}
      {error && error.type === 'rate_limit' && (
        <div className="rate-limit-banner">
          <div className="banner-content">
            <span className="banner-icon">⚠️</span>
            <div className="banner-text">
              <strong>Rate Limit Reached</strong>
              <p>{error.message}</p>
              {retryCountdown > 0 && (
                <p className="countdown">Auto-retry in {retryCountdown} seconds...</p>
              )}
            </div>
            <button
              onClick={() => fetchDashboardData(true)}
              className="banner-retry-btn"
              disabled={retryCountdown > 0}
            >
              {retryCountdown > 0 ? `Retry (${retryCountdown}s)` : 'Retry Now'}
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Top Stats Row */}
        <div className="top-stats">
          <div className="stat-card primary">
            <div className="stat-header">
              <span className="stat-label">Test Attempts</span>
              <div className="stat-info">i</div>
            </div>
            <div className="stat-value">{(dashboardData?.stats?.totalTestsAttempted || 0) + (dashboardData?.stats?.totalDSAProblemsAttempted || 0)}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Average Score</span>
              <div className="stat-info">i</div>
            </div>
            <div className="stat-value">{dashboardData?.stats?.averageTestScore || 0}%</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Success Rate</span>
              <div className="stat-info">i</div>
            </div>
            <div className="stat-value">{dashboardData?.stats?.overallAccuracy || 0}%</div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Performance Overview */}
            <div className="card performance-overview">
              <div className="card-header">
                <h3>Performance Overview</h3>
                <div className="card-actions">
                  <button className="btn-filter" aria-label="Filter performance data">Filter</button>
                  <button className="btn-sort" aria-label="Sort performance data">Sort</button>
                  <button className="btn-more" aria-label="More options">⋯</button>
                </div>
              </div>
              <div className="performance-stats">
                <div className="performance-value">
                  <span className="currency">Total Score</span>
                  <span className="amount">{dashboardData?.stats?.averageTestScore || 0}</span>
                </div>
                <div className="performance-change">
                  <span className="comparison">Based on recent tests</span>
                </div>
              </div>
              <div className="performance-chart">
                <PerformanceChart testHistory={dashboardData?.testHistory?.tests} />
              </div>
            </div>

            {/* Study Distribution */}
            <div className="card study-distribution">
              <div className="card-header">
                <h3>Study Distribution</h3>
                <select
                  className="period-select"
                  value={studyDistributionPeriod}
                  onChange={(e) => setStudyDistributionPeriod(e.target.value)}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>
              <div className="distribution-stats">
                <div className="distribution-item">
                  <span className="label">DSA Practice</span>
                  <span className="value">{dashboardData?.stats?.totalTimeSpentDSA || 0} min</span>
                </div>
                <div className="distribution-item">
                  <span className="label">Mock Tests</span>
                  <span className="value">{dashboardData?.stats?.totalTimeSpentMockTests || 0} min</span>
                </div>
                <div className="distribution-item">
                  <span className="label">Total Problems</span>
                  <span className="value">{dashboardData?.stats?.totalDSAProblemsSolved || 0}</span>
                </div>
              </div>
              <div className="distribution-chart">
                {/* Pie chart would go here */}
                <div className="pie-chart-placeholder"></div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Study Streak */}
            <div className="card study-streak">
              <div className="card-header">
                <h3>Study Streak</h3>
                <select
                  className="period-select"
                  value={studyStreakPeriod}
                  onChange={(e) => setStudyStreakPeriod(e.target.value)}
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div className="streak-stats">
                <div className="streak-value">{dashboardData?.stats?.currentStreak || 0} days</div>
                <div className="streak-change">
                  <span className="comparison">Current streak</span>
                </div>
              </div>
              <div className="streak-chart">
                {/* Bar chart for weekly activity */}
                <div className="bar-chart">
                  <div className="bar" style={{height: '60%'}}></div>
                  <div className="bar" style={{height: '80%'}}></div>
                  <div className="bar" style={{height: '40%'}}></div>
                  <div className="bar" style={{height: '90%'}}></div>
                  <div className="bar" style={{height: '70%'}}></div>
                  <div className="bar" style={{height: '50%'}}></div>
                  <div className="bar" style={{height: '100%'}}></div>
                </div>
                <div className="chart-labels">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>
              </div>
            </div>

            {/* Recent Integrations */}
            <div className="card recent-integrations">
              <div className="card-header">
                <h3>Recent Activity</h3>
                <button className="btn-see-all" aria-label="See all recent activities">See All</button>
              </div>
              <div className="integrations-list">
                <div className="integration-item">
                  <div className="integration-icon stripe">S</div>
                  <div className="integration-details">
                    <span className="name">Data Structures</span>
                    <span className="type">Practice</span>
                  </div>
                  <div className="integration-stats">
                    <div className="progress-bar">
                      <div className="progress" style={{width: '80%'}}></div>
                    </div>
                    <span className="percentage">80%</span>
                  </div>
                  <span className="score">{dashboardData?.stats?.totalDSAProblemsSolved || 0}</span>
                </div>

                <div className="integration-item">
                  <div className="integration-icon zapier">Z</div>
                  <div className="integration-details">
                    <span className="name">Algorithms</span>
                    <span className="type">Mock Test</span>
                  </div>
                  <div className="integration-stats">
                    <div className="progress-bar">
                      <div className="progress" style={{width: '60%'}}></div>
                    </div>
                    <span className="percentage">60%</span>
                  </div>
                  <span className="score">{dashboardData?.stats?.totalTestsAttempted || 0}</span>
                </div>

                <div className="integration-item">
                  <div className="integration-icon shopify">S</div>
                  <div className="integration-details">
                    <span className="name">System Design</span>
                    <span className="type">Theory</span>
                  </div>
                  <div className="integration-stats">
                    <div className="progress-bar">
                      <div className="progress" style={{width: '20%'}}></div>
                    </div>
                    <span className="percentage">20%</span>
                  </div>
                  <span className="score">{Math.round(dashboardData?.stats?.overallAccuracy || 0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}