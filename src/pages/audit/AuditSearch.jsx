// pages/audit/AuditSearch.jsx
import React, { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import {
  Search, Filter, Calendar, Users,
  FileText, X, Eye, Download,
  RefreshCw, Activity, Clock, AlertCircle,
  CheckCircle, User, Building2, Briefcase,
  Layers, Target, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const AuditSearch = () => {
  const { token } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    userId: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    skip: 0,
    hasMore: false
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.action) params.append('action', filters.action);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);
      params.append('limit', pagination.limit);
      
      const response = await axios.get(
        `${API_URL}/audit?${params.toString()}`,
        getHeaders()
      );
      setLogs(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        hasMore: response.data.pagination?.hasMore || false
      }));
      toast.success(`Found ${response.data.data.length} results`);
    } catch (error) {
      console.error('Error searching audit:', error);
      toast.error('Failed to search audit logs');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      entityType: '',
      action: '',
      userId: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    setLogs([]);
    setPagination(prev => ({ ...prev, total: 0, hasMore: false }));
    toast.success('Filters cleared');
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.action) params.append('action', filters.action);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);
      params.append('format', 'csv');
      
      const response = await axios.get(
        `${API_URL}/audit/export?${params.toString()}`,
        {
          ...getHeaders(),
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-search-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export started');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export data');
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getActionColor = (action) => {
    if (action?.includes('created') || action === 'create') return 'as-action-created';
    if (action?.includes('updated') || action === 'update' || action?.includes('changed')) return 'as-action-updated';
    if (action?.includes('deleted') || action === 'delete') return 'as-action-deleted';
    if (action?.includes('approved') || action === 'approve') return 'as-action-approved';
    if (action?.includes('rejected') || action === 'reject') return 'as-action-rejected';
    if (action?.includes('completed') || action === 'complete') return 'as-action-completed';
    if (action?.includes('login')) return 'as-action-login';
    if (action?.includes('logout')) return 'as-action-logout';
    return 'as-action-default';
  };

  const getActionLabel = (action) => {
    const labels = {
      'created': 'Created',
      'create': 'Created',
      'updated': 'Updated',
      'update': 'Updated',
      'deleted': 'Deleted',
      'delete': 'Deleted',
      'approved': 'Approved',
      'approve': 'Approved',
      'rejected': 'Rejected',
      'reject': 'Rejected',
      'completed': 'Completed',
      'complete': 'Completed',
      'login': 'Logged In',
      'logout': 'Logged Out'
    };
    return labels[action] || action;
  };

  const getEntityIcon = (type) => {
    const icons = {
      'user': User,
      'lead': Target,
      'client': Building2,
      'project': Briefcase,
      'task': FileText,
      'goal': Target,
      'segment': Layers,
      'department': Building2,
      'team': Users,
      'workflow': Zap,
      'activity': Activity,
      'kpi': BarChart3,
      'risk': AlertCircle
    };
    const Icon = icons[type] || Activity;
    return <Icon className="as-entity-icon" />;
  };

  const getTimeAgo = (date) => {
    if (!date) return 'N/A';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const hasActiveFilters = () => {
    return filters.entityType || filters.action || filters.userId || 
           filters.startDate || filters.endDate || filters.search;
  };

  return (
    <>
      <div className="as-container">
        {/* Header */}
        <div className="as-header">
          <div className="as-header-left">
            <h1 className="as-title">
              <Search className="as-title-icon" />
              Audit Search
            </h1>
            <p className="as-subtitle">Search and filter audit logs across the system</p>
          </div>
          <div className="as-header-right">
            {hasActiveFilters() && (
              <button 
                onClick={clearFilters}
                className="as-clear-btn"
              >
                <X className="as-clear-icon" />
                Clear All
              </button>
            )}
            {logs.length > 0 && (
              <button 
                onClick={handleExport}
                className="as-export-btn"
              >
                <Download className="as-export-icon" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Search Form */}
        <div className="as-search-section">
          <div className="as-search-grid">
            <div className="as-search-group as-search-group-full">
              <label className="as-search-label">Search Query</label>
              <div className="as-search-input-wrap">
                <Search className="as-search-input-icon" />
                <input
                  type="text"
                  placeholder="Search by user, action, entity, or description..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="as-search-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="as-search-clear"
                  >
                    <X className="as-search-clear-icon" />
                  </button>
                )}
              </div>
            </div>

            <div className="as-search-group">
              <label className="as-search-label">Entity Type</label>
              <select
                value={filters.entityType}
                onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                className="as-search-select"
              >
                <option value="">All Types</option>
                <option value="user">User</option>
                <option value="lead">Lead</option>
                <option value="client">Client</option>
                <option value="project">Project</option>
                <option value="task">Task</option>
                <option value="goal">Goal</option>
                <option value="kpi">KPI</option>
                <option value="risk">Risk</option>
                <option value="segment">Segment</option>
                <option value="department">Department</option>
                <option value="team">Team</option>
                <option value="workflow">Workflow</option>
              </select>
            </div>

            <div className="as-search-group">
              <label className="as-search-label">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                className="as-search-select"
              >
                <option value="">All Actions</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>

            <div className="as-search-group">
              <label className="as-search-label">From Date</label>
              <div className="as-date-input-wrap">
                <Calendar className="as-date-icon" />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="as-date-input"
                />
              </div>
            </div>

            <div className="as-search-group">
              <label className="as-search-label">To Date</label>
              <div className="as-date-input-wrap">
                <Calendar className="as-date-icon" />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="as-date-input"
                />
              </div>
            </div>

            <div className="as-search-actions">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="as-search-btn"
              >
                {loading ? (
                  <div className="as-search-spinner"></div>
                ) : (
                  <>
                    <Search className="as-search-btn-icon" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Stats */}
        {logs.length > 0 && (
          <div className="as-stats">
            <div className="as-stat">
              <span className="as-stat-label">Found</span>
              <span className="as-stat-value">{logs.length} results</span>
            </div>
            <div className="as-stat">
              <span className="as-stat-label">Total</span>
              <span className="as-stat-value">{pagination.total} records</span>
            </div>
            <button 
              onClick={handleExport}
              className="as-stat-export"
            >
              <Download className="as-stat-export-icon" />
              Export All
            </button>
          </div>
        )}

        {/* Results */}
        {logs.length > 0 && (
          <div className="as-results">
            {logs.map((log) => (
              <div key={log._id} className="as-result-item">
                <div className="as-result-header">
                  <div className="as-result-icon">
                    {getEntityIcon(log.entityType)}
                  </div>
                  <div className="as-result-content">
                    <div className="as-result-top">
                      <span className="as-result-user">
                        {log.userId?.firstName} {log.userId?.lastName || 'System'}
                      </span>
                      <span className={`as-result-action ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                      <span className="as-result-entity">{log.entityType}</span>
                      <span className="as-result-time">{getTimeAgo(log.createdAt)}</span>
                    </div>
                    <p className="as-result-desc">
                      {log.entityName || log.description || `${log.action} on ${log.entityType}`}
                    </p>
                    {log.changes && log.changes.length > 0 && (
                      <div className="as-result-changes">
                        {log.changes.slice(0, 3).map((change, idx) => (
                          <div key={idx} className="as-change">
                            <span className="as-change-field">{change.field}:</span>
                            <span className="as-change-old">{String(change.oldValue) || 'null'}</span>
                            <span className="as-change-arrow">→</span>
                            <span className="as-change-new">{String(change.newValue) || 'null'}</span>
                          </div>
                        ))}
                        {log.changes.length > 3 && (
                          <span className="as-change-more">+{log.changes.length - 3} more</span>
                        )}
                      </div>
                    )}
                    <div className="as-result-meta">
                      <span className="as-meta-item">
                        <Clock className="as-meta-icon" />
                        {formatDate(log.createdAt)}
                      </span>
                      {log.ip && (
                        <span className="as-meta-item">
                          <Activity className="as-meta-icon" />
                          IP: {log.ip}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="as-result-actions">
                    <button 
                      className="as-result-action-btn"
                      title="View Details"
                    >
                      <Eye className="as-result-action-icon" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {logs.length === 0 && !loading && (
          <div className="as-empty">
            <div className="as-empty-icon-wrapper">
              <Search className="as-empty-icon" />
            </div>
            <h3 className="as-empty-title">No Results Found</h3>
            <p className="as-empty-subtitle">
              {hasActiveFilters() 
                ? 'Try adjusting your search filters or check your query'
                : 'Enter search criteria above to find audit logs'}
            </p>
            {hasActiveFilters() && (
              <button 
                onClick={clearFilters}
                className="as-empty-btn"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="as-loading-overlay">
            <div className="as-loading-spinner"></div>
            <p className="as-loading-text">Searching audit logs...</p>
          </div>
        )}
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .as-container {
          padding: 0 0 24px 0;
          max-width: 100%;
          position: relative;
        }

        /* ============================================
           HEADER
           ============================================ */
        .as-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .as-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .as-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .as-title-icon {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }

        .as-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .as-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .as-clear-btn {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          color: #4b5563;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .as-clear-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .as-clear-icon {
          width: 16px;
          height: 16px;
        }

        .as-export-btn {
          padding: 8px 16px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .as-export-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .as-export-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           SEARCH SECTION
           ============================================ */
        .as-search-section {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .as-search-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr auto;
          gap: 16px;
          align-items: end;
        }

        @media (max-width: 1024px) {
          .as-search-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .as-search-grid {
            grid-template-columns: 1fr;
          }
        }

        .as-search-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .as-search-group-full {
          grid-column: 1 / -1;
        }

        .as-search-label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .as-search-input-wrap {
          position: relative;
        }

        .as-search-input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        .as-search-input {
          width: 100%;
          padding: 8px 40px 8px 36px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
        }

        .as-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .as-search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #9ca3af;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
        }

        .as-search-clear:hover {
          color: #6b7280;
        }

        .as-search-clear-icon {
          width: 16px;
          height: 16px;
        }

        .as-search-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          width: 100%;
        }

        .as-search-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .as-date-input-wrap {
          position: relative;
        }

        .as-date-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        .as-date-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
        }

        .as-date-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .as-search-actions {
          display: flex;
          align-items: center;
        }

        .as-search-btn {
          padding: 8px 24px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          width: 100%;
          justify-content: center;
        }

        .as-search-btn:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .as-search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .as-search-btn-icon {
          width: 16px;
          height: 16px;
        }

        .as-search-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           STATS
           ============================================ */
        .as-stats {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 12px 16px;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .as-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }

        .as-stat-label {
          color: #6b7280;
        }

        .as-stat-value {
          font-weight: 600;
          color: #111827;
        }

        .as-stat-export {
          margin-left: auto;
          padding: 4px 12px;
          border: none;
          background: transparent;
          color: #3b82f6;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s ease;
        }

        .as-stat-export:hover {
          color: #2563eb;
        }

        .as-stat-export-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           RESULTS
           ============================================ */
        .as-results {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .as-result-item {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 10px;
          padding: 16px;
          transition: all 0.2s ease;
        }

        .as-result-item:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .as-result-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .as-result-icon {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .as-entity-icon {
          width: 18px;
          height: 18px;
          color: #3b82f6;
        }

        .as-result-content {
          flex: 1;
          min-width: 0;
        }

        .as-result-top {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .as-result-user {
          font-weight: 600;
          color: #111827;
          font-size: 14px;
        }

        .as-result-action {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .as-action-created {
          background: #dcfce7;
          color: #16a34a;
        }

        .as-action-updated {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .as-action-deleted {
          background: #fee2e2;
          color: #dc2626;
        }

        .as-action-approved {
          background: #d1fae5;
          color: #059669;
        }

        .as-action-rejected {
          background: #fef3c7;
          color: #d97706;
        }

        .as-action-completed {
          background: #e0e7ff;
          color: #4f46e5;
        }

        .as-action-login {
          background: #ede9fe;
          color: #7c3aed;
        }

        .as-action-logout {
          background: #f3f4f6;
          color: #6b7280;
        }

        .as-action-default {
          background: #f3f4f6;
          color: #6b7280;
        }

        .as-result-entity {
          font-size: 12px;
          color: #6b7280;
          text-transform: capitalize;
        }

        .as-result-time {
          font-size: 12px;
          color: #9ca3af;
          margin-left: auto;
        }

        .as-result-desc {
          font-size: 14px;
          color: #4b5563;
          margin: 4px 0 0 0;
        }

        .as-result-changes {
          margin-top: 6px;
          padding: 8px 12px;
          background: #f9fafb;
          border-radius: 6px;
          border: 1px solid #f3f4f6;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .as-change {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-family: monospace;
        }

        .as-change-field {
          font-weight: 600;
          color: #374151;
        }

        .as-change-old {
          color: #ef4444;
          text-decoration: line-through;
        }

        .as-change-arrow {
          color: #9ca3af;
        }

        .as-change-new {
          color: #22c55e;
        }

        .as-change-more {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .as-result-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .as-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #9ca3af;
        }

        .as-meta-icon {
          width: 12px;
          height: 12px;
        }

        .as-result-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .as-result-action-btn {
          padding: 4px 6px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }

        .as-result-action-btn:hover {
          background: #f3f4f6;
          color: #4b5563;
        }

        .as-result-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .as-empty {
          background: #ffffff;
          border: 2px dashed #e5e7eb;
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
        }

        .as-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .as-empty-icon {
          width: 40px;
          height: 40px;
          color: #9ca3af;
        }

        .as-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .as-empty-subtitle {
          color: #6b7280;
          margin-top: 4px;
        }

        .as-empty-btn {
          margin-top: 16px;
          padding: 10px 24px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .as-empty-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        /* ============================================
           LOADING OVERLAY
           ============================================ */
        .as-loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 40;
        }

        .as-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .as-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .as-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .as-header-right {
            width: 100%;
          }

          .as-search-section {
            padding: 16px;
          }

          .as-result-header {
            flex-wrap: wrap;
          }

          .as-result-top {
            gap: 4px;
          }

          .as-result-time {
            margin-left: 0;
            width: 100%;
          }

          .as-stats {
            gap: 12px;
          }

          .as-stat-export {
            margin-left: 0;
          }
        }

        @media (max-width: 480px) {
          .as-search-grid {
            grid-template-columns: 1fr;
          }

          .as-search-actions {
            width: 100%;
          }

          .as-result-changes {
            overflow-x: auto;
          }

          .as-change {
            flex-wrap: nowrap;
          }
        }
      `}</style>
    </>
  );
};

// BarChart3 icon component (since it's used but not imported)
const BarChart3 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export default AuditSearch;