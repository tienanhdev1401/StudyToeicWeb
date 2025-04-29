import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/about.css'; // We'll create this file later

const About = () => {
    useEffect(() => {
        // Animation for team members on scroll
        const animateOnScroll = () => {
            const teamCards = document.querySelectorAll('.team-card');
            teamCards.forEach((card, index) => {
                const position = card.getBoundingClientRect().top;
                const screenPosition = window.innerHeight / 1.3;
                
                if (position < screenPosition) {
                    setTimeout(() => {
                        card.classList.add('animate');
                    }, index * 200); // Staggered animation
                }
            });
        };

        window.addEventListener('scroll', animateOnScroll);
        // Trigger once on load
        setTimeout(animateOnScroll, 300);
        
        return () => window.removeEventListener('scroll', animateOnScroll);
    }, []);

    return (
        <div className="about-page">
            {/* Header Start */}
            <Header />
            {/* Header End */}
            
            <main>
                {/* Team Header Section */}
                <section className="team-header">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-8 col-lg-10">
                                <div className="team-title text-center">
                                    <h1 className="display-4 animated-heading">Our Team</h1>
                                    <div className="title-underline"></div>
                                    <p className="lead mt-4">Our team consists of four members working together to develop a TOEIC learning website that helps users practice and improve their English skills effectively.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Members Section */}
                <section className="team-showcase">
                    <div className="container">
                        <div className="row">
                            {/* Team Member 1 */}
                            <div className="col-lg-6 mb-5">
                                <div className="team-card team-card-left">
                                    <div className="card-content">
                                        <div className="member-image">
                                            <img src="assets/img/gallery/team1.png" alt="Trần Phan Tiến Anh" className="img-fluid rounded-circle" />
                                            <div className="image-overlay"></div>
                                        </div>
                                        <div className="member-info">
                                            <div className="member-detail">
                                                <h2>Trần Phan Tiến Anh</h2>
                                                <h4>Team Leader</h4>
                                                <p>Coordinates team efforts and leads project development with exceptional management skills and strategic vision. Ensures all parts of the project come together seamlessly.</p>
                                                <div className="social-links">
                                                    <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                                                    <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                                                    <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                                                    <a href="#" className="social-icon"><i className="fab fa-github"></i></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Team Member 2 */}
                            <div className="col-lg-6 mb-5">
                                <div className="team-card team-card-right">
                                    <div className="card-content">
                                        <div className="member-image">
                                            <img src="assets/img/gallery/team2.png" alt="Phan Hùng Anh" className="img-fluid rounded-circle" />
                                            <div className="image-overlay"></div>
                                        </div>
                                        <div className="member-info">
                                            <div className="member-detail">
                                                <h2>Phan Hùng Anh</h2>
                                                <h4>Super Developer</h4>
                                                <p>Leads backend development and system architecture with innovative solutions and cutting-edge technologies. Creates robust, scalable, and efficient code.</p>
                                                <div className="social-links">
                                                    <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                                                    <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                                                    <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                                                    <a href="#" className="social-icon"><i className="fab fa-github"></i></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Team Member 3 */}
                            <div className="col-lg-6 mb-5">
                                <div className="team-card team-card-left">
                                    <div className="card-content">
                                        <div className="member-image">
                                            <img src="assets/img/gallery/team3.png" alt="Nguyễn Hiếu Nghĩa" className="img-fluid rounded-circle" />
                                            <div className="image-overlay"></div>
                                        </div>
                                        <div className="member-info">
                                            <div className="member-detail">
                                                <h2>Nguyễn Hiếu Nghĩa</h2>
                                                <h4>Super UI Designer</h4>
                                                <p>Creates beautiful and intuitive user interfaces with a keen eye for detail and modern design principles. Transforms complex ideas into elegant, user-friendly experiences.</p>
                                                <div className="social-links">
                                                    <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                                                    <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                                                    <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                                                    <a href="#" className="social-icon"><i className="fab fa-github"></i></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Team Member 4 */}
                            <div className="col-lg-6 mb-5">
                                <div className="team-card team-card-right">
                                    <div className="card-content">
                                        <div className="member-image">
                                            <img src="assets/img/gallery/team4.png" alt="Hồ Kim Trí" className="img-fluid rounded-circle" />
                                            <div className="image-overlay"></div>
                                        </div>
                                        <div className="member-info">
                                            <div className="member-detail">
                                                <h2>Hồ Kim Trí</h2>
                                                <h4>Super Eater</h4>
                                                <p>Keeps the team energized and maintains high spirits with his amazing food recommendations and enthusiasm. Boosts team morale and creates a positive work environment.</p>
                                                <div className="social-links">
                                                    <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                                                    <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                                                    <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                                                    <a href="#" className="social-icon"><i className="fab fa-github"></i></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Quote Section */}
                <section className="team-quote">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-10">
                                <div className="quote-container text-center">
                                    <div className="quote-icon">
                                        <i className="fas fa-quote-left"></i>
                                    </div>
                                    <h3 className="quote-text">Coming together is a beginning. Keeping together is progress. Working together is success.</h3>
                                    <p className="quote-author">- Henry Ford</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            
            <Footer />

            {/* Scroll Up */}
            <div id="back-top">
                <a title="Go to Top" href="#"> <i className="fas fa-level-up-alt"></i></a>
            </div>
        </div>
    );
}

export default About;
