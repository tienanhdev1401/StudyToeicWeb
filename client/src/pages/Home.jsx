import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VocabularyTopicService from '../services/vocabularyTopicService';
import GrammarTopicService from '../services/grammarTopicService';
import TestService from '../services/TestService';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getLearningGoalByLearnerId } from '../services/learningGoalService';
import learningProcessService from '../services/learningProcessService';

const Home = () => {
    const [recentTopics, setRecentTopics] = useState([]);
    const [grammarTopics, setGrammarTopics] = useState([]);
    const [practiceTests, setPracticeTests] = useState([]);
    const [latestLearningProcess, setLatestLearningProcess] = useState(null);
    const [userProgress, setUserProgress] = useState({
        vocabLearned: 0,
        vocabTotal: 0,
        grammarCompleted: 0,
        grammarTotal: 0,
        testsCompleted: 0
    });
    const [learningGoal, setLearningGoal] = useState(null);
    const [goalProgress, setGoalProgress] = useState(0);
    const [daysRemaining, setDaysRemaining] = useState(0);
    
    const { isLoggedIn, user } = useAuth();
    const { user: userDetails } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const allTopics = await VocabularyTopicService.getAllVocabularyTopics();
                // Lấy 4 chủ đề cuối cùng
                setRecentTopics(allTopics.slice(-4));
            } catch (error) {
                setRecentTopics([]);
            }
        };
        fetchTopics();

        // Lấy 4 chủ đề grammar cuối cùng
        const fetchGrammarTopics = async () => {
            try {
                const allGrammarTopics = await GrammarTopicService.getAllGrammarTopics();
                setGrammarTopics(allGrammarTopics.slice(-4));
            } catch (error) {
                setGrammarTopics([]);
            }
        };
        fetchGrammarTopics();
        
        // Lấy 4 bài test mới nhất
        const fetchPracticeTests = async () => {
            try {
                const allTests = await TestService.getAllTests();
                if (allTests && allTests.length > 0) {
                    // Lấy tất cả các bài test từ tất cả các collections
                    let allTestItems = [];
                    allTests.forEach(collection => {
                        if (collection.tests && collection.tests.length > 0) {
                            // Thêm tên collection vào mỗi test
                            const testsWithCollection = collection.tests.map(test => ({
                                ...test,
                                collectionName: collection.title
                            }));
                            allTestItems = [...allTestItems, ...testsWithCollection];
                        }
                    });
                    
                    // Sắp xếp theo số lượt hoàn thành (giả định completions là số lượt hoàn thành)
                    allTestItems.sort((a, b) => {
                        const completionsA = parseInt(a.completions?.replace(/\./g, '')) || 0;
                        const completionsB = parseInt(b.completions?.replace(/\./g, '')) || 0;
                        return completionsB - completionsA; // Sắp xếp giảm dần
                    });
                    
                    // Lấy 4 bài test có nhiều lượt hoàn thành nhất
                    const topTests = allTestItems.slice(0, 4);
                    
                    // Map dữ liệu bài test để phù hợp với cấu trúc hiện tại
                    const formattedTests = topTests.map(test => ({
                        id: test.id,
                        title: test.name,
                        description: `Bài kiểm tra TOEIC ${test.collectionName}`,
                        time: `120 phút`,
                        completions: test.completions
                    }));
                    
                    setPracticeTests(formattedTests);
                } 
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu bài kiểm tra:', error);
            }
        };
        fetchPracticeTests();
        
        // Fetch user learning goal if logged in
        const fetchLearningGoal = async () => {
            if (userDetails && userDetails.id) {
                try {
                    const response = await getLearningGoalByLearnerId(userDetails.id);
                    if (response.success && response.data) {
                        setLearningGoal(response.data);
                        
                        // Calculate progress
                        const createdDate = new Date(response.data.createdAt || new Date());
                        const targetDuration = response.data.duration; // in days
                        const currentDate = new Date();
                        
                        // Calculate days elapsed
                        const daysElapsed = Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24));
                        
                        // Calculate progress percentage
                        const progressPercentage = Math.min(100, Math.round((daysElapsed / targetDuration) * 100));
                        setGoalProgress(progressPercentage);
                        
                        // Calculate days remaining
                        const remaining = Math.max(0, targetDuration - daysElapsed);
                        setDaysRemaining(remaining);
                    }
                } catch (error) {
                    console.error('Error fetching learning goal:', error);
                }
            }
        };
        fetchLearningGoal();

        const fetchLatestLearningProcess = async () => {
            if (userDetails && userDetails.id) {
                try {
                    const processes = await learningProcessService.getAllLearningProcessByUserId(userDetails.id);
                    // Lọc ra các process đang in_progress và sắp xếp theo thời gian tạo mới nhất
                    const inProgressProcesses = processes
                        .filter(process => process.progressStatus === 'in_progress')
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    
                    if (inProgressProcesses.length > 0) {
                        setLatestLearningProcess(inProgressProcesses[0]);
                    }
                } catch (error) {
                    console.error('Error fetching latest learning process:', error);
                }
            }
        };
        fetchLatestLearningProcess();

        // Fetch user learning statistics
        const fetchLearningStats = async () => {
            if (userDetails && userDetails.id) {
                try {
                    console.log('userDetails',userDetails)
                    const stats = await learningProcessService.getLearningStatistics(userDetails.id);
                    console.log('stats',stats)
                    if (stats) {
                        setUserProgress({
                            vocabLearned: stats.completedVocabulary || 0,
                            grammarCompleted: stats.completedGrammarTopics || 0,
                            testsCompleted: stats.completedTests || 0
                        });
                    }
                } catch (error) {
                    console.error('Error fetching learning statistics:', error);
                }
            }
        };
        fetchLearningStats();
    }, [userDetails]);

    return (
        <div>
            <Header />

            <main>
                {/* Hero Section - TOEIC Focus */}
                <section className="slider-area">
                    <div className="slider-active">
                        <div className="single-slider slider-height d-flex align-items-center"
                            style={{
                                background: 'linear-gradient(90deg, rgba(41,19,107,1) 0%, rgba(69,39,160,1) 100%)',
                                color: 'white'
                            }}>
                            <div className="container">
                                <div className="row align-items-center">
                                    <div className="col-xl-6 col-lg-7 col-md-12">
                                        <div className="hero__caption">
                                            <span style={{
                                                background: 'rgba(255,255,255,0.15)',
                                                padding: '5px 15px',
                                                borderRadius: '20px',
                                                fontSize: '0.9rem',
                                                marginBottom: '20px',
                                                display: 'inline-block'
                                            }}>
                                                #1 TOEIC Preparation Platform
                                            </span>
                                            <h1 data-animation="fadeInLeft" data-delay="0.2s">
                                                Get Your <span style={{ color: '#FFC107' }}>TOEIC 900+</span><br />With Our Proven Method
                                            </h1>
                                            <p data-animation="fadeInLeft" data-delay="0.4s">
                                                Nâng cao kỹ năng tiếng Anh và đạt điểm TOEIC mục tiêu với các khóa học, bài tập và đề thi thử được thiết kế chuyên biệt
                                            </p>
                                            <div className="d-flex gap-3">
                                                <a href="#" className="btn"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (isLoggedIn) {
                                                            navigate('/toeic-exercise');
                                                        } else {
                                                            navigate('/login');
                                                        }
                                                    }}
                                                    style={{
                                                        background: '#FFC107',
                                                        color: '#333',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Bắt đầu ngay
                                                </a>
                                                <a href="#toeic-overview" className="btn hero-btn" style={{ background: 'rgba(255,255,255,0.15)' }}>
                                                    Tìm hiểu TOEIC
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-5 d-none d-lg-block">
                                        <img src="assets/img/hero/h1_hero.png" alt="TOEIC Preparation"
                                            style={{
                                                maxWidth: '100%',
                                                filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.15))'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* User Dashboard - For logged in users */}
                {isLoggedIn && (
                    <section className="user-dashboard py-5" style={{ backgroundColor: "#f8f9fa" }}>
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-xl-10">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body p-4">
                                            <div className="row align-items-center">
                                                <div className="col-md-8">
                                                    <h3 className="mb-1">Xin chào, {user?.name || "học viên"}!</h3>
                                                    <p className="text-muted mb-4">Tiếp tục hành trình nâng cao điểm TOEIC của bạn</p>
                                                    
                                                    <div className="row g-3">
                                                        <div className="col-md-4">
                                                            <div className="d-flex align-items-center p-3 bg-light rounded">
                                                                <div style={{ width: 50, height: 50 }}>
                                                                    <CircularProgressbar
                                                                        value={(userProgress.vocabLearned / 600) * 100}
                                                                        text={`${userProgress.vocabLearned}`}
                                                                        styles={buildStyles({
                                                                            textSize: '28px',
                                                                            pathColor: '#2196F3',
                                                                            textColor: '#2196F3',
                                                                        })}
                                                                    />
                                                                </div>
                                                                <div className="ms-3">
                                                                    <p className="mb-0 small">Từ vựng đã học</p>
                                                                    <p className="mb-0 small text-muted">{userProgress.vocabLearned}/600 từ</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="d-flex align-items-center p-3 bg-light rounded">
                                                                <div style={{ width: 50, height: 50 }}>
                                                                    <CircularProgressbar
                                                                        value={(userProgress.grammarCompleted / 20) * 100}
                                                                        text={`${userProgress.grammarCompleted}`}
                                                                        styles={buildStyles({
                                                                            textSize: '28px',
                                                                            pathColor: '#4CAF50',
                                                                            textColor: '#4CAF50',
                                                                        })}
                                                                    />
                                                                </div>
                                                                <div className="ms-3">
                                                                    <p className="mb-0 small">Ngữ pháp đã học</p>
                                                                    <p className="mb-0 small text-muted">{userProgress.grammarCompleted}/20 chủ đề</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="d-flex align-items-center p-3 bg-light rounded">
                                                                <div style={{ width: 50, height: 50 }}>
                                                                    <CircularProgressbar
                                                                        value={(userProgress.testsCompleted / 30) * 100}
                                                                        text={`${userProgress.testsCompleted}`}
                                                                        styles={buildStyles({
                                                                            textSize: '28px',
                                                                            pathColor: '#FF9800',
                                                                            textColor: '#FF9800',
                                                                        })}
                                                                    />
                                                                </div>
                                                                <div className="ms-3">
                                                                    <p className="mb-0 small">Bài test đã làm</p>
                                                                    <p className="mb-0 small text-muted">{userProgress.testsCompleted}/30 bài</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-4">
                                                        <a href="#" 
                                                           onClick={e => { 
                                                               e.preventDefault(); 
                                                               if (latestLearningProcess) {
                                                                   if (latestLearningProcess.VocabularyTopicId) {
                                                                       navigate(`/learn-vocabulary/${latestLearningProcess.VocabularyTopicId}`);
                                                                   } else if (latestLearningProcess.GrammarTopicId) {
                                                                       navigate(`/learn-grammary/${latestLearningProcess.GrammarTopicId}`);
                                                                   } else if (latestLearningProcess.TestId) {
                                                                       navigate(`/Stm_Quizzes/${latestLearningProcess.TestId}`);
                                                                   }
                                                               } else {
                                                                   navigate('/resume-learning');
                                                               }
                                                           }} 
                                                           className="btn btn-primary me-2">
                                                            <i className="fas fa-play-circle me-2"></i>Tiếp tục học
                                                        </a>
                                                        <a href="#" onClick={e => { e.preventDefault(); navigate('/test-online-new'); }} 
                                                           className="btn btn-outline-primary">
                                                            <i className="fas fa-tasks me-2"></i>Làm bài thi thử
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mt-4 mt-md-0">
                                                    <div className="card h-100 border-0 bg-primary bg-gradient text-white">
                                                        <div className="card-body text-center p-4">
                                                            {learningGoal ? (
                                                                <>
                                                                    <h2 className="mb-3" style={{ color: '#FF9800', fontWeight: 'bold' }}>Lộ trình học tập</h2>
                                                                    <div className="d-flex justify-content-center mb-3">
                                                                        <div style={{ width: 120, height: 120 }}>
                                                                            <CircularProgressbar
                                                                                value={goalProgress}
                                                                                text={`${goalProgress}%`}
                                                                                styles={buildStyles({
                                                                                    textSize: '16px',
                                                                                    pathColor: '#ffffff',
                                                                                    textColor: '#ffffff',
                                                                                    trailColor: 'rgba(241, 236, 236, 0.3)',
                                                                                })}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <div className="d-flex justify-content-between">
                                                                            <span>Điểm mục tiêu:</span>
                                                                            <strong>{learningGoal.scoreTarget}</strong>
                                                                        </div>
                                                                        <div className="d-flex justify-content-between">
                                                                            <span>Thời gian đặt ra:</span>
                                                                            <strong>{learningGoal.duration} ngày</strong>
                                                                        </div>
                                                                        <div className="d-flex justify-content-between">
                                                                            <span>Ngày bắt đầu:</span>
                                                                            <strong>{new Date(learningGoal.createdAt).toLocaleDateString()}</strong>
                                                                        </div>
                                                                        <div className="d-flex justify-content-between">
                                                                            <span>Còn lại:</span>
                                                                            <strong>{daysRemaining} ngày</strong>
                                                                        </div>
                                                                    </div>
                                                                    <a href="#" 
                                                                       onClick={e => { e.preventDefault(); navigate('/profile'); }} 
                                                                       className="btn btn-sm btn-light mt-2">
                                                                        Cập nhật mục tiêu
                                                                    </a>
                                                                    <a href="#" 
                                                                       onClick={e => { e.preventDefault(); navigate('/roadmap'); }} 
                                                                       className="btn btn-sm btn-light mt-2 ms-2">
                                                                        <i className="fas fa-road me-1"></i> Xem lộ trình
                                                                    </a>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="mb-3">
                                                                        <i className="fas fa-bullseye fa-3x"></i>
                                                                    </div>
                                                                    <h2 className="mb-3" style={{ color: '#FF9800', fontWeight: 'bold' }}>Chưa có mục tiêu</h2>
                                                                    <p className="mb-3">Hãy đặt mục tiêu học tập để theo dõi tiến độ và đạt kết quả tốt hơn</p>
                                                                    
                                                                    <a href="#" 
                                                                       onClick={e => { e.preventDefault(); navigate('/profile'); }} 
                                                                       className="btn btn-light btn-lg fw-bold mt-2" 
                                                                       style={{ borderRadius: '30px', padding: '10px 25px' }}>
                                                                        <i className="fas fa-flag-checkered me-2"></i>
                                                                        Tạo mục tiêu ngay
                                                                    </a>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* TOEIC Overview */}
                <section className="about-area1 fix pt-60 pb-60" id="toeic-overview" style={{ background: '#f7f9fc' }}>
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-7 col-lg-8">
                                <div className="section-tittle text-center mb-55">
                                    <h2>Giới thiệu về bài thi TOEIC</h2>
                                    <p>Cấu trúc, thời gian và thang điểm bài thi TOEIC</p>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-6 mb-4">
                                <div className="card h-100" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <span style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                background: 'rgba(69,39,160,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '15px'
                                            }}>
                                                <i className="fas fa-headphones" style={{ color: '#4527A0', fontSize: '1.5rem' }}></i>
                                            </span>
                                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Listening Section</h3>
                                        </div>
                                        <p>100 câu hỏi - 45 phút</p>
                                        <ul style={{ paddingLeft: '20px' }}>
                                            <li className="mb-2">Part 1: Mô tả hình ảnh (6 câu)</li>
                                            <li className="mb-2">Part 2: Hỏi - Đáp (25 câu)</li>
                                            <li className="mb-2">Part 3: Đoạn hội thoại (39 câu)</li>
                                            <li className="mb-2">Part 4: Bài nói ngắn (30 câu)</li>
                                        </ul>
                                        <div className="mt-3">
                                            <a href="#" className="text-primary" style={{ fontWeight: '500', textDecoration: 'none' }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (isLoggedIn) {
                                                        navigate('/toeic-exercise?section=listening');
                                                    } else {
                                                        navigate('/login');
                                                    }
                                                }}
                                            >
                                                Luyện tập Listening <i className="fas fa-arrow-right ml-1"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 mb-4">
                                <div className="card h-100" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <span style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                background: 'rgba(69,39,160,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '15px'
                                            }}>
                                                <i className="fas fa-book-open" style={{ color: '#4527A0', fontSize: '1.5rem' }}></i>
                                            </span>
                                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Reading Section</h3>
                                        </div>
                                        <p>100 câu hỏi - 75 phút</p>
                                        <ul style={{ paddingLeft: '20px' }}>
                                            <li className="mb-2">Part 5: Câu không hoàn chỉnh (30 câu)</li>
                                            <li className="mb-2">Part 6: Đoạn văn không hoàn chỉnh (16 câu)</li>
                                            <li className="mb-2">Part 7: Đọc hiểu (54 câu)</li>
                                        </ul>
                                        <div className="mt-3">
                                            <a href="#" className="text-primary" style={{ fontWeight: '500', textDecoration: 'none' }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (isLoggedIn) {
                                                        navigate('/toeic-exercise?section=reading');
                                                    } else {
                                                        navigate('/login');
                                                    }
                                                }}
                                            >
                                                Luyện tập Reading <i className="fas fa-arrow-right ml-1"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 text-center mt-3">
                                <div className="score-scale p-4 mt-2" style={{ borderRadius: '15px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                                    <h4 style={{ fontWeight: '600', fontSize: '1.2rem', marginBottom: '15px' }}>Thang điểm TOEIC</h4>
                                    <div className="d-flex justify-content-between flex-wrap">
                                        <div className="score-level px-3 py-2 mb-2" style={{ borderRadius: '10px', background: '#FFF3E0', minWidth: '150px' }}>
                                            <p className="mb-0"><strong>10 - 250</strong>: Beginner</p>
                                        </div>
                                        <div className="score-level px-3 py-2 mb-2" style={{ borderRadius: '10px', background: '#E1F5FE', minWidth: '150px' }}>
                                            <p className="mb-0"><strong>255 - 400</strong>: Elementary</p>
                                        </div>
                                        <div className="score-level px-3 py-2 mb-2" style={{ borderRadius: '10px', background: '#E8F5E9', minWidth: '150px' }}>
                                            <p className="mb-0"><strong>405 - 600</strong>: Intermediate</p>
                                        </div>
                                        <div className="score-level px-3 py-2 mb-2" style={{ borderRadius: '10px', background: '#EDE7F6', minWidth: '150px' }}>
                                            <p className="mb-0"><strong>605 - 780</strong>: Advanced</p>
                                        </div>
                                        <div className="score-level px-3 py-2 mb-2" style={{ borderRadius: '10px', background: '#FFEBEE', minWidth: '150px' }}>
                                            <p className="mb-0"><strong>785 - 990</strong>: Proficient</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Learning Paths Section */}
                <section className="courses-area section-padding40">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-7 col-lg-8">
                                <div className="section-tittle text-center mb-55">
                                    <h2>Lộ trình học TOEIC</h2>
                                    <p>Chọn lộ trình phù hợp với mục tiêu điểm số của bạn</p>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {[
                                {
                                    id: 1,
                                    title: "Lộ trình 500 điểm",
                                    color: "#E1F5FE",
                                    textColor: "#0288D1",
                                    icon: "fas fa-user-graduate",
                                    description: "Dành cho người mới bắt đầu, tập trung vào ngữ pháp cơ bản và từ vựng thiết yếu",
                                    level: "Sơ cấp - Trung cấp",
                                    duration: "3 tháng",
                                    pageLink: "/learning-path/500"
                                },
                                {
                                    id: 2,
                                    title: "Lộ trình 650 điểm",
                                    color: "#E8F5E9",
                                    textColor: "#388E3C",
                                    icon: "fas fa-chart-line",
                                    description: "Củng cố ngữ pháp, mở rộng vốn từ vựng và phát triển kỹ năng nghe hiểu",
                                    level: "Trung cấp",
                                    duration: "4 tháng",
                                    pageLink: "/learning-path/650"
                                },
                                {
                                    id: 3,
                                    title: "Lộ trình 750 điểm",
                                    color: "#EDE7F6",
                                    textColor: "#5E35B1",
                                    icon: "fas fa-rocket",
                                    description: "Phát triển các kỹ năng nâng cao và chiến lược làm bài hiệu quả",
                                    level: "Trung cấp - Cao cấp",
                                    duration: "5 tháng",
                                    pageLink: "/learning-path/750"
                                },
                                {
                                    id: 4,
                                    title: "Lộ trình 900+ điểm",
                                    color: "#FFEBEE",
                                    textColor: "#D32F2F",
                                    icon: "fas fa-crown",
                                    description: "Hoàn thiện toàn bộ kỹ năng và ôn luyện chuyên sâu để đạt điểm tối đa",
                                    level: "Cao cấp",
                                    duration: "6 tháng",
                                    pageLink: "/learning-path/900"
                                }
                            ].map((path) => (
                                <div className="col-lg-3 col-md-6 mb-4" key={path.id}>
                                    <div className="card h-100" style={{
                                        borderRadius: '15px',
                                        border: 'none',
                                        boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                                        transition: 'transform 0.3s',
                                        cursor: 'pointer'
                                    }}
                                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)' }}
                                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (isLoggedIn) {
                                                navigate(path.pageLink);
                                            } else {
                                                navigate('/login');
                                            }
                                        }}>
                                        <div style={{
                                            height: '8px',
                                            background: path.textColor,
                                            borderTopLeftRadius: '15px',
                                            borderTopRightRadius: '15px'
                                        }}></div>
                                        <div className="card-body">
                                            <div className="d-flex align-items-center mb-3">
                                                <span style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    borderRadius: '50%',
                                                    background: path.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '15px'
                                                }}>
                                                    <i className={path.icon} style={{ color: path.textColor, fontSize: '1.5rem' }}></i>
                                                </span>
                                                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '600' }}>{path.title}</h3>
                                            </div>
                                            <p style={{ height: '80px' }}>{path.description}</p>
                                            <div className="mt-3">
                                                <span className="badge me-2" style={{ background: path.color, color: path.textColor }}>
                                                    {path.level}
                                                </span>
                                                <span className="badge" style={{ background: path.color, color: path.textColor }}>
                                                    {path.duration}
                                                </span>
                                            </div>
                                            <div className="mt-3 text-end">
                                                <a href="#" style={{ color: path.textColor, fontWeight: '500', textDecoration: 'none' }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (isLoggedIn) {
                                                            navigate(path.pageLink);
                                                        } else {
                                                            navigate('/login');
                                                        }
                                                    }}
                                                >
                                                    Xem lộ trình <i className="fas fa-arrow-right ml-1"></i>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Vocabulary Topics Section */}
                <div className="topic-area section-padding20" style={{ background: '#f7f9fc' }}>
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-7 col-lg-8">
                                <div className="section-tittle text-center mb-55">
                                    <h2>Từ vựng TOEIC theo chủ đề</h2>
                                    <p>Những chủ đề từ vựng thường xuất hiện trong bài thi TOEIC</p>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {recentTopics.length > 0 ? recentTopics.map((topic) => (
                                <div className="col-lg-3 col-md-6 col-sm-6" key={topic.id}>
                                    <div className="single-topic mb-30" style={{
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease',
                                        transform: 'translateY(0)',
                                        cursor: 'pointer',
                                        background: 'white'
                                    }}
                                        onClick={e => { e.preventDefault(); if (isLoggedIn) { navigate(`/learn-vocabulary/${topic.id}`); } else { navigate('/login'); } }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div className="topic-img position-relative">
                                            <div style={{
                                                position: 'absolute',
                                                top: '15px',
                                                right: '15px',
                                                background: 'rgba(255,193,7,0.9)',
                                                color: '#333',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '500',
                                                zIndex: 2
                                            }}>
                                                TOEIC Vocabulary
                                            </div>
                                            <img
                                                src={topic.imageUrl}
                                                alt={topic.topicName}
                                                style={{
                                                    width: '100%',
                                                    height: '200px',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            <div className="topic-content-box" style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                                                padding: '20px 15px',
                                                textAlign: 'left'
                                            }}>
                                                <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '600', marginBottom: '5px' }}>
                                                    {topic.topicName}
                                                </h3>
                                                <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                                                    <span className="badge" style={{
                                                        background: 'rgba(255,255,255,0.2)',
                                                        color: 'white',
                                                        borderRadius: '20px',
                                                        padding: '4px 10px',
                                                        fontSize: '0.8rem',
                                                        marginRight: '10px'
                                                    }}>
                                                        Part {Math.floor(Math.random() * 7) + 1}
                                                    </span>
                                                    <span style={{ fontSize: '0.85rem' }}>
                                                        <i className="fas fa-book-open" style={{ marginRight: '5px' }}></i>
                                                        {Math.floor(Math.random() * 20) + 10} từ mới
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '15px' }}>
                                            <div className="progress-info mb-2" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#666' }}>Tiến độ học</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{Math.floor(Math.random() * 70) + 30}%</span>
                                            </div>
                                            <div className="progress" style={{ height: '8px', borderRadius: '4px', background: '#f0f0f0' }}>
                                                <div
                                                    className="progress-bar"
                                                    role="progressbar"
                                                    style={{
                                                        width: `${Math.floor(Math.random() * 70) + 30}%`,
                                                        background: 'linear-gradient(90deg, rgb(192, 84, 255) 0%, rgb(82, 116, 255) 100%)',
                                                        borderRadius: '4px'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-12 text-center">Đang tải chủ đề...</div>
                            )}
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-xl-12">
                                <div className="section-tittle text-center mt-20">
                                    <a href="#" onClick={e => { e.preventDefault(); if (isLoggedIn) { navigate('/learn-vocabulary'); } else { navigate('/login'); } }} className="border-btn">
                                        Xem tất cả chủ đề từ vựng
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grammar topics Area Start */}
                <div className="grammar-area section-padding40">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-7 col-lg-8">
                                <div className="section-tittle text-center mb-55">
                                    <h2>Ngữ pháp TOEIC quan trọng</h2>
                                    <p>Những điểm ngữ pháp thường xuất hiện trong Part 5, 6 của bài thi TOEIC</p>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {grammarTopics.length > 0 && grammarTopics.map((topic) => (
                                <div className="col-lg-3 col-md-6 col-sm-6 mb-4" key={topic.id}>
                                    <div
                                        className="grammar-card"
                                        style={{
                                            background: 'white',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                                            transition: 'all 0.3s ease',
                                            height: '220px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            cursor: 'pointer',
                                            transform: 'translateY(0)',
                                            border: '1px solid rgba(0,0,0,0.05)'
                                        }}
                                        onClick={e => { e.preventDefault(); if (isLoggedIn) { navigate(`/learn-grammary/${topic.id}`); } else { navigate('/login'); } }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgb(192, 84, 255) 0%, rgb(82, 116, 255) 100%)',
                                            height: '8px'
                                        }}></div>
                                        <div style={{
                                            padding: '20px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            height: '100%'
                                        }}>
                                            <div>
                                                <div style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '10px',
                                                    background: 'linear-gradient(135deg, rgba(192, 84, 255, 0.1), rgba(82, 116, 255, 0.1))',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: '15px'
                                                }}>
                                                    <span style={{
                                                        fontSize: '1.8rem',
                                                        background: 'linear-gradient(135deg, rgb(192, 84, 255), rgb(82, 116, 255))',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        backgroundClip: 'text',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {topic.title && topic.title.charAt(0)}
                                                    </span>
                                                </div>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '5px' }}>
                                                    {topic.title}
                                                </h3>
                                                <div style={{ display: 'flex', marginBottom: '10px' }}>
                                                    <span className="badge me-2" style={{
                                                        background: 'rgba(192, 84, 255, 0.1)',
                                                        color: 'rgb(192, 84, 255)',
                                                        borderRadius: '20px',
                                                        padding: '4px 10px',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        Part 5
                                                    </span>
                                                    <span className="badge" style={{
                                                        background: 'rgba(82, 116, 255, 0.1)',
                                                        color: 'rgb(82, 116, 255)',
                                                        borderRadius: '20px',
                                                        padding: '4px 10px',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        Part 6
                                                    </span>
                                                </div>
                                                <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '0' }}>
                                                    {Math.floor(Math.random() * 8) + 3} bài học • {Math.floor(Math.random() * 15) + 5} bài tập
                                                </p>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginTop: '10px',
                                                color: 'rgb(82, 116, 255)',
                                                fontSize: '0.9rem',
                                                fontWeight: '500'
                                            }}>
                                                Học ngay
                                                <i className="fas fa-arrow-right" style={{ marginLeft: '8px', fontSize: '0.8rem' }}></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-xl-12">
                                <div className="section-tittle text-center mt-20">
                                    <a href="#" onClick={e => { e.preventDefault(); if (isLoggedIn) { navigate('/learn-grammary'); } else { navigate('/login'); } }} className="border-btn">
                                        Xem tất cả chủ đề ngữ pháp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Practice Tests Section */}
                <section className="about-area1 fix pt-60 pb-60" style={{ background: '#f7f9fc' }}>
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-7 col-lg-8">
                                <div className="section-tittle text-center mb-55">
                                    <h2>Bài thi thử TOEIC</h2>
                                    <p>Luyện tập với các đề thi chuẩn format TOEIC thực tế</p>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {practiceTests.map((test) => (
                                <div className="col-lg-3 col-md-6 mb-4" key={test.id}>
                                    <div className="test-card h-100" style={{
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                                        background: 'white',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                                navigate(`/Stm_Quizzes/${test.id}`);
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)' }}
                                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}>
                                        <div style={{ padding: '20px' }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '15px'
                                            }}>
                                                <h4 style={{
                                                    margin: 0,
                                                    fontSize: '1.75rem',
                                                    fontWeight: '600',
                                                    color: '#4527A0'
                                                }}>{test.title}</h4>
                                                <span style={{
                                                    background: 'rgba(69,39,160,0.1)',
                                                    color: '#4527A0',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '1.5rem',
                                                    fontWeight: '500'
                                                }}></span>
                                            </div>
                                            <p style={{ marginBottom: '15px', fontSize: '0.95rem', minHeight: '40px' }}>{test.description}</p>
                                            <div style={{ display: 'flex', marginBottom: '15px' }}>
                                                <div style={{ marginRight: '15px' }}>
                                                    <i className="far fa-clock" style={{ color: '#666', marginRight: '5px' }}></i>
                                                    <span style={{ fontSize: '1.2rem', color: '#666' }}>{test.time}</span>
                                                </div>
                                                {test.completions && (
                                                    <div style={{ marginLeft: 'auto' }}>
                                                        <i className="fas fa-users" style={{ color: '#666', marginRight: '5px' }}></i>
                                                        <span style={{ fontSize: '1.2rem', color: '#666' }}>{test.completions} lượt thi</span>
                                                    </div>
                                                )}
                                            </div>
                                            <a href="#"
                                                style={{
                                                    display: 'inline-block',
                                                    background: 'linear-gradient(90deg, rgb(192, 84, 255) 0%, rgb(82, 116, 255) 100%)',
                                                    color: 'white',
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    fontWeight: '500',
                                                    textDecoration: 'none',
                                                    fontSize: '1.5rem'
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                        navigate(`/Stm_Quizzes/${test.id}`);
                                                }}
                                            >
                                                Bắt đầu làm bài
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-xl-12">
                                <div className="section-tittle text-center mt-20">
                                    <a href="#" onClick={e => { e.preventDefault(); navigate('/test-online-new'); }} className="border-btn">
                                        Xem tất cả bài thi thử
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Study Progress and Dashboard */}
                <section className="about-area3 fix pt-30 pb-30">
                    <div className="container">
                        <div className="row">
                            {/* Study Progress */}
                            <div className="col-lg-6 mb-4">
                                <div className="card h-100" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
                                    <div className="card-body">
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                                            <i className="fas fa-chart-line" style={{ color: '#4527A0', marginRight: '10px' }}></i>
                                            Tiến độ học tập
                                        </h3>

                                        {/* Progress Bars */}
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h5 style={{ margin: 0, fontSize: '1rem' }}>TOEIC Listening</h5>
                                                <span style={{ fontWeight: '500' }}>65%</span>
                                            </div>
                                            <div className="progress" style={{ height: '10px', borderRadius: '5px' }}>
                                                <div className="progress-bar" style={{ width: '65%', background: '#4527A0', borderRadius: '5px' }}></div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h5 style={{ margin: 0, fontSize: '1rem' }}>TOEIC Reading</h5>
                                                <span style={{ fontWeight: '500' }}>42%</span>
                                            </div>
                                            <div className="progress" style={{ height: '10px', borderRadius: '5px' }}>
                                                <div className="progress-bar" style={{ width: '42%', background: '#4527A0', borderRadius: '5px' }}></div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h5 style={{ margin: 0, fontSize: '1rem' }}>Vocabulary</h5>
                                                <span style={{ fontWeight: '500' }}>78%</span>
                                            </div>
                                            <div className="progress" style={{ height: '10px', borderRadius: '5px' }}>
                                                <div className="progress-bar" style={{ width: '78%', background: '#4527A0', borderRadius: '5px' }}></div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h5 style={{ margin: 0, fontSize: '1rem' }}>Grammar</h5>
                                                <span style={{ fontWeight: '500' }}>53%</span>
                                            </div>
                                            <div className="progress" style={{ height: '10px', borderRadius: '5px' }}>
                                                <div className="progress-bar" style={{ width: '53%', background: '#4527A0', borderRadius: '5px' }}></div>
                                            </div>
                                        </div>

                                        <div className="text-center mt-4">
                                            <a href="#" className="btn"
                                                style={{
                                                    background: '#4527A0',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    padding: '8px 20px'
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (isLoggedIn) {
                                                        navigate('/dashboard');
                                                    } else {
                                                        navigate('/login');
                                                    }
                                                }}
                                            >
                                                Xem báo cáo chi tiết
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Dashboard */}
                            <div className="col-lg-6 mb-4">
                                <div className="card h-100" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
                                    <div className="card-body">
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                                            <i className="fas fa-tachometer-alt" style={{ color: '#4527A0', marginRight: '10px' }}></i>
                                            Dashboard
                                        </h3>

                                        <div className="row mb-4">
                                            <div className="col-6 mb-4">
                                                <div style={{
                                                    background: 'rgba(69,39,160,0.05)',
                                                    borderRadius: '12px',
                                                    padding: '15px',
                                                    height: '100%'
                                                }}>
                                                    <h5 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>Từ vựng đã học</h5>
                                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#4527A0', marginBottom: '0' }}>480</h3>
                                                </div>
                                            </div>
                                            <div className="col-6 mb-4">
                                                <div style={{
                                                    background: 'rgba(69,39,160,0.05)',
                                                    borderRadius: '12px',
                                                    padding: '15px',
                                                    height: '100%'
                                                }}>
                                                    <h5 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>Bài tập đã làm</h5>
                                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#4527A0', marginBottom: '0' }}>68</h3>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div style={{
                                                    background: 'rgba(69,39,160,0.05)',
                                                    borderRadius: '12px',
                                                    padding: '15px',
                                                    height: '100%'
                                                }}>
                                                    <h5 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>Thời gian học</h5>
                                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#4527A0', marginBottom: '0' }}>42h</h3>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div style={{
                                                    background: 'rgba(69,39,160,0.05)',
                                                    borderRadius: '12px',
                                                    padding: '15px',
                                                    height: '100%'
                                                }}>
                                                    <h5 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>Bài test đã làm</h5>
                                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#4527A0', marginBottom: '0' }}>{userProgress.testsCompleted}</h3>
                                                </div>
                                            </div>
                                        </div>

                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '15px' }}>Tiếp tục học</h4>

                                        <div className="continue-learning p-3 mb-3" style={{
                                            background: 'rgba(69,39,160,0.05)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer'
                                        }}
                                            onClick={(e) => {
                                                if (isLoggedIn) {
                                                    navigate('/learn-vocabulary/1');
                                                } else {
                                                    navigate('/login');
                                                }
                                            }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '8px',
                                                background: '#4527A0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '15px'
                                            }}>
                                                <i className="fas fa-book" style={{ color: 'white' }}></i>
                                            </div>
                                            <div>
                                                <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>Từ vựng về Office Equipment</h5>
                                                <div style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px', marginTop: '8px', width: '100%' }}>
                                                    <div style={{ height: '100%', width: '65%', background: '#4527A0', borderRadius: '2px' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Success Stories Section */}
                <section className="team-area section-padding40" style={{ background: '#f7f9fc' }}>
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-7 col-lg-8">
                                <div className="section-tittle text-center mb-55">
                                    <h2>Chia sẻ từ học viên</h2>
                                    <p>Những câu chuyện thành công từ các học viên đã đạt điểm TOEIC cao</p>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {[
                                {
                                    id: 1,
                                    name: "Trần Phan Tiến Anh",
                                    avatar: "assets/img/gallery/testimonial.png",
                                    score: "950/990",
                                    review: "Tôi đã tăng 200 điểm TOEIC sau 3 tháng học tập với nền tảng này. Phương pháp học rất hiệu quả."
                                },
                                {
                                    id: 2,
                                    name: "Phan Hùng Anh",
                                    avatar: "assets/img/gallery/team1.png",
                                    score: "890/990",
                                    review: "Các bài tập và đề thi thử giúp tôi làm quen với format bài thi thật. Đặc biệt phần nghe rất tốt."
                                },
                                {
                                    id: 3,
                                    name: "Hồ Kim Trí",
                                    avatar: "assets/img/gallery/team2.png",
                                    score: "845/990",
                                    review: "Từ vựng theo chủ đề và ngữ pháp trọng tâm giúp tôi tiết kiệm thời gian ôn luyện rất nhiều."
                                },
                                {
                                    id: 4,
                                    name: "Nguyễn Hiếu Nghĩa",
                                    avatar: "assets/img/gallery/team3.png",
                                    score: "905/990",
                                    review: "Lộ trình học được cá nhân hóa giúp tôi tập trung vào những điểm yếu của mình. Thực sự hiệu quả!"
                                }
                            ].map((story) => (
                                <div className="col-lg-3 col-md-6" key={story.id}>
                                    <div className="card h-100" style={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                                        padding: '20px',
                                        background: 'white'
                                    }}>
                                        <div className="text-center mb-3">
                                            <img
                                                src={story.avatar}
                                                alt={story.name}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '3px solid #4527A0'
                                                }}
                                            />
                                        </div>
                                        <div className="text-center mb-3">
                                            <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '5px' }}>{story.name}</h4>
                                            <div style={{
                                                display: 'inline-block',
                                                background: 'linear-gradient(90deg, rgb(192, 84, 255) 0%, rgb(82, 116, 255) 100%)',
                                                color: 'white',
                                                padding: '3px 15px',
                                                borderRadius: '20px',
                                                fontSize: '0.9rem',
                                                fontWeight: '500',
                                                marginBottom: '10px'
                                            }}>
                                                TOEIC {story.score}
                                            </div>
                                            <div style={{
                                                color: '#FFC107',
                                                fontSize: '1rem',
                                                marginBottom: '10px'
                                            }}>
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star"></i>
                                            </div>
                                        </div>
                                        <p style={{
                                            fontSize: '0.95rem',
                                            color: '#555',
                                            lineHeight: '1.6',
                                            fontStyle: 'italic',
                                            textAlign: 'center'
                                        }}>
                                            "{story.review}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="about-area2 fix pb-padding pt-50 pb-50" style={{
                    background: 'linear-gradient(90deg, rgba(41,19,107,1) 0%, rgba(69,39,160,1) 100%)',
                }}>
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <div style={{ color: 'white' }}>
                                    <h2 style={{ color: 'white', fontSize: '2.2rem', fontWeight: '700', marginBottom: '15px' }}>
                                        Sẵn sàng chinh phục TOEIC?
                                    </h2>
                                    <a href="#" className="btn"
                                        style={{
                                            background: '#FFC107',
                                            color: '#333',
                                            fontWeight: '600',
                                            padding: '12px 30px',
                                            borderRadius: '8px',
                                            fontSize: '1.5rem'
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (!isLoggedIn) {
                                                navigate('/register');
                                            } else {
                                                navigate('/test-online-new');
                                            }
                                        }}
                                    >
                                        {isLoggedIn ? 'Thi Thử miễn phí ngay!' : 'Đăng ký miễn phí!'}
                                    </a>
                                </div>
                            </div>
                            <div className="col-lg-4 d-none d-lg-block">

                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Home;