import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoadmapByLearnerId, generateRoadmap } from '../services/roadmapService';
import { getLearningGoalByLearnerId } from '../services/learningGoalService';
import ReactMarkdown from 'react-markdown';
import '../styles/Roadmap.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoad, faSync, faChartLine, faCalendarAlt, faClock, faTrophy, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const Roadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [learningGoal, setLearningGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();
  
  // Lấy thông tin người dùng từ localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Lấy learning goal
      const goalResponse = await getLearningGoalByLearnerId(user.id);
      setLearningGoal(goalResponse.data);
      
      // Lấy roadmap
      const roadmapResponse = await getRoadmapByLearnerId(user.id);
      setRoadmap(roadmapResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    try {
      if (!learningGoal) {
        toast.error("Bạn cần thiết lập mục tiêu học tập trước!");
        navigate('/profile');
        return;
      }
      
      setGenerating(true);
      const response = await generateRoadmap(user.id);
      
      if (response.success) {
        setRoadmap(response.data);
        toast.success("Đã tạo lộ trình học tập thành công!");
      } else {
        toast.error(response.message || "Không thể tạo lộ trình. Vui lòng thử lại.");
      }
      
      setGenerating(false);
    } catch (error) {
      console.error("Lỗi khi tạo roadmap:", error);
      toast.error("Đã xảy ra lỗi khi tạo lộ trình học tập");
      setGenerating(false);
    }
  };

  

  return (
    <>
    <Header />
    <div className="roadmap-container">
      <div className="roadmap-header">
        <h1><FontAwesomeIcon icon={faRoad} /> Lộ trình học TOEIC cá nhân</h1>
        {learningGoal && (
          <div className="learning-goal-info">
            <p>
              <FontAwesomeIcon icon={faTrophy} /> Mục tiêu: <strong>{learningGoal.scoreTarget} điểm</strong> &nbsp;
              <FontAwesomeIcon icon={faClock} /> Thời gian: <strong>{learningGoal.duration} ngày</strong>
            </p>
          </div>
        )}
      </div>

      {!learningGoal && (
        <div className="no-goal-message">
          <FontAwesomeIcon icon={faExclamationCircle} size="3x" style={{ color: '#4527A0', marginBottom: '1rem' }} />
          <h2>Bạn chưa thiết lập mục tiêu học tập</h2>
          <p>Để tạo lộ trình học TOEIC cá nhân phù hợp, hãy thiết lập mục tiêu điểm số và thời gian bạn muốn đạt được.</p>
          <button onClick={() => navigate('/profile')} className="btn-primary">
            <FontAwesomeIcon icon={faChartLine} /> Thiết lập mục tiêu ngay
          </button>
        </div>
      )}

      {learningGoal && !roadmap && (
        <div className="no-roadmap-message">
          <FontAwesomeIcon icon={faRoad} size="3x" style={{ color: '#4527A0', marginBottom: '1rem' }} />
          <h2>Bạn chưa tạo lộ trình học tập</h2>
          <p>Hệ thống sẽ tạo lộ trình học TOEIC cá nhân phù hợp với mục tiêu học tập của bạn. Quá trình này có thể mất vài giây.</p>
          <button 
            onClick={handleGenerateRoadmap} 
            className="btn-primary"
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="loading-spinner" style={{ width: '20px', height: '20px', margin: '0 10px 0 0' }}></span>
                Đang tạo lộ trình...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faRoad} /> Tạo lộ trình học tập
              </>
            )}
          </button>
        </div>
      )}

      {roadmap && (
        <div className="roadmap-content">
          <div className="roadmap-actions">
            <button 
              onClick={handleGenerateRoadmap} 
              className="btn-refresh"
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="loading-spinner" style={{ width: '16px', height: '16px', margin: '0 8px 0 0' }}></span>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSync} /> Cập nhật lộ trình
                </>
              )}
            </button>
          </div>
          
          <div className="roadmap-details">
            <h2 className="roadmap-title">{roadmap.tittle}</h2>
            <p className="roadmap-date">
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
              Cập nhật lần cuối: {new Date(roadmap.updatedAt || roadmap.createdAt).toLocaleDateString('vi-VN')}
            </p>
            <div className="roadmap-markdown">
              <ReactMarkdown 
                components={{
                  h2: ({node, ...props}) => <h2 className="roadmap-phase-title" {...props} />,
                  section: ({node, ...props}) => <section className="roadmap-phase" {...props} />,
                  h3: ({node, ...props}) => {
                    if (props.children.toString().includes('TÀI NGUYÊN HỌC TẬP')) {
                      return <h3 className="roadmap-resources-title" {...props} />;
                    }
                    return <h3 {...props} />;
                  },
                }}
              >
                {roadmap.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </>
  );
};

export default Roadmap; 