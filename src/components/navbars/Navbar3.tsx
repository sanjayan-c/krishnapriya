import { useEffect } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import classNames from 'classnames';
// components
import Menu from './Menu';

// images
import logo from '../../assets/images/New-MemArk-Logo.png';

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
        if (window.scrollY >= 50) {
          btnTop.classList.add('show');
        } else {
          btnTop.classList.remove('show');
        }
      }
      if (navbar) {
        if (window.scrollY >= 240) {
          navbar.classList.add('navbar-sticky');
        } else {
          navbar.classList.remove('navbar-sticky');
        }
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
        style={{ flexWrap: 'wrap' }} // allow wrapping on larger screens
      >
        <Container fluid={!fixedWidth}>
          {/*** Desktop-only Brand on its own row ***/}
          <div className="w-100 d-none d-lg-flex justify-content-center">
            <Navbar.Brand href="/">
              <img src={logo} height="100" className="d-inline-block align-top mt-4 mb-4" alt="MemArk Logo" />
            </Navbar.Brand>
          </div>

          {/*** Mobile-only Brand inline ***/}
          <Navbar.Brand href="/" className="d-lg-none">
            <img src={logo} height="50" className="d-inline-block align-top" alt="MemArk Logo" />
          </Navbar.Brand>

          {/*** Force a line break on lg+ so toggle/menu drop below the desktop brand ***/}
          <div className="w-100 d-none d-lg-block"></div>

          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Menu
              navClass={classNames('mx-start', 'me-auto', 'ms-auto')}
              buttonClass={buttonClass ? buttonClass : 'btn-primary'}
            />
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/*** Hide the desktop brand when sticky ***/}
      <style>{`
        #sticky.navbar-sticky .d-lg-flex .navbar-brand {
          display: none !important;
          margin-botom: 0 !important;
        }
      `}</style>
    </header>
  );
};

export default Navbar3;
