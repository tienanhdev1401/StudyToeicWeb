import React, { useState, useEffect, useRef } from 'react';
import { FaRedo } from 'react-icons/fa';
import ExerciseService from '../services/exerciseService';
import learningProcessService from '../services/learningProcessService';
import '../styles/DoGrammarExercise.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

// --- State Design Pattern Implementation ---

// Base State Interface (conceptually)
// Lớp State cơ bản (khái niệm)
// class State {
//   constructor(context) { this.context = context; }
//   handleSelectAnswer(questionId, optionId) {}
//   handleNext() {}
//   handleComplete() {}
//   handleRestart() {}
//   // Methods to get state-specific data for rendering, if needed
//   // Các phương thức để lấy dữ liệu đặc trưng của trạng thái để render UI (nếu cần)
//   getButtonText() { return '...'; }
// }

class AnsweringState {
  constructor(context) {
    this.context = context;
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

    // Save to localStorage immediately after selecting an answer
    // Lưu vào localStorage ngay sau khi chọn đáp án
    localStorage.setItem(`exerciseAnswers_${this.context.exercise.id}`, JSON.stringify({
      selectedAnswers: newSelectedAnswers,
      currentQuestionIndex: this.context.currentQuestionIndex // Lưu cả chỉ số câu hỏi hiện tại
    }));

    // Check if all questions are answered to potentially transition
    // Kiểm tra xem tất cả câu hỏi đã được trả lời chưa để có khả năng chuyển trạng thái
    if (Object.keys(this.context.selectedAnswers).length === this.context.exercise.questions.length) {
      // Transition to CompletedState if all answered? Or wait for complete button?
      // Chuyển sang CompletedState nếu trả lời hết? Hay chờ nút hoàn thành?
      // Let's keep the transition on hitting complete button for now.
      // Tạm thời giữ việc chuyển trạng thái khi nhấn nút hoàn thành.
    }

    this.context.notifyListeners(); // Thông báo cho component re-render
  }

  handleNext() {
    const currentQuestion = this.context.exercise?.questions?.[this.context.currentQuestionIndex];
     // Only move if current question is answered and not the last question
     // Chỉ chuyển tiếp nếu câu hỏi hiện tại đã được trả lời và không phải là câu cuối cùng
    if (currentQuestion && this.context.selectedAnswers[currentQuestion.id] && this.context.currentQuestionIndex < this.context.exercise.questions.length - 1) {
      this.context.currentQuestionIndex += 1;
      this.context.notifyListeners(); // Thông báo cho component re-render
    }
  }

  handleComplete() {
      // Check if all questions are answered before completing
      // Kiểm tra xem tất cả câu hỏi đã được trả lời trước khi hoàn thành
      if (this.context.exercise && Object.keys(this.context.selectedAnswers).length === this.context.exercise.questions.length) {
           // Calculate score
           // Tính điểm (logic này đã bị loại bỏ yêu cầu 80% pass)

             this.context.setState(new CompletedState(this.context));
             // Sau khi chuyển trạng thái thành công, gọi lại complete() để kích hoạt logic trong CompletedState
             this.context.complete();
              // Xử lý chuyển trang và xóa localStorage trong CompletedState sau khi chuyển trạng thái

      }
  }

  handleRestart() {
    // Clear localStorage on restart
    // Xóa localStorage khi làm lại bài
    localStorage.removeItem(`exerciseAnswers_${this.context.exercise.id}`);
    this.context.currentQuestionIndex = 0;
    this.context.selectedAnswers = {};
    this.context.timeSpent = 0; // Reset timer in context? Or manage outside?
    // Đặt lại thời gian trong context? Hay quản lý bên ngoài?
    // Assuming timer is managed by React hook for simplicity, we'll just reset the state here.
    // Giả định bộ đếm thời gian được quản lý bằng React hook, chúng ta chỉ đặt lại state ở đây.
    // If timer was in context, restart logic would be here.
    // Nếu bộ đếm thời gian nằm trong context, logic reset sẽ ở đây.

    this.context.notifyListeners(); // Thông báo cho component re-render
  }

  // Helper for rendering
  // Hàm hỗ trợ cho việc render UI
  getButtonText() {
      const questions = this.context.exercise?.questions || [];
      const allQuestionsAnswered = Object.keys(this.context.selectedAnswers).length === questions.length;
      const isLastQuestion = this.context.currentQuestionIndex === questions.length - 1;

      if (isLastQuestion && allQuestionsAnswered) {
          return 'Hoàn thành';
      } else if (this.context.selectedAnswers[questions[this.context.currentQuestionIndex]?.id]){
          return 'Câu tiếp';
      } else {
           return '...'; // Button disabled or placeholder
           // Nút bị vô hiệu hóa hoặc placeholder
      }
  }
   // Determine if next button should be disabled
   // Xác định xem nút Tiếp theo có nên bị vô hiệu hóa hay không
   isNextDisabled() {
       const currentQuestion = this.context.exercise?.questions?.[this.context.currentQuestionIndex];
       return !currentQuestion || !this.context.selectedAnswers[currentQuestion.id];
   }
   // Determine if complete button should be disabled
   // Xác định xem nút Hoàn thành có nên bị vô hiệu hóa hay không
   isCompleteDisabled() {
        const questions = this.context.exercise?.questions || [];
        const allQuestionsAnswered = Object.keys(this.context.selectedAnswers).length === questions.length;
         return !allQuestionsAnswered;
   }
}

