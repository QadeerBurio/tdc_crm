// pages/activity/ActivitySearch.jsx - MODERN DESIGN WITH #013E37, #FFEFB3, WHITE
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search, Filter, Calendar, Users, 
  FileText, X, Eye, Download, RefreshCw,
  Clock, Activity, AlertCircle, CheckCircle,
  ChevronDown, ChevronRight, User, Briefcase,
  Building2, Target, MessageSquare, MoreVertical,
  Plus, Edit, Trash2, LogIn, LogOut, XCircle,
  Sparkles, Zap, Award, Crown, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const ActivitySearch = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    userId: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [expanded, setExpanded] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchUsers();
    handleSearch();
  }, []);

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, getHeaders());
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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
      params.append('limit', 100);
      
      const response = await fetch(`${API_URL}/audit?${params.toString()}`, getHeaders());
      
      if (response.ok) {
        const result = await response.json();
        setLogs(result.data || []);
        setTotal(result.pagination?.total || 0);
      } else {
        setLogs(getMockLogs());
        setTotal(getMockLogs().length);
        toast.info('Showing sample data');
      }
    } catch (error) {
      console.error('Error searching audit:', error);
      setLogs(getMockLogs());
      setTotal(getMockLogs().length);
      toast.error('Failed to fetch logs, showing sample data');
    } finally {
      setLoading(false);
    }
  };

  const getMockLogs = () => {
    return [
      {
        _id: '1',
        entityType: 'user',
        action: 'login',
        actionType: 'login',
        description: 'User logged in to the system',
        userName: 'John Doe',
        userId: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        userRole: 'admin',
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
        description: 'New project "Website Redesign" was created',
        userName: 'Sarah Smith',
        userId: { firstName: 'Sarah', lastName: 'Smith', email: 'sarah@example.com' },
        userRole: 'manager',
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
        action: 'completed',
        actionType: 'update',
        description: 'Task "Design Homepage" was completed',
        userName: 'Mike Johnson',
        userId: { firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com' },
        userRole: 'employee',
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
        action: 'updated',
        actionType: 'update',
        description: 'Client "Acme Corp" contact information updated',
        userName: 'Emily Davis',
        userId: { firstName: 'Emily', lastName: 'Davis', email: 'emily@example.com' },
        userRole: 'admin',
        entityName: 'Acme Corp',
        entityId: 'client_101',
        importance: 'high',
        status: 'success',
        ipAddress: '192.168.1.4',
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        changes: [
          { field: 'email', oldValue: 'old@acme.com', newValue: 'new@acme.com', changeType: 'update' },
          { field: 'phone', oldValue: '555-1234', newValue: '555-5678', changeType: 'update' }
        ]
      },
      {
        _id: '5',
        entityType: 'goal',
        action: 'deleted',
        actionType: 'delete',
        description: 'Goal "Increase Sales by 20%" was deleted',
        userName: 'Tom Wilson',
        userId: { firstName: 'Tom', lastName: 'Wilson', email: 'tom@example.com' },
        userRole: 'manager',
        entityName: 'Increase Sales by 20%',
        entityId: 'goal_202',
        importance: 'critical',
        status: 'failure',
        ipAddress: '192.168.1.5',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        changes: []
      }
    ];
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
    setTotal(0);
    toast.success('Filters cleared');
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await handleSearch();
    setRefreshing(false);
    toast.success('Refreshed');
  };

  const getEntityIcon = (entityType) => {
    const icons = {
      'user': User,
      'lead': Briefcase,
      'client': Building2,
      'project': FileText,
      'task': CheckCircle,
      'goal': Target,
      'kpi': Activity,
      'risk': AlertCircle,
      'team': Users,
      'comment': MessageSquare,
      'activity': Activity,
      'report': FileText,
      'schedule': Calendar
    };
    const Icon = icons[entityType] || Activity;
    return <Icon className="as-entity-icon" />;
  };

  const getEntityColor = (entityType) => {
    const colors = {
      'user': '#013E37',
      'lead': '#013E37',
      'client': '#0A5C54',
      'project': '#013E37',
      'task': '#013E37',
      'goal': '#013E37',
      'kpi': '#013E37',
      'risk': '#D32F2F',
      'team': '#013E37',
      'comment': '#013E37',
      'activity': '#013E37',
      'report': '#013E37',
      'schedule': '#013E37'
    };
    return colors[entityType] || '#013E37';
  };

  const getActionColor = (action) => {
    if (action?.includes('created') || action === 'create') return 'as-action-created';
    if (action?.includes('updated') || action === 'update' || action?.includes('changed')) return 'as-action-updated';
    if (action?.includes('deleted') || action === 'delete' || action?.includes('removed')) return 'as-action-deleted';
    if (action?.includes('completed') || action === 'complete') return 'as-action-completed';
    if (action?.includes('approved') || action === 'approve') return 'as-action-approved';
    if (action?.includes('rejected') || action === 'reject' || action?.includes('failed')) return 'as-action-rejected';
    if (action?.includes('login')) return 'as-action-login';
    if (action?.includes('logout')) return 'as-action-logout';
    return 'as-action-default';
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
      'completed': CheckCircle
    };
    const Icon = icons[actionType] || Activity;
    return <Icon className="as-action-icon" />;
  };

  const getImportanceBadge = (importance) => {
    const colors = {
      'low': 'as-importance-low',
      'medium': 'as-importance-medium',
      'high': 'as-importance-high',
      'critical': 'as-importance-critical'
    };
    return colors[importance] || 'as-importance-default';
  };

  const getStatusBadge = (status) => {
    const colors = {
      'success': 'as-status-success',
      'failure': 'as-status-failure',
      'pending': 'as-status-pending'
    };
    return colors[status] || 'as-status-default';
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

  const entityTypes = [
    { value: '', label: 'All Types' },
    { value: 'user', label: 'Users' },
    { value: 'lead', label: 'Leads' },
    { value: 'client', label: 'Clients' },
    { value: 'project', label: 'Projects' },
    { value: 'task', label: 'Tasks' },
    { value: 'goal', label: 'Goals' },
    { value: 'kpi', label: 'KPIs' },
    { value: 'risk', label: 'Risks' },
    { value: 'team', label: 'Teams' },
    { value: 'report', label: 'Reports' },
    { value: 'schedule', label: 'Schedules' }
  ];

  const actions = [
    { value: '', label: 'All Actions' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' },
    { value: 'completed', label: 'Completed' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'generated', label: 'Generated' },
    { value: 'exported', label: 'Exported' }
  ];

  const hasActiveFilters = () => {
    return filters.entityType || filters.action || filters.userId || 
           filters.startDate || filters.endDate || filters.search;
  };

  return (
    <div className="as-container">
      {/* Header */}
      <div className="as-header">
        <div className="as-header-left">
          <h1 className="as-title">
            <Search className="as-title-icon" color="#013E37" />
            Activity Search
          </h1>
          <p className="as-subtitle">Search and filter audit logs across the organization</p>
        </div>
        <div className="as-header-right">
          <button 
            onClick={clearFilters}
            className="as-clear-btn"
          >
            <X className="as-btn-icon" />
            Clear All
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="as-refresh-btn"
          >
            <RefreshCw className={`as-refresh-icon ${refreshing ? 'as-spin' : ''}`} />
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="as-search-btn"
          >
            {loading ? (
              <div className="as-spinner-small" />
            ) : (
              <Search className="as-btn-icon" />
            )}
            Search
          </button>
        </div>
      </div>

      {/* Search Form */}
      <div className="as-search-form">
        <div className="as-search-grid">
          <div className="as-search-group">
            <label className="as-search-label">Search Query</label>
            <div className="as-search-input-wrapper">
              <Search className="as-search-input-icon" color="#013E37" />
              <input
                type="text"
                placeholder="Search in logs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="as-search-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div className="as-search-group">
            <label className="as-search-label">Entity Type</label>
            <select
              value={filters.entityType}
              onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
              className="as-search-select"
            >
              {entityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="as-search-group">
            <label className="as-search-label">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="as-search-select"
            >
              {actions.map(action => (
                <option key={action.value} value={action.value}>{action.label}</option>
              ))}
            </select>
          </div>

          <div className="as-search-group">
            <label className="as-search-label">User</label>
            <select
              value={filters.userId}
              onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
              className="as-search-select"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="as-search-group">
            <label className="as-search-label">From Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="as-search-input"
            />
          </div>

          <div className="as-search-group">
            <label className="as-search-label">To Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="as-search-input"
            />
          </div>
        </div>

        {hasActiveFilters() && (
          <div className="as-active-filters">
            <span className="as-active-filters-label">Active filters:</span>
            {filters.entityType && (
              <span className="as-filter-tag">
                {entityTypes.find(t => t.value === filters.entityType)?.label || filters.entityType}
                <button onClick={() => setFilters(prev => ({ ...prev, entityType: '' }))}>
                  <X className="as-filter-tag-icon" />
                </button>
              </span>
            )}
            {filters.action && (
              <span className="as-filter-tag">
                {actions.find(t => t.value === filters.action)?.label || filters.action}
                <button onClick={() => setFilters(prev => ({ ...prev, action: '' }))}>
                  <X className="as-filter-tag-icon" />
                </button>
              </span>
            )}
            {filters.userId && (
              <span className="as-filter-tag">
                {users.find(u => u._id === filters.userId)?.firstName || 'User'}
                <button onClick={() => setFilters(prev => ({ ...prev, userId: '' }))}>
                  <X className="as-filter-tag-icon" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      {logs.length > 0 && (
        <div className="as-results-header">
          <p className="as-results-count">
            Found <span className="as-results-count-number">{total}</span> results
          </p>
          <button className="as-export-btn">
            <Download className="as-btn-icon" />
            Export Results
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="as-loading-state">
          <div className="as-loading-spinner"></div>
          <p className="as-loading-text">Searching...</p>
        </div>
      ) : logs.length > 0 ? (
        <div className="as-results-container">
          <div className="as-results-list">
            {logs.map((log, index) => {
              const isExpanded = expanded[log._id];
              const entityColor = getEntityColor(log.entityType);
              const userName = log.userName || `${log.userId?.firstName || ''} ${log.userId?.lastName || ''}`.trim() || 'System';
              const userEmail = log.userEmail || log.userId?.email || '';
              const isHovered = hoveredItem === log._id;
              
              return (
                <div 
                  key={log._id} 
                  className="as-log-item"
                  style={{ animationDelay: `${index * 0.03}s` }}
                  onMouseEnter={() => setHoveredItem(log._id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div 
                    className="as-log-item-main"
                    onClick={() => toggleExpand(log._id)}
                  >
                    <div className="as-log-item-left">
                      <div className="as-log-expand">
                        {isExpanded ? (
                          <ChevronDown className="as-log-expand-icon" />
                        ) : (
                          <ChevronRight className="as-log-expand-icon" />
                        )}
                      </div>

                      <div className="as-log-icon" style={{ backgroundColor: `${entityColor}15` }}>
                        {getEntityIcon(log.entityType)}
                      </div>

                      <div className="as-log-content">
                        <div className="as-log-header">
                          <span className="as-log-user">{userName}</span>
                          <span className={`as-log-action ${getActionColor(log.action)}`}>
                            {getActionIcon(log.actionType)}
                            {log.action}
                          </span>
                          <span className="as-log-entity" style={{ color: entityColor }}>
                            {log.entityType}
                          </span>
                          {log.importance && (
                            <span className={`as-log-importance ${getImportanceBadge(log.importance)}`}>
                              {log.importance}
                            </span>
                          )}
                          {log.status && (
                            <span className={`as-log-status ${getStatusBadge(log.status)}`}>
                              {log.status}
                            </span>
                          )}
                          <span className="as-log-time">{getTimeAgo(log.createdAt)}</span>
                        </div>
                        
                        <p className="as-log-description">{log.description || log.entityName || 'No description'}</p>
                        
                        {log.entityName && (
                          <p className="as-log-entity-ref">
                            <FileText className="as-log-entity-icon" />
                            {log.entityName}
                            <span className="as-log-entity-id">({log.entityId})</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="as-log-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="as-log-action-btn as-log-action-view"
                        onClick={() => {
                          setSelectedLog(log);
                          setShowDetails(true);
                        }}
                        title="View Details"
                      >
                        <Eye className="as-log-action-icon" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="as-log-details">
                      <div className="as-log-details-content">
                        <div className="as-details-grid">
                          <div className="as-details-section">
                            <h5 className="as-details-title">Log Details</h5>
                            <div className="as-details-list">
                              <div className="as-details-item">
                                <span className="as-details-label">ID</span>
                                <span className="as-details-value">{log._id}</span>
                              </div>
                              <div className="as-details-item">
                                <span className="as-details-label">Action</span>
                                <span className="as-details-value">{log.action}</span>
                              </div>
                              <div className="as-details-item">
                                <span className="as-details-label">Type</span>
                                <span className="as-details-value">{log.actionType}</span>
                              </div>
                              <div className="as-details-item">
                                <span className="as-details-label">Entity</span>
                                <span className="as-details-value">{log.entityType}</span>
                              </div>
                              <div className="as-details-item">
                                <span className="as-details-label">Entity ID</span>
                                <span className="as-details-value">{log.entityId}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="as-details-section">
                            <h5 className="as-details-title">User Info</h5>
                            <div className="as-details-list">
                              <div className="as-details-item">
                                <span className="as-details-label">User</span>
                                <span className="as-details-value">{userName}</span>
                              </div>
                              {userEmail && (
                                <div className="as-details-item">
                                  <span className="as-details-label">Email</span>
                                  <span className="as-details-value">{userEmail}</span>
                                </div>
                              )}
                              {log.userRole && (
                                <div className="as-details-item">
                                  <span className="as-details-label">Role</span>
                                  <span className="as-details-value">{log.userRole}</span>
                                </div>
                              )}
                              <div className="as-details-item">
                                <span className="as-details-label">IP Address</span>
                                <span className="as-details-value">{log.ipAddress || 'N/A'}</span>
                              </div>
                              <div className="as-details-item">
                                <span className="as-details-label">Time</span>
                                <span className="as-details-value">{formatDate(log.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Changes */}
                        {log.changes && log.changes.length > 0 && (
                          <div className="as-changes-section">
                            <h5 className="as-details-title">Changes</h5>
                            <div className="as-changes-list">
                              {log.changes.map((change, idx) => (
                                <div key={idx} className="as-change-item">
                                  <span className="as-change-field">{change.field}:</span>
                                  {change.oldValue !== undefined && change.oldValue !== null && (
                                    <span className="as-change-old">{String(change.oldValue)}</span>
                                  )}
                                  {change.oldValue !== undefined && change.oldValue !== null && change.newValue !== undefined && change.newValue !== null && (
                                    <span className="as-change-arrow">→</span>
                                  )}
                                  {change.newValue !== undefined && change.newValue !== null && (
                                    <span className="as-change-new">{String(change.newValue)}</span>
                                  )}
                                  <span className={`as-change-type ${
                                    change.changeType === 'create' ? 'as-change-create' :
                                    change.changeType === 'update' ? 'as-change-update' :
                                    'as-change-delete'
                                  }`}>
                                    {change.changeType}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rollback Info */}
                        {log.isRolledBack && (
                          <div className="as-rollback-warning">
                            <AlertCircle className="as-rollback-icon" />
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
        </div>
      ) : (
        <div className="as-empty-state">
          <div className="as-empty-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
            <Search className="as-empty-icon" color="#013E37" />
          </div>
          <h3 className="as-empty-title">No results found</h3>
          <p className="as-empty-subtitle">
            {hasActiveFilters() ? 'Try adjusting your search filters' : 'Search for activities to see results'}
          </p>
          {hasActiveFilters() && (
            <button onClick={clearFilters} className="as-empty-btn">
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <div className="as-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="as-modal" onClick={(e) => e.stopPropagation()}>
            <div className="as-modal-header">
              <h3 className="as-modal-title">Activity Details</h3>
              <button className="as-modal-close" onClick={() => setShowDetails(false)}>
                <X className="as-modal-close-icon" />
              </button>
            </div>
            <div className="as-modal-body">
              <div className="as-modal-grid">
                <div className="as-modal-section">
                  <h4 className="as-modal-section-title">Basic Information</h4>
                  <div className="as-modal-details">
                    <div className="as-modal-item">
                      <span className="as-modal-label">ID</span>
                      <span className="as-modal-value">{selectedLog._id}</span>
                    </div>
                    <div className="as-modal-item">
                      <span className="as-modal-label">Action</span>
                      <span className="as-modal-value">{selectedLog.action}</span>
                    </div>
                    <div className="as-modal-item">
                      <span className="as-modal-label">Entity</span>
                      <span className="as-modal-value">{selectedLog.entityType}</span>
                    </div>
                    <div className="as-modal-item">
                      <span className="as-modal-label">Description</span>
                      <span className="as-modal-value">{selectedLog.description}</span>
                    </div>
                  </div>
                </div>
                <div className="as-modal-section">
                  <h4 className="as-modal-section-title">User Information</h4>
                  <div className="as-modal-details">
                    <div className="as-modal-item">
                      <span className="as-modal-label">Name</span>
                      <span className="as-modal-value">{selectedLog.userName || 'System'}</span>
                    </div>
                    <div className="as-modal-item">
                      <span className="as-modal-label">Email</span>
                      <span className="as-modal-value">{selectedLog.userEmail || selectedLog.userId?.email || 'N/A'}</span>
                    </div>
                    <div className="as-modal-item">
                      <span className="as-modal-label">Role</span>
                      <span className="as-modal-value">{selectedLog.userRole || 'N/A'}</span>
                    </div>
                    <div className="as-modal-item">
                      <span className="as-modal-label">Time</span>
                      <span className="as-modal-value">{formatDate(selectedLog.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="as-modal-footer">
              <button className="as-modal-close-btn" onClick={() => setShowDetails(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .as-container {
          padding: 0 0 24px 0;
          max-width: 100%;
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
          animation: asFadeInDown 0.6s ease;
        }

        @keyframes asFadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .as-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .as-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .as-title-icon {
          width: 28px;
          height: 28px;
          animation: asPulse 2s ease-in-out infinite;
        }

        @keyframes asPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .as-subtitle {
          color: #013E37;
          opacity: 0.6;
          font-size: 15px;
          margin: 0;
        }

        .as-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .as-btn-icon {
          width: 16px;
          height: 16px;
        }

        .as-clear-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          color: #013E37;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .as-clear-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .as-refresh-btn {
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

        .as-refresh-btn:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .as-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .as-refresh-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
        }

        .as-spin {
          animation: asSpin 0.8s linear infinite;
        }

        @keyframes asSpin {
          to { transform: rotate(360deg); }
        }

        .as-search-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: #013E37;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.25);
        }

        .as-search-btn:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        .as-search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .as-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: asSpin 0.8s linear infinite;
        }

        /* ============================================
           SEARCH FORM
           ============================================ */
        .as-search-form {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          animation: asSlideDown 0.4s ease;
        }

        @keyframes asSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .as-search-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
          gap: 16px;
          align-items: end;
        }

        @media (max-width: 1200px) {
          .as-search-grid {
            grid-template-columns: 2fr 1fr 1fr 1fr;
          }
        }

        @media (max-width: 992px) {
          .as-search-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .as-search-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .as-search-grid {
            grid-template-columns: 1fr;
          }
        }

        .as-search-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .as-search-label {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .as-search-input-wrapper {
          position: relative;
        }

        .as-search-input-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          opacity: 0.5;
        }

        .as-search-input,
        .as-search-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #013E37;
        }

        .as-search-input:focus,
        .as-search-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .as-search-input {
          padding-left: 36px;
        }

        .as-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }

        .as-active-filters {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #FFEFB3;
        }

        .as-active-filters-label {
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
          opacity: 0.6;
        }

        .as-filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px 4px 12px;
          background: #FFEFB3;
          color: #013E37;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
        }

        .as-filter-tag button {
          padding: 2px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          border-radius: 4px;
          color: #013E37;
        }

        .as-filter-tag button:hover {
          background: rgba(1, 62, 55, 0.1);
        }

        .as-filter-tag-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           RESULTS HEADER
           ============================================ */
        .as-results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          margin-bottom: 12px;
        }

        .as-results-count {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
        }

        .as-results-count-number {
          font-weight: 600;
          color: #013E37;
          opacity: 1;
        }

        .as-export-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border: 1px solid #FFEFB3;
          border-radius: 6px;
          background: #ffffff;
          color: #013E37;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .as-export-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }

        /* ============================================
           RESULTS
           ============================================ */
        .as-results-container {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .as-results-container:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }

        .as-results-list {
          max-height: 600px;
          overflow-y: auto;
        }

        .as-results-list::-webkit-scrollbar {
          width: 4px;
        }

        .as-results-list::-webkit-scrollbar-track {
          background: #FFEFB3;
        }

        .as-results-list::-webkit-scrollbar-thumb {
          background: #013E37;
          border-radius: 2px;
        }

        .as-log-item {
          border-bottom: 1px solid #FFEFB3;
          transition: all 0.3s ease;
          animation: asSlideInRight 0.4s ease forwards;
          opacity: 0;
        }

        .as-log-item:last-child {
          border-bottom: none;
        }

        .as-log-item:hover {
          background: #FFEFB3;
        }

        @keyframes asSlideInRight {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .as-log-item-main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 14px 20px;
          cursor: pointer;
          gap: 12px;
        }

        .as-log-item-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .as-log-expand {
          margin-top: 4px;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .as-log-expand:hover {
          background: #FFEFB3;
        }

        .as-log-expand-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.3;
        }

        .as-log-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .as-log-item:hover .as-log-icon {
          transform: scale(1.05) rotate(-5deg);
        }

        .as-entity-icon {
          width: 18px;
          height: 18px;
          color: #013E37;
        }

        .as-log-content {
          flex: 1;
          min-width: 0;
        }

        .as-log-header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .as-log-user {
          font-weight: 600;
          color: #013E37;
          font-size: 14px;
        }

        .as-log-action {
          padding: 2px 12px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .as-action-icon {
          width: 12px;
          height: 12px;
        }

        .as-action-created { background: #013E37; color: #ffffff; }
        .as-action-updated { background: #FFEFB3; color: #013E37; }
        .as-action-deleted { background: #FFEBEE; color: #D32F2F; }
        .as-action-completed { background: #013E37; color: #ffffff; }
        .as-action-approved { background: #013E37; color: #ffffff; }
        .as-action-rejected { background: #FFEFB3; color: #013E37; }
        .as-action-login { background: #FFEFB3; color: #013E37; }
        .as-action-logout { background: #FFEFB3; color: #013E37; }
        .as-action-default { background: #FFEFB3; color: #013E37; }

        .as-log-entity {
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .as-log-importance {
          padding: 2px 10px;
          font-size: 10px;
          font-weight: 600;
          border-radius: 9999px;
        }

        .as-importance-low { background: #FFEFB3; color: #013E37; }
        .as-importance-medium { background: #FFEFB3; color: #013E37; }
        .as-importance-high { background: #FFEFB3; color: #013E37; }
        .as-importance-critical { background: #FFEBEE; color: #D32F2F; }
        .as-importance-default { background: #FFEFB3; color: #013E37; }

        .as-log-status {
          padding: 2px 10px;
          font-size: 10px;
          font-weight: 600;
          border-radius: 9999px;
        }

        .as-status-success { background: #013E37; color: #ffffff; }
        .as-status-failure { background: #FFEBEE; color: #D32F2F; }
        .as-status-pending { background: #FFEFB3; color: #013E37; }
        .as-status-default { background: #FFEFB3; color: #013E37; }

        .as-log-time {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
        }

        .as-log-description {
          font-size: 14px;
          color: #013E37;
          opacity: 0.8;
          margin: 4px 0 0 0;
        }

        .as-log-entity-ref {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
          margin-top: 4px;
          padding: 2px 10px;
          background: #FFEFB3;
          border-radius: 4px;
        }

        .as-log-entity-icon {
          width: 12px;
          height: 12px;
        }

        .as-log-entity-id {
          color: #013E37;
          opacity: 0.4;
        }

        .as-log-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .as-log-action-btn {
          padding: 6px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.3;
          display: flex;
          align-items: center;
        }

        .as-log-action-btn:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }

        .as-log-action-view:hover {
          background: #FFEFB3;
          color: #013E37;
        }

        .as-log-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           DETAILS
           ============================================ */
        .as-log-details {
          padding: 0 20px 16px 20px;
        }

        .as-log-details-content {
          background: #F8FAFC;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #FFEFB3;
        }

        .as-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 640px) {
          .as-details-grid {
            grid-template-columns: 1fr;
          }
        }

        .as-details-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .as-details-title {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .as-details-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .as-details-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 10px;
          background: #ffffff;
          border-radius: 4px;
          font-size: 13px;
          border: 1px solid #FFEFB3;
        }

        .as-details-label {
          color: #013E37;
          opacity: 0.6;
          font-weight: 500;
        }

        .as-details-value {
          color: #013E37;
          font-family: monospace;
          font-size: 12px;
          word-break: break-all;
          text-align: right;
          max-width: 60%;
        }

        /* ============================================
           CHANGES
           ============================================ */
        .as-changes-section {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #FFEFB3;
        }

        .as-changes-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 4px;
        }

        .as-change-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: #ffffff;
          border-radius: 4px;
          font-size: 13px;
          flex-wrap: wrap;
          border: 1px solid #FFEFB3;
        }

        .as-change-field {
          font-weight: 600;
          color: #013E37;
        }

        .as-change-old {
          color: #D32F2F;
          text-decoration: line-through;
        }

        .as-change-new {
          color: #013E37;
          font-weight: 500;
        }

        .as-change-arrow {
          color: #013E37;
          opacity: 0.3;
        }

        .as-change-type {
          padding: 1px 10px;
          font-size: 10px;
          font-weight: 600;
          border-radius: 9999px;
          margin-left: auto;
        }

        .as-change-create { background: #013E37; color: #ffffff; }
        .as-change-update { background: #FFEFB3; color: #013E37; }
        .as-change-delete { background: #FFEBEE; color: #D32F2F; }

        /* ============================================
           ROLLBACK
           ============================================ */
        .as-rollback-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 8px 12px;
          background: #FFEFB3;
          border-radius: 4px;
          border: 1px solid #013E37;
          font-size: 13px;
          color: #013E37;
        }

        .as-rollback-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: #013E37;
        }

        /* ============================================
           LOADING STATE
           ============================================ */
        .as-loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
        }

        .as-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: asSpin 0.8s linear infinite;
        }

        .as-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .as-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 24px;
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          text-align: center;
        }

        .as-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          animation: asFloat 3s ease-in-out infinite;
        }

        @keyframes asFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .as-empty-icon {
          width: 40px;
          height: 40px;
        }

        .as-empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .as-empty-subtitle {
          color: #013E37;
          opacity: 0.6;
          margin-top: 4px;
          font-size: 15px;
        }

        .as-empty-btn {
          margin-top: 16px;
          padding: 10px 24px;
          background: #013E37;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .as-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        /* ============================================
           MODAL
           ============================================ */
        .as-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(1, 62, 55, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: asFadeIn 0.3s ease;
        }

        @keyframes asFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .as-modal {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #FFEFB3;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 24px 64px rgba(1, 62, 55, 0.2);
          animation: asModalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes asModalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .as-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #F8FAFC;
        }

        .as-modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .as-modal-close {
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          color: #013E37;
          opacity: 0.5;
        }

        .as-modal-close:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: rotate(90deg);
        }

        .as-modal-close-icon {
          width: 20px;
          height: 20px;
        }

        .as-modal-body {
          padding: 24px;
        }

        .as-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 640px) {
          .as-modal-grid {
            grid-template-columns: 1fr;
          }
        }

        .as-modal-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
          margin: 0 0 12px 0;
        }

        .as-modal-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .as-modal-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 8px 12px;
          background: #F8FAFC;
          border-radius: 6px;
          border: 1px solid #FFEFB3;
        }

        .as-modal-label {
          font-size: 11px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.5;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .as-modal-value {
          font-size: 14px;
          color: #013E37;
          word-break: break-word;
        }

        .as-modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 16px 24px;
          border-top: 1px solid #FFEFB3;
          background: #F8FAFC;
        }

        .as-modal-close-btn {
          padding: 8px 24px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: transparent;
          color: #013E37;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .as-modal-close-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
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

          .as-search-btn {
            flex: 1;
            justify-content: center;
          }

          .as-clear-btn {
            flex: 1;
            justify-content: center;
          }

          .as-log-item-main {
            flex-direction: column;
          }

          .as-log-item-left {
            width: 100%;
          }

          .as-log-actions {
            width: 100%;
            justify-content: flex-end;
            padding-left: 52px;
          }

          .as-log-header {
            gap: 4px;
          }

          .as-log-details {
            padding: 0 12px 12px 12px;
          }

          .as-details-item {
            flex-direction: column;
            gap: 2px;
          }

          .as-details-value {
            text-align: left;
            max-width: 100%;
          }

          .as-title {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .as-results-header {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .as-export-btn {
            width: 100%;
            justify-content: center;
          }

          .as-modal {
            margin: 16px;
          }

          .as-modal-grid {
            grid-template-columns: 1fr;
          }

          .as-change-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .as-change-type {
            margin-left: 0;
          }

          .as-title {
            font-size: 20px;
          }

          .as-log-item-main {
            padding: 12px 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default ActivitySearch;