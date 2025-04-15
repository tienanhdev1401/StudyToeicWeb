import React from 'react';

const SearchBar = ({ value, onChange, onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter a word..."
        aria-label="Search for a word"
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;