// pages/activity/ActivityFeed.jsx - MODERN DESIGN WITH #013E37, #FFEFB3, WHITE
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  Clock, Filter, RefreshCw, Search,
  User, Briefcase, Target, CheckCircle,
  AlertCircle, MessageSquare, FileText,
  Building2, Users, Activity,
  X, ChevronDown, ChevronRight,
  Eye, Download, Calendar, Sparkles,
  Zap, Award, Crown, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const ActivityFeed = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
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
  const [hoveredItem, setHoveredItem] = useState(null);
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
      'lead': '#013E37',
      'client': '#0A5C54',
      'project': '#013E37',
      'task': '#013E37',
      'goal': '#013E37',
      'user': '#013E37',
      'team': '#013E37',
      'comment': '#013E37',
      'risk': '#D32F2F',
      'activity': '#013E37',
      'kpi': '#013E37',
      'workflow': '#013E37',
      'retainer': '#013E37',
      'partner': '#013E37',
      'report': '#013E37',
      'schedule': '#013E37'
    };
    return colors[entityType] || '#013E37';
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
              <Activity className="af-title-icon" color="#013E37" />
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
            <Activity className="af-stat-icon" color="#013E37" />
            {activities.length} activities
          </span>
          {activities.length > 0 && (
            <span className="af-stat">
              <Clock className="af-stat-icon" color="#013E37" />
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
              <div className="af-empty-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
                <Activity className="af-empty-icon" color="#013E37" />
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
            activities.map((activity, index) => {
              const isExpanded = expandedItems[activity._id];
              const entityColor = getEntityColor(activity.entityType);
              const userId = activity.userId || activity.createdBy || {};
              const userName = userId.firstName || userId.name || 'System';
              const userLastName = userId.lastName || '';
              const fullName = userLastName ? `${userName} ${userLastName}` : userName;
              const isHovered = hoveredItem === activity._id;
              
              return (
                <div 
                  key={activity._id} 
                  className="af-item"
                  style={{ animationDelay: `${index * 0.03}s` }}
                  onMouseEnter={() => setHoveredItem(activity._id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
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

                        <div className="af-details-action">
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
          animation: afFadeInDown 0.6s ease;
        }

        @keyframes afFadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .af-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .af-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .af-title-icon {
          width: 28px;
          height: 28px;
          animation: afPulse 2s ease-in-out infinite;
        }

        @keyframes afPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .af-subtitle {
          color: #013E37;
          opacity: 0.6;
          font-size: 15px;
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
          background: #FFEFB3;
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
          background: #013E37;
          animation: afPulse 2s infinite;
        }

        .af-status-inactive {
          background: #9ca3af;
        }

        .af-status-label {
          color: #013E37;
        }

        .af-auto-btn {
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

        .af-auto-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .af-auto-active {
          border-color: #013E37;
          background: #FFEFB3;
        }

        .af-auto-active .af-auto-icon {
          color: #013E37;
        }

        .af-auto-inactive {
          border-color: #FFEFB3;
        }

        .af-auto-inactive .af-auto-icon {
          color: #013E37;
          opacity: 0.4;
        }

        .af-auto-icon {
          width: 16px;
          height: 16px;
        }

        .af-filter-btn {
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .af-filter-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .af-filter-active {
          border-color: #013E37;
          background: #FFEFB3;
        }

        .af-filter-active .af-filter-icon {
          color: #013E37;
        }

        .af-filter-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.6;
        }

        .af-filter-dot {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 8px;
          height: 8px;
          background: #013E37;
          border-radius: 50%;
          border: 2px solid #ffffff;
        }

        .af-refresh-btn {
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

        .af-refresh-btn:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .af-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .af-refresh-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
        }

        .af-spin {
          animation: afSpin 0.8s linear infinite;
        }

        @keyframes afSpin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           FILTERS
           ============================================ */
        .af-filters {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 16px;
          animation: afSlideDown 0.3s ease;
        }

        @keyframes afSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
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
          font-weight: 600;
          color: #013E37;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .af-filter-select {
          padding: 6px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #013E37;
          width: 100%;
          cursor: pointer;
        }

        .af-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .af-filter-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .af-clear-btn {
          padding: 6px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 6px;
          background: transparent;
          color: #013E37;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .af-clear-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .af-clear-icon {
          width: 14px;
          height: 14px;
        }

        .af-apply-btn {
          padding: 6px 16px;
          background: #013E37;
          border: none;
          border-radius: 6px;
          color: #ffffff;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .af-apply-btn:hover {
          background: #0A5C54;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.2);
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
          color: #013E37;
          opacity: 0.6;
          font-weight: 500;
        }

        .af-stat-icon {
          width: 14px;
          height: 14px;
        }

        .af-stat-live {
          color: #013E37;
          font-weight: 600;
          opacity: 1;
        }

        .af-stat-dot {
          width: 6px;
          height: 6px;
          background: #013E37;
          border-radius: 50%;
          display: inline-block;
          animation: afPulse 2s infinite;
        }

        /* ============================================
           FEED
           ============================================ */
        .af-feed {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .af-feed:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }

        .af-item {
          border-bottom: 1px solid #FFEFB3;
          transition: all 0.3s ease;
          animation: afSlideInRight 0.4s ease forwards;
          opacity: 0;
        }

        .af-item:last-child {
          border-bottom: none;
        }

        .af-item:hover {
          background: #FFEFB3;
        }

        @keyframes afSlideInRight {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
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
          transition: all 0.3s ease;
        }

        .af-item:hover .af-item-icon {
          transform: scale(1.05) rotate(-5deg);
        }

        .af-entity-icon {
          width: 18px;
          height: 18px;
          color: #013E37;
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
          color: #013E37;
          font-size: 14px;
        }

        .af-item-action {
          padding: 2px 12px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 9999px;
        }

        .af-action-created {
          background: #013E37;
          color: #ffffff;
        }

        .af-action-updated {
          background: #FFEFB3;
          color: #013E37;
        }

        .af-action-deleted {
          background: #FFEBEE;
          color: #D32F2F;
        }

        .af-action-completed {
          background: #013E37;
          color: #ffffff;
        }

        .af-action-approved {
          background: #013E37;
          color: #ffffff;
        }

        .af-action-rejected {
          background: #FFEFB3;
          color: #013E37;
        }

        .af-action-login {
          background: #FFEFB3;
          color: #013E37;
        }

        .af-action-logout {
          background: #FFEFB3;
          color: #013E37;
        }

        .af-action-default {
          background: #FFEFB3;
          color: #013E37;
        }

        .af-item-entity {
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .af-item-time {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
        }

        .af-item-expand {
          padding: 2px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #013E37;
          opacity: 0.3;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          margin-left: auto;
        }

        .af-item-expand:hover {
          opacity: 1;
          transform: scale(1.2);
        }

        .af-item-expand-icon {
          width: 16px;
          height: 16px;
        }

        .af-item-desc {
          font-size: 14px;
          color: #013E37;
          opacity: 0.8;
          margin: 4px 0 0 0;
        }

        .af-item-entity-name {
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
          color: #013E37;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          white-space: nowrap;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px 12px;
          border-radius: 6px;
        }

        .af-item-link:hover {
          background: #013E37;
          color: #ffffff;
          transform: scale(1.05);
        }

        /* ============================================
           DETAILS
           ============================================ */
        .af-item-details {
          padding: 0 20px 16px 20px;
          border-top: 1px solid #FFEFB3;
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
          color: #013E37;
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
          padding: 4px 10px;
          background: #F8FAFC;
          border-radius: 4px;
          font-size: 13px;
          border: 1px solid #FFEFB3;
        }

        .af-details-label {
          color: #013E37;
          opacity: 0.6;
          font-weight: 500;
        }

        .af-details-value {
          color: #013E37;
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
          padding: 8px 24px;
          background: #013E37;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .af-details-view-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
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
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          animation: afFloat 3s ease-in-out infinite;
        }

        @keyframes afFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .af-empty-icon {
          width: 40px;
          height: 40px;
        }

        .af-empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .af-empty-subtitle {
          color: #013E37;
          opacity: 0.6;
          margin-top: 4px;
          font-size: 15px;
        }

        .af-empty-btn {
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

        .af-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
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
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: afSpin 0.8s linear infinite;
        }

        .af-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
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

          .af-title {
            font-size: 24px;
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

          .af-title {
            font-size: 20px;
          }

          .af-item-main {
            padding: 12px 14px;
          }

          .af-item-link {
            font-size: 12px;
            padding: 4px 8px;
          }
        }
      `}</style>
    </>
  );
};

export default ActivityFeed;