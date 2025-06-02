
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';
import FeatherIcon from 'feather-icons-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import axios from 'axios';
import { LightBox, ImageType } from 'components/LightBox';
import Navbar3 from 'components/navbars/Navbar3';
import Footer from '../../Footer/Footer';
// component
import BackToTop from 'components/BackToTop';

import Gallery from './Gallery';

const PortfolioMasonry = () => {
    return (
        <>
            {/* gallery */}
            <div className="header-7">
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
                                {/* <h1 className="hero-title mb-0" style={{ color: '#ffffff', fontWeight: 'bold' }}> */}
                                <h1 className="display-3 mb-4" style={{ color: '#ffffff', fontWeight: 'bold' }}>    
                                    Gallery
                                </h1>
                                {/* <p className="mb-4 fs-17 mt-4" style={{ color: '#ffffff' }}>
                                    The gallery showcases a collection of my artwork, my creative
                                    journey and vision.
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
            <section className="overflow-hidden pb-5 pb-md-6 pb-lg-7">
                <Container>
                    <Gallery />
                </Container>
            </section>
            {/* <Gallery/> */}

            <Footer />
            <BackToTop />
        </>
    );
};

export default PortfolioMasonry;
