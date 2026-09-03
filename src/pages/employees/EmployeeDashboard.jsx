// pages/employees/EmployeeDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, Clock, AlertCircle, 
  Calendar, Briefcase, Layers, 
  TrendingUp, Award, Target, Zap
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

      // Fetch task statistics
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

      // Fetch recent tasks (assigned to employee)
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

  const getStatusColor = (status) => {
    const colors = {
      'Completed': '#013E37',
      'In Progress': '#0A5C54',
      'Internal QA': '#1A7A6E',
      'Client Review': '#FFEFB3',
      'Approved': '#2A9A8A',
      'Backlog': '#6B7280'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      'Completed': '#E6F7EC',
      'In Progress': '#E8F0FE',
      'Internal QA': '#F0ECFA',
      'Client Review': '#FFF8E6',
      'Approved': '#E6F7F5',
      'Backlog': '#F3F4F6'
    };
    return colors[status] || '#F3F4F6';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      'Completed': '#013E37',
      'In Progress': '#0A5C54',
      'Internal QA': '#1A7A6E',
      'Client Review': '#013E37',
      'Approved': '#2A9A8A',
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
    return labels[priority] || '🟡 Medium';
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
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner"></div>
        <p className="dashboard-loading-text">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle className="dashboard-error-icon" size={48} />
        <h2 className="dashboard-error-title">Something went wrong</h2>
        <p className="dashboard-error-message">{error}</p>
        <button className="dashboard-retry-btn" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    );
  }

  // Calculate completion rate
  const completionRate = stats?.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <>
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div className="dashboard-welcome-left">
            <h1 className="dashboard-welcome-title">
              <Layers className="dashboard-welcome-icon" />
              Welcome back, {user?.firstName || 'Employee'}! 👋
            </h1>
            <p className="dashboard-welcome-subtitle">
              Here's an overview of your tasks and performance
            </p>
          </div>
          <div className="dashboard-date-badge">
            <Calendar className="dashboard-date-icon" />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card" style={{ borderTop: '4px solid #013E37' }}>
            <div className="dashboard-stat-content">
              <div>
                <p className="dashboard-stat-label">Total Tasks</p>
                <p className="dashboard-stat-value">{stats?.total || 0}</p>
              </div>
              <Briefcase className="dashboard-stat-icon" style={{ color: '#013E37' }} />
            </div>
          </div>

          <div className="dashboard-stat-card" style={{ borderTop: '4px solid #0A5C54' }}>
            <div className="dashboard-stat-content">
              <div>
                <p className="dashboard-stat-label">Completed</p>
                <p className="dashboard-stat-value">{stats?.completed || 0}</p>
              </div>
              <CheckCircle className="dashboard-stat-icon" style={{ color: '#0A5C54' }} />
            </div>
          </div>

          <div className="dashboard-stat-card" style={{ borderTop: '4px solid #FFEFB3' }}>
            <div className="dashboard-stat-content">
              <div>
                <p className="dashboard-stat-label">In Progress</p>
                <p className="dashboard-stat-value">{stats?.inProgress || 0}</p>
              </div>
              <Clock className="dashboard-stat-icon" style={{ color: '#013E37' }} />
            </div>
          </div>

          <div className="dashboard-stat-card" style={{ borderTop: '4px solid #EF4444' }}>
            <div className="dashboard-stat-content">
              <div>
                <p className="dashboard-stat-label">Overdue</p>
                <p className="dashboard-stat-value">{stats?.overdue || 0}</p>
              </div>
              <AlertCircle className="dashboard-stat-icon" style={{ color: '#EF4444' }} />
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="dashboard-quick-stats">
          <div className="dashboard-quick-stat">
            <span className="dashboard-quick-stat-label">Backlog</span>
            <span className="dashboard-quick-stat-value">{stats?.backlog || 0}</span>
          </div>
          <div className="dashboard-quick-stat">
            <span className="dashboard-quick-stat-label">Internal QA</span>
            <span className="dashboard-quick-stat-value">{stats?.internalQA || 0}</span>
          </div>
          <div className="dashboard-quick-stat">
            <span className="dashboard-quick-stat-label">Client Review</span>
            <span className="dashboard-quick-stat-value">{stats?.clientReview || 0}</span>
          </div>
          <div className="dashboard-quick-stat">
            <span className="dashboard-quick-stat-label">Approved</span>
            <span className="dashboard-quick-stat-value">{stats?.approved || 0}</span>
          </div>
          <div className="dashboard-quick-stat">
            <span className="dashboard-quick-stat-label">Upcoming Deadlines</span>
            <span className="dashboard-quick-stat-value">{stats?.upcomingDeadlines || 0}</span>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="dashboard-performance">
          <div className="dashboard-performance-card">
            <div className="dashboard-performance-header">
              <h3 className="dashboard-performance-title">
                <Target className="dashboard-performance-icon" />
                Performance Overview
              </h3>
            </div>
            <div className="dashboard-performance-content">
              <div className="dashboard-performance-metric">
                <span className="dashboard-performance-label">Completion Rate</span>
                <div className="dashboard-performance-bar-wrapper">
                  <div className="dashboard-performance-bar" style={{ width: `${completionRate}%` }} />
                </div>
                <span className="dashboard-performance-value">{completionRate}%</span>
              </div>
              <div className="dashboard-performance-metric">
                <span className="dashboard-performance-label">Productivity Score</span>
                <div className="dashboard-performance-bar-wrapper">
                  <div className="dashboard-performance-bar dashboard-performance-bar-green" style={{ width: `${Math.min(completionRate + 15, 100)}%` }} />
                </div>
                <span className="dashboard-performance-value">{Math.min(completionRate + 15, 100)}%</span>
              </div>
              <div className="dashboard-performance-metric">
                <span className="dashboard-performance-label">Task Efficiency</span>
                <div className="dashboard-performance-bar-wrapper">
                  <div className="dashboard-performance-bar dashboard-performance-bar-gold" style={{ width: `${Math.min(completionRate + 5, 100)}%` }} />
                </div>
                <span className="dashboard-performance-value">{Math.min(completionRate + 5, 100)}%</span>
              </div>
            </div>
          </div>

          <div className="dashboard-awards">
            <div className="dashboard-award-card">
              <Award className="dashboard-award-icon" style={{ color: '#013E37' }} />
              <div className="dashboard-award-content">
                <p className="dashboard-award-label">Completed Tasks</p>
                <p className="dashboard-award-value">{stats?.completed || 0}</p>
              </div>
            </div>
            <div className="dashboard-award-card">
              <Zap className="dashboard-award-icon" style={{ color: '#0A5C54' }} />
              <div className="dashboard-award-content">
                <p className="dashboard-award-label">In Progress</p>
                <p className="dashboard-award-value">{stats?.inProgress || 0}</p>
              </div>
            </div>
            <div className="dashboard-award-card">
              <TrendingUp className="dashboard-award-icon" style={{ color: '#1A7A6E' }} />
              <div className="dashboard-award-content">
                <p className="dashboard-award-label">Completion Rate</p>
                <p className="dashboard-award-value">{completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="dashboard-tasks-section">
          <div className="dashboard-tasks-header">
            <h2 className="dashboard-tasks-title">
              <Clock className="dashboard-tasks-icon" />
              Recent Tasks
            </h2>
            <Link to="/projects/tasks?assignedToMe=true" className="dashboard-view-all">
              View All Tasks →
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="dashboard-empty-state">
              <CheckCircle className="dashboard-empty-icon" size={48} />
              <p className="dashboard-empty-text">No tasks assigned to you yet.</p>
              <p className="dashboard-empty-subtext">Tasks will appear here once assigned.</p>
            </div>
          ) : (
            <div className="dashboard-task-list">
              {recentTasks.map((task, index) => (
                <Link 
                  to={`/tasks/${task._id}`} 
                  key={task._id} 
                  className="dashboard-task-item"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="dashboard-task-left">
                    <div className="dashboard-task-dot" style={{ backgroundColor: getStatusColor(task.status) }} />
                    <div className="dashboard-task-info">
                      <div className="dashboard-task-title">{task.title}</div>
                      <div className="dashboard-task-meta">
                        <span className="dashboard-task-project">
                          {task.projectId?.projectName || 'No Project'}
                        </span>
                        <span className="dashboard-task-priority">
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="dashboard-task-right">
                    <span className="dashboard-task-status" style={{
                      backgroundColor: getStatusBgColor(task.status),
                      color: getStatusTextColor(task.status)
                    }}>
                      {task.status || 'Backlog'}
                    </span>
                    {task.deadline && (
                      <span className="dashboard-task-deadline">
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

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .dashboard-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .dashboard-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .dashboard-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           ERROR
           ============================================ */
        .dashboard-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
          padding: 20px;
          text-align: center;
        }
        .dashboard-error-icon {
          color: #EF4444;
        }
        .dashboard-error-title {
          font-size: 24px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .dashboard-error-message {
          font-size: 16px;
          color: #013E37;
          opacity: 0.6;
          max-width: 400px;
          margin: 0;
        }
        .dashboard-retry-btn {
          padding: 10px 24px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .dashboard-retry-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        /* ============================================
           WELCOME
           ============================================ */
        .dashboard-welcome {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeInDown 0.6s ease;
        }
        .dashboard-welcome-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dashboard-welcome-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .dashboard-welcome-icon {
          width: 28px;
          height: 28px;
          color: #013E37;
          animation: pulse 2s ease-in-out infinite;
        }
        .dashboard-welcome-subtitle {
          font-size: 16px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }
        .dashboard-date-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #FFEFB3;
          border-radius: 10px;
          font-size: 14px;
          color: #013E37;
          border: 1px solid #013E37;
          transition: all 0.3s ease;
        }
        .dashboard-date-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.1);
        }
        .dashboard-date-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           STATS
           ============================================ */
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .dashboard-stat-card {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        .dashboard-stat-card:nth-child(1) { animation-delay: 0.05s; }
        .dashboard-stat-card:nth-child(2) { animation-delay: 0.1s; }
        .dashboard-stat-card:nth-child(3) { animation-delay: 0.15s; }
        .dashboard-stat-card:nth-child(4) { animation-delay: 0.2s; }
        .dashboard-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(1, 62, 55, 0.1);
          border-color: #013E37;
        }
        .dashboard-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dashboard-stat-label {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
          font-weight: 500;
        }
        .dashboard-stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }
        .dashboard-stat-icon {
          width: 32px;
          height: 32px;
          opacity: 0.8;
        }

        /* ============================================
           QUICK STATS
           ============================================ */
        .dashboard-quick-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 32px;
        }
        .dashboard-quick-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #FFF9E6;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        .dashboard-quick-stat:nth-child(1) { animation-delay: 0.25s; }
        .dashboard-quick-stat:nth-child(2) { animation-delay: 0.3s; }
        .dashboard-quick-stat:nth-child(3) { animation-delay: 0.35s; }
        .dashboard-quick-stat:nth-child(4) { animation-delay: 0.4s; }
        .dashboard-quick-stat:nth-child(5) { animation-delay: 0.45s; }
        .dashboard-quick-stat:hover {
          border-color: #013E37;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.06);
        }
        .dashboard-quick-stat-label {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
        }
        .dashboard-quick-stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
        }

        /* ============================================
           PERFORMANCE
           ============================================ */
        .dashboard-performance {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 32px;
        }
        .dashboard-performance-card {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
          animation-delay: 0.5s;
        }
        .dashboard-performance-card:hover {
          border-color: #013E37;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }
        .dashboard-performance-header {
          margin-bottom: 16px;
        }
        .dashboard-performance-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }
        .dashboard-performance-icon {
          width: 20px;
          height: 20px;
          color: #013E37;
        }
        .dashboard-performance-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .dashboard-performance-metric {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dashboard-performance-label {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          min-width: 140px;
        }
        .dashboard-performance-bar-wrapper {
          flex: 1;
          height: 6px;
          background: #FFEFB3;
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        }
        .dashboard-performance-bar {
          height: 100%;
          background: #013E37;
          border-radius: 3px;
          transition: width 1s ease;
        }
        .dashboard-performance-bar-green {
          background: #0A5C54;
        }
        .dashboard-performance-bar-gold {
          background: #1A7A6E;
        }
        .dashboard-performance-value {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
          min-width: 50px;
          text-align: right;
        }

        .dashboard-awards {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .dashboard-award-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        .dashboard-award-card:nth-child(1) { animation-delay: 0.55s; }
        .dashboard-award-card:nth-child(2) { animation-delay: 0.6s; }
        .dashboard-award-card:nth-child(3) { animation-delay: 0.65s; }
        .dashboard-award-card:hover {
          border-color: #013E37;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.06);
        }
        .dashboard-award-icon {
          width: 32px;
          height: 32px;
        }
        .dashboard-award-content {
          flex: 1;
        }
        .dashboard-award-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.5;
          margin: 0;
        }
        .dashboard-award-value {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }

        /* ============================================
           TASKS
           ============================================ */
        .dashboard-tasks-section {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
          animation-delay: 0.7s;
        }
        .dashboard-tasks-section:hover {
          border-color: #013E37;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }
        .dashboard-tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFF9E6;
        }
        .dashboard-tasks-title {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }
        .dashboard-tasks-icon {
          width: 20px;
          height: 20px;
          color: #013E37;
        }
        .dashboard-view-all {
          font-size: 14px;
          color: #013E37;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 4px 12px;
          border-radius: 6px;
        }
        .dashboard-view-all:hover {
          background: #013E37;
          color: #FFEFB3;
        }

        .dashboard-task-list {
          padding: 8px 0;
        }
        .dashboard-task-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid #FFEFB3;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          animation: fadeInRight 0.4s ease forwards;
          opacity: 0;
        }
        .dashboard-task-item:nth-child(1) { animation-delay: 0.05s; }
        .dashboard-task-item:nth-child(2) { animation-delay: 0.1s; }
        .dashboard-task-item:nth-child(3) { animation-delay: 0.15s; }
        .dashboard-task-item:nth-child(4) { animation-delay: 0.2s; }
        .dashboard-task-item:nth-child(5) { animation-delay: 0.25s; }
        .dashboard-task-item:hover {
          background: #FFF9E6;
        }
        .dashboard-task-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .dashboard-task-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dashboard-task-info {
          flex: 1;
          min-width: 0;
        }
        .dashboard-task-title {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }
        .dashboard-task-meta {
          display: flex;
          gap: 12px;
          margin-top: 2px;
          flex-wrap: wrap;
        }
        .dashboard-task-project {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
        }
        .dashboard-task-priority {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
        }
        .dashboard-task-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }
        .dashboard-task-status {
          font-size: 12px;
          padding: 2px 12px;
          border-radius: 9999px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .dashboard-task-status:hover {
          transform: scale(1.05);
        }
        .dashboard-task-deadline {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
        }

        .dashboard-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 20px;
          gap: 8px;
        }
        .dashboard-empty-icon {
          color: #FFEFB3;
        }
        .dashboard-empty-text {
          font-size: 16px;
          font-weight: 500;
          color: #013E37;
          margin: 0;
        }
        .dashboard-empty-subtext {
          font-size: 14px;
          color: #013E37;
          opacity: 0.5;
          margin: 0;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.95);
          }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .dashboard-performance {
            grid-template-columns: 1fr;
          }
          .dashboard-awards {
            flex-direction: row;
          }
          .dashboard-award-card {
            flex: 1;
          }
        }

        @media (max-width: 768px) {
          .dashboard-welcome {
            flex-direction: column;
            align-items: flex-start;
          }
          .dashboard-stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          .dashboard-quick-stats {
            grid-template-columns: 1fr 1fr;
          }
          .dashboard-awards {
            flex-direction: column;
          }
          .dashboard-task-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .dashboard-task-right {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 8px;
          }
          .dashboard-performance-metric {
            flex-wrap: wrap;
          }
          .dashboard-performance-label {
            min-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .dashboard-stats-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-quick-stats {
            grid-template-columns: 1fr;
          }
          .dashboard-welcome-title {
            font-size: 24px;
          }
          .dashboard-stat-value {
            font-size: 28px;
          }
          .dashboard-tasks-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </>
  );
};

export default EmployeeDashboard;