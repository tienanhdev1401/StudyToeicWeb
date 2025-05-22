import React, { useState, useEffect, useRef } from 'react';
import { FaRedo } from 'react-icons/fa';
import ExerciseService from '../services/exerciseService';
import '../styles/DoGrammarExercise.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

// --- State Design Pattern Implementation ---

// Base State Class (acting as conceptual interface)
// Lớp State cơ sở (đóng vai trò là interface khái niệm)
class BaseState {
  constructor(context) {
    if (new.target === BaseState) {
      throw new TypeError("Cannot construct BaseState instances directly");
    }
    this.context = context;
  }

  handleSelectAnswer(questionId, optionId) {
    
  }

  handleNext() {
    
  }

  handleComplete() {
    
  }

  handleRestart() {
    
  }

   // Methods to get state-specific data for rendering, if needed
   // Các phương thức để lấy dữ liệu đặc trưng của trạng thái để render UI (nếu cần)
   getButtonText() { return '...'; }

   // Determine if next button should be disabled
   // Xác định xem nút Tiếp theo có nên bị vô hiệu hóa hay không
   isNextDisabled() { return true; }

   // Determine if complete button should be disabled
   // Xác định xem nút Hoàn thành có nên bị vô hiệu hóa hay không
   isCompleteButtonDisabled() { return true; }

   // Method for navigating to a specific question, default implementation might be here
   // Phương thức để chuyển đến một câu hỏi cụ thể, triển khai mặc định có thể ở đây
   goToQuestion(index) {
   }
}



// /** @implements {State} */ // JSDoc @implements no longer strictly needed with base class
 class AnsweringState extends BaseState {
   constructor(context) {
     super(context);
   }

   handleSelectAnswer(questionId, optionId) {
     const currentQuestion = this.context.exercise?.questions?.[this.context.currentQuestionIndex];
     if (!currentQuestion || this.context.selectedAnswers[currentQuestion.id]) {
       return; // Đã trả lời hoặc không có câu hỏi
     }

     const isCorrect = currentQuestion.correctAnswer === optionId;

     const newSelectedAnswers = {
       ...this.context.selectedAnswers,
       [currentQuestion.id]: {
         optionId,
         isCorrect
       }
     };

     this.context.selectedAnswers = newSelectedAnswers;

     // Lưu vào localStorage ngay sau khi chọn đáp án
     localStorage.setItem(`exerciseAnswers_${this.context.exercise.id}`, JSON.stringify({
       selectedAnswers: newSelectedAnswers,
       currentQuestionIndex: this.context.currentQuestionIndex // Lưu cả chỉ số câu hỏi hiện tại
     }));

     this.context.notifyListeners(); // Thông báo cho component re-render
   }

   handleNext() {
     // Chỉ chuyển tiếp nếu câu hỏi hiện tại đã được trả lời và không phải là câu cuối cùng
     const currentQ = this.context.exercise?.questions?.[this.context.currentQuestionIndex];
     if (currentQ && this.context.selectedAnswers[currentQ.id] && this.context.currentQuestionIndex < this.context.exercise.questions.length - 1) {
       this.context.currentQuestionIndex += 1;
       this.context.notifyListeners(); // Thông báo cho component re-render
     }
   }

   handleComplete() {
       // Kiểm tra xem tất cả câu hỏi đã được trả lời trước khi hoàn thành
       if (this.context.exercise && Object.keys(this.context.selectedAnswers).length === this.context.exercise.questions.length) {
           // Chuyển sang CompletedState
           this.context.setState(new CompletedState(this.context));
           // Sau khi chuyển trạng thái thành công, gọi lại complete() để kích hoạt logic trong CompletedState
           this.context.complete();
            // Xử lý chuyển trang và xóa localStorage trong CompletedState sau khi chuyển trạng thái
       }
   }

   handleRestart() {
     // Xóa localStorage khi làm lại bài
     localStorage.removeItem(`exerciseAnswers_${this.context.exercise.id}`);
     this.context.currentQuestionIndex = 0;
     this.context.selectedAnswers = {};
     this.context.timeSpent = 0; // Đặt lại thời gian trong context
     this.context.notifyListeners(); // Thông báo cho component re-render
   }

   // Implement UI specific getters
   // Triển khai các phương thức Getter đặc trưng cho UI
   getButtonText() {
       const questions = this.context.exercise?.questions || [];
       const allQuestionsAnswered = Object.keys(this.context.selectedAnswers).length === questions.length;
       const isLastQuestion = this.context.currentQuestionIndex === questions.length - 1;

       if (isLastQuestion && allQuestionsAnswered) {
           return 'Hoàn thành';
       } else if (this.context.selectedAnswers[questions[this.context.currentQuestionIndex]?.id]){
           return 'Câu tiếp';
       } else {
            return '...'; // Nút bị vô hiệu hóa hoặc placeholder
       }
   }

   isNextDisabled() {
       const currentQuestion = this.context.exercise?.questions?.[this.context.currentQuestionIndex];
       return !currentQuestion || !this.context.selectedAnswers[currentQuestion.id];
   }

   isCompleteDisabled() {
        const questions = this.context.exercise?.questions || [];
        const allQuestionsAnswered = Object.keys(this.context.selectedAnswers).length === questions.length;
         return !allQuestionsAnswered;
   }

   goToQuestion(index) {
        // Optional: Add validation for index
        if (index >= 0 && index < this.context.exercise.questions.length) {
           this.context.currentQuestionIndex = index;
           this.context.notifyListeners();
        }
   }
}

