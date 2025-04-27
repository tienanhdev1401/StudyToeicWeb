import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import '../styles/DoTest.css';
import LoadingSpinner from '../components/LoadingSpinner';
import TestService from '../services/TestService';
import ScoreService from '../services/scoreService';
import SubmissionService from '../services/SubmissionService';
import TestHistoryService from '../services/TestHistoryService';
import ConfirmSubmitPopup from '../components/ConfirmSubmitPopup';
import TestResultPopup from '../components/TestResultPopup';
import { useAuth } from '../context/AuthContext';

const TestHistoryDetail = () => {
    const { submissionId } = useParams();
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
    const [submissionData, setSubmissionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scoreResult, setScoreResult] = useState(null);
    const scoreService = new ScoreService();
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState(null);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(true); // Set to true since we're viewing a submission
    const hasHandledTimeUp = useRef(false);
    // New state variables for showing explanations
    const [showExplanations, setShowExplanations] = useState(true); // Set to true to show explanations
    const [correctAnswers, setCorrectAnswers] = useState({});
    // Ref for audio container
    const audioContainerRef = useRef(null);
    const [submissionDataForResult, setSubmissionDataForResult] = useState(null);
    const { user } = useAuth();
    // Track which parts the user has already visited
    const [visitedParts, setVisitedParts] = useState({});
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
                testId: submissionData?.TestId
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
            testId: submissionData?.TestId
        };
    };
    // Tải dữ liệu từ API
    useEffect(() => {
        const fetchSubmissionData = async () => {
            try {
                console.log("Fetching submission data..." + submissionId);
                setLoading(true);
                
                // Get both submission and test data
                const result = await TestHistoryService.getSubmissionDetail(submissionId);
                const { submission, testInfo } = result;
                
                setSubmissionData(submission);
                
                // Process the test data
                const processedData = TestService.processTestData(testInfo);
                setTestData(processedData);
                
                // Load user answers from submission
                if (submission && submission.userAnswer) {
                    try {
                        // Parse user answers if it's a string
                        const userAnswers = typeof submission.userAnswer === 'string' 
                            ? JSON.parse(submission.userAnswer) 
                            : submission.userAnswer;
                            
                        // Format answers into the expected format {questionId: selectedAnswer}
                        const formattedAnswers = {};
                        userAnswers.forEach(answer => {
                            formattedAnswers[answer.questionId] = answer.selectedAnswer;
                        });
                        
                        setAnswers(formattedAnswers);
                    } catch (error) {
                        console.error("Error parsing user answers:", error);
                    }
                }
                
                // Set timeout to allow UI to update
                setTimeout(() => {
                    setLoading(false);
                }, 100);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu chi tiết:", err);
                setError("Không thể tải chi tiết bài làm. Vui lòng thử lại sau.");
                setLoading(false);
            }
        };

        fetchSubmissionData();
    }, [submissionId]);

    // Khởi tạo và lọc câu hỏi - optimize to run faster
    useEffect(() => {
        if (!testData) return;

        // Use setTimeout to defer this CPU-intensive operation to not block rendering
        const timer = setTimeout(() => {
            const selectedParts = state?.selectedParts || [];
            const allQuestions = testData.allQuestions || [];

            // Optimize filtering by using faster array method
            const filtered = selectedParts.length > 0
                ? allQuestions.filter(q => selectedParts.includes(q.partNumber))
                : allQuestions;

            // Convert all at once rather than in multiple operations
            const formattedQuestions = filtered.map(q => {
                const resource = q.resource || {};
                
                // Ensure options always exists to prevent errors
                const options = q.options || {};
                
                // Optimize object creation by conditional properties
                const baseQuestion = {
                    id: q.id || 0,
                    questionNumber: q.questionNumber || 0,
                    part: q.partNumber || 0,
                    resourceId: resource.id || null,
                    questionText: q.content || '',
                    // Only include properties relevant to the part type
                    answers: q.partNumber === 2 ?
                        [
                            { id: 'A', text: options.A || '' },
                            { id: 'B', text: options.B || '' },
                            { id: 'C', text: options.C || '' }
                        ] :
                        [
                            { id: 'A', text: options.A || '' },
                            { id: 'B', text: options.B || '' },
                            { id: 'C', text: options.C || '' },
                            { id: 'D', text: options.D || '' }
                        ]
                };
                
                // Add part-specific properties with defensive checks
                if (q.partNumber === 5) {
                    baseQuestion.sentence = q.content || '';
                }
                // For Parts 6 and 7, only add imageUrl if available, since we're not using text content
                
                // Add media only if relevant
                if (resource.urlAudio) baseQuestion.audioUrl = resource.urlAudio;
                if (resource.urlImage) baseQuestion.imageUrl = resource.urlImage;
                
                return baseQuestion;
            });

            // Additional validation to ensure no undefined or missing properties
            const validatedQuestions = formattedQuestions.map(q => {
                // Ensure answers are never undefined
                if (!q.answers) {
                    q.answers = q.part === 2 ? 
                        [
                            { id: 'A', text: 'N/A' },
                            { id: 'B', text: 'N/A' }, 
                            { id: 'C', text: 'N/A' }
                        ] : 
                        [
                            { id: 'A', text: 'N/A' },
                            { id: 'B', text: 'N/A' }, 
                            { id: 'C', text: 'N/A' },
                            { id: 'D', text: 'N/A' }
                        ];
                }
                
                return q;
            });

            setFilteredQuestions(validatedQuestions);
            setCurrentQuestion(1);
            
            // Calculate and set score result after loading question data
            if (submissionData) {
                // Use submission score data to create a score result object
                const result = {
                    listeningCorrect: 0, // These will be calculated if needed
                    readingCorrect: 0,
                    listeningTotal: validatedQuestions.filter(q => q.part <= 4).length,
                    readingTotal: validatedQuestions.filter(q => q.part >= 5).length,
                    listeningScore: submissionData.listeningScore || 0,
                    readingScore: submissionData.readingScore || 0,
                    totalScore: submissionData.totalscore || 0,
                    partDetails: {
                        part1: { correct: 0, total: validatedQuestions.filter(q => q.part === 1).length },
                        part2: { correct: 0, total: validatedQuestions.filter(q => q.part === 2).length },
                        part3: { correct: 0, total: validatedQuestions.filter(q => q.part === 3).length },
                        part4: { correct: 0, total: validatedQuestions.filter(q => q.part === 4).length },
                        part5: { correct: 0, total: validatedQuestions.filter(q => q.part === 5).length },
                        part6: { correct: 0, total: validatedQuestions.filter(q => q.part === 6).length },
                        part7: { correct: 0, total: validatedQuestions.filter(q => q.part === 7).length },
                    },
                    testId: submissionData.TestId
                };
                
                setScoreResult(result);
                
                // Get correct answers for all questions
                const correctAnswersMap = {};
                validatedQuestions.forEach(question => {
                    const originalQuestion = testData.allQuestions.find(q => q.id === question.id);
                    if (originalQuestion) {
                        correctAnswersMap[question.id] = originalQuestion.correctAnswer;
                    }
                });
                
                setCorrectAnswers(correctAnswersMap);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [testData, state, submissionData]);

    // Xử lý timer - optimize for performance
    // No need for timer implementation in review mode
    
    // Update current part without guidance handling
    useEffect(() => {
        const question = filteredQuestions[currentQuestion - 1];
        if (!question) {
            setCurrentGroup([]);
            return;
        }
        
        // Get the part from the current question
        const questionPart = question.part;
        
        // Update the part
        setCurrentPart(questionPart);
        
        // Organize questions into appropriate groups for efficient rendering
        if (questionPart === 1 || questionPart === 2 || questionPart === 5) {
            // Single questions - just need the current one
            setCurrentGroup([question]);
        } else if ([3, 4, 6, 7].includes(questionPart)) {
            // For grouped questions, find all with same resourceId and part 
            // Use more efficient filtering
            const resourceId = question.resourceId;
            const newGroup = filteredQuestions.filter(q => 
                q.resourceId === resourceId && q.part === questionPart
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
        
        // Xóa tất cả audio players cũ khi chuyển câu hỏi - optimize to only clean when needed
        if (audioElement || isAudioPlaying) {
            cleanupAllAudioPlayers();
        }

        // Xử lý audio cho các phần nghe (1, 2, 3, 4) - add loading optimization
        if ([1, 2, 3, 4].includes(question.part)) {
            const audioUrl = question.audioUrl || currentGroup[0]?.audioUrl;
            if (!audioUrl) return;

            // Đặt timeout nhỏ để không gây ra quá nhiều yêu cầu đồng thời
            // Add progressive loading - first clean up, then after a delay, load audio
            const timer = setTimeout(() => {
                if (isSubmitted) {
                    // Chế độ xem chi tiết: hiển thị audio player với controls - lazily create
                    // Only create audio player if not already viewing details
                    requestAnimationFrame(() => {
                        createAudioPlayer(audioUrl);
                    });
                } else {
                    // Chế độ làm bài: tự động phát audio - optimize to only set up once
                    const interacted = localStorage.getItem('userInteracted');
                    if (interacted === "true") {
                        const onAudioComplete = () => {
                            if ([1, 2, 3, 4].includes(question.part) && !isSubmitted) {
                                navigateQuestions('next');
                            }
                        };
                        
                        // Delay audio loading slightly to improve perceived performance
                        requestAnimationFrame(() => {
                            playAudio(audioUrl, onAudioComplete);
                        });
                    }
                }
            }, 300); // Slightly longer delay to improve UI responsiveness

            // Cleanup function to clear the timeout
            return () => {
                clearTimeout(timer);
                stopAudio();
            };
        }
    }, [currentQuestion, filteredQuestions, currentGroup, isSubmitted]);

    // Hàm xóa tất cả audio players khi chuyển part - improved efficiency
    const cleanupAllAudioPlayers = () => {
        try {
            // More efficient way to clean audio containers
            const containers = document.querySelectorAll('.audio-container');
            if (containers.length > 0) {
                // Only clear if containers exist
                containers.forEach(container => {
                    container.innerHTML = '';
                });
            }
            
            // Stop any playing audio elements more efficiently
            document.querySelectorAll('audio').forEach(audio => {
                if (!audio.paused) {
                    audio.pause();
                }
                if (audio.src) {
                    audio.removeAttribute('src');
                }
            });
        } catch (error) {
            console.error('Lỗi khi xóa audio players:', error);
        }
    };

    // Dừng audio khi component unmount hoặc khi nộp bài/thoát trang
    useEffect(() => {
        // Cleanup when component unmounts
        return () => {
            // Clean up all audio resources
            stopAudio();
            
            // Use a more efficient way to clean up audio elements
            try {
                document.querySelectorAll('audio').forEach(audio => {
                    audio.pause();
                    audio.removeAttribute('src');
                    audio.load();
                });
            } catch (error) {
                console.error('Error cleaning up audio:', error);
            }
            
            // Clear any timers/intervals
            hasHandledTimeUp.current = false;
        };
    }, []);

    // Dừng audio khi submit hoặc khi chuyển part - optimize
    useEffect(() => {
        if (isSubmitted) {
            stopAudio();
            // More efficient cleanup
            document.querySelectorAll('audio').forEach(audio => {
                audio.pause();
                audio.removeAttribute('src');
            });
        }
    }, [isSubmitted, currentPart]);

    // Hàm tạo audio player với controls - optimize
    const createAudioPlayer = (url) => {
        if (!url) {
            console.error('Không có URL audio');
            return;
        }
        
        try {
            // Xóa tất cả audio players cũ trước khi tạo mới - optimized for speed
            const audioContainers = document.querySelectorAll('.audio-container');
            if (audioContainers.length === 0) return;
            
            // Just clear the first container we find instead of trying to find the right one
            const container = audioContainers[0];
            container.innerHTML = '';
            
            // Tạo audio element
            const audioElem = document.createElement('audio');
            audioElem.src = url;
            audioElem.controls = true;
            audioElem.autoplay = false;
            audioElem.preload = 'metadata'; // Optimized - only load metadata not entire file
            audioElem.className = 'audio-player';
            audioElem.style.width = '100%';
            
            // Thêm event listeners
            audioElem.addEventListener('error', (e) => {
                console.error('Lỗi audio:', e);
            });
            
            // Thêm vào container
            container.appendChild(audioElem);
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
        if (index >= 0) {
            setCurrentQuestion(index + 1);
        }
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
            TestId: parseInt(submissionData?.TestId),
            score: scoreResult?.totalScore || 0,
            completionTime: state?.timeLimit ? state.timeLimit - timeLeft : 7200 - timeLeft,
            tittle: testData?.title || "Bài thi TOEIC",
            userAnswer: userAnswerArray
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

            // Chuẩn bị dữ liệu nộp bài
            const submissionData = prepareAnswersToSubmit();
            console.log('Dữ liệu nộp bài thủ công:', submissionData);
            
            // Lưu dữ liệu submission để sử dụng trong popup
            setSubmissionDataForResult(submissionData);

            // Hiển thị popup kết quả ngắn gọn
            setShowResultPopup(true);
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
        
        // Chuyển hướng về trang test-history
        navigate('/test-history');
    };

    const handleSaveResult = async (response) => {
        try {
            // Chỉ ghi log kết quả lưu (đã được xử lý từ TestResultPopup)
            console.log('Kết quả lưu từ popup:', response);
            // Không cần làm gì thêm ở đây, vì việc lưu bài làm đã được thực hiện từ TestResultPopup
        } catch (error) {
            console.error('Lỗi xử lý sau khi lưu kết quả:', error);
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
        const currentQuestionPart = currentQ.part;

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
                const nextQuestionIndex = Math.min(filteredQuestions.length, currentQuestion + 1) - 1;
                setCurrentQuestion(nextQuestionIndex + 1);
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
                const prevQuestionIndex = Math.max(1, currentQuestion - 1) - 1;
                setCurrentQuestion(prevQuestionIndex + 1);
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
                    {question.imageUrl ? (
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
                    ) : (
                        <div className="image-placeholder">Không có hình ảnh</div>
                    )}
                </div>

                <div className="audio-resource">
                    {isSubmitted ? (
                        <div className="audio-container" id={`audio-container-${question.id}`}>
                            {/* Audio player with controls will be inserted here in review mode */}
                        </div>
                    ) : (
                        isAudioPlaying ? (
                            <div className="audio-status playing">
                                {question.part === 3 ? 'Đang phát hội thoại...' : 'Đang phát bài nói...'}
                            </div>
                        ) : (
                            <div className="audio-status">
                                {question.part === 3 ? 'Chuẩn bị phát hội thoại...' : 'Chuẩn bị phát bài nói...'}
                            </div>
                        )
                    )}
                </div>

                <div className="answer-section">
                    <div className="question-header">
                        <span className="question-number-dotest">Câu {question.questionNumber}</span>
                    </div>

                    <div className="answer-grid">
                        {question.answers && question.answers.map(answer => {
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
                        <div className="audio-container" id={`audio-container-${question.id}`}>
                            {/* Audio player with controls will be inserted here in review mode */}
                        </div>
                    ) : (
                        isAudioPlaying ? (
                            <div className="audio-status playing">
                                {question.part === 3 ? 'Đang phát hội thoại...' : 'Đang phát bài nói...'}
                            </div>
                        ) : (
                            <div className="audio-status">
                                {question.part === 3 ? 'Chuẩn bị phát hội thoại...' : 'Chuẩn bị phát bài nói...'}
                            </div>
                        )
                    )}
                </div>

                <div className="answer-section">
                    <div className="question-header-dotest">
                        <span className="question-number-dotest">Câu {question.questionNumber}: </span>
                    </div>

                    <div className="answer-grid">
                        {question.answers && question.answers.map(answer => {
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
        
        // Lấy resource explanation từ testData
        const resourceExplanation = isSubmitted && testData?.allQuestions?.find(q => q.id === currentGroup[0].id)?.resource?.explain_resource;

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
                        {hasImage && currentGroup[0].imageUrl && (
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
                        
                        {/* Hiển thị giải thích tài liệu nếu có */}
                        {isSubmitted && resourceExplanation && (
                            <div className="resource-explanation-box">
                                <div className="explanation-title">Giải thích tài liệu:</div>
                                <div className="explanation-content" dangerouslySetInnerHTML={{ __html: resourceExplanation }} />
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
                                        <span className="sentence">{q.questionText || ''}</span>
                                    </div>

                                    <div className="answer-options">
                                        {q.answers && q.answers.map(answer => {
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
                        <span className="sentence">{question.sentence || question.questionText || ''}</span>
                    </div>

                    <div className="answer-grid">
                        {question.answers && question.answers.map(answer => {
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
        
        // Lấy resource explanation từ testData
        const resourceExplanation = isSubmitted && testData?.allQuestions?.find(q => q.id === currentGroup[0].id)?.resource?.explain_resource;

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
                        
                        {/* Hiển thị giải thích tài liệu nếu có */}
                        {isSubmitted && resourceExplanation && (
                            <div className="resource-explanation-box">
                                <div className="explanation-title">Giải thích tài liệu:</div>
                                <div className="explanation-content" dangerouslySetInnerHTML={{ __html: resourceExplanation }} />
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
                                        {q.answers && q.answers.map(answer => {
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
        
        // Lấy resource explanation từ testData
        const resourceExplanation = isSubmitted && testData?.allQuestions?.find(q => q.id === currentGroup[0].id)?.resource?.explain_resource;

        return (
            <div className={`part7-container ${isSubmitted ? 'submitted' : ''}`}>
                <div className="part7-two-columns">
                    <div className="resource-panel scrollable-image">
                        {/* Display image if available */}
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
                        
                        {/* Hiển thị giải thích tài liệu nếu có */}
                        {isSubmitted && resourceExplanation && (
                            <div className="resource-explanation-box">
                                <div className="explanation-title">Giải thích tài liệu:</div>
                                <div className="explanation-content" dangerouslySetInnerHTML={{ __html: resourceExplanation }} />
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
                                        {/* Add check for answers array */}
                                        {q.answers && q.answers.map(answer => {
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

    // Render các câu hỏi dựa trên phần hiện tại - optimize rendering
    const renderQuestionsByPart = () => {
        if (currentGroup.length === 0) return null;

        const part = currentGroup[0].part;
        
        // Use memoization to avoid unnecessary re-renders
        // Only render what's needed based on part type
        if (loading) {
            return <div className="loading-placeholder">Đang tải nội dung...</div>;
        }
        
        // Use specific rendering functions for each part to optimize performance
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
                        {submissionData ? `Chi tiết bài làm: ${submissionData.tittle}` : 'Chi tiết bài làm'}
                    </span>
                    <div className="header-controls">
                        <button
                            className="exit-button"
                            onClick={handleExitClick}
                        >
                            Quay lại
                        </button>
                        <div className="timer-dotest">
                            {submissionData ? `Thời gian làm bài: ${TestHistoryService.formatCompletionTime(submissionData.completionTime)}` : ''}
                        </div>
                        <button
                            className="panel-toggle"
                            onClick={() => setShowPanel(!showPanel)}
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
                            {scoreResult && (
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

            {/* Only render popups when needed to improve performance */}
            {showConfirmPopup && (
                <ConfirmSubmitPopup
                    isOpen={showConfirmPopup}
                    onClose={() => setShowConfirmPopup(false)}
                    onConfirm={confirmSubmitTest}
                    answeredCount={Object.keys(answers).length}
                    totalQuestions={filteredQuestions.length}
                />
            )}

            {/* Only render when needed */}
            {showResultPopup && (
                <TestResultPopup
                    isOpen={showResultPopup}
                    onClose={() => setShowResultPopup(false)}
                    result={scoreResult}
                    testTitle={submissionData?.tittle || "Bài thi TOEIC"}
                    onSaveResult={handleSaveResult}
                    submissionData={submissionDataForResult}
                />
            )}
        </div>
    );
};

export default TestHistoryDetail;