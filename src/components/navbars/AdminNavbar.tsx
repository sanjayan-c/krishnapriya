import { useEffect, useRef } from 'react';
import { Container, Navbar } from 'react-bootstrap';
import classNames from 'classnames';
import AdminMenu from './AdminMenu';
import logo from '../../assets/images/New-MemArk-Logo.png';

type AdminNavbarProps = {
  isSticky?: boolean;
  navClass?: string;
  fixedWidth?: boolean; // keep if you need it later
};

const AdminNavbar = ({ isSticky = true, navClass, fixedWidth = true }: AdminNavbarProps) => {
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const onScroll = () => {
      if (window.scrollY >= 120) el.classList.add('navbar-sticky');
      else el.classList.remove('navbar-sticky');
    };

    if (isSticky) {
      el.classList.remove('non-sticky');  // ensure override is off
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll(); // initialize
      return () => window.removeEventListener('scroll', onScroll);
    } else {
      // 🔒 HARD DISABLE stickiness on this page
      window.removeEventListener('scroll', onScroll);
      el.classList.remove('navbar-sticky'); // remove any leftover sticky class
      el.classList.add('non-sticky');       // force non-sticky
    }
  }, [isSticky]);

  return (
    <header>
      <Navbar
        ref={navRef}
        // no sticky ID when non-sticky (id is optional anyway)
        id={isSticky ? 'admin-sticky' : undefined}
        collapseOnSelect
        expand="lg"
        bg="primary"
        variant="dark"
        data-bs-theme="dark"
        className={classNames('topnav-menu', navClass)}
      >
        <Container className="py-3 py-lg-2">
          <Navbar.Brand href="/admin" className="me-3 py-2 py-lg-0">
            <img src={logo} height={50} className="d-inline-block align-top" alt="MemArk Admin" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav" className="justify-content-end">
            <AdminMenu />
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <style>{`
        /* Sticky applies ONLY when the class is present */
        #admin-sticky.navbar-sticky {
          position: sticky;
          top: 0;
          z-index: 1030;
          backdrop-filter: blur(6px);
        }

        /* 🚫 Force non-sticky when isSticky={false} (overrides any global .navbar-sticky rules) */
        .non-sticky {
          position: static !important;
          top: auto !important;
        }

        /* Keep your link styles */
        .topnav-menu .navbar-nav .nav-link { color:#fff !important; opacity:.9; }
        .topnav-menu .navbar-nav .nav-link:hover,
        .topnav-menu .navbar-nav .nav-link:focus { color:#fff !important; opacity:1; text-decoration:underline; text-underline-offset:4px; }
        .topnav-menu .navbar-nav .nav-link.active { color:#fff !important; font-weight:600; text-decoration:underline; text-underline-offset:4px; }
        .topnav-menu .navbar-collapse.show .nav-link { color:#fff !important; }
        .topnav-menu .navbar-toggler:focus { box-shadow:0 0 0 .1rem rgba(255,255,255,.3); }
      `}</style>
    </header>
  );
};

export default AdminNavbar;
