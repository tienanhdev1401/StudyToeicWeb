import React, { useState } from 'react';
import Header from '../../components/AdminHeader';
import Sidebar from '../../components/Sidebar';
import styles from '../../styles/AdminPage.module.css';

const AdminPage = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className={styles.contentArea}>
            <h1>Dashboard</h1>
            <p>Welcome to the admin dashboard</p>
          </div>
        );
      case 'calendar':
        return (
          <div className={styles.contentArea}>
            <h1>Calendar</h1>
            <p>View and manage your schedule</p>
          </div>
        );
      case 'profile':
        return (
          <div className={styles.contentArea}>
            <h1>User Profile</h1>
            <p>Manage your profile settings</p>
          </div>
        );
      default:
        return (
          <div className={styles.contentArea}>
            <h1>Dashboard</h1>
            <p>Welcome to the admin dashboard</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.dashboard}>
      <div>
        <Sidebar onMenuClick={setCurrentPage} />
      </div>
      <div className={styles.mainContent}>
        <div>
          <Header />
        </div>
        {renderPage()}
      </div>
    </div>
  );
};

export default AdminPage;