// import React, { useState, useEffect } from 'react';
import React from 'react';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import BlogDetails from './pages/Blog_details';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Elements from './pages/Elements';
import TestOnlineNew from './pages/Test_online_new';
import StmQuizzes from './pages/Stm_Quizzes';
import Dotest from './pages/DoTest';
import LearnVocabulary from './pages/LearnVocabulary';
import LearnGrammary from './pages/LearnGrammar';
import TopicDetail from './pages/TopicDetail';
import Admin from './pages/admin/AdminPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRoute from './components/AdminRoute';
import ExerciseList from './pages/ExerciseList';
import DoExercise from './pages/DoExercise';
import ProfilePage from './pages/Profile';
import GrammarDetail from './pages/GrammarDetail';
import Roadmap from './pages/Roadmap';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import DictionaryPage from './pages/DictionaryPage';
import { TestProvider } from './context/TestContext';
import NotFound from './components/404';
import WordNotePage from './pages/WordNotePage';
import WordNoteDetail from './pages/WordNoteDetail';
import TawkChat from './components/TawkChat';
import TestHistory from './pages/TestHistory';
import TestHistoryDetail from './pages/TestHistoryDetail';
import ForgetPassword from './pages/ForgetPassword';
// Gọi hàm này khi ứng dụng khởi động

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TOEICCalculator from './pages/calculatorScore';


function App() {
  return (
    <div className="App">

      <BrowserRouter basename="/">
        <AuthProvider>

          <UserProvider>
            <TestProvider>
              <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog_details" element={<BlogDetails />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/elements" element={<Elements />} />
                <Route path="/register" element={<Register />} />
                <Route path="/test-online-new" element={<TestOnlineNew />} />
                <Route path="/learn-vocabulary" element={<LearnVocabulary />} />
                <Route path="/learn-grammary" element={<LearnGrammary />} />
                <Route path="/learn-grammary/:topicId" element={<GrammarDetail />} />
                <Route path="/Stm_Quizzes/:testId" element={<StmQuizzes />} />
                <Route path="/learn-vocabulary/:topicId" element={<TopicDetail />} />
                <Route path="/toeic-exercise" element={<ExerciseList />} />
                <Route path="/toeic-exercise/:partId" element={<DoExercise />} />
                <Route path="/Dotest/:testID" element={<Dotest />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/roadmap" element={<Roadmap />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } />
                
                <Route path="/dictionary" element={<DictionaryPage />} />
                <Route path="/learn-vocabulary/:topicId" element={<TopicDetail />} />
                <Route path="/exercise/:exerciseId" element={<DoExercise />} />
                <Route path="/calculateScore" element={<TOEICCalculator />} />
                <Route path="/word-note" element={<WordNotePage />} />
                <Route path="/word-note/:wordNoteId" element={<WordNoteDetail />} />
                <Route path="/test-history" element={<TestHistory />} />
                <Route path="/forgetpassword" element={<ForgetPassword />} />
                <Route path="/test-history/detail/:submissionId" element={<TestHistoryDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Add TawkChat component here so it's available on all pages */}
              <TawkChat />
            </TestProvider>
          </UserProvider> {/* Đóng UserProvider */}
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;