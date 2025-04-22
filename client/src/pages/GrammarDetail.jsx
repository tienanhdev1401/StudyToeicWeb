import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaComment, FaPaperPlane } from 'react-icons/fa';
import '../styles/GrammarDetail.css'; 
import Header from '../components/Header';
import Footer from '../components/Footer';
import GrammarTopicService from '../services/grammarTopicService';
import CommentService from '../services/commentService';
import { useAuth } from '../context/AuthContext';

const GrammarDetail = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch grammar topic
                const topicData = await GrammarTopicService.getGrammarTopicById(topicId);
                setTopic(topicData);
                
                // Fetch comments
                const commentsResponse = await CommentService.getCommentsByGrammarTopicId(topicId);
                setComments(commentsResponse.data);
                console.log(commentsResponse)
                
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error('Error fetching data:', err);
            }
        };

        fetchData();
    }, [topicId]);

    const handlePracticeClick = async () => {
        if (!topic) return;
        
        try {
            const exercises = await GrammarTopicService.getExercisesForGrammarTopic(topicId);
            
            if (exercises.length === 0) {
                alert('Không có bài tập cho chủ đề này');
                return;
            }
    
            navigate(`/exercise/${exercises[0].id}`, {
                state: {
                    topicId: topic.id,
                    topicName: topic.title,
                    topicType: 'Grammar'
                }
            });
        } catch (error) {
            console.error('Error fetching exercises:', error);
            alert('Lỗi khi tải bài tập');
        }
    };

    const handleCommentSubmit = async (e) => {
        // e.preventDefault();
        // if (!newComment.trim() || !user) return;
        
        // setCommentLoading(true);
        // try {
        //     const commentData = {
        //         content: newComment,
        //         userId: user.id,
        //         GrammarTopicId: topicId
        //     };
            
        //     // In a real app, you would use CommentService.createComment
        //     // This is a mock implementation
        //     const response = await CommentService.createComment(commentData);
            
        //     if (response.success) {
        //         setComments([response.data, ...comments]);
        //         setNewComment('');
        //     }
        // } catch (error) {
        //     console.error('Error submitting comment:', error);
        //     alert('Lỗi khi gửi bình luận');
        // } finally {
        //     setCommentLoading(false);
        // }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
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
                    <div className="grammar-content-wrapper">
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
                    
                    

                    {/* Comments Section */}
                    <div className="comments-section">
                        <h3 className="comments-title">
                            <FaComment /> Bình luận ({comments.length})
                        </h3>
                        
                        {user && (
                            <form onSubmit={handleCommentSubmit} className="comment-form">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Viết bình luận của bạn..."
                                    className="comment-input"
                                    rows="3"
                                    required
                                />
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
                            </form>
                        )}

                        <div className="comments-list">
                            {comments.length === 0 ? (
                                <p className="no-comments">Chưa có bình luận nào</p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="comment-item">
                                        <div className="comment-header">
                                            <span className="comment-author">
                                                {comment.userId || 'Người dùng ẩn danh'}
                                            </span>
                                            <span className="comment-date">
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                        <div className="comment-content">
                                            {comment.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default GrammarDetail;