/** @implements {State} */
 class CompletedState extends BaseState {
   constructor(context) {
     super(context);
     console.log('Transitioned to Completed State'); // Chuyển sang trạng thái Hoàn thành
     // Logic chạy khi vào trạng thái Hoàn thành (vd: xóa localStorage)
     localStorage.removeItem(`exerciseAnswers_${this.context.exercise.id}`);
     // Logic hiển thị alert và cập nhật learning process sẽ chạy trong handleComplete
   }

   handleComplete() {
     // Đã hoàn thành, xử lý chuyển trang và hiển thị alert
     const { topicType, topicId } = this.context; // Lấy topicType/topicId từ context
     const navigate = this.context.navigate; // Lấy hàm navigate từ context

     // Hiển thị alert kết quả khi hoàn thành
     const correctAnswersCount = this.context.getCorrectAnswersCount();
     const totalQuestions = this.context.getTotalQuestions();
     alert(`Bạn đã hoàn thành với ${correctAnswersCount}/${totalQuestions} câu đúng!`);

      // Cập nhật trạng thái completed nếu có learningProcessId
      const learningProcessId = this.context.learningProcessId; // Giả định learningProcessId được lưu trong context
      if (learningProcessId) {
        // Sử dụng async IIFE để await bên trong handleComplete
        (async () => {
          try {
            // Import service inside async block if needed, or pass it to context
            const learningProcessService = (await import('../services/learningProcessService')).default; // Import động service
            await learningProcessService.setLearningProcessCompleted(learningProcessId);
            console.log('Cập nhật trạng thái học tập thành công.');
          } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái học tập:', error);
          }
        })();
      }

     // Thêm một khoảng dừng nhỏ trước khi chuyển trang để alert có thể hiển thị/đóng
     setTimeout(() => {
         if (topicType === 'Vocabulary' && topicId) {
            navigate(`/learn-vocabulary/${topicId}`);
         } else if (topicType === 'Grammar' && topicId) {
            navigate(`/learn-grammar/${topicId}`); // Sửa lỗi chính tả 'grammary' thành 'grammar'
         } else {
            navigate('/toeic-exercise');
         }
     }, 50); // Khoảng dừng 50ms
   }

  handleRestart() {
     // Chuyển về trạng thái AnsweringState
     this.context.setState(new AnsweringState(this.context));
     // Reset exercise data in context (logic này nằm trong AnsweringState.handleRestart)
     // context.currentQuestionIndex = 0;
     // context.selectedAnswers = {};
     // context.timeSpent = 0;
     // context.notifyListeners();
     // Gọi lại handleRestart() trên trạng thái mới để thực hiện reset
     this.context.restart();
  }

   // Override UI specific getters for this state
   // Ghi đè các phương thức Getter đặc trưng cho UI của trạng thái này
   getButtonText() { return 'Quay về chủ đề'; }
   isNextDisabled() { return true; }
   isCompleteDisabled() { return false; }
   // No need to implement handleSelectAnswer, handleNext, goToQuestion as they are not valid actions in this state
}

