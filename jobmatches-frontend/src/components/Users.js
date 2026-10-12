import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './JobOffers.module.css'; // Reusing the same styles for consistency

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;
    const navigate = useNavigate();

    useEffect(() => {
        checkAdminAccess();
        fetchUsers();
    }, [currentPage, searchTerm]);

    const checkAdminAccess = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.role !== 'ADMIN') {
            navigate('/dashboard');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(
                `http://localhost:8081/api/users?page=${currentPage}&size=${pageSize}&search=${searchTerm}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data.content || []);
            setTotalPages(data.totalPages);
            setTotalItems(data.totalItems);
            setError('');
        } catch (err) {
            setError('Error loading users. Please try again later.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await fetch(`http://localhost:8081/api/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) {
                throw new Error('Failed to update user role');
            }

            fetchUsers(); // Refresh the list
        } catch (err) {
            setError('Error updating user role. Please try again later.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`http://localhost:8081/api/users/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    fetchUsers(); // Refresh the list
                } else {
                    throw new Error('Failed to delete user');
                }
            } catch (err) {
                setError('Error deleting user. Please try again later.');
            }
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0); // Reset to first page when searching
        fetchUsers();
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <i className="bi bi-people me-2"></i>
                    Users Management
                </h1>
            </div>

            {/* Search Bar */}
            <div className={`card ${styles.card} mb-4`}>
                <div className="card-body">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className={`card ${styles.card}`}>
                <div className="card-body">
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.username}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link
                                                        to={`/users/${user.id}/applications`}
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                    >
                                                        <i className="bi bi-clipboard-check me-1"></i>
                                                        View Applications
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <nav className="mt-4">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                                disabled={currentPage === 0}
                                            >
                                                Previous
                                            </button>
                                        </li>
                                        {[...Array(totalPages)].map((_, index) => (
                                            <li key={index} className={`page-item ${currentPage === index ? 'active' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(index)}
                                                >
                                                    {index + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                                disabled={currentPage === totalPages - 1}
                                            >
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Users; 