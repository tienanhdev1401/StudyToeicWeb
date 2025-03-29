import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Sidebar.module.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (menu) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleMenuClick = (menu, path) => {
    setActiveMenu(menu);
    navigate(path);
  };

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large', path: '/admin/dashboard' },
    { key: 'calendar', label: 'Calendar', icon: 'fas fa-calendar', path: '/admin/calendar' },
    {
      key: 'content',
      label: 'Content',
      icon: 'fas fa-tasks',
      subMenu: [
        { key: 'vocabulary', label: 'Vocabulary', path: '/admin/vocabularyTopic' },
        { key: 'grammar', label: 'Grammar', path: '/admin/grammar' },
        { key: 'exercise', label: 'Exercise', path: '/admin/exercise' },
        { key: 'test', label: 'Test', path: '/admin/test' },
        { key: 'question', label: 'Question', path: '/admin/question' },
      ],
    },
    {
      key: 'users',
      label: 'Users',
      icon: 'fas fa-users',
      subMenu: [
        { key: 'learner', label: 'Learner', path: '/admin/learner' },
        { key: 'staff', label: 'Staff', path: '/admin/staff' },
      ],
    },
    { key: 'tables', label: 'Tables', icon: 'fas fa-table', path: '/admin/tables' },
    { key: 'pages', label: 'Pages', icon: 'fas fa-file', path: '/admin/pages' },
    { key: 'chat', label: 'Chat', icon: 'fas fa-comment-dots', path: '/admin/chat' },
  ];

  return (
    <div className={styles.sidebar}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <img
          src="https://storage.googleapis.com/a1aa/image/UKgR22ZUm22NJMqRs2e2z2w6qbn3vPgRfCIzqNQXGZo.jpg"
          alt="Logo"
          className={styles.logo}
        />
        <span className={styles.logoText}>ZEnglish</span>
      </div>

      {/* Navigation Menu */}
      <nav>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.key} className={styles.menuItem}>
              {/* Nếu có submenu */}
              {item.subMenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.key)}
                    className={`${styles.menuButton} ${
                      item.subMenu.some((sub) => sub.key === activeMenu) ? styles.active : ''
                    }`}
                  >
                    <i className={`${item.icon} ${styles.icon}`}></i>
                    {item.label}
                    <i className={`fas fa-chevron-${openSubmenus[item.key] ? 'down' : 'right'} ${styles.chevronIcon}`}></i>
                  </button>
                  {openSubmenus[item.key] && (
                    <ul className={styles.subMenu}>
                      {item.subMenu.map((sub) => (
                        <li key={sub.key} className={styles.subMenuItem}>
                          <button
                            onClick={() => handleMenuClick(sub.key, sub.path)}
                            className={`${styles.menuButton} ${activeMenu === sub.key ? styles.active : ''}`}
                          >
                            {sub.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                // Nếu không có submenu
                <button
                  onClick={() => item.path && handleMenuClick(item.key, item.path)}
                  className={`${styles.menuButton} ${activeMenu === item.key ? styles.active : ''}`}
                >
                  <i className={`${item.icon} ${styles.icon}`}></i>
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;