import React, { useState } from 'react';
import '../styles/ToeicTestPage.css';
import { FaArrowRight } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ToeicTest = () => {
  const [activeTab, setActiveTab] = useState('listening');
  const [openSection, setOpenSection] = useState(null);

  const sections = [
    {
      id: 1,
      title: "TEST ĐẦU VÀO",
      tests: [
        { name: "TEST ĐẦU VÀO (3)", completions: "13.348" },
        { name: "TEST ĐẦU VÀO (2)", completions: "14.186" },
        { name: "TEST ĐẦU VÀO (1)", completions: "49.263" }
      ]
    },
    {
      id: 2,
      title: "HACKER TOEIC 3",
      tests: [
        { name: "HACKER TOEIC 3 - TEST 1", completions: "10.000" },
        { name: "HACKER TOEIC 3 - TEST 2", completions: "8.000" },
        { name: "HACKER TOEIC 3 - TEST 3", completions: "7.500" }
      ]
    },
    {
    id: 3,
    title: "HACKER TOEIC 4",
    tests: [
      { name: "HACKER TOEIC 4 - TEST 1", completions: "10.000" },
      { name: "HACKER TOEIC 4 - TEST 2", completions: "8.000" },
      { name: "HACKER TOEIC 4 - TEST 3", completions: "7.500" }
    ]
    },
   
  ];

  return (
   
    <div className="toeic-container">
       <div id="preloader-active">
                <div class="preloader d-flex align-items-center justify-content-center">
                    <div class="preloader-inner position-relative">
                        <div class="preloader-circle"></div>
                        <div class="preloader-img pere-text">
                            <img src="assets/img/logo/loder.png" alt=""/>
                        </div>
                    </div>
                </div>
            </div>    
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
                  <div className="test-card" key={index}>
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
  );
};

export default ToeicTest;