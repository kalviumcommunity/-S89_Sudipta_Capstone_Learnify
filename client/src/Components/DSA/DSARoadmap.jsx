import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DSARoadmap.css';

const DSARoadmap = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedPath, setSelectedPath] = useState('beginner');

  const roadmapPaths = {
    beginner: {
      title: 'Beginner Path',
      description: 'Perfect for those new to programming and data structures',
      duration: '2-3 months',
      topics: [
        {
          id: 1,
          name: 'Arrays & Strings',
          description: 'Learn the basics of arrays and string manipulation',
          estimatedTime: '1-2 weeks',
          difficulty: 'easy',
          completed: true,
          topics: ['Arrays', 'Strings', 'Two Pointers']
        },
        {
          id: 2,
          name: 'Linked Lists',
          description: 'Understand dynamic data structures',
          estimatedTime: '1 week',
          difficulty: 'easy',
          completed: true,
          topics: ['Singly Linked List', 'Doubly Linked List']
        },
        {
          id: 3,
          name: 'Stacks & Queues',
          description: 'Master LIFO and FIFO data structures',
          estimatedTime: '1 week',
          difficulty: 'easy',
          completed: false,
          topics: ['Stack', 'Queue', 'Deque']
        },
        {
          id: 4,
          name: 'Basic Sorting',
          description: 'Learn fundamental sorting algorithms',
          estimatedTime: '1 week',
          difficulty: 'medium',
          completed: false,
          topics: ['Bubble Sort', 'Selection Sort', 'Insertion Sort']
        },
        {
          id: 5,
          name: 'Binary Search',
          description: 'Efficient searching in sorted arrays',
          estimatedTime: '1 week',
          difficulty: 'medium',
          completed: false,
          topics: ['Binary Search', 'Search Variations']
        },
        {
          id: 6,
          name: 'Basic Trees',
          description: 'Introduction to tree data structures',
          estimatedTime: '2 weeks',
          difficulty: 'medium',
          completed: false,
          topics: ['Binary Trees', 'Tree Traversal', 'BST']
        }
      ]
    },
    intermediate: {
      title: 'Intermediate Path',
      description: 'For developers with basic programming knowledge',
      duration: '3-4 months',
      topics: [
        {
          id: 1,
          name: 'Advanced Arrays',
          description: 'Complex array problems and techniques',
          estimatedTime: '2 weeks',
          difficulty: 'medium',
          completed: false,
          topics: ['Sliding Window', 'Prefix Sum', 'Kadane\'s Algorithm']
        },
        {
          id: 2,
          name: 'Hash Tables',
          description: 'Efficient data storage and retrieval',
          estimatedTime: '1 week',
          difficulty: 'medium',
          completed: false,
          topics: ['Hash Maps', 'Hash Sets', 'Collision Handling']
        },
        {
          id: 3,
          name: 'Trees & BST',
          description: 'Advanced tree operations and algorithms',
          estimatedTime: '3 weeks',
          difficulty: 'medium',
          completed: false,
          topics: ['AVL Trees', 'Tree Algorithms', 'LCA']
        },
        {
          id: 4,
          name: 'Heaps',
          description: 'Priority queues and heap operations',
          estimatedTime: '2 weeks',
          difficulty: 'medium',
          completed: false,
          topics: ['Min Heap', 'Max Heap', 'Heap Sort']
        },
        {
          id: 5,
          name: 'Graphs Basics',
          description: 'Introduction to graph algorithms',
          estimatedTime: '3 weeks',
          difficulty: 'hard',
          completed: false,
          topics: ['BFS', 'DFS', 'Graph Representation']
        },
        {
          id: 6,
          name: 'Dynamic Programming',
          description: 'Optimization using memoization',
          estimatedTime: '4 weeks',
          difficulty: 'hard',
          completed: false,
          topics: ['1D DP', '2D DP', 'Memoization']
        }
      ]
    },
    advanced: {
      title: 'Advanced Path',
      description: 'For experienced developers preparing for technical interviews',
      duration: '4-6 months',
      topics: [
        {
          id: 1,
          name: 'Advanced DP',
          description: 'Complex dynamic programming patterns',
          estimatedTime: '4 weeks',
          difficulty: 'hard',
          completed: false,
          topics: ['State Machine DP', 'Interval DP', 'Tree DP']
        },
        {
          id: 2,
          name: 'Graph Algorithms',
          description: 'Advanced graph traversal and algorithms',
          estimatedTime: '4 weeks',
          difficulty: 'hard',
          completed: false,
          topics: ['Dijkstra', 'Floyd-Warshall', 'Topological Sort']
        },
        {
          id: 3,
          name: 'Advanced Trees',
          description: 'Complex tree data structures',
          estimatedTime: '3 weeks',
          difficulty: 'hard',
          completed: false,
          topics: ['Segment Trees', 'Fenwick Trees', 'Trie']
        },
        {
          id: 4,
          name: 'String Algorithms',
          description: 'Advanced string processing',
          estimatedTime: '3 weeks',
          difficulty: 'hard',
          completed: false,
          topics: ['KMP', 'Rabin-Karp', 'Suffix Arrays']
        },
        {
          id: 5,
          name: 'Advanced Sorting',
          description: 'Efficient sorting algorithms',
          estimatedTime: '2 weeks',
          difficulty: 'hard',
          completed: false,
          topics: ['Merge Sort', 'Quick Sort', 'Radix Sort']
        },
        {
          id: 6,
          name: 'System Design',
          description: 'Scalable system architecture',
          estimatedTime: '4 weeks',
          difficulty: 'hard',
          completed: false,
          topics: ['Load Balancing', 'Caching', 'Database Design']
        }
      ]
    }
  };

  const currentPath = roadmapPaths[selectedPath];

  const getStatusIcon = (completed) => {
    return completed ? '✅' : '⭕';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return '';
    }
  };

  const handleTopicClick = (topicName) => {
    // Navigate to topic or problems related to this roadmap item
    navigate(`/dsa/topics`);
  };

  return (
    <div className="roadmap-container">
      <div className="roadmap-header">
        <h1>🗺️ DSA Learning Roadmap</h1>
        <p>Choose your learning path and follow a structured journey to master DSA</p>
      </div>

      <div className="path-selector">
        <div className="path-tabs">
          {Object.entries(roadmapPaths).map(([key, path]) => (
            <button
              key={key}
              className={`path-tab ${selectedPath === key ? 'active' : ''}`}
              onClick={() => setSelectedPath(key)}
            >
              <h3>{path.title}</h3>
              <p>{path.description}</p>
              <span className="duration">{path.duration}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="roadmap-content">
        <div className="path-overview">
          <h2>{currentPath.title}</h2>
          <p>{currentPath.description}</p>
          <div className="path-stats">
            <span className="stat">
              <strong>Duration:</strong> {currentPath.duration}
            </span>
            <span className="stat">
              <strong>Topics:</strong> {currentPath.topics.length}
            </span>
            <span className="stat">
              <strong>Completed:</strong> {currentPath.topics.filter(t => t.completed).length}/{currentPath.topics.length}
            </span>
          </div>
        </div>

        <div className="roadmap-timeline">
          {currentPath.topics.map((topic, index) => (
            <div key={`${selectedPath}-${topic.id}`} className="timeline-item">
              <div className="timeline-connector">
                {index < currentPath.topics.length - 1 && <div className="connector-line"></div>}
              </div>
              
              <div className={`topic-card ${topic.completed ? 'completed' : ''}`}>
                <div className="topic-header">
                  <div className="topic-status">
                    <span className="status-icon">{getStatusIcon(topic.completed)}</span>
                    <span className="topic-number">{index + 1}</span>
                  </div>
                  <div className="topic-info">
                    <h3>{topic.name}</h3>
                    <p>{topic.description}</p>
                  </div>
                  <div className="topic-meta">
                    <span className={`difficulty-badge ${getDifficultyColor(topic.difficulty)}`}>
                      {topic.difficulty}
                    </span>
                    <span className="time-estimate">{topic.estimatedTime}</span>
                  </div>
                </div>

                <div className="topic-content">
                  <div className="subtopics">
                    <h4>What you'll learn:</h4>
                    <div className="subtopic-list">
                      {topic.topics.map((subtopic, idx) => (
                        <span key={idx} className="subtopic-tag">{subtopic}</span>
                      ))}
                    </div>
                  </div>

                  <div className="topic-actions">
                    <button 
                      onClick={() => handleTopicClick(topic.name)}
                      className={`action-btn ${topic.completed ? 'review' : 'start'}`}
                    >
                      {topic.completed ? 'Review' : 'Start Learning'}
                    </button>
                    <button 
                      onClick={() => navigate(`/dsa/problems?difficulty=${topic.difficulty}`)}
                      className="action-btn secondary"
                    >
                      Practice Problems
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="roadmap-footer">
        <div className="progress-summary">
          <h3>Your Progress</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${(currentPath.topics.filter(t => t.completed).length / currentPath.topics.length) * 100}%` 
              }}
            ></div>
          </div>
          <p>
            {currentPath.topics.filter(t => t.completed).length} of {currentPath.topics.length} topics completed
          </p>
        </div>

        <div className="roadmap-actions">
          <button 
            onClick={() => navigate('/dsa/topics')}
            className="action-btn primary"
          >
            Browse All Topics
          </button>
          <button 
            onClick={() => navigate('/dsa/problems')}
            className="action-btn secondary"
          >
            Practice Problems
          </button>
          {isAuthenticated && (
            <button 
              onClick={() => navigate('/dsa/progress')}
              className="action-btn accent"
            >
              View Detailed Progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DSARoadmap;
