// ProfilePage.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaGithub, FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';
import '../styles/Profile.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProfilePage = () => {
  const { state } = useLocation();
  const user = state?.user;
  const navigate = useNavigate();

  // Redirect về trang login nếu không có thông tin user
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="containerprofile">
        <div className="grid-container">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-content">
              <img
                alt="Profile picture"
                className="profile-image"
                src={user.avatar}
              />
              <h2 className="profile-name">{user.fullName}</h2>
              <p className="profile-title">TOEIC Learner</p>
              <p className="profile-location">
                {user.address.city}, {user.address.country}
              </p>
              <div className="profile-buttons">
                <button className="btn-primary">EDIT PROFILE</button>
                <button className="btn-secondary">SETTINGS</button>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-info">
            <div className="contact-grid">
              <div className="contact-item">
                <p className="contact-label">Full Name</p>
                <p className="contact-value">{user.fullName}</p>
              </div>
              <div className="contact-item">
                <p className="contact-label">Email</p>
                <p className="contact-value">{user.emailAddress}</p>
              </div>
              <div className="contact-item">
                <p className="contact-label">Phone</p>
                <p className="contact-value">{user.phoneNumber}</p>
              </div>
              <div className="contact-item">
                <p className="contact-label">Date of Birth</p>
                <p className="contact-value">
                  {new Date(user.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div className="contact-item">
                <p className="contact-label">Address</p>
                <p className="contact-value">
                  {user.address.street}, {user.address.city}, {user.address.country}
                </p>
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
                <p className="info-label">Member Since</p>
                <p className="info-value">
                  {new Date(user.joinAt).toLocaleDateString()}
                </p>
              </div>
              <div className="info-item">
                <p className="info-label">Account Status</p>
                <p className="info-value badge">{user.status}</p>
              </div>
              <div className="info-item">
                <p className="info-label">User ID</p>
                <p className="info-value">{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;