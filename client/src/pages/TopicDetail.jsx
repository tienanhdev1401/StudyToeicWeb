import React, { useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/TopicDetail.css';

const TopicDetail = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const scrollContainerRef = useRef(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const handleScroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="td-layout-container">
            <Header />

            <main className="td-main-content">
                <div className="td-content-container">
                    {/* Title và Action Buttons */}
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

                    {/* Rating và Features */}
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

                    {/* Flip Card */}
                    <div className="td-flip-section">
                        <div
                            className={`td-flip-card ${isFlipped ? 'td-flipped' : ''}`}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className="td-flip-inner">
                                <div className="td-flip-front">
                                    <span>Test</span>
                                </div>
                                <div className="td-flip-back">
                                    <span>Bài kiểm tra</span>
                                </div>
                            </div>
                        </div>
                        <button
                            className={`td-favorite-btn ${isFavorite ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFavorite(!isFavorite);
                            }}
                            aria-label="Bookmark this card"
                        >
                            <i className="fas fa-star"></i>
                        </button>
                    </div>

                    {/* Navigation Controls */}
                    <div className="td-card-navigation">
                        <button className="td-nav-btn">
                            <i className="fas fa-random td-nav-icon"></i>
                        </button>

                        <div className="td-pagination-controls">
                            <button className="td-nav-btn">
                                <i className="fas fa-arrow-left td-nav-icon"></i>
                            </button>
                            <span className="td-page-indicator">1 / 5</span>
                            <button className="td-nav-btn">
                                <i className="fas fa-arrow-right td-nav-icon"></i>
                            </button>
                        </div>

                        <button className="td-nav-btn">
                            <i className="fas fa-expand td-nav-icon"></i>
                        </button>
                    </div>



                    {/* Students Also Studied */}
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

                    {/* Terms Section */}
                    <section className="td-terms-section">
                        <h2 className="td-section-title">Terms in this set (5)</h2>
                        <div className="td-terms-grid">
                            {termsData.map((term, index) => (
                                <div key={index} className="td-term-card">
                                    <div className="td-term-question">{term.question}</div>
                                    <div className="td-term-answer">{term.answer}</div>
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

// Data và helpers
const featuresData = [
    { label: 'Flashcards', icon: 'book' },
    { label: 'Learn', icon: 'sync-alt' },
    { label: 'Test', icon: 'file-alt' },
    { label: 'Match', icon: 'comments' }
];

const studyCards = [
    {
        title: 'Triết 123 - 511 câu hỏi trắc nghiệm tri...',
        terms: '168 terms',
        user: 'lifelong_learner_15',
        avatar: 'https://placehold.co/32x32',
        button: true
    },
    {
        title: 'Triết 123 - 511 câu hỏi trắc nghiệm tri...',
        terms: '168 terms',
        user: 'lifelong_learner_15',
        avatar: 'https://placehold.co/32x32',
        button: true
    },
    {
        title: 'Triết 123 - 511 câu hỏi trắc nghiệm tri...',
        terms: '168 terms',
        user: 'lifelong_learner_15',
        avatar: 'https://placehold.co/32x32',
        button: true
    },
    {
        title: 'Triết 123 - 511 câu hỏi trắc nghiệm tri...',
        terms: '168 terms',
        user: 'lifelong_learner_15',
        avatar: 'https://placehold.co/32x32',
        button: true
    },
    {
        title: 'Triết 123 - 511 câu hỏi trắc nghiệm tri...',
        terms: '168 terms',
        user: 'lifelong_learner_15',
        avatar: 'https://placehold.co/32x32',
        button: true
    },
];

const termsData = [
    {
        question: 'Click vào Create a new quiz để làm gì?',
        answer: 'Tạo một gói câu hỏi'
    },
    {
        question: 'Click vào Create a new quiz để làm gì?',
        answer: 'Tạo một gói câu hỏi'
    },
    {
        question: 'Click vào Create a new quiz để làm gì?',
        answer: 'Tạo một gói câu hỏi'
    },
    {
        question: 'Click vào Create a new quiz để làm gì?',
        answer: 'Tạo một gói câu hỏi'
    },
    {
        question: 'Click vào Create a new quiz để làm gì?',
        answer: 'Tạo một gói câu hỏi'
    },
];

export default TopicDetail;