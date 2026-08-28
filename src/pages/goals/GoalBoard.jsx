import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Target, Plus, Search, Filter, RefreshCw,
  TrendingUp, TrendingDown, Clock, Calendar,
  Users, AlertCircle, CheckCircle, Activity,
  ArrowRight, MoreVertical, Edit, Trash2, Eye,
  BarChart3, Zap, Award, Star, X
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';

const GoalBoard = () => {
  const { token } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'company',
    priority: 'medium',
    startDate: '',
    endDate: '',
    targetValue: '',
    progress: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [columns, setColumns] = useState({
    'not_started': { id: 'not_started', title: 'Not Started', icon: '⏳', items: [] },
    'in_progress': { id: 'in_progress', title: 'In Progress', icon: '🔄', items: [] },
    'on_track': { id: 'on_track', title: 'On Track', icon: '📈', items: [] },
    'at_risk': { id: 'at_risk', title: 'At Risk', icon: '⚠️', items: [] },
    'behind': { id: 'behind', title: 'Behind', icon: '🔴', items: [] },
    'completed': { id: 'completed', title: 'Completed', icon: '✅', items: [] }
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchGoals();
  }, [search, filterLevel]);

  const fetchGoals = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterLevel !== 'all') params.append('level', filterLevel);
      
      // Try to fetch from API
      let fetchedGoals = [];
      try {
        const response = await fetch(`${API_URL}/goals/board?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          fetchedGoals = data.data || [];
        } else {
          // If API fails, use mock data
          fetchedGoals = getMockGoals();
        }
      } catch (err) {
        // Use mock data if API is not available
        fetchedGoals = getMockGoals();
      }
      
      setGoals(fetchedGoals);
      
      // Group goals by status
      const newColumns = { ...columns };
      Object.keys(newColumns).forEach(key => {
        newColumns[key].items = fetchedGoals.filter(g => g.status === key);
      });
      setColumns(newColumns);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockGoals = () => {
    return [
      { _id: '1', name: 'Increase Revenue by 20%', description: 'Grow revenue through new clients', level: 'company', priority: 'high', status: 'in_progress', progress: 65, ownerId: { firstName: 'John' }, endDate: '2026-12-31' },
      { _id: '2', name: 'Launch New Product', description: 'Launch the new SaaS product', level: 'segment', priority: 'critical', status: 'on_track', progress: 80, ownerId: { firstName: 'Sarah' }, endDate: '2026-10-15' },
      { _id: '3', name: 'Improve Customer Satisfaction', description: 'Increase CSAT score to 95%', level: 'department', priority: 'high', status: 'in_progress', progress: 45, ownerId: { firstName: 'Mike' }, endDate: '2026-11-30' },
      { _id: '4', name: 'Reduce Churn Rate', description: 'Reduce customer churn to 5%', level: 'team', priority: 'medium', status: 'at_risk', progress: 30, ownerId: { firstName: 'Emma' }, endDate: '2026-09-30' },
      { _id: '5', name: 'Achieve 10k Users', description: 'Reach 10,000 active users', level: 'company', priority: 'high', status: 'not_started', progress: 0, ownerId: { firstName: 'Alex' }, endDate: '2027-01-15' },
      { _id: '6', name: 'Complete Documentation', description: 'Complete all product documentation', level: 'department', priority: 'low', status: 'completed', progress: 100, ownerId: { firstName: 'Lisa' }, endDate: '2026-08-01' },
    ];
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Same column - reorder
      const column = columns[source.droppableId];
      const newItems = Array.from(column.items);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: newItems }
      });
    } else {
      // Different column - update status
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = Array.from(sourceColumn.items);
      const destItems = Array.from(destColumn.items);
      const [removed] = sourceItems.splice(source.index, 1);
      
      const updatedGoal = { ...removed, status: destination.droppableId };
      destItems.splice(destination.index, 0, updatedGoal);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems }
      });
      
      // Update on server
      try {
        await fetch(`${API_URL}/goals/${updatedGoal._id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: destination.droppableId })
        });
        toast.success(`Goal moved to ${columns[destination.droppableId].title}`);
      } catch (error) {
        console.error('Error updating goal status:', error);
        toast.error('Failed to update goal status');
        fetchGoals(true);
      }
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a goal name');
      return;
    }

    setSubmitting(true);
    try {
      const newGoal = {
        ...formData,
        status: 'not_started',
        progress: 0,
        ownerId: { firstName: 'You' }
      };
      
      // Try to save to API
      try {
        const response = await fetch(`${API_URL}/goals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          const data = await response.json();
          toast.success('Goal created successfully!');
          setShowCreateModal(false);
          setFormData({
            name: '',
            description: '',
            level: 'company',
            priority: 'medium',
            startDate: '',
            endDate: '',
            targetValue: '',
            progress: 0
          });
          await fetchGoals(true);
          return;
        }
      } catch (err) {
        // If API fails, add locally
        console.warn('API not available, adding goal locally');
      }
      
      // Add locally
      const newGoalWithId = {
        ...newGoal,
        _id: `temp_${Date.now()}`,
        endDate: formData.endDate || '2026-12-31'
      };
      setGoals([...goals, newGoalWithId]);
      const newColumns = { ...columns };
      newColumns['not_started'].items = [...newColumns['not_started'].items, newGoalWithId];
      setColumns(newColumns);
      toast.success('Goal created locally!');
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        level: 'company',
        priority: 'medium',
        startDate: '',
        endDate: '',
        targetValue: '',
        progress: 0
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await fetch(`${API_URL}/goals/${goalId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Goal deleted successfully');
      await fetchGoals(true);
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'not_started': 'gb-not-started',
      'in_progress': 'gb-in-progress',
      'on_track': 'gb-on-track',
      'at_risk': 'gb-at-risk',
      'behind': 'gb-behind',
      'completed': 'gb-completed'
    };
    return colors[status] || 'gb-default';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="gb-status-icon gb-icon-green" />;
    if (status === 'at_risk' || status === 'behind') return <AlertCircle className="gb-status-icon gb-icon-red" />;
    if (status === 'on_track') return <TrendingUp className="gb-status-icon gb-icon-green" />;
    if (status === 'in_progress') return <Activity className="gb-status-icon gb-icon-blue" />;
    return <Clock className="gb-status-icon gb-icon-gray" />;
  };

  const getStatusCount = (status) => {
    return columns[status]?.items.length || 0;
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

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'gb-progress-green';
    if (progress >= 60) return 'gb-progress-blue';
    if (progress >= 40) return 'gb-progress-yellow';
    return 'gb-progress-red';
  };

  const levelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'company', label: 'Company' },
    { value: 'segment', label: 'Segment' },
    { value: 'department', label: 'Department' },
    { value: 'team', label: 'Team' },
    { value: 'individual', label: 'Individual' }
  ];

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const progress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  if (loading) {
    return (
      <div className="gb-loading">
        <div className="gb-spinner"></div>
        <p className="gb-loading-text">Loading goals...</p>
      </div>
    );
  }

  return (
    <>
      <div className="gb-container">
        {/* Header */}
        <div className="gb-header">
          <div className="gb-header-left">
            <div className="gb-title-wrapper">
              <div className="gb-title-icon">
                <Target className="gb-title-svg" />
              </div>
              <div>
                <h1 className="gb-title">Goal Board</h1>
                <p className="gb-subtitle">Visualize and manage goals across statuses</p>
              </div>
            </div>
          </div>
          <div className="gb-header-right">
            <div className="gb-search-wrapper">
              <Search className="gb-search-icon" />
              <input
                type="text"
                placeholder="Search goals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="gb-search-input"
              />
              {search && (
                <button className="gb-search-clear" onClick={() => setSearch('')}>
                  <X className="gb-search-clear-icon" />
                </button>
              )}
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="gb-filter-select"
            >
              {levelOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button className="gb-refresh-btn" onClick={() => fetchGoals(true)} disabled={refreshing}>
              <RefreshCw className={`gb-refresh-icon ${refreshing ? 'gb-spin' : ''}`} />
            </button>
            <button className="gb-create-btn" onClick={() => setShowCreateModal(true)}>
              <Plus className="gb-btn-icon" />
              New Goal
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="gb-stats">
          <div className="gb-stat-card gb-stat-total">
            <div className="gb-stat-icon-wrapper"><Target className="gb-stat-icon" /></div>
            <div><p className="gb-stat-number">{totalGoals}</p><p className="gb-stat-label">Total Goals</p></div>
          </div>
          <div className="gb-stat-card gb-stat-progress">
            <div className="gb-stat-icon-wrapper"><TrendingUp className="gb-stat-icon" /></div>
            <div><p className="gb-stat-number">{progress}%</p><p className="gb-stat-label">Progress</p></div>
          </div>
          <div className="gb-stat-card gb-stat-completed">
            <div className="gb-stat-icon-wrapper"><CheckCircle className="gb-stat-icon" /></div>
            <div><p className="gb-stat-number">{completedGoals}</p><p className="gb-stat-label">Completed</p></div>
          </div>
          <div className="gb-stat-card gb-stat-risk">
            <div className="gb-stat-icon-wrapper"><AlertCircle className="gb-stat-icon" /></div>
            <div><p className="gb-stat-number">{goals.filter(g => g.status === 'at_risk' || g.status === 'behind').length}</p><p className="gb-stat-label">At Risk</p></div>
          </div>
        </div>

        {/* Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="gb-board">
            {Object.entries(columns).map(([columnId, column]) => (
              <div key={columnId} className="gb-column">
                <div className="gb-column-header">
                  <div className="gb-column-header-left">
                    <span className="gb-column-icon">{column.icon}</span>
                    <h4 className="gb-column-title">{column.title}</h4>
                  </div>
                  <span className="gb-column-count">{getStatusCount(columnId)}</span>
                </div>
                
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`gb-droppable ${snapshot.isDraggingOver ? 'gb-droppable-drag' : ''}`}
                    >
                      {column.items.map((goal, index) => (
                        <Draggable
                          key={goal._id}
                          draggableId={goal._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`gb-card ${getStatusColor(goal.status)} ${snapshot.isDragging ? 'gb-card-dragging' : ''}`}
                            >
                              <div className="gb-card-header">
                                <div className="gb-card-info">
                                  <p className="gb-card-title">{goal.name}</p>
                                  <div className="gb-card-meta">
                                    <span className="gb-card-level">{getLevelLabel(goal.level)}</span>
                                    <span className="gb-card-dot">•</span>
                                    <span className="gb-card-owner">{goal.ownerId?.firstName || 'Unassigned'}</span>
                                  </div>
                                </div>
                                <div className="gb-card-actions">
                                  <button className="gb-card-action gb-card-action-delete" onClick={() => handleDeleteGoal(goal._id)}>
                                    <Trash2 className="gb-card-action-icon" />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Progress */}
                              <div className="gb-card-progress">
                                <div className="gb-card-progress-header">
                                  <span className="gb-card-progress-label">Progress</span>
                                  <span className="gb-card-progress-value">{goal.progress}%</span>
                                </div>
                                <div className="gb-card-progress-bar">
                                  <div 
                                    className={`gb-card-progress-fill ${getProgressColor(goal.progress)}`}
                                    style={{ width: `${goal.progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* Due Date */}
                              {goal.endDate && (
                                <div className="gb-card-footer">
                                  <Calendar className="gb-card-footer-icon" />
                                  <span className="gb-card-footer-text">
                                    Due: {new Date(goal.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {column.items.length === 0 && (
                        <div className="gb-empty">
                          <Target className="gb-empty-icon" />
                          <p className="gb-empty-text">No goals</p>
                          <p className="gb-empty-subtext">Drag goals here or create new</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="gb-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="gb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-header">
              <div className="gb-modal-title-wrapper">
                <Target className="gb-modal-icon" />
                <h2 className="gb-modal-title">Create New Goal</h2>
              </div>
              <button className="gb-modal-close" onClick={() => setShowCreateModal(false)}>
                <X className="gb-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleCreateGoal} className="gb-modal-form">
              <div className="gb-form-group">
                <label className="gb-form-label">Goal Name <span className="gb-form-required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="gb-form-input"
                  placeholder="Enter goal name"
                  autoFocus
                />
              </div>

              <div className="gb-form-group">
                <label className="gb-form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="gb-form-textarea"
                  rows="2"
                  placeholder="Enter goal description"
                />
              </div>

              <div className="gb-form-row">
                <div className="gb-form-group">
                  <label className="gb-form-label">Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="gb-form-select"
                  >
                    <option value="company">🏢 Company</option>
                    <option value="segment">📊 Segment</option>
                    <option value="department">🏛️ Department</option>
                    <option value="team">👥 Team</option>
                    <option value="individual">👤 Individual</option>
                  </select>
                </div>
                <div className="gb-form-group">
                  <label className="gb-form-label">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="gb-form-select"
                  >
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🔵 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div className="gb-form-row">
                <div className="gb-form-group">
                  <label className="gb-form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="gb-form-input"
                  />
                </div>
                <div className="gb-form-group">
                  <label className="gb-form-label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="gb-form-input"
                  />
                </div>
              </div>

              <div className="gb-form-group">
                <label className="gb-form-label">Target Value</label>
                <input
                  type="number"
                  name="targetValue"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  className="gb-form-input"
                  placeholder="Enter target value"
                />
              </div>

              <div className="gb-form-actions">
                <button type="button" className="gb-form-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="gb-form-submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="gb-form-spinner"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="gb-btn-icon" />
                      Create Goal
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .gb-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: gbFadeIn 0.4s ease;
        }

        @keyframes gbFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .gb-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .gb-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: gbSpin 0.8s linear infinite;
        }

        .gb-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes gbSpin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           HEADER
           ============================================ */
        .gb-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .gb-header-left {
          display: flex;
          align-items: center;
        }

        .gb-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .gb-title-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
          animation: gbPulse 2s ease-in-out infinite;
        }

        @keyframes gbPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .gb-title-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .gb-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .gb-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .gb-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .gb-search-wrapper {
          position: relative;
          min-width: 200px;
        }

        .gb-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .gb-search-input {
          width: 100%;
          padding: 8px 36px 8px 36px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
        }

        .gb-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .gb-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }

        .gb-search-clear:hover {
          background: #f1f5f9;
        }

        .gb-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .gb-filter-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gb-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .gb-refresh-btn {
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

        .gb-refresh-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .gb-refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .gb-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .gb-spin {
          animation: gbSpin 1s linear infinite;
        }

        .gb-create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }

        .gb-create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .gb-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           STATS
           ============================================ */
        .gb-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .gb-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #ffffff;
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          animation: gbSlideUp 0.5s ease both;
        }

        .gb-stat-card:nth-child(1) { animation-delay: 0.1s; }
        .gb-stat-card:nth-child(2) { animation-delay: 0.2s; }
        .gb-stat-card:nth-child(3) { animation-delay: 0.3s; }
        .gb-stat-card:nth-child(4) { animation-delay: 0.4s; }

        @keyframes gbSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gb-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .gb-stat-total { border-left: 4px solid #3b82f6; }
        .gb-stat-progress { border-left: 4px solid #8b5cf6; }
        .gb-stat-completed { border-left: 4px solid #22c55e; }
        .gb-stat-risk { border-left: 4px solid #ef4444; }

        .gb-stat-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gb-stat-total .gb-stat-icon-wrapper { background: #eff6ff; }
        .gb-stat-progress .gb-stat-icon-wrapper { background: #f5f3ff; }
        .gb-stat-completed .gb-stat-icon-wrapper { background: #ecfdf5; }
        .gb-stat-risk .gb-stat-icon-wrapper { background: #fef2f2; }

        .gb-stat-icon {
          width: 20px;
          height: 20px;
        }

        .gb-stat-total .gb-stat-icon { color: #3b82f6; }
        .gb-stat-progress .gb-stat-icon { color: #8b5cf6; }
        .gb-stat-completed .gb-stat-icon { color: #22c55e; }
        .gb-stat-risk .gb-stat-icon { color: #ef4444; }

        .gb-stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
        }

        .gb-stat-label {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        /* ============================================
           BOARD
           ============================================ */
        .gb-board {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 16px;
        }

        .gb-column {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          min-width: 200px;
          transition: all 0.3s ease;
        }

        .gb-column:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .gb-column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .gb-column-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gb-column-icon {
          font-size: 16px;
        }

        .gb-column-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .gb-column-count {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .gb-droppable {
          min-height: 200px;
          padding: 8px;
          transition: all 0.2s ease;
        }

        .gb-droppable-drag {
          background: #eff6ff;
        }

        /* ============================================
           CARD
           ============================================ */
        .gb-card {
          background: #ffffff;
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 8px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
          cursor: grab;
        }

        .gb-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .gb-card-dragging {
          transform: rotate(2deg) scale(1.02);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          border-color: #3b82f6;
        }

        .gb-not-started { border-left: 4px solid #94a3b8; }
        .gb-in-progress { border-left: 4px solid #3b82f6; }
        .gb-on-track { border-left: 4px solid #22c55e; }
        .gb-at-risk { border-left: 4px solid #f59e0b; }
        .gb-behind { border-left: 4px solid #ef4444; }
        .gb-completed { border-left: 4px solid #10b981; }

        .gb-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }

        .gb-card-info {
          flex: 1;
          min-width: 0;
        }

        .gb-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          line-height: 1.3;
        }

        .gb-card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          font-size: 12px;
          color: #64748b;
          flex-wrap: wrap;
        }

        .gb-card-level {
          font-size: 11px;
        }

        .gb-card-dot {
          color: #94a3b8;
        }

        .gb-card-owner {
          font-size: 11px;
        }

        .gb-card-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }

        .gb-card-action {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          color: #94a3b8;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }

        .gb-card-action:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .gb-card-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .gb-card-action-icon {
          width: 14px;
          height: 14px;
        }

        .gb-card-progress {
          margin-top: 10px;
        }

        .gb-card-progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #64748b;
        }

        .gb-card-progress-label {
          font-weight: 500;
        }

        .gb-card-progress-value {
          font-weight: 600;
        }

        .gb-card-progress-bar {
          width: 100%;
          height: 4px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 4px;
        }

        .gb-card-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .gb-progress-green { background: #22c55e; }
        .gb-progress-blue { background: #3b82f6; }
        .gb-progress-yellow { background: #f59e0b; }
        .gb-progress-red { background: #ef4444; }

        .gb-card-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #f1f5f9;
          font-size: 11px;
          color: #94a3b8;
        }

        .gb-card-footer-icon {
          width: 14px;
          height: 14px;
        }

        .gb-card-footer-text {
          font-size: 11px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .gb-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 16px;
          color: #94a3b8;
        }

        .gb-empty-icon {
          width: 32px;
          height: 32px;
          opacity: 0.3;
          margin-bottom: 8px;
        }

        .gb-empty-text {
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        .gb-empty-subtext {
          font-size: 12px;
          color: #cbd5e1;
          margin: 2px 0 0 0;
        }

        /* ============================================
           STATUS ICONS
           ============================================ */
        .gb-status-icon {
          width: 16px;
          height: 16px;
        }

        .gb-icon-green { color: #22c55e; }
        .gb-icon-red { color: #ef4444; }
        .gb-icon-blue { color: #3b82f6; }
        .gb-icon-gray { color: #94a3b8; }

        /* ============================================
           MODAL
           ============================================ */
        .gb-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: gbFadeIn 0.3s ease;
        }

        .gb-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 540px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: gbModalIn 0.3s ease;
        }

        @keyframes gbModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .gb-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .gb-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .gb-modal-icon {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }

        .gb-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .gb-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: none;
          background: #f1f5f9;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gb-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .gb-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        .gb-modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ============================================
           FORM
           ============================================ */
        .gb-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .gb-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .gb-form-required {
          color: #ef4444;
        }

        .gb-form-input,
        .gb-form-textarea,
        .gb-form-select {
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          color: #0f172a;
        }

        .gb-form-input:focus,
        .gb-form-textarea:focus,
        .gb-form-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .gb-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .gb-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .gb-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
          margin-top: 4px;
        }

        .gb-form-cancel {
          padding: 10px 24px;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gb-form-cancel:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .gb-form-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .gb-form-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        .gb-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .gb-form-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: gbSpin 0.8s linear infinite;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1400px) {
          .gb-board {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .gb-board {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .gb-container {
            padding: 16px;
          }

          .gb-header {
            flex-direction: column;
            align-items: stretch;
          }

          .gb-header-right {
            width: 100%;
            flex-wrap: wrap;
          }

          .gb-search-wrapper {
            flex: 1;
            min-width: 150px;
          }

          .gb-create-btn {
            flex: 1;
            justify-content: center;
          }

          .gb-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .gb-board {
            grid-template-columns: 1fr;
          }

          .gb-column {
            min-width: unset;
          }

          .gb-form-row {
            grid-template-columns: 1fr;
          }

          .gb-modal {
            margin: 16px;
            max-height: 95vh;
          }

          .gb-title {
            font-size: 22px;
          }

          .gb-title-icon {
            width: 40px;
            height: 40px;
          }

          .gb-stat-card {
            padding: 14px 16px;
          }

          .gb-stat-number {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .gb-container {
            padding: 12px;
          }

          .gb-stats {
            grid-template-columns: 1fr;
          }

          .gb-header-right {
            flex-direction: column;
          }

          .gb-search-wrapper {
            width: 100%;
          }

          .gb-filter-select {
            width: 100%;
          }

          .gb-create-btn {
            width: 100%;
          }

          .gb-title-wrapper {
            gap: 10px;
          }

          .gb-title {
            font-size: 20px;
          }

          .gb-subtitle {
            font-size: 13px;
          }

          .gb-modal {
            padding: 0;
          }

          .gb-modal-header {
            padding: 16px 18px;
          }

          .gb-modal-form {
            padding: 18px;
          }

          .gb-form-actions {
            flex-direction: column;
          }

          .gb-form-cancel,
          .gb-form-submit {
            width: 100%;
            justify-content: center;
          }
        }

        /* Scrollbar */
        .gb-modal::-webkit-scrollbar {
          width: 6px;
        }

        .gb-modal::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }

        .gb-modal::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }

        .gb-modal::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .gb-board::-webkit-scrollbar {
          height: 6px;
        }

        .gb-board::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }

        .gb-board::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }
      `}</style>
    </>
  );
};

export default GoalBoard;