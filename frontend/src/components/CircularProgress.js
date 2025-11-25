import React from 'react';
import { motion } from 'framer-motion';
import './CircularProgress.css';

const CircularProgress = ({ value, max, label, color = 'var(--electric-blue)', size = 200, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress-container" style={{ width: size, height: size }}>
      <svg
        className="progress-ring"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="progress-ring-circle-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-color)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          className="progress-ring-circle"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="progress-text">
        <motion.div
          className="progress-value"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          style={{ color }}
        >
          {Math.round(value)}
        </motion.div>
        <div className="progress-label">{label}</div>
        <div className="progress-max">/ {Math.round(max)}</div>
      </div>
    </div>
  );
};

export default CircularProgress;

