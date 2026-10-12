import React, { useState, useEffect } from 'react';
import api from '../config/api';

const PredictionHistory = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await api.get('/cv-analysis/history');
        setPredictions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load prediction history');
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Prediction History</h2>
      {predictions.length === 0 ? (
        <p>No predictions found.</p>
      ) : (
        <ul>
          {predictions.map((pred) => (
            <li key={pred.id}>
              <strong>Predicted Title:</strong> {pred.predicted_title} <br />
              <strong>Confidence:</strong> {pred.confidence} <br />
              <strong>Predicted At:</strong> {new Date(pred.predictedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PredictionHistory; 