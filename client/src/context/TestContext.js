import React, { createContext, useState, useEffect, useContext } from 'react';
import TestService from '../services/TestService';

// Tạo context để quản lý trạng thái của bài kiểm tra
const TestContext = createContext();

export const TestProvider = ({ children, testId }) => {
  // State để lưu trữ dữ liệu bài kiểm tra
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State để lưu trữ câu trả lời của người dùng
  const [userAnswers, setUserAnswers] = useState({});
  
  // State để theo dõi thời gian làm bài
  const [remainingTime, setRemainingTime] = useState(0);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);

  // State để theo dõi câu hỏi hiện tại
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Lấy dữ liệu bài kiểm tra từ API khi component được tạo
  useEffect(() => {
    async function fetchTestData() {
      try {
        setLoading(true);
        const rawData = await TestService.getTestById(testId);
        const processedData = TestService.processTestData(rawData);
        setTest(processedData);
        setRemainingTime(processedData.duration * 60); // Chuyển đổi phút thành giây
      } catch (err) {
        setError('Không thể tải dữ liệu bài kiểm tra. Vui lòng thử lại sau.');
        console.error('Lỗi khi tải dữ liệu bài kiểm tra:', err);
      } finally {
        setLoading(false);
      }
    }

    if (testId) {
      fetchTestData();
    }
  }, [testId]);

  // Xử lý bộ đếm thời gian khi bài kiểm tra bắt đầu
  useEffect(() => {
    let timerId;

    if (isTestStarted && remainingTime > 0 && !isTestFinished) {
      timerId = setInterval(() => {
        setRemainingTime(prevTime => {
          if (prevTime <= 1) {
            // Nếu hết thời gian, tự động kết thúc bài kiểm tra
            clearInterval(timerId);
            setIsTestFinished(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isTestStarted, remainingTime, isTestFinished]);

  // Chuyển đổi giây thành định dạng mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Bắt đầu bài kiểm tra
  const startTest = () => {
    setIsTestStarted(true);
  };

  // Kết thúc bài kiểm tra
  const finishTest = () => {
    setIsTestFinished(true);
  };

  // Lưu câu trả lời của người dùng
  const saveAnswer = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Đi đến câu hỏi tiếp theo
  const goToNextQuestion = () => {
    if (test && currentQuestionIndex < test.allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Quay lại câu hỏi trước
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Đi đến câu hỏi cụ thể
  const goToQuestion = (index) => {
    if (index >= 0 && index < test?.allQuestions?.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Tính điểm khi hoàn thành bài kiểm tra
  const calculateScore = () => {
    if (!test || !isTestFinished) return 0;

    let correctCount = 0;
    let totalQuestions = test.allQuestions.length;

    test.allQuestions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    return {
      correctCount,
      totalQuestions,
      score: Math.round((correctCount / totalQuestions) * 100)
    };
  };

  // Lấy danh sách câu hỏi theo phần
  const getQuestionsByPart = (partNumber) => {
    return TestService.getQuestionsByPart(test?.parts || [], partNumber);
  };

  // Lấy câu hỏi nhóm theo tài nguyên (dùng cho phần 3-7 trong TOEIC)
  const getQuestionsGroupedByResource = (partNumber) => {
    const questions = getQuestionsByPart(partNumber);
    return TestService.groupQuestionsByResource(questions);
  };

  // Giá trị context được cung cấp cho các component con
  const value = {
    test,
    loading,
    error,
    userAnswers,
    remainingTime,
    formattedTime: formatTime(remainingTime),
    isTestStarted,
    isTestFinished,
    currentQuestionIndex,
    currentQuestion: test?.allQuestions?.[currentQuestionIndex],
    
    // Các hàm và phương thức
    startTest,
    finishTest,
    saveAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    calculateScore,
    getQuestionsByPart,
    getQuestionsGroupedByResource
  };

  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
};

// Custom hook để sử dụng TestContext
export const useTest = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest phải được sử dụng trong TestProvider');
  }
  return context;
};

export default TestContext;