import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JobOffers.module.css';

const JobOffers = () => {
    const [jobOffers, setJobOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        checkAdminAccess();
        fetchJobOffers();
        // eslint-disable-next-line
    }, [currentPage, searchTerm]);

    const checkAdminAccess = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserRole(user?.role || null);
        if (user?.role !== 'ADMIN') {
            navigate('/dashboard');
        }
    };

    const fetchJobOffers = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:8081/api/job-offers?page=${currentPage}&size=${pageSize}&search=${searchTerm}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (!response.ok) {
                throw new Error('Failed to fetch job offers');
            }
            const data = await response.json();
            setJobOffers(data);
            setTotalPages(data.totalPages);
            setTotalItems(data.totalItems);
            setError('');
        } catch (err) {
            setError('Error loading job offers. Please try again later.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this job offer?')) {
            try {
                const response = await fetch(`http://localhost:8081/api/job-offers/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    fetchJobOffers(); // Refresh the list
                } else {
                    throw new Error('Failed to delete job offer');
                }
            } catch (err) {
                setError('Error deleting job offer. Please try again later.');
            }
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0); // Reset to first page when searching
        setSearchTerm(searchInput);
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
        <div className={styles.adminContainer}>
            {/* Remove extra admin dashboard navbar/header, only use main navbar */}
            <div className="container-fluid mt-4">
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Manage Job Offers</h2>
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/job-offers/new')}
                    >
                        <i className="bi bi-plus-lg"></i> Add New Job
                    </button>
                </div>

                {/* Search Section */}
                <div className="card mb-4">
                    <div className="card-body">
                        <form onSubmit={handleSearch} className="row g-3">
                            <div className="col-md-10">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by job title..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <button type="submit" className="btn btn-primary w-100">
                                    <i className="bi bi-search"></i> Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {/* Table Section */}
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Job Title</th>
                                        <th>Company</th>
                                        <th>Location</th>
                                        <th>Salary Range</th>
                                        <th>Posted Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobOffers.map(offer => (
                                        <tr key={offer.id}>
                                            <td>{offer.id}</td>
                                            <td>{offer.jobTitle}</td>
                                            <td>{offer.companyName}</td>
                                            <td>{offer.city}, {offer.country}</td>
                                            <td>
                                                {offer.currency} {offer.salaryRangeMin != null ? offer.salaryRangeMin.toLocaleString() : "-"} - {offer.salaryRangeMax != null ? offer.salaryRangeMax.toLocaleString() : "-"}
                                            </td>
                                            <td>{offer.jobPostingDate ? new Date(offer.jobPostingDate).toLocaleDateString() : "-"}</td>
                                            <td>
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => navigate(`/job-offers/${offer.id}`)}
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => navigate(`/job-offers/edit/${offer.id}`)}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(offer.id)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div>
                                Showing {jobOffers.length} of {totalItems} entries
                            </div>
                            <nav>
                                <ul className="pagination mb-0">
                                    <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(curr => curr - 1)}
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
                                            onClick={() => setCurrentPage(curr => curr + 1)}
                                            disabled={currentPage === totalPages - 1}
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobOffers;