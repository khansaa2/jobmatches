import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import styles from './CVAnalysis.module.css';

// Spring Boot backend URL
const API_BASE_URL = 'http://localhost:8081/api';
const ML_API_URL = 'http://localhost:8000';

const CVAnalysis = () => {
    const [formData, setFormData] = useState({
        skills: '',
        education: '',
        experience: '',
        summary: ''
    });
    const [file, setFile] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadMode, setUploadMode] = useState('file'); // Default to 'file' mode

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleModeChange = (mode) => {
        setUploadMode(mode);
        setError('');
        setPredictions(null);
        setFile(null);
        setFormData({
            skills: '',
            education: '',
            experience: '',
            summary: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("handleSubmit called", uploadMode, file);
        setLoading(true);
        setError('');
        setPredictions(null);

        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            if (uploadMode === 'file' && file) {
                // 1. Save the CV in the database
                const formDataUpload = new FormData();
                formDataUpload.append('file', file);
                headers['Content-Type'] = 'multipart/form-data';
                const cvResponse = await axios.post(
                    `${API_BASE_URL}/cvs/upload`,
                    formDataUpload,
                    { headers }
                );
                const savedCV = cvResponse.data;

                // 2. Send the file to the ML API for analysis
                const mlFormData = new FormData();
                mlFormData.append('file', file);
                const mlResponse = await axios.post(
                    `${ML_API_URL}/upload`,
                    mlFormData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                const mlResult = mlResponse.data;

                // 3. Send the ML API result, user, and CV info to the backend to store predictions and recommendations
                const user = JSON.parse(localStorage.getItem('user'));
                const analyzePayload = {
                    cvId: savedCV.id
                };
                const analyzeResponse = await axios.post(
                    `${API_BASE_URL}/cv-analysis/analyze`,
                    analyzePayload,
                    { headers: { ...headers, 'Content-Type': 'application/json' } }
                );
                console.log("analyzeResponse.data", analyzeResponse.data);
                setPredictions(analyzeResponse.data.top_predictions);
                setError('');
                setLoading(false);
                return;
            } else {
                headers['Content-Type'] = 'application/json';
                const response = await axios.post(
                    `${API_BASE_URL}/cv-analysis/analyze`,
                    formData,
                    { headers }
                );
                console.log("manual analyze response", response.data);
                setPredictions(response.data.top_predictions);
                if (response.data.extracted_sections) {
                    setFormData({
                        skills: response.data.extracted_sections.skills || '',
                        education: response.data.extracted_sections.education || '',
                        experience: response.data.extracted_sections.experience || '',
                        summary: response.data.extracted_sections.summary || ''
                    });
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while analyzing your CV');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>CV Analysis</h2>
            <Card className={styles.card}>
                <Card.Body>
                    <div className={styles.modeSelector}>
                        <Button
                            variant={uploadMode === 'manual' ? 'primary' : 'outline-primary'}
                            onClick={() => handleModeChange('manual')}
                            className="me-2"
                        >
                            Manual Input
                        </Button>
                        <Button
                            variant={uploadMode === 'file' ? 'primary' : 'outline-primary'}
                            onClick={() => handleModeChange('file')}
                        >
                            File Upload
                        </Button>
                    </div>

                    <Form onSubmit={handleSubmit} className="mt-4">
                        {uploadMode === 'file' ? (
                            <Form.Group className="mb-3">
                                <Form.Label>Upload CV</Form.Label>
                                <Form.Control
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Supported formats: PDF, DOC, DOCX
                                </Form.Text>
                            </Form.Group>
                        ) : (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Skills</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        placeholder="Enter your skills..."
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Education</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="education"
                                        value={formData.education}
                                        onChange={handleChange}
                                        placeholder="Enter your education history..."
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Experience</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        placeholder="Enter your work experience..."
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Summary</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="summary"
                                        value={formData.summary}
                                        onChange={handleChange}
                                        placeholder="Enter a brief summary about yourself..."
                                        required
                                    />
                                </Form.Group>
                            </>
                        )}

                        <Button 
                            variant="primary" 
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? 'Analyzing...' : 'Analyze CV'}
                        </Button>
                    </Form>

                    {error && (
                        <Alert variant="danger" className="mt-3">
                            {error}
                        </Alert>
                    )}

                    {predictions && (
                        <div className={styles.predictions}>
                            <h3>Top Job Matches</h3>
                            {predictions.map((pred, index) => (
                                <Card key={index} className={styles.predictionCard}>
                                    <Card.Body>
                                        <Card.Title>{pred.title}</Card.Title>
                                        <Card.Text>
                                            Confidence: {(pred.confidence * 100).toFixed(2)}%
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default CVAnalysis; 