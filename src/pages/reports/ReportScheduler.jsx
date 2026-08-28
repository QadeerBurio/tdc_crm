// pages/reports/ReportScheduler.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, Clock, Users, Mail,
  Plus, Edit, Trash2, Eye,
  RefreshCw, X, Check, AlertCircle,
  ChevronDown, ChevronRight, Filter,
  Play, Pause, StopCircle, Settings,
  FileText, Send, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReportScheduler = () => {
  const { token } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [showNewScheduleModal, setShowNewScheduleModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reportId: '',
    frequency: 'weekly',
    time: '09:00',
    day: 'monday',
    format: 'pdf',
    recipients: [],
    status: 'active'
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch(`${API_URL}/reports/schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSchedules(result.data || []);
        } else {
          throw new Error(result.message || 'Failed to fetch schedules');
        }
      } else {
        throw new Error('Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error(error.message || 'Failed to load schedules');
      setSchedules(getMockSchedules());
      toast.info('Showing sample schedule data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockSchedules = () => {
    return [
      {
        _id: '1',
        name: 'Monthly Performance Report',
        description: 'Automated monthly performance report for all departments',
        frequency: 'monthly',
        time: '09:00',
        day: '1',
        format: 'pdf',
        status: 'active',
        recipients: ['john@example.com', 'sarah@example.com'],
        lastRun: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Weekly Sales Report',
        description: 'Weekly sales analytics and revenue report',
        frequency: 'weekly',
        time: '14:00',
        day: 'friday',
        format: 'excel',
        status: 'active',
        recipients: ['sales@example.com'],
        lastRun: new Date(Date.now() - 172800000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'Team Productivity Report',
        description: 'Weekly team productivity and task completion report',
        frequency: 'weekly',
        time: '17:00',
        day: 'monday',
        format: 'pdf',
        status: 'paused',
        recipients: ['team@example.com'],
        lastRun: new Date(Date.now() - 259200000).toISOString(),
        createdAt: new Date().toISOString()
      }
    ];
  };

  const handleRefresh = () => {
    fetchSchedules(true);
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      const response = await fetch(`${API_URL}/reports/schedules/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Schedule ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
        fetchSchedules(true);
      } else {
        throw new Error('Failed to update schedule status');
      }
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast.error(error.message || 'Failed to update schedule status');
    }
  };

  const deleteSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const response = await fetch(`${API_URL}/reports/schedules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Schedule deleted successfully');
        fetchSchedules(true);
      } else {
        throw new Error('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error(error.message || 'Failed to delete schedule');
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Schedule name is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/reports/schedules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('Schedule created successfully!');
          setShowNewScheduleModal(false);
          resetForm();
          fetchSchedules(true);
        } else {
          throw new Error(result.message || 'Failed to create schedule');
        }
      } else {
        throw new Error('Failed to create schedule');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error(error.message || 'Failed to create schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      reportId: '',
      frequency: 'weekly',
      time: '09:00',
      day: 'monday',
      format: 'pdf',
      recipients: [],
      status: 'active'
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddRecipient = (email) => {
    if (email && !formData.recipients.includes(email)) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, email]
      }));
    }
  };

  const handleRemoveRecipient = (email) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'biweekly': 'Bi-Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly'
    };
    return labels[frequency] || frequency;
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'rs-status-active',
      'paused': 'rs-status-paused',
      'completed': 'rs-status-completed',
      'failed': 'rs-status-failed'
    };
    return colors[status] || 'rs-status-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Active',
      'paused': 'Paused',
      'completed': 'Completed',
      'failed': 'Failed'
    };
    return labels[status] || status;
  };

  const getDayLabel = (day) => {
    const labels = {
      'monday': 'Monday',
      'tuesday': 'Tuesday',
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
      'saturday': 'Saturday',
      'sunday': 'Sunday'
    };
    return labels[day] || day;
  };

  const getNextRun = (schedule) => {
    if (!schedule.frequency) return 'N/A';
    
    const now = new Date();
    let next = new Date(now);
    
    switch (schedule.frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'biweekly':
        next.setDate(next.getDate() + 14);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      default:
        next.setDate(next.getDate() + 1);
    }
    return next.toLocaleDateString();
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Never';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' }
  ];

  const stats = {
    total: schedules.length,
    active: schedules.filter(s => s.status === 'active').length,
    paused: schedules.filter(s => s.status === 'paused').length,
    completed: schedules.filter(s => s.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="rs-loading">
        <div className="rs-spinner"></div>
        <p className="rs-loading-text">Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="rs-container">
      {/* Header */}
      <div className="rs-header">
        <div className="rs-header-left">
          <div className="rs-header-icon">
            <Calendar className="rs-header-svg" />
          </div>
          <div>
            <h1 className="rs-title">Report Scheduler</h1>
            <p className="rs-subtitle">Schedule automated report generation</p>
          </div>
          <span className="rs-count">{schedules.length} schedules</span>
        </div>
        <div className="rs-header-right">
          <button className="rs-btn-icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`rs-refresh-icon ${refreshing ? 'rs-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowNewScheduleModal(true)}
            className="rs-btn-primary"
          >
            <Plus className="rs-btn-svg" />
            New Schedule
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="rs-stats">
        <div className="rs-stat-card">
          <div className="rs-stat-content">
            <div className="rs-stat-left">
              <p className="rs-stat-label">Total Schedules</p>
              <p className="rs-stat-value">{stats.total}</p>
            </div>
            <div className="rs-stat-icon-wrapper rs-stat-icon-total">
              <Calendar className="rs-stat-svg" />
            </div>
          </div>
        </div>
        <div className="rs-stat-card">
          <div className="rs-stat-content">
            <div className="rs-stat-left">
              <p className="rs-stat-label">Active</p>
              <p className="rs-stat-value rs-stat-value-active">{stats.active}</p>
            </div>
            <div className="rs-stat-icon-wrapper rs-stat-icon-active">
              <Play className="rs-stat-svg" />
            </div>
          </div>
        </div>
        <div className="rs-stat-card">
          <div className="rs-stat-content">
            <div className="rs-stat-left">
              <p className="rs-stat-label">Paused</p>
              <p className="rs-stat-value rs-stat-value-paused">{stats.paused}</p>
            </div>
            <div className="rs-stat-icon-wrapper rs-stat-icon-paused">
              <Pause className="rs-stat-svg" />
            </div>
          </div>
        </div>
        <div className="rs-stat-card">
          <div className="rs-stat-content">
            <div className="rs-stat-left">
              <p className="rs-stat-label">Completed</p>
              <p className="rs-stat-value rs-stat-value-completed">{stats.completed}</p>
            </div>
            <div className="rs-stat-icon-wrapper rs-stat-icon-completed">
              <Check className="rs-stat-svg" />
            </div>
          </div>
        </div>
      </div>

      {/* Schedule List */}
      <div className="rs-list-container">
        {schedules.length === 0 ? (
          <div className="rs-empty">
            <div className="rs-empty-icon-wrapper">
              <Calendar className="rs-empty-icon" />
            </div>
            <h3 className="rs-empty-title">No schedules found</h3>
            <p className="rs-empty-subtitle">Create your first schedule</p>
            <button 
              onClick={() => setShowNewScheduleModal(true)}
              className="rs-empty-btn"
            >
              <Plus className="rs-btn-svg" />
              Create Schedule
            </button>
          </div>
        ) : (
          <div className="rs-list">
            {schedules.map((schedule) => (
              <div key={schedule._id} className="rs-card">
                <div className="rs-card-header" onClick={() => toggleExpand(schedule._id)}>
                  <div className="rs-card-left">
                    <div className="rs-expand-btn">
                      {expanded[schedule._id] ? (
                        <ChevronDown className="rs-expand-icon" />
                      ) : (
                        <ChevronRight className="rs-expand-icon" />
                      )}
                    </div>

                    <div className="rs-card-icon-wrapper">
                      <Calendar className="rs-card-icon" />
                    </div>

                    <div className="rs-card-info">
                      <div className="rs-card-title-row">
                        <h4 className="rs-card-title">{schedule.name}</h4>
                        <span className={`rs-card-status ${getStatusColor(schedule.status)}`}>
                          {getStatusLabel(schedule.status)}
                        </span>
                        <span className="rs-card-frequency">
                          {getFrequencyLabel(schedule.frequency)}
                        </span>
                      </div>

                      <p className="rs-card-description">{schedule.description}</p>

                      <div className="rs-card-meta">
                        <span className="rs-card-meta-item">
                          <Clock className="rs-card-meta-icon" />
                          Next: {getNextRun(schedule)}
                        </span>
                        <span className="rs-card-meta-item">
                          <Mail className="rs-card-meta-icon" />
                          {schedule.recipients?.length || 0} recipients
                        </span>
                        <span className="rs-card-meta-item">
                          <FileText className="rs-card-meta-icon" />
                          Format: {schedule.format}
                        </span>
                        <span className="rs-card-meta-item">
                          <Zap className="rs-card-meta-icon" />
                          Last run: {getTimeAgo(schedule.lastRun)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rs-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleStatus(schedule._id, schedule.status)}
                      className="rs-action-btn rs-action-toggle"
                      title={schedule.status === 'active' ? 'Pause' : 'Activate'}
                    >
                      {schedule.status === 'active' ? (
                        <Pause className="rs-action-icon" />
                      ) : (
                        <Play className="rs-action-icon" />
                      )}
                    </button>
                    <button className="rs-action-btn rs-action-edit" title="Edit">
                      <Edit className="rs-action-icon" />
                    </button>
                    <button 
                      onClick={() => deleteSchedule(schedule._id)}
                      className="rs-action-btn rs-action-delete" title="Delete"
                    >
                      <Trash2 className="rs-action-icon" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded[schedule._id] && (
                  <div className="rs-card-expanded">
                    <div className="rs-expanded-content">
                      <div className="rs-expanded-grid">
                        <div className="rs-expanded-section">
                          <h5 className="rs-expanded-label">Schedule Details</h5>
                          <div className="rs-expanded-details">
                            <div className="rs-expanded-item">
                              <span className="rs-expanded-key">Frequency</span>
                              <span className="rs-expanded-value">{getFrequencyLabel(schedule.frequency)}</span>
                            </div>
                            <div className="rs-expanded-item">
                              <span className="rs-expanded-key">Time</span>
                              <span className="rs-expanded-value">{schedule.time}</span>
                            </div>
                            <div className="rs-expanded-item">
                              <span className="rs-expanded-key">Day</span>
                              <span className="rs-expanded-value">{getDayLabel(schedule.day)}</span>
                            </div>
                            <div className="rs-expanded-item">
                              <span className="rs-expanded-key">Format</span>
                              <span className="rs-expanded-value">{schedule.format.toUpperCase()}</span>
                            </div>
                            <div className="rs-expanded-item">
                              <span className="rs-expanded-key">Status</span>
                              <span className={`rs-expanded-value ${getStatusColor(schedule.status)}`}>
                                {getStatusLabel(schedule.status)}
                              </span>
                            </div>
                            <div className="rs-expanded-item">
                              <span className="rs-expanded-key">Last Run</span>
                              <span className="rs-expanded-value">{getTimeAgo(schedule.lastRun)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="rs-expanded-section">
                          <h5 className="rs-expanded-label">Recipients</h5>
                          {schedule.recipients && schedule.recipients.length > 0 ? (
                            <div className="rs-expanded-recipients">
                              {schedule.recipients.map((recipient, idx) => (
                                <div key={idx} className="rs-expanded-recipient">
                                  <Mail className="rs-expanded-recipient-icon" />
                                  <span className="rs-expanded-recipient-email">{recipient}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="rs-expanded-text">No recipients</p>
                          )}
                        </div>
                      </div>

                      {schedule.reportId && (
                        <div className="rs-expanded-report">
                          <h5 className="rs-expanded-label">Linked Report</h5>
                          <p className="rs-expanded-text">Report ID: {schedule.reportId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Schedule Modal */}
      {showNewScheduleModal && (
        <div className="rs-modal-overlay" onClick={() => setShowNewScheduleModal(false)}>
          <div className="rs-modal rs-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="rs-modal-header">
              <div className="rs-modal-title-wrapper">
                <div className="rs-modal-icon-wrapper">
                  <Calendar className="rs-modal-icon" />
                </div>
                <h2 className="rs-modal-title">Create New Schedule</h2>
              </div>
              <button onClick={() => setShowNewScheduleModal(false)} className="rs-modal-close">
                <X className="rs-modal-close-icon" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="rs-modal-form">
              <div className="rs-form-grid">
                <div className="rs-form-main">
                  <div className="rs-form-group">
                    <label className="rs-form-label">
                      Schedule Name <span className="rs-form-required">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="rs-form-input"
                      placeholder="Enter schedule name"
                      autoFocus
                    />
                  </div>

                  <div className="rs-form-group">
                    <label className="rs-form-label">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      className="rs-form-textarea"
                      rows="2"
                      placeholder="Brief description of the schedule"
                    />
                  </div>

                  <div className="rs-form-group">
                    <label className="rs-form-label">Recipients</label>
                    <div className="rs-form-recipient-input">
                      <input
                        type="email"
                        placeholder="Enter email address"
                        className="rs-form-input"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddRecipient(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="rs-form-recipient-add"
                        onClick={() => {
                          const input = document.querySelector('.rs-form-recipient-input input');
                          if (input) {
                            handleAddRecipient(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="rs-btn-svg" />
                      </button>
                    </div>
                    {formData.recipients.length > 0 && (
                      <div className="rs-form-tags">
                        {formData.recipients.map((email, idx) => (
                          <span key={idx} className="rs-form-tag">
                            <Mail className="rs-form-tag-icon" />
                            {email}
                            <button
                              type="button"
                              onClick={() => handleRemoveRecipient(email)}
                              className="rs-form-tag-remove"
                            >
                              <X className="rs-form-tag-remove-icon" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rs-form-sidebar">
                  <div className="rs-form-group">
                    <label className="rs-form-label">Frequency</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => handleFormChange('frequency', e.target.value)}
                      className="rs-form-select"
                    >
                      {frequencyOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="rs-form-group">
                    <label className="rs-form-label">Day</label>
                    <select
                      value={formData.day}
                      onChange={(e) => handleFormChange('day', e.target.value)}
                      className="rs-form-select"
                    >
                      {dayOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="rs-form-group">
                    <label className="rs-form-label">Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleFormChange('time', e.target.value)}
                      className="rs-form-input"
                    />
                  </div>

                  <div className="rs-form-group">
                    <label className="rs-form-label">Format</label>
                    <select
                      value={formData.format}
                      onChange={(e) => handleFormChange('format', e.target.value)}
                      className="rs-form-select"
                    >
                      {formatOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="rs-form-group">
                    <label className="rs-form-label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="rs-form-select"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rs-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowNewScheduleModal(false)}
                  className="rs-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rs-modal-submit"
                >
                  {submitting ? (
                    <>
                      <div className="rs-submit-spinner"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="rs-btn-svg" />
                      Create Schedule
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .rs-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: rsFadeIn 0.4s ease;
        }

        @keyframes rsFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes rsSpin {
          to { transform: rotate(360deg); }
        }

        .rs-spin {
          animation: rsSpin 1s linear infinite;
        }

        /* ============================================
           LOADING
           ============================================ */
        .rs-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .rs-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: rsSpin 0.8s linear infinite;
        }

        .rs-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        /* ============================================
           HEADER
           ============================================ */
        .rs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .rs-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .rs-header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
        }

        .rs-header-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .rs-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .rs-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .rs-count {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 14px;
          border-radius: 12px;
        }

        .rs-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rs-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #64748b;
        }

        .rs-btn-icon:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .rs-btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rs-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .rs-btn-svg {
          width: 16px;
          height: 16px;
        }

        .rs-btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
        }

        .rs-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }

        /* ============================================
           STATS
           ============================================ */
        .rs-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .rs-stat-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 16px 20px;
          transition: all 0.3s ease;
          animation: rsSlideUp 0.5s ease both;
        }

        .rs-stat-card:nth-child(1) { animation-delay: 0.05s; }
        .rs-stat-card:nth-child(2) { animation-delay: 0.1s; }
        .rs-stat-card:nth-child(3) { animation-delay: 0.15s; }
        .rs-stat-card:nth-child(4) { animation-delay: 0.2s; }

        @keyframes rsSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .rs-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .rs-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rs-stat-left {
          flex: 1;
        }

        .rs-stat-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          margin: 0;
        }

        .rs-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 4px 0 0 0;
          line-height: 1.2;
        }

        .rs-stat-value-active { color: #22c55e; }
        .rs-stat-value-paused { color: #f59e0b; }
        .rs-stat-value-completed { color: #8b5cf6; }

        .rs-stat-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rs-stat-icon-total { background: #f3e8ff; }
        .rs-stat-icon-active { background: #d1fae5; }
        .rs-stat-icon-paused { background: #fef3c7; }
        .rs-stat-icon-completed { background: #dbeafe; }

        .rs-stat-svg {
          width: 20px;
          height: 20px;
        }

        .rs-stat-icon-total .rs-stat-svg { color: #8b5cf6; }
        .rs-stat-icon-active .rs-stat-svg { color: #22c55e; }
        .rs-stat-icon-paused .rs-stat-svg { color: #f59e0b; }
        .rs-stat-icon-completed .rs-stat-svg { color: #3b82f6; }

        /* ============================================
           LIST
           ============================================ */
        .rs-list-container {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .rs-list {
          divide-y: 1px solid #e2e8f0;
        }

        .rs-card {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s ease;
        }

        .rs-card:last-child {
          border-bottom: none;
        }

        .rs-card:hover {
          background: #fafafa;
        }

        .rs-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px 20px;
          cursor: pointer;
          gap: 12px;
        }

        .rs-card-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .rs-expand-btn {
          margin-top: 2px;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .rs-expand-btn:hover {
          background: #f1f5f9;
        }

        .rs-expand-icon {
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .rs-card-icon-wrapper {
          width: 40px;
          height: 40px;
          background: #f3e8ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rs-card-icon {
          width: 20px;
          height: 20px;
          color: #8b5cf6;
        }

        .rs-card-info {
          flex: 1;
          min-width: 0;
        }

        .rs-card-title-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .rs-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .rs-card-status {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .rs-status-active { background: #d1fae5; color: #065f46; }
        .rs-status-paused { background: #fef3c7; color: #92400e; }
        .rs-status-completed { background: #dbeafe; color: #1d4ed8; }
        .rs-status-failed { background: #fee2e2; color: #991b1b; }
        .rs-status-default { background: #f1f5f9; color: #475569; }

        .rs-card-frequency {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          background: #f1f5f9;
          color: #475569;
          border-radius: 9999px;
        }

        .rs-card-description {
          font-size: 14px;
          color: #64748b;
          margin: 6px 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rs-card-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 6px;
          font-size: 12px;
          color: #64748b;
        }

        .rs-card-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rs-card-meta-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .rs-card-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .rs-action-btn {
          padding: 6px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #94a3b8;
          display: flex;
          align-items: center;
        }

        .rs-action-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .rs-action-toggle:hover { background: #f3e8ff; color: #8b5cf6; }
        .rs-action-edit:hover { background: #ecfdf5; color: #22c55e; }
        .rs-action-delete:hover { background: #fef2f2; color: #ef4444; }

        .rs-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EXPANDED
           ============================================ */
        .rs-card-expanded {
          padding: 0 20px 16px 20px;
          margin-left: 40px;
        }

        .rs-expanded-content {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }

        .rs-expanded-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .rs-expanded-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rs-expanded-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .rs-expanded-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 16px;
        }

        .rs-expanded-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rs-expanded-key {
          font-size: 11px;
          color: #94a3b8;
        }

        .rs-expanded-value {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .rs-expanded-recipients {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rs-expanded-recipient {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          background: #ffffff;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }

        .rs-expanded-recipient-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .rs-expanded-recipient-email {
          font-size: 13px;
          color: #0f172a;
        }

        .rs-expanded-text {
          font-size: 14px;
          color: #475569;
          margin: 0;
        }

        .rs-expanded-report {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .rs-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }

        .rs-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f3e8ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .rs-empty-icon {
          width: 36px;
          height: 36px;
          color: #8b5cf6;
        }

        .rs-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .rs-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .rs-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
        }

        .rs-empty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
        }

        /* ============================================
           MODAL
           ============================================ */
        .rs-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: rsFadeIn 0.3s ease;
        }

        .rs-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: rsModalIn 0.3s ease;
        }

        .rs-modal-lg {
          max-width: 800px;
        }

        @keyframes rsModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .rs-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          position: sticky;
          top: 0;
          background: #ffffff;
          z-index: 10;
          border-radius: 16px 16px 0 0;
        }

        .rs-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rs-modal-icon-wrapper {
          width: 44px;
          height: 44px;
          background: #f3e8ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rs-modal-icon {
          width: 22px;
          height: 22px;
          color: #8b5cf6;
        }

        .rs-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .rs-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: none;
          background: #f1f5f9;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .rs-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .rs-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        .rs-modal-form {
          padding: 24px;
        }

        .rs-form-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
        }

        .rs-form-main {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rs-form-sidebar {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rs-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rs-form-label {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
        }

        .rs-form-required {
          color: #ef4444;
        }

        .rs-form-input,
        .rs-form-select,
        .rs-form-textarea {
          padding: 8px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          color: #0f172a;
        }

        .rs-form-input:focus,
        .rs-form-select:focus,
        .rs-form-textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .rs-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .rs-form-recipient-input {
          display: flex;
          gap: 8px;
        }

        .rs-form-recipient-input .rs-form-input {
          flex: 1;
        }

        .rs-form-recipient-add {
          padding: 8px 12px;
          background: #8b5cf6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }

        .rs-form-recipient-add:hover {
          background: #7c3aed;
        }

        .rs-form-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .rs-form-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #f3e8ff;
          color: #6d28d9;
          border-radius: 4px;
          font-size: 13px;
        }

        .rs-form-tag-icon {
          width: 14px;
          height: 14px;
        }

        .rs-form-tag-remove {
          display: flex;
          align-items: center;
          padding: 2px;
          background: none;
          border: none;
          color: #8b5cf6;
          cursor: pointer;
          border-radius: 4px;
        }

        .rs-form-tag-remove:hover {
          background: rgba(139, 92, 246, 0.1);
        }

        .rs-form-tag-remove-icon {
          width: 14px;
          height: 14px;
        }

        .rs-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
          position: sticky;
          bottom: 0;
          background: #ffffff;
          border-radius: 0 0 16px 16px;
        }

        .rs-modal-cancel {
          padding: 8px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rs-modal-cancel:hover {
          background: #f1f5f9;
        }

        .rs-modal-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
        }

        .rs-modal-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
        }

        .rs-modal-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .rs-submit-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: rsSpin 0.8s linear infinite;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .rs-form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .rs-container {
            padding: 16px;
          }

          .rs-header {
            flex-direction: column;
            align-items: stretch;
          }

          .rs-header-right {
            flex-wrap: wrap;
          }

          .rs-btn-primary {
            flex: 1;
            justify-content: center;
          }

          .rs-stats {
            grid-template-columns: 1fr 1fr;
          }

          .rs-title {
            font-size: 22px;
          }

          .rs-header-icon {
            width: 40px;
            height: 40px;
          }

          .rs-header-svg {
            width: 20px;
            height: 20px;
          }

          .rs-modal {
            margin: 16px;
            max-height: 95vh;
          }

          .rs-modal-lg {
            max-width: 100%;
          }

          .rs-card-header {
            flex-direction: column;
          }

          .rs-card-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 4px;
          }

          .rs-expanded-grid {
            grid-template-columns: 1fr;
          }

          .rs-expanded-details {
            grid-template-columns: 1fr;
          }

          .rs-card-expanded {
            margin-left: 0;
            padding: 0 16px 12px 16px;
          }
        }

        @media (max-width: 480px) {
          .rs-container {
            padding: 12px;
          }

          .rs-header-right {
            flex-direction: column;
          }

          .rs-btn-primary {
            width: 100%;
          }

          .rs-btn-icon {
            align-self: flex-end;
          }

          .rs-stats {
            grid-template-columns: 1fr;
          }

          .rs-title {
            font-size: 20px;
          }

          .rs-subtitle {
            font-size: 13px;
          }

          .rs-modal {
            padding: 0;
          }

          .rs-modal-header {
            padding: 16px 18px;
          }

          .rs-modal-form {
            padding: 16px;
          }

          .rs-modal-footer {
            flex-direction: column;
          }

          .rs-modal-cancel,
          .rs-modal-submit {
            width: 100%;
            justify-content: center;
          }

          .rs-card-title-row {
            flex-wrap: wrap;
          }

          .rs-card-actions {
            flex-wrap: wrap;
          }
        }

        /* Scrollbar */
        .rs-modal::-webkit-scrollbar {
          width: 6px;
        }

        .rs-modal::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }

        .rs-modal::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }

        .rs-modal::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default ReportScheduler;