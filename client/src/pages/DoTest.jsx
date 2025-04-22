import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import '../styles/DoTest.css';
import TestService from '../services/TestService';

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
    const [testData, setTestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Tải dữ liệu từ API
    useEffect(() => {
        const fetchTestData = async () => {
            try {
                setLoading(true);
                const rawData = await TestService.getTestById(1);
                const processedData = TestService.processTestData(rawData);
                setTestData(processedData);

                // Khởi tạo thời gian nếu có
                if (processedData.duration) {
                    setTimeLeft(processedData.duration * 60); // Chuyển phút thành giây
                }

                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu bài kiểm tra:", err);
                setError("Không thể tải bài kiểm tra. Vui lòng thử lại sau.");
                setLoading(false);
            }
        };

        fetchTestData();
    }, [testID]);

    // Khởi tạo và lọc câu hỏi
    useEffect(() => {
        if (!testData) return;

        const selectedParts = state?.selectedParts || [];
        const allQuestions = testData.allQuestions || [];

        const filtered = selectedParts.length > 0
            ? allQuestions.filter(q => selectedParts.includes(q.partNumber))
            : allQuestions;

        // Chuyển đổi dữ liệu để phù hợp với cấu trúc TOEIC chuẩn
        const formattedQuestions = filtered.map(q => {
            // Lấy thông tin resource
            const resource = q.resource || {};

            return {
                id: q.id,
                questionNumber: q.questionNumber,
                part: q.partNumber,
                resourceId: resource.id || null,
                // Phần 5 - câu đơn chỉ có câu hỏi
                sentence: q.partNumber === 5 ? q.content : null,
                // Phần 6 - đoạn văn với 4 câu hỏi
                passageText: q.partNumber === 6 && resource.paragraph ?
                    [resource.paragraph] : [],
                // Phần 7 - đoạn đọc với số câu hỏi đa dạng
                passages: q.partNumber === 7 && resource.paragraph ?
                    [{
                        title: "Reading Passage",
                        content: [resource.paragraph]
                    }] : [],
                // Lưu trữ đường dẫn âm thanh (Part 1-4)
                audioUrl: resource.urlAudio || null,
                // Lưu trữ đường dẫn hình ảnh
                imageUrl: resource.urlImage || null,
                questionText: q.content,
                answers: q.partNumber === 2 ?
                    // Part 2 chỉ có 3 đáp án A, B, C
                    [
                        { id: 'A', text: q.options.A },
                        { id: 'B', text: q.options.B },
                        { id: 'C', text: q.options.C }
                    ] :
                    // Các part khác đều có 4 đáp án A, B, C, D
                    [
                        { id: 'A', text: q.options.A },
                        { id: 'B', text: q.options.B },
                        { id: 'C', text: q.options.C },
                        { id: 'D', text: q.options.D }
                    ]
            };
        });

        setFilteredQuestions(formattedQuestions);
        setCurrentQuestion(1);
    }, [testData, state]);

    // Xử lý timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Cập nhật nhóm câu hỏi theo đặc trưng của từng phần
    useEffect(() => {
        const question = filteredQuestions[currentQuestion - 1];
        if (!question) {
            setCurrentGroup([]);
            return;
        }

        setCurrentPart(question.part);

        // Xác định cách gom nhóm câu hỏi theo từng phần
        if (question.part === 1 || question.part === 2 || question.part === 5) {
            // Part 1, 2, 5: Câu đơn
            setCurrentGroup([question]);
        } else if (question.part === 3 || question.part === 4) {
            // Part 3, 4: Gom nhóm theo resourceId (1 audio cho 3 câu hỏi)
            const newGroup = filteredQuestions.filter(q =>
                q.resourceId === question.resourceId && q.part === question.part
            );
            setCurrentGroup(newGroup);
        } else if (question.part === 6) {
            // Part 6: Gom nhóm theo resourceId (1 đoạn văn cho 4 câu hỏi)
            const newGroup = filteredQuestions.filter(q =>
                q.resourceId === question.resourceId && q.part === 6
            );
            setCurrentGroup(newGroup);
        } else if (question.part === 7) {
            // Part 7: Gom nhóm theo resourceId (có thể 2 câu hoặc 4 câu cho 1 đoạn đọc)
            const newGroup = filteredQuestions.filter(q =>
                q.resourceId === question.resourceId && q.part === 7
            );
            setCurrentGroup(newGroup);
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

    const playAudio = (url) => {
        if (!url) {
            console.error('Không có đường dẫn âm thanh');
            return;
        }

        const audio = new Audio(url);
        audio.play().catch(err => {
            console.error('Lỗi khi phát âm thanh:', err);
            alert('Không thể phát âm thanh. Vui lòng kiểm tra kết nối mạng.');
        });
    };

    const prepareAnswersToSubmit = () => {
        const answersArray = Object.entries(answers).map(([questionId, answerId]) => ({
            questionId: parseInt(questionId),
            selectedAnswer: answerId // 'A', 'B', 'C' hoặc 'D'
        }));

        return {
            testId: parseInt(testID),
            answers: answersArray
        };
    };

    const handleSubmitTest = async () => {
        try {
            if (Object.keys(answers).length === 0) {
                alert('Bạn chưa trả lời câu hỏi nào. Vui lòng làm bài trước khi nộp.');
                return;
            }

            const confirmSubmit = window.confirm('Bạn có chắc muốn nộp bài?');
            if (!confirmSubmit) return;

            const submissionData = prepareAnswersToSubmit();
            // Phần này sẽ được kích hoạt khi có API nộp bài
            // await TestService.submitTestAnswers(submissionData);
            console.log('Nộp bài:', submissionData);

            // Hiển thị thông báo thành công
            alert('Nộp bài thành công!');
        } catch (error) {
            console.error('Lỗi khi nộp bài:', error);
            alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
        }
    };

    // Điều hướng giữa các nhóm câu hỏi
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
                    if (filteredQuestions[i].resourceId !== currentResourceId ||
                        filteredQuestions[i].part !== currentQ.part) {
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
                    if (filteredQuestions[i].resourceId !== currentResourceId ||
                        filteredQuestions[i].part !== currentQ.part) {
                        prevGroupLastIndex = i;
                        break;
                    }
                }

                if (prevGroupLastIndex !== -1) {
                    // Tìm câu đầu tiên của nhóm trước đó
                    const prevResourceId = filteredQuestions[prevGroupLastIndex].resourceId;
                    const prevPart = filteredQuestions[prevGroupLastIndex].part;
                    let firstOfPrevGroup = prevGroupLastIndex;

                    while (firstOfPrevGroup > 0 &&
                        filteredQuestions[firstOfPrevGroup - 1].resourceId === prevResourceId &&
                        filteredQuestions[firstOfPrevGroup - 1].part === prevPart) {
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

    // Render Part 1 - 1 ảnh, 1 audio, 4 đáp án
    const renderPart1Question = (question) => {
        if (!question) return null;

        return (
            <div className="part1-container">
                <div className="image-container">
                    <img
                        src={question.imageUrl}
                        alt={`Hình ảnh câu ${question.questionNumber}`}
                        className="main-image"
                        onError={(e) => {
                            console.error("Lỗi tải hình ảnh:", e);
                            e.target.src = "/placeholder-image.jpg";
                            e.target.alt = "Không thể tải hình ảnh";
                        }}
                    />
                </div>

                <div className="audio-section">
                    <button className="audio-button" onClick={() => playAudio(question.audioUrl)}>
                        <i className="fas fa-play"></i> Nghe câu hỏi
                    </button>
                </div>

                <div className="answer-section">
                    <div className="question-header">
                        <span className="question-number">Câu {question.questionNumber}</span>
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

    // Render Part 2 - Chỉ có audio và 3 đáp án A, B, C
    const renderPart2Question = (question) => {
        if (!question) return null;

        return (
            <div className="part2-container">
                <div className="audio-section">
                 
                    <button className="audio-button" onClick={() => playAudio("http://webaudioapi.com/samples/audio-tag/chrono.mp3")}>
                        <i className="fas fa-play"></i> Nghe câu hỏi
                    </button>
                </div>

                <div className="answer-section">
                    
                    <div className="question-header-dotest">
                                    <span className="question-number-dotest">Câu {question.questionNumber}: </span> 
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

    // Render Part 3,4 - 1 audio cho 3 câu hỏi (Part 3 cuối có thêm ảnh)
    const renderPart3and4Questions = () => {
        if (!currentGroup || currentGroup.length === 0) return null;

        const hasImage = currentGroup[0].imageUrl !== null;
        const isPart3End = currentGroup[0].part === 3 && hasImage; // 9 câu cuối part 3 có ảnh

        return (
            <div className="part3-4-container">
                <div className="audio-resource">
                    <button className="audio-button" onClick={() => playAudio(currentGroup[0].audioUrl)}>
                        <i className="fas fa-play"></i>
                        {currentGroup[0].part === 3 ? 'Nghe hội thoại' : 'Nghe bài nói'}
                    </button>

                    {isPart3End && (
                        <div className="image-container">
                            <img
                                src={currentGroup[0].imageUrl}
                                alt="Hình ảnh hỗ trợ"
                                className="supporting-image"
                                onError={(e) => {
                                    console.error("Lỗi tải hình ảnh:", e);
                                    e.target.style.display = "none";
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="questions-panel">
                    {currentGroup.map(q => (
                        <div key={q.id} className="question-block">
                            <div className="question-header">
                                <span className="question-number">Câu {q.questionNumber}</span>
                            </div>

                            <p className="question-text">{q.questionText}</p>

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

    // Render Part 5 - Câu đơn chỉ có câu hỏi và đáp án
    const renderPart5Question = (question) => {
        if (!question) return null;

        return (
            <div className="part5-container">
                <div className="answer-section">
                    <div className="question-header-dotest">
                        <span className="question-number-dotest">Câu {question.questionNumber}: </span>
                        <span className="sentence">{question.sentence}</span>
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

    // Render Part 6 - 1 đoạn văn/ảnh cho 4 câu hỏi
    const renderPart6Questions = () => {
        if (!currentGroup || currentGroup.length === 0) return null;
    
        return (
            <div className="part6-container">
                <div className="part6-two-columns">
                    <div className="resource-panel scrollable-content">
                        {currentGroup[0].imageUrl && (
                            <div className="image-container">
                                <img
                                    src={currentGroup[0].imageUrl}
                                    alt="Hình ảnh hỗ trợ"
                                    className="supporting-image"
                                    onError={(e) => {
                                        console.error("Lỗi tải hình ảnh:", e);
                                        e.target.src = "/placeholder-image.jpg";
                                        e.target.alt = "Không thể tải hình ảnh";
                                    }}
                                />
                            </div>
                        )}
                        <div className="text-resource">
                            {currentGroup[0].passageText.map((text, idx) => (
                                <p key={idx} dangerouslySetInnerHTML={{ __html: text }} />
                            ))}
                        </div>
                    </div>
    
                    <div className="questions-panel">
                        {currentGroup.map(q => (
                            <div key={q.id} className="question-block">
                                <div className="question-header-dotest">
                                    <span className="question-number-dotest">Câu {q.questionNumber}: </span>
                                    <span className="sentence">{q.questionText}</span>
                                </div>
    
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
            </div>
        );
    };
    // Render Part 7 - Đa dạng (1 ảnh/đoạn đọc cho 2-4 câu hỏi)
    const renderPart7Questions = () => {
        if (!currentGroup || currentGroup.length === 0) return null;
    
        return (
            <div className="part7-container">
                <div className="part7-two-columns">
                    <div className="resource-panel scrollable-image">
                        {currentGroup[0].imageUrl && (
                            <div className="image-container">
                                <img 
                                    src={currentGroup[0].imageUrl} 
                                    alt="Hình ảnh đọc hiểu" 
                                    className="supporting-image" 
                                    onError={(e) => {
                                        console.error("Lỗi tải hình ảnh:", e);
                                        e.target.src = "/placeholder-image.jpg";
                                        e.target.alt = "Không thể tải hình ảnh";
                                    }}
                                />
                            </div>
                        )}
                    </div>
    
                    <div className="questions-panel">
                        {currentGroup.map(q => (
                            <div key={q.id} className="question-block">
                                  <div className="question-header-dotest">
                                <span className="question-number-dotest">Câu {q.questionNumber}: </span>
                                <span className="sentence">{q.questionText}</span>
                            </div>
    
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
            </div>
        );
    };

    // Render các câu hỏi dựa trên phần hiện tại
    const renderQuestionsByPart = () => {
        if (currentGroup.length === 0) return null;

        const part = currentGroup[0].part;

        switch (part) {
            case 1:
                return renderPart1Question(currentGroup[0]);
            case 2:
                return renderPart2Question(currentGroup[0]);
            case 3:
            case 4:
                return renderPart3and4Questions();
            case 5:
                return renderPart5Question(currentGroup[0]);
            case 6:
                return renderPart6Questions();
            case 7:
                return renderPart7Questions();
            default:
                return null;
        }
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
                                                {q.questionNumber}
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
                    <span className="test-title">
                        {testData ? testData.title : 'Đề thi thử TOEIC'}
                    </span>
                    <div className="header-controls">
                        <button className="submit-button" onClick={handleSubmitTest}>Nộp bài</button>
                        <div className="timer-dotest">{formatTime(timeLeft)}</div>
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
                {loading ? (
                    <div className="loading-state">
                        <p>Đang tải dữ liệu bài kiểm tra...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>Thử lại</button>
                    </div>
                ) : (
                    <>
                        <div className="progress-container">
                            <div className="word-counter">
                                {Object.keys(answers).length}/{filteredQuestions.length}
                            </div>
                        </div>
                        <div className="content-wrapper">
                            <h2 className="part-title">PART {currentPart}</h2>

                            {filteredQuestions.length > 0 ? (
                                <div className="question-content">
                                    {renderQuestionsByPart()}

                                    {/* Hiển thị nút điều hướng cho Part 5-7 */}
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
                    </>
                )}
            </main>
        </div>
    );
};

export default DoTest;