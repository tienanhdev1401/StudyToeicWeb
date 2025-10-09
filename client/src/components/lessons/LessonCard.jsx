import React from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaGlobe, FaLayerGroup, FaSignal } from 'react-icons/fa';
import '../../styles/LessonCatalog.css';

const LessonCard = ({ lesson }) => {
  if (!lesson) {
    return null;
  }

  const {
    id,
    title,
    description,
    thumbnailUrl,
    durationSec,
    topic,
    level,
    language,
    status,
  } = lesson;

  const durationMinutes = durationSec ? Math.round(durationSec / 60) : null;
  const badgeStatus = status === 'published' ? 'Hot' : status === 'draft' ? 'Đang cập nhật' : 'Ngừng phát hành';

  return (
    <article className="lesson-card">
      <Link to={`/lessons/${id}`} className="lesson-card__thumbnail">
        <img
          src={thumbnailUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=60'}
          alt={title}
          onError={(event) => {
            event.target.src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=60';
          }}
        />
        <span className={`lesson-card__badge lesson-card__badge--${status}`}>
          {badgeStatus}
        </span>
      </Link>

      <div className="lesson-card__body">
        <Link to={`/lessons/${id}`} className="lesson-card__title">
          {title}
        </Link>
        <p className="lesson-card__description">{description || 'Nội dung bài học sẽ được cập nhật đầy đủ.'}</p>

        <div className="lesson-card__meta">
          {topic && (
            <span>
              <FaLayerGroup />
              {topic}
            </span>
          )}
          {level && (
            <span>
              <FaSignal />
              {level}
            </span>
          )}
          {durationMinutes !== null && (
            <span>
              <FaClock />
              {durationMinutes} phút
            </span>
          )}
          {language && (
            <span>
              <FaGlobe />
              {language}
            </span>
          )}
        </div>
      </div>

      <div className="lesson-card__footer">
        <Link to={`/lessons/${id}`} className="lesson-card__cta">
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
};

export default LessonCard;
