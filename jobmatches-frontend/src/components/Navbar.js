import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold d-flex align-items-center" to="/dashboard">
                    <i className="bi bi-briefcase-fill me-2"></i> Job Matches
                </Link>
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#mainNavbar" 
                    aria-controls="mainNavbar" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="mainNavbar">
                    {user ? (
                        <>
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item">
                                    <Link className="nav-link" to="/dashboard">
                                        <i className="bi bi-speedometer2 me-1"></i> Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/job-offers">
                                        <i className="bi bi-briefcase me-1"></i> Jobs
                                    </Link>
                                </li>
                                {user.role === 'USER' && (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/my-predictions">
                                                <i className="bi bi-lightbulb me-1"></i> My Predictions
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/applications">
                                                <i className="bi bi-clipboard-check me-1"></i> Applications
                                            </Link>
                                        </li>
                                    </>
                                )}
                                {user.role === 'ADMIN' && (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/users">
                                                <i className="bi bi-people me-1"></i> Users
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                                <li className="nav-item dropdown">
                                    <a 
                                        className="nav-link dropdown-toggle" 
                                        href="#" 
                                        id="userDropdown" 
                                        role="button" 
                                        data-bs-toggle="dropdown" 
                                        aria-expanded="false"
                                    >
                                        <i className="bi bi-person-circle me-1"></i>
                                        {user.username}
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                        <li>
                                            <Link className="dropdown-item" to="/dashboard">
                                                <i className="bi bi-speedometer2 me-2"></i>
                                                Dashboard
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button 
                                                className="dropdown-item text-danger" 
                                                onClick={handleLogout}
                                            >
                                                <i className="bi bi-box-arrow-right me-2"></i>
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </>
                    ) : (
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">
                                    <i className="bi bi-box-arrow-in-right me-1"></i> Login
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/register">
                                    <i className="bi bi-person-plus me-1"></i> Register
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 