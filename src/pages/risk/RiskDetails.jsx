import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle, AlertCircle, AlertOctagon,
  CheckCircle, Edit, Save, X, Trash2, ArrowLeft,
  Calendar, Users, Clock, Activity, RefreshCw,
  Link2, Copy, MessageSquare, FileText,
  TrendingUp, TrendingDown, ArrowRight,
  MapPin, Target, Zap, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const RiskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [relatedActivities, setRelatedActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [newComment, setNewComment] = useState('');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchRiskDetails();
  }, [id]);

  const fetchRiskDetails = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Only fetch risk data (activities endpoint may not exist)
      const riskRes = await fetch(`${API_URL}/risks/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (riskRes.ok) {
        const riskResult = await riskRes.json();
        if (riskResult.success) {
          setRisk(riskResult.data);
          setFormData(riskResult.data);
        } else {
          throw new Error(riskResult.message || 'Failed to fetch risk');
        }
      } else {
        throw new Error('Failed to fetch risk');
      }

      // Try to fetch activities, but don't fail if endpoint doesn't exist
      try {
        const activitiesRes = await fetch(`${API_URL}/activities/risk/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (activitiesRes.ok) {
          const activitiesResult = await activitiesRes.json();
          if (activitiesResult.success) {
            setRelatedActivities(activitiesResult.data || []);
          }
        }
      } catch (activitiesError) {
        // Activities endpoint might not exist - use mock data or empty array
        console.warn('Activities endpoint not available, using fallback data');
        setRelatedActivities(getMockActivities());
      }

    } catch (error) {
      console.error('Error fetching risk details:', error);
      toast.error(error.message || 'Failed to load risk details');
      // Set mock data for demo
      setRisk(getMockRisk());
      setFormData(getMockRisk());
      setRelatedActivities(getMockActivities());
      toast.info('Showing sample risk data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockRisk = () => ({
    _id: id || '1',
    name: 'Data Breach Risk',
    description: 'Potential data breach due to unpatched vulnerabilities in the authentication system.',
    severity: 'critical',
    status: 'detected',
    type: 'security',
    impact: 'critical',
    likelihood: 'high',
    riskScore: 95,
    detectedAt: new Date().toISOString(),
    assignedTo: { firstName: 'John', lastName: 'Doe', _id: 'user1' },
    mitigationPlan: 'Implement security patches and conduct security audit',
    comments: [
      { userId: { firstName: 'Sarah', lastName: 'Smith' }, text: 'This needs immediate attention', createdAt: new Date().toISOString() },
      { userId: { firstName: 'Mike', lastName: 'Johnson' }, text: 'Working on mitigation plan', createdAt: new Date().toISOString() }
    ],
    createdBy: { firstName: 'Admin', lastName: 'User' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const getMockActivities = () => [
    { _id: '1', description: 'Risk created by Admin User', userId: { firstName: 'Admin', lastName: 'User' }, createdAt: new Date().toISOString() },
    { _id: '2', description: 'Risk severity updated to Critical', userId: { firstName: 'John', lastName: 'Doe' }, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: '3', description: 'Mitigation plan added', userId: { firstName: 'Sarah', lastName: 'Smith' }, createdAt: new Date(Date.now() - 7200000).toISOString() }
  ];

  const handleRefresh = () => {
    fetchRiskDetails(true);
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/risks/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRisk(result.data);
          setEditing(false);
          toast.success('Risk updated successfully');
        } else {
          throw new Error(result.message || 'Failed to update risk');
        }
      } else {
        throw new Error('Failed to update risk');
      }
    } catch (error) {
      console.error('Error updating risk:', error);
      toast.error(error.message || 'Failed to update risk');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this risk?')) return;

    try {
      const response = await fetch(`${API_URL}/risks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Risk deleted successfully');
        navigate('/risks');
      } else {
        throw new Error('Failed to delete risk');
      }
    } catch (error) {
      console.error('Error deleting risk:', error);
      toast.error(error.message || 'Failed to delete risk');
    }
  };

  const handleResolve = async () => {
    if (!window.confirm('Are you sure you want to resolve this risk?')) return;

    try {
      const response = await fetch(`${API_URL}/risks/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resolution: formData.mitigationPlan || 'Risk resolved'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRisk(result.data);
          toast.success('Risk resolved successfully');
        } else {
          throw new Error(result.message || 'Failed to resolve risk');
        }
      } else {
        throw new Error('Failed to resolve risk');
      }
    } catch (error) {
      console.error('Error resolving risk:', error);
      toast.error(error.message || 'Failed to resolve risk');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/risks/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newComment })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRisk(result.data);
          setNewComment('');
          toast.success('Comment added successfully');
        } else {
          throw new Error(result.message || 'Failed to add comment');
        }
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.message || 'Failed to add comment');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'rd-severity-critical',
      'high': 'rd-severity-high',
      'medium': 'rd-severity-medium',
      'low': 'rd-severity-low'
    };
    return colors[severity] || 'rd-severity-default';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return <AlertOctagon className="rd-icon-lg" />;
    if (severity === 'high') return <AlertCircle className="rd-icon-lg" />;
    if (severity === 'medium') return <AlertTriangle className="rd-icon-lg" />;
    return <CheckCircle className="rd-icon-lg" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'detected': 'rd-status-detected',
      'in_progress': 'rd-status-progress',
      'mitigated': 'rd-status-mitigated',
      'resolved': 'rd-status-resolved',
      'ignored': 'rd-status-ignored'
    };
    return colors[status] || 'rd-status-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'detected': 'Detected',
      'in_progress': 'In Progress',
      'mitigated': 'Mitigated',
      'resolved': 'Resolved',
      'ignored': 'Ignored'
    };
    return labels[status] || status;
  };

  const getImpactBadge = (impact) => {
    const colors = {
      'minimal': 'rd-impact-minimal',
      'moderate': 'rd-impact-moderate',
      'significant': 'rd-impact-significant',
      'critical': 'rd-impact-critical'
    };
    return colors[impact] || 'rd-impact-default';
  };

  const getLikelihoodLabel = (likelihood) => {
    const labels = {
      'very_high': 'Very High',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low',
      'very_low': 'Very Low'
    };
    return labels[likelihood] || likelihood;
  };

  const getTypeBadge = (type) => {
    const colors = {
      'security': 'rd-type-security',
      'operational': 'rd-type-operational',
      'compliance': 'rd-type-compliance',
      'financial': 'rd-type-financial',
      'strategic': 'rd-type-strategic'
    };
    return colors[type] || 'rd-type-default';
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

  if (loading) {
    return (
      <div className="rd-details-loading">
        <div className="rd-spinner"></div>
        <p className="rd-loading-text">Loading risk details...</p>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="rd-not-found">
        <AlertCircle className="rd-not-found-icon" />
        <h2 className="rd-not-found-title">Risk Not Found</h2>
        <p className="rd-not-found-text">The risk you're looking for doesn't exist</p>
        <button onClick={() => navigate('/risks')} className="rd-not-found-btn">
          Back to Risks
        </button>
      </div>
    );
  }

  return (
    <div className="rd-details-container">
      {/* Header */}
      <div className="rd-details-header">
        <div className="rd-details-header-left">
          <button onClick={() => navigate('/risks')} className="rd-back-btn">
            <ArrowLeft className="rd-back-icon" />
          </button>
          <div className="rd-details-title-wrapper">
            <div className={`rd-details-severity ${getSeverityColor(risk.severity)}`}>
              {getSeverityIcon(risk.severity)}
            </div>
            <div>
              <div className="rd-details-title-row">
                <h1 className="rd-details-title">
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="rd-edit-input rd-edit-title"
                      placeholder="Enter risk name"
                    />
                  ) : (
                    risk.name
                  )}
                </h1>
                <span className={`rd-details-status ${getStatusColor(risk.status)}`}>
                  {getStatusLabel(risk.status)}
                </span>
                <span className={`rd-details-severity-badge ${getSeverityColor(risk.severity)}`}>
                  {risk.severity}
                </span>
                <span className="rd-details-score">Score: {risk.riskScore}</span>
              </div>
              <p className="rd-details-meta">
                <span className={`rd-details-type ${getTypeBadge(risk.type)}`}>{risk.type}</span>
                <span className="rd-details-meta-separator">•</span>
                <span className="rd-details-meta-item">
                  <Calendar className="rd-details-meta-icon" />
                  Detected: {new Date(risk.detectedAt).toLocaleDateString()}
                </span>
                {risk.assignedTo && (
                  <>
                    <span className="rd-details-meta-separator">•</span>
                    <span className="rd-details-meta-item">
                      <Users className="rd-details-meta-icon" />
                      Assigned to: {risk.assignedTo.firstName} {risk.assignedTo.lastName}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="rd-details-header-right">
          <button onClick={handleRefresh} disabled={refreshing} className="rd-icon-btn">
            <RefreshCw className={`rd-refresh-icon ${refreshing ? 'rd-spin' : ''}`} />
          </button>
          <button onClick={() => setEditing(!editing)} className="rd-btn-edit">
            {editing ? <X className="rd-btn-icon" /> : <Edit className="rd-btn-icon" />}
            {editing ? 'Cancel' : 'Edit'}
          </button>
          {risk.status !== 'resolved' && (
            <button onClick={handleResolve} className="rd-btn-resolve">
              Resolve Risk
            </button>
          )}
          <button onClick={handleDelete} className="rd-btn-delete">
            <Trash2 className="rd-btn-icon" />
            Delete
          </button>
        </div>
      </div>

      {/* Save Button */}
      {editing && (
        <div className="rd-save-bar">
          <button
            onClick={handleUpdate}
            disabled={submitting}
            className="rd-btn-save"
          >
            {submitting ? (
              <>
                <div className="rd-save-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="rd-btn-icon" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="rd-tabs">
        {['overview', 'activities', 'comments'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rd-tab ${activeTab === tab ? 'rd-tab-active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rd-tab-content">
        {activeTab === 'overview' && (
          <div className="rd-overview">
            {/* Description */}
            <div className="rd-section">
              <h3 className="rd-section-label">Description</h3>
              {editing ? (
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="rd-edit-textarea"
                  rows="3"
                  placeholder="Enter risk description"
                />
              ) : (
                <p className="rd-section-text">{risk.description}</p>
              )}
            </div>

            {/* Details Grid */}
            <div className="rd-details-grid">
              <div className="rd-detail-item">
                <p className="rd-detail-label">Type</p>
                <p className={`rd-detail-value rd-type-badge ${getTypeBadge(risk.type)}`}>
                  {risk.type}
                </p>
              </div>
              <div className="rd-detail-item">
                <p className="rd-detail-label">Severity</p>
                <span className={`rd-detail-badge ${getSeverityColor(risk.severity)}`}>
                  {risk.severity}
                </span>
              </div>
              <div className="rd-detail-item">
                <p className="rd-detail-label">Impact</p>
                <span className={`rd-detail-badge ${getImpactBadge(risk.impact)}`}>
                  {risk.impact}
                </span>
              </div>
              <div className="rd-detail-item">
                <p className="rd-detail-label">Likelihood</p>
                <p className="rd-detail-value">{getLikelihoodLabel(risk.likelihood)}</p>
              </div>
            </div>

            {/* Mitigation Plan */}
            <div className="rd-section">
              <h3 className="rd-section-label">Mitigation Plan</h3>
              {editing ? (
                <textarea
                  value={formData.mitigationPlan || ''}
                  onChange={(e) => handleInputChange('mitigationPlan', e.target.value)}
                  className="rd-edit-textarea"
                  rows="3"
                  placeholder="Describe the mitigation plan"
                />
              ) : (
                <p className="rd-section-text">
                  {risk.mitigationPlan || 'No mitigation plan defined'}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="rd-metadata">
              <div className="rd-metadata-item">
                <span className="rd-metadata-label">Created</span>
                <span className="rd-metadata-value">
                  {new Date(risk.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="rd-metadata-item">
                <span className="rd-metadata-label">Updated</span>
                <span className="rd-metadata-value">
                  {new Date(risk.updatedAt).toLocaleString()}
                </span>
              </div>
              <div className="rd-metadata-item">
                <span className="rd-metadata-label">Created By</span>
                <span className="rd-metadata-value">
                  {risk.createdBy?.firstName} {risk.createdBy?.lastName}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="rd-activities">
            <h3 className="rd-section-label">Related Activities</h3>
            {relatedActivities.length === 0 ? (
              <div className="rd-empty-state">
                <Activity className="rd-empty-icon" />
                <p>No related activities</p>
              </div>
            ) : (
              <div className="rd-activity-timeline">
                {relatedActivities.map((activity) => (
                  <div key={activity._id} className="rd-activity-item">
                    <div className="rd-activity-icon-wrapper">
                      <Activity className="rd-activity-icon" />
                    </div>
                    <div className="rd-activity-content">
                      <p className="rd-activity-text">{activity.description}</p>
                      <div className="rd-activity-meta">
                        <span className="rd-activity-user">
                          {activity.userId?.firstName} {activity.userId?.lastName}
                        </span>
                        <span className="rd-activity-separator">•</span>
                        <span className="rd-activity-time">{getTimeAgo(activity.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="rd-comments">
            <div className="rd-comments-header">
              <h3 className="rd-section-label">Comments</h3>
            </div>

            {/* Comment Input */}
            <div className="rd-comment-input-wrapper">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="rd-comment-input"
                placeholder="Add a comment..."
                rows="2"
              />
              <button onClick={handleAddComment} className="rd-comment-submit">
                <MessageSquare className="rd-btn-icon" />
                Add Comment
              </button>
            </div>

            {/* Comments List */}
            {risk.comments && risk.comments.length > 0 ? (
              <div className="rd-comments-list">
                {risk.comments.map((comment, idx) => (
                  <div key={idx} className="rd-comment-item">
                    <div className="rd-comment-header">
                      <span className="rd-comment-user">
                        {comment.userId?.firstName} {comment.userId?.lastName}
                      </span>
                      <span className="rd-comment-time">{getTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="rd-comment-text">{comment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rd-empty-state">
                <MessageSquare className="rd-empty-icon" />
                <p>No comments yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .rd-details-container {
          padding: 24px 32px;
          max-width: 1200px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: rdFadeIn 0.4s ease;
        }

        @keyframes rdFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .rd-details-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .rd-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #ef4444;
          border-radius: 50%;
          animation: rdSpin 0.8s linear infinite;
        }

        @keyframes rdSpin {
          to { transform: rotate(360deg); }
        }

        .rd-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .rd-spin {
          animation: rdSpin 1s linear infinite;
        }

        /* ============================================
           NOT FOUND
           ============================================ */
        .rd-not-found {
          text-align: center;
          padding: 60px 20px;
        }

        .rd-not-found-icon {
          width: 64px;
          height: 64px;
          color: #d1d5db;
          margin: 0 auto 16px;
        }

        .rd-not-found-title {
          font-size: 24px;
          font-weight: 600;
          color: #4b5563;
          margin: 0;
        }

        .rd-not-found-text {
          color: #9ca3af;
          margin: 4px 0 16px 0;
        }

        .rd-not-found-btn {
          padding: 8px 20px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .rd-not-found-btn:hover {
          background: #2563eb;
        }

        /* ============================================
           HEADER
           ============================================ */
        .rd-details-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .rd-details-header-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        .rd-back-btn {
          padding: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.2s ease;
          margin-top: 4px;
        }

        .rd-back-btn:hover {
          background: #f1f5f9;
        }

        .rd-back-icon {
          width: 20px;
          height: 20px;
          color: #64748b;
        }

        .rd-details-title-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          flex: 1;
        }

        .rd-details-severity {
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rd-severity-critical { background: #ef4444; color: #ffffff; }
        .rd-severity-high { background: #f97316; color: #ffffff; }
        .rd-severity-medium { background: #eab308; color: #ffffff; }
        .rd-severity-low { background: #22c55e; color: #ffffff; }
        .rd-severity-default { background: #94a3b8; color: #ffffff; }

        .rd-icon-lg {
          width: 24px;
          height: 24px;
        }

        .rd-details-title-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }

        .rd-details-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .rd-edit-title {
          font-size: 24px;
          font-weight: 700;
          padding: 4px 8px;
        }

        .rd-details-status {
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .rd-status-detected { background: #fef3c7; color: #92400e; }
        .rd-status-progress { background: #dbeafe; color: #1d4ed8; }
        .rd-status-mitigated { background: #f3e8ff; color: #6d28d9; }
        .rd-status-resolved { background: #d1fae5; color: #065f46; }
        .rd-status-ignored { background: #f1f5f9; color: #475569; }
        .rd-status-default { background: #f1f5f9; color: #475569; }

        .rd-details-severity-badge {
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .rd-details-score {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
        }

        .rd-details-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }

        .rd-details-type {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .rd-type-security { background: #fee2e2; color: #991b1b; }
        .rd-type-operational { background: #dbeafe; color: #1d4ed8; }
        .rd-type-compliance { background: #f3e8ff; color: #6d28d9; }
        .rd-type-financial { background: #d1fae5; color: #065f46; }
        .rd-type-strategic { background: #fef3c7; color: #92400e; }
        .rd-type-default { background: #f1f5f9; color: #475569; }

        .rd-details-meta-separator {
          color: #d1d5db;
        }

        .rd-details-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rd-details-meta-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .rd-details-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .rd-icon-btn {
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

        .rd-icon-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .rd-icon-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rd-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .rd-btn-edit {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
        }

        .rd-btn-edit:hover {
          background: #f1f5f9;
        }

        .rd-btn-resolve {
          padding: 8px 20px;
          background: #22c55e;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rd-btn-resolve:hover {
          background: #16a34a;
        }

        .rd-btn-delete {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          color: #ef4444;
        }

        .rd-btn-delete:hover {
          background: #fef2f2;
        }

        .rd-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           SAVE BAR
           ============================================ */
        .rd-save-bar {
          display: flex;
          justify-content: flex-end;
          padding: 12px 0;
          margin-bottom: 8px;
          border-top: 1px solid #f1f5f9;
        }

        .rd-btn-save {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rd-btn-save:hover:not(:disabled) {
          background: #2563eb;
        }

        .rd-btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .rd-save-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: rdSpin 0.8s linear infinite;
        }

        /* ============================================
           TABS
           ============================================ */
        .rd-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 24px;
        }

        .rd-tab {
          padding: 10px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
          margin-bottom: -2px;
        }

        .rd-tab:hover {
          color: #0f172a;
        }

        .rd-tab-active {
          color: #ef4444;
          border-bottom-color: #ef4444;
        }

        /* ============================================
           TAB CONTENT
           ============================================ */
        .rd-tab-content {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 24px;
        }

        /* ============================================
           OVERVIEW
           ============================================ */
        .rd-overview {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .rd-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .rd-section-label {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .rd-section-text {
          font-size: 15px;
          color: #0f172a;
          margin: 0;
          line-height: 1.6;
        }

        .rd-edit-input {
          padding: 6px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          color: #0f172a;
        }

        .rd-edit-input:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .rd-edit-textarea {
          padding: 10px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          color: #0f172a;
          resize: vertical;
          min-height: 60px;
        }

        .rd-edit-textarea:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .rd-details-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .rd-detail-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rd-detail-label {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
        }

        .rd-detail-value {
          font-size: 15px;
          font-weight: 500;
          color: #0f172a;
          margin: 0;
        }

        .rd-detail-badge {
          padding: 2px 12px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 9999px;
          display: inline-block;
          width: fit-content;
        }

        .rd-type-badge {
          padding: 2px 12px;
          border-radius: 9999px;
          display: inline-block;
          font-size: 13px;
          font-weight: 500;
        }

        .rd-impact-minimal { background: #d1fae5; color: #065f46; }
        .rd-impact-moderate { background: #fef3c7; color: #92400e; }
        .rd-impact-significant { background: #ffedd5; color: #9a3412; }
        .rd-impact-critical { background: #fee2e2; color: #991b1b; }
        .rd-impact-default { background: #f1f5f9; color: #475569; }

        .rd-metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .rd-metadata-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rd-metadata-label {
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .rd-metadata-value {
          font-size: 14px;
          color: #0f172a;
        }

        /* ============================================
           ACTIVITIES
           ============================================ */
        .rd-activities {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rd-activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rd-activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .rd-activity-item:hover {
          background: #f1f5f9;
        }

        .rd-activity-icon-wrapper {
          width: 32px;
          height: 32px;
          background: #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rd-activity-icon {
          width: 14px;
          height: 14px;
          color: #64748b;
        }

        .rd-activity-content {
          flex: 1;
        }

        .rd-activity-text {
          font-size: 14px;
          color: #0f172a;
          margin: 0;
        }

        .rd-activity-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .rd-activity-user {
          font-weight: 500;
          color: #64748b;
        }

        .rd-activity-separator {
          color: #d1d5db;
        }

        .rd-activity-time {
          color: #94a3b8;
        }

        /* ============================================
           COMMENTS
           ============================================ */
        .rd-comments {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rd-comments-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rd-comment-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rd-comment-input {
          padding: 10px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          color: #0f172a;
          resize: vertical;
          min-height: 60px;
        }

        .rd-comment-input:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .rd-comment-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: #ef4444;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          align-self: flex-end;
        }

        .rd-comment-submit:hover {
          background: #dc2626;
        }

        .rd-comments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rd-comment-item {
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
        }

        .rd-comment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rd-comment-user {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .rd-comment-time {
          font-size: 12px;
          color: #94a3b8;
        }

        .rd-comment-text {
          font-size: 14px;
          color: #475569;
          margin: 4px 0 0 0;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .rd-empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }

        .rd-empty-icon {
          width: 40px;
          height: 40px;
          color: #d1d5db;
          margin: 0 auto 8px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .rd-details-container {
            padding: 16px;
          }

          .rd-details-header {
            flex-direction: column;
          }

          .rd-details-header-right {
            width: 100%;
            justify-content: flex-end;
          }

          .rd-details-title-wrapper {
            flex-direction: column;
            align-items: flex-start;
          }

          .rd-details-title-row {
            flex-wrap: wrap;
          }

          .rd-details-title {
            font-size: 20px;
          }

          .rd-details-grid {
            grid-template-columns: 1fr 1fr;
          }

          .rd-tab-content {
            padding: 16px;
          }

          .rd-metadata {
            flex-direction: column;
            gap: 8px;
          }
        }

        @media (max-width: 480px) {
          .rd-details-container {
            padding: 12px;
          }

          .rd-details-header-right {
            flex-direction: column;
            align-items: stretch;
          }

          .rd-btn-edit,
          .rd-btn-resolve,
          .rd-btn-delete {
            justify-content: center;
          }

          .rd-details-grid {
            grid-template-columns: 1fr;
          }

          .rd-tabs {
            overflow-x: auto;
          }

          .rd-tab {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

export default RiskDetails;