import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/LearnVocabulary.css';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const sampleTopics = [
    { id: 1, name: 'Du lịch', wordCount: 45, image: 'assets/img/gallery/testtopic.jpg' },
    { id: 2, name: 'Ẩm thực', wordCount: 32, image: 'assets/img/gallery/testtopic.jpg' },
    { id: 3, name: 'Thể thao', wordCount: 28, image: 'assets/img/gallery/testtopic.jpg' },
    { id: 4, name: 'Công nghệ', wordCount: 56, image: 'assets/img/gallery/testtopic.jpg' },
    { id: 5, name: 'Y học', wordCount: 41, image: 'assets/img/gallery/testtopic.jpg' },
    { id: 6, name: 'Giáo dục', wordCount: 38, image: 'assets/img/gallery/testtopic.jpg' },
    { id: 7, name: 'Nghệ thuật', wordCount: 27, image: 'assets/img/gallery/testtopic.jpg' },
    { id: 8, name: 'Thời trang', wordCount: 33, image: 'assets/img/gallery/testtopic.jpg' },
    { id: 9, name: 'Động vật', wordCount: 29, image: 'assets/img/gallery/testtopic.jpg' },
    { id: 10, name: 'Xây dựng', wordCount: 39, image: 'assets/img/gallery/testtopic.jpg' },
    { id: 11, name: 'Kinh doanh', wordCount: 48, image: 'assets/img/gallery/testtopic.jpg' },
    { id: 12, name: 'Môi trường', wordCount: 35, image: 'assets/img/gallery/testtopic.jpg' },
];

const ITEMS_PER_PAGE = 9;

const LearnVocabulary = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Lọc danh sách dựa trên từ khóa tìm kiếm
    const filteredTopics = sampleTopics
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
        const topicSlug = topic.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        navigate(`/learn-vocabulary/${topicSlug}`);
    };

    return (
        <div>
            <Header />
            <main className="courses-area section-padding">
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

                    <div className="row">
                        {currentTopics.map((topic) => (
                            <div key={topic.id} className="col-xl-4 col-lg-4 col-md-6">
                                <div className="topic-card">
                                    <img src={topic.image} className="card-img-top" alt={topic.name} />
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
                </div>
            </main>
            <Footer />

            {/* Scroll Up */}
            <div id="back-top">
                <a title="Go to Top" href="#"> <i className="fas fa-level-up-alt"></i></a>
            </div>
        </div>
    );
}

export default LearnVocabulary;
