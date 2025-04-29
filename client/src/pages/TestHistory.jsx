import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TestHistoryService from '../services/TestHistoryService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/TestHistory.css';
import LoadingSpinner from '../components/LoadingSpinner';

const TestHistory = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTests, setExpandedTests] = useState({});

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const fetchTestHistory = async () => {
      try {
        setLoading(true);
        const history = await TestHistoryService.getGroupedTestHistory(user.id);
        setTestHistory(history);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy lịch sử làm bài:', err);
        setError('Không thể tải lịch sử làm bài. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchTestHistory();
    }
  }, [isLoggedIn, user, navigate]);

  const toggleExpandTest = (testId) => {
    setExpandedTests(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  const viewSubmissionDetail = (submissionId) => {
    navigate(`/test-history/detail/${submissionId}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="test-history-container">
          <LoadingSpinner />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="test-history-container">
        <div className="test-history-header">
          <h1 className="test-history-title">Lịch sử làm bài</h1>
          <p className="test-history-subtitle">Xem lại quá trình luyện thi TOEIC của bạn</p>
        </div>

        {error && (
          <div className="test-history-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && testHistory.length === 0 && !error && (
          <div className="test-history-empty">
            <p>Bạn chưa làm bài test nào. Hãy thử làm một bài test để cải thiện kỹ năng TOEIC của bạn!</p>
            <button 
              className="test-history-empty-button" 
              onClick={() => navigate('/test-online-new')}
            >
              Làm bài test ngay
            </button>
          </div>
        )}

        <div className="test-history-list">
          {testHistory.map((test) => (
            <div className="test-history-item" key={test.testId}>
              <div 
                className="test-history-item-header" 
                onClick={() => toggleExpandTest(test.testId)}
              >
                <div className="test-history-item-title">
                  <h2>{test.testTitle}</h2>
                  <div className="test-history-item-stats">
                    <span className="test-history-item-attempts">
                      {test.attempts.length} lần thử
                    </span>
                    <span className="test-history-item-high-score">
                      Điểm cao nhất: {test.highestScore}
                    </span>
                  </div>
                </div>
                <div className={`test-history-item-toggle ${expandedTests[test.testId] ? 'expanded' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              {expandedTests[test.testId] && (
                <div className="test-history-item-content">
                  <div className="test-history-attempts-header">
                    <div className="test-history-attempt-date">Ngày làm</div>
                    <div className="test-history-attempt-score">Điểm</div>
                    <div className="test-history-attempt-listening">Listening</div>
                    <div className="test-history-attempt-reading">Reading</div>
                    <div className="test-history-attempt-time">Thời gian</div>
                    <div className="test-history-attempt-actions">Hành động</div>
                  </div>
                  
                  {test.attempts.map((attempt) => (
                    <div className="test-history-attempt" key={attempt.id}>
                      <div className="test-history-attempt-date">
                        {TestHistoryService.formatDate(attempt.date)}
                      </div>
                      <div className="test-history-attempt-score">
                        {attempt.score}
                      </div>
                      <div className="test-history-attempt-listening">
                        {attempt.listeningScore}
                      </div>
                      <div className="test-history-attempt-reading">
                        {attempt.readingScore}
                      </div>
                      <div className="test-history-attempt-time">
                        {TestHistoryService.formatCompletionTime(attempt.completionTime)}
                      </div>
                      <div className="test-history-attempt-actions">
                        <button 
                          className="test-history-view-button"
                          onClick={() => viewSubmissionDetail(attempt.id)}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TestHistory; 