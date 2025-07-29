import { useParams, Link, useNavigate } from 'react-router-dom';
import examChapters from '../../data/examChapters.js';
import './ChapterSelection.css';




const examInfo = {
  neet: { name: 'NEET', icon: '🏥', color: 'from-green-500 to-emerald-600' },
  jee: { name: 'JEE Main', icon: '⚙️', color: 'from-blue-500 to-cyan-600' },
  jeeadvance: { name: 'JEE Advanced', icon: '🎯', color: 'from-red-500 to-pink-600' },
  tbjee: { name: 'TBJEE', icon: '🎓', color: 'from-orange-500 to-amber-600' },
  wbjee: { name: 'WBJEE', icon: '📚', color: 'from-purple-500 to-violet-600' }
};

const subjectIcons = {
  Biology: '🧬',
  Physics: '⚛️',
  Chemistry: '🧪',
  Mathematics: '📐'
};

export default function ChapterSelection() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const examData = examChapters[examId];
  const currentExam = examInfo[examId];

  if (!examData) {
    return (
      <div className="chapter-selection">
        <div className="error-message">
          <h2>❌ Invalid Exam Selected</h2>
          <p>The exam you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/mocktests/exams')} className="back-btn">
            ← Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const getTotalChapters = () => {
    return Object.values(examData).reduce((total, chapters) => total + chapters.length, 0);
  };

  return (
    <div className="chapter-selection">
      <div className="chapter-header">
        <button className="back-btn" onClick={() => navigate('/mocktests/exams')}>
          ← Back to Exams
        </button>

        <div className="exam-info">
          <div className={`exam-badge bg-gradient-to-r ${currentExam?.color}`}>
            <span className="exam-icon">{currentExam?.icon}</span>
            <div className="exam-details">
              <h1>{currentExam?.name}</h1>
              <p>{getTotalChapters()} chapters across {Object.keys(examData).length} subjects</p>
            </div>
          </div>
        </div>
      </div>

      <div className="subjects-container">
        {Object.entries(examData).map(([subject, chapters]) => (
          <div key={subject} className="subject-block">
            <div className="subject-header">
              <div className="subject-icon">{subjectIcons[subject] || '📖'}</div>
              <div className="subject-info">
                <h3>{subject}</h3>
                <span className="chapter-count">{chapters.length} chapters</span>
              </div>
            </div>

            <div className="chapters-grid">
              {chapters.map((chapter, idx) => (
                <Link
                  key={idx}
                  to={`/mocktests/exams/${examId}/${idx}`}
                  className="chapter-card"
                >
                  <div className="chapter-number">{idx + 1}</div>
                  <div className="chapter-content">
                    <h4>{chapter}</h4>
                    <div className="chapter-meta">
                      <span className="difficulty">Medium</span>
                      <span className="questions">~30 questions</span>
                    </div>
                  </div>
                  <div className="chapter-arrow">→</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
