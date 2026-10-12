import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import axios from 'axios';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [predictions, setPredictions] = useState([]);
    const [jobOffers, setJobOffers] = useState({});
    const [isLoadingOffers, setIsLoadingOffers] = useState(false);
    const [recentJobOffers, setRecentJobOffers] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(storedUser);
        setUser(userData);
        if (userData.role === 'ADMIN') {
            fetchRecentJobOffers();
            fetchRecentUsers();
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadStatus('');
        }
    };

    const fetchJobOffers = async (jobTitle) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8081/api/job-offers/search?title=${encodeURIComponent(jobTitle)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching job offers:', error);
            return [];
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setUploadStatus('Please select a file first');
            return;
        }

        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        setIsUploading(true);
        setPredictions([]);
        setJobOffers({});
        try {
            const token = localStorage.getItem('token');
            // 1. Save the CV in the database
            const cvResponse = await axios.post(
                'http://localhost:8081/api/cvs/upload',
                formDataUpload,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const savedCV = cvResponse.data;

            // 2. Call the ML API for analysis
            const mlFormData = new FormData();
            mlFormData.append('file', file);
            const mlResponse = await axios.post(
                'http://localhost:8000/upload',
                mlFormData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            // 3. Call the backend to analyze and store predictions
            const analyzePayload = { cvId: savedCV.id };
            const analyzeResponse = await axios.post(
                'http://localhost:8081/api/cv-analysis/analyze',
                analyzePayload,
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setPredictions(analyzeResponse.data.top_predictions || []);
            setUploadStatus('CV uploaded and analyzed successfully!');
        } catch (error) {
            setUploadStatus(error.response?.data?.error || 'Error uploading or analyzing CV');
            setPredictions([]);
            setJobOffers({});
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        if (predictions.length > 0) {
            setIsLoadingOffers(true);
            const fetchAllOffers = async () => {
                const offersMap = {};
                for (const prediction of predictions) {
                    const offers = await fetchJobOffers(prediction.title);
                    offersMap[prediction.title] = offers;
                }
                setJobOffers(offersMap);
                setIsLoadingOffers(false);
            };
            fetchAllOffers();
        }
    }, [predictions]);

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    const fetchRecentJobOffers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:8081/api/job-offers?page=0&size=5',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setRecentJobOffers(response.data.content || []);
        } catch (error) {
            setRecentJobOffers([]);
        }
    };

    const fetchRecentUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:8081/api/users?page=0&size=5',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setRecentUsers(response.data.content || []);
        } catch (error) {
            setRecentUsers([]);
        }
    };

    if (!user) return null;

    // ADMIN DASHBOARD ONLY
    if (user.role === 'ADMIN') {
        return (
            <div className={styles.dashboardContainer}>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-8">
                            {/* Job Offers Management Card */}
                            <div className={`card ${styles.card} mb-4`}>
                                <div className={`card-header ${styles.cardHeader} d-flex justify-content-between align-items-center`}>
                                    <h5 className={styles.cardTitle}>
                                        <i className="bi bi-briefcase me-2"></i>
                                        Job Offers Management
                                    </h5>
                                    <button 
                                        className={`btn ${styles.viewDetailsButton}`}
                                        onClick={() => navigate('/job-offers')}
                                    >
                                        Manage All Jobs
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Company</th>
                                                    <th>Location</th>
                                                    <th>Posted Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentJobOffers.map(offer => (
                                                    <tr key={offer.id}>
                                                        <td>{offer.jobTitle}</td>
                                                        <td>{offer.companyName}</td>
                                                        <td>{offer.city}, {offer.country}</td>
                                                        <td>{offer.jobPostingDate ? new Date(offer.jobPostingDate).toLocaleDateString() : '-'}</td>
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
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            {/* Users Management Card */}
                            <div className={`card ${styles.card} mb-4`}>
                                <div className={`card-header ${styles.cardHeader} d-flex justify-content-between align-items-center`}>
                                    <h5 className={styles.cardTitle}>
                                        <i className="bi bi-people me-2"></i>
                                        Users Management
                                    </h5>
                                    <button 
                                        className={`btn ${styles.viewDetailsButton}`}
                                        onClick={() => navigate('/users')}
                                    >
                                        Manage All Users
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                </div>
                                <div className="card-body">
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
                                                {recentUsers.map(user => (
                                                    <tr key={user.id}>
                                                        <td>{user.username}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.role}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => navigate(`/users/${user.id}/applications`)}
                                                            >
                                                                <i className="bi bi-clipboard-check me-1"></i>
                                                                View Applications
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
                        {/* User Profile Section */}
                        <div className="col-lg-4">
                            <div className={styles.userProfileCard}>
                                <div className={styles.profileHeader}>
                                    {user.profileImage ? (
                                        <img
                                            src={user.profileImage}
                                            alt={user.username}
                                            className={styles.profileImage}
                                        />
                                    ) : (
                                        <div className={styles.profileImagePlaceholder}>
                                            {user.username[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <h3 className={styles.userName}>{user.username}</h3>
                                    <p className={styles.userRole}>{user.role}</p>
                                    <p className={styles.userEmail}>{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // USER DASHBOARD ONLY
    return (
        <div className={styles.dashboardContainer}>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-8">
                        {/* CV Upload Section */}
                        <div className={`card ${styles.card} mb-4`}>
                            <div className={`card-header ${styles.cardHeader}`}>
                                <h5 className={styles.cardTitle}>Upload Your CV</h5>
                            </div>
                            <div className={`card-body ${styles.uploadSection}`}>
                                <form onSubmit={handleUpload}>
                                    <div className={styles.fileInput}>
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="cvFile"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="cvFile" className="mb-3 d-block">
                                            <i className="bi bi-cloud-upload fs-1 text-primary"></i>
                                            <p className="mt-2">
                                                {file ? file.name : 'Drag and drop your CV here or click to browse'}
                                            </p>
                                            <small className="text-muted">
                                                Supported formats: PDF, DOC, DOCX
                                            </small>
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        className={`btn ${styles.uploadButton}`}
                                        disabled={isUploading || !file}
                                    >
                                        {isUploading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Analyzing CV...
                                            </>
                                        ) : (
                                            'Upload and Analyze CV'
                                        )}
                                    </button>
                                    {uploadStatus && (
                                        <div className={`alert ${uploadStatus.includes('successfully') ? styles.alertSuccess : styles.alertError}`}>
                                            {uploadStatus}
                                        </div>
                                    )}
                                </form>

                                {/* Job Predictions and Offers Section */}
                                {predictions.length > 0 && (
                                    <div className={styles.predictionsSection}>
                                        <h6 className="mb-3">Top Job Role Matches:</h6>
                                        <div className="accordion" id="predictionsAccordion">
                                            {predictions.map((prediction, index) => (
                                                <div key={index} className={`accordion-item ${styles.accordionItem}`}>
                                                    <h2 className="accordion-header">
                                                        <button
                                                            className={`accordion-button ${styles.accordionButton}`}
                                                            type="button"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target={`#collapse${index}`}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center w-100">
                                                                <span>{prediction.title}</span>
                                                                <span className={styles.matchBadge}>
                                                                    {Math.round(prediction.confidence * 100)}% Match
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </h2>
                                                    <div
                                                        id={`collapse${index}`}
                                                        className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                                                        data-bs-parent="#predictionsAccordion"
                                                    >
                                                        <div className="accordion-body">
                                                            <div className={`progress ${styles.progressBar}`}>
                                                                <div
                                                                    className={`progress-bar ${styles.progressBarFill}`}
                                                                    role="progressbar"
                                                                    style={{ width: `${prediction.confidence * 100}%` }}
                                                                    aria-valuenow={prediction.confidence * 100}
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"
                                                                />
                                                            </div>
                                                            
                                                            <h6 className="mt-4">Available Job Offers:</h6>
                                                            {isLoadingOffers ? (
                                                                <div className="text-center py-4">
                                                                    <div className={`spinner-border ${styles.loadingSpinner}`} role="status">
                                                                        <span className="visually-hidden">Loading...</span>
                                                                    </div>
                                                                </div>
                                                            ) : jobOffers[prediction.title]?.length > 0 ? (
                                                                <div className="mt-3">
                                                                    {jobOffers[prediction.title].map((offer, offerIndex) => (
                                                                        <div key={offerIndex} className={styles.jobOfferCard}>
                                                                            <h6 className={styles.companyName}>{offer.companyName}</h6>
                                                                            <p className={styles.jobTitle}>{offer.jobTitle}</p>
                                                                            <div className={styles.jobDetails}>
                                                                                <p className="mb-1">
                                                                                    <i className="bi bi-geo-alt me-2"></i>
                                                                                    {offer.city}, {offer.country}
                                                                                </p>
                                                                                <p className="mb-1">
                                                                                    <i className="bi bi-briefcase me-2"></i>
                                                                                    {offer.employmentType}
                                                                                </p>
                                                                                <p className="mb-2">
                                                                                    <i className="bi bi-currency-dollar me-2"></i>
                                                                                    {offer.currency} {offer.salaryRangeMin?.toLocaleString() || '-'} - {offer.salaryRangeMax?.toLocaleString() || '-'}
                                                                                </p>
                                                                            </div>
                                                                            <button
                                                                                className={styles.viewDetailsButton}
                                                                                onClick={() => navigate(`/job-offers/${offer.id}`)}
                                                                            >
                                                                                View Details
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className={`alert ${styles.alertInfo}`}>
                                                                    No job offers found for this role at the moment.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* History Cards Section */}
                        <div className="row">
                            <div className="col-md-6 mb-4">
                                <div className={`card ${styles.card} h-100`} onClick={() => navigate('/applications')} style={{ cursor: 'pointer' }}>
                                    <div className={`card-header ${styles.cardHeader}`}>
                                        <h5 className={styles.cardTitle}>
                                            <i className="bi bi-clipboard-check me-2"></i>
                                            Application History
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <p className="card-text">
                                            View and manage all your job applications in one place. Track your application status and interview schedules.
                                        </p>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span className="text-muted">
                                                <i className="bi bi-clock-history me-1"></i>
                                                Last updated: {new Date().toLocaleDateString()}
                                            </span>
                                            <button className={`btn ${styles.viewDetailsButton}`}>
                                                View Applications
                                                <i className="bi bi-arrow-right ms-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 mb-4">
                                <div className={`card ${styles.card} h-100`} onClick={() => navigate('/my-predictions')} style={{ cursor: 'pointer' }}>
                                    <div className={`card-header ${styles.cardHeader}`}>
                                        <h5 className={styles.cardTitle}>
                                            <i className="bi bi-lightbulb me-2"></i>
                                            Prediction History
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <p className="card-text">
                                            Review your past CV analyses and job predictions. See how your skills match with different job roles.
                                        </p>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span className="text-muted">
                                                <i className="bi bi-clock-history me-1"></i>
                                                Last updated: {new Date().toLocaleDateString()}
                                            </span>
                                            <button className={`btn ${styles.viewDetailsButton}`}>
                                                View Predictions
                                                <i className="bi bi-arrow-right ms-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* User Profile Section */}
                    <div className="col-lg-4">
                        <div className={styles.userProfileCard}>
                            <div className={styles.profileHeader}>
                                {user.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt={user.username}
                                        className={styles.profileImage}
                                    />
                                ) : (
                                    <div className={styles.profileImagePlaceholder}>
                                        {user.username[0]?.toUpperCase()}
                                    </div>
                                )}
                                <h3 className={styles.userName}>{user.username}</h3>
                                <p className={styles.userRole}>{user.role || 'Job Seeker'}</p>
                                <p className={styles.userEmail}>{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 