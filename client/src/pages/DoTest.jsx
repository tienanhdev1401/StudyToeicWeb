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

    // Lọc câu hỏi theo part được chọn
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

    // Cập nhật part hiện tại
    useEffect(() => {
        const question = filteredQuestions[currentQuestion - 1];
        setCurrentPart(question?.part || 5);
    }, [currentQuestion, filteredQuestions]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return [hrs, mins, secs].map(n => n.toString().padStart(2, '0')).join(':');
    };

    const togglePanel = () => {
        if (currentPart >= 5 && currentPart <= 7) {
            setShowPanel(!showPanel);
        }
    };

    const handleQuestionNavigation = (questionId) => {
        const questionIndex = filteredQuestions.findIndex(q => q.id === questionId);
        if (questionIndex >= 0) {
            setCurrentQuestion(questionIndex + 1);
            setShowPanel(false);
        }
    };

    const handleAnswerSelect = (questionId, answerId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));
    };

    const answeredCount = Object.keys(answers).length;

    return (
        <div className="do-test-container">
            <header className="test-header">
                <div className="header-content">
                    <h1 className="header-title">HỆ THỐNG THI TRỰC TUYẾN</h1>

                    <div className="header-controls">
                        <button className="submit-button">NỘP BÀI</button>
                        <div className="time-counter">{formatTime(timeLeft)}</div>
                        <div className="user-info">
                            <span className="username">Guest (khách)</span>
                            <button
                                className={`panel-toggle ${currentPart <= 4 ? 'disabled' : ''}`}
                                onClick={togglePanel}
                            >
                                <i className="fas fa-list-ol"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Question Panel */}
            <div className={`question-panel ${showPanel ? 'open' : ''}`}>
                <div className="panel-header">
                    <h3 className="panel-title">Danh sách câu hỏi</h3>
                    <button className="close-button" onClick={() => setShowPanel(false)}>×</button>
                </div>

                <div className="panel-content">
                    {/* Listening Section */}
                    <div className="section listening-section">
                        <h4 className="section-title">PHẦN NGHE (1-100)</h4>

                        {/* Part 1 */}
                        <div className="part-group">
                            <h5 className="part-title">PART 1 (1-6)</h5>
                            <div className="question-grid">
                                {filteredQuestions
                                    .filter(q => q.part === 1)
                                    .map(question => (
                                        <div
                                            key={question.id}
                                            className="question-item disabled"
                                        >
                                            {question.id}
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Part 2 */}
                        <div className="part-group">
                            <h5 className="part-title">PART 2 (7-31)</h5>
                            <div className="question-grid">
                                {filteredQuestions
                                    .filter(q => q.part === 2)
                                    .map(question => (
                                        <div
                                            key={question.id}
                                            className="question-item disabled"
                                        >
                                            {question.id}
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Part 3 */}
                        <div className="part-group">
                            <h5 className="part-title">PART 3 (32-70)</h5>
                            <div className="question-grid">
                                {filteredQuestions
                                    .filter(q => q.part === 3)
                                    .map(question => (
                                        <div
                                            key={question.id}
                                            className="question-item disabled"
                                        >
                                            {question.id}
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Part 4 */}
                        <div className="part-group">
                            <h5 className="part-title">PART 4 (71-100)</h5>
                            <div className="question-grid">
                                {filteredQuestions
                                    .filter(q => q.part === 4)
                                    .map(question => (
                                        <div
                                            key={question.id}
                                            className="question-item disabled"
                                        >
                                            {question.id}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Reading Section */}
                    <div className="section reading-section">
                        <h4 className="section-title">PHẦN ĐỌC (101-200)</h4>

                        {/* Part 5 */}
                        <div className="part-group">
                            <h5 className="part-title">PART 5 (101-130)</h5>
                            <div className="question-grid">
                                {filteredQuestions
                                    .filter(q => q.part === 5)
                                    .map(question => (
                                        <button
                                            key={question.id}
                                            className={`question-item ${answers[question.id] ? 'answered' : ''}`}
                                            onClick={() => handleQuestionNavigation(question.id)}
                                        >
                                            {question.id}
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* Part 6 */}
                        <div className="part-group">
                            <h5 className="part-title">PART 6 (131-146)</h5>
                            <div className="question-grid">
                                {filteredQuestions
                                    .filter(q => q.part === 6)
                                    .map(question => (
                                        <button
                                            key={question.id}
                                            className={`question-item ${answers[question.id] ? 'answered' : ''}`}
                                            onClick={() => handleQuestionNavigation(question.id)}
                                        >
                                            {question.id}
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* Part 7 */}
                        <div className="part-group">
                            <h5 className="part-title">PART 7 (147-200)</h5>
                            <div className="question-grid">
                                {filteredQuestions
                                    .filter(q => q.part === 7)
                                    .map(question => (
                                        <button
                                            key={question.id}
                                            className={`question-item ${answers[question.id] ? 'answered' : ''}`}
                                            onClick={() => handleQuestionNavigation(question.id)}
                                        >
                                            {question.id}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="test-content">
                <div className="content-card">
                    <h2 className="part-header">PART {currentPart}</h2>

                    {filteredQuestions.length > 0 ? (
                        <div className="question-container">
                            <div className="question-column">
                                <h3 className="question-title">Câu hỏi: </h3>
                                <img
                                    src="https://placehold.co/600x400"
                                    alt="Question"
                                    className="question-image"
                                />
                            </div>

                            <div className="answer-column">
                                <div className="question-number">
                                    {/* Hiển thị ID thực tế của câu hỏi */}
                                    {filteredQuestions[currentQuestion - 1]?.id}.
                                </div>
                                <div className="answer-options">
                                    {filteredQuestions[currentQuestion - 1]?.answers.map((answer) => (
                                        <label key={answer.id} className="option-item">
                                            <input
                                                type="radio"
                                                name={`question-${filteredQuestions[currentQuestion - 1].id}`}
                                                className="option-input"
                                                onChange={() => handleAnswerSelect(
                                                    filteredQuestions[currentQuestion - 1].id,
                                                    answer.id
                                                )}
                                                checked={answers[filteredQuestions[currentQuestion - 1].id] === answer.id}
                                            />
                                            <span className="option-label">{answer.text}.</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-questions">Không có câu hỏi nào được chọn</div>
                    )}
                </div>

                <div className="word-counter">
                    {answeredCount}/200
                </div>
            </main>
        </div>
    );
};

export default DoTest;