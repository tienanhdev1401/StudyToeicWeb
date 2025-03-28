import React, { useState } from 'react';
import Header from '../../components/AdminHeader';
import Sidebar from '../../components/Sidebar';
import styles from '../../styles/AdminPage.module.css';
import Dashboard from './Dashboard';
import ManageVocabularyTopic from './ManageVocabularyTopic';
const AdminPage = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className={styles.contentArea}>
            <Dashboard />
          </div>
        );
        case 'vocabulary':
          return (
            <div className={styles.contentArea}>
              <ManageVocabularyTopic />
            </div>
          );
        case 'grammar':
          return (
            <div className={styles.contentArea}>
              <h1>Grammar Management</h1>
              {/* Thêm component quản lý ngữ pháp ở đây */}
            </div>
          );
        case 'exercise':
          return (
            <div className={styles.contentArea}>
              <h1>Exercise Management</h1>
              {/* Thêm component quản lý bài tập ở đây */}
            </div>
          );
      default:
        return (
          <div className={styles.contentArea}>
            <Dashboard />
          </div>
        );
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.Sidebar}>
        <Sidebar onMenuClick={setCurrentPage} />
      </div>
      
      <div className={styles.mainContent}>
        <div className={styles.Header}>
          <Header />
        </div>
        {renderPage()}
      </div>
    </div>
  );
};

export default AdminPage;