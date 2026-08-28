import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Target, TrendingUp, Clock, AlertCircle, CheckCircle,
  Filter, Plus, Search, Edit, Trash2, Eye,
  ChevronDown, ChevronRight, Calendar, Users,
  RefreshCw, X, Zap, Star, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const GoalList = () => {
  const { token } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    level: 'all',
    priority: 'all',
    search: ''
  });
  const [expanded, setExpanded] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchGoals();
  }, [filters]);

  const fetchGoals = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.level !== 'all') params.append('level', filters.level);
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      
      // Try to fetch from API
      let goalsData = [];
      try {
        const response = await fetch(`${API_URL}/goals?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          goalsData = data.data || [];
        }
      } catch (err) {
        console.warn('API not available, using mock data');
        goalsData = getMockGoals();
      }
      
      setGoals(goalsData);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
      setGoals(getMockGoals());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockGoals = () => [
    {
      _id: '1',
      name: 'Increase Revenue by 25%',
      description: 'Grow revenue through new client acquisition and upselling existing clients',
      status: 'on_track',
      priority: 'critical',
      level: 'company',
      progress: 65,
      expectedProgress: 60,
      target: { value: 1000000, unit: 'currency' },
      endDate: '2024-12-31',
      ownerId: { firstName: 'John', lastName: 'Doe' },
      children: [
        {
          _id: '1a',
          name: 'Acquire 50 New Clients',
          status: 'in_progress',
          progress: 40,
          ownerId: { firstName: 'Sarah' }
        },
        {
          _id: '1b',
          name: 'Increase Average Deal Size',
          status: 'on_track',
          progress: 70,
          ownerId: { firstName: 'Mike' }
        }
      ]
    },
    {
      _id: '2',
      name: 'Improve Customer Satisfaction',
      description: 'Increase CSAT score to 95% through better support and product improvements',
      status: 'in_progress',
      priority: 'high',
      level: 'department',
      progress: 45,
      expectedProgress: 50,
      target: { value: 95, unit: 'percentage' },
      endDate: '2024-11-15',
      ownerId: { firstName: 'Lisa', lastName: 'Davis' },
      children: []
    },
    {
      _id: '3',
      name: 'Launch New Product Feature',
      description: 'Develop and launch the new AI-powered feature for the platform',
      status: 'at_risk',
      priority: 'high',
      level: 'team',
      progress: 30,
      expectedProgress: 50,
      target: { value: 100, unit: 'percentage' },
      endDate: '2024-10-01',
      ownerId: { firstName: 'David', lastName: 'Brown' },
      children: [
        {
          _id: '3a',
          name: 'Complete UI Design',
          status: 'completed',
          progress: 100,
          ownerId: { firstName: 'Emma' }
        },
        {
          _id: '3b',
          name: 'Backend Integration',
          status: 'in_progress',
          progress: 45,
          ownerId: { firstName: 'Alex' }
        }
      ]
    },
    {
      _id: '4',
      name: 'Reduce Customer Churn',
      description: 'Decrease churn rate from 8% to 5% through retention strategies',
      status: 'behind',
      priority: 'critical',
      level: 'department',
      progress: 20,
      expectedProgress: 40,
      target: { value: 5, unit: 'percentage' },
      endDate: '2024-09-30',
      ownerId: { firstName: 'Emma', lastName: 'Wilson' },
      children: []
    },
    {
      _id: '5',
      name: 'Employee Training Program',
      description: 'Implement comprehensive training program for all employees',
      status: 'not_started',
      priority: 'medium',
      level: 'individual',
      progress: 0,
      expectedProgress: 0,
      target: { value: 100, unit: 'percentage' },
      endDate: '2025-01-15',
      ownerId: { firstName: 'Sarah', lastName: 'Smith' },
      children: []
    },
    {
      _id: '6',
      name: 'Q4 Marketing Campaign',
      description: 'Execute holiday season marketing campaign across all channels',
      status: 'completed',
      priority: 'medium',
      level: 'team',
      progress: 100,
      expectedProgress: 100,
      target: { value: 200000, unit: 'currency' },
      endDate: '2024-12-25',
      ownerId: { firstName: 'Mike', lastName: 'Johnson' },
      children: []
    }
  ];

  const handleRefresh = () => {
    fetchGoals(true);
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      level: 'all',
      priority: 'all',
      search: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'not_started': 'gl-status-not-started',
      'in_progress': 'gl-status-in-progress',
      'on_track': 'gl-status-on-track',
      'at_risk': 'gl-status-at-risk',
      'behind': 'gl-status-behind',
      'completed': 'gl-status-completed',
      'cancelled': 'gl-status-cancelled'
    };
    return colors[status] || 'gl-status-default';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="gl-status-icon gl-icon-green" />;
    if (status === 'at_risk' || status === 'behind') return <AlertCircle className="gl-status-icon gl-icon-red" />;
    if (status === 'on_track') return <TrendingUp className="gl-status-icon gl-icon-green" />;
    if (status === 'in_progress') return <Zap className="gl-status-icon gl-icon-blue" />;
    return <Clock className="gl-status-icon gl-icon-gray" />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'not_started': 'Not Started',
      'in_progress': 'In Progress',
      'on_track': 'On Track',
      'at_risk': 'At Risk',
      'behind': 'Behind',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'gl-priority-critical',
      'high': 'gl-priority-high',
      'medium': 'gl-priority-medium',
      'low': 'gl-priority-low'
    };
    return colors[priority] || 'gl-priority-default';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'critical': 'Critical',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return labels[priority] || priority;
  };

  const getLevelLabel = (level) => {
    const labels = {
      'company': '🏢 Company',
      'segment': '📊 Segment',
      'department': '🏛️ Department',
      'team': '👥 Team',
      'individual': '👤 Individual'
    };
    return labels[level] || level;
  };

  const getLevelColor = (level) => {
    const colors = {
      'company': 'gl-level-company',
      'segment': 'gl-level-segment',
      'department': 'gl-level-department',
      'team': 'gl-level-team',
      'individual': 'gl-level-individual'
    };
    return colors[level] || 'gl-level-default';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'gl-progress-green';
    if (progress >= 60) return 'gl-progress-blue';
    if (progress >= 40) return 'gl-progress-yellow';
    return 'gl-progress-red';
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (date) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'on_track', label: 'On Track' },
    { value: 'at_risk', label: 'At Risk' },
    { value: 'behind', label: 'Behind' },
    { value: 'completed', label: 'Completed' }
  ];

  const levelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'company', label: 'Company' },
    { value: 'segment', label: 'Segment' },
    { value: 'department', label: 'Department' },
    { value: 'team', label: 'Team' },
    { value: 'individual', label: 'Individual' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const hasActiveFilters = filters.status !== 'all' || filters.level !== 'all' || filters.priority !== 'all' || filters.search;

  if (loading) {
    return (
      <div className="gl-loading">
        <div className="gl-spinner"></div>
        <p className="gl-loading-text">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="gl-container">
      {/* Header */}
      <div className="gl-header">
        <div className="gl-header-left">
          <div className="gl-title-wrapper">
            <div className="gl-title-icon">
              <Target className="gl-title-svg" />
            </div>
            <div>
              <h3 className="gl-title">Goals</h3>
              <p className="gl-subtitle">Manage and track your goals</p>
            </div>
          </div>
          <span className="gl-count">{goals.length} goals</span>
        </div>
        <div className="gl-header-right">
          <button className="gl-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`gl-refresh-icon ${refreshing ? 'gl-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="gl-create-btn"
          >
            <Plus className="gl-btn-icon" />
            New Goal
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="gl-filters">
        <div className="gl-search-wrapper">
          <Search className="gl-search-icon" />
          <input
            type="text"
            placeholder="Search goals..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="gl-search-input"
          />
          {filters.search && (
            <button className="gl-search-clear" onClick={() => setFilters(prev => ({ ...prev, search: '' }))}>
              <X className="gl-search-clear-icon" />
            </button>
          )}
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="gl-filter-select"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={filters.level}
          onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
          className="gl-filter-select"
        >
          {levelOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          className="gl-filter-select"
        >
          {priorityOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {hasActiveFilters && (
          <button className="gl-clear-filters" onClick={handleClearFilters}>
            Clear All
          </button>
        )}
      </div>

      {/* Goal List */}
      <div className="gl-list">
        {goals.length === 0 ? (
          <div className="gl-empty">
            <div className="gl-empty-icon-wrapper">
              <Target className="gl-empty-icon" />
            </div>
            <h4 className="gl-empty-title">No Goals Found</h4>
            <p className="gl-empty-subtitle">
              {filters.search ? 'Try adjusting your search' : 'Create your first goal to get started'}
            </p>
            {!filters.search && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="gl-empty-btn"
              >
                <Plus className="gl-btn-icon" />
                Create Goal
              </button>
            )}
          </div>
        ) : (
          goals.map((goal, index) => (
            <div key={goal._id} className={`gl-item gl-item-${index}`}>
              <div 
                className="gl-item-content"
                onClick={() => toggleExpand(goal._id)}
              >
                <div className="gl-item-left">
                  <div className="gl-item-toggle">
                    {goal.children && goal.children.length > 0 ? (
                      expanded[goal._id] ? 
                        <ChevronDown className="gl-toggle-icon" /> : 
                        <ChevronRight className="gl-toggle-icon" />
                    ) : (
                      <div className="gl-toggle-placeholder" />
                    )}
                  </div>

                  <div className="gl-item-icon">
                    {getStatusIcon(goal.status)}
                  </div>

                  <div className="gl-item-info">
                    <div className="gl-item-header">
                      <span className="gl-item-name">{goal.name}</span>
                      <span className={`gl-item-status ${getStatusColor(goal.status)}`}>
                        {getStatusLabel(goal.status)}
                      </span>
                      <span className={`gl-item-priority ${getPriorityColor(goal.priority)}`}>
                        {getPriorityLabel(goal.priority)}
                      </span>
                      <span className={`gl-item-level ${getLevelColor(goal.level)}`}>
                        {getLevelLabel(goal.level)}
                      </span>
                    </div>
                    
                    {goal.description && (
                      <p className="gl-item-desc">{goal.description}</p>
                    )}
                    
                    <div className="gl-item-meta">
                      <span className="gl-meta-item">
                        Target: {goal.target?.value} {goal.target?.unit}
                      </span>
                      <span className="gl-meta-item">
                        Progress: {goal.progress}%
                      </span>
                      <span className="gl-meta-item">
                        <Calendar className="gl-meta-icon" />
                        {formatDate(goal.endDate)}
                      </span>
                      <span className="gl-meta-item">
                        <Users className="gl-meta-icon" />
                        {goal.ownerId?.firstName} {goal.ownerId?.lastName || ''}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="gl-progress-wrapper">
                      <div className="gl-progress-bar">
                        <div 
                          className={`gl-progress-fill ${getProgressColor(goal.progress)}`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <div className="gl-progress-info">
                        <span className="gl-progress-text">{goal.progress}%</span>
                        <span className="gl-progress-expected">
                          Expected: {goal.expectedProgress || 0}%
                        </span>
                        {goal.progress >= (goal.expectedProgress || 0) ? (
                          <CheckCircle className="gl-progress-check" />
                        ) : (
                          <AlertCircle className="gl-progress-alert" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="gl-item-actions">
                  <button className="gl-action-btn gl-action-view" onClick={(e) => e.stopPropagation()}>
                    <Eye className="gl-action-icon" />
                  </button>
                  <button className="gl-action-btn gl-action-edit" onClick={(e) => e.stopPropagation()}>
                    <Edit className="gl-action-icon" />
                  </button>
                  <button className="gl-action-btn gl-action-delete" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="gl-action-icon" />
                  </button>
                </div>
              </div>

              {/* Child Goals */}
              {expanded[goal._id] && goal.children && goal.children.length > 0 && (
                <div className="gl-children">
                  {goal.children.map((child) => (
                    <div key={child._id} className="gl-child">
                      <div className="gl-child-content">
                        <div className="gl-child-left">
                          <div className="gl-child-icon">
                            {getStatusIcon(child.status)}
                          </div>
                          <span className="gl-child-name">{child.name}</span>
                          <span className={`gl-child-status ${getStatusColor(child.status)}`}>
                            {getStatusLabel(child.status)}
                          </span>
                        </div>
                        <div className="gl-child-right">
                          <span className="gl-child-progress">{child.progress}%</span>
                          <span className="gl-child-owner">
                            <Users className="gl-meta-icon" />
                            {child.ownerId?.firstName || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .gl-container {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          animation: glFadeIn 0.4s ease;
        }

        @keyframes glFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .gl-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 0;
          gap: 16px;
        }

        .gl-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: glSpin 0.8s linear infinite;
        }

        .gl-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes glSpin {
          to { transform: rotate(360deg); }
        }

        .gl-spin {
          animation: glSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .gl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          flex-wrap: wrap;
          gap: 12px;
        }

        .gl-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .gl-title-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .gl-title-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .gl-title-svg {
          width: 20px;
          height: 20px;
          color: #ffffff;
        }

        .gl-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .gl-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .gl-count {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 12px;
          border-radius: 12px;
        }

        .gl-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gl-refresh-btn {
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

        .gl-refresh-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .gl-refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .gl-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .gl-create-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .gl-create-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        .gl-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .gl-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
          flex-wrap: wrap;
        }

        .gl-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 180px;
        }

        .gl-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .gl-search-input {
          width: 100%;
          padding: 6px 32px 6px 34px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
        }

        .gl-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .gl-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          padding: 2px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }

        .gl-search-clear:hover {
          background: #f1f5f9;
        }

        .gl-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .gl-filter-select {
          padding: 6px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 120px;
        }

        .gl-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .gl-clear-filters {
          padding: 6px 14px;
          background: #fee2e2;
          color: #ef4444;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gl-clear-filters:hover {
          background: #fecaca;
        }

        /* ============================================
           LIST
           ============================================ */
        .gl-list {
          max-height: 600px;
          overflow-y: auto;
          padding: 4px 0;
        }

        .gl-list::-webkit-scrollbar {
          width: 4px;
        }

        .gl-list::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .gl-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .gl-item {
          border-bottom: 1px solid #f1f5f9;
          animation: glSlideUp 0.3s ease both;
        }

        .gl-item:nth-child(1) { animation-delay: 0.05s; }
        .gl-item:nth-child(2) { animation-delay: 0.1s; }
        .gl-item:nth-child(3) { animation-delay: 0.15s; }
        .gl-item:nth-child(4) { animation-delay: 0.2s; }
        .gl-item:nth-child(5) { animation-delay: 0.25s; }

        @keyframes glSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gl-item:last-child {
          border-bottom: none;
        }

        .gl-item-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 14px 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          gap: 12px;
        }

        .gl-item-content:hover {
          background: #f8fafc;
        }

        .gl-item-left {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .gl-item-toggle {
          padding-top: 2px;
          flex-shrink: 0;
        }

        .gl-toggle-icon {
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .gl-toggle-placeholder {
          width: 16px;
          height: 16px;
        }

        .gl-item-icon {
          padding-top: 2px;
          flex-shrink: 0;
        }

        .gl-status-icon {
          width: 18px;
          height: 18px;
        }

        .gl-icon-green { color: #22c55e; }
        .gl-icon-red { color: #ef4444; }
        .gl-icon-blue { color: #3b82f6; }
        .gl-icon-gray { color: #94a3b8; }

        .gl-item-info {
          flex: 1;
          min-width: 0;
        }

        .gl-item-header {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .gl-item-name {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .gl-item-status {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .gl-status-not-started { background: #f1f5f9; color: #64748b; }
        .gl-status-in-progress { background: #dbeafe; color: #3b82f6; }
        .gl-status-on-track { background: #d1fae5; color: #22c55e; }
        .gl-status-at-risk { background: #fef3c7; color: #f59e0b; }
        .gl-status-behind { background: #fee2e2; color: #ef4444; }
        .gl-status-completed { background: #d1fae5; color: #10b981; }
        .gl-status-cancelled { background: #f1f5f9; color: #94a3b8; }

        .gl-item-priority {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .gl-priority-critical { background: #fef2f2; color: #dc2626; }
        .gl-priority-high { background: #fffbeb; color: #d97706; }
        .gl-priority-medium { background: #eff6ff; color: #3b82f6; }
        .gl-priority-low { background: #ecfdf5; color: #22c55e; }

        .gl-item-level {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .gl-level-company { background: #f5f3ff; color: #7c3aed; }
        .gl-level-segment { background: #eff6ff; color: #3b82f6; }
        .gl-level-department { background: #ecfdf5; color: #10b981; }
        .gl-level-team { background: #fffbeb; color: #d97706; }
        .gl-level-individual { background: #fdf2f8; color: #db2777; }

        .gl-item-desc {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .gl-item-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 6px;
          font-size: 12px;
          color: #64748b;
          flex-wrap: wrap;
        }

        .gl-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .gl-meta-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        /* Progress */
        .gl-progress-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }

        .gl-progress-bar {
          flex: 1;
          max-width: 200px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .gl-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .gl-progress-green { background: #22c55e; }
        .gl-progress-blue { background: #3b82f6; }
        .gl-progress-yellow { background: #f59e0b; }
        .gl-progress-red { background: #ef4444; }

        .gl-progress-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }

        .gl-progress-text {
          font-weight: 600;
          color: #0f172a;
        }

        .gl-progress-expected {
          color: #94a3b8;
        }

        .gl-progress-check {
          width: 16px;
          height: 16px;
          color: #22c55e;
        }

        .gl-progress-alert {
          width: 16px;
          height: 16px;
          color: #ef4444;
        }

        /* Actions */
        .gl-item-actions {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
          padding-top: 2px;
        }

        .gl-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #94a3b8;
        }

        .gl-action-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .gl-action-view:hover { background: #eff6ff; color: #3b82f6; }
        .gl-action-edit:hover { background: #ecfdf5; color: #22c55e; }
        .gl-action-delete:hover { background: #fef2f2; color: #ef4444; }

        .gl-action-icon {
          width: 16px;
          height: 16px;
        }

        /* Children */
        .gl-children {
          padding: 0 20px 12px 64px;
          animation: glSlideDown 0.3s ease;
        }

        @keyframes glSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gl-child {
          padding: 8px 12px;
          margin-bottom: 6px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
          transition: all 0.2s ease;
        }

        .gl-child:hover {
          background: #f1f5f9;
        }

        .gl-child-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .gl-child-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gl-child-icon {
          display: flex;
          align-items: center;
        }

        .gl-child-name {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
        }

        .gl-child-status {
          font-size: 10px;
          font-weight: 500;
          padding: 1px 8px;
          border-radius: 10px;
        }

        .gl-child-right {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #64748b;
        }

        .gl-child-progress {
          font-weight: 600;
          color: #0f172a;
        }

        .gl-child-owner {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .gl-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }

        .gl-empty-icon-wrapper {
          width: 72px;
          height: 72px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .gl-empty-icon {
          width: 32px;
          height: 32px;
          color: #94a3b8;
        }

        .gl-empty-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .gl-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .gl-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .gl-empty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .gl-header {
            flex-direction: column;
            align-items: stretch;
            padding: 14px 16px;
          }

          .gl-header-left {
            flex-wrap: wrap;
          }

          .gl-header-right {
            justify-content: flex-end;
          }

          .gl-filters {
            flex-direction: column;
            padding: 10px 16px;
          }

          .gl-search-wrapper {
            width: 100%;
          }

          .gl-filter-select {
            width: 100%;
            min-width: unset;
          }

          .gl-item-content {
            flex-direction: column;
            padding: 12px 16px;
          }

          .gl-item-left {
            flex-wrap: wrap;
          }

          .gl-item-actions {
            align-self: flex-end;
          }

          .gl-item-header {
            gap: 4px;
          }

          .gl-item-meta {
            gap: 8px;
            font-size: 11px;
          }

          .gl-progress-wrapper {
            flex-wrap: wrap;
          }

          .gl-progress-bar {
            max-width: 100%;
            flex: 1;
            min-width: 100px;
          }

          .gl-children {
            padding: 0 12px 12px 40px;
          }

          .gl-child-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .gl-child-right {
            width: 100%;
            justify-content: flex-start;
          }

          .gl-title-wrapper {
            gap: 8px;
          }

          .gl-title-icon {
            width: 34px;
            height: 34px;
          }

          .gl-title-svg {
            width: 16px;
            height: 16px;
          }

          .gl-title {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .gl-header-right {
            flex-direction: column;
            align-items: stretch;
          }

          .gl-create-btn {
            width: 100%;
            justify-content: center;
          }

          .gl-refresh-btn {
            align-self: flex-end;
          }

          .gl-item-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .gl-item-actions {
            align-self: flex-start;
            margin-top: 4px;
          }

          .gl-child {
            padding: 6px 10px;
          }

          .gl-child-left {
            flex-wrap: wrap;
          }

          .gl-child-right {
            flex-wrap: wrap;
          }

          .gl-empty-icon-wrapper {
            width: 56px;
            height: 56px;
          }

          .gl-empty-icon {
            width: 24px;
            height: 24px;
          }

          .gl-empty-title {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default GoalList;