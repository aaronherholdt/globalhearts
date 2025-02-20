import React, { useState } from 'react';
import { FaHeart } from 'react-icons/fa';

function ReflectionSpace({ prompt, onSave, reflectionText, setReflectionText }) {
  const [localReflection, setLocalReflection] = useState(reflectionText || '');

  const handleSave = (e) => {
    if (e && (e.type === 'touchstart' || e.type === 'click')) {
      e.preventDefault();
      if (localReflection.trim()) {
        onSave(localReflection, e);
        setReflectionText(''); // Clear after saving to Firebase, but keep locally for reuse if needed
        setLocalReflection(''); // Reset local state for next reflection
      }
    }
  };

  return (
    <div className="reflection-space">
      <h3>Reflection Space <FaHeart style={{ color: '#f9e79f' }} /></h3>
      <p>{prompt}</p>
      <textarea
        rows="5"
        cols="50"
        value={localReflection}
        onChange={(e) => setLocalReflection(e.target.value)}
        placeholder="Type your thoughts here..."
        aria-label="Reflection text input"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleSave(e)}
        style={{ 
          width: '80%', 
          maxWidth: '100%', 
          marginTop: '10px', 
          padding: '10px', 
          borderRadius: '5px', 
          border: '1px solid #ccc', 
          fontSize: '1em', 
          touchAction: 'manipulation' 
        }}
      />
      <br />
      <button 
        onClick={handleSave}
        onTouchStart={handleSave}
        disabled={!localReflection.trim()}
        style={{ marginTop: '10px' }}
        aria-label="Save your reflection"
        tabIndex={0}
      >
        Save Reflection <FaHeart style={{ color: '#f9e79f' }} />
      </button>
    </div>
  );
}

export default ReflectionSpace;