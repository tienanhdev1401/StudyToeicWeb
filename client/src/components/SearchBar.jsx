import React from 'react';
import { FaSearch } from 'react-icons/fa';
import '../styles/SearchBar.css';

const SearchBar = ({ value, onChange, onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <div className="search-input-container">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập từ cần tìm..."
          aria-label="Tìm kiếm từ"
          className="search-input"
        />
        <button type="submit" className="search-button">
          <FaSearch />
          <span>Tìm kiếm</span>
        </button>
      </div>
      <p className="search-tip">Gợi ý: Bạn có thể tìm kiếm các từ phổ biến như "hello", "success", "challenge"</p>
    </form>
  );
};

export default SearchBar;