import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Header.module.css';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
const AdminHeader = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  }
  // Xử lý click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(e.target) &&
          !e.target.closest(`.${styles.userProfile}`)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button className={styles.menuToggle}>
          <i className="fas fa-bars"></i>
        </button>
        <div className={styles.searchContainer}>
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search or type command..." 
            className={styles.searchInput}
          />
          <kbd className={styles.searchShortcut}>⌘K</kbd>
        </div>
      </div>
      
      <div className={styles.rightSection}>
        <button className={styles.headerIcon}>
          <i className="fas fa-moon"></i>
        </button>
        <button className={styles.headerIcon}>
          <i className="fas fa-bell"></i>
          <span className={styles.notification}>3</span>
        </button>
        <div className={styles.userProfile}
        onClick={() => setShowDropdown(!showDropdown)}
        ref={dropdownRef}
        >

          <img 
            src={user?.avatar || "https://res.cloudinary.com/dv7574j3j/image/upload/v1745148114/toeic_web/vocabularyTopic/mq3rwxvrykkjlx5lliwk.png"} 
            alt="User Profile" 
            className={styles.userAvatar}
          />
          <span className={styles.userName}>{user?.fullname|| "Admin"}</span>
          <i className={`fas fa-chevron-down ${styles.chevron} ${showDropdown ? styles.arrowUp : ''}`}></i>
          {showDropdown && (
            <div className={styles.userDropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownName}>{user?.fullname || "Admin"}</div>
                <div className={styles.dropdownEmail}>{user?.email || ""}</div>
              </div>
              
              <div className={styles.dropdownMenu}>
                
                <div className={styles.menuItem}>
                  <span></span> Account settings
                </div>
                <div className={styles.menuItem}>
                  <span></span> Support
                </div>
                <div className={styles.menuItem} onClick={handleLogout}>
                  <span>
                  <i class="fa-solid fa-right-from-bracket"></i>
                  </span> Sign out
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default AdminHeader;