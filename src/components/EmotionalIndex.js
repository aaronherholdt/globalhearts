import React from 'react';
import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';

function EmotionalIndex({ index }) {
  // Define colors for each skill
  const skillColors = {
    empathy: '#e74c3c',      // Red
    compassion: '#2ecc71',   // Green
    conflictResolution: '#3498db', // Blue
    resilience: '#f1c40f',   // Yellow
    selfAwareness: '#9b59b6', // Purple
    growth: '#e67e22'        // Orange
  };

  // Calculate percentage for bar width (assuming max score of 100)
  const getPercentage = (value) => {
    return Math.min((value / 100) * 100, 100); // Cap at 100%
  };

  return (
    <div className="emotional-index">
      <h3>Emotional Growth Tracker <FaHeart style={{ color: '#e74c3c' }} /></h3>
      <div className="skill-bars">
        {Object.entries(index).map(([skill, value]) => (
          <div key={skill} className="skill-bar-container">
            <label className="skill-label">
              {skill.replace(/([A-Z])/g, ' $1').trim()}:
              <span className="skill-value">{value}</span>
            </label>
            <div className="bar-background">
              <motion.div
                className="bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${getPercentage(value)}%` }}
                transition={{ duration: 0.5 }}
                style={{
                  backgroundColor: skillColors[skill],
                  height: '100%',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmotionalIndex;