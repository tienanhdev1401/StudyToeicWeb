import React, { useState } from 'react';
import { FaBook, FaSearch, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/LearnGrammar.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { mockGrammars } from '../data/mockGrammars';
import { isGrammarCompleted } from '../data/mockLearningProcess';
import { useAuth } from '../context/AuthContext';

const LearnGrammar = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Get current user
    const [searchTerm, setSearchTerm] = useState('');
    const grammarItems = Object.values(mockGrammars);

    // Filter grammar topics based on search term
    const filteredGrammarItems = grammarItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetail = (topic) => {
        const topicSlug = topic.title
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
        navigate(`/learn-grammar/${topicSlug}`);
    };

    return (
        <>
            <Header />
            <div className="header-container">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm chủ đề..."
                        className="search-input"
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
                        <span className="counter">{filteredGrammarItems.length}/{grammarItems.length} topics</span>
                    </div>
                    
                    <div className="test-list">
                        {filteredGrammarItems.map(item => {
                            const isCompleted = user ? isGrammarCompleted(user.id, item.id) : false;
                            
                            return (
                                <div key={item.id} className={`test-item ${isCompleted ? 'completed' : ''}`}>
                                    <div className="item-content">
                                        <span className="item-number">{item.id.toString().padStart(2, '0')}</span>
                                        <FaBook className="item-icon" />
                                        <span className="item-title" onClick={() => handleViewDetail(item)}>
                                            {item.title}
                                        </span>
                                        {isCompleted && (
                                            <FaCheckCircle className="completed-icon" />
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