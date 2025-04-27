import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';
import '../styles/Profile.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import PasswordChangePopup from '../components/PasswordChangePopup';
import userService from '../services/userService';
import { getLearningGoalByLearnerId, createLearningGoal, updateLearningGoal } from '../services/learningGoalService';

const ProfilePage = () => {
    const { isLoggedIn, logout } = useAuth();
    const { user, loading, initialized, fetchUserProfile } = useUser();
    const navigate = useNavigate();
    const [isPasswordPopupOpen, setIsPasswordPopupOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [learningGoal, setLearningGoal] = useState(null);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [editedGoal, setEditedGoal] = useState(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    console.log('TienAnh',user)

    useEffect(() => {
        if (initialized && !loading && !isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, loading, initialized, navigate]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user && user.id) {
                try {
                    const response = await fetch(`/api/users/${user.id}`);
                    const data = await response.json();
                    setUserProfile(data);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
        };

        if (user) {
            fetchUserProfile();
        }
    }, [user]);

    useEffect(() => {
        const fetchLearningGoal = async () => {
            if (user && user.id) {
                try {
                    const response = await getLearningGoalByLearnerId(user.id);
                    if (response.success) {
                        setLearningGoal(response.data);
                    }
                } catch (error) {
                    console.error('Error fetching learning goal:', error);
                }
            }
        };

        fetchLearningGoal();
    }, [user]);

    useEffect(() => {
        // Cleanup function để xóa URL preview khi component unmount
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Hiển thị loading spinner khi đang loading hoặc chưa initialized
    // if (loading || !initialized) {
    //     return (
    //         <>
    //             <Header />
    //             <div className="containerprofile">
    //                 <div className="loading-spinner">Loading...</div>
    //             </div>
    //             <Footer />
    //         </>
    //     );
    // }

    // Return null nếu không có user sau khi đã load xong
    if (!user) {
        return null;
    }

    const handleLogout = () => {
        logout();
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
                alert('Kích thước file không được vượt quá 16MB');
                return;
            }

            // Tạo preview URL cho ảnh
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            
            // Lưu file để đợi upload khi save
            console.log('File to upload:', file);
            setEditedUser(prev => ({
                ...prev,
                newAvatarFile: file
            }));
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setImagePreview(null);
            setEditedUser({ ...user });
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        setIsSavingProfile(true); // Start loading
        try {
            console.log('Saving profile with editedUser:', editedUser);
            await userService.updateProfile(editedUser);
            setIsEditing(false);
            await fetchUserProfile();
            
            // Xóa preview
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
                setImagePreview(null);
            }
            alert('Profile cập nhật thành công!'); // Success message
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save changes');
        } finally {
            setIsSavingProfile(false); // Stop loading regardless of success or failure
        }
    };

    const handleInputChange = (field, value) => {
        setEditedUser(prev => ({
            ...prev,
            [field]: value
        }));
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
            // Optionally provide feedback or just ignore invalid non-numeric/non-integer input
            return; 
        }

        // Apply constraints
        if (field === 'duration') {
            if (numValue >= 30) {
                setEditedGoal(prev => ({
                    ...prev,
                    [field]: numValue // Store as number if valid
                }));
            } else if (value.length <= String(numValue).length && numValue >= 0 && numValue < 30) {
                // Allow typing numbers less than 30, but don't update state if it *becomes* less than 30
                // This prevents blocking typing '1' or '2' on the way to '30'
                setEditedGoal(prev => ({ ...prev, [field]: value }));
            } else if (numValue < 0) {
                // Prevent negative numbers explicitly
                return;
            }
        } else if (field === 'scoreTarget') {
            if (numValue >= 300 && numValue <= 990) {
                setEditedGoal(prev => ({
                    ...prev,
                    [field]: numValue // Store as number if valid
                }));
            } else if (value.length <= String(numValue).length && numValue >= 0 && numValue < 300) {
                 // Allow typing numbers less than 300
                 setEditedGoal(prev => ({ ...prev, [field]: value }));
            } else if (numValue > 990 || numValue < 0) {
                 // Prevent numbers outside 0-990 range (negative handled above)
                 return;
            }
        }
    };

    const handleGoalSave = async () => {
        // Validate before saving - ensure values meet the criteria finally
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

    return (
        <>
            <Header />
            <div className="containerprofile">
                <div className="grid-container">
                    {/* Profile Card */}
                    <div className="profile-card">
                        <div className="profile-content">
                            <div className="profile-image-container">
                                <img
                                    alt="Profile"
                                    className="profile-image"
                                    src={imagePreview || user.avatar || '/assets/img/Placeholder-Profile-Image.jpg'}
                                />
                                {isEditing && (
                                    <div className="image-upload-overlay">
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleImageChange}
                                        />
                                        <label htmlFor="avatar-upload" className="upload-button">
                                            Thay đổi ảnh
                                        </label>
                                    </div>
                                )}
                            </div>
                            <h2 className="profile-name">{user.fullName}</h2>
                            <p className="profile-title">TOEIC Learner</p>
                            <div className="profile-buttons">
                                <button
                                    className={`btn-primary ${isSavingProfile ? 'is-loading' : ''}`}
                                    onClick={() => {
                                        if (isEditing) {
                                            handleSave();
                                        } else {
                                            handleEditToggle();
                                        }
                                    }}
                                    disabled={isSavingProfile} // Disable button when loading
                                >
                                    <span className="btn-text">{isEditing ? 'SAVE' : 'EDIT PROFILE'}</span>
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={handleLogout}
                                >
                                    ĐĂNG XUẤT
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="contact-info">
                        <div className="contact-grid">
                            <div className="contact-item">
                                <p className="contact-label">Full Name</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedUser?.fullName || ''}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        className="edit-input"
                                    />
                                ) : (
                                    <p className="contact-value">{user.fullName || 'Not Provided'}</p>
                                )}
                            </div>
                            <div className="contact-item">
                                <p className="contact-label">Email</p>
                                <p className="contact-value">{user.email || 'Not Provided'}</p>
                            </div>
                            <div className="contact-item">
                                <p className="contact-label">Phone Number</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedUser?.phoneNumber || ''}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        className="edit-input"
                                    />
                                ) : (
                                    <p className="contact-value">{user.phoneNumber || 'Not Provided'}</p>
                                )}
                            </div>
                            <div className="contact-item">
                                <p className="contact-label">Gender</p>
                                {isEditing ? (
                                    <select
                                        value={editedUser?.gender || ''}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                        className="edit-input"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                ) : (
                                    <p className="contact-value">{user.gender || 'Not Provided'}</p>
                                )}
                            </div>
                            <div className="contact-item">
                                <p className="contact-label">Date of Birth</p>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editedUser?.dateOfBirth?.split('T')[0] || ''}
                                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                        className="edit-input"
                                    />
                                ) : (
                                    <p className="contact-value">
                                        {user.dateOfBirth && user.dateOfBirth !== '' ?
                                            new Date(user.dateOfBirth).toLocaleDateString() :
                                            'Not Provided'}
                                    </p>
                                )}
                            </div>
                            <div className="contact-item">
                                <p className="contact-label">Password</p>
                                <button className="btn-primary" onClick={openPasswordPopup}>
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid-container">
                    {/* Social Links */}
                    <div className="social-links">
                        <h3 className="section-title">Social Connections</h3>
                        <ul className="social-list">
                            <li className="social-item">
                                <FaGithub className="social-icon" />
                                <a className="social-link" href="#">
                                    GitHub
                                </a>
                            </li>
                            <li className="social-item">
                                <FaTwitter className="social-icon" />
                                <a className="social-link" href="#">
                                    Twitter
                                </a>
                            </li>
                            <li className="social-item">
                                <FaInstagram className="social-icon" />
                                <a className="social-link" href="#">
                                    Instagram
                                </a>
                            </li>
                            <li className="social-item">
                                <FaFacebook className="social-icon" />
                                <a className="social-link" href="#">
                                    Facebook
                                </a>
                            </li>
                        </ul>
                    </div>
                    {/* Account Information */}
                    <div className="account-info">
                        <h3 className="section-title">Account Details</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <p className="info-label">Member Since:</p>
                                <p className="info-value">
                                    • {new Date(user.joinAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="info-item">
                                <p className="info-label">Account Status:</p>
                                •<p className="info-value badge">{user.status}</p>
                            </div>
                            <div className="info-item">
                                <p className="info-label">Last Updated:</p>
                                <p className="info-value">
                                    • {new Date(user.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid-container">
                    {/* Learning Goal Section */}
                    <div className="learning-goal-section">
                        <h3 className="section-title">Mục tiêu học tập</h3>
                        {isEditingGoal ? (
                            <div className="goal-edit-form">
                                <div className="form-group">
                                    <label>Thời gian (ngày):</label>
                                    <input
                                        type="text"
                                        value={editedGoal?.duration ?? ''}
                                        onChange={(e) => handleGoalChange('duration', e.target.value)}
                                        className="edit-input"
                                        placeholder="Ít nhất 30 ngày"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Điểm mục tiêu:</label>
                                    <input
                                        type="text"
                                        value={editedGoal?.scoreTarget ?? ''}
                                        onChange={(e) => handleGoalChange('scoreTarget', e.target.value)}
                                        className="edit-input"
                                        placeholder="Từ 300 đến 990"
                                    />
                                </div>
                                <div className="goal-buttons">
                                    <button
                                        className="btn-primary"
                                        onClick={handleGoalSave}
                                        disabled={!editedGoal?.duration || !editedGoal?.scoreTarget}
                                    >
                                        {learningGoal ? 'Cập nhật' : 'Lưu mục tiêu'}
                                    </button>
                                    <button className="btn-secondary" onClick={() => {
                                        setIsEditingGoal(false);
                                        setEditedGoal(learningGoal || null);
                                    }}>
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            !learningGoal ? (
                                <div className="no-goal">
                                    <p>Bạn chưa thiết lập mục tiêu học tập</p>
                                    <button className="btn-primary" onClick={() => {
                                        setIsEditingGoal(true);
                                        setEditedGoal({
                                            duration: '',
                                            scoreTarget: '',
                                            learnerId: user.id
                                        });
                                    }}>
                                        Thiết lập mục tiêu
                                    </button>
                                </div>
                            ) : (
                                <div className="goal-content">
                                    <div className="goal-info">
                                        <div className="goal-item">
                                            <p className="goal-label">Thời gian:</p>
                                            <p className="goal-value">{learningGoal?.duration} ngày</p>
                                        </div>
                                        <div className="goal-item">
                                            <p className="goal-label">Điểm mục tiêu:</p>
                                            <p className="goal-value">{learningGoal?.scoreTarget} điểm</p>
                                        </div>
                                    </div>
                                    <button className="btn-primary" onClick={() => {
                                        setIsEditingGoal(true);
                                        setEditedGoal({...learningGoal});
                                    }}>
                                        Chỉnh sửa mục tiêu
                                    </button>
                                </div>
                            )
                        )}
                    </div>

                    {/* Account Statistics */}
                    <div className="account-statistics">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <h3 className="section-title" style={{ margin: 0 }}>Thống kê học tập</h3>
                            <a href="/test-history" className="btn-primary" style={{ minWidth: 150 }}>
                                Xem lịch sử làm bài
                            </a>
                        </div>
                        <div className="statistics-grid">
                            <div className="stat-item">
                                <p className="stat-label">Số chủ đề ngữ pháp đã học:</p>
                                <p className="stat-value">0/50</p>
                            </div>
                            <div className="stat-item">
                                <p className="stat-label">Số bài tập đã hoàn thành:</p>
                                <p className="stat-value">0/100</p>
                            </div>
                            <div className="stat-item">
                                <p className="stat-label">Điểm TOEIC hiện tại:</p>
                                <p className="stat-value">Chưa có</p>
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