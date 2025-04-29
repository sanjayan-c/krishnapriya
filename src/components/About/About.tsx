import { Link } from 'react-router-dom';
import { Badge, Col, Container, Row, Button } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import Artist from "../../assets/images/photos/artist.png";
const About = () => {
    return (
        // <section id="about" className="pt-5 pb-5 pb-lg-0 bg-gradient4 position-relative overflow-hidden">
        <section id="about" className="pt-5 pb-5 pb-lg-0 position-relative overflow-hidden">
            <Container>
                <Row className="align-items-center">
                    
                    <Col md={{ span: 4 }}
                        className="d-flex justify-content-center align-items-center order-2 order-lg-1"
                        >
                        <img
                            src={Artist}
                            alt="desktop1"
                            className="img-fluid"
                            data-aos="fade-right"
                            data-aos-duration="1000"
                        />
                    </Col>
                    <Col md={{ span: 7, offset: 1 }} className="order-2 order-lg-2">
                        <div className="mt-5 mt-lg-0 mb-4 mb-lg-0">
                            <h1 className="display-4 fw-bold mb-4 pb-3">About Me</h1>
                            <p className="text-muted mx-auto mb-4 pb-3">
                                You don't need to manully follow up with your visitors. The Prompt takes care of it and
                                follow up automatically with them to understand their needs
                            </p>
                            {/* <Link to="#">
                                Learn more
                                <FeatherIcon icon="arrow-right" className="ms-1 icon-xxs" />
                            </Link>
                            <Link to="/article">
                                Article
                                <FeatherIcon icon="arrow-right" className="ms-1 icon-xxs" />
                            </Link> */}
                            {/* <Button variant="primary" size="lg" className="px-4">
                            More Articles
                        </Button> */}
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default About;
