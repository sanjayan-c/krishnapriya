import { Link } from 'react-router-dom';
import { Badge, Col, Container, Row } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';


const About = () => {
    return (
        <section id="about" className="pt-lg-6 pt-4 pb-lg-6 pb-5 position-relative overflow-hidden">
            <Container>
                <Row className="align-items-center mb-6 pb-lg-5">
                    <Col lg={5}>
                        <div className="mb-4 mb-lg-0">
                            <h1 className="display-4 fw-medium mb-3">About Me</h1>
                            <p className="text-muted mx-auto mb-4 pb-3">
                                You don't need to manully follow up with your visitors. The Prompt takes care of it and
                                follow up automatically with them to understand their needs
                            </p>
                            <Link to="#">
                                Learn more
                                <FeatherIcon icon="arrow-right" className="ms-1 icon-xxs" />
                            </Link>
                        </div>
                    </Col>
                    <Col lg={{ span: 6, offset: 1 }}
                        className="d-flex justify-content-center align-items-center"
                        >
                        <img
                            src={"https://exhibition202.netlify.app/static/media/image-placeholder.750af1fd37da065f2307.png"}
                            alt="desktop1"
                            className="img-fluid"
                            data-aos="fade-left"
                            data-aos-duration="1000"
                        />
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default About;
