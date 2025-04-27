import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import WordDefinition from '../components/WordDefinition';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { searchWord } from '../services/dictionaryService';
import '../styles/DictionaryPage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

const DictionaryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [wordData, setWordData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const location = useLocation();

  // Xử lý query parameter khi vào trang từ thanh tìm kiếm header
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryParam = params.get('q');
    
    if (queryParam) {
      setSearchTerm(queryParam);
      handleSearch(queryParam);
    }
  }, [location.search]);

  // Lấy những tìm kiếm gần đây từ localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentDictionarySearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Lưu tìm kiếm gần đây
  const saveRecentSearch = (word) => {
    const updatedSearches = [word, ...recentSearches.filter(item => item !== word)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentDictionarySearches', JSON.stringify(updatedSearches));
  };

  const handleSearch = async (word) => {
    if (!word.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await searchWord(word.trim());
      setWordData(data);
      saveRecentSearch(word.trim());
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tìm kiếm từ.');
      setWordData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main>
        <div className="dictionary-page-container">
          <div className="dictionary-header">
            <h1>Từ Điển Tiếng Anh</h1>
            <p>Tra cứu từ vựng, phát âm và ví dụ để nâng cao vốn từ của bạn</p>
          </div>
          
          <div className="search-section">
            <SearchBar 
              value={searchTerm} 
              onChange={setSearchTerm} 
              onSearch={handleSearch} 
            />
            
            {recentSearches.length > 0 && (
              <div className="recent-searches">
                <h3>Tìm kiếm gần đây:</h3>
                <div className="recent-search-tags">
                  {recentSearches.map((term, index) => (
                    <span 
                      key={index} 
                      className="search-tag"
                      onClick={() => {
                        setSearchTerm(term);
                        handleSearch(term);
                      }}
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="dictionary-content">
            {isLoading && <LoadingSpinner />}
            
            {error && <ErrorMessage message={error} />}
            
            {!isLoading && !error && !wordData && (
              <div className="empty-state">
                <img src="/assets/img/dictionary-icon.png" alt="Dictionary" />
                <p>Hãy tìm kiếm một từ để xem định nghĩa và cách phát âm</p>
              </div>
            )}
            
            {wordData && !isLoading && !error && (
              <div className="word-definition-container">
                <WordDefinition entry={wordData} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DictionaryPage;