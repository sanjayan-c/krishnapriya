// export default Menu;
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { Nav } from 'react-bootstrap';
import navIcon1 from '../../assets/images/social/nav-icon1.svg';
import navIcon2 from '../../assets/images/social/nav-icon2.svg';
import navIcon3 from '../../assets/images/social/nav-icon3.svg';
import navIcon4 from '../../assets/images/social/nav-icon4.svg';
import navIcon1Hover from '../../assets/images/social/nav-icon1-hover.svg';
import navIcon2Hover from '../../assets/images/social/nav-icon2-hover.svg';
import navIcon3Hover from '../../assets/images/social/nav-icon3-hover.svg';
import navIcon4Hover from '../../assets/images/social/nav-icon4-hover.svg';

type MenuProps = {
    navClass?: string;
    buttonClass?: string;
};

const Menu = ({ navClass }: MenuProps) => {
    const location = useLocation(); // Get current location
    const { pathname, hash } = location; // Extract pathname and hash
    const [activeSection, setActiveSection] = useState<string>('home');

    // Scroll to the element with the hash id
    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', '')); // Remove # to get id
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [hash]);

    // Set active section based on hash or pathname
    useEffect(() => {
        if (hash) {
            setActiveSection(hash.replace('#', '')); // Remove # to get section name
        } else if (pathname === '/') {
            setActiveSection('home'); // Default to home for root path
        } else {
            setActiveSection(pathname.split('/')[1]); // Handle other paths like /article
        }
    }, [pathname, hash]);
    
    return (
        <Nav as="ul" className={classNames('align-items-lg-center justify-content-center', navClass)}>
            <div className="align-items-lg-center justify-content-center py-lg-0 py-4 navbar-nav">
                <Nav.Item as="li">
                    <a href="/#home" className={classNames('nav-link', { active: activeSection === 'home' })}>
                        Home
                    </a>
                </Nav.Item>
                <Nav.Item as="li">
                    <a href="/#about" className={classNames('nav-link', { active: activeSection === 'about' })}>
                        About
                    </a>
                </Nav.Item>
                <Nav.Item as="li">
                    <a href="/#gallery" className={classNames('nav-link', { active: activeSection === 'gallery' })}>
                        Gallery
                    </a>
                </Nav.Item>
                <Nav.Item as="li">
                    <a
                        href="/#exhibitions"
                        className={classNames('nav-link', { active: activeSection === 'exhibition' })}>
                        Exhibitions
                    </a>
                </Nav.Item>
                <Nav.Item as="li">
                    <a href="/articles" className={classNames('nav-link', { active: activeSection === 'article' })}>
                        Articles
                    </a>
                </Nav.Item>
            </div>

            <span className="navbar-text">
                <div className="social-icon">
                    <a href="https://www.facebook.com/krish.pri.1" target="_blank" rel="noopener noreferrer">
                        <img src={navIcon4} alt="Krishnapriya Facebook Profile" className="social-icon-img" />
                        <img
                            src={navIcon4Hover}
                            alt="Sanjayan Instagram Profile Hover"
                            className="social-icon-img-hover"
                        />
                    </a>
                    <a href="https://www.instagram.com/krish.pri" target="_blank" rel="noopener noreferrer">
                        <img src={navIcon3} alt="Krishnapriya Instagram Profile" className="social-icon-img" />
                        <img
                            src={navIcon3Hover}
                            alt="Sanjayan Instagram Profile Hover"
                            className="social-icon-img-hover"
                        />
                    </a>
                </div>

                <div className="vvd-container">
                    <Nav.Item as="li">
                        <button className="btn btn-white-custom">
                            <a
                                href="/#contact"
                                id="nav-link-button"
                                className={classNames('nav-link', { active: activeSection === 'contact' })}>
                                Contact
                            </a>
                        </button>
                    </Nav.Item>
                </div>
            </span>
        </Nav>
    );
};

export default Menu;
