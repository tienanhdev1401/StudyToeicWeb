import React from 'react';
import { FaPlayCircle, FaSearch, FaStar } from 'react-icons/fa';
import '../../styles/LessonCatalog.css';

const LessonDiscoveryHero = ({
  searchTerm,
  onSearchChange,
  onSubmit,
  totalLessons = 0,
  highlightTopics = [],
  loading = false,
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <section className="lesson-hero">
      <div className="lesson-hero__content container">
        <div className="lesson-hero__headline">
          <span className="lesson-hero__eyebrow">KHOÁ HỌC VIDEO TOEIC</span>
          <h1>
            Học TOEIC theo lộ trình với <span>video tương tác</span>
          </h1>
          <p>
            Khởi động buổi học hôm nay với hơn {totalLessons} bài giảng chất lượng cao. Tìm kiếm nội dung phù hợp
            với trình độ và mục tiêu của bạn chỉ trong vài giây.
          </p>
        </div>

        <form className="lesson-hero__search" onSubmit={handleSubmit}>
          <FaSearch className="lesson-hero__search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học, chủ đề hoặc kỹ năng..."
            value={searchTerm}
            onChange={(event) => onSearchChange?.(event.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Đang tải...' : 'Khám phá'}
          </button>
        </form>

        {highlightTopics.length > 0 && (
          <div className="lesson-hero__highlights">
            <h4>Chủ đề nổi bật</h4>
            <div className="lesson-hero__chips">
              {highlightTopics.slice(0, 6).map((topic) => (
                <button
                  key={topic.name}
                  type="button"
                  className="lesson-chip"
                  onClick={() => onSearchChange?.(`topic:${topic.name}`)}
                >
                  <FaPlayCircle />
                  <span>{topic.name}</span>
                  <span className="lesson-chip__count">{topic.count} bài</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="lesson-hero__stats container">
        <div>
          <FaPlayCircle />
          <div>
            <strong>{totalLessons}</strong>
            <span>Bài học HD</span>
          </div>
        </div>
        <div>
          <FaStar />
          <div>
            <strong>4.8/5.0</strong>
            <span>Đánh giá trung bình</span>
          </div>
        </div>
        <div>
          <FaPlayCircle />
          <div>
            <strong>100%</strong>
            <span>Lộ trình cập nhật thường xuyên</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LessonDiscoveryHero;
