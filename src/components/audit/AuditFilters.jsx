// components/audit/AuditFilters.jsx - COMPLETE MODERN VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Filter, X, Calendar, Users, Building2,
  Activity, Search, ChevronDown, ChevronUp,
  Check, RefreshCw, AlertCircle, Clock,
  FileText, Briefcase, Target, CheckCircle,
  User, Shield, Zap, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AuditFilters = ({ 
  onFilterChange, 
  onClear, 
  initialFilters = {},
  className = '' 
}) => {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    entityType: 'all',
    action: 'all',
    actionType: 'all',
    importance: 'all',
    status: 'all',
    userId: 'all',
    startDate: '',
    endDate: '',
    search: '',
    ...initialFilters
  });
  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const count = Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value && value.length > 0;
      if (key === 'startDate' || key === 'endDate') return value && value.length > 0;
      return value !== 'all' && value !== '';
    }).length;
    setActiveFilterCount(count);
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, getHeaders());
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data || []);
      } else {
        // Mock users if API fails
        setUsers([
          { _id: '1', firstName: 'John', lastName: 'Doe' },
          { _id: '2', firstName: 'Sarah', lastName: 'Smith' },
          { _id: '3', firstName: 'Mike', lastName: 'Johnson' },
          { _id: '4', firstName: 'Emily', lastName: 'Davis' },
          { _id: '5', firstName: 'Tom', lastName: 'Wilson' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Mock users
      setUsers([
        { _id: '1', firstName: 'John', lastName: 'Doe' },
        { _id: '2', firstName: 'Sarah', lastName: 'Smith' },
        { _id: '3', firstName: 'Mike', lastName: 'Johnson' },
        { _id: '4', firstName: 'Emily', lastName: 'Davis' },
        { _id: '5', firstName: 'Tom', lastName: 'Wilson' }
      ]);
    } finally {
      setLoading(false);
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
      actionType: 'all',
      importance: 'all',
      status: 'all',
      userId: 'all',
      startDate: '',
      endDate: '',
      search: ''
    };
    setFilters(resetFilters);
    if (onFilterChange) onFilterChange(resetFilters);
    if (onClear) onClear();
    toast.success('Filters cleared');
  };

  const getEntityIcon = (type) => {
    const icons = {
      'user': <User className="af-entity-type-icon" />,
      'lead': <Briefcase className="af-entity-type-icon" />,
      'client': <Building2 className="af-entity-type-icon" />,
      'project': <FileText className="af-entity-type-icon" />,
      'task': <CheckCircle className="af-entity-type-icon" />,
      'goal': <Target className="af-entity-type-icon" />,
      'kpi': <Activity className="af-entity-type-icon" />,
      'risk': <AlertTriangle className="af-entity-type-icon" />,
      'team': <Users className="af-entity-type-icon" />,
      'department': <Building2 className="af-entity-type-icon" />,
      'report': <FileText className="af-entity-type-icon" />,
      'schedule': <Clock className="af-entity-type-icon" />
    };
    return icons[type] || <Activity className="af-entity-type-icon" />;
  };

  const entityTypes = [
    { value: 'all', label: 'All Entities' },
    { value: 'user', label: 'Users', icon: User },
    { value: 'lead', label: 'Leads', icon: Briefcase },
    { value: 'client', label: 'Clients', icon: Building2 },
    { value: 'project', label: 'Projects', icon: FileText },
    { value: 'task', label: 'Tasks', icon: CheckCircle },
    { value: 'goal', label: 'Goals', icon: Target },
    { value: 'kpi', label: 'KPIs', icon: Activity },
    { value: 'risk', label: 'Risks', icon: AlertTriangle },
    { value: 'team', label: 'Teams', icon: Users },
    { value: 'department', label: 'Departments', icon: Building2 },
    { value: 'report', label: 'Reports', icon: FileText },
    { value: 'schedule', label: 'Schedules', icon: Clock }
  ];

  const actions = [
    { value: 'all', label: 'All Actions' },
    { value: 'created', label: 'Created', color: 'text-green-600' },
    { value: 'updated', label: 'Updated', color: 'text-blue-600' },
    { value: 'deleted', label: 'Deleted', color: 'text-red-600' },
    { value: 'login', label: 'Login', color: 'text-purple-600' },
    { value: 'logout', label: 'Logout', color: 'text-gray-600' },
    { value: 'approved', label: 'Approved', color: 'text-emerald-600' },
    { value: 'rejected', label: 'Rejected', color: 'text-red-600' },
    { value: 'assigned', label: 'Assigned', color: 'text-orange-600' },
    { value: 'completed', label: 'Completed', color: 'text-green-600' },
    { value: 'generated', label: 'Generated', color: 'text-blue-600' },
    { value: 'exported', label: 'Exported', color: 'text-indigo-600' }
  ];

  const actionTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'create', label: 'Create' },
    { value: 'read', label: 'Read' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'other', label: 'Other' }
  ];

  const importanceLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'low', label: 'Low', color: 'af-importance-low' },
    { value: 'medium', label: 'Medium', color: 'af-importance-medium' },
    { value: 'high', label: 'High', color: 'af-importance-high' },
    { value: 'critical', label: 'Critical', color: 'af-importance-critical' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'success', label: 'Success', color: 'af-status-success' },
    { value: 'failure', label: 'Failure', color: 'af-status-failure' },
    { value: 'pending', label: 'Pending', color: 'af-status-pending' }
  ];

  return (
    <div className={`af-container ${className}`}>
      {/* Header */}
      <div 
        className="af-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="af-header-left">
          <Filter className="af-header-icon" />
          <span className="af-header-title">Audit Filters</span>
          {activeFilterCount > 0 && (
            <span className="af-badge">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="af-header-right">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="af-clear-all-btn"
            >
              <X className="af-clear-all-icon" />
              Clear all
            </button>
          )}
          {expanded ? (
            <ChevronUp className="af-expand-icon" />
          ) : (
            <ChevronDown className="af-expand-icon" />
          )}
        </div>
      </div>

      {/* Filter Content */}
      {expanded && (
        <div className="af-content">
          {/* Search */}
          <div className="af-search-wrapper">
            <Search className="af-search-icon" />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="af-search-input"
            />
          </div>

          <div className="af-filters-grid">
            <div className="af-filter-group">
              <label className="af-filter-label">Entity Type</label>
              <select
                value={filters.entityType}
                onChange={(e) => handleFilterChange('entityType', e.target.value)}
                className="af-filter-select"
              >
                {entityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="af-filter-group">
              <label className="af-filter-label">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="af-filter-select"
              >
                {actions.map(action => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
            </div>

            <div className="af-filter-group">
              <label className="af-filter-label">Action Type</label>
              <select
                value={filters.actionType}
                onChange={(e) => handleFilterChange('actionType', e.target.value)}
                className="af-filter-select"
              >
                {actionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="af-filters-grid">
            <div className="af-filter-group">
              <label className="af-filter-label">Importance</label>
              <select
                value={filters.importance}
                onChange={(e) => handleFilterChange('importance', e.target.value)}
                className="af-filter-select"
              >
                {importanceLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            <div className="af-filter-group">
              <label className="af-filter-label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="af-filter-select"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div className="af-filter-group">
              <label className="af-filter-label">User</label>
              <select
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                className="af-filter-select"
              >
                <option value="all">All Users</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="af-filters-date">
            <div className="af-filter-group">
              <label className="af-filter-label">From Date</label>
              <div className="af-date-wrapper">
                <Calendar className="af-date-icon" />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="af-filter-input"
                />
              </div>
            </div>
            <div className="af-filter-group">
              <label className="af-filter-label">To Date</label>
              <div className="af-date-wrapper">
                <Calendar className="af-date-icon" />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="af-filter-input"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="af-active-filters">
              <span className="af-active-label">Active filters:</span>
              {filters.entityType !== 'all' && (
                <span className="af-filter-tag">
                  {entityTypes.find(t => t.value === filters.entityType)?.label || filters.entityType}
                  <button onClick={() => handleFilterChange('entityType', 'all')}>
                    <X className="af-filter-tag-icon" />
                  </button>
                </span>
              )}
              {filters.action !== 'all' && (
                <span className="af-filter-tag">
                  {actions.find(t => t.value === filters.action)?.label || filters.action}
                  <button onClick={() => handleFilterChange('action', 'all')}>
                    <X className="af-filter-tag-icon" />
                  </button>
                </span>
              )}
              {filters.importance !== 'all' && (
                <span className="af-filter-tag">
                  {importanceLevels.find(t => t.value === filters.importance)?.label || filters.importance}
                  <button onClick={() => handleFilterChange('importance', 'all')}>
                    <X className="af-filter-tag-icon" />
                  </button>
                </span>
              )}
              {filters.status !== 'all' && (
                <span className="af-filter-tag">
                  {statuses.find(t => t.value === filters.status)?.label || filters.status}
                  <button onClick={() => handleFilterChange('status', 'all')}>
                    <X className="af-filter-tag-icon" />
                  </button>
                </span>
              )}
              {filters.userId !== 'all' && filters.userId && (
                <span className="af-filter-tag">
                  {users.find(u => u._id === filters.userId)?.firstName || 'User'}
                  <button onClick={() => handleFilterChange('userId', 'all')}>
                    <X className="af-filter-tag-icon" />
                  </button>
                </span>
              )}
              {filters.search && (
                <span className="af-filter-tag">
                  "{filters.search}"
                  <button onClick={() => handleFilterChange('search', '')}>
                    <X className="af-filter-tag-icon" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Quick Filters */}
          <div className="af-quick-filters">
            <span className="af-quick-label">Quick filters:</span>
            <button
              onClick={() => {
                handleFilterChange('action', 'created');
                handleFilterChange('importance', 'high');
              }}
              className="af-quick-btn af-quick-btn-green"
            >
              <Zap className="af-quick-icon" />
              New High Impact
            </button>
            <button
              onClick={() => {
                handleFilterChange('actionType', 'delete');
              }}
              className="af-quick-btn af-quick-btn-red"
            >
              <AlertTriangle className="af-quick-icon" />
              Deletions
            </button>
            <button
              onClick={() => {
                handleFilterChange('status', 'failure');
              }}
              className="af-quick-btn af-quick-btn-yellow"
            >
              <AlertCircle className="af-quick-icon" />
              Failed Actions
            </button>
            <button
              onClick={() => {
                handleFilterChange('importance', 'critical');
              }}
              className="af-quick-btn af-quick-btn-critical"
            >
              <Shield className="af-quick-icon" />
              Critical Only
            </button>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .af-container {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .af-container:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* ============================================
           HEADER
           ============================================ */
        .af-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .af-header:hover {
          background: #f9fafb;
        }

        .af-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .af-header-icon {
          width: 18px;
          height: 18px;
          color: #6b7280;
        }

        .af-header-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .af-badge {
          padding: 1px 10px;
          font-size: 11px;
          font-weight: 500;
          background: #dbeafe;
          color: #1d4ed8;
          border-radius: 9999px;
        }

        .af-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .af-clear-all-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border: none;
          background: transparent;
          color: #6b7280;
          font-size: 12px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .af-clear-all-btn:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .af-clear-all-icon {
          width: 14px;
          height: 14px;
        }

        .af-expand-icon {
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        /* ============================================
           CONTENT
           ============================================ */
        .af-content {
          padding: 0 20px 20px 20px;
          border-top: 1px solid #f3f4f6;
        }

        /* ============================================
           SEARCH
           ============================================ */
        .af-search-wrapper {
          position: relative;
          margin-top: 16px;
        }

        .af-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        .af-search-input {
          width: 100%;
          padding: 9px 12px 9px 38px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #111827;
        }

        .af-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* ============================================
           FILTERS GRID
           ============================================ */
        .af-filters-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
        }

        @media (max-width: 1024px) {
          .af-filters-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .af-filters-grid {
            grid-template-columns: 1fr;
          }
        }

        .af-filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .af-filter-label {
          font-size: 11px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .af-filter-select {
          width: 100%;
          padding: 7px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #111827;
        }

        .af-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* ============================================
           DATE
           ============================================ */
        .af-filters-date {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
        }

        @media (max-width: 640px) {
          .af-filters-date {
            grid-template-columns: 1fr;
          }
        }

        .af-date-wrapper {
          position: relative;
        }

        .af-date-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 14px;
          height: 14px;
          color: #9ca3af;
        }

        .af-filter-input {
          width: 100%;
          padding: 7px 10px 7px 34px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #111827;
        }

        .af-filter-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* ============================================
           ACTIVE FILTERS
           ============================================ */
        .af-active-filters {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding: 8px 12px;
          background: #f9fafb;
          border-radius: 6px;
          border: 1px solid #f3f4f6;
        }

        .af-active-label {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
        }

        .af-filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px 2px 10px;
          background: #ffffff;
          color: #111827;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .af-filter-tag button {
          padding: 2px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          border-radius: 3px;
          transition: background 0.2s ease;
        }

        .af-filter-tag button:hover {
          background: #f3f4f6;
        }

        .af-filter-tag-icon {
          width: 12px;
          height: 12px;
          color: #6b7280;
        }

        /* ============================================
           QUICK FILTERS
           ============================================ */
        .af-quick-filters {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        }

        .af-quick-label {
          font-size: 12px;
          color: #6b7280;
        }

        .af-quick-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border: none;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .af-quick-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .af-quick-icon {
          width: 12px;
          height: 12px;
        }

        .af-quick-btn-green {
          background: #dcfce7;
          color: #16a34a;
        }

        .af-quick-btn-green:hover {
          background: #bbf7d0;
        }

        .af-quick-btn-red {
          background: #fee2e2;
          color: #dc2626;
        }

        .af-quick-btn-red:hover {
          background: #fecaca;
        }

        .af-quick-btn-yellow {
          background: #fef3c7;
          color: #d97706;
        }

        .af-quick-btn-yellow:hover {
          background: #fde68a;
        }

        .af-quick-btn-critical {
          background: #fecaca;
          color: #b91c1c;
        }

        .af-quick-btn-critical:hover {
          background: #fca5a5;
        }

        /* ============================================
           IMPORTANCE COLORS
           ============================================ */
        .af-importance-low { background: #f3f4f6; color: #6b7280; }
        .af-importance-medium { background: #dbeafe; color: #1d4ed8; }
        .af-importance-high { background: #fef3c7; color: #d97706; }
        .af-importance-critical { background: #fee2e2; color: #dc2626; }

        /* ============================================
           STATUS COLORS
           ============================================ */
        .af-status-success { background: #dcfce7; color: #16a34a; }
        .af-status-failure { background: #fee2e2; color: #dc2626; }
        .af-status-pending { background: #fef3c7; color: #d97706; }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .af-header {
            padding: 12px 16px;
          }

          .af-content {
            padding: 0 16px 16px 16px;
          }

          .af-header-title {
            font-size: 13px;
          }

          .af-filters-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .af-filters-grid {
            grid-template-columns: 1fr;
          }

          .af-filters-date {
            grid-template-columns: 1fr;
          }

          .af-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .af-header-right {
            width: 100%;
            justify-content: flex-end;
          }

          .af-quick-filters {
            flex-direction: column;
            align-items: flex-start;
          }

          .af-quick-btn {
            width: 100%;
            justify-content: center;
          }

          .af-active-filters {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default AuditFilters;