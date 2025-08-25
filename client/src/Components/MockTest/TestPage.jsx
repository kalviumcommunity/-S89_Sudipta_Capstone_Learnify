import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import examChapters from '../../data/examChapters';
import './TestPage.css';

export default function TestPage() {
  const { examId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, dashboardAPI } = useAuth();

  // Helper function to get chapter name from index
  const getChapterName = (examId, chapterIndex) => {
    const examData = examChapters[examId];
    if (!examData) return null;

    // Find the chapter by index across all subjects
    let currentIndex = 0;
    for (const [subject, chapters] of Object.entries(examData)) {
      for (const chapter of chapters) {
        if (currentIndex === parseInt(chapterIndex)) {
          return { chapter, subject };
        }
        currentIndex++;
      }
    }
    return null;
  };

  const chapterInfo = getChapterName(examId, chapterId);
  const originalChapterName = chapterInfo?.chapter || 'Unknown Chapter';
  const subjectName = chapterInfo?.subject || 'Unknown Subject';

  // Debug logs
  console.log('TestPage rendered with params:', { examId, chapterId, originalChapterName, subjectName });
  console.log('Auth state:', { user, isAuthenticated });

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      console.log('Fetching questions for:', { examId, chapterId, originalChapterName });
      try {
        const url = `http://localhost:5000/api/questions?exam=${examId}&chapter=${encodeURIComponent(originalChapterName)}&limit=30`;
        console.log('Fetching from URL:', url);
        const res = await fetch(url);
        console.log('Response status:', res.status);
        const data = await res.json();
        console.log('Response data:', data);

        // Handle case where no questions are found
        if (Array.isArray(data)) {
          setQuestions(data);
          console.log('Set questions (array):', data.length);
        } else if (data.questions) {
          setQuestions(data.questions);
          console.log('Set questions (object):', data.questions.length);
        } else {
          console.warn('No questions found:', data.message || 'Unknown error');
          setQuestions([]);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setQuestions([]);
      } finally {
        setLoading(false);
        console.log('Loading set to false');
      }
    }
    fetchQuestions();
  }, [examId, chapterId, originalChapterName, subjectName]);

  const handleSubmit = useCallback(async () => {
    const total = questions.length;
    const answeredCount = Object.keys(answers).length;
    const correct = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
    const incorrect = answeredCount - correct;
    const skipped = total - answeredCount;
    const timeTaken = 20 * 60 - timeLeft;
    const accuracy = total > 0 ? parseFloat(((correct / total) * 100).toFixed(2)) : 0;

    const result = {
      exam: examId,
      chapter: chapterId,
      total,
      correct,
      incorrect,
      accuracy,
      timeTaken,
    };

    // Save result to localStorage for immediate display
    localStorage.setItem(`result_${examId}_${chapterId}`, JSON.stringify(result));

    // Submit test result to database if user is authenticated
    if (isAuthenticated && user && dashboardAPI) {
      try {
        // Prepare detailed answers array
        const detailedAnswers = questions.map((question, index) => ({
          questionId: question._id || `q_${index}`,
          selectedAnswer: answers[index] || '',
          correctAnswer: question.correctAnswer,
          isCorrect: answers[index] === question.correctAnswer,
          timeTaken: Math.round(timeTaken / total) // Average time per question
        }));

        // Submit the complete test result
        await dashboardAPI.submitTestResult({
          testType: 'mocktest',
          exam: examId,
          subject: subjectName,
          chapter: originalChapterName,
          totalQuestions: total,
          correctAnswers: correct,
          incorrectAnswers: incorrect,
          skippedQuestions: skipped,
          accuracy,
          timeTaken,
          score: correct,
          maxScore: total,
          answers: detailedAnswers,
          submissionType: 'manual'
        });

        // Force clear any cached data and trigger immediate refresh
        window.dispatchEvent(new CustomEvent('dashboardDataUpdate'));
        console.log('Test result submitted successfully to database');
      } catch (error) {
        console.error('Failed to submit test result:', error);
        // Don't block navigation if submission fails
      }
    }

    navigate(`/mocktests/exams/${examId}/${chapterId}/result`);
  }, [questions, answers, timeLeft, examId, chapterId, originalChapterName, subjectName, isAuthenticated, user, dashboardAPI, navigate]);

  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmit();
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [loading, handleSubmit]);

  const handleAnswer = (qid, option) => {
    setAnswers((prev) => ({ ...prev, [qid]: option }));
  };

  const handleMarkForReview = (qid) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(qid)) {
        newSet.delete(qid);
      } else {
        newSet.add(qid);
      }
      return newSet;
    });
  };

  const navigateToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const startTest = () => {
    setTestStarted(true);
  };

  const getQuestionStatus = (index) => {
    if (answers[index] !== undefined) {
      return markedForReview.has(index) ? 'answered-marked' : 'answered';
    } else if (markedForReview.has(index)) {
      return 'marked';
    } else if (index === currentQuestion) {
      return 'current';
    }
    return 'not-visited';
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getMarkedCount = () => {
    return markedForReview.size;
  };

  console.log('Render state:', { loading, questionsLength: questions.length, testStarted });

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="test-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading questions...</p>
          <p>Debug: examId={examId}, chapterId={chapterId}</p>
        </div>
      </div>
    );
  }

  // Handle case when no questions are available
  if (!loading && questions.length === 0) {
    return (
      <div className="test-page no-questions">
        <div className="no-questions-container">
          <div className="no-questions-icon">📝</div>
          <h2>No Questions Available</h2>
          <p>
            Sorry, there are currently no questions available for <br />
            <strong>{examId.toUpperCase()} - {chapterId.replace(/-/g, ' ')}</strong>
          </p>
          <div className="no-questions-actions">
            <button
              className="back-btn"
              onClick={() => navigate(`/mocktests/exams/${examId}`)}
            >
              ← Back to Chapters
            </button>
            <button
              className="refresh-btn"
              onClick={() => window.location.reload()}
            >
              🔄 Refresh
            </button>
          </div>
          <div className="no-questions-info">
            <p><small>Questions for this chapter are being prepared. Please check back later or contact support.</small></p>
          </div>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="test-page">
        <div className="test-instructions">
          <div className="instructions-header">
            <h1>{examId.toUpperCase()} - {chapterId.replace(/-/g, ' ')}</h1>
            <div className="test-info">
              <div className="info-item">
                <span className="info-label">Questions:</span>
                <span className="info-value">{questions.length}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Duration:</span>
                <span className="info-value">20 minutes</span>
              </div>
              <div className="info-item">
                <span className="info-label">Marks:</span>
                <span className="info-value">{questions.length} marks</span>
              </div>
            </div>
          </div>

          <div className="instructions-content">
            <h3>Instructions:</h3>
            <ul>
              <li>This test contains {questions.length} multiple choice questions</li>
              <li>Each question carries 1 mark</li>
              <li>There is no negative marking</li>
              <li>You can navigate between questions using the question palette</li>
              <li>You can mark questions for review and come back to them later</li>
              <li>The test will auto-submit when time is up</li>
              <li>Make sure you have a stable internet connection</li>
            </ul>
          </div>

          <div className="instructions-footer">
            <button className="start-test-btn" onClick={startTest}>
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="test-page">
      {/* Test Header */}
      <div className="test-header">
        <div className="test-info-bar">
          <div className="exam-title">
            {examId.toUpperCase()} - {chapterId.replace(/-/g, ' ')}
          </div>
          <div className="test-controls">
            <button className="fullscreen-btn" onClick={toggleFullscreen}>
              {isFullscreen ? '⛶' : '⛶'}
            </button>
          </div>
        </div>

        <div className="progress-section">
          <div className="timer-section">
            <div className="timer">
              <span className="timer-icon">⏱</span>
              <span className="timer-text">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="progress-stats">
            <div className="stat-item">
              <span className="stat-value">{getAnsweredCount()}</span>
              <span className="stat-label">Answered</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{getMarkedCount()}</span>
              <span className="stat-label">Marked</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{questions.length - getAnsweredCount()}</span>
              <span className="stat-label">Remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Test Content */}
      <div className="test-content">
        {/* Question Panel */}
        <div className="question-panel">
          <div className="question-header">
            <div className="question-number">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="question-actions">
              <button
                className={`mark-btn ${markedForReview.has(currentQuestion) ? 'marked' : ''}`}
                onClick={() => handleMarkForReview(currentQuestion)}
              >
                {markedForReview.has(currentQuestion) ? '★' : '☆'} Mark for Review
              </button>
            </div>
          </div>

          <div className="question-content">
            <div className="question-text">
              <h3>{currentQ?.questionText}</h3>
            </div>

            <div className="options-container">
              {currentQ?.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`option-btn ${answers[currentQuestion] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswer(currentQuestion, option)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="question-navigation">
            <button
              className="nav-btn prev-btn"
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>
            <button
              className="nav-btn next-btn"
              onClick={nextQuestion}
              disabled={currentQuestion === questions.length - 1}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Question Palette */}
        <div className="question-palette">
          <div className="palette-header">
            <h4>Question Palette</h4>
          </div>

          <div className="palette-legend">
            <div className="legend-item">
              <div className="legend-color answered"></div>
              <span>Answered</span>
            </div>
            <div className="legend-item">
              <div className="legend-color marked"></div>
              <span>Marked</span>
            </div>
            <div className="legend-item">
              <div className="legend-color current"></div>
              <span>Current</span>
            </div>
            <div className="legend-item">
              <div className="legend-color not-visited"></div>
              <span>Not Visited</span>
            </div>
          </div>

          <div className="palette-grid">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`palette-btn ${getQuestionStatus(index)}`}
                onClick={() => navigateToQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="palette-footer">
            <button className="submit-btn" onClick={() => setShowSubmitModal(true)}>
              Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="submit-modal">
            <h3>Submit Test?</h3>
            <div className="submit-summary">
              <p>Answered: {getAnsweredCount()} / {questions.length}</p>
              <p>Marked for Review: {getMarkedCount()}</p>
              <p>Not Attempted: {questions.length - getAnsweredCount()}</p>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </button>
              <button className="confirm-submit-btn" onClick={handleSubmit}>
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
