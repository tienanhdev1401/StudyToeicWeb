import React, { useState, useEffect } from 'react';
import { FaRedo } from 'react-icons/fa';
import ExerciseService from '../services/exerciseService';
import '../styles/DoGrammarExercise.css';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const DoExercise = () => {
  
  const navigate = useNavigate();
  const {exerciseId} = useParams();
  const [exercise, setExercise] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);


  //lay data truyen tu state learn-grammar hoac len leanr-vocabulary
  const location = useLocation();
  const topicType = location.state?.topicType || 'Unknown';
  const topicId= location.state?.topicId;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch single exercise
  useEffect(() => {
    const fetchExercise = async () => {
      try {
        // Get exerciseId from navigation state or URL params
        
        // console.log('Hunganh',exerciseId)
        if (!exerciseId) {
          throw new Error('Exercise ID not provided');
        }

        const fetchedExercise = await ExerciseService.getExerciseById(exerciseId);
        console.log('Fetched exercise:', fetchedExercise);
        
        if (!fetchedExercise || !fetchedExercise.questions) {
          setLoading(false);
          return;
        }

        setExercise(fetchedExercise);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching exercise:', err);
        setLoading(false);
      }
    };

    fetchExercise();
  }, [location.state]);

  // Reset answered state when question changes
  useEffect(() => {
    setIsAnswered(false);
  }, [currentQuestionIndex]);

  const handleOptionSelect = (questionId, optionId) => {
    if (isAnswered || !exercise?.questions?.length) return;

    const currentQuestion = exercise.questions[currentQuestionIndex];
    const isCorrect = currentQuestion.correctAnswer === optionId;

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
    if (currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleComplete = () => {
    const correctAnswersCount = Object.values(selectedAnswers).filter(a => a.isCorrect).length;
    alert(`Bạn đã hoàn thành với ${correctAnswersCount}/${exercise.questions.length} câu đúng!`);
    // navigate('/'); // Navigate back to home or another route
    // Navigate based on topicType
    if (topicType === 'Vocabulary' && topicId) {
      navigate(`/learn-vocabulary/${topicId}`);
    } else if (topicType === 'Grammar' && topicId) {
      navigate(`/learn-grammar/${topicId}`);
    } else {
      navigate('/toeic-exercise');
    }
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

  if (loading) return <div>Đang tải bài tập...</div>;
  if (!exercise) return <div>Không tìm thấy bài tập.</div>;
  if (!exercise.questions || exercise.questions.length === 0) return <div>Bài tập không có câu hỏi.</div>;

  // Calculate progress
  const questions = exercise.questions;
  const correctAnswersCount = Object.values(selectedAnswers).filter(a => a.isCorrect).length;
  const allQuestionsAnswered = Object.keys(selectedAnswers).length === questions.length;
  const meetsPassingScore = correctAnswersCount >= Math.ceil(questions.length * 0.8);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canComplete = allQuestionsAnswered && meetsPassingScore;

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = selectedAnswers[currentQuestion.id];

  const currentOptions = [
    { id: 'A', text: currentQuestion.optionA },
    { id: 'B', text: currentQuestion.optionB },
    { id: 'C', text: currentQuestion.optionC },
    { id: 'D', text: currentQuestion.optionD }
  ];

  // Function to get class name for an option
  const getOptionClassName = (option) => {
    const isSelected = currentAnswer?.optionId === option.id;
    const isCorrectOption = option.id === currentQuestion.correctAnswer;
    
    let className = "option-item";
    
    if (isAnswered) {
      if (isSelected) {
        className += isCorrectOption ? " correct" : " incorrect";
      } 
      else if (isCorrectOption && currentAnswer && !currentAnswer.isCorrect) {
        className += " correct-answer";
      }
    }
    
    return className;
  };

  return (
    <div className="grammar-exercise-container">
      <div className="question-card">
        <div className="question-header">
          <h2 className="question-number">Câu hỏi {currentQuestionIndex + 1}</h2>
          <div className="timer">{formatTime(timeSpent)}</div>
        </div>

        {currentQuestion.resource?.urlImage && (
          <div 
            className="question-image-container"
            style={{
              width: '500px',
              height: '500px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              margin: '1rem auto',
              borderRadius: '8px',
              backgroundColor: '#f5f5f5'
            }}
          >
            <img 
              src={currentQuestion.resource.urlImage} 
              alt="Question illustration"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
        )}

        <p className="question-text">{currentQuestion.content}</p>

        <div className="options-list">
          {currentOptions.map(option => (
            <label 
              key={option.id} 
              className={getOptionClassName(option)}
              onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
            >
              <input 
                type="radio" 
                name={`answer-${currentQuestion.id}`} 
                className="option-radio" 
                checked={currentAnswer?.optionId === option.id}
                onChange={() => {}}
                disabled={isAnswered}
              />
              <span className="option-label">{option.id}. {option.text}</span>
            </label>
          ))}
        </div>
        
        {isAnswered && currentAnswer && (
          <div className="feedback">
            {currentAnswer.isCorrect ? (
              <p className="correct-feedback">Chính xác!</p>
            ) : (
              <p className="incorrect-feedback">Không chính xác!</p>
            )}
            {currentQuestion.explainDetail && (
              <p className="explanation">{currentQuestion.explainDetail}</p>
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
            Làm lại
          </button>
        </div>
        <div className="question-indicators">
          {questions.map((q, index) => {
            const answer = selectedAnswers[q.id];
            let indicatorClass = "indicator";
            
            if (answer) {
              indicatorClass += answer.isCorrect ? " correct" : " incorrect";
            } else {
              indicatorClass += " pending";
            }
            
            if (index === currentQuestionIndex) {
              indicatorClass += " current";
            }
            
            return (
              <div 
                key={q.id}
                className={indicatorClass}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DoExercise;