import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ManageNavbar: React.FC = () => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
            <Container>
                <Navbar.Brand as={Link} to="/dashboard">
                    Manage Portal
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/manage-articles">
                            Manage Articles
                        </Nav.Link>
                        <Nav.Link as={Link} to="/add-articles">
                            Add Article
                        </Nav.Link>
                        <Nav.Link as={Link} to="/manage-exhibition">
                            Manage Exhibitions
                        </Nav.Link>
                        <Nav.Link as={Link} to="/manage-gallery">
                            Manage Galleries
                        </Nav.Link>
                        <Nav.Link as={Link} to="/add-gallery">
                            Add Gallery
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default ManageNavbar;
