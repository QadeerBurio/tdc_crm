// pages/projects/Tasks.jsx - COMPLETE FIXED VERSION

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Search, LayoutGrid, List, Eye, Trash2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
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

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  // ✅ DETERMINE IF EMPLOYEE VIEW
  const assignedToMe = searchParams.get('assignedToMe') === 'true';
  const isEmployeeView = user?.role === 'employee' || assignedToMe;

  // ✅ If user is employee and assignedToMe is not set, redirect to add it
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

      if (projectId) {
        params.projectId = projectId;
      }

      // ✅ CRITICAL FIX: For employees, ALWAYS filter by assignedToMe
      if (user?.role === 'employee' || assignedToMe) {
        params.assignedToMe = 'true';
      }

      console.log('🔍 Fetching tasks with params:', params);
      console.log('👤 User role:', user?.role);
      console.log('📋 assignedToMe:', assignedToMe);
      console.log('📋 isEmployeeView:', isEmployeeView);

      const response = await axios.get(`${API_URL}/tasks`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 Response:', response.data);

      let tasksData = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        tasksData = response.data.data;
      } else if (Array.isArray(response.data)) {
        tasksData = response.data;
      } else if (response.data?.tasks && Array.isArray(response.data.tasks)) {
        tasksData = response.data.tasks;
      }

      console.log('📋 Tasks found:', tasksData.length);
      setTasks(tasksData);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast.error('Failed to load tasks');
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
      console.error('Delete error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTaskCreated = () => {
    setShowCreateModal(false);
    fetchTasks();
  };

  const getPriorityColor = (priority) => {
    const colors = { 'Urgent': '#DC2626', 'High': '#EA580C', 'Medium': '#CA8A04', 'Low': '#16A34A' };
    return colors[priority] || '#6B7280';
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Completed': { backgroundColor: '#d1fae5', color: '#065f46' },
      'In Progress': { backgroundColor: '#dbeafe', color: '#1e40af' },
      'Internal QA': { backgroundColor: '#ede9fe', color: '#5b21b6' },
      'Client Review': { backgroundColor: '#fef3c7', color: '#92400e' },
      'Approved': { backgroundColor: '#ccfbf1', color: '#0f766e' },
      'Backlog': { backgroundColor: '#f3f4f6', color: '#374151' },
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

  // ✅ RENDER EMPTY STATE FOR EMPLOYEE WITH NO TASKS
  const renderEmptyState = () => {
    if (isEmployeeView) {
      return (
        <div style={styles.emptyStateContainer}>
          <div style={styles.emptyStateIcon}>📋</div>
          <h3 style={styles.emptyStateTitle}>No tasks assigned to you</h3>
          <p style={styles.emptyStateText}>
            You don't have any tasks assigned to you at the moment.
            Check back later or contact your manager.
          </p>
        </div>
      );
    }
    return (
      <div style={styles.emptyStateContainer}>
        <div style={styles.emptyStateIcon}>📋</div>
        <h3 style={styles.emptyStateTitle}>No tasks found</h3>
        <p style={styles.emptyStateText}>
          {canCreateTask() 
            ? 'Create a new task to get started.' 
            : 'No tasks available.'}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{getTitle()}</h1>
          <p style={styles.subtitle}>{getSubtitle()}</p>
          {isEmployeeView && (
            <p style={styles.taskCount}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
            </p>
          )}
        </div>
        {canCreateTask() && (
          <button style={styles.addButton} onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Create Task
          </button>
        )}
      </div>

      <div style={styles.filtersContainer}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterSelects}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Status</option>
            <option value="Backlog">Backlog</option>
            <option value="In Progress">In Progress</option>
            <option value="Internal QA">Internal QA</option>
            <option value="Client Review">Client Review</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Priority</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <div style={styles.viewToggle}>
            <button
              onClick={() => setViewMode('list')}
              style={{...styles.viewButton, ...(viewMode === 'list' ? styles.viewButtonActive : styles.viewButtonInactive)}}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('board')}
              style={{...styles.viewButton, ...(viewMode === 'board' ? styles.viewButtonActive : styles.viewButtonInactive)}}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Show a message for employees when they have tasks */}
      {isEmployeeView && tasks.length > 0 && (
        <div style={styles.employeeMessage}>
          <p>✅ Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
        </div>
      )}

      {viewMode === 'list' && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Task</th>
                <th style={styles.th}>Project</th>
                <th style={styles.th}>Assigned To</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Deadline</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.emptyState}>
                    {isEmployeeView ? 'No tasks assigned to you' : 'No tasks found'}
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task._id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <Link to={`/tasks/${task._id}`} style={styles.taskLink}>
                        {task.title}
                      </Link>
                    </td>
                    <td style={styles.td}>
                      {task.projectId ? (
                        <Link to={`/projects/${task.projectId._id}`} style={styles.projectLink}>
                          {task.projectId.projectName || 'N/A'}
                        </Link>
                      ) : 'N/A'}
                    </td>
                    <td style={styles.td}>
                      {task.assignedTo ? 
                        `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 
                        'Unassigned'
                      }
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: getPriorityColor(task.priority) }}>
                        {task.priority || 'Medium'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{...styles.statusBadge, ...getStatusStyle(task.status)}}>
                        {task.status || 'Backlog'}
                      </span>
                    </td>
                    <td style={styles.td}>{formatDate(task.deadline)}</td>
                    <td style={styles.td}>
                      <div style={styles.actionContainer}>
                        <Link to={`/tasks/${task._id}`} style={styles.viewLink}>
                          <Eye size={14} />
                        </Link>
                        {!isEmployeeView && (
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowDeleteModal(true);
                            }}
                            style={styles.deleteLink}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'board' && (
        <div style={styles.boardContainer}>
          {['Backlog', 'In Progress', 'Internal QA', 'Client Review', 'Approved', 'Completed'].map((status) => (
            <div key={status} style={styles.boardColumn}>
              <h3 style={styles.boardColumnTitle}>{status}</h3>
              <div style={styles.boardColumnContent}>
                {tasks.filter(task => task.status === status).length === 0 ? (
                  <p style={styles.boardEmpty}>No tasks</p>
                ) : (
                  tasks.filter(task => task.status === status).map(task => (
                    <div key={task._id} style={styles.boardCard}>
                      <Link to={`/tasks/${task._id}`} style={styles.boardCardLink}>
                        <h4 style={styles.boardCardTitle}>{task.title}</h4>
                        <p style={styles.boardCardMeta}>
                          {task.assignedTo ? 
                            `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 
                            'Unassigned'
                          }
                        </p>
                        <div style={styles.boardCardFooter}>
                          <span style={{ color: getPriorityColor(task.priority), fontSize: '12px' }}>
                            {task.priority || 'Medium'}
                          </span>
                          <span style={styles.boardCardDate}>
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

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Task"
        size="lg"
      >
        <TaskForm
          projectId={projectId}
          onSuccess={handleTaskCreated}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTask(null);
        }}
        title="Delete Task"
      >
        <div style={styles.modalContent}>
          <p style={styles.modalText}>
            Are you sure you want to delete <strong>{selectedTask?.title}</strong>?
          </p>
          <div style={styles.modalActions}>
            <button
              style={styles.modalCancelButton}
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedTask(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              style={styles.modalDeleteButton}
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete Task'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '64vh', gap: '16px' },
  spinner: { width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#3B82F6', animation: 'spin 0.8s linear infinite' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' },
  taskCount: { fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0', fontWeight: '500' },
  employeeMessage: { 
    backgroundColor: '#D1FAE5', 
    padding: '10px 16px', 
    borderRadius: '8px', 
    marginBottom: '16px',
    color: '#065F46',
    fontSize: '14px',
    fontWeight: '500'
  },
  addButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  filtersContainer: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  searchContainer: { flex: 1, minWidth: '200px' },
  searchInput: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  filterSelects: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  filterSelect: { padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#FFFFFF', fontSize: '14px', minWidth: '150px', outline: 'none' },
  viewToggle: { display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #D1D5DB' },
  viewButton: { padding: '10px 12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  viewButtonActive: { backgroundColor: '#3B82F6', color: '#FFFFFF' },
  viewButtonInactive: { backgroundColor: '#FFFFFF', color: '#6B7280' },
  tableWrapper: { backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#111827', borderBottom: '1px solid #F3F4F6' },
  tableRow: { transition: 'background-color 0.2s ease' },
  taskLink: { color: '#3B82F6', textDecoration: 'none' },
  projectLink: { color: '#6B7280', textDecoration: 'none' },
  statusBadge: { display: 'inline-flex', padding: '4px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500' },
  actionContainer: { display: 'flex', gap: '8px' },
  viewLink: { display: 'inline-flex', padding: '6px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: '#3B82F6', textDecoration: 'none', transition: 'all 0.2s ease' },
  deleteLink: { display: 'inline-flex', padding: '6px', borderRadius: '6px', backgroundColor: '#FEF2F2', color: '#EF4444', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' },
  emptyState: { textAlign: 'center', padding: '32px 16px', color: '#6B7280' },
  boardContainer: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', overflowX: 'auto' },
  boardColumn: { backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '16px', minWidth: '200px' },
  boardColumnTitle: { fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0', textAlign: 'center' },
  boardColumnContent: { display: 'flex', flexDirection: 'column', gap: '8px' },
  boardCard: { backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  boardCardLink: { textDecoration: 'none', color: 'inherit' },
  boardCardTitle: { fontSize: '14px', fontWeight: '500', color: '#111827', margin: '0 0 4px 0' },
  boardCardMeta: { fontSize: '12px', color: '#6B7280', margin: '0 0 8px 0' },
  boardCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  boardCardDate: { fontSize: '11px', color: '#9CA3AF' },
  boardEmpty: { textAlign: 'center', color: '#9CA3AF', fontSize: '13px', padding: '16px 0' },
  modalContent: { display: 'flex', flexDirection: 'column', gap: '16px' },
  modalText: { color: '#374151', margin: 0 },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px' },
  modalCancelButton: { padding: '8px 16px', backgroundColor: 'transparent', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  modalDeleteButton: { padding: '8px 16px', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  emptyStateContainer: { textAlign: 'center', padding: '48px 16px' },
  emptyStateIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyStateTitle: { fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' },
  emptyStateText: { fontSize: '14px', color: '#6B7280' },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .add-button:hover:not(:disabled) { background-color: #2563EB !important; }
  .search-input:focus, .filter-select:focus { border-color: #3B82F6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important; }
  .table-row:hover { background-color: #F9FAFB !important; }
  .task-link:hover { color: #1D4ED8 !important; text-decoration: underline !important; }
  .view-link:hover { background-color: #DBEAFE !important; }
  .delete-link:hover { background-color: #FEE2E2 !important; }
  .modal-cancel-button:hover:not(:disabled) { background-color: #F9FAFB !important; }
  .modal-delete-button:hover:not(:disabled) { background-color: #DC2626 !important; }
  @media (max-width: 768px) {
    .header { flex-direction: column !important; align-items: stretch !important; }
    .add-button { width: 100% !important; justify-content: center !important; }
    .filters-container { flex-direction: column !important; }
    .filter-selects { flex-direction: column !important; width: 100% !important; }
    .filter-select { width: 100% !important; }
    .view-toggle { width: 100% !important; }
    .view-button { flex: 1 !important; }
    .modal-actions { flex-direction: column !important; }
    .modal-cancel-button, .modal-delete-button { width: 100% !important; justify-content: center !important; }
    .board-container { grid-template-columns: repeat(6, 280px) !important; }
  }
`;
document.head.appendChild(styleSheet);

export default Tasks;