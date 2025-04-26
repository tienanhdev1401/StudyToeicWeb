import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaBook, FaSearch, FaHistory } from 'react-icons/fa';
import '../styles/Header.css';

const Header = ({ style, className }) => {
    const { isLoggedIn, user } = useAuth();
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const searchInputRef = useRef(null);

    const toggleSearch = () => {
        // Chỉ cho phép người dùng đã đăng nhập sử dụng tìm kiếm
        if (isLoggedIn) {
            setShowSearch(!showSearch);
        } else {
            // Có thể thêm thông báo hoặc chuyển hướng người dùng đến trang đăng nhập
            navigate('/login');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim() && isLoggedIn) {
            navigate(`/dictionary?q=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
            setShowSearch(false);
        }
    };

    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showSearch]);

    return (
        <header style={style} className={className}>
            <div className="header-area header-transparent">
                <div className="main-header ">
                    <div className="header-bottom  header-sticky">
                        <div className="container-fluid">
                            <div className="row align-items-center">
                                <div className="col-xl-2 col-lg-2">
                                    <div className="logo">
                                        <a href="/"><img src="/assets/img/logo/logo.png" alt="" /></a>
                                    </div>
                                </div>
                                <div className="col-xl-10 col-lg-10">
                                    <div className="menu-wrapper d-flex align-items-center justify-content-end">
                                        <div className="main-menu d-none d-lg-block">
                                            <nav>
                                                <ul id="navigation">
                                                 
                                                    <li className="active" ><a href="/">Home</a></li>
                                                    <li><a href="/courses">Courses</a></li>
                                                    <li><a href="/about">About</a></li>
                                                    <li><a href="#">Blog</a>
                                                        <ul className="submenu">
                                                            <li><a href="/blog">Blog</a></li>
                                                            <li><a href="/blog_details">Blog Details</a></li>
                                                            <li><a href="/elements">Element</a></li>
                                                        </ul>
                                                    </li>
                                                    <li><a href="/contact">Contact</a></li>
                                                       {/* Icon search đã được di chuyển sang trước Home */}
                                                       <li className="search-icon-wrapper">
                                                        <div className="search-container">
                                                            <FaSearch
                                                                className="search-icon"
                                                                onClick={toggleSearch}
                                                                title={isLoggedIn ? "Tìm từ điển" : "Đăng nhập để tìm kiếm"}
                                                            />
                                                            <div className={`search-box ${showSearch ? 'show' : ''}`}>
                                                                <form onSubmit={handleSearch}>
                                                                    <input
                                                                        ref={searchInputRef}
                                                                        type="text"
                                                                        value={searchTerm}
                                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                                        placeholder="Tìm từ điển..."
                                                                    />
                                                                    <button type="submit">
                                                                        <FaSearch />
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li className="button-header margin-left ">
                                                        <a href="/test-online-new" className="btn">Join</a>
                                                    </li>
                                                    {!isLoggedIn && (
                                                        <li className="button-header margin-left ">
                                                            <Link to="/login" className="btn">Login</Link>
                                                        </li>
                                                    )}
                                                    {isLoggedIn && (
                                                        <>
                                                            <li
                                                                className="notebook-icon-wrapper"
                                                                style={{ marginLeft: '30px' }}
                                                            >
                                                                <Link to="/word-note" className="notebook-icon" title="Sổ tay">
                                                                    <FaBook />
                                                                    <span style={{ marginLeft: '5px' }}>Sổ tay</span>
                                                                </Link>
                                                            </li>
                                                            <li
                                                                className="history-icon-wrapper"
                                                                style={{ marginLeft: '30px' }}
                                                            >
                                                                <Link to="/test-history" className="history-icon" title="Lịch sử làm bài">
                                                                    <FaHistory />
                                                                    <span style={{ marginLeft: '5px' }}>Lịch sử</span>
                                                                </Link>
                                                            </li>
                                                            <li
                                                                className="user-icon-wrapper"
                                                                style={{ marginLeft: '30px' }}
                                                            >
                                                                <Link to="/profile" className="user-icon">
                                                                    <FaUser />
                                                                </Link>
                                                            </li>
                                                        </>
                                                    )}
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mobile_menu d-block d-lg-none"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;