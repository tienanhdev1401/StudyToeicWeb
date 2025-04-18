import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/LearnVocabulary.css';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import VocabularyTopicService from '../services/vocabularyTopicService';

const ITEMS_PER_PAGE = 9;

const LearnVocabulary = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVocabularyTopics = async () => {
            try {
                const data = await VocabularyTopicService.getAllVocabularyTopics();
                setTopics(data.map(topic => ({
                    id: topic.id,
                    name: topic.topicName,
                    wordCount: topic.vocabularies?.length || 0,
                    image: topic.imageUrl || 'assets/img/gallery/testtopic.jpg'
                })));
                setLoading(false);
            } catch (err) {
                console.error('Error fetching vocabulary topics:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchVocabularyTopics();
    }, []);

    // Lọc danh sách dựa trên từ khóa tìm kiếm
    const filteredTopics = topics
        .filter(topic => topic.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sắp xếp theo thứ tự bảng chữ cái

    const totalPages = Math.ceil(filteredTopics.length / ITEMS_PER_PAGE);
    const currentTopics = filteredTopics.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
    };

    const handleViewDetail = (topic) => {
        navigate(`/learn-vocabulary/${topic.id}`);
    };

    if (loading) {
        return (
            <div>
                <Header />
                <main className="container">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header />
                <main className="container">
                    <div className="alert alert-danger mt-3">
                        <h4>Đã xảy ra lỗi khi tải dữ liệu</h4>
                        <p>{error}</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => window.location.reload()}
                        >
                            Thử lại
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Header />
            <main>
                <div className="container">
                    <div className="header-container">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm chủ đề..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <h1 className="vocab-page-title">TỪ VỰNG THEO CHỦ ĐỀ</h1>
                    </div>

                    {currentTopics.length === 0 ? (
                        <div className="text-center py-5">
                            <h4>Không tìm thấy chủ đề phù hợp</h4>
                            <p>Hãy thử với từ khóa tìm kiếm khác</p>
                        </div>
                    ) : (
                        <>
                            <div className="row">
                                {currentTopics.map((topic) => (
                                    <div key={topic.id} className="col-xl-4 col-lg-4 col-md-6">
                                        <div className="topic-card">
                                            <img 
                                                src={topic.image} 
                                                className="card-img-top" 
                                                alt={topic.name} 
                                                onError={(e) => {
                                                    e.target.src = 'assets/img/gallery/testtopic.jpg';
                                                }}
                                            />
                                            <div className="card-body">
                                                <h3>{topic.name}</h3>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="word-count">
                                                        <i className="fa-solid fa-book-open"></i>
                                                        <span>{topic.wordCount} từ</span>
                                                    </div>
                                                    <button
                                                        className="btn-detail"
                                                        onClick={() => handleViewDetail(topic)}
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                        Xem chi tiết
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Phân trang */}
                            {totalPages > 1 && (
                                <div className="pagination-wrapper">
                                    <ul className="pagination">
                                        <li className="page-item">
                                            <button
                                                className={`page-link ${currentPage === 1 ? 'disabled' : ''}`}
                                                onClick={() => handlePageChange(currentPage - 1)}
                                            >
                                                &laquo;
                                            </button>
                                        </li>

                                        {[...Array(totalPages).keys()].map((page) => (
                                            <li key={page + 1} className="page-item">
                                                <button
                                                    className={`page-link ${currentPage === page + 1 ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(page + 1)}
                                                >
                                                    {page + 1}
                                                </button>
                                            </li>
                                        ))}

                                        <li className="page-item">
                                            <button
                                                className={`page-link ${currentPage === totalPages ? 'disabled' : ''}`}
                                                onClick={() => handlePageChange(currentPage + 1)}
                                            >
                                                &raquo;
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />

            {/* Scroll Up */}
            <div id="back-top">
                <button
                    className="scroll-top-btn"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="Scroll to top"
                    title="Go to Top"
                >
                    <i className="fas fa-level-up-alt"></i>
                </button>
            </div>
        </div>
    );
}

export default LearnVocabulary;