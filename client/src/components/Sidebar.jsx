import React, { useState } from 'react';
import styles from '../styles/Sidebar.module.css';
const Sidebar = ({ onMenuClick }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [openSubmenus, setOpenSubmenus] = useState({
    task: false,
    users: false,
    tables: false,
    pages: false
  });

  const toggleSubmenu = (menu) => {
    setOpenSubmenus(prev => ({
      ...Object.fromEntries(Object.keys(prev).map(key => [key, false])),
      [menu]: !prev[menu]
    }));
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    onMenuClick && onMenuClick(menu);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.logoSection}>
        <img
          src="https://storage.googleapis.com/a1aa/image/UKgR22ZUm22NJMqRs2e2z2w6qbn3vPgRfCIzqNQXGZo.jpg"
          alt="Logo"
          className={styles.logo}
        />
        <span className={styles.logoText}>ZEnglish</span>
      </div>
      
      <nav>
        <ul>
          <li className={styles.menuItem}>
            <button
              onClick={() => handleMenuClick('dashboard')}
              className={`${styles.menuButton} ${activeMenu === 'dashboard' ? styles.active : ''}`}
            >
              <i className="fas fa-th-large mr-2"></i>
              Dashboard
            </button>
          </li>

          <li className={styles.menuItem}>
            <button onClick={() => handleMenuClick('calendar')} className={styles.menuButton}>
              <i className="fas fa-calendar mr-2"></i>
              Calendar
            </button>
          </li>

          
          <li className={styles.menuItem}>
            <button 
              onClick={() => toggleSubmenu('task')}
              className={`${styles.menuButton} ${activeMenu === 'task' ? styles.active : ''}`}
            >
              <i className="fas fa-tasks mr-2"></i>
              Content
              <i className={`fas fa-chevron-${openSubmenus.task ? 'down' : 'right'} ml-auto`}></i>
            </button>
            {openSubmenus.task && (
              <ul className={styles.subMenu}>
                <li><button>Vocabulary</button></li>
                <li><button>Grammar</button></li>
                <li><button>Exercise</button></li>
                <li><button>Test</button></li>
                <li><button>Question</button></li>

              </ul>
            )}
          </li>
         
          <li className={styles.menuItem}>
            <button 
              onClick={() => toggleSubmenu('users')}
              className={styles.menuButton}
            >
              <i className="fas fa-users mr-2"></i>
              Users
              <i className={`fas fa-chevron-${openSubmenus.users ? 'down' : 'right'} ml-auto`}></i>
            </button>
            {openSubmenus.users && (
              <ul className={styles.subMenu}>
                <li><button>Learner</button></li>
                <li><button>Staff</button></li>
              </ul>
            )}
          </li>
          
          <li className={styles.menuItem}>
            <button 
              onClick={() => toggleSubmenu('tables')}
              className={styles.menuButton}
            >
              <i className="fas fa-table mr-2"></i>
              Tables
              <i className={`fas fa-chevron-${openSubmenus.tables ? 'down' : 'right'} ml-auto`}></i>
            </button>
          </li>
          
          <li className={styles.menuItem}>
            <button 
              onClick={() => toggleSubmenu('pages')}
              className={styles.menuButton}
            >
              <i className="fas fa-file mr-2"></i>
              Pages
              <i className={`fas fa-chevron-${openSubmenus.pages ? 'down' : 'right'} ml-auto`}></i>
            </button>
          </li>
          
          <li className={styles.menuItem}>
            <div className={styles.supportSection}>SUPPORT</div>
            <button onClick={() => handleMenuClick('chat')} className={styles.menuButton}>
              <i className="fas fa-comment-dots mr-2"></i>
              Chat
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;