import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './JobOfferDetails.module.css';

const JobOfferDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [jobOffer, setJobOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        fetchJobOffer();
        const user = JSON.parse(localStorage.getItem('user'));
        setUserRole(user?.role || null);
    }, [id]);

    const fetchJobOffer = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/job-offers/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch job offer');
            const data = await response.json();
            setJobOffer(data);
        } catch (err) {
            setError('Error loading job offer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/job-applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    jobOfferId: id
                })
            });

            if (!response.ok) throw new Error('Failed to apply for job');
            
            // Show success message or redirect
            navigate('/my-applications');
        } catch (err) {
            setError('Error applying for job. Please try again.');
        }
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

    if (!jobOffer) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    Job offer not found.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <h2 className="card-title mb-1">{jobOffer.jobTitle}</h2>
                            <h4 className="text-muted">{jobOffer.companyName}</h4>
                        </div>
                        <div>
                            {userRole === 'ADMIN' ? (
                                <button 
                                    className="btn btn-outline-primary me-2"
                                    onClick={() => navigate(`/job-offers/edit/${id}`)}
                                >
                                    Edit Job Offer
                                </button>
                            ) : (
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleApply}
                                >
                                    Apply Now
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <i className="bi bi-geo-alt me-2"></i>
                                <strong>Location:</strong> {jobOffer.city}, {jobOffer.state}, {jobOffer.country}
                            </div>
                            <div className="mb-3">
                                <i className="bi bi-briefcase me-2"></i>
                                <strong>Experience:</strong> {jobOffer.experienceRequired}
                            </div>
                            <div className="mb-3">
                                <i className="bi bi-cash me-2"></i>
                                <strong>Salary Range:</strong> {jobOffer.salaryRangeMin} - {jobOffer.salaryRangeMax} {jobOffer.currency}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <i className="bi bi-building me-2"></i>
                                <strong>Employment Type:</strong> {jobOffer.employmentType}
                            </div>
                            <div className="mb-3">
                                <i className="bi bi-laptop me-2"></i>
                                <strong>Work Location:</strong> {jobOffer.remoteOption}
                            </div>
                            <div className="mb-3">
                                <i className="bi bi-calendar me-2"></i>
                                <strong>Posted:</strong> {new Date(jobOffer.jobPostingDate).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h5>Job Description</h5>
                        <p className="white-space-pre-wrap">{jobOffer.jobDescription}</p>
                    </div>

                    <div className="mb-4">
                        <h5>Key Skills</h5>
                        <div className="d-flex flex-wrap gap-2">
                            {jobOffer.keySkills.split(',').map((skill, index) => (
                                <span key={index} className="badge bg-light text-dark border">
                                    {skill.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    {jobOffer.benefits && (
                        <div className="mb-4">
                            <h5>Benefits</h5>
                            <p className="white-space-pre-wrap">{jobOffer.benefits}</p>
                        </div>
                    )}

                    <div className="mt-4">
                        <button 
                            className="btn btn-secondary me-2"
                            onClick={() => navigate('/job-offers')}
                        >
                            Back to Job Listings
                        </button>
                        {userRole !== 'ADMIN' && (
                            <button 
                                className="btn btn-primary"
                                onClick={handleApply}
                            >
                                Apply Now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobOfferDetails; 