import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WordNoteService from '../services/wordNoteService';
import VocabularyTopicService from '../services/vocabularyTopicService';
import { FaPlus, FaTrash, FaBook, FaSearch } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/WordNoteDetail.css';

const WordNoteDetail = () => {
    const { wordNoteId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [wordNote, setWordNote] = useState(null);
    const [vocabularies, setVocabularies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddVocabModal, setShowAddVocabModal] = useState(false);
    const [selectedVocabularies, setSelectedVocabularies] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [vocabularyTopics, setVocabularyTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);

    useEffect(() => {
        fetchWordNoteDetails();
        fetchVocabularyTopics();
    }, [user, wordNoteId]);

    const fetchVocabularyTopics = async () => {
        try {
            const response = await VocabularyTopicService.getAllVocabularyTopics();
            if (response) {
                setVocabularyTopics(response);
                if (response.length > 0) {
                    setSelectedTopic(response[0]);
                    handleTopicChange(response[0]);
                }
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách chủ đề:', error);
        }
    };

    const handleTopicChange = async (topic) => {
        setSelectedTopic(topic);
        try {
            const response = await VocabularyTopicService.getVocabularyTopicById(topic.id);
            if (response && response.vocabularies) {
                setSearchResults(response.vocabularies);
                setSelectedVocabularies([]);
            }
        } catch (error) {
            console.error('Lỗi khi lấy từ vựng theo chủ đề:', error);
        }
    };

    const fetchWordNoteDetails = async () => {
        if (!user || !user.id) {
            console.log('Không có user.id');
            return;
        }
        
        try {
            // setLoading(true);
            const response = await WordNoteService.getWordNoteById(wordNoteId);
            console.log(response);
            
            if (response && response.data) {
                setWordNote(response.data);
                setVocabularies(response.data.vocabularies || []);
                console.log('Data fetched:', response.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết ghi chú:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVocabulary = (vocab) => {
        setSelectedVocabularies(prev => {
            // Kiểm tra xem từ vựng đã được chọn chưa
            const isSelected = prev.some(item => item.id === vocab.id);
            
            if (isSelected) {
                // Nếu đã chọn, loại bỏ khỏi danh sách
                return prev.filter(item => item.id !== vocab.id);
            } else {
                // Nếu chưa chọn, thêm vào danh sách
                return [...prev, vocab];
            }
        });
    };

    const handleAddVocabularies = async () => {
        if (selectedVocabularies.length === 0) return;
        
        try {
            const addedVocabularies = [];
            const existingVocabularies = [];
            
            // Thêm từng từ vựng vào ghi chú
            for (const vocab of selectedVocabularies) {
                // Kiểm tra xem từ vựng đã tồn tại trong ghi chú chưa
                const alreadyExists = vocabularies.some(v => v.id === vocab.id);
                
                if (!alreadyExists) {
                    try {
                        await WordNoteService.addVocabularyToWordNote(wordNoteId, vocab.id);
                        addedVocabularies.push(vocab);
                    } catch (error) {
                        // Bỏ qua lỗi duplicate entry
                        if (!error.message?.includes('Duplicate entry')) {
                            console.error(`Lỗi khi thêm từ vựng ${vocab.content}:`, error);
                        } else {
                            existingVocabularies.push(vocab);
                        }
                    }
                } else {
                    existingVocabularies.push(vocab);
                }
            }
            
            // Hiển thị thông báo
            let message = '';
            if (addedVocabularies.length > 0) {
                message = `Đã thêm ${addedVocabularies.length} từ vựng vào ghi chú.\n`;
                // Cập nhật danh sách với những từ vựng thêm thành công
                setVocabularies(prev => [...prev, ...addedVocabularies]);
            } 
            
            if (existingVocabularies.length > 0) {
                message += `Từ vựng đã tồn tại trong ghi chú:\n`;
                // Thêm danh sách từ vựng đã tồn tại
                existingVocabularies.forEach((vocab, index) => {
                    message += `${index + 1}. ${vocab.content} (${vocab.meaning})\n`;
                });
            }
            
            if (message) {
                // Hiển thị alert thay vì notification
                window.alert(message);
            }
            
            // Đóng modal và reset
            setShowAddVocabModal(false);
            setSelectedVocabularies([]);
            setSearchResults([]);
            setSearchTerm('');
        } catch (error) {
            console.error('Lỗi khi thêm các từ vựng:', error);
        }
    };

    const handleRemoveVocabulary = async (vocabularyId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa từ vựng này khỏi ghi chú?')) {
            try {
                await WordNoteService.removeVocabularyFromWordNote(wordNoteId, vocabularyId);
                setVocabularies(prev => prev.filter(v => v.id !== vocabularyId));
            } catch (error) {
                console.error('Lỗi khi xóa từ vựng khỏi ghi chú:', error);
            }
        }
    };

    const filteredVocabularies = vocabularies.filter(vocab => 
        vocab.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const parseSynonym = (synonymString) => {
        try {
            if (!synonymString) return [];
            
            // Kiểm tra xem đã là mảng chưa
            if (Array.isArray(synonymString)) {
                return synonymString;
            }
            
            // Kiểm tra xem có phải là chuỗi JSON hợp lệ không
            if (synonymString.startsWith('[') && synonymString.endsWith(']')) {
                return JSON.parse(synonymString);
            }
            
            // Nếu là chuỗi thông thường, xử lý như một từ đơn
            return [synonymString];
        } catch (e) {
            console.error('Lỗi khi parse synonym:', e);
            // Trả về dưới dạng mảng chứa chuỗi gốc nếu không thể parse
            return synonymString ? [synonymString] : [];
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="wordnote-detail-loading">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="wordnote-detail-container">
                <div className="wordnote-detail-header">
                    <div className="wordnote-detail-title">
                        <div className="wordnote-detail-name">
                            <h1>
                                <FaBook className="wordnote-detail-icon" /> 
                                {wordNote?.title}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="wordnote-detail-actions">
                    <div className="wordnote-detail-search-bar">
                        <FaSearch className="wordnote-detail-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm từ vựng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        className="wordnote-detail-add-btn"
                        onClick={() => setShowAddVocabModal(true)}
                    >
                        <FaPlus /> Thêm từ vựng
                    </button>
                </div>

                <div className="wordnote-detail-content">
                    {filteredVocabularies.length === 0 ? (
                        <div className="wordnote-detail-empty">
                            <FaBook className="wordnote-detail-empty-icon" />
                            <p>Chưa có từ vựng nào trong ghi chú này!</p>
                        </div>
                    ) : (
                        <div className="wordnote-detail-vocabulary-list">
                            {filteredVocabularies.map(vocabulary => (
                                <div key={vocabulary.id} className="wordnote-detail-vocabulary-card">
                                    <div className="wordnote-detail-vocabulary-content">
                                        <div className="wordnote-detail-vocabulary-header">
                                            <h3 className="wordnote-detail-vocabulary-word">{vocabulary.content}</h3>
                                            <span className="wordnote-detail-vocabulary-transcribe">{vocabulary.transcribe}</span>
                                        </div>
                                        <p className="wordnote-detail-vocabulary-meaning">{vocabulary.meaning}</p>
                                        
                                        {vocabulary.synonym && (
                                            <div className="wordnote-detail-vocabulary-synonyms">
                                                <span className="wordnote-detail-synonym-label">Đồng nghĩa: </span>
                                                <div className="wordnote-detail-synonym-tags">
                                                    {parseSynonym(vocabulary.synonym).map((syn, index) => (
                                                        <span key={index} className="wordnote-detail-synonym-tag">{syn}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {vocabulary.urlImage && (
                                            <div className="wordnote-detail-vocabulary-image">
                                                <img src={vocabulary.urlImage} alt={vocabulary.content} />
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        className="wordnote-detail-icon-button wordnote-detail-delete-icon"
                                        onClick={() => handleRemoveVocabulary(vocabulary.id)}
                                        title="Xóa khỏi ghi chú"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showAddVocabModal && (
                    <div className="wordnote-detail-modal-overlay">
                        <div className="wordnote-detail-modal-content">
                            <div className="wordnote-detail-modal-header">
                                <button 
                                    className="wordnote-detail-btn-close"
                                    onClick={() => {
                                        setShowAddVocabModal(false);
                                        setSelectedVocabularies([]);
                                        setSearchResults([]);
                                        setSearchTerm('');
                                    }}
                                >
                                    ✕
                                </button>
                                <h2>Thêm từ đã có ({selectedVocabularies.length})</h2>
                                <button 
                                    className="wordnote-detail-btn-confirm"
                                    onClick={handleAddVocabularies}
                                    disabled={selectedVocabularies.length === 0}
                                >
                                    ✓
                                </button>
                            </div>

                            <div className="wordnote-detail-filter-section">
                                <select 
                                    className="wordnote-detail-form-select"
                                    value={selectedTopic?.id || ''}
                                    onChange={(e) => {
                                        const topic = vocabularyTopics.find(t => t.id === parseInt(e.target.value));
                                        if (topic) handleTopicChange(topic);
                                    }}
                                >
                                    {vocabularyTopics.map(topic => (
                                        <option key={topic.id} value={topic.id}>
                                            {topic.topicName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="wordnote-detail-topic-name">
                                <div>{selectedTopic?.topicName}</div>
                            </div>

                            <div className="wordnote-detail-vocabulary-search-results">
                                {searching ? (
                                    <div className="text-center p-3">
                                        <div className="spinner-border spinner-border-sm" role="status">
                                            <span className="visually-hidden">Đang tìm kiếm...</span>
                                        </div>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <p className="text-center text-muted p-3">
                                        Không có từ vựng trong chủ đề này
                                    </p>
                                ) : (
                                    searchResults.map(vocab => (
                                        <div key={vocab.id} className="wordnote-detail-vocabulary-item">
                                            <div className="wordnote-detail-vocab-checkbox">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedVocabularies.some(item => item.id === vocab.id)}
                                                    onChange={() => handleToggleVocabulary(vocab)}
                                                />
                                            </div>
                                            <div 
                                                className="wordnote-detail-vocab-content"
                                                onClick={() => handleToggleVocabulary(vocab)}
                                            >
                                                <h4>{vocab.content}</h4>
                                                <p className="transcribe">{vocab.transcribe}</p>
                                                <p className="meaning">{vocab.meaning}</p>
                                            </div>
                                            <button className="wordnote-detail-btn-star">
                                                <span>☆</span>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default WordNoteDetail; 