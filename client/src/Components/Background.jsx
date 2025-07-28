import React from 'react';
import './Background.css';

const Background = () => {
  return (
    <div className="background">
      {[...Array(10)].map((_, index) => (
        <div key={index} className={`floating-shape shape-${index + 1}`}></div>
      ))}
    </div>
  );
};

export default Background;
