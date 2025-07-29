import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Internal components (we’ll build these one by one)
import MockTestLanding from './MockTestLanding';
import ExamSelection from './ExamSelection';
import ChapterSelection from './ChapterSelection';
import TestPage from './TestPage';
import ResultPage from './ResultPage';

const MockTest = () => {
  return (
    <div className="mocktest-wrapper">
      <Routes>
        <Route path="/" element={<MockTestLanding />} />
        <Route path="/exams" element={<ExamSelection />} />
        <Route path="/exams/:examId" element={<ChapterSelection />} />
        <Route path="/exams/:examId/:chapterId" element={<TestPage />} />
        <Route path="/exams/:examId/:chapterId/result" element={<ResultPage />} />
      </Routes>
    </div>
  );
};

export default MockTest;
