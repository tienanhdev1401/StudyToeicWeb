import React, { useRef, useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/TopicDetail.css';
import { useNavigate, useParams } from 'react-router-dom';
import VocabularyTopicService from '../services/vocabularyTopicService';
import CommentService from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import { FaPlay, FaComment, FaPaperPlane, FaEdit, FaTrash } from 'react-icons/fa';

const TopicDetail = () => {

    const { topicSlug, topicId } = useParams();

    const [isFlipped, setIsFlipped] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [currentCard, setCurrentCard] = useState(0);
    const [topic, setTopic] = useState(topicId);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [flashCards, setFlashCards] = useState([]);
    const [termsData, setTermsData] = useState([]);
    const scrollContainerRef = useRef(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [relatedTopics, setRelatedTopics] = useState([]);
    const [loadingRelatedTopics, setLoadingRelatedTopics] = useState(false);
    const { user } = useAuth();

    const navigate = useNavigate();
    

    useEffect(() => {
        const fetchTopicData = async () => {
            try {
                const data = await VocabularyTopicService.getVocabularyTopicById(topicId);
                setTopic(data);
                
                // Process the data to create flashCards and termsData
                if (data && data.vocabularies && data.vocabularies.length > 0) {
                    // Convert vocabularies to flashCards format
                    const cards = data.vocabularies.map(vocab => ({
                        front: {
                            word: vocab.content || '',
                            audio: vocab.urlAudio || '',
                            image: vocab.urlImage || ''
                        },
                        back: {
                            definition: vocab.meaning || '',
                            pronunciation: vocab.transcribe || '',
                            example: vocab.synonym?.join(", ") || "",
                            synonyms: vocab.synonym || []
                        }
                    }));
                    setFlashCards(cards);
                    
                    // Convert vocabularies to termsData format
                    const terms = data.vocabularies.map(vocab => ({
                        question: vocab.content || '',
                        answer: vocab.meaning || '',
                        image: vocab.urlImage || '',
                        pronunciation: vocab.transcribe || '',
                        audioUrl: vocab.urlAudio || '',
                        isFavorite: false
                    }));
                    setTermsData(terms);
                }
                
                // Fetch comments
                const commentsResponse = await CommentService.getCommentsByVocabularyTopicId(topicId);
                setComments(commentsResponse.data);
                
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error("Error fetching topic data:", err);
            }
        };

        // Fetch related topics (all other vocabulary topics)
        const fetchRelatedTopics = async () => {
            setLoadingRelatedTopics(true);
            try {
                const allTopics = await VocabularyTopicService.getAllVocabularyTopics();
                // Filter out the current topic and transform to the format needed for studyCards
                const otherTopics = allTopics
                    .filter(t => t.id != topicId) // Use != instead of !== for possible string/number comparison
                    .map(topic => ({
                        id: topic.id,
                        title: topic.topicName,
                        image: topic.imageUrl,
                        button: true
                    }));
                
                setRelatedTopics(otherTopics);
            } catch (error) {
                console.error('Error fetching related topics:', error);
            } finally {
                setLoadingRelatedTopics(false);
            }
        };

        fetchTopicData();
        fetchRelatedTopics();
    }, [topicId]);

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
        if (!audioUrl) return;
        const audio = new Audio(audioUrl);
        audio.play().catch(error => console.log("Error playing audio:", error));
    };

    const handlePracticeClick = async () => {
        if (!topic) return;
        
        try {
            // First get the exercise for this grammar topic
            const exercises = await VocabularyTopicService.getExercisesForVocabularyTopic(topicId);
            
            if (exercises.length === 0) {
                alert('Không có bài tập cho chủ đề này');
                return;
            }
    
            // Navigate to exercise page with the first exercise
            navigate(`/exercise/${exercises[0].id}`, {
                state: {
                    topicId: topic.id,
                    topicName: topic.topicName,
                    topicType: 'Vocabulary'
                }
            });
        } catch (error) {
            console.error('Error fetching exercises:', error);
            alert('Lỗi khi tải bài tập');
        }
    };

    const handleTopicCardClick = (topicId) => {
        navigate(`/learn-vocabulary/${topicId}`);
    };

    // Xử lý bình luận
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        // Validate nội dung comment
        if (!newComment.trim()) {
            alert('Vui lòng nhập nội dung bình luận');
            return;
        }

        // Validate user đăng nhập
        if (!user) {
            alert('Vui lòng đăng nhập để bình luận');
            return;
        }
        
        setCommentLoading(true);
        try {
            const commentData = {
                content: newComment.trim(),
                userId: user.id,
                VocabularyTopicId: parseInt(topicId)
            };
            console.log(commentData);
            const response = await CommentService.createComment(commentData);
            
            if (response.success) {
                // Thêm comment mới vào đầu danh sách
                setComments([response.data, ...comments]);
                setNewComment(''); // Reset form
                alert('Thêm bình luận thành công');
            }
        } catch (error) {
            console.error('Lỗi khi thêm bình luận:', error);
            alert(error.response?.data?.message || 'Lỗi khi thêm bình luận');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleEditClick = (comment) => {
        setEditingComment(comment);
        setEditContent(comment.content);
    };

    const handleCancelEdit = () => {
        setEditingComment(null);
        setEditContent('');
    };

    const handleUpdateComment = async () => {
        if (!editContent.trim() || !editingComment) {
            alert('Vui lòng nhập nội dung bình luận');
            return;
        }
        
        setCommentLoading(true);
        try {
            // Tạo đối tượng comment cần cập nhật
            const commentToUpdate = {
                ...editingComment,
                content: editContent.trim(),
                updatedAt: new Date()
            };
            
            const response = await CommentService.updateComment(commentToUpdate);
            
            if (response.success) {
                // Cập nhật state comments với comment đã được cập nhật
                setComments(comments.map(c => 
                    c.id === editingComment.id ? response.data : c
                ));
                setEditingComment(null);
                setEditContent('');
                alert('Cập nhật bình luận thành công');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật bình luận:', error);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật bình luận');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
        
        try {
            const response = await CommentService.deleteComment(commentId);
            
            if (response.success) {
                // Xóa comment khỏi state
                setComments(comments.filter(c => c.id !== commentId));
                alert('Xóa bình luận thành công');
            }
        } catch (error) {
            console.error('Lỗi khi xóa bình luận:', error);
            alert(error.response?.data?.message || 'Lỗi khi xóa bình luận');
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!topic) return <div>No data found</div>;
    if (!flashCards || flashCards.length === 0) return <div>No flashcards available</div>;

    return (
        <div className="td-layout-container">
            <Header />

            <main className="td-main-content">
                <div className="td-content-container">
                    {/* Phần tiêu đề và nút hành động */}
                    <div className="td-header-section">
                        <h1 className="td-main-title">{topic.topicName}</h1>
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
                                <div key={index} className="td-feature-card" 
                                    onClick={handlePracticeClick}
                                    style={{ cursor: 'pointer' }}>
                                    <i className={`fas fa-${feature.icon} td-feature-icon`}></i>
                                    <span className="td-feature-label">{feature.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Phần thẻ lật - with safety checks */}
                    {flashCards.length > 0 && currentCard >= 0 && currentCard < flashCards.length && (
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
                                        {flashCards[currentCard].back.synonyms && flashCards[currentCard].back.synonyms.length > 0 && (
                                            <div className="td-example">
                                                <strong>Synonyms:</strong> {flashCards[currentCard].back.synonyms.join(', ')}
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
                    )}

                    {/* Điều khiển thẻ */}
                    {flashCards.length > 0 && (
                        <div className="td-card-navigation">
                            <button className="td-nav-btn">
                                <i className="fas fa-random td-nav-icon"></i>
                            </button>

                            <div className="td-pagination-controls">
                                <button
                                    className="td-nav-btn"
                                    onClick={() => setCurrentCard(prev => Math.max(0, prev - 1))}
                                    disabled={currentCard === 0}
                                >
                                    <i className="fas fa-arrow-left td-nav-icon"></i>
                                </button>
                                <span className="td-page-indicator">
                                    {currentCard + 1} / {flashCards.length}
                                </span>
                                <button
                                    className="td-nav-btn"
                                    onClick={() => setCurrentCard(prev => Math.min(flashCards.length - 1, prev + 1))}
                                    disabled={currentCard === flashCards.length - 1}
                                >
                                    <i className="fas fa-arrow-right td-nav-icon"></i>
                                </button>
                            </div>

                            <button className="td-nav-btn">
                                <i className="fas fa-expand td-nav-icon"></i>
                            </button>
                        </div>
                    )}

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
                                {loadingRelatedTopics ? (
                                    <div className="td-loading">Đang tải chủ đề liên quan...</div>
                                ) : relatedTopics.length === 0 ? (
                                    <div className="td-no-topics">Không có chủ đề liên quan</div>
                                ) : (
                                    relatedTopics.map((card, index) => (
                                        <div 
                                            key={index} 
                                            className="td-study-card" 
                                            onClick={() => handleTopicCardClick(card.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {card.image && (
                                                <div className="td-topic-image-container">
                                                    <img 
                                                        src={card.image} 
                                                        alt={card.title}
                                                        className="td-topic-image"
                                                    />
                                                </div>
                                            )}
                                            <div className="td-topic-content">
                                                <h3 className="td-card-title">{card.title}</h3>
                                                <button 
                                                    className="td-preview-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTopicCardClick(card.id);
                                                    }}
                                                >
                                                    Xem
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
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
                    {termsData.length > 0 && (
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
                                                        // Toggle favorite status for this term
                                                        const updatedTerms = [...termsData];
                                                        updatedTerms[index].isFavorite = !updatedTerms[index].isFavorite;
                                                        setTermsData(updatedTerms);
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
                    )}

                    {/* Comments Section */}
                    <div className="comments-section">
                        <h3 className="comments-title">
                            <FaComment /> Bình luận ({comments.length})
                        </h3>
                        
                        {user && (
                            <div className="comment-form">
                                {editingComment ? (
                                    <>
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            placeholder="Chỉnh sửa bình luận của bạn..."
                                            className="comment-input"
                                            rows="3"
                                            required
                                        />
                                        <div className="comment-form-buttons">
                                            <button 
                                                onClick={handleUpdateComment}
                                                className="submit-comment-button"
                                                disabled={commentLoading}
                                            >
                                                {commentLoading ? 'Đang xử lý...' : (
                                                    <>
                                                        <FaPaperPlane /> Cập nhật
                                                    </>
                                                )}
                                            </button>
                                            <button 
                                                onClick={handleCancelEdit}
                                                className="cancel-button"
                                                type="button"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <form onSubmit={handleCommentSubmit}>
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Viết bình luận của bạn..."
                                            className="comment-input"
                                            rows="3"
                                            required
                                        />
                                        <div className="comment-form-buttons">
                                            <button 
                                                type="submit"
                                                className="submit-comment-button"
                                                disabled={commentLoading}
                                            >
                                                {commentLoading ? 'Đang gửi...' : (
                                                    <>
                                                        <FaPaperPlane /> Gửi
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        <div className="comments-list">
                            {comments.length === 0 ? (
                                <p className="no-comments">Chưa có bình luận nào</p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="comment-item">
                                        <div className="comment-header">
                                            <div className="comment-user-info">
                                                <img 
                                                    src={comment.user.avatar} 
                                                    alt={comment.user.fullname}
                                                    className="comment-user-avatar"
                                                />
                                                <span className="comment-author">
                                                    {comment.user.fullname}
                                                </span>
                                            </div>
                                            <span className="comment-date">
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                        <div className="comment-content">
                                            {comment.content}
                                        </div>
                                        {user && user.id === comment.user.id && (
                                            <div className="comment-actions">
                                                <button 
                                                    onClick={() => handleEditClick(comment)}
                                                    className="edit-button"
                                                >
                                                    <FaEdit /> Chỉnh sửa
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="delete-button"
                                                >
                                                    <FaTrash /> Xóa
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// Dữ liệu mẫu cho thanh công cụ tính năng
const featuresData = [
    { label: 'Flashcards', icon: 'book' },
    { label: 'Learn', icon: 'sync-alt' },
    { label: 'Test', icon: 'file-alt' },
    { label: 'Match', icon: 'comments' }
];

export default TopicDetail;