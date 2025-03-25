import React from 'react';
import { FaGithub, FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';
import '../styles/Profile.css'; // Sử dụng cùng file CSS
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProfilePage = () => {
  return (
    <>
    <Header></Header>
    <div className="containerprofile">
      <div className="grid-container">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-content">
            <img 
              alt="Profile picture of John Smith" 
              className="profile-image" 
              src="https://storage.googleapis.com/a1aa/image/ygi-0Cj-qCG7l7QJM2RVIrEL0PI83TIzF_QQ85Uohfk.jpg" 
            />
            <h2 className="profile-name">John Smith</h2>
            <p className="profile-title">Full Stack Developer</p>
            <p className="profile-location">Bay Area, San Francisco, CA</p>
            <div className="profile-buttons">
              <button className="btn-primary">FOLLOW</button>
              <button className="btn-secondary">MESSAGE</button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="contact-info">
          <div className="contact-grid">
            <div className="contact-item">
              <p className="contact-label">Full Name</p>
              <p className="contact-value">Johnatan Smith</p>
            </div>
            <div className="contact-item">
              <p className="contact-label">Email</p>
              <p className="contact-value">example@example.com</p>
            </div>
            <div className="contact-item">
              <p className="contact-label">Phone</p>
              <p className="contact-value">(097) 234-5678</p>
            </div>
            <div className="contact-item">
              <p className="contact-label">Mobile</p>
              <p className="contact-value">(098) 765-4321</p>
            </div>
            <div className="contact-item">
              <p className="contact-label">Address</p>
              <p className="contact-value">Bay Area, San Francisco, CA</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-container">
        {/* Social Links */}
        <div className="social-links">
          <ul className="social-list">
            <li className="social-item">
              <img 
                alt="Website icon" 
                className="social-icon" 
                src="https://storage.googleapis.com/a1aa/image/zHiubVtLJneDeUsAFsNEEbW01J0nE2CkAZPFteiGC3U.jpg" 
              />
              <a className="social-link" href="#">https://mdbootstrap.com</a>
            </li>
            <li className="social-item">
              <FaGithub className="social-icon" />
              <a className="social-link" href="#">mdbootstrap</a>
            </li>
            <li className="social-item">
              <FaTwitter className="social-icon" />
              <a className="social-link" href="#">@mdbootstrap</a>
            </li>
            <li className="social-item">
              <FaInstagram className="social-icon" />
              <a className="social-link" href="#">mdbootstrap</a>
            </li>
            <li className="social-item">
              <FaFacebook className="social-icon" />
              <a className="social-link" href="#">mdbootstrap</a>
            </li>
          </ul>
        </div>

        {/* Project Status */}
        <div className="project-status">
          <div className="status-grid">
            <div>
              <h3 className="status-title">assignment Project Status</h3>
              <div className="progress-item">
                <p className="progress-label">Web Design</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div className="progress-item">
                <p className="progress-label">Website Markup</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div className="progress-item">
                <p className="progress-label">One Page</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '89%' }}></div>
                </div>
              </div>
              <div className="progress-item">
                <p className="progress-label">Mobile Template</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '55%' }}></div>
                </div>
              </div>
              <div className="progress-item">
                <p className="progress-label">Backend API</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '66%' }}></div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="status-title">assignment Project Status</h3>
              <div className="progress-item">
                <p className="progress-label">Web Design</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div className="progress-item">
                <p className="progress-label">Website Markup</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div className="progress-item">
                <p className="progress-label">One Page</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '89%' }}></div>
                </div>
              </div>
              <div className="progress-item">
                <p className="progress-label">Mobile Template</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '55%' }}></div>
                </div>
              </div>
              <div className="progress-item">
                <p className="progress-label">Backend API</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '66%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>

    <Footer></Footer>
    </>
  );
};

export default ProfilePage;