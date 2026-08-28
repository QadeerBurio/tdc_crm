// pages/audit/AuditLog.jsx - COMPLETE MODERN VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Search, Filter, Eye, Download,
  ChevronDown, ChevronRight, Clock, User,
  Plus, Edit, Trash2, CheckCircle, XCircle,
  LogIn, LogOut, Activity, RefreshCw,
  AlertCircle, Users, Building2, Briefcase,
  Calendar, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const AuditLog = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    entityType: 'all',
    action: 'all',
    importance: 'all',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    skip: 0,
    hasMore: false
  });
  const [expanded, setExpanded] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    fetchLogs();
  }, [search, filters, pagination.skip]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.entityType !== 'all') params.append('entityType', filters.entityType);
      if (filters.action !== 'all') params.append('action', filters.action);
      if (filters.importance !== 'all') params.append('importance', filters.importance);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('limit', pagination.limit);
      params.append('skip', pagination.skip);
      
      const response = await fetch(`${API_URL}/audit?${params.toString()}`, getHeaders());
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        setLogs(Array.isArray(data) ? data : []);
        setPagination(prev => ({
          ...prev,
          total: result.pagination?.total || 0,
          hasMore: result.pagination?.hasMore || false
        }));
      } else {
        // Use mock data
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
        actionType: 'login',
        description: 'User logged in successfully',
        userName: 'John Doe',
        userId: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        userRole: 'admin',
        userEmail: 'john@example.com',
        entityName: 'John Doe',
        entityId: 'user_123',
        importance: 'medium',
        status: 'success',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        changes: []
      },
      {
        _id: '2',
        entityType: 'project',
        action: 'created',
        actionType: 'create',
        description: 'New project created',
        userName: 'Sarah Smith',
        userId: { firstName: 'Sarah', lastName: 'Smith', email: 'sarah@example.com' },
        userRole: 'manager',
        userEmail: 'sarah@example.com',
        entityName: 'Website Redesign',
        entityId: 'project_456',
        importance: 'high',
        status: 'success',
        ipAddress: '192.168.1.2',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        changes: [
          { field: 'name', oldValue: undefined, newValue: 'Website Redesign', changeType: 'create' },
          { field: 'priority', oldValue: undefined, newValue: 'high', changeType: 'create' }
        ]
      },
      {
        _id: '3',
        entityType: 'task',
        action: 'updated',
        actionType: 'update',
        description: 'Task status updated',
        userName: 'Mike Johnson',
        userId: { firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com' },
        userRole: 'employee',
        userEmail: 'mike@example.com',
        entityName: 'Design Homepage',
        entityId: 'task_789',
        importance: 'medium',
        status: 'success',
        ipAddress: '192.168.1.3',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        changes: [
          { field: 'status', oldValue: 'in-progress', newValue: 'completed', changeType: 'update' }
        ]
      },
      {
        _id: '4',
        entityType: 'client',
        action: 'deleted',
        actionType: 'delete',
        description: 'Client account deleted',
        userName: 'Emily Davis',
        userId: { firstName: 'Emily', lastName: 'Davis', email: 'emily@example.com' },
        userRole: 'admin',
        userEmail: 'emily@example.com',
        entityName: 'Acme Corp',
        entityId: 'client_101',
        importance: 'critical',
        status: 'failure',
        ipAddress: '192.168.1.4',
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        changes: [
          { field: 'status', oldValue: 'active', newValue: 'deleted', changeType: 'delete' }
        ]
      },
      {
        _id: '5',
        entityType: 'goal',
        action: 'approved',
        actionType: 'approve',
        description: 'Goal approved by manager',
        userName: 'Tom Wilson',
        userId: { firstName: 'Tom', lastName: 'Wilson', email: 'tom@example.com' },
        userRole: 'manager',
        userEmail: 'tom@example.com',
        entityName: 'Increase Sales by 20%',
        entityId: 'goal_202',
        importance: 'high',
        status: 'success',
        ipAddress: '192.168.1.5',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        changes: [
          { field: 'status', oldValue: 'pending', newValue: 'approved', changeType: 'update' }
        ]
      }
    ];
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    toast.success('Refreshed');
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const loadMore = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({
        ...prev,
        skip: prev.skip + prev.limit
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      entityType: 'all',
      action: 'all',
      importance: 'all',
      startDate: '',
      endDate: ''
    });
    setSearch('');
    toast.success('Filters cleared');
  };

  const hasActiveFilters = () => {
    return filters.entityType !== 'all' || filters.action !== 'all' || 
           filters.importance !== 'all' || filters.startDate || filters.endDate || search;
  };

  const getEntityIcon = (entityType) => {
    const icons = {
      'user': User,
      'lead': Briefcase,
      'client': Building2,
      'project': FileText,
      'task': CheckCircle,
      'goal': Activity,
      'kpi': Activity,
      'risk': AlertCircle,
      'team': Users,
      'department': Building2,
      'segment': Building2,
      'company': Building2,
      'report': FileText,
      'schedule': Calendar
    };
    const Icon = icons[entityType] || Activity;
    return <Icon className="al-entity-icon" />;
  };

  const getEntityColor = (entityType) => {
    const colors = {
      'user': '#6b7280',
      'lead': '#3b82f6',
      'client': '#8b5cf6',
      'project': '#22c55e',
      'task': '#f59e0b',
      'goal': '#ec4899',
      'kpi': '#8b5cf6',
      'risk': '#ef4444',
      'team': '#14b8a6',
      'department': '#3b82f6',
      'segment': '#8b5cf6',
      'company': '#6b7280',
      'report': '#3b82f6',
      'schedule': '#8b5cf6'
    };
    return colors[entityType] || '#6b7280';
  };

  const getActionColor = (action) => {
    if (action === 'create' || action === 'created') return 'al-action-created';
    if (action === 'update' || action === 'updated') return 'al-action-updated';
    if (action === 'delete' || action === 'deleted') return 'al-action-deleted';
    if (action === 'login') return 'al-action-login';
    if (action === 'logout') return 'al-action-logout';
    if (action === 'approve' || action === 'approved') return 'al-action-approved';
    if (action === 'reject' || action === 'rejected') return 'al-action-rejected';
    if (action === 'complete' || action === 'completed') return 'al-action-completed';
    return 'al-action-default';
  };

  const getActionIcon = (actionType) => {
    const icons = {
      'create': Plus,
      'update': Edit,
      'delete': Trash2,
      'login': LogIn,
      'logout': LogOut,
      'approve': CheckCircle,
      'reject': XCircle,
      'complete': CheckCircle
    };
    const Icon = icons[actionType] || Activity;
    return <Icon className="al-action-icon" />;
  };

  const getImportanceColor = (importance) => {
    const colors = {
      'low': 'al-importance-low',
      'medium': 'al-importance-medium',
      'high': 'al-importance-high',
      'critical': 'al-importance-critical'
    };
    return colors[importance] || 'al-importance-default';
  };

  const getStatusColor = (status) => {
    const colors = {
      'success': 'al-status-success',
      'failure': 'al-status-failure',
      'pending': 'al-status-pending'
    };
    return colors[status] || 'al-status-default';
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
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const entityTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'user', label: 'Users' },
    { value: 'lead', label: 'Leads' },
    { value: 'client', label: 'Clients' },
    { value: 'project', label: 'Projects' },
    { value: 'task', label: 'Tasks' },
    { value: 'goal', label: 'Goals' },
    { value: 'kpi', label: 'KPIs' },
    { value: 'risk', label: 'Risks' },
    { value: 'team', label: 'Teams' },
    { value: 'department', label: 'Departments' },
    { value: 'report', label: 'Reports' },
    { value: 'schedule', label: 'Schedules' }
  ];

  const actions = [
    { value: 'all', label: 'All Actions' },
    { value: 'create', label: 'Created' },
    { value: 'update', label: 'Updated' },
    { value: 'delete', label: 'Deleted' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'approve', label: 'Approved' },
    { value: 'reject', label: 'Rejected' },
    { value: 'complete', label: 'Completed' }
  ];

  const importanceLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  if (loading && logs.length === 0) {
    return (
      <div className="al-loading">
        <div className="al-spinner"></div>
        <p className="al-loading-text">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="al-container">
      {/* Header */}
      <div className="al-header">
        <div className="al-header-left">
          <h1 className="al-title">
            <FileText className="al-title-icon" />
            Audit Log
          </h1>
          <p className="al-subtitle">Complete audit trail of all system activities</p>
        </div>
        <div className="al-header-right">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="al-refresh-btn"
          >
            <RefreshCw className={`al-refresh-icon ${refreshing ? 'al-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`al-filter-btn ${showFilters ? 'al-filter-active' : ''}`}
          >
            <Filter className="al-filter-icon" />
            {hasActiveFilters() && <span className="al-filter-dot"></span>}
          </button>
          <button className="al-export-btn">
            <Download className="al-btn-icon" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="al-stats">
        <div className="al-stat-card">
          <span className="al-stat-label">Total Logs</span>
          <span className="al-stat-value">{pagination.total || logs.length}</span>
        </div>
        <div className="al-stat-card">
          <span className="al-stat-label">Success</span>
          <span className="al-stat-value al-stat-success">
            {logs.filter(l => l.status === 'success').length}
          </span>
        </div>
        <div className="al-stat-card">
          <span className="al-stat-label">Failures</span>
          <span className="al-stat-value al-stat-failure">
            {logs.filter(l => l.status === 'failure').length}
          </span>
        </div>
        <div className="al-stat-card">
          <span className="al-stat-label">Critical</span>
          <span className="al-stat-value al-stat-critical">
            {logs.filter(l => l.importance === 'critical').length}
          </span>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="al-filters">
          <div className="al-filters-grid">
            <div className="al-filter-group">
              <label className="al-filter-label">Search</label>
              <div className="al-search-wrapper">
                <Search className="al-search-icon" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="al-search-input"
                />
              </div>
            </div>
            <div className="al-filter-group">
              <label className="al-filter-label">Entity Type</label>
              <select
                value={filters.entityType}
                onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                className="al-filter-select"
              >
                {entityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="al-filter-group">
              <label className="al-filter-label">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                className="al-filter-select"
              >
                {actions.map(action => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
            </div>
            <div className="al-filter-group">
              <label className="al-filter-label">Importance</label>
              <select
                value={filters.importance}
                onChange={(e) => setFilters(prev => ({ ...prev, importance: e.target.value }))}
                className="al-filter-select"
              >
                {importanceLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="al-filters-date">
            <div className="al-filter-group">
              <label className="al-filter-label">From Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="al-filter-input"
              />
            </div>
            <div className="al-filter-group">
              <label className="al-filter-label">To Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="al-filter-input"
              />
            </div>
            <div className="al-filter-actions">
              {hasActiveFilters() && (
                <button onClick={clearFilters} className="al-clear-btn">
                  <X className="al-clear-icon" />
                  Clear
                </button>
              )}
              <button onClick={fetchLogs} className="al-apply-btn">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log List */}
      <div className="al-list-container">
        {logs.length === 0 ? (
          <div className="al-empty">
            <div className="al-empty-icon-wrapper">
              <FileText className="al-empty-icon" />
            </div>
            <h3 className="al-empty-title">No audit logs found</h3>
            <p className="al-empty-subtitle">Try adjusting your filters</p>
            {hasActiveFilters() && (
              <button onClick={clearFilters} className="al-empty-btn">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="al-list">
            {logs.map((log) => {
              const isExpanded = expanded[log._id];
              const entityColor = getEntityColor(log.entityType);
              const userName = log.userName || `${log.userId?.firstName || ''} ${log.userId?.lastName || ''}`.trim() || 'System';
              
              return (
                <div key={log._id} className="al-item">
                  <div 
                    className="al-item-main"
                    onClick={() => toggleExpand(log._id)}
                  >
                    <div className="al-item-left">
                      <div className="al-expand-btn">
                        {isExpanded ? (
                          <ChevronDown className="al-expand-icon" />
                        ) : (
                          <ChevronRight className="al-expand-icon" />
                        )}
                      </div>

                      <div className="al-item-icon" style={{ backgroundColor: `${entityColor}15` }}>
                        {getEntityIcon(log.entityType)}
                      </div>

                      <div className="al-item-content">
                        <div className="al-item-header">
                          <span className="al-item-user">{userName}</span>
                          <span className={`al-item-action ${getActionColor(log.action)}`}>
                            {getActionIcon(log.actionType)}
                            {log.action}
                          </span>
                          <span className="al-item-entity" style={{ color: entityColor }}>
                            {log.entityType}
                          </span>
                          {log.importance && (
                            <span className={`al-item-importance ${getImportanceColor(log.importance)}`}>
                              {log.importance}
                            </span>
                          )}
                          {log.status && (
                            <span className={`al-item-status ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                          )}
                          <span className="al-item-time">{getTimeAgo(log.createdAt)}</span>
                        </div>
                        
                        <p className="al-item-description">{log.description || log.entityName}</p>
                        
                        {log.entityName && (
                          <p className="al-item-entity-ref">
                            <FileText className="al-item-entity-icon" />
                            {log.entityName}
                            <span className="al-item-entity-id">({log.entityId})</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="al-item-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="al-item-action-btn al-item-view-btn">
                        <Eye className="al-item-action-icon" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="al-item-details">
                      <div className="al-details-content">
                        <div className="al-details-grid">
                          <div className="al-details-section">
                            <h5 className="al-details-title">Log Details</h5>
                            <div className="al-details-list">
                              <div className="al-details-item">
                                <span className="al-details-label">ID</span>
                                <span className="al-details-value al-details-mono">{log._id}</span>
                              </div>
                              <div className="al-details-item">
                                <span className="al-details-label">Action</span>
                                <span className="al-details-value">{log.action}</span>
                              </div>
                              <div className="al-details-item">
                                <span className="al-details-label">Type</span>
                                <span className="al-details-value">{log.actionType}</span>
                              </div>
                              <div className="al-details-item">
                                <span className="al-details-label">Entity</span>
                                <span className="al-details-value">{log.entityType}</span>
                              </div>
                              <div className="al-details-item">
                                <span className="al-details-label">Entity ID</span>
                                <span className="al-details-value al-details-mono">{log.entityId}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="al-details-section">
                            <h5 className="al-details-title">User Info</h5>
                            <div className="al-details-list">
                              <div className="al-details-item">
                                <span className="al-details-label">User</span>
                                <span className="al-details-value">{userName}</span>
                              </div>
                              <div className="al-details-item">
                                <span className="al-details-label">Email</span>
                                <span className="al-details-value">{log.userEmail || log.userId?.email || 'N/A'}</span>
                              </div>
                              <div className="al-details-item">
                                <span className="al-details-label">Role</span>
                                <span className="al-details-value">{log.userRole || 'N/A'}</span>
                              </div>
                              <div className="al-details-item">
                                <span className="al-details-label">IP Address</span>
                                <span className="al-details-value al-details-mono">{log.ipAddress || 'N/A'}</span>
                              </div>
                              <div className="al-details-item">
                                <span className="al-details-label">Time</span>
                                <span className="al-details-value">{formatDate(log.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Changes */}
                        {log.changes && log.changes.length > 0 && (
                          <div className="al-changes-section">
                            <h5 className="al-details-title">Changes</h5>
                            <div className="al-changes-list">
                              {log.changes.map((change, idx) => (
                                <div key={idx} className="al-change-item">
                                  <span className="al-change-field">{change.field}:</span>
                                  {change.oldValue !== undefined && change.oldValue !== null && (
                                    <span className="al-change-old">{String(change.oldValue)}</span>
                                  )}
                                  {change.oldValue !== undefined && change.oldValue !== null && 
                                   change.newValue !== undefined && change.newValue !== null && (
                                    <span className="al-change-arrow">→</span>
                                  )}
                                  {change.newValue !== undefined && change.newValue !== null && (
                                    <span className="al-change-new">{String(change.newValue)}</span>
                                  )}
                                  {change.changeType && (
                                    <span className={`al-change-type ${
                                      change.changeType === 'create' ? 'al-change-create' :
                                      change.changeType === 'update' ? 'al-change-update' :
                                      'al-change-delete'
                                    }`}>
                                      {change.changeType}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rollback Info */}
                        {log.isRolledBack && (
                          <div className="al-rollback-warning">
                            <AlertCircle className="al-rollback-icon" />
                            <span>
                              This change was rolled back on {formatDate(log.rolledBackAt)} 
                              by {log.rolledBackBy?.firstName} {log.rolledBackBy?.lastName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {pagination.hasMore && (
          <div className="al-load-more">
            <button
              onClick={loadMore}
              disabled={loading}
              className="al-load-more-btn"
            >
              {loading ? 'Loading...' : 'Load More'}
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
           LOADING
           ============================================ */
        .al-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .al-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .al-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
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
          flex-wrap: wrap;
        }

        .al-btn-icon {
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
          background: #f3f4f6;
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

        .al-filter-btn {
          padding: 8px 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .al-filter-btn:hover {
          background: #f3f4f6;
        }

        .al-filter-active {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .al-filter-active .al-filter-icon {
          color: #3b82f6;
        }

        .al-filter-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .al-filter-dot {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          border: 2px solid #ffffff;
        }

        .al-export-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .al-export-btn:hover {
          background: #2563eb;
        }

        /* ============================================
           STATS
           ============================================ */
        .al-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .al-stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
        }

        .al-stat-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .al-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-top: 2px;
        }

        .al-stat-success { color: #22c55e; }
        .al-stat-failure { color: #ef4444; }
        .al-stat-critical { color: #dc2626; }

        /* ============================================
           FILTERS
           ============================================ */
        .al-filters {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 16px;
        }

        .al-filters-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 12px;
          align-items: end;
        }

        @media (max-width: 1024px) {
          .al-filters-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .al-filters-grid {
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

        .al-search-wrapper {
          position: relative;
        }

        .al-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        .al-search-input,
        .al-filter-select,
        .al-filter-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #111827;
        }

        .al-search-input {
          padding-left: 36px;
        }

        .al-search-input:focus,
        .al-filter-select:focus,
        .al-filter-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .al-filters-date {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 12px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          align-items: end;
        }

        @media (max-width: 640px) {
          .al-filters-date {
            grid-template-columns: 1fr;
          }
        }

        .al-filter-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .al-clear-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: transparent;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .al-clear-btn:hover {
          background: #f3f4f6;
        }

        .al-clear-icon {
          width: 14px;
          height: 14px;
        }

        .al-apply-btn {
          padding: 8px 20px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .al-apply-btn:hover {
          background: #2563eb;
        }

        /* ============================================
           LIST
           ============================================ */
        .al-list-container {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .al-list {
          max-height: 600px;
          overflow-y: auto;
        }

        .al-item {
          border-bottom: 1px solid #f3f4f6;
          transition: all 0.2s ease;
        }

        .al-item:last-child {
          border-bottom: none;
        }

        .al-item:hover {
          background: #f9fafb;
        }

        .al-item-main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 14px 20px;
          cursor: pointer;
          gap: 12px;
        }

        .al-item-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .al-expand-btn {
          margin-top: 4px;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .al-expand-btn:hover {
          background: #f3f4f6;
        }

        .al-expand-icon {
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        .al-item-icon {
          width: 40px;
          height: 40px;
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
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .al-action-icon {
          width: 12px;
          height: 12px;
        }

        .al-action-created { background: #dcfce7; color: #16a34a; }
        .al-action-updated { background: #dbeafe; color: #1d4ed8; }
        .al-action-deleted { background: #fee2e2; color: #dc2626; }
        .al-action-completed { background: #d1fae5; color: #059669; }
        .al-action-approved { background: #dbeafe; color: #1d4ed8; }
        .al-action-rejected { background: #fef3c7; color: #d97706; }
        .al-action-login { background: #ede9fe; color: #7c3aed; }
        .al-action-logout { background: #f3f4f6; color: #6b7280; }
        .al-action-default { background: #f3f4f6; color: #6b7280; }

        .al-item-entity {
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .al-item-importance {
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .al-importance-low { background: #f3f4f6; color: #6b7280; }
        .al-importance-medium { background: #dbeafe; color: #1d4ed8; }
        .al-importance-high { background: #fef3c7; color: #d97706; }
        .al-importance-critical { background: #fee2e2; color: #dc2626; }
        .al-importance-default { background: #f3f4f6; color: #6b7280; }

        .al-item-status {
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .al-status-success { background: #dcfce7; color: #16a34a; }
        .al-status-failure { background: #fee2e2; color: #dc2626; }
        .al-status-pending { background: #fef3c7; color: #d97706; }
        .al-status-default { background: #f3f4f6; color: #6b7280; }

        .al-item-time {
          font-size: 12px;
          color: #9ca3af;
        }

        .al-item-description {
          font-size: 14px;
          color: #4b5563;
          margin: 4px 0 0 0;
        }

        .al-item-entity-ref {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
          padding: 2px 8px;
          background: #f3f4f6;
          border-radius: 4px;
        }

        .al-item-entity-icon {
          width: 12px;
          height: 12px;
        }

        .al-item-entity-id {
          color: #9ca3af;
        }

        .al-item-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .al-item-action-btn {
          padding: 6px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }

        .al-item-action-btn:hover {
          background: #f3f4f6;
          color: #4b5563;
        }

        .al-item-view-btn:hover {
          background: #eff6ff;
          color: #3b82f6;
        }

        .al-item-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           DETAILS
           ============================================ */
        .al-item-details {
          padding: 0 20px 16px 20px;
        }

        .al-details-content {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e5e7eb;
        }

        .al-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 640px) {
          .al-details-grid {
            grid-template-columns: 1fr;
          }
        }

        .al-details-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .al-details-title {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .al-details-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .al-details-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 8px;
          background: #ffffff;
          border-radius: 4px;
          font-size: 13px;
        }

        .al-details-label {
          color: #6b7280;
          font-weight: 500;
        }

        .al-details-value {
          color: #111827;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }

        .al-details-mono {
          font-family: monospace;
          font-size: 12px;
        }

        /* ============================================
           CHANGES
           ============================================ */
        .al-changes-section {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .al-changes-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 4px;
        }

        .al-change-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: #ffffff;
          border-radius: 4px;
          font-size: 13px;
          flex-wrap: wrap;
        }

        .al-change-field {
          font-weight: 600;
          color: #111827;
        }

        .al-change-old {
          color: #dc2626;
          text-decoration: line-through;
        }

        .al-change-new {
          color: #16a34a;
          font-weight: 500;
        }

        .al-change-arrow {
          color: #9ca3af;
        }

        .al-change-type {
          padding: 1px 8px;
          font-size: 10px;
          font-weight: 500;
          border-radius: 9999px;
          margin-left: auto;
        }

        .al-change-create { background: #dcfce7; color: #16a34a; }
        .al-change-update { background: #dbeafe; color: #1d4ed8; }
        .al-change-delete { background: #fee2e2; color: #dc2626; }

        /* ============================================
           ROLLBACK
           ============================================ */
        .al-rollback-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 8px 12px;
          background: #fef3c7;
          border-radius: 4px;
          border: 1px solid #fcd34d;
          font-size: 13px;
          color: #92400e;
        }

        .al-rollback-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: #d97706;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .al-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
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
          margin-bottom: 16px;
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
           LOAD MORE
           ============================================ */
        .al-load-more {
          padding: 12px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }

        .al-load-more-btn {
          padding: 8px 24px;
          background: transparent;
          color: #3b82f6;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .al-load-more-btn:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .al-load-more-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

          .al-stats {
            grid-template-columns: 1fr 1fr;
          }

          .al-item-main {
            flex-direction: column;
          }

          .al-item-left {
            width: 100%;
          }

          .al-item-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .al-details-item {
            flex-direction: column;
            gap: 2px;
          }

          .al-details-value {
            text-align: left;
            max-width: 100%;
          }

          .al-change-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .al-change-type {
            margin-left: 0;
          }
        }

        @media (max-width: 480px) {
          .al-stats {
            grid-template-columns: 1fr;
          }

          .al-filters-grid {
            grid-template-columns: 1fr;
          }

          .al-filters-date {
            grid-template-columns: 1fr;
          }

          .al-filter-actions {
            flex-direction: column;
            width: 100%;
          }

          .al-clear-btn,
          .al-apply-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AuditLog;