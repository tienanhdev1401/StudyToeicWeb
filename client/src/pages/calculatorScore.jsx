import React, { useState } from 'react';
import ScoreService from '../services/scoreService';

const TOEICCalculator = () => {
  const [listeningCorrect, setListeningCorrect] = useState(0);
  const [readingCorrect, setReadingCorrect] = useState(0);
  const [scores, setScores] = useState({
    listening: 0,
    reading: 0,
    total: 0
  });

  const scoreService = new ScoreService();

  const handleCalculate = () => {
    const listeningScore = scoreService.calculateListeningScore(listeningCorrect);
    const readingScore = scoreService.calculateReadingScore(readingCorrect);
    const totalScore = listeningScore + readingScore;

    setScores({
      listening: listeningScore,
      reading: readingScore,
      total: totalScore
    });
  };

  return (
    <div className="toeic-calculator">
      <h2>TOEIC Score Calculator</h2>
      
      <div className="input-group">
        <label>
          Listening (Số câu đúng):
          <input
            type="number"
            min="0"
            max="100"
            value={listeningCorrect}
            onChange={(e) => setListeningCorrect(parseInt(e.target.value) || 0)}
          />
        </label>
      </div>
      
      <div className="input-group">
        <label>
          Reading (Số câu đúng):
          <input
            type="number"
            min="0"
            max="100"
            value={readingCorrect}
            onChange={(e) => setReadingCorrect(parseInt(e.target.value) || 0)}
          />
        </label>
      </div>
      
      <button onClick={handleCalculate}>Tính Điểm</button>
      
      <div className="results">
        <h3>Kết quả:</h3>
        <p>Listening: {scores.listening}</p>
        <p>Reading: {scores.reading}</p>
        <p>Tổng điểm TOEIC: {scores.total}</p>
      </div>
    </div>
  );
};

export default TOEICCalculator;