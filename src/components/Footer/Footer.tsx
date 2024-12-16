import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';

// images
import logo from 'assets/images/logo-dark.png';

const Footer = () => {
    return (
        <section className="section mt-5 py-4 py-sm-8 bg-gradient4 position-relative overflow-hidden">
            <Container>
            <div className="divider top d-none d-sm-block"></div>
                <Row>
                    <Col lg={4}>
                        <Link className="navbar-brand me-lg-4 me-auto pt-0" to="#">
                            <img src={logo} height="70" className="d-inline-block align-top" alt="" />
                        </Link>
                        <div className="">
                            <p className="mt-3 mb-1 text-dark">
                                At vero eos et accusamus et iusto dignissimos ducimus odio.
                            </p>
                            <p className="mt-lg-5 pt-4 mb-lg-0 mb-4 text-dark">Prompt 2020. All rights reserved.</p>
                        </div>
                    </Col>
                    <Col lg={{ offset: 1, span: 7 }}>
                        <Row>
                            <Col md={3} sm={6}>
                                <h6 className="mb-4 mt-4 mt-sm-2 text-dark fw-semibold text-uppercase">Navigations</h6>
                                <ul className="list-unstyled">
                                    <li className="my-3">
                                        <Link to="#" className="text-dark">
                                            Home
                                        </Link>
                                    </li>
                                    <li className="my-3">
                                        <Link to="#" className="text-dark">
                                            About
                                        </Link>
                                    </li>
                                    <li className="my-3">
                                        <Link to="#" className="text-dark">
                                            Gallery
                                        </Link>
                                    </li>
                                    <li className="my-3">
                                        <Link to="#" className="text-dark">
                                            Testimonials
                                        </Link>
                                    </li>
                                    <li className="my-3">
                                        <Link to="#" className="text-dark">
                                            Exhibition
                                        </Link>
                                    </li>
                                    <li className="my-3">
                                        <Link to="#" className="text-dark">
                                            Contact
                                        </Link>
                                    </li>
                                </ul>
                            </Col>


                            <Col md={3} sm={6}>
                                <h6 className="mb-4 mt-4 mt-sm-2 text-dark fw-semibold text-uppercase">Contact</h6>
                                <ul className="list-unstyled">
                                    <li className="my-3">
                                        <Link to="#" className="text-dark">
                                            Support
                                        </Link>
                                    </li>
                                    <li className="my-3">
                                        <Link to="#" className="text-dark">
                                            Developers
                                        </Link>
                                    </li>
                                    <li className="my-3">
                                        <Link to="#" className="text-dark">
                                            Customer Service
                                        </Link>
                                    </li>
                                    <li className="my-3">
                                        <Link to="#" className="text-dark">
                                            Get Started Guide
                                        </Link>
                                    </li>
                                </ul>
                            </Col>
                            <Col md={{ offset: 1, span: 5 }}>
                                <img
                                    src={"https://cdn.dribbble.com/users/1531379/screenshots/4643688/me-800-600.gif"}
                                    alt="Animated GIF"
                                    className="img-fluid rounded"
                                    style={{ maxWidth: '100%', height: 'auto' }}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Footer;
