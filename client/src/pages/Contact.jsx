import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact = () => {
    return (
        <div>
            {/*? Preloader Start */}
            <div id="preloader-active">
                <div class="preloader d-flex align-items-center justify-content-center">
                    <div class="preloader-inner position-relative">
                        <div class="preloader-circle"></div>
                        <div class="preloader-img pere-text">
                            <img src="assets/img/logo/loder.png" alt=""/>
                        </div>
                    </div>
                </div>
            </div>
            {/* Preloader Start */}
            {/* Header Start */}
            <Header />
            {/* Header End */}
            <main>
                {/*? slider Area Start*/}
                <section class="slider-area slider-area2">
                    <div class="slider-active">
                        {/* Single Slider */}
                        <div class="single-slider slider-height2">
                            <div class="container">
                                <div class="row">
                                    <div class="col-xl-8 col-lg-11 col-md-12">
                                        <div class="hero__caption hero__caption2">
                                            <h1 data-animation="bounceIn" data-delay="0.2s">Contact us</h1>
                                        </div>
                                    </div>
                                </div>
                            </div>          
                        </div>
                    </div>
                </section>
                {/*?  Contact Area start  */}
                <section className="contact-section">
                    <div className="container">
                        <div className="d-none d-sm-block mb-5 pb-4">
                            {/* Google Maps iframe embedding */}
                            <div style={{ width: '100%', height: '480px' }}>
                                <iframe 
                                    title="Our Location"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.485398611068!2d106.76973851411706!3d10.85045636070329!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752763f23816ab%3A0x282f711441b6916f!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBTxrAgcGjhuqFtIEvhu7kgdGh14bqtdCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmg!5e0!3m2!1sen!2s!4v1654959777599!5m2!1sen!2s"
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    allowFullScreen=""
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade">
                                </iframe>
                            </div>
                        </div>
                        <div className="row">
                        <div className="col-12">
                            <h2 className="contact-title">Get in Touch</h2>
                        </div>
                        <div className="col-lg-8">
                            <form className="form-contact contact_form" action="contact_process.php" method="post" id="contactForm" noValidate>
                            <div className="row">
                                <div className="col-12">
                                <div className="form-group">
                                    <textarea
                                    className="form-control w-100"
                                    name="message"
                                    id="message"
                                    cols="30"
                                    rows="9"
                                    placeholder="Enter Message"
                                    onFocus={(e) => (e.target.placeholder = '')}
                                    onBlur={(e) => (e.target.placeholder = 'Enter Message')}
                                    ></textarea>
                                </div>
                                </div>
                                <div className="col-sm-6">
                                <div className="form-group">
                                    <input
                                    className="form-control valid"
                                    name="name"
                                    id="name"
                                    type="text"
                                    placeholder="Enter your name"
                                    onFocus={(e) => (e.target.placeholder = '')}
                                    onBlur={(e) => (e.target.placeholder = 'Enter your name')}
                                    />
                                </div>
                                </div>
                                <div className="col-sm-6">
                                <div className="form-group">
                                    <input
                                    className="form-control valid"
                                    name="email"
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    onFocus={(e) => (e.target.placeholder = '')}
                                    onBlur={(e) => (e.target.placeholder = 'Enter email address')}
                                    />
                                </div>
                                </div>
                                <div className="col-12">
                                <div className="form-group">
                                    <input
                                    className="form-control"
                                    name="subject"
                                    id="subject"
                                    type="text"
                                    placeholder="Enter Subject"
                                    onFocus={(e) => (e.target.placeholder = '')}
                                    onBlur={(e) => (e.target.placeholder = 'Enter Subject')}
                                    />
                                </div>
                                </div>
                            </div>
                            <div className="form-group mt-3">
                                <button type="submit" className="button button-contactForm boxed-btn">
                                Send
                                </button>button button-contactForm boxed-btn
                            </div>
                            </form>
                        </div>
                        <div className="col-lg-3 offset-lg-1">
                            <div className="media contact-info">
                            <span className="contact-info__icon"><i className="ti-home"></i></span>
                            <div className="media-body">
                                <h3>1 Võ Văn Ngân</h3>
                                <p>Thủ Đức, Hồ Chí Minh City, Vietnam</p>
                            </div>
                            </div>
                            <div className="media contact-info">
                            <span className="contact-info__icon"><i className="ti-tablet"></i></span>
                            <div className="media-body">
                                <h3>+1 234 567 890</h3>
                                <p>Mon to Fri 9am to 6pm</p>
                            </div>
                            </div>
                            <div className="media contact-info">
                            <span className="contact-info__icon"><i className="ti-email"></i></span>
                            <div className="media-body">
                                <h3>contact@gmail.com</h3>
                                <p>Send us your query anytime!</p>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </section>
                {/* Contact Area End */}
            </main>
            <Footer></Footer> 
            <div id="back-top" >
                <a title="Go to Top" href="#"> <i class="fas fa-level-up-alt"></i></a>
            </div>
        </div>
    );
}

export default Contact;
