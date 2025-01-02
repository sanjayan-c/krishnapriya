import { useEffect, useState, useRef } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar3 from 'components/navbars/Navbar3';
import Footer from '../../Footer/Footer';

type BlogPost = {
    title: string;
    description: string;
    time: string;
    img: string;
};

const DEFAULT_IMAGE = 'https://via.placeholder.com/300';

const Exhibition = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
    const [maxHeight, setMaxHeight] = useState<number>(0);
    const cardBodiesRef = useRef<(HTMLDivElement | null)[]>([]);

    // Format date
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Truncate description
    const truncateDescription = (description: string) => {
        const maxLength = 80;
        if (description.length > maxLength) {
            return {
                truncated: description.slice(0, maxLength) + '...',
                full: description,
            };
        }
        return { truncated: description, full: description };
    };

    // Fetch blogs from API
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('http://localhost:8070/api/exhibitions');
                const blogsData = response.data.map((blog: any) => ({
                    title: blog.title || 'No Title',
                    description: blog.description || 'No Description',
                    time: formatDate(blog.date),
                    img: blog.images?.[0] ? `data:image/png;base64,${blog.images[0]}` : DEFAULT_IMAGE,
                }));
                setBlogs(blogsData);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };

        fetchBlogs();
    }, []);

    // Set max height for cards
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

        return () => {
            window.removeEventListener('resize', calculateMaxHeight);
        };
    }, [blogs]);

    // Toggle expand state
    const toggleExpand = (index: number) => {
        const updatedExpandedPosts = new Set(expandedPosts);
        if (updatedExpandedPosts.has(index)) {
            updatedExpandedPosts.delete(index);
        } else {
            updatedExpandedPosts.add(index);
        }
        setExpandedPosts(updatedExpandedPosts);
    };

    return (
        <>
            <div className="header-7 bg-gradient2">
                <Navbar3
                    navClass="custom-navbar-class zindex-10"
                    isSticky
                    fixedWidth
                    buttonClass="btn-outline-light btn-sm"
                />
                <section className="hero-4 pt-lg-6 pb-sm-9 pb-6 pt-9 mb-6 bg-gradient2">
                    <Container>
                        <Row className="justify-content-center">
                            <Col lg={7} className="text-center">
                                <h1 className="display-3 mb-0" style={{ color: '#ffffff', fontWeight: 'bold' }}>
                                    Exhibition
                                </h1>
                                <p className="mb-4 fs-17 mt-4" style={{ color: '#ffffff' }}>
                                    These exhibitions showcase my journey and achievements through others' perspectives.
                                </p>
                            </Col>
                        </Row>
                    </Container>
                    <div className="shape bottom">
                        <svg
                            width="1440px"
                            height="40px"
                            viewBox="0 0 1440 40"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g id="shape-b" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="curve" fill="#fff">
                                    <path
                                        d="M0,30.013 C239.659,10.004 479.143,0 718.453,0 C957.763,0 1198.28,10.004 1440,30.013 L1440,40 L0,40 L0,30.013 Z"
                                        id="Path"
                                    ></path>
                                </g>
                            </g>
                        </svg>
                    </div>
                </section>
            </div>

            <section id="exhibition" className="section position-relative pb-5 pb-md-6 pb-lg-7">
                <Container>
                    <Row className="grid-portfolio mt-5">
                        {blogs.map((blog, index) => {
                            const { truncated, full } = truncateDescription(blog.description);
                            const isExpanded = expandedPosts.has(index);

                            return (
                                <Col md={4} key={index}>
                                    <Card className="shadow border" data-aos="fade-up" data-aos-duration="500">
                                        <div className="card-img-top-overlay">
                                            <div className="overlay"></div>
                                            <span className="card-badge top-right bg-primary text-white">Design</span>
                                            <div className="position-relative">
                                                <div className="ratio ratio-4x3">
                                                    <img
                                                        src={blog.img}
                                                        alt="blog"
                                                        className="card-img-top fixed-image"
                                                    />
                                                </div>
                                                <div className="shape text-white bottom"></div>
                                            </div>
                                        </div>
                                        <Card.Body
                                            style={{ minHeight: `${maxHeight}px` }}
                                            ref={(el: HTMLDivElement | null) =>
                                                (cardBodiesRef.current[index] = el)
                                            }
                                        >
                                            <div className="mt-2">
                                                <Row className="align-items-center">
                                                    <Col xs="auto">
                                                        <p className="mb-0">
                                                            <span className="fs-13 align-middle">{blog.time}</span>
                                                        </p>
                                                    </Col>
                                                </Row>
                                            </div>
                                            <div className="mt-2">
                                                <h4>{blog.title}</h4>
                                                <p className="text-muted mb-2">
                                                    {isExpanded ? full : truncated}
                                                </p>
                                                {full !== truncated && (
                                                    <button
                                                        className="btn btn-link p-0 no-underline"
                                                        onClick={() => toggleExpand(index)}
                                                    >
                                                        {isExpanded ? 'Show Less' : 'Read More'}
                                                    </button>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </Container>
            </section>
            <Footer />
        </>
    );
};

export default Exhibition;
