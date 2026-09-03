// pages/employees/Standups.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageSquare, Send, Clock, CheckCircle, AlertCircle, Plus,
  Calendar, User, Filter, RefreshCw, X, ChevronDown,
  Eye, Edit, Trash2, Search, Layers
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Standups = () => {
  const { token, user } = useAuth();
  const [standups, setStandups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStandup, setSelectedStandup] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    today: '',
    yesterday: '',
    blockers: '',
    tomorrow: '',
    additionalNotes: '',
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchStandups();
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStandups();
  }, [filterDate, filterDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let users = [];
      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          users = response.data.data;
        } else if (Array.isArray(response.data)) {
          users = response.data;
        }
      }
      
      const depts = [...new Set(users.map(u => u.department).filter(Boolean))];
      setDepartments(depts);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchStandups = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterDepartment) params.department = filterDepartment;

      const response = await axios.get(`${API_URL}/employees/standups`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      let standupData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          standupData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          standupData = response.data.data;
        } else if (response.data.standups && Array.isArray(response.data.standups)) {
          standupData = response.data.standups;
        }
      }
      
      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        standupData = standupData.filter(s => 
          s.today?.toLowerCase().includes(term) ||
          s.yesterday?.toLowerCase().includes(term) ||
          s.employeeId?.firstName?.toLowerCase().includes(term) ||
          s.employeeId?.lastName?.toLowerCase().includes(term)
        );
      }

      setStandups(standupData);
    } catch (err) {
      console.error('Error fetching standups:', err);
      let errorMessage = 'Failed to load standups.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view standups.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
      setStandups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.today.trim()) {
      toast.error('Please tell us what you will do today');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/employees/standups`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        toast.success('Standup created successfully');
        setShowCreateModal(false);
        setFormData({ today: '', yesterday: '', blockers: '', tomorrow: '', additionalNotes: '' });
        await fetchStandups(true);
      }
    } catch (err) {
      console.error('Error creating standup:', err);
      let errorMessage = 'Failed to create standup.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid standup data.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitStandup = async (id) => {
    setSubmitting(true);
    try {
      await axios.put(`${API_URL}/employees/standups/${id}/submit`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Standup submitted successfully');
      await fetchStandups(true);
    } catch (err) {
      console.error('Error submitting standup:', err);
      toast.error('Failed to submit standup');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'N/A';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'Just now';
    }
  };

  const getStatusStyle = (status) => {
    const statusStyles = {
      'submitted': {
        backgroundColor: '#013E37',
        color: '#FFEFB3',
        icon: CheckCircle,
        label: 'Submitted'
      },
      'acknowledged': {
        backgroundColor: '#0A5C54',
        color: '#FFEFB3',
        icon: CheckCircle,
        label: 'Acknowledged'
      },
      'draft': {
        backgroundColor: '#FFEFB3',
        color: '#013E37',
        icon: Clock,
        label: 'Draft'
      },
    };
    return statusStyles[status] || statusStyles.draft;
  };

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'manager';
  const canEdit = (standup) => {
    return standup.employeeId?._id === user?._id && standup.status === 'draft';
  };

  if (loading) {
    return (
      <div className="standup-loading">
        <div className="standup-loading-spinner"></div>
        <p className="standup-loading-text">Loading standups...</p>
      </div>
    );
  }

  const totalStandups = standups.length;
  const submittedCount = standups.filter(s => s.status === 'submitted' || s.status === 'acknowledged').length;
  const pendingCount = standups.filter(s => s.status === 'draft').length;

  return (
    <>
      <div className="standup-container">
        {/* Header Section */}
        <div className="standup-header">
          <div className="standup-header-left">
            <h1 className="standup-title">
              <Layers className="standup-title-icon" />
              Daily Standups
            </h1>
            <p className="standup-subtitle">
              {isAdmin ? 'View all team standups' : 'Share what you\'re working on and any blockers'}
            </p>
          </div>
          <div className="standup-header-right">
            <button className="standup-refresh-btn" onClick={() => fetchStandups(true)} disabled={refreshing}>
              <RefreshCw className={`standup-refresh-icon ${refreshing ? 'standup-spinning' : ''}`} />
            </button>
            <button className="standup-filter-btn" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="standup-filter-icon" />
              Filters
              <ChevronDown className={`standup-chevron ${showFilters ? 'standup-chevron-open' : ''}`} />
            </button>
            <button className="standup-create-btn" onClick={() => setShowCreateModal(true)}>
              <Plus className="standup-create-icon" />
              New Standup
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="standup-stats">
          <div className="standup-stat-card">
            <div className="standup-stat-content">
              <div>
                <p className="standup-stat-label">Total Standups</p>
                <p className="standup-stat-value">{totalStandups}</p>
              </div>
              <MessageSquare className="standup-stat-icon" style={{ color: '#013E37' }} />
            </div>
          </div>
          <div className="standup-stat-card">
            <div className="standup-stat-content">
              <div>
                <p className="standup-stat-label">Submitted</p>
                <p className="standup-stat-value" style={{ color: '#013E37' }}>{submittedCount}</p>
              </div>
              <CheckCircle className="standup-stat-icon" style={{ color: '#013E37' }} />
            </div>
          </div>
          <div className="standup-stat-card">
            <div className="standup-stat-content">
              <div>
                <p className="standup-stat-label">Pending</p>
                <p className="standup-stat-value" style={{ color: '#013E37' }}>{pendingCount}</p>
              </div>
              <Clock className="standup-stat-icon" style={{ color: '#013E37' }} />
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="standup-filter-panel">
            <div className="standup-filter-row">
              <div className="standup-filter-group">
                <label className="standup-filter-label">Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="standup-filter-input"
                />
              </div>
              {isAdmin && departments.length > 0 && (
                <div className="standup-filter-group">
                  <label className="standup-filter-label">Department</label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="standup-filter-select"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="standup-filter-group">
                <label className="standup-filter-label">Search</label>
                <div className="standup-search-bar">
                  <Search className="standup-search-icon" />
                  <input
                    type="text"
                    placeholder="Search standups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="standup-search-input"
                  />
                  {searchTerm && (
                    <button className="standup-search-clear" onClick={() => setSearchTerm('')}>
                      <X className="standup-search-clear-icon" />
                    </button>
                  )}
                </div>
              </div>
              <button className="standup-clear-filters" onClick={() => {
                setFilterDate('');
                setFilterDepartment('');
                setSearchTerm('');
                setShowFilters(false);
              }}>
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Standups Grid */}
        {standups.length === 0 ? (
          <div className="standup-empty">
            <div className="standup-empty-content">
              <MessageSquare className="standup-empty-icon" size={64} />
              <h3 className="standup-empty-title">No standups found</h3>
              <p className="standup-empty-subtext">
                {isAdmin ? 'No standups have been submitted yet.' : 'Create your first standup to get started.'}
              </p>
              {!isAdmin && (
                <button className="standup-empty-btn" onClick={() => setShowCreateModal(true)}>
                  <Plus className="standup-empty-btn-icon" />
                  Create Standup
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="standup-grid">
            {standups.map((standup, index) => {
              const statusStyle = getStatusStyle(standup.status);
              const StatusIcon = statusStyle.icon;
              
              return (
                <div key={standup._id} className="standup-card" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="standup-card-header">
                    <div className="standup-card-user">
                      <div className="standup-card-avatar" style={{ backgroundColor: '#013E37' }}>
                        {standup.employeeId?.firstName?.[0] || '?'}
                      </div>
                      <div>
                        <div className="standup-card-name">
                          {standup.employeeId?.firstName} {standup.employeeId?.lastName}
                        </div>
                        <div className="standup-card-meta">
                          <Calendar className="standup-card-meta-icon" />
                          {formatDate(standup.date || standup.createdAt)}
                          <span className="standup-card-dot">•</span>
                          <Clock className="standup-card-meta-icon" />
                          {formatTime(standup.createdAt)}
                        </div>
                      </div>
                    </div>
                    <span className="standup-status-badge" style={{
                      backgroundColor: statusStyle.backgroundColor,
                      color: statusStyle.color,
                    }}>
                      <StatusIcon className="standup-status-icon" />
                      {statusStyle.label}
                    </span>
                  </div>

                  <div className="standup-card-body">
                    <div className="standup-card-section">
                      <span className="standup-card-label">Today</span>
                      <p className="standup-card-text">{standup.today || 'Not specified'}</p>
                    </div>
                    {standup.yesterday && (
                      <div className="standup-card-section">
                        <span className="standup-card-label">Yesterday</span>
                        <p className="standup-card-text">{standup.yesterday}</p>
                      </div>
                    )}
                    {standup.blockers && (
                      <div className="standup-card-section standup-blocker-section">
                        <span className="standup-card-label standup-blocker-label">🚧 Blockers</span>
                        <p className="standup-card-text">{standup.blockers}</p>
                      </div>
                    )}
                    {standup.tomorrow && (
                      <div className="standup-card-section">
                        <span className="standup-card-label">Tomorrow</span>
                        <p className="standup-card-text">{standup.tomorrow}</p>
                      </div>
                    )}
                  </div>

                  <div className="standup-card-footer">
                    <button
                      className="standup-view-btn"
                      onClick={() => {
                        setSelectedStandup(standup);
                        setShowDetailModal(true);
                      }}
                    >
                      <Eye className="standup-view-icon" />
                      View Details
                    </button>
                    {canEdit(standup) && (
                      <button
                        className="standup-submit-btn"
                        onClick={() => handleSubmitStandup(standup._id)}
                        disabled={submitting}
                      >
                        <Send className="standup-submit-icon" />
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Standup Modal */}
      {showCreateModal && (
        <div className="standup-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="standup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="standup-modal-header">
              <div>
                <h2 className="standup-modal-title">Create Daily Standup</h2>
                <p className="standup-modal-subtitle">Share your daily progress and blockers</p>
              </div>
              <button className="standup-modal-close" onClick={() => setShowCreateModal(false)}>
                <X className="standup-modal-close-icon" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="standup-modal-form">
              <div className="standup-form-group">
                <label className="standup-form-label">What did you do yesterday?</label>
                <textarea
                  value={formData.yesterday}
                  onChange={(e) => setFormData({ ...formData, yesterday: e.target.value })}
                  rows={2}
                  className="standup-form-textarea"
                  placeholder="What did you accomplish yesterday?"
                  disabled={submitting}
                />
              </div>
              <div className="standup-form-group">
                <label className="standup-form-label">
                  What will you do today?
                  <span className="standup-form-required">*</span>
                </label>
                <textarea
                  value={formData.today}
                  onChange={(e) => setFormData({ ...formData, today: e.target.value })}
                  rows={2}
                  required
                  className="standup-form-textarea"
                  placeholder="What are your plans for today?"
                  disabled={submitting}
                />
              </div>
              <div className="standup-form-group">
                <label className="standup-form-label">Any blockers?</label>
                <textarea
                  value={formData.blockers}
                  onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                  rows={2}
                  className="standup-form-textarea"
                  placeholder="Any blockers or challenges?"
                  disabled={submitting}
                />
              </div>
              <div className="standup-form-group">
                <label className="standup-form-label">Plan for tomorrow</label>
                <textarea
                  value={formData.tomorrow}
                  onChange={(e) => setFormData({ ...formData, tomorrow: e.target.value })}
                  rows={2}
                  className="standup-form-textarea"
                  placeholder="What do you plan to do tomorrow?"
                  disabled={submitting}
                />
              </div>
              <div className="standup-form-group">
                <label className="standup-form-label">Additional Notes</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  rows={2}
                  className="standup-form-textarea"
                  placeholder="Any additional notes?"
                  disabled={submitting}
                />
              </div>
              <div className="standup-modal-actions">
                <button
                  type="button"
                  className="standup-modal-cancel"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ today: '', yesterday: '', blockers: '', tomorrow: '', additionalNotes: '' });
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="standup-modal-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Standup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standup Detail Modal */}
      {showDetailModal && selectedStandup && (
        <div className="standup-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="standup-modal standup-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="standup-modal-header standup-detail-header">
              <div>
                <h2 className="standup-modal-title">Standup Details</h2>
                <p className="standup-modal-subtitle">
                  {selectedStandup.employeeId?.firstName} {selectedStandup.employeeId?.lastName} • {formatDate(selectedStandup.date || selectedStandup.createdAt)}
                </p>
              </div>
              <button className="standup-modal-close" onClick={() => setShowDetailModal(false)}>
                <X className="standup-modal-close-icon" />
              </button>
            </div>
            <div className="standup-detail-body">
              <div className="standup-detail-section">
                <span className="standup-detail-label">📅 Date</span>
                <span className="standup-detail-value">{formatDate(selectedStandup.date || selectedStandup.createdAt)}</span>
              </div>
              <div className="standup-detail-section">
                <span className="standup-detail-label">👤 Employee</span>
                <span className="standup-detail-value">
                  {selectedStandup.employeeId?.firstName} {selectedStandup.employeeId?.lastName}
                </span>
              </div>
              <div className="standup-detail-section">
                <span className="standup-detail-label">📋 Status</span>
                <span className="standup-status-badge" style={{
                  ...getStatusStyle(selectedStandup.status)
                }}>
                  {selectedStandup.status || 'Draft'}
                </span>
              </div>
              <div className="standup-detail-section">
                <span className="standup-detail-label">📝 Today</span>
                <span className="standup-detail-value">{selectedStandup.today || 'Not specified'}</span>
              </div>
              {selectedStandup.yesterday && (
                <div className="standup-detail-section">
                  <span className="standup-detail-label">📝 Yesterday</span>
                  <span className="standup-detail-value">{selectedStandup.yesterday}</span>
                </div>
              )}
              {selectedStandup.blockers && (
                <div className="standup-detail-section standup-detail-blocker">
                  <span className="standup-detail-label standup-blocker-label">🚧 Blockers</span>
                  <span className="standup-detail-value standup-blocker-value">{selectedStandup.blockers}</span>
                </div>
              )}
              {selectedStandup.tomorrow && (
                <div className="standup-detail-section">
                  <span className="standup-detail-label">📝 Tomorrow</span>
                  <span className="standup-detail-value">{selectedStandup.tomorrow}</span>
                </div>
              )}
              {selectedStandup.additionalNotes && (
                <div className="standup-detail-section">
                  <span className="standup-detail-label">📝 Additional Notes</span>
                  <span className="standup-detail-value">{selectedStandup.additionalNotes}</span>
                </div>
              )}
              <div className="standup-detail-section">
                <span className="standup-detail-label">⏰ Submitted</span>
                <span className="standup-detail-value">
                  {selectedStandup.submittedAt 
                    ? `${formatTime(selectedStandup.submittedAt)} (${formatTimeAgo(selectedStandup.submittedAt)})`
                    : 'Not submitted yet'
                  }
                </span>
              </div>
              {selectedStandup.acknowledgedAt && (
                <div className="standup-detail-section">
                  <span className="standup-detail-label">✅ Acknowledged</span>
                  <span className="standup-detail-value">
                    {formatTime(selectedStandup.acknowledgedAt)} ({formatTimeAgo(selectedStandup.acknowledgedAt)})
                  </span>
                </div>
              )}
              {selectedStandup.managerFeedback && (
                <div className="standup-detail-section">
                  <span className="standup-detail-label">💬 Manager Feedback</span>
                  <span className="standup-detail-value">{selectedStandup.managerFeedback}</span>
                </div>
              )}
              <div className="standup-detail-actions">
                <button
                  className="standup-detail-close"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
                {canEdit(selectedStandup) && (
                  <button
                    className="standup-detail-submit"
                    onClick={() => {
                      handleSubmitStandup(selectedStandup._id);
                      setShowDetailModal(false);
                    }}
                    disabled={submitting}
                  >
                    <Send className="standup-detail-submit-icon" />
                    Submit Standup
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .standup-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .standup-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .standup-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .standup-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           HEADER
           ============================================ */
        .standup-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
          animation: fadeInDown 0.6s ease;
        }
        .standup-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .standup-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .standup-title-icon {
          width: 28px;
          height: 28px;
          color: #013E37;
          animation: pulse 2s ease-in-out infinite;
        }
        .standup-subtitle {
          color: #013E37;
          opacity: 0.6;
          font-size: 15px;
          margin: 0;
        }
        .standup-header-right {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .standup-refresh-btn {
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .standup-refresh-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .standup-refresh-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          transition: transform 0.3s ease;
        }
        .standup-spinning {
          animation: spin 1s linear infinite;
        }
        .standup-filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .standup-filter-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .standup-filter-icon {
          width: 16px;
          height: 16px;
        }
        .standup-chevron {
          width: 14px;
          height: 14px;
          transition: transform 0.3s ease;
        }
        .standup-chevron-open {
          transform: rotate(180deg);
        }
        .standup-create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.25);
        }
        .standup-create-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .standup-create-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        .standup-create-btn:hover .standup-create-icon {
          transform: rotate(90deg);
        }

        /* ============================================
           STATS
           ============================================ */
        .standup-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .standup-stat-card {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 16px 20px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
        }
        .standup-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }
        .standup-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .standup-stat-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
          font-weight: 500;
        }
        .standup-stat-value {
          font-size: 22px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          line-height: 1.2;
        }
        .standup-stat-icon {
          width: 32px;
          height: 32px;
          opacity: 0.8;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .standup-filter-panel {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 16px;
          animation: fadeIn 0.3s ease;
        }
        .standup-filter-row {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }
        .standup-filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 150px;
        }
        .standup-filter-label {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .standup-filter-input,
        .standup-filter-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #013E37;
          outline: none;
          transition: all 0.3s ease;
          width: 100%;
        }
        .standup-filter-input:focus,
        .standup-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .standup-search-bar {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          padding: 0 12px;
          transition: all 0.3s ease;
          width: 100%;
        }
        .standup-search-bar:focus-within {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .standup-search-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.4;
          flex-shrink: 0;
        }
        .standup-search-input {
          flex: 1;
          padding: 8px 10px;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
          color: #013E37;
        }
        .standup-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }
        .standup-search-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          background: none;
          border: none;
          color: #013E37;
          opacity: 0.4;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        .standup-search-clear:hover {
          background: #FFEFB3;
          opacity: 1;
        }
        .standup-search-clear-icon {
          width: 14px;
          height: 14px;
        }
        .standup-clear-filters {
          padding: 8px 16px;
          background: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          align-self: center;
        }
        .standup-clear-filters:hover {
          background: #013E37;
          color: #FFEFB3;
        }

        /* ============================================
           GRID
           ============================================ */
        .standup-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 20px;
        }
        .standup-card {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
          position: relative;
        }
        .standup-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #013E37, #0A5C54, #013E37);
          transform: scaleX(0);
          transition: transform 0.4s ease;
          transform-origin: left;
        }
        .standup-card:hover::before {
          transform: scaleX(1);
        }
        .standup-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(1, 62, 55, 0.12);
          border-color: #013E37;
        }
        .standup-card:nth-child(1) { animation-delay: 0.05s; }
        .standup-card:nth-child(2) { animation-delay: 0.1s; }
        .standup-card:nth-child(3) { animation-delay: 0.15s; }
        .standup-card:nth-child(4) { animation-delay: 0.2s; }
        .standup-card:nth-child(5) { animation-delay: 0.25s; }

        .standup-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFF9E6;
        }
        .standup-card-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .standup-card-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          color: #FFEFB3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .standup-card:hover .standup-card-avatar {
          transform: scale(1.05);
        }
        .standup-card-name {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
        }
        .standup-card-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
        }
        .standup-card-meta-icon {
          width: 12px;
          height: 12px;
        }
        .standup-card-dot {
          margin: 0 4px;
        }
        .standup-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .standup-status-badge:hover {
          transform: scale(1.05);
        }
        .standup-status-icon {
          width: 10px;
          height: 10px;
        }

        .standup-card-body {
          padding: 14px 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .standup-card-section {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .standup-blocker-section {
          background: #FFEFB3;
          padding: 8px 10px;
          border-radius: 6px;
          border: 1px solid #013E37;
        }
        .standup-card-label {
          font-size: 11px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.5;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .standup-blocker-label {
          opacity: 1;
          color: #013E37;
        }
        .standup-card-text {
          font-size: 14px;
          color: #013E37;
          margin: 0;
          line-height: 1.5;
          word-break: break-word;
        }

        .standup-card-footer {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid #FFEFB3;
          background: #FFF9E6;
        }
        .standup-view-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: #FFEFB3;
          color: #013E37;
          border: 1px solid #013E37;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          justify-content: center;
        }
        .standup-view-btn:hover {
          background: #013E37;
          color: #FFEFB3;
        }
        .standup-view-icon {
          width: 14px;
          height: 14px;
        }
        .standup-submit-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          justify-content: center;
        }
        .standup-submit-btn:hover:not(:disabled) {
          background: #0A5C54;
          transform: scale(1.02);
        }
        .standup-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .standup-submit-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .standup-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: #ffffff;
          border: 2px dashed #FFEFB3;
          border-radius: 12px;
        }
        .standup-empty-content {
          text-align: center;
          padding: 48px;
        }
        .standup-empty-icon {
          color: #FFEFB3;
          margin-bottom: 16px;
        }
        .standup-empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0 0 8px 0;
        }
        .standup-empty-subtext {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 0 0 20px 0;
        }
        .standup-empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .standup-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .standup-empty-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           MODAL
           ============================================ */
        .standup-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(1, 62, 55, 0.5);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        .standup-modal {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(1, 62, 55, 0.25);
          overflow: hidden;
          animation: modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .standup-detail-modal {
          max-width: 700px;
        }
        .standup-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
          flex-shrink: 0;
        }
        .standup-detail-header {
          background: #013E37;
          border-bottom: 1px solid #0A5C54;
        }
        .standup-detail-header .standup-modal-title {
          color: #FFEFB3;
        }
        .standup-detail-header .standup-modal-subtitle {
          color: #FFEFB3;
          opacity: 0.7;
        }
        .standup-detail-header .standup-modal-close {
          color: #FFEFB3;
        }
        .standup-detail-header .standup-modal-close:hover {
          background: rgba(255, 239, 179, 0.2);
        }
        .standup-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }
        .standup-modal-subtitle {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin-top: 2px;
          margin: 2px 0 0 0;
        }
        .standup-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .standup-modal-close:hover {
          background: rgba(1, 62, 55, 0.1);
        }
        .standup-modal-close-icon {
          width: 20px;
          height: 20px;
        }
        .standup-modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
        }
        .standup-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .standup-form-group:nth-child(1) { animation-delay: 0.05s; }
        .standup-form-group:nth-child(2) { animation-delay: 0.1s; }
        .standup-form-group:nth-child(3) { animation-delay: 0.15s; }
        .standup-form-group:nth-child(4) { animation-delay: 0.2s; }
        .standup-form-group:nth-child(5) { animation-delay: 0.25s; }
        .standup-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }
        .standup-form-required {
          color: #EF4444;
          margin-left: 4px;
        }
        .standup-form-textarea {
          padding: 10px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #013E37;
          min-height: 60px;
        }
        .standup-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .standup-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.4;
        }
        .standup-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid #FFEFB3;
        }
        .standup-modal-cancel {
          padding: 10px 20px;
          background: transparent;
          color: #013E37;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .standup-modal-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .standup-modal-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .standup-modal-submit {
          padding: 10px 20px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .standup-modal-submit:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .standup-modal-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ============================================
           DETAIL MODAL
           ============================================ */
        .standup-detail-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
        }
        .standup-detail-section {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding-bottom: 12px;
          border-bottom: 1px solid #FFEFB3;
        }
        .standup-detail-blocker {
          background: #FFEFB3;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #013E37;
        }
        .standup-detail-label {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.5;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .standup-blocker-label {
          opacity: 1;
          color: #013E37;
        }
        .standup-detail-value {
          font-size: 15px;
          color: #013E37;
          font-weight: 500;
          word-break: break-word;
        }
        .standup-blocker-value {
          color: #013E37;
        }
        .standup-detail-actions {
          display: flex;
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid #FFEFB3;
          margin-top: 4px;
        }
        .standup-detail-close {
          padding: 10px 20px;
          background: #FFEFB3;
          color: #013E37;
          border: 1px solid #013E37;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }
        .standup-detail-close:hover {
          background: #013E37;
          color: #FFEFB3;
        }
        .standup-detail-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }
        .standup-detail-submit:hover:not(:disabled) {
          background: #0A5C54;
        }
        .standup-detail-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .standup-detail-submit-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.95);
          }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .standup-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .standup-header {
            flex-direction: column;
            align-items: stretch;
          }
          .standup-header-right {
            width: 100%;
            flex-wrap: wrap;
          }
          .standup-create-btn {
            flex: 1;
            justify-content: center;
          }
          .standup-filter-btn {
            flex: 1;
            justify-content: center;
          }
          .standup-stats {
            grid-template-columns: 1fr 1fr;
          }
          .standup-filter-row {
            flex-direction: column;
            align-items: stretch;
          }
          .standup-filter-group {
            min-width: unset;
          }
          .standup-clear-filters {
            align-self: stretch;
          }
          .standup-grid {
            grid-template-columns: 1fr;
          }
          .standup-modal,
          .standup-detail-modal {
            max-width: 100%;
            border-radius: 12px;
            max-height: 95vh;
          }
          .standup-modal-actions {
            flex-direction: column;
          }
          .standup-modal-cancel,
          .standup-modal-submit {
            width: 100%;
            justify-content: center;
          }
          .standup-detail-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .standup-stats {
            grid-template-columns: 1fr;
          }
          .standup-stat-card {
            padding: 12px 16px;
          }
          .standup-stat-value {
            font-size: 18px;
          }
          .standup-title {
            font-size: 24px;
          }
          .standup-card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .standup-card-footer {
            flex-direction: column;
          }
          .standup-view-btn,
          .standup-submit-btn {
            width: 100%;
          }
          .standup-modal-header {
            padding: 16px;
            flex-wrap: wrap;
          }
          .standup-modal-title {
            font-size: 18px;
          }
          .standup-modal-form,
          .standup-detail-body {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default Standups;