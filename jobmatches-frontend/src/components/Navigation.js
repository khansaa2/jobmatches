import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navigation.module.css';

const Navigation = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'ADMIN';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className={styles.navbar}>
            <Container>
                <Navbar.Brand as={Link} to="/job-offers">Job Matches</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/job-offers">Job Offers</Nav.Link>
                        {isAdmin && (
                            <Nav.Link as={Link} to="/job-offers/new">Post Job</Nav.Link>
                        )}
                        <Nav.Link as={Link} to="/cv-analysis">CV Analysis</Nav.Link>
                    </Nav>
                    <Nav>
                        {user ? (
                            <>
                                <span className={`nav-link ${styles.username}`}>
                                    {user.username} ({user.role})
                                </span>
                                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation; 