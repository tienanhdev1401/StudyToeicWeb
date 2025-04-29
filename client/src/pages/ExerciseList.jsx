import React, { useState, useEffect } from 'react';
import '../styles/ExerciseList.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import GrammarTopicService from '../services/grammarTopicService';
import LoadingSpinner from '../components/LoadingSpinner';
import VocabularyTopicService from '../services/vocabularyTopicService'

const GrammarCard = ({ name, stats, progress, isExpanded, onToggle, gradientClass, exercises }) => {
    const navigate = useNavigate();

    const toggleExpand = (e) => {
        e.stopPropagation();
        onToggle(name); // Just pass the name to the parent handler
    };

    const handleExerciseClick = (e, exercise) => {
        e.stopPropagation();
        navigate(`/exercise/${exercise.id}`, {
            state: { 
                topicId: exercise.grammarTopicId,
                topicName: name,
                topicType: 'Grammar'
            }
        });
    };

    return (
        <div className={`de-card ${gradientClass}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-white text-4xl font-bold mb-2">{name}</h2>
                    <p className="text-white text-sm mb-4">TOEIC® GRAMMAR</p>
                </div>
                <button 
                    onClick={toggleExpand}
                    className="text-white text-2xl mt-2"
                >
                    <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
            </div>
            
            <div className="de-card-content">
                <div>
                    <ul className="text-gray-600 mb-4">
                        {stats.map((item, index) => (
                            <li key={index} className="flex items-center mb-2">
                                <i className={`fas ${item.icon} text-orange-500 mr-2`}></i>
                                {item.value}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <div className="flex items-center mb-2">
                        <div className="de-progress-bar">
                            <div className="de-progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <p className="text-green-500 text-sm">{progress === 4 ? '1/26' : '0/26'} bài hoàn thành</p>
                </div>
                
                {isExpanded && (
                    <div className="slide-animate mt-4 border-t pt-4">
                        <h4 className="font-bold mb-2">Danh sách bài tập:</h4>
                        <ul className="space-y-2">
                            {exercises && exercises.map((exercise, index) => (
                                <li 
                                    key={index} 
                                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-all"
                                    onClick={(e) => handleExerciseClick(e, exercise)}
                                >
                                    <i className="far fa-file-alt mr-2 text-orange-500"></i>
                                    Bài tập {index + 1}: {exercise.exerciseName}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

// Update the VocabularyCard component similarly
const VocabularyCard = ({ name, stats, progress, isExpanded, onToggle, gradientClass, exercises }) => {
    const navigate = useNavigate();

    const toggleExpand = (e) => {
        e.stopPropagation();
        onToggle(name); // Just pass the name to the parent handler
    };

    const handleExerciseClick = (e, exercise) => {
        e.stopPropagation();
        navigate(`/exercise/${exercise.id}`, {
            state: {
                topicId: exercise.vocabularyTopicId,
                topicName: name,
                topicType: 'Vocabulary'
            }
        });
    };

    return (
        <div className={`de-card ${gradientClass}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-white text-4xl font-bold mb-2">{name}</h2>
                    <p className="text-white text-sm mb-4">TOEIC® VOCABULARY</p>
                </div>
                <button 
                    onClick={toggleExpand}
                    className="text-white text-2xl mt-2"
                >
                    <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
            </div>
            
            <div className="de-card-content">
                <div>
                    <ul className="text-gray-600 mb-4">
                        {stats.map((item, index) => (
                            <li key={index} className="flex items-center mb-2">
                                <i className={`fas ${item.icon} text-orange-500 mr-2`}></i>
                                {item.value}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <div className="flex items-center mb-2">
                        <div className="de-progress-bar">
                            <div className="de-progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <p className="text-green-500 text-sm">{progress === 4 ? '1/26' : '0/26'} bài hoàn thành</p>
                </div>
                
                {isExpanded && (
                    <div className="slide-animate mt-4 border-t pt-4">
                        <h4 className="font-bold mb-2">Danh sách bài tập:</h4>
                        <ul className="space-y-2">
                            {exercises && exercises.map((exercise, index) => (
                                <li 
                                    key={index} 
                                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-all"
                                    onClick={(e) => handleExerciseClick(e, exercise)}
                                >
                                    <i className="far fa-file-alt mr-2 text-orange-500"></i>
                                    Bài tập {index + 1}: {exercise.exerciseName}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

// ===== MODIFY THE MAIN COMPONENT =====

const ExerciseList = () => {
    const [activeTab, setActiveTab] = useState('grammar');
    
    // Single string state to track the currently expanded topic
    const [expandedTopicName, setExpandedTopicName] = useState(null);
    
    const [grammarTopics, setGrammarTopics] = useState([]);
    const [vocabularyTopics, setVocabularyTopics] = useState([]);
    const [loading, setLoading] = useState({
        grammar: true,
        vocabulary: true
    });
    const [error, setError] = useState({
        grammar: null,
        vocabulary: null
    });

    const gradientClasses = [
        'de-1-gradient',
        'de-2-gradient',
        'de-3-gradient',
        'de-4-gradient',
        'de-5-gradient',
        'de-6-gradient',
        'de-7-yellow-gradient',
        'de-7-blue-gradient',
        'de-7-green-gradient'
    ];

    useEffect(() => {
        const fetchGrammarTopics = async () => {
            try {
                const topics = await GrammarTopicService.getAllGrammarTopics();
                const topicsWithExercises = await Promise.all(
                    topics.map(async (topic, index) => {
                        const exercises = await GrammarTopicService.getExercisesForGrammarTopic(topic.id);
                        return {
                            name: topic.title,
                            stats: [
                                { icon: 'fa-file-alt', value: `${exercises.length} bài tập` },
                                { icon: 'fa-eye', value: '50742 lượt xem' }
                            ],
                            progress: 4,
                            gradientClass: gradientClasses[index % gradientClasses.length],
                            exercises: exercises
                        };
                    })
                );
                setGrammarTopics(topicsWithExercises);
                setLoading(prev => ({ ...prev, grammar: false }));
            } catch (err) {
                setError(prev => ({ ...prev, grammar: 'Không thể tải danh sách chủ đề ngữ pháp' }));
                setLoading(prev => ({ ...prev, grammar: false }));
                console.error('Error:', err);
            }
        };

        const fetchVocabularyTopics = async () => {
            try {
                const topics = await VocabularyTopicService.getAllVocabularyTopics();
                const topicsWithExercises = await Promise.all(
                    topics.map(async (topic, index) => {
                        const exercises = await VocabularyTopicService.getExercisesForVocabularyTopic(topic.id);
                        return {
                            name: topic.title,
                            stats: [
                                { icon: 'fa-file-alt', value: `${exercises.length} bài tập` },
                                { icon: 'fa-eye', value: '71350 lượt xem' }
                            ],
                            progress: 4,
                            gradientClass: gradientClasses[index % gradientClasses.length],
                            exercises: exercises
                        };
                    })
                );
                setVocabularyTopics(topicsWithExercises);
                setLoading(prev => ({ ...prev, vocabulary: false }));
            } catch (err) {
                setError(prev => ({ ...prev, vocabulary: 'Không thể tải danh sách chủ đề từ vựng' }));
                setLoading(prev => ({ ...prev, vocabulary: false }));
                console.error('Error:', err);
            }
        };

        // Reset expanded topic when switching tabs
        setExpandedTopicName(null);

        if (activeTab === 'grammar') {
            fetchGrammarTopics();
        } else {
            fetchVocabularyTopics();
        }
    }, [activeTab]);

    // Simplified toggle function - if already expanded, close it. Otherwise expand it.
    const handleToggle = (topicName) => {
        console.log('Toggle called with:', topicName);
        console.log('Current expanded topic:', expandedTopicName);
        
        if (expandedTopicName === topicName) {
            setExpandedTopicName(null);
        } else {
            setExpandedTopicName(topicName);
        }
    };

    if (loading.grammar && activeTab === 'grammar') return (
        <LoadingSpinner />
    );

    if (loading.vocabulary && activeTab === 'vocabulary') return (
        <LoadingSpinner />
    );
    
    if (error.grammar && activeTab === 'grammar') return <div className="text-center mt-8 text-red-500">{error.grammar}</div>;
    if (error.vocabulary && activeTab === 'vocabulary') return <div className="text-center mt-8 text-red-500">{error.vocabulary}</div>;

    return (
        <>
            <Header />
            <div>
                <div className="de-nav-tabs">
                    <div className="de-tab-container">
                        <a 
                            href="#" 
                            className={`de-tab-item ${activeTab === 'grammar' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveTab('grammar');
                            }}
                        >
                            Ngữ pháp
                        </a>
                        <a 
                            href="#" 
                            className={`de-tab-item ${activeTab === 'vocabulary' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveTab('vocabulary');
                            }}
                        >
                            Từ vựng
                        </a>
                    </div>
                </div>

                {activeTab === 'grammar' && (
                    <div className="de-container-wrapper">
                        <h1 className="de-section-title">Luyện Ngữ Pháp</h1>
                        <div className="de-grid-listening">
                            {grammarTopics.map((item, index) => (
                                <GrammarCard 
                                    key={index} 
                                    {...item} 
                                    isExpanded={expandedTopicName === item.name}
                                    onToggle={handleToggle}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'vocabulary' && (
                    <div className="de-container-wrapper">
                        <h1 className="de-section-title">Luyện Từ Vựng</h1>
                        <div className="de-grid-reading">
                            {vocabularyTopics.map((item, index) => (
                                <VocabularyCard 
                                    key={index} 
                                    {...item} 
                                    isExpanded={expandedTopicName === item.name}
                                    onToggle={handleToggle}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default ExerciseList;