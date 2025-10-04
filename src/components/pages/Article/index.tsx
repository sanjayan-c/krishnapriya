import { useEffect, useState, useRef } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import axios from 'axios';
import Navbar3 from 'components/navbars/Navbar3';
import Footer from '../../Footer/Footer';
import Loading from '../../Loading/index';
import placeholder from '../../../assets/images/photos/no_image_placeholder.png';

type BlogPost = {
    title: string;
    description: string;
    time: string;
    img: string;
    link: string;
};

type ArticleDoc = {
    _id: string;
    link: string;
};

const Article = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [maxHeight, setMaxHeight] = useState<number>(0);
    const cardBodiesRef = useRef<(HTMLDivElement | null)[]>([]);
    const [loading, setLoading] = useState(true);

    const baseUrl = process.env.REACT_APP_BASE_URL;

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return '';
        }
    };

    const truncateTitle = (title: string): string => (title.length > 50 ? `${title.slice(0, 50)}...` : title);

    // Get hostname (nice fallback title when metadata is missing)
    const hostnameFromUrl = (url: string) => {
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch {
            return 'Article';
        }
    };

    useEffect(() => {
        const fetchFromDb = async () => {
            setLoading(true);
            try {
                // 1) Fetch articles from DB
                const listRes = await axios.get<{ items: ArticleDoc[] }>(`${baseUrl}/api/articles`);
                const links: string[] = (listRes.data.items || []).map((i) => i.link).filter(Boolean);

                // 2) Fetch metadata for each link in parallel
                const blogsData: BlogPost[] = await Promise.all(
                    links.map(async (link) => {
                        try {
                            const { data: metadata } = await axios.get(
                                `${baseUrl}/api/articles/metadata`,
                                { params: { url: link } } // safer than manual encode
                            );
                            return {
                                title: metadata.title || hostnameFromUrl(link),
                                description: metadata.description || '',
                                time: formatDate(metadata.date),
                                img: metadata.image || placeholder,
                                link,
                            };
                        } catch (err) {
                            console.error(`Error fetching metadata for ${link}:`, err);
                            return {
                                title: hostnameFromUrl(link),
                                description: '',
                                time: '',
                                img: placeholder,
                                link,
                            };
                        }
                    })
                );

                setBlogs(blogsData);
            } catch (err) {
                console.error('Error fetching articles from DB:', err);
                setBlogs([]); // graceful empty state
            } finally {
                setLoading(false);
            }
        };

        fetchFromDb();
    }, [baseUrl]);

    // Equalize body heights on md+ screens
    useEffect(() => {
        const calculateMaxHeight = () => {
            if (window.innerWidth >= 768 && cardBodiesRef.current.length > 0) {
                const heights = cardBodiesRef.current.map((el) => el?.clientHeight || 0);
                setMaxHeight(Math.max(...heights));
            } else {
                setMaxHeight(0);
            }
        };

        calculateMaxHeight();
        window.addEventListener('resize', calculateMaxHeight);
        return () => window.removeEventListener('resize', calculateMaxHeight);
    }, [blogs]);

    return (
        <>
            <div className="header-7 bg-gradient2">
                <Navbar3
                    navClass="custom-navbar-class zindex-10"
                    isSticky
                    fixedWidth
                    buttonClass="btn-outline-light btn-sm"
                />
                <section id="article" className="hero-4 pt-lg-6 pb-sm-9 pb-6 pt-9 mb-6 bg-gradient2">
                    <Container>
                        <Row className="justify-content-center">
                            <Col lg={7} className="text-center">
                                <h1 className="display-3 mb-4" style={{ color: '#ffffff', fontWeight: 'bold' }}>
                                    Articles
                                </h1>
                            </Col>
                        </Row>
                    </Container>
                    <div className="shape bottom">
                        <svg
                            width="1440px"
                            height="40px"
                            viewBox="0 0 1440 40"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg">
                            <g id="shape-b" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="curve" fill="#fff">
                                    <path
                                        d="M0,30.013 C239.659,10.004 479.143,0 718.453,0 C957.763,0 1198.28,10.004 1440,30.013 L1440,40 L0,40 L0,30.013 Z"
                                        id="Path"></path>
                                </g>
                            </g>
                        </svg>
                    </div>
                </section>
            </div>

            <section id="exhibition" className="section position-relative pb-5 pb-md-6 pb-lg-7">
                <Container>
                    {loading ? (
                        <section
                            id="exhibition"
                            className="section pt-5 pb-5 d-flex justify-content-center align-items-center"
                            style={{ minHeight: '500px' }}>
                            <Loading style={{ width: 300, height: 300 }} />
                        </section>
                    ) : blogs.length === 0 ? (
                        <section
                            id="exhibition"
                            className="section pt-5 pb-5 d-flex justify-content-center align-items-center text-center"
                            style={{ minHeight: '300px' }}>
                            <p className="text-muted">No articles found.</p>
                        </section>
                    ) : (
                        <>
                            <Row className="mt-3">
                                {blogs.map((blog, index) => (
                                    <Col md={4} key={index}>
                                        <a
                                            href={blog.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-decoration-none d-block">
                                            <Card className="shadow h-100" data-aos="fade-up" data-aos-duration="500">
                                                <div className="card-img-top-overlay">
                                                    <div className="ratio ratio-4x3">
                                                        <img
                                                            src={blog.img || placeholder}
                                                            alt={blog.title || 'Article image'}
                                                            className="card-img-top fixed-image"
                                                            loading="lazy"
                                                            referrerPolicy="no-referrer"
                                                            onError={(e) => {
                                                                const img = e.currentTarget as HTMLImageElement;
                                                                if (img.src !== placeholder) {
                                                                    img.src = placeholder;
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <Card.Body
                                                    className="card-body-content"
                                                    style={{ minHeight: `${maxHeight}px` }}
                                                    ref={(el: HTMLDivElement | null) =>
                                                        (cardBodiesRef.current[index] = el)
                                                    }>
                                                    <h4>{truncateTitle(blog.title)}</h4>
                                                    {blog.time && (
                                                        <p className="fs-13 align-middle mb-0">{blog.time}</p>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </a>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </Container>
            </section>
            <Footer />
        </>
    );
};

export default Article;
