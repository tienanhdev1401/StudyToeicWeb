import React, { useState } from 'react';
import styles from '../styles/Sidebar.module.css';
const Sidebar = ({ onMenuClick }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [openSubmenus, setOpenSubmenus] = useState({
    content: false,
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
    onMenuClick?.(menu); // Sử dụng optional chaining để an toàn
    // Tự động đóng submenu khi chọn mục con (tuỳ chọn)
    //setOpenSubmenus(prev => ({...prev, content: false}));
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
            <button onClick={() => handleMenuClick('calendar')}
              className={`${styles.menuButton} ${activeMenu === 'calendar' ? styles.active : ''}`}
            >
              <i className="fas fa-calendar mr-2"></i>
              Calendar
            </button>
          </li>

          
          <li className={styles.menuItem}>
            <button 
              onClick={() => toggleSubmenu('content')}
              className={`${styles.menuButton} ${['vocabulary', 'grammar', 'exercise', 'test', 'question'].includes(activeMenu)  ? styles.active : ''}`}
            >
              <i className="fas fa-tasks mr-2"></i>
              Content
              <i className={`fas fa-chevron-${openSubmenus.content ? 'down' : 'right'} ml-auto`}></i>
            </button>
            {openSubmenus.content && (
              <ul className={styles.subMenu}>
                <li>
                  <button onClick={() => handleMenuClick('vocabulary')}
                    className={`${styles.menuButton} ${activeMenu === 'vocabulary' ? styles.active : ''}`}
                    >Vocabulary</button>
                  
                </li>
                <li>
                  <button onClick={() => handleMenuClick('grammar')}
                    className={`${styles.menuButton} ${activeMenu === 'grammar' ? styles.active : ''}`}
                    >Grammar</button>
                </li>
                <li>
                  <button onClick={() => handleMenuClick('exercise')}
                    className={`${styles.menuButton} ${activeMenu === 'exercise' ? styles.active : ''}`}
                    >Exercise</button>
                </li>
                <li>
                  <button onClick={() => handleMenuClick('test')}
                    className={`${styles.menuButton} ${activeMenu === 'test' ? styles.active : ''}`}
                    >Test</button>
                </li>
                <li>
                  <button onClick={() => handleMenuClick('question')}
                    className={`${styles.menuButton} ${activeMenu === 'question' ? styles.active : ''}`}
                    >Question</button>
                </li>
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
                <li>
                  <button onClick={() => handleMenuClick('learner')}
                    className={`${styles.menuButton} ${activeMenu === 'learner' ? styles.active : ''}`}
                    >Learner</button>
                </li>
                <li>
                  <button onClick={() => handleMenuClick('staff')}
                    className={`${styles.menuButton} ${activeMenu === 'staff' ? styles.active : ''}`}
                    >Staff</button>
                </li>
               
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
            <button onClick={() => handleMenuClick('chat')}
              className={`${styles.menuButton} ${activeMenu === 'chat' ? styles.active : ''}`}
            >
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