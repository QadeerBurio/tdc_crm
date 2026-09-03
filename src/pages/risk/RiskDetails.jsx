// pages/risk/RiskDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle, AlertCircle, AlertOctagon,
  CheckCircle, Edit, Save, X, Trash2, ArrowLeft,
  Calendar, Users, Clock, Activity, RefreshCw,
  Link2, Copy, MessageSquare, FileText,
  TrendingUp, TrendingDown, ArrowRight,
  MapPin, Target, Zap, Layers, Sparkles,
  Shield, Lock, Eye, EyeOff, Star, Crown
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
        console.warn('Activities endpoint not available, using fallback data');
        setRelatedActivities(getMockActivities());
      }

    } catch (error) {
      console.error('Error fetching risk details:', error);
      toast.error(error.message || 'Failed to load risk details');
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
      <div className="rd-loading">
        <div className="rd-loading-spinner"></div>
        <p className="rd-loading-text">Loading risk details...</p>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="rd-notfound">
        <div className="rd-notfound-icon-wrapper">
          <AlertCircle className="rd-notfound-icon" />
        </div>
        <h2 className="rd-notfound-title">Risk Not Found</h2>
        <p className="rd-notfound-text">The risk you're looking for doesn't exist</p>
        <button onClick={() => navigate('/risks')} className="rd-notfound-btn">
          Back to Risks
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="rd-container">
        {/* Header */}
        <div className="rd-header">
          <div className="rd-header-left">
            <button onClick={() => navigate('/risks')} className="rd-back-btn">
              <ArrowLeft className="rd-back-icon" />
            </button>
            <div className="rd-title-wrapper">
              <div className={`rd-severity-badge ${getSeverityColor(risk.severity)}`}>
                {getSeverityIcon(risk.severity)}
                <div className="rd-severity-glow"></div>
              </div>
              <div>
                <div className="rd-title-row">
                  <h1 className="rd-title">
                    {editing ? (
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="rd-edit-input rd-edit-title"
                        placeholder="Enter risk name"
                        autoFocus
                      />
                    ) : (
                      risk.name
                    )}
                  </h1>
                  <span className={`rd-status-badge ${getStatusColor(risk.status)}`}>
                    <span className="rd-status-dot"></span>
                    {getStatusLabel(risk.status)}
                  </span>
                  <span className={`rd-severity-tag ${getSeverityColor(risk.severity)}`}>
                    {risk.severity}
                  </span>
                  <span className="rd-score-badge">
                    <Target className="rd-score-icon" />
                    Score: {risk.riskScore}
                  </span>
                </div>
                <p className="rd-meta">
                  <span className={`rd-type-badge ${getTypeBadge(risk.type)}`}>
                    <Shield className="rd-type-icon" />
                    {risk.type}
                  </span>
                  <span className="rd-meta-separator">•</span>
                  <span className="rd-meta-item">
                    <Calendar className="rd-meta-icon" />
                    Detected: {new Date(risk.detectedAt).toLocaleDateString()}
                  </span>
                  {risk.assignedTo && (
                    <>
                      <span className="rd-meta-separator">•</span>
                      <span className="rd-meta-item">
                        <Users className="rd-meta-icon" />
                        Assigned to: {risk.assignedTo.firstName} {risk.assignedTo.lastName}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="rd-header-right">
            <button onClick={handleRefresh} disabled={refreshing} className="rd-icon-btn" title="Refresh">
              <RefreshCw className={`rd-refresh-icon ${refreshing ? 'rd-spin' : ''}`} />
            </button>
            <button onClick={() => setEditing(!editing)} className="rd-btn-edit">
              {editing ? <X className="rd-btn-icon" /> : <Edit className="rd-btn-icon" />}
              {editing ? 'Cancel' : 'Edit'}
            </button>
            {risk.status !== 'resolved' && (
              <button onClick={handleResolve} className="rd-btn-resolve">
                <CheckCircle className="rd-btn-icon" />
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
              {tab === 'overview' && <Layers className="rd-tab-icon" />}
              {tab === 'activities' && <Activity className="rd-tab-icon" />}
              {tab === 'comments' && <MessageSquare className="rd-tab-icon" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="rd-tab-content">
          {activeTab === 'overview' && (
            <div className="rd-overview">
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

              <div className="rd-details-grid">
                <div className="rd-detail-item rd-detail-item-glow">
                  <p className="rd-detail-label">Type</p>
                  <p className={`rd-detail-value rd-type-badge ${getTypeBadge(risk.type)}`}>
                    <Shield className="rd-detail-icon" />
                    {risk.type}
                  </p>
                </div>
                <div className="rd-detail-item rd-detail-item-glow">
                  <p className="rd-detail-label">Severity</p>
                  <span className={`rd-detail-badge ${getSeverityColor(risk.severity)}`}>
                    {risk.severity}
                  </span>
                </div>
                <div className="rd-detail-item rd-detail-item-glow">
                  <p className="rd-detail-label">Impact</p>
                  <span className={`rd-detail-badge ${getImpactBadge(risk.impact)}`}>
                    {risk.impact}
                  </span>
                </div>
                <div className="rd-detail-item rd-detail-item-glow">
                  <p className="rd-detail-label">Likelihood</p>
                  <p className="rd-detail-value">{getLikelihoodLabel(risk.likelihood)}</p>
                </div>
              </div>

              <div className="rd-section rd-section-mitigation">
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

              <div className="rd-metadata">
                <div className="rd-metadata-item">
                  <span className="rd-metadata-label">Created</span>
                  <span className="rd-metadata-value">
                    <Calendar className="rd-metadata-icon-small" />
                    {new Date(risk.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="rd-metadata-item">
                  <span className="rd-metadata-label">Updated</span>
                  <span className="rd-metadata-value">
                    <Clock className="rd-metadata-icon-small" />
                    {new Date(risk.updatedAt).toLocaleString()}
                  </span>
                </div>
                <div className="rd-metadata-item">
                  <span className="rd-metadata-label">Created By</span>
                  <span className="rd-metadata-value">
                    <Users className="rd-metadata-icon-small" />
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
                  <div className="rd-empty-icon-wrapper">
                    <Activity className="rd-empty-icon" />
                  </div>
                  <p>No related activities</p>
                </div>
              ) : (
                <div className="rd-activity-timeline">
                  {relatedActivities.map((activity) => (
                    <div key={activity._id} className="rd-activity-item">
                      <div className="rd-activity-icon-wrapper">
                        <div className="rd-activity-icon-pulse"></div>
                        <Activity className="rd-activity-icon" />
                      </div>
                      <div className="rd-activity-content">
                        <p className="rd-activity-text">{activity.description}</p>
                        <div className="rd-activity-meta">
                          <span className="rd-activity-user">
                            <Users className="rd-meta-icon" />
                            {activity.userId?.firstName} {activity.userId?.lastName}
                          </span>
                          <span className="rd-activity-separator">•</span>
                          <span className="rd-activity-time">
                            <Clock className="rd-meta-icon" />
                            {getTimeAgo(activity.createdAt)}
                          </span>
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
                <span className="rd-comments-count">{risk.comments?.length || 0}</span>
              </div>

              <div className="rd-comment-input-wrapper">
                <div className="rd-comment-input-container">
                  <MessageSquare className="rd-comment-input-icon" />
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="rd-comment-input"
                    placeholder="Add a comment..."
                    rows="2"
                  />
                </div>
                <button onClick={handleAddComment} className="rd-comment-submit">
                  <MessageSquare className="rd-btn-icon" />
                  Add Comment
                </button>
              </div>

              {risk.comments && risk.comments.length > 0 ? (
                <div className="rd-comments-list">
                  {risk.comments.map((comment, idx) => (
                    <div key={idx} className="rd-comment-item">
                      <div className="rd-comment-avatar">
                        {comment.userId?.firstName?.[0] || 'U'}
                      </div>
                      <div className="rd-comment-body">
                        <div className="rd-comment-header">
                          <span className="rd-comment-user">
                            {comment.userId?.firstName} {comment.userId?.lastName}
                          </span>
                          <span className="rd-comment-time">{getTimeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="rd-comment-text">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rd-empty-state">
                  <div className="rd-empty-icon-wrapper">
                    <MessageSquare className="rd-empty-icon" />
                  </div>
                  <p>No comments yet</p>
                  <span className="rd-empty-sub">Be the first to comment</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .rd-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .rd-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 20px;
        }

        .rd-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(1, 62, 55, 0.06);
          border-top-color: #013E37;
          border-radius: 50%;
          animation: rdSpin 0.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        .rd-loading-text {
          color: #013E37;
          opacity: 0.4;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.3px;
          animation: pulseText 1.5s ease-in-out infinite;
        }

        @keyframes pulseText {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        @keyframes rdSpin {
          to { transform: rotate(360deg); }
        }

        .rd-spin {
          animation: rdSpin 1s linear infinite;
        }

        /* ============================================
           NOT FOUND
           ============================================ */
        .rd-notfound {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
          text-align: center;
          padding: 40px 20px;
        }

        .rd-notfound-icon-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #FFEFB3 0%, #FFF9E6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          box-shadow: 0 8px 32px rgba(255, 239, 179, 0.25);
          animation: float 3s ease-in-out infinite;
        }

        .rd-notfound-icon {
          width: 36px;
          height: 36px;
          color: #013E37;
          opacity: 0.5;
        }

        .rd-notfound-title {
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }

        .rd-notfound-text {
          color: #013E37;
          opacity: 0.5;
          margin: 0;
          font-size: 15px;
        }

        .rd-notfound-btn {
          padding: 10px 28px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.25);
          margin-top: 8px;
        }

        .rd-notfound-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.35);
        }

        /* ============================================
           HEADER
           ============================================ */
        .rd-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rd-header-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        .rd-back-btn {
          padding: 10px;
          border: 1px solid rgba(1, 62, 55, 0.06);
          background: #FFFFFF;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          margin-top: 4px;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.04);
        }

        .rd-back-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: translateX(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
        }

        .rd-back-icon {
          width: 20px;
          height: 20px;
          color: #013E37;
        }

        .rd-title-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          flex: 1;
        }

        .rd-severity-badge {
          padding: 14px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .rd-severity-badge:hover {
          transform: scale(1.05);
        }

        .rd-severity-glow {
          position: absolute;
          inset: -2px;
          border-radius: 16px;
          opacity: 0.3;
          filter: blur(8px);
          animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        .rd-severity-critical { background: linear-gradient(135deg, #EF4444, #DC2626); color: #FFFFFF; }
        .rd-severity-critical .rd-severity-glow { background: #EF4444; }
        .rd-severity-high { background: linear-gradient(135deg, #F97316, #EA580C); color: #FFFFFF; }
        .rd-severity-high .rd-severity-glow { background: #F97316; }
        .rd-severity-medium { background: linear-gradient(135deg, #FFEFB3, #FFD580); color: #013E37; }
        .rd-severity-medium .rd-severity-glow { background: #FFEFB3; }
        .rd-severity-low { background: linear-gradient(135deg, #013E37, #0A5C54); color: #FFEFB3; }
        .rd-severity-low .rd-severity-glow { background: #013E37; }
        .rd-severity-default { background: linear-gradient(135deg, #FFEFB3, #E8D4A0); color: #013E37; }
        .rd-severity-default .rd-severity-glow { background: #FFEFB3; }

        .rd-icon-lg {
          width: 28px;
          height: 28px;
        }

        .rd-title-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }

        .rd-title {
          font-size: 26px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .rd-edit-title {
          font-size: 26px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 10px;
        }

        .rd-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          letter-spacing: 0.2px;
          text-transform: uppercase;
        }

        .rd-status-badge:hover {
          transform: scale(1.05);
        }

        .rd-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.6;
          animation: pulse 2s ease-in-out infinite;
        }

        .rd-status-detected { background: #FFEFB3; color: #013E37; }
        .rd-status-progress { background: #013E37; color: #FFEFB3; }
        .rd-status-mitigated { background: #0A5C54; color: #FFEFB3; }
        .rd-status-resolved { background: #013E37; color: #FFEFB3; }
        .rd-status-ignored { background: #FFEFB3; color: #013E37; }
        .rd-status-default { background: #FFEFB3; color: #013E37; }

        .rd-severity-tag {
          padding: 4px 14px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 20px;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rd-severity-tag:hover {
          transform: scale(1.05);
        }

        .rd-score-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 600;
          color: #013E37;
          padding: 4px 12px;
          background: rgba(1, 62, 55, 0.04);
          border-radius: 20px;
        }

        .rd-score-icon {
          width: 14px;
          height: 14px;
          color: #013E37;
          opacity: 0.6;
        }

        .rd-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin-top: 6px;
        }

        .rd-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 12px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rd-type-badge:hover {
          transform: scale(1.05);
        }

        .rd-type-icon {
          width: 12px;
          height: 12px;
        }

        .rd-type-security { background: #013E37; color: #FFEFB3; }
        .rd-type-operational { background: #0A5C54; color: #FFEFB3; }
        .rd-type-compliance { background: #1A7A6E; color: #FFEFB3; }
        .rd-type-financial { background: #013E37; color: #FFEFB3; }
        .rd-type-strategic { background: #FFEFB3; color: #013E37; }
        .rd-type-default { background: #FFEFB3; color: #013E37; }

        .rd-meta-separator {
          color: #013E37;
          opacity: 0.15;
        }

        .rd-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rd-meta-icon {
          width: 14px;
          height: 14px;
          color: #013E37;
          opacity: 0.4;
        }

        .rd-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .rd-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
          border: 1px solid rgba(1, 62, 55, 0.06);
          border-radius: 12px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          color: #013E37;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.04);
        }

        .rd-icon-btn:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
        }

        .rd-icon-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rd-refresh-icon {
          width: 18px;
          height: 18px;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rd-btn-edit {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border: 1px solid rgba(1, 62, 55, 0.06);
          border-radius: 12px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.04);
        }

        .rd-btn-edit:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
        }

        .rd-btn-resolve {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #013E37, #0A5C54);
          color: #FFEFB3;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.25);
        }

        .rd-btn-resolve:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.35);
        }

        .rd-btn-delete {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 12px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-size: 14px;
          font-weight: 600;
          color: #EF4444;
        }

        .rd-btn-delete:hover {
          background: #FEF2F2;
          border-color: #EF4444;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.08);
        }

        .rd-btn-icon {
          width: 18px;
          height: 18px;
        }

        /* ============================================
           SAVE BAR
           ============================================ */
        .rd-save-bar {
          display: flex;
          justify-content: flex-end;
          padding: 14px 0;
          margin-bottom: 8px;
          border-top: 1px solid rgba(1, 62, 55, 0.04);
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rd-btn-save {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 28px;
          background: linear-gradient(135deg, #013E37, #0A5C54);
          color: #FFEFB3;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.25);
        }

        .rd-btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.35);
        }

        .rd-btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .rd-save-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 239, 179, 0.3);
          border-top-color: #FFEFB3;
          border-radius: 50%;
          animation: rdSpin 0.8s linear infinite;
        }

        /* ============================================
           TABS
           ============================================ */
        .rd-tabs {
          display: flex;
          gap: 4px;
          border-bottom: 2px solid rgba(1, 62, 55, 0.04);
          margin-bottom: 24px;
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          animation-delay: 0.1s;
        }

        .rd-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.4;
          border-bottom: 2px solid transparent;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          margin-bottom: -2px;
          position: relative;
        }

        .rd-tab::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2px;
          background: #013E37;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          transform: translateX(-50%);
        }

        .rd-tab:hover {
          opacity: 0.7;
        }

        .rd-tab-active {
          opacity: 1;
        }

        .rd-tab-active::after {
          width: 100%;
        }

        .rd-tab-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           TAB CONTENT
           ============================================ */
        .rd-tab-content {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid rgba(1, 62, 55, 0.04);
          padding: 28px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 12px rgba(1, 62, 55, 0.04);
        }

        .rd-tab-content:hover {
          border-color: rgba(1, 62, 55, 0.08);
          box-shadow: 0 4px 24px rgba(1, 62, 55, 0.06);
        }

        /* ============================================
           OVERVIEW
           ============================================ */
        .rd-overview {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .rd-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        .rd-section:nth-child(1) { animation-delay: 0.05s; }
        .rd-section:nth-child(2) { animation-delay: 0.1s; }
        .rd-section:nth-child(3) { animation-delay: 0.15s; }
        .rd-section:nth-child(4) { animation-delay: 0.2s; }

        .rd-section-mitigation {
          background: rgba(1, 62, 55, 0.02);
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid rgba(1, 62, 55, 0.04);
        }

        .rd-section-label {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.4;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .rd-section-text {
          font-size: 15px;
          color: #013E37;
          opacity: 0.8;
          margin: 0;
          line-height: 1.7;
        }

        .rd-edit-input {
          padding: 8px 14px;
          border: 1.5px solid rgba(1, 62, 55, 0.08);
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          font-family: inherit;
          background: #FFFFFF;
          color: #013E37;
        }

        .rd-edit-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 4px rgba(1, 62, 55, 0.04);
        }

        .rd-edit-textarea {
          padding: 12px 16px;
          border: 1.5px solid rgba(1, 62, 55, 0.08);
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          font-family: inherit;
          background: #FFFFFF;
          color: #013E37;
          resize: vertical;
          min-height: 60px;
        }

        .rd-edit-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 4px rgba(1, 62, 55, 0.04);
        }

        .rd-details-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .rd-detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px 16px;
          background: rgba(1, 62, 55, 0.02);
          border-radius: 10px;
          border: 1px solid rgba(1, 62, 55, 0.04);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rd-detail-item:hover {
          border-color: rgba(1, 62, 55, 0.08);
          transform: translateY(-2px);
        }

        .rd-detail-item-glow {
          position: relative;
          overflow: hidden;
        }

        .rd-detail-item-glow::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(1, 62, 55, 0.02), transparent);
          transform: skewX(-20deg);
          animation: shimmerGlow 3s infinite;
        }

        @keyframes shimmerGlow {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(100%) skewX(-20deg); }
        }

        .rd-detail-label {
          font-size: 11px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.4;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .rd-detail-value {
          font-size: 15px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .rd-detail-icon {
          width: 14px;
          height: 14px;
          margin-right: 4px;
        }

        .rd-detail-badge {
          padding: 3px 14px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 20px;
          display: inline-block;
          width: fit-content;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rd-detail-badge:hover {
          transform: scale(1.05);
        }

        .rd-impact-minimal { background: #013E37; color: #FFEFB3; }
        .rd-impact-moderate { background: #FFEFB3; color: #013E37; }
        .rd-impact-significant { background: #FFEFB3; color: #013E37; }
        .rd-impact-critical { background: #EF4444; color: #FFFFFF; }
        .rd-impact-default { background: #FFEFB3; color: #013E37; }

        .rd-metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(1, 62, 55, 0.04);
        }

        .rd-metadata-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rd-metadata-label {
          font-size: 11px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.3;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .rd-metadata-value {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: #013E37;
          font-weight: 500;
        }

        .rd-metadata-icon-small {
          width: 14px;
          height: 14px;
          color: #013E37;
          opacity: 0.4;
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
          gap: 14px;
          padding: 14px 18px;
          background: rgba(1, 62, 55, 0.02);
          border-radius: 12px;
          border: 1px solid rgba(1, 62, 55, 0.04);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        .rd-activity-item:nth-child(1) { animation-delay: 0.05s; }
        .rd-activity-item:nth-child(2) { animation-delay: 0.1s; }
        .rd-activity-item:nth-child(3) { animation-delay: 0.15s; }

        .rd-activity-item:hover {
          background: #FFF9E6;
          border-color: #FFEFB3;
          transform: translateX(4px);
        }

        .rd-activity-icon-wrapper {
          width: 36px;
          height: 36px;
          background: #FFEFB3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }

        .rd-activity-icon-pulse {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #FFEFB3;
          animation: ripplePulse 2s ease-out infinite;
        }

        @keyframes ripplePulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        .rd-activity-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
        }

        .rd-activity-content {
          flex: 1;
        }

        .rd-activity-text {
          font-size: 14px;
          color: #013E37;
          margin: 0;
          font-weight: 500;
        }

        .rd-activity-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
          margin-top: 4px;
        }

        .rd-activity-user {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
          color: #013E37;
          opacity: 0.7;
        }

        .rd-activity-separator {
          color: #013E37;
          opacity: 0.15;
        }

        .rd-activity-time {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #013E37;
          opacity: 0.5;
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

        .rd-comments-count {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.4;
          padding: 2px 12px;
          background: rgba(1, 62, 55, 0.04);
          border-radius: 12px;
        }

        .rd-comment-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .rd-comment-input-container {
          position: relative;
        }

        .rd-comment-input-icon {
          position: absolute;
          left: 14px;
          top: 16px;
          width: 18px;
          height: 18px;
          color: #013E37;
          opacity: 0.2;
        }

        .rd-comment-input {
          padding: 14px 16px 14px 42px;
          border: 1.5px solid rgba(1, 62, 55, 0.06);
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          font-family: inherit;
          background: #FFFFFF;
          color: #013E37;
          resize: vertical;
          min-height: 60px;
        }

        .rd-comment-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 4px rgba(1, 62, 55, 0.04);
        }

        .rd-comment-input::placeholder {
          color: #013E37;
          opacity: 0.3;
        }

        .rd-comment-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #013E37, #0A5C54);
          color: #FFEFB3;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          align-self: flex-end;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.2);
        }

        .rd-comment-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.3);
        }

        .rd-comments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rd-comment-item {
          display: flex;
          gap: 14px;
          padding: 14px 18px;
          background: rgba(1, 62, 55, 0.02);
          border-radius: 12px;
          border: 1px solid rgba(1, 62, 55, 0.04);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        .rd-comment-item:nth-child(1) { animation-delay: 0.05s; }
        .rd-comment-item:nth-child(2) { animation-delay: 0.1s; }

        .rd-comment-item:hover {
          background: #FFF9E6;
          border-color: #FFEFB3;
        }

        .rd-comment-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #013E37, #0A5C54);
          color: #FFEFB3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .rd-comment-body {
          flex: 1;
        }

        .rd-comment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .rd-comment-user {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
        }

        .rd-comment-time {
          font-size: 12px;
          color: #013E37;
          opacity: 0.4;
        }

        .rd-comment-text {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
          margin: 4px 0 0 0;
          line-height: 1.6;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .rd-empty-state {
          text-align: center;
          padding: 48px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .rd-empty-icon-wrapper {
          width: 64px;
          height: 64px;
          background: rgba(1, 62, 55, 0.04);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .rd-empty-icon {
          width: 28px;
          height: 28px;
          color: #013E37;
          opacity: 0.2;
        }

        .rd-empty-state p {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
          font-weight: 500;
        }

        .rd-empty-sub {
          font-size: 13px;
          color: #013E37;
          opacity: 0.3;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .rd-details-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .rd-header {
            flex-direction: column;
          }

          .rd-header-right {
            width: 100%;
            justify-content: flex-end;
          }

          .rd-title-wrapper {
            flex-direction: column;
            align-items: flex-start;
          }

          .rd-title-row {
            flex-wrap: wrap;
          }

          .rd-title {
            font-size: 22px;
          }

          .rd-edit-title {
            font-size: 22px;
          }

          .rd-details-grid {
            grid-template-columns: 1fr 1fr;
          }

          .rd-tab-content {
            padding: 20px;
          }

          .rd-metadata {
            flex-direction: column;
            gap: 12px;
          }

          .rd-severity-badge {
            padding: 10px;
          }

          .rd-icon-lg {
            width: 22px;
            height: 22px;
          }

          .rd-btn-edit,
          .rd-btn-resolve,
          .rd-btn-delete {
            flex: 1;
            justify-content: center;
          }

          .rd-header-right {
            flex-wrap: wrap;
          }

          .rd-comment-item {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .rd-details-grid {
            grid-template-columns: 1fr;
          }

          .rd-tabs {
            overflow-x: auto;
            flex-wrap: nowrap;
          }

          .rd-tab {
            white-space: nowrap;
            padding: 10px 16px;
            font-size: 13px;
          }

          .rd-tab-icon {
            display: none;
          }

          .rd-header-right {
            flex-direction: column;
            align-items: stretch;
          }

          .rd-btn-edit,
          .rd-btn-resolve,
          .rd-btn-delete {
            width: 100%;
          }

          .rd-tab-content {
            padding: 16px;
          }

          .rd-section-mitigation {
            padding: 12px 16px;
          }

          .rd-comment-input {
            padding: 12px 14px 12px 38px;
          }

          .rd-comment-input-icon {
            left: 12px;
            top: 14px;
          }

          .rd-comment-submit {
            width: 100%;
            justify-content: center;
          }

          .rd-score-badge {
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default RiskDetails;