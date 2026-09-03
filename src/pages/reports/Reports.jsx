// pages/reports/Reports.jsx
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
  X, Loader, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
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

  const handleEditReport = (reportId) => {
    navigate(`/reports/builder/${reportId}`);
  };

  const handleViewReport = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`${API_URL}/reports/${reportId}`, {
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

  const handleCopyReport = async (reportId) => {
    try {
      const response = await fetch(`${API_URL}/reports/${reportId}/copy`, {
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
      'operations': 'rp-category-operations',
      'financial': 'rp-category-financial',
      'crm': 'rp-category-crm',
      'productivity': 'rp-category-productivity',
      'client': 'rp-category-client',
      'custom': 'rp-category-custom'
    };
    return colors[category] || 'rp-category-default';
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
    return <Icon className="rp-type-icon" />;
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
      'active': 'rp-status-active',
      'pending': 'rp-status-pending',
      'completed': 'rp-status-completed',
      'failed': 'rp-status-failed'
    };
    return colors[status] || 'rp-status-default';
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

  const reportsArray = Array.isArray(reports) ? reports : [];
  
  const stats = {
    total: reportsArray.length,
    active: reportsArray.filter(r => r.status === 'active').length,
    pending: reportsArray.filter(r => r.status === 'pending').length,
    scheduled: reportsArray.filter(r => r.schedule?.frequency && r.schedule.frequency !== 'none').length
  };

  if (loading) {
    return (
      <div className="rp-loading">
        <div className="rp-loading-spinner"></div>
        <p className="rp-loading-text">Loading reports...</p>
      </div>
    );
  }

  return (
    <>
      <div className="rp-container">
        {/* Header */}
        <div className="rp-header">
          <div className="rp-header-left">
            <div className="rp-header-icon">
              <Layers className="rp-header-svg" />
            </div>
            <div>
              <h1 className="rp-title">Reports</h1>
              <p className="rp-subtitle">Manage and generate reports</p>
            </div>
            <span className="rp-count">{reportsArray.length} reports</span>
          </div>
          <div className="rp-header-right">
            <button className="rp-btn-icon" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`rp-refresh-icon ${refreshing ? 'rp-spin' : ''}`} />
            </button>
            <button 
              onClick={handleNewReport}
              className="rp-btn-primary"
            >
              <Plus className="rp-btn-svg" />
              New Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="rp-stats">
          <div className="rp-stat-card">
            <div className="rp-stat-content">
              <div className="rp-stat-left">
                <p className="rp-stat-label">Total Reports</p>
                <p className="rp-stat-value">{stats.total}</p>
              </div>
              <div className="rp-stat-icon-wrapper rp-stat-icon-total">
                <FileText className="rp-stat-svg" />
              </div>
            </div>
          </div>
          <div className="rp-stat-card">
            <div className="rp-stat-content">
              <div className="rp-stat-left">
                <p className="rp-stat-label">Active</p>
                <p className="rp-stat-value rp-stat-value-active">{stats.active}</p>
              </div>
              <div className="rp-stat-icon-wrapper rp-stat-icon-active">
                <CheckCircle className="rp-stat-svg" />
              </div>
            </div>
          </div>
          <div className="rp-stat-card">
            <div className="rp-stat-content">
              <div className="rp-stat-left">
                <p className="rp-stat-label">Pending</p>
                <p className="rp-stat-value rp-stat-value-pending">{stats.pending}</p>
              </div>
              <div className="rp-stat-icon-wrapper rp-stat-icon-pending">
                <Clock className="rp-stat-svg" />
              </div>
            </div>
          </div>
          <div className="rp-stat-card">
            <div className="rp-stat-content">
              <div className="rp-stat-left">
                <p className="rp-stat-label">Scheduled</p>
                <p className="rp-stat-value rp-stat-value-scheduled">{stats.scheduled}</p>
              </div>
              <div className="rp-stat-icon-wrapper rp-stat-icon-scheduled">
                <Calendar className="rp-stat-svg" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rp-filters">
          <div className="rp-search-wrapper">
            <Search className="rp-search-icon" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={handleSearch}
              className="rp-search-input"
            />
            {search && (
              <button className="rp-search-clear" onClick={() => setSearch('')}>
                <X className="rp-search-clear-icon" />
              </button>
            )}
          </div>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="rp-filter-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="rp-filter-select"
          >
            {types.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="rp-filter-select"
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
              className="rp-clear-btn"
            >
              <X className="rp-clear-icon" />
              Clear
            </button>
          )}
        </div>

        {/* Report List */}
        <div className="rp-list-container">
          {reportsArray.length === 0 ? (
            <div className="rp-empty">
              <div className="rp-empty-icon-wrapper">
                <FileText className="rp-empty-icon" />
              </div>
              <h3 className="rp-empty-title">No reports found</h3>
              <p className="rp-empty-subtitle">Create your first report</p>
              <button 
                onClick={handleNewReport}
                className="rp-empty-btn"
              >
                <Plus className="rp-btn-svg" />
                Create Report
              </button>
            </div>
          ) : (
            <div className="rp-list">
              {reportsArray.map((report, index) => (
                <div key={report._id} className="rp-card" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="rp-card-header" onClick={() => toggleExpand(report._id)}>
                    <div className="rp-card-left">
                      <div className="rp-expand-btn">
                        {expanded[report._id] ? (
                          <ChevronDown className="rp-expand-icon" />
                        ) : (
                          <ChevronRight className="rp-expand-icon" />
                        )}
                      </div>

                      <div className="rp-card-icon-wrapper">
                        {getTypeIcon(report.type)}
                      </div>

                      <div className="rp-card-info">
                        <div className="rp-card-title-row">
                          <h4 className="rp-card-title">{report.name}</h4>
                          <span className={`rp-card-category ${getCategoryColor(report.category)}`}>
                            {getCategoryLabel(report.category)}
                          </span>
                          <span className={`rp-card-status ${getStatusColor(report.status)}`}>
                            <span className="rp-status-dot"></span>
                            {getStatusLabel(report.status)}
                          </span>
                          <span className="rp-card-date">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="rp-card-description">{report.description}</p>

                        <div className="rp-card-meta">
                          <span className="rp-card-meta-item">
                            <Calendar className="rp-card-meta-icon" />
                            Period: {report.period}
                          </span>
                          <span className="rp-card-meta-item">
                            <FileText className="rp-card-meta-icon" />
                            Format: {report.format}
                          </span>
                          {report.recipients && report.recipients.length > 0 && (
                            <span className="rp-card-meta-item">
                              <Users className="rp-card-meta-icon" />
                              {report.recipients.length} recipients
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rp-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="rp-action-btn rp-action-view" 
                        title="View"
                        onClick={() => handleViewReport(report._id)}
                      >
                        <Eye className="rp-action-icon" />
                      </button>
                      <button 
                        className="rp-action-btn rp-action-edit" 
                        title="Edit"
                        onClick={() => handleEditReport(report._id)}
                      >
                        <Edit className="rp-action-icon" />
                      </button>
                      <button 
                        className="rp-action-btn rp-action-copy" 
                        title="Copy"
                        onClick={() => handleCopyReport(report._id)}
                      >
                        <Copy className="rp-action-icon" />
                      </button>
                      <button 
                        className="rp-action-btn rp-action-delete" 
                        title="Delete"
                        onClick={() => handleDeleteReport(report._id)}
                      >
                        <Trash2 className="rp-action-icon" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expanded[report._id] && (
                    <div className="rp-card-expanded">
                      <div className="rp-expanded-content">
                        <div className="rp-expanded-grid">
                          <div className="rp-expanded-section">
                            <h5 className="rp-expanded-label">Report Details</h5>
                            <div className="rp-expanded-details">
                              <div className="rp-expanded-item">
                                <span className="rp-expanded-key">Type</span>
                                <span className="rp-expanded-value">{getTypeLabel(report.type)}</span>
                              </div>
                              <div className="rp-expanded-item">
                                <span className="rp-expanded-key">Category</span>
                                <span className={`rp-expanded-value ${getCategoryColor(report.category)}`}>
                                  {getCategoryLabel(report.category)}
                                </span>
                              </div>
                              <div className="rp-expanded-item">
                                <span className="rp-expanded-key">Format</span>
                                <span className="rp-expanded-value">{report.format}</span>
                              </div>
                              <div className="rp-expanded-item">
                                <span className="rp-expanded-key">Period</span>
                                <span className="rp-expanded-value">{report.period}</span>
                              </div>
                              <div className="rp-expanded-item">
                                <span className="rp-expanded-key">Group By</span>
                                <span className="rp-expanded-value">{report.groupBy}</span>
                              </div>
                            </div>
                          </div>

                          <div className="rp-expanded-section">
                            <h5 className="rp-expanded-label">Schedule</h5>
                            <div className="rp-expanded-details">
                              <div className="rp-expanded-item">
                                <span className="rp-expanded-key">Frequency</span>
                                <span className="rp-expanded-value">
                                  {report.schedule?.frequency || 'None'}
                                </span>
                              </div>
                              {report.schedule?.frequency && report.schedule.frequency !== 'none' && (
                                <>
                                  <div className="rp-expanded-item">
                                    <span className="rp-expanded-key">Day</span>
                                    <span className="rp-expanded-value">{report.schedule.day || 'N/A'}</span>
                                  </div>
                                  <div className="rp-expanded-item">
                                    <span className="rp-expanded-key">Time</span>
                                    <span className="rp-expanded-value">{report.schedule.time || 'N/A'}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {report.metrics && report.metrics.length > 0 && (
                          <div className="rp-expanded-metrics">
                            <h5 className="rp-expanded-label">Metrics</h5>
                            <div className="rp-expanded-tags">
                              {report.metrics.map((metric, idx) => (
                                <span key={idx} className="rp-expanded-tag">{metric}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {report.recipients && report.recipients.length > 0 && (
                          <div className="rp-expanded-recipients">
                            <h5 className="rp-expanded-label">Recipients</h5>
                            <div className="rp-expanded-tags">
                              {report.recipients.map((recipient, idx) => (
                                <span key={idx} className="rp-expanded-tag rp-expanded-tag-blue">
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
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .rp-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .rp-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 20px;
        }

        .rp-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(1, 62, 55, 0.06);
          border-top-color: #013E37;
          border-radius: 50%;
          animation: rpSpin 0.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        .rp-loading-text {
          color: #013E37;
          opacity: 0.4;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.3px;
          animation: pulseText 1.5s ease-in-out infinite;
        }

        @keyframes pulseText {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        @keyframes rpSpin {
          to { transform: rotate(360deg); }
        }

        .rp-spin {
          animation: rpSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .rp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .rp-header-icon {
          width: 48px;
          height: 48px;
          background: #013E37;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.25);
        }

        .rp-header-svg {
          width: 24px;
          height: 24px;
          color: #FFEFB3;
        }

        .rp-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .rp-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }

        .rp-count {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          background: #FFEFB3;
          padding: 2px 14px;
          border-radius: 12px;
        }

        .rp-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rp-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          color: #013E37;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.04);
        }

        .rp-btn-icon:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
        }

        .rp-btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rp-refresh-icon {
          width: 18px;
          height: 18px;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-btn-svg {
          width: 16px;
          height: 16px;
        }

        .rp-btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(1, 62, 55, 0.3);
        }

        .rp-btn-primary:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.4);
        }

        /* ============================================
           STATS
           ============================================ */
        .rp-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .rp-stat-card {
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          padding: 16px 20px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          opacity: 0;
        }

        .rp-stat-card:nth-child(1) { animation-delay: 0.05s; }
        .rp-stat-card:nth-child(2) { animation-delay: 0.1s; }
        .rp-stat-card:nth-child(3) { animation-delay: 0.15s; }
        .rp-stat-card:nth-child(4) { animation-delay: 0.2s; }

        .rp-stat-card:hover {
          transform: translateY(-2px);
          border-color: #013E37;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
        }

        .rp-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rp-stat-left {
          flex: 1;
        }

        .rp-stat-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          font-weight: 500;
          margin: 0;
        }

        .rp-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 4px 0 0 0;
          line-height: 1.2;
        }

        .rp-stat-value-active { color: #013E37; }
        .rp-stat-value-pending { color: #013E37; }
        .rp-stat-value-scheduled { color: #013E37; }

        .rp-stat-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rp-stat-icon-total { background: #E8F0FE; }
        .rp-stat-icon-active { background: #E8F5E9; }
        .rp-stat-icon-pending { background: #FFEFB3; }
        .rp-stat-icon-scheduled { background: #F0ECFA; }

        .rp-stat-svg {
          width: 20px;
          height: 20px;
        }

        .rp-stat-icon-total .rp-stat-svg { color: #013E37; }
        .rp-stat-icon-active .rp-stat-svg { color: #013E37; }
        .rp-stat-icon-pending .rp-stat-svg { color: #013E37; }
        .rp-stat-icon-scheduled .rp-stat-svg { color: #013E37; }

        /* ============================================
           FILTERS
           ============================================ */
        .rp-filters {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-filters:hover {
          border-color: #013E37;
        }

        .rp-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .rp-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.4;
        }

        .rp-search-input {
          width: 100%;
          padding: 8px 36px 8px 36px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: #FFFFFF;
          color: #013E37;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-search-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .rp-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }

        .rp-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          background: none;
          border: none;
          color: #013E37;
          opacity: 0.4;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-search-clear:hover {
          background: #FFEFB3;
          opacity: 1;
        }

        .rp-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .rp-filter-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #FFFFFF;
          color: #013E37;
          outline: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          min-width: 130px;
        }

        .rp-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .rp-filter-select:hover {
          border-color: #013E37;
        }

        .rp-clear-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 14px;
          background: #FFEFB3;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-clear-btn:hover {
          background: #013E37;
          color: #FFEFB3;
          transform: scale(1.02);
        }

        .rp-clear-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           LIST
           ============================================ */
        .rp-list-container {
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-list-container:hover {
          border-color: #013E37;
        }

        .rp-list {
          divide-y: 1px solid #FFEFB3;
        }

        .rp-card {
          border-bottom: 1px solid #FFEFB3;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        .rp-card:last-child {
          border-bottom: none;
        }

        .rp-card:hover {
          background: #FFF9E6;
        }

        .rp-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px 20px;
          cursor: pointer;
          gap: 12px;
        }

        .rp-card-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .rp-expand-btn {
          margin-top: 2px;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-expand-btn:hover {
          background: #FFEFB3;
        }

        .rp-expand-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.4;
          transition: transform 0.3s ease;
        }

        .rp-card-icon-wrapper {
          width: 40px;
          height: 40px;
          background: #FFEFB3;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-card:hover .rp-card-icon-wrapper {
          transform: scale(1.05);
        }

        .rp-type-icon {
          width: 20px;
          height: 20px;
          color: #013E37;
        }

        .rp-card-info {
          flex: 1;
          min-width: 0;
        }

        .rp-card-title-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .rp-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .rp-card-category {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 9999px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-card-category:hover {
          transform: scale(1.05);
        }

        .rp-category-operations { background: #013E37; color: #FFEFB3; }
        .rp-category-financial { background: #0A5C54; color: #FFEFB3; }
        .rp-category-crm { background: #1A7A6E; color: #FFEFB3; }
        .rp-category-productivity { background: #FFEFB3; color: #013E37; }
        .rp-category-client { background: #2A9A8A; color: #FFEFB3; }
        .rp-category-custom { background: #FFEFB3; color: #013E37; }
        .rp-category-default { background: #FFEFB3; color: #013E37; }

        .rp-card-status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 9999px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-card-status:hover {
          transform: scale(1.05);
        }

        .rp-status-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.6;
        }

        .rp-status-active { background: #013E37; color: #FFEFB3; }
        .rp-status-pending { background: #FFEFB3; color: #013E37; }
        .rp-status-completed { background: #0A5C54; color: #FFEFB3; }
        .rp-status-failed { background: #FEE2E2; color: #991B1B; }
        .rp-status-default { background: #FFEFB3; color: #013E37; }

        .rp-card-date {
          font-size: 12px;
          color: #013E37;
          opacity: 0.4;
        }

        .rp-card-description {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
          margin: 6px 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rp-card-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 6px;
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
        }

        .rp-card-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rp-card-meta-icon {
          width: 14px;
          height: 14px;
          color: #013E37;
          opacity: 0.4;
        }

        .rp-card-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .rp-action-btn {
          padding: 6px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          color: #013E37;
          opacity: 0.3;
          display: flex;
          align-items: center;
        }

        .rp-action-btn:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }

        .rp-action-view:hover { background: #FFEFB3; color: #013E37; }
        .rp-action-edit:hover { background: #FFEFB3; color: #013E37; }
        .rp-action-copy:hover { background: #FFEFB3; color: #013E37; }
        .rp-action-delete:hover { background: #FEE2E2; color: #EF4444; }

        .rp-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EXPANDED
           ============================================ */
        .rp-card-expanded {
          padding: 0 20px 16px 20px;
          margin-left: 40px;
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-expanded-content {
          background: #FFF9E6;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #FFEFB3;
        }

        .rp-expanded-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .rp-expanded-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rp-expanded-label {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.5;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .rp-expanded-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 16px;
        }

        .rp-expanded-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rp-expanded-key {
          font-size: 11px;
          color: #013E37;
          opacity: 0.4;
        }

        .rp-expanded-value {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-expanded-value:hover {
          transform: scale(1.02);
        }

        .rp-expanded-metrics,
        .rp-expanded-recipients {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #FFEFB3;
        }

        .rp-expanded-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .rp-expanded-tag {
          padding: 2px 10px;
          font-size: 12px;
          font-weight: 500;
          background: #FFEFB3;
          color: #013E37;
          border-radius: 4px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-expanded-tag:hover {
          transform: scale(1.05);
        }

        .rp-expanded-tag-blue {
          background: #013E37;
          color: #FFEFB3;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .rp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }

        .rp-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #FFEFB3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          animation: float 3s ease-in-out infinite;
        }

        .rp-empty-icon {
          width: 36px;
          height: 36px;
          color: #013E37;
          opacity: 0.5;
        }

        .rp-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .rp-empty-subtitle {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 4px 0 16px 0;
        }

        .rp-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(1, 62, 55, 0.25);
        }

        .rp-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
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
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .rp-header {
            flex-direction: column;
            align-items: stretch;
          }

          .rp-header-right {
            flex-wrap: wrap;
          }

          .rp-btn-primary {
            flex: 1;
            justify-content: center;
          }

          .rp-filters {
            flex-direction: column;
          }

          .rp-search-wrapper {
            width: 100%;
          }

          .rp-filter-select {
            width: 100%;
          }

          .rp-stats {
            grid-template-columns: 1fr 1fr;
          }

          .rp-title {
            font-size: 22px;
          }

          .rp-header-icon {
            width: 40px;
            height: 40px;
          }

          .rp-header-svg {
            width: 20px;
            height: 20px;
          }

          .rp-card-header {
            flex-direction: column;
          }

          .rp-card-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 4px;
          }

          .rp-expanded-grid {
            grid-template-columns: 1fr;
          }

          .rp-expanded-details {
            grid-template-columns: 1fr;
          }

          .rp-card-expanded {
            margin-left: 0;
            padding: 0 16px 12px 16px;
          }
        }

        @media (max-width: 480px) {
          .rp-header-right {
            flex-direction: column;
          }

          .rp-btn-primary {
            width: 100%;
          }

          .rp-btn-icon {
            align-self: flex-end;
          }

          .rp-stats {
            grid-template-columns: 1fr;
          }

          .rp-title {
            font-size: 20px;
          }

          .rp-subtitle {
            font-size: 13px;
          }

          .rp-card-title-row {
            flex-wrap: wrap;
          }

          .rp-card-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </>
  );
};

export default Reports;