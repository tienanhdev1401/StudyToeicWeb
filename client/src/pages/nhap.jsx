import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import '../styles/DoTest.css';
import LoadingSpinner from '../components/LoadingSpinner';
import TestService from '../services/TestService';
import ScoreService from '../services/scoreService';
import ConfirmSubmitPopup from '../components/ConfirmSubmitPopup';
import TestResultPopup from '../components/TestResultPopup';

const Nhap = () => {
    const { testID } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [currentPart, setCurrentPart] = useState(5);
    const [showPanel, setShowPanel] = useState(false);
    const [timeLeft, setTimeLeft] = useState(state?.timeLimit || 7200);
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentGroup, setCurrentGroup] = useState([]);
    const [testData, setTestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scoreResult, setScoreResult] = useState(null);
    const scoreService = new ScoreService();
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState(null);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const hasHandledTimeUp = useRef(false);
    // New state variables for showing explanations
    const [showExplanations, setShowExplanations] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState({});
    // Ref for audio container
    const audioContainerRef = useRef(null);
    //Tính điểm 
    const calculateScore = () => {
        if (!testData) {
            console.log("Không có dữ liệu bài kiểm tra để tính điểm.");
            // Trả về đối tượng rỗng nhưng có cấu trúc
            return {
                listeningCorrect: 0,
                readingCorrect: 0,
                listeningTotal: 0,
                readingTotal: 0,
                listeningScore: 0,
                readingScore: 0,
                totalScore: 0,
                partDetails: {
                    part1: { correct: 0, total: 0 },
                    part2: { correct: 0, total: 0 },
                    part3: { correct: 0, total: 0 },
                    part4: { correct: 0, total: 0 },
                    part5: { correct: 0, total: 0 },
                    part6: { correct: 0, total: 0 },
                    part7: { correct: 0, total: 0 },
                },
                testId: testID
            };
        }

        // Lưu trữ danh sách đáp án đúng
        const correctAnswersMap = {};

        // Phân loại câu hỏi theo phần Listening (1-4) và Reading (5-7)
        const listeningQuestions = filteredQuestions.filter(q => q.part <= 4);
        const readingQuestions = filteredQuestions.filter(q => q.part >= 5);

        // Đếm số câu đúng cho mỗi phần
        let listeningCorrect = 0;
        let readingCorrect = 0;

        // Đếm số câu đúng cho từng part
        const partDetails = {
            part1: { correct: 0, total: filteredQuestions.filter(q => q.part === 1).length },
            part2: { correct: 0, total: filteredQuestions.filter(q => q.part === 2).length },
            part3: { correct: 0, total: filteredQuestions.filter(q => q.part === 3).length },
            part4: { correct: 0, total: filteredQuestions.filter(q => q.part === 4).length },
            part5: { correct: 0, total: filteredQuestions.filter(q => q.part === 5).length },
            part6: { correct: 0, total: filteredQuestions.filter(q => q.part === 6).length },
            part7: { correct: 0, total: filteredQuestions.filter(q => q.part === 7).length },
        };

        console.log("Đang tính điểm và lấy đáp án đúng...");

        // Lấy đáp án đúng cho tất cả câu hỏi trước
        filteredQuestions.forEach(question => {
            const qId = question.id;
            // Lấy đáp án đúng từ câu hỏi hoặc từ testData
            const originalQuestion = testData.allQuestions.find(q => q.id === qId);
            if (originalQuestion) {
                correctAnswersMap[qId] = originalQuestion.correctAnswer;
                console.log(`Câu ${question.questionNumber} (ID: ${qId}): Đáp án đúng = ${originalQuestion.correctAnswer}`);
            } else {
                console.warn(`Không tìm thấy thông tin cho câu hỏi ID: ${qId}`);
            }
        });

        // Kiểm tra từng câu trả lời
        Object.entries(answers).forEach(([questionId, selectedAnswer]) => {
            const question = filteredQuestions.find(q => q.id === parseInt(questionId));
            if (!question) return;

            // Lấy đáp án đúng đã được lưu trước đó
            const correctAnswer = correctAnswersMap[questionId];

            if (selectedAnswer === correctAnswer) {
                if (question.part <= 4) {
                    listeningCorrect++;
                } else {
                    readingCorrect++;
                }

                // Cập nhật số câu đúng cho từng part
                partDetails[`part${question.part}`].correct++;
            }
        });

        // Lưu tất cả đáp án đúng vào state
        setCorrectAnswers(correctAnswersMap);
        console.log("Đã lưu đáp án đúng:", correctAnswersMap);

        // Hiển thị giải thích
        setShowExplanations(true);

        // Tính điểm cho từng phần và tổng điểm
        const listeningScore = scoreService.calculateListeningScore(listeningCorrect);
        const readingScore = scoreService.calculateReadingScore(readingCorrect);
        const totalScore = listeningScore + readingScore;

        return {
            listeningCorrect,
            readingCorrect,
            listeningTotal: listeningQuestions.length,
            readingTotal: readingQuestions.length,
            listeningScore,
            readingScore,
            totalScore,
            partDetails,
            testId: testID
        };
    };
    // Tải dữ liệu từ API
    useEffect(() => {
        const fetchTestData = async () => {
            try {
                console.log("Fetching test data..." + testID);
                setLoading(true);
                const rawData = await TestService.getTestById(testID);
                const processedData = TestService.processTestData(rawData);
                setTestData(processedData);

                // Khởi tạo thời gian nếu có
                if (!state?.timeLimit && processedData.duration) {
                    setTimeLeft(processedData.duration * 60);
                }
                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu bài kiểm tra:", err);
                setError("Không thể tải bài kiểm tra. Vui lòng thử lại sau.");
                setLoading(false);
            }
        };

        fetchTestData();
    }, [testID, state?.timeLimit]);

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
        if (isSubmitted) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const newTime = Math.max(0, prev - 1);

                // Xử lý khi hết giờ
                if (newTime === 0 && !hasHandledTimeUp.current) {
                    hasHandledTimeUp.current = true; // Đánh dấu đã xử lý
                    handleTimeUp(); // Gọi hàm xử lý
                }

                return newTime;
            });
        }, 1000);

        // Cleanup
        return () => {
            clearInterval(timer);
            hasHandledTimeUp.current = false; // Reset khi dependencies thay đổi
        };
    }, [isSubmitted, answers, testData, state]);

    // Thêm hàm xử lý khi hết giờ

    const handleTimeUp = async () => {
        if (hasHandledTimeUp.current === false) return;
        try {
            // Kiểm tra xem đã nộp bài chưa
            if (isSubmitted) return;

            // Dừng tất cả audio đang phát
            stopAudio();

            // Dừng tất cả các audio elements trên trang
            document.querySelectorAll('audio').forEach(audio => {
                audio.pause();
                audio.src = '';
            });

            // Kiểm tra có câu trả lời không
            if (Object.keys(answers).length === 0) {
                alert('Bạn chưa trả lời câu hỏi nào.');
                return;
            }

            // Đánh dấu đã nộp bài
            setIsSubmitted(true);

            // Tính điểm
            const result = calculateScore();
            setScoreResult(result);

            // Hiển thị popup kết quả ngắn gọn
            setShowResultPopup(true);

            // Chuẩn bị dữ liệu nộp bài
            const submissionData = prepareAnswersToSubmit();
            console.log('Dữ liệu nộp bài tự động:', submissionData);

            // TODO: Gửi API request

        } catch (error) {
            console.error('Lỗi khi nộp bài tự động:', error);
            alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
        }
        finally {
            hasHandledTimeUp.current = true; // Đảm bảo đánh dấu đã xử lý
        }
    };


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

    // Tự động phát audio cho phần nghe (1-4)
    useEffect(() => {
        const question = filteredQuestions[currentQuestion - 1];
        if (!question) return;

        // Dừng audio đang phát (nếu có) khi chuyển câu hỏi
        stopAudio();
        
        // Xóa tất cả audio players cũ khi chuyển câu hỏi
        cleanupAllAudioPlayers();

        // Xử lý audio cho các phần nghe (1, 2, 3, 4)
        if ([1, 2, 3, 4].includes(question.part)) {
            const audioUrl = question.audioUrl || currentGroup[0]?.audioUrl;
            if (!audioUrl) return;

            // Đặt timeout nhỏ để không gây ra quá nhiều yêu cầu đồng thời
            const timer = setTimeout(() => {
                if (isSubmitted) {
                    // Chế độ xem chi tiết: hiển thị audio player với controls
                    createAudioPlayer(audioUrl);
                } else {
                    // Chế độ làm bài: tự động phát audio
                    const onAudioComplete = () => {
                        if ([1, 2, 3, 4].includes(question.part) && !isSubmitted) {
                            navigateQuestions('next');
                        }
                    };
                    
                    const interacted = localStorage.getItem('userInteracted');
                    if (interacted === "true") {
                        playAudio(audioUrl, onAudioComplete);
                    }
                }
            }, 500);

            // Cleanup function to clear the timeout
            return () => {
                clearTimeout(timer);
                stopAudio();
            };
        }
    }, [currentQuestion, filteredQuestions, currentGroup, isSubmitted]);

    // Hàm xóa tất cả audio players khi chuyển part
    const cleanupAllAudioPlayers = () => {
        try {
            // Tìm tất cả audio containers và xóa nội dung
            document.querySelectorAll('.audio-container').forEach(container => {
                container.innerHTML = '';
            });
            
            // Dừng tất cả audio elements
            document.querySelectorAll('audio').forEach(audio => {
                audio.pause();
                audio.src = '';
            });
        } catch (error) {
            console.error('Lỗi khi xóa audio players:', error);
        }
    };

    // Dừng audio khi component unmount hoặc khi nộp bài/thoát trang
    useEffect(() => {
        // Cleanup khi unmount
        return () => {
            stopAudio();
            cleanupAllAudioPlayers();
        };
    }, []);

    // Dừng audio khi submit hoặc khi chuyển part
    useEffect(() => {
        if (isSubmitted) {
            stopAudio();
            cleanupAllAudioPlayers();
        }
    }, [isSubmitted, currentPart]);

    // Hàm tạo audio player với controls
    const createAudioPlayer = (url) => {
        if (!url) {
            console.error('Không có URL audio');
            return;
        }
        
        try {
            // Xóa tất cả audio players cũ trước khi tạo mới
            cleanupAllAudioPlayers();
            
            // Tìm container cho part hiện tại
            const audioContainers = document.querySelectorAll('.audio-resource');
            if (audioContainers.length === 0) {
                console.error('Không tìm thấy audio container');
                return;
            }
            
            // Sử dụng container đầu tiên
            const container = audioContainers[0];
            
            // Tìm audio container trong container hiện tại
            const audioContainer = container.querySelector('.audio-container');
            if (!audioContainer) {
                console.error('Không tìm thấy audio container trong resource');
                return;
            }
            
            // Xóa nội dung cũ
            audioContainer.innerHTML = '';
            
            // Tạo audio element
            const audioElem = document.createElement('audio');
            audioElem.src = url;
            audioElem.controls = true;
            audioElem.autoplay = false; // Không tự động phát
            audioElem.preload = 'metadata';
            audioElem.className = 'audio-player';
            audioElem.style.width = '100%';
            
            // Thêm event listeners
            audioElem.addEventListener('error', (e) => {
                console.error('Lỗi audio:', e);
            });
            
            // Thêm vào container
            audioContainer.appendChild(audioElem);
            
            console.log('Đã tạo audio player cho URL:', url);
        } catch (error) {
            console.error('Lỗi khi tạo audio player:', error);
        }
    };

    // Hàm phát audio với callback khi kết thúc
    const playAudio = (url, onComplete = null) => {
        if (!url) {
            console.error('Không có đường dẫn âm thanh');
            return;
        }

        // Nếu đang phát, dừng audio trước
        stopAudio();

        // Tìm và dừng tất cả các audio elements khác
        document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.src = '';
        });

        try {
            setIsAudioPlaying(true);
            const audio = new Audio(url);

            // Đặt các thuộc tính
            audio.volume = 1.0;
            audio.preload = 'auto';

            // Thêm sự kiện error
            audio.addEventListener('error', (e) => {
                console.error('Lỗi khi tải audio:', e);
                setIsAudioPlaying(false);
                setAudioElement(null);
            });

            // Thêm sự kiện ended
            audio.addEventListener('ended', () => {
                setIsAudioPlaying(false);
                setAudioElement(null);

                // Gọi callback nếu có
                if (onComplete && typeof onComplete === 'function') {
                    onComplete();
                }
            });

            // Lưu vào state
            setAudioElement(audio);

            // Phát audio
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.error('Lỗi khi phát âm thanh:', err);
                    setIsAudioPlaying(false);
                    setAudioElement(null);
                });
            }
        } catch (error) {
            console.error('Lỗi khi khởi tạo audio:', error);
            setIsAudioPlaying(false);
        }
    };

    // Hàm dừng audio đang phát
    const stopAudio = () => {
        try {
            if (audioElement) {
                audioElement.pause();
                if (audioElement.src) {
                    audioElement.src = '';
                }
                setIsAudioPlaying(false);
                setAudioElement(null);
            }
        } catch (error) {
            console.error('Lỗi khi dừng audio:', error);
        }
    };

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
        // Dừng audio đang phát và xóa tất cả audio players
        stopAudio();
        cleanupAllAudioPlayers();
        
        // Tìm vị trí câu hỏi và chuyển đến
        const index = filteredQuestions.findIndex(q => q.id === questionId);
        if (index >= 0) setCurrentQuestion(index + 1);
    };

    const prepareAnswersToSubmit = () => {
        // Tạo mảng chứa câu trả lời của người dùng
        const userAnswerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => {
            // Tìm số thứ tự của câu hỏi (questionNumber) dựa vào questionId
            const question = filteredQuestions.find(q => q.id === parseInt(questionId));
            const questionNumber = question ? question.questionNumber : null;

            return {
                questionId: parseInt(questionId),  // ID câu hỏi trong DB
                questionNumber: questionNumber,    // Số thứ tự câu trong đề (1, 2, 3,...)
                selectedAnswer                     // Đáp án người dùng chọn (A, B, C, D)
            };
        });

        // Dữ liệu gửi lên server
        return {
            TestId: parseInt(testID),
            score: scoreResult?.totalScore || 0,
            completionTime: state?.timeLimit ? state.timeLimit - timeLeft : 7200 - timeLeft,
            tittle: testData?.title || "Bài thi TOEIC",
            userAnswer: JSON.stringify(userAnswerArray)
        };
    };

    const handleSubmitTest = () => {
        // Kiểm tra xem người dùng đã trả lời ít nhất một câu hay chưa
        if (Object.keys(answers).length === 0) {
            alert('Bạn chưa trả lời câu hỏi nào. Vui lòng làm bài trước khi nộp.');
            return;
        }

        // Hiển thị popup xác nhận
        setShowConfirmPopup(true);
    };

    const confirmSubmitTest = async () => {
        // Đóng popup xác nhận
        setShowConfirmPopup(false);

        // Kiểm tra nếu bài đã được nộp thì không làm gì thêm
        if (isSubmitted) return;

        try {
            // Dừng tất cả audio đang phát
            stopAudio();

            // Dừng tất cả các audio elements trên trang
            document.querySelectorAll('audio').forEach(audio => {
                audio.pause();
                audio.src = '';
            });

            // Đánh dấu đã nộp bài
            setIsSubmitted(true);

            // Tính điểm
            const result = calculateScore();
            setScoreResult(result);

            // Hiển thị popup kết quả ngắn gọn
            setShowResultPopup(true);

            // Chuẩn bị dữ liệu nộp bài
            const submissionData = prepareAnswersToSubmit();
            console.log('Dữ liệu nộp bài thủ công:', submissionData);

            // Gửi API request
            // Implement your API call here
        } catch (error) {
            console.error('Lỗi khi nộp bài:', error);
            alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
        }
    };

    // Xử lý khi nhấn nút thoát
    const handleExitClick = () => {
        // Dừng tất cả audio
        stopAudio();
        
        // Xóa tất cả audio players
        cleanupAllAudioPlayers();
        
        // Chuyển hướng về trang test-online-new
        navigate('/test-online-new');
    };

    const handleSaveResult = async () => {
        try {
            // Implement logic to save result to the backend
            console.log('Lưu kết quả:', scoreResult);
            // Add your API call here

            // Navigate to homepage or another page
            navigate('/test-online-new');
        } catch (error) {
            console.error('Lỗi khi lưu kết quả:', error);
        }
    };

    // Điều hướng giữa các nhóm câu hỏi
    const navigateQuestions = (direction) => {
        // Dừng audio đang phát (nếu có) khi chuyển câu hỏi
        stopAudio();
        cleanupAllAudioPlayers();

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

        // Get correct answer for this question if submitted
        const correctAnswer = correctAnswers[question.id];
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === correctAnswer;

        // Get explanation from testData if submitted
        const explanation = isSubmitted && testData?.allQuestions?.find(q => q.id === question.id)?.explainDetail;

        return (
            <div className={`part1-container ${isSubmitted ? 'submitted' : ''}`}>
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

                <div className="audio-resource">
                    {isSubmitted ? (
                        <div className="audio-container" id={`audio-container-${currentGroup[0].id}`}>
                            {/* Audio player with controls will be inserted here in review mode */}
                        </div>
                    ) : (
                        isAudioPlaying ? (
                            <div className="audio-status playing">
                                {currentGroup[0].part === 3 ? 'Đang phát hội thoại...' : 'Đang phát bài nói...'}
                            </div>
                        ) : (
                            <div className="audio-status">
                                {currentGroup[0].part === 3 ? 'Chuẩn bị phát hội thoại...' : 'Chuẩn bị phát bài nói...'}
                            </div>
                        )
                    )}
                </div>

                <div className="answer-section">
                    <div className="question-header">
                        <span className="question-number-dotest">Câu {question.questionNumber}</span>
                    </div>

                    <div className="answer-grid">
                        {question.answers.map(answer => {
                            // Determine if this option should be highlighted
                            let optionClass = "option-item";
                            if (isSubmitted) {
                                if (answer.id === correctAnswer) {
                                    optionClass += " correct";
                                } else if (userAnswer === answer.id && userAnswer !== correctAnswer) {
                                    optionClass += " incorrect";
                                }
                            }
                            return (
                                <div key={answer.id} className="answer-row">
                                    <label className={optionClass}>
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            checked={answers[question.id] === answer.id}
                                            onChange={() => !isSubmitted && handleAnswerSelect(question.id, answer.id)}
                                            disabled={isSubmitted}
                                        />
                                        <span className="option-label">{answer.text}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                    {/* Show explanation if submitted and available */}
                    {isSubmitted && explanation && (
                        <div className="explanation-box">
                            <div className="explanation-title">Giải thích:</div>
                            <div className="explanation-content" dangerouslySetInnerHTML={{ __html: explanation }} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render Part 2 - Chỉ có audio và 3 đáp án A, B, C
    const renderPart2Question = (question) => {
        if (!question) return null;

        // Get correct answer for this question if submitted
        const correctAnswer = correctAnswers[question.id];
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === correctAnswer;

        // Get explanation from testData if submitted
        const explanation = isSubmitted && testData?.allQuestions?.find(q => q.id === question.id)?.explainDetail;

        return (
            <div className={`part2-container ${isSubmitted ? 'submitted' : ''}`}>
                <div className="audio-resource">
                 {isSubmitted ? (
                        <div className="audio-container" id={`audio-container-${currentGroup[0].id}`}>
                            {/* Audio player with controls will be inserted here in review mode */}
                        </div>
                    ) : (
                        isAudioPlaying ? (
                            <div className="audio-status playing">
                                {currentGroup[0].part === 3 ? 'Đang phát hội thoại...' : 'Đang phát bài nói...'}
                            </div>
                        ) : (
                            <div className="audio-status">
                                {currentGroup[0].part === 3 ? 'Chuẩn bị phát hội thoại...' : 'Chuẩn bị phát bài nói...'}
                            </div>
                        )
                    )}
                </div>

                <div className="answer-section">
                    <div className="question-header-dotest">
                        <span className="question-number-dotest">Câu {question.questionNumber}: </span>
                    </div>

                    <div className="answer-grid">
                        {question.answers.map(answer => {
                            // Determine if this option should be highlighted
                            let optionClass = "option-item";
                            if (isSubmitted) {
                                if (answer.id === correctAnswer) {
                                    optionClass += " correct";
                                } else if (userAnswer === answer.id && userAnswer !== correctAnswer) {
                                    optionClass += " incorrect";
                                }
                            }
                            return (
                                <div key={answer.id} className="answer-row">
                                    <label className={optionClass}>
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            checked={answers[question.id] === answer.id}
                                            onChange={() => !isSubmitted && handleAnswerSelect(question.id, answer.id)}
                                            disabled={isSubmitted}
                                        />
                                        <span className="option-label">{answer.text}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    {/* Show explanation if submitted and available */}
                    {isSubmitted && explanation && (
                        <div className="explanation-box">
                            <div className="explanation-title">Giải thích:</div>
                            <div className="explanation-content" dangerouslySetInnerHTML={{ __html: explanation }} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render Part 3,4 - 1 audio cho 3 câu hỏi
    const renderPart3and4Questions = () => {
        if (!currentGroup || currentGroup.length === 0) return null;

        const hasImage = currentGroup[0].imageUrl !== null;

        return (
            <div className={`part3-4-container ${isSubmitted ? 'submitted' : ''}`}>
                <div className="part3-4-two-columns">
                    <div className="resource-panel scrollable-content">
                        <div className="audio-resource">
                            {isSubmitted ? (
                                <div className="audio-container" id={`audio-container-${currentGroup[0].id}`}>
                                    {/* Audio player with controls will be inserted here in review mode */}
                                </div>
                            ) : (
                                isAudioPlaying ? (
                                    <div className="audio-status playing">
                                        {currentGroup[0].part === 3 ? 'Đang phát hội thoại...' : 'Đang phát bài nói...'}
                                    </div>
                                ) : (
                                    <div className="audio-status">
                                        {currentGroup[0].part === 3 ? 'Chuẩn bị phát hội thoại...' : 'Chuẩn bị phát bài nói...'}
                                    </div>
                                )
                            )}
                        </div>

                        {/* Phần hiển thị ảnh (nếu có) */}
                        {hasImage && (
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
                        {currentGroup.map(q => {
                            // Get correct answer for this question if submitted
                            const correctAnswer = correctAnswers[q.id];
                            const userAnswer = answers[q.id];

                            // Get explanation from testData if submitted
                            const explanation = isSubmitted && testData?.allQuestions?.find(que => que.id === q.id)?.explainDetail;

                            return (
                                <div key={q.id} className="question-block">
                                    <div className="question-header-dotest">
                                        <span className="question-number-dotest">Câu {q.questionNumber}: </span>
                                        <span className="sentence">{q.questionText}</span>
                                    </div>

                                    <div className="answer-options">
                                        {q.answers.map(answer => {
                                            // Determine if this option should be highlighted
                                            let optionClass = "option-item";
                                            if (isSubmitted) {
                                                if (answer.id === correctAnswer) {
                                                    optionClass += " correct";
                                                } else if (userAnswer === answer.id && userAnswer !== correctAnswer) {
                                                    optionClass += " incorrect";
                                                }
                                            }

                                    
                                            return (
                                                <label key={answer.id} className={optionClass}>
                                                    <input
                                                        type="radio"
                                                        name={`question-${q.id}`}
                                                        checked={answers[q.id] === answer.id}
                                                        onChange={() => !isSubmitted && handleAnswerSelect(q.id, answer.id)}
                                                        disabled={isSubmitted}
                                                    />
                                                    <span className="option-label">{answer.text}</span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* Show explanation if submitted and available */}
                                    {isSubmitted && explanation && (
                                        <div className="explanation-box">
                                            <div className="explanation-title">Giải thích:</div>
                                            <div className="explanation-content" dangerouslySetInnerHTML={{ __html: explanation }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // Render Part 5 - Câu đơn chỉ có câu hỏi và đáp án
    const renderPart5Question = (question) => {
        if (!question) return null;

        // Get correct answer for this question if submitted
        const correctAnswer = correctAnswers[question.id];
        const userAnswer = answers[question.id];

        // Get explanation from testData if submitted
        const explanation = isSubmitted && testData?.allQuestions?.find(q => q.id === question.id)?.explainDetail;

        return (
            <div className={`part5-container ${isSubmitted ? 'submitted' : ''}`}>
                <div className="answer-section">
                    <div className="question-header-dotest">
                        <span className="question-number-dotest">Câu {question.questionNumber}: </span>
                        <span className="sentence">{question.sentence}</span>
                    </div>

                    <div className="answer-grid">
                        {question.answers.map(answer => {
                            // Determine if this option should be highlighted
                            let optionClass = "option-item";
                            if (isSubmitted) {
                                if (answer.id === correctAnswer) {
                                    optionClass += " correct";
                                } else if (userAnswer === answer.id && userAnswer !== correctAnswer) {
                                    optionClass += " incorrect";
                                }
                            }

                            return (
                                <div key={answer.id} className="answer-row">
                                    <label className={optionClass}>
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            checked={answers[question.id] === answer.id}
                                            onChange={() => !isSubmitted && handleAnswerSelect(question.id, answer.id)}
                                            disabled={isSubmitted}
                                        />
                                        <span className="option-label">{answer.text}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    {/* Show explanation if submitted and available */}
                    {isSubmitted && explanation && (
                        <div className="explanation-box">
                            <div className="explanation-title">Giải thích:</div>
                            <div className="explanation-content" dangerouslySetInnerHTML={{ __html: explanation }} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render Part 6 - 1 đoạn văn/ảnh cho 4 câu hỏi
    const renderPart6Questions = () => {
        if (!currentGroup || currentGroup.length === 0) return null;

        return (
            <div className={`part6-container ${isSubmitted ? 'submitted' : ''}`}>
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
                        {currentGroup.map(q => {
                            // Get correct answer for this question if submitted
                            const correctAnswer = correctAnswers[q.id];
                            const userAnswer = answers[q.id];

                            // Get explanation from testData if submitted
                            const explanation = isSubmitted && testData?.allQuestions?.find(que => que.id === q.id)?.explainDetail;

                            return (
                                <div key={q.id} className="question-block">
                                    <div className="question-header-dotest">
                                        <span className="question-number-dotest">Câu {q.questionNumber}: </span>
                                        <span className="sentence">{q.questionText}</span>
                                    </div>

                                    <div className="answer-options">
                                        {q.answers.map(answer => {
                                            // Determine if this option should be highlighted
                                            let optionClass = "option-item";
                                            if (isSubmitted) {
                                                if (answer.id === correctAnswer) {
                                                    optionClass += " correct";
                                                } else if (userAnswer === answer.id && userAnswer !== correctAnswer) {
                                                    optionClass += " incorrect";
                                                }
                                            }

                                            return (
                                                <label key={answer.id} className={optionClass}>
                                                    <input
                                                        type="radio"
                                                        name={`question-${q.id}`}
                                                        checked={answers[q.id] === answer.id}
                                                        onChange={() => !isSubmitted && handleAnswerSelect(q.id, answer.id)}
                                                        disabled={isSubmitted}
                                                    />
                                                    <span className="option-label">{answer.text}</span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* Show explanation if submitted and available */}
                                    {isSubmitted && explanation && (
                                        <div className="explanation-box">
                                            <div className="explanation-title">Giải thích:</div>
                                            <div className="explanation-content" dangerouslySetInnerHTML={{ __html: explanation }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // Render Part 7 - Đa dạng (1 ảnh/đoạn đọc cho 2-4 câu hỏi)
    const renderPart7Questions = () => {
        if (!currentGroup || currentGroup.length === 0) return null;

        return (
            <div className={`part7-container ${isSubmitted ? 'submitted' : ''}`}>
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
                        {currentGroup.map(q => {
                            // Get correct answer for this question if submitted
                            const correctAnswer = correctAnswers[q.id];
                            const userAnswer = answers[q.id];

                            // Get explanation from testData if submitted
                            const explanation = isSubmitted && testData?.allQuestions?.find(que => que.id === q.id)?.explainDetail;

                            return (
                                <div key={q.id} className="question-block">
                                    <div className="question-header-dotest">
                                        <span className="question-number-dotest">Câu {q.questionNumber}: </span>
                                        <span className="sentence">{q.questionText}</span>
                                    </div>

                                    <div className="answer-options">
                                        {q.answers.map(answer => {
                                            // Determine if this option should be highlighted
                                            let optionClass = "option-item";
                                            if (isSubmitted) {
                                                if (answer.id === correctAnswer) {
                                                    optionClass += " correct";
                                                } else if (userAnswer === answer.id && userAnswer !== correctAnswer) {
                                                    optionClass += " incorrect";
                                                }
                                            }

                                            return (
                                                <label key={answer.id} className={optionClass}>
                                                    <input
                                                        type="radio"
                                                        name={`question-${q.id}`}
                                                        checked={answers[q.id] === answer.id}
                                                        onChange={() => !isSubmitted && handleAnswerSelect(q.id, answer.id)}
                                                        disabled={isSubmitted}
                                                    />
                                                    <span className="option-label">{answer.text}</span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* Show explanation if submitted and available */}
                                    {isSubmitted && explanation && (
                                        <div className="explanation-box">
                                            <div className="explanation-title">Giải thích:</div>
                                            <div className="explanation-content" dangerouslySetInnerHTML={{ __html: explanation }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
                                        // Trong chế độ xem chi tiết (đã nộp bài), cho phép truy cập tất cả các phần
                                        const isDisabled = !isSubmitted && (currentPart <= 4 || q.part <= 4);
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

    // Cleanup for audio when component unmounts
    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause();
                audioElement.src = '';
            }
        };
    }, [audioElement]);

    return (
        <div className="do-test-container">
            <header className="test-header">
                <div className="header-content_white">
                    <span className="test-title">
                        {testData ? testData.title : 'Đề thi thử TOEIC'}
                    </span>
                    <div className="header-controls">
                        {isSubmitted ? (
                            <button
                                className="exit-button"
                                onClick={handleExitClick}
                            >
                                Thoát
                            </button>
                        ) : (
                            <button className="submit-button" onClick={handleSubmitTest}>Nộp bài</button>
                        )}
                        <div className="timer-dotest">{formatTime(timeLeft)}</div>
                        <button
                            className={`panel-toggle ${!isSubmitted && currentPart <= 4 ? 'disabled' : ''}`}
                            onClick={() => setShowPanel(!showPanel)}
                            disabled={!isSubmitted && currentPart <= 4}
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                    </div>
                </div>
            </header>

            {renderNavigationPanel()}

            <main className="main-content">
                {loading ? (
                    <LoadingSpinner />
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
                            {isSubmitted && scoreResult && (
                                <div className="score-summary">
                                    <span>Điểm: {scoreResult.totalScore} (Listening: {scoreResult.listeningScore}, Reading: {scoreResult.readingScore})</span>
                                </div>
                            )}
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

            {/* Popup xác nhận nộp bài */}
            <ConfirmSubmitPopup
                isOpen={showConfirmPopup}
                onClose={() => setShowConfirmPopup(false)}
                onConfirm={confirmSubmitTest}
                answeredCount={Object.keys(answers).length}
                totalQuestions={filteredQuestions.length}
            />

            {/* Popup kết quả bài thi (hiển thị ngắn gọn) */}
            <TestResultPopup
                isOpen={showResultPopup}
                onClose={() => setShowResultPopup(false)}
                result={scoreResult}
                testTitle={testData?.title || "Bài thi TOEIC"}
                onSaveResult={handleSaveResult}
            />
        </div>
    );


};

export default Nhap;