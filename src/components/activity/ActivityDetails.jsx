import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X, User, Clock, Calendar, Layers, Users,
  Briefcase, Target, CheckCircle, AlertCircle,
  MessageSquare, FileText, Building2, Activity,
  ChevronLeft, ChevronRight, Copy, Link2
} from 'lucide-react';

const ActivityDetails = ({ 
  activity, 
  isOpen, 
  onClose, 
  onPrevious, 
  onNext,
  hasPrevious,
  hasNext
}) => {
  const { api } = useAuth();
  const [relatedActivities, setRelatedActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activity && isOpen) {
      fetchRelatedActivities();
    }
  }, [activity, isOpen]);

  const fetchRelatedActivities = async () => {
    if (!activity) return;
    setLoading(true);
    try {
      const response = await api.get(`/activities/timeline/${activity.entityType}/${activity.entityId}?limit=10`);
      setRelatedActivities(response.data.data);
    } catch (error) {
      console.error('Error fetching related activities:', error);
    } finally {
      setLoading(false);
    }
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
      'activity': Activity
    };
    const Icon = icons[entityType] || Activity;
    return <Icon className="w-5 h-5" />;
  };

  const getActionColor = (action) => {
    if (action.includes('created')) return 'text-green-600';
    if (action.includes('updated') || action.includes('changed')) return 'text-blue-600';
    if (action.includes('deleted') || action.includes('removed')) return 'text-red-600';
    if (action.includes('completed') || action.includes('approved')) return 'text-emerald-600';
    if (action.includes('rejected') || action.includes('failed')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getImportanceBadge = (importance) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-blue-100 text-blue-700',
      'high': 'bg-yellow-100 text-yellow-700',
      'critical': 'bg-red-100 text-red-700'
    };
    return colors[importance] || 'bg-gray-100 text-gray-600';
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

  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              {getEntityIcon(activity.entityType)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Activity Details</h2>
              <p className="text-sm text-gray-500">
                {activity.entityType} • {getTimeAgo(activity.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasPrevious && (
              <button
                onClick={onPrevious}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Next"
              >
                <ChevronRight className="w-5 h-5 text-gray-500" />
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
          {/* Activity Info */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${getActionColor(activity.action)} bg-opacity-10`}>
                  {activity.action.replace(/_/g, ' ')}
                </span>
                {activity.importance && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getImportanceBadge(activity.importance)}`}>
                    {activity.importance}
                  </span>
                )}
              </div>
              <p className="text-gray-700 mt-2">{activity.description}</p>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">User</p>
                  <p className="text-sm font-medium text-gray-800">
                    {activity.userId?.firstName} {activity.userId?.lastName || 'System'}
                  </p>
                  <p className="text-xs text-gray-400">{activity.userRole}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Timestamp</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">{getTimeAgo(activity.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Organization Context */}
            {(activity.segmentId || activity.departmentId || activity.teamId) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">Organization Context</p>
                <div className="flex flex-wrap items-center gap-3">
                  {activity.segmentId && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Layers className="w-4 h-4 text-gray-400" />
                      {activity.segmentId.name}
                    </span>
                  )}
                  {activity.departmentId && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      {activity.departmentId.name}
                    </span>
                  )}
                  {activity.teamId && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      {activity.teamId.name}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Previous/New Values */}
            {activity.previousValue !== undefined && activity.newValue !== undefined && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">Value Change</p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Previous</p>
                    <p className="text-sm text-red-500 line-through">{String(activity.previousValue)}</p>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div>
                    <p className="text-xs text-gray-400">New</p>
                    <p className="text-sm text-green-600">{String(activity.newValue)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">Additional Data</p>
                <div className="space-y-1">
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-500">{key}:</span>
                      <span className="text-gray-700">{JSON.stringify(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Activities */}
            {relatedActivities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Related Activities</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {relatedActivities.filter(a => a._id !== activity._id).slice(0, 5).map((rel) => (
                    <div key={rel._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        {getEntityIcon(rel.entityType)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{rel.description}</p>
                        <p className="text-xs text-gray-400">{getTimeAgo(rel.createdAt)}</p>
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
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>ID: {activity._id}</span>
            <span>•</span>
            <span>Source: {activity.source || 'manual'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
              <Link2 className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;