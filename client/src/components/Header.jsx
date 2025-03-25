import React from 'react';
import { FaUser } from 'react-icons/fa';

const Header = ({ style, className }) => {
    return (
        <header style={style} className={className}>
            {/* Header Start */}
            <div className="header-area header-transparent">
                <div className="main-header ">
                    <div className="header-bottom  header-sticky">
                        <div className="container-fluid">
                            <div className="row align-items-center">
                                {/* Logo */}
                                <div className="col-xl-2 col-lg-2">
                                    <div className="logo">
                                        <a href="/"><img src="/assets/img/logo/logo.png" alt=""/></a>
                                    </div>
                                </div>
                                <div className="col-xl-10 col-lg-10">
                                    <div className="menu-wrapper d-flex align-items-center justify-content-end">
                                        {/* Main-menu */}
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
                                                    {/* Button */}
                                                    <li className="button-header margin-left "><a href="/test-online-new" className="btn">Join</a></li>
                                                    <li className="button-header"><a href="/login" className="btn btn3">Log in</a></li>
                                                    <li className="user-icon-wrapper" style={{ marginLeft: '30px' }} ><a href="/profile" className="user-icon"><FaUser /></a>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                </div> 
                                {/* Mobile Menu */}
                                <div className="col-12">
                                    <div className="mobile_menu d-block d-lg-none"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Header End */}
        </header>
    );
}

export default Header;