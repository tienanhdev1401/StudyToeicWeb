import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';
import '../styles/GrammarDetail.css'; 
import Header from '../components/Header';
import Footer from '../components/Footer';
import GrammarTopicService from '../services/grammarTopicService';

const GrammarDetail = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [topic, setTopic] = useState(topicId);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // console.log(topicId)

    useEffect(() => {
        const fetchGrammarTopic = async () => {
            try {
                const topicData = await GrammarTopicService.getGrammarTopicById(topicId);
                // console.log(topicData)
                setTopic(topicData);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error('Error fetching grammar topic:', err);
            }
        };

        fetchGrammarTopic();
    }, [topicId]);

    const handlePracticeClick = async () => {
        if (!topic) return;
        
        try {
            // First get the exercise for this grammar topic
            const exercises = await GrammarTopicService.getExercisesForGrammarTopic(topicId);
            
            if (exercises.length === 0) {
                alert('Không có bài tập cho chủ đề này');
                return;
            }
    
            // Navigate to exercise page with the first exercise
            navigate(`/exercise/${exercises[0].id}`, {
                state: {
                    topicId: topic.id,
                    topicName: topic.title
                }
            });
        } catch (error) {
            console.error('Error fetching exercises:', error);
            alert('Lỗi khi tải bài tập');
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading grammar topic...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="error-message">{error}</div>
                <Footer />
            </>
        );
    }

    if (!topic) {
        return (
            <>
                <Header />
                <div className="error-message">Topic not found</div>
                <Footer />
            </>
        );
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