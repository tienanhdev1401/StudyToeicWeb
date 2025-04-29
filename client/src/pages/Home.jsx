import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VocabularyTopicService from '../services/vocabularyTopicService';
import GrammarTopicService from '../services/grammarTopicService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Home = () => {
    const [recentTopics, setRecentTopics] = useState([]);
    const [grammarTopics, setGrammarTopics] = useState([]);
    const [practiceTests, setPracticeTests] = useState([]);
    const [userProgress, setUserProgress] = useState({
        vocabLearned: 120,
        vocabTotal: 600,
        grammarCompleted: 4,
        grammarTotal: 12,
        testsCompleted: 2,
        lastScore: 650,
        studyStreak: 5
    });
    const { isLoggedIn, user } = useAuth();
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
                // Thay thế API endpoint thực tế của bạn
                const response = await fetch('/api/practice-tests');
                if (response.ok) {
                    const data = await response.json();
                    setPracticeTests(data.slice(0, 4)); // Lấy 4 bài test đầu tiên
                } else {
                    // Nếu API không có sẵn, sử dụng dữ liệu mẫu
                    setPracticeTests([
                        {
                            id: 1,
                            title: "Full Test",
                            image: "assets/img/gallery/fulltest.jpg",
                            description: "Đề thi đầy đủ 200 câu như TOEIC thật",
                            time: "2 giờ",
                            level: "All levels",
                            pageLink: "/toeic-exercise/full-test"
                        },
                        {
                            id: 2,
                            title: "Mini Test",
                            image: "assets/img/gallery/minitest.jpg",
                            description: "Bài thi rút gọn 100 câu, hoàn thành trong 1 giờ",
                            time: "1 giờ",
                            level: "Intermediate",
                            pageLink: "/toeic-exercise/mini-test"
                        },
                        {
                            id: 3,
                            title: "Part Practice",
                            image: "assets/img/gallery/partpractice.jpg",
                            description: "Luyện tập từng phần riêng biệt",
                            time: "15-30 phút",
                            level: "Beginner",
                            pageLink: "/toeic-exercise/part-practice"
                        },
                        {
                            id: 4,
                            title: "Weak Point Fix",
                            image: "assets/img/gallery/weakpoint.jpg", 
                            description: "Tập trung vào các phần làm chưa tốt",
                            time: "30 phút",
                            level: "All levels",
                            pageLink: "/toeic-exercise/weak-point"
                        }
                    ]);
                }
            } catch (error) {
                // Xử lý lỗi và sử dụng dữ liệu mẫu
                setPracticeTests([
                    {
                        id: 1,
                        title: "Full Test",
                        image: "assets/img/gallery/fulltest.jpg",
                        description: "Đề thi đầy đủ 200 câu như TOEIC thật",
                        time: "2 giờ",
                        level: "All levels",
                        pageLink: "/toeic-exercise/full-test"
                    },
                    {
                        id: 2,
                        title: "Mini Test",
                        image: "assets/img/gallery/minitest.jpg",
                        description: "Bài thi rút gọn 100 câu, hoàn thành trong 1 giờ",
                        time: "1 giờ",
                        level: "Intermediate",
                        pageLink: "/toeic-exercise/mini-test"
                    },
                    {
                        id: 3,
                        title: "Part Practice",
                        image: "assets/img/gallery/partpractice.jpg",
                        description: "Luyện tập từng phần riêng biệt",
                        time: "15-30 phút",
                        level: "Beginner",
                        pageLink: "/toeic-exercise/part-practice"
                    },
                    {
                        id: 4,
                        title: "Weak Point Fix",
                        image: "assets/img/gallery/weakpoint.jpg", 
                        description: "Tập trung vào các phần làm chưa tốt",
                        time: "30 phút",
                        level: "All levels",
                        pageLink: "/toeic-exercise/weak-point"
                    }
                ]);
            }
        };
        fetchPracticeTests();
    }, []);

    const learningPaths = [
        {
            id: 1,
            title: "Beginner (400-500)",
            description: "Xây dựng nền tảng từ vựng và ngữ pháp căn bản để đạt mục tiêu 400-500 điểm TOEIC.",
            image: "assets/img/toeic/path-beginner.jpg",
            color: "#4CAF50",
            stats: "2 tháng • 40 bài học"
        },
        {
            id: 2,
            title: "Intermediate (500-700)",
            description: "Tăng cường kỹ năng đọc và nghe, mở rộng vốn từ vựng chuyên ngành để đạt 500-700 điểm.",
            image: "assets/img/toeic/path-intermediate.jpg",
            color: "#2196F3",
            stats: "3 tháng • 60 bài học"
        },
        {
            id: 3,
            title: "Advanced (700-850)",
            description: "Chinh phục các kỹ thuật làm bài nâng cao và từ vựng phức tạp để đạt 700-850 điểm.",
            image: "assets/img/toeic/path-advanced.jpg",
            color: "#FF9800",
            stats: "4 tháng • 75 bài học"
        },
        {
            id: 4,
            title: "Expert (850-990)",
            description: "Hoàn thiện chiến lược làm bài và kỹ năng ngôn ngữ để đạt điểm tối đa gần 990.",
            image: "assets/img/toeic/path-expert.jpg",
            color: "#F44336",
            stats: "3 tháng • 50 bài học"
        }
    ];

    const testimonials = [
        {
            id: 1,
            name: "Nguyễn Thanh Hà",
            score: 915,
            avatar: "assets/img/testimonials/user1.jpg",
            quote: "Tôi đã tăng 250 điểm sau 3 tháng học tập với lộ trình Advanced. Các bài tập thực hành rất sát với đề thi thật!",
            position: "Marketing Specialist"
        },
        {
            id: 2,
            name: "Trần Minh Hoàng",
            score: 875,
            avatar: "assets/img/testimonials/user2.jpg",
            quote: "Phương pháp học từ vựng theo chủ đề và các bài thi thử giúp tôi tự tin hơn rất nhiều khi thi thật.",
            position: "IT Engineer"
        },
        {
            id: 3,
            name: "Phạm Thu Trang",
            score: 950,
            avatar: "assets/img/testimonials/user3.jpg",
            quote: "Từ 650 lên 950 chỉ trong 6 tháng! Bí quyết là làm đều đặn các bài kiểm tra và ôn luyện hàng ngày.",
            position: "Finance Analyst"
        }
    ];

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
                                                Get Your <span style={{color: '#FFC107'}}>TOEIC 900+</span><br />With Our Proven Method
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
                                                <a href="#toeic-overview" className="btn hero-btn" style={{background: 'rgba(255,255,255,0.15)'}}>
                                                    Tìm hiểu TOEIC
                                                </a>
                                        </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-5 d-none d-lg-block">
                                        <img src="assets/img/gallery/toeic_hero.png" alt="TOEIC Preparation" 
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
                    <section className="user-dashboard py-5" style={{backgroundColor: "#f8f9fa"}}>
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
                                                        <div className="col-md-6">
                                                            <div className="d-flex align-items-center p-3 bg-light rounded">
                                                                <div style={{ width: 50, height: 50 }}>
                                                                    <CircularProgressbar
                                                                        value={(userProgress.vocabLearned / userProgress.vocabTotal) * 100}
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
                                                                    <p className="mb-0 small text-muted">{userProgress.vocabLearned}/{userProgress.vocabTotal} từ</p>
                                    </div>
                                </div>
                            </div>
                                                        <div className="col-md-6">
                                                            <div className="d-flex align-items-center p-3 bg-light rounded">
                                                                <div style={{ width: 50, height: 50 }}>
                                                                    <CircularProgressbar
                                                                        value={(userProgress.grammarCompleted / userProgress.grammarTotal) * 100}
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
                                                                    <p className="mb-0 small text-muted">{userProgress.grammarCompleted}/{userProgress.grammarTotal} chủ đề</p>
                                    </div>
                                </div>
                            </div>
                                    </div>
                                                    
                                                    <div className="mt-4">
                                                        <a href="#" onClick={e => { e.preventDefault(); navigate('/resume-learning'); }} 
                                                           className="btn btn-primary me-2">
                                                            <i className="fas fa-play-circle me-2"></i>Tiếp tục học
                                                        </a>
                                                        <a href="#" onClick={e => { e.preventDefault(); navigate('/practice-test'); }} 
                                                           className="btn btn-outline-primary">
                                                            <i className="fas fa-tasks me-2"></i>Làm bài thi thử
                                                        </a>
                                    </div>
                                </div>
                                                <div className="col-md-4 mt-4 mt-md-0">
                                                    <div className="card h-100 border-0 bg-primary bg-gradient text-white">
                                                        <div className="card-body text-center p-4">
                                                            <div className="mb-3">
                                                                <i className="fas fa-chart-line fa-3x"></i>
                            </div>
                                                            <h3 className="mb-3">{userProgress.lastScore}</h3>
                                                            <p className="mb-1">Điểm TOEIC dự đoán</p>
                                                            <p className="small mb-0">Dựa trên bài thi gần nhất</p>
                                                            <hr className="my-3" />
                                                            <div className="d-flex justify-content-center align-items-center">
                                                                <div className="text-center me-3">
                                                                    <h5 className="mb-0">{userProgress.studyStreak}</h5>
                                                                    <small>Ngày học liên tiếp</small>
                        </div>
                                                                <div className="text-center">
                                                                    <h5 className="mb-0">{userProgress.testsCompleted}</h5>
                                                                    <small>Bài thi đã hoàn thành</small>
                    </div>
                </div>
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
                <section className="about-area1 fix pt-60 pb-60" id="toeic-overview" style={{background: '#f7f9fc'}}>
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
                                <div className="card h-100" style={{borderRadius: '15px', border: 'none', boxShadow: '0 5px 20px rgba(0,0,0,0.05)'}}>
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
                                                <i className="fas fa-headphones" style={{color: '#4527A0', fontSize: '1.5rem'}}></i>
                                            </span>
                                            <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>Listening Section</h3>
                                        </div>
                                        <p>100 câu hỏi - 45 phút</p>
                                        <ul style={{paddingLeft: '20px'}}>
                                            <li className="mb-2">Part 1: Mô tả hình ảnh (6 câu)</li>
                                            <li className="mb-2">Part 2: Hỏi - Đáp (25 câu)</li>
                                            <li className="mb-2">Part 3: Đoạn hội thoại (39 câu)</li>
                                            <li className="mb-2">Part 4: Bài nói ngắn (30 câu)</li>
                                        </ul>
                                        <div className="mt-3">
                                            <a href="#" className="text-primary" style={{fontWeight: '500', textDecoration: 'none'}} 
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
                                <div className="card h-100" style={{borderRadius: '15px', border: 'none', boxShadow: '0 5px 20px rgba(0,0,0,0.05)'}}>
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
                                                <i className="fas fa-book-open" style={{color: '#4527A0', fontSize: '1.5rem'}}></i>
                                            </span>
                                            <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>Reading Section</h3>
                                        </div>
                                        <p>100 câu hỏi - 75 phút</p>
                                        <ul style={{paddingLeft: '20px'}}>
                                            <li className="mb-2">Part 5: Câu không hoàn chỉnh (30 câu)</li>
                                            <li className="mb-2">Part 6: Đoạn văn không hoàn chỉnh (16 câu)</li>
                                            <li className="mb-2">Part 7: Đọc hiểu (54 câu)</li>
                                        </ul>
                                        <div className="mt-3">
                                            <a href="#" className="text-primary" style={{fontWeight: '500', textDecoration: 'none'}} 
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
                                <div className="score-scale p-4 mt-2" style={{borderRadius: '15px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)'}}>
                                    <h4 style={{fontWeight: '600', fontSize: '1.2rem', marginBottom: '15px'}}>Thang điểm TOEIC</h4>
                                    <div className="d-flex justify-content-between flex-wrap">
                                        <div className="score-level px-3 py-2 mb-2" style={{borderRadius: '10px', background: '#FFF3E0', minWidth: '150px'}}>
                                            <p className="mb-0"><strong>10 - 250</strong>: Beginner</p>
                        </div>
                                        <div className="score-level px-3 py-2 mb-2" style={{borderRadius: '10px', background: '#E1F5FE', minWidth: '150px'}}>
                                            <p className="mb-0"><strong>255 - 400</strong>: Elementary</p>
                    </div>
                                        <div className="score-level px-3 py-2 mb-2" style={{borderRadius: '10px', background: '#E8F5E9', minWidth: '150px'}}>
                                            <p className="mb-0"><strong>405 - 600</strong>: Intermediate</p>
                </div>
                                        <div className="score-level px-3 py-2 mb-2" style={{borderRadius: '10px', background: '#EDE7F6', minWidth: '150px'}}>
                                            <p className="mb-0"><strong>605 - 780</strong>: Advanced</p>
                            </div>
                                        <div className="score-level px-3 py-2 mb-2" style={{borderRadius: '10px', background: '#FFEBEE', minWidth: '150px'}}>
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
                                    onMouseOver={(e) => {e.currentTarget.style.transform = 'translateY(-10px)'}}
                                    onMouseOut={(e) => {e.currentTarget.style.transform = 'translateY(0)'}}
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
                                                    <i className={path.icon} style={{color: path.textColor, fontSize: '1.5rem'}}></i>
                                                </span>
                                                <h3 style={{margin: 0, fontSize: '1.3rem', fontWeight: '600'}}>{path.title}</h3>
                                </div>
                                            <p style={{height: '80px'}}>{path.description}</p>
                                            <div className="mt-3">
                                                <span className="badge me-2" style={{background: path.color, color: path.textColor}}>
                                                    {path.level}
                                                </span>
                                                <span className="badge" style={{background: path.color, color: path.textColor}}>
                                                    {path.duration}
                                                </span>
                            </div>
                                            <div className="mt-3 text-end">
                                                <a href="#" style={{color: path.textColor, fontWeight: '500', textDecoration: 'none'}}
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
                <div className="topic-area section-padding40" style={{background: '#f7f9fc'}}>
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
                                        <div style={{padding: '15px'}}>
                                            <div className="progress-info mb-2" style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <span style={{fontSize: '0.85rem', color: '#666'}}>Tiến độ học</span>
                                                <span style={{fontSize: '0.85rem', fontWeight: '500'}}>{Math.floor(Math.random() * 70) + 30}%</span>
                                            </div>
                                            <div className="progress" style={{height: '8px', borderRadius: '4px', background: '#f0f0f0'}}>
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
                                        onClick={e => { e.preventDefault(); if (isLoggedIn) { navigate(`/grammar-topic/${topic.id}`); } else { navigate('/login'); } }}
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
                                                <div style={{display: 'flex', marginBottom: '10px'}}>
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
                <section className="about-area1 fix pt-60 pb-60" style={{background: '#f7f9fc'}}>
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
                                        if (isLoggedIn) {
                                            navigate(test.pageLink);
                                        } else {
                                            navigate('/login');
                                        }
                                    }}
                                    onMouseOver={(e) => {e.currentTarget.style.transform = 'translateY(-8px)'}}
                                    onMouseOut={(e) => {e.currentTarget.style.transform = 'translateY(0)'}}>
                                        <div style={{position: 'relative', height: '160px'}}>
                                            <img 
                                                src={test.image} 
                                                alt={test.title}
                                                style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '15px',
                                                left: '15px',
                                                background: 'rgba(0,0,0,0.7)',
                                                color: 'white',
                                                padding: '5px 15px',
                                                borderRadius: '20px',
                                                fontSize: '1rem',
                                                fontWeight: '600'
                                            }}>
                                                {test.title}
                                            </div>
                                        </div>
                                        <div style={{padding: '15px'}}>
                                            <p style={{marginBottom: '10px', fontSize: '0.95rem'}}>{test.description}</p>
                                            <div style={{display: 'flex', marginBottom: '15px'}}>
                                                <div style={{marginRight: '15px'}}>
                                                    <i className="far fa-clock" style={{color: '#666', marginRight: '5px'}}></i>
                                                    <span style={{fontSize: '0.85rem', color: '#666'}}>{test.time}</span>
                                                </div>
                                                <div>
                                                    <i className="fas fa-signal" style={{color: '#666', marginRight: '5px'}}></i>
                                                    <span style={{fontSize: '0.85rem', color: '#666'}}>{test.level}</span>
                                                </div>
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
                                                    fontSize: '0.9rem'
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (isLoggedIn) {
                                                        navigate(test.pageLink);
                                                    } else {
                                                        navigate('/login');
                                                    }
                                                }}
                                            >
                                                Bắt đầu làm bài
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Study Progress and Dashboard */}
                <section className="about-area3 fix pt-60 pb-60">
                    <div className="container">
                        <div className="row">
                            {/* Study Progress */}
                            <div className="col-lg-6 mb-4">
                                <div className="card h-100" style={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)'}}>
                                    <div className="card-body">
                                        <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px'}}>
                                            <i className="fas fa-chart-line" style={{color: '#4527A0', marginRight: '10px'}}></i> 
                                            Tiến độ học tập
                                        </h3>
                                        
                                        {/* Progress Bars */}
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h5 style={{margin: 0, fontSize: '1rem'}}>TOEIC Listening</h5>
                                                <span style={{fontWeight: '500'}}>65%</span>
                                </div>
                                            <div className="progress" style={{height: '10px', borderRadius: '5px'}}>
                                                <div className="progress-bar" style={{width: '65%', background: '#4527A0', borderRadius: '5px'}}></div>
                            </div>
                        </div>
                                        
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h5 style={{margin: 0, fontSize: '1rem'}}>TOEIC Reading</h5>
                                                <span style={{fontWeight: '500'}}>42%</span>
                                    </div>
                                            <div className="progress" style={{height: '10px', borderRadius: '5px'}}>
                                                <div className="progress-bar" style={{width: '42%', background: '#4527A0', borderRadius: '5px'}}></div>
                                    </div>
                                </div>
                                        
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h5 style={{margin: 0, fontSize: '1rem'}}>Vocabulary</h5>
                                                <span style={{fontWeight: '500'}}>78%</span>
                            </div>
                                            <div className="progress" style={{height: '10px', borderRadius: '5px'}}>
                                                <div className="progress-bar" style={{width: '78%', background: '#4527A0', borderRadius: '5px'}}></div>
                                    </div>
                                    </div>
                                        
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h5 style={{margin: 0, fontSize: '1rem'}}>Grammar</h5>
                                                <span style={{fontWeight: '500'}}>53%</span>
                                </div>
                                            <div className="progress" style={{height: '10px', borderRadius: '5px'}}>
                                                <div className="progress-bar" style={{width: '53%', background: '#4527A0', borderRadius: '5px'}}></div>
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
                                <div className="card h-100" style={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)'}}>
                                    <div className="card-body">
                                        <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px'}}>
                                            <i className="fas fa-tachometer-alt" style={{color: '#4527A0', marginRight: '10px'}}></i>
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
                                                    <h5 style={{fontSize: '0.9rem', color: '#666', marginBottom: '5px'}}>Từ vựng đã học</h5>
                                                    <h3 style={{fontSize: '1.8rem', fontWeight: '600', color: '#4527A0', marginBottom: '0'}}>480</h3>
                                    </div>
                                </div>
                                            <div className="col-6 mb-4">
                                                <div style={{
                                                    background: 'rgba(69,39,160,0.05)',
                                                    borderRadius: '12px',
                                                    padding: '15px',
                                                    height: '100%'
                                                }}>
                                                    <h5 style={{fontSize: '0.9rem', color: '#666', marginBottom: '5px'}}>Bài tập đã làm</h5>
                                                    <h3 style={{fontSize: '1.8rem', fontWeight: '600', color: '#4527A0', marginBottom: '0'}}>68</h3>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div style={{
                                                    background: 'rgba(69,39,160,0.05)',
                                                    borderRadius: '12px',
                                                    padding: '15px',
                                                    height: '100%'
                                                }}>
                                                    <h5 style={{fontSize: '0.9rem', color: '#666', marginBottom: '5px'}}>Thời gian học</h5>
                                                    <h3 style={{fontSize: '1.8rem', fontWeight: '600', color: '#4527A0', marginBottom: '0'}}>42h</h3>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div style={{
                                                    background: 'rgba(69,39,160,0.05)',
                                                    borderRadius: '12px',
                                                    padding: '15px',
                                                    height: '100%'
                                                }}>
                                                    <h5 style={{fontSize: '0.9rem', color: '#666', marginBottom: '5px'}}>Điểm dự đoán</h5>
                                                    <h3 style={{fontSize: '1.8rem', fontWeight: '600', color: '#4527A0', marginBottom: '0'}}>650</h3>
                                                </div>
                                            </div>
                                        </div>

                                        <h4 style={{fontSize: '1.1rem', fontWeight: '600', marginBottom: '15px'}}>Tiếp tục học</h4>
                                        
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
                                                <i className="fas fa-book" style={{color: 'white'}}></i>
                                            </div>
                                            <div>
                                                <h5 style={{margin: 0, fontSize: '1rem', fontWeight: '500'}}>Từ vựng về Office Equipment</h5>
                                                <div style={{height: '4px', background: '#e0e0e0', borderRadius: '2px', marginTop: '8px', width: '100%'}}>
                                                    <div style={{height: '100%', width: '65%', background: '#4527A0', borderRadius: '2px'}}></div>
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
                <section className="team-area section-padding40" style={{background: '#f7f9fc'}}>
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
                                    name: "Nguyễn Văn A",
                                    avatar: "assets/img/gallery/user1.jpg",
                                    score: "950/990",
                                    review: "Tôi đã tăng 200 điểm TOEIC sau 3 tháng học tập với nền tảng này. Phương pháp học rất hiệu quả."
                                },
                                {
                                    id: 2,
                                    name: "Trần Thị B",
                                    avatar: "assets/img/gallery/user2.jpg",
                                    score: "890/990",
                                    review: "Các bài tập và đề thi thử giúp tôi làm quen với format bài thi thật. Đặc biệt phần nghe rất tốt."
                                },
                                {
                                    id: 3,
                                    name: "Lê Văn C",
                                    avatar: "assets/img/gallery/user3.jpg",
                                    score: "845/990",
                                    review: "Từ vựng theo chủ đề và ngữ pháp trọng tâm giúp tôi tiết kiệm thời gian ôn luyện rất nhiều."
                                },
                                {
                                    id: 4,
                                    name: "Phạm Thị D",
                                    avatar: "assets/img/gallery/user4.jpg",
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
                                            <h4 style={{fontSize: '1.2rem', fontWeight: '600', marginBottom: '5px'}}>{story.name}</h4>
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
                                <div style={{color: 'white'}}>
                                    <h2 style={{color: 'white', fontSize: '2.2rem', fontWeight: '700', marginBottom: '15px'}}>
                                        Sẵn sàng chinh phục TOEIC?
                                    </h2>
                                    <p style={{fontSize: '1.1rem', opacity: '0.9', marginBottom: '20px'}}>
                                        Đăng ký ngay để bắt đầu lộ trình học cá nhân hóa và đạt được điểm TOEIC mục tiêu của bạn!
                                    </p>
                                    <a href="#" className="btn" 
                                        style={{
                                            background: '#FFC107',
                                            color: '#333',
                                            fontWeight: '600',
                                            padding: '12px 30px',
                                            borderRadius: '8px',
                                            fontSize: '1.1rem'
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (!isLoggedIn) {
                                                navigate('/register');
                                            } else {
                                                navigate('/dashboard');
                                            }
                                        }}
                                    >
                                        {isLoggedIn ? 'Vào Dashboard' : 'Đăng ký miễn phí'}
                                    </a>
            </div>
                            </div>
                            <div className="col-lg-4 d-none d-lg-block">
                                <img src="assets/img/gallery/toeic_cta.png" alt="TOEIC Success" style={{maxWidth: '100%'}} />
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