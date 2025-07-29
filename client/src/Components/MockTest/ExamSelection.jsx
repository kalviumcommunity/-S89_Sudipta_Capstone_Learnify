import { useNavigate } from 'react-router-dom';
import './ExamSelection.css';

const exams = [
  {
    id: 'neet',
    name: 'NEET',
    fullName: 'National Eligibility cum Entrance Test',
    description: 'Medical entrance exam for MBBS, BDS, and other medical courses',
    subjects: ['Biology', 'Physics', 'Chemistry'],
    totalQuestions: 180,
    duration: '3 hours',
    difficulty: 'High',
    icon: '🏥',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'jee',
    name: 'JEE Main',
    fullName: 'Joint Entrance Examination',
    description: 'Engineering entrance exam for NITs, IIITs, and other engineering colleges',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    totalQuestions: 90,
    duration: '3 hours',
    difficulty: 'High',
    icon: '⚙️',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'jeeadvance',
    name: 'JEE Advanced',
    fullName: 'Joint Entrance Examination Advanced',
    description: 'Advanced engineering entrance exam for IITs',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    totalQuestions: 54,
    duration: '3 hours',
    difficulty: 'Very High',
    icon: '🎯',
    color: 'from-red-500 to-pink-600'
  },
  {
    id: 'tbjee',
    name: 'TBJEE',
    fullName: 'Tripura Board Joint Entrance Examination',
    description: 'Tripura state engineering and medical entrance exam',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics'],
    totalQuestions: 120,
    duration: '2.5 hours',
    difficulty: 'Medium',
    icon: '🎓',
    color: 'from-orange-500 to-amber-600'
  },
  {
    id: 'wbjee',
    name: 'WBJEE',
    fullName: 'West Bengal Joint Entrance Examination',
    description: 'West Bengal state engineering and medical entrance exam',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    totalQuestions: 155,
    duration: '2 hours',
    difficulty: 'Medium',
    icon: '📚',
    color: 'from-purple-500 to-violet-600'
  },
];

export default function ExamSelection() {
  const navigate = useNavigate();

  const handleSelect = (examId) => {
    navigate(`/mocktests/exams/${examId}`);
  };

  return (
    <div className="exam-selection">
      <div className="exam-selection-header">
        <button className="back-btn" onClick={() => navigate('/mocktests')}>
          ← Back to Home
        </button>
        <div className="header-content">
          <h1>Choose Your Exam</h1>
          <p>Select the competitive exam you want to practice for</p>
        </div>
      </div>

      <div className="exam-grid">
        {exams.map((exam) => (
          <div key={exam.id} className="exam-card" onClick={() => handleSelect(exam.id)}>
            <div className={`exam-header bg-gradient-to-r ${exam.color}`}>
              <div className="exam-icon">{exam.icon}</div>
              <div className="exam-title">
                <h3>{exam.name}</h3>
                <p>{exam.fullName}</p>
              </div>
            </div>
            <div className="exam-content">
              <p className="exam-description">{exam.description}</p>
              <div className="exam-details">
                <div className="detail-item">
                  <span className="detail-label">Subjects:</span>
                  <span className="detail-value">{exam.subjects.join(', ')}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Questions:</span>
                  <span className="detail-value">{exam.totalQuestions}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{exam.duration}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Difficulty:</span>
                  <span className={`difficulty-badge ${exam.difficulty.toLowerCase().replace(' ', '-')}`}>
                    {exam.difficulty}
                  </span>
                </div>
              </div>
            </div>
            <div className="exam-footer">
              <button className="select-exam-btn">
                Select Exam →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
