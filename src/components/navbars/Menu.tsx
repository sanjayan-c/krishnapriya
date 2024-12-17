import { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import classNames from 'classnames';

type MenuProps = {
    navClass?: string;
    buttonClass?: string; // Add buttonClass here
};

const Menu = ({ navClass }: MenuProps) => {
    const [activeSection, setActiveSection] = useState<string>('home');

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
                    href="#home"
                    className={classNames('nav-link', { active: activeSection === 'home' })}
                >
                    Home
                </a>
            </Nav.Item>
            <Nav.Item as="li">
                <a
                    href="#about"
                    className={classNames('nav-link', { active: activeSection === 'about' })}
                >
                    About
                </a>
            </Nav.Item>
            <Nav.Item as="li">
                <a
                    href="#gallery"
                    className={classNames('nav-link', { active: activeSection === 'gallery' })}
                >
                    Gallery
                </a>
            </Nav.Item>
            <Nav.Item as="li">
                <a
                    href="#testimonials"
                    className={classNames('nav-link', { active: activeSection === 'testimonials' })}
                >
                    Testimonials
                </a>
            </Nav.Item>
            <Nav.Item as="li">
                <a
                    href="#exhibition"
                    className={classNames('nav-link', { active: activeSection === 'testimonials' })}
                >
                    Exhibition
                </a>
            </Nav.Item>
            <Nav.Item as="li">
                <a
                    href="#contact"
                    className={classNames('nav-link', { active: activeSection === 'contact' })}
                >
                    Contact
                </a>
            </Nav.Item>
        </Nav>
    );
};

export default Menu;
