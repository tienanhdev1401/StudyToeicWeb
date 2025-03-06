import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch hello message from the server
    fetch('/api/hello')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch(error => {
        setError('Could not connect to server: ' + error.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
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
      </header>
    </div>
  );
}

export default App;