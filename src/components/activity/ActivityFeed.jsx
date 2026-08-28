import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Activity, Clock, User, Briefcase, Target, CheckCircle,
  AlertCircle, MessageSquare, FileText, Building2, Users,
  Filter, RefreshCw, ChevronDown, ChevronUp, Eye, X
} from 'lucide-react';

const ActivityFeed = ({ 
  limit = 30, 
  entityType = 'all', 
  showFilters = true,
  onActivityClick,
  className = ''
}) => {
  const { api } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [filters, setFilters] = useState({
    entityType: entityType,
    action: 'all',
    importance: 'all',
    startDate: '',
    endDate: ''
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const feedRef = useRef(null);

  useEffect(() => {
    fetchActivities(true);
  }, [filters]);

  const fetchActivities = async (reset = false) => {
    try {
      if (reset) setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.entityType !== 'all') params.append('entityType', filters.entityType);
      if (filters.action !== 'all') params.append('action', filters.action);
      if (filters.importance !== 'all') params.append('importance', filters.importance);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('limit', limit);
      params.append('skip', reset ? 0 : skip);
      
      const response = await api.get(`/activities/feed?${params.toString()}`);
      const data = response.data.data;
      
      if (reset) {
        setActivities(data.activities);
        setSkip(limit);
      } else {
        setActivities(prev => [...prev, ...data.activities]);
        setSkip(prev => prev + limit);
      }
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchActivities(false);
    }
  };

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMore();
    }
  }, [loading, hasMore]);

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
    const Icon = icons[entityType] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const getActionColor = (action) => {
    if (action.includes('created')) return 'text-green-600 bg-green-50';
    if (action.includes('updated') || action.includes('changed')) return 'text-blue-600 bg-blue-50';
    if (action.includes('deleted') || action.includes('removed')) return 'text-red-600 bg-red-50';
    if (action.includes('completed') || action.includes('approved')) return 'text-emerald-600 bg-emerald-50';
    if (action.includes('rejected') || action.includes('failed')) return 'text-red-600 bg-red-50';
    if (action.includes('login') || action.includes('logout')) return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
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

  const entityTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'lead', label: 'Leads' },
    { value: 'client', label: 'Clients' },
    { value: 'project', label: 'Projects' },
    { value: 'task', label: 'Tasks' },
    { value: 'goal', label: 'Goals' },
    { value: 'kpi', label: 'KPIs' },
    { value: 'user', label: 'Users' },
    { value: 'team', label: 'Teams' },
    { value: 'risk', label: 'Risks' },
    { value: 'comment', label: 'Comments' }
  ];

  const actions = [
    { value: 'all', label: 'All Actions' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' },
    { value: 'completed', label: 'Completed' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' }
  ];

  const importanceLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  if (loading && activities.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Activity Feed</h3>
            <span className="text-sm text-gray-400">
              ({activities.length} {activities.length === 1 ? 'item' : 'items'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showFilters && (
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilterPanel ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => fetchActivities(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && showFilterPanel && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Entity Type</label>
              <select
                value={filters.entityType}
                onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {entityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {actions.map(action => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Importance</label>
              <select
                value={filters.importance}
                onChange={(e) => setFilters(prev => ({ ...prev, importance: e.target.value }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {importanceLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setFilters({
                  entityType: 'all',
                  action: 'all',
                  importance: 'all',
                  startDate: '',
                  endDate: ''
                });
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div 
        ref={feedRef}
        className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto"
        onScroll={handleScroll}
      >
        {activities.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No activities to show</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div 
              key={activity._id} 
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedActivity(activity);
                if (onActivityClick) onActivityClick(activity);
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getEntityIcon(activity.entityType)}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">
                      {activity.userId?.firstName} {activity.userId?.lastName || 'System'}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getActionColor(activity.action)}`}>
                      {activity.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      {activity.entityType}
                    </span>
                    {activity.importance && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getImportanceBadge(activity.importance)}`}>
                        {activity.importance}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{getTimeAgo(activity.createdAt)}</span>
                    {activity.segmentId?.name && (
                      <>
                        <span>•</span>
                        <span>{activity.segmentId.name}</span>
                      </>
                    )}
                    {activity.departmentId?.name && (
                      <>
                        <span>•</span>
                        <span>{activity.departmentId.name}</span>
                      </>
                    )}
                    {activity.teamId?.name && (
                      <>
                        <span>•</span>
                        <span>{activity.teamId.name}</span>
                      </>
                    )}
                  </div>

                  {/* Previous/New Values */}
                  {activity.previousValue !== undefined && activity.newValue !== undefined && (
                    <div className="mt-2 text-xs bg-gray-50 rounded p-2">
                      <span className="text-gray-500">Changed from </span>
                      <span className="text-red-500 line-through">{String(activity.previousValue)}</span>
                      <span className="text-gray-500"> to </span>
                      <span className="text-green-600">{String(activity.newValue)}</span>
                    </div>
                  )}
                </div>

                {/* Link */}
                {activity.link && (
                  <a
                    href={activity.link}
                    className="flex-shrink-0 text-blue-600 hover:text-blue-700 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}

        {/* Load More */}
        {hasMore && (
          <div className="p-3 text-center border-t border-gray-200">
            <button
              onClick={loadMore}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  Loading...
                </span>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;