import { useEffect, useState } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import axios from 'axios';
import Navbar3 from 'components/navbars/Navbar3';
import Footer from '../../Footer/Footer';

type BlogPost = {
    title: string;
    description: string;
    time: string;
    img: string;
    link: string;
};

const Article = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);

    // Fetch blog data from API
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('http://localhost:8070/api/articles');
                const fetchedBlogs = response.data.map((article: any) => ({
                    title: article.title,
                    description: article.description,
                    time: new Date(article.date).toLocaleDateString(),
                    img: `data:image/png;base64,${article.image}`,
                    link: article.link || '#', // Use '#' if the link is missing
                }));
                setBlogs(fetchedBlogs);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };

        fetchBlogs();
    }, []);

    return (
        <>
            <div className="bg-gradient3">
                <Navbar3
                    navClass="custom-navbar-class zindex-10"
                    isSticky
                    fixedWidth
                    buttonClass="btn-outline-light btn-sm"
                /> 
            </div>
        <section id="exhibition" className="section pt-lg-8 pt-6 pb-5 position-relative">

            <Container>
                <Row>
                    <Col className="text-center">
                        <h1 className="display-5 fw-semibold">Articles</h1>
                    </Col>
                </Row>
                <Row className="mt-5">
                    {blogs.map((blog, index) => (
                        <Col md={4} key={index}>
                            <a
                                href={blog.link}
                                target="_blank"
                                rel="noopener noreferrer" // For security and performance
                                className="text-decoration-none"
                            >
                                <Card className="shadow h-100" data-aos="fade-up" data-aos-duration="500">
                                    <div className="card-img-top-overlay">
                                        <div className="overlay"></div>
                                        <div className="position-relative">
                                            <img
                                                src={blog.img}
                                                alt="blog"
                                                className="card-img-top fixed-image"
                                            />
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
                                            <h4 className="text-dark">{blog.title}</h4>
                                            <p className="text-muted mb-2">{blog.description}</p>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </a>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
        <Footer />
        </>
    );
};

export default Article;
