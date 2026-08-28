// pages/employees/Standups.jsx - COMPLETE FIXED VERSION

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageSquare, Send, Clock, CheckCircle, AlertCircle, Plus,
  Calendar, User, Filter, RefreshCw, X, ChevronDown,
  Eye, Edit, Trash2, Search
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

  const API_URL =  'https://crmserver-production-4a42.up.railway.app/api';

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
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        icon: CheckCircle,
        label: 'Submitted'
      },
      'acknowledged': {
        backgroundColor: '#DBEAFE',
        color: '#1E40AF',
        icon: CheckCircle,
        label: 'Acknowledged'
      },
      'draft': {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
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
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading standups...</p>
      </div>
    );
  }

  const totalStandups = standups.length;
  const submittedCount = standups.filter(s => s.status === 'submitted' || s.status === 'acknowledged').length;
  const pendingCount = standups.filter(s => s.status === 'draft').length;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Daily Standups</h1>
          <p style={styles.subtitle}>
            {isAdmin ? 'View all team standups' : 'Share what you\'re working on and any blockers'}
          </p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.refreshButton} onClick={() => fetchStandups(true)} disabled={refreshing}>
            <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button style={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filters
            <ChevronDown size={14} style={{
              transform: showFilters ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease'
            }} />
          </button>
          <button style={styles.createButton} onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            New Standup
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Total Standups</p>
              <p style={styles.statValue}>{totalStandups}</p>
            </div>
            <MessageSquare size={32} style={{...styles.statIcon, color: '#3B82F6'}} />
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Submitted</p>
              <p style={{...styles.statValue, color: '#16A34A'}}>{submittedCount}</p>
            </div>
            <CheckCircle size={32} style={{...styles.statIcon, color: '#22C55E'}} />
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Pending</p>
              <p style={{...styles.statValue, color: '#D97706'}}>{pendingCount}</p>
            </div>
            <Clock size={32} style={{...styles.statIcon, color: '#F59E0B'}} />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div style={styles.filterPanel}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={styles.filterInput}
              />
            </div>
            {isAdmin && departments.length > 0 && (
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Department</label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search</label>
              <div style={styles.searchBar}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search standups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                {searchTerm && (
                  <button style={styles.clearSearch} onClick={() => setSearchTerm('')}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <button style={styles.clearFiltersButton} onClick={() => {
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
        <div style={styles.emptyState}>
          <div style={styles.emptyContent}>
            <MessageSquare size={64} style={styles.emptyIcon} />
            <h3 style={styles.emptyTitle}>No standups found</h3>
            <p style={styles.emptySubtext}>
              {isAdmin ? 'No standups have been submitted yet.' : 'Create your first standup to get started.'}
            </p>
            {!isAdmin && (
              <button style={styles.emptyButton} onClick={() => setShowCreateModal(true)}>
                <Plus size={16} />
                Create Standup
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {standups.map((standup) => {
            const statusStyle = getStatusStyle(standup.status);
            const StatusIcon = statusStyle.icon;
            
            return (
              <div key={standup._id} style={styles.standupCard}>
                <div style={styles.standupHeader}>
                  <div style={styles.standupUser}>
                    <div style={styles.standupAvatar}>
                      {standup.employeeId?.firstName?.[0] || '?'}
                    </div>
                    <div>
                      <div style={styles.standupName}>
                        {standup.employeeId?.firstName} {standup.employeeId?.lastName}
                      </div>
                      <div style={styles.standupMeta}>
                        <Calendar size={12} />
                        {formatDate(standup.date || standup.createdAt)}
                        <span style={styles.standupDot}>•</span>
                        <Clock size={12} />
                        {formatTime(standup.createdAt)}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: statusStyle.backgroundColor,
                    color: statusStyle.color,
                  }}>
                    <StatusIcon size={10} />
                    {statusStyle.label}
                  </span>
                </div>

                <div style={styles.standupBody}>
                  <div style={styles.standupSection}>
                    <span style={styles.standupLabel}>Today</span>
                    <p style={styles.standupText}>{standup.today || 'Not specified'}</p>
                  </div>
                  {standup.yesterday && (
                    <div style={styles.standupSection}>
                      <span style={styles.standupLabel}>Yesterday</span>
                      <p style={styles.standupText}>{standup.yesterday}</p>
                    </div>
                  )}
                  {standup.blockers && (
                    <div style={{...styles.standupSection, ...styles.blockerSection}}>
                      <span style={{...styles.standupLabel, color: '#EF4444'}}>🚧 Blockers</span>
                      <p style={styles.standupText}>{standup.blockers}</p>
                    </div>
                  )}
                  {standup.tomorrow && (
                    <div style={styles.standupSection}>
                      <span style={styles.standupLabel}>Tomorrow</span>
                      <p style={styles.standupText}>{standup.tomorrow}</p>
                    </div>
                  )}
                </div>

                <div style={styles.standupFooter}>
                  <button
                    style={styles.viewButton}
                    onClick={() => {
                      setSelectedStandup(standup);
                      setShowDetailModal(true);
                    }}
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                  {canEdit(standup) && (
                    <button
                      style={styles.submitButton}
                      onClick={() => handleSubmitStandup(standup._id)}
                      disabled={submitting}
                    >
                      <Send size={14} />
                      Submit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Standup Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Create Daily Standup</h2>
                <p style={styles.modalSubtitle}>Share your daily progress and blockers</p>
              </div>
              <button style={styles.modalClose} onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  What did you do yesterday?
                </label>
                <textarea
                  value={formData.yesterday}
                  onChange={(e) => setFormData({ ...formData, yesterday: e.target.value })}
                  rows={2}
                  style={styles.textarea}
                  placeholder="What did you accomplish yesterday?"
                  disabled={submitting}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  What will you do today?
                  <span style={styles.requiredStar}>*</span>
                </label>
                <textarea
                  value={formData.today}
                  onChange={(e) => setFormData({ ...formData, today: e.target.value })}
                  rows={2}
                  required
                  style={styles.textarea}
                  placeholder="What are your plans for today?"
                  disabled={submitting}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Any blockers?
                </label>
                <textarea
                  value={formData.blockers}
                  onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                  rows={2}
                  style={styles.textarea}
                  placeholder="Any blockers or challenges?"
                  disabled={submitting}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Plan for tomorrow
                </label>
                <textarea
                  value={formData.tomorrow}
                  onChange={(e) => setFormData({ ...formData, tomorrow: e.target.value })}
                  rows={2}
                  style={styles.textarea}
                  placeholder="What do you plan to do tomorrow?"
                  disabled={submitting}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Additional Notes</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  rows={2}
                  style={styles.textarea}
                  placeholder="Any additional notes?"
                  disabled={submitting}
                />
              </div>
              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.modalCancelButton}
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
                  style={styles.modalSubmitButton}
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
        <div style={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div style={styles.detailContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Standup Details</h2>
                <p style={styles.modalSubtitle}>
                  {selectedStandup.employeeId?.firstName} {selectedStandup.employeeId?.lastName} • {formatDate(selectedStandup.date || selectedStandup.createdAt)}
                </p>
              </div>
              <button style={styles.modalClose} onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.detailBody}>
              <div style={styles.detailSection}>
                <span style={styles.detailLabel}>📅 Date</span>
                <span style={styles.detailValue}>{formatDate(selectedStandup.date || selectedStandup.createdAt)}</span>
              </div>
              <div style={styles.detailSection}>
                <span style={styles.detailLabel}>👤 Employee</span>
                <span style={styles.detailValue}>
                  {selectedStandup.employeeId?.firstName} {selectedStandup.employeeId?.lastName}
                </span>
              </div>
              <div style={styles.detailSection}>
                <span style={styles.detailLabel}>📋 Status</span>
                <span style={{
                  ...styles.statusBadge,
                  ...getStatusStyle(selectedStandup.status)
                }}>
                  {selectedStandup.status || 'Draft'}
                </span>
              </div>
              <div style={styles.detailSection}>
                <span style={styles.detailLabel}>📝 Today</span>
                <span style={styles.detailValue}>{selectedStandup.today || 'Not specified'}</span>
              </div>
              {selectedStandup.yesterday && (
                <div style={styles.detailSection}>
                  <span style={styles.detailLabel}>📝 Yesterday</span>
                  <span style={styles.detailValue}>{selectedStandup.yesterday}</span>
                </div>
              )}
              {selectedStandup.blockers && (
                <div style={{...styles.detailSection, ...styles.detailBlocker}}>
                  <span style={{...styles.detailLabel, color: '#EF4444'}}>🚧 Blockers</span>
                  <span style={{...styles.detailValue, color: '#EF4444'}}>{selectedStandup.blockers}</span>
                </div>
              )}
              {selectedStandup.tomorrow && (
                <div style={styles.detailSection}>
                  <span style={styles.detailLabel}>📝 Tomorrow</span>
                  <span style={styles.detailValue}>{selectedStandup.tomorrow}</span>
                </div>
              )}
              {selectedStandup.additionalNotes && (
                <div style={styles.detailSection}>
                  <span style={styles.detailLabel}>📝 Additional Notes</span>
                  <span style={styles.detailValue}>{selectedStandup.additionalNotes}</span>
                </div>
              )}
              <div style={styles.detailSection}>
                <span style={styles.detailLabel}>⏰ Submitted</span>
                <span style={styles.detailValue}>
                  {selectedStandup.submittedAt 
                    ? `${formatTime(selectedStandup.submittedAt)} (${formatTimeAgo(selectedStandup.submittedAt)})`
                    : 'Not submitted yet'
                  }
                </span>
              </div>
              {selectedStandup.acknowledgedAt && (
                <div style={styles.detailSection}>
                  <span style={styles.detailLabel}>✅ Acknowledged</span>
                  <span style={styles.detailValue}>
                    {formatTime(selectedStandup.acknowledgedAt)} ({formatTimeAgo(selectedStandup.acknowledgedAt)})
                  </span>
                </div>
              )}
              {selectedStandup.managerFeedback && (
                <div style={styles.detailSection}>
                  <span style={styles.detailLabel}>💬 Manager Feedback</span>
                  <span style={styles.detailValue}>{selectedStandup.managerFeedback}</span>
                </div>
              )}
              <div style={styles.detailActions}>
                <button
                  style={styles.detailCloseButton}
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
                {canEdit(selectedStandup) && (
                  <button
                    style={styles.detailSubmitButton}
                    onClick={() => {
                      handleSubmitStandup(selectedStandup._id);
                      setShowDetailModal(false);
                    }}
                    disabled={submitting}
                  >
                    <Send size={14} />
                    Submit Standup
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64vh',
    gap: '16px',
  },
  loadingText: {
    color: '#64748B',
    fontSize: '14px',
    fontWeight: '500',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748B',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    color: '#64748B',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px 20px',
    border: '1px solid #E2E8F0',
    transition: 'all 0.2s ease',
  },
  statContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
    fontWeight: '500',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
    lineHeight: 1.2,
  },
  statIcon: {
    opacity: 0.8,
  },
  filterPanel: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '16px 20px',
    marginBottom: '16px',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '16px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: '150px',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  filterInput: {
    padding: '8px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    outline: 'none',
    transition: 'all 0.2s ease',
    width: '100%',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    outline: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    width: '100%',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '0 12px',
    transition: 'all 0.2s ease',
    width: '100%',
  },
  searchIcon: {
    color: '#94A3B8',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    padding: '8px 10px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: 'transparent',
    color: '#0F172A',
  },
  clearSearch: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  clearFiltersButton: {
    padding: '8px 16px',
    backgroundColor: '#F1F5F9',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    alignSelf: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px',
  },
  standupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  standupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid #F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  standupUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  standupAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    flexShrink: 0,
  },
  standupName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0F172A',
  },
  standupMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#94A3B8',
  },
  standupDot: {
    margin: '0 4px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
  },
  standupBody: {
    padding: '14px 16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  standupSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  blockerSection: {
    backgroundColor: '#FEF2F2',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #FEE2E2',
  },
  standupLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  standupText: {
    fontSize: '14px',
    color: '#0F172A',
    margin: 0,
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  standupFooter: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    borderTop: '1px solid #F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    backgroundColor: '#EFF6FF',
    color: '#3B82F6',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
    justifyContent: 'center',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
  },
  emptyContent: {
    textAlign: 'center',
    padding: '48px',
  },
  emptyIcon: {
    color: '#94A3B8',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0F172A',
    margin: '0 0 8px 0',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#64748B',
    margin: '0 0 20px 0',
  },
  emptyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
  },
  detailContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '700px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
  },
  modalSubtitle: {
    fontSize: '14px',
    color: '#64748B',
    marginTop: '2px',
    margin: '2px 0 0 0',
  },
  modalClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748B',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modalForm: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#0F172A',
  },
  requiredStar: {
    color: '#EF4444',
    marginLeft: '4px',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    minHeight: '60px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingTop: '16px',
    borderTop: '1px solid #E2E8F0',
  },
  modalCancelButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#475569',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modalSubmitButton: {
    padding: '10px 20px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  detailBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingBottom: '12px',
    borderBottom: '1px solid #F1F5F9',
  },
  detailBlocker: {
    backgroundColor: '#FEF2F2',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #FEE2E2',
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  detailValue: {
    fontSize: '15px',
    color: '#0F172A',
    fontWeight: '500',
    wordBreak: 'break-word',
  },
  detailActions: {
    display: 'flex',
    gap: '10px',
    paddingTop: '16px',
    borderTop: '1px solid #E2E8F0',
    marginTop: '4px',
  },
  detailCloseButton: {
    padding: '10px 20px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
  },
  detailSubmitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
  },
};

// Add keyframe animations and hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .create-button:hover:not(:disabled) {
    background-color: #2563EB !important;
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.35) !important;
    transform: translateY(-1px);
  }

  .refresh-button:hover:not(:disabled) {
    background-color: #F1F5F9 !important;
  }

  .filter-button:hover:not(:disabled) {
    background-color: #F1F5F9 !important;
  }

  .clear-filters-button:hover:not(:disabled) {
    background-color: #E2E8F0 !important;
  }

  .search-bar:focus-within {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }

  .filter-input:focus,
  .filter-select:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }

  .clear-search:hover {
    background-color: #F1F5F9 !important;
  }

  .standup-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08) !important;
  }

  .view-button:hover:not(:disabled) {
    background-color: #DBEAFE !important;
  }

  .submit-button:hover:not(:disabled) {
    background-color: #16A34A !important;
  }

  .empty-button:hover {
    background-color: #2563EB !important;
  }

  .modal-close:hover:not(:disabled) {
    background-color: #F1F5F9 !important;
  }

  .modal-cancel-button:hover:not(:disabled) {
    background-color: #F1F5F9 !important;
  }

  .modal-submit-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }

  .detail-close-button:hover:not(:disabled) {
    background-color: #E2E8F0 !important;
  }

  .detail-submit-button:hover:not(:disabled) {
    background-color: #16A34A !important;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
  }

  .textarea:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }

  @media (max-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 16px !important;
    }

    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .header-actions {
      width: 100% !important;
      justify-content: flex-start !important;
    }

    .create-button {
      flex: 1 !important;
      justify-content: center !important;
    }

    .filter-button {
      flex: 1 !important;
      justify-content: center !important;
    }

    .stats-grid {
      grid-template-columns: 1fr 1fr !important;
    }

    .filter-row {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .filter-group {
      min-width: unset !important;
    }

    .clear-filters-button {
      align-self: stretch !important;
    }

    .grid {
      grid-template-columns: 1fr !important;
    }

    .modal-container,
    .detail-container {
      max-width: 100% !important;
      border-radius: 12px !important;
      max-height: 95vh !important;
    }

    .modal-actions {
      flex-direction: column !important;
    }

    .modal-cancel-button,
    .modal-submit-button {
      width: 100% !important;
      justify-content: center !important;
    }

    .detail-actions {
      flex-direction: column !important;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 12px !important;
    }

    .stats-grid {
      grid-template-columns: 1fr !important;
    }

    .stat-card {
      padding: 12px 16px !important;
    }

    .stat-value {
      font-size: 18px !important;
    }

    .title {
      font-size: 22px !important;
    }

    .standup-card {
      border-radius: 8px !important;
    }

    .standup-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }

    .standup-footer {
      flex-direction: column !important;
    }

    .view-button,
    .submit-button {
      width: 100% !important;
    }

    .modal-header {
      padding: 16px !important;
      flex-wrap: wrap !important;
    }

    .modal-title {
      font-size: 18px !important;
    }

    .modal-form,
    .detail-body {
      padding: 16px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Standups;