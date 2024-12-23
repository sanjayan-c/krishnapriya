import { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import classNames from 'classnames';

type MenuProps = {
    navClass?: string;
    buttonClass?: string;
};

const Menu = ({ navClass }: MenuProps) => {
    const [activeSection, setActiveSection] = useState<string>('home');
    const url = "http://localhost:3000"; // Base URL

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
            <Nav.Item as="li">
                <a
                    href={`${url}/#home`} // Use template literal
                    className={classNames('nav-link', { active: activeSection === 'home' })}
                >
                    Home
                </a>
            </Nav.Item>
            <Nav.Item as="li">
                <a
                    href={`${url}/#about`}
                    className={classNames('nav-link', { active: activeSection === 'about' })}
                >
                    About
                </a>
            </Nav.Item>
            <Nav.Item as="li">
                <a
                    href={`${url}/#gallery`}
                    className={classNames('nav-link', { active: activeSection === 'gallery' })}
                >
                    Gallery
                </a>
            </Nav.Item>
            <Nav.Item as="li">
                <a
                    href={`${url}/#testimonials`}
                    className={classNames('nav-link', { active: activeSection === 'testimonials' })}
                >
                    Testimonials
                </a>
            </Nav.Item>
            <Nav.Item as="li">
                <a
                    href={`${url}/#exhibition`}
                    className={classNames('nav-link', { active: activeSection === 'exhibition' })}
                >
                    Exhibition
                </a>
            </Nav.Item>
            <Nav.Item as="li">
                <a
                    href={`${url}/#contact`}
                    className={classNames('nav-link', { active: activeSection === 'contact' })}
                >
                    Contact
                </a>
            </Nav.Item>
            {/* <Nav.Item as="li">
            <button className="btn btn-white-custom">
        <a
            href={`${url}/#contact`}
            id='nav-link-button'
            className={classNames('nav-link', { active: activeSection === 'contact' })}
        >
            Contact
        </a>
    </button>
    </Nav.Item> */}
        </Nav>
    );
};

export default Menu;
