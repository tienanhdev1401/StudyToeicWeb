import React, { useState, useEffect } from 'react';
import '../styles/ToeicTestPage.css';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; //
import Header from '../components/Header';
import Footer from '../components/Footer';
import TestService from '../services/TestService';

const ToeicTest = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listening');
  const [openSection, setOpenSection] = useState(null);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Thêm state loading
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setIsLoading(true); // Bắt đầu loading
        const fetchedSections = await TestService.getAllTests();
        setSections(fetchedSections);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu bài kiểm tra:", err);
      } finally {
        setIsLoading(false); // Kết thúc loading dù thành công hay thất bại
      }
    };

    fetchTestData();
  }, []);



  const handleTestCardClick = (testId) => {
    navigate(`/Stm_Quizzes/${testId}`);
  };
  return (
    <>
      <Header></Header>
      {isLoading && (
        <div id="preloader-active">
          <div className="preloader d-flex align-items-center justify-content-center">
            <div className="preloader-inner position-relative">
              <div className="preloader-circle"></div>
              <div className="preloader-img pere-text">
                <img src="assets/img/logo/loder.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="toeic-container">


        <div className="tab-buttons">
          <button
            className={`tab ${activeTab === 'listening' ? 'active' : ''}`}
            onClick={() => setActiveTab('listening')}
          >
            Listening & Reading
          </button>
          <button
            className={`tab ${activeTab === 'speaking' ? 'active' : ''}`}
            onClick={() => setActiveTab('speaking')}
          >
            Speaking & Writing
          </button>
        </div>

        <div className="main-content">
          {activeTab === 'listening' ? (
            <h1 className="main-title">TOEIC LISTENING & READING - FULL TEST</h1>
          ) : (
            <h1 className="main-title">TOEIC SPEAKING & WRITING - FULL TEST</h1>
          )}
          {sections.map((section) => (
            <div className="section-group" key={section.id}>
              <div
                className="section-header"
                onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              >
                <div className="section-number">{section.id}</div>
                <h2 className="section-title">{section.title}</h2>
                <span className={`arrow-indicator ${openSection === section.id ? 'open' : ''}`}>
                  ▼
                </span>
              </div>
              {openSection === section.id && (
                <div className="test-grid">
                  {section.tests.map((test, index) => (
                    <div
                      className="test-card"
                      key={index}
                      onClick={() => handleTestCardClick(test.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="test-info">
                        <h3 className="test-name">{test.name}</h3>
                        <p className="completions">{test.completions} lượt hoàn thành</p>
                      </div>
                      <FaArrowRight className="arrow-icon" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer></Footer>
    </>


  );
};

export default ToeicTest;