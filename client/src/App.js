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
import {BrowserRouter,Routes,Route } from 'react-router-dom';

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
      {/* <header className="App-header">
        {loading ? (
          <p>Connecting to server...</p>
        ) : error ? (
          <div>
            <p style={{ color: 'red' }}>{error}</p>
            <p>Make sure server is running on port 5000</p>
          </div>
        ) : (
          <div>
            <h1>{message}</h1>
            <p>Server connection successful!</p>
          </div>
        )}
      </header> */}
      <BrowserRouter>
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

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;