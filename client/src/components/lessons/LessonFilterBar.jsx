import React from 'react';
import { FaFilter } from 'react-icons/fa';
import '../../styles/LessonCatalog.css';

const LessonFilterBar = ({
  topics = [],
  levels = [],
  languages = [],
  statusList = [],
  filters,
  onChange,
}) => {
  const handleChange = (key, value) => {
    onChange?.({ ...filters, [key]: value });
  };

  return (
    <div className="lesson-filter-bar container">
      <div className="lesson-filter-bar__title">
        <FaFilter />
        <span>Bộ lọc nâng cao</span>
      </div>
      <div className="lesson-filter-bar__controls">
        <div className="lesson-filter-bar__control">
          <label>Chủ đề</label>
          <select value={filters.topic} onChange={(event) => handleChange('topic', event.target.value)}>
            <option value="">Tất cả</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div className="lesson-filter-bar__control">
          <label>Trình độ</label>
          <select value={filters.level} onChange={(event) => handleChange('level', event.target.value)}>
            <option value="">Tất cả</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div className="lesson-filter-bar__control">
          <label>Ngôn ngữ</label>
          <select value={filters.language} onChange={(event) => handleChange('language', event.target.value)}>
            <option value="">Tất cả</option>
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        <div className="lesson-filter-bar__control">
          <label>Thời lượng</label>
          <select value={filters.duration} onChange={(event) => handleChange('duration', event.target.value)}>
            <option value="">Tất cả</option>
            <option value="short">Dưới 10 phút</option>
            <option value="medium">10 - 20 phút</option>
            <option value="long">Trên 20 phút</option>
          </select>
        </div>

        <div className="lesson-filter-bar__control">
          <label>Trạng thái</label>
          <select value={filters.status} onChange={(event) => handleChange('status', event.target.value)}>
            <option value="">Tất cả</option>
            {statusList.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default LessonFilterBar;
