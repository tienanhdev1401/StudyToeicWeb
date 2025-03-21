import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import '../styles/DoTest.css';
import { mockTests } from '../data/mockTests';

const DoTest = () => {
    const { testID } = useParams();
    const { state } = useLocation();
    const [currentPart, setCurrentPart] = useState(5);
    const [showPanel, setShowPanel] = useState(false);
    const [timeLeft, setTimeLeft] = useState(7200);
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentGroup, setCurrentGroup] = useState([]);

    // Khởi tạo và lọc câu hỏi
    useEffect(() => {
        const selectedParts = state?.selectedParts || [];
        const allQuestions = mockTests[testID]?.questions || [];

        const filtered = selectedParts.length > 0
            ? allQuestions.filter(q => selectedParts.includes(q.part))
            : allQuestions;

        setFilteredQuestions(filtered);
        setCurrentQuestion(1);
    }, [state, testID]);

    // Xử lý timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Cập nhật nhóm câu hỏi
    useEffect(() => {
        const question = filteredQuestions[currentQuestion - 1];
        if (!question) {
            setCurrentGroup([]);
            return;
        }

        setCurrentPart(question.part);

        if ([3, 4, 6, 7].includes(question.part)) {
            const newGroup = filteredQuestions.filter(q =>
                q.resourceId === question.resourceId
            );
            setCurrentGroup(newGroup);
        } else {
            setCurrentGroup([question]);
        }
    }, [currentQuestion, filteredQuestions]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return [hrs, mins, secs].map(n => n.toString().padStart(2, '0')).join(':');
    };

    const handleAnswerSelect = (questionId, answerId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));
    };

    const handleQuestionNavigation = (questionId) => {
        const index = filteredQuestions.findIndex(q => q.id === questionId);
        if (index >= 0) setCurrentQuestion(index + 1);
    };

    // Điều hướng giữa các nhóm
    const navigateQuestions = (direction) => {
        // Lấy câu hỏi hiện tại
        const currentQ = filteredQuestions[currentQuestion - 1];
        if (!currentQ) return;

        // Xác định resourceId hiện tại (dùng để nhận diện nhóm)
        const currentResourceId = currentQ.resourceId;

        if (direction === 'next') {
            // TÌM CÂU ĐẦU TIÊN CỦA NHÓM TIẾP THEO
            if ([3, 4, 6, 7].includes(currentQ.part)) {
                // Duyệt từ vị trí hiện tại để tìm câu đầu tiên của nhóm khác
                let nextGroupIndex = -1;
                for (let i = currentQuestion; i < filteredQuestions.length; i++) {
                    if (filteredQuestions[i].resourceId !== currentResourceId) {
                        nextGroupIndex = i;
                        break;
                    }
                }

                if (nextGroupIndex !== -1) {
                    setCurrentQuestion(nextGroupIndex + 1);
                } else {
                    // Nếu không tìm thấy nhóm tiếp theo, di chuyển đến câu tiếp theo
                    setCurrentQuestion(Math.min(filteredQuestions.length, currentQuestion + 1));
                }
            } else {
                // Đối với các phần không nhóm, chỉ đơn giản là tới câu tiếp theo
                setCurrentQuestion(Math.min(filteredQuestions.length, currentQuestion + 1));
            }
        } else {
            // TÌM CÂU ĐẦU TIÊN CỦA NHÓM TRƯỚC ĐÓ 
            if ([3, 4, 6, 7].includes(currentQ.part)) {
                // Duyệt ngược từ vị trí hiện tại để tìm nhóm trước đó
                let prevGroupLastIndex = -1;
                for (let i = currentQuestion - 2; i >= 0; i--) {
                    if (filteredQuestions[i].resourceId !== currentResourceId) {
                        prevGroupLastIndex = i;
                        break;
                    }
                }

                if (prevGroupLastIndex !== -1) {
                    // Tìm câu đầu tiên của nhóm trước đó
                    const prevResourceId = filteredQuestions[prevGroupLastIndex].resourceId;
                    let firstOfPrevGroup = prevGroupLastIndex;

                    while (firstOfPrevGroup > 0 &&
                        filteredQuestions[firstOfPrevGroup - 1].resourceId === prevResourceId) {
                        firstOfPrevGroup--;
                    }

                    setCurrentQuestion(firstOfPrevGroup + 1);
                } else {
                    // Nếu không tìm thấy nhóm trước đó, lùi một câu
                    setCurrentQuestion(Math.max(1, currentQuestion - 1));
                }
            } else {
                // Đối với các phần không nhóm, chỉ đơn giản là lùi một câu
                setCurrentQuestion(Math.max(1, currentQuestion - 1));
            }
        }
    };
    // Render giao diện
    const renderSingleQuestion = () => {
        const question = currentGroup[0];
        if (!question) return null;

        return (
            <div className="single-container">
                {question.part === 1 && (
                    <img src={question.imageUrl} alt="Mô tả" className="main-image" />
                )}

                {question.part === 2 && (
                    <div className="audio-section">
                        <button className="audio-button">
                            <i className="fas fa-play"></i> Nghe câu hỏi
                        </button>
                    </div>
                )}

                <div className="answer-section">
                    <div className="question-header">
                        <span className="question-number">Câu {question.id}</span>
                        {question.part === 5 && (
                            <p className="sentence">{question.sentence}</p>
                        )}
                    </div>

                    <div className="answer-grid">
                        {question.answers.map(answer => (
                            <div key={answer.id} className="answer-row">
                                <label className="option-item">
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        checked={answers[question.id] === answer.id}
                                        onChange={() => handleAnswerSelect(question.id, answer.id)}
                                    />
                                    <span className="option-label">{answer.text}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderGroupQuestions = () => {
        const question = currentGroup[0];
        if (!question) return null;
        return (
            <div className="group-container">
                <div className="resource-panel">
                    {[3, 4].includes(question.part) && (
                        <div className="audio-resource">
                            <button className="audio-button">
                                <i className="fas fa-play"></i>
                                {question.part === 3 ? 'Nghe hội thoại' : 'Nghe bài nói'}
                            </button>
                            {question.chart && (
                                <img src={question.chart} alt="Biểu đồ" className="chart-image" />
                            )}
                        </div>
                    )}

                    {question.part === 6 && (
                        <div className="text-resource">
                            {question.passageText.map((text, idx) => (
                                <p key={idx} dangerouslySetInnerHTML={{ __html: text }} />
                            ))}
                        </div>
                    )}

                    {question.part === 7 && (
                        <div className="reading-resource">
                            {question.passages?.map((passage, idx) => (
                                <div key={idx} className="passage">
                                    <h4>{passage.title}</h4>
                                    {passage.content.map((text, i) => (
                                        <p key={i}>{text}</p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="questions-panel">
                    {currentGroup.map(q => (
                        <div key={q.id} className="question-block">
                            <div className="question-header">
                                <span className="question-number">Câu {q.id}</span>
                                {q.part === 6 && (
                                    <span className="blank-number"></span>
                                )}
                            </div>

                            {q.questionText && <p className="question-text">{q.questionText}</p>}

                            <div className="answer-options">
                                {q.answers.map(answer => (
                                    <label key={answer.id} className="option-item">
                                        <input
                                            type="radio"
                                            name={`question-${q.id}`}
                                            checked={answers[q.id] === answer.id}
                                            onChange={() => handleAnswerSelect(q.id, answer.id)}
                                        />
                                        <span className="option-label">{answer.text}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderNavigationPanel = () => {
        return (
            <div className={`question-panel ${showPanel ? 'open' : ''}`}>
                <div className="panel-header">
                    <h3>Danh sách câu hỏi</h3>
                    <button className="close-btn" onClick={() => setShowPanel(false)}>×</button>
                </div>

                <div className="panel-content">
                    {[1, 2, 3, 4, 5, 6, 7].map(part => (
                        <div key={part} className="part-section">
                            <h4>PART {part}</h4>
                            <div className="question-grid">
                                {filteredQuestions
                                    .filter(q => q.part === part)
                                    .map(q => {
                                        const isDisabled = currentPart <= 4 || q.part <= 4;
                                        return (
                                            <button
                                                key={q.id}
                                                className={`question-btn 
                                                    ${answers[q.id] ? 'answered' : ''}
                                                    ${currentGroup.some(gq => gq.id === q.id) ? 'active' : ''}
                                                    ${isDisabled ? 'disabled' : ''}`}
                                                onClick={!isDisabled ? () => handleQuestionNavigation(q.id) : undefined}
                                                disabled={isDisabled}
                                            >
                                                {q.id}
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="do-test-container">
            <header className="test-header">
                <div className="header-content_white">
                    <span className="test-title">Đề thi thử TOEIC</span>
                    <div className="header-controls">
                        <button className="submit-button">Nộp bài</button>
                        <div className="timer">{formatTime(timeLeft)}</div>
                        <button
                            className={`panel-toggle ${currentPart <= 4 ? 'disabled' : ''}`}
                            onClick={() => setShowPanel(!showPanel)}
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
                        {Object.keys(answers).length}/{filteredQuestions.length}
                    </div>
                </div>
                <div className="content-wrapper">
                    <h2 className="part-title">PART {currentPart}</h2>

                    {filteredQuestions.length > 0 ? (
                        <div className="question-content">
                            {[1, 2, 5].includes(currentPart) ?
                                (currentGroup.length > 0 ? renderSingleQuestion() : null) :
                                (currentGroup.length > 0 ? renderGroupQuestions() : null)}

                            {/* Thêm điều kiện hiển thị */}
                            {![1, 2, 3, 4].includes(currentPart) && (
                                <div className="navigation-controls">
                                    <button
                                        className="nav-btn prev"
                                        onClick={() => navigateQuestions('prev')}
                                        disabled={currentQuestion === 1}
                                    >
                                        ← Câu trước
                                    </button>
                                    <button
                                        className="nav-btn next"
                                        onClick={() => navigateQuestions('next')}
                                        disabled={currentQuestion === filteredQuestions.length}
                                    >
                                        Câu tiếp →
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="no-questions">Không có câu hỏi nào được chọn</div>
                    )}

                </div>

            </main>
        </div>

    );
};

export default DoTest;