class CompletedState {
  constructor(context) {
    this.context = context;
    console.log('Transitioned to Completed State'); // Chuyển sang trạng thái Hoàn thành
    // Logic to run upon entering Completed State
    // Logic chạy khi vào trạng thái Hoàn thành
    // e.g., Final score calculation, clear localStorage
    // Ví dụ: Tính điểm cuối cùng, xóa localStorage
     localStorage.removeItem(`exerciseAnswers_${this.context.exercise.id}`);
     // Logic cập nhật learning process và hiển thị alert sẽ chuyển vào handleComplete

   }

    handleSelectAnswer(questionId, optionId) { /* No-op in completed state */ } // Không làm gì ở trạng thái hoàn thành
    handleNext() { /* No-op in completed state */ } // Không làm gì ở trạng thái hoàn thành

    handleComplete() {
      // Already completed, handle navigation
      // Đã hoàn thành, xử lý chuyển trang
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

      // Add a small delay before navigating to allow alert to be seen/dismissed
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
     // Transition back to AnsweringState
     // Chuyển về trạng thái AnsweringState
     this.context.setState(new AnsweringState(this.context));
     // Reset exercise data in context
     // Đặt lại dữ liệu bài tập trong context
     this.context.currentQuestionIndex = 0;
     this.context.selectedAnswers = {};
     this.context.timeSpent = 0;
     this.context.notifyListeners(); // Thông báo cho component re-render
  }
   getButtonText() { return 'Quay về chủ đề'; }
    isNextDisabled() { return true; }
    isCompleteDisabled() { return false; }
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

  setState(state) {
    this.currentState = state;
    this.notifyListeners();
  }

  // Methods called by React Component
  // Các phương thức được gọi bởi Component React
  selectAnswer(questionId, optionId) { this.currentState.handleSelectAnswer(questionId, optionId); }
  nextQuestion() { this.currentState.handleNext(); }
  complete() { this.currentState.handleComplete(); }
  restart() { this.currentState.handleRestart(); }

  // Getters for React Component to render UI
  // Các Getter để Component React lấy dữ liệu render UI
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
   // Methods to get state-specific UI info
   // Các phương thức để lấy thông tin UI đặc trưng của trạng thái
   getCurrentButtonText() { return this.currentState.getButtonText(); }
   isNextButtonDisabled() { return this.currentState.isNextDisabled(); }
   isCompleteButtonDisabled() { return this.currentState.isCompleteDisabled(); }
   // Check if current question is answered (for UI feedback)
   // Kiểm tra xem câu hỏi hiện tại đã được trả lời chưa (cho phản hồi UI)
   isCurrentQuestionAnswered() {
        const currentQuestion = this.getCurrentQuestion();
        return currentQuestion ? !!this.selectedAnswers[currentQuestion.id] : false;
   }
    // Get the class name for an option (delegated to State or handled here based on context data)
    // Lấy tên class cho một tùy chọn (ủy quyền cho State hoặc xử lý ở đây dựa trên dữ liệu context)
    getOptionClassName(option) {
        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) return "option-item";

        const currentAnswer = this.selectedAnswers[currentQuestion.id];
        const isSelected = currentAnswer?.optionId === option.id;
        const isCorrectOption = option.id === currentQuestion.correctAnswer;

        let className = "option-item";

        // Only show feedback if the current question has been answered
        // Chỉ hiển thị phản hồi nếu câu hỏi hiện tại đã được trả lời
        if (this.isCurrentQuestionAnswered()) {
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

  // isAnswered state is now derived from context/state pattern
  // State isAnswered giờ được suy ra từ context/state pattern
  // useEffect(() => {
  //   setIsAnswered(false);
  // }, [currentQuestionIndex]); // This useEffect is no longer needed
  // useEffect này không còn cần thiết

  // Event Handlers - Delegate to ExerciseContext
  // Hàm xử lý sự kiện - Ủy quyền cho ExerciseContext
  const handleOptionSelect = (questionId, optionId) => {
     exerciseContextRef.current?.selectAnswer(questionId, optionId);
  };

  const handleNextQuestion = () => {
     exerciseContextRef.current?.nextQuestion();
  };

  const handleComplete = async () => {
    // Call complete on the context, the state pattern will handle navigation and score check
    // Gọi complete() trên context, state pattern sẽ xử lý chuyển trang và kiểm tra điểm
     // Logic cập nhật learning process sẽ được chuyển vào CompletedState.
    exerciseContextRef.current?.complete();
  };

  const handleRestart = () => {
    exerciseContextRef.current?.restart();
     // timeSpent reset is handled by the React hook, ensure context is updated too
     // Việc reset timeSpent được xử lý bằng React hook, đảm bảo context cũng được cập nhật
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
  const canComplete = allQuestionsAnswered && meetsPassingScore; // meetsPassingScore ở đây chỉ còn để tính canComplete cho UI, không ảnh hưởng logic hoàn thành

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
        
        {/* Feedback section - show if current question is answered AND in AnsweringState */}
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
          {/* Button logic based on state and completion status */}
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
                  // Directly update index in context and notify, or add a method to context?
                  // Cập nhật trực tiếp chỉ số trong context và thông báo, hay thêm một phương thức vào context?
                  // Adding a method to context is cleaner with State Pattern
                  // Thêm một phương thức vào context sẽ gọn gàng hơn với State Pattern
                  if (exerciseContextRef.current) {
                      exerciseContextRef.current.currentQuestionIndex = index; // Cập nhật trực tiếp chỉ số
                  }
                  exerciseContextRef.current?.notifyListeners(); // Thông báo để re-render

                  // If logic needed before changing question via indicator, add a method like context.goToQuestion(index)
                  // Nếu cần logic trước khi thay đổi câu hỏi bằng indicator, hãy thêm một phương thức như context.goToQuestion(index)
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