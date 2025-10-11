import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import BlogService from '../services/blogService';
import config from '../services/config';

const PAGE_SIZE = 6;

const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=60';
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
        return { day: '--', month: '--', full: 'Ngày phát hành đang cập nhật' };
    }
    return {
        day: date.getDate().toString().padStart(2, '0'),
        month: date.toLocaleDateString('vi-VN', { month: 'short' }),
        full: date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }),
    };
};

const createExcerpt = (content, maxLength = 150) => {
    if (!content) {
        return 'Nội dung sẽ được cập nhật trong thời gian sớm nhất.';
    }
    const plainText = content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (plainText.length <= maxLength) {
        return plainText;
    }
    return `${plainText.slice(0, maxLength - 3).trim()}...`;
};

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [meta, setMeta] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [recentBlogs, setRecentBlogs] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const keyword = (params.get('search') || '').trim();
        const pageParam = parseInt(params.get('page') || '', 10);
        setSearchInput(keyword);
        setSearchTerm(keyword);
        setPage(!Number.isNaN(pageParam) && pageParam > 0 ? pageParam : 1);
    }, [location.search]);

    useEffect(() => {
        let ignore = false;
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const { data, meta: metaResponse } = await BlogService.getBlogs({
                    page,
                    limit: PAGE_SIZE,
                    search: searchTerm || undefined,
                });
                if (ignore) return;
                setBlogs(data);
                setMeta(metaResponse ?? { page, limit: PAGE_SIZE, total: data.length, totalPages: Math.max(1, Math.ceil((data.length || 1) / PAGE_SIZE)) });
                setError(null);
            } catch (err) {
                if (ignore) return;
                console.error('Failed to fetch blogs:', err);
                setBlogs([]);
                setMeta({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
                setError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
            } finally {
                if (!ignore) setLoading(false);
            }
        };
        fetchBlogs();
        return () => { ignore = true; };
    }, [page, searchTerm]);

    useEffect(() => {
        let ignore = false;
        const fetchRecentBlogs = async () => {
            try {
                const { data } = await BlogService.getBlogs({ page: 1, limit: 4 });
                if (!ignore) setRecentBlogs(data);
            } catch (err) {
                console.warn('Failed to fetch recent blogs:', err);
            }
        };
        fetchRecentBlogs();
        return () => { ignore = true; };
    }, []);

    const archives = useMemo(() => {
        const source = [...recentBlogs, ...blogs];
        const map = new Map();
        source.forEach((blog) => {
            if (!blog?.createdAt) return;
            const date = new Date(blog.createdAt);
            if (Number.isNaN(date.getTime())) return;
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const label = date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
            const current = map.get(key);
            map.set(key, {
                label,
                count: current ? current.count + 1 : 1,
                orderIndex: date.getTime(),
            });
        });
        return Array.from(map.values())
            .sort((a, b) => b.orderIndex - a.orderIndex)
            .slice(0, 6);
    }, [blogs, recentBlogs]);

    const tagCloud = useMemo(() => {
        const source = [...recentBlogs, ...blogs];
        const counts = new Map();
        source.forEach((blog) => {
            const title = blog?.title ?? '';
            title
                .toLowerCase()
                .split(/[^a-zA-ZÀ-ỹ0-9]+/)
                .filter((word) => word.length >= 4)
                .forEach((word) => {
                    counts.set(word, (counts.get(word) ?? 0) + 1);
                });
        });
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([word]) => word);
    }, [blogs, recentBlogs]);

    const handleSubmitSearch = (event) => {
        event.preventDefault();
        const normalized = searchInput.trim();
        setPage(1);
        setSearchTerm(normalized);
        const params = new URLSearchParams();
        if (normalized) params.set('search', normalized);
        params.set('page', '1');
        navigate({ pathname: '/blog', search: `?${params.toString()}` }, { replace: false });
    };

    const handlePageChange = (nextPage) => {
        if (nextPage < 1 || nextPage > (meta?.totalPages ?? 1)) return;
        setPage(nextPage);
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        params.set('page', String(nextPage));
        navigate({ pathname: '/blog', search: `?${params.toString()}` }, { replace: false });
    };

    const totalPages = meta?.totalPages ?? 1;
    const currentPage = meta?.page ?? page;

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Header />
            <main>
                <section
                    style={{
                        background: 'linear-gradient(135deg, #f5f7ff 0%, #fdf9ff 50%, #ffffff 100%)',
                        padding: '120px 0 80px',
                        borderBottom: '1px solid #e5e7eb',
                    }}
                >
                    <div className="container">
                        <div className="mx-auto" style={{ maxWidth: '900px' }}>
                            <div className="text-center d-flex flex-column gap-4">
                                <div>
                                    <h1
                                        style={{
                                            fontSize: '3rem',
                                            fontWeight: 800,
                                            color: '#1f2937',
                                            marginBottom: '16px',
                                            paddingTop: '2%',
                                        }}
                                    >
                                        BLOG TOEIC
                                    </h1>
                                    <p
                                        style={{
                                            fontSize: '1.25rem',
                                            color: '#4b5563',
                                            margin: 0,
                                        }}
                                    >
                                        Chia sẻ kiến thức, mẹo luyện thi và kinh nghiệm học TOEIC hiệu quả dành cho bạn
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section style={{ padding: '60px 0' }}>
                    <div className="container">
                        <div className="row g-4">
                            <div className="col-lg-8">
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                        <LoadingSpinner />
                                    </div>
                                ) : error ? (
                                    <div className="alert alert-danger" role="alert" style={{ borderRadius: '12px' }}>
                                        {error}
                                    </div>
                                ) : blogs.length === 0 ? (
                                    <div className="alert alert-warning" role="status" style={{ borderRadius: '12px' }}>
                                        Không tìm thấy bài viết phù hợp. Hãy thử từ khóa khác nhé!
                                    </div>
                                ) : (
                                    <div className="row g-4">
                                        {blogs.map((blog) => {
                                            const { day, month, full } = formatDateParts(blog.createdAt);
                                            const imageSrc = resolveImageUrl(blog.imageUrl);
                                            const excerpt = createExcerpt(blog.content);
                                            return (
                                                <div className="col-12" key={blog.id}>
                                                    <article style={{
                                                        background: 'white',
                                                        borderRadius: '16px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                        transition: 'all 0.3s ease',
                                                        marginBottom: '3%',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                                    }}>
                                                        <div className="row g-0">
                                                            <div className="col-md-5">
                                                                <div style={{ position: 'relative', height: '100%', minHeight: '280px' }}>
                                                                    <img
                                                                        src={imageSrc}
                                                                        alt={blog.title}
                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                        onError={(e) => {
                                                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=60';
                                                                        }}
                                                                    />
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        top: '20px',
                                                                        left: '20px',
                                                                        background: 'white',
                                                                        borderRadius: '12px',
                                                                        padding: '12px 16px',
                                                                        textAlign: 'center',
                                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                                        
                                                                    }}>
                                                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>{day}</div>
                                                                        <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>{month}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-7">
                                                                <div style={{ padding: '30px' }}>
                                                                    <div style={{ marginBottom: '15px' }}>
                                                                        <span style={{
                                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                            color: 'white',
                                                                            padding: '6px 14px',
                                                                            borderRadius: '20px',
                                                                            fontSize: '12px',
                                                                            fontWeight: '600',
                                                                            textTransform: 'uppercase'
                                                                        }}>
                                                                            TOEIC Tips
                                                                        </span>
                                                                    </div>
                                                                    <Link to={`/blog/${blog.id}`} style={{ textDecoration: 'none' }}>
                                                                        <h2 style={{
                                                                            fontSize: '1.5rem',
                                                                            fontWeight: '700',
                                                                            color: '#2d3748',
                                                                            marginBottom: '15px',
                                                                            lineHeight: '1.4'
                                                                        }}>
                                                                            {blog.title}
                                                                        </h2>
                                                                    </Link>
                                                                    <p style={{ color: '#718096', lineHeight: '1.8', marginBottom: '20px' }}>
                                                                        {excerpt}
                                                                    </p>
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '20px',
                                                                        fontSize: '14px',
                                                                        color: '#a0aec0'
                                                                    }}>
                                                                        <span><i className="fa fa-user" /> {blog.author || 'Toeic Now'}</span>
                                                                        <span><i className="fa fa-calendar" /> {full}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </article>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {totalPages > 1 && !loading && blogs.length > 0 && (
                                    <nav style={{ marginTop: '40px' }}>
                                        <ul style={{ display: 'flex', justifyContent: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
                                            <li>
                                                <button
                                                    type="button"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        border: '2px solid #e2e8f0',
                                                        background: currentPage === 1 ? '#f7fafc' : 'white',
                                                        borderRadius: '10px',
                                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                        color: currentPage === 1 ? '#cbd5e0' : '#667eea',
                                                        fontWeight: '600'
                                                    }}>
                                                    <i className="ti-angle-left" />
                                                </button>
                                            </li>
                                            {Array.from({ length: totalPages }).map((_, index) => {
                                                const pageNumber = index + 1;
                                                return (
                                                    <li key={pageNumber}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePageChange(pageNumber)}
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                border: pageNumber === currentPage ? 'none' : '2px solid #e2e8f0',
                                                                background: pageNumber === currentPage ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                                                                borderRadius: '10px',
                                                                cursor: 'pointer',
                                                                color: pageNumber === currentPage ? 'white' : '#4a5568',
                                                                fontWeight: '600'
                                                            }}>
                                                            {pageNumber}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                            <li>
                                                <button
                                                    type="button"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        border: '2px solid #e2e8f0',
                                                        background: currentPage === totalPages ? '#f7fafc' : 'white',
                                                        borderRadius: '10px',
                                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                                        color: currentPage === totalPages ? '#cbd5e0' : '#667eea',
                                                        fontWeight: '600'
                                                    }}>
                                                    <i className="ti-angle-right" />
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                )}
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
                                        <h4 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px', color: '#2d3748' }}>
                                            Tìm kiếm
                                        </h4>
                                        <form onSubmit={handleSubmitSearch}>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Tìm kiếm bài viết..."
                                                    value={searchInput}
                                                    onChange={(e) => setSearchInput(e.target.value)}
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
                                        <h4 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px', color: '#2d3748' }}>
                                            Bài viết mới nhất
                                        </h4>
                                        {recentBlogs.length === 0 ? (
                                            <p style={{ color: '#a0aec0' }}>Hiện chưa có bài viết nào.</p>
                                        ) : (
                                            recentBlogs.map((blog) => {
                                                const { full } = formatDateParts(blog.createdAt);
                                                return (
                                                    <div key={blog.id} style={{
                                                        display: 'flex',
                                                        gap: '15px',
                                                        marginBottom: '20px',
                                                        paddingBottom: '20px',
                                                        borderBottom: '1px solid #e2e8f0'
                                                    }}>
                                                        <img
                                                            src={resolveImageUrl(blog.imageUrl)}
                                                            alt={blog.title}
                                                            style={{
                                                                width: '80px',
                                                                height: '80px',
                                                                objectFit: 'cover',
                                                                borderRadius: '12px',
                                                                flexShrink: 0
                                                            }}
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60';
                                                            }}
                                                        />
                                                        <div style={{ flex: 1 }}>
                                                            <Link to={`/blog/${blog.id}`} style={{ textDecoration: 'none' }}>
                                                                <h5 style={{
                                                                    fontSize: '14px',
                                                                    fontWeight: '600',
                                                                    color: '#2d3748',
                                                                    marginBottom: '8px',
                                                                    lineHeight: '1.5'
                                                                }}>
                                                                    {blog.title}
                                                                </h5>
                                                            </Link>
                                                            <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>{full}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <div style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        padding: '30px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                    }}>
                                        <h4 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px', color: '#2d3748' }}>
                                            Từ khóa nổi bật
                                        </h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                            {tagCloud.length === 0 ? (
                                                <span style={{ color: '#a0aec0' }}>Đang cập nhật...</span>
                                            ) : (
                                                tagCloud.map((tag) => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => {
                                                            setSearchInput(tag);
                                                            setSearchTerm(tag);
                                                            setPage(1);
                                                            const params = new URLSearchParams();
                                                            if (tag) {
                                                                params.set('search', tag);
                                                            }
                                                            params.set('page', '1');
                                                            navigate({ pathname: '/blog', search: `?${params.toString()}` }, { replace: false });
                                                        }}
                                                        style={{
                                                            background: '#edf2f7',
                                                            border: 'none',
                                                            borderRadius: '20px',
                                                            padding: '8px 16px',
                                                            fontSize: '13px',
                                                            color: '#4a5568',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s'
                                                        }}>
                                                        {tag}
                                                    </button>
                                                ))
                                            )}
                                        </div>
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

export default Blog;