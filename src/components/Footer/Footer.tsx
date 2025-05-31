import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import navIcon3 from '../../assets/images/social/nav-icon3-hover.svg';
import navIcon4 from '../../assets/images/social/nav-icon4-hover.svg';
import navIcon3Hover from '../../assets/images/social/nav-icon3-pink.svg';
import navIcon4Hover from '../../assets/images/social/nav-icon4-pink.svg';

// images
import logo from 'assets/images/logo-dark.png';

const Footer = () => {
    return (
        <section className="section pt-5 mt-5 py-4 py-sm-8 bg-gradient4 position-relative overflow-hidden">
            <Container>
                <div className="divider top d-none d-sm-block"></div>
                <Row>
                    <Col lg={6}>
                        <Link className="navbar-brand me-lg-4 me-auto pt-0" to="#">
                            <img src={logo} height="70" className="d-inline-block align-top" alt="" />
                        </Link>
                        <div className="">
                            <p className="mt-3 mb-1 text-dark">
                                Cartographer of the invisible, revealing hidden terrains of memory and micro-worlds through every delicate line.
                            </p>
                        </div>
                        <div className="d-flex mt-5 mb-5">
                            {/* <span className="icon-container bg-soft-pink avatar avatar-sm rounded icon-xs text-primary me-3 flex-shrink-0">
                                <FeatherIcon icon="facebook" className="icon" />
                            </span>
                            <span className="icon-container bg-soft-pink avatar avatar-sm rounded icon-xs text-primary me-3 flex-shrink-0">
                                <FeatherIcon icon="instagram" className="icon" />
                            </span> */}
                            <span className="footer-text">
                                <div className="footer-social-icon">
                                    <a
                                        href="https://www.facebook.com/krish.pri.1"
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        <img
                                            src={navIcon4}
                                            alt="Krishnapriya Facebook Profile"
                                            className="footer-social-icon-img"
                                        />
                                        <img
                                            src={navIcon4Hover}
                                            alt="Sanjayan Instagram Profile Hover"
                                            className="footer-social-icon-img-hover"
                                        />
                                    </a>
                                    <a
                                        href="https://www.instagram.com/krish.pri"
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        <img
                                            src={navIcon3}
                                            alt="Krishnapriya Instagram Profile"
                                            className="footer-social-icon-img"
                                        />
                                        <img
                                            src={navIcon3Hover}
                                            alt="Sanjayan Instagram Profile Hover"
                                            className="footer-social-icon-img-hover"
                                        />
                                    </a>
                                </div>
                            </span>
                        </div>
                    </Col>
                    <Col lg={{ offset: 1, span: 5 }}>
                        <Row>
                            <Col md={6} sm={12}>
                                <h5 className="mb-4 mt-4 mt-sm-2 text-dark fw-bold">Navigations</h5>
                                <ul className="list-unstyled">
                                    <li className="my-3">
                                        <Link to="#home" className="text-dark">
                                            Home
                                        </Link>
                                    </li>
                                    <li className="my-3">
                                        <Link to="#about" className="text-dark">
                                            About
                                        </Link>
                                    </li>
                                    <li className="my-3">
                                        <Link to="#gallery" className="text-dark">
                                            Gallery
                                        </Link>
                                    </li>
                                    <li className="my-3">
                                        <Link to="#exhibition" className="text-dark">
                                            Exhibition
                                        </Link>
                                    </li>
                                    <li className="my-3">
                                        <Link to="/article" className="text-dark">
                                            Articles
                                        </Link>
                                    </li>
                                    {/* <li className="my-3">
                                        <Link to="#testimonials" className="text-dark">
                                            Testimonials
                                        </Link>
                                    </li> */}
                                    <li className="my-3">
                                        <Link to="#contact" className="text-dark">
                                            Contact
                                        </Link>
                                    </li>
                                </ul>
                            </Col>

                            <Col md={6}>
                                <img
                                    src={'https://cdn.dribbble.com/users/1531379/screenshots/4643688/me-800-600.gif'}
                                    alt="Animated GIF"
                                    className="img-fluid rounded"
                                    style={{ maxWidth: '100%', height: 'auto' }}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <p className="mt-lg-5 pt-4 mb-lg-0 mb-4 text-dark">Priya 2024. All rights reserved.</p>
                </Row>
            </Container>
        </section>
    );
};

export default Footer;
