import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from '../../components/AdminHeader';
import Sidebar from '../../components/Sidebar';
import styles from '../../styles/AdminPage.module.css';
import Dashboard from './Dashboard';
import ManageVocabularyTopic from './ManageVocabularyTopic';
<<<<<<< HEAD
import ManageGrammarTopic from './ManageGrammarTopic';
import ManageLearner from './ManageLearner';
import ManageStaff from './ManageStaff';
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
               <ManageGrammarTopic />
            </div>
          );
        case 'exercise':
          return (
            <div className={styles.contentArea}>
              <h1>Exercise Management</h1>
              {/* Thêm component quản lý bài tập ở đây */}
            </div>
          );
          case 'learner':
          return (
            <div className={styles.contentArea}>
               <ManageLearner />
            </div>
          );
          case 'staff':
          return (
            <div className={styles.contentArea}>
               <ManageStaff />
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

const AdminLayout = ({ children }) => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.Sidebar}>
        <Sidebar />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.Header}>
          <Header />
        </div>
        <div className={styles.contentArea}>{children}</div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vocabularyTopic" element={<ManageVocabularyTopic />} />
      </Routes>
    </AdminLayout>
  );
};



export default AdminPage;