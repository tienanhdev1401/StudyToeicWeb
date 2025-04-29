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
                        <div id="map" style={{ height: '480px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: '100%', position: 'absolute', top: '0px', left: '0px', backgroundColor: 'rgb(229, 227, 223)' }}>
                            {/* Google Maps iframe and other elements */}
                            </div>
                        </div>
                        <script>
                            {`
                            function initMap() {
                                var uluru = { lat: -25.363, lng: 131.044 };
                                var grayStyles = [
                                {
                                    featureType: "all",
                                    stylers: [{ saturation: -90 }, { lightness: 50 }]
                                },
                                {
                                    elementType: 'labels.text.fill',
                                    stylers: [{ color: '#ccdee9' }]
                                }
                                ];
                                var map = new google.maps.Map(document.getElementById('map'), {
                                center: { lat: -31.197, lng: 150.744 },
                                zoom: 9,
                                styles: grayStyles,
                                scrollwheel: false
                                });
                            }
                            `}
                        </script>
                        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDpfS1oRGreGSBU5HHjMmQ3o5NLw7VdJ6I&callback=initMap"></script>
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
                                </button>
                            </div>
                            </form>
                        </div>
                        <div className="col-lg-3 offset-lg-1">
                            <div className="media contact-info">
                            <span className="contact-info__icon"><i className="ti-home"></i></span>
                            <div className="media-body">
                                <h3>Buttonwood, California.</h3>
                                <p>Rosemead, CA 91770</p>
                            </div>
                            </div>
                            <div className="media contact-info">
                            <span className="contact-info__icon"><i className="ti-tablet"></i></span>
                            <div className="media-body">
                                <h3>+1 253 565 2365</h3>
                                <p>Mon to Fri 9am to 6pm</p>
                            </div>
                            </div>
                            <div className="media contact-info">
                            <span className="contact-info__icon"><i className="ti-email"></i></span>
                            <div className="media-body">
                                <h3>support@colorlib.com</h3>
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
