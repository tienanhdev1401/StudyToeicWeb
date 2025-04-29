import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VocabularyTopicService from '../services/vocabularyTopicService';
import GrammarTopicService from '../services/grammarTopicService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [recentTopics, setRecentTopics] = useState([]);
    const [grammarTopics, setGrammarTopics] = useState([]);
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const allTopics = await VocabularyTopicService.getAllVocabularyTopics();
                // Lấy 4 chủ đề cuối cùng
                setRecentTopics(allTopics.slice(-4));
            } catch (error) {
                setRecentTopics([]);
            }
        };
        fetchTopics();

        // Lấy 8 chủ đề grammar cuối cùng
        const fetchGrammarTopics = async () => {
            try {
                const allGrammarTopics = await GrammarTopicService.getAllGrammarTopics();
                setGrammarTopics(allGrammarTopics.slice(-4));
            } catch (error) {
                setGrammarTopics([]);
            }
        };
        fetchGrammarTopics();
    }, []);

    return (
        <div>

            {/* ? Preloader Start */}
            {/* <div id="preloader-active">
                <div className="preloader d-flex align-items-center justify-content-center">
                    <div className="preloader-inner position-relative">
                        <div className="preloader-circle"></div>
                        <div className="preloader-img pere-text">
                            <img src="assets/img/logo/loder.png" alt="" />
                        </div>
                    </div>
                </div>
            </div> */}
            {/* Preloader Start */}

            <Header></Header>

            <main>
                {/*? slider Area Start*/}
                <section className="slider-area ">
                    <div className="slider-active">
                        {/* Single Slider */}
                        <div className="single-slider slider-height d-flex align-items-center">
                            <div className="container">
                                <div className="row">
                                    <div className="col-xl-6 col-lg-7 col-md-12">
                                        <div className="hero__caption">
                                            <h1 data-animation="fadeInLeft" data-delay="0.2s">Online learning<br /> platform</h1>
                                            <p data-animation="fadeInLeft" data-delay="0.4s">Build skills with courses, certificates, and degrees online from world-class universities and companies</p>
                                            <a href="#" className="btn hero-btn" data-animation="fadeInLeft" data-delay="0.7s">Join for Free</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* ? services-area */}
                <div className="services-area">
                    <div className="container">
                        <div className="row justify-content-sm-center">
                            <div className="col-lg-4 col-md-6 col-sm-8">
                                <div className="single-services mb-30">
                                    <div className="features-icon">
                                        <img src="assets/img/icon/icon1.svg" alt="" />
                                    </div>
                                    <div className="features-caption">
                                        <h3>60+ UX courses</h3>
                                        <p>The automated process all your website tasks.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-8">
                                <div className="single-services mb-30">
                                    <div className="features-icon">
                                        <img src="assets/img/icon/icon2.svg" alt="" />
                                    </div>
                                    <div className="features-caption">
                                        <h3>Expert instructors</h3>
                                        <p>The automated process all your website tasks.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-8">
                                <div className="single-services mb-30">
                                    <div className="features-icon">
                                        <img src="assets/img/icon/icon3.svg" alt="" />
                                    </div>
                                    <div className="features-caption">
                                        <h3>Life time access</h3>
                                        <p>The automated process all your website tasks.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Courses area start */}
                <div className="courses-area section-padding40 fix">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-7 col-lg-8">
                                <div className="section-tittle text-center mb-55">
                                    <h2>Our featured courses</h2>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {[
                                {
                                    id: 1,
                                    title: "Learn Vocabulary",
                                    image: "assets/img/gallery/topic1.png",
                                    pageLink: "/learn-vocabulary"
                                },
                                {
                                    id: 2,
                                    title: "Learn Grammar",
                                    image: "assets/img/gallery/topic2.png",
                                    pageLink: "/learn-grammary"
                                },
                                {
                                    id: 3,
                                    title: "Practice Exercises",
                                    image: "assets/img/gallery/topic3.png",
                                    pageLink: "/toeic-exercise"
                                }
                            ].map((course) => (
                                <div className="col-lg-4 col-md-6" key={course.id}>
                                    <div className="properties pb-20">
                                        <div className="properties__card">
                                            <div className="properties__img overlay1" style={{ height: "200px", overflow: "hidden" }}>
                                                <a href="#" onClick={e => { e.preventDefault(); if (isLoggedIn) { navigate(course.pageLink); } else { navigate('/login'); } }}>
                                                    <img
                                                        src={course.image}
                                                        alt={course.title}
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                </a>
                                            </div>
                                            <div className="properties__caption">
                                                <h3><a href="#" onClick={e => { e.preventDefault(); if (isLoggedIn) { navigate(course.pageLink); } else { navigate('/login'); } }}>{course.title}</a></h3>
                                                <p>
                                                    {course.id === 1 && "Expand your word knowledge with interactive lessons and daily practice sessions."}
                                                    {course.id === 2 && "Master grammar rules through comprehensive guides and real-world examples."}
                                                    {course.id === 3 && "Master grammar rules through comprehensive guides and real-world examples."}
                                                </p>
                                                <div className="properties__footer d-flex justify-content-between align-items-center">
                                                    <div className="progress-info" style={{ width: "100%" }}>
                                                        <span className="badge">Daily Goal</span>
                                                        <div className="progress">
                                                            <div
                                                                className="progress-bar"
                                                                role="progressbar"
                                                                style={{ width: `${Math.random() * 70 + 30}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <a href="#" onClick={e => { e.preventDefault(); if (isLoggedIn) { navigate(course.pageLink); } else { navigate('/login'); } }} className="border-btn border-btn2 mt-3">
                                                    Start Learning
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Courses area End */}
                {/*? About Area-1 Start */}
                <section className="about-area1 fix pt-10">
                    <div className="support-wrapper align-items-center">
                        <div className="left-content1">
                            <div className="about-icon">
                                <img src="assets/img/icon/about.svg" alt="" />
                            </div>
                            {/* section tittle */}
                            <div className="section-tittle section-tittle2 mb-55">
                                <div className="front-text">
                                    <h2 className="">Learn new skills online with top educators</h2>
                                    <p>The automated process all your website tasks. Discover tools and
                                        techniques to engage effectively with vulnerable children and young
                                        people.</p>
                                </div>
                            </div>
                            <div className="single-features">
                                <div className="features-icon">
                                    <img src="assets/img/icon/right-icon.svg" alt="" />
                                </div>
                                <div className="features-caption">
                                    <p>Techniques to engage effectively with vulnerable children and young people.</p>
                                </div>
                            </div>
                            <div className="single-features">
                                <div className="features-icon">
                                    <img src="assets/img/icon/right-icon.svg" alt="" />
                                </div>
                                <div className="features-caption">
                                    <p>Join millions of people from around the world  learning together.</p>
                                </div>
                            </div>

                            <div className="single-features">
                                <div className="features-icon">
                                    <img src="assets/img/icon/right-icon.svg" alt="" />
                                </div>
                                <div className="features-caption">
                                    <p>Join millions of people from around the world learning together. Online learning is as easy and natural.</p>
                                </div>
                            </div>
                        </div>
                        <div className="right-content1">
                            {/* img */}
                            <div className="right-img">
                                <img src="assets/img/gallery/about.png" alt="" />

                                <div className="video-icon" >
                                    <a className="popup-video btn-icon" href="https://www.youtube.com/watch?v=up68UAfH0d0"><i className="fas fa-play"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* About Area End */}
                {/*? top subjects Area Start */}
                <div className="topic-area section-padding40">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-7 col-lg-8">
                                <div className="section-tittle text-center mb-55">
                                    <h2>Explore top subjects</h2>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {recentTopics.length > 0 ? recentTopics.map((topic) => (
                                <div className="col-lg-3 col-md-4 col-sm-6" key={topic.id}>
                                    <div className="single-topic text-center mb-30">
                                        <div className="topic-img">
                                            <img
                                                src={topic.imageUrl}
                                                alt={topic.topicName}
                                                style={{
                                                    width: '100%',
                                                    height: '180px',
                                                    objectFit: 'cover',
                                                    borderRadius: '12px'
                                                }}
                                            />
                                            <div className="topic-content-box">
                                                <div className="topic-content">
                                                    <h3>
                                                        <span
                                                            style={{
                                                                display: 'inline-block',
                                                                background: 'rgba(255,255,255,0.8)',
                                                                borderRadius: '8px',
                                                                padding: '2px 12px',
                                                                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)'
                                                            }}
                                                        >
                                                            <a
                                                                href="#" onClick={e => { e.preventDefault(); if (isLoggedIn) { navigate(`/learn-vocabulary/${topic.id}`); } else { navigate('/login'); } }}
                                                                style={{
                                                                    fontWeight: 'bold',
                                                                    background: 'linear-gradient(90deg, rgb(192, 84, 255) 0%, rgb(82, 116, 255) 100%)',
                                                                    WebkitBackgroundClip: 'text',
                                                                    WebkitTextFillColor: 'transparent',
                                                                    backgroundClip: 'text',
                                                                    textFillColor: 'transparent',
                                                                    fontSize: '1.2rem'
                                                                }}
                                                            >
                                                                {topic.topicName}
                                                            </a>
                                                        </span>
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-12 text-center">Đang tải chủ đề...</div>
                            )}
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-xl-12">
                                <div className="section-tittle text-center mt-20">
                                    <a href="#" onClick={e => { e.preventDefault(); if (isLoggedIn) { navigate('/learn-vocabulary'); } else { navigate('/login'); } }} className="border-btn">View More Vocabulary Topics</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* top subjects End */}

                {/* Grammar topics Area Start */}
                <div className="grammar-area section-padding40">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-7 col-lg-8">
                                <div className="section-tittle text-center mb-55">
                                    <h2>Explore Grammar Topics</h2>
                                </div>
                            </div>
                        </div>
                        <div className="row justify-content-center" style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {grammarTopics.length > 0 && grammarTopics.map((topic, idx) => (
                                <div
                                    key={topic.id}
                                    style={{
                                        flex: '0 0 12.5%', // 1/8 chiều rộng
                                        maxWidth: '12.5%',
                                        padding: 8,
                                        boxSizing: 'border-box',
                                        minWidth: 120 // Đảm bảo không quá nhỏ trên màn hình nhỏ
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(90deg, rgb(192, 84, 255), rgb(82, 116, 255))',
                                            borderRadius: 12,
                                            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                                            width: '100%',
                                            minHeight: 80
                                        }}
                                    >
                                        <a
                                            href="#" onClick={e => { e.preventDefault(); if (isLoggedIn) { navigate(`/grammar-topic/${topic.id}`); } else { navigate('/login'); } }}
                                            style={{
                                                fontWeight: 'bold',
                                                color: '#fff',
                                                fontSize: '2rem',
                                                textAlign: 'center',
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                width: '100%',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <span style={{fontSize: '2.8rem', lineHeight: 1, marginRight: 4}}>
                                                {topic.title && topic.title.charAt(0)}
                                            </span>
                                            <span style={{fontSize: '1.5rem', lineHeight: 1}}>
                                                {topic.title && topic.title.slice(1)}
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-xl-12">
                                <div className="section-tittle text-center mt-20">
                                    <a href="#" onClick={e => { e.preventDefault(); if (isLoggedIn) { navigate('/learn-grammary'); } else { navigate('/login'); } }} className="border-btn">View More Grammar Topics</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Grammar topics Area End */}

                {/*? About Area-3 Start */}
                <section className="about-area3 fix">
                    <div className="support-wrapper align-items-center">
                        <div className="right-content3">
                            {/* img */}
                            <div className="right-img">
                                <img src="assets/img/gallery/about3.png" alt="" />
                            </div>
                        </div>
                        <div className="left-content3">
                            {/* section tittle */}
                            <div className="section-tittle section-tittle2 mb-20">
                                <div className="front-text">
                                    <h2 className="">Learner outcomes on courses you will take</h2>
                                </div>
                            </div>
                            <div className="single-features">
                                <div className="features-icon">
                                    <img src="assets/img/icon/right-icon.svg" alt="" />
                                </div>
                                <div className="features-caption">
                                    <p>Techniques to engage effectively with vulnerable children and young people.</p>
                                </div>
                            </div>
                            <div className="single-features">
                                <div className="features-icon">
                                    <img src="assets/img/icon/right-icon.svg" alt="" />
                                </div>
                                <div className="features-caption">
                                    <p>Join millions of people from around the world
                                        learning together.</p>
                                </div>
                            </div>
                            <div className="single-features">
                                <div className="features-icon">
                                    <img src="assets/img/icon/right-icon.svg" alt="" />
                                </div>
                                <div className="features-caption">
                                    <p>Join millions of people from around the world learning together.
                                        Online learning is as easy and natural.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* About Area End */}
                {/*? Team */}
                <section className="team-area section-padding40 fix">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-7 col-lg-8">
                                <div className="section-tittle text-center mb-55">
                                    <h2>Đội Phát Triển</h2>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {/* First team member */}
                            <div className="col-lg-3 col-md-6">
                                <div className="single-cat text-center">
                                    <div className="cat-icon">
                                        <img src="assets/img/gallery/team1.png" alt="" />
                                    </div>
                                    <div className="cat-cap">
                                        <h5><a href="services.html">Mr. TienAnh</a></h5>
                                        <p>Anh trai người Lào.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Second team member */}
                            <div className="col-lg-3 col-md-6">
                                <div className="single-cat text-center">
                                    <div className="cat-icon">
                                        <img src="assets/img/gallery/team2.png" alt="" />
                                    </div>
                                    <div className="cat-cap">
                                        <h5><a href="services.html">Mr. HungAnh</a></h5>
                                        <p>Code cũng cũng....</p>
                                    </div>
                                </div>
                            </div>
                            {/* Third team member */}
                            <div className="col-lg-3 col-md-6">
                                <div className="single-cat text-center">
                                    <div className="cat-icon">
                                        <img src="assets/img/gallery/team3.png" alt="" />
                                    </div>
                                    <div className="cat-cap">
                                        <h5><a href="services.html">Mr. KimTri</a></h5>
                                        <p>Ăn nhiều hơn code.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Fourth team member */}
                            <div className="col-lg-3 col-md-6">
                                <div className="single-cat text-center">
                                    <div className="cat-icon">
                                        <img src="assets/img/gallery/team4.png" alt="" />
                                    </div>
                                    <div className="cat-cap">
                                        <h5><a href="services.html">Mr. HieuNghia</a></h5>
                                        <p>Thấy code mà không thấy xong.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Services End */}
                {/*? About Area-2 Start */}
                <section className="about-area2 fix pb-padding">
                    <div className="support-wrapper align-items-center">
                        <div className="right-content2">
                            {/* img */}
                            <div className="right-img">
                                <img src="assets/img/gallery/about2.png" alt="" />
                            </div>
                        </div>
                        <div className="left-content2">
                            {/* section tittle */}
                            <div className="section-tittle section-tittle2 mb-20">
                                <div className="front-text">
                                    <h2 className="">Take the next step
                                        toward your personal
                                        and professional goals
                                        with us.</h2>
                                    <p>The automated process all your website tasks. Discover tools and techniques to engage effectively with vulnerable children and young people.</p>
                                    <a href="#" className="btn">Join now for Free</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* About Area End */}
            </main>

            {/* Footer */}
            <Footer></Footer>

            {/* Scroll Up */}
            <div id="back-top" >
                <a title="Go to Top" href="#"> <i className="fas fa-level-up-alt"></i></a>
            </div>

        </div>
    );
}

export default Home;