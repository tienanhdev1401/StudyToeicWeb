import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Header.module.css';

const AdminHeader = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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
            src="https://randomuser.me/api/portraits/men/32.jpg" 
            alt="User Profile" 
            className={styles.userAvatar}
          />
          <span className={styles.userName}>MR HIEU NGHIA</span>
          <i className={`fas fa-chevron-down ${styles.chevron} ${showDropdown ? styles.arrowUp : ''}`}></i>
          {showDropdown && (
            <div className={styles.userDropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownName}>Musharof Chowdhury</div>
                <div className={styles.dropdownEmail}>randomuser@pimjo.com</div>
              </div>
              
              <div className={styles.dropdownMenu}>
                <div className={styles.menuItem}>
                  <span></span> Edit profile
                </div>
                <div className={styles.menuItem}>
                  <span></span> Account settings
                </div>
                <div className={styles.menuItem}>
                  <span></span> Support
                </div>
                <div className={styles.menuItem}>
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