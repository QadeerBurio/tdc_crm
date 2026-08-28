// pages/activity/ActivityFeed.jsx - COMPLETE WORKING VERSION
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  Clock, Filter, RefreshCw, Search,
  User, Briefcase, Target, CheckCircle,
  AlertCircle, MessageSquare, FileText,
  Building2, Users, Activity,
  X, ChevronDown, ChevronRight,
  Eye, Download, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const ActivityFeed = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    entityType: 'all',
    action: 'all',
    limit: 30
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const feedRef = useRef(null);
  const intervalRef = useRef(null);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    fetchActivities();
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchActivities, 60000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [filters, autoRefresh]);

  const fetchActivities = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (filters.entityType !== 'all') params.append('entityType', filters.entityType);
      if (filters.action !== 'all') params.append('action', filters.action);
      params.append('limit', filters.limit);
      
      const response = await axios.get(
        `${API_URL}/crm/activities/feed?${params.toString()}`,
        getHeaders()
      );
      
      let activitiesData = [];
      if (response.data?.success && response.data?.data?.activities) {
        activitiesData = response.data.data.activities;
      } else if (response.data?.data) {
        activitiesData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        activitiesData = response.data;
      } else {
        activitiesData = [];
      }
      
      setActivities(activitiesData);
      
      if (activitiesData.length > 0) {
        const firstId = activitiesData[0]?._id;
        if (firstId && !expandedItems[firstId]) {
          setExpandedItems(prev => ({ ...prev, [firstId]: false }));
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error(error.response?.data?.message || 'Failed to load activities');
      setActivities(getMockActivities());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockActivities = () => {
    return [
      {
        _id: '1',
        entityType: 'user',
        action: 'login',
        description: 'User logged in to the system',
        userId: { firstName: 'John', lastName: 'Doe' },
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        metadata: { ip: '192.168.1.1', browser: 'Chrome' }
      },
      {
        _id: '2',
        entityType: 'project',
        action: 'created',
        description: 'New project "Website Redesign" was created',
        userId: { firstName: 'Sarah', lastName: 'Smith' },
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        metadata: { priority: 'high', budget: '$50,000' }
      },
      {
        _id: '3',
        entityType: 'task',
        action: 'completed',
        description: 'Task "Design Homepage" was completed',
        userId: { firstName: 'Mike', lastName: 'Johnson' },
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        metadata: { hours: 4, quality: 'excellent' }
      }
    ];
  };

  // ✅ Navigate to activity details
  const handleViewActivity = (activityId) => {
    navigate(`/activities/${activityId}`);
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
    if (!autoRefresh) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fetchActivities, 60000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    toast.success(autoRefresh ? 'Auto-refresh disabled' : 'Auto-refresh enabled');
  };

  const handleRefresh = async () => {
    await fetchActivities();
    toast.success('Activities refreshed');
  };

  const getEntityIcon = (entityType) => {
    const icons = {
      'lead': Briefcase,
      'client': Building2,
      'project': FileText,
      'task': CheckCircle,
      'goal': Target,
      'user': User,
      'team': Users,
      'comment': MessageSquare,
      'risk': AlertCircle,
      'activity': Activity,
      'kpi': Target,
      'workflow': Activity,
      'retainer': Clock,
      'partner': Users,
      'report': FileText,
      'schedule': Calendar
    };
    const Icon = icons[entityType] || Clock;
    return <Icon className="af-entity-icon" />;
  };

  const getEntityColor = (entityType) => {
    const colors = {
      'lead': '#3b82f6',
      'client': '#8b5cf6',
      'project': '#22c55e',
      'task': '#f59e0b',
      'goal': '#ec4899',
      'user': '#6b7280',
      'team': '#14b8a6',
      'comment': '#f97316',
      'risk': '#ef4444',
      'activity': '#3b82f6',
      'kpi': '#8b5cf6',
      'workflow': '#3b82f6',
      'retainer': '#f59e0b',
      'partner': '#14b8a6',
      'report': '#3b82f6',
      'schedule': '#8b5cf6'
    };
    return colors[entityType] || '#6b7280';
  };

  const getActionColor = (action) => {
    if (action?.includes('created') || action === 'create') return 'af-action-created';
    if (action?.includes('updated') || action === 'update' || action?.includes('changed')) return 'af-action-updated';
    if (action?.includes('deleted') || action === 'delete' || action?.includes('removed')) return 'af-action-deleted';
    if (action?.includes('completed') || action === 'complete') return 'af-action-completed';
    if (action?.includes('approved') || action === 'approve') return 'af-action-approved';
    if (action?.includes('rejected') || action === 'reject' || action?.includes('failed')) return 'af-action-rejected';
    if (action?.includes('login')) return 'af-action-login';
    if (action?.includes('logout')) return 'af-action-logout';
    if (action?.includes('generated')) return 'af-action-created';
    if (action?.includes('exported')) return 'af-action-updated';
    return 'af-action-default';
  };

  const getActionLabel = (action) => {
    const labels = {
      'created': 'created',
      'create': 'created',
      'updated': 'updated',
      'update': 'updated',
      'deleted': 'deleted',
      'delete': 'deleted',
      'completed': 'completed',
      'complete': 'completed',
      'approved': 'approved',
      'approve': 'approved',
      'rejected': 'rejected',
      'reject': 'rejected',
      'login': 'logged in',
      'logout': 'logged out',
      'generated': 'generated',
      'exported': 'exported'
    };
    return labels[action] || action?.replace(/_/g, ' ') || action;
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

  const clearFilters = () => {
    setFilters({
      entityType: 'all',
      action: 'all',
      limit: 30
    });
    toast.success('Filters cleared');
  };

  const hasActiveFilters = () => {
    return filters.entityType !== 'all' || filters.action !== 'all';
  };

  const entityTypes = [
    { value: 'all', label: 'All' },
    { value: 'lead', label: 'Leads' },
    { value: 'client', label: 'Clients' },
    { value: 'project', label: 'Projects' },
    { value: 'task', label: 'Tasks' },
    { value: 'goal', label: 'Goals' },
    { value: 'user', label: 'Users' },
    { value: 'team', label: 'Teams' },
    { value: 'risk', label: 'Risks' },
    { value: 'workflow', label: 'Workflows' },
    { value: 'retainer', label: 'Retainers' },
    { value: 'report', label: 'Reports' },
    { value: 'schedule', label: 'Schedules' }
  ];

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' },
    { value: 'completed', label: 'Completed' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'generated', label: 'Generated' },
    { value: 'exported', label: 'Exported' }
  ];

  if (loading && activities.length === 0) {
    return (
      <div className="af-loading">
        <div className="af-loading-spinner"></div>
        <p className="af-loading-text">Loading activity feed...</p>
      </div>
    );
  }

  return (
    <>
      <div className="af-container">
        {/* Header */}
        <div className="af-header">
          <div className="af-header-left">
            <h1 className="af-title">
              <Activity className="af-title-icon" />
              Activity Feed
            </h1>
            <p className="af-subtitle">Real-time activity from across the organization</p>
          </div>
          <div className="af-header-right">
            <div className="af-status-indicator">
              <span className={`af-status-dot ${autoRefresh ? 'af-status-active' : 'af-status-inactive'}`}></span>
              <span className="af-status-label">{autoRefresh ? 'Live' : 'Paused'}</span>
            </div>
            <button
              onClick={toggleAutoRefresh}
              className={`af-auto-btn ${autoRefresh ? 'af-auto-active' : 'af-auto-inactive'}`}
              title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
            >
              <Clock className="af-auto-icon" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`af-filter-btn ${showFilters ? 'af-filter-active' : ''}`}
            >
              <Filter className="af-filter-icon" />
              {hasActiveFilters() && <span className="af-filter-dot"></span>}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="af-refresh-btn"
            >
              <RefreshCw className={`af-refresh-icon ${refreshing ? 'af-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="af-filters">
            <div className="af-filters-grid">
              <div className="af-filter-group">
                <label className="af-filter-label">Entity Type</label>
                <select
                  value={filters.entityType}
                  onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                  className="af-filter-select"
                >
                  {entityTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="af-filter-group">
                <label className="af-filter-label">Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  className="af-filter-select"
                >
                  {actionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="af-filter-group">
                <label className="af-filter-label">Limit</label>
                <select
                  value={filters.limit}
                  onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                  className="af-filter-select"
                >
                  <option value="10">10</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              <div className="af-filter-actions">
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="af-clear-btn"
                  >
                    <X className="af-clear-icon" />
                    Clear
                  </button>
                )}
                <button
                  onClick={fetchActivities}
                  className="af-apply-btn"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="af-stats">
          <span className="af-stat">
            <Activity className="af-stat-icon" />
            {activities.length} activities
          </span>
          {activities.length > 0 && (
            <span className="af-stat">
              <Clock className="af-stat-icon" />
              Last updated: {formatDate(activities[0]?.createdAt)}
            </span>
          )}
          {autoRefresh && (
            <span className="af-stat af-stat-live">
              <span className="af-stat-dot"></span>
              Live updates
            </span>
          )}
        </div>

        {/* Activities List */}
        <div className="af-feed" ref={feedRef}>
          {activities.length === 0 ? (
            <div className="af-empty">
              <div className="af-empty-icon-wrapper">
                <Activity className="af-empty-icon" />
              </div>
              <h3 className="af-empty-title">No Activities</h3>
              <p className="af-empty-subtitle">
                {hasActiveFilters() 
                  ? 'Try adjusting your filters'
                  : 'Activities from across the organization will appear here'}
              </p>
              {hasActiveFilters() && (
                <button 
                  onClick={clearFilters}
                  className="af-empty-btn"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            activities.map((activity) => {
              const isExpanded = expandedItems[activity._id];
              const entityColor = getEntityColor(activity.entityType);
              const userId = activity.userId || activity.createdBy || {};
              const userName = userId.firstName || userId.name || 'System';
              const userLastName = userId.lastName || '';
              const fullName = userLastName ? `${userName} ${userLastName}` : userName;
              
              return (
                <div key={activity._id} className="af-item">
                  <div 
                    className="af-item-main" 
                    onClick={() => handleViewActivity(activity._id)}
                  >
                    <div className="af-item-icon" style={{ backgroundColor: `${entityColor}15` }}>
                      {getEntityIcon(activity.entityType)}
                    </div>
                    <div className="af-item-content">
                      <div className="af-item-header">
                        <span className="af-item-user">
                          {fullName}
                        </span>
                        <span className={`af-item-action ${getActionColor(activity.type || activity.action)}`}>
                          {getActionLabel(activity.type || activity.action)}
                        </span>
                        <span className="af-item-entity" style={{ color: entityColor }}>
                          {activity.entityType}
                        </span>
                        <span className="af-item-time">{getTimeAgo(activity.createdAt)}</span>
                        <button 
                          className="af-item-expand"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(activity._id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown className="af-item-expand-icon" />
                          ) : (
                            <ChevronRight className="af-item-expand-icon" />
                          )}
                        </button>
                      </div>
                      <p className="af-item-desc">{activity.description}</p>
                      {activity.entityName && (
                        <span className="af-item-entity-name">
                          <FileText className="af-item-entity-icon" />
                          {activity.entityName}
                        </span>
                      )}
                    </div>
                    <div className="af-item-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="af-item-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewActivity(activity._id);
                        }}
                      >
                        <Eye className="af-action-icon" />
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="af-item-details">
                      <div className="af-details-grid">
                        <div className="af-details-section">
                          <h4 className="af-details-title">Details</h4>
                          <div className="af-details-list">
                            <div className="af-details-item">
                              <span className="af-details-label">ID</span>
                              <span className="af-details-value">{activity._id}</span>
                            </div>
                            <div className="af-details-item">
                              <span className="af-details-label">User</span>
                              <span className="af-details-value">{fullName}</span>
                            </div>
                            <div className="af-details-item">
                              <span className="af-details-label">Action</span>
                              <span className="af-details-value">{activity.type || activity.action}</span>
                            </div>
                            <div className="af-details-item">
                              <span className="af-details-label">Entity</span>
                              <span className="af-details-value">{activity.entityType}</span>
                            </div>
                            <div className="af-details-item">
                              <span className="af-details-label">Time</span>
                              <span className="af-details-value">{formatDate(activity.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="af-details-section">
                            <h4 className="af-details-title">Metadata</h4>
                            <div className="af-details-list">
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <div key={key} className="af-details-item">
                                  <span className="af-details-label">{key}</span>
                                  <span className="af-details-value">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* View Details Button in Expanded View */}
                        <div className="af-details-section af-details-action">
                          <button
                            onClick={() => handleViewActivity(activity._id)}
                            className="af-details-view-btn"
                          >
                            <Eye className="af-details-view-icon" />
                            View Full Details
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .af-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           HEADER
           ============================================ */
        .af-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .af-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .af-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .af-title-icon {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }

        .af-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .af-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .af-status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: #f3f4f6;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .af-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .af-status-active {
          background: #22c55e;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .af-status-inactive {
          background: #9ca3af;
        }

        .af-status-label {
          color: #6b7280;
        }

        .af-auto-btn {
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

        .af-auto-btn:hover {
          background: #f9fafb;
        }

        .af-auto-active {
          border-color: #22c55e;
          background: #f0fdf4;
        }

        .af-auto-active .af-auto-icon {
          color: #22c55e;
        }

        .af-auto-inactive {
          border-color: #d1d5db;
        }

        .af-auto-inactive .af-auto-icon {
          color: #9ca3af;
        }

        .af-auto-icon {
          width: 16px;
          height: 16px;
        }

        .af-filter-btn {
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

        .af-filter-btn:hover {
          background: #f9fafb;
        }

        .af-filter-active {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .af-filter-active .af-filter-icon {
          color: #3b82f6;
        }

        .af-filter-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .af-filter-dot {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          border: 2px solid #ffffff;
        }

        .af-refresh-btn {
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

        .af-refresh-btn:hover:not(:disabled) {
          background: #f9fafb;
        }

        .af-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .af-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .af-spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           FILTERS
           ============================================ */
        .af-filters {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 16px;
        }

        .af-filters-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 16px;
          align-items: end;
        }

        @media (max-width: 768px) {
          .af-filters-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .af-filters-grid {
            grid-template-columns: 1fr;
          }
        }

        .af-filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .af-filter-label {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .af-filter-select {
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          width: 100%;
        }

        .af-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .af-filter-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .af-clear-btn {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: transparent;
          color: #6b7280;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .af-clear-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .af-clear-icon {
          width: 14px;
          height: 14px;
        }

        .af-apply-btn {
          padding: 6px 16px;
          background: #3b82f6;
          border: none;
          border-radius: 6px;
          color: #ffffff;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .af-apply-btn:hover {
          background: #2563eb;
        }

        /* ============================================
           STATS
           ============================================ */
        .af-stats {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 0;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .af-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
        }

        .af-stat-icon {
          width: 14px;
          height: 14px;
        }

        .af-stat-live {
          color: #22c55e;
          font-weight: 500;
        }

        .af-stat-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s infinite;
        }

        /* ============================================
           FEED
           ============================================ */
        .af-feed {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          overflow: hidden;
        }

        .af-item {
          border-bottom: 1px solid #f3f4f6;
          transition: all 0.2s ease;
        }

        .af-item:last-child {
          border-bottom: none;
        }

        .af-item:hover {
          background: #f9fafb;
        }

        .af-item-main {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 20px;
          cursor: pointer;
        }

        .af-item-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .af-entity-icon {
          width: 18px;
          height: 18px;
          color: #3b82f6;
        }

        .af-item-content {
          flex: 1;
          min-width: 0;
        }

        .af-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .af-item-user {
          font-weight: 600;
          color: #111827;
          font-size: 14px;
        }

        .af-item-action {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .af-action-created {
          background: #dcfce7;
          color: #16a34a;
        }

        .af-action-updated {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .af-action-deleted {
          background: #fee2e2;
          color: #dc2626;
        }

        .af-action-completed {
          background: #d1fae5;
          color: #059669;
        }

        .af-action-approved {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .af-action-rejected {
          background: #fef3c7;
          color: #d97706;
        }

        .af-action-login {
          background: #ede9fe;
          color: #7c3aed;
        }

        .af-action-logout {
          background: #f3f4f6;
          color: #6b7280;
        }

        .af-action-default {
          background: #f3f4f6;
          color: #6b7280;
        }

        .af-item-entity {
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .af-item-time {
          font-size: 12px;
          color: #9ca3af;
        }

        .af-item-expand {
          padding: 2px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #9ca3af;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          margin-left: auto;
        }

        .af-item-expand:hover {
          color: #4b5563;
        }

        .af-item-expand-icon {
          width: 16px;
          height: 16px;
        }

        .af-item-desc {
          font-size: 14px;
          color: #4b5563;
          margin: 4px 0 0 0;
        }

        .af-item-entity-name {
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

        .af-item-entity-icon {
          width: 12px;
          height: 12px;
        }

        .af-item-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          padding-left: 8px;
        }

        .af-action-icon {
          width: 14px;
          height: 14px;
        }

        .af-item-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
          white-space: nowrap;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .af-item-link:hover {
          background: #eff6ff;
          color: #2563eb;
        }

        /* ============================================
           DETAILS
           ============================================ */
        .af-item-details {
          padding: 0 20px 16px 20px;
          border-top: 1px solid #f3f4f6;
        }

        .af-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding-top: 16px;
        }

        @media (max-width: 640px) {
          .af-details-grid {
            grid-template-columns: 1fr;
          }
        }

        .af-details-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .af-details-title {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin: 0;
        }

        .af-details-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .af-details-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 8px;
          background: #f9fafb;
          border-radius: 4px;
          font-size: 13px;
        }

        .af-details-label {
          color: #6b7280;
          font-weight: 500;
        }

        .af-details-value {
          color: #111827;
          font-family: monospace;
          font-size: 12px;
          word-break: break-all;
          text-align: right;
          max-width: 60%;
        }

        .af-details-action {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          margin-top: 8px;
        }

        .af-details-view-btn {
          display: flex;
          align-items: center;
          gap: 8px;
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

        .af-details-view-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .af-details-view-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .af-empty {
          padding: 48px 24px;
          text-align: center;
        }

        .af-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .af-empty-icon {
          width: 40px;
          height: 40px;
          color: #9ca3af;
        }

        .af-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .af-empty-subtitle {
          color: #6b7280;
          margin-top: 4px;
        }

        .af-empty-btn {
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

        .af-empty-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        /* ============================================
           LOADING
           ============================================ */
        .af-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .af-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .af-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .af-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .af-header-right {
            width: 100%;
          }

          .af-item-main {
            flex-wrap: wrap;
          }

          .af-item-header {
            gap: 4px;
          }

          .af-item-expand {
            margin-left: 0;
          }

          .af-item-actions {
            padding-left: 0;
            width: 100%;
            justify-content: flex-end;
          }
        }

        @media (max-width: 480px) {
          .af-filters-grid {
            grid-template-columns: 1fr;
          }

          .af-filter-actions {
            flex-direction: column;
            width: 100%;
          }

          .af-clear-btn,
          .af-apply-btn {
            width: 100%;
            justify-content: center;
          }

          .af-item-details {
            padding: 0 12px 12px 12px;
          }

          .af-details-item {
            flex-direction: column;
            gap: 2px;
          }

          .af-details-value {
            text-align: left;
            max-width: 100%;
          }

          .af-details-action {
            flex-direction: column;
          }

          .af-details-view-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default ActivityFeed;