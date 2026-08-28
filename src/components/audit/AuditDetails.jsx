// components/audit/AuditDetails.jsx - COMPLETE MODERN VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X, User, Clock, Calendar, Layers,
  Users, Briefcase, Target, CheckCircle,
  AlertCircle, FileText, Building2, Activity,
  ChevronLeft, ChevronRight, Copy, Link2,
  Plus, Edit, Trash2, LogIn, LogOut, XCircle,
  Eye, Download, Share2, MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

const AuditDetails = ({ 
  logId, 
  isOpen, 
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext
}) => {
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
    if (logId && isOpen) {
      fetchLogDetails();
    }
  }, [logId, isOpen]);

  const fetchLogDetails = async () => {
    setLoading(true);
    try {
      const [logRes, relatedRes] = await Promise.all([
        fetch(`${API_URL}/audit/${logId}`, getHeaders()),
        fetch(`${API_URL}/audit/entity/${logId}?limit=10`, getHeaders())
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
        logData = getMockLog(logId);
        toast.info('Showing sample data');
      }

      setLog(logData);
      setRelatedLogs(Array.isArray(relatedData) ? relatedData : []);
    } catch (error) {
      console.error('Error fetching audit details:', error);
      setLog(getMockLog(logId));
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
      'department': '#3b82f6',
      'segment': '#8b5cf6',
      'company': '#6b7280',
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

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="ad-modal-overlay" onClick={onClose}>
        <div className="ad-modal ad-modal-loading" onClick={(e) => e.stopPropagation()}>
          <div className="ad-spinner"></div>
          <p className="ad-loading-text">Loading audit details...</p>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="ad-modal-overlay" onClick={onClose}>
        <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ad-modal-body ad-empty-state">
            <AlertCircle className="ad-empty-icon" />
            <h3 className="ad-empty-title">Audit Log Not Found</h3>
            <p className="ad-empty-subtitle">The requested audit log could not be found</p>
            <button onClick={onClose} className="ad-empty-btn">Close</button>
          </div>
        </div>
      </div>
    );
  }

  const entityColor = getEntityColor(log.entityType);
  const userName = log.userName || `${log.userId?.firstName || ''} ${log.userId?.lastName || ''}`.trim() || 'System';
  const userEmail = log.userEmail || log.userId?.email || '';

  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ad-modal-header">
          <div className="ad-modal-header-left">
            <div className="ad-modal-icon" style={{ backgroundColor: `${entityColor}15` }}>
              {getEntityIcon(log.entityType)}
            </div>
            <div>
              <h2 className="ad-modal-title">Audit Log Details</h2>
              <div className="ad-modal-meta">
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
          <div className="ad-modal-header-right">
            {hasPrevious && (
              <button onClick={onPrevious} className="ad-nav-btn" title="Previous">
                <ChevronLeft className="ad-nav-icon" />
              </button>
            )}
            {hasNext && (
              <button onClick={onNext} className="ad-nav-btn" title="Next">
                <ChevronRight className="ad-nav-icon" />
              </button>
            )}
            <button onClick={handleRefresh} disabled={refreshing} className="ad-refresh-btn" title="Refresh">
              <div className={`ad-refresh-icon ${refreshing ? 'ad-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="ad-close-btn" title="Close">
              <X className="ad-close-icon" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="ad-modal-body">
          {/* Summary */}
          <div className="ad-summary">
            <p className="ad-summary-text">{log.description || log.entityName || 'No description'}</p>
            {log.entityName && (
              <p className="ad-summary-entity">
                <FileText className="ad-summary-entity-icon" />
                <span className="ad-summary-entity-name">{log.entityName}</span>
                <span className="ad-summary-entity-id">({log.entityId})</span>
              </p>
            )}
          </div>

          {/* Badges */}
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
              <span className="ad-badge ad-badge-rollback">🔄 Rolled Back</span>
            )}
            {log.actionType === 'delete' && (
              <span className="ad-badge ad-badge-deletion">🗑️ Deletion</span>
            )}
          </div>

          {/* Details Grid */}
          <div className="ad-details-grid">
            <div className="ad-details-section">
              <h4 className="ad-details-title">Action</h4>
              <p className="ad-details-value">{log.action}</p>
            </div>
            <div className="ad-details-section">
              <h4 className="ad-details-title">Action Type</h4>
              <p className="ad-details-value">{log.actionType}</p>
            </div>
            <div className="ad-details-section">
              <h4 className="ad-details-title">Entity Type</h4>
              <p className="ad-details-value ad-details-capitalize">{log.entityType}</p>
            </div>
            <div className="ad-details-section">
              <h4 className="ad-details-title">Entity ID</h4>
              <p className="ad-details-value ad-details-mono">{log.entityId}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="ad-user-card">
            <h4 className="ad-user-card-title">User Information</h4>
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
            <div className="ad-user-meta-grid">
              <div className="ad-user-meta-item">
                <span className="ad-user-meta-label">Role</span>
                <span className="ad-user-meta-value">{log.userRole || 'N/A'}</span>
              </div>
              <div className="ad-user-meta-item">
                <span className="ad-user-meta-label">IP Address</span>
                <span className="ad-user-meta-value ad-details-mono">{log.ipAddress || 'N/A'}</span>
              </div>
              <div className="ad-user-meta-item ad-user-meta-full">
                <span className="ad-user-meta-label">User Agent</span>
                <span className="ad-user-meta-value ad-details-truncate">{log.userAgent || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="ad-timestamps">
            <div className="ad-timestamp-item">
              <h4 className="ad-details-title">Created At</h4>
              <p className="ad-details-value ad-details-time">
                <Calendar className="ad-details-time-icon" />
                {formatDate(log.createdAt)}
              </p>
            </div>
            {log.updatedAt && (
              <div className="ad-timestamp-item">
                <h4 className="ad-details-title">Updated At</h4>
                <p className="ad-details-value ad-details-time">
                  <Clock className="ad-details-time-icon" />
                  {formatDate(log.updatedAt)}
                </p>
              </div>
            )}
          </div>

          {/* Changes */}
          {log.changes && log.changes.length > 0 && (
            <div className="ad-changes">
              <h4 className="ad-changes-title">Changes Made</h4>
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
          )}

          {/* Rollback Info */}
          {log.isRolledBack && (
            <div className="ad-rollback">
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

          {/* Related Logs */}
          {relatedLogs.length > 0 && (
            <div className="ad-related">
              <h4 className="ad-related-title">Related Audit Logs</h4>
              <div className="ad-related-list">
                {relatedLogs.filter(l => l._id !== log._id).slice(0, 5).map((rel) => (
                  <div key={rel._id} className="ad-related-item">
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
                    <Eye className="ad-related-eye" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ad-modal-footer">
          <span className="ad-footer-id">ID: {log._id}</span>
          <div className="ad-footer-actions">
            <button onClick={handleCopyId} className="ad-footer-btn" title="Copy ID">
              <Copy className="ad-footer-icon" />
            </button>
            <button onClick={handleShareLink} className="ad-footer-btn" title="Share Link">
              <Link2 className="ad-footer-icon" />
            </button>
            <button onClick={onClose} className="ad-footer-close-btn">
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* ============================================
           OVERLAY
           ============================================ */
        .ad-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
          animation: overlayFadeIn 0.3s ease;
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .ad-spin {
          animation: spin 0.8s linear infinite;
        }

        /* ============================================
           MODAL
           ============================================ */
        .ad-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          animation: modalSlideIn 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .ad-modal-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          gap: 16px;
        }

        .ad-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .ad-loading-text {
          color: #6b7280;
          font-size: 14px;
        }

        /* ============================================
           HEADER
           ============================================ */
        .ad-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          background: #f9fafb;
          flex-shrink: 0;
        }

        .ad-modal-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .ad-modal-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ad-entity-icon {
          width: 20px;
          height: 20px;
          color: #3b82f6;
        }

        .ad-modal-title {
          font-size: 17px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .ad-modal-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          font-size: 12px;
        }

        .ad-action-badge {
          padding: 2px 10px;
          font-size: 11px;
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

        .ad-meta-separator { color: #9ca3af; }
        .ad-meta-entity { font-weight: 500; text-transform: capitalize; }
        .ad-meta-time { color: #6b7280; }

        .ad-modal-header-right {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .ad-nav-btn {
          padding: 6px 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
        }

        .ad-nav-btn:hover {
          background: #f3f4f6;
        }

        .ad-nav-icon {
          width: 18px;
          height: 18px;
          color: #6b7280;
        }

        .ad-refresh-btn {
          padding: 6px 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
        }

        .ad-refresh-btn:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .ad-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ad-refresh-icon {
          width: 16px;
          height: 16px;
          border: 2px solid #d1d5db;
          border-top-color: #3b82f6;
          border-radius: 50%;
        }

        .ad-close-btn {
          padding: 6px 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
        }

        .ad-close-btn:hover {
          background: #f3f4f6;
        }

        .ad-close-icon {
          width: 18px;
          height: 18px;
          color: #6b7280;
        }

        /* ============================================
           BODY
           ============================================ */
        .ad-modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        /* ============================================
           SUMMARY
           ============================================ */
        .ad-summary {
          background: #f9fafb;
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 16px;
        }

        .ad-summary-text {
          color: #4b5563;
          font-size: 15px;
          margin: 0;
          line-height: 1.6;
        }

        .ad-summary-entity {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 6px;
          padding: 2px 10px;
          background: #ffffff;
          border-radius: 4px;
          font-size: 13px;
          color: #6b7280;
        }

        .ad-summary-entity-icon { width: 14px; height: 14px; }
        .ad-summary-entity-name { font-weight: 500; color: #111827; }
        .ad-summary-entity-id { color: #9ca3af; }

        /* ============================================
           BADGES
           ============================================ */
        .ad-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .ad-badge {
          padding: 3px 12px;
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

        /* ============================================
           DETAILS GRID
           ============================================ */
        .ad-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        @media (max-width: 480px) {
          .ad-details-grid {
            grid-template-columns: 1fr;
          }
        }

        .ad-details-section {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ad-details-title {
          font-size: 11px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .ad-details-value {
          font-size: 14px;
          color: #111827;
        }

        .ad-details-mono { font-family: monospace; font-size: 13px; }
        .ad-details-capitalize { text-transform: capitalize; }
        .ad-details-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ad-details-time { display: flex; align-items: center; gap: 4px; }
        .ad-details-time-icon { width: 14px; height: 14px; color: #9ca3af; }

        /* ============================================
           USER CARD
           ============================================ */
        .ad-user-card {
          background: #f9fafb;
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 16px;
        }

        .ad-user-card-title {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 10px 0;
        }

        .ad-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .ad-user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ad-user-initials {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .ad-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .ad-user-email {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }

        .ad-user-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
        }

        @media (max-width: 640px) {
          .ad-user-meta-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .ad-user-meta-grid {
            grid-template-columns: 1fr;
          }
        }

        .ad-user-meta-item {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .ad-user-meta-full {
          grid-column: 1 / -1;
        }

        .ad-user-meta-label {
          font-size: 10px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ad-user-meta-value {
          font-size: 13px;
          color: #111827;
        }

        /* ============================================
           TIMESTAMPS
           ============================================ */
        .ad-timestamps {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        @media (max-width: 480px) {
          .ad-timestamps {
            grid-template-columns: 1fr;
          }
        }

        .ad-timestamp-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        /* ============================================
           CHANGES
           ============================================ */
        .ad-changes {
          margin-bottom: 16px;
        }

        .ad-changes-title {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 10px 0;
        }

        .ad-changes-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ad-change-item {
          display: flex;
          gap: 10px;
          padding: 10px 12px;
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
          font-size: 13px;
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
          gap: 4px;
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
        .ad-rollback {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .ad-rollback-icon {
          width: 18px;
          height: 18px;
          color: #d97706;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .ad-rollback-title {
          font-size: 13px;
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
           RELATED
           ============================================ */
        .ad-related {
          margin-top: 4px;
        }

        .ad-related-title {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 10px 0;
        }

        .ad-related-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ad-related-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .ad-related-item:hover {
          background: #f3f4f6;
        }

        .ad-related-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ad-related-icon .ad-entity-icon {
          width: 14px;
          height: 14px;
        }

        .ad-related-content {
          flex: 1;
          min-width: 0;
        }

        .ad-related-description {
          font-size: 13px;
          color: #111827;
          margin: 0;
        }

        .ad-related-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #6b7280;
          margin-top: 2px;
        }

        .ad-related-user { font-weight: 500; }
        .ad-related-separator { color: #9ca3af; }

        .ad-related-eye {
          width: 14px;
          height: 14px;
          color: #9ca3af;
          flex-shrink: 0;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .ad-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
          text-align: center;
        }

        .ad-empty-icon {
          width: 48px;
          height: 48px;
          color: #9ca3af;
          margin-bottom: 12px;
        }

        .ad-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .ad-empty-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }

        .ad-empty-btn {
          margin-top: 16px;
          padding: 8px 24px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .ad-empty-btn:hover {
          background: #2563eb;
        }

        /* ============================================
           FOOTER
           ============================================ */
        .ad-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          border-top: 1px solid #f3f4f6;
          background: #f9fafb;
          flex-shrink: 0;
        }

        .ad-footer-id {
          font-size: 12px;
          color: #9ca3af;
          font-family: monospace;
        }

        .ad-footer-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ad-footer-btn {
          padding: 6px 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
        }

        .ad-footer-btn:hover {
          background: #f3f4f6;
        }

        .ad-footer-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .ad-footer-close-btn {
          padding: 6px 16px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
          margin-left: 4px;
        }

        .ad-footer-close-btn:hover {
          background: #2563eb;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 640px) {
          .ad-modal {
            max-height: 95vh;
            margin: 8px;
          }

          .ad-modal-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .ad-modal-header-right {
            width: 100%;
            justify-content: flex-end;
          }

          .ad-modal-body {
            padding: 14px;
          }

          .ad-details-grid {
            grid-template-columns: 1fr;
          }

          .ad-timestamps {
            grid-template-columns: 1fr;
          }

          .ad-user-meta-grid {
            grid-template-columns: 1fr;
          }

          .ad-modal-footer {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .ad-footer-actions {
            width: 100%;
            justify-content: flex-end;
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
          .ad-modal {
            max-height: 98vh;
            margin: 4px;
          }

          .ad-modal-header-left {
            flex-wrap: wrap;
          }

          .ad-modal-meta {
            flex-wrap: wrap;
          }

          .ad-details-grid {
            grid-template-columns: 1fr;
          }

          .ad-footer-actions {
            flex-wrap: wrap;
          }

          .ad-footer-close-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AuditDetails;