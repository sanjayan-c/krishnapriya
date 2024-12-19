import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, Col, Container, Row } from 'react-bootstrap';
import axios from 'axios';

type BlogPost = {
    title: string;
    description: string;
    time: string;
    img: string; // Single image for the card
};

const Blog = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);

    // Fetch blog data from API
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('http://localhost:8070/api/exhibitions');
                let fetchedBlogs = response.data.map((article: any) => ({
                    title: article.title,
                    description: article.description,
                    time: new Date(article.date).toLocaleDateString(), // Format the date
                    img: `data:image/png;base64,${article.images[0]}`, // Use the first image in the array
                }));
               
                setBlogs(fetchedBlogs);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };

        fetchBlogs();
    }, []);

    return (
        <section id="exhibition" className="section pt-lg-8 pt-6 pb-5 position-relative">
            <Container>
                <Row>
                    <Col className="text-center">
                        <h1 className="display-5 fw-semibold">Exhibition</h1>
                    </Col>
                </Row>
                <Row className="mt-5">
                    {(blogs || []).map((blog, index) => (
                        <Col md={4} key={index.toString()}>
                            <Card className="shadow" data-aos="fade-up" data-aos-duration="500">
                                <div className="card-img-top-overlay">
                                    <div className="overlay"></div>
                                    <span className="card-badge top-right bg-secondary text-white">Design</span>

                                    <div className="position-relative">
                                        <img src={blog.img} alt="blog" className="card-img-top  fixed-image" />
                                        <div className="shape text-white bottom">
                                            {/* Placeholder for custom shape */}
                                        </div>
                                    </div>
                                </div>
                                <Card.Body>
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
                                        <h4>
                                            <Link to="#" className="card-title-link">
                                                {blog.title}
                                            </Link>
                                        </h4>
                                        <p className="text-muted mb-2">
                                            {blog.description}{' '}
                                        </p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default Blog;
