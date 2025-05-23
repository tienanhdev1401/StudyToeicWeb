import React, { useState, useEffect } from 'react';
import { FaBook, FaSearch, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/LearnGrammar.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { isGrammarCompleted } from '../data/mockLearningProcess';
import { useAuth } from '../context/AuthContext';
import GrammarTopicService from '../services/grammarTopicService';
import learningProcessService from '../services/learningProcessService';
import LoadingSpinner from '../components/LoadingSpinner';

const LearnGrammar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [grammarItems, setGrammarItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedTopics, setCompletedTopics] = useState([]);

    // Fetch completed topics
    useEffect(() => {
        const fetchCompletedTopics = async () => {
            if (user && user.id) {
                try {
                    const processes = await learningProcessService.getAllLearningProcessByUserId(user.id);
                    const completedGrammarIds = processes
                        .filter(process => process.GrammarTopicId && process.progressStatus === 'completed')
                        .map(process => process.GrammarTopicId);
                    setCompletedTopics(completedGrammarIds);
                } catch (err) {
                    console.error('Error fetching completed topics:', err);
                }
            }
        };
        fetchCompletedTopics();
    }, [user]);

    // Fetch grammar topics from API
    useEffect(() => {
        const fetchGrammarTopics = async () => {
            try {
                const data = await GrammarTopicService.getAllGrammarTopics();
                setGrammarItems(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error('Error fetching grammar topics:', err);
            }
        };

        fetchGrammarTopics();
    }, []);

    // Filter grammar topics based on search term
    const filteredGrammarItems = grammarItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetail = (topic) => {
        const topicId=topic.id
        navigate(`/learn-grammary/${topicId}`);
    };

    if (loading) {
        return (
            <>
                <Header />
                <LoadingSpinner />
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="error-container">
                    <p>Error loading grammar topics: {error}</p>
                    <button onClick={() => window.location.reload()}>Try Again</button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="grammar-header-container">
                <div className="grammar-search-box">
                    <FaSearch className="grammar-search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm chủ đề..."
                        className="grammar-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <h1 className="vocab-page-title">NGỮ PHÁP THEO CHỦ ĐỀ</h1>
            </div>
            <div className="grammarcontainer">
                <div className="card">
                    <div className="header">
                        <h1 className="title">Grammar Topics</h1>
                        <span className="counter">
                            {filteredGrammarItems.length}/{grammarItems.length} topics
                        </span>
                    </div>
                    
                    <div className="test-list">
                        {filteredGrammarItems.map(item => {
                            const mockCompleted = user ? isGrammarCompleted(user.id, item.id) : false;
                            const realCompleted = completedTopics.includes(item.id);
                            const isCompleted = realCompleted;
                            
                            return (
                                <div key={item.id} className={`test-item ${isCompleted ? 'completed' : ''}`}>
                                    <div className="item-content">
                                        <span className="item-number">{item.id.toString().padStart(2, '0')}</span>
                                        <FaBook className="item-icon" />
                                        <span className="item-title" onClick={() => handleViewDetail(item)}>
                                            {item.title}
                                        </span>
                                        {isCompleted && (
                                            <FaCheckCircle className="completed-icon" style={{ color: '#4CAF50' }} />
                                        )}
                                    </div>
                                    <span className="item-score">-</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default LearnGrammar;