import React from "react";
import '../pages/ProgressBar.css';

const ProgressBar = ({ progress }) => {
    return (
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>
    );
  };

export default ProgressBar;  