// components/projects/TaskBoard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, User, Calendar } from 'lucide-react';
import Modal from '../common/Modal';
import TaskForm from './TaskForm';
import axios from 'axios';
import toast from 'react-hot-toast';

const TaskBoard = ({ projectId }) => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupedTasks, setGroupedTasks] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  useEffect(() => {
    const statuses = ['Backlog', 'In Progress', 'Internal QA', 'Client Review', 'Approved', 'Completed'];
    const grouped = {};
    statuses.forEach(status => {
      grouped[status] = tasks.filter(t => t.status === status);
    });
    setGroupedTasks(grouped);
  }, [tasks]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (projectId) {
        params.projectId = projectId;
      }

      const response = await axios.get(`${API_URL}/tasks`, {
        params: params,
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Tasks response:', response.data);

      let tasksData = [];
      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          tasksData = response.data.data;
        } else if (Array.isArray(response.data)) {
          tasksData = response.data;
        } else if (response.data.tasks && Array.isArray(response.data.tasks)) {
          tasksData = response.data.tasks;
        }
      }
      setTasks(tasksData);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load tasks';
      toast.error(errorMsg);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    setActionLoading(true);
    const previousTasks = [...tasks];
    const updatedTasks = tasks.map(task => {
      if (task._id === draggableId) {
        return { ...task, status: destination.droppableId };
      }
      return task;
    });
    setTasks(updatedTasks);

    try {
      await axios.put(`${API_URL}/tasks/${draggableId}`, 
        { status: destination.droppableId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Task moved successfully');
      await fetchTasks();
    } catch (err) {
      setTasks(previousTasks);
      toast.error('Failed to move task');
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

  const getStatusColor = (status) => {
    const colors = {
      'Backlog': '#6B7280',
      'In Progress': '#3B82F6',
      'Internal QA': '#8B5CF6',
      'Client Review': '#F59E0B',
      'Approved': '#14B8A6',
      'Completed': '#22C55E'
    };
    return colors[status] || '#6B7280';
  };

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (deadline, status) => {
    if (!deadline) return false;
    if (status === 'Completed' || status === 'Approved') return false;
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading tasks...</p>
      </div>
    );
  }

  const statuses = ['Backlog', 'In Progress', 'Internal QA', 'Client Review', 'Approved', 'Completed'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.headerTitle}>Task Board</h3>
          <span style={styles.taskCount}>{tasks.length} tasks</span>
        </div>
        <button style={styles.addButton} onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={styles.boardContainer}>
          {statuses.map((status) => (
            <div key={status} style={styles.column}>
              <div style={styles.columnHeader}>
                <div style={styles.columnHeaderLeft}>
                  <span style={{ ...styles.statusDot, backgroundColor: getStatusColor(status) }} />
                  <h4 style={styles.columnTitle}>{status}</h4>
                </div>
                <span style={styles.columnCount}>{groupedTasks[status]?.length || 0}</span>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      ...styles.droppableArea,
                      backgroundColor: snapshot.isDraggingOver ? '#F1F5F9' : 'transparent',
                      minHeight: groupedTasks[status]?.length > 0 ? 'auto' : '100px',
                    }}
                  >
                    {(groupedTasks[status] || []).map((task, index) => (
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
                              ...styles.taskCard,
                              ...provided.draggableProps.style,
                              borderLeftColor: getPriorityColor(task.priority),
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <div style={styles.taskContent}>
                              <p style={styles.taskTitle}>{task.title}</p>
                              <span style={{
                                ...styles.priorityBadge,
                                backgroundColor: getPriorityColor(task.priority) + '20',
                                color: getPriorityColor(task.priority),
                              }}>
                                {task.priority || 'Medium'}
                              </span>
                            </div>
                            
                            <div style={styles.taskMeta}>
                              <span style={styles.taskAssignee}>
                                <User size={12} />
                                {task.assignedTo ? 
                                  `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 
                                  'Unassigned'
                                }
                              </span>
                              <span style={{
                                ...styles.taskDeadline,
                                color: isOverdue(task.deadline || task.dueDate, task.status) ? '#DC2626' : '#6B7280'
                              }}>
                                <Calendar size={12} />
                                {formatDate(task.deadline || task.dueDate)}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {(!groupedTasks[status] || groupedTasks[status].length === 0) && (
                      <div style={styles.emptyState}>
                        <p>No tasks</p>
                        <p style={styles.emptyStateSub}>Drop tasks here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

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
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '4px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0',
    gap: '16px',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: '14px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  taskCount: {
    fontSize: '13px',
    color: '#6B7280',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  boardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '16px',
    overflowX: 'auto',
    paddingBottom: '8px',
    minHeight: '400px',
  },
  column: {
    minWidth: '220px',
    display: 'flex',
    flexDirection: 'column',
  },
  columnHeader: {
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #E2E8F0',
  },
  columnHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  columnTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0F172A',
    margin: 0,
  },
  columnCount: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748B',
    backgroundColor: '#E2E8F0',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  droppableArea: {
    minHeight: '120px',
    padding: '4px',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease',
    border: '1px dashed transparent',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    borderLeftWidth: '4px',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    cursor: 'grab',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  taskContent: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px',
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#0F172A',
    margin: 0,
    flex: 1,
    wordBreak: 'break-word',
  },
  priorityBadge: {
    display: 'inline-flex',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '600',
    flexShrink: 0,
    marginTop: '2px',
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
    gap: '8px',
    flexWrap: 'wrap',
  },
  taskAssignee: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#64748B',
  },
  taskDeadline: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#64748B',
  },
  emptyState: {
    textAlign: 'center',
    padding: '24px 0',
    color: '#94A3B8',
  },
  emptyStateSub: {
    fontSize: '12px',
    color: '#CBD5E1',
    margin: '4px 0 0 0',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .add-button:hover:not(:disabled) { background-color: #2563EB !important; }
  .task-card:hover {
    border-color: #94A3B8 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  }
  .task-card:active { cursor: grabbing !important; }
  .board-container::-webkit-scrollbar { height: 6px; }
  .board-container::-webkit-scrollbar-track { background: #F1F5F9; border-radius: 3px; }
  .board-container::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
  .board-container::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

  @media (max-width: 1400px) { .board-container { grid-template-columns: repeat(3, 1fr) !important; } }
  @media (max-width: 1024px) { .board-container { grid-template-columns: repeat(2, 1fr) !important; } }
  @media (max-width: 768px) {
    .container { padding: 0 !important; }
    .board-container { grid-template-columns: 1fr !important; overflow-x: visible !important; }
    .column { min-width: 100% !important; }
    .header { flex-direction: column !important; align-items: stretch !important; }
    .add-button { width: 100% !important; justify-content: center !important; }
  }
  @media (max-width: 480px) {
    .task-card { padding: 10px 12px !important; }
    .task-title { font-size: 13px !important; }
    .column-header { padding: 8px 12px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default TaskBoard;