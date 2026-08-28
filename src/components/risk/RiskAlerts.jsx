import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell, AlertTriangle, AlertCircle, AlertOctagon,
  CheckCircle, Clock, Eye, RefreshCw,
  Filter, X, Check, ChevronDown, ChevronRight,
  Activity, Users, Calendar, Shield, Zap,
  Mail, MessageCircle, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

const RiskAlerts = () => {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    type: 'all'
  });
  const [expanded, setExpanded] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    critical: 0,
    acknowledged: 0,
    resolved: 0
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  const fetchAlerts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (filters.severity !== 'all') params.append('severity', filters.severity);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);

      const response = await fetch(`${API_URL}/risks/alerts?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const data = result.data || [];
          setAlerts(data);
          
          // Calculate stats
          const total = data.length;
          const unread = data.filter(a => a.status === 'pending' || a.status === 'sent').length;
          const critical = data.filter(a => a.severity === 'critical').length;
          const acknowledged = data.filter(a => a.status === 'acknowledged').length;
          const resolved = data.filter(a => a.status === 'resolved').length;
          setStats({ total, unread, critical, acknowledged, resolved });
        } else {
          throw new Error(result.message || 'Failed to fetch alerts');
        }
      } else {
        throw new Error('Failed to fetch alerts');
      }
    } catch (error) {
      console.error('Error fetching risk alerts:', error);
      toast.error(error.message || 'Failed to load alerts');
      setAlerts(getMockAlerts());
      toast.info('Showing sample alert data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockAlerts = () => {
    return [
      {
        _id: '1',
        title: 'Critical Data Breach Risk Detected',
        message: 'Potential data breach due to unpatched vulnerabilities in the authentication system. Immediate action required.',
        severity: 'critical',
        status: 'pending',
        type: 'security',
        escalationLevel: 2,
        isEscalated: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        recipients: [
          { userId: { firstName: 'John', lastName: 'Doe' }, deliveryStatus: 'sent' },
          { userId: { firstName: 'Sarah', lastName: 'Smith' }, deliveryStatus: 'read' }
        ]
      },
      {
        _id: '2',
        title: 'Project Delivery Risk Alert',
        message: 'Project delivery at risk due to resource constraints and scope creep. Mitigation plan required.',
        severity: 'high',
        status: 'sent',
        type: 'operational',
        escalationLevel: 1,
        isEscalated: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        recipients: [
          { userId: { firstName: 'Mike', lastName: 'Johnson' }, deliveryStatus: 'sent' }
        ]
      },
      {
        _id: '3',
        title: 'Compliance Violation Warning',
        message: 'GDPR compliance requirements not fully met. Additional training and procedure updates needed.',
        severity: 'medium',
        status: 'acknowledged',
        type: 'compliance',
        escalationLevel: 0,
        isEscalated: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        recipients: [
          { userId: { firstName: 'Emma', lastName: 'Wilson' }, deliveryStatus: 'read' }
        ]
      },
      {
        _id: '4',
        title: 'Budget Overrun Notification',
        message: 'Budget overrun detected due to increased operational costs. Cost optimization measures recommended.',
        severity: 'low',
        status: 'resolved',
        type: 'financial',
        escalationLevel: 0,
        isEscalated: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        recipients: [
          { userId: { firstName: 'David', lastName: 'Lee' }, deliveryStatus: 'read' }
        ]
      }
    ];
  };

  const handleRefresh = () => {
    fetchAlerts(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const acknowledgeAlert = async (id) => {
    try {
      const response = await fetch(`${API_URL}/risks/alerts/${id}/acknowledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Alert acknowledged successfully');
        fetchAlerts(true);
      } else {
        throw new Error('Failed to acknowledge alert');
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error(error.message || 'Failed to acknowledge alert');
    }
  };

  const resolveAlert = async (id, resolution) => {
    try {
      const response = await fetch(`${API_URL}/risks/alerts/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolution: resolution || 'Alert resolved' })
      });

      if (response.ok) {
        toast.success('Alert resolved successfully');
        fetchAlerts(true);
      } else {
        throw new Error('Failed to resolve alert');
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error(error.message || 'Failed to resolve alert');
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'ra-severity-critical',
      'high': 'ra-severity-high',
      'medium': 'ra-severity-medium',
      'low': 'ra-severity-low'
    };
    return colors[severity] || 'ra-severity-default';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return <AlertOctagon className="ra-icon" />;
    if (severity === 'high') return <AlertCircle className="ra-icon" />;
    if (severity === 'medium') return <AlertTriangle className="ra-icon" />;
    return <CheckCircle className="ra-icon" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'ra-status-pending',
      'sent': 'ra-status-sent',
      'acknowledged': 'ra-status-acknowledged',
      'resolved': 'ra-status-resolved',
      'failed': 'ra-status-failed'
    };
    return colors[status] || 'ra-status-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'sent': 'Sent',
      'acknowledged': 'Acknowledged',
      'resolved': 'Resolved',
      'failed': 'Failed'
    };
    return labels[status] || status;
  };

  const getTypeBadge = (type) => {
    const colors = {
      'security': 'ra-type-security',
      'operational': 'ra-type-operational',
      'compliance': 'ra-type-compliance',
      'financial': 'ra-type-financial',
      'strategic': 'ra-type-strategic'
    };
    return colors[type] || 'ra-type-default';
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const severityOptions = [
    { value: 'all', label: 'All Severity' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'sent', label: 'Sent' },
    { value: 'acknowledged', label: 'Acknowledged' },
    { value: 'resolved', label: 'Resolved' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'security', label: 'Security' },
    { value: 'operational', label: 'Operational' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'financial', label: 'Financial' },
    { value: 'strategic', label: 'Strategic' }
  ];

  if (loading) {
    return (
      <div className="ra-loading">
        <div className="ra-spinner"></div>
        <p className="ra-loading-text">Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="ra-container">
      {/* Header */}
      <div className="ra-header">
        <div className="ra-header-left">
          <div className="ra-header-icon">
            <Bell className="ra-header-svg" />
          </div>
          <div>
            <h1 className="ra-title">Risk Alerts</h1>
            <p className="ra-subtitle">Real-time risk notifications and alerts</p>
          </div>
          <span className="ra-count">{alerts.length} alerts</span>
        </div>
        <div className="ra-header-right">
          <button onClick={handleRefresh} disabled={refreshing} className="ra-icon-btn">
            <RefreshCw className={`ra-refresh-icon ${refreshing ? 'ra-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="ra-stats">
        <div className="ra-stat-card">
          <div className="ra-stat-content">
            <div className="ra-stat-left">
              <p className="ra-stat-label">Total Alerts</p>
              <p className="ra-stat-number">{stats.total}</p>
            </div>
            <div className="ra-stat-icon-wrapper ra-stat-icon-total">
              <Bell className="ra-stat-icon" />
            </div>
          </div>
        </div>
        <div className="ra-stat-card ra-stat-unread">
          <div className="ra-stat-content">
            <div className="ra-stat-left">
              <p className="ra-stat-label">Unread</p>
              <p className="ra-stat-number ra-stat-number-unread">{stats.unread}</p>
            </div>
            <div className="ra-stat-icon-wrapper ra-stat-icon-unread">
              <Clock className="ra-stat-icon" />
            </div>
          </div>
        </div>
        <div className="ra-stat-card ra-stat-critical">
          <div className="ra-stat-content">
            <div className="ra-stat-left">
              <p className="ra-stat-label">Critical</p>
              <p className="ra-stat-number ra-stat-number-critical">{stats.critical}</p>
            </div>
            <div className="ra-stat-icon-wrapper ra-stat-icon-critical">
              <AlertOctagon className="ra-stat-icon" />
            </div>
          </div>
        </div>
        <div className="ra-stat-card ra-stat-resolved">
          <div className="ra-stat-content">
            <div className="ra-stat-left">
              <p className="ra-stat-label">Resolved</p>
              <p className="ra-stat-number ra-stat-number-resolved">{stats.resolved}</p>
            </div>
            <div className="ra-stat-icon-wrapper ra-stat-icon-resolved">
              <CheckCircle className="ra-stat-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="ra-filters">
        <select
          value={filters.severity}
          onChange={(e) => handleFilterChange('severity', e.target.value)}
          className="ra-filter-select"
        >
          {severityOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="ra-filter-select"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="ra-filter-select"
        >
          {typeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {(filters.severity !== 'all' || filters.status !== 'all' || filters.type !== 'all') && (
          <button
            onClick={() => setFilters({ severity: 'all', status: 'all', type: 'all' })}
            className="ra-clear-btn"
          >
            <X className="ra-clear-icon" />
            Clear
          </button>
        )}
      </div>

      {/* Alerts List */}
      <div className="ra-list-container">
        {alerts.length === 0 ? (
          <div className="ra-empty">
            <div className="ra-empty-icon-wrapper">
              <Bell className="ra-empty-icon" />
            </div>
            <h3 className="ra-empty-title">No alerts found</h3>
            <p className="ra-empty-subtitle">Everything looks good! 🎉</p>
          </div>
        ) : (
          <div className="ra-list">
            {alerts.map((alert) => (
              <div 
                key={alert._id} 
                className={`ra-card ${alert.status === 'pending' || alert.status === 'sent' ? 'ra-card-unread' : ''}`}
              >
                <div className="ra-card-header" onClick={() => toggleExpand(alert._id)}>
                  <div className="ra-card-left">
                    <div className="ra-expand-btn">
                      {expanded[alert._id] ? (
                        <ChevronDown className="ra-expand-icon" />
                      ) : (
                        <ChevronRight className="ra-expand-icon" />
                      )}
                    </div>

                    <div className={`ra-card-severity ${getSeverityColor(alert.severity)}`}>
                      {getSeverityIcon(alert.severity)}
                    </div>

                    <div className="ra-card-info">
                      <div className="ra-card-title-row">
                        <h4 className="ra-card-title">{alert.title}</h4>
                        <span className={`ra-card-status ${getStatusColor(alert.status)}`}>
                          {getStatusLabel(alert.status)}
                        </span>
                        <span className={`ra-card-type ${getTypeBadge(alert.type)}`}>
                          {alert.type}
                        </span>
                        {alert.isEscalated && (
                          <span className="ra-card-escalated">⚡ Escalated</span>
                        )}
                      </div>

                      <p className="ra-card-message">{alert.message}</p>

                      <div className="ra-card-meta">
                        <span className="ra-card-meta-item">
                          <Clock className="ra-card-meta-icon" />
                          {getTimeAgo(alert.createdAt)}
                        </span>
                        {alert.recipients && alert.recipients.length > 0 && (
                          <span className="ra-card-meta-item">
                            <Users className="ra-card-meta-icon" />
                            {alert.recipients.length} recipients
                          </span>
                        )}
                        {alert.escalationLevel > 0 && (
                          <span className="ra-card-meta-item">
                            <Activity className="ra-card-meta-icon" />
                            Escalation Level: {alert.escalationLevel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ra-card-actions" onClick={(e) => e.stopPropagation()}>
                    {(alert.status === 'pending' || alert.status === 'sent') && (
                      <>
                        <button
                          onClick={() => acknowledgeAlert(alert._id)}
                          className="ra-action-acknowledge"
                        >
                          <Check className="ra-btn-icon" />
                          Acknowledge
                        </button>
                        <button
                          onClick={() => {
                            const resolution = prompt('Enter resolution notes:');
                            if (resolution !== null) {
                              resolveAlert(alert._id, resolution);
                            }
                          }}
                          className="ra-action-resolve"
                        >
                          <CheckCircle className="ra-btn-icon" />
                          Resolve
                        </button>
                      </>
                    )}
                    <button className="ra-action-view" title="View Details">
                      <Eye className="ra-action-icon" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded[alert._id] && (
                  <div className="ra-card-expanded">
                    <div className="ra-expanded-content">
                      <div className="ra-expanded-grid">
                        <div className="ra-expanded-section">
                          <h5 className="ra-expanded-label">Alert Details</h5>
                          <div className="ra-expanded-details">
                            <div className="ra-expanded-item">
                              <span className="ra-expanded-key">Type</span>
                              <span className={`ra-expanded-value ${getTypeBadge(alert.type)}`}>{alert.type}</span>
                            </div>
                            <div className="ra-expanded-item">
                              <span className="ra-expanded-key">Severity</span>
                              <span className={`ra-expanded-value ${getSeverityColor(alert.severity)}`}>{alert.severity}</span>
                            </div>
                            <div className="ra-expanded-item">
                              <span className="ra-expanded-key">Status</span>
                              <span className={`ra-expanded-value ${getStatusColor(alert.status)}`}>{getStatusLabel(alert.status)}</span>
                            </div>
                            <div className="ra-expanded-item">
                              <span className="ra-expanded-key">Escalation Level</span>
                              <span className="ra-expanded-value">{alert.escalationLevel || 0}</span>
                            </div>
                            <div className="ra-expanded-item">
                              <span className="ra-expanded-key">Created</span>
                              <span className="ra-expanded-value">{new Date(alert.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="ra-expanded-section">
                          <h5 className="ra-expanded-label">Recipients</h5>
                          {alert.recipients && alert.recipients.length > 0 ? (
                            <div className="ra-expanded-recipients">
                              {alert.recipients.map((recipient, idx) => (
                                <div key={idx} className="ra-expanded-recipient">
                                  <span className="ra-expanded-recipient-name">
                                    {recipient.userId?.firstName} {recipient.userId?.lastName}
                                  </span>
                                  <span className={`ra-expanded-recipient-status ${
                                    recipient.deliveryStatus === 'read' ? 'ra-recipient-read' :
                                    recipient.deliveryStatus === 'sent' ? 'ra-recipient-sent' :
                                    'ra-recipient-pending'
                                  }`}>
                                    {recipient.deliveryStatus}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="ra-expanded-text">No recipients</p>
                          )}
                        </div>
                      </div>

                      {/* Delivery Channels */}
                      <div className="ra-expanded-channels">
                        <h5 className="ra-expanded-label">Delivery Channels</h5>
                        <div className="ra-expanded-channel-icons">
                          <span className="ra-channel-icon ra-channel-email">
                            <Mail className="ra-channel-svg" />
                            Email
                          </span>
                          <span className="ra-channel-icon ra-channel-sms">
                            <MessageCircle className="ra-channel-svg" />
                            SMS
                          </span>
                          <span className="ra-channel-icon ra-channel-push">
                            <Phone className="ra-channel-svg" />
                            Push
                          </span>
                        </div>
                      </div>
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
        .ra-container {
          padding: 24px 32px;
          max-width: 1200px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: raFadeIn 0.4s ease;
        }

        @keyframes raFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .ra-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .ra-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: raSpin 0.8s linear infinite;
        }

        @keyframes raSpin {
          to { transform: rotate(360deg); }
        }

        .ra-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .ra-spin {
          animation: raSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .ra-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .ra-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ra-header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
        }

        .ra-header-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .ra-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .ra-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .ra-count {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 14px;
          border-radius: 12px;
        }

        .ra-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ra-icon-btn {
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

        .ra-icon-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .ra-icon-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ra-refresh-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           STATS
           ============================================ */
        .ra-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .ra-stat-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          animation: raSlideUp 0.5s ease both;
        }

        .ra-stat-card:nth-child(1) { animation-delay: 0.1s; }
        .ra-stat-card:nth-child(2) { animation-delay: 0.15s; }
        .ra-stat-card:nth-child(3) { animation-delay: 0.2s; }
        .ra-stat-card:nth-child(4) { animation-delay: 0.25s; }

        @keyframes raSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ra-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .ra-stat-unread { border-left: 4px solid #f59e0b; }
        .ra-stat-critical { border-left: 4px solid #ef4444; }
        .ra-stat-resolved { border-left: 4px solid #22c55e; }

        .ra-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ra-stat-left {
          flex: 1;
        }

        .ra-stat-label {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .ra-stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 4px 0 0 0;
          line-height: 1.2;
        }

        .ra-stat-number-unread { color: #f59e0b; }
        .ra-stat-number-critical { color: #ef4444; }
        .ra-stat-number-resolved { color: #22c55e; }

        .ra-stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: #f1f5f9;
        }

        .ra-stat-icon-total { background: #eff6ff; }
        .ra-stat-icon-unread { background: #fef3c7; }
        .ra-stat-icon-critical { background: #fee2e2; }
        .ra-stat-icon-resolved { background: #d1fae5; }

        .ra-stat-icon {
          width: 22px;
          height: 22px;
          color: #64748b;
        }

        .ra-stat-icon-total .ra-stat-icon { color: #3b82f6; }
        .ra-stat-icon-unread .ra-stat-icon { color: #f59e0b; }
        .ra-stat-icon-critical .ra-stat-icon { color: #ef4444; }
        .ra-stat-icon-resolved .ra-stat-icon { color: #22c55e; }

        /* ============================================
           FILTERS
           ============================================ */
        .ra-filters {
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

        .ra-filter-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 140px;
        }

        .ra-filter-select:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        .ra-clear-btn {
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

        .ra-clear-btn:hover {
          background: #e2e8f0;
        }

        .ra-clear-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           LIST
           ============================================ */
        .ra-list-container {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .ra-list {
          divide-y: 1px solid #e2e8f0;
        }

        .ra-card {
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.2s ease;
        }

        .ra-card:last-child {
          border-bottom: none;
        }

        .ra-card-unread {
          border-left: 4px solid #f59e0b;
          background: #fffbeb;
        }

        .ra-card:hover {
          background: #fafafa;
        }

        .ra-card-unread:hover {
          background: #fef3c7;
        }

        .ra-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px 20px;
          cursor: pointer;
          gap: 12px;
        }

        .ra-card-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .ra-expand-btn {
          margin-top: 2px;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .ra-expand-btn:hover {
          background: #f1f5f9;
        }

        .ra-expand-icon {
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .ra-card-severity {
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ra-severity-critical { background: #ef4444; color: #ffffff; }
        .ra-severity-high { background: #f97316; color: #ffffff; }
        .ra-severity-medium { background: #eab308; color: #ffffff; }
        .ra-severity-low { background: #22c55e; color: #ffffff; }
        .ra-severity-default { background: #94a3b8; color: #ffffff; }

        .ra-icon {
          width: 20px;
          height: 20px;
        }

        .ra-card-info {
          flex: 1;
          min-width: 0;
        }

        .ra-card-title-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .ra-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .ra-card-status {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .ra-status-pending { background: #fef3c7; color: #92400e; }
        .ra-status-sent { background: #dbeafe; color: #1d4ed8; }
        .ra-status-acknowledged { background: #f3e8ff; color: #6d28d9; }
        .ra-status-resolved { background: #d1fae5; color: #065f46; }
        .ra-status-failed { background: #fee2e2; color: #991b1b; }
        .ra-status-default { background: #f1f5f9; color: #475569; }

        .ra-card-type {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .ra-type-security { background: #fee2e2; color: #991b1b; }
        .ra-type-operational { background: #dbeafe; color: #1d4ed8; }
        .ra-type-compliance { background: #f3e8ff; color: #6d28d9; }
        .ra-type-financial { background: #d1fae5; color: #065f46; }
        .ra-type-strategic { background: #fef3c7; color: #92400e; }
        .ra-type-default { background: #f1f5f9; color: #475569; }

        .ra-card-escalated {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          background: #fee2e2;
          color: #991b1b;
        }

        .ra-card-message {
          font-size: 14px;
          color: #64748b;
          margin: 6px 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ra-card-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 6px;
          font-size: 12px;
          color: #64748b;
        }

        .ra-card-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ra-card-meta-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .ra-card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .ra-action-acknowledge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ra-action-acknowledge:hover {
          background: #2563eb;
        }

        .ra-action-resolve {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          background: #22c55e;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ra-action-resolve:hover {
          background: #16a34a;
        }

        .ra-action-view {
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

        .ra-action-view:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .ra-action-icon {
          width: 16px;
          height: 16px;
        }

        .ra-btn-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           EXPANDED
           ============================================ */
        .ra-card-expanded {
          padding: 0 20px 16px 20px;
          margin-left: 40px;
        }

        .ra-expanded-content {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }

        .ra-expanded-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .ra-expanded-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ra-expanded-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .ra-expanded-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 16px;
        }

        .ra-expanded-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ra-expanded-key {
          font-size: 11px;
          color: #94a3b8;
        }

        .ra-expanded-value {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          width: fit-content;
        }

        .ra-expanded-text {
          font-size: 14px;
          color: #475569;
          margin: 0;
          line-height: 1.5;
        }

        .ra-expanded-recipients {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ra-expanded-recipient {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 8px;
          background: #ffffff;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }

        .ra-expanded-recipient-name {
          font-size: 13px;
          color: #0f172a;
        }

        .ra-expanded-recipient-status {
          padding: 1px 8px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .ra-recipient-read { background: #d1fae5; color: #065f46; }
        .ra-recipient-sent { background: #dbeafe; color: #1d4ed8; }
        .ra-recipient-pending { background: #fef3c7; color: #92400e; }

        .ra-expanded-channels {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }

        .ra-expanded-channel-icons {
          display: flex;
          gap: 12px;
          margin-top: 4px;
        }

        .ra-channel-icon {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          background: #f1f5f9;
          color: #475569;
        }

        .ra-channel-email { background: #dbeafe; color: #1d4ed8; }
        .ra-channel-sms { background: #d1fae5; color: #065f46; }
        .ra-channel-push { background: #f3e8ff; color: #6d28d9; }

        .ra-channel-svg {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .ra-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }

        .ra-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .ra-empty-icon {
          width: 36px;
          height: 36px;
          color: #94a3b8;
        }

        .ra-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .ra-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .ra-container {
            padding: 16px;
          }

          .ra-header {
            flex-direction: column;
            align-items: stretch;
          }

          .ra-header-right {
            flex-wrap: wrap;
          }

          .ra-stats {
            grid-template-columns: 1fr 1fr;
          }

          .ra-filters {
            flex-direction: column;
          }

          .ra-filter-select {
            width: 100%;
          }

          .ra-card-header {
            flex-direction: column;
          }

          .ra-card-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 4px;
          }

          .ra-expanded-grid {
            grid-template-columns: 1fr;
          }

          .ra-expanded-details {
            grid-template-columns: 1fr;
          }

          .ra-title {
            font-size: 22px;
          }

          .ra-header-icon {
            width: 40px;
            height: 40px;
          }

          .ra-header-svg {
            width: 20px;
            height: 20px;
          }

          .ra-card-expanded {
            margin-left: 0;
            padding: 0 16px 12px 16px;
          }
        }

        @media (max-width: 480px) {
          .ra-container {
            padding: 12px;
          }

          .ra-stats {
            grid-template-columns: 1fr;
          }

          .ra-title {
            font-size: 20px;
          }

          .ra-subtitle {
            font-size: 13px;
          }

          .ra-card-title-row {
            flex-wrap: wrap;
          }

          .ra-card-actions {
            flex-wrap: wrap;
          }

          .ra-action-acknowledge,
          .ra-action-resolve {
            flex: 1;
            justify-content: center;
          }

          .ra-expanded-channel-icons {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default RiskAlerts;