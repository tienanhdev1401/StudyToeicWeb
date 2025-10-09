import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LessonService from '../services/lessonService';
import LessonDiscoveryHero from '../components/lessons/LessonDiscoveryHero';
import LessonFilterBar from '../components/lessons/LessonFilterBar';
import LessonCard from '../components/lessons/LessonCard';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/LessonCatalog.css';

const PAGE_SIZE = 9;

const uniqueSorted = (items) => {
  return Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b));
};

const LessonCatalog = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    topic: '',
    level: '',
    language: '',
    status: 'published',
    duration: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await LessonService.getLessons();
        setLessons(response);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch lessons:', err);
        setError('Không thể tải danh sách bài học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const topics = useMemo(() => uniqueSorted(lessons.map((lesson) => lesson.topic)), [lessons]);
  const levels = useMemo(() => uniqueSorted(lessons.map((lesson) => lesson.level)), [lessons]);
  const languages = useMemo(() => uniqueSorted(lessons.map((lesson) => lesson.language)), [lessons]);
  const statusList = useMemo(() => uniqueSorted(lessons.map((lesson) => lesson.status)), [lessons]);

  const highlightTopics = useMemo(() => {
    const stats = lessons.reduce((acc, lesson) => {
      if (!lesson.topic) {
        return acc;
      }
      acc[lesson.topic] = (acc[lesson.topic] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(stats)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([name, count]) => ({ name, count }));
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return lessons.filter((lesson) => {
      if (filters.topic && lesson.topic !== filters.topic) {
        return false;
      }
      if (filters.level && lesson.level !== filters.level) {
        return false;
      }
      if (filters.language && lesson.language !== filters.language) {
        return false;
      }
      if (filters.status && lesson.status !== filters.status) {
        return false;
      }

      if (filters.duration && lesson.durationSec) {
        const minutes = lesson.durationSec / 60;
        if (filters.duration === 'short' && minutes >= 10) {
          return false;
        }
        if (filters.duration === 'medium' && (minutes < 10 || minutes > 20)) {
          return false;
        }
        if (filters.duration === 'long' && minutes <= 20) {
          return false;
        }
      }

      if (!normalizedSearch) {
        return true;
      }

      // Hỗ trợ cú pháp topic:Food để lọc nhanh
      if (normalizedSearch.startsWith('topic:')) {
        const topicKeyword = normalizedSearch.replace('topic:', '').trim();
        return lesson.topic?.toLowerCase().includes(topicKeyword);
      }

      const target = `${lesson.title} ${lesson.description ?? ''} ${lesson.topic ?? ''}`.toLowerCase();
      return target.includes(normalizedSearch);
    });
  }, [lessons, searchTerm, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / PAGE_SIZE));
  const paginatedLessons = filteredLessons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="lesson-page">
      <Header />

      <main>
        <LessonDiscoveryHero
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalLessons={lessons.length}
          highlightTopics={highlightTopics}
        />

        <div className="container">
          <LessonFilterBar
            topics={topics}
            levels={levels}
            languages={languages}
            statusList={statusList}
            filters={filters}
            onChange={setFilters}
          />

          {loading ? (
            <LoadingSpinner fullHeight />
          ) : error ? (
            <div className="lesson-empty">
              <h3>Đã xảy ra lỗi</h3>
              <p>{error}</p>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="lesson-empty">
              <h3>Không tìm thấy bài học phù hợp</h3>
              <p>Hãy thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác.</p>
            </div>
          ) : (
            <>
              <div className="lesson-grid">
                {paginatedLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="lesson-pagination">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        type="button"
                        className={page === currentPage ? 'active' : ''}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LessonCatalog;
