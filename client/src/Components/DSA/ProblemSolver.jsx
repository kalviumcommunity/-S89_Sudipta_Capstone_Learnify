import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress';
import './ProblemSolver.css';

const ProblemSolver = ({ problem, topicId, onComplete }) => {
  const { updateProgress } = useProgress(topicId);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code before submitting!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate code execution and checking
      const isCorrect = Math.random() > 0.3; // 70% success rate for demo
      const timeTaken = Math.floor(Math.random() * 15) + 5; // 5-20 minutes
      
      // Update progress
      const updatedProgress = await updateProgress(problem._id, isCorrect, timeTaken);

      setResult({
        success: isCorrect,
        message: isCorrect ? 'Correct! Well done!' : 'Incorrect. Try again!',
        timeTaken,
        progress: updatedProgress
      });

      // Trigger dashboard data refresh since DSA stats may have changed
      window.dispatchEvent(new CustomEvent('dashboardDataUpdate'));

      if (onComplete) {
        onComplete(isCorrect, updatedProgress);
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      setResult({
        success: false,
        message: 'Error submitting solution. Please try again.',
        timeTaken: 0
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setResult(null);
  };

  return (
    <div className="problem-solver">
      <div className="problem-header">
        <h3>{problem.title}</h3>
        <span className={`difficulty-badge ${problem.difficulty}`}>
          {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
        </span>
      </div>

      <div className="problem-description">
        <p>{problem.description}</p>
        
        {problem.examples && problem.examples.length > 0 && (
          <div className="examples">
            <h4>Example:</h4>
            {problem.examples.map((example, index) => (
              <div key={index} className="example">
                <div className="example-input">
                  <strong>Input:</strong> {example.input}
                </div>
                <div className="example-output">
                  <strong>Output:</strong> {example.output}
                </div>
                {example.explanation && (
                  <div className="example-explanation">
                    <strong>Explanation:</strong> {example.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="code-editor">
        <h4>Your Solution:</h4>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your solution here..."
          rows={10}
          className="code-textarea"
        />
      </div>

      <div className="solver-actions">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="submit-btn"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Solution'}
        </button>
        <button 
          onClick={handleReset}
          className="reset-btn"
        >
          Reset
        </button>
      </div>

      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          <div className="result-message">
            {result.success ? '✅' : '❌'} {result.message}
          </div>
          {result.timeTaken > 0 && (
            <div className="result-stats">
              <span>Time taken: {result.timeTaken} minutes</span>
            </div>
          )}
          {result.progress && (
            <div className="progress-update">
              <h5>Progress Updated!</h5>
              <div className="progress-stats">
                <span>Problems Solved: {result.progress.problemsSolved}/{result.progress.problemsAttempted}</span>
                <span>Progress: {result.progress.progressPercentage}%</span>
                <span>Status: {result.progress.status.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProblemSolver;