class ExerciseContext {
  constructor(exercise, topicType, topicId, navigate, setTimeSpent) {
    this.exercise = exercise;
    this.currentQuestionIndex = 0;
    this.selectedAnswers = {};
    this.timeSpent = 0; // Sẽ được cập nhật bởi bộ đếm thời gian bên ngoài
    this.topicType = topicType;
    this.topicId = topicId;
    this.navigate = navigate;
    this.setTimeSpent = setTimeSpent; // Truyền hàm setTimeSpent từ React
    this.learningProcessId = null; // Sẽ được thiết lập sau nếu có

    this.currentState = new AnsweringState(this); // Trạng thái ban đầu
    this.listeners = []; // Dùng để thông báo cho component React
  }

  // Method to change the current state
  // Phương thức để thay đổi trạng thái hiện tại
  setState(state) {
    // Optional: Add validation if the new state is a valid State instance
    this.currentState = state;
    this.notifyListeners();
  }

  // Methods called by React Component, delegating to the current state
  // Các phương thức được gọi bởi Component React, ủy quyền cho trạng thái hiện tại
  selectAnswer(questionId, optionId) { this.currentState.handleSelectAnswer(questionId, optionId); }
  nextQuestion() { this.currentState.handleNext(); }
  complete() { this.currentState.handleComplete(); }
  restart() { this.currentState.handleRestart(); }
  goToQuestion(index) { this.currentState.goToQuestion(index); }

  // Getters for React Component to render UI (access state data and state-specific UI info)
  // Các Getter để Component React lấy dữ liệu render UI (truy cập dữ liệu trạng thái và thông tin UI đặc trưng của trạng thái)
  getCurrentQuestion() {
    return this.exercise?.questions?.[this.currentQuestionIndex] || null;
  }

  getSelectedAnswerForCurrentQuestion() {
    const currentQuestion = this.getCurrentQuestion();
    return currentQuestion ? this.selectedAnswers[currentQuestion.id] : null;
  }

  getCorrectAnswersCount() {
     return Object.values(this.selectedAnswers).filter(a => a.isCorrect).length;
  }

  getAllQuestionsAnswered() {
      return this.exercise ? Object.keys(this.selectedAnswers).length === this.exercise.questions.length : false;
  }

  getTotalQuestions() {
     return this.exercise?.questions?.length || 0;
  }

  // State-specific UI info getters (delegate to current state)
  // Các Getter thông tin UI đặc trưng của trạng thái (ủy quyền cho trạng thái hiện tại)
   getCurrentButtonText() { return this.currentState.getButtonText(); }
   isNextButtonDisabled() { return this.currentState.isNextDisabled(); }
   isCompleteButtonDisabled() { return this.currentState.isCompleteDisabled(); }
   isCurrentQuestionAnswered() {
        const currentQuestion = this.getCurrentQuestion();
        return currentQuestion ? !!this.selectedAnswers[currentQuestion.id] : false;
   }
    getOptionClassName(option) {
        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) return "option-item";

        const currentAnswer = this.selectedAnswers[currentQuestion.id];
        const isSelected = currentAnswer?.optionId === option.id;
        const isCorrectOption = option.id === currentQuestion.correctAnswer;

        let className = "option-item";

