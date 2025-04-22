import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/DoTest.css';
import { useTest } from '../context/TestContext';
import TestService from '../services/TestService';

const DoTest = () => {
    const { testId } = useParams();
    const [showPanel, setShowPanel] = useState(false);
    const [localError, setLocalError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const resolvedTestId = testId || 1; // Nếu không có testId trong URL, sử dụng testId mặc định là 1
    console.log(resolvedTestId);
    useEffect(() => {
        if (resolvedTestId) {
            TestService.getTestById(resolvedTestId)
                .then(rawData => {
                    const processedData = TestService.processTestData(rawData);
                    // Update test data in context
                    setTest(processedData);
                })
                .catch(error => {
                    setLocalError(error.message);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [resolvedTestId, setTest]);

    const { setTest,
        test,
        loading,
        error,
        userAnswers,
        remainingTime,
        formattedTime,
        isTestStarted,
        isTestFinished,
        currentQuestionIndex,
        currentQuestion,
        startTest,
        finishTest,
        saveAnswer,
        goToNextQuestion,
        goToPreviousQuestion,
        goToQuestion,
        calculateScore,
        getQuestionsByPart
    } = useTest();

    // State để theo dõi phần hiện tại
    const [currentPart, setCurrentPart] = useState(1);
    
    // State để theo dõi nhóm câu hỏi hiện tại (cho part 3-7)
    const [currentGroup, setCurrentGroup] = useState([]);

    // Cập nhật nhóm câu hỏi khi có sự thay đổi về câu hỏi hiện tại
    useEffect(() => {
        if (!currentQuestion || !test) return;

        // Cập nhật phần hiện tại
        setCurrentPart(currentQuestion.partNumber);

        // Xử lý logic nhóm câu hỏi
        if ([3, 4, 6, 7].includes(currentQuestion.partNumber)) {
            // Nhóm các câu hỏi có cùng resourceId
            const newGroup = test.allQuestions.filter(q => 
                q.resource && 
                currentQuestion.resource && 
                q.resource.id === currentQuestion.resource.id
            );
            setCurrentGroup(newGroup);
        } else {
            // Đối với part 1, 2, 5, mỗi câu hỏi là một nhóm riêng biệt
            setCurrentGroup([currentQuestion]);
        }
    }, [currentQuestion, test]);

    // Bắt đầu bài kiểm tra khi component được mount
    useEffect(() => {
        if (test && !isTestStarted && !isTestFinished) {
            startTest();
        }
    }, [test, isTestStarted, isTestFinished, startTest]);

    // Xử lý lựa chọn đáp án
    const handleAnswerSelect = (questionId, answer) => {
        saveAnswer(questionId, answer);
    };

    // Xử lý điều hướng giữa các câu hỏi
    const navigateQuestions = (direction) => {
        if (!currentQuestion || !test) return;

        // Xác định resourceId hiện tại (dùng để nhận diện nhóm)
        const currentResourceId = currentQuestion.resource?.id;

        if (direction === 'next') {
            if ([3, 4, 6, 7].includes(currentQuestion.partNumber) && currentResourceId) {
                // Tìm câu hỏi đầu tiên của nhóm tiếp theo
                let nextGroupIndex = -1;
                for (let i = currentQuestionIndex + 1; i < test.allQuestions.length; i++) {
                    if (!test.allQuestions[i].resource || 
                        test.allQuestions[i].resource.id !== currentResourceId) {
                        nextGroupIndex = i;
                        break;
                    }
                }

                if (nextGroupIndex !== -1) {
                    goToQuestion(nextGroupIndex);
                } else {
                    goToNextQuestion();
                }
            } else {
                goToNextQuestion();
            }
        } else {
            if ([3, 4, 6, 7].includes(currentQuestion.partNumber) && currentResourceId) {
                // Tìm câu hỏi đầu tiên của nhóm trước đó
                let prevResourceId = null;
                let prevGroupLastIndex = -1;

                for (let i = currentQuestionIndex - 1; i >= 0; i--) {
                    if (!test.allQuestions[i].resource || 
                        test.allQuestions[i].resource.id !== currentResourceId) {
                        prevGroupLastIndex = i;
                        prevResourceId = test.allQuestions[i].resource?.id;
                        break;
                    }
                }

                if (prevGroupLastIndex !== -1 && prevResourceId) {
                    // Tìm câu hỏi đầu tiên của nhóm trước đó
                    let firstOfPrevGroup = prevGroupLastIndex;
                    while (firstOfPrevGroup > 0 &&
                        test.allQuestions[firstOfPrevGroup - 1].resource &&
                        test.allQuestions[firstOfPrevGroup - 1].resource.id === prevResourceId) {
                        firstOfPrevGroup--;
                    }
                    goToQuestion(firstOfPrevGroup);
                } else {
                    goToPreviousQuestion();
                }
            } else {
                goToPreviousQuestion();
            }
        }
    };

    // Xử lý chọn câu hỏi cụ thể
    const handleQuestionNavigation = (questionId) => {
        const index = test.allQuestions.findIndex(q => q.id === questionId);
        if (index >= 0) goToQuestion(index);
    };

    // Xử lý nộp bài
    const handleSubmitTest = () => {
        finishTest();
        // Thêm logic hiển thị kết quả hoặc chuyển hướng trang ở đây
    };

    // Render câu hỏi đơn lẻ (Part 1, 2, 5)
    const renderSingleQuestion = () => {
        const question = currentGroup[0];
        if (!question) return null;

        return (
            <div className="single-container">
                {question.partNumber === 1 && question.resource?.urlImage && (
                    <img src={question.resource.urlImage} alt="Mô tả" className="main-image" />
                )}

                {question.partNumber === 2 && question.resource?.urlAudio && (
                    <div className="audio-section">
                        <button className="audio-button">
                            <i className="fas fa-play"></i> Nghe câu hỏi
                        </button>
                    </div>
                )}

                <div className="answer-section">
                    <div className="question-header">
                        <span className="question-number">Câu {question.questionNumber}</span>
                        {question.content && (
                            <p className="sentence">{question.content}</p>
                        )}
                    </div>

                    <div className="answer-grid">
                        {Object.entries(question.options).map(([key, text]) => (
                            text && (
                                <div key={key} className="answer-row">
                                    <label className="option-item">
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            checked={userAnswers[question.id] === key}
                                            onChange={() => handleAnswerSelect(question.id, key)}
                                        />
                                        <span className="option-label">{key}: {text}</span>
                                    </label>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Render nhóm câu hỏi (Part 3, 4, 6, 7)
    const renderGroupQuestions = () => {
        const question = currentGroup[0];
        if (!question) return null;

        return (
            <div className="group-container">
                <div className="resource-panel">
                    {[3, 4].includes(question.partNumber) && question.resource?.urlAudio && (
                        <div className="audio-resource">
                            <button className="audio-button">
                                <i className="fas fa-play"></i>
                                {question.partNumber === 3 ? 'Nghe hội thoại' : 'Nghe bài nói'}
                            </button>
                            {question.resource.urlImage && (
                                <img src={question.resource.urlImage} alt="Biểu đồ" className="chart-image" />
                            )}
                        </div>
                    )}

                    {question.partNumber === 6 && question.resource?.paragraph && (
                        <div className="text-resource">
                            <p dangerouslySetInnerHTML={{ __html: question.resource.paragraph }} />
                        </div>
                    )}

                    {question.partNumber === 7 && question.resource?.paragraph && (
                        <div className="reading-resource">
                            <div className="passage">
                                <p dangerouslySetInnerHTML={{ __html: question.resource.paragraph }} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="questions-panel">
                    {currentGroup.map(q => (
                        <div key={q.id} className="question-block">
                            <div className="question-header">
                                <span className="question-number">Câu {q.questionNumber}</span>
                            </div>

                            {q.content && <p className="question-text">{q.content}</p>}

                            <div className="answer-options">
                                {Object.entries(q.options).map(([key, text]) => (
                                    text && (
                                        <label key={key} className="option-item">
                                            <input
                                                type="radio"
                                                name={`question-${q.id}`}
                                                checked={userAnswers[q.id] === key}
                                                onChange={() => handleAnswerSelect(q.id, key)}
                                            />
                                            <span className="option-label">{key}: {text}</span>
                                        </label>
                                    )
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render panel điều hướng câu hỏi
    const renderNavigationPanel = () => {
        if (!test) return null;

        return (
            <div className={`question-panel ${showPanel ? 'open' : ''}`}>
                <div className="panel-header">
                    <h3>Danh sách câu hỏi</h3>
                    <button className="close-btn" onClick={() => setShowPanel(false)}>×</button>
                </div>

                <div className="panel-content">
                    {[1, 2, 3, 4, 5, 6, 7].map(partNumber => {
                        const partQuestions = test.parts.find(p => p.partNumber === partNumber)?.questions || [];
                        
                        if (partQuestions.length === 0) return null;
                        
                        return (
                            <div key={partNumber} className="part-section">
                                <h4>PART {partNumber}</h4>
                                <div className="question-grid">
                                    {partQuestions.map(q => {
                                        const isCurrentQuestion = currentQuestion && q.id === currentQuestion.id;
                                        const isAnswered = userAnswers[q.id] !== undefined;
                                        const isDisabled = currentPart <= 4 || q.partNumber <= 4;

                                        return (
                                            <button
                                                key={q.id}
                                                className={`question-btn 
                                                    ${isAnswered ? 'answered' : ''}
                                                    ${isCurrentQuestion ? 'active' : ''}
                                                    ${isDisabled ? 'disabled' : ''}`}
                                                onClick={!isDisabled ? () => handleQuestionNavigation(q.id) : undefined}
                                                disabled={isDisabled}
                                            >
                                                {q.questionNumber}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Hiển thị trạng thái loading
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Đang tải bài kiểm tra...</p>
            </div>
        );
    }

    // Hiển thị lỗi
    if (localError) {
        return (
            <div className="error-container">
                <h2>Đã xảy ra lỗi</h2>
                <p>{localError}</p>
                <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
        );
    }

    // Hiển thị kết quả nếu đã hoàn thành
    if (isTestFinished) {
        const { correctCount, totalQuestions, score } = calculateScore();
        
        return (
            <div className="result-container">
                <h2>Kết quả bài kiểm tra</h2>
                <div className="score-display">
                    <div className="score">{score}%</div>
                    <p>Bạn đã trả lời đúng {correctCount}/{totalQuestions} câu hỏi</p>
                </div>
                <button className="review-btn" onClick={() => window.location.reload()}>Xem lại bài làm</button>
            </div>
        );
    }

    // Hiển thị giao diện chính của bài kiểm tra
    return (
        <div className="do-test-container">
            <header className="test-header">
                <div className="header-content_white">
                    <span className="test-title">{test?.title || 'Bài kiểm tra TOEIC'}</span>
                    <div className="header-controls">
                        <button className="submit-button" onClick={handleSubmitTest}>Nộp bài</button>
                        <div className="timer-dotest">{formattedTime}</div>
                        <button
                            className={`panel-toggle ${currentPart <= 4 ? 'disabled' : ''}`}
                            onClick={() => setShowPanel(!showPanel)}
                            disabled={currentPart <= 4}
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                    </div>
                </div>
            </header>

            {renderNavigationPanel()}

            <main className="main-content">
                <div className="progress-container">
                    <div className="word-counter">
                        {Object.keys(userAnswers).length}/{test?.allQuestions.length || 0}
                    </div>
                </div>
                <div className="content-wrapper">
                    <h2 className="part-title">PART {currentPart}</h2>

                    {test && test.allQuestions.length > 0 ? (
                        <div className="question-content">
                            {[1, 2, 5].includes(currentPart) ?
                                (currentGroup.length > 0 ? renderSingleQuestion() : null) :
                                (currentGroup.length > 0 ? renderGroupQuestions() : null)}

                            {/* Hiển thị nút điều hướng cho các phần 5-7 */}
                            {![1, 2, 3, 4].includes(currentPart) && (
                                <div className="navigation-controls">
                                    <button
                                        className="nav-btn prev"
                                        onClick={() => navigateQuestions('prev')}
                                        disabled={currentQuestionIndex === 0}
                                    >
                                        ← Câu trước
                                    </button>
                                    <button
                                        className="nav-btn next"
                                        onClick={() => navigateQuestions('next')}
                                        disabled={currentQuestionIndex === test.allQuestions.length - 1}
                                    >
                                        Câu tiếp →
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="no-questions">Không có câu hỏi nào trong bài kiểm tra</div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DoTest;