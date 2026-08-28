// pages/reports/ReportList.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Plus, Edit, Trash2, Eye,
  Search, Filter, Download, Calendar,
  ChevronDown, ChevronRight, Clock,
  RefreshCw, Copy, Share2, MoreVertical,
  BarChart2, PieChart, Activity, Users,
  Target, CheckCircle, AlertCircle,
  X, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReportList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    status: 'all'
  });
  const [expanded, setExpanded] = useState({});

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchReports();
  }, [search, filters]);

  const fetchReports = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.status !== 'all') params.append('status', filters.status);

      const response = await fetch(`${API_URL}/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // ✅ FIX: Ensure reports is always an array
          const reportsData = result.data || [];
          setReports(Array.isArray(reportsData) ? reportsData : []);
        } else {
          throw new Error(result.message || 'Failed to fetch reports');
        }
      } else {
        throw new Error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error(error.message || 'Failed to load reports');
      setReports(getMockReports());
      toast.info('Showing sample report data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockReports = () => {
    return [
      {
        _id: '1',
        name: 'Monthly Performance Report',
        description: 'Comprehensive performance metrics for all departments',
        category: 'operations',
        type: 'performance',
        status: 'active',
        format: 'pdf',
        period: 'monthly',
        groupBy: 'department',
        metrics: ['Revenue', 'Tasks Completed', 'Client Satisfaction'],
        schedule: { frequency: 'monthly', day: '1', time: '09:00' },
        recipients: ['john@example.com', 'sarah@example.com'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Revenue Analytics Dashboard',
        description: 'Detailed revenue breakdown by source and client',
        category: 'financial',
        type: 'revenue',
        status: 'pending',
        format: 'excel',
        period: 'quarterly',
        groupBy: 'client',
        metrics: ['Revenue', 'Deal Count', 'Average Deal Size'],
        schedule: { frequency: 'quarterly', day: '1', time: '14:00' },
        recipients: ['finance@example.com'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'Team Productivity Report',
        description: 'Individual and team productivity metrics',
        category: 'productivity',
        type: 'activity',
        status: 'completed',
        format: 'pdf',
        period: 'weekly',
        groupBy: 'team',
        metrics: ['Tasks Completed', 'Hours Logged', 'Efficiency Score'],
        schedule: { frequency: 'weekly', day: 'friday', time: '17:00' },
        recipients: ['team@example.com'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  };

  const handleRefresh = () => {
    fetchReports(true);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNewReport = () => {
    navigate('/reports/builder');
  };

  const handleViewReport = (id) => {
    navigate(`/reports/${id}`);
  };

  const handleEditReport = (id) => {
    navigate(`/reports/builder/${id}`);
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`${API_URL}/reports/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Report deleted successfully');
        fetchReports(true);
      } else {
        throw new Error('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error(error.message || 'Failed to delete report');
    }
  };

  const handleCopyReport = async (id) => {
    try {
      const response = await fetch(`${API_URL}/reports/${id}/copy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Report copied successfully');
        fetchReports(true);
      } else {
        throw new Error('Failed to copy report');
      }
    } catch (error) {
      console.error('Error copying report:', error);
      toast.error(error.message || 'Failed to copy report');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'operations': 'rl-category-operations',
      'financial': 'rl-category-financial',
      'crm': 'rl-category-crm',
      'productivity': 'rl-category-productivity',
      'client': 'rl-category-client',
      'custom': 'rl-category-custom'
    };
    return colors[category] || 'rl-category-default';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'operations': 'Operations',
      'financial': 'Financial',
      'crm': 'CRM',
      'productivity': 'Productivity',
      'client': 'Client',
      'custom': 'Custom'
    };
    return labels[category] || category;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'performance': BarChart2,
      'revenue': PieChart,
      'activity': Activity,
      'user': Users,
      'project': Target,
      'task': CheckCircle,
      'custom': FileText
    };
    const Icon = icons[type] || FileText;
    return <Icon className="rl-type-icon" />;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'performance': 'Performance',
      'revenue': 'Revenue',
      'activity': 'Activity',
      'user': 'User',
      'project': 'Project',
      'task': 'Task',
      'custom': 'Custom'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'rl-status-active',
      'pending': 'rl-status-pending',
      'completed': 'rl-status-completed',
      'failed': 'rl-status-failed'
    };
    return colors[status] || 'rl-status-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Active',
      'pending': 'Pending',
      'completed': 'Completed',
      'failed': 'Failed'
    };
    return labels[status] || status;
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

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'operations', label: 'Operations' },
    { value: 'financial', label: 'Financial' },
    { value: 'crm', label: 'CRM' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'client', label: 'Client' }
  ];

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'performance', label: 'Performance' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'activity', label: 'Activity' },
    { value: 'user', label: 'User' },
    { value: 'project', label: 'Project' },
    { value: 'task', label: 'Task' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' }
  ];

  // ✅ Ensure reports is an array before calculating stats
  const reportsArray = Array.isArray(reports) ? reports : [];
  
  // ✅ Calculate stats - always show even if zero
  const stats = {
    total: reportsArray.length,
    active: reportsArray.filter(r => r.status === 'active').length,
    pending: reportsArray.filter(r => r.status === 'pending').length,
    scheduled: reportsArray.filter(r => r.schedule?.frequency && r.schedule.frequency !== 'none').length
  };

  if (loading) {
    return (
      <div className="rl-loading">
        <div className="rl-spinner"></div>
        <p className="rl-loading-text">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="rl-container">
      {/* Header */}
      <div className="rl-header">
        <div className="rl-header-left">
          <div className="rl-header-icon">
            <FileText className="rl-header-svg" />
          </div>
          <div>
            <h1 className="rl-title">Reports</h1>
            <p className="rl-subtitle">Manage and generate reports</p>
          </div>
          <span className="rl-count">{reportsArray.length} reports</span>
        </div>
        <div className="rl-header-right">
          <button className="rl-btn-icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`rl-refresh-icon ${refreshing ? 'rl-spin' : ''}`} />
          </button>
          <button 
            onClick={handleNewReport}
            className="rl-btn-primary"
          >
            <Plus className="rl-btn-svg" />
            New Report
          </button>
        </div>
      </div>

      {/* ✅ Stats - Always visible even if zero */}
      <div className="rl-stats">
        <div className="rl-stat-card">
          <div className="rl-stat-content">
            <div className="rl-stat-left">
              <p className="rl-stat-label">Total Reports</p>
              <p className="rl-stat-value">{stats.total}</p>
            </div>
            <div className="rl-stat-icon-wrapper rl-stat-icon-total">
              <FileText className="rl-stat-svg" />
            </div>
          </div>
        </div>
        <div className="rl-stat-card">
          <div className="rl-stat-content">
            <div className="rl-stat-left">
              <p className="rl-stat-label">Active</p>
              <p className="rl-stat-value rl-stat-value-active">{stats.active}</p>
            </div>
            <div className="rl-stat-icon-wrapper rl-stat-icon-active">
              <CheckCircle className="rl-stat-svg" />
            </div>
          </div>
        </div>
        <div className="rl-stat-card">
          <div className="rl-stat-content">
            <div className="rl-stat-left">
              <p className="rl-stat-label">Pending</p>
              <p className="rl-stat-value rl-stat-value-pending">{stats.pending}</p>
            </div>
            <div className="rl-stat-icon-wrapper rl-stat-icon-pending">
              <Clock className="rl-stat-svg" />
            </div>
          </div>
        </div>
        <div className="rl-stat-card">
          <div className="rl-stat-content">
            <div className="rl-stat-left">
              <p className="rl-stat-label">Scheduled</p>
              <p className="rl-stat-value rl-stat-value-scheduled">{stats.scheduled}</p>
            </div>
            <div className="rl-stat-icon-wrapper rl-stat-icon-scheduled">
              <Calendar className="rl-stat-svg" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rl-filters">
        <div className="rl-search-wrapper">
          <Search className="rl-search-icon" />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={handleSearch}
            className="rl-search-input"
          />
          {search && (
            <button className="rl-search-clear" onClick={() => setSearch('')}>
              <X className="rl-search-clear-icon" />
            </button>
          )}
        </div>

        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="rl-filter-select"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="rl-filter-select"
        >
          {types.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="rl-filter-select"
        >
          {statuses.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        {(filters.category !== 'all' || filters.type !== 'all' || filters.status !== 'all' || search) && (
          <button
            onClick={() => {
              setFilters({ category: 'all', type: 'all', status: 'all' });
              setSearch('');
            }}
            className="rl-clear-btn"
          >
            <X className="rl-clear-icon" />
            Clear
          </button>
        )}
      </div>

      {/* Report List */}
      <div className="rl-list-container">
        {reportsArray.length === 0 ? (
          <div className="rl-empty">
            <div className="rl-empty-icon-wrapper">
              <FileText className="rl-empty-icon" />
            </div>
            <h3 className="rl-empty-title">No reports found</h3>
            <p className="rl-empty-subtitle">Create your first report</p>
            <button 
              onClick={handleNewReport}
              className="rl-empty-btn"
            >
              <Plus className="rl-btn-svg" />
              Create Report
            </button>
          </div>
        ) : (
          <div className="rl-list">
            {reportsArray.map((report) => (
              <div key={report._id} className="rl-card">
                <div className="rl-card-header" onClick={() => toggleExpand(report._id)}>
                  <div className="rl-card-left">
                    <div className="rl-expand-btn">
                      {expanded[report._id] ? (
                        <ChevronDown className="rl-expand-icon" />
                      ) : (
                        <ChevronRight className="rl-expand-icon" />
                      )}
                    </div>

                    <div className="rl-card-icon-wrapper">
                      {getTypeIcon(report.type)}
                    </div>

                    <div className="rl-card-info">
                      <div className="rl-card-title-row">
                        <h4 className="rl-card-title">{report.name}</h4>
                        <span className={`rl-card-category ${getCategoryColor(report.category)}`}>
                          {getCategoryLabel(report.category)}
                        </span>
                        <span className={`rl-card-status ${getStatusColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                        <span className="rl-card-date">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="rl-card-description">{report.description}</p>

                      <div className="rl-card-meta">
                        <span className="rl-card-meta-item">
                          <Calendar className="rl-card-meta-icon" />
                          Period: {report.period}
                        </span>
                        <span className="rl-card-meta-item">
                          <FileText className="rl-card-meta-icon" />
                          Format: {report.format}
                        </span>
                        {report.recipients && report.recipients.length > 0 && (
                          <span className="rl-card-meta-item">
                            <Users className="rl-card-meta-icon" />
                            {report.recipients.length} recipients
                          </span>
                        )}
                        {report.schedule?.frequency && report.schedule.frequency !== 'none' && (
                          <span className="rl-card-meta-item">
                            <Clock className="rl-card-meta-icon" />
                            {getFrequencyLabel(report.schedule.frequency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rl-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="rl-action-btn rl-action-view" 
                      title="View"
                      onClick={() => handleViewReport(report._id)}
                    >
                      <Eye className="rl-action-icon" />
                    </button>
                    <button 
                      className="rl-action-btn rl-action-edit" 
                      title="Edit"
                      onClick={() => handleEditReport(report._id)}
                    >
                      <Edit className="rl-action-icon" />
                    </button>
                    <button 
                      className="rl-action-btn rl-action-copy" 
                      title="Copy"
                      onClick={() => handleCopyReport(report._id)}
                    >
                      <Copy className="rl-action-icon" />
                    </button>
                    <button 
                      className="rl-action-btn rl-action-delete" 
                      title="Delete"
                      onClick={() => handleDeleteReport(report._id)}
                    >
                      <Trash2 className="rl-action-icon" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded[report._id] && (
                  <div className="rl-card-expanded">
                    <div className="rl-expanded-content">
                      <div className="rl-expanded-grid">
                        <div className="rl-expanded-section">
                          <h5 className="rl-expanded-label">Report Details</h5>
                          <div className="rl-expanded-details">
                            <div className="rl-expanded-item">
                              <span className="rl-expanded-key">Type</span>
                              <span className="rl-expanded-value">{getTypeLabel(report.type)}</span>
                            </div>
                            <div className="rl-expanded-item">
                              <span className="rl-expanded-key">Category</span>
                              <span className={`rl-expanded-value ${getCategoryColor(report.category)}`}>
                                {getCategoryLabel(report.category)}
                              </span>
                            </div>
                            <div className="rl-expanded-item">
                              <span className="rl-expanded-key">Format</span>
                              <span className="rl-expanded-value">{report.format}</span>
                            </div>
                            <div className="rl-expanded-item">
                              <span className="rl-expanded-key">Period</span>
                              <span className="rl-expanded-value">{report.period}</span>
                            </div>
                            <div className="rl-expanded-item">
                              <span className="rl-expanded-key">Group By</span>
                              <span className="rl-expanded-value">{report.groupBy}</span>
                            </div>
                          </div>
                        </div>

                        <div className="rl-expanded-section">
                          <h5 className="rl-expanded-label">Schedule</h5>
                          <div className="rl-expanded-details">
                            <div className="rl-expanded-item">
                              <span className="rl-expanded-key">Frequency</span>
                              <span className="rl-expanded-value">
                                {report.schedule?.frequency || 'None'}
                              </span>
                            </div>
                            {report.schedule?.frequency && report.schedule.frequency !== 'none' && (
                              <>
                                <div className="rl-expanded-item">
                                  <span className="rl-expanded-key">Day</span>
                                  <span className="rl-expanded-value">{report.schedule.day || 'N/A'}</span>
                                </div>
                                <div className="rl-expanded-item">
                                  <span className="rl-expanded-key">Time</span>
                                  <span className="rl-expanded-value">{report.schedule.time || 'N/A'}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {report.metrics && report.metrics.length > 0 && (
                        <div className="rl-expanded-metrics">
                          <h5 className="rl-expanded-label">Metrics</h5>
                          <div className="rl-expanded-tags">
                            {report.metrics.map((metric, idx) => (
                              <span key={idx} className="rl-expanded-tag">{metric}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {report.recipients && report.recipients.length > 0 && (
                        <div className="rl-expanded-recipients">
                          <h5 className="rl-expanded-label">Recipients</h5>
                          <div className="rl-expanded-tags">
                            {report.recipients.map((recipient, idx) => (
                              <span key={idx} className="rl-expanded-tag rl-expanded-tag-blue">
                                {recipient}
                              </span>
                            ))}
                          </div>
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

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .rl-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: rlFadeIn 0.4s ease;
        }

        @keyframes rlFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes rlSpin {
          to { transform: rotate(360deg); }
        }

        .rl-spin {
          animation: rlSpin 1s linear infinite;
        }

        /* ============================================
           LOADING
           ============================================ */
        .rl-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .rl-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: rlSpin 0.8s linear infinite;
        }

        .rl-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        /* ============================================
           HEADER
           ============================================ */
        .rl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .rl-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .rl-header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .rl-header-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .rl-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .rl-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .rl-count {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 14px;
          border-radius: 12px;
        }

        .rl-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rl-btn-icon {
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

        .rl-btn-icon:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .rl-btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rl-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .rl-btn-svg {
          width: 16px;
          height: 16px;
        }

        .rl-btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }

        .rl-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        /* ============================================
           STATS
           ============================================ */
        .rl-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .rl-stat-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 16px 20px;
          transition: all 0.3s ease;
          animation: rlSlideUp 0.5s ease both;
        }

        .rl-stat-card:nth-child(1) { animation-delay: 0.05s; }
        .rl-stat-card:nth-child(2) { animation-delay: 0.1s; }
        .rl-stat-card:nth-child(3) { animation-delay: 0.15s; }
        .rl-stat-card:nth-child(4) { animation-delay: 0.2s; }

        @keyframes rlSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .rl-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .rl-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rl-stat-left {
          flex: 1;
        }

        .rl-stat-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          margin: 0;
        }

        .rl-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 4px 0 0 0;
          line-height: 1.2;
        }

        .rl-stat-value-active { color: #22c55e; }
        .rl-stat-value-pending { color: #f59e0b; }
        .rl-stat-value-scheduled { color: #8b5cf6; }

        .rl-stat-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rl-stat-icon-total { background: #eff6ff; }
        .rl-stat-icon-active { background: #d1fae5; }
        .rl-stat-icon-pending { background: #fef3c7; }
        .rl-stat-icon-scheduled { background: #f3e8ff; }

        .rl-stat-svg {
          width: 20px;
          height: 20px;
        }

        .rl-stat-icon-total .rl-stat-svg { color: #3b82f6; }
        .rl-stat-icon-active .rl-stat-svg { color: #22c55e; }
        .rl-stat-icon-pending .rl-stat-svg { color: #f59e0b; }
        .rl-stat-icon-scheduled .rl-stat-svg { color: #8b5cf6; }

        /* ============================================
           FILTERS
           ============================================ */
        .rl-filters {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .rl-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .rl-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .rl-search-input {
          width: 100%;
          padding: 8px 36px 8px 36px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
        }

        .rl-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .rl-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }

        .rl-search-clear:hover {
          background: #f1f5f9;
        }

        .rl-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .rl-filter-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 130px;
        }

        .rl-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .rl-clear-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: #f1f5f9;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rl-clear-btn:hover {
          background: #e2e8f0;
        }

        .rl-clear-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           LIST
           ============================================ */
        .rl-list-container {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .rl-list {
          divide-y: 1px solid #e2e8f0;
        }

        .rl-card {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s ease;
        }

        .rl-card:last-child {
          border-bottom: none;
        }

        .rl-card:hover {
          background: #fafafa;
        }

        .rl-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px 20px;
          cursor: pointer;
          gap: 12px;
        }

        .rl-card-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .rl-expand-btn {
          margin-top: 2px;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .rl-expand-btn:hover {
          background: #f1f5f9;
        }

        .rl-expand-icon {
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .rl-card-icon-wrapper {
          width: 40px;
          height: 40px;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rl-type-icon {
          width: 20px;
          height: 20px;
          color: #64748b;
        }

        .rl-card-info {
          flex: 1;
          min-width: 0;
        }

        .rl-card-title-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .rl-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .rl-card-category {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .rl-category-operations { background: #dbeafe; color: #1d4ed8; }
        .rl-category-financial { background: #d1fae5; color: #065f46; }
        .rl-category-crm { background: #f3e8ff; color: #6d28d9; }
        .rl-category-productivity { background: #fef3c7; color: #92400e; }
        .rl-category-client { background: #fce7f3; color: #9d174d; }
        .rl-category-custom { background: #f1f5f9; color: #475569; }
        .rl-category-default { background: #f1f5f9; color: #475569; }

        .rl-card-status {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .rl-status-active { background: #d1fae5; color: #065f46; }
        .rl-status-pending { background: #fef3c7; color: #92400e; }
        .rl-status-completed { background: #dbeafe; color: #1d4ed8; }
        .rl-status-failed { background: #fee2e2; color: #991b1b; }
        .rl-status-default { background: #f1f5f9; color: #475569; }

        .rl-card-date {
          font-size: 12px;
          color: #94a3b8;
        }

        .rl-card-description {
          font-size: 14px;
          color: #64748b;
          margin: 6px 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rl-card-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 6px;
          font-size: 12px;
          color: #64748b;
        }

        .rl-card-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rl-card-meta-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .rl-card-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .rl-action-btn {
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

        .rl-action-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .rl-action-view:hover { background: #eff6ff; color: #3b82f6; }
        .rl-action-edit:hover { background: #ecfdf5; color: #22c55e; }
        .rl-action-copy:hover { background: #f3e8ff; color: #8b5cf6; }
        .rl-action-delete:hover { background: #fef2f2; color: #ef4444; }

        .rl-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EXPANDED
           ============================================ */
        .rl-card-expanded {
          padding: 0 20px 16px 20px;
          margin-left: 40px;
        }

        .rl-expanded-content {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }

        .rl-expanded-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .rl-expanded-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rl-expanded-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .rl-expanded-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 16px;
        }

        .rl-expanded-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rl-expanded-key {
          font-size: 11px;
          color: #94a3b8;
        }

        .rl-expanded-value {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .rl-expanded-metrics,
        .rl-expanded-recipients {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }

        .rl-expanded-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .rl-expanded-tag {
          padding: 2px 10px;
          font-size: 12px;
          background: #f1f5f9;
          color: #475569;
          border-radius: 4px;
        }

        .rl-expanded-tag-blue {
          background: #dbeafe;
          color: #1d4ed8;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .rl-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }

        .rl-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .rl-empty-icon {
          width: 36px;
          height: 36px;
          color: #94a3b8;
        }

        .rl-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .rl-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .rl-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .rl-empty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .rl-container {
            padding: 16px;
          }

          .rl-header {
            flex-direction: column;
            align-items: stretch;
          }

          .rl-header-right {
            flex-wrap: wrap;
          }

          .rl-btn-primary {
            flex: 1;
            justify-content: center;
          }

          .rl-filters {
            flex-direction: column;
          }

          .rl-search-wrapper {
            width: 100%;
          }

          .rl-filter-select {
            width: 100%;
          }

          .rl-title {
            font-size: 22px;
          }

          .rl-header-icon {
            width: 40px;
            height: 40px;
          }

          .rl-header-svg {
            width: 20px;
            height: 20px;
          }

          .rl-card-header {
            flex-direction: column;
          }

          .rl-card-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 4px;
          }

          .rl-expanded-grid {
            grid-template-columns: 1fr;
          }

          .rl-expanded-details {
            grid-template-columns: 1fr;
          }

          .rl-card-expanded {
            margin-left: 0;
            padding: 0 16px 12px 16px;
          }
        }

        @media (max-width: 480px) {
          .rl-container {
            padding: 12px;
          }

          .rl-header-right {
            flex-direction: column;
          }

          .rl-btn-primary {
            width: 100%;
          }

          .rl-btn-icon {
            align-self: flex-end;
          }

          .rl-title {
            font-size: 20px;
          }

          .rl-subtitle {
            font-size: 13px;
          }

          .rl-card-title-row {
            flex-wrap: wrap;
          }

          .rl-card-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportList;