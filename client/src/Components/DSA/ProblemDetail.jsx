import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './ProblemDetail.css';

const ProblemDetail = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [usedHints, setUsedHints] = useState([]);

  useEffect(() => {
    fetchProblem();
  }, [problemId]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/dsa/problems/${problemId}`);
      setProblem(response.data.data.problem);

      // Set initial code template based on language
      setCode(getCodeTemplate(language));
    } catch (err) {
      console.error('Error fetching problem:', err);
      // Fallback to mock data when API is not available
      const mockProblem = getMockProblem(problemId);
      if (mockProblem) {
        setProblem(mockProblem);
        setCode(getCodeTemplate(language));
        setError(null);
      } else {
        setError('Failed to load problem');
      }
    } finally {
      setLoading(false);
    }
  };

  const getMockProblem = (id) => {
    const mockProblems = {
      'two-sum': {
        _id: 'two-sum',
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'easy',
        topic: { name: 'Arrays' },
        tags: ['array', 'hash-table'],
        problemStatement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        inputFormat: 'nums = [2,7,11,15], target = 9',
        outputFormat: '[0,1]',
        constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          }
        ],
        hints: [
          { level: 1, content: 'Try using a hash map to store the numbers you\'ve seen.' },
          { level: 2, content: 'For each number, check if target - number exists in the hash map.' }
        ],
        totalPoints: 100,
        timeLimit: 1000,
        memoryLimit: 256
      },
      'add-two-numbers': {
        _id: 'add-two-numbers',
        slug: 'add-two-numbers',
        title: 'Add Two Numbers',
        difficulty: 'medium',
        topic: { name: 'Linked Lists' },
        tags: ['linked-list', 'math'],
        problemStatement: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
        inputFormat: 'l1 = [2,4,3], l2 = [5,6,4]',
        outputFormat: '[7,0,8]',
        constraints: 'The number of nodes in each linked list is in the range [1, 100].\n0 <= Node.val <= 9',
        examples: [
          {
            input: 'l1 = [2,4,3], l2 = [5,6,4]',
            output: '[7,0,8]',
            explanation: '342 + 465 = 807.'
          }
        ],
        hints: [
          { level: 1, content: 'Remember to handle the carry when adding digits.' },
          { level: 2, content: 'Create a new linked list to store the result.' }
        ],
        totalPoints: 100,
        timeLimit: 1000,
        memoryLimit: 256
      },
      'longest-substring': {
        _id: 'longest-substring',
        slug: 'longest-substring',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'medium',
        topic: { name: 'Strings' },
        tags: ['string', 'sliding-window'],
        problemStatement: 'Given a string s, find the length of the longest substring without repeating characters.',
        inputFormat: 's = "abcabcbb"',
        outputFormat: '3',
        constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
        examples: [
          {
            input: 's = "abcabcbb"',
            output: '3',
            explanation: 'The answer is "abc", with the length of 3.'
          }
        ],
        hints: [
          { level: 1, content: 'Use a sliding window approach with two pointers.' },
          { level: 2, content: 'Keep track of characters using a set or hash map.' }
        ],
        totalPoints: 100,
        timeLimit: 1000,
        memoryLimit: 256
      },
      'valid-parentheses': {
        _id: 'valid-parentheses',
        slug: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'easy',
        topic: { name: 'Stacks' },
        tags: ['string', 'stack'],
        problemStatement: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        inputFormat: 's = "()[]{}"',
        outputFormat: 'true',
        constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'.',
        examples: [
          {
            input: 's = "()[]{}"',
            output: 'true',
            explanation: 'All brackets are properly matched.'
          }
        ],
        hints: [
          { level: 1, content: 'Use a stack to keep track of opening brackets.' },
          { level: 2, content: 'When you see a closing bracket, check if it matches the most recent opening bracket.' }
        ],
        totalPoints: 100,
        timeLimit: 1000,
        memoryLimit: 256
      }
    };
    return mockProblems[id] || null;
  };

  const getCodeTemplate = (lang) => {
    const templates = {
      javascript: `function solution(input) {
    // Your code here
    return result;
}`,
      python: `def solution(input):
    # Your code here
    return result`,
      java: `public class Solution {
    public static String solution(String input) {
        // Your code here
        return result;
    }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

string solution(string input) {
    // Your code here
    return result;
}`
    };
    return templates[lang] || templates.javascript;
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(getCodeTemplate(newLanguage));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(`/dsa/problems/${problemId}/submit`, {
        code,
        language
      });

      setSubmission(response.data.data.submission);

      // Trigger dashboard data refresh since DSA stats may have changed
      window.dispatchEvent(new CustomEvent('dashboardDataUpdate'));
    } catch (err) {
      console.error('Error submitting solution:', err);
      alert('Failed to submit solution. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getHint = async (level) => {
    try {
      const response = await axios.get(`/dsa/problems/${problemId}/hints/${level}`);
      const hint = response.data.data.hint;
      setUsedHints([...usedHints, hint]);
    } catch (err) {
      console.error('Error fetching hint:', err);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'status-accepted';
      case 'wrong_answer': return 'status-wrong';
      case 'time_limit_exceeded': return 'status-tle';
      case 'runtime_error': return 'status-error';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="problem-detail-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="problem-detail-container">
        <div className="error-state">
          <h3>Problem Not Found</h3>
          <p>{error || 'The requested problem could not be found.'}</p>
          <button onClick={() => navigate('/dsa/problems')} className="back-btn">
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="problem-detail-container">
      <div className="problem-header">
        <button onClick={() => navigate('/dsa/problems')} className="back-btn">
          ← Back to Problems
        </button>
        <div className="problem-meta">
          <h1 className="problem-title">{problem.title}</h1>
          <div className="problem-badges">
            <span className={`difficulty-badge ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            <span className="topic-badge">{problem.topic?.name}</span>
          </div>
        </div>
      </div>

      <div className="problem-content">
        <div className="problem-statement">
          <div className="section">
            <h3>Problem Statement</h3>
            <p>{problem.problemStatement}</p>
          </div>

          <div className="section">
            <h3>Input Format</h3>
            <p>{problem.inputFormat}</p>
          </div>

          <div className="section">
            <h3>Output Format</h3>
            <p>{problem.outputFormat}</p>
          </div>

          <div className="section">
            <h3>Constraints</h3>
            <pre>{problem.constraints}</pre>
          </div>

          {problem.examples && problem.examples.length > 0 && (
            <div className="section">
              <h3>Examples</h3>
              {problem.examples.map((example, index) => (
                <div key={index} className="example">
                  <h4>Example {index + 1}:</h4>
                  <div className="example-content">
                    <div className="example-input">
                      <strong>Input:</strong>
                      <pre>{example.input}</pre>
                    </div>
                    <div className="example-output">
                      <strong>Output:</strong>
                      <pre>{example.output}</pre>
                    </div>
                    {example.explanation && (
                      <div className="example-explanation">
                        <strong>Explanation:</strong>
                        <p>{example.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {problem.tags && problem.tags.length > 0 && (
            <div className="section">
              <h3>Tags</h3>
              <div className="tags">
                {problem.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="code-editor-section">
          <div className="editor-header">
            <h3>Solution</h3>
            <label htmlFor="language-select" className="sr-only">Programming Language</label>
            <select
              id="language-select"
              name="language"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="language-select"
              aria-label="Select programming language"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <label htmlFor="code-editor" className="sr-only">Code Editor</label>
          <textarea
            id="code-editor"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="code-editor"
            placeholder="Write your solution here..."
            rows={15}
            aria-label="Code editor for writing solution"
          />

          <div className="editor-actions">
            <button 
              onClick={handleSubmit}
              disabled={submitting || !code.trim()}
              className="submit-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Solution'}
            </button>
            
            <button 
              onClick={() => setShowHints(!showHints)}
              className="hints-btn"
            >
              {showHints ? 'Hide Hints' : 'Show Hints'}
            </button>
          </div>

          {showHints && problem.hints && (
            <div className="hints-section">
              <h4>Hints</h4>
              {problem.hints.map((hint, index) => (
                <div key={index} className="hint-item">
                  <button 
                    onClick={() => getHint(hint.level)}
                    className="hint-btn"
                    disabled={usedHints.some(h => h.level === hint.level)}
                  >
                    Hint {hint.level} {hint.pointsDeduction > 0 && `(-${hint.pointsDeduction} points)`}
                  </button>
                </div>
              ))}
              
              {usedHints.map((hint, index) => (
                <div key={index} className="hint-content">
                  <strong>Hint {hint.level}:</strong>
                  <p>{hint.content}</p>
                </div>
              ))}
            </div>
          )}

          {submission && (
            <div className="submission-result">
              <h4>Submission Result</h4>
              <div className={`result-status ${getStatusColor(submission.status)}`}>
                <span className="status-text">{submission.status.replace('_', ' ').toUpperCase()}</span>
                <span className="score">Score: {submission.score}/100</span>
              </div>
              
              {submission.testCaseResults && (
                <div className="test-results">
                  <h5>Test Cases</h5>
                  {submission.testCaseResults.map((result, index) => (
                    <div key={index} className={`test-case ${result.status}`}>
                      <span>Test {index + 1}: {result.status}</span>
                      {result.executionTime && (
                        <span className="execution-time">{result.executionTime}ms</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
