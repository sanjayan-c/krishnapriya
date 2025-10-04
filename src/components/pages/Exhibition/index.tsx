import { useEffect, useState, useRef } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar3 from 'components/navbars/Navbar3';
import Footer from '../../Footer/Footer';
import { LightBox, ImageType } from 'components/LightBox';
import Loading from '../../Loading/index';

type BlogPost = {
    title: string;
    description: string;
    time: string;
    img: string[]; // Array of images for the Lightbox
    location: string | null; // Added field
    size: string | null; // Added field
    imageTitle: string; // Added field
};

const DEFAULT_IMAGE = 'https://via.placeholder.com/300';

const Exhibition = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
    const [maxHeight, setMaxHeight] = useState<number>(0);
    const cardBodiesRef = useRef<(HTMLDivElement | null)[]>([]);

    // Lightbox State
    const [isOpen, setIsOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [galleryImages, setGalleryImages] = useState<ImageType[]>([]);

    const [loading, setLoading] = useState(true);

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

    // Fetch blog data from API
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const baseUrl = process.env.REACT_APP_BASE_URL;
                const response = await axios.get(`${baseUrl}/api/exhibitions`);
                // Normalize to an array whether API returns [] or { items: [] }
                const raw = response.data;
                const list: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];

                const fetchedBlogs = list.map((article: any) => ({
                    title: article?.title ?? 'No Title',
                    description: article?.description ?? 'No Description',
                    time: article?.date ?? 'No Date',
                    img:
                        Array.isArray(article?.images) && article.images.length > 0
                            ? article.images.map((img: string) => `data:image/png;base64,${img}`)
                            : ['https://via.placeholder.com/300'],
                    location: article?.location ?? 'Unknown Location',
                    size: article?.size ?? 'Unknown Size',
                    imageTitle: article?.imageTitle ?? 'No Image Title',
                }));

                setBlogs(fetchedBlogs);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setLoading(false);
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

    // Open Lightbox with images for a specific blog
    const openLightbox = (images: string[], index: number, title: string) => {
        const formattedImages: ImageType[] = images.map((img) => ({
            src: img,
            caption: title,
        }));
        setGalleryImages(formattedImages); // Set galleryImages as ImageType[]
        setPhotoIndex(index);
        setIsOpen(true);
    };

    // Lightbox Handlers
    const closeLightbox = () => setIsOpen(false);

    const moveNext = () => setPhotoIndex((prev) => (prev + 1) % galleryImages.length);

    const movePrev = () => setPhotoIndex((prev) => (prev + galleryImages.length - 1) % galleryImages.length);

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
                                <h1 className="display-3 mb-4" style={{ color: '#ffffff', fontWeight: 'bold' }}>
                                    Exhibitions
                                </h1>
                                {/* <p className="mb-4 fs-17 mt-4" style={{ color: '#ffffff' }}>
                                    These exhibitions showcase my journey and achievements through others' perspectives.
                                </p> */}
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
                            <p className="text-muted">No exhibitions found.</p>
                        </section>
                    ) : (
                        <>
                            <Row className="grid-portfolio mt-5">
                                {blogs.map((blog, index) => {
                                    const { truncated, full } = truncateDescription(blog.description);
                                    const isExpanded = expandedPosts.has(index);

                                    return (
                                        <Col md={4} key={index}>
                                            <Card className="shadow border" data-aos="fade-up" data-aos-duration="500">
                                                <div className="card-img-top-overlay">
                                                    <div className="overlay"></div>
                                                    <span className="card-badge top-right bg-primary text-white">
                                                        {blog.time}
                                                    </span>

                                                    <div className="position-relative card-zoom">
                                                        <div className="ratio ratio-4x3">
                                                            <Link
                                                                to="#"
                                                                className="image-popup"
                                                                title={blog.imageTitle}
                                                                onClick={() =>
                                                                    openLightbox(blog.img, 0, blog.imageTitle)
                                                                } // Pass the blog title
                                                                style={{ textDecoration: 'none', display: 'block' }}>
                                                                <img
                                                                    src={blog.img[0]}
                                                                    alt={blog.imageTitle}
                                                                    className="card-img-top fixed-image"
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                            </Link>
                                                        </div>
                                                        {/* Badge for multiple images */}
                                                        {blog.img.length > 1 && (
                                                            <div className="card-badge bottom-right bg-primary text-white position-absolute">
                                                                +{blog.img.length - 1} more
                                                            </div>
                                                        )}
                                                        <div className="shape text-white bottom"></div>
                                                    </div>
                                                </div>
                                                <Card.Body
                                                    style={{ minHeight: `${maxHeight}px` }}
                                                    ref={(el: HTMLDivElement | null) =>
                                                        (cardBodiesRef.current[index] = el)
                                                    }>
                                                    <div className="mt-2">
                                                        <h4>{blog.title}</h4>
                                                    </div>
                                                    <div className="mt-2">
                                                        <Row className="align-items-center">
                                                            <Col xs="auto">
                                                                <p className="mb-2">
                                                                    <span className="fs-14 align-middle fw-bold">
                                                                        {blog.imageTitle}
                                                                    </span>
                                                                </p>
                                                            </Col>
                                                        </Row>
                                                        <p className="text-muted mb-2">
                                                            {isExpanded ? full : truncated}
                                                        </p>
                                                        {isExpanded && (
                                                            <div className="additional-details mt-3">
                                                                <p className="mb-0">
                                                                    Location:
                                                                    <span className="text-muted ms-4">
                                                                        {blog.location}
                                                                    </span>
                                                                </p>
                                                                <p className="mb-0">
                                                                    Size:
                                                                    <span className="text-muted ms-4">{blog.size}</span>
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div className="mt-3">
                                                            <button
                                                                className="btn btn-link p-0 no-underline"
                                                                onClick={() => toggleExpand(index)}>
                                                                {isExpanded ? 'Show Less' : 'Read More'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                            {isOpen && (
                                <LightBox
                                    images={galleryImages} // Pass as ImageType[]
                                    photoIndex={photoIndex}
                                    closeLightbox={closeLightbox}
                                    moveNext={moveNext}
                                    movePrev={movePrev}
                                />
                            )}
                        </>
                    )}
                </Container>
            </section>
            <Footer />
        </>
    );
};

export default Exhibition;
