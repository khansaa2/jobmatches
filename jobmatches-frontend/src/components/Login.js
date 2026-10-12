import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
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
                                <h2 className="text-center mb-4">Login</h2>
                                
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">
                                            Username or Email
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            name="username"
                                            value={credentials.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="password" className="form-label">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            value={credentials.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className="mt-2">
                                            <a href="/forgot-password" className="text-decoration-none small">
                                                Forgot Password?
                                            </a>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100 btn-lg">
                                        Login
                                    </button>

                                    <div className="text-center mt-3">
                                        Don't have an account?{' '}
                                        <a href="/register" className="text-decoration-none">
                                            Sign up here
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

export default Login; 