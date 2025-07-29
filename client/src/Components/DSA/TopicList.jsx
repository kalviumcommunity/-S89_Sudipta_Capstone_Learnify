import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOverallProgress } from '../../hooks/useProgress';
import axios from 'axios';
import './TopicList.css';

const TopicList = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { topicProgress, loading: progressLoading } = useOverallProgress();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTopics();
  }, [selectedCategory, topicProgress, isAuthenticated]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await axios.get('/api/dsa/topics', { params });
      let fetchedTopics = response.data.data.topics;

      // Merge with progress data if available
      if (topicProgress && isAuthenticated) {
        fetchedTopics = fetchedTopics.map(topic => {
          const progress = topicProgress.find(tp =>
            (tp.topic._id || tp.topic) === topic._id ||
            (tp.topic.slug || tp.topic) === topic.slug
          );

          return {
            ...topic,
            userProgress: progress ? {
              status: progress.status || 'not_started',
              progressPercentage: progress.progressPercentage || 0,
              problemsAttempted: progress.problemsAttempted || 0,
              problemsSolved: progress.problemsSolved || 0,
              timeSpent: progress.timeSpent || 0
            } : {
              status: 'not_started',
              progressPercentage: 0,
              problemsAttempted: 0,
              problemsSolved: 0,
              timeSpent: 0
            }
          };
        });
      }

      setTopics(fetchedTopics);
    } catch (err) {
      console.error('Error fetching topics:', err);
      // Fallback to mock data when API is not available
      let mockTopics = getMockTopics();

      // Merge mock topics with progress data if available
      if (topicProgress && isAuthenticated) {
        mockTopics = mockTopics.map(topic => {
          const progress = topicProgress.find(tp =>
            (tp.topic._id || tp.topic) === topic._id ||
            (tp.topic.slug || tp.topic) === topic.slug
          );

          return {
            ...topic,
            userProgress: progress ? {
              status: progress.status || 'not_started',
              progressPercentage: progress.progressPercentage || 0,
              problemsAttempted: progress.problemsAttempted || 0,
              problemsSolved: progress.problemsSolved || 0,
              timeSpent: progress.timeSpent || 0
            } : topic.userProgress
          };
        });
      }

      setTopics(mockTopics);
      setError(null); // Don't show error, just use fallback data
    } finally {
      setLoading(false);
    }
  };

  const getMockTopics = () => {
    const mockTopics = [
      {
        _id: 'arrays',
        name: 'Arrays',
        slug: 'arrays',
        description: 'Learn about arrays, one of the most fundamental data structures in programming.',
        category: 'basic',
        order: 1,
        estimatedTime: 120,
        concepts: [
          { title: 'Array Basics', description: 'Understanding array structure, indexing, and basic operations' },
          { title: 'Array Traversal', description: 'Different ways to iterate through arrays' }
        ],
        totalProblems: 25,
        isActive: true,
        userProgress: {
          status: 'not_started',
          progressPercentage: 0,
          problemsAttempted: 0,
          problemsSolved: 0,
          timeSpent: 0
        }
      },
      {
        _id: 'linked-lists',
        name: 'Linked Lists',
        slug: 'linked-lists',
        description: 'Master linked lists and understand dynamic memory allocation.',
        category: 'basic',
        order: 2,
        estimatedTime: 150,
        concepts: [
          { title: 'Singly Linked List', description: 'Basic linked list with nodes pointing to next element' }
        ],
        totalProblems: 20,
        isActive: true,
        userProgress: {
          status: 'not_started',
          progressPercentage: 0,
          problemsAttempted: 0,
          problemsSolved: 0,
          timeSpent: 0
        }
      },
      {
        _id: 'stacks-queues',
        name: 'Stacks & Queues',
        slug: 'stacks-queues',
        description: 'Learn about LIFO and FIFO data structures and their applications.',
        category: 'basic',
        order: 3,
        estimatedTime: 120,
        concepts: [
          { title: 'Stack Operations', description: 'Push, pop, and peek operations' },
          { title: 'Queue Operations', description: 'Enqueue and dequeue operations' }
        ],
        totalProblems: 18,
        isActive: true,
        userProgress: {
          status: 'not_started',
          progressPercentage: 0,
          problemsAttempted: 0,
          problemsSolved: 0,
          timeSpent: 0
        }
      },
      {
        _id: 'trees',
        name: 'Trees',
        slug: 'trees',
        description: 'Understand tree data structures and various tree algorithms.',
        category: 'intermediate',
        order: 4,
        estimatedTime: 240,
        concepts: [
          { title: 'Binary Trees', description: 'Basic tree structure with at most two children per node' },
          { title: 'Tree Traversal', description: 'Inorder, preorder, and postorder traversal methods' }
        ],
        totalProblems: 30,
        isActive: true,
        userProgress: {
          status: 'not_started',
          progressPercentage: 0,
          problemsAttempted: 0,
          problemsSolved: 0,
          timeSpent: 0
        }
      },
      {
        _id: 'graphs',
        name: 'Graphs',
        slug: 'graphs',
        description: 'Learn graph data structures and fundamental graph algorithms.',
        category: 'intermediate',
        order: 5,
        estimatedTime: 300,
        concepts: [
          { title: 'Graph Representation', description: 'Adjacency list and adjacency matrix' },
          { title: 'Graph Traversal', description: 'BFS and DFS algorithms' }
        ],
        totalProblems: 25,
        isActive: true,
        userProgress: {
          status: 'not_started',
          progressPercentage: 0,
          problemsAttempted: 0,
          problemsSolved: 0,
          timeSpent: 0
        }
      },
      {
        _id: 'dynamic-programming',
        name: 'Dynamic Programming',
        slug: 'dynamic-programming',
        description: 'Learn optimization techniques using memoization and tabulation.',
        category: 'advanced',
        order: 6,
        estimatedTime: 300,
        concepts: [
          { title: 'Memoization', description: 'Top-down approach with caching' },
          { title: 'Tabulation', description: 'Bottom-up approach with iterative solutions' }
        ],
        totalProblems: 35,
        isActive: true,
        userProgress: {
          status: 'not_started',
          progressPercentage: 0,
          problemsAttempted: 0,
          problemsSolved: 0,
          timeSpent: 0
        }
      }
    ];

    // Filter by category if needed
    if (selectedCategory !== 'all') {
      return mockTopics.filter(topic => topic.category === selectedCategory);
    }
    return mockTopics;
  };

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'basic', label: 'Basic' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'progress-excellent';
    if (percentage >= 60) return 'progress-good';
    if (percentage >= 30) return 'progress-fair';
    return 'progress-poor';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'mastered': return '🏆';
      default: return '⭕';
    }
  };

  const handleTopicClick = (topicId) => {
    navigate(`/dsa/topics/${topicId}`);
  };

  if (loading) {
    return (
      <div className="topic-list-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading DSA topics...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="topic-list-container">
      <div className="topic-list-header">
        <div className="header-content">
          <h1>DSA Learning Topics</h1>
          <p>Master data structures and algorithms step by step</p>
        </div>
        
        <div className="filter-section">
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.value}
                className={`filter-btn ${selectedCategory === category.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="topics-grid">
        {topics.map((topic) => (
          <div 
            key={topic._id} 
            className="topic-card"
            onClick={() => handleTopicClick(topic._id)}
          >
            <div className="topic-card-header">
              <div className="topic-info">
                <h3 className="topic-name">{topic.name}</h3>
                <span className={`category-badge ${topic.category}`}>
                  {topic.category}
                </span>
              </div>
              <div className="topic-status">
                <span className="status-icon">
                  {getStatusIcon(topic.userProgress?.status)}
                </span>
              </div>
            </div>

            <div className="topic-description">
              <p>{topic.description}</p>
            </div>

            <div className="topic-stats">
              <div className="stat-item">
                <span className="stat-label">Estimated Time</span>
                <span className="stat-value">
                  {typeof topic.estimatedTime === 'string'
                    ? topic.estimatedTime
                    : `${Math.floor(topic.estimatedTime / 60)}h ${topic.estimatedTime % 60}m`
                  }
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Concepts</span>
                <span className="stat-value">{topic.concepts?.length || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Problems</span>
                <span className="stat-value">{topic.totalProblems || topic.problemsCount || 0}</span>
              </div>
            </div>

            {isAuthenticated && topic.userProgress && (
              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-label">Progress</span>
                  <span className="progress-percentage">
                    {Math.round(topic.userProgress.progressPercentage)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${getProgressColor(topic.userProgress.progressPercentage)}`}
                    style={{ width: `${topic.userProgress.progressPercentage}%` }}
                  ></div>
                </div>
                <div className="progress-details">
                  <span className="problems-solved">
                    {topic.userProgress.problemsSolved || 0}/{topic.userProgress.problemsAttempted || 0} solved
                  </span>
                  <span className="time-spent">
                    {Math.floor((topic.userProgress.timeSpent || 0) / 60)}h {(topic.userProgress.timeSpent || 0) % 60}m spent
                  </span>
                </div>
              </div>
            )}

            <div className="topic-footer">
              <button className="start-topic-btn">
                {isAuthenticated && topic.userProgress?.progressPercentage > 0 
                  ? 'Continue Learning' 
                  : 'Start Learning'
                }
              </button>
            </div>

            {topic.prerequisites && topic.prerequisites.length > 0 && (
              <div className="prerequisites">
                <span className="prereq-label">Prerequisites:</span>
                <div className="prereq-list">
                  {topic.prerequisites.map(prereq => (
                    <span key={prereq._id} className="prereq-item">
                      {prereq.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {topics.length === 0 && (
        <div className="empty-state">
          <h3>No topics found</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      )}

      <div className="learning-path-cta">
        <div className="cta-content">
          <h3>Need a Structured Learning Path?</h3>
          <p>Follow our curated roadmap designed for your skill level</p>
          <button 
            className="roadmap-btn"
            onClick={() => navigate('/dsa/roadmap')}
          >
            View DSA Roadmap
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicList;
