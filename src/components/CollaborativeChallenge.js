import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaUsers, FaHandsHelping, FaStar, FaUser } from 'react-icons/fa';
import { onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

function CollaborativeChallenge({ player, teammate, sessionId, onComplete }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [scores, setScores] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(challenges[0]);

  // Collaborative challenges pool
  const challenges = [
    {
      title: "Climate Action Initiative",
      description: `You and ${teammate.name} are leading a school environmental project.`,
      situation: "The school wants to reduce its carbon footprint. How do you work together?",
      choices: [
        {
          text: "Combine your ideas: your recycling program and their energy-saving plan",
          points: { teamwork: 10, innovation: 8, impact: 9 },
          feedback: "Perfect collaboration! You created a comprehensive solution."
        },
        {
          text: "Focus only on your own recycling idea",
          points: { teamwork: 2, innovation: 5, impact: 4 },
          feedback: "The project was limited by not incorporating your teammate's insights."
        },
        {
          text: "Let your teammate take the lead entirely",
          points: { teamwork: 3, innovation: 2, impact: 3 },
          feedback: "While supportive, true collaboration means active participation from both partners."
        }
      ]
    },
    // Add more challenges as needed
  ];

  // Monitor session changes
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = onSnapshot(doc(db, 'sessions', sessionId), (doc) => {
      if (doc.exists()) {
        const sessionData = doc.data();
        // Update local state based on session changes
        if (sessionData.challenge) {
          setCurrentChallenge(sessionData.challenge);
        }
      }
    });

    return () => unsubscribe();
  }, [sessionId]);

  const handleChoice = async (choice) => {
    if (!sessionId) return;

    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        [`players.${player.name}.choice`]: choice,
        lastUpdate: new Date().toISOString()
      });

      setSelectedChoice(choice);
      setFeedback(choice.feedback);

      // Calculate combined scores
      const teamScores = {
        player: {
          name: player.name,
          addedPoints: Math.floor(
            (choice.points.teamwork + choice.points.innovation + choice.points.impact) / 2
          )
        },
        teammate: {
          name: teammate.name,
          addedPoints: Math.floor(
            (choice.points.teamwork + choice.points.innovation + choice.points.impact) / 2
          )
        },
        totalTeamScore: choice.points.teamwork + choice.points.innovation + choice.points.impact
      };

      setScores(teamScores);

      // Show feedback and scores for 5 seconds before completing
      setTimeout(() => {
        onComplete(teamScores);
      }, 5000);
    } catch (error) {
      console.error('Error updating choice:', error);
    }
  };

  return (
    <motion.div 
      className="collaborative-challenge"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>
        <FaHandsHelping style={{ color: '#3498db' }} /> 
        Team Challenge: {currentChallenge.title}
      </h2>

      <div className="team-members">
        <div className="team-member">
          <FaUser /> {player.name}
          <span className="role">{player.role}</span>
        </div>
        <FaHeart style={{ color: '#e74c3c' }} />
        <div className="team-member">
          <FaUser /> {teammate.name}
          <span className="role">{teammate.role}</span>
        </div>
      </div>

      <motion.div 
        className="challenge-description"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p>{currentChallenge.description}</p>
        <h3>{currentChallenge.situation}</h3>
      </motion.div>

      {!selectedChoice ? (
        <div className="challenge-choices">
          {currentChallenge.choices.map((choice, index) => (
            <motion.button
              key={index}
              className="choice-button"
              onClick={() => handleChoice(choice)}
              disabled={selectedChoice}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {choice.text}
            </motion.button>
          ))}
        </div>
      ) : (
        <motion.div 
          className="challenge-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {feedback && (
            <div className="feedback">
              <FaStar style={{ color: '#f1c40f' }} />
              <p>{feedback}</p>
            </div>
          )}
          
          {scores && (
            <div className="team-scores">
              <h3>Team Performance</h3>
              <div className="score-cards">
                <div className="score-card">
                  <h4>{scores.player.name}</h4>
                  <p>+{scores.player.addedPoints} Growth Points</p>
                </div>
                <div className="score-card">
                  <h4>{scores.teammate.name}</h4>
                  <p>+{scores.teammate.addedPoints} Growth Points</p>
                </div>
              </div>
              <div className="total-team-score">
                <FaUsers style={{ color: '#3498db' }} />
                <h4>Total Team Score: {scores.totalTeamScore}</h4>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default CollaborativeChallenge;