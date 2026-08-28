// components/projects/GanttChart.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  ChevronDown, 
  ChevronRight,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  Filter,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const GanttChart = ({ projectId }) => {
  const { token } = useAuth();
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [viewMode, setViewMode] = useState('week');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const chartRef = useRef(null);

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/projects/tasks`, {
        params: { projectId, limit: 200 },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        const tasksWithChildren = buildTaskTree(response.data.data || []);
        setTasks(tasksWithChildren);
        calculateDateRange(tasksWithChildren);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      let errorMessage = 'Failed to load tasks for Gantt chart.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view these tasks.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const buildTaskTree = (taskList) => {
    const taskMap = {};
    const rootTasks = [];

    // Build map
    taskList.forEach(task => {
      taskMap[task._id] = {
        ...task,
        children: [],
        expanded: false,
        level: 0
      };
    });

    // Build tree
    taskList.forEach(task => {
      if (task.parentTaskId && taskMap[task.parentTaskId]) {
        taskMap[task.parentTaskId].children.push(taskMap[task._id]);
        taskMap[task._id].level = taskMap[task.parentTaskId].level + 1;
      } else {
        rootTasks.push(taskMap[task._id]);
      }
    });

    return rootTasks;
  };

  const calculateDateRange = (taskTree) => {
    let minDate = Infinity;
    let maxDate = -Infinity;

    const traverse = (task) => {
      const start = task.startDate ? new Date(task.startDate).getTime() : new Date().getTime();
      const end = task.deadline ? new Date(task.deadline).getTime() : new Date().getTime();
      
      minDate = Math.min(minDate, start);
      maxDate = Math.max(maxDate, end);
      
      task.children.forEach(traverse);
    };

    taskTree.forEach(traverse);

    if (minDate === Infinity) {
      const now = new Date();
      minDate = now.getTime();
      maxDate = now.getTime() + 30 * 24 * 60 * 60 * 1000;
    }

    setDateRange({
      start: new Date(minDate),
      end: new Date(maxDate)
    });
  };

  const toggleTask = (taskId) => {
    setExpandedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Urgent': 'bg-red-100 text-red-800',
      'High': 'bg-orange-100 text-orange-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      'Urgent': { backgroundColor: '#fee2e2', color: '#991b1b' },
      'High': { backgroundColor: '#ffedd5', color: '#9a3412' },
      'Medium': { backgroundColor: '#fef3c7', color: '#92400e' },
      'Low': { backgroundColor: '#d1fae5', color: '#065f46' }
    };
    return styles[priority] || { backgroundColor: '#f3f4f6', color: '#374151' };
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Backlog': 'bg-gray-100 text-gray-800',
      'Internal QA': 'bg-purple-100 text-purple-800',
      'Client Review': 'bg-orange-100 text-orange-800',
      'Approved': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Completed': { backgroundColor: '#d1fae5', color: '#065f46' },
      'In Progress': { backgroundColor: '#dbeafe', color: '#1e40af' },
      'Backlog': { backgroundColor: '#f3f4f6', color: '#374151' },
      'Internal QA': { backgroundColor: '#ede9fe', color: '#5b21b6' },
      'Client Review': { backgroundColor: '#ffedd5', color: '#9a3412' },
      'Approved': { backgroundColor: '#d1fae5', color: '#065f46' }
    };
    return styles[status] || styles.Backlog;
  };

  const getProgressWidth = (task) => {
    if (task.status === 'Completed') return 100;
    if (task.status === 'Approved') return 90;
    if (task.status === 'Client Review') return 80;
    if (task.status === 'Internal QA') return 70;
    if (task.status === 'In Progress') return 50;
    return 10;
  };

  const getBarColor = (status) => {
    const colors = {
      'Completed': 'bg-green-500',
      'In Progress': 'bg-blue-500',
      'Internal QA': 'bg-purple-500',
      'Client Review': 'bg-orange-500',
      'Approved': 'bg-green-400',
      'Backlog': 'bg-gray-300'
    };
    return colors[status] || 'bg-gray-300';
  };

  const getBarColorStyle = (status) => {
    const styles = {
      'Completed': { backgroundColor: '#22C55E' },
      'In Progress': { backgroundColor: '#3B82F6' },
      'Internal QA': { backgroundColor: '#8B5CF6' },
      'Client Review': { backgroundColor: '#F59E0B' },
      'Approved': { backgroundColor: '#34D399' },
      'Backlog': { backgroundColor: '#D1D5DB' }
    };
    return styles[status] || styles.Backlog;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysBetween = (start, end) => {
    const startDate = new Date(start || new Date());
    const endDate = new Date(end || new Date());
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  };

  const getBarPosition = (task) => {
    if (!dateRange.start || !dateRange.end) return { left: 0, width: 0 };

    const taskStart = task.startDate ? new Date(task.startDate) : new Date();
    const taskEnd = task.deadline ? new Date(task.deadline) : new Date();
    
    const totalDays = getDaysBetween(dateRange.start, dateRange.end);
    const startOffset = getDaysBetween(dateRange.start, taskStart);
    const duration = getDaysBetween(taskStart, taskEnd) || 1;

    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return {
      left: Math.min(Math.max(left, 0), 95),
      width: Math.min(Math.max(width, 2), 95)
    };
  };

  const renderTask = (task, level = 0) => {
    const hasChildren = task.children && task.children.length > 0;
    const isExpanded = expandedTasks.includes(task._id);
    const progress = getProgressWidth(task);
    const barPosition = getBarPosition(task);
    const barColor = getBarColorStyle(task.status);

    return (
      <div key={task._id} style={styles.taskRow}>
        {/* Task Info - Fixed width */}
        <div style={styles.taskInfo}>
          <div style={styles.taskInfoContent}>
            {hasChildren && (
              <button
                style={styles.expandButton}
                onClick={() => toggleTask(task._id)}
              >
                {isExpanded ? (
                  <ChevronDown style={styles.expandIcon} />
                ) : (
                  <ChevronRight style={styles.expandIcon} />
                )}
              </button>
            )}
            <span 
              style={{
                ...styles.taskTitle,
                ...(!hasChildren ? styles.taskTitleNoChildren : {}),
                paddingLeft: `${level * 16}px`
              }}
            >
              {task.title}
            </span>
          </div>
          <div style={styles.taskBadges}>
            <span style={{
              ...styles.badge,
              ...getPriorityStyle(task.priority)
            }}>
              {task.priority || 'Medium'}
            </span>
            <span style={{
              ...styles.badge,
              ...getStatusStyle(task.status)
            }}>
              {task.status || 'Backlog'}
            </span>
          </div>
        </div>

        {/* Gantt Bar Area - Flexible */}
        <div style={styles.ganttArea}>
          <div style={styles.ganttBarContainer}>
            {/* Date markers - subtle grid */}
            <div style={styles.ganttGrid}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={styles.ganttGridCell} />
              ))}
            </div>

            {/* Task Bar */}
            <div 
              style={{
                ...styles.ganttBar,
                ...barColor,
                left: `${barPosition.left}%`,
                width: `${Math.max(barPosition.width, 2)}%`,
                opacity: task.status === 'Completed' ? 0.8 : 1
              }}
            >
              <div style={styles.ganttBarContent}>
                {task.status !== 'Backlog' && (
                  <span>
                    {progress}% • {formatDate(task.startDate)} - {formatDate(task.deadline)}
                  </span>
                )}
              </div>
            </div>

            {/* Progress indicator */}
            {task.status !== 'Completed' && task.status !== 'Backlog' && (
              <div 
                style={{
                  ...styles.progressIndicator,
                  left: `${barPosition.left}%`,
                  width: `${(barPosition.width * (progress / 100))}%`
                }}
              />
            )}
          </div>

          {/* Date labels */}
          <div style={styles.dateLabels}>
            <span>{formatDate(dateRange.start)}</span>
            <span>{formatDate(dateRange.end)}</span>
          </div>
        </div>

        {/* Stats - Compact */}
        <div style={styles.statsArea}>
          <div>{task.estimatedHours || 0}h / {task.actualHours || 0}h</div>
          {task.assignee && (
            <div style={styles.assigneeInitials}>
              {task.assignee.firstName?.[0]}{task.assignee.lastName?.[0]}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Calendar style={styles.headerIcon} />
          <span style={styles.headerTitle}>Gantt Chart</span>
          <span style={styles.headerBadge}>
            {tasks.reduce((acc, t) => acc + countTasks(t), 0)} tasks
          </span>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.viewToggle}>
            <button
              style={{
                ...styles.viewButton,
                ...(viewMode === 'day' ? styles.viewButtonActive : styles.viewButtonInactive)
              }}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
            <button
              style={{
                ...styles.viewButton,
                ...(viewMode === 'week' ? styles.viewButtonActive : styles.viewButtonInactive)
              }}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button
              style={{
                ...styles.viewButton,
                ...(viewMode === 'month' ? styles.viewButtonActive : styles.viewButtonInactive)
              }}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>
          <button style={styles.zoomButton} onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}>
            <ZoomIn style={styles.iconSmall} />
          </button>
          <button style={styles.zoomButton} onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))}>
            <ZoomOut style={styles.iconSmall} />
          </button>
          <button style={styles.zoomButton}>
            <Download style={styles.iconSmall} />
          </button>
        </div>
      </div>

      <div style={{...styles.chartContent, zoom: zoomLevel}} ref={chartRef}>
        {/* Header */}
        <div style={styles.chartHeader}>
          <div style={styles.headerTask}>Task</div>
          <div style={styles.headerTimeline}>Timeline</div>
          <div style={styles.headerHours}>Hours</div>
        </div>

        {/* Tasks */}
        <div style={styles.tasksContainer}>
          {tasks.map(task => renderTask(task))}
        </div>

        {tasks.length === 0 && (
          <div style={styles.emptyState}>
            <Calendar style={styles.emptyIcon} />
            <p style={styles.emptyText}>No tasks available for this project</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to count tasks including children
const countTasks = (task) => {
  let count = 1;
  task.children.forEach(child => {
    count += countTasks(child);
  });
  return count;
};

const styles = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
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
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #E5E7EB',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerIcon: {
    width: '20px',
    height: '20px',
    color: '#3B82F6',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  },
  headerBadge: {
    display: 'inline-flex',
    padding: '2px 8px',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
    marginLeft: '8px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  viewToggle: {
    display: 'flex',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #D1D5DB',
  },
  viewButton: {
    padding: '6px 12px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  viewButtonActive: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
  },
  viewButtonInactive: {
    backgroundColor: 'transparent',
    color: '#374151',
  },
  zoomButton: {
    padding: '6px 8px',
    backgroundColor: 'transparent',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSmall: {
    width: '16px',
    height: '16px',
    color: '#374151',
  },
  chartContent: {
    overflowX: 'auto',
    padding: '0',
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerTask: {
    flexShrink: 0,
    width: '300px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
  },
  headerTimeline: {
    flex: 1,
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  headerHours: {
    flexShrink: 0,
    width: '96px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'right',
  },
  tasksContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  taskRow: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #F3F4F6',
    minHeight: '48px',
    transition: 'background-color 0.2s ease',
  },
  taskInfo: {
    flexShrink: 0,
    width: '300px',
    padding: '8px 16px',
  },
  taskInfoContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  expandButton: {
    padding: '0',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  expandIcon: {
    width: '16px',
    height: '16px',
    color: '#6B7280',
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
  },
  taskTitleNoChildren: {
    marginLeft: '24px',
  },
  taskBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px',
    marginLeft: '24px',
  },
  badge: {
    display: 'inline-flex',
    padding: '2px 6px',
    borderRadius: '9999px',
    fontSize: '10px',
    fontWeight: '500',
  },
  ganttArea: {
    flex: 1,
    padding: '8px 16px',
    minHeight: '48px',
  },
  ganttBarContainer: {
    position: 'relative',
    width: '100%',
    height: '32px',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  ganttGrid: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
  },
  ganttGridCell: {
    flex: 1,
    borderRight: '1px solid #E5E7EB',
  },
  ganttBar: {
    position: 'absolute',
    height: '24px',
    borderRadius: '6px',
    top: '4px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ganttBarContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '500',
    padding: '0 8px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  progressIndicator: {
    position: 'absolute',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    bottom: '2px',
  },
  dateLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#9CA3AF',
    marginTop: '4px',
    padding: '0 4px',
  },
  statsArea: {
    flexShrink: 0,
    width: '96px',
    fontSize: '12px',
    color: '#6B7280',
    textAlign: 'right',
    padding: '8px 16px',
  },
  assigneeInitials: {
    fontSize: '10px',
    color: '#9CA3AF',
    marginTop: '2px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 16px',
    color: '#6B7280',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    color: '#D1D5DB',
    margin: '0 auto 12px',
  },
  emptyText: {
    color: '#6B7280',
  },
};

// Add keyframe and hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .task-row:hover {
    background-color: #F9FAFB !important;
  }
  
  .view-button-inactive:hover {
    background-color: #F9FAFB !important;
  }
  
  .zoom-button:hover {
    background-color: #F9FAFB !important;
  }
  
  .expand-button:hover {
    background-color: #F3F4F6 !important;
    border-radius: 4px !important;
  }
  
  @media (max-width: 1024px) {
    .task-info {
      width: 200px !important;
    }
    
    .header-task {
      width: 200px !important;
    }
    
    .stats-area {
      width: 64px !important;
    }
    
    .header-hours {
      width: 64px !important;
    }
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .header-right {
      justify-content: flex-start !important;
    }
    
    .task-info {
      width: 150px !important;
    }
    
    .header-task {
      width: 150px !important;
    }
    
    .task-title {
      font-size: 12px !important;
    }
    
    .task-badges {
      flex-wrap: wrap !important;
    }
  }
  
  @media (max-width: 480px) {
    .task-info {
      width: 120px !important;
    }
    
    .header-task {
      width: 120px !important;
    }
    
    .stats-area {
      width: 48px !important;
      font-size: 10px !important;
    }
    
    .header-hours {
      width: 48px !important;
      font-size: 12px !important;
    }
    
    .gantt-bar-content {
      font-size: 8px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default GanttChart;