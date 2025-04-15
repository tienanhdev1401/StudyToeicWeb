import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';
import '../styles/Profile.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/userContext';
import PasswordChangePopup from '../components/PasswordChangePopup';
import userService from '../services/userService';

const ProfilePage = () => {
    const { isLoggedIn, logout } = useAuth();
    const { user, loading, fetchUserProfile } = useUser();
    const navigate = useNavigate();
    const [isPasswordPopupOpen, setIsPasswordPopupOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(null);

    useEffect(() => {
        if (!loading && !isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, loading, navigate]);

    useEffect(() => {
        if (user) {
            setEditedUser({ ...user });
        }
    }, [user]);

    if (!user) return null;

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

    const handleEditToggle = () => {
        if (isEditing) {
            handleSave();
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        try {
            console.log('Saving profile:', editedUser);
            await userService.updateProfile(editedUser);
            setIsEditing(false);
            await fetchUserProfile();
        
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save changes');
        }
    };

    const handleInputChange = (field, value) => {
        setEditedUser(prev => ({
            ...prev,
            [field]: value
        }));
    };
    return (
        <>
            <Header />
            <div className="containerprofile">
                <div className="grid-container">
                    {/* Profile Card */}
                    <div className="profile-card">
                        <div className="profile-content">
                            <img
                                alt="Profile"
                                className="profile-image"
                                src={user.avatar || '/default-avatar.png'}
                            />
                            <h2 className="profile-name">{user.fullName}</h2>
                            <p className="profile-title">TOEIC Learner</p>
                            <div className="profile-buttons">
                                <button 
                                    className="btn-primary"
                                    onClick={handleEditToggle}
                                >
                                    {isEditing ? 'SAVE' : 'EDIT PROFILE'}
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