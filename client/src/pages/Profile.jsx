import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';
import '../styles/Profile.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/userContext';
import PasswordChangePopup from '../components/PasswordChangePopup';

const ProfilePage = () => {
    const { isLoggedIn, logout } = useAuth();
    const { user,loading } = useUser();
    const navigate = useNavigate();
    const [isPasswordPopupOpen, setIsPasswordPopupOpen] = useState(false);

    useEffect(() => {
        if (!loading && !isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, loading, navigate]);
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
    if (!user) return <div>Đang tải thông tin người dùng...</div>;
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
                                <button className="btn-primary">EDIT PROFILE</button>
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
                                <p className="contact-value">{user.fullName || 'Not Provided'}</p>
                            </div>
                            <div className="contact-item">
                                <p className="contact-label">Email</p>
                                <p className="contact-value">{user.email || 'Not Provided'}</p>
                            </div>
                            <div className="contact-item">
                                <p className="contact-label">Phone Number</p>
                                <p className="contact-value">{user.phoneNumber || 'Not Provided'}</p>
                            </div>
                            <div className="contact-item">
                                <p className="contact-label">Gender</p>
                                <p className="contact-value">{user.gender || 'Not Provided'}</p>
                            </div>
                            <div className="contact-item">
                                <p className="contact-label">Date of Birth</p>
                                <p className="contact-value">
                                    {user.dateOfBirth && user.dateOfBirth !== '' ?
                                        new Date(user.dateOfBirth).toLocaleDateString() :
                                        'Not Provided'}
                                </p>
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