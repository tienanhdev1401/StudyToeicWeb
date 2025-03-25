import React, { useState } from 'react';
import '../styles/ToeicTestPage.css';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; //
import Header from '../components/Header';
import Footer from '../components/Footer';

const ToeicTest = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listening');
  const [openSection, setOpenSection] = useState(null);

  const sections = [
    {
      id: 1,
      title: "TEST ĐẦU VÀO",
      tests: [
        { id: "test1-1", name: "TEST ĐẦU VÀO (3)", completions: "13.348" }, // Thêm ID duy nhất
        { id: "test1-2", name: "TEST ĐẦU VÀO (2)", completions: "14.186" },
        { id: "test1-3", name: "TEST ĐẦU VÀO (1)", completions: "49.263" }
      ]
    },
    {
      id: 2,
      title: "HACKER TOEIC 3",
      tests: [
        { id: "test2-1", name: "HACKER TOEIC 3 - TEST 1", completions: "10.000" },
        { id: "test2-2", name: "HACKER TOEIC 3 - TEST 2", completions: "8.000" },
        { id: "test2-3", name: "HACKER TOEIC 3 - TEST 3", completions: "7.500" }
      ]
    },
    {
      id: 3,
      title: "HACKER TOEIC 4",
      tests: [
        { id: "test3-1", name: "HACKER TOEIC 4 - TEST 1", completions: "10.000" },
        { id: "test3-2", name: "HACKER TOEIC 4 - TEST 2", completions: "8.000" },
        { id: "test3-3", name: "HACKER TOEIC 4 - TEST 3", completions: "7.500" }
      ]
    },
  ];
  
  const handleTestCardClick = (testId) => {
    navigate(`/Stm_Quizzes/${testId}`);
  };
  return (
    <>
     <Header></Header>

  
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