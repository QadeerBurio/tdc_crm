// pages/goals/GoalBoard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Target, Plus, Search, RefreshCw,
  TrendingUp, Clock, Calendar,
  AlertCircle, CheckCircle, Activity,
  Trash2, X, Award, Zap, BarChart3, Users,
  Layers
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';

// Color Palette
const PRIMARY_COLOR = '#013E37';
const ACCENT_COLOR = '#FFEFB3';
const WHITE = '#FFFFFF';
const TEXT_DARK = '#013E37';
const TEXT_LIGHT = '#5A7A7A';
const SUCCESS_COLOR = '#2D6A5F';
const WARNING_COLOR = '#FFD966';
const DANGER_COLOR = '#C0392B';
const BG_LIGHT = '#FFFDF5';
const CARD_SHADOW = '0 4px 20px rgba(1, 62, 55, 0.08)';
const CARD_SHADOW_HOVER = '0 8px 32px rgba(1, 62, 55, 0.15)';

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
    'not_started': { id: 'not_started', title: 'Not Started', icon: '⏳', color: '#94A3B8', items: [] },
    'in_progress': { id: 'in_progress', title: 'In Progress', icon: '🔄', color: PRIMARY_COLOR, items: [] },
    'on_track': { id: 'on_track', title: 'On Track', icon: '📈', color: SUCCESS_COLOR, items: [] },
    'at_risk': { id: 'at_risk', title: 'At Risk', icon: '⚠️', color: WARNING_COLOR, items: [] },
    'behind': { id: 'behind', title: 'Behind', icon: '🔴', color: DANGER_COLOR, items: [] },
    'completed': { id: 'completed', title: 'Completed', icon: '✅', color: SUCCESS_COLOR, items: [] }
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
      
      let fetchedGoals = [];
      try {
        const response = await fetch(`${API_URL}/goals/board?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          fetchedGoals = data.data || [];
        } else {
          fetchedGoals = getMockGoals();
        }
      } catch (err) {
        fetchedGoals = getMockGoals();
      }
      
      setGoals(fetchedGoals);
      
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
    
    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) {
      const column = columns[source.droppableId];
      const newItems = Array.from(column.items);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: newItems }
      });
    } else {
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
        console.warn('API not available, adding goal locally');
      }
      
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
  const atRiskGoals = goals.filter(g => g.status === 'at_risk' || g.status === 'behind').length;

  const stats = [
    { label: 'Total Goals', value: totalGoals, icon: Target, color: PRIMARY_COLOR },
    { label: 'Progress', value: `${progress}%`, icon: TrendingUp, color: SUCCESS_COLOR },
    { label: 'Completed', value: completedGoals, icon: CheckCircle, color: SUCCESS_COLOR },
    { label: 'At Risk', value: atRiskGoals, icon: AlertCircle, color: DANGER_COLOR },
  ];

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
                <Layers className="gb-title-svg" />
              </div>
              <div>
                <h1 className="gb-title">Goal Board</h1>
                <p className="gb-subtitle">Track and manage your goals across teams</p>
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

        {/* Stats Cards */}
        <div className="gb-stats">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="gb-stat-card" style={{ borderLeftColor: stat.color }}>
                <div className="gb-stat-icon-wrapper" style={{ background: `${stat.color}15` }}>
                  <Icon className="gb-stat-icon" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="gb-stat-number">{stat.value}</p>
                  <p className="gb-stat-label">{stat.label}</p>
                </div>
                <div className="gb-stat-trend">
                  <span className="gb-stat-trend-up">↑</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="gb-board">
            {Object.entries(columns).map(([columnId, column]) => (
              <div key={columnId} className="gb-column">
                <div className="gb-column-header">
                  <div className="gb-column-header-left">
                    <span className="gb-column-icon" style={{ color: column.color }}>{column.icon}</span>
                    <h4 className="gb-column-title">{column.title}</h4>
                  </div>
                  <span className="gb-column-count" style={{ background: column.color, color: WHITE }}>
                    {getStatusCount(columnId)}
                  </span>
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
                              className={`gb-card ${snapshot.isDragging ? 'gb-card-dragging' : ''}`}
                              style={{ borderLeftColor: column.color }}
                            >
                              <div className="gb-card-header">
                                <div className="gb-card-info">
                                  <p className="gb-card-title">{goal.name}</p>
                                  <div className="gb-card-meta">
                                    <span className="gb-card-level">{getLevelLabel(goal.level)}</span>
                                    <span className="gb-card-dot">•</span>
                                    <span className="gb-card-owner">
                                      <Users size={12} className="gb-card-owner-icon" />
                                      {goal.ownerId?.firstName || 'Unassigned'}
                                    </span>
                                  </div>
                                </div>
                                <button 
                                  className="gb-card-delete" 
                                  onClick={() => handleDeleteGoal(goal._id)}
                                >
                                  <Trash2 className="gb-card-delete-icon" />
                                </button>
                              </div>
                              
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

                              {goal.endDate && (
                                <div className="gb-card-footer">
                                  <Calendar className="gb-card-footer-icon" />
                                  <span className="gb-card-footer-text">
                                    Due: {new Date(goal.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                          <p className="gb-empty-text">No goals yet</p>
                          <p className="gb-empty-subtext">Drag a goal here or create one</p>
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
                <div className="gb-modal-icon-wrapper">
                  <Target className="gb-modal-icon" />
                </div>
                <h2 className="gb-modal-title">Create New Goal</h2>
              </div>
              <button className="gb-modal-close" onClick={() => setShowCreateModal(false)}>
                <X className="gb-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleCreateGoal} className="gb-modal-form">
              <div className="gb-form-group">
                <label className="gb-form-label">
                  Goal Name <span className="gb-form-required">*</span>
                </label>
                <input
                  type="text"
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
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="gb-form-input"
                  />
                </div>
                <div className="gb-form-group">
                  <label className="gb-form-label">End Date</label>
                  <input
                    type="date"
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

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .gb-container {
          padding: 28px 32px;
          max-width: 1440px;
          margin: 0 auto;
          background: ${BG_LIGHT};
          min-height: 100vh;
          animation: gbFadeIn 0.5s ease;
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
          gap: 20px;
        }

        .gb-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid ${ACCENT_COLOR};
          border-top-color: ${PRIMARY_COLOR};
          border-radius: 50%;
          animation: gbSpin 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
        }

        .gb-loading-text {
          color: ${TEXT_LIGHT};
          font-size: 16px;
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
          margin-bottom: 28px;
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
          gap: 16px;
        }

        .gb-title-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, ${PRIMARY_COLOR}, ${SUCCESS_COLOR});
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        .gb-title-svg {
          width: 26px;
          height: 26px;
          color: ${WHITE};
        }

        .gb-title {
          font-size: 30px;
          font-weight: 800;
          color: ${PRIMARY_COLOR};
          margin: 0;
          letter-spacing: -0.5px;
        }

        .gb-subtitle {
          font-size: 15px;
          color: ${TEXT_LIGHT};
          margin: 2px 0 0 0;
        }

        .gb-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .gb-search-wrapper {
          position: relative;
          min-width: 220px;
        }

        .gb-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: ${TEXT_LIGHT};
        }

        .gb-search-input {
          width: 100%;
          padding: 10px 40px 10px 42px;
          border: 2px solid ${ACCENT_COLOR};
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          background: ${WHITE};
          color: ${TEXT_DARK};
          transition: all 0.3s ease;
        }

        .gb-search-input:focus {
          border-color: ${PRIMARY_COLOR};
          box-shadow: 0 0 0 4px rgba(1, 62, 55, 0.08);
        }

        .gb-search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          background: none;
          border: none;
          color: ${TEXT_LIGHT};
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .gb-search-clear:hover {
          background: ${ACCENT_COLOR};
        }

        .gb-search-clear-icon {
          width: 16px;
          height: 16px;
        }

        .gb-filter-select {
          padding: 10px 16px;
          border: 2px solid ${ACCENT_COLOR};
          border-radius: 12px;
          font-size: 14px;
          background: ${WHITE};
          color: ${TEXT_DARK};
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .gb-filter-select:focus {
          border-color: ${PRIMARY_COLOR};
          box-shadow: 0 0 0 4px rgba(1, 62, 55, 0.08);
        }

        .gb-refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
          border: 2px solid ${ACCENT_COLOR};
          border-radius: 12px;
          background: ${WHITE};
          cursor: pointer;
          transition: all 0.3s ease;
          color: ${TEXT_LIGHT};
        }

        .gb-refresh-btn:hover:not(:disabled) {
          background: ${ACCENT_COLOR};
          border-color: ${PRIMARY_COLOR};
          transform: rotate(45deg);
        }

        .gb-refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .gb-refresh-icon {
          width: 18px;
          height: 18px;
        }

        .gb-spin {
          animation: gbSpin 1s linear infinite;
        }

        .gb-create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, ${PRIMARY_COLOR}, ${SUCCESS_COLOR});
          color: ${WHITE};
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        .gb-create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(1, 62, 55, 0.4);
        }

        .gb-btn-icon {
          width: 18px;
          height: 18px;
        }

        /* ============================================
           STATS
           ============================================ */
        .gb-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .gb-stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: ${WHITE};
          border-radius: 16px;
          padding: 20px 24px;
          border: 2px solid ${ACCENT_COLOR};
          border-left-width: 6px;
          transition: all 0.3s ease;
          animation: gbSlideUp 0.5s ease both;
          position: relative;
          overflow: hidden;
        }

        .gb-stat-card::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, ${ACCENT_COLOR} 0%, transparent 70%);
          opacity: 0.3;
          border-radius: 50%;
          transform: translate(30%, -30%);
        }

        .gb-stat-card:nth-child(1) { animation-delay: 0.05s; }
        .gb-stat-card:nth-child(2) { animation-delay: 0.1s; }
        .gb-stat-card:nth-child(3) { animation-delay: 0.15s; }
        .gb-stat-card:nth-child(4) { animation-delay: 0.2s; }

        @keyframes gbSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gb-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: ${CARD_SHADOW_HOVER};
          border-color: ${PRIMARY_COLOR};
        }

        .gb-stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gb-stat-icon {
          width: 22px;
          height: 22px;
        }

        .gb-stat-number {
          font-size: 26px;
          font-weight: 800;
          color: ${PRIMARY_COLOR};
          margin: 0;
          line-height: 1.2;
        }

        .gb-stat-label {
          font-size: 13px;
          color: ${TEXT_LIGHT};
          margin: 0;
          font-weight: 500;
        }

        .gb-stat-trend {
          margin-left: auto;
        }

        .gb-stat-trend-up {
          font-size: 18px;
          color: ${SUCCESS_COLOR};
        }

        /* ============================================
           BOARD
           ============================================ */
        .gb-board {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .gb-column {
          background: ${WHITE};
          border-radius: 16px;
          border: 2px solid ${ACCENT_COLOR};
          overflow: hidden;
          min-width: 220px;
          transition: all 0.3s ease;
        }

        .gb-column:hover {
          box-shadow: ${CARD_SHADOW};
          border-color: ${PRIMARY_COLOR};
        }

        .gb-column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: ${BG_LIGHT};
          border-bottom: 2px solid ${ACCENT_COLOR};
        }

        .gb-column-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .gb-column-icon {
          font-size: 18px;
        }

        .gb-column-title {
          font-size: 14px;
          font-weight: 600;
          color: ${PRIMARY_COLOR};
          margin: 0;
        }

        .gb-column-count {
          font-size: 12px;
          font-weight: 700;
          padding: 2px 12px;
          border-radius: 20px;
          color: ${WHITE};
        }

        .gb-droppable {
          min-height: 200px;
          padding: 10px;
          transition: all 0.3s ease;
        }

        .gb-droppable-drag {
          background: ${ACCENT_COLOR};
          border-radius: 12px;
        }

        /* ============================================
           CARD
           ============================================ */
        .gb-card {
          background: ${WHITE};
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 10px;
          border: 2px solid ${ACCENT_COLOR};
          border-left-width: 6px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: grab;
          position: relative;
        }

        .gb-card:hover {
          transform: translateY(-3px);
          box-shadow: ${CARD_SHADOW_HOVER};
          border-color: ${PRIMARY_COLOR};
        }

        .gb-card-dragging {
          transform: rotate(2deg) scale(1.04);
          box-shadow: 0 16px 48px rgba(1, 62, 55, 0.2);
          border-color: ${PRIMARY_COLOR};
          opacity: 0.8;
        }

        .gb-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .gb-card-info {
          flex: 1;
          min-width: 0;
        }

        .gb-card-title {
          font-size: 14px;
          font-weight: 600;
          color: ${PRIMARY_COLOR};
          margin: 0;
          line-height: 1.4;
        }

        .gb-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
          font-size: 12px;
          color: ${TEXT_LIGHT};
          flex-wrap: wrap;
        }

        .gb-card-level {
          font-size: 12px;
        }

        .gb-card-dot {
          color: ${TEXT_LIGHT};
        }

        .gb-card-owner {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }

        .gb-card-owner-icon {
          width: 12px;
          height: 12px;
        }

        .gb-card-delete {
          padding: 6px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          color: ${TEXT_LIGHT};
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .gb-card-delete:hover {
          background: #FEE2E2;
          color: ${DANGER_COLOR};
          transform: scale(1.1);
        }

        .gb-card-delete-icon {
          width: 14px;
          height: 14px;
        }

        .gb-card-progress {
          margin-top: 12px;
        }

        .gb-card-progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: ${TEXT_LIGHT};
        }

        .gb-card-progress-label {
          font-weight: 500;
        }

        .gb-card-progress-value {
          font-weight: 700;
          color: ${PRIMARY_COLOR};
        }

        .gb-card-progress-bar {
          width: 100%;
          height: 5px;
          background: ${ACCENT_COLOR};
          border-radius: 4px;
          overflow: hidden;
          margin-top: 5px;
        }

        .gb-card-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gb-progress-green { background: ${SUCCESS_COLOR}; }
        .gb-progress-blue { background: ${PRIMARY_COLOR}; }
        .gb-progress-yellow { background: ${WARNING_COLOR}; }
        .gb-progress-red { background: ${DANGER_COLOR}; }

        .gb-card-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid ${ACCENT_COLOR};
        }

        .gb-card-footer-icon {
          width: 14px;
          height: 14px;
          color: ${PRIMARY_COLOR};
        }

        .gb-card-footer-text {
          font-size: 12px;
          color: ${TEXT_LIGHT};
          font-weight: 500;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .gb-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 16px;
          color: ${TEXT_LIGHT};
        }

        .gb-empty-icon {
          width: 36px;
          height: 36px;
          opacity: 0.2;
          margin-bottom: 10px;
          color: ${PRIMARY_COLOR};
        }

        .gb-empty-text {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          color: ${TEXT_LIGHT};
        }

        .gb-empty-subtext {
          font-size: 12px;
          color: ${TEXT_LIGHT};
          margin: 4px 0 0 0;
          opacity: 0.7;
        }

        /* ============================================
           MODAL
           ============================================ */
        .gb-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(1, 62, 55, 0.5);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: gbFadeIn 0.3s ease;
        }

        .gb-modal {
          background: ${WHITE};
          border-radius: 20px;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 32px 80px rgba(1, 62, 55, 0.25);
          animation: gbModalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 2px solid ${ACCENT_COLOR};
        }

        @keyframes gbModalIn {
          from { opacity: 0; transform: scale(0.9) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .gb-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px;
          border-bottom: 2px solid ${ACCENT_COLOR};
          background: ${BG_LIGHT};
          border-radius: 20px 20px 0 0;
        }

        .gb-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .gb-modal-icon-wrapper {
          width: 40px;
          height: 40px;
          background: ${ACCENT_COLOR};
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gb-modal-icon {
          width: 22px;
          height: 22px;
          color: ${PRIMARY_COLOR};
        }

        .gb-modal-title {
          font-size: 22px;
          font-weight: 700;
          color: ${PRIMARY_COLOR};
          margin: 0;
        }

        .gb-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          border: none;
          background: ${ACCENT_COLOR};
          border-radius: 10px;
          color: ${TEXT_DARK};
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .gb-modal-close:hover {
          background: ${PRIMARY_COLOR};
          color: ${WHITE};
          transform: rotate(90deg);
        }

        .gb-modal-close-icon {
          width: 20px;
          height: 20px;
        }

        .gb-modal-form {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* ============================================
           FORM
           ============================================ */
        .gb-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gb-form-label {
          font-size: 14px;
          font-weight: 600;
          color: ${PRIMARY_COLOR};
        }

        .gb-form-required {
          color: ${DANGER_COLOR};
        }

        .gb-form-input,
        .gb-form-textarea,
        .gb-form-select {
          padding: 12px 16px;
          border: 2px solid ${ACCENT_COLOR};
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          width: 100%;
          font-family: inherit;
          background: ${WHITE};
          color: ${TEXT_DARK};
        }

        .gb-form-input:focus,
        .gb-form-textarea:focus,
        .gb-form-select:focus {
          border-color: ${PRIMARY_COLOR};
          box-shadow: 0 0 0 4px rgba(1, 62, 55, 0.08);
        }

        .gb-form-textarea {
          resize: vertical;
          min-height: 70px;
        }

        .gb-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .gb-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 14px;
          padding-top: 18px;
          border-top: 2px solid ${ACCENT_COLOR};
          margin-top: 4px;
        }

        .gb-form-cancel {
          padding: 12px 28px;
          background: ${ACCENT_COLOR};
          color: ${PRIMARY_COLOR};
          border: 2px solid ${ACCENT_COLOR};
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .gb-form-cancel:hover {
          background: ${WHITE};
          border-color: ${PRIMARY_COLOR};
          transform: translateY(-2px);
        }

        .gb-form-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: linear-gradient(135deg, ${PRIMARY_COLOR}, ${SUCCESS_COLOR});
          color: ${WHITE};
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.25);
        }

        .gb-form-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(1, 62, 55, 0.35);
        }

        .gb-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .gb-form-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: ${WHITE};
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
            min-width: 160px;
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
            font-size: 24px;
          }

          .gb-title-icon {
            width: 44px;
            height: 44px;
          }

          .gb-stat-card {
            padding: 16px 18px;
          }

          .gb-stat-number {
            font-size: 22px;
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

          .gb-refresh-btn {
            width: 100%;
          }

          .gb-create-btn {
            width: 100%;
          }

          .gb-title-wrapper {
            gap: 12px;
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
            padding: 18px 20px;
          }

          .gb-modal-form {
            padding: 20px;
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
          background: ${ACCENT_COLOR};
          border-radius: 8px;
        }

        .gb-modal::-webkit-scrollbar-thumb {
          background: ${PRIMARY_COLOR};
          border-radius: 8px;
        }

        .gb-modal::-webkit-scrollbar-thumb:hover {
          background: ${TEXT_LIGHT};
        }

        .gb-board::-webkit-scrollbar {
          height: 6px;
        }

        .gb-board::-webkit-scrollbar-track {
          background: ${ACCENT_COLOR};
          border-radius: 8px;
        }

        .gb-board::-webkit-scrollbar-thumb {
          background: ${PRIMARY_COLOR};
          border-radius: 8px;
        }

        .gb-board::-webkit-scrollbar-thumb:hover {
          background: ${TEXT_LIGHT};
        }
      `}</style>
    </>
  );
};

export default GoalBoard;