        // Only show feedback if the current question has been answered and is in AnsweringState
        // Chỉ hiển thị phản hồi nếu câu hỏi hiện tại đã trả lời và đang ở trạng thái AnsweringState
         if (this.currentState instanceof AnsweringState && this.isCurrentQuestionAnswered()) {
          if (isSelected) {
            className += isCorrectOption ? " correct" : " incorrect";
          }
          // Also show correct answer if the user answered incorrectly
          // Cũng hiển thị đáp án đúng nếu người dùng trả lời sai
          else if (isCorrectOption && currentAnswer && !currentAnswer.isCorrect) {
             className += " correct-answer";
          }
        }
        return className;
    }

  // Observer pattern for notifying React Component
  // Mẫu Observer để thông báo cho Component React
  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

   // Load state from localStorage
  // Nạp trạng thái từ localStorage
  loadState() {
    const savedState = localStorage.getItem(`exerciseAnswers_${this.exercise.id}`);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState && typeof parsedState === 'object' && parsedState.selectedAnswers) {
           this.selectedAnswers = parsedState.selectedAnswers;

           // Calculate currentQuestionIndex based on loaded answers
           // Tính toán chỉ số câu hỏi hiện tại dựa trên các câu trả lời đã nạp
           const answeredQuestionIds = Object.keys(this.selectedAnswers);
           let initialQuestionIndex = 0;
           if (answeredQuestionIds.length > 0 && this.exercise?.questions?.length) {
             const lastAnsweredQuestionId = answeredQuestionIds[answeredQuestionIds.length - 1];
             const lastAnsweredQuestionIndex = this.exercise.questions.findIndex(q => q.id.toString() === lastAnsweredQuestionId);
              if (lastAnsweredQuestionIndex !== -1) {
               // Set index to the next question, or the last one if all are answered
               // Đặt chỉ số tới câu hỏi tiếp theo, hoặc câu cuối cùng nếu tất cả đã được trả lời
               initialQuestionIndex = Math.min(lastAnsweredQuestionIndex + 1, this.exercise.questions.length - 1);
              } else {
                  // If somehow the last answered ID isn't found, default to the beginning or last
                  // Nếu vì lý do nào đó không tìm thấy ID câu trả lời cuối cùng, mặc định là bắt đầu hoặc câu cuối
                   initialQuestionIndex = answeredQuestionIds.length > 0 ? Math.min(answeredQuestionIds.length, this.exercise.questions.length - 1) : 0;
              }
           }
            this.currentQuestionIndex = initialQuestionIndex;
        }
      } catch (e) {
         console.error('Failed to parse saved state from localStorage', e); // Lỗi khi phân tích trạng thái đã lưu từ localStorage
         // Optionally clear invalid state
         // Tùy chọn: xóa trạng thái không hợp lệ
         localStorage.removeItem(`exerciseAnswers_${this.exercise.id}`);
      }
    }
     // Determine initial state based on loaded data (e.g., if all answered)
     // Xác định trạng thái ban đầu dựa trên dữ liệu đã nạp (ví dụ: nếu tất cả đã trả lời)
     if (this.exercise && this.getAllQuestionsAnswered()) {
         // If all questions were previously answered, start in CompletedState?
         // Nếu tất cả câu hỏi đã được trả lời trước đó, bắt đầu ở CompletedState?
         // Or start in AnsweringState at the last question to allow 'Complete'?
         // Hoặc bắt đầu ở AnsweringState tại câu hỏi cuối cùng để cho phép nhấn 'Hoàn thành'?
         // Let's start at the last question in AnsweringState if all were answered
         // Hãy bắt đầu ở câu hỏi cuối cùng trong AnsweringState nếu tất cả đã được trả lời
          this.currentQuestionIndex = Math.max(0, (this.exercise?.questions?.length || 1) - 1);
          this.currentState = new AnsweringState(this);
     } else {
          this.currentState = new AnsweringState(this);
     }
     this.notifyListeners(); // Thông báo cho component sau khi nạp trạng thái
  }
}
// --- End State Design Pattern Implementation ---

