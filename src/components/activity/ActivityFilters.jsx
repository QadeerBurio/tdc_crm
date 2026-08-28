import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Filter, X, Calendar, Users, Briefcase, Target,
  Activity, CheckCircle, AlertCircle, Clock,
  ChevronDown, ChevronUp, Search
} from 'lucide-react';

const ActivityFilters = ({ 
  onFilterChange, 
  onClear, 
  initialFilters = {},
  className = '' 
}) => {
  const { api } = useAuth();
  const [filters, setFilters] = useState({
    entityType: 'all',
    action: 'all',
    importance: 'all',
    userId: 'all',
    startDate: '',
    endDate: '',
    search: '',
    ...initialFilters
  });
  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Count active filters
    const count = Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value && value.length > 0;
      if (key === 'startDate' || key === 'endDate') return value && value.length > 0;
      return value !== 'all' && value !== '';
    }).length;
    setActiveFilterCount(count);
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      entityType: 'all',
      action: 'all',
      importance: 'all',
      userId: 'all',
      startDate: '',
      endDate: '',
      search: ''
    };
    setFilters(resetFilters);
    if (onFilterChange) onFilterChange(resetFilters);
    if (onClear) onClear();
  };

  const entityTypes = [
    { value: 'all', label: 'All Types', icon: Activity },
    { value: 'lead', label: 'Leads', icon: Briefcase },
    { value: 'client', label: 'Clients', icon: Users },
    { value: 'project', label: 'Projects', icon: Target },
    { value: 'task', label: 'Tasks', icon: CheckCircle },
    { value: 'goal', label: 'Goals', icon: Target },
    { value: 'kpi', label: 'KPIs', icon: Activity },
    { value: 'user', label: 'Users', icon: Users },
    { value: 'team', label: 'Teams', icon: Users },
    { value: 'risk', label: 'Risks', icon: AlertCircle }
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
    { value: 'logout', label: 'Logout' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'reassigned', label: 'Reassigned' }
  ];

  const importanceLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: 'High', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-700">Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Clear all
              </button>
            )}
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {expanded && (
        <div className="p-4 pt-0 border-t border-gray-200">
          {/* Search */}
          <div className="relative mt-3">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            {/* Entity Type */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Entity Type</label>
              <select
                value={filters.entityType}
                onChange={(e) => handleFilterChange('entityType', e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {entityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Action */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {actions.map(action => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
            </div>

            {/* Importance */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Importance</label>
              <select
                value={filters.importance}
                onChange={(e) => handleFilterChange('importance', e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {importanceLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            {/* User */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">User</label>
              <select
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">Quick filters:</span>
              <button
                onClick={() => {
                  handleFilterChange('entityType', 'task');
                  handleFilterChange('action', 'completed');
                }}
                className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
              >
                Task Completions
              </button>
              <button
                onClick={() => {
                  handleFilterChange('entityType', 'lead');
                  handleFilterChange('action', 'created');
                }}
                className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
              >
                New Leads
              </button>
              <button
                onClick={() => {
                  handleFilterChange('importance', 'critical');
                }}
                className="px-2 py-0.5 text-xs bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors"
              >
                Critical Only
              </button>
              <button
                onClick={() => {
                  handleFilterChange('entityType', 'risk');
                }}
                className="px-2 py-0.5 text-xs bg-yellow-100 hover:bg-yellow-200 rounded-full text-yellow-600 transition-colors"
              >
                Risks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFilters;