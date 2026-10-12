import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import styles from './ApplicationHistory.module.css';

const ApplicationHistory = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    location: 'all',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/job-applications/history');
        setApplications(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load application history');
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

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
      status: 'all',
      search: '',
      location: 'all',
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  const filteredAndSortedApplications = useMemo(() => {
    let result = [...applications];

    // Apply filters
    if (filters.status !== 'all') {
      result = result.filter(app => app.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(app => 
        app.jobTitle.toLowerCase().includes(searchLower) ||
        app.companyName.toLowerCase().includes(searchLower)
      );
    }

    if (filters.location !== 'all') {
      result = result.filter(app => app.location === filters.location);
    }

    if (filters.dateRange.start) {
      result = result.filter(app => new Date(app.appliedAt) >= new Date(filters.dateRange.start));
    }

    if (filters.dateRange.end) {
      result = result.filter(app => new Date(app.appliedAt) <= new Date(filters.dateRange.end));
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.appliedAt) - new Date(b.appliedAt);
          break;
        case 'company':
          comparison = a.companyName.localeCompare(b.companyName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'salary':
          comparison = (parseFloat(a.salary) || 0) - (parseFloat(b.salary) || 0);
          break;
        case 'location':
          comparison = (a.location || '').localeCompare(b.location || '');
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [applications, filters, sortBy, sortOrder]);

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return styles.statusPending;
      case 'accepted':
        return styles.statusAccepted;
      case 'rejected':
        return styles.statusRejected;
      case 'interview':
        return styles.statusInterview;
      default:
        return styles.statusPending;
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleViewJobDetails = (jobOfferId) => {
    navigate(`/job-offers/${jobOfferId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <i className={`bi bi-arrow-repeat ${styles.loadingSpinner}`}></i>
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
        <h1 className={styles.title}>Application History</h1>
      </div>

      <div className={styles.filterSection}>
        <h2 className={styles.filterSectionTitle}>Filters & Sorting</h2>
        
        {/* Basic Filters */}
        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status:</label>
            <select
              className={styles.filterSelect}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="interview">Interview</option>
            </select>
          </div>

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

          <button
            className={styles.advancedFiltersButton}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <i className={`bi bi-chevron-${showAdvancedFilters ? 'up' : 'down'}`}></i>
            Advanced Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className={styles.advancedFilters}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Location:</label>
              <select
                className={styles.locationSelect}
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                <option value="all">All Locations</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
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
        )}

        {/* Sort Options */}
        <div className={styles.sortButtonGroup}>
          <button
            className={`${styles.sortButton} ${sortBy === 'date' ? styles.active : ''}`}
            onClick={() => handleSort('date')}
          >
            <i className={`bi bi-${sortBy === 'date' ? 'calendar-check' : 'calendar'}`}></i>
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`${styles.sortButton} ${sortBy === 'company' ? styles.active : ''}`}
            onClick={() => handleSort('company')}
          >
            <i className={`bi bi-${sortBy === 'company' ? 'building-check' : 'building'}`}></i>
            Company {sortBy === 'company' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`${styles.sortButton} ${sortBy === 'salary' ? styles.active : ''}`}
            onClick={() => handleSort('salary')}
          >
            <i className={`bi bi-${sortBy === 'salary' ? 'currency-dollar' : 'currency-exchange'}`}></i>
            Salary {sortBy === 'salary' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`${styles.sortButton} ${sortBy === 'location' ? styles.active : ''}`}
            onClick={() => handleSort('location')}
          >
            <i className={`bi bi-${sortBy === 'location' ? 'geo-alt-fill' : 'geo-alt'}`}></i>
            Location {sortBy === 'location' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.status !== 'all' || filters.search || filters.location !== 'all' || filters.dateRange.start || filters.dateRange.end) && (
        <div className={styles.filterTags}>
          {filters.status !== 'all' && (
            <span className={styles.filterTag}>
              Status: {filters.status}
              <button onClick={() => handleFilterChange('status', 'all')}>×</button>
            </span>
          )}
          {filters.search && (
            <span className={styles.filterTag}>
              Search: {filters.search}
              <button onClick={() => handleFilterChange('search', '')}>×</button>
            </span>
          )}
          {filters.location !== 'all' && (
            <span className={styles.filterTag}>
              Location: {filters.location}
              <button onClick={() => handleFilterChange('location', 'all')}>×</button>
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

      {filteredAndSortedApplications.length === 0 ? (
        <div className={styles.emptyState}>
          <i className={`bi bi-inbox ${styles.emptyStateIcon}`}></i>
          <p className={styles.emptyStateText}>No applications found</p>
          <p className={styles.subtitle}>Start applying to jobs to see your history here</p>
        </div>
      ) : (
        <div className={styles.applicationsGrid}>
          {filteredAndSortedApplications.map((app) => (
            <div key={app.id} className={styles.applicationCard}>
              <h2 className={styles.jobTitle}>{app.jobTitle}</h2>
              <div className={styles.companyName}>
                <i className="bi bi-building"></i>
                {app.companyName}
              </div>
              <div className={`${styles.statusBadge} ${getStatusBadgeClass(app.status)}`}>
                <i className="bi bi-circle-fill me-2"></i>
                {app.status}
              </div>
              <ul className={styles.detailsList}>
                <li className={styles.detailItem}>
                  <i className={`bi bi-calendar ${styles.detailIcon}`}></i>
                  Applied on {formatDate(app.appliedAt)}
                </li>
                {app.interviewDate && (
                  <li className={styles.detailItem}>
                    <i className={`bi bi-calendar-check ${styles.detailIcon}`}></i>
                    Interview on {formatDate(app.interviewDate)}
                  </li>
                )}
                {app.location && (
                  <li className={styles.detailItem}>
                    <i className={`bi bi-geo-alt ${styles.detailIcon}`}></i>
                    {app.location}
                  </li>
                )}
                {app.salary && (
                  <li className={styles.detailItem}>
                    <i className={`bi bi-currency-dollar ${styles.detailIcon}`}></i>
                    {app.salary}
                  </li>
                )}
              </ul>
              <div className={styles.cardActions}>
                <button
                  className={styles.viewDetailsButton}
                  onClick={() => handleViewJobDetails(app.jobOfferId)}
                >
                  <i className="bi bi-eye me-2"></i>
                  View Job Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationHistory; 