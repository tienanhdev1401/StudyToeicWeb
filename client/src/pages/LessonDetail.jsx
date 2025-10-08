import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LessonService from '../services/lessonService';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/LessonDetail.css';
import '../styles/LessonCatalog.css';
import {
  FaArrowUp,
  FaBookOpen,
  FaClock,
  FaCommentAlt,
  FaFilter,
  FaGlobe,
  FaLayerGroup,
  FaPlay,
  FaPlus,
  FaSearch,
  FaSignal,
  FaStickyNote,
} from 'react-icons/fa';

const formatMinutes = (seconds) => {
  if (!seconds && seconds !== 0) {
    return null;
  }
  const minutes = Math.round(seconds / 60);
  return `${minutes} phút`;
};

const formatTimestamp = (milliseconds = 0) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const formatRelativeTime = (dateString) => {
  if (!dateString) {
    return 'vừa cập nhật';
  }

  const now = Date.now();
  const target = new Date(dateString).getTime();
  if (Number.isNaN(target)) {
    return 'vừa cập nhật';
  }

  const diffMs = Math.max(now - target, 0);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) {
    return 'vừa xong';
  }
  if (minutes < 60) {
    return `${minutes} phút trước`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} giờ trước`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} ngày trước`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} tháng trước`;
  }
  const years = Math.floor(days / 365);
  return `${years} năm trước`;
};

const parseTimecodeToSeconds = (timecode = '0:0') => {
  if (typeof timecode !== 'string') {
    return 0;
  }

  const parts = timecode.split(':');
  if (parts.length !== 2) {
    return 0;
  }

  const [m, s] = parts.map((value) => Number.parseInt(value, 10));
  if (Number.isNaN(m) || Number.isNaN(s)) {
    return 0;
  }

  return m * 60 + s;
};

const MOCK_DISCUSSIONS = [
  {
    id: 'disc-1',
    title: 'Không chạy được localhost, nhờ trợ giúp',
    excerpt:
      'Em đã cài Node.js 18 và chạy npm install nhưng vẫn báo lỗi "command not found". Anh chị cho em xin vài gợi ý khắc phục nhé!',
    lectureTitle: 'Bài giảng số 8',
    author: { name: 'Luka', initials: 'LU' },
    createdAt: '2023-07-12T08:00:00Z',
    votes: 13,
    replies: 3,
  },
  {
    id: 'disc-2',
    title: 'Cách đơn giản hoá phần giới thiệu',
    excerpt:
      'Nếu muốn bài giới thiệu ngắn gọn hơn thì nên giữ những ý nào ạ? Em sợ nói lan man làm học viên khó theo kịp.',
    lectureTitle: 'Bài giảng số 1',
    author: { name: 'I Nyoman', initials: 'IN' },
    createdAt: '2023-11-04T10:30:00Z',
    votes: 3,
    replies: 1,
  },
  {
    id: 'disc-3',
    title: 'Khoá học có đủ để làm micro SaaS?',
    excerpt:
      'Cảm ơn thầy vì khoá học rất chi tiết. Em muốn hỏi liệu kiến thức trong giáo trình có đủ để xây dựng web app nhỏ không?',
    lectureTitle: 'Bài giảng số 1',
    author: { name: 'Yassine', initials: 'YA' },
    createdAt: '2024-02-15T14:15:00Z',
    votes: 2,
    replies: 0,
  },
  {
    id: 'disc-4',
    title: 'Giữ vững sự tự tin khi giảng dạy',
    excerpt:
      'Bạn hãy tự tin lên nhé! Cứ tập trung vào ví dụ thực tế, người học sẽ dễ hiểu và tương tác nhiều hơn.',
    lectureTitle: 'Bài giảng số 3',
    author: { name: 'Resse', initials: 'RE' },
    createdAt: '2024-06-20T07:45:00Z',
    votes: 1,
    replies: 0,
  },
];

const MOCK_NOTES = [
  {
    id: 'note-1',
    timestamp: '00:45',
    lectureTitle: 'Bài giảng số 1',
    content: 'Ghi nhớ cấu trúc giới thiệu: Hook ➜ Lợi ích ➜ Hành động tiếp theo.',
    updatedAt: '2024-03-12T09:30:00Z',
  },
  {
    id: 'note-2',
    timestamp: '02:15',
    lectureTitle: 'Bài giảng số 1',
    content: 'Từ vựng mới: "compelling" = hấp dẫn, cuốn hút.',
    updatedAt: '2024-05-01T11:00:00Z',
  },
  {
    id: 'note-3',
    timestamp: '05:40',
    lectureTitle: 'Bài giảng số 3',
    content: 'Checklist tự tin: chuẩn bị kịch bản, luyện trước gương, ghi chú keypoint.',
    updatedAt: '2024-07-21T07:00:00Z',
  },
  {
    id: 'note-4',
    timestamp: '08:20',
    lectureTitle: 'Bài giảng số 8',
    content: 'Khi localhost lỗi: kiểm tra port, xoá node_modules và cài lại, chạy npm run clean.',
    updatedAt: '2024-08-03T16:20:00Z',
  },
];

const DISCUSSION_SORT_OPTIONS = [
  { value: 'recommend', label: 'Sắp xếp theo đề xuất' },
  { value: 'recent', label: 'Mới nhất' },
  { value: 'votes', label: 'Nhiều bình chọn' },
];

const NOTE_SORT_OPTIONS = [
  { value: 'recent', label: 'Cập nhật gần nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'timecode', label: 'Theo thời lượng video' },
];

const LessonDetail = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [relatedLessons, setRelatedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
  const [discussionSearch, setDiscussionSearch] = useState('');
  const [discussionSort, setDiscussionSort] = useState('recommend');
  const [discussionLecture, setDiscussionLecture] = useState('all');
  const [notes, setNotes] = useState(() => [...MOCK_NOTES]);
  const [notesSort, setNotesSort] = useState('recent');
  const [notesLecture, setNotesLecture] = useState('all');
  const [noteDraft, setNoteDraft] = useState({
    timestamp: '00:00',
    lectureTitle: 'all',
    content: '',
  });
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const data = await LessonService.getLessonById(id);
        setLesson(data);
        setError(null);

        if (data?.topic) {
          const related = await LessonService.getRelatedLessons({ topic: data.topic, excludeId: data.id, limit: 4 });
          setRelatedLessons(related);
        } else {
          setRelatedLessons([]);
        }
      } catch (err) {
        console.error('Failed to load lesson detail:', err);
        setError('Không tìm thấy bài học hoặc đã bị xoá.');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  useEffect(() => {
    setActiveDetailTab('overview');
  }, [id]);

  const transcriptLanguageGroups = useMemo(() => {
    if (!lesson?.captions || lesson.captions.length === 0) {
      return [];
    }

    const group = lesson.captions.reduce((acc, caption) => {
      const language = caption.language || 'vi';
      if (!acc[language]) {
        acc[language] = [];
      }
      acc[language].push(caption);
      return acc;
    }, {});

    return Object.keys(group).map((language) => ({
      language,
      captions: group[language].sort((a, b) => a.startMs - b.startMs),
    }));
  }, [lesson]);

  useEffect(() => {
    if (transcriptLanguageGroups.length === 0) {
      setActiveLanguage(null);
      return;
    }

    setActiveLanguage((prev) => {
      const stillAvailable = prev && transcriptLanguageGroups.some((group) => group.language === prev);
      return stillAvailable ? prev : transcriptLanguageGroups[0].language;
    });
  }, [transcriptLanguageGroups]);

  const activeCaptions = useMemo(() => {
    if (!activeLanguage) {
      return [];
    }

    const group = transcriptLanguageGroups.find((item) => item.language === activeLanguage);
    return group ? group.captions : [];
  }, [activeLanguage, transcriptLanguageGroups]);

  const infoLines = useMemo(() => {
    if (!lesson) {
      return [];
    }

    return [
      { icon: FaLayerGroup, label: 'Chủ đề', value: lesson.topic || 'Không xác định' },
      { icon: FaSignal, label: 'Trình độ', value: lesson.level || 'Phù hợp mọi trình độ' },
      { icon: FaClock, label: 'Thời lượng', value: formatMinutes(lesson.durationSec) || 'Cập nhật' },
      { icon: FaGlobe, label: 'Ngôn ngữ', value: lesson.language || 'Đa ngôn ngữ' },
      { icon: FaBookOpen, label: 'Trạng thái', value: lesson.status },
    ];
  }, [lesson]);

  const discussionLectureOptions = useMemo(() => {
    const uniqueLectures = Array.from(new Set(MOCK_DISCUSSIONS.map((item) => item.lectureTitle)));
    return ['all', ...uniqueLectures];
  }, []);

  const filteredDiscussions = useMemo(() => {
    const normalizedSearch = discussionSearch.trim().toLowerCase();
    const safeSort = discussionSort;

    let data = [...MOCK_DISCUSSIONS];

    if (discussionLecture !== 'all') {
      data = data.filter((item) => item.lectureTitle === discussionLecture);
    }

    if (normalizedSearch) {
      data = data.filter((item) => {
        const haystack = `${item.title} ${item.excerpt} ${item.author.name}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    data.sort((a, b) => {
      if (safeSort === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (safeSort === 'votes') {
        return b.votes - a.votes;
      }
      const scoreA = a.votes * 2 + a.replies;
      const scoreB = b.votes * 2 + b.replies;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return data;
  }, [discussionLecture, discussionSearch, discussionSort]);

  const noteLectureOptions = useMemo(() => {
    const uniqueLectures = Array.from(new Set(notes.map((item) => item.lectureTitle)));
    return ['all', ...uniqueLectures];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let data = [...notes];

    if (notesLecture !== 'all') {
      data = data.filter((item) => item.lectureTitle === notesLecture);
    }

    data.sort((a, b) => {
      if (notesSort === 'oldest') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      if (notesSort === 'timecode') {
        return parseTimecodeToSeconds(a.timestamp) - parseTimecodeToSeconds(b.timestamp);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return data;
  }, [notes, notesLecture, notesSort]);

  const handleResetNotesFilters = () => {
    setNotesLecture('all');
    setNotesSort('recent');
  };

  const handleAddNote = () => {
    const trimmed = noteDraft.content.trim();
    if (!trimmed) {
      return;
    }

    const match = noteDraft.timestamp.match(/^(\d{1,2}):(\d{1,2})$/);
    const minutes = match ? Number.parseInt(match[1], 10) : 0;
    const seconds = match ? Number.parseInt(match[2], 10) : 0;
    const normalizedTimestamp = `${String(Number.isNaN(minutes) ? 0 : Math.max(minutes, 0)).padStart(2, '0')}:${String(
      Number.isNaN(seconds) ? 0 : Math.min(Math.max(seconds, 0), 59)
    ).padStart(2, '0')}`;

    const lectureTitle = noteDraft.lectureTitle === 'all' ? 'Ghi chú chung' : noteDraft.lectureTitle;
    const newNote = {
      id: `note-${Date.now()}`,
      timestamp: normalizedTimestamp,
      lectureTitle,
      content: trimmed,
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => [newNote, ...prev]);
    setNoteDraft((prev) => ({ ...prev, content: '' }));
  };

  const handleSeekToTimestamp = (startMs) => {
    if (!videoRef.current) {
      return;
    }

    const video = videoRef.current;
    const targetSeconds = Math.max(startMs / 1000, 0);
    video.currentTime = targetSeconds;

    if (video.paused) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    }
  };

  return (
    <div className="lesson-detail-page">
      <Header />

      <main>
        {loading ? (
          <LoadingSpinner fullHeight />
        ) : error ? (
          <div className="container" style={{ padding: '4rem 0' }}>
            <div className="lesson-empty">
              <h3>Ôi! Có lỗi xảy ra</h3>
              <p>{error}</p>
              <Link to="/lessons" className="lesson-card__cta" style={{ maxWidth: 240, margin: '1.5rem auto 0' }}>
                Quay lại danh sách
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section className="lesson-detail-hero">
              <div className="container">
                <div className="lesson-player-wrapper">
                  <div className="lesson-player">
                    {lesson?.videoUrl ? (
                      <video ref={videoRef} controls poster={lesson.thumbnailUrl || undefined}>
                        <source src={lesson.videoUrl} type="application/x-mpegURL" />
                        <source src={lesson.videoUrl} type="video/mp4" />
                        Trình duyệt của bạn không hỗ trợ phát video. Vui lòng tải bài học về để xem.
                      </video>
                    ) : (
                      <div className="lesson-empty" style={{ color: '#ffffff' }}>
                        <FaPlay size={32} />
                        <p>Video sẽ được cập nhật sớm.</p>
                      </div>
                    )}
                  </div>
                </div>

                <aside className="lesson-content-card">
                  <div className="lesson-content-card__header">
                    <h2>Nội dung bài học</h2>
                    {transcriptLanguageGroups.length > 1 ? (
                      <div className="lesson-content-card__languages">
                        {transcriptLanguageGroups.map(({ language }) => (
                          <button
                            type="button"
                            key={language}
                            className={language === activeLanguage ? 'active' : ''}
                            onClick={() => setActiveLanguage(language)}
                          >
                            {language.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    ) : (
                      activeLanguage && <span className="lesson-content-card__language-tag">{activeLanguage.toUpperCase()}</span>
                    )}
                  </div>

                  <div className="lesson-content-card__body">
                    {activeCaptions.length > 0 ? (
                      <div className="lesson-content-card__list">
                        {activeCaptions.map((caption) => (
                          <div
                            className="lesson-caption-line"
                            key={`${caption.startMs}-${caption.endMs}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSeekToTimestamp(caption.startMs)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleSeekToTimestamp(caption.startMs);
                              }
                            }}
                          >
                            <span className="lesson-caption-time">{formatTimestamp(caption.startMs)}</span>
                            <p className="lesson-caption-text">{caption.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="lesson-content-card__placeholder">
                        <p>Nội dung bài học sẽ được cập nhật sớm.</p>
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </section>

            <section className="lesson-detail-body">
              <div className="container">
                <div>
                  <div className="lesson-section lesson-overview">
                    <div className="lesson-detail-tabs">
                      <div className="lesson-detail-tabs__list">
                        <button
                          type="button"
                          className={activeDetailTab === 'overview' ? 'active' : ''}
                          onClick={() => setActiveDetailTab('overview')}
                        >
                          Tổng quan
                        </button>
                        <button
                          type="button"
                          className={activeDetailTab === 'discussion' ? 'active' : ''}
                          onClick={() => setActiveDetailTab('discussion')}
                        >
                          Thảo luận
                        </button>
                        <button
                          type="button"
                          className={activeDetailTab === 'notes' ? 'active' : ''}
                          onClick={() => setActiveDetailTab('notes')}
                        >
                          Ghi chú
                        </button>
                      </div>

                      <div className="lesson-detail-tabs__content">
                        {activeDetailTab === 'overview' && (
                          <div className="lesson-detail-pane">
                            <h2>Tổng quan bài học</h2>
                            <p>
                              {lesson?.description ||
                                'Bài học bao gồm các nội dung thực hành bám sát đề thi TOEIC, kết hợp video tương tác và phần luyện tập đi kèm.'}
                            </p>

                            {lesson?.tags && lesson.tags.length > 0 && (
                              <div className="lesson-info-tags" style={{ marginTop: '1.25rem' }}>
                                {lesson.tags.map((tag) => (
                                  <span key={tag} className="lesson-chip">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="lesson-overview-meta" style={{ marginTop: '2rem' }}>
                              {infoLines.map((item) => (
                                <div key={item.label}>
                                  <span className="lesson-overview-meta__label">
                                    <item.icon /> {item.label}
                                  </span>
                                  <strong>{item.value}</strong>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeDetailTab === 'discussion' && (
                          <div className="lesson-detail-pane discussion-pane">
                            <div className="discussion-toolbar">
                              <div className="discussion-toolbar__search">
                                <FaSearch />
                                <input
                                  type="search"
                                  placeholder="Tìm kiếm tất cả câu hỏi trong khoá học"
                                  value={discussionSearch}
                                  onChange={(event) => setDiscussionSearch(event.target.value)}
                                />
                              </div>

                              <div className="discussion-toolbar__filters">
                                <div className="discussion-toolbar__control">
                                  <label htmlFor="discussion-lecture">Bộ lọc</label>
                                  <select
                                    id="discussion-lecture"
                                    value={discussionLecture}
                                    onChange={(event) => setDiscussionLecture(event.target.value)}
                                  >
                                    {discussionLectureOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option === 'all' ? 'Tất cả các bài giảng' : option}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="discussion-toolbar__control">
                                  <label htmlFor="discussion-sort">Sắp xếp theo</label>
                                  <select
                                    id="discussion-sort"
                                    value={discussionSort}
                                    onChange={(event) => setDiscussionSort(event.target.value)}
                                  >
                                    {DISCUSSION_SORT_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="discussion-summary">
                              <h2>Tất cả các câu hỏi trong khoá học này ({filteredDiscussions.length})</h2>
                              <p>Trao đổi trực tiếp với giảng viên và cộng đồng học viên để giải quyết thắc mắc của bạn.</p>
                            </div>

                            <div className="discussion-list">
                              {filteredDiscussions.length > 0 ? (
                                filteredDiscussions.map((discussion) => (
                                  <article key={discussion.id} className="discussion-card">
                                    <div className="discussion-card__header">
                                      <div className="discussion-card__avatar">{discussion.author.initials}</div>
                                      <div>
                                        <h4>{discussion.title}</h4>
                                        <p>{discussion.excerpt}</p>
                                        <div className="discussion-card__meta">
                                          <span>
                                            {discussion.author.name} · {discussion.lectureTitle}
                                          </span>
                                          <span>{formatRelativeTime(discussion.createdAt)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="discussion-card__footer">
                                      <div className="discussion-card__stats">
                                        <span>
                                          <FaArrowUp /> {discussion.votes}
                                        </span>
                                        <span>
                                          <FaCommentAlt /> {discussion.replies}
                                        </span>
                                      </div>
                                      <button type="button" className="discussion-card__cta">
                                        Tham gia thảo luận
                                      </button>
                                    </div>
                                  </article>
                                ))
                              ) : (
                                <div className="discussion-empty">
                                  <p>Chưa có câu hỏi nào phù hợp bộ lọc hiện tại. Hãy thử điều chỉnh lại bộ lọc hoặc đặt câu hỏi đầu tiên!</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {activeDetailTab === 'notes' && (
                          <div className="lesson-detail-pane notes-pane">
                            <div className="notes-toolbar">
                              <div className="notes-toolbar__filters">
                                <div className="notes-toolbar__control">
                                  <label htmlFor="notes-lecture">Bài giảng</label>
                                  <select
                                    id="notes-lecture"
                                    value={notesLecture}
                                    onChange={(event) => setNotesLecture(event.target.value)}
                                  >
                                    {noteLectureOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option === 'all' ? 'Tất cả các bài giảng' : option}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="notes-toolbar__control">
                                  <label htmlFor="notes-sort">Sắp xếp</label>
                                  <select id="notes-sort" value={notesSort} onChange={(event) => setNotesSort(event.target.value)}>
                                    {NOTE_SORT_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <button type="button" onClick={handleResetNotesFilters} className="notes-toolbar__reset">
                                  Đặt lại
                                </button>
                              </div>
                            </div>

                            <div className="notes-editor">
                              <div className="notes-editor__fields">
                                <div className="notes-editor__row">
                                  <label htmlFor="note-timestamp">Thời điểm (mm:ss)</label>
                                  <input
                                    id="note-timestamp"
                                    type="text"
                                    value={noteDraft.timestamp}
                                    onChange={(event) => setNoteDraft((prev) => ({ ...prev, timestamp: event.target.value }))}
                                  />
                                </div>
                              </div>
                              <div className="notes-editor__content">
                                <textarea
                                  rows={3}
                                  placeholder="Nhập ghi chú của bạn..."
                                  value={noteDraft.content}
                                  onChange={(event) => setNoteDraft((prev) => ({ ...prev, content: event.target.value }))}
                                />
                                <button type="button" onClick={handleAddNote}>
                                  <FaPlus /> Lưu ghi chú
                                </button>
                              </div>
                            </div>

                            <div className="notes-list">
                              {filteredNotes.length > 0 ? (
                                filteredNotes.map((note) => (
                                  <article key={note.id} className="note-card">
                                    <div className="note-card__header">
                                      <span className="note-card__timestamp">
                                        <FaPlay /> {note.timestamp}
                                      </span>
                                      <span className="note-card__lecture">{note.lectureTitle}</span>
                                      <span className="note-card__updated">Cập nhật {formatRelativeTime(note.updatedAt)}</span>
                                    </div>
                                    <p>{note.content}</p>
                                    <div className="note-card__footer">
                                      <button type="button" className="note-card__cta">
                                        <FaPlay /> Phát đoạn này
                                      </button>
                                    </div>
                                  </article>
                                ))
                              ) : (
                                <div className="note-empty">
                                  <p>Chưa có ghi chú nào. Hãy tạo ghi chú đầu tiên để ghi lại những điểm quan trọng.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                <aside className="lesson-sidebar">
                  <div className="lesson-sidebar-card">
                    <h2>Thông tin khoá học</h2>
                    <ul>
                      {infoLines.map((item) => (
                        <li key={item.label}>
                          <span>
                            <item.icon style={{ color: '#8c4bff', marginRight: 8 }} />
                            {item.label}
                          </span>
                          <strong>{item.value}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {relatedLessons.length > 0 && (
                    <div className="lesson-sidebar-card">
                      <h2>Bài học liên quan</h2>
                      <div className="lesson-related-grid">
                        {relatedLessons.map((related) => (
                          <Link key={related.id} to={`/lessons/${related.id}`} className="lesson-related-card">
                            <img
                              src={
                                related.thumbnailUrl ||
                                'https://c8.alamy.com/comp/K9T6D5/studying-concept-english-on-school-board-background-K9T6D5.jpg'
                              }
                              alt={related.title}
                            />
                            <h2>{related.title}</h2>
                            <span>{related.topic || 'Chủ đề tổng hợp'}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </aside>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LessonDetail;
