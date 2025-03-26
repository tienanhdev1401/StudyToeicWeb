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
import {BrowserRouter,Routes,Route } from 'react-router-dom';
import Admin from './pages/Admin/AdminPage';
import ExerciseList from './pages/ExerciseList';
import DoExercise from './pages/DoExercise';
function App() {
  // const [message, setMessage] = useState('');
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // useEffect(() => {
  //   // Fetch hello message from the server
  //   fetch('/api/hello')
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       return response.json();
  //     })
  //     .then(data => {
  //       setMessage(data.message);
  //       setLoading(false);
  //     })
  //     .catch(error => {
  //       setError('Could not connect to server: ' + error.message);
  //       setLoading(false);
  //     });
  // }, []);

  return (
    <div className="App">
    
      <BrowserRouter basename="/">
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
          <Route path="/test-online-new" element={<TestOnlineNew/>} />
          <Route path="/learn-vocabulary" element={<LearnVocabulary/>} />
          <Route path="/learn-grammary" element={<LearnGrammary/>} />
          <Route path="/Stm_Quizzes/:testId" element={<StmQuizzes />} />
          <Route path="/learn-vocabulary/:topicSlug" element={<TopicDetail />} />
          <Route path="/toeic-exercise" element={<ExerciseList/>} />
          <Route path="/toeic-exercise/:partId" element={<DoExercise />} />
          <Route path="/Dotest/:testID" element={<Dotest />} />
          <Route path="/admin" element={<Admin />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;