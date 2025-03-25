import React from 'react';
import '../styles/ExerciseList.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const ListeningCard = ({ part, title, stats, progress }) => {
    const navigate = useNavigate();

    const handlePartClick = () => {
        const partNumber = part.split('-')[1];
        navigate(`/toeic-exercise/part-${partNumber}`);
    };

    return (
        <div
            className={`de-card ${part} cursor-pointer`}
            onClick={handlePartClick}
        >
            <div>
                <h2 className="text-white text-8xl font-bold mb-2">Part {part.split('-')[1]}</h2>
                <p className="text-white text-sm mb-4">TOEIC® LISTENING</p>
            </div>
            <div className="de-card-content">
                <div>
                    <h3 className="text-3xl font-bold mb-2">{title}</h3>
                    <ul className="text-gray-600 mb-4">
                        {stats.map((item, index) => (
                            <li key={index} className="flex items-center mb-2">
                                <i className={`fas ${item.icon} text-orange-500 mr-2`}></i>
                                {item.value}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <div className="flex items-center mb-2">
                        <div className="de-progress-bar">
                            <div className="de-progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <p className="text-green-500 text-sm">{progress === 4 ? '1/26' : '0/26'} bài hoàn thành</p>
                </div>
            </div>
        </div>
    );
};

const ReadingCard = ({ part, title, stats, progress }) => {
    const navigate = useNavigate();
    
    const handlePartClick = () => {
        navigate(`/toeic-exercise/part-${part.split('-')[1]}`);
    };
  
    return (
      <div 
        className={`de-card ${part} cursor-pointer`} 
        onClick={handlePartClick}
      >
        <div>
          <h2 className="text-8xl font-bold text-white mb-2">Part {part.split('-')[1]}</h2>
          <p className="text-white text-opacity-75 mb-4">TOEIC® READING</p>
        </div>
        <div className="de-card-content">
          <div>
            <h3 className="text-3xl font-bold mb-2">{title}</h3>
            {stats.map((item, index) => (
              <p key={index} className="text-gray-700 mb-2">
                <i className={`fas ${item.icon} text-orange-500 mr-2`}></i>
                {item.value}
              </p>
            ))}
          </div>
          <div>
            <div className="flex items-center mb-2">
              <div className="de-progress-bar">
                <div className="de-progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            <p className="text-green-500 font-bold">{progress === 4 ? '1/26' : '0/26'} bài hoàn thành</p>
          </div>
        </div>
      </div>
    );
  };

const ExerciseList = () => {
    const listeningData = [
        {
            part: 'de-1-gradient',
            title: 'Mô tả tranh',
            stats: [
                { icon: 'fa-file-alt', value: '22 bài tập' },
                { icon: 'fa-question-circle', value: '174 câu hỏi' },
                { icon: 'fa-eye', value: '50742 lượt xem' }
            ],
            progress: 4
        },
        {
            part: 'de-2-gradient',
            title: 'Hỏi-Đáp',
            stats: [
                { icon: 'fa-file-alt', value: '22 bài tập' },
                { icon: 'fa-question-circle', value: '174 câu hỏi' },
                { icon: 'fa-eye', value: '50742 lượt xem' }
            ],
            progress: 4
        },
        {
            part: 'de-3-gradient',
            title: 'Đoạn hoại thoại',
            stats: [
                { icon: 'fa-file-alt', value: '22 bài tập' },
                { icon: 'fa-question-circle', value: '174 câu hỏi' },
                { icon: 'fa-eye', value: '50742 lượt xem' }
            ],
            progress: 4
        },
        {
            part: 'de-4-gradient',
            title: 'Bài nói ngắn',
            stats: [
                { icon: 'fa-file-alt', value: '22 bài tập' },
                { icon: 'fa-question-circle', value: '174 câu hỏi' },
                { icon: 'fa-eye', value: '50742 lượt xem' }
            ],
            progress: 4
        }
    ];

    const readingData = [
        {
            part: 'de-5-gradient',
            title: 'Hoàn thành câu',
            stats: [
                { icon: 'fa-file-alt', value: '22 bài tập' },
                { icon: 'fa-question-circle', value: '680 câu hỏi' },
                { icon: 'fa-eye', value: '71350 lượt xem' }
            ],
            progress: 4
        },
        {
            part: 'de-6-gradient',
            title: 'Hoàn thành đoạn văn',
            stats: [
                { icon: 'fa-file-alt', value: '22 bài tập' },
                { icon: 'fa-question-circle', value: '680 câu hỏi' },
                { icon: 'fa-eye', value: '71350 lượt xem' }
            ],
            progress: 0
        },
        {
            part: 'de-7-yellow-gradient',
            title: 'Đoạn đơn',
            stats: [
                { icon: 'fa-file-alt', value: '22 bài tập' },
                { icon: 'fa-question-circle', value: '680 câu hỏi' },
                { icon: 'fa-eye', value: '71350 lượt xem' }
            ],
            progress: 10
        },
        {
            part: 'de-7-blue-gradient',
            title: 'Đoạn Kép',
            stats: [
                { icon: 'fa-file-alt', value: '22 bài tập' },
                { icon: 'fa-question-circle', value: '680 câu hỏi' },
                { icon: 'fa-eye', value: '71350 lượt xem' }
            ],
            progress: 4
        },
        {
            part: 'de-7-green-gradient',
            title: 'Đoạn ba',
            stats: [
                { icon: 'fa-file-alt', value: '22 bài tập' },
                { icon: 'fa-question-circle', value: '680 câu hỏi' },
                { icon: 'fa-eye', value: '71350 lượt xem' }
            ],
            progress: 4
        }
    ];

    return (
        <>
            <Header />
            <div>
                <div className="de-nav-tabs">
                    <div className="de-tab-container">
                        <a href="#" className="de-tab-item active">Nghe & Đọc</a>
                        <a href="#" className="de-tab-item">Nói & Viết</a>
                    </div>
                </div>

                <div className="de-container-wrapper">
                    <h1 className="de-section-title">Luyện Nghe</h1>
                    <div className="de-grid-listening">
                        {listeningData.map((item, index) => (
                            <ListeningCard key={index} {...item} />
                        ))}
                    </div>
                </div>

                <div className="de-container-wrapper">
                    <h1 className="de-section-title">Luyện Đọc</h1>
                    <div className="de-grid-reading">
                        {readingData.map((item, index) => (
                            <ReadingCard key={index} {...item} />
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ExerciseList;