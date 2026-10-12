import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './JobOfferForm.module.css';

const JobOfferForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        companyName: '',
        jobTitle: '',
        jobDescription: '',
        experienceRequired: '',
        keySkills: '',
        roleCategory: '',
        location: '',
        city: '',
        state: '',
        country: '',
        functionalArea: '',
        industry: '',
        role: '',
        salaryRangeMin: '',
        salaryRangeMax: '',
        currency: 'USD',
        remoteOption: 'OFFICE',
        educationRequirements: '',
        employmentType: 'FULL_TIME',
        benefits: ''
    });

    useEffect(() => {
        if (id) {
            fetchJobOffer();
        }
    }, [id]);

    const fetchJobOffer = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8081/api/job-offers/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch job offer');
            const data = await response.json();
            setFormData(data);
        } catch (err) {
            setError('Error loading job offer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            setLoading(true);
            const url = id 
                ? `http://localhost:8081/api/job-offers/${id}`
                : 'http://localhost:8081/api/job-offers';
            
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save job offer');
            
            navigate('/job-offers');
        } catch (err) {
            setError('Error saving job offer. Please try again.');
        } finally {
            setLoading(false);
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

    return (
        <div className="container mt-4">
            <h2>{id ? 'Edit Job Offer' : 'Create New Job Offer'}</h2>
            
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                    <label htmlFor="companyName" className="form-label">Company Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label htmlFor="jobTitle" className="form-label">Job Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-12">
                    <label htmlFor="jobDescription" className="form-label">Job Description</label>
                    <textarea
                        className="form-control"
                        id="jobDescription"
                        name="jobDescription"
                        value={formData.jobDescription}
                        onChange={handleChange}
                        rows="4"
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label htmlFor="experienceRequired" className="form-label">Experience Required</label>
                    <input
                        type="text"
                        className="form-control"
                        id="experienceRequired"
                        name="experienceRequired"
                        value={formData.experienceRequired}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label htmlFor="keySkills" className="form-label">Key Skills</label>
                    <input
                        type="text"
                        className="form-control"
                        id="keySkills"
                        name="keySkills"
                        value={formData.keySkills}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-md-4">
                    <label htmlFor="city" className="form-label">City</label>
                    <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-md-4">
                    <label htmlFor="state" className="form-label">State</label>
                    <input
                        type="text"
                        className="form-control"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-md-4">
                    <label htmlFor="country" className="form-label">Country</label>
                    <input
                        type="text"
                        className="form-control"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label htmlFor="salaryRangeMin" className="form-label">Minimum Salary</label>
                    <input
                        type="number"
                        className="form-control"
                        id="salaryRangeMin"
                        name="salaryRangeMin"
                        value={formData.salaryRangeMin}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label htmlFor="salaryRangeMax" className="form-label">Maximum Salary</label>
                    <input
                        type="number"
                        className="form-control"
                        id="salaryRangeMax"
                        name="salaryRangeMax"
                        value={formData.salaryRangeMax}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-md-4">
                    <label htmlFor="currency" className="form-label">Currency</label>
                    <select
                        className="form-select"
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        required
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                </div>

                <div className="col-md-4">
                    <label htmlFor="remoteOption" className="form-label">Work Location</label>
                    <select
                        className="form-select"
                        id="remoteOption"
                        name="remoteOption"
                        value={formData.remoteOption}
                        onChange={handleChange}
                        required
                    >
                        <option value="OFFICE">Office</option>
                        <option value="REMOTE">Remote</option>
                        <option value="HYBRID">Hybrid</option>
                    </select>
                </div>

                <div className="col-md-4">
                    <label htmlFor="employmentType" className="form-label">Employment Type</label>
                    <select
                        className="form-select"
                        id="employmentType"
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleChange}
                        required
                    >
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERNSHIP">Internship</option>
                    </select>
                </div>

                <div className="col-12">
                    <label htmlFor="benefits" className="form-label">Benefits</label>
                    <textarea
                        className="form-control"
                        id="benefits"
                        name="benefits"
                        value={formData.benefits}
                        onChange={handleChange}
                        rows="3"
                    />
                </div>

                <div className="col-12 mt-4">
                    <button type="submit" className="btn btn-primary me-2">
                        {id ? 'Update Job Offer' : 'Create Job Offer'}
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => navigate('/job-offers')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JobOfferForm; 