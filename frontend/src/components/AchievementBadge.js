import React from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaFire, FaBullseye, FaStar } from 'react-icons/fa';
import './AchievementBadge.css';

const AchievementBadge = ({ achievement }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'streak':
        return <FaFire />;
      case 'goal':
        return <FaBullseye />;
      case 'milestone':
        return <FaStar />;
      default:
        return <FaTrophy />;
    }
  };

  return (
    <motion.div
      className="achievement-badge"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
    >
      <div className="achievement-icon">{getIcon(achievement.type)}</div>
      <div className="achievement-name">{achievement.name}</div>
      {achievement.progress !== undefined && achievement.maxProgress && (
        <div className="achievement-progress">
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, (achievement.progress / achievement.maxProgress) * 100)}%` }}
            />
          </div>
          <div className="progress-text">
            {achievement.progress}/{achievement.maxProgress} days
          </div>
        </div>
      )}
      <div className="achievement-date">
        {new Date(achievement.dateEarned).toLocaleDateString()}
      </div>
    </motion.div>
  );
};

export default AchievementBadge;
