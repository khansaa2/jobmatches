import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://localhost:8081/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                })
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/login');
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please try again later.');
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className={`card ${styles.card}`}>
                            <div className={`card-body ${styles.cardBody}`}>
                                <h2 className="text-center mb-4">Sign Up</h2>
                                
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className="form-text">
                                            We'll never share your email with anyone else.
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="form-label">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="role" className="form-label">
                                            Role
                                        </label>
                                        <select
                                            className="form-select"
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="" disabled>Select your role</option>
                                            <option value="USER">Job Seeker</option>
                                            <option value="ADMIN">admin</option>
                                        </select>
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100 btn-lg">
                                        Sign Up
                                    </button>

                                    <div className="text-center mt-3">
                                        Already have an account?{' '}
                                        <a href="/login" className="text-decoration-none">
                                            Login here
                                        </a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 