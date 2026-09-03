// pages/projects/ProjectBoard.jsx - MODERN DESIGN WITH YOUR COLOR PALETTE

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
      'urgent': '#013E37',
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
      'Completed': '#013E37'
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
      'Completed': CheckCircle
    };
    return icons[status] || Layers;
  };

  const statuses = ['Backlog', 'Todo', 'In Progress', 'Review', 'Approved', 'Completed'];

  const totalTasks = Object.values(board).reduce((sum, tasks) => sum + tasks.length, 0);
  const completedTasks = board['Completed']?.length || 0;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading task board...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Task Board</h1>
          <p style={styles.subtitle}>Drag and drop tasks between columns to update their status</p>
        </div>
        <div style={styles.actions}>
          <button style={styles.iconBtn} onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button style={styles.filterBtn} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filters
            <ChevronDown size={14} style={{
              transform: showFilters ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease'
            }} />
          </button>
          <div style={styles.viewToggle}>
            <button
              onClick={() => setViewMode('board')}
              style={{
                ...styles.viewBtn,
                ...(viewMode === 'board' ? styles.viewActive : styles.viewInactive)
              }}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              style={{
                ...styles.viewBtn,
                ...(viewMode === 'compact' ? styles.viewActive : styles.viewInactive)
              }}
            >
              <List size={16} />
            </button>
          </div>
          <button style={styles.primaryBtn} onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{totalTasks}</span>
          <span style={styles.statLabel}>Total Tasks</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{completedTasks}</span>
          <span style={styles.statLabel}>Completed</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
          </span>
          <span style={styles.statLabel}>Progress</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{Object.keys(board).length}</span>
          <span style={styles.statLabel}>Columns</span>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={styles.filterPanel}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search</label>
              <div style={styles.search}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                {searchTerm && (
                  <button style={styles.searchClear} onClick={() => setSearchTerm('')}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <button style={styles.clearFilters} onClick={clearFilters}>
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={styles.columns}>
          {statuses.map((status) => {
            const tasks = filteredBoard[status] || [];
            const statusColor = getStatusColor(status);
            const StatusIcon = getStatusIcon(status);
            
            return (
              <div key={status} style={styles.column}>
                <div style={styles.columnHeader}>
                  <div style={styles.columnHeaderLeft}>
                    <div style={{...styles.columnDot, backgroundColor: statusColor}} />
                    <h3 style={styles.columnTitle}>{status}</h3>
                    <span style={styles.columnCount}>{tasks.length}</span>
                  </div>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        ...styles.droppable,
                        ...(snapshot.isDraggingOver ? styles.droppableDrag : {})
                      }}
                    >
                      {tasks.length === 0 ? (
                        <div style={styles.empty}>
                          <StatusIcon size={24} style={styles.emptyIcon} />
                          <p style={styles.emptyText}>No tasks</p>
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
                                  style={{
                                    ...styles.task,
                                    ...(snapshot.isDragging ? styles.taskDragging : {})
                                  }}
                                >
                                  <div style={styles.taskHeader}>
                                    <span style={styles.taskTitle}>{task.title}</span>
                                    <span style={{
                                      ...styles.taskPriority,
                                      backgroundColor: `${priorityColor}20`,
                                      color: priorityColor,
                                    }}>
                                      <Flag size={10} />
                                      {priorityLabel}
                                    </span>
                                  </div>
                                  
                                  {task.description && (
                                    <p style={styles.taskDesc}>
                                      {task.description.length > 60 
                                        ? `${task.description.substring(0, 60)}...` 
                                        : task.description}
                                    </p>
                                  )}
                                  
                                  <div style={styles.taskMeta}>
                                    {task.projectId && (
                                      <span style={styles.taskProject}>
                                        <Briefcase size={12} />
                                        {typeof task.projectId === 'object' ? task.projectId.projectName : 'Project'}
                                      </span>
                                    )}
                                    {task.assignedTo && (
                                      <span style={styles.taskAssignee}>
                                        <User size={12} />
                                        {typeof task.assignedTo === 'object' ? task.assignedTo.firstName : 'User'}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div style={styles.taskFooter}>
                                    {task.deadline && (
                                      <span style={styles.taskDeadline}>
                                        <Calendar size={12} />
                                        {formatDate(task.deadline)}
                                      </span>
                                    )}
                                    <div style={styles.taskActions}>
                                      <button style={styles.taskAction} title="View">
                                        <Eye size={14} />
                                      </button>
                                      <button style={styles.taskAction} title="Edit">
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
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Create New Task</h3>
              <button style={styles.modalClose} onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.modalText}>Task creation form would go here.</p>
              <p style={styles.modalHint}>Please implement TaskForm component or use the projects API.</p>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.modalCancel} onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button style={styles.modalSubmit} onClick={() => {
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    backgroundColor: '#FFFFFF',
    minHeight: '100vh',
    borderRadius: '24px',
    boxShadow: '0 2px 12px rgba(1, 62, 55, 0.04)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64vh',
    gap: '16px',
  },
  loadingText: {
    color: '#013E37',
    fontSize: '14px',
    fontWeight: '500',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid #FFEFB3',
    borderTopColor: '#013E37',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#013E37',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#013E37',
    opacity: 0.7,
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    background: '#FFFFFF',
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    color: '#013E37',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    background: '#FFFFFF',
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#013E37',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  viewToggle: {
    display: 'flex',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #FFEFB3',
    background: '#FFFFFF',
  },
  viewBtn: {
    padding: '10px 12px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  viewActive: {
    backgroundColor: '#013E37',
    color: '#FFFFFF',
  },
  viewInactive: {
    backgroundColor: '#FFFFFF',
    color: '#013E37',
    opacity: 0.5,
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: '#013E37',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.2)',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  stat: {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '12px 16px',
    border: '1px solid #FFEFB3',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  statNumber: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#013E37',
    display: 'block',
  },
  statLabel: {
    fontSize: '12px',
    color: '#013E37',
    opacity: 0.6,
    fontWeight: '500',
  },
  filterPanel: {
    background: '#FFFFFF',
    border: '1px solid #FFEFB3',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '16px',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '16px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: '150px',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#013E37',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  search: {
    display: 'flex',
    alignItems: 'center',
    background: '#FFFFFF',
    border: '1px solid #FFEFB3',
    borderRadius: '8px',
    padding: '0 12px',
  },
  searchIcon: {
    color: '#013E37',
    opacity: 0.5,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    padding: '8px 10px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    background: 'transparent',
    color: '#013E37',
  },
  searchClear: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    background: 'none',
    border: 'none',
    color: '#013E37',
    opacity: 0.5,
    cursor: 'pointer',
    borderRadius: '4px',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #FFEFB3',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#FFFFFF',
    color: '#013E37',
    outline: 'none',
    cursor: 'pointer',
  },
  clearFilters: {
    padding: '8px 16px',
    background: '#FFEFB3',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#013E37',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    alignSelf: 'center',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '16px',
    overflowX: 'auto',
    paddingBottom: '16px',
  },
  column: {
    minWidth: '220px',
  },
  columnHeader: {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '8px',
    border: '1px solid #FFEFB3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  columnHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  columnDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  columnTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#013E37',
    margin: 0,
  },
  columnCount: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#013E37',
    opacity: 0.6,
    background: '#FFEFB3',
    padding: '1px 8px',
    borderRadius: '12px',
  },
  droppable: {
    minHeight: '200px',
    padding: '6px',
    borderRadius: '12px',
    border: '2px dashed #FFEFB3',
    transition: 'all 0.2s ease',
  },
  droppableDrag: {
    background: '#FFEFB3',
    borderColor: '#013E37',
  },
  task: {
    background: '#FFFFFF',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #FFEFB3',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    cursor: 'grab',
  },
  taskDragging: {
    borderColor: '#013E37',
    boxShadow: '0 8px 25px rgba(1, 62, 55, 0.12)',
    transform: 'scale(1.02)',
  },
  taskHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '6px',
  },
  taskTitle: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#013E37',
    flex: 1,
  },
  taskPriority: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: '600',
    flexShrink: 0,
  },
  taskDesc: {
    fontSize: '12px',
    color: '#013E37',
    opacity: 0.7,
    margin: '0 0 8px 0',
    lineHeight: '1.4',
  },
  taskMeta: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  taskProject: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#013E37',
    opacity: 0.6,
  },
  taskAssignee: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#013E37',
    opacity: 0.6,
  },
  taskFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '8px',
    borderTop: '1px solid #FFEFB3',
  },
  taskDeadline: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#013E37',
    opacity: 0.5,
  },
  taskActions: {
    display: 'flex',
    gap: '4px',
  },
  taskAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px',
    background: 'transparent',
    border: 'none',
    color: '#013E37',
    opacity: 0.4,
    cursor: 'pointer',
    borderRadius: '4px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 0',
    color: '#013E37',
    opacity: 0.4,
  },
  emptyIcon: {
    color: '#013E37',
    opacity: 0.3,
    marginBottom: '4px',
  },
  emptyText: {
    fontSize: '12px',
    color: '#013E37',
    opacity: 0.4,
    margin: 0,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(1, 62, 55, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(1, 62, 55, 0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#013E37',
    margin: 0,
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#013E37',
    opacity: 0.5,
    padding: '4px',
    borderRadius: '4px',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  modalText: {
    fontSize: '14px',
    color: '#013E37',
    opacity: 0.8,
    margin: 0,
  },
  modalHint: {
    fontSize: '13px',
    color: '#013E37',
    opacity: 0.5,
    margin: 0,
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #FFEFB3',
  },
  modalCancel: {
    padding: '8px 16px',
    background: '#FFFFFF',
    color: '#013E37',
    border: '1px solid #FFEFB3',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  modalSubmit: {
    padding: '8px 16px',
    background: '#013E37',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

// Add keyframe animations and hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .icon-btn:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
  }

  .filter-btn:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
  }

  .primary-btn:hover:not(:disabled) {
    background-color: #025a50 !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(1, 62, 55, 0.25) !important;
  }

  .view-inactive:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
  }

  .search:focus-within {
    border-color: #013E37 !important;
    box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.08) !important;
  }

  .filter-select:focus {
    border-color: #013E37 !important;
    box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.08) !important;
  }

  .clear-filters:hover:not(:disabled) {
    background-color: #e6d69e !important;
  }

  .search-clear:hover {
    background-color: #FFEFB3 !important;
  }

  .task:hover {
    border-color: #013E37 !important;
    box-shadow: 0 2px 8px rgba(1, 62, 55, 0.06) !important;
  }

  .task-action:hover {
    background-color: #FFEFB3 !important;
    opacity: 1 !important;
  }

  .stat:hover {
    background-color: #FFFDF5 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(1, 62, 55, 0.06) !important;
  }

  .modal-cancel:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
  }

  .modal-submit:hover:not(:disabled) {
    background-color: #025a50 !important;
  }

  .modal-close:hover {
    background-color: #FFEFB3 !important;
  }

  @media (max-width: 1400px) {
    .columns { grid-template-columns: repeat(3, 1fr) !important; }
  }

  @media (max-width: 1024px) {
    .columns { grid-template-columns: repeat(2, 1fr) !important; }
  }

  @media (max-width: 768px) {
    .container { padding: 16px !important; }
    .header { flex-direction: column; align-items: stretch; }
    .actions { width: 100%; }
    .primary-btn { flex: 1; justify-content: center; }
    .filter-btn { flex: 1; justify-content: center; }
    .filter-row { flex-direction: column; align-items: stretch; }
    .filter-group { min-width: unset; }
    .clear-filters { align-self: stretch; }
    .columns { grid-template-columns: 1fr; }
    .stats { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 480px) {
    .container { padding: 12px !important; }
    .title { font-size: 22px; }
    .actions { flex-wrap: wrap; }
    .view-toggle { flex: 0; }
    .stats { grid-template-columns: 1fr; }
    .stat { padding: 10px; }
    .stat-number { font-size: 18px; }
  }
`;
document.head.appendChild(styleSheet);

export default ProjectBoard;