import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from '../../components/AdminHeader';
import Sidebar from '../../components/Sidebar';
import styles from '../../styles/AdminPage.module.css';
import Dashboard from './Dashboard';
import ManageVocabularyTopic from './ManageVocabularyTopic';
<<<<<<< HEAD
import ManageGrammarTopic from './ManageGrammarTopic';
import ManageStaff from './ManageStaff';

=======
import ManageStaff from './ManageStaff';
import ManageLearn from './ManageLearner';
import ManageGrammarTopic from './ManageGrammarTopic';
>>>>>>> dc40a01 (fix code cho e trí)



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
        <Route path="/staff" element={<ManageStaff />} />
        <Route path="/learner" element={<ManageLearn />} />
        <Route path="/grammar" element={<ManageGrammarTopic />} />
<<<<<<< HEAD

=======
>>>>>>> dc40a01 (fix code cho e trí)
      </Routes>
    </AdminLayout>
  );
};
 
export default AdminPage;