import { useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap';
import classNames from 'classnames';
import { NavLink, useLocation } from 'react-router-dom';

type AdminMenuProps = {
  navClass?: string;
};

const AdminMenu = ({ navClass }: AdminMenuProps) => {
  const { pathname } = useLocation();
  const [activeKey, setActiveKey] = useState<string>('');

  useEffect(() => {
    // Normalize active key based on /admin/<segment>
    const [, root, seg] = pathname.split('/'); // ["", "admin", "gallery"]
    if (root === 'admin') {
      setActiveKey(seg || 'dashboard');
    } else {
      setActiveKey('');
    }
  }, [pathname]);

  return (
    <Nav as="ul" className={classNames('align-items-lg-center', navClass)}>
      <Nav.Item as="li">
        <NavLink
          to="/admin/gallery"
          className={({ isActive }) => classNames('nav-link', { active: isActive || activeKey === 'gallery' })}
        >
          Gallery
        </NavLink>
      </Nav.Item>

      <Nav.Item as="li">
        <NavLink
          to="/admin/exhibitions"
          className={({ isActive }) => classNames('nav-link', { active: isActive || activeKey === 'exhibitions' })}
        >
          Exhibitions
        </NavLink>
      </Nav.Item>

      <Nav.Item as="li">
        <NavLink
          to="/admin/articles"
          className={({ isActive }) => classNames('nav-link', { active: isActive || activeKey === 'articles' })}
        >
          Articles
        </NavLink>
      </Nav.Item>

      <Nav.Item as="li">
        <NavLink
          to="/admin/testimonials"
          className={({ isActive }) => classNames('nav-link', { active: isActive || activeKey === 'testimonials' })}
        >
          Testimonials
        </NavLink>
      </Nav.Item>
    </Nav>
  );
};

export default AdminMenu;
