// pages/projects/Tasks.jsx - MODERN MODAL DESIGN LIKE SEGMENTS

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, LayoutGrid, List, Eye, Trash2, Filter, ChevronDown, X,
  Layers, Users, Clock, Flag, Calendar, FileText, Tag, Briefcase
} from 'lucide-react';
import TaskForm from '../../components/projects/TaskForm';
import axios from 'axios';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const assignedToMe = searchParams.get('assignedToMe') === 'true';
  const isEmployeeView = user?.role === 'employee' || assignedToMe;

  useEffect(() => {
    if (user?.role === 'employee' && !assignedToMe && !projectId) {
      navigate('/projects/tasks?assignedToMe=true', { replace: true });
    }
  }, [user?.role, assignedToMe, navigate, projectId]);

  useEffect(() => {
    fetchTasks();
    if (projectId) {
      fetchProject();
    }
  }, [currentPage, searchTerm, filterStatus, filterPriority, projectId, assignedToMe, user?.role]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: filterStatus || undefined,
        priority: filterPriority || undefined,
      };

      if (projectId) params.projectId = projectId;
      if (user?.role === 'employee' || assignedToMe) params.assignedToMe = 'true';

      const response = await axios.get(`${API_URL}/tasks`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      let tasksData = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        tasksData = response.data.data;
      } else if (Array.isArray(response.data)) {
        tasksData = response.data;
      } else if (response.data?.tasks && Array.isArray(response.data.tasks)) {
        tasksData = response.data.tasks;
      }

      setTasks(tasksData);
      
      if (tasksData.length === 0) {
        if (user?.role === 'admin' || user?.role === 'manager') {
          toast.info('No tasks found. Create a new task to get started.');
        } else if (isEmployeeView) {
          toast.info('No tasks assigned to you.');
        }
      } else {
        toast.success(`Found ${tasksData.length} tasks`);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast.error(`Failed to load tasks: ${err.response?.data?.message || err.message}`);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setProject(response.data.data || response.data);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/tasks/${selectedTask._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Task deleted successfully');
      setShowDeleteModal(false);
      setSelectedTask(null);
      await fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTaskCreated = () => {
    setShowCreateModal(false);
    fetchTasks();
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterPriority('');
    setSearchTerm('');
    setShowFilters(false);
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      'Urgent': { backgroundColor: '#013E37', color: '#FFFFFF' },
      'High': { backgroundColor: '#FEF3C7', color: '#92400E' },
      'Medium': { backgroundColor: '#FFEFB3', color: '#013E37' },
      'Low': { backgroundColor: '#D1FAE5', color: '#065F46' },
    };
    return styles[priority] || styles.Medium;
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Completed': { backgroundColor: '#D1FAE5', color: '#065F46' },
      'In Progress': { backgroundColor: '#DBEAFE', color: '#1E40AF' },
      'Internal QA': { backgroundColor: '#EDE9FE', color: '#5B21B6' },
      'Client Review': { backgroundColor: '#FEF3C7', color: '#92400E' },
      'Approved': { backgroundColor: '#CCFBF1', color: '#0F766E' },
      'Backlog': { backgroundColor: '#F3F4F6', color: '#374151' },
    };
    return styles[status] || styles.Backlog;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTitle = () => {
    if (isEmployeeView) return 'My Tasks';
    if (projectId) return `${project?.projectName || 'Project'} - Tasks`;
    return 'All Tasks';
  };

  const getSubtitle = () => {
    if (isEmployeeView) return 'Tasks assigned to you';
    return 'Manage and track your tasks';
  };

  const canCreateTask = () => {
    return !['employee', 'client'].includes(user?.role);
  };

  const renderEmptyState = () => {
    if (isEmployeeView) {
      return (
        <div className="tasks-empty">
          <div className="tasks-empty-icon-wrapper">
            <Layers className="tasks-empty-icon" />
          </div>
          <h3 className="tasks-empty-title">No tasks assigned to you</h3>
          <p className="tasks-empty-subtitle">
            You don't have any tasks assigned to you at the moment.
          </p>
        </div>
      );
    }
    
    return (
      <div className="tasks-empty">
        <div className="tasks-empty-icon-wrapper">
          <Layers className="tasks-empty-icon" />
        </div>
        <h3 className="tasks-empty-title">No tasks found</h3>
        <p className="tasks-empty-subtitle">
          {canCreateTask() 
            ? 'Create a new task to get started.' 
            : 'No tasks available.'}
        </p>
        {canCreateTask() && (
          <button className="tasks-empty-btn" onClick={() => setShowCreateModal(true)}>
            <Plus className="tasks-empty-btn-icon" />
            Create Your First Task
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="tasks-loading">
        <div className="tasks-loading-spinner"></div>
        <p className="tasks-loading-text">Loading tasks...</p>
      </div>
    );
  }

  return (
    <>
      <div className="tasks-container">
        {/* Header */}
        <div className="tasks-header">
          <div className="tasks-header-left">
            <h1 className="tasks-title">
              <Layers className="tasks-title-icon" />
              {getTitle()}
            </h1>
            <p className="tasks-subtitle">{getSubtitle()}</p>
            <span className="tasks-count">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              {isEmployeeView && ' assigned to you'}
            </span>
          </div>
          <div className="tasks-header-right">
            <div className="tasks-view-toggle">
              <button
                onClick={() => setViewMode('list')}
                className={`tasks-view-btn ${viewMode === 'list' ? 'tasks-view-active' : ''}`}
              >
                <List className="tasks-view-icon" />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`tasks-view-btn ${viewMode === 'board' ? 'tasks-view-active' : ''}`}
              >
                <LayoutGrid className="tasks-view-icon" />
              </button>
            </div>
            {canCreateTask() && (
              <button className="tasks-add-btn" onClick={() => setShowCreateModal(true)}>
                <Plus className="tasks-add-icon" />
                New Task
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="tasks-filters">
          <div className="tasks-search">
            <Search className="tasks-search-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tasks-search-input"
            />
            {searchTerm && (
              <button className="tasks-search-clear" onClick={() => setSearchTerm('')}>
                <X className="tasks-search-clear-icon" />
              </button>
            )}
          </div>
          <div className="tasks-filter-group">
            <button className="tasks-filter-btn" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="tasks-filter-icon" />
              Filters
              <ChevronDown className={`tasks-filter-chevron ${showFilters ? 'tasks-filter-chevron-open' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="tasks-filter-panel">
            <div className="tasks-filter-row">
              <div className="tasks-filter-item">
                <label className="tasks-filter-label">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="tasks-filter-select"
                >
                  <option value="">All Status</option>
                  <option value="Backlog">Backlog</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Internal QA">Internal QA</option>
                  <option value="Client Review">Client Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="tasks-filter-item">
                <label className="tasks-filter-label">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="tasks-filter-select"
                >
                  <option value="">All Priority</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <button className="tasks-filter-clear" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {isEmployeeView && tasks.length > 0 && (
          <div className="tasks-employee-banner">
            ✅ Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
          </div>
        )}

        {/* Tasks List/Board */}
        {tasks.length === 0 ? (
          renderEmptyState()
        ) : viewMode === 'list' ? (
          <div className="tasks-table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr className="tasks-table-header">
                  <th className="tasks-th">Task</th>
                  <th className="tasks-th">Project</th>
                  <th className="tasks-th">Assigned To</th>
                  <th className="tasks-th">Priority</th>
                  <th className="tasks-th">Status</th>
                  <th className="tasks-th">Deadline</th>
                  <th className="tasks-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} className="tasks-table-row">
                    <td className="tasks-td">
                      <Link to={`/tasks/${task._id}`} className="tasks-task-link">
                        {task.title}
                      </Link>
                    </td>
                    <td className="tasks-td">
                      {task.projectId ? (
                        <Link to={`/projects/${task.projectId._id}`} className="tasks-project-link">
                          {task.projectId.projectName || 'N/A'}
                        </Link>
                      ) : 'N/A'}
                    </td>
                    <td className="tasks-td">
                      {task.assignedTo ? 
                        `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 
                        'Unassigned'
                      }
                    </td>
                    <td className="tasks-td">
                      <span className="tasks-priority-badge" style={getPriorityStyle(task.priority)}>
                        <Flag className="tasks-priority-icon" />
                        {task.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="tasks-td">
                      <span className="tasks-status-badge" style={getStatusStyle(task.status)}>
                        {task.status || 'Backlog'}
                      </span>
                    </td>
                    <td className="tasks-td">{formatDate(task.deadline)}</td>
                    <td className="tasks-td">
                      <div className="tasks-actions">
                        <Link to={`/tasks/${task._id}`} className="tasks-action-view" title="View">
                          <Eye className="tasks-action-icon" />
                        </Link>
                        {!isEmployeeView && (
                          <button
                            className="tasks-action-delete"
                            onClick={() => {
                              setSelectedTask(task);
                              setShowDeleteModal(true);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="tasks-action-icon" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="tasks-board">
            {['Backlog', 'In Progress', 'Internal QA', 'Client Review', 'Approved', 'Completed'].map((status) => (
              <div key={status} className="tasks-board-column">
                <h3 className="tasks-board-column-title">{status}</h3>
                <div className="tasks-board-column-content">
                  {tasks.filter(task => task.status === status).length === 0 ? (
                    <p className="tasks-board-empty">No tasks</p>
                  ) : (
                    tasks.filter(task => task.status === status).map(task => (
                      <div key={task._id} className="tasks-board-card">
                        <Link to={`/tasks/${task._id}`} className="tasks-board-card-link">
                          <h4 className="tasks-board-card-title">{task.title}</h4>
                          <p className="tasks-board-card-meta">
                            {task.assignedTo ? 
                              `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 
                              'Unassigned'
                            }
                          </p>
                          <div className="tasks-board-card-footer">
                            <span className="tasks-board-priority" style={getPriorityStyle(task.priority)}>
                              <Flag className="tasks-board-priority-icon" />
                              {task.priority || 'Medium'}
                            </span>
                            <span className="tasks-board-date">
                              {formatDate(task.deadline)}
                            </span>
                          </div>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal - styled like Segments */}
      {showCreateModal && (
        <div className="tasks-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="tasks-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tasks-modal-header">
              <h2 className="tasks-modal-title">
                <Layers className="tasks-modal-title-icon" />
                Create New Task
              </h2>
              <button className="tasks-modal-close" onClick={() => setShowCreateModal(false)}>
                <X className="tasks-modal-close-icon" />
              </button>
            </div>
            <div className="tasks-modal-body">
              <TaskForm
                projectId={projectId}
                onSuccess={handleTaskCreated}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="tasks-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="tasks-modal tasks-modal-delete" onClick={(e) => e.stopPropagation()}>
            <div className="tasks-modal-header">
              <h2 className="tasks-modal-title">Delete Task?</h2>
              <button className="tasks-modal-close" onClick={() => setShowDeleteModal(false)}>
                <X className="tasks-modal-close-icon" />
              </button>
            </div>
            <div className="tasks-modal-body">
              <p className="tasks-delete-text">
                Are you sure you want to delete <strong>"{selectedTask?.title}"</strong>?
              </p>
              <p className="tasks-delete-subtext">This action cannot be undone.</p>
            </div>
            <div className="tasks-modal-footer">
              <button className="tasks-modal-cancel" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>
                Cancel
              </button>
              <button className="tasks-modal-delete" onClick={handleDelete} disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .tasks-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          background: #FFFFFF;
          min-height: 100vh;
          border-radius: 24px;
          box-shadow: 0 2px 12px rgba(1, 62, 55, 0.04);
        }

        /* ============================================
           LOADING
           ============================================ */
        .tasks-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .tasks-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: tasksSpin 0.8s linear infinite;
        }
        .tasks-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           HEADER
           ============================================ */
        .tasks-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .tasks-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .tasks-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .tasks-title-icon {
          width: 28px;
          height: 28px;
          opacity: 0.7;
        }
        .tasks-subtitle {
          color: #013E37;
          opacity: 0.6;
          font-size: 15px;
          margin: 0;
        }
        .tasks-count {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          font-weight: 500;
        }
        .tasks-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tasks-view-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #FFEFB3;
          border-radius: 8px;
          padding: 4px;
        }
        .tasks-view-btn {
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.5;
          display: flex;
          align-items: center;
        }
        .tasks-view-btn:hover {
          opacity: 0.8;
        }
        .tasks-view-active {
          background: #013E37;
          color: #FFFFFF;
          opacity: 1;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.2);
        }
        .tasks-view-icon {
          width: 16px;
          height: 16px;
        }
        .tasks-add-btn {
          padding: 8px 20px;
          background: #013E37;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.25);
        }
        .tasks-add-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .tasks-add-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        .tasks-add-btn:hover .tasks-add-icon {
          transform: rotate(90deg);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .tasks-filters {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .tasks-search {
          flex: 1;
          min-width: 200px;
          position: relative;
        }
        .tasks-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          opacity: 0.5;
          color: #013E37;
        }
        .tasks-search-input {
          width: 100%;
          padding: 8px 40px 8px 36px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #013E37;
        }
        .tasks-search-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.08);
        }
        .tasks-search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #013E37;
          opacity: 0.4;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }
        .tasks-search-clear:hover {
          opacity: 0.8;
        }
        .tasks-search-clear-icon {
          width: 16px;
          height: 16px;
        }
        .tasks-filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tasks-filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          color: #013E37;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .tasks-filter-btn:hover {
          background: #FFEFB3;
        }
        .tasks-filter-icon {
          width: 16px;
          height: 16px;
        }
        .tasks-filter-chevron {
          width: 14px;
          height: 14px;
          transition: transform 0.3s ease;
        }
        .tasks-filter-chevron-open {
          transform: rotate(180deg);
        }

        .tasks-filter-panel {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 16px;
          animation: tasksSlideDown 0.3s ease;
        }
        .tasks-filter-row {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }
        .tasks-filter-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 150px;
        }
        .tasks-filter-label {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .tasks-filter-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #013E37;
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .tasks-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.08);
        }
        .tasks-filter-clear {
          padding: 8px 16px;
          background: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          align-self: center;
        }
        .tasks-filter-clear:hover {
          background: #e6d69e;
        }

        .tasks-employee-banner {
          background: #FFEFB3;
          padding: 10px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          color: #013E37;
          font-size: 14px;
          font-weight: 500;
        }

        /* ============================================
           TABLE
           ============================================ */
        .tasks-table-wrapper {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.04);
        }
        .tasks-table {
          width: 100%;
          border-collapse: collapse;
        }
        .tasks-table-header {
          background: #FFEFB3;
          border-bottom: 1px solid #FFEFB3;
        }
        .tasks-th {
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .tasks-td {
          padding: 12px 16px;
          font-size: 14px;
          color: #013E37;
          border-bottom: 1px solid #FFEFB3;
        }
        .tasks-table-row {
          transition: background-color 0.2s ease;
        }
        .tasks-table-row:hover {
          background: #FFFDF5;
        }

        .tasks-task-link {
          color: #013E37;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }
        .tasks-task-link:hover {
          color: #0A5C54;
          text-decoration: underline;
        }

        .tasks-project-link {
          color: #013E37;
          opacity: 0.7;
          text-decoration: none;
          transition: opacity 0.3s ease;
        }
        .tasks-project-link:hover {
          opacity: 1;
        }

        .tasks-priority-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .tasks-priority-icon {
          width: 12px;
          height: 12px;
        }

        .tasks-status-badge {
          display: inline-flex;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .tasks-actions {
          display: flex;
          gap: 4px;
        }
        .tasks-action-view {
          display: inline-flex;
          padding: 6px 8px;
          border-radius: 6px;
          background: #FFEFB3;
          color: #013E37;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        .tasks-action-view:hover {
          background: #e6d69e;
        }
        .tasks-action-delete {
          display: inline-flex;
          padding: 6px 8px;
          border-radius: 6px;
          background: #FEF2F2;
          color: #EF4444;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .tasks-action-delete:hover {
          background: #FEE2E2;
        }
        .tasks-action-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           BOARD
           ============================================ */
        .tasks-board {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          overflow-x: auto;
        }
        .tasks-board-column {
          background: #ffffff;
          border-radius: 12px;
          padding: 16px;
          border: 1px solid #FFEFB3;
          min-width: 200px;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.04);
        }
        .tasks-board-column-title {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
          margin: 0 0 12px 0;
          text-align: center;
          padding-bottom: 8px;
          border-bottom: 2px solid #FFEFB3;
        }
        .tasks-board-column-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tasks-board-card {
          background: #ffffff;
          border-radius: 8px;
          padding: 12px;
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
          box-shadow: 0 1px 4px rgba(1, 62, 55, 0.04);
        }
        .tasks-board-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.08);
        }
        .tasks-board-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .tasks-board-card-title {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          margin: 0 0 4px 0;
        }
        .tasks-board-card-meta {
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
          margin: 0 0 8px 0;
        }
        .tasks-board-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tasks-board-priority {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }
        .tasks-board-priority-icon {
          width: 10px;
          height: 10px;
        }
        .tasks-board-date {
          font-size: 11px;
          color: #013E37;
          opacity: 0.5;
        }
        .tasks-board-empty {
          text-align: center;
          color: #013E37;
          opacity: 0.4;
          font-size: 13px;
          padding: 16px 0;
        }

        /* ============================================
           EMPTY
           ============================================ */
        .tasks-empty {
          background: #ffffff;
          border: 2px dashed #FFEFB3;
          border-radius: 16px;
          padding: 60px 24px;
          text-align: center;
        }
        .tasks-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #FFEFB3;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          animation: tasksFloat 3s ease-in-out infinite;
        }
        .tasks-empty-icon {
          width: 40px;
          height: 40px;
          color: #013E37;
        }
        .tasks-empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .tasks-empty-subtitle {
          color: #013E37;
          opacity: 0.6;
          margin-top: 4px;
          font-size: 15px;
        }
        .tasks-empty-btn {
          margin-top: 20px;
          padding: 10px 24px;
          background: #013E37;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        .tasks-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .tasks-empty-btn-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        .tasks-empty-btn:hover .tasks-empty-btn-icon {
          transform: rotate(90deg);
        }

        /* ============================================
           MODAL
           ============================================ */
        .tasks-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(1, 62, 55, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: tasksFadeIn 0.3s ease;
        }
        .tasks-modal {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #FFEFB3;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(1, 62, 55, 0.2);
          animation: tasksModalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .tasks-modal-delete {
          max-width: 440px;
        }
        .tasks-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
        }
        .tasks-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tasks-modal-title-icon {
          width: 20px;
          height: 20px;
        }
        .tasks-modal-close {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.5;
          display: flex;
          align-items: center;
        }
        .tasks-modal-close:hover {
          background: rgba(1, 62, 55, 0.1);
          opacity: 1;
          transform: rotate(90deg);
        }
        .tasks-modal-close-icon {
          width: 20px;
          height: 20px;
        }
        .tasks-modal-body {
          padding: 24px;
        }
        .tasks-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #FFEFB3;
          background: #F8FAFC;
        }
        .tasks-modal-cancel {
          padding: 8px 16px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: transparent;
          color: #013E37;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .tasks-modal-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .tasks-modal-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .tasks-modal-delete {
          padding: 8px 20px;
          background: #013E37;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .tasks-modal-delete:hover:not(:disabled) {
          background: #0A5C54;
        }
        .tasks-modal-delete:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .tasks-delete-text {
          color: #013E37;
          font-size: 15px;
          margin: 0;
        }
        .tasks-delete-subtext {
          color: #013E37;
          opacity: 0.6;
          font-size: 13px;
          margin: 4px 0 0 0;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes tasksSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes tasksFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes tasksModalIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes tasksSlideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes tasksFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .tasks-board {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .tasks-container {
            padding: 16px;
          }
          .tasks-header {
            flex-direction: column;
            align-items: stretch;
          }
          .tasks-header-right {
            width: 100%;
          }
          .tasks-add-btn {
            flex: 1;
            justify-content: center;
          }
          .tasks-filters {
            flex-direction: column;
            align-items: stretch;
          }
          .tasks-filter-row {
            flex-direction: column;
            align-items: stretch;
          }
          .tasks-filter-item {
            min-width: unset;
          }
          .tasks-filter-clear {
            align-self: stretch;
          }
          .tasks-board {
            grid-template-columns: repeat(6, 280px);
          }
          .tasks-modal {
            margin: 16px;
          }
          .tasks-modal-footer {
            flex-direction: column-reverse;
          }
          .tasks-modal-cancel,
          .tasks-modal-delete {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .tasks-container {
            padding: 12px;
          }
          .tasks-title {
            font-size: 22px;
          }
          .tasks-header-right {
            flex-wrap: wrap;
          }
          .tasks-view-toggle {
            flex: 1;
          }
          .tasks-view-btn {
            flex: 1;
            justify-content: center;
          }
          .tasks-add-btn {
            width: 100%;
          }
          .tasks-modal-body {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default Tasks;