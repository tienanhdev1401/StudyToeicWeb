import React, { useState, useEffect } from 'react';
import { FaRedo } from 'react-icons/fa';
import '../styles/DoVocabularyExercise.css';

const DoVocabularyExercise = () => {
  const questions = [
    {
      id: 1,
      content: "What is the correct meaning of 'Examination'?",
      imageUrl: "https://genk.mediacdn.vn/zoom/700_438/139269124445442048/2024/5/24/73x6dacwjzc4hmkxklys2rtwpa-1716538725285748542169-0-70-594-1020-crop-17165387303591233547512.jpg", // Can be empty string if no image
      optionA: "Bài kiểm tra",
      optionB: "Cuộc họp",
      optionC: "Bữa tiệc",
      optionD: "Chuyến đi",
      correctOption: "A"
    },
    {
      id: 2,
      content: "What is the correct meaning of 'Quiz'?",
      imageUrl: "https://genk.mediacdn.vn/zoom/700_438/139269124445442048/2024/5/24/73x6dacwjzc4hmkxklys2rtwpa-1716538725285748542169-0-70-594-1020-crop-17165387303591233547512.jpg",
      optionA: "Bài hát",
      optionB: "Câu đố",
      optionC: "Bức tranh",
      optionD: "Câu chuyện",
      correctOption: "B"
    },
    {
      id: 3,
      content: "What is the correct meaning of 'Practice'?",
      imageUrl: "", // Empty image URL
      optionA: "Luyện tập",
      optionB: "Nghỉ ngơi",
      optionC: "Đọc sách",
      optionD: "Viết lách",
      correctOption: "A"
    },
    {
      id: 4,
      content: "What is the correct meaning of 'Assessment'?",
      imageUrl: "https://genk.mediacdn.vn/zoom/700_438/139269124445442048/2024/5/24/73x6dacwjzc4hmkxklys2rtwpa-1716538725285748542169-0-70-594-1020-crop-17165387303591233547512.jpg",
      optionA: "Trò chuyện",
      optionB: "Đánh giá",
      optionC: "Mua sắm",
      optionD: "Du lịch",
      correctOption: "B"
    },
    {
      id: 5,
      content: "What is the correct meaning of 'Homework'?",
      imageUrl: "",
      optionA: "Bài tập về nhà",
      optionB: "Công việc nhà",
      optionC: "Dọn dẹp",
      optionD: "Nấu ăn",
      correctOption: "A"
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
    <div className="vocabulary-exercise-container">
      <div className="question-card">
        <div className="question-header">
          <h2 className="question-number">Câu hỏi {currentQuestion.id}.</h2>
          <div className="timer">{formatTime(timeSpent)}</div>
        </div>
        
        {/* Display image if available */}
        {currentQuestion.imageUrl && (
          <div className="question-image-container">
          <img 
            src={currentQuestion.imageUrl} 
            alt="Vocabulary illustration" 
            className="question-image"
            style={{
              maxWidth: '300px',
              maxHeight: '200px',
              borderRadius: '8px',
              objectFit: 'contain'
            }}
          />
        </div>
        )}
        
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
                onClick={() => setCurrentQuestionIndex(question.id - 1)}
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

export default DoVocabularyExercise;