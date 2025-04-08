import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';
import { mockGrammars } from '../data/mockGrammars';
import '../styles/GrammarDetail.css'; 
import Header from '../components/Header';
import Footer from '../components/Footer';

const GrammarDetail = () => {
    const { topicSlug } = useParams();
    const navigate = useNavigate();

    const topicKey = Object.keys(mockGrammars).find(
        key => key.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') === topicSlug
    );

    const topic = mockGrammars[topicKey];

    const handlePracticeClick = () => {
        navigate(`/learn-grammar/${topicSlug}/do-grammar-exercise`, {
            state: {
                topicId: topic.id,
                topicName: topic.title,
                topicContent: topic.content
            }
        });
    };

    if (!topic) {
        return <div className="error-message">Topic not found</div>;
    }

    return (
        <>
            <Header />
            <div className="grammar-detail-container">
                <div className="grammar-detail-content">
                    <h1 className="grammar-title">{topic.title}</h1>
                    <div className="grammar-text" dangerouslySetInnerHTML={{ __html: topic.content }} />
                    
                    <div className="practice-button-container">
                        <button 
                            className="practice-button"
                            onClick={handlePracticeClick}
                        >
                            <FaPlay className="practice-icon" /> Luyện tập ngay
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default GrammarDetail;