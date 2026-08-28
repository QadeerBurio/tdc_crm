// pages/projects/ProjectBoard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Plus, Filter, Search, X, RefreshCw,
  Clock, User, Calendar, Flag, AlertCircle,
  CheckCircle, Eye, Edit, Grid, List, ChevronDown,
  Briefcase, Layers, Zap
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Suppress the defaultProps warning for react-beautiful-dnd
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('defaultProps will be removed from memo components')) {
    return;
  }
  originalError(...args);
};

const ProjectBoard = () => {
  const { token } = useAuth();
  const [board, setBoard] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBoard, setFilteredBoard] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [viewMode, setViewMode] = useState('board');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchProjectsAndTasks();
  }, []);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const grouped = tasks.reduce((acc, task) => {
        const status = task.status || 'Backlog';
        if (!acc[status]) acc[status] = [];
        acc[status].push(task);
        return acc;
      }, {});
      setBoard(grouped);
      
      const filtered = {};
      for (const [status, taskList] of Object.entries(grouped)) {
        filtered[status] = taskList.filter(task => {
          const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.projectId?.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesPriority = filterPriority ? task.priority === filterPriority : true;
          const matchesAssignee = filterAssignee ? task.assignedTo?._id === filterAssignee : true;
          
          return matchesSearch && matchesPriority && matchesAssignee;
        });
      }
      setFilteredBoard(filtered);
    }
  }, [tasks, searchTerm, filterPriority, filterAssignee]);

  const fetchProjectsAndTasks = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const projectsResponse = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (projectsResponse.data) {
        const projectsData = projectsResponse.data.data || [];
        setProjects(projectsData);

        // Fetch tasks for each project
        const tasksPromises = projectsData.map(project => 
          axios.get(`${API_URL}/projects/${project._id}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { data: [] } }))
        );

        const tasksResponses = await Promise.all(tasksPromises);
        const allTasks = tasksResponses
          .filter(res => res && res.data && res.data.data)
          .flatMap(res => res.data.data || []);

        setTasks(allTasks);
      }
    } catch (err) {
      console.error('Error fetching projects and tasks:', err);
      let errorMessage = 'Failed to load task board.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view this board.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchProjectsAndTasks(true);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    setActionLoading(true);
    
    const previousTasks = [...tasks];
    const taskIndex = tasks.findIndex(t => t._id === draggableId);
    if (taskIndex === -1) {
      setActionLoading(false);
      return;
    }
    
    const updatedTask = { ...tasks[taskIndex], status: destination.droppableId };
    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    setTasks(newTasks);

    try {
      const task = tasks[taskIndex];
      if (!task.projectId) {
        throw new Error('Task has no project');
      }

      const projectId = typeof task.projectId === 'object' ? task.projectId._id : task.projectId;

      await axios.patch(`${API_URL}/projects/${projectId}/tasks/${draggableId}`,
        { status: destination.droppableId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Task moved successfully');
      await fetchProjectsAndTasks(true);
    } catch (err) {
      console.error('Error moving task:', err);
      setTasks(previousTasks);
      toast.error(err.response?.data?.message || 'Failed to move task.');
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterPriority('');
    setFilterAssignee('');
    setSearchTerm('');
    setShowFilters(false);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': '#EF4444',
      'high': '#F59E0B',
      'medium': '#3B82F6',
      'low': '#22C55E'
    };
    return colors[priority] || '#3B82F6';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'urgent': 'Urgent',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return labels[priority] || 'Medium';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Backlog': '#94A3B8',
      'Todo': '#94A3B8',
      'In Progress': '#3B82F6',
      'Review': '#8B5CF6',
      'Approved': '#F59E0B',
      'Completed': '#22C55E',
      'Done': '#22C55E'
    };
    return colors[status] || '#94A3B8';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Backlog': Layers,
      'Todo': Layers,
      'In Progress': Zap,
      'Review': AlertCircle,
      'Approved': CheckCircle,
      'Completed': CheckCircle,
      'Done': CheckCircle
    };
    return icons[status] || Layers;
  };

  const statuses = ['Backlog', 'Todo', 'In Progress', 'Review', 'Approved', 'Completed'];

  const totalTasks = Object.values(board).reduce((sum, tasks) => sum + tasks.length, 0);
  const completedTasks = board['Completed']?.length || 0;

  if (loading) {
    return (
      <div className="pb-loading">
        <div className="pb-spinner"></div>
        <p className="pb-loading-text">Loading task board...</p>
      </div>
    );
  }

  return (
    <div className="pb-container">
      {/* Header */}
      <div className="pb-header">
        <div>
          <h1 className="pb-title">Task Board</h1>
          <p className="pb-subtitle">Drag and drop tasks between columns to update their status</p>
        </div>
        <div className="pb-actions">
          <button className="pb-icon-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={18} className={refreshing ? 'pb-spin' : ''} />
          </button>
          <button className="pb-filter-btn" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filters
            <ChevronDown size={14} className={`pb-chevron ${showFilters ? 'pb-chevron-open' : ''}`} />
          </button>
          <div className="pb-view-toggle">
            <button
              onClick={() => setViewMode('board')}
              className={`pb-view-btn ${viewMode === 'board' ? 'pb-view-active' : 'pb-view-inactive'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`pb-view-btn ${viewMode === 'compact' ? 'pb-view-active' : 'pb-view-inactive'}`}
            >
              <List size={16} />
            </button>
          </div>
          <button className="pb-primary-btn" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="pb-stats">
        <div className="pb-stat">
          <span className="pb-stat-number">{totalTasks}</span>
          <span className="pb-stat-label">Total Tasks</span>
        </div>
        <div className="pb-stat">
          <span className="pb-stat-number">{completedTasks}</span>
          <span className="pb-stat-label">Completed</span>
        </div>
        <div className="pb-stat">
          <span className="pb-stat-number">
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
          </span>
          <span className="pb-stat-label">Progress</span>
        </div>
        <div className="pb-stat">
          <span className="pb-stat-number">{Object.keys(board).length}</span>
          <span className="pb-stat-label">Columns</span>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="pb-filter-panel">
          <div className="pb-filter-row">
            <div className="pb-filter-group">
              <label className="pb-filter-label">Search</label>
              <div className="pb-search">
                <Search size={16} className="pb-search-icon" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pb-search-input"
                />
                {searchTerm && (
                  <button className="pb-search-clear" onClick={() => setSearchTerm('')}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="pb-filter-group">
              <label className="pb-filter-label">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="pb-filter-select"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <button className="pb-clear-filters" onClick={clearFilters}>
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="pb-columns">
          {statuses.map((status) => {
            const tasks = filteredBoard[status] || [];
            const statusColor = getStatusColor(status);
            const StatusIcon = getStatusIcon(status);
            
            return (
              <div key={status} className="pb-column">
                <div className="pb-column-header">
                  <div className="pb-column-header-left">
                    <div className="pb-column-dot" style={{ backgroundColor: statusColor }} />
                    <h3 className="pb-column-title">{status}</h3>
                    <span className="pb-column-count">{tasks.length}</span>
                  </div>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`pb-droppable ${snapshot.isDraggingOver ? 'pb-droppable-drag' : ''}`}
                    >
                      {tasks.length === 0 ? (
                        <div className="pb-empty">
                          <StatusIcon size={24} className="pb-empty-icon" />
                          <p className="pb-empty-text">No tasks</p>
                        </div>
                      ) : (
                        tasks.map((task, index) => {
                          const priorityColor = getPriorityColor(task.priority);
                          const priorityLabel = getPriorityLabel(task.priority);
                          
                          return (
                            <Draggable
                              key={task._id}
                              draggableId={task._id}
                              index={index}
                              isDragDisabled={actionLoading}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`pb-task ${snapshot.isDragging ? 'pb-task-dragging' : ''}`}
                                >
                                  <div className="pb-task-header">
                                    <span className="pb-task-title">{task.title}</span>
                                    <span className="pb-task-priority" style={{
                                      backgroundColor: `${priorityColor}20`,
                                      color: priorityColor,
                                    }}>
                                      <Flag size={10} />
                                      {priorityLabel}
                                    </span>
                                  </div>
                                  
                                  {task.description && (
                                    <p className="pb-task-desc">
                                      {task.description.length > 60 
                                        ? `${task.description.substring(0, 60)}...` 
                                        : task.description}
                                    </p>
                                  )}
                                  
                                  <div className="pb-task-meta">
                                    {task.projectId && (
                                      <span className="pb-task-project">
                                        <Briefcase size={12} />
                                        {typeof task.projectId === 'object' ? task.projectId.projectName : 'Project'}
                                      </span>
                                    )}
                                    {task.assignedTo && (
                                      <span className="pb-task-assignee">
                                        <User size={12} />
                                        {typeof task.assignedTo === 'object' ? task.assignedTo.firstName : 'User'}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="pb-task-footer">
                                    {task.deadline && (
                                      <span className="pb-task-deadline">
                                        <Calendar size={12} />
                                        {formatDate(task.deadline)}
                                      </span>
                                    )}
                                    <div className="pb-task-actions">
                                      <button className="pb-task-action" title="View">
                                        <Eye size={14} />
                                      </button>
                                      <button className="pb-task-action" title="Edit">
                                        <Edit size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal */}
      {showCreateModal && (
        <div className="pb-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="pb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pb-modal-header">
              <h3 className="pb-modal-title">Create New Task</h3>
              <button className="pb-modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="pb-modal-body">
              <p className="pb-modal-text">Task creation form would go here.</p>
              <p className="pb-modal-hint">Please implement TaskForm component or use the projects API.</p>
            </div>
            <div className="pb-modal-footer">
              <button className="pb-modal-cancel" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="pb-modal-submit" onClick={() => {
                setShowCreateModal(false);
                toast.success('Task created successfully!');
                fetchProjectsAndTasks(true);
              }}>
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pb-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          background: #f8fafc;
          min-height: 100vh;
        }

        .pb-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 64vh;
          gap: 16px;
        }

        .pb-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .pb-spinner {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .pb-spin {
          animation: spin 1s linear infinite;
        }

        .pb-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pb-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .pb-subtitle {
          font-size: 15px;
          color: #64748b;
          margin-top: 4px;
          margin: 4px 0 0 0;
        }

        .pb-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pb-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pb-icon-btn:hover {
          background: #f1f5f9;
        }

        .pb-filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .pb-filter-btn:hover {
          background: #f1f5f9;
        }

        .pb-chevron {
          transition: transform 0.2s ease;
        }

        .pb-chevron-open {
          transform: rotate(180deg);
        }

        .pb-view-toggle {
          display: flex;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .pb-view-btn {
          padding: 10px 12px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .pb-view-active {
          background: #3b82f6;
          color: #ffffff;
        }

        .pb-view-inactive {
          background: #ffffff;
          color: #94a3b8;
        }

        .pb-view-inactive:hover {
          background: #f1f5f9;
        }

        .pb-primary-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }

        .pb-primary-btn:hover {
          background: #2563eb;
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.35);
          transform: translateY(-1px);
        }

        .pb-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .pb-stat {
          background: #ffffff;
          border-radius: 10px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .pb-stat:hover {
          background: #f8fafc;
        }

        .pb-stat-number {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          display: block;
        }

        .pb-stat-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .pb-filter-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 16px;
        }

        .pb-filter-row {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }

        .pb-filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 150px;
        }

        .pb-filter-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pb-search {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0 12px;
        }

        .pb-search:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .pb-search-icon {
          color: #94a3b8;
          flex-shrink: 0;
        }

        .pb-search-input {
          flex: 1;
          padding: 8px 10px;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
          color: #0f172a;
        }

        .pb-search-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 4px;
        }

        .pb-search-clear:hover {
          background: #f1f5f9;
        }

        .pb-filter-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
        }

        .pb-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .pb-clear-filters {
          padding: 8px 16px;
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          align-self: center;
        }

        .pb-clear-filters:hover {
          background: #e2e8f0;
        }

        .pb-columns {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 16px;
        }

        .pb-column {
          min-width: 220px;
        }

        .pb-column-header {
          background: #ffffff;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 8px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pb-column-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pb-column-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .pb-column-title {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .pb-column-count {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          background: #f1f5f9;
          padding: 1px 8px;
          border-radius: 12px;
        }

        .pb-droppable {
          min-height: 200px;
          padding: 6px;
          border-radius: 10px;
          border: 2px dashed #e2e8f0;
          transition: all 0.2s ease;
        }

        .pb-droppable-drag {
          background: #f1f5f9;
          border-color: #3b82f6;
        }

        .pb-task {
          background: #ffffff;
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin-bottom: 8px;
          transition: all 0.2s ease;
          cursor: grab;
        }

        .pb-task:hover {
          border-color: #94a3b8;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .pb-task:active {
          cursor: grabbing;
        }

        .pb-task-dragging {
          border-color: #3b82f6;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          transform: scale(1.02);
        }

        .pb-task-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 6px;
        }

        .pb-task-title {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
          flex: 1;
        }

        .pb-task-priority {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .pb-task-desc {
          font-size: 12px;
          color: #64748b;
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .pb-task-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .pb-task-project {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #64748b;
        }

        .pb-task-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #64748b;
        }

        .pb-task-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid #f1f5f9;
        }

        .pb-task-deadline {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #94a3b8;
        }

        .pb-task-actions {
          display: flex;
          gap: 4px;
        }

        .pb-task-action {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 4px;
        }

        .pb-task-action:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .pb-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 0;
          color: #94a3b8;
        }

        .pb-empty-icon {
          color: #d1d5db;
          margin-bottom: 4px;
        }

        .pb-empty-text {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
        }

        .pb-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .pb-modal {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .pb-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .pb-modal-title {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .pb-modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 4px;
          border-radius: 4px;
        }

        .pb-modal-close:hover {
          background: #f1f5f9;
        }

        .pb-modal-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pb-modal-text {
          font-size: 14px;
          color: #475569;
          margin: 0;
        }

        .pb-modal-hint {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
        }

        .pb-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .pb-modal-cancel {
          padding: 8px 16px;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .pb-modal-cancel:hover {
          background: #e2e8f0;
        }

        .pb-modal-submit {
          padding: 8px 16px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .pb-modal-submit:hover {
          background: #2563eb;
        }

        @media (max-width: 1400px) {
          .pb-columns { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 1024px) {
          .pb-columns { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .pb-container { padding: 16px; }
          .pb-header { flex-direction: column; align-items: stretch; }
          .pb-actions { width: 100%; }
          .pb-primary-btn { flex: 1; justify-content: center; }
          .pb-filter-btn { flex: 1; justify-content: center; }
          .pb-filter-row { flex-direction: column; align-items: stretch; }
          .pb-filter-group { min-width: unset; }
          .pb-clear-filters { align-self: stretch; }
          .pb-columns { grid-template-columns: 1fr; }
          .pb-stats { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 480px) {
          .pb-container { padding: 12px; }
          .pb-title { font-size: 22px; }
          .pb-actions { flex-wrap: wrap; }
          .pb-view-toggle { flex: 0; }
          .pb-stats { grid-template-columns: 1fr; }
          .pb-stat { padding: 10px; }
          .pb-stat-number { font-size: 18px; }
        }
      `}</style>
    </div>
  );
};

export default ProjectBoard;