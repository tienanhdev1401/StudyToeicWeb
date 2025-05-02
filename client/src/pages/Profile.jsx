import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaRegCalendarAlt, FaRegEnvelope, FaPhoneAlt, FaLock, FaBars, FaChartLine, FaRegCheckCircle, FaUserEdit, FaRegClock, FaMedal, FaCrown, FaHistory, FaCamera } from 'react-icons/fa';
import '../styles/Profile.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import PasswordChangePopup from '../components/PasswordChangePopup';
import userService from '../services/userService';
import { getLearningGoalByLearnerId, createLearningGoal, updateLearningGoal } from '../services/learningGoalService';
import learningProcessService from '../services/learningProcessService';
import GrammarTopicService from '../services/grammarTopicService';
import VocabularyTopicService from '../services/vocabularyTopicService';
import TestService from '../services/TestService';

const ProfilePage = () => {
    const { isLoggedIn, logout, refreshToken } = useAuth();
    const { user, loading: userLoading, initialized, fetchUserProfile } = useUser();
    const navigate = useNavigate();
    const [isPasswordPopupOpen, setIsPasswordPopupOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [learningGoal, setLearningGoal] = useState(null);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [editedGoal, setEditedGoal] = useState(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);

    // Handle token expiration
    const handleTokenRefresh = async () => {
        try {
            await refreshToken();
            return true;
        } catch (error) {
            console.error('Không thể làm mới token:', error);
            logout();
            navigate('/login');
            return false;
        }
    };

    useEffect(() => {
        if (initialized && !userLoading) {
            if (!isLoggedIn) {
                const token = localStorage.getItem('token');
                if (token) {
                    handleTokenRefresh();
                } else {
                    navigate('/login');
                }
            } else {
                fetchUserProfile();
                setLoading(false);
            }
        }
    }, [isLoggedIn, userLoading, initialized, navigate]);

    useEffect(() => {
        if (user && !isEditing) {
            // Chỉ cập nhật editedUser khi user thay đổi VÀ không ở chế độ chỉnh sửa
            const userCopy = JSON.parse(JSON.stringify(user));
            
            // Đảm bảo giới tính được hiển thị đúng
            if (userCopy.gender === null || userCopy.gender === undefined) {
                userCopy.gender = '';
            }
            
            setEditedUser(userCopy);
            setLoading(false);
        } else if (user && loading) {
            // Lần đầu load trang
            const userCopy = JSON.parse(JSON.stringify(user));
            console.log("User data loaded (initial):", userCopy);
            
            // Đảm bảo giới tính được hiển thị đúng
            if (userCopy.gender === null || userCopy.gender === undefined) {
                userCopy.gender = '';
            }
            
            setEditedUser(userCopy);
            setLoading(false);
        }
    }, [user, isEditing, loading]);

    useEffect(() => {
        const fetchLearningGoal = async () => {
            if (user && user.id) {
                try {
                    const response = await getLearningGoalByLearnerId(user.id);
                    if (response && response.success) {
                        setLearningGoal(response.data);
                    } else {
                        setLearningGoal(null);
                    }
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        setLearningGoal(null);
                    } else {
                        console.error(error);
                    }
                }
            }
        };
    
        fetchLearningGoal();
    }, [user]);
    
    useEffect(() => {
        // Cleanup preview URLs on unmount
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    useEffect(() => {
        const fetchRecentActivities = async () => {
            if (user && user.id) {
                try {
                    // Lấy tất cả learning processes
                    const processes = await learningProcessService.getAllLearningProcessByUserId(user.id);
                    
                    // Sắp xếp theo thời gian tạo mới nhất và lấy 3 cái gần nhất
                    const recentProcesses = processes
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 3);

                    // Lấy thông tin chi tiết cho từng process
                    const activitiesWithDetails = await Promise.all(
                        recentProcesses.map(async (process) => {
                            let details = null;

                            try {
                                if (process.VocabularyTopicId) {
                                    const vocabTopic = await VocabularyTopicService.getVocabularyTopicById(process.VocabularyTopicId);
                                    details = {
                                        type: 'vocabulary',
                                        name: vocabTopic.topicName,
                                        id: process.VocabularyTopicId
                                    };
                                } else if (process.GrammarTopicId) {
                                    const grammarTopic = await GrammarTopicService.getGrammarTopicById(process.GrammarTopicId);
                                    details = {
                                        type: 'grammar',
                                        name: grammarTopic.title,
                                        id: process.GrammarTopicId
                                    };
                                } else if (process.TestId) {
                                    const test = await TestService.getTestById(process.TestId);
                                    details = {
                                        type: 'test',
                                        name: test.title,
                                        id: process.TestId
                                    };
                                }

                                return {
                                    ...process,
                                    details
                                };
                            } catch (error) {
                                console.error('Error fetching details for process:', error);
                                return {
                                    ...process,
                                    details: {
                                        type: 'unknown',
                                        name: 'Không thể tải thông tin',
                                        id: null
                                    }
                                };
                            }
                        })
                    );

                    setRecentActivities(activitiesWithDetails);
                } catch (error) {
                    console.error('Error fetching recent activities:', error);
                }
            }
        };

        fetchRecentActivities();
    }, [user]);

    // Show loading spinner when loading data
    if (loading) {
        return (
            <>
                <Header />
                <div className="profile-container">
                    <div className="profile-loading">
                        <div className="profile-loading-spinner"></div>
                        <div className="profile-loading-text">Đang tải thông tin...</div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Return null if no user after loading
    if (!user) {
        return null;
    }

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const openPasswordPopup = () => {
        setIsPasswordPopupOpen(true);
    };

    const closePasswordPopup = () => {
        setIsPasswordPopupOpen(false);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const maxSize = 5 * 1024 * 1024; // ảnh max 5mb

            if (!validTypes.includes(file.type)) {
                alert('Chỉ chấp nhận file ảnh JPG, PNG hoặc GIF');
                return;
            }

            if (file.size > maxSize) {
                alert('Kích thước file không được vượt quá 5MB');
                return;
            }

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            
            // Save file for later upload
            setEditedUser(prev => ({
                ...prev,
                newAvatarFile: file
            }));
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing - reset to original values
            setImagePreview(null);
            
            // Đảm bảo sao chép tất cả thuộc tính của user
            const userCopy = JSON.parse(JSON.stringify(user));
            setEditedUser(userCopy);
            setIsEditing(false);
        } else {
            // Start editing - ensure we have the latest user data in the form
            
            // Sao chép từ state hiện tại, không gọi lại dữ liệu từ server
            // Điều này để tránh việc ghi đè dữ liệu đang nhập
            if (!editedUser) {
                const userCopy = JSON.parse(JSON.stringify(user));
                
                // Đảm bảo giới tính được hiển thị đúng
                if (userCopy.gender === null || userCopy.gender === undefined) {
                    userCopy.gender = '';
                }
                
                setEditedUser(userCopy);
            }
            
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        setIsSavingProfile(true);
        try {
            console.log("Saving profile with data:", editedUser);
            await userService.updateProfile(editedUser);
            setIsEditing(false);
            await fetchUserProfile();
            
            // Clean up image preview
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
                setImagePreview(null);
            }
            alert('Cập nhật thông tin thành công!');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleInputChange = (field, value) => {
        console.log(`Changing ${field} to:`, value);
        
        if (field === 'gender') {
            console.log("Cập nhật giới tính:", value);
        }
        
        setEditedUser(prev => {
            if (!prev) return { [field]: value };
            
            const updated = {
                ...prev,
                [field]: value
            };
            console.log("Updated user data:", updated);
            return updated;
        });
    };

    const handleGoalEdit = () => {
        setIsEditingGoal(true);
        setEditedGoal({ ...learningGoal });
    };

    const handleGoalChange = (field, value) => {
        // Allow empty input to clear the field
        if (value === '') {
            setEditedGoal(prev => ({
                ...prev,
                [field]: ''
            }));
            return;
        }

        const numValue = Number(value);

        // Basic type check
        if (isNaN(numValue) || !Number.isInteger(numValue)) {
            return; 
        }

        // Apply constraints
        if (field === 'duration') {
            if (numValue >= 30) {
                setEditedGoal(prev => ({
                    ...prev,
                    [field]: numValue
                }));
            } else if (value.length <= String(numValue).length && numValue >= 0 && numValue < 30) {
                setEditedGoal(prev => ({ ...prev, [field]: value }));
            } else if (numValue < 0) {
                return;
            }
        } else if (field === 'scoreTarget') {
            if (numValue >= 300 && numValue <= 990) {
                setEditedGoal(prev => ({
                    ...prev,
                    [field]: numValue
                }));
            } else if (value.length <= String(numValue).length && numValue >= 0 && numValue < 300) {
                setEditedGoal(prev => ({ ...prev, [field]: value }));
            } else if (numValue > 990 || numValue < 0) {
                return;
            }
        }
    };

    const handleGoalSave = async () => {
        // Validate before saving
        const finalDuration = Number(editedGoal.duration);
        const finalScoreTarget = Number(editedGoal.scoreTarget);

        if (isNaN(finalDuration) || !Number.isInteger(finalDuration) || finalDuration < 30) {
            alert('Thời gian phải là số nguyên từ 30 ngày trở lên.');
            return;
        }

        if (isNaN(finalScoreTarget) || !Number.isInteger(finalScoreTarget) || finalScoreTarget < 300 || finalScoreTarget > 990) {
            alert('Điểm mục tiêu phải là số nguyên từ 300 đến 990.');
            return;
        }

        try {
            let response;
            const goalData = {
                duration: finalDuration,
                scoreTarget: finalScoreTarget,
                learnerId: user.id
            };

            if (learningGoal) {
                response = await updateLearningGoal(learningGoal.id, goalData);
            } else {
                response = await createLearningGoal(goalData);
            }

            if (response.success) {
                setLearningGoal(response.data);
                setIsEditingGoal(false);
                alert(learningGoal ? 'Cập nhật mục tiêu thành công!' : 'Tạo mục tiêu thành công!');
            }
        } catch (error) {
            console.error('Error saving learning goal:', error);
            alert('Có lỗi xảy ra khi lưu mục tiêu học tập');
        }
    };

    // Calculate progress percentage if learning goal exists
    const calculateProgress = () => {
        if (!learningGoal) return 0;
        // Sample calculation - in reality would be based on actual progress
        return 35; // 35% progress for demo purposes
    };

    const renderRecentActivities = () => {
        return (
            <div className="recent-activities-section">
                <div className="activities-list">
                    {recentActivities.map((activity, index) => (
                        <div key={index} className="activity-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <div className="activity-icon" style={{ marginRight: '15px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e9ecef', borderRadius: '50%' }}>
                                {activity.details.type === 'vocabulary' && <i className="fas fa-book" style={{ color: '#4527A0' }}></i>}
                                {activity.details.type === 'grammar' && <i className="fas fa-pencil-alt" style={{ color: '#4527A0' }}></i>}
                                {activity.details.type === 'test' && <i className="fas fa-file-alt" style={{ color: '#4527A0' }}></i>}
                            </div>
                            <div className="activity-content" style={{ flex: 1 }}>
                                <div 
                                    className="activity-title" 
                                    style={{ 
                                        fontWeight: '500', 
                                        marginBottom: '5px',
                                        cursor: 'pointer',
                                        color: '#4527A0',
                                        textDecoration: 'none'
                                    }}
                                    onClick={() => {
                                        if (activity.details.type === 'vocabulary') {
                                            navigate(`/learn-vocabulary/${activity.details.id}`);
                                        } else if (activity.details.type === 'grammar') {
                                            navigate(`/learn-grammary/${activity.details.id}`);
                                        } else if (activity.details.type === 'test') {
                                            navigate(`/Stm_Quizzes/${activity.details.id}`);
                                        }
                                    }}
                                >
                                    {activity.details.name}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#6c757d' }}>
                                    <span>{activity.progressStatus === 'completed' ? 'Đã hoàn thành' : 'Đang học'}</span>
                                    <span>{new Date(activity.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <Header />
            <div className="profile-container">
                {/* Profile Header with Cover Photo and User Info */}
                <div className="profile-header">
                    <div className="profile-header-cover"></div>
                    <div className="profile-header-content">
                        <div className="profile-avatar-wrapper">
                            <img
                                src={imagePreview || user.avatar || '/assets/img/Placeholder-Profile-Image.jpg'}
                                alt="Profile"
                                className="profile-avatar"
                            />
                            {isEditing && (
                                <label className="profile-avatar-edit" htmlFor="avatar-upload">
                                    <FaCamera />
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>
                        <div className="profile-user-info">
                            <h1 className="profile-user-name">{user.fullName}</h1>
                            <p className="profile-user-title">TOEIC Learner</p>
                            <div className="profile-actions">
                                <button
                                    className={`profile-btn profile-btn-primary ${isSavingProfile ? 'is-loading' : ''}`}
                                    onClick={() => {
                                        if (isEditing) {
                                            handleSave();
                                        } else {
                                            handleEditToggle();
                                        }
                                    }}
                                    disabled={isSavingProfile}
                                >
                                    {isEditing ? (
                                        <>
                                            <FaRegCheckCircle className="profile-icon" />
                                            Lưu thông tin
                                        </>
                                    ) : (
                                        <>
                                            <FaUserEdit className="profile-icon" />
                                            Chỉnh sửa
                                        </>
                                    )}
                                </button>
                                <button className="profile-btn profile-btn-secondary" onClick={handleLogout}>
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="profile-content">
                    {/* Left Sidebar */}
                    <div className="profile-sidebar">
                        {/* Personal Information Card */}
                        <div className="profile-card">
                            <div className="profile-card-header">
                                <h3 className="profile-card-title">
                                    <FaUser className="profile-icon" /> Thông tin cá nhân
                                </h3>
                            </div>
                            <div className="profile-card-body">
                                <div className="profile-info-list">
                                    <div className="profile-info-item">
                                        <label className="profile-info-label">Họ tên</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="profile-info-edit"
                                                value={editedUser?.fullName || ''}
                                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
                                                autoComplete="off"
                                            />
                                        ) : (
                                            <div className="profile-info-value">{user.fullName || 'Chưa cập nhật'}</div>
                                        )}
                                    </div>
                                    <div className="profile-info-item">
                                        <label className="profile-info-label">Email</label>
                                        <div className="profile-info-value">{user.email || 'Chưa cập nhật'}</div>
                                    </div>
                                    <div className="profile-info-item">
                                        <label className="profile-info-label">Số điện thoại</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="profile-info-edit"
                                                value={editedUser?.phoneNumber || ''}
                                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                                style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
                                                autoComplete="off"
                                            />
                                        ) : (
                                            <div className="profile-info-value">{user.phoneNumber || 'Chưa cập nhật'}</div>
                                        )}
                                    </div>
                                    <div className="profile-info-item">
                                        <label className="profile-info-label">Giới tính</label>
                                        {isEditing ? (
                                            <div className="select-wrapper" style={{ position: 'relative', zIndex: 20 }}>
                                                <select
                                                    className="profile-info-edit"

                                                    value={editedUser?.gender || ''}
                                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                                    style={{ 
                                                        position: 'relative', 
                                                        zIndex: 20, 
                                                        pointerEvents: 'auto',
                                                        width: '100%'
                                                    }}
                                                >
                                                    <option value="">Chọn giới tính</option>
                                                    <option value="MALE">Nam</option>
                                                    <option value="FEMALE">Nữ</option>
                                                    <option value="other">Khác</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="profile-info-value">
                                                {user.gender === 'MALE' ? 'Nam' : 
                                                 user.gender === 'FEMALE' ? 'Nữ' : 
                                                 user.gender === 'other' ? 'Khác' : 'Chưa cập nhật'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="profile-info-item">
                                        <label className="profile-info-label">Ngày sinh</label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                className="profile-info-edit"
                                                value={editedUser?.dateOfBirth?.split('T')[0] || ''}
                                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
                                            />
                                        ) : (
                                            <div className="profile-info-value">
                                                {user.dateOfBirth && user.dateOfBirth !== '' ?
                                                new Date(user.dateOfBirth).toLocaleDateString() : 'Chưa cập nhật'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="profile-info-item">
                                        <label className="profile-info-label">Mật khẩu</label>
                                        <button className="profile-btn profile-btn-primary" onClick={openPasswordPopup} style={{width: '100%'}}>
                                            <FaLock className="profile-icon" /> Đổi mật khẩu
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Information Card */}
                        <div className="profile-card">
                            <div className="profile-card-header">
                                <h3 className="profile-card-title">
                                    <FaBars className="profile-icon" /> Thông tin tài khoản
                                </h3>
                            </div>
                            <div className="profile-card-body">
                                <div className="profile-info-list">
                                    <div className="profile-info-item">
                                        <label className="profile-info-label">Ngày tham gia</label>
                                        <div className="profile-info-value">
                                            <FaRegCalendarAlt style={{marginRight: '8px'}} />
                                            {user.joinAt ? new Date(user.joinAt).toLocaleDateString() : 'Không có dữ liệu'}
                                        </div>
                                    </div>
                                    <div className="profile-info-item">
                                        <label className="profile-info-label">Trạng thái tài khoản</label>
                                        <div className="profile-info-value">
                                            <span className="profile-badge success">{user.status || 'Active'}</span>
                                        </div>
                                    </div>
                                    <div className="profile-info-item">
                                        <label className="profile-info-label">Cập nhật cuối</label>
                                        <div className="profile-info-value">
                                            <FaRegClock style={{marginRight: '8px'}} />
                                            {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Không có dữ liệu'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="profile-main">
                        {/* Learning Statistics Card */}
                        <div className="profile-card">
                            <div className="profile-card-header">
                                <h3 className="profile-card-title">
                                    <FaChartLine className="profile-icon" /> Thống kê học tập
                                </h3>
                                <a href="/test-history" className="profile-btn profile-btn-primary" style={{padding: '8px 16px'}}>
                                    Xem lịch sử làm bài
                                </a>
                            </div>
                            <div className="profile-card-body">
                                <div className="profile-stats-list">
                                    <div className="profile-stat-item">
                                        <div className="profile-stat-value">0/50</div>
                                        <p className="profile-stat-label">Chủ đề ngữ pháp</p>
                                    </div>
                                    <div className="profile-stat-item">
                                        <div className="profile-stat-value">0/100</div>
                                        <p className="profile-stat-label">Bài tập đã làm</p>
                                    </div>
                                    <div className="profile-stat-item">
                                        <div className="profile-stat-value">0</div>
                                        <p className="profile-stat-label">Điểm TOEIC</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Learning Goal Card */}
                        <div className="profile-card">
                            <div className="profile-card-header">
                                <h3 className="profile-card-title">
                                    <FaMedal className="profile-icon" /> Mục tiêu học tập
                                </h3>
                                {!isEditingGoal && learningGoal && (
                                    <button 
                                        className="profile-btn profile-btn-primary" 
                                        onClick={handleGoalEdit}
                                        style={{padding: '8px 16px'}}
                                    >
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>
                            <div className="profile-card-body">
                                {isEditingGoal ? (
                                    <div className="profile-goal-form">
                                        <div className="profile-form-group">
                                            <label>Thời gian (ngày)</label>
                                            <input
                                                type="text"
                                                className="profile-info-edit"
                                                value={editedGoal?.duration ?? ''}
                                                onChange={(e) => handleGoalChange('duration', e.target.value)}
                                                placeholder="Ít nhất 30 ngày"
                                            />
                                        </div>
                                        <div className="profile-form-group">
                                            <label>Điểm mục tiêu</label>
                                            <input
                                                type="text"
                                                className="profile-info-edit"
                                                value={editedGoal?.scoreTarget ?? ''}
                                                onChange={(e) => handleGoalChange('scoreTarget', e.target.value)}
                                                placeholder="Từ 300 đến 990"
                                            />
                                        </div>
                                        <div className="profile-form-actions">
                                            <button
                                                className="profile-btn profile-btn-primary"
                                                onClick={handleGoalSave}
                                                disabled={!editedGoal?.duration || !editedGoal?.scoreTarget}
                                            >
                                                {learningGoal ? 'Cập nhật mục tiêu' : 'Lưu mục tiêu'}
                                            </button>
                                            <button
                                                className="profile-btn profile-btn-secondary"
                                                onClick={() => {
                                                    setIsEditingGoal(false);
                                                    setEditedGoal(learningGoal || null);
                                                }}
                                            >
                                                Hủy bỏ
                                            </button>
                                        </div>
                                    </div>
                                ) : !learningGoal ? (
                                    <div className="profile-empty-state">
                                        <div className="profile-empty-icon"><FaCrown /></div>
                                        <p className="profile-empty-text">Bạn chưa thiết lập mục tiêu học tập</p>
                                        <button
                                            className="profile-btn profile-btn-primary"
                                            onClick={() => {
                                                setIsEditingGoal(true);
                                                setEditedGoal({
                                                    duration: '',
                                                    scoreTarget: '',
                                                    learnerId: user.id
                                                });
                                            }}
                                        >
                                            Thiết lập mục tiêu
                                        </button>
                                    </div>
                                ) : (
                                    <div className="profile-goal-progress">
                                        <div className="profile-goal-header">
                                            <h4 className="profile-goal-title">Tiến độ học tập</h4>
                                            <span>{calculateProgress()}%</span>
                                        </div>
                                        <div className="profile-progress-container">
                                            <div className="profile-progress-bar">
                                                <div 
                                                    className="profile-progress-fill" 
                                                    style={{ width: `${calculateProgress()}%` }}
                                                ></div>
                                            </div>
                                            <div className="profile-progress-stats">
                                                <span>0 điểm</span>
                                                <span>{learningGoal.scoreTarget} điểm</span>
                                            </div>
                                        </div>

                                        <div className="profile-goal-metrics">
                                            <div className="profile-goal-metric">
                                                <div className="profile-goal-metric-value">{learningGoal.duration}</div>
                                                <div className="profile-goal-metric-label">Số ngày mục tiêu</div>
                                            </div>
                                            <div className="profile-goal-metric">
                                                <div className="profile-goal-metric-value">{learningGoal.scoreTarget}</div>
                                                <div className="profile-goal-metric-label">Điểm TOEIC mục tiêu</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity Card */}
                        <div className="profile-card">
                            <div className="profile-card-header">
                                <h3 className="profile-card-title">
                                    <FaHistory className="profile-icon" /> Hoạt động gần đây
                                </h3>
                            </div>
                            <div className="profile-card-body">
                                {renderRecentActivities()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Popup */}
            <PasswordChangePopup
                isOpen={isPasswordPopupOpen}
                onClose={closePasswordPopup}
            />

            <Footer />
        </>
    );
};

export default ProfilePage;