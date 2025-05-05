import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from '../../components/AdminHeader';
import Sidebar from '../../components/Sidebar';
import styles from '../../styles/AdminPage.module.css';
import Dashboard from './Dashboard';
import ManageVocabularyTopic from './ManageVocabularyTopic';
import ManageStaff from './ManageStaff';
import ManageLearn from './ManageLearner';
import ManageGrammarTopic from './ManageGrammarTopic';
import ManageVocabulary from './ManageVocabulary';
import { useAuth } from '../../context/AuthContext';
import { AuthProvider } from '../../context/AuthContext';
import { UserProvider } from '../../context/UserContext';
import ManageTest from './ManageTest';
import NotFound from '../../components/404';
import TestDetail from './TestDetail';
import ManageExercise from './ManageExercise';
import ManageRoadmapConfig from './RoadmapConfigAdmin';
import ManageExerciseQuestion from './ManageExerciseQuestion';
import ManageExerciseGrammar from './ManageExerciseGrammar';
import ManageExerciseVocabulary from './ManageExerciseVocabulary';
import ManageQuestion from './ManageQuestion';

// Component để kiểm tra quyền Admin (không phải staff)
const AdminOnlyRoute = ({ element }) => {
  const { user } = useAuth();
  
  if (user && user.role === 'admin') {
    return element;
  }
  
  return <Navigate to="/admin/dashboard" replace />;
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
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Debug auth state
  useEffect(() => {
    console.log("AdminPage - Auth state:", { 
      isLoggedIn, 
      userExists: !!user,
      role: user?.role
    });
  }, [user, isLoggedIn]);

  // Double-check permissions even inside the admin page 
  // (redundant with AdminRoute but adds extra security)
  useEffect(() => {
    if (!isLoggedIn || !user || (user.role !== 'admin' && user.role !== 'staff')) {
      navigate('/admin/login');
    }
  }, [user, isLoggedIn, navigate]);

  return (

    <AdminLayout>
      <AuthProvider>
        <UserProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vocabularyTopic" element={<ManageVocabularyTopic />} />
        {/* Chỉ admin mới có thể truy cập quản lý nhân viên */}
        <Route path="/staff" element={<AdminOnlyRoute element={<ManageStaff />} />} />
        <Route path="/learner" element={<ManageLearn />} />
        <Route path="/grammar" element={<ManageGrammarTopic />} />
        <Route path="/vocabularyTopic/:id/vocabularies" element={<ManageVocabulary />} />
        <Route path="/test" element={<ManageTest />} /> 
        <Route path="/test/:id" element={<TestDetail />} />
        <Route path="*" element={<NotFound />} /> 
        <Route path="/exercise" element={<ManageExercise />} />
        <Route path="/roadmap-config" element={<ManageRoadmapConfig />} />
        <Route path="/exercise/:id/questions" element={<ManageExerciseQuestion />} />
        <Route path="/exercise/grammars" element={<ManageExerciseGrammar />} />
        <Route path="/exercise/vocabularies" element={<ManageExerciseVocabulary />} />
        <Route path="/question" element={<ManageQuestion />} />
      </Routes>
      </UserProvider>
      </AuthProvider>
    </AdminLayout>
  );
};
 
export default AdminPage;