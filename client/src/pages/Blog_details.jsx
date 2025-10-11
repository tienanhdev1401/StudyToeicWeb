import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import BlogService from '../services/blogService';
import config from '../services/config';

const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=1200&q=60';
    }
    if (/^https?:\/\//i.test(imageUrl)) {
        return imageUrl;
    }
    const apiBase = config.API_BASE_URL || '';
    const origin = apiBase.replace(/\/api\/?$/, '/');
    return `${origin}${imageUrl.replace(/^\/+/, '')}`;
};

const formatDateParts = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) {
        return { day: '--', month: '--', full: 'Đang cập nhật' };
    }
    return {
        day: date.getDate().toString().padStart(2, '0'),
        month: date.toLocaleDateString('vi-VN', { month: 'long' }),
        full: date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }),
    };
};

const sanitizeContent = (content) => {
    if (!content) return '';
    return content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
};

const BlogDetails = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentBlogs, setRecentBlogs] = useState([]);

    useEffect(() => {
        let ignore = false;
        const fetchBlogDetail = async () => {
            try {
                setLoading(true);
                const data = await BlogService.getBlogById(id);
                if (!ignore) {
                    setBlog(data);
                    setError(null);
                }
            } catch (err) {
                if (!ignore) {
                    console.error('Failed to load blog detail:', err);
                    if (err?.response?.status === 404) {
                        setError('Bài viết không tồn tại hoặc đã được gỡ.');
                    } else {
                        setError('Không thể tải nội dung bài viết. Vui lòng thử lại sau.');
                    }
                    setBlog(null);
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        };
        if (id) fetchBlogDetail();
        return () => { ignore = true; };
    }, [id]);

    useEffect(() => {
        let ignore = false;
        const fetchRecentBlogs = async () => {
            try {
                const { data } = await BlogService.getBlogs({ page: 1, limit: 4 });
                if (!ignore) setRecentBlogs(data);
            } catch (err) {
                console.warn('Failed to fetch sidebar blogs:', err);
            }
        };
        fetchRecentBlogs();
        return () => { ignore = true; };
    }, []);

    const formattedDate = formatDateParts(blog?.createdAt);
    const sanitizedContent = useMemo(() => sanitizeContent(blog?.content), [blog?.content]);
    const relatedBlogs = useMemo(() => {
        if (!blog) return recentBlogs;
        return recentBlogs
    }, [blog, recentBlogs]);

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Header />
            <main>
                <section style={{
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95))',
                    padding: '100px 0 60px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${resolveImageUrl(blog?.imageUrl)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.15,
                        filter: 'blur(8px)'
                    }} />
                    <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="row justify-content-center">
                            <div className="col-lg-10">
                                <nav aria-label="breadcrumb" style={{paddingTop: '4%', marginBottom: '30px' }}>
                                    <ol className="breadcrumb" style={{ background: 'transparent', padding: 0 }}>
                                        <li className="breadcrumb-item">
                                            <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                                                Trang chủ
                                            </Link>
                                        </li>
                                        <li className="breadcrumb-item">
                                            <Link to="/blog" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                                                Blog
                                            </Link>
                                        </li>
                                        <li className="breadcrumb-item active" style={{ color: 'white' }}>
                                            {blog?.title ?? 'Đang tải...'}
                                        </li>
                                    </ol>
                                </nav>
                                <div style={{ marginBottom: '20px' }}>
                                    <span style={{
                                        background: 'rgba(255,255,255,0.25)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '8px 20px',
                                        borderRadius: '25px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        Bài viết nổi bật
                                    </span>
                                </div>
                                <h1 style={{
                                    fontSize: '5.5rem',
                                    fontWeight: '800',
                                    marginBottom: '25px',
                                    lineHeight: '1.3',
                                    color: 'white',
                                    textShadow: '0 2px 10px rgba(39, 37, 37, 0.99)'
                                }}>
                                    {blog?.title ?? 'Chi tiết bài viết'}
                                </h1>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '20px',
                                    marginTop: '30px',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        background: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '12px 20px',
                                        borderRadius: '30px'
                                    }}>
                                        <i className="fa fa-user" style={{ fontSize: '18px' }} />
                                        <span style={{ fontWeight: '600' }}>{blog?.author || 'Toeic Now'}</span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        background: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '12px 20px',
                                        borderRadius: '30px'
                                    }}>
                                        <i className="fa fa-calendar" style={{ fontSize: '18px' }} />
                                        <span style={{ fontWeight: '600' }}>{formattedDate.full}</span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        background: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '12px 20px',
                                        borderRadius: '30px'
                                    }}>
                                        <i className="fa fa-eye" style={{ fontSize: '18px' }} />
                                        <span style={{ fontWeight: '600' }}>1.2K lượt xem</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section style={{ padding: '60px 0' }}>
                    <div className="container">
                        <div className="row g-5">
                            <div className="col-lg-8">
                                <article style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
                                }}>
                                    <div style={{
                                        width: '100%',
                                        height: '450px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        {blog?.imageUrl ? (
                                            <img
                                                src={resolveImageUrl(blog.imageUrl)}
                                                alt={blog.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=1200&q=60';
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
                                                color: '#a0aec0'
                                            }}>
                                                Hình ảnh đang cập nhật
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '40px' }}>
                                        {loading ? (
                                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                                <LoadingSpinner />
                                            </div>
                                        ) : error ? (
                                            <div className="alert alert-danger" role="alert" style={{ borderRadius: '12px' }}>
                                                {error}
                                                <div style={{ marginTop: '20px' }}>
                                                    <Link to="/blog" className="btn btn-primary" style={{
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        border: 'none',
                                                        padding: '12px 30px',
                                                        borderRadius: '10px',
                                                        fontWeight: '600'
                                                    }}>
                                                        Quay lại danh sách blog
                                                    </Link>
                                                </div>
                                            </div>
                                        ) : !blog ? (
                                            <div className="alert alert-warning" role="status" style={{ borderRadius: '12px' }}>
                                                Không tìm thấy dữ liệu bài viết.
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{
                                                    fontSize: '1.05rem',
                                                    lineHeight: '1.9',
                                                    color: '#2d3748',
                                                    marginBottom: '40px'
                                                }}
                                                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                                                />
                                                <div style={{
                                                    borderTop: '2px solid #e2e8f0',
                                                    paddingTop: '30px',
                                                    marginTop: '40px'
                                                }}>
                                                    <p style={{
                                                        fontSize: '14px',
                                                        fontWeight: '700',
                                                        color: '#4a5568',
                                                        marginBottom: '15px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px'
                                                    }}>
                                                        Chia sẻ bài viết
                                                    </p>
                                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                        <a
                                                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                background: '#1877f2',
                                                                color: 'white',
                                                                padding: '10px 24px',
                                                                borderRadius: '8px',
                                                                textDecoration: 'none',
                                                                fontSize: '14px',
                                                                fontWeight: '600',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '8px'
                                                            }}>
                                                            <i className="fab fa-facebook-f" /> Facebook
                                                        </a>
                                                        <a
                                                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog?.title ?? '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                background: '#1da1f2',
                                                                color: 'white',
                                                                padding: '10px 24px',
                                                                borderRadius: '8px',
                                                                textDecoration: 'none',
                                                                fontSize: '14px',
                                                                fontWeight: '600',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '8px'
                                                            }}>
                                                            <i className="fab fa-twitter" /> Twitter
                                                        </a>
                                                        <a
                                                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                background: '#0077b5',
                                                                color: 'white',
                                                                padding: '10px 24px',
                                                                borderRadius: '8px',
                                                                textDecoration: 'none',
                                                                fontSize: '14px',
                                                                fontWeight: '600',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '8px'
                                                            }}>
                                                            <i className="fab fa-linkedin-in" /> LinkedIn
                                                        </a>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </article>
                            </div>

                            <div className="col-lg-4">
                                <div style={{ position: 'sticky', top: '20px' }}>
                                    <div style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        padding: '30px',
                                        marginBottom: '24px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                    }}>
                                        <h5 style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            marginBottom: '20px',
                                            color: '#2d3748'
                                        }}>
                                            Tìm kiếm bài viết
                                        </h5>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            const value = (formData.get('keyword') || '').toString().trim();
                                            if (value) {
                                                window.location.href = `/blog?search=${encodeURIComponent(value)}`;
                                            }
                                        }}>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    name="keyword"
                                                    className="form-control"
                                                    placeholder="Nhập từ khóa..."
                                                    style={{
                                                        borderRadius: '12px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 50px 12px 20px',
                                                        fontSize: '15px'
                                                    }}
                                                />
                                                <button
                                                    type="submit"
                                                    style={{
                                                        position: 'absolute',
                                                        right: '8px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        width: '25px',
                                                        height: '25px',
                                                        color: 'white',
                                                        cursor: 'pointer'
                                                    }}>
                                                    <i className="ti-search" />
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    <div style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        padding: '30px',
                                        marginBottom: '24px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                    }}>
                                        <h5 style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            marginBottom: '20px',
                                            color: '#2d3748'
                                        }}>
                                            Bài viết liên quan
                                        </h5>
                                        {relatedBlogs.length === 0 ? (
                                            <p style={{ color: '#a0aec0', margin: 0 }}>Chưa có bài viết liên quan.</p>
                                        ) : (
                                            relatedBlogs.map((item) => {
                                                const format = formatDateParts(item.createdAt);
                                                return (
                                                    <div key={item.id} style={{
                                                        display: 'flex',
                                                        gap: '15px',
                                                        marginBottom: '20px',
                                                        paddingBottom: '20px',
                                                        borderBottom: '1px solid #e2e8f0'
                                                    }}>
                                                        <div style={{
                                                            width: '80px',
                                                            height: '80px',
                                                            borderRadius: '12px',
                                                            overflow: 'hidden',
                                                            flexShrink: 0
                                                        }}>
                                                            <img
                                                                src={resolveImageUrl(item.imageUrl)}
                                                                alt={item.title}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                                onError={(e) => {
                                                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=60';
                                                                }}
                                                            />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <Link to={`/blog/${item.id}`} style={{ textDecoration: 'none' }}>
                                                                <h6 style={{
                                                                    fontSize: '14px',
                                                                    fontWeight: '600',
                                                                    color: '#2d3748',
                                                                    marginBottom: '8px',
                                                                    lineHeight: '1.5'
                                                                }}>
                                                                    {item.title}
                                                                </h6>
                                                            </Link>
                                                            <p style={{
                                                                fontSize: '12px',
                                                                color: '#a0aec0',
                                                                margin: 0
                                                            }}>
                                                                {format.full}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <div style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '16px',
                                        padding: '30px',
                                        color: 'white',
                                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                                    }}>
                                        <h5 style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            marginBottom: '15px',
                                            color: 'white'
                                        }}>
                                            Đăng ký nhận tin
                                        </h5>
                                        <p style={{
                                            fontSize: '14px',
                                            opacity: 0.95,
                                            marginBottom: '20px',
                                            lineHeight: '1.6',
                                            color: 'white'
                                        }}>
                                            Nhận thông báo khi có bài học hoặc mẹo luyện thi TOEIC mới nhất.
                                        </p>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            alert('Cảm ơn bạn! Chúng tôi sẽ sớm ra mắt bản tin email.');
                                        }}>
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="Nhập email của bạn"
                                                required
                                                style={{
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    padding: '12px 20px',
                                                    marginBottom: '12px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                            <button
                                                type="submit"
                                                style={{
                                                    width: '100%',
                                                    background: 'white',
                                                    color: '#667eea',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    padding: '12px',
                                                    fontWeight: '700',
                                                    fontSize: '15px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s'
                                                }}>
                                                Đăng ký ngay
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default BlogDetails;