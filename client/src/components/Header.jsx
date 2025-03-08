import React from 'react';

const Header = () => {
    return (
        <div>
            <header>
                {/* Header Start */}
                <div class="header-area header-transparent">
                    <div class="main-header ">
                        <div class="header-bottom  header-sticky">
                            <div class="container-fluid">
                                <div class="row align-items-center">
                                    {/* Logo */}
                                    <div class="col-xl-2 col-lg-2">
                                        <div class="logo">
                                            <a href="/"><img src="assets/img/logo/logo.png" alt=""/></a>
                                        </div>
                                    </div>
                                    <div class="col-xl-10 col-lg-10">
                                        <div class="menu-wrapper d-flex align-items-center justify-content-end">
                                            {/* Main-menu */}
                                            <div class="main-menu d-none d-lg-block">
                                                <nav>
                                                    <ul id="navigation">                                                                                          
                                                        <li class="active" ><a href="/">Home</a></li>
                                                        <li><a href="/courses">Courses</a></li>
                                                        <li><a href="/about">About</a></li>
                                                        <li><a href="#">Blog</a>
                                                            <ul class="submenu">
                                                                <li><a href="/blog">Blog</a></li>
                                                                <li><a href="/blog_details">Blog Details</a></li>
                                                                <li><a href="/elements">Element</a></li>
                                                            </ul>
                                                        </li>
                                                        <li><a href="/contact">Contact</a></li>
                                                        {/* Button */}
                                                        <li class="button-header margin-left "><a href="/test-online-new" class="btn">Join</a></li>
                                                        <li class="button-header"><a href="/login" class="btn btn3">Log in</a></li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        </div>
                                    </div> 
                                    {/* Mobile Menu */}
                                    <div class="col-12">
                                        <div class="mobile_menu d-block d-lg-none"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Header End */}
            </header>
        </div>
    );
}

export default Header;
