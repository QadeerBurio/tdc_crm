// pages/audit/AuditLog.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, Search, Filter, Download, 
  User, Calendar, FileText, Eye,
  RefreshCw, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle, XCircle,
  Activity, Settings, Users, Briefcase,
  Layers, Target, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

const AuditLog = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    entityType: 'all',
    action: 'all',
    startDate: '',
    endDate: '',
    userId: 'all'
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    skip: 0,
    hasMore: false,
    page: 1,
    totalPages: 0
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.skip]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.entityType !== 'all') params.append('entityType', filters.entityType);
      if (filters.action !== 'all') params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.userId !== 'all') params.append('userId', filters.userId);
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', pagination.limit);
      params.append('skip', pagination.skip);
      
      const response = await fetch(`${API_URL}/audit?${params.toString()}`, getHeaders());
      
      if (response.ok) {
        const result = await response.json();
        // ✅ FIX: Ensure logs is always an array
        const logsData = result.data || [];
        setLogs(Array.isArray(logsData) ? logsData : []);
        setPagination(prev => ({
          ...prev,
          total: result.pagination?.total || 0,
          hasMore: result.pagination?.hasMore || false,
          totalPages: Math.ceil((result.pagination?.total || 0) / prev.limit) || 1
        }));
      } else {
        // Use mock data if API fails
        setLogs(getMockLogs());
        toast.info('Showing sample audit data');
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs(getMockLogs());
      toast.error('Failed to load audit logs, showing sample data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockLogs = () => {
    return [
      {
        _id: '1',
        entityType: 'user',
        action: 'login',
        description: 'User logged in successfully',
        userId: { firstName: 'John', lastName: 'Doe' },
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        ip: '192.168.1.1',
        changes: []
      },
      {
        _id: '2',
        entityType: 'project',
        action: 'created',
        description: 'New project "Website Redesign" was created',
        userId: { firstName: 'Sarah', lastName: 'Smith' },
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        entityName: 'Website Redesign',
        ip: '192.168.1.2',
        changes: [
          { field: 'name', oldValue: null, newValue: 'Website Redesign' },
          { field: 'priority', oldValue: null, newValue: 'high' }
        ]
      },
      {
        _id: '3',
        entityType: 'task',
        action: 'updated',
        description: 'Task status updated to completed',
        userId: { firstName: 'Mike', lastName: 'Johnson' },
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        entityName: 'Design Homepage',
        ip: '192.168.1.3',
        changes: [
          { field: 'status', oldValue: 'in-progress', newValue: 'completed' }
        ]
      },
      {
        _id: '4',
        entityType: 'client',
        action: 'deleted',
        description: 'Client account was deleted',
        userId: { firstName: 'Emily', lastName: 'Davis' },
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        entityName: 'Acme Corp',
        ip: '192.168.1.4',
        changes: []
      },
      {
        _id: '5',
        entityType: 'goal',
        action: 'approved',
        description: 'Goal was approved by manager',
        userId: { firstName: 'Tom', lastName: 'Wilson' },
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        entityName: 'Increase Sales by 20%',
        ip: '192.168.1.5',
        changes: [
          { field: 'status', oldValue: 'pending', newValue: 'approved' }
        ]
      }
    ];
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    toast.success('Audit logs refreshed');
  };

  const getActionColor = (action) => {
    if (action?.includes('created') || action === 'create') return 'al-action-created';
    if (action?.includes('updated') || action === 'update' || action?.includes('changed')) return 'al-action-updated';
    if (action?.includes('deleted') || action === 'delete') return 'al-action-deleted';
    if (action?.includes('approved') || action === 'approve') return 'al-action-approved';
    if (action?.includes('rejected') || action === 'reject') return 'al-action-rejected';
    if (action?.includes('login')) return 'al-action-login';
    if (action?.includes('logout')) return 'al-action-logout';
    return 'al-action-default';
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
      'login': 'Logged In',
      'logout': 'Logged Out'
    };
    return labels[action] || action;
  };

  const getEntityIcon = (type) => {
    const icons = {
      'user': Users,
      'lead': Target,
      'client': Building2,
      'project': Briefcase,
      'task': FileText,
      'goal': Target,
      'segment': Layers,
      'department': Building2,
      'team': Users,
      'workflow': Settings,
      'activity': Activity
    };
    const Icon = icons[type] || Activity;
    return <Icon className="al-entity-icon" />;
  };

  const getTimeAgo = (date) => {
    if (!date) return 'N/A';
    const diff = Date.now() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
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
      minute: '2-digit'
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, skip: 0, page: 1 }));
    fetchLogs();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, skip: 0, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({
      ...prev,
      page: newPage,
      skip: (newPage - 1) * prev.limit
    }));
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.entityType !== 'all') params.append('entityType', filters.entityType);
      if (filters.action !== 'all') params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (searchTerm) params.append('search', searchTerm);
      params.append('format', 'csv');
      
      const response = await fetch(`${API_URL}/audit/export?${params.toString()}`, getHeaders());
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Export started');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export logs');
    }
  };

  const clearAllFilters = () => {
    setFilters({
      entityType: 'all',
      action: 'all',
      startDate: '',
      endDate: '',
      userId: 'all'
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, skip: 0, page: 1 }));
    setTimeout(() => fetchLogs(), 100);
  };

  // ✅ Ensure logs is an array before rendering
  const logsArray = Array.isArray(logs) ? logs : [];

  if (loading && logsArray.length === 0) {
    return (
      <div className="al-loading">
        <div className="al-loading-spinner"></div>
        <p className="al-loading-text">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <>
      <div className="al-container">
        {/* Header */}
        <div className="al-header">
          <div className="al-header-left">
            <h1 className="al-title">
              <Activity className="al-title-icon" />
              Audit Log
            </h1>
            <p className="al-subtitle">Complete audit trail of all system activities</p>
          </div>
          <div className="al-header-right">
            <button 
              onClick={handleExport}
              className="al-export-btn"
            >
              <Download className="al-export-icon" />
              Export
            </button>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="al-refresh-btn"
            >
              <RefreshCw className={`al-refresh-icon ${refreshing ? 'al-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="al-filters">
          <div className="al-search-wrap">
            <form onSubmit={handleSearchSubmit} className="al-search-form">
              <Search className="al-search-icon" />
              <input
                type="text"
                placeholder="Search by user, action, entity..."
                value={searchTerm}
                onChange={handleSearch}
                className="al-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setPagination(prev => ({ ...prev, skip: 0, page: 1 }));
                    fetchLogs();
                  }}
                  className="al-search-clear"
                >
                  <XCircle className="al-search-clear-icon" />
                </button>
              )}
              <button type="submit" className="al-search-btn">
                Search
              </button>
            </form>
          </div>

          <div className="al-filter-grid">
            <div className="al-filter-group">
              <label className="al-filter-label">Entity Type</label>
              <select
                value={filters.entityType}
                onChange={(e) => handleFilterChange('entityType', e.target.value)}
                className="al-filter-select"
              >
                <option value="all">All Types</option>
                <option value="user">Users</option>
                <option value="lead">Leads</option>
                <option value="client">Clients</option>
                <option value="project">Projects</option>
                <option value="task">Tasks</option>
                <option value="goal">Goals</option>
                <option value="segment">Segments</option>
                <option value="department">Departments</option>
                <option value="team">Teams</option>
                <option value="workflow">Workflows</option>
              </select>
            </div>

            <div className="al-filter-group">
              <label className="al-filter-label">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="al-filter-select"
              >
                <option value="all">All Actions</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>

            <div className="al-filter-group">
              <label className="al-filter-label">From</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="al-filter-input"
              />
            </div>

            <div className="al-filter-group">
              <label className="al-filter-label">To</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="al-filter-input"
              />
            </div>

            <div className="al-filter-actions">
              <button
                onClick={clearAllFilters}
                className="al-clear-filters-btn"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="al-stats">
          <div className="al-stat">
            <span className="al-stat-label">Total Records:</span>
            <span className="al-stat-value">{pagination.total || logsArray.length}</span>
          </div>
          <div className="al-stat">
            <span className="al-stat-label">Page:</span>
            <span className="al-stat-value">{pagination.page} of {pagination.totalPages || 1}</span>
          </div>
          <div className="al-stat">
            <span className="al-stat-label">Showing:</span>
            <span className="al-stat-value">
              {logsArray.length > 0 ? `${pagination.skip + 1} - ${pagination.skip + logsArray.length}` : '0'}
            </span>
          </div>
        </div>

        {/* Audit Log List */}
        <div className="al-list">
          {logsArray.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty-icon-wrapper">
                <Clock className="al-empty-icon" />
              </div>
              <h3 className="al-empty-title">No Audit Logs Found</h3>
              <p className="al-empty-subtitle">
                {searchTerm || filters.entityType !== 'all' || filters.action !== 'all' || filters.startDate || filters.endDate
                  ? 'Try adjusting your filters or search term'
                  : 'System activities will appear here'}
              </p>
              {(searchTerm || filters.entityType !== 'all' || filters.action !== 'all' || filters.startDate || filters.endDate) && (
                <button onClick={clearAllFilters} className="al-empty-btn">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            logsArray.map((log, index) => {
              const userName = log.userId?.firstName || log.userName || 'System';
              const userLastName = log.userId?.lastName || '';
              const fullName = userLastName ? `${userName} ${userLastName}` : userName;
              
              return (
                <div key={log._id || index} className="al-item">
                  <div className="al-item-icon">
                    {getEntityIcon(log.entityType)}
                  </div>
                  <div className="al-item-content">
                    <div className="al-item-header">
                      <span className="al-item-user">{fullName}</span>
                      <span className={`al-item-action ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                      <span className="al-item-entity">{log.entityType}</span>
                      <span className="al-item-time">{getTimeAgo(log.createdAt)}</span>
                    </div>
                    <p className="al-item-description">
                      {log.entityName || log.description || `${log.action} on ${log.entityType}`}
                    </p>
                    {log.changes && log.changes.length > 0 && (
                      <div className="al-item-changes">
                        {log.changes.map((change, idx) => (
                          <div key={idx} className="al-change">
                            <span className="al-change-field">{change.field}:</span>
                            <span className="al-change-old">{String(change.oldValue ?? 'null')}</span>
                            <span className="al-change-arrow">→</span>
                            <span className="al-change-new">{String(change.newValue ?? 'null')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="al-item-meta">
                      <span className="al-meta-item">
                        <Calendar className="al-meta-icon" />
                        {formatDate(log.createdAt)}
                      </span>
                      {log.ip && (
                        <span className="al-meta-item">
                          <Activity className="al-meta-icon" />
                          IP: {log.ip}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="al-item-action-btn" title="View Details">
                    <Eye className="al-item-action-icon" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="al-pagination">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="al-page-btn"
            >
              <ChevronLeft className="al-page-icon" />
              Previous
            </button>
            <div className="al-page-numbers">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`al-page-num ${pagination.page === pageNum ? 'al-page-active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="al-page-btn"
            >
              Next
              <ChevronRight className="al-page-icon" />
            </button>
          </div>
        )}
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .al-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           HEADER
           ============================================ */
        .al-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .al-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .al-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .al-title-icon {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }

        .al-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .al-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .al-export-btn {
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

        .al-export-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .al-export-icon {
          width: 16px;
          height: 16px;
        }

        .al-refresh-btn {
          padding: 8px 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .al-refresh-btn:hover:not(:disabled) {
          background: #f9fafb;
        }

        .al-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .al-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .al-spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           SEARCH & FILTERS
           ============================================ */
        .al-filters {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 20px;
        }

        .al-search-wrap {
          margin-bottom: 16px;
        }

        .al-search-form {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .al-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        .al-search-input {
          flex: 1;
          padding: 8px 40px 8px 36px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
        }

        .al-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .al-search-clear {
          position: absolute;
          right: 100px;
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

        .al-search-clear:hover {
          color: #6b7280;
        }

        .al-search-clear-icon {
          width: 16px;
          height: 16px;
        }

        .al-search-btn {
          padding: 8px 20px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .al-search-btn:hover {
          background: #2563eb;
        }

        .al-filter-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr auto;
          gap: 12px;
          align-items: end;
        }

        @media (max-width: 1024px) {
          .al-filter-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .al-filter-grid {
            grid-template-columns: 1fr;
          }
        }

        .al-filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .al-filter-label {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .al-filter-select,
        .al-filter-input {
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          width: 100%;
        }

        .al-filter-select:focus,
        .al-filter-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .al-filter-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .al-clear-filters-btn {
          padding: 6px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: transparent;
          color: #6b7280;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .al-clear-filters-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        /* ============================================
           STATS
           ============================================ */
        .al-stats {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .al-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }

        .al-stat-label {
          color: #6b7280;
        }

        .al-stat-value {
          font-weight: 600;
          color: #111827;
        }

        /* ============================================
           LIST
           ============================================ */
        .al-list {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          overflow: hidden;
        }

        .al-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          transition: all 0.2s ease;
        }

        .al-item:last-child {
          border-bottom: none;
        }

        .al-item:hover {
          background: #f9fafb;
        }

        .al-item-icon {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .al-entity-icon {
          width: 18px;
          height: 18px;
          color: #3b82f6;
        }

        .al-item-content {
          flex: 1;
          min-width: 0;
        }

        .al-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .al-item-user {
          font-weight: 600;
          color: #111827;
          font-size: 14px;
        }

        .al-item-action {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .al-action-created { background: #dcfce7; color: #16a34a; }
        .al-action-updated { background: #dbeafe; color: #1d4ed8; }
        .al-action-deleted { background: #fee2e2; color: #dc2626; }
        .al-action-approved { background: #d1fae5; color: #059669; }
        .al-action-rejected { background: #fef3c7; color: #d97706; }
        .al-action-login { background: #e0e7ff; color: #4f46e5; }
        .al-action-logout { background: #f3f4f6; color: #6b7280; }
        .al-action-default { background: #f3f4f6; color: #6b7280; }

        .al-item-entity {
          font-size: 12px;
          color: #6b7280;
          text-transform: capitalize;
        }

        .al-item-time {
          font-size: 12px;
          color: #9ca3af;
          margin-left: auto;
        }

        .al-item-description {
          font-size: 14px;
          color: #4b5563;
          margin: 4px 0 0 0;
        }

        .al-item-changes {
          margin-top: 6px;
          padding: 8px 12px;
          background: #f9fafb;
          border-radius: 6px;
          border: 1px solid #f3f4f6;
        }

        .al-change {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-family: monospace;
        }

        .al-change-field {
          font-weight: 600;
          color: #374151;
        }

        .al-change-old {
          color: #ef4444;
          text-decoration: line-through;
        }

        .al-change-arrow {
          color: #9ca3af;
        }

        .al-change-new {
          color: #22c55e;
        }

        .al-item-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .al-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #9ca3af;
        }

        .al-meta-icon {
          width: 12px;
          height: 12px;
        }

        .al-item-action-btn {
          padding: 4px 6px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #9ca3af;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .al-item-action-btn:hover {
          background: #f3f4f6;
          color: #4b5563;
        }

        .al-item-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .al-empty {
          padding: 48px 24px;
          text-align: center;
        }

        .al-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .al-empty-icon {
          width: 40px;
          height: 40px;
          color: #9ca3af;
        }

        .al-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .al-empty-subtitle {
          color: #6b7280;
          margin-top: 4px;
        }

        .al-empty-btn {
          margin-top: 16px;
          padding: 8px 24px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .al-empty-btn:hover {
          background: #2563eb;
        }

        /* ============================================
           PAGINATION
           ============================================ */
        .al-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 20px;
          border-top: 1px solid #f3f4f6;
          background: #ffffff;
          border-radius: 0 0 12px 12px;
        }

        .al-page-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 14px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #ffffff;
          color: #4b5563;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .al-page-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .al-page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .al-page-icon {
          width: 14px;
          height: 14px;
        }

        .al-page-numbers {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .al-page-num {
          width: 32px;
          height: 32px;
          border: 1px solid transparent;
          border-radius: 6px;
          background: transparent;
          color: #4b5563;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .al-page-num:hover {
          background: #f3f4f6;
        }

        .al-page-active {
          background: #3b82f6;
          color: #ffffff;
          border-color: #3b82f6;
        }

        .al-page-active:hover {
          background: #2563eb;
        }

        /* ============================================
           LOADING
           ============================================ */
        .al-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .al-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .al-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .al-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .al-header-right {
            width: 100%;
          }

          .al-filter-grid {
            grid-template-columns: 1fr 1fr;
          }

          .al-item {
            flex-wrap: wrap;
          }

          .al-item-header {
            gap: 4px;
          }

          .al-item-time {
            margin-left: 0;
            width: 100%;
          }

          .al-pagination {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .al-filter-grid {
            grid-template-columns: 1fr;
          }

          .al-search-form {
            flex-wrap: wrap;
          }

          .al-search-input {
            width: 100%;
          }

          .al-search-btn {
            width: 100%;
          }

          .al-search-clear {
            right: 12px;
          }

          .al-item-changes {
            overflow-x: auto;
          }

          .al-page-numbers {
            gap: 2px;
          }

          .al-page-num {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default AuditLog;