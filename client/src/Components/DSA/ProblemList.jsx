import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './ProblemList.css';

const ProblemList = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [problems, setProblems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    topic: searchParams.get('topic') || '',
    difficulty: searchParams.get('difficulty') || '',
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || ''
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [filters]);

  const fetchTopics = async () => {
    try {
      const response = await axios.get('/dsa/topics');
      setTopics(response.data.data.topics);
    } catch (err) {
      console.error('Error fetching topics:', err);
      // Fallback to mock topics
      setTopics([
        { _id: 'arrays', name: 'Arrays' },
        { _id: 'linked-lists', name: 'Linked Lists' },
        { _id: 'stacks-queues', name: 'Stacks & Queues' },
        { _id: 'trees', name: 'Trees' },
        { _id: 'graphs', name: 'Graphs' },
        { _id: 'dynamic-programming', name: 'Dynamic Programming' }
      ]);
    }
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: 1,
        limit: 20
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await axios.get('/dsa/problems', { params });
      setProblems(response.data.data.problems);
      setPagination(response.data.data.pagination);
    } catch (err) {
      console.error('Error fetching problems:', err);
      // Fallback to mock data when API is not available
      setProblems(getMockProblems());
      setPagination({ currentPage: 1, totalPages: 1, totalProblems: 10 });
      setError(null); // Don't show error, just use fallback data
    } finally {
      setLoading(false);
    }
  };

  const getMockProblems = () => {
    return [
      {
        _id: 'two-sum',
        slug: 'two-sum',
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'easy',
        topic: { name: 'Arrays' },
        tags: ['array', 'hash-table'],
        totalAttempts: 1500,
        totalSolved: 1200,
        userSubmission: null
      },
      {
        _id: 'add-two-numbers',
        slug: 'add-two-numbers',
        title: 'Add Two Numbers',
        description: 'You are given two non-empty linked lists representing two non-negative integers.',
        difficulty: 'medium',
        topic: { name: 'Linked Lists' },
        tags: ['linked-list', 'math'],
        totalAttempts: 800,
        totalSolved: 600,
        userSubmission: null
      },
      {
        _id: 'longest-substring',
        slug: 'longest-substring',
        title: 'Longest Substring Without Repeating Characters',
        description: 'Given a string s, find the length of the longest substring without repeating characters.',
        difficulty: 'medium',
        topic: { name: 'Strings' },
        tags: ['string', 'sliding-window'],
        totalAttempts: 1200,
        totalSolved: 800,
        userSubmission: null
      },
      {
        _id: 'median-sorted-arrays',
        slug: 'median-sorted-arrays',
        title: 'Median of Two Sorted Arrays',
        description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median.',
        difficulty: 'hard',
        topic: { name: 'Arrays' },
        tags: ['array', 'binary-search'],
        totalAttempts: 500,
        totalSolved: 200,
        userSubmission: null
      },
      {
        _id: 'valid-parentheses',
        slug: 'valid-parentheses',
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        difficulty: 'easy',
        topic: { name: 'Stacks' },
        tags: ['string', 'stack'],
        totalAttempts: 900,
        totalSolved: 750,
        userSubmission: null
      }
    ];
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v);
    });
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    setFilters({
      topic: '',
      difficulty: '',
      status: '',
      search: ''
    });
    setSearchParams({});
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return '✅';
      case 'wrong_answer': return '❌';
      case 'time_limit_exceeded': return '⏰';
      case 'runtime_error': return '💥';
      case 'compilation_error': return '🔧';
      default: return '⭕';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'status-accepted';
      case 'not_attempted': return 'status-not-attempted';
      default: return 'status-attempted';
    }
  };

  const handleProblemClick = (problemSlug) => {
    navigate(`/dsa/problems/${problemSlug}`);
  };

  if (loading && problems.length === 0) {
    return (
      <div className="problem-list-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="problem-list-container">
      <div className="problem-list-header">
        <div className="header-content">
          <h1>DSA Problems</h1>
          <p>Practice and master data structures & algorithms</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search problems..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={filters.topic}
            onChange={(e) => handleFilterChange('topic', e.target.value)}
            className="filter-select"
          >
            <option value="">All Topics</option>
            {topics.map(topic => (
              <option key={topic._id} value={topic._id}>
                {topic.name}
              </option>
            ))}
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="filter-select"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {isAuthenticated && (
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="solved">Solved</option>
              <option value="attempted">Attempted</option>
              <option value="not_attempted">Not Attempted</option>
            </select>
          )}

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchProblems} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      <div className="problems-table">
        <div className="table-header">
          <div className="header-cell status-col">Status</div>
          <div className="header-cell title-col">Problem</div>
          <div className="header-cell difficulty-col">Difficulty</div>
          <div className="header-cell topic-col">Topic</div>
          <div className="header-cell success-rate-col">Success Rate</div>
        </div>

        <div className="table-body">
          {problems.map((problem) => (
            <div 
              key={problem._id} 
              className="table-row"
              onClick={() => handleProblemClick(problem.slug)}
            >
              <div className="table-cell status-col">
                <span className={`status-indicator ${getStatusColor(problem.userStatus)}`}>
                  {getStatusIcon(problem.userStatus)}
                </span>
              </div>
              
              <div className="table-cell title-col">
                <div className="problem-title">
                  <h3>{problem.title}</h3>
                  <p className="problem-description">{problem.description}</p>
                  {problem.tags && problem.tags.length > 0 && (
                    <div className="problem-tags">
                      {problem.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="table-cell difficulty-col">
                <span className={`difficulty-badge ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>
              
              <div className="table-cell topic-col">
                <span className="topic-name">{problem.topic?.name}</span>
              </div>
              
              <div className="table-cell success-rate-col">
                <div className="success-rate">
                  <span className="rate-text">{Math.round(problem.successRate)}%</span>
                  <div className="rate-bar">
                    <div 
                      className="rate-fill"
                      style={{ width: `${problem.successRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {problems.length === 0 && !loading && (
        <div className="empty-state">
          <h3>No problems found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={!pagination.hasPrev}
            onClick={() => {/* Handle previous page */}}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button 
            disabled={!pagination.hasNext}
            onClick={() => {/* Handle next page */}}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      <div className="quick-actions">
        <button 
          onClick={() => navigate('/dsa/daily-challenge')}
          className="action-btn daily-challenge-btn"
        >
          🎯 Daily Challenge
        </button>
        <button 
          onClick={() => navigate('/dsa/topics')}
          className="action-btn topics-btn"
        >
          📚 Browse Topics
        </button>
        {isAuthenticated && (
          <button 
            onClick={() => navigate('/dsa/progress')}
            className="action-btn progress-btn"
          >
            📊 View Progress
          </button>
        )}
      </div>
    </div>
  );
};

export default ProblemList;
