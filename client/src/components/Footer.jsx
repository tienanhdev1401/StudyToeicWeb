import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="modern-footer">
            <div className="footer-top-area">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-6 mb-5 mb-lg-0">
                            <div className="footer-widget">
                                <div className="footer-logo mb-4">
                                    <Link to="/">
                                        <img src="/assets/img/logo/logo2_footer.png" alt="TOEIC Learning" className="img-fluid" />
                                    </Link>
                                </div>
                                <h3 className="text-white mb-4">TOEIC Learning Platform</h3>
                                <p className="mb-4">Nền tảng học tiếng Anh TOEIC hiệu quả, được phát triển bởi các chuyên gia hàng đầu để giúp bạn đạt điểm cao trong kỳ thi TOEIC.</p>
                                <div className="footer-social-links">
                                    <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
                                    <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
                                    <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
                                    <a href="#" className="social-link"><i className="fab fa-linkedin-in"></i></a>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-lg-2 col-md-6 mb-5 mb-lg-0">
                            <div className="footer-widget">
                                <h4 className="footer-widget-title">Khám Phá</h4>
                                <ul className="footer-links">
                                    <li><Link to="/test-online-new">Thi thử ngay</Link></li>
                                    <li><Link to="/toeic-exercise">Bài Luyện Tập</Link></li>
                                    <li><Link to="/learn-vocabulary">Từ Vựng TOEIC</Link></li>
                                    <li><Link to="/grammar">Ngữ Pháp</Link></li>
                                    <li><Link to="/blog">Blog</Link></li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6 mb-5 mb-lg-0">
                            <div className="footer-widget">
                                <h4 className="footer-widget-title">Thông Tin</h4>
                                <ul className="footer-links">
                                    <li><Link to="/about">Về Chúng Tôi</Link></li>
                                    <li><Link to="/contact">Liên Hệ</Link></li>
                                    <li><Link to="/faq">FAQ</Link></li>
                                    <li><Link to="/terms">Điều Khoản Sử Dụng</Link></li>
                                    <li><Link to="/privacy">Chính Sách Bảo Mật</Link></li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="footer-widget">
                                <h4 className="footer-widget-title">Liên Hệ</h4>
                                <div className="contact-info-footer">
                                    <div className="contact-item mb-3">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <span>1 Võ Văn Ngân, Thủ Đức, TP. Hồ Chí Minh</span>
                                    </div>
                                    <div className="contact-item mb-3">
                                        <i className="fas fa-phone-alt"></i>
                                        <span>+84 123 456 789</span>
                                    </div>
                                    <div className="contact-item mb-3">
                                        <i className="fas fa-envelope"></i>
                                        <span>contact@toeiconline.com</span>
                                    </div>
                                    <div className="contact-item">
                                        <i className="fas fa-clock"></i>
                                        <span>Thứ 2 - Thứ 6: 8:00 - 22:00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom-area">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div className="copyright">
                                <p>© {currentYear} TOEIC Learning Platform. Đã đăng ký bản quyền.</p>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="footer-bottom-links text-md-end">
                                <span>Được phát triển bởi </span>
                                <span className="dev-team">Nhóm 4 Sinh Viên Đại Học Sư Phạm Kỹ Thuật TP. HCM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
