import React from 'react';
import { FaHeart, FaShieldAlt, FaUser, FaGlobe } from 'react-icons/fa';
import { animated } from 'react-spring';
import { motion } from 'framer-motion';

function Scenario({ scenario, onChoice, role, isChoosing }) {
  // Map roles to icons
  const roleIcon = {
    'Empathy Explorer': <FaHeart />,
    'Resilience Ranger': <FaShieldAlt />,
    'Compassion Captain': <FaUser />,
    'Peacekeeper': <FaGlobe />
  };

  // Simple character avatars
  const characterAvatar = {
    'Mia': <FaUser style={{ color: '#3498db', fontSize: '2em' }} />,
    'Jay': <FaUser style={{ color: '#e74c3c', fontSize: '2em' }} />,
    'Leila': <FaUser style={{ color: '#2ecc71', fontSize: '2em' }} />,
    'Sam': <FaUser style={{ color: '#f1c40f', fontSize: '2em' }} />,
    'Aisha': <FaUser style={{ color: '#9b59b6', fontSize: '2em' }} />,
    'Emma': <FaUser style={{ color: '#e67e22', fontSize: '2em' }} />,
    'Noah': <FaUser style={{ color: '#1abc9c', fontSize: '2em' }} />,
    'Sophie': <FaUser style={{ color: '#8e44ad', fontSize: '2em' }} />,
    'Alex': <FaUser style={{ color: '#27ae60', fontSize: '2em' }} />,
    'Lila': <FaUser style={{ color: '#d35400', fontSize: '2em' }} />,
    'Zoe': <FaUser style={{ color: '#c0392b', fontSize: '2em' }} />,
    'Liam': <FaUser style={{ color: '#16a085', fontSize: '2em' }} />,
    'Hassan': <FaUser style={{ color: '#f39c12', fontSize: '2em' }} />,
    'Amina': <FaUser style={{ color: '#7f8c8d', fontSize: '2em' }} />,
    'Nia': <FaUser style={{ color: '#2c3e50', fontSize: '2em' }} />,
    'Taro': <FaUser style={{ color: '#95e1d3', fontSize: '2em' }} />,
    'Ravi': <FaUser style={{ color: '#e74c3c', fontSize: '2em' }} />,
    'Sofia': <FaUser style={{ color: '#3498db', fontSize: '2em' }} />
  };

  const characterName = scenario.situation.split(',')[0].split(' ')[1]; // Extract character name

  const handleInteraction = (eventHandler) => {
    if ('ontouchend' in window) {
      return (e) => {
        e.preventDefault();
        eventHandler(e);
      };
    }
    return eventHandler;
  };

  return (
    <div className="scenario">
      <h2>{scenario.title} {roleIcon[role]}</h2>
      <animated.div style={{ marginBottom: '15px' }}>
        {characterAvatar[characterName] || <FaUser style={{ color: '#3498db', fontSize: '2em' }} />}
        <p style={{ marginTop: '10px' }}>As {role}, {scenario.situation}</p>
      </animated.div>
      <h3>What do you do?</h3>
      <div className="options">
        {scenario.options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => onChoice(option)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isChoosing} // Disable button when choosing
            style={{ 
              opacity: isChoosing ? 0.5 : 1,
              cursor: isChoosing ? 'not-allowed' : 'pointer'
            }}
          >
            {option.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default Scenario;