import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './UserApplications.module.css';

const UserApplications = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        dateRange: {
            start: '',
            end: ''
        }
    });

    useEffect(() => {
        fetchUserAndApplications();
    }, [userId]);

    const fetchUserAndApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch user details
            const userResponse = await axios.get(
                `http://localhost:8081/api/users/${userId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setUser(userResponse.data);

            // Fetch user's applications
            const applicationsResponse = await axios.get(
                `http://localhost:8081/api/job-applications/user/${userId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setApplications(applicationsResponse.data);
        } catch (err) {
            setError('Failed to load user data and applications');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:8081/api/job-applications/${applicationId}/status`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            // Refresh applications after status update
            fetchUserAndApplications();
        } catch (err) {
            console.error('Error updating application status:', err);
            alert('Failed to update application status');
        }
    };

    const handleFilterChange = (type, value) => {
        if (type === 'dateRange') {
            setFilters(prev => ({
                ...prev,
                dateRange: {
                    ...prev.dateRange,
                    [value.field]: value.date
                }
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [type]: value
            }));
        }
    };

    const filteredApplications = applications.filter(app => {
        if (filters.status !== 'all' && app.status !== filters.status) return false;
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            if (!app.jobTitle.toLowerCase().includes(searchLower) &&
                !app.companyName.toLowerCase().includes(searchLower)) return false;
        }
        if (filters.dateRange.start && new Date(app.appliedAt) < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && new Date(app.appliedAt) > new Date(filters.dateRange.end)) return false;
        return true;
    });

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <div className={styles.header}>
                <div className="d-flex justify-content-between align-items-center">
                    <h1 className={styles.title}>
                        <i className="bi bi-person-circle me-2"></i>
                        {user?.username}'s Applications
                    </h1>
                    <button 
                        className="btn btn-outline-primary"
                        onClick={() => navigate('/dashboard')}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Dashboard
                    </button>
                </div>
                <p className={styles.subtitle}>{user?.email}</p>
            </div>

            {/* Filters Section */}
            <div className={`card ${styles.card} mb-4`}>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Status Filter</label>
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="REVIEWING">Reviewing</option>
                                <option value="INTERVIEW">Interview</option>
                                <option value="ACCEPTED">Accepted</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Search</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by job title or company..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Date Range</label>
                            <div className="input-group">
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.dateRange.start}
                                    onChange={(e) => handleFilterChange('dateRange', { field: 'start', date: e.target.value })}
                                />
                                <span className="input-group-text">to</span>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.dateRange.end}
                                    onChange={(e) => handleFilterChange('dateRange', { field: 'end', date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <div className={`card ${styles.card}`}>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Job Title</th>
                                    <th>Company</th>
                                    <th>Applied Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.map(app => (
                                    <tr key={app.id}>
                                        <td>{app.jobTitle}</td>
                                        <td>{app.companyName}</td>
                                        <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                        <td>
                                            <select
                                                className={`form-select form-select-sm ${styles.statusSelect}`}
                                                value={app.status}
                                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="REVIEWING">Reviewing</option>
                                                <option value="INTERVIEW">Interview</option>
                                                <option value="ACCEPTED">Accepted</option>
                                                <option value="REJECTED">Rejected</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => navigate(`/job-offers/${app.jobOfferId}`)}
                                            >
                                                <i className="bi bi-eye me-1"></i>
                                                View Job
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserApplications; 