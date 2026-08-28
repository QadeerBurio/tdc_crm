// pages/activity/ActivityDetails.jsx - MODERN DESIGN FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  X, User, Clock, Calendar, Layers,
  Users, Briefcase, Target, CheckCircle,
  AlertCircle, FileText, Building2, Activity,
  ArrowLeft, Copy, Link2, RefreshCw,
  ChevronLeft, ChevronRight, Plus,
  Edit, Trash2, LogIn, LogOut, XCircle,
  Eye, Download, Share2, MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

const ActivityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedLogs, setRelatedLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    fetchLogDetails();
  }, [id]);

  const fetchLogDetails = async () => {
    setLoading(true);
    try {
      const [logRes, relatedRes] = await Promise.all([
        fetch(`${API_URL}/audit/${id}`, getHeaders()),
        fetch(`${API_URL}/audit/entity/${id}`, getHeaders())
      ]);

      let logData = null;
      let relatedData = [];

      if (logRes.ok) {
        const result = await logRes.json();
        logData = result.data || result;
      }

      if (relatedRes.ok) {
        const result = await relatedRes.json();
        relatedData = result.data || result || [];
      }

      // If no data from API, use mock data
      if (!logData) {
        logData = getMockLog(id);
        toast.info('Showing sample data');
      }

      setLog(logData);
      setRelatedLogs(Array.isArray(relatedData) ? relatedData : []);
    } catch (error) {
      console.error('Error fetching log details:', error);
      // Use mock data as fallback
      setLog(getMockLog(id));
      setRelatedLogs(getMockRelatedLogs());
      toast.error('Failed to fetch data, showing sample');
    } finally {
      setLoading(false);
    }
  };

  const getMockLog = (id) => {
    return {
      _id: id || 'mock_123',
      entityType: 'project',
      action: 'created',
      actionType: 'create',
      description: 'New project "Website Redesign" was created',
      userName: 'Sarah Smith',
      userId: { firstName: 'Sarah', lastName: 'Smith', email: 'sarah@example.com' },
      userRole: 'manager',
      userEmail: 'sarah@example.com',
      entityName: 'Website Redesign',
      entityId: 'project_456',
      importance: 'high',
      status: 'success',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      isRolledBack: false,
      changes: [
        { 
          field: 'name', 
          oldValue: undefined, 
          newValue: 'Website Redesign', 
          changeType: 'create',
          importance: 'high',
          isSensitive: false
        },
        { 
          field: 'priority', 
          oldValue: undefined, 
          newValue: 'high', 
          changeType: 'create',
          importance: 'medium',
          isSensitive: false
        },
        { 
          field: 'budget', 
          oldValue: undefined, 
          newValue: '$50,000', 
          changeType: 'create',
          importance: 'high',
          isSensitive: true
        }
      ]
    };
  };

  const getMockRelatedLogs = () => {
    return [
      {
        _id: 'related_1',
        entityType: 'task',
        action: 'created',
        description: 'Task "Design Homepage" created',
        userName: 'Mike Johnson',
        userId: { firstName: 'Mike', lastName: 'Johnson' },
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
      },
      {
        _id: 'related_2',
        entityType: 'task',
        action: 'updated',
        description: 'Task "Design Homepage" status updated',
        userName: 'Mike Johnson',
        userId: { firstName: 'Mike', lastName: 'Johnson' },
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
      },
      {
        _id: 'related_3',
        entityType: 'comment',
        action: 'created',
        description: 'Comment added to "Website Redesign" project',
        userName: 'Emily Davis',
        userId: { firstName: 'Emily', lastName: 'Davis' },
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      }
    ];
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogDetails();
    setRefreshing(false);
    toast.success('Refreshed');
  };

  const handleCopyId = () => {
    if (log?._id) {
      navigator.clipboard.writeText(log._id);
      toast.success('ID copied to clipboard');
    }
  };

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
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
      'department': Building2,
      'segment': Building2,
      'company': Building2,
      'report': FileText,
      'schedule': Calendar
    };
    const Icon = icons[entityType] || Activity;
    return <Icon className="ad-entity-icon" />;
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
      'comment': '#f97316',
      'activity': '#3b82f6',
      'report': '#3b82f6',
      'schedule': '#8b5cf6'
    };
    return colors[entityType] || '#6b7280';
  };

  const getActionColor = (action) => {
    if (action === 'create' || action === 'created') return 'ad-action-created';
    if (action === 'update' || action === 'updated') return 'ad-action-updated';
    if (action === 'delete' || action === 'deleted') return 'ad-action-deleted';
    if (action === 'login') return 'ad-action-login';
    if (action === 'logout') return 'ad-action-logout';
    if (action === 'approve' || action === 'approved') return 'ad-action-approved';
    if (action === 'reject' || action === 'rejected') return 'ad-action-rejected';
    if (action === 'complete' || action === 'completed') return 'ad-action-completed';
    return 'ad-action-default';
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
    return <Icon className="ad-action-icon" />;
  };

  const getImportanceBadge = (importance) => {
    const colors = {
      'low': 'ad-importance-low',
      'medium': 'ad-importance-medium',
      'high': 'ad-importance-high',
      'critical': 'ad-importance-critical'
    };
    return colors[importance] || 'ad-importance-default';
  };

  const getStatusBadge = (status) => {
    const colors = {
      'success': 'ad-status-success',
      'failure': 'ad-status-failure',
      'pending': 'ad-status-pending'
    };
    return colors[status] || 'ad-status-default';
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

  const getChangeDescription = (change) => {
    if (change.oldValue !== undefined && change.oldValue !== null && change.newValue !== undefined && change.newValue !== null) {
      return `Changed "${change.field}" from "${String(change.oldValue)}" to "${String(change.newValue)}"`;
    } else if (change.newValue !== undefined && change.newValue !== null) {
      return `Set "${change.field}" to "${String(change.newValue)}"`;
    } else if (change.oldValue !== undefined && change.oldValue !== null) {
      return `Removed value for "${change.field}" (was "${String(change.oldValue)}")`;
    }
    return `Updated "${change.field}"`;
  };

  if (loading) {
    return (
      <div className="ad-loading">
        <div className="ad-spinner"></div>
        <p className="ad-loading-text">Loading activity details...</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="ad-not-found">
        <div className="ad-not-found-icon-wrapper">
          <AlertCircle className="ad-not-found-icon" />
        </div>
        <h2 className="ad-not-found-title">Activity Not Found</h2>
        <p className="ad-not-found-subtitle">The activity you're looking for doesn't exist</p>
        <button
          onClick={() => navigate('/activities')}
          className="ad-not-found-btn"
        >
          <ArrowLeft className="ad-not-found-btn-icon" />
          Back to Activities
        </button>
      </div>
    );
  }

  const entityColor = getEntityColor(log.entityType);
  const userName = log.userName || `${log.userId?.firstName || ''} ${log.userId?.lastName || ''}`.trim() || 'System';
  const userEmail = log.userEmail || log.userId?.email || '';

  return (
    <div className="ad-container">
      {/* Header */}
      <div className="ad-header">
        <div className="ad-header-left">
          <button 
            onClick={() => navigate('/activities')}
            className="ad-back-btn"
            title="Back to Activities"
          >
            <ArrowLeft className="ad-back-icon" />
          </button>
          <div className="ad-header-icon" style={{ backgroundColor: `${entityColor}15` }}>
            {getEntityIcon(log.entityType)}
          </div>
          <div>
            <h1 className="ad-title">Activity Details</h1>
            <div className="ad-header-meta">
              <span className={`ad-action-badge ${getActionColor(log.action)}`}>
                {getActionIcon(log.actionType)}
                {log.action}
              </span>
              <span className="ad-meta-separator">•</span>
              <span className="ad-meta-entity" style={{ color: entityColor }}>
                {log.entityType}
              </span>
              <span className="ad-meta-separator">•</span>
              <span className="ad-meta-time">{getTimeAgo(log.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="ad-header-right">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="ad-refresh-btn"
            title="Refresh"
          >
            <RefreshCw className={`ad-refresh-icon ${refreshing ? 'ad-spin' : ''}`} />
          </button>
          <button
            onClick={handleShareLink}
            className="ad-share-btn"
            title="Share Link"
          >
            <Link2 className="ad-share-icon" />
          </button>
          <button
            onClick={handleCopyId}
            className="ad-copy-btn"
            title="Copy ID"
          >
            <Copy className="ad-copy-icon" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ad-grid">
        {/* Left Column - Main Details */}
        <div className="ad-main-col">
          {/* Description */}
          <div className="ad-card">
            <div className="ad-card-header">
              <h3 className="ad-card-title">Description</h3>
            </div>
            <div className="ad-card-body">
              <p className="ad-description">{log.description || log.entityName || 'No description'}</p>
              {log.entityName && (
                <div className="ad-entity-ref">
                  <FileText className="ad-entity-ref-icon" />
                  <span className="ad-entity-ref-name">{log.entityName}</span>
                  <span className="ad-entity-ref-id">({log.entityId})</span>
                </div>
              )}
            </div>
          </div>

          {/* Changes */}
          {log.changes && log.changes.length > 0 && (
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">Changes Made</h3>
                <span className="ad-change-count">{log.changes.length} changes</span>
              </div>
              <div className="ad-card-body">
                <div className="ad-changes-list">
                  {log.changes.map((change, idx) => (
                    <div key={idx} className="ad-change-item">
                      <div className="ad-change-icon">
                        {change.changeType === 'create' && <Plus className="ad-change-icon-svg ad-change-create" />}
                        {change.changeType === 'update' && <Edit className="ad-change-icon-svg ad-change-update" />}
                        {change.changeType === 'delete' && <Trash2 className="ad-change-icon-svg ad-change-delete" />}
                      </div>
                      <div className="ad-change-content">
                        <p className="ad-change-field">{change.field}</p>
                        <p className="ad-change-description">{getChangeDescription(change)}</p>
                        <div className="ad-change-meta">
                          <span className={`ad-change-type ${
                            change.changeType === 'create' ? 'ad-change-type-create' :
                            change.changeType === 'update' ? 'ad-change-type-update' :
                            'ad-change-type-delete'
                          }`}>
                            {change.changeType}
                          </span>
                          {change.importance && (
                            <span className={`ad-change-importance ${getImportanceBadge(change.importance)}`}>
                              {change.importance}
                            </span>
                          )}
                          {change.isSensitive && (
                            <span className="ad-change-sensitive">🔒 Sensitive</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rollback Info */}
          {log.isRolledBack && (
            <div className="ad-rollback-card">
              <AlertCircle className="ad-rollback-icon" />
              <div>
                <h4 className="ad-rollback-title">Rollback Information</h4>
                <p className="ad-rollback-text">
                  This change was rolled back on {formatDate(log.rolledBackAt)} 
                  by {log.rolledBackBy?.firstName} {log.rolledBackBy?.lastName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Meta Information */}
        <div className="ad-meta-col">
          {/* Basic Info */}
          <div className="ad-card">
            <div className="ad-card-header">
              <h3 className="ad-card-title">Basic Information</h3>
            </div>
            <div className="ad-card-body">
              <div className="ad-meta-list">
                <div className="ad-meta-item">
                  <span className="ad-meta-label">ID</span>
                  <span className="ad-meta-value ad-meta-mono">{log._id}</span>
                </div>
                <div className="ad-meta-item">
                  <span className="ad-meta-label">Action</span>
                  <span className="ad-meta-value">{log.action}</span>
                </div>
                <div className="ad-meta-item">
                  <span className="ad-meta-label">Action Type</span>
                  <span className="ad-meta-value">{log.actionType}</span>
                </div>
                <div className="ad-meta-item">
                  <span className="ad-meta-label">Entity Type</span>
                  <span className="ad-meta-value ad-meta-capitalize">{log.entityType}</span>
                </div>
                <div className="ad-meta-item">
                  <span className="ad-meta-label">Entity ID</span>
                  <span className="ad-meta-value ad-meta-mono">{log.entityId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="ad-card">
            <div className="ad-card-header">
              <h3 className="ad-card-title">User Information</h3>
            </div>
            <div className="ad-card-body">
              <div className="ad-user-info">
                <div className="ad-user-avatar" style={{ backgroundColor: `${entityColor}25` }}>
                  <span className="ad-user-initials">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div className="ad-user-details">
                  <p className="ad-user-name">{userName}</p>
                  {userEmail && <p className="ad-user-email">{userEmail}</p>}
                </div>
              </div>
              <div className="ad-meta-list">
                <div className="ad-meta-item">
                  <span className="ad-meta-label">Role</span>
                  <span className="ad-meta-value">{log.userRole || 'N/A'}</span>
                </div>
                <div className="ad-meta-item">
                  <span className="ad-meta-label">IP Address</span>
                  <span className="ad-meta-value ad-meta-mono">{log.ipAddress || 'N/A'}</span>
                </div>
                <div className="ad-meta-item">
                  <span className="ad-meta-label">User Agent</span>
                  <span className="ad-meta-value ad-meta-truncate">{log.userAgent || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="ad-card">
            <div className="ad-card-header">
              <h3 className="ad-card-title">Timestamps</h3>
            </div>
            <div className="ad-card-body">
              <div className="ad-meta-list">
                <div className="ad-meta-item">
                  <span className="ad-meta-label">Created At</span>
                  <span className="ad-meta-value ad-meta-time">
                    <Calendar className="ad-meta-time-icon" />
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <div className="ad-meta-item">
                  <span className="ad-meta-label">Time Ago</span>
                  <span className="ad-meta-value">{getTimeAgo(log.createdAt)}</span>
                </div>
                {log.updatedAt && (
                  <div className="ad-meta-item">
                    <span className="ad-meta-label">Updated At</span>
                    <span className="ad-meta-value ad-meta-time">
                      <Clock className="ad-meta-time-icon" />
                      {formatDate(log.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="ad-card">
            <div className="ad-card-header">
              <h3 className="ad-card-title">Status</h3>
            </div>
            <div className="ad-card-body">
              <div className="ad-badges">
                {log.importance && (
                  <span className={`ad-badge ${getImportanceBadge(log.importance)}`}>
                    {log.importance}
                  </span>
                )}
                {log.status && (
                  <span className={`ad-badge ${getStatusBadge(log.status)}`}>
                    {log.status}
                  </span>
                )}
                {log.isRolledBack && (
                  <span className="ad-badge ad-badge-rollback">
                    🔄 Rolled Back
                  </span>
                )}
                {log.actionType === 'delete' && (
                  <span className="ad-badge ad-badge-deletion">
                    🗑️ Deletion
                  </span>
                )}
                {log.isSensitive && (
                  <span className="ad-badge ad-badge-sensitive">
                    🔒 Sensitive
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Activities */}
      {relatedLogs.length > 0 && (
        <div className="ad-related">
          <div className="ad-related-header">
            <h3 className="ad-related-title">Related Activities</h3>
            <span className="ad-related-count">{relatedLogs.length} related</span>
          </div>
          <div className="ad-related-list">
            {relatedLogs.filter(l => l._id !== log._id).slice(0, 5).map((rel) => (
              <div 
                key={rel._id} 
                className="ad-related-item"
                onClick={() => navigate(`/activities/${rel._id}`)}
              >
                <div className="ad-related-icon" style={{ backgroundColor: `${getEntityColor(rel.entityType)}15` }}>
                  {getEntityIcon(rel.entityType)}
                </div>
                <div className="ad-related-content">
                  <p className="ad-related-description">{rel.description || rel.entityName || 'No description'}</p>
                  <div className="ad-related-meta">
                    <span className="ad-related-user">{rel.userName || rel.userId?.firstName || 'System'}</span>
                    <span className="ad-related-separator">•</span>
                    <span className="ad-related-time">{getTimeAgo(rel.createdAt)}</span>
                  </div>
                </div>
                <button className="ad-related-arrow">
                  <ChevronRight className="ad-related-arrow-icon" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .ad-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .ad-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .ad-spinner {
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

        .ad-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
        }

        /* ============================================
           NOT FOUND
           ============================================ */
        .ad-not-found {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .ad-not-found-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .ad-not-found-icon {
          width: 40px;
          height: 40px;
          color: #9ca3af;
        }

        .ad-not-found-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .ad-not-found-subtitle {
          color: #6b7280;
          margin-top: 4px;
        }

        .ad-not-found-btn {
          display: flex;
          align-items: center;
          gap: 8px;
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

        .ad-not-found-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .ad-not-found-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           HEADER
           ============================================ */
        .ad-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .ad-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ad-back-btn {
          padding: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .ad-back-btn:hover {
          background: #f3f4f6;
        }

        .ad-back-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
        }

        .ad-header-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ad-entity-icon {
          width: 22px;
          height: 22px;
          color: #3b82f6;
        }

        .ad-title {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .ad-header-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 2px;
        }

        .ad-action-badge {
          padding: 2px 10px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .ad-action-icon {
          width: 12px;
          height: 12px;
        }

        .ad-action-created { background: #dcfce7; color: #16a34a; }
        .ad-action-updated { background: #dbeafe; color: #1d4ed8; }
        .ad-action-deleted { background: #fee2e2; color: #dc2626; }
        .ad-action-completed { background: #d1fae5; color: #059669; }
        .ad-action-approved { background: #dbeafe; color: #1d4ed8; }
        .ad-action-rejected { background: #fef3c7; color: #d97706; }
        .ad-action-login { background: #ede9fe; color: #7c3aed; }
        .ad-action-logout { background: #f3f4f6; color: #6b7280; }
        .ad-action-default { background: #f3f4f6; color: #6b7280; }

        .ad-meta-separator {
          color: #9ca3af;
        }

        .ad-meta-entity {
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .ad-meta-time {
          font-size: 12px;
          color: #6b7280;
        }

        .ad-header-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ad-refresh-btn,
        .ad-share-btn,
        .ad-copy-btn {
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

        .ad-refresh-btn:hover:not(:disabled),
        .ad-share-btn:hover,
        .ad-copy-btn:hover {
          background: #f3f4f6;
        }

        .ad-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ad-refresh-icon,
        .ad-share-icon,
        .ad-copy-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .ad-spin {
          animation: spin 0.8s linear infinite;
        }

        /* ============================================
           GRID
           ============================================ */
        .ad-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .ad-grid {
            grid-template-columns: 1fr;
          }
        }

        .ad-main-col,
        .ad-meta-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ============================================
           CARD
           ============================================ */
        .ad-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .ad-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
        }

        .ad-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .ad-card-body {
          padding: 16px 20px;
        }

        /* ============================================
           DESCRIPTION
           ============================================ */
        .ad-description {
          font-size: 15px;
          color: #4b5563;
          margin: 0;
          line-height: 1.6;
        }

        .ad-entity-ref {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          padding: 4px 12px;
          background: #f3f4f6;
          border-radius: 6px;
          font-size: 13px;
          color: #6b7280;
        }

        .ad-entity-ref-icon {
          width: 14px;
          height: 14px;
        }

        .ad-entity-ref-name {
          font-weight: 500;
          color: #111827;
        }

        .ad-entity-ref-id {
          color: #9ca3af;
        }

        /* ============================================
           CHANGES
           ============================================ */
        .ad-change-count {
          font-size: 12px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 10px;
          border-radius: 9999px;
        }

        .ad-changes-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ad-change-item {
          display: flex;
          gap: 12px;
          padding: 12px 14px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #f3f4f6;
        }

        .ad-change-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .ad-change-icon-svg {
          width: 16px;
          height: 16px;
        }

        .ad-change-create { color: #16a34a; }
        .ad-change-update { color: #1d4ed8; }
        .ad-change-delete { color: #dc2626; }

        .ad-change-content {
          flex: 1;
          min-width: 0;
        }

        .ad-change-field {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .ad-change-description {
          font-size: 13px;
          color: #4b5563;
          margin: 2px 0 0 0;
        }

        .ad-change-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .ad-change-type {
          padding: 1px 8px;
          font-size: 10px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .ad-change-type-create { background: #dcfce7; color: #16a34a; }
        .ad-change-type-update { background: #dbeafe; color: #1d4ed8; }
        .ad-change-type-delete { background: #fee2e2; color: #dc2626; }

        .ad-change-importance {
          padding: 1px 8px;
          font-size: 10px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .ad-change-sensitive {
          padding: 1px 8px;
          font-size: 10px;
          font-weight: 500;
          border-radius: 9999px;
          background: #fee2e2;
          color: #dc2626;
        }

        /* ============================================
           ROLLBACK
           ============================================ */
        .ad-rollback-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 20px;
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 12px;
        }

        .ad-rollback-icon {
          width: 20px;
          height: 20px;
          color: #d97706;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .ad-rollback-title {
          font-size: 14px;
          font-weight: 600;
          color: #92400e;
          margin: 0;
        }

        .ad-rollback-text {
          font-size: 13px;
          color: #78350f;
          margin: 2px 0 0 0;
        }

        /* ============================================
           META LIST
           ============================================ */
        .ad-meta-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ad-meta-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 13px;
          border-bottom: 1px solid #f9fafb;
        }

        .ad-meta-item:last-child {
          border-bottom: none;
        }

        .ad-meta-label {
          color: #6b7280;
          font-weight: 500;
        }

        .ad-meta-value {
          color: #111827;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }

        .ad-meta-mono {
          font-family: monospace;
          font-size: 12px;
        }

        .ad-meta-capitalize {
          text-transform: capitalize;
        }

        .ad-meta-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ad-meta-time {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ad-meta-time-icon {
          width: 14px;
          height: 14px;
          color: #9ca3af;
        }

        /* ============================================
           USER INFO
           ============================================ */
        .ad-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .ad-user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ad-user-initials {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .ad-user-details {
          flex: 1;
          min-width: 0;
        }

        .ad-user-name {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .ad-user-email {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }

        /* ============================================
           BADGES
           ============================================ */
        .ad-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .ad-badge {
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .ad-importance-low { background: #f3f4f6; color: #6b7280; }
        .ad-importance-medium { background: #dbeafe; color: #1d4ed8; }
        .ad-importance-high { background: #fef3c7; color: #d97706; }
        .ad-importance-critical { background: #fee2e2; color: #dc2626; }
        .ad-importance-default { background: #f3f4f6; color: #6b7280; }

        .ad-status-success { background: #dcfce7; color: #16a34a; }
        .ad-status-failure { background: #fee2e2; color: #dc2626; }
        .ad-status-pending { background: #fef3c7; color: #d97706; }
        .ad-status-default { background: #f3f4f6; color: #6b7280; }

        .ad-badge-rollback { background: #fef3c7; color: #92400e; }
        .ad-badge-deletion { background: #fee2e2; color: #dc2626; }
        .ad-badge-sensitive { background: #fce4ec; color: #c62828; }

        /* ============================================
           RELATED
           ============================================ */
        .ad-related {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          margin-top: 16px;
          overflow: hidden;
        }

        .ad-related-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
        }

        .ad-related-title {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .ad-related-count {
          font-size: 12px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 10px;
          border-radius: 9999px;
        }

        .ad-related-list {
          padding: 4px 0;
        }

        .ad-related-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          cursor: pointer;
          transition: background 0.2s ease;
          border-bottom: 1px solid #f9fafb;
        }

        .ad-related-item:last-child {
          border-bottom: none;
        }

        .ad-related-item:hover {
          background: #f9fafb;
        }

        .ad-related-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ad-related-icon .ad-entity-icon {
          width: 16px;
          height: 16px;
        }

        .ad-related-content {
          flex: 1;
          min-width: 0;
        }

        .ad-related-description {
          font-size: 14px;
          color: #111827;
          margin: 0;
        }

        .ad-related-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .ad-related-user {
          font-weight: 500;
        }

        .ad-related-separator {
          color: #9ca3af;
        }

        .ad-related-arrow {
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
        }

        .ad-related-arrow:hover {
          background: #f3f4f6;
        }

        .ad-related-arrow-icon {
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .ad-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .ad-header-right {
            width: 100%;
            justify-content: flex-end;
          }

          .ad-grid {
            grid-template-columns: 1fr;
          }

          .ad-title {
            font-size: 20px;
          }

          .ad-header-icon {
            width: 40px;
            height: 40px;
          }

          .ad-entity-icon {
            width: 18px;
            height: 18px;
          }

          .ad-meta-item {
            flex-direction: column;
            gap: 2px;
          }

          .ad-meta-value {
            text-align: left;
            max-width: 100%;
          }

          .ad-change-item {
            flex-direction: column;
          }

          .ad-change-meta {
            flex-wrap: wrap;
          }

          .ad-related-item {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .ad-header-left {
            flex-wrap: wrap;
          }

          .ad-header-meta {
            flex-wrap: wrap;
          }

          .ad-card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .ad-user-info {
            flex-direction: column;
            text-align: center;
          }

          .ad-badges {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ActivityDetails;