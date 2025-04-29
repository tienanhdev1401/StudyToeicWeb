import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaComment, FaPaperPlane, FaEdit, FaTrash } from 'react-icons/fa';
import '../styles/GrammarDetail.css'; 
import Header from '../components/Header';
import Footer from '../components/Footer';
import GrammarTopicService from '../services/grammarTopicService';
import CommentService from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

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
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch grammar topic
                const topicData = await GrammarTopicService.getGrammarTopicById(topicId);
                setTopic(topicData);
                
                // Fetch comments
                const commentsResponse = await CommentService.getCommentsByGrammarTopicId(topicId);
                setComments(commentsResponse.data);
                
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

            const randomIndex = Math.floor(Math.random() * exercises.length);
            const randomExercise = exercises[randomIndex];
            navigate(`/exercise/${randomExercise.id}`, {
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
                GrammarTopicId: parseInt(topicId)
            };
            
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
            </div>
            <Footer />
        </>
    );
};

export default GrammarDetail;