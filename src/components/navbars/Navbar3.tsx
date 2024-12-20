import { useEffect } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import classNames from 'classnames';


// components
import Menu from './Menu';

// images
import logo from '../../assets/images/logo.png';

type Navbar3Props = {
    isSticky?: boolean;
    navClass?: string;
    buttonClass?: string;
    fixedWidth?: boolean;
};

const Navbar3 = ({ isSticky, navClass, buttonClass, fixedWidth }: Navbar3Props) => {
    // on scroll add navbar class and back to top button
    useEffect(() => {
        const btnTop = document.getElementById('btn-back-to-top');
        const navbar = document.getElementById('sticky');
        window.addEventListener('scroll', (e) => {
            e.preventDefault();
            if (btnTop) {
                if (document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50) {
                    btnTop.classList.add('show');
                } else {
                    btnTop.classList.remove('show');
                }
            }
            if (navbar) {
                if (document.body.scrollTop >= 0 || document.documentElement.scrollTop >= 0) {
                    navbar.classList.add('navbar-sticky');
                } else {
                    navbar.classList.remove('navbar-sticky');
                }
            }
        });
    }, []);

    useEffect(() => {
        const navbar = document.getElementById('sticky');
        const logo = document.querySelector('.navbar-logo');
    
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop >= 240 || document.documentElement.scrollTop >= 240) {
                if (navbar) navbar.classList.add('navbar-sticky');
                if (logo) logo.classList.add('hidden-logo');
            } else {
                if (navbar) navbar.classList.remove('navbar-sticky');
                if (logo) logo.classList.remove('hidden-logo');
            }
        });
    }, []);

    return (
        <header>
            <Navbar
    id={isSticky ? 'sticky' : ''}
    collapseOnSelect
    expand="lg"
    className={classNames('topnav-menu', navClass)}
>
    {/* <Container fluid={!fixedWidth}>
        <Navbar.Brand href="/">
            <img src={logo} height="50" className="d-inline-block align-top" alt="" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
            <Menu
                navClass={classNames('mx-start', 'ms-auto')} // Add 'ms-auto' to push items to the right
                buttonClass={buttonClass ? buttonClass : 'btn-primary'}
            />
        </Navbar.Collapse>
    </Container> */}
    <Container fluid={!fixedWidth}>
    <div className="row w-100 align-items-center mx-auto">
        {/* Logo and Toggle Section */}
        <div className="col-12 d-flex align-items-center">
            {/* Logo */}
            <Navbar.Brand
                href="/"
                className="d-flex align-items-center justify-content-start justify-content-lg-center w-100 navbar-logo"
            >
                <img
                    src={logo}
                    height="50"
                    className="d-inline-block align-top"
                    alt="Logo"
                />
            </Navbar.Brand>

            {/* Toggle Button (only for mobile/tablet) */}
            <Navbar.Toggle
                aria-controls="responsive-navbar-nav"
                className="d-lg-none ms-auto"
            />
        </div>

        {/* Menu Section */}
        <div className="col-12 d-lg-flex justify-content-lg-center">
            <Navbar.Collapse id="responsive-navbar-nav">
                <Menu
                    navClass="mx-auto"
                    buttonClass={buttonClass ? buttonClass : 'btn-primary'}
                />
            </Navbar.Collapse>
        </div>
    </div>
</Container>

</Navbar>

        </header>
    );
};

export default Navbar3;
