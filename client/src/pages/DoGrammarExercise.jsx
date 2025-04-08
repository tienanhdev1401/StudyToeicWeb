import React, { useState, useEffect } from 'react';
import { FaRedo } from 'react-icons/fa';
import '../styles/DoGrammarExercise.css';

const DoGrammarExercise = () => {
  const questions = [
    {
      id: 1,
      content: "Our company strengthened ____ by hiring more guards.",
      optionA: "security",
      optionB: "secure",
      optionC: "secured",
      optionD: "securing",
      correctOption: "A"
    },
    {
      id: 2,
      content: "She enjoys ____ to music while working.",
      optionA: "listen",
      optionB: "listening",
      optionC: "listened",
      optionD: "to listen",
      correctOption: "B"
    },
    {
      id: 3,
      content: "If I ____ you, I would accept the offer.",
      optionA: "am",
      optionB: "was",
      optionC: "were",
      optionD: "have been",
      correctOption: "C"
    },
    {
      id: 4,
      content: "He ____ his homework before going out to play.",
      optionA: "finished",
      optionB: "had finished",
      optionC: "has finished",
      optionD: "was finished",
      correctOption: "B"
    },
    {
      id: 5,
      content: "The book ____ on the table belongs to me.",
      optionA: "lying",
      optionB: "lie",
      optionC: "lay",
      optionD: "laid",
      correctOption: "A"
    },
    {
      id: 6,
      content: "Neither John nor his brothers ____ interested in sports.",
      optionA: "is",
      optionB: "are",
      optionC: "was",
      optionD: "has been",
      correctOption: "B"
    },
    {
      id: 7,
      content: "She suggested that he ____ a doctor.",
      optionA: "see",
      optionB: "sees",
      optionC: "saw",
      optionD: "would see",
      correctOption: "A"
    },
    {
      id: 8,
      content: "By next year, I ____ here for five years.",
      optionA: "will work",
      optionB: "will be working",
      optionC: "will have worked",
      optionD: "have worked",
      correctOption: "C"
    },
    {
      id: 9,
      content: "The harder you work, ____ you'll become.",
      optionA: "the more successful",
      optionB: "the most successful",
      optionC: "more successful",
      optionD: "successfuller",
      correctOption: "A"
    },
    {
      id: 10,
      content: "I wish I ____ how to swim when I was younger.",
      optionA: "learned",
      optionB: "had learned",
      optionC: "would learn",
      optionD: "have learned",
      correctOption: "B"
    }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);

  // Calculate correct answers
  const correctAnswersCount = Object.values(selectedAnswers).filter(
    answer => answer.isCorrect
  ).length;

  // Check conditions
  const allQuestionsAnswered = Object.keys(selectedAnswers).length === questions.length;
  const meetsPassingScore = correctAnswersCount >= Math.ceil(questions.length * 0.8);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canComplete = allQuestionsAnswered && meetsPassingScore;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsAnswered(false);
  }, [currentQuestionIndex]);

  const handleOptionSelect = (questionId, optionId) => {
    if (isAnswered) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.correctOption === optionId;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: {
        optionId,
        isCorrect
      }
    }));
    
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleComplete = () => {
    // Handle quiz completion logic here
    alert(`Bạn đã hoàn thành với ${correctAnswersCount}/${questions.length} câu đúng!`);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeSpent(0);
    setIsAnswered(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = selectedAnswers[currentQuestion.id];

  const currentOptions = [
    { id: 'A', text: currentQuestion.optionA },
    { id: 'B', text: currentQuestion.optionB },
    { id: 'C', text: currentQuestion.optionC },
    { id: 'D', text: currentQuestion.optionD }
  ];

  return (
    <div className="grammar-exercise-container">
      <div className="question-card">
        <div className="question-header">
          <h2 className="question-number">Câu hỏi {currentQuestion.id}.</h2>
          <div className="timer">{formatTime(timeSpent)}</div>
        </div>
        <p className="question-text">{currentQuestion.content}</p>
        
        <div className="options-list">
          {currentOptions.map(option => {
            const isSelected = currentAnswer?.optionId === option.id;
            const isCorrectOption = option.id === currentQuestion.correctOption;
            let optionClass = "option-item";
            
            if (isAnswered) {
              if (isSelected) {
                optionClass += isCorrectOption ? " correct" : " incorrect";
              } else if (isCorrectOption) {
                optionClass += " correct";
              }
            }
            
            return (
              <label 
                key={option.id} 
                className={optionClass}
                onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
              >
                <input 
                  type="radio" 
                  name={`answer-${currentQuestion.id}`} 
                  className="option-radio" 
                  checked={isSelected}
                  onChange={() => {}}
                />
                <span className="option-label">{option.id}. {option.text}</span>
              </label>
            );
          })}
        </div>
        
        {isAnswered && currentAnswer && (
          <div className="feedback">
            {currentAnswer.isCorrect ? (
              <p className="correct-feedback">Chính xác!</p>
            ) : (
              <p className="incorrect-feedback">Không chính xác!</p>
            )}
          </div>
        )}
        
        <div className="navigation-buttons">
          {isLastQuestion && allQuestionsAnswered ? (
            <>
              <button 
                className={`nav-button ${canComplete ? 'complete-button' : 'disabled-complete-button'}`}
                onClick={handleComplete}
                disabled={!canComplete}
              >
                Hoàn thành
              </button>
              {!meetsPassingScore && (
                <p className="score-warning">
                  Cần {Math.ceil(questions.length * 0.8)}/{questions.length} câu đúng để hoàn thành
                </p>
              )}
            </>
          ) : (
            <button 
              className="nav-button next-button" 
              onClick={handleNextQuestion}
              disabled={!isAnswered}
            >
              Câu tiếp
            </button>
          )}
        </div>
      </div>

      <div className="navigation-panel">
        <div className="navigation-header">
          <span className="questions-range">Câu hỏi 1-{questions.length}</span>
          <button className="restart-btn" onClick={handleRestart}>
            <FaRedo className="restart-icon" />
            Restart
          </button>
        </div>
        
        <div className="question-indicators">
          {questions.map(question => {
            const answer = selectedAnswers[question.id];
            let indicatorClass = "indicator";
            
            if (answer) {
              indicatorClass += answer.isCorrect ? " correct" : " incorrect";
            } else {
              indicatorClass += " pending";
            }
            
            if (question.id === currentQuestion.id) {
              indicatorClass += " current";
            }
            
            return (
              <div 
                key={question.id}
                className={indicatorClass}
              >
                {question.id}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DoGrammarExercise;