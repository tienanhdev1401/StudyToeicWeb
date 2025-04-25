import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaBook } from 'react-icons/fa';

const Header = ({ style, className }) => {
    const { isLoggedIn, user } = useAuth();

    return (
        <header style={style} className={className}>
            <div className="header-area header-transparent">
                <div className="main-header ">
                    <div className="header-bottom  header-sticky">
                        <div className="container-fluid">
                            <div className="row align-items-center">
                                <div className="col-xl-2 col-lg-2">
                                    <div className="logo">
                                        <a href="/"><img src="/assets/img/logo/logo.png" alt=""/></a>
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