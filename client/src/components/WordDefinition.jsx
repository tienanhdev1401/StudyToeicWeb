import React from 'react';
import '../styles/WordDefinition.css';

const WordDefinition = ({ entry }) => {
  const playAudio = () => {
    if (entry.pronunciation.audioUrl) {
      const audio = new Audio(entry.pronunciation.audioUrl);
      audio.play().catch(err => console.error('Failed to play audio:', err));
    }
  };

  return (
    <div className="word-definition">
      <div className="word-header">
        <h2>{entry.word}</h2>
        {entry.pronunciation.text && (
          <span className="phonetic">/{entry.pronunciation.text}/</span>
        )}
        {entry.pronunciation.audioUrl && (
          <button 
            className="audio-button" 
            onClick={playAudio}
            aria-label="Listen to pronunciation"
          >
            🔊
          </button>
        )}
      </div>

      {entry.origin && (
        <div className="origin">
          <h3>Origin</h3>
          <p>{entry.origin}</p>
        </div>
      )}

      <div className="meanings">
        {entry.meanings.map((meaning, index) => (
          <div key={index} className="meaning">
            <h3 className="part-of-speech">{meaning.partOfSpeech}</h3>
            <ol className="definitions">
              {meaning.definitions.map((def, idx) => (
                <li key={idx}>
                  <div className="definition">{def.text}</div>
                  {def.example && (
                    <div className="example">"{def.example}"</div>
                  )}
                  {def.synonyms.length > 0 && (
                    <div className="synonyms">
                      <span>Synonyms: </span>
                      {def.synonyms.join(', ')}
                    </div>
                  )}
                  {def.antonyms.length > 0 && (
                    <div className="antonyms">
                      <span>Antonyms: </span>
                      {def.antonyms.join(', ')}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordDefinition;