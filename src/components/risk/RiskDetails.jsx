import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X, AlertTriangle, AlertCircle, AlertOctagon,
  CheckCircle, Calendar, Users, Clock,
  Edit, Save, Trash2, FileText,
  Activity, ArrowLeft, ArrowRight,
  Link2, Copy, MessageSquare
} from 'lucide-react';

const RiskDetails = ({ 
  riskId, 
  isOpen, 
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onUpdate
}) => {
  const { api } = useAuth();
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [relatedActivities, setRelatedActivities] = useState([]);

  useEffect(() => {
    if (riskId && isOpen) {
      fetchRiskDetails();
    }
  }, [riskId, isOpen]);

  const fetchRiskDetails = async () => {
    setLoading(true);
    try {
      const [riskRes, activitiesRes] = await Promise.all([
        api.get(`/risks/${riskId}`),
        api.get(`/activities/timeline/risk/${riskId}`)
      ]);
      setRisk(riskRes.data.data);
      setFormData(riskRes.data.data);
      setRelatedActivities(activitiesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching risk details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await api.put(`/risks/${riskId}`, formData);
      setRisk(response.data.data);
      setEditing(false);
      if (onUpdate) onUpdate(response.data.data);
    } catch (error) {
      console.error('Error updating risk:', error);
    }
  };

  const handleResolve = async () => {
    if (!window.confirm('Are you sure you want to resolve this risk?')) return;
    try {
      const response = await api.post(`/risks/${riskId}/resolve`, {
        resolution: formData.mitigationPlan || 'Risk resolved'
      });
      setRisk(response.data.data);
      if (onUpdate) onUpdate(response.data.data);
    } catch (error) {
      console.error('Error resolving risk:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'bg-red-500 text-white',
      'high': 'bg-orange-500 text-white',
      'medium': 'bg-yellow-500 text-white',
      'low': 'bg-green-500 text-white'
    };
    return colors[severity] || 'bg-gray-500 text-white';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return <AlertOctagon className="w-5 h-5" />;
    if (severity === 'high') return <AlertCircle className="w-5 h-5" />;
    if (severity === 'medium') return <AlertTriangle className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'detected': 'bg-yellow-100 text-yellow-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'mitigated': 'bg-purple-100 text-purple-700',
      'resolved': 'bg-green-100 text-green-700',
      'ignored': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
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

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Risk not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getSeverityColor(risk.severity)}`}>
              {getSeverityIcon(risk.severity)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{risk.name}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(risk.status)}`}>
                  {risk.status.replace('_', ' ')}
                </span>
                <span className="text-gray-500">• Risk Score: {risk.riskScore}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasPrevious && (
              <button
                onClick={onPrevious}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-gray-700">Description</h4>
              {editing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Type</h4>
                <p className="text-sm text-gray-600 capitalize">{risk.type}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Severity</h4>
                <span className={`px-2 py-0.5 text-xs rounded-full ${getSeverityColor(risk.severity)}`}>
                  {risk.severity}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Impact</h4>
                <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700">
                  {risk.impact}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Likelihood</h4>
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                  {risk.likelihood}
                </span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Detected At</h4>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(risk.detectedAt).toLocaleString()}
                </p>
              </div>
              {risk.resolvedAt && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Resolved At</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(risk.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Assigned To */}
            <div>
              <h4 className="text-sm font-medium text-gray-700">Assigned To</h4>
              {editing ? (
                <select
                  value={formData.assignedTo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select User</option>
                  {/* Users would be populated here */}
                </select>
              ) : (
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  {risk.assignedTo?.firstName} {risk.assignedTo?.lastName || 'Unassigned'}
                </p>
              )}
            </div>

            {/* Mitigation Plan */}
            <div>
              <h4 className="text-sm font-medium text-gray-700">Mitigation Plan</h4>
              {editing ? (
                <textarea
                  value={formData.mitigationPlan || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, mitigationPlan: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Describe the mitigation plan"
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  {risk.mitigationPlan || 'No mitigation plan defined'}
                </p>
              )}
            </div>

            {/* Comments */}
            {risk.comments && risk.comments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Comments</h4>
                <div className="mt-1 space-y-2">
                  {risk.comments.map((comment, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">
                          {comment.userId?.firstName} {comment.userId?.lastName}
                        </span>
                        <span className="text-xs text-gray-400">{getTimeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Activities */}
            {relatedActivities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Related Activities</h4>
                <div className="mt-1 space-y-2">
                  {relatedActivities.slice(0, 5).map((activity) => (
                    <div key={activity._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-400">{getTimeAgo(activity.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-400">
            ID: {risk._id}
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <>
                {risk.status !== 'resolved' && (
                  <button
                    onClick={handleResolve}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Resolve Risk
                  </button>
                )}
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Add Comment
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDetails;