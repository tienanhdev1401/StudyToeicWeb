import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Sidebar.module.css';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [openSubmenus, setOpenSubmenus] = useState({});
  const { user } = useAuth();
  
  const isAdmin = user && user.role === 'admin';

  const toggleSubmenu = (menu) => {
    setOpenSubmenus((prev) => {
      // Tạo một object mới với tất cả các menu đều đóng
      const newState = {};
      // Chỉ mở menu được click
      newState[menu] = !prev[menu];
      return newState;
    });
  };

  const handleMenuClick = (menu, path, isExternal) => {
    // Reset all submenu states first
    //setOpenSubmenus({});
    
    // Set the new active menu
    setActiveMenu(menu);
    
    if (isExternal) {
      // Mở liên kết external trong tab mới
      window.open(path, '_blank');
    } else {
      // Điều hướng nội bộ với navigate
      navigate(path);
    }
  };

  const generateMenuItems = () => {
    const baseMenuItems = [
      { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large', path: '/admin/dashboard' },
      { key: 'marketing', label: 'Marketing Scheduler', icon: 'fas fa-bullhorn', path: '/admin/marketing/scheduler' },
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
          { key: 'lesson', label: 'Lesson', path: '/admin/lesson' },
          { key: 'blog', label: 'Blog', path: '/admin/blog' },
        
        ],
      },
      {
        key: 'users',
        label: 'Users',
        icon: 'fas fa-users',
        subMenu: [
          { key: 'learner', label: 'Learner', path: '/admin/learner' },
          // Chỉ hiển thị mục Staff nếu người dùng là admin
          ...(isAdmin ? [{ key: 'staff', label: 'Staff', path: '/admin/staff' }] : []),
        ],
      },
      // { key: 'tables', label: 'Tables', icon: 'fas fa-table', path: '/admin/tables' },
      // { key: 'pages', label: 'Pages', icon: 'fas fa-file', path: '/admin/pages' },
      { key: 'roadmap', label: 'RoadmapConfig',icon:'fas fa-project-diagram', path: '/admin/roadmap-config'},
      { key: 'chat', label: 'Chat', icon: 'fas fa-comment-dots', path: 'https://dashboard.tawk.to/#/chat', external: true }

    ];
    
    return baseMenuItems;
  };

  const menuItems = generateMenuItems();

  return (
    <div className={styles.sidebar} >
      {/* Logo Section */}
      <div className={styles.logoSection} >
        {}
        <span className={styles.logoText} > Course Management</span>
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
                            onClick={() => handleMenuClick(sub.key, sub.path, sub.external)}
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
                  onClick={() => item.path && handleMenuClick(item.key, item.path, item.external)}
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
