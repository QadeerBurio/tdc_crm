// components/goals/GoalList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Target, TrendingUp, Clock, AlertCircle, CheckCircle,
  Filter, Plus, Search, Edit, Trash2, Eye,
  ChevronDown, ChevronRight, Calendar, Users,
  RefreshCw, X, Zap, Star, Award, Layers,
  BarChart3, Flag, Sparkles, ArrowUpRight,
  CircleDot, Timer, Rocket, Crown, Gem,
  MoreVertical, Play, Pause, Square, PieChart,
  Save, XCircle, Activity, Gift, Shield,
  Crown as CrownIcon, Medal
} from 'lucide-react';
import toast from 'react-hot-toast';

const GoalList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
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
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

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
      target: { value: 1000000, unit: 'USD' },
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
      target: { value: 200000, unit: 'USD' },
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

  const handleViewGoal = (goalId) => {
    navigate(`/goals/${goalId}`);
  };

  const startEditing = (goal, e) => {
    e.stopPropagation();
    setEditingGoalId(goal._id);
    setEditFormData({
      name: goal.name || '',
      description: goal.description || '',
      status: goal.status || 'not_started',
      priority: goal.priority || 'medium',
      level: goal.level || 'company',
      progress: goal.progress || 0,
      expectedProgress: goal.expectedProgress || 0,
      targetValue: goal.target?.value || '',
      targetUnit: goal.target?.unit || '',
      endDate: goal.endDate || '',
      ownerId: goal.ownerId?._id || ''
    });
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingGoalId(null);
    setEditFormData({});
  };

  const saveGoal = async (goalId, e) => {
    e.stopPropagation();
    setSaving(true);
    
    try {
      const updateData = {
        name: editFormData.name,
        description: editFormData.description,
        status: editFormData.status,
        priority: editFormData.priority,
        level: editFormData.level,
        progress: parseInt(editFormData.progress) || 0,
        expectedProgress: parseInt(editFormData.expectedProgress) || 0,
        target: {
          value: parseFloat(editFormData.targetValue) || 0,
          unit: editFormData.targetUnit
        },
        endDate: editFormData.endDate
      };

      try {
        const response = await fetch(`${API_URL}/goals/${goalId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          toast.success('Goal updated successfully!');
        } else {
          throw new Error('API update failed');
        }
      } catch (err) {
        console.warn('API not available, updating locally');
        setGoals(prev => prev.map(goal => {
          if (goal._id === goalId) {
            return {
              ...goal,
              ...updateData,
              target: updateData.target
            };
          }
          return goal;
        }));
        toast.success('Goal updated locally!');
      }

      setEditingGoalId(null);
      setEditFormData({});
      await fetchGoals(true);
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    } finally {
      setSaving(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
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
      'company': 'Company',
      'segment': 'Segment',
      'department': 'Department',
      'team': 'Team',
      'individual': 'Individual'
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
        <div className="gl-loading-spinner"></div>
        <p className="gl-loading-text">Loading goals...</p>
      </div>
    );
  }

  // Render Modern Goal Card
  const renderGoalCard = (goal, index) => {
    const isEditing = editingGoalId === goal._id;
    const isExpanded = expanded[goal._id];
    const hasChildren = goal.children && goal.children.length > 0;
    const daysLeft = goal.endDate ? Math.ceil((new Date(goal.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    const isOnTrack = goal.progress >= (goal.expectedProgress || 0);

    // Get level icon
    const getLevelIcon = (level) => {
      const icons = {
        'company': <CrownIcon className="gl-level-icon-svg" />,
        'segment': <Gift className="gl-level-icon-svg" />,
        'department': <Shield className="gl-level-icon-svg" />,
        'team': <Users className="gl-level-icon-svg" />,
        'individual': <Medal className="gl-level-icon-svg" />
      };
      return icons[level] || <Target className="gl-level-icon-svg" />;
    };

    return (
      <div key={goal._id} className="gl-item" style={{ animationDelay: `${index * 0.05}s` }}>
        <div 
          className={`gl-item-content ${isEditing ? 'gl-item-editing' : ''} ${isExpanded ? 'gl-item-expanded' : ''}`}
        >
          <div className="gl-item-left">
            {/* Toggle button */}
            <div className="gl-item-toggle">
              {hasChildren && !isEditing && (
                <button 
                  className="gl-node-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(goal._id);
                  }}
                >
                  <div className={`gl-toggle-indicator ${isExpanded ? 'gl-toggle-open' : ''}`}>
                    <ChevronRight className="gl-toggle-icon" />
                  </div>
                </button>
              )}
            </div>

            {/* Status icon with pulse effect */}
            <div className="gl-status-icon-wrapper">
              <div className={`gl-status-pulse ${goal.status}`}></div>
              {getStatusIcon(goal.status)}
            </div>

            <div className="gl-item-info">
              {!isEditing ? (
                // === DISPLAY MODE ===
                <>
                  {/* Header with goal name and badges */}
                  <div className="gl-item-header">
                    <span className="gl-item-name">{goal.name}</span>
                    <span className={`gl-item-level ${getLevelColor(goal.level)}`}>
                      {getLevelIcon(goal.level)}
                      {getLevelLabel(goal.level)}
                    </span>
                    <span className={`gl-item-priority ${getPriorityColor(goal.priority)}`}>
                      <Flag className="gl-priority-icon" />
                      {getPriorityLabel(goal.priority)}
                    </span>
                  </div>
                  
                  {/* Description */}
                  {goal.description && (
                    <p className="gl-item-desc">{goal.description}</p>
                  )}
                  
                  {/* Meta information */}
                  <div className="gl-item-meta">
                    <span className="gl-meta-item">
                      <Target className="gl-meta-icon" />
                      Target: {goal.target?.value.toLocaleString()} {goal.target?.unit}
                    </span>
                    <span className="gl-meta-item">
                      <Calendar className="gl-meta-icon" />
                      {formatDate(goal.endDate)}
                    </span>
                    <span className="gl-meta-item">
                      <Users className="gl-meta-icon" />
                      {goal.ownerId?.firstName} {goal.ownerId?.lastName || ''}
                    </span>
                    {daysLeft !== null && daysLeft > 0 && (
                      <span className={`gl-meta-item gl-days-left ${daysLeft < 15 ? 'gl-days-urgent' : ''}`}>
                        <Timer className="gl-meta-icon" />
                        {daysLeft} days left
                      </span>
                    )}
                  </div>

                  {/* Progress Section - Modern Card */}
                  <div className="gl-progress-card">
                    <div className="gl-progress-header">
                      <div className="gl-progress-title">
                        <Activity className="gl-progress-icon" />
                        <span className="gl-progress-label">Progress</span>
                      </div>
                      <div className="gl-progress-stats">
                        <span className="gl-progress-current">{goal.progress}%</span>
                        <span className="gl-progress-divider">|</span>
                        <span className="gl-progress-target">Target: {goal.expectedProgress || 0}%</span>
                      </div>
                    </div>
                    
                    <div className="gl-progress-track">
                      <div className="gl-progress-bar-container">
                        <div 
                          className={`gl-progress-fill ${getProgressColor(goal.progress)}`}
                          style={{ width: `${goal.progress}%` }}
                        >
                          <div className="gl-progress-shimmer"></div>
                        </div>
                      </div>
                      <div className="gl-progress-marker-group">
                        <div 
                          className="gl-progress-marker gl-marker-expected" 
                          style={{ left: `${goal.expectedProgress || 0}%` }}
                        >
                          <div className="gl-marker-line"></div>
                          <span className="gl-marker-label">Expected</span>
                        </div>
                        <div 
                          className="gl-progress-marker gl-marker-current" 
                          style={{ left: `${goal.progress}%` }}
                        >
                          <div className="gl-marker-dot"></div>
                          <span className="gl-marker-label">{goal.progress}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="gl-progress-footer">
                      <div className={`gl-progress-status ${isOnTrack ? 'gl-status-success' : 'gl-status-warning'}`}>
                        {isOnTrack ? (
                          <>
                            <CheckCircle className="gl-status-icon-small" />
                            On Track
                          </>
                        ) : (
                          <>
                            <AlertCircle className="gl-status-icon-small" />
                            Needs Attention
                          </>
                        )}
                      </div>
                      {goal.endDate && (
                        <div className="gl-progress-timeline">
                          <Clock className="gl-timeline-icon" />
                          <span className="gl-timeline-text">
                            {daysLeft > 0 ? `${daysLeft} days remaining` : 'Due date passed'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                // === EDIT MODE ===
                <div className="gl-edit-form">
                  <div className="gl-edit-header">
                    <span className="gl-edit-title">Edit Goal</span>
                  </div>
                  <div className="gl-edit-row">
                    <div className="gl-edit-group gl-edit-group-full">
                      <label className="gl-edit-label">Goal Name</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => handleEditChange('name', e.target.value)}
                        className="gl-edit-input"
                        placeholder="Enter goal name"
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <div className="gl-edit-row">
                    <div className="gl-edit-group gl-edit-group-full">
                      <label className="gl-edit-label">Description</label>
                      <textarea
                        value={editFormData.description}
                        onChange={(e) => handleEditChange('description', e.target.value)}
                        className="gl-edit-textarea"
                        rows="2"
                        placeholder="Enter goal description"
                      />
                    </div>
                  </div>
                  
                  <div className="gl-edit-row">
                    <div className="gl-edit-group">
                      <label className="gl-edit-label">Status</label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => handleEditChange('status', e.target.value)}
                        className="gl-edit-select"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_track">On Track</option>
                        <option value="at_risk">At Risk</option>
                        <option value="behind">Behind</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="gl-edit-group">
                      <label className="gl-edit-label">Priority</label>
                      <select
                        value={editFormData.priority}
                        onChange={(e) => handleEditChange('priority', e.target.value)}
                        className="gl-edit-select"
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="gl-edit-row">
                    <div className="gl-edit-group">
                      <label className="gl-edit-label">Level</label>
                      <select
                        value={editFormData.level}
                        onChange={(e) => handleEditChange('level', e.target.value)}
                        className="gl-edit-select"
                      >
                        <option value="company">Company</option>
                        <option value="segment">Segment</option>
                        <option value="department">Department</option>
                        <option value="team">Team</option>
                        <option value="individual">Individual</option>
                      </select>
                    </div>
                    <div className="gl-edit-group">
                      <label className="gl-edit-label">End Date</label>
                      <input
                        type="date"
                        value={editFormData.endDate}
                        onChange={(e) => handleEditChange('endDate', e.target.value)}
                        className="gl-edit-input"
                      />
                    </div>
                  </div>
                  
                  <div className="gl-edit-row">
                    <div className="gl-edit-group">
                      <label className="gl-edit-label">Progress (%)</label>
                      <input
                        type="number"
                        value={editFormData.progress}
                        onChange={(e) => handleEditChange('progress', e.target.value)}
                        className="gl-edit-input"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="gl-edit-group">
                      <label className="gl-edit-label">Expected Progress (%)</label>
                      <input
                        type="number"
                        value={editFormData.expectedProgress}
                        onChange={(e) => handleEditChange('expectedProgress', e.target.value)}
                        className="gl-edit-input"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div className="gl-edit-row">
                    <div className="gl-edit-group">
                      <label className="gl-edit-label">Target Value</label>
                      <input
                        type="number"
                        value={editFormData.targetValue}
                        onChange={(e) => handleEditChange('targetValue', e.target.value)}
                        className="gl-edit-input"
                        placeholder="0"
                      />
                    </div>
                    <div className="gl-edit-group">
                      <label className="gl-edit-label">Target Unit</label>
                      <input
                        type="text"
                        value={editFormData.targetUnit}
                        onChange={(e) => handleEditChange('targetUnit', e.target.value)}
                        className="gl-edit-input"
                        placeholder="USD, %, etc."
                      />
                    </div>
                  </div>
                  
                  <div className="gl-edit-actions">
                    <button
                      onClick={(e) => cancelEditing(e)}
                      className="gl-edit-cancel"
                      disabled={saving}
                    >
                      <XCircle className="gl-btn-icon" />
                      Cancel
                    </button>
                    <button
                      onClick={(e) => saveGoal(goal._id, e)}
                      className="gl-edit-save"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="gl-save-spinner"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="gl-btn-icon" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="gl-item-actions">
              <button 
                className="gl-action-btn gl-action-view" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewGoal(goal._id);
                }}
                title="View Goal Details"
              >
                <Eye className="gl-action-icon" />
              </button>
              <button 
                className="gl-action-btn gl-action-edit" 
                onClick={(e) => startEditing(goal, e)}
                title="Edit Goal"
              >
                <Edit className="gl-action-icon" />
              </button>
              <button 
                className="gl-action-btn gl-action-delete" 
                onClick={(e) => e.stopPropagation()}
                title="Delete Goal"
              >
                <Trash2 className="gl-action-icon" />
              </button>
              <button 
                className="gl-action-btn gl-action-more" 
                onClick={(e) => e.stopPropagation()}
                title="More options"
              >
                <MoreVertical className="gl-action-icon" />
              </button>
            </div>
          )}
        </div>

        {/* Child Goals */}
        {!isEditing && isExpanded && hasChildren && (
          <div className="gl-children">
            <div className="gl-children-header">
              <span className="gl-children-title">
                <Layers className="gl-children-icon" />
                Sub-goals
              </span>
              <span className="gl-children-count">{goal.children.length} items</span>
            </div>
            {goal.children.map((child, idx) => (
              <div key={child._id} className="gl-child" style={{ animationDelay: `${idx * 0.03}s` }}>
                <div className="gl-child-content">
                  <div className="gl-child-left">
                    <div className="gl-child-icon-wrapper">
                      <div className={`gl-child-status-dot ${child.status}`}></div>
                      {getStatusIcon(child.status)}
                    </div>
                    <span className="gl-child-name">{child.name}</span>
                    <span className={`gl-child-status ${getStatusColor(child.status)}`}>
                      <span className="gl-status-dot"></span>
                      {getStatusLabel(child.status)}
                    </span>
                  </div>
                  <div className="gl-child-right">
                    <div className="gl-child-progress-wrapper">
                      <div className="gl-child-progress-bar">
                        <div 
                          className={`gl-child-progress-fill ${getProgressColor(child.progress)}`}
                          style={{ width: `${child.progress}%` }}
                        />
                      </div>
                      <span className="gl-child-progress">{child.progress}%</span>
                    </div>
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
    );
  };

  return (
    <>
      <div className="gl-container">
        {/* Header */}
        <div className="gl-header">
          <div className="gl-header-left">
            <div className="gl-title-wrapper">
              <div className="gl-title-icon">
                <Layers className="gl-title-svg" />
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
            goals.map((goal, index) => renderGoalCard(goal, index))
          )}
        </div>
      </div>

      <style>{`
        /* ============================================
           CONTAINER - Modern Premium Design
           ============================================ */
        .gl-container {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(1, 62, 55, 0.06);
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.02),
            0 8px 32px rgba(1, 62, 55, 0.06);
          overflow: hidden;
          animation: glFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gl-container:hover {
          border-color: rgba(1, 62, 55, 0.12);
          box-shadow: 0 12px 48px rgba(1, 62, 55, 0.10);
        }

        @keyframes glFadeIn {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .gl-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 20px;
        }

        .gl-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(1, 62, 55, 0.06);
          border-top-color: #013E37;
          border-radius: 50%;
          animation: glSpin 0.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        .gl-loading-text {
          color: #013E37;
          opacity: 0.4;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.3px;
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
          padding: 20px 28px;
          background: linear-gradient(135deg, #013E37 0%, #0A5C54 100%);
          flex-wrap: wrap;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }

        .gl-header::before {
          content: '';
          position: absolute;
          top: -60%;
          right: -10%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 239, 179, 0.06) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .gl-header::after {
          content: '';
          position: absolute;
          bottom: -40%;
          left: 5%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 239, 179, 0.04) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .gl-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 1;
        }

        .gl-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .gl-title-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 239, 179, 0.12);
          backdrop-filter: blur(12px);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(255, 239, 179, 0.08);
        }

        .gl-title-svg {
          width: 24px;
          height: 24px;
          color: #FFEFB3;
        }

        .gl-title {
          font-size: 22px;
          font-weight: 700;
          color: #FFEFB3;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .gl-subtitle {
          font-size: 13px;
          color: rgba(255, 239, 179, 0.6);
          margin: 0;
          font-weight: 400;
        }

        .gl-count {
          font-size: 13px;
          font-weight: 600;
          color: #013E37;
          background: #FFEFB3;
          padding: 4px 16px;
          border-radius: 20px;
          box-shadow: 0 2px 12px rgba(255, 239, 179, 0.25);
        }

        .gl-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1;
        }

        .gl-refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 9px 12px;
          border: 1px solid rgba(255, 239, 179, 0.15);
          border-radius: 12px;
          background: rgba(255, 239, 179, 0.06);
          backdrop-filter: blur(10px);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          color: #FFEFB3;
        }

        .gl-refresh-btn:hover:not(:disabled) {
          background: rgba(255, 239, 179, 0.15);
          border-color: rgba(255, 239, 179, 0.3);
          transform: scale(1.05);
        }

        .gl-refresh-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .gl-refresh-icon {
          width: 18px;
          height: 18px;
        }

        .gl-create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #FFEFB3;
          color: #013E37;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 24px rgba(255, 239, 179, 0.25);
        }

        .gl-create-btn:hover {
          background: #fff8d6;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 36px rgba(255, 239, 179, 0.35);
        }

        .gl-btn-icon {
          width: 18px;
          height: 18px;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .gl-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 28px;
          background: #fafaf8;
          border-bottom: 1px solid rgba(1, 62, 55, 0.04);
          flex-wrap: wrap;
        }

        .gl-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .gl-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: #013E37;
          opacity: 0.3;
        }

        .gl-search-input {
          width: 100%;
          padding: 9px 40px 9px 40px;
          border: 2px solid rgba(1, 62, 55, 0.04);
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          color: #013E37;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gl-search-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 4px rgba(1, 62, 55, 0.04);
        }

        .gl-search-input::placeholder {
          color: #013E37;
          opacity: 0.25;
        }

        .gl-search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          background: none;
          border: none;
          color: #013E37;
          opacity: 0.2;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        .gl-search-clear:hover {
          background: rgba(1, 62, 55, 0.04);
          opacity: 0.6;
        }

        .gl-search-clear-icon {
          width: 16px;
          height: 16px;
        }

        .gl-filter-select {
          padding: 9px 16px;
          border: 2px solid rgba(1, 62, 55, 0.04);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          background: #ffffff;
          color: #013E37;
          outline: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          min-width: 130px;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23013E37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
        }

        .gl-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 4px rgba(1, 62, 55, 0.04);
        }

        .gl-filter-select:hover {
          border-color: rgba(1, 62, 55, 0.12);
        }

        .gl-clear-filters {
          padding: 9px 18px;
          background: rgba(239, 68, 68, 0.06);
          color: #DC2626;
          border: 2px solid rgba(239, 68, 68, 0.06);
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gl-clear-filters:hover {
          background: rgba(239, 68, 68, 0.10);
          border-color: rgba(239, 68, 68, 0.12);
          transform: scale(1.02);
        }

        /* ============================================
           LIST ITEMS - Modern Cards
           ============================================ */
        .gl-list {
          max-height: 600px;
          overflow-y: auto;
          padding: 8px 0;
        }

        .gl-list::-webkit-scrollbar {
          width: 6px;
        }

        .gl-list::-webkit-scrollbar-track {
          background: rgba(1, 62, 55, 0.02);
          border-radius: 10px;
        }

        .gl-list::-webkit-scrollbar-thumb {
          background: rgba(1, 62, 55, 0.10);
          border-radius: 10px;
        }

        .gl-item {
          border-bottom: 1px solid rgba(1, 62, 55, 0.03);
          animation: glSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gl-item:hover {
          background: rgba(1, 62, 55, 0.01);
        }

        .gl-item:nth-child(1) { animation-delay: 0.05s; }
        .gl-item:nth-child(2) { animation-delay: 0.1s; }
        .gl-item:nth-child(3) { animation-delay: 0.15s; }
        .gl-item:nth-child(4) { animation-delay: 0.2s; }
        .gl-item:nth-child(5) { animation-delay: 0.25s; }

        @keyframes glSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .gl-item:last-child {
          border-bottom: none;
        }

        .gl-item-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 28px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          gap: 16px;
        }

        .gl-item-content:hover {
          background: rgba(1, 62, 55, 0.01);
        }

        .gl-item-editing {
          background: rgba(1, 62, 55, 0.02) !important;
          border-left: 4px solid #013E37;
        }

        .gl-item-expanded {
          border-bottom: none;
        }

        .gl-item-left {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }

        /* Status Icon with Pulse */
        .gl-status-icon-wrapper {
          position: relative;
          flex-shrink: 0;
          padding-top: 2px;
        }

        .gl-status-pulse {
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
          opacity: 0;
        }

        .gl-status-pulse.on_track {
          border: 2px solid #059669;
          animation-delay: 0s;
        }

        .gl-status-pulse.in_progress {
          border: 2px solid #0A5C54;
          animation-delay: 0.5s;
        }

        .gl-status-pulse.at_risk {
          border: 2px solid #D97706;
          animation-delay: 1s;
        }

        .gl-status-pulse.behind {
          border: 2px solid #EF4444;
          animation-delay: 1.5s;
        }

        .gl-status-pulse.completed {
          border: 2px solid #013E37;
          animation-delay: 0s;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .gl-status-icon {
          width: 22px;
          height: 22px;
        }

        .gl-icon-green { color: #059669; }
        .gl-icon-red { color: #EF4444; }
        .gl-icon-blue { color: #0A5C54; }
        .gl-icon-gray { color: #013E37; opacity: 0.2; }

        .gl-item-info {
          flex: 1;
          min-width: 0;
        }

        /* Header with badges */
        .gl-item-header {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .gl-item-name {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          letter-spacing: -0.2px;
        }

        .gl-item-level {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .gl-level-icon-svg {
          width: 13px;
          height: 13px;
        }

        .gl-item-level:hover {
          transform: scale(1.03);
        }

        .gl-level-company { background: #013E37; color: #FFEFB3; }
        .gl-level-segment { background: #0A5C54; color: #FFEFB3; }
        .gl-level-department { background: #059669; color: #ffffff; }
        .gl-level-team { background: #FEF3C7; color: #92400E; }
        .gl-level-individual { background: #F3F4F6; color: #4B5563; }

        .gl-item-priority {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          transition: all 0.3s ease;
          letter-spacing: 0.2px;
        }

        .gl-priority-icon {
          width: 12px;
          height: 12px;
        }

        .gl-item-priority:hover {
          transform: scale(1.03);
        }

        .gl-priority-critical { background: #FEE2E2; color: #991B1B; }
        .gl-priority-high { background: #FEF3C7; color: #92400E; }
        .gl-priority-medium { background: #013E37; color: #FFEFB3; }
        .gl-priority-low { background: #D1FAE5; color: #065F46; }

        .gl-item-desc {
          font-size: 13px;
          color: #013E37;
          opacity: 0.4;
          margin: 4px 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .gl-item-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 6px;
          font-size: 12px;
          color: #013E37;
          opacity: 0.4;
          flex-wrap: wrap;
        }

        .gl-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .gl-meta-icon {
          width: 14px;
          height: 14px;
          color: #013E37;
          opacity: 0.3;
        }

        .gl-days-left {
          padding: 2px 10px;
          border-radius: 12px;
          background: rgba(1, 62, 55, 0.04);
        }

        .gl-days-urgent {
          background: rgba(239, 68, 68, 0.08);
          color: #DC2626;
        }

        .gl-days-urgent .gl-meta-icon {
          color: #DC2626;
          opacity: 0.6;
        }

        /* ============================================
           PROGRESS CARD - Modern
           ============================================ */
        .gl-progress-card {
          margin-top: 12px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #fafaf8 0%, #f5f5f3 100%);
          border-radius: 14px;
          border: 1px solid rgba(1, 62, 55, 0.05);
          transition: all 0.3s ease;
        }

        .gl-progress-card:hover {
          background: linear-gradient(135deg, #f8f8f6 0%, #f0f0ee 100%);
          border-color: rgba(1, 62, 55, 0.08);
          transform: translateY(-1px);
        }

        .gl-progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .gl-progress-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gl-progress-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.3;
        }

        .gl-progress-label {
          font-size: 12px;
          font-weight: 500;
          color: #013E37;
          opacity: 0.4;
        }

        .gl-progress-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .gl-progress-current {
          font-weight: 700;
          color: #013E37;
        }

        .gl-progress-divider {
          color: #013E37;
          opacity: 0.15;
        }

        .gl-progress-target {
          font-size: 12px;
          color: #013E37;
          opacity: 0.4;
        }

        .gl-progress-track {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gl-progress-bar-container {
          width: 100%;
          height: 10px;
          background: rgba(1, 62, 55, 0.06);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .gl-progress-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .gl-progress-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.25) 50%,
            transparent 100%
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .gl-progress-green { background: linear-gradient(90deg, #059669, #10B981); }
        .gl-progress-blue { background: linear-gradient(90deg, #0A5C54, #0D9488); }
        .gl-progress-yellow { background: linear-gradient(90deg, #D97706, #F59E0B); }
        .gl-progress-red { background: linear-gradient(90deg, #DC2626, #EF4444); }

        .gl-progress-marker-group {
          position: relative;
          height: 20px;
          margin-top: 2px;
        }

        .gl-progress-marker {
          position: absolute;
          top: 0;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .gl-marker-expected {
          opacity: 0.5;
        }

        .gl-marker-line {
          width: 2px;
          height: 14px;
          background: rgba(1, 62, 55, 0.15);
          border-radius: 2px;
        }

        .gl-marker-dot {
          width: 10px;
          height: 10px;
          background: #013E37;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          margin-bottom: 2px;
        }

        .gl-marker-label {
          font-size: 8px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.4;
          white-space: nowrap;
        }

        .gl-progress-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
        }

        .gl-progress-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 12px;
          border-radius: 16px;
        }

        .gl-status-success {
          background: #D1FAE5;
          color: #065F46;
        }

        .gl-status-warning {
          background: #FEF3C7;
          color: #92400E;
        }

        .gl-status-icon-small {
          width: 14px;
          height: 14px;
        }

        .gl-progress-timeline {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #013E37;
          opacity: 0.3;
        }

        .gl-timeline-icon {
          width: 13px;
          height: 13px;
        }

        .gl-timeline-text {
          font-weight: 500;
        }

        /* ============================================
           TOGGLE
           ============================================ */
        .gl-item-toggle {
          padding-top: 4px;
          flex-shrink: 0;
        }

        .gl-node-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
        }

        .gl-toggle-indicator {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          background: rgba(1, 62, 55, 0.02);
        }

        .gl-toggle-indicator:hover {
          background: rgba(1, 62, 55, 0.06);
        }

        .gl-toggle-open {
          transform: rotate(90deg);
        }

        .gl-toggle-icon {
          width: 18px;
          height: 18px;
          color: #013E37;
          opacity: 0.3;
          transition: all 0.3s ease;
        }

        .gl-toggle-indicator:hover .gl-toggle-icon {
          opacity: 0.8;
        }

        /* ============================================
           EDIT FORM
           ============================================ */
        .gl-edit-form {
          width: 100%;
          padding: 8px 0 4px 0;
          animation: glSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gl-edit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(1, 62, 55, 0.06);
        }

        .gl-edit-title {
          font-size: 15px;
          font-weight: 700;
          color: #013E37;
          letter-spacing: -0.2px;
        }

        .gl-edit-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 10px;
        }

        .gl-edit-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .gl-edit-group-full {
          grid-column: 1 / -1;
        }

        .gl-edit-label {
          font-size: 11px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.5;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .gl-edit-input,
        .gl-edit-select,
        .gl-edit-textarea {
          padding: 8px 14px;
          border: 2px solid rgba(1, 62, 55, 0.06);
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          color: #013E37;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          font-family: inherit;
        }

        .gl-edit-input:focus,
        .gl-edit-select:focus,
        .gl-edit-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 4px rgba(1, 62, 55, 0.04);
        }

        .gl-edit-textarea {
          resize: vertical;
          min-height: 50px;
        }

        .gl-edit-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 6px;
          padding-top: 12px;
          border-top: 1px solid rgba(1, 62, 55, 0.06);
        }

        .gl-edit-cancel {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          background: transparent;
          color: #013E37;
          border: 2px solid rgba(1, 62, 55, 0.06);
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gl-edit-cancel:hover:not(:disabled) {
          background: rgba(1, 62, 55, 0.04);
          transform: scale(1.02);
        }

        .gl-edit-save {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 22px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.2);
        }

        .gl-edit-save:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.3);
        }

        .gl-edit-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .gl-save-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 239, 179, 0.3);
          border-top-color: #FFEFB3;
          border-radius: 50%;
          animation: glSpin 0.8s linear infinite;
        }

        @keyframes glSlideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ============================================
           ACTIONS
           ============================================ */
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
          padding: 6px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          color: #013E37;
          opacity: 0.15;
        }

        .gl-action-btn:hover {
          background: rgba(1, 62, 55, 0.04);
          opacity: 0.7;
          transform: scale(1.1);
        }

        .gl-action-view:hover { background: rgba(1, 62, 55, 0.06); color: #013E37; opacity: 1; }
        .gl-action-edit:hover { background: rgba(1, 62, 55, 0.06); color: #0A5C54; opacity: 1; }
        .gl-action-delete:hover { background: rgba(239, 68, 68, 0.06); color: #EF4444; opacity: 1; }
        .gl-action-more:hover { background: rgba(1, 62, 55, 0.04); color: #013E37; opacity: 0.6; }

        .gl-action-icon {
          width: 18px;
          height: 18px;
        }

        /* ============================================
           CHILDREN
           ============================================ */
        .gl-children {
          padding: 0 28px 20px 72px;
          animation: glSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gl-children-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding: 0 4px;
        }

        .gl-children-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.4;
        }

        .gl-children-icon {
          width: 16px;
          height: 16px;
          opacity: 0.5;
        }

        .gl-children-count {
          font-size: 11px;
          color: #013E37;
          opacity: 0.25;
          font-weight: 500;
        }

        .gl-child {
          padding: 10px 16px;
          margin-bottom: 8px;
          background: rgba(1, 62, 55, 0.02);
          border-radius: 12px;
          border: 1px solid rgba(1, 62, 55, 0.04);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: glSlideUp 0.3s ease both;
        }

        .gl-child:nth-child(1) { animation-delay: 0.05s; }
        .gl-child:nth-child(2) { animation-delay: 0.1s; }
        .gl-child:nth-child(3) { animation-delay: 0.15s; }

        .gl-child:hover {
          background: rgba(1, 62, 55, 0.03);
          border-color: rgba(1, 62, 55, 0.08);
          transform: translateX(4px);
        }

        .gl-child-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .gl-child-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .gl-child-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .gl-child-status-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid #ffffff;
        }

        .gl-child-status-dot.on_track { background: #059669; }
        .gl-child-status-dot.in_progress { background: #0A5C54; }
        .gl-child-status-dot.at_risk { background: #D97706; }
        .gl-child-status-dot.behind { background: #EF4444; }
        .gl-child-status-dot.completed { background: #013E37; }
        .gl-child-status-dot.not_started { background: #6B7280; }

        .gl-child-name {
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
        }

        .gl-child-status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: 16px;
          transition: all 0.3s ease;
          letter-spacing: 0.2px;
        }

        .gl-child-status:hover {
          transform: scale(1.03);
        }

        .gl-child-right {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
        }

        .gl-child-progress-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gl-child-progress-bar {
          width: 60px;
          height: 4px;
          background: rgba(1, 62, 55, 0.06);
          border-radius: 4px;
          overflow: hidden;
        }

        .gl-child-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .gl-child-progress {
          font-weight: 700;
          color: #013E37;
          font-size: 12px;
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
          padding: 80px 20px;
          text-align: center;
        }

        .gl-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #FFEFB3 0%, #FFF9E6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          animation: float 3s ease-in-out infinite;
          box-shadow: 0 8px 32px rgba(255, 239, 179, 0.25);
        }

        .gl-empty-icon {
          width: 36px;
          height: 36px;
          color: #013E37;
        }

        .gl-empty-title {
          font-size: 18px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }

        .gl-empty-subtitle {
          font-size: 14px;
          color: #013E37;
          opacity: 0.3;
          margin: 6px 0 20px 0;
        }

        .gl-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 28px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 24px rgba(1, 62, 55, 0.25);
        }

        .gl-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 36px rgba(1, 62, 55, 0.35);
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .gl-header {
            flex-direction: column;
            align-items: stretch;
            padding: 16px 20px;
          }

          .gl-header-left {
            flex-wrap: wrap;
          }

          .gl-header-right {
            justify-content: flex-end;
          }

          .gl-filters {
            flex-direction: column;
            padding: 12px 20px;
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
            padding: 14px 20px;
          }

          .gl-item-left {
            flex-wrap: wrap;
          }

          .gl-item-actions {
            align-self: flex-end;
          }

          .gl-progress-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .gl-progress-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .gl-progress-marker-group {
            height: 16px;
          }

          .gl-edit-row {
            grid-template-columns: 1fr;
          }

          .gl-children {
            padding: 0 16px 16px 48px;
          }

          .gl-child-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .gl-child-right {
            width: 100%;
            justify-content: flex-start;
          }

          .gl-title-wrapper {
            gap: 10px;
          }

          .gl-title-icon {
            width: 40px;
            height: 40px;
          }

          .gl-title-svg {
            width: 20px;
            height: 20px;
          }

          .gl-title {
            font-size: 18px;
          }

          .gl-item-header {
            flex-wrap: wrap;
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
            margin-top: 6px;
          }

          .gl-edit-actions {
            flex-direction: column;
          }

          .gl-edit-cancel,
          .gl-edit-save {
            width: 100%;
            justify-content: center;
          }

          .gl-progress-stats {
            flex-wrap: wrap;
          }

          .gl-child {
            padding: 8px 12px;
          }

          .gl-child-left {
            flex-wrap: wrap;
          }

          .gl-child-right {
            flex-wrap: wrap;
          }

          .gl-empty-icon-wrapper {
            width: 64px;
            height: 64px;
          }

          .gl-empty-icon {
            width: 28px;
            height: 28px;
          }

          .gl-empty-title {
            font-size: 16px;
          }

          .gl-progress-card {
            padding: 12px 14px;
          }
        }
      `}</style>
    </>
  );
};

export default GoalList;