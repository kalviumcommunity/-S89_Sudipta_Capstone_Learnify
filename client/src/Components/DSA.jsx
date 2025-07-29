import React from 'react';
import { Routes, Route } from 'react-router-dom';

// DSA Components
import DSALanding from './DSA/DSALanding';
import TopicList from './DSA/TopicList';
import TopicDetail from './DSA/TopicDetail';
import ProblemList from './DSA/ProblemList';
import ProblemDetail from './DSA/ProblemDetail';
import DSAProgress from './DSA/DSAProgress';
import DailyChallenge from './DSA/DailyChallenge';
import DSARoadmap from './DSA/DSARoadmap';

const DSA = () => {
  return (
    <div className="dsa-wrapper">
      <Routes>
        <Route path="/" element={<DSALanding />} />
        <Route path="/topics" element={<TopicList />} />
        <Route path="/topics/:topicId" element={<TopicDetail />} />
        <Route path="/problems" element={<ProblemList />} />
        <Route path="/problems/:problemId" element={<ProblemDetail />} />
        <Route path="/progress" element={<DSAProgress />} />
        <Route path="/daily-challenge" element={<DailyChallenge />} />
        <Route path="/roadmap" element={<DSARoadmap />} />
      </Routes>
    </div>
  );
};

export default DSA;