import React, { useState, useEffect } from 'react';
import api from '../config/api';

const RecommendationHistory = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get('/cv-analysis/recommendations');
        setRecommendations(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load recommendation history');
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Recommendation History</h2>
      {recommendations.length === 0 ? (
        <p>No recommendations found.</p>
      ) : (
        <ul>
          {recommendations.map((rec) => (
            <li key={rec.id}>
              <strong>Job Offer:</strong> {rec.jobOffer.jobTitle} <br />
              <strong>Match Score:</strong> {rec.matchScore} <br />
              <strong>Recommended At:</strong> {new Date(rec.recommendedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecommendationHistory; 