const DoExercise = () => {
  
  const navigate = useNavigate();
  const {exerciseId} = useParams();
  const [exercise, setExercise] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  // State to force re-render when context changes
  // State để buộc component re-render khi context thay đổi
  const [_, forceUpdate] = useState(0);

  // Use useRef to hold the instance of ExerciseContext
  // Sử dụng useRef để giữ instance của ExerciseContext
  const exerciseContextRef = useRef(null);


  //lay data truyen tu state learn-grammar hoac len leanr-vocabulary
  const location = useLocation();
  const topicType = location.state?.topicType || 'Unknown';
  const topicId = location.state?.topicId;
  const learningProcessId = location.state?.learningProcessId;

 

  // Timer
  // Bộ đếm thời gian
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
       // Optionally notify context if timer state is managed there
       // Tùy chọn: thông báo cho context nếu state thời gian được quản lý ở đó
       if (exerciseContextRef.current) {
           exerciseContextRef.current.timeSpent = timeSpent + 1; // Cập nhật thời gian của context
       }

    }, 1000);
    return () => clearInterval(timer); // Xóa interval khi component unmount
  }, [timeSpent]); // Thêm timeSpent vào dependency array

  // Fetch single exercise, initialize context, and load saved state
  // Lấy dữ liệu bài tập, khởi tạo context, và nạp trạng thái đã lưu
  useEffect(() => {
    console.log('topicId',topicId);
    console.log('topicType',topicType);
    const fetchExercise = async () => {
      try {
        if (!exerciseId) {
          throw new Error('Exercise ID not provided'); // Không cung cấp Exercise ID
        }

        const fetchedExercise = await ExerciseService.getExerciseById(exerciseId);
        console.log('Fetched exercise:', fetchedExercise); // Đã lấy dữ liệu bài tập
        
        if (!fetchedExercise || !fetchedExercise.questions) {
          setLoading(false);
          return;
        }

        setExercise(fetchedExercise); // Giữ dữ liệu bài tập trong state component hay chuyển vào context?
                                       // Let's move core exercise data into the context.
                                       // Hãy chuyển dữ liệu bài tập chính vào context.
        // Initialize ExerciseContext with fetched data
        // Khởi tạo ExerciseContext với dữ liệu đã lấy
        const context = new ExerciseContext(
            fetchedExercise,
            topicType,
            topicId,
            navigate,
            setTimeSpent // Truyền setTimeSpent vào context
        );
        // Set learningProcessId in context if available
        // Thiết lập learningProcessId trong context nếu có
        if (learningProcessId) {
            context.learningProcessId = learningProcessId;
        }
        exerciseContextRef.current = context;

        // Load saved state from localStorage into the context
        // Nạp trạng thái đã lưu từ localStorage vào context
        context.loadState();

        // Subscribe to context changes to force component re-render
        // Đăng ký lắng nghe sự thay đổi của context để buộc component re-render
        const handleContextChange = () => {
           forceUpdate(prev => prev + 1); // Tăng giá trị state để buộc re-render
        };

        context.addListener(handleContextChange);

        setLoading(false);

        // Cleanup listener on component unmount
        // Dọn dẹp listener khi component unmount
        return () => {
           if (exerciseContextRef.current) {
               exerciseContextRef.current.removeListener(handleContextChange);
           }
        };

      } catch (err) {
        console.error('Error fetching exercise:', err); // Lỗi khi lấy dữ liệu bài tập
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId, topicId, topicType, navigate, setTimeSpent, learningProcessId]); // Thêm các dependencies cần thiết

  // Event Handlers - Delegate to ExerciseContext
  // Hàm xử lý sự kiện - Ủy quyền cho ExerciseContext
  const handleOptionSelect = (questionId, optionId) => {
     exerciseContextRef.current?.selectAnswer(questionId, optionId);
  };

  const handleNextQuestion = () => {
     exerciseContextRef.current?.nextQuestion();
  };

  const handleComplete = async () => {
     exerciseContextRef.current?.complete();
  };

  const handleRestart = () => {
     exerciseContextRef.current?.restart();
  };

  // Handle clicking on question indicator
  // Xử lý khi click vào chỉ số câu hỏi
  const handleGoToQuestion = (index) => {
      exerciseContextRef.current?.goToQuestion(index);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Get data for rendering from the context instance
  // Lấy dữ liệu để render UI từ instance context
  const context = exerciseContextRef.current;

  if (loading) return <LoadingSpinner />;
  // Render based on context data
  // Render dựa trên dữ liệu từ context
  if (!context || !context.exercise) return <div>Không tìm thấy bài tập.</div>;
  if (!context.exercise.questions || context.exercise.questions.length === 0) return <div>Bài tập không có câu hỏi.</div>;

  // Access state from context
  // Truy cập state từ context
  const questions = context.exercise.questions;
  const currentQuestionIndex = context.currentQuestionIndex;
  const selectedAnswers = context.selectedAnswers;
  const correctAnswersCount = context.getCorrectAnswersCount();
  const allQuestionsAnswered = context.getAllQuestionsAnswered();
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  // Passing score logic might live in Context/State, but derived data can be calculated here too
  // Logic tính điểm pass có thể nằm trong Context/State, nhưng dữ liệu suy ra cũng có thể tính ở đây
  const meetsPassingScore = correctAnswersCount >= Math.ceil(questions.length * 0.8);
  const canComplete = allQuestionsAnswered; // Logic hoàn thành chỉ cần trả lời hết câu hỏi

  const currentQuestion = context.getCurrentQuestion();
  const currentAnswer = context.getSelectedAnswerForCurrentQuestion();

  const currentOptions = [
    { id: 'A', text: currentQuestion.optionA },
    { id: 'B', text: currentQuestion.optionB },
    { id: 'C', text: currentQuestion.optionC },
    { id: 'D', text: currentQuestion.optionD }
  ];

  // Function to get class name for an option - Delegate to context
  // Hàm lấy tên class cho tùy chọn - Ủy quyền cho context
  const getOptionClassName = (option) => {
     return context.getOptionClassName(option);
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
              className={getOptionClassName(option)} // Sử dụng phương thức ủy quyền
              onClick={() => handleOptionSelect(currentQuestion.id, option.id)} // Ủy quyền xử lý
            >
              <input 
                type="radio" 
                name={`answer-${currentQuestion.id}`} 
                className="option-radio" 
                checked={currentAnswer?.optionId === option.id} // Đọc từ dữ liệu context
                onChange={() => {}} // Giữ onChange là hàm dummy cho radio
                disabled={context.isCurrentQuestionAnswered()} // Vô hiệu hóa nếu đã trả lời (đọc từ context)
              />
              <span className="option-label">{option.text}</span>
            </label>
          ))}
        </div>
        
        {/* Phần phản hồi - hiển thị nếu câu hỏi hiện tại đã trả lời VÀ đang ở trạng thái AnsweringState */}
        {context.currentState instanceof AnsweringState && context.isCurrentQuestionAnswered() && currentAnswer && (
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
          {/* Logic hiển thị nút dựa trên trạng thái và tình trạng hoàn thành */}
          {isLastQuestion ? (
             <> {/* Sử dụng Fragment cho nhiều phần tử */}
              <button 
                className={`nav-button ${canComplete ? 'complete-button' : 'disabled-complete-button'}`}
                onClick={handleComplete} // Ủy quyền xử lý
                disabled={context.isCompleteButtonDisabled()} // Kiểm tra trạng thái vô hiệu hóa từ context/state
              >
                {context.getCurrentButtonText()} {/* Lấy văn bản nút từ state */}
              </button>
               {/* Phần thông báo yêu cầu điểm pass đã bị xóa theo yêu cầu trước đó */}
             </>
          ) : (
            <button 
              className="nav-button next-button" 
              onClick={handleNextQuestion} // Ủy quyền xử lý
              disabled={context.isNextButtonDisabled()} // Kiểm tra trạng thái vô hiệu hóa từ context/state
            >
              {context.getCurrentButtonText()} {/* Lấy văn bản nút từ state */}
            </button>
          )}
        </div>
      </div>

      <div className="navigation-panel">
        <div className="navigation-header">
          <span className="questions-range">Câu hỏi 1-{questions.length}</span>
          <button className="restart-btn" onClick={handleRestart}> {/* Ủy quyền xử lý */}
            <FaRedo className="restart-icon" />
            Làm lại
          </button>
        </div>
        <div className="question-indicators">
          {questions.map((q, index) => {
            const answer = selectedAnswers[q.id]; // Đọc từ dữ liệu context
            let indicatorClass = "indicator";
            
            if (answer) {
              indicatorClass += answer.isCorrect ? " correct" : " incorrect";
            } else {
              indicatorClass += " pending";
            }
            
            if (index === currentQuestionIndex) { // Đọc từ dữ liệu context
              indicatorClass += " current";
            }
            
            return (
              <div 
                key={q.id}
                className={indicatorClass}
                onClick={() => {
                  // Handle clicking indicator - delegate to context
                  // Xử lý click vào chỉ số câu hỏi - ủy quyền cho context
                   handleGoToQuestion(index);
                }}
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