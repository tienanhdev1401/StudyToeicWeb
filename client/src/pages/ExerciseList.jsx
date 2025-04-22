import React, { useState, useEffect } from 'react';
import '../styles/ExerciseList.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import GrammarTopicService from '../services/grammarTopicService';
import VocabularyTopicService from '../services/vocabularyTopicService'

const GrammarCard = ({ name, stats, progress, isExpanded, onToggle, gradientClass, exercises }) => {
    const navigate = useNavigate();

    const toggleExpand = (e) => {
        e.stopPropagation();
        onToggle(name);
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
                    <div className="mt-4 border-t pt-4">
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

const VocabularyCard = ({ part, stats, progress, isExpanded, onToggle }) => {
    const navigate = useNavigate();
    
    const handlePartClick = () => {
        navigate(`/toeic-exercise/part-${part.split('-')[1]}`);
    };
    
    const toggleExpand = (e) => {
        e.stopPropagation();
        onToggle(part);
    };
  
    return (
      <div 
        className={`de-card ${part} cursor-pointer`} 
        onClick={handlePartClick}
      >
        <div>
          <h2 className="text-8xl font-bold text-white mb-2">Part {part.split('-')[1]}</h2>
          <p className="text-white text-opacity-75 mb-4">TOEIC® VOCABULARY</p>
        </div>
        <div className="de-card-content">
          <div>
            {stats.map((item, index) => (
              <p key={index} className="text-gray-700 mb-2">
                <i className={`fas ${item.icon} text-orange-500 mr-2`}></i>
                {item.value}
              </p>
            ))}
          </div>
          <div>
            <div className="flex items-center mb-2">
              <div className="de-progress-bar">
                <div className="de-progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            <p className="text-green-500 font-bold">{progress === 4 ? '1/26' : '0/26'} bài hoàn thành</p>
            
            <button 
                onClick={toggleExpand}
                className="mt-4 flex items-center justify-between w-full text-orange-500 bg-orange-50 px-4 py-2 rounded-lg"
            >
                <span>1 TEST ĐẦU VÀO</span>
                <div className="flex items-center">
                    <span className="text-gray-600 mr-4">13.348 lượt hoàn thành</span>
                    <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </div>
            </button>
            
            {isExpanded && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold mb-3 text-lg">TEST ĐẦU VÀO (3)</h4>
                    <ul className="space-y-3">
                        <li className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <i className="far fa-file-alt mr-3 text-orange-500"></i>
                                <span>Bài kiểm tra 1</span>
                            </div>
                            <span className="text-gray-500">30 câu hỏi</span>
                        </li>
                        <li className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <i className="far fa-file-alt mr-3 text-orange-500"></i>
                                <span>Bài kiểm tra 2</span>
                            </div>
                            <span className="text-gray-500">30 câu hỏi</span>
                        </li>
                        <li className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <i className="far fa-file-alt mr-3 text-orange-500"></i>
                                <span>Bài kiểm tra 3</span>
                            </div>
                            <span className="text-gray-500">30 câu hỏi</span>
                        </li>
                    </ul>
                </div>
            )}
          </div>
        </div>
      </div>
    );
};

const ExerciseList = () => {
    const [activeTab, setActiveTab] = useState('grammar');
    const [expandedId, setExpandedId] = useState(null);
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

        if (activeTab === 'grammar') {
            fetchGrammarTopics();
        } else {
            fetchVocabularyTopics();
        }
    }, [activeTab]);

    const handleToggle = (topicName) => {
        setExpandedId(expandedId === topicName ? null : topicName);
    };

    if (loading.grammar && activeTab === 'grammar') return (
        <div id="preloader-active">
            <div className="preloader d-flex align-items-center justify-content-center">
                <div className="preloader-inner position-relative">
                    <div className="preloader-circle"></div>
                    <div className="preloader-img pere-text">
                        <img src="assets/img/logo/loder.png" alt=""/>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading.vocabulary && activeTab === 'vocabulary') return (
        <div id="preloader-active">
            <div className="preloader d-flex align-items-center justify-content-center">
                <div className="preloader-inner position-relative">
                    <div className="preloader-circle"></div>
                    <div className="preloader-img pere-text">
                        <img src="assets/img/logo/loder.png" alt=""/>
                    </div>
                </div>
            </div>
        </div>
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
                            onClick={() => setActiveTab('grammar')}
                        >
                            Ngữ pháp
                        </a>
                        <a 
                            href="#" 
                            className={`de-tab-item ${activeTab === 'vocabulary' ? 'active' : ''}`}
                            onClick={() => setActiveTab('vocabulary')}
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
                                    isExpanded={expandedId === item.name}
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
                                <GrammarCard 
                                    key={index} 
                                    {...item} 
                                    isExpanded={expandedId === item.name}
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