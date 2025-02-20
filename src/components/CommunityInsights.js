import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaUser, FaCheck, FaStar, FaLightbulb, FaHandsHelping } from 'react-icons/fa';
import { collection, query, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase-config.js';

function CommunityInsights({ currentPlayer }) {
  // Ensure currentPlayer has default scores
  const defaultScores = {
    empathy: 0,
    resilience: 0,
    compassion: 0,
    selfAwareness: 0
  };

  // Add default scores if they don't exist
  const playerWithScores = {
    ...currentPlayer,
    scores: currentPlayer?.scores || defaultScores
  };

  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [comparison, setComparison] = useState({
    similarities: [],
    differences: [],
    learningPoints: [],
    scores: defaultScores
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const q = query(collection(db, 'choices'), orderBy('timestamp', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);
      
      const playerChoices = {};
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!playerChoices[data.playerName]) {
          playerChoices[data.playerName] = {
            name: data.playerName,
            role: data.playerRole,
            scores: data.points || {},
            choices: []
          };
        }
        playerChoices[data.playerName].choices.push(data);
        // Accumulate scores
        Object.entries(data.points || {}).forEach(([skill, points]) => {
          playerChoices[data.playerName].scores[skill] = 
            (playerChoices[data.playerName].scores[skill] || 0) + points;
        });
      });
      
      setPlayers(Object.values(playerChoices));
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const getHighestSkill = (scores) => {
    if (!scores || Object.keys(scores).length === 0) return 'No skills yet';
    return Object.entries(scores).reduce((a, b) => 
      (a[1] > b[1] ? a : b))[0];
  };

  const inviteToChallenge = (player) => {
    // Create a new collaboration room
    createCollaborationRoom(player);
  };

  const createCollaborationRoom = async (partner) => {
    try {
      const roomRef = await addDoc(collection(db, 'collaborationRooms'), {
        players: [currentPlayer.name, partner.name],
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      
      alert(`Share this code with ${partner.name}: ${roomRef.id}`);
    } catch (error) {
      console.error('Error creating collaboration room:', error);
    }
  };

  const compareWithPlayer = (player) => {
    setSelectedPlayer(player);
    
    const similarities = player.choices.filter(choice => 
      currentPlayer.choices.some(currentChoice => 
        currentChoice.scenarioTitle === choice.scenarioTitle &&
        currentChoice.choice === choice.choice
      )
    );
    
    const differences = player.choices.filter(choice =>
      currentPlayer.choices.some(currentChoice =>
        currentChoice.scenarioTitle === choice.scenarioTitle &&
        currentChoice.choice !== choice.choice
      )
    );
    
    const learningPoints = differences.map(diff => ({
      scenario: diff.scenarioTitle,
      insight: `Different approaches can work! ${player.name} chose "${diff.choice}" while you chose a different path.`
    }));
    
    setComparison({
      similarities,
      differences,
      learningPoints,
      scores: player.scores
    });
  };

  return (
    <div className="community-insights">
      <h2>Learning Together! <FaLightbulb /></h2>
      <p className="insight-intro">See how other players handled similar situations and what we can learn from each other!</p>
      
      <div className="skill-comparison">
        <h3>Your Skills Dashboard</h3>
        <div className="skill-bars">
          {Object.entries(playerWithScores.scores).map(([skill, score]) => (
            <div key={skill} className="skill-bar">
              <label>{skill}</label>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ 
                    width: `${(score / 100) * 100}%`,
                    backgroundColor: skill === getHighestSkill(playerWithScores.scores) ? '#e74c3c' : '#3498db'
                  }}
                />
              </div>
              <span>{score}</span>
            </div>
          ))}
        </div>
        <p className="highest-skill">
          Your strongest skill is <strong>{getHighestSkill(playerWithScores.scores)}</strong>!
        </p>
      </div>

      <div className="player-cards">
        {players.map(player => {
          const playerScores = player.scores || defaultScores;
          return (
            <motion.div
              key={player.name}
              className="player-card"
              whileHover={{ scale: 1.05 }}
            >
              <div className="player-avatar">
                <FaUser style={{ fontSize: '2.5em', color: '#3498db' }} />
                <FaStar style={{ 
                  position: 'absolute', 
                  bottom: -5, 
                  right: -5, 
                  color: '#f1c40f',
                  fontSize: '1.5em'
                }} />
              </div>
              <h3>{player.name}</h3>
              <p className="player-role">{player.role}</p>
              <div className="player-skills">
                <p>Top Skill: {getHighestSkill(playerScores)}</p>
                <p>Score: {Math.max(...Object.values(playerScores))}</p>
              </div>
              <div className="player-actions">
                <button onClick={() => compareWithPlayer(player)}>Compare</button>
                <button onClick={() => inviteToChallenge(player)}>
                  Invite to Challenge <FaHandsHelping />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedPlayer && (
        <motion.div 
          className="comparison-results"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3>
            <FaHandsHelping style={{ color: '#3498db', marginRight: '10px' }} />
            Learning from {selectedPlayer.name}
          </h3>
          
          <div className="comparison-stats">
            <div className="stat-box">
              <FaCheck style={{ color: '#27ae60' }} />
              <p>{comparison.similarities.length} Similar Choices</p>
            </div>
            <div className="stat-box">
              <FaLightbulb style={{ color: '#f39c12' }} />
              <p>{comparison.differences.length} Different Approaches</p>
            </div>
          </div>

          {comparison.similarities.length > 0 && (
            <div className="similar-choices">
              <h4>You Both Chose:</h4>
              {comparison.similarities.map((choice, index) => (
                <motion.div 
                  key={index}
                  className="choice-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FaHeart style={{ color: '#e74c3c' }} />
                  <p>In "{choice.scenarioTitle}": "{choice.choice}"</p>
                </motion.div>
              ))}
            </div>
          )}

          {comparison.learningPoints.length > 0 && (
            <div className="learning-points">
              <h4>Learning Points:</h4>
              {comparison.learningPoints.map((point, index) => (
                <motion.div 
                  key={index}
                  className="learning-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FaLightbulb style={{ color: '#f39c12' }} />
                  <div>
                    <h5>{point.scenario}</h5>
                    <p>{point.insight}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default CommunityInsights; 