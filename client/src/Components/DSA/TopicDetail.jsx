import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../hooks/useProgress';
import ProblemSolver from './ProblemSolver';
import axios from 'axios';
import './TopicDetail.css';

const TopicDetail = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { progress, getTopicProgress } = useProgress(topicId);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProblem, setSelectedProblem] = useState(null);

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/dsa/topics/${topicId}`);
      setTopic(response.data.data.topic);
    } catch (err) {
      console.error('Error fetching topic:', err);
      // Fallback to mock data when API is not available
      setTopic(getMockTopic(topicId));
      setError(null); // Don't show error, just use fallback data
    } finally {
      setLoading(false);
    }
  };

  const getMockTopic = (id) => {
    const mockTopics = {
      'arrays': {
        _id: 'arrays',
        name: 'Arrays',
        description: 'Arrays are one of the most fundamental data structures in computer science. They store elements in contiguous memory locations, allowing for efficient access and manipulation.',
        category: 'basic',
        difficulty: 'Easy',
        estimatedTime: '2-3 hours',
        prerequisites: [],
        concepts: [
          'Array Declaration and Initialization',
          'Accessing Array Elements',
          'Array Traversal',
          'Searching in Arrays',
          'Sorting Arrays',
          'Two Pointer Technique',
          'Sliding Window Technique'
        ],
        practiceProblems: [
          {
            _id: 'two-sum',
            title: 'Two Sum',
            difficulty: 'easy',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            examples: [
              {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
              }
            ],
            hints: [
              'Try using a hash map to store the complement of each number',
              'For each number, check if its complement exists in the hash map'
            ]
          },
          {
            _id: 'best-time-stock',
            title: 'Best Time to Buy and Sell Stock',
            difficulty: 'easy',
            description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
            examples: [
              {
                input: 'prices = [7,1,5,3,6,4]',
                output: '5',
                explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.'
              }
            ],
            hints: [
              'Keep track of the minimum price seen so far',
              'For each price, calculate the profit if we sell at that price'
            ]
          },
          {
            _id: 'contains-duplicate',
            title: 'Contains Duplicate',
            difficulty: 'easy',
            description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
            examples: [
              {
                input: 'nums = [1,2,3,1]',
                output: 'true',
                explanation: 'The element 1 appears at index 0 and 3.'
              }
            ],
            hints: [
              'Use a hash set to keep track of seen elements',
              'Alternative: Sort the array and check adjacent elements'
            ]
          }
        ],
        resources: [
          {
            title: 'Array Basics - GeeksforGeeks',
            url: 'https://www.geeksforgeeks.org/array-data-structure/',
            type: 'article'
          },
          {
            title: 'Arrays in Data Structures',
            url: 'https://www.youtube.com/watch?v=55l-aZ7_F24',
            type: 'video'
          }
        ]
      },
      'linked-lists': {
        _id: 'linked-lists',
        name: 'Linked Lists',
        description: 'Linked Lists are linear data structures where elements are stored in nodes, and each node contains data and a reference to the next node.',
        category: 'basic',
        difficulty: 'Easy',
        estimatedTime: '3-4 hours',
        prerequisites: ['Pointers/References'],
        concepts: [
          'Singly Linked List',
          'Doubly Linked List',
          'Circular Linked List',
          'Insertion and Deletion',
          'Traversal',
          'Reversing a Linked List',
          'Detecting Cycles'
        ],
        practiceProblems: [
          {
            _id: 'reverse-linked-list',
            title: 'Reverse Linked List',
            difficulty: 'easy',
            description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
            examples: [
              {
                input: 'head = [1,2,3,4,5]',
                output: '[5,4,3,2,1]',
                explanation: 'The linked list is reversed.'
              }
            ],
            hints: [
              'Use three pointers: previous, current, and next',
              'Iteratively reverse the links between nodes'
            ]
          },
          {
            _id: 'merge-two-lists',
            title: 'Merge Two Sorted Lists',
            difficulty: 'easy',
            description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.',
            examples: [
              {
                input: 'list1 = [1,2,4], list2 = [1,3,4]',
                output: '[1,1,2,3,4,4]',
                explanation: 'The merged list is sorted.'
              }
            ],
            hints: [
              'Use a dummy node to simplify the merging process',
              'Compare the values of the current nodes and choose the smaller one'
            ]
          }
        ],
        resources: [
          {
            title: 'Linked List Data Structure',
            url: 'https://www.geeksforgeeks.org/data-structures/linked-list/',
            type: 'article'
          }
        ]
      },
      'stacks-queues': {
        _id: 'stacks-queues',
        name: 'Stacks & Queues',
        description: 'Stacks and Queues are fundamental linear data structures that follow specific ordering principles - LIFO for stacks and FIFO for queues.',
        category: 'basic',
        difficulty: 'Easy',
        estimatedTime: '2-3 hours',
        prerequisites: ['Arrays', 'Linked Lists'],
        concepts: [
          'Stack Operations (Push, Pop, Peek)',
          'Queue Operations (Enqueue, Dequeue)',
          'Stack Implementation using Arrays',
          'Stack Implementation using Linked Lists',
          'Queue Implementation using Arrays',
          'Circular Queue',
          'Priority Queue',
          'Applications of Stacks and Queues'
        ],
        practiceProblems: [
          {
            _id: 'valid-parentheses',
            title: 'Valid Parentheses',
            difficulty: 'easy',
            description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
            examples: [
              {
                input: 's = "()"',
                output: 'true',
                explanation: 'The parentheses are properly matched.'
              }
            ],
            hints: [
              'Use a stack to keep track of opening brackets',
              'For each closing bracket, check if it matches the most recent opening bracket'
            ]
          }
        ],
        resources: [
          {
            title: 'Stack and Queue Data Structures',
            url: 'https://www.geeksforgeeks.org/stack-data-structure/',
            type: 'article'
          }
        ]
      },
      'trees': {
        _id: 'trees',
        name: 'Trees',
        description: 'Trees are hierarchical data structures consisting of nodes connected by edges, with applications in databases, file systems, and algorithms.',
        category: 'intermediate',
        difficulty: 'Medium',
        estimatedTime: '4-5 hours',
        prerequisites: ['Recursion', 'Pointers'],
        concepts: [
          'Binary Trees',
          'Binary Search Trees',
          'Tree Traversals (Inorder, Preorder, Postorder)',
          'Tree Height and Depth',
          'Balanced Trees',
          'AVL Trees',
          'Tree Insertion and Deletion',
          'Lowest Common Ancestor'
        ],
        practiceProblems: [
          {
            _id: 'inorder-traversal',
            title: 'Binary Tree Inorder Traversal',
            difficulty: 'easy',
            description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
            examples: [
              {
                input: 'root = [1,null,2,3]',
                output: '[1,3,2]',
                explanation: 'Inorder traversal visits left, root, then right.'
              }
            ],
            hints: [
              'Use recursion: traverse left subtree, visit root, traverse right subtree',
              'Alternative: Use an iterative approach with a stack'
            ]
          }
        ],
        resources: [
          {
            title: 'Tree Data Structure',
            url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/',
            type: 'article'
          }
        ]
      },
      'graphs': {
        _id: 'graphs',
        name: 'Graphs',
        description: 'Graphs are versatile data structures consisting of vertices and edges, used to model relationships and solve complex problems.',
        category: 'intermediate',
        difficulty: 'Medium',
        estimatedTime: '5-6 hours',
        prerequisites: ['Trees', 'Queues', 'Stacks'],
        concepts: [
          'Graph Representation (Adjacency Matrix, Adjacency List)',
          'Depth-First Search (DFS)',
          'Breadth-First Search (BFS)',
          'Shortest Path Algorithms',
          'Topological Sorting',
          'Minimum Spanning Tree',
          'Graph Coloring',
          'Cycle Detection'
        ],
        practiceProblems: [
          {
            _id: 'number-of-islands',
            title: 'Number of Islands',
            difficulty: 'medium',
            description: 'Given an m x n 2D binary grid which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands.',
            examples: [
              {
                input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
                output: '1',
                explanation: 'There is one island formed by connected 1s.'
              }
            ],
            hints: [
              'Use DFS or BFS to explore connected components',
              'Mark visited cells to avoid counting them multiple times'
            ]
          }
        ],
        resources: [
          {
            title: 'Graph Data Structure',
            url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/',
            type: 'article'
          }
        ]
      },
      'dynamic-programming': {
        _id: 'dynamic-programming',
        name: 'Dynamic Programming',
        description: 'Dynamic Programming is an optimization technique that solves complex problems by breaking them down into simpler subproblems.',
        category: 'advanced',
        difficulty: 'Hard',
        estimatedTime: '6-8 hours',
        prerequisites: ['Recursion', 'Arrays', 'Mathematical Thinking'],
        concepts: [
          'Memoization',
          'Tabulation',
          'Optimal Substructure',
          'Overlapping Subproblems',
          '1D Dynamic Programming',
          '2D Dynamic Programming',
          'Space Optimization',
          'Common DP Patterns'
        ],
        practiceProblems: [
          {
            _id: 'fibonacci-number',
            title: 'Fibonacci Number',
            difficulty: 'easy',
            description: 'The Fibonacci numbers form a sequence where each number is the sum of the two preceding ones.',
            examples: [
              {
                input: 'n = 4',
                output: '3',
                explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3.'
              }
            ],
            hints: [
              'Start with the recursive solution, then optimize with memoization',
              'Consider the bottom-up tabulation approach for better space complexity'
            ]
          }
        ],
        resources: [
          {
            title: 'Dynamic Programming',
            url: 'https://www.geeksforgeeks.org/dynamic-programming/',
            type: 'article'
          }
        ]
      }
    };

    // Return the specific topic or a default one
    return mockTopics[id] || mockTopics['arrays'];
  };

  if (loading) {
    return (
      <div className="topic-detail-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading topic...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="topic-detail-container">
        <div className="error-state">
          <h3>Topic Not Found</h3>
          <p>Unable to load topic details.</p>
          <button onClick={() => navigate('/dsa/topics')} className="back-btn">
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-detail-container">
      <div className="topic-header">
        <button onClick={() => navigate('/dsa/topics')} className="back-btn">
          ← Back to Topics
        </button>
        <div className="topic-meta">
          <h1>{topic.name}</h1>
          <p>{topic.description}</p>
          <div className="topic-badges">
            <span className={`category-badge ${topic.category}`}>
              {topic.category}
            </span>
            <span className="time-badge">
              {Math.floor(topic.estimatedTime / 60)}h {topic.estimatedTime % 60}m
            </span>
          </div>
        </div>
      </div>

      <div className="topic-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'concepts' ? 'active' : ''}`}
          onClick={() => setActiveTab('concepts')}
        >
          Concepts
        </button>
        <button 
          className={`tab ${activeTab === 'problems' ? 'active' : ''}`}
          onClick={() => setActiveTab('problems')}
        >
          Problems
        </button>
      </div>

      <div className="topic-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="topic-description">
              <h3>About This Topic</h3>
              <p>{topic.description}</p>
            </div>

            {isAuthenticated && topic.userProgress && (
              <div className="progress-section">
                <h3>Your Progress</h3>
                <div className="progress-card">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${topic.userProgress.progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="progress-stats">
                    <span>{Math.round(topic.userProgress.progressPercentage)}% Complete</span>
                    <span>{topic.userProgress.problemsSolved} problems solved</span>
                    <span>{Math.floor(topic.userProgress.timeSpent / 60)}h spent</span>
                  </div>
                </div>
              </div>
            )}

            <div className="quick-actions">
              <button 
                onClick={() => navigate(`/dsa/problems?topic=${topicId}`)}
                className="action-btn primary"
              >
                Practice Problems
              </button>
              <button 
                onClick={() => setActiveTab('concepts')}
                className="action-btn secondary"
              >
                Learn Concepts
              </button>
            </div>
          </div>
        )}

        {activeTab === 'concepts' && (
          <div className="concepts-tab">
            <h3>Key Concepts</h3>
            {topic.concepts && topic.concepts.length > 0 ? (
              <div className="concepts-list">
                <div className="concepts-intro">
                  <p>Master these key concepts to excel in {topic.name}:</p>
                </div>
                {topic.concepts.map((concept, index) => (
                  <div key={index} className="concept-item">
                    <div className="concept-number">{index + 1}</div>
                    <div className="concept-content">
                      <h4>{concept}</h4>
                      <div className="concept-status">
                        <span className="status-badge not-started">Not Started</span>
                      </div>
                    </div>
                  </div>
                ))}

                {topic.resources && topic.resources.length > 0 && (
                  <div className="learning-resources">
                    <h4>📚 Learning Resources</h4>
                    <div className="resources-list">
                      {topic.resources.map((resource, index) => (
                        <div key={index} className="resource-item">
                          <div className="resource-info">
                            <span className="resource-title">{resource.title}</span>
                            <span className={`resource-type ${resource.type}`}>
                              {resource.type === 'video' ? '🎥' : '📄'} {resource.type}
                            </span>
                          </div>
                          <button
                            onClick={() => window.open(resource.url, '_blank')}
                            className="resource-btn"
                          >
                            Open
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p>Concepts for this topic are coming soon!</p>
            )}
          </div>
        )}

        {activeTab === 'problems' && (
          <div className="problems-tab">
            <div className="problems-header">
              <h3>Practice Problems</h3>
              <div className="problems-actions">
                <button
                  onClick={() => navigate(`/dsa/problems?topic=${topicId}`)}
                  className="view-all-btn"
                >
                  View All Problems
                </button>
              </div>
            </div>

            {topic.practiceProblems && topic.practiceProblems.length > 0 ? (
              <div className="problems-list">
                {topic.practiceProblems.map((problem, index) => (
                  <div key={problem._id} className="problem-card">
                    <div className="problem-header">
                      <div className="problem-info">
                        <h4 className="problem-title">{problem.title}</h4>
                        <span className={`difficulty-badge ${problem.difficulty}`}>
                          {problem.difficulty}
                        </span>
                      </div>
                      <div className="problem-number">#{index + 1}</div>
                    </div>

                    <div className="problem-description">
                      <p>{problem.description}</p>
                    </div>

                    {problem.examples && problem.examples.length > 0 && (
                      <div className="problem-examples">
                        <h5>Example:</h5>
                        <div className="example">
                          <div className="example-input">
                            <strong>Input:</strong> {problem.examples[0].input}
                          </div>
                          <div className="example-output">
                            <strong>Output:</strong> {problem.examples[0].output}
                          </div>
                          {problem.examples[0].explanation && (
                            <div className="example-explanation">
                              <strong>Explanation:</strong> {problem.examples[0].explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {problem.hints && problem.hints.length > 0 && (
                      <div className="problem-hints">
                        <details>
                          <summary>💡 Hints ({problem.hints.length})</summary>
                          <ul>
                            {problem.hints.map((hint, hintIndex) => (
                              <li key={hintIndex}>{hint}</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}

                    <div className="problem-actions">
                      <button
                        onClick={() => navigate(`/dsa/problems/${problem.slug || problem._id}`)}
                        className="solve-btn primary"
                      >
                        Solve Problem
                      </button>
                      <button
                        onClick={() => window.open(`https://leetcode.com/problems/${problem._id}`, '_blank')}
                        className="external-btn secondary"
                      >
                        View on LeetCode
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-problems">
                <p>No practice problems available for this topic yet.</p>
                <button
                  onClick={() => navigate('/dsa/problems')}
                  className="browse-btn"
                >
                  Browse All Problems
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetail;
