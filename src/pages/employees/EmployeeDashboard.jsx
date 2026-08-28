// pages/employees/EmployeeDashboard.jsx - COMPLETE FIXED VERSION

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, Clock, AlertCircle, 
  Calendar, Briefcase 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EmployeeDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching task stats for employee:', user?._id);

      // ✅ Fetch task statistics
      const statsResponse = await axios.get(`${API_URL}/tasks/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 Stats response:', statsResponse.data);

      if (statsResponse.data?.data) {
        setStats(statsResponse.data.data);
      } else {
        // Fallback: calculate stats from tasks
        const tasksResponse = await axios.get(`${API_URL}/tasks`, {
          params: {
            assignedToMe: 'true',
            limit: 100
          },
          headers: { Authorization: `Bearer ${token}` }
        });

        let tasksData = [];
        if (tasksResponse.data?.data && Array.isArray(tasksResponse.data.data)) {
          tasksData = tasksResponse.data.data;
        }

        // Calculate stats manually
        const calculatedStats = {
          total: tasksData.length,
          completed: tasksData.filter(t => t.status === 'Completed').length,
          inProgress: tasksData.filter(t => t.status === 'In Progress').length,
          backlog: tasksData.filter(t => t.status === 'Backlog').length,
          internalQA: tasksData.filter(t => t.status === 'Internal QA').length,
          clientReview: tasksData.filter(t => t.status === 'Client Review').length,
          approved: tasksData.filter(t => t.status === 'Approved').length,
          overdue: tasksData.filter(t => {
            if (!t.deadline || t.status === 'Completed') return false;
            return new Date(t.deadline) < new Date();
          }).length,
          upcomingDeadlines: tasksData.filter(t => {
            if (!t.deadline || t.status === 'Completed') return false;
            const now = new Date();
            const deadline = new Date(t.deadline);
            const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
            return diffDays <= 3 && diffDays >= 0;
          }).length
        };

        setStats(calculatedStats);
        setRecentTasks(tasksData.slice(0, 5));
      }

      // ✅ Fetch recent tasks (assigned to employee)
      const tasksResponse = await axios.get(`${API_URL}/tasks`, {
        params: {
          assignedToMe: 'true',
          limit: 5,
          page: 1
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📋 Recent tasks response:', tasksResponse.data);

      if (tasksResponse.data?.data) {
        setRecentTasks(tasksResponse.data.data);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ✅ Inject styles only once
  useEffect(() => {
    const styleId = 'employee-dashboard-styles';
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement('style');
      styleSheet.id = styleId;
      styleSheet.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .employee-dashboard .task-item:hover {
          background-color: #F9FAFB !important;
        }
        
        .employee-dashboard .view-all-link:hover {
          text-decoration: underline !important;
        }
        
        .employee-dashboard .retry-button:hover {
          background-color: #2563EB !important;
        }
        
        @media (max-width: 768px) {
          .employee-dashboard .welcome-section {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .employee-dashboard .stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .employee-dashboard .quick-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .employee-dashboard .task-item {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .employee-dashboard .task-right {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
        }
        
        @media (max-width: 480px) {
          .employee-dashboard .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .employee-dashboard .quick-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Completed': '#10B981',
      'In Progress': '#3B82F6',
      'Internal QA': '#8B5CF6',
      'Client Review': '#F59E0B',
      'Approved': '#06B6D4',
      'Backlog': '#6B7280'
    };
    return colors[status] || '#6B7280';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'Urgent': '🔴 Urgent',
      'High': '🟠 High',
      'Medium': '🟡 Medium',
      'Low': '🟢 Low'
    };
    return labels[priority] || 'Medium';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={48} style={{ color: '#EF4444' }} />
        <h2 style={styles.errorTitle}>Something went wrong</h2>
        <p style={styles.errorMessage}>{error}</p>
        <button 
          onClick={handleRetry} 
          style={styles.retryButton}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="employee-dashboard" style={styles.container}>
      {/* Welcome Section */}
      <div className="welcome-section" style={styles.welcomeSection}>
        <div>
          <h1 style={styles.welcomeTitle}>
            Welcome back, {user?.firstName || 'Employee'}! 👋
          </h1>
          <p style={styles.welcomeSubtitle}>
            Here's an overview of your tasks and performance
          </p>
        </div>
        <div style={styles.dateBadge}>
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTop: '4px solid #3B82F6'}}>
          <div style={styles.statHeader}>
            <Briefcase size={20} style={{ color: '#3B82F6' }} />
            <span style={styles.statLabel}>Total Tasks</span>
          </div>
          <div style={styles.statValue}>{stats?.total || 0}</div>
        </div>

        <div style={{...styles.statCard, borderTop: '4px solid #10B981'}}>
          <div style={styles.statHeader}>
            <CheckCircle size={20} style={{ color: '#10B981' }} />
            <span style={styles.statLabel}>Completed</span>
          </div>
          <div style={styles.statValue}>{stats?.completed || 0}</div>
        </div>

        <div style={{...styles.statCard, borderTop: '4px solid #F59E0B'}}>
          <div style={styles.statHeader}>
            <Clock size={20} style={{ color: '#F59E0B' }} />
            <span style={styles.statLabel}>In Progress</span>
          </div>
          <div style={styles.statValue}>{stats?.inProgress || 0}</div>
        </div>

        <div style={{...styles.statCard, borderTop: '4px solid #EF4444'}}>
          <div style={styles.statHeader}>
            <AlertCircle size={20} style={{ color: '#EF4444' }} />
            <span style={styles.statLabel}>Overdue</span>
          </div>
          <div style={styles.statValue}>{stats?.overdue || 0}</div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="quick-stats-grid" style={styles.quickStatsGrid}>
        <div style={styles.quickStat}>
          <span style={styles.quickStatLabel}>Backlog</span>
          <span style={styles.quickStatValue}>{stats?.backlog || 0}</span>
        </div>
        <div style={styles.quickStat}>
          <span style={styles.quickStatLabel}>Internal QA</span>
          <span style={styles.quickStatValue}>{stats?.internalQA || 0}</span>
        </div>
        <div style={styles.quickStat}>
          <span style={styles.quickStatLabel}>Client Review</span>
          <span style={styles.quickStatValue}>{stats?.clientReview || 0}</span>
        </div>
        <div style={styles.quickStat}>
          <span style={styles.quickStatLabel}>Approved</span>
          <span style={styles.quickStatValue}>{stats?.approved || 0}</span>
        </div>
        <div style={styles.quickStat}>
          <span style={styles.quickStatLabel}>Upcoming Deadlines</span>
          <span style={styles.quickStatValue}>{stats?.upcomingDeadlines || 0}</span>
        </div>
      </div>

      {/* Recent Tasks */}
      <div style={styles.recentTasksSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Tasks</h2>
          <Link to="/projects/tasks?assignedToMe=true" className="view-all-link" style={styles.viewAllLink}>
            View All Tasks →
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No tasks assigned to you yet.</p>
          </div>
        ) : (
          <div style={styles.taskList}>
            {recentTasks.map((task) => (
              <Link 
                to={`/tasks/${task._id}`} 
                key={task._id} 
                className="task-item"
                style={styles.taskItem}
              >
                <div style={styles.taskLeft}>
                  <div style={{
                    ...styles.taskStatusDot,
                    backgroundColor: getStatusColor(task.status)
                  }} />
                  <div>
                    <div style={styles.taskTitle}>{task.title}</div>
                    <div style={styles.taskMeta}>
                      <span style={styles.taskProject}>
                        {task.projectId?.projectName || 'No Project'}
                      </span>
                      <span style={styles.taskPriority}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="task-right" style={styles.taskRight}>
                  <span style={styles.taskStatus}>{task.status || 'Backlog'}</span>
                  {task.deadline && (
                    <span style={styles.taskDeadline}>
                      Due: {formatDate(task.deadline)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { 
    padding: '24px', 
    maxWidth: '1400px', 
    margin: '0 auto' 
  },
  loadingContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '64vh', 
    gap: '16px' 
  },
  spinner: { 
    width: '40px', 
    height: '40px', 
    borderRadius: '50%', 
    border: '3px solid #E5E7EB', 
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite' 
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64vh',
    gap: '16px',
    padding: '20px',
    textAlign: 'center'
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: '8px 0'
  },
  errorMessage: {
    fontSize: '16px',
    color: '#6B7280',
    maxWidth: '400px'
  },
  retryButton: {
    padding: '10px 24px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  welcomeSection: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '32px', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  welcomeTitle: { 
    fontSize: '28px', 
    fontWeight: '700', 
    color: '#111827', 
    margin: 0 
  },
  welcomeSubtitle: { 
    fontSize: '16px', 
    color: '#6B7280', 
    margin: '4px 0 0 0' 
  },
  dateBadge: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '8px 16px', 
    backgroundColor: '#F3F4F6', 
    borderRadius: '8px', 
    fontSize: '14px', 
    color: '#374151' 
  },
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
    gap: '16px', 
    marginBottom: '24px' 
  },
  statCard: { 
    backgroundColor: '#FFFFFF', 
    padding: '20px', 
    borderRadius: '12px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
  },
  statHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginBottom: '8px' 
  },
  statLabel: { 
    fontSize: '14px', 
    color: '#6B7280' 
  },
  statValue: { 
    fontSize: '32px', 
    fontWeight: '700', 
    color: '#111827' 
  },
  quickStatsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
    gap: '12px', 
    marginBottom: '32px' 
  },
  quickStat: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '12px 16px', 
    backgroundColor: '#F9FAFB', 
    borderRadius: '8px' 
  },
  quickStatLabel: { 
    fontSize: '14px', 
    color: '#6B7280' 
  },
  quickStatValue: { 
    fontSize: '18px', 
    fontWeight: '600', 
    color: '#111827' 
  },
  recentTasksSection: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: '12px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
    overflow: 'hidden' 
  },
  sectionHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '16px 20px', 
    borderBottom: '1px solid #F3F4F6' 
  },
  sectionTitle: { 
    fontSize: '18px', 
    fontWeight: '600', 
    color: '#111827', 
    margin: 0 
  },
  viewAllLink: { 
    fontSize: '14px', 
    color: '#3B82F6', 
    textDecoration: 'none' 
  },
  emptyState: { 
    padding: '40px 20px', 
    textAlign: 'center', 
    color: '#6B7280' 
  },
  taskList: { 
    padding: '8px 0' 
  },
  taskItem: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '12px 20px', 
    borderBottom: '1px solid #F3F4F6', 
    textDecoration: 'none', 
    transition: 'background-color 0.2s',
    cursor: 'pointer'
  },
  taskLeft: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    flex: 1 
  },
  taskStatusDot: { 
    width: '8px', 
    height: '8px', 
    borderRadius: '50%', 
    flexShrink: 0 
  },
  taskTitle: { 
    fontSize: '14px', 
    fontWeight: '500', 
    color: '#111827' 
  },
  taskMeta: { 
    display: 'flex', 
    gap: '12px', 
    marginTop: '2px' 
  },
  taskProject: { 
    fontSize: '12px', 
    color: '#6B7280' 
  },
  taskPriority: { 
    fontSize: '12px', 
    color: '#6B7280' 
  },
  taskRight: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'flex-end', 
    gap: '4px', 
    flexShrink: 0 
  },
  taskStatus: { 
    fontSize: '12px', 
    padding: '2px 8px', 
    borderRadius: '9999px', 
    backgroundColor: '#F3F4F6', 
    color: '#374151' 
  },
  taskDeadline: { 
    fontSize: '12px', 
    color: '#6B7280' 
  }
};

export default EmployeeDashboard;