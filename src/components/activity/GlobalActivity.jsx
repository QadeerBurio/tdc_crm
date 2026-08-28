import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Activity, Globe, TrendingUp, TrendingDown,
  Users, Clock, Filter, RefreshCw, Search,
  BarChart3, PieChart, Calendar, Download,
  ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import ActivityFeed from './ActivityFeed';
import ActivityFilters from './ActivityFilters';
import ActivityDetails from './ActivityDetails';

const GlobalActivity = () => {
  const { api } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [period, setPeriod] = useState('week');
  const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'summary'
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchSummary();
  }, [period]);

  const fetchSummary = async () => {
    try {
      const response = await api.get(`/activities/summary?period=${period}`);
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching activity summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setShowDetails(true);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F472B6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Activity</h1>
          <p className="text-gray-500 mt-1">Real-time activity across the entire organization</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('feed')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'feed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('summary')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'summary' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <ActivityFilters 
        onFilterChange={handleFilterChange}
        className="shadow-sm"
      />

      {/* Summary Statistics */}
      {viewMode === 'summary' ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-900">{summary?.total || 0}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Unique Users</p>
                  <p className="text-2xl font-bold text-green-600">{summary?.uniqueUsers || 0}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Top Action</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {summary?.topActions?.[0]?._id?.replace(/_/g, ' ') || 'N/A'}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{summary?.topActions?.[0]?.count || 0} occurrences</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Daily</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round((summary?.total || 0) / (period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 90))}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Action Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Actions</h3>
              <div className="space-y-3">
                {summary?.topActions?.slice(0, 8).map((action, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{action._id.replace(/_/g, ' ')}</span>
                      <span className="font-medium">{action.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-0.5">
                      <div 
                        className="h-1.5 rounded-full"
                        style={{ 
                          width: `${(action.count / (summary?.total || 1)) * 100}%`,
                          backgroundColor: COLORS[idx % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Entity Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity by Entity</h3>
              <div className="space-y-3">
                {summary?.byEntity?.slice(0, 8).map((entity, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{entity._id}</span>
                      <span className="font-medium">{entity.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-0.5">
                      <div 
                        className="h-1.5 rounded-full"
                        style={{ 
                          width: `${(entity.count / (summary?.total || 1)) * 100}%`,
                          backgroundColor: COLORS[(idx + 3) % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Active Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Actions</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {summary?.topUsers?.map((user, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {user.user?.[0]?.firstName?.[0] || 'U'}
                          </div>
                          <span className="text-sm text-gray-800">
                            {user.user?.[0]?.firstName} {user.user?.[0]?.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 text-sm text-gray-600">{user.count}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${(user.count / (summary?.total || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">
                            {((user.count / (summary?.total || 1)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Activity Feed View */
        <ActivityFeed 
          limit={50}
          showFilters={false}
          onActivityClick={handleActivityClick}
          className="shadow-sm"
        />
      )}

      {/* Activity Details Modal */}
      {showDetails && selectedActivity && (
        <ActivityDetails
          activity={selectedActivity}
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedActivity(null);
          }}
        />
      )}
    </div>
  );
};

export default GlobalActivity;