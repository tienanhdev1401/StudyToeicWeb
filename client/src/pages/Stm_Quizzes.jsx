import React, { useState, useEffect } from 'react';
import '../styles/Stm_quizzes.css';
import Footer from '../components/Footer';
import { useNavigate,useParams  } from 'react-router-dom';
import LoginPopup from '../components/LoginPopup';
import TestService from '../services/TestService';

import { useAuth } from '../context/AuthContext'; 

function Stmquizzes() {
  const [showSelectPart, setShowSelectPart,setUserInteracted] = useState(false);
  const { isLoggedIn, user } = useAuth();
  const [selectedTime, setSelectedTime] = useState(120); 
  const [showLoginPopup, setShowLoginPopup] = useState(!isLoggedIn); // Set initial state based on login status
  const [selectedParts, setSelectedParts] = useState([]);
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testTitle, setTestTitle] = useState('');
  const [testData, setTestData] = useState(null);

  const handleTimeChange = (event) => {
    setSelectedTime(Number(event.target.value));
  };
  // Add useEffect to handle login state changes
  useEffect(() => {
    setShowLoginPopup(!isLoggedIn);
  }, [isLoggedIn]);

  // Thêm useEffect để lấy thông tin test
  useEffect(() => {
    const fetchTestInfo = async () => {
      try {
        const testData = await TestService.getTestById(testId);
        setTestTitle(testData.title || `TEST ĐẦU VÀO (${testId})`);
        setTestData(testData);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin test:', error);
        setTestTitle(`TEST ĐẦU VÀO (${testId})`);
      }
    };

    if (testId) {
      fetchTestInfo();
    }
  }, [testId]);

  const handlePartToggle = (partNumber, isChecked) => {
    setSelectedParts(prev =>
      isChecked
        ? [...prev, partNumber]
        : prev.filter(p => p !== partNumber)
    );
  };

  const handleStartTest = () => {
    localStorage.setItem('userInteracted', 'true');
    navigate(`/DoTest/${testId}`, {
      state: {
        selectedParts: selectedParts.length > 0 ? selectedParts : [1, 2, 3, 4, 5, 6, 7],
        timeLimit: selectedTime * 60,
        testData: testData
      }
    });
  };

  const toggleSelectPart = () => {
    setShowSelectPart(!showSelectPart);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="col-xl-2 col-lg-2">
          <div className="logo">
            <a href="/"><img alt="" src={`${process.env.PUBLIC_URL}/assets/img/logo/logo2_footer.png`} /></a>
          </div>
        </div>
        <h1>HỆ THỐNG THI TRỰC TUYẾN</h1>
        <div className="header-right">
          {isLoggedIn && user ? (
            <span>User: {user.email}</span>
          ) : (
            <span>Guest (khách)</span>
          )}
        </div>
      </header>
      <main className="main-content">
        <section className="test-section">
          <h2>{testTitle}</h2>
          <p>Thời gian làm bài thi: <strong>2 giờ</strong></p>
          <p>Cấu trúc đề thi</p>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                onChange={toggleSelectPart}
              />
              <span>Chọn từng part</span>
            </label>
          </div>

          <div className={`time-selector ${showSelectPart ? '' : 'hidden'}`}>
            <label>Chọn thời gian làm bài:</label>
            <select value={selectedTime} onChange={handleTimeChange}>
              <option value="120">2 giờ</option>
              <option value="0.3">test phút</option>
              <option value="5">5 phút</option>
              <option value="10">10 phút</option>
              <option value="15">15 phút</option>
              <option value="20">20 phút</option>
              <option value="25">25 phút</option>
              <option value="30">30 phút</option>
              <option value="35">35 phút</option>
              <option value="40">40 phút</option>
              <option value="45">45 phút</option>
              <option value="50">50 phút</option>
              <option value="55">55 phút</option>
              <option value="60">60 phút</option>
              <option value="65">65 phút</option>
              <option value="70">70 phút</option>
              <option value="75">75 phút</option>
              <option value="80">80 phút</option>
              <option value="85">85 phút</option>
              <option value="90">90 phút</option>
              <option value="95">95 phút</option>
              <option value="100">100 phút</option>
              <option value="105">105 phút</option>
              <option value="110">110 phút</option>
              <option value="115">115 phút</option>
            </select>
          </div>

          <div className="parts-container">
            {/* Component cho Listening và Reading */}
            <TestSection
              title="LISTENING"
              parts={[
                { number: 1, name: 'Part 1', questions: 6 },
                { number: 2, name: 'Part 2', questions: 25 },
                { number: 3, name: 'Part 3', questions: 39 },
                { number: 4, name: 'Part 4', questions: 30 },
              ]}
              showCheckboxes={showSelectPart}
              selectedParts={selectedParts}
              onPartToggle={handlePartToggle}
            />

            <TestSection
              title="READING"
              parts={[
                { number: 5, name: 'Part 5', questions: 30 },
                { number: 6, name: 'Part 6', questions: 16 },
                { number: 7, name: 'Part 7', questions: 54 },
              ]}
              showCheckboxes={showSelectPart}
              selectedParts={selectedParts}
              onPartToggle={handlePartToggle}
            />
          </div>

          <div className="start-button-container">
            <button
              className="start-button"
              onClick={handleStartTest}
            >
              BẮT ĐẦU
            </button>
          </div>
        </section>

        {showLoginPopup && !isLoggedIn && (
          <LoginPopup onClose={() => setShowLoginPopup(false)} />
        )}
      </main>
      <Footer></Footer>
    </div>
  );
}

const TestSection = ({ title, parts, showCheckboxes, selectedParts, onPartToggle }) => (
  <div className="test-part">
    <h3>{title}</h3>
    <table>
      <tbody>
        {parts.map((part, index) => (
          <tr key={index}>
            <td className={showCheckboxes ? '' : 'hidden'}>
              <input
                type="checkbox"
                checked={selectedParts.includes(part.number)}
                onChange={(e) => onPartToggle(part.number, e.target.checked)}
              />
            </td>
            <td>{part.name}</td>
            <td>{part.questions} câu</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Stmquizzes;