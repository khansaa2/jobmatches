import React, { useState, useEffect, useMemo } from 'react';
import styles from './PredictionsWithRecommendations.module.css';

const badgeColors = [
  'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'
];

const PredictionsWithRecommendations = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPredictionId, setExpandedPredictionId] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    dateRange: {
      start: '',
      end: ''
    },
    matchScore: 'all'
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:8081/api/user/predictions-with-recommendations`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch predictions');
        const data = await response.json();
        setPredictions(data);
      } catch (err) {
        setError(err.message || 'Failed to load predictions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  const handleApply = async (jobOfferId) => {
    try {
      setApplyingJobId(jobOfferId);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/job-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobOfferId }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying for job:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplyingJobId(null);
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

  const handleSort = (type) => {
    if (sortBy === type) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      dateRange: {
        start: '',
        end: ''
      },
      matchScore: 'all'
    });
  };

  const filteredAndSortedPredictions = useMemo(() => {
    let result = [...predictions];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(pred => 
        pred.predictedTitle.toLowerCase().includes(searchLower) ||
        pred.recommendations.some(rec => 
          rec.jobOffer.jobTitle.toLowerCase().includes(searchLower) ||
          rec.jobOffer.companyName.toLowerCase().includes(searchLower)
        )
      );
    }

    if (filters.dateRange.start) {
      result = result.filter(pred => new Date(pred.predictedAt) >= new Date(filters.dateRange.start));
    }

    if (filters.dateRange.end) {
      result = result.filter(pred => new Date(pred.predictedAt) <= new Date(filters.dateRange.end));
    }

    if (filters.matchScore !== 'all') {
      const minScore = parseInt(filters.matchScore);
      result = result.filter(pred => 
        pred.recommendations.some(rec => rec.score * 100 >= minScore)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.predictedAt) - new Date(b.predictedAt);
          break;
        case 'title':
          comparison = a.predictedTitle.localeCompare(b.predictedTitle);
          break;
        case 'matchScore':
          const aMaxScore = Math.max(...a.recommendations.map(r => r.score));
          const bMaxScore = Math.max(...b.recommendations.map(r => r.score));
          comparison = aMaxScore - bMaxScore;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [predictions, filters, sortBy, sortOrder]);

  const toggleExpand = (predictionId) => {
    setExpandedPredictionId(expandedPredictionId === predictionId ? null : predictionId);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <i className={`bi bi-arrow-repeat ${styles.loadingSpinner}`}></i>
          <p>Loading your predictions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <i className={`bi bi-exclamation-circle ${styles.errorIcon}`}></i>
          <p className={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <i className="bi bi-lightbulb-fill"></i>
          My Past Predictions & Recommended Jobs
        </h1>
      </div>

      <div className={styles.filterSection}>
        <h2 className={styles.filterSectionTitle}>Filters & Sorting</h2>
        
        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Search:</label>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by job title or company..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Match Score:</label>
            <select
              className={styles.filterSelect}
              value={filters.matchScore}
              onChange={(e) => handleFilterChange('matchScore', e.target.value)}
            >
              <option value="all">All Scores</option>
              <option value="80">80% and above</option>
              <option value="60">60% and above</option>
              <option value="40">40% and above</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Date Range:</label>
            <div className={styles.dateRangeGroup}>
              <input
                type="date"
                className={styles.dateInput}
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { field: 'start', date: e.target.value })}
              />
              <span>to</span>
              <input
                type="date"
                className={styles.dateInput}
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { field: 'end', date: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className={styles.sortButtonGroup}>
          <button
            className={`${styles.sortButton} ${sortBy === 'date' ? styles.active : ''}`}
            onClick={() => handleSort('date')}
          >
            <i className={`bi bi-${sortBy === 'date' ? 'calendar-check' : 'calendar'}`}></i>
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`${styles.sortButton} ${sortBy === 'title' ? styles.active : ''}`}
            onClick={() => handleSort('title')}
          >
            <i className={`bi bi-${sortBy === 'title' ? 'briefcase-fill' : 'briefcase'}`}></i>
            Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`${styles.sortButton} ${sortBy === 'matchScore' ? styles.active : ''}`}
            onClick={() => handleSort('matchScore')}
          >
            <i className={`bi bi-${sortBy === 'matchScore' ? 'graph-up-arrow' : 'graph-up'}`}></i>
            Match Score {sortBy === 'matchScore' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.search || filters.matchScore !== 'all' || filters.dateRange.start || filters.dateRange.end) && (
        <div className={styles.filterTags}>
          {filters.search && (
            <span className={styles.filterTag}>
              Search: {filters.search}
              <button onClick={() => handleFilterChange('search', '')}>×</button>
            </span>
          )}
          {filters.matchScore !== 'all' && (
            <span className={styles.filterTag}>
              Match Score: {filters.matchScore}%+
              <button onClick={() => handleFilterChange('matchScore', 'all')}>×</button>
            </span>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <span className={styles.filterTag}>
              Date Range: {filters.dateRange.start || 'Start'} - {filters.dateRange.end || 'End'}
              <button onClick={() => handleFilterChange('dateRange', { field: 'start', date: '' })}>×</button>
            </span>
          )}
          <button className={styles.filterTag} onClick={clearFilters}>
            Clear All
          </button>
        </div>
      )}

      {filteredAndSortedPredictions.length === 0 ? (
        <div className={styles.emptyState}>
          <i className={`bi bi-inbox ${styles.emptyStateIcon}`}></i>
          <p className={styles.emptyStateText}>No predictions found</p>
          <p className={styles.subtitle}>Upload your CV to get started!</p>
        </div>
      ) : (
        <div className={styles.predictionsGrid}>
          {filteredAndSortedPredictions.map((pred) => (
            <div key={pred.predictionId} className={styles.predictionCard}>
              <div 
                className={styles.predictionHeader}
                onClick={() => toggleExpand(pred.predictionId)}
              >
                <div className={styles.predictionTitle}>
                  <i className="bi bi-lightbulb-fill"></i>
                  {pred.predictedTitle}
                </div>
                <div className={styles.predictionDate}>
                  <i className="bi bi-calendar-event"></i>
                  {new Date(pred.predictedAt).toLocaleString()}
                </div>
              </div>
              
              {expandedPredictionId === pred.predictionId && (
                <div className={styles.predictionBody}>
                  <h6 className={styles.recommendationsTitle}>
                    <i className="bi bi-briefcase-fill"></i>
                    Recommended Jobs
                  </h6>
                  
                  {pred.recommendations.length === 0 ? (
                    <div className={styles.emptyState}>
                      <i className={`bi bi-exclamation-triangle ${styles.emptyStateIcon}`}></i>
                      <p className={styles.emptyStateText}>No job offers found for this prediction</p>
                    </div>
                  ) : (
                    <div className={styles.recommendationsGrid}>
                      {pred.recommendations.map((rec) => (
                        <div key={rec.recommendationId} className={styles.recommendationCard}>
                          <h5 className={styles.jobTitle}>
                            <i className="bi bi-briefcase"></i>
                            {rec.jobOffer.jobTitle}
                          </h5>
                          <div className={styles.companyName}>
                            <i className="bi bi-building"></i>
                            {rec.jobOffer.companyName}
                          </div>
                          
                          <ul className={styles.jobDetails}>
                            <li className={styles.jobDetail}>
                              <i className="bi bi-geo-alt"></i>
                              {rec.jobOffer.city}, {rec.jobOffer.country}
                            </li>
                            <li className={styles.jobDetail}>
                              <i className="bi bi-cash-stack"></i>
                              {rec.jobOffer.currency} {rec.jobOffer.salaryRangeMin?.toLocaleString() || '-'} - {rec.jobOffer.salaryRangeMax?.toLocaleString() || '-'}
                            </li>
                          </ul>

                          <div className={styles.matchScore}>
                            <i className="bi bi-bar-chart-fill"></i>
                            Match: {(rec.score * 100).toFixed(0)}%
                          </div>

                          <button
                            className={styles.applyButton}
                            onClick={() => handleApply(rec.jobOffer.id)}
                            disabled={applyingJobId === rec.jobOffer.id}
                          >
                            {applyingJobId === rec.jobOffer.id ? (
                              <>
                                <i className="bi bi-arrow-repeat"></i>
                                Applying...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-send-check"></i>
                                Apply
                              </>
                            )}
                          </button>

                          <div className={styles.recommendationFooter}>
                            <i className="bi bi-clock-history"></i>
                            Recommended: {rec.createdAt ? new Date(rec.createdAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PredictionsWithRecommendations; 