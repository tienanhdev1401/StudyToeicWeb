// DictionaryPage.jsx
import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import WordDefinition from '../components/WordDefinition';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const DictionaryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [wordData, setWordData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (word) => {
    if (!word.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/dictionary/${encodeURIComponent(word.trim())}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError(`No definitions found for "${word}"`);
        } else {
          setError('An error occurred while fetching the definition');
        }
        setWordData(null);
        return;
      }
      
      const data = await response.json();
      setWordData(data);
    } catch (err) {
      setError('Network error. Please try again later.');
      console.error('Dictionary search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dictionary-page">
      <h1>Dictionary</h1>
      <SearchBar 
        value={searchTerm} 
        onChange={setSearchTerm} 
        onSearch={handleSearch} 
      />
      
      {isLoading && <LoadingSpinner />}
      
      {error && <ErrorMessage message={error} />}
      
      {wordData && !isLoading && !error && (
        <WordDefinition entry={wordData} />
      )}
    </div>
  );
};

export default DictionaryPage;

