import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';
import '../styles/Profile.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import PasswordChangePopup from '../components/PasswordChangePopup';

const ProfilePage = () => {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [isPasswordPopupOpen, setIsPasswordPopupOpen] = useState(false);

    useEffect(() => {
        // Nếu chưa đăng nhập, chuyển về trang login
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        // Hàm fetch thông tin người dùng
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setProfileData(response.data);
            } catch (error) {
                console.error('Lỗi tải thông tin người dùng:', error);
                logout(); // Đăng xuất nếu không tải được thông tin
                navigate('/login');
            }
        };

        fetchUserProfile();
    }, [isLoggedIn, navigate, logout]);

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

    if (!profileData) return <div>Đang tải...</div>;

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
                                src={profileData.avatar || '/default-avatar.png'}
                            />
                            <h2 className="profile-name">{profileData.fullName}</h2>
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
                                <p className="contact-value">{profileData.fullName || 'Not Provided'}</p>
                            </div>
                            <div className="contact-item">
                                <p className="contact-label">Email</p>
                                <p className="contact-value">{profileData.email || 'Not Provided'}</p>
                            </div>
                            <div className="contact-item">
                                <p className="contact-label">Phone Number</p>
                                <p className="contact-value">{profileData.phoneNumber || 'Not Provided'}</p>
                            </div>
                            <div className="contact-item">
                                <p className="contact-label">Gender</p>
                                <p className="contact-value">{profileData.gender || 'Not Provided'}</p>
                            </div>
                            <div className="contact-item">
                                <p className="contact-label">Date of Birth</p>
                                <p className="contact-value">
                                    {profileData.dateOfBirth && profileData.dateOfBirth !== '' ?
                                        new Date(profileData.dateOfBirth).toLocaleDateString() :
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
                                    • {new Date(profileData.joinAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="info-item">
                                <p className="info-label">Account Status:</p>
                                •<p className="info-value badge">{profileData.status}</p>
                            </div>
                            <div className="info-item">
                                <p className="info-label">Last Updated:</p>
                                <p className="info-value">
                                    • {new Date(profileData.updatedAt).toLocaleDateString()}
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