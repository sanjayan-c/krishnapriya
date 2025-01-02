import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Navbar, Nav, Container } from 'react-bootstrap';
import navIcon1 from '../../assets/images/social/nav-icon1.svg';
import navIcon2 from '../../assets/images/social/nav-icon2.svg';
import navIcon3 from '../../assets/images/social/nav-icon3.svg';
import navIcon4 from '../../assets/images/social/nav-icon4.svg';
import navIcon1Hover from '../../assets/images/social/nav-icon1-hover.svg';
import navIcon2Hover from '../../assets/images/social/nav-icon2-hover.svg';
import navIcon3Hover from '../../assets/images/social/nav-icon3-hover.svg';
import navIcon4Hover from '../../assets/images/social/nav-icon4-hover.svg';
import FeatherIcon from 'feather-icons-react';

type MenuProps = {
    navClass?: string;
    buttonClass?: string;
};

const Menu = ({ navClass }: MenuProps) => {
    const [activeSection, setActiveSection] = useState<string>('home');
    const url = 'http://localhost:3000'; // Base URL

    // Observe section visibility
    useEffect(() => {
        const sections = document.querySelectorAll('section');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.3 }
        );

        sections.forEach((section) => observer.observe(section));

        return () => {
            sections.forEach((section) => observer.unobserve(section));
        };
    }, []);

    return (
        <Nav as="ul" className={classNames('align-items-lg-center justify-content-center', navClass)}>
            <div className="align-items-lg-center justify-content-center py-lg-0 py-4 navbar-nav">
                <Nav.Item as="li">
                    <a
                        href={`${url}/#home`} // Use template literal
                        className={classNames('nav-link', { active: activeSection === 'home' })}>
                        Home
                    </a>
                </Nav.Item>
                <Nav.Item as="li">
                    <a href={`${url}/#about`} className={classNames('nav-link', { active: activeSection === 'about' })}>
                        About
                    </a>
                </Nav.Item>
                <Nav.Item as="li">
                    <a
                        href={`${url}/#gallery`}
                        className={classNames('nav-link', { active: activeSection === 'gallery' })}>
                        Gallery
                    </a>
                </Nav.Item>
                {/* <Nav.Item as="li">
                <a
                    href={`${url}/#testimonials`}
                    className={classNames('nav-link', { active: activeSection === 'testimonials' })}
                >
                    Testimonials
                </a>
            </Nav.Item> */}
                <Nav.Item as="li">
                    <a
                        href={`${url}/#exhibition`}
                        className={classNames('nav-link', { active: activeSection === 'exhibition' })}>
                        Exhibition
                    </a>
                </Nav.Item>
                <Nav.Item as="li">
                    <a
                        href={`${url}/article`}
                        className={classNames('nav-link', { active: activeSection === 'article' })}>
                        Articles
                    </a>
                </Nav.Item>
            </div>

            {/* <Nav.Item as="li">
                <a
                    href={`${url}/#contact`}
                    className={classNames('nav-link', { active: activeSection === 'contact' })}
                >
                    Contact
                </a>
            </Nav.Item> */}
            {/* <Nav.Item as="li">
                <button className="btn btn-white-custom">
                    <a
                        href={`${url}/#contact`}
                        id="nav-link-button"
                        className={classNames('nav-link', { active: activeSection === 'contact' })}>
                        Contact
                    </a>
                </button>
            </Nav.Item> */}
            <span className="navbar-text">
                <div className="social-icon">
                    {/* <a href="https://www.linkedin.com/in/sanjayan-c/" target="_blank" rel="noopener noreferrer">
                        <img src={navIcon1} alt="Sanjayan LinkedIn Profile" className="social-icon-img" />
                        <img
                            src={navIcon1Hover}
                            alt="Sanjayan LinkedIn Profile Hover"
                            className="social-icon-img-hover"
                        />
                    </a>
                    <a href="https://github.com/IT21375514" target="_blank" rel="noopener noreferrer">
                        <img src={navIcon2} alt="Sanjayan GitHub Profile" className="social-icon-img" />
                        <img
                            src={navIcon2Hover}
                            alt="Sanjayan GitHub Profile Hover"
                            className="social-icon-img-hover"
                        />
                    </a> */}
                    <a href="https://www.instagram.com/l_o_l_l_y_g_a_g_201" target="_blank" rel="noopener noreferrer">
                        <img src={navIcon4} alt="Sanjayan Facebook Profile" className="social-icon-img" />
                        <img
                            src={navIcon4Hover}
                            alt="Sanjayan Instagram Profile Hover"
                            className="social-icon-img-hover"
                        />
                    </a>
                    <a href="https://www.instagram.com/l_o_l_l_y_g_a_g_201" target="_blank" rel="noopener noreferrer">
                        <img src={navIcon3} alt="Sanjayan Instagram Profile" className="social-icon-img" />
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
                                href={`${url}/#contact`}
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
