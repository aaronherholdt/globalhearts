import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaTrophy, FaArrowUp, FaArrowDown, FaUsers } from 'react-icons/fa';

function GameSummary({ 
  playerName, 
  playerRole, 
  emotionalIndex, 
  allPlayerData, 
  onTeammateSelect 
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [matchSuggestions, setMatchSuggestions] = useState([]);

  // Find best and worst scores
  const scores = Object.entries(emotionalIndex).map(([skill, value]) => ({
    skill,
    value
  }));

  const bestScore = scores.reduce((max, score) => 
    score.value > max.value ? score : max
  );

  const worstScore = scores.reduce((min, score) => 
    score.value < min.value ? score : min
  );

  // Get player rankings
  const getSkillRanking = (skill, value) => {
    const allScores = allPlayerData.map(player => 
      player.scores?.[skill] || 0
    ).sort((a, b) => b - a);
    
    return allScores.indexOf(value) + 1;
  };

  const bestRank = getSkillRanking(bestScore.skill, bestScore.value);
  const worstRank = getSkillRanking(worstScore.skill, worstScore.value);

  // Calculate compatibility scores when component mounts
  useEffect(() => {
    // Filter out current player and calculate compatibility
    const suggestions = allPlayerData
      .filter(player => player.name !== playerName)
      .map(player => ({
        ...player,
        compatibility: calculateCompatibility(emotionalIndex, player.scores || {})
      }))
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 3); // Get top 3 matches

    setMatchSuggestions(suggestions);
  }, [allPlayerData, playerName, emotionalIndex]);

  // Calculate compatibility between two players
  const calculateCompatibility = (player1Scores, player2Scores) => {
    let compatibilityScore = 0;
    
    // Higher score for complementary skills
    Object.entries(player1Scores).forEach(([skill, value]) => {
      const diff = Math.abs(value - (player2Scores[skill] || 0));
      if (diff > 5) { // Skills are complementary
        compatibilityScore += 2;
      } else { // Skills are similar
        compatibilityScore += 1;
      }
    });

    return compatibilityScore;
  };

  return (
    <motion.div 
      className="game-summary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Journey Complete! <FaTrophy style={{ color: '#f1c40f' }} /></h2>
      
      {/* Best Score Section */}
      <motion.div 
        className="score-highlight best-score"
        initial={{ x: -50 }}
        animate={{ x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3>
          <FaArrowUp style={{ color: '#2ecc71' }} /> Your Strongest Skill
        </h3>
        <p>
          {bestScore.skill.replace(/([A-Z])/g, ' $1').trim()}: {bestScore.value}
          <br />
          Ranked #{bestRank} among all players!
        </p>
      </motion.div>

      {/* Worst Score Section */}
      <motion.div 
        className="score-highlight worst-score"
        initial={{ x: 50 }}
        animate={{ x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3>
          <FaArrowDown style={{ color: '#e74c3c' }} /> Area for Growth
        </h3>
        <p>
          {worstScore.skill.replace(/([A-Z])/g, ' $1').trim()}: {worstScore.value}
          <br />
          Ranked #{worstRank} among all players
        </p>
      </motion.div>

      {/* Global Rankings */}
      <motion.div 
        className="global-rankings"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3><FaUsers /> Global Rankings</h3>
        <div className="players-grid">
          {allPlayerData.map((player, index) => (
            <motion.div 
              key={player.name}
              className={`player-card ${selectedPlayer?.name === player.name ? 'selected' : ''}`}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedPlayer(player)}
            >
              <h4>{player.name}</h4>
              <p>{player.role}</p>
              <div className="player-scores">
                {Object.entries(player.scores || {}).map(([skill, value]) => (
                  <div key={skill} className="mini-score">
                    {skill.charAt(0).toUpperCase()}: {value}
                  </div>
                ))}
              </div>
              <div className="total-score">
                Total Growth: {player.growth} <FaHeart style={{ color: '#e74c3c' }} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Suggested Teammates Section */}
      <motion.div 
        className="teammate-suggestions"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h3>
          <FaUsers style={{ color: '#3498db' }} /> 
          Suggested Teammates
        </h3>
        <p className="suggestion-intro">
          These players would make great partners for your next challenge!
        </p>
        
        <div className="suggested-players-grid">
          {matchSuggestions.map((player, index) => (
            <motion.div 
              key={player.name}
              className={`player-suggestion ${selectedPlayer?.name === player.name ? 'selected' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedPlayer(player)}
            >
              <div className="player-info">
                <h4>{player.name}</h4>
                <p className="player-role">{player.role}</p>
                <div className="compatibility-score">
                  <FaHeart style={{ color: '#e74c3c' }} />
                  <span>{Math.round(player.compatibility * 10)}% Match</span>
                </div>
              </div>
              
              <div className="complementary-skills">
                <h5>Strongest Skills:</h5>
                {Object.entries(player.scores || {})
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 2)
                  .map(([skill, value]) => (
                    <div key={skill} className="skill-tag">
                      {skill}: {value}
                    </div>
                  ))
                }
              </div>
            </motion.div>
          ))}
        </div>

        {selectedPlayer && (
          <motion.div 
            className="teammate-confirmation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h4>Team Up with {selectedPlayer.name}?</h4>
            <p>
              Your {bestScore.skill} ({bestScore.value}) and their {
                Object.entries(selectedPlayer.scores || {})
                  .reduce((max, [skill, value]) => 
                    value > max.value ? { skill, value } : max,
                    { skill: '', value: -Infinity }
                  ).skill
              } would make a strong combination!
            </p>
            <motion.button 
              className="team-up-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTeammateSelect(selectedPlayer)}
            >
              Start Challenge Together! <FaUsers />
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default GameSummary; 