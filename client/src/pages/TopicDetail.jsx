import React, { useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/TopicDetail.css';

const TopicDetail = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [currentCard, setCurrentCard] = useState(0);
    const scrollContainerRef = useRef(null);

    // Dữ liệu thẻ flashcard mẫu
    const flashCards = [
        {
            front: {
                word: "Examination",
                audio: "/sounds/examination.mp3",
            },
            back: {
                definition: "Bài kiểm tra",
                pronunciation: "/ɪɡˌzæm.ɪˈneɪ.ʃən/",
                example: "The final examination will cover all chapters."
            }
        },
        {
            front: {
                word: "Quiz",
                audio: "/sounds/quiz.mp3",
            },
            back: {
                definition: "Câu đố",
                pronunciation: "/kwɪz/",
                example: "We have a pop quiz today."
            }
        },
    ];

    const handleScroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const playAudio = (audioUrl) => {
        const audio = new Audio(audioUrl);
        audio.play().catch(error => console.log("Error playing audio:", error));
    };

    return (
        <div className="td-layout-container">
            <Header />

            <main className="td-main-content">
                <div className="td-content-container">
                    {/* Phần tiêu đề và nút hành động */}
                    <div className="td-header-section">
                        <h1 className="td-main-title">Hướng dẫn cách sử dụng Quizizz để tạo câu hỏi trắc nghiệm</h1>
                        <div className="td-action-buttons">
                            <button className="td-action-btn">
                                <i className="fas fa-save td-btn-icon"></i>
                                Save
                            </button>
                            <button className="td-action-btn">
                                <i className="fas fa-share td-btn-icon"></i>
                                Share
                            </button>
                            <button className="td-action-btn">
                                <i className="fas fa-ellipsis-h td-btn-icon"></i>
                            </button>
                        </div>
                    </div>
                    <div className="td-rating-section">

                        <div className="td-features-grid">
                            {featuresData.map((feature, index) => (
                                <div key={index} className="td-feature-card">
                                    <i className={`fas fa-${feature.icon} td-feature-icon`}></i>
                                    <span className="td-feature-label">{feature.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Phần thẻ lật */}
                    <div className="td-flip-section">
                        <div
                            className={`td-flip-card ${isFlipped ? 'td-flipped' : ''}`}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className="td-flip-inner">
                                {/* Mặt trước */}
                                <div className="td-flip-front">
                                    {!isFlipped && (
                                        <button
                                            className="td-audio-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playAudio(flashCards[currentCard].front.audio);
                                            }}
                                            aria-label="Phát âm thanh"
                                        >
                                            <i className="fas fa-volume-up"></i>
                                        </button>
                                    )}
                                    <span className="td-word">
                                        {flashCards[currentCard].front.word}
                                    </span>
                                </div>

                                {/* Mặt sau */}
                                <div className="td-flip-back">
                                    <div className="td-definition">
                                        {flashCards[currentCard].back.definition}
                                    </div>
                                    <div className="td-pronunciation">
                                        {flashCards[currentCard].back.pronunciation}
                                    </div>
                                    {flashCards[currentCard].back.example && (
                                        <div className="td-example">
                                            "{flashCards[currentCard].back.example}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Nút yêu thích */}
                        <button
                            className={`td-favorite-btn ${isFavorite ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFavorite(!isFavorite);
                            }}
                            aria-label="Đánh dấu yêu thích"
                        >
                            <i className="fas fa-star"></i>
                        </button>
                    </div>

                    {/* Điều khiển thẻ */}
                    <div className="td-card-navigation">
                        <button className="td-nav-btn">
                            <i className="fas fa-random td-nav-icon"></i>
                        </button>

                        <div className="td-pagination-controls">
                            <button
                                className="td-nav-btn"
                                onClick={() => setCurrentCard(prev => Math.max(0, prev - 1))}
                            >
                                <i className="fas fa-arrow-left td-nav-icon"></i>
                            </button>
                            <span className="td-page-indicator">
                                {currentCard + 1} / {flashCards.length}
                            </span>
                            <button
                                className="td-nav-btn"
                                onClick={() => setCurrentCard(prev => Math.min(flashCards.length - 1, prev + 1))}
                            >
                                <i className="fas fa-arrow-right td-nav-icon"></i>
                            </button>
                        </div>

                        <button className="td-nav-btn">
                            <i className="fas fa-expand td-nav-icon"></i>
                        </button>
                    </div>

                    {/* Phần học liên quan */}
                    <section className="td-related-section">
                        <h2 className="td-section-title">Students also studied</h2>
                        <div className="td-scroll-wrapper">
                            <button
                                className="td-scroll-btn td-left-scroll"
                                onClick={() => handleScroll('left')}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>

                            <div className="td-card-carousel" ref={scrollContainerRef}>
                                {studyCards.map((card, index) => (
                                    <div key={index} className="td-study-card">
                                        <h3 className="td-card-title">{card.title}</h3>
                                        <div className="td-term-count">{card.terms}</div>
                                        <div className="td-user-profile">
                                            <img
                                                src={card.avatar}
                                                alt={card.user}
                                                className="td-user-avatar"
                                            />
                                            <span className="td-username">{card.user}</span>
                                        </div>
                                        {card.button && (
                                            <button className="td-preview-btn">Preview</button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                className="td-scroll-btn td-right-scroll"
                                onClick={() => handleScroll('right')}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </section>

                    {/* Danh sách thuật ngữ */}
                    <section className="td-terms-section">
                        <h2 className="td-section-title">Terms in this set ({termsData.length})</h2>
                        <div className="td-terms-list">
                            {termsData.map((term, index) => (
                                <div key={index} className="td-term-item">
                                    <div className="td-term-header">
                                        {term.image && (
                                            <div className="td-term-image-container">
                                                <img src={term.image} alt={term.question} className="td-term-image" />
                                            </div>
                                        )}
                                        <div className="td-term-title-group">
                                            <div className="td-term-text">{term.question}</div>
                                            {term.pronunciation && (
                                                <div className="td-term-pronunciation">{term.pronunciation}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="td-term-content">
                                        <div className="td-term-meaning">
                                            <div className="td-term-answer">{term.answer}</div>
                                        </div>
                                    </div>

                                    <div className="td-term-footer">
                                        <div className="td-term-translation"></div>
                                        <div className="td-term-actions">
                                            <button
                                                className="td-term-audio-btn"
                                                onClick={() => playAudio(term.audioUrl)}
                                                aria-label="Phát âm thanh"
                                            >
                                                <i className="fas fa-volume-up"></i>
                                            </button>
                                            <button
                                                className={`td-term-favorite-btn ${term.isFavorite ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsFavorite(!isFavorite);
                                                }}
                                                aria-label="Đánh dấu yêu thích"
                                            >
                                                <i className="fas fa-star"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// Dữ liệu mẫu
const featuresData = [
    { label: 'Flashcards', icon: 'book' },
    { label: 'Learn', icon: 'sync-alt' },
    { label: 'Test', icon: 'file-alt' },
    { label: 'Match', icon: 'comments' }
];

const studyCards = [
    {
        title: 'Triết học cơ bản',
        terms: '168 terms',
        user: 'philosophy_student',
        avatar: 'https://placehold.co/32x32',
        button: true
    },
    {
        title: 'Triết học cơ bản',
        terms: '168 terms',
        user: 'philosophy_student',
        avatar: 'https://placehold.co/32x32',
        button: true
    },
    {
        title: 'Triết học cơ bản',
        terms: '168 terms',
        user: 'philosophy_student',
        avatar: 'https://placehold.co/32x32',
        button: true
    },
    {
        title: 'Triết học cơ bản',
        terms: '168 terms',
        user: 'philosophy_student',
        avatar: 'https://placehold.co/32x32',
        button: true
    },
    {
        title: 'Triết học cơ bản',
        terms: '168 terms',
        user: 'philosophy_student',
        avatar: 'https://placehold.co/32x32',
        button: true
    },
];

const termsData = [
    {
        question: 'Make questions',
        answer: 'Tạo một gói câu hỏi',
        image: '/assets/img/gallery/topic5.png',
        pronunciation: '/krieɪt ə nju: kwɪz/',
        audioUrl: '/sounds/create-quiz.mp3',
        isFavorite: false
    },
    {
        question: 'Examination',
        answer: 'Bài kiểm tra',
        image: '/assets/img/gallery/topic5.png',
        pronunciation: '/ɪɡˌzæm.ɪˈneɪ.ʃən/',
        audioUrl: '/sounds/examination.mp3',
        isFavorite: true
    },
    {
        question: 'Quiz',
        answer: 'Câu đố',
        image: '/assets/img/gallery/topic5.png',
        pronunciation: '/kwɪz/',
        audioUrl: '/sounds/quiz.mp3',
        isFavorite: false
    },
    {
        question: 'Practice',
        answer: 'Luyện tập',
        image: '/assets/img/gallery/topic5.png',
        pronunciation: '/ˈpræk.tɪs/',
        audioUrl: '/sounds/practice.mp3',
        isFavorite: false
    },
    {
        question: 'Assessment',
        answer: 'Đánh giá',
        image: '/assets/img/gallery/topic5.png',
        pronunciation: '/əˈses.mənt/',
        audioUrl: '/sounds/assessment.mp3',
        isFavorite: true
    }
];

export default TopicDetail;