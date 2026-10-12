import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import JobOffers from './components/JobOffers';
import JobOfferForm from './components/JobOfferForm';
import JobOfferDetails from './components/JobOfferDetails';
import CVAnalysis from './components/CVAnalysis';
import ApplicationHistory from './components/ApplicationHistory';
import PredictionHistory from './components/PredictionHistory';
import RecommendationHistory from './components/RecommendationHistory';
import PredictionsWithRecommendations from './components/PredictionsWithRecommendations';
import UserApplications from './components/UserApplications';
import Users from './components/Users';
// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Import Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css';
// Import Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const PrivateRoute = ({ children, adminOnly = false, userOnly = false }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token) {
        return <Navigate to="/login" />;
    }
    if (adminOnly && user?.role !== 'ADMIN') {
        return <Navigate to="/dashboard" />;
    }
    if (userOnly && user?.role !== 'USER') {
        return <Navigate to="/dashboard" />;
    }
    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div>
                    <Navbar />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/job-offers"
                            element={
                                <PrivateRoute>
                                    <JobOffers />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/job-offers/new"
                            element={
                                <PrivateRoute adminOnly={true}>
                                    <JobOfferForm />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/job-offers/edit/:id"
                            element={
                                <PrivateRoute adminOnly={true}>
                                    <JobOfferForm />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/job-offers/:id"
                            element={
                                <PrivateRoute>
                                    <JobOfferDetails />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/cv-analysis"
                            element={
                                <PrivateRoute userOnly={true}>
                                    <CVAnalysis />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/applications" element={<PrivateRoute userOnly={true}><ApplicationHistory /></PrivateRoute>} />
                        <Route path="/predictions" element={<PrivateRoute userOnly={true}><PredictionHistory /></PrivateRoute>} />
                        <Route path="/recommendations" element={<PrivateRoute userOnly={true}><RecommendationHistory /></PrivateRoute>} />
                        <Route path="/my-predictions" element={<PrivateRoute userOnly={true}><PredictionsWithRecommendations /></PrivateRoute>} />
                        <Route
                            path="/users/:userId/applications"
                            element={
                                <PrivateRoute adminOnly={true}>
                                    <UserApplications />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/users" element={<PrivateRoute adminOnly={true}><Users /></PrivateRoute>} />
                        <Route path="/" element={<Navigate to="/job-offers" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
