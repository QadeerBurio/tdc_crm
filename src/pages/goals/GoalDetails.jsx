import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Target, Edit, Save, X, Trash2, ArrowLeft,
  TrendingUp, TrendingDown, Clock, Calendar,
  Users, AlertCircle, CheckCircle, Activity,
  RefreshCw, Copy, Share2, Link2,
  ChevronDown, ChevronRight, Plus,
  Award, Star, Zap, Layers, Briefcase
} from 'lucide-react';
import GoalProgress from '../../components/goals/GoalProgress';
import GoalHierarchy from '../../components/goals/GoalHierarchy';
import toast from 'react-hot-toast';

const GoalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [relatedTasks, setRelatedTasks] = useState([]);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [saving, setSaving] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchGoalDetails();
  }, [id]);

  const fetchGoalDetails = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Try to fetch from API
      let goalData = null;
      let tasksData = [];
      let projectsData = [];
      let activitiesData = [];

      try {
        const [goalRes, tasksRes, projectsRes, activitiesRes] = await Promise.all([
          fetch(`${API_URL}/goals/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/goals/${id}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/goals/${id}/projects`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/goals/${id}/activities`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (goalRes.ok) {
          const data = await goalRes.json();
          goalData = data.data;
        }
        if (tasksRes.ok) {
          const data = await tasksRes.json();
          tasksData = data.data || [];
        }
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          projectsData = data.data || [];
        }
        if (activitiesRes.ok) {
          const data = await activitiesRes.json();
          activitiesData = data.data || [];
        }
      } catch (err) {
        console.warn('API not available, using mock data');
        goalData = getMockGoal();
        tasksData = getMockTasks();
        projectsData = getMockProjects();
        activitiesData = getMockActivities();
      }

      setGoal(goalData);
      setRelatedTasks(tasksData);
      setRelatedProjects(projectsData);
      setActivityLog(activitiesData);
      setFormData(goalData);
    } catch (error) {
      console.error('Error fetching goal details:', error);
      toast.error('Failed to load goal details');
      // Set mock data on error
      setGoal(getMockGoal());
      setRelatedTasks(getMockTasks());
      setRelatedProjects(getMockProjects());
      setActivityLog(getMockActivities());
      setFormData(getMockGoal());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockGoal = () => ({
    _id: id,
    name: 'Increase Revenue by 25%',
    description: 'Grow revenue through new client acquisition and upselling existing clients. Focus on enterprise segment and strategic partnerships.',
    status: 'on_track',
    priority: 'critical',
    level: 'company',
    category: 'growth',
    progress: 65,
    expectedProgress: 60,
    target: { value: 1000000, unit: 'USD' },
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    ownerId: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    segmentId: { name: 'Technology' },
    departmentId: { name: 'Sales' },
    teamId: { name: 'Enterprise' },
    relatedKPIs: [{ name: 'Revenue Growth' }, { name: 'Client Acquisition' }]
  });

  const getMockTasks = () => [
    { _id: 't1', title: 'Client Research', status: 'Completed', assignedTo: { firstName: 'Sarah' } },
    { _id: 't2', title: 'Outreach Campaign', status: 'In Progress', assignedTo: { firstName: 'Mike' } },
    { _id: 't3', title: 'Proposal Development', status: 'Not Started', assignedTo: { firstName: 'Emma' } }
  ];

  const getMockProjects = () => [
    { _id: 'p1', name: 'Q4 Growth Initiative', status: 'Active' },
    { _id: 'p2', name: 'Enterprise Expansion', status: 'Planning' }
  ];

  const getMockActivities = () => [
    { _id: 'a1', description: 'Goal progress updated to 65%', userId: { firstName: 'John', lastName: 'Doe' }, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: 'a2', description: 'New task "Client Research" added', userId: { firstName: 'Sarah', lastName: 'Smith' }, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { _id: 'a3', description: 'Goal status changed to "On Track"', userId: { firstName: 'Mike', lastName: 'Johnson' }, createdAt: new Date(Date.now() - 86400000).toISOString() }
  ];

  const handleRefresh = () => {
    fetchGoalDetails(true);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setGoal(data.data);
        toast.success('Goal updated successfully!');
        setEditing(false);
      } else {
        throw new Error('Failed to update goal');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      const response = await fetch(`${API_URL}/goals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Goal deleted successfully');
        navigate('/goals');
      } else {
        throw new Error('Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const handleUpdateProgress = async (progress) => {
    try {
      await fetch(`${API_URL}/goals/${id}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ progress })
      });
      toast.success('Progress updated successfully');
      fetchGoalDetails(true);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'not_started': 'gd-status-not-started',
      'in_progress': 'gd-status-in-progress',
      'on_track': 'gd-status-on-track',
      'at_risk': 'gd-status-at-risk',
      'behind': 'gd-status-behind',
      'completed': 'gd-status-completed',
      'cancelled': 'gd-status-cancelled'
    };
    return colors[status] || 'gd-status-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'not_started': 'Not Started',
      'in_progress': 'In Progress',
      'on_track': 'On Track',
      'at_risk': 'At Risk',
      'behind': 'Behind',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="gd-icon gd-icon-green" />;
    if (status === 'at_risk' || status === 'behind') return <AlertCircle className="gd-icon gd-icon-red" />;
    if (status === 'on_track') return <TrendingUp className="gd-icon gd-icon-green" />;
    if (status === 'in_progress') return <Zap className="gd-icon gd-icon-blue" />;
    return <Clock className="gd-icon gd-icon-gray" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'gd-priority-critical',
      'high': 'gd-priority-high',
      'medium': 'gd-priority-medium',
      'low': 'gd-priority-low'
    };
    return colors[priority] || 'gd-priority-default';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'critical': 'Critical',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return labels[priority] || priority;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'gd-progress-green';
    if (progress >= 60) return 'gd-progress-blue';
    if (progress >= 40) return 'gd-progress-yellow';
    return 'gd-progress-red';
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Just now';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'hierarchy', label: 'Hierarchy', icon: Layers },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  if (loading) {
    return (
      <div className="gd-loading">
        <div className="gd-spinner"></div>
        <p className="gd-loading-text">Loading goal details...</p>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="gd-not-found">
        <div className="gd-not-found-icon-wrapper">
          <Target className="gd-not-found-icon" />
        </div>
        <h2 className="gd-not-found-title">Goal Not Found</h2>
        <p className="gd-not-found-text">The goal you're looking for doesn't exist</p>
        <button onClick={() => navigate('/goals')} className="gd-not-found-btn">
          Back to Goals
        </button>
      </div>
    );
  }

  return (
    <div className="gd-container">
      {/* Header */}
      <div className="gd-header">
        <div className="gd-header-left">
          <button onClick={() => navigate('/goals')} className="gd-back-btn">
            <ArrowLeft className="gd-back-icon" />
          </button>
          <div className="gd-header-info">
            <div className="gd-header-title-row">
              {getStatusIcon(goal.status)}
              <h1 className="gd-title">
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="gd-title-input"
                  />
                ) : (
                  goal.name
                )}
              </h1>
              <span className={`gd-status-badge ${getStatusColor(goal.status)}`}>
                {getStatusLabel(goal.status)}
              </span>
              <span className={`gd-priority-badge ${getPriorityColor(goal.priority)}`}>
                {getPriorityLabel(goal.priority)}
              </span>
            </div>
            <p className="gd-subtitle">
              {goal.level} • Owner: {goal.ownerId?.firstName} {goal.ownerId?.lastName}
            </p>
          </div>
        </div>
        <div className="gd-header-right">
          <button className="gd-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`gd-refresh-icon ${refreshing ? 'gd-spin' : ''}`} />
          </button>
          <button onClick={() => setEditing(!editing)} className="gd-edit-btn">
            {editing ? <X className="gd-btn-icon" /> : <Edit className="gd-btn-icon" />}
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={handleDelete} className="gd-delete-btn">
            <Trash2 className="gd-btn-icon" />
            Delete
          </button>
        </div>
      </div>

      {/* Save Button */}
      {editing && (
        <div className="gd-save-bar">
          <button onClick={handleUpdate} className="gd-save-btn" disabled={saving}>
            {saving ? (
              <>
                <div className="gd-save-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="gd-btn-icon" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="gd-progress-card">
        <div className="gd-progress-header">
          <div className="gd-progress-title">
            <span className="gd-progress-label">Progress</span>
            <span className="gd-progress-value">{goal.progress}%</span>
          </div>
          <div className="gd-progress-meta">
            <span className="gd-progress-target">
              Target: {goal.target?.value} {goal.target?.unit}
            </span>
            <span className="gd-progress-expected-label">
              Expected: {goal.expectedProgress}%
            </span>
          </div>
        </div>
        <div className="gd-progress-bar-wrapper">
          <div className="gd-progress-bar-bg">
            <div 
              className={`gd-progress-bar-fill ${getProgressColor(goal.progress)}`}
              style={{ width: `${goal.progress}%` }}
            />
          </div>
          <div 
            className="gd-progress-expected-marker"
            style={{ left: `${goal.expectedProgress}%` }}
          />
        </div>
        <div className="gd-progress-labels">
          <span>0%</span>
          <span>Expected: {goal.expectedProgress}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="gd-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`gd-tab ${activeTab === tab.id ? 'gd-tab-active' : 'gd-tab-inactive'}`}
            >
              <Icon className="gd-tab-icon" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="gd-content">
        {activeTab === 'overview' && (
          <div className="gd-overview">
            {/* Description */}
            <div className="gd-section">
              <h3 className="gd-section-title">Description</h3>
              {editing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="gd-textarea"
                  rows="4"
                />
              ) : (
                <p className="gd-description">{goal.description || 'No description provided'}</p>
              )}
            </div>

            {/* Details Grid */}
            <div className="gd-details-grid">
              <div className="gd-detail-item">
                <p className="gd-detail-label">Level</p>
                <p className="gd-detail-value">{goal.level}</p>
              </div>
              <div className="gd-detail-item">
                <p className="gd-detail-label">Category</p>
                <p className="gd-detail-value">{goal.category || 'General'}</p>
              </div>
              <div className="gd-detail-item">
                <p className="gd-detail-label">Start Date</p>
                <p className="gd-detail-value">{formatDate(goal.startDate)}</p>
              </div>
              <div className="gd-detail-item">
                <p className="gd-detail-label">End Date</p>
                <p className="gd-detail-value">{formatDate(goal.endDate)}</p>
              </div>
            </div>

            {/* Organization Context */}
            {(goal.segmentId || goal.departmentId || goal.teamId) && (
              <div className="gd-section">
                <h3 className="gd-section-title">Organization Context</h3>
                <div className="gd-context-badges">
                  {goal.segmentId && (
                    <span className="gd-context-badge gd-context-segment">
                      <Layers className="gd-context-icon" />
                      Segment: {goal.segmentId.name}
                    </span>
                  )}
                  {goal.departmentId && (
                    <span className="gd-context-badge gd-context-department">
                      <Briefcase className="gd-context-icon" />
                      Dept: {goal.departmentId.name}
                    </span>
                  )}
                  {goal.teamId && (
                    <span className="gd-context-badge gd-context-team">
                      <Users className="gd-context-icon" />
                      Team: {goal.teamId.name}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Related KPIs */}
            {goal.relatedKPIs && goal.relatedKPIs.length > 0 && (
              <div className="gd-section">
                <h3 className="gd-section-title">Related KPIs</h3>
                <div className="gd-kpi-badges">
                  {goal.relatedKPIs.map((kpi, idx) => (
                    <span key={idx} className="gd-kpi-badge">
                      <Award className="gd-kpi-icon" />
                      {kpi.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <GoalProgress goalId={goal._id} />
        )}

        {activeTab === 'hierarchy' && (
          <GoalHierarchy />
        )}

        {activeTab === 'tasks' && (
          <div className="gd-tasks">
            <div className="gd-tasks-header">
              <h3 className="gd-section-title">Related Tasks</h3>
              <button className="gd-add-task-btn">
                <Plus className="gd-btn-icon" />
                Add Task
              </button>
            </div>
            {relatedTasks.length === 0 ? (
              <div className="gd-empty-tasks">
                <CheckCircle className="gd-empty-icon" />
                <p>No tasks linked to this goal</p>
              </div>
            ) : (
              <div className="gd-task-list">
                {relatedTasks.map((task) => (
                  <div key={task._id} className="gd-task-item">
                    <div className="gd-task-left">
                      <div className={`gd-task-status-dot ${task.status === 'Completed' ? 'gd-task-completed' : task.status === 'In Progress' ? 'gd-task-in-progress' : 'gd-task-pending'}`} />
                      <span className="gd-task-title">{task.title}</span>
                      <span className={`gd-task-status-label ${task.status === 'Completed' ? 'gd-task-label-completed' : task.status === 'In Progress' ? 'gd-task-label-in-progress' : 'gd-task-label-pending'}`}>
                        {task.status}
                      </span>
                    </div>
                    <span className="gd-task-assignee">
                      <Users className="gd-task-assignee-icon" />
                      {task.assignedTo?.firstName || 'Unassigned'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="gd-activity">
            <h3 className="gd-section-title">Activity Log</h3>
            {activityLog.length === 0 ? (
              <div className="gd-empty-activity">
                <Activity className="gd-empty-icon" />
                <p>No activity recorded yet</p>
              </div>
            ) : (
              <div className="gd-activity-list">
                {activityLog.map((activity) => (
                  <div key={activity._id} className="gd-activity-item">
                    <div className="gd-activity-icon-wrapper">
                      <Activity className="gd-activity-icon" />
                    </div>
                    <div className="gd-activity-content">
                      <p className="gd-activity-text">{activity.description}</p>
                      <div className="gd-activity-meta">
                        <span className="gd-activity-user">
                          {activity.userId?.firstName} {activity.userId?.lastName}
                        </span>
                        <span className="gd-activity-dot">•</span>
                        <span className="gd-activity-time">{getTimeAgo(activity.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .gd-container {
          padding: 24px 32px;
          max-width: 1200px;
          margin: 0 auto;
          animation: gdFadeIn 0.4s ease;
        }

        @keyframes gdFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .gd-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .gd-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: gdSpin 0.8s linear infinite;
        }

        .gd-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes gdSpin {
          to { transform: rotate(360deg); }
        }

        .gd-spin {
          animation: gdSpin 1s linear infinite;
        }

        /* ============================================
           NOT FOUND
           ============================================ */
        .gd-not-found {
          text-align: center;
          padding: 60px 20px;
        }

        .gd-not-found-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .gd-not-found-icon {
          width: 36px;
          height: 36px;
          color: #94a3b8;
        }

        .gd-not-found-title {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .gd-not-found-text {
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .gd-not-found-btn {
          padding: 8px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .gd-not-found-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        /* ============================================
           HEADER
           ============================================ */
        .gd-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .gd-header-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .gd-back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #64748b;
          margin-top: 2px;
        }

        .gd-back-btn:hover {
          background: #f1f5f9;
        }

        .gd-back-icon {
          width: 20px;
          height: 20px;
        }

        .gd-header-info {
          flex: 1;
        }

        .gd-header-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .gd-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .gd-title-input {
          padding: 4px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          outline: none;
          width: 100%;
          min-width: 200px;
          transition: all 0.2s ease;
        }

        .gd-title-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .gd-status-badge {
          font-size: 13px;
          font-weight: 500;
          padding: 4px 14px;
          border-radius: 12px;
        }

        .gd-status-not-started { background: #f1f5f9; color: #64748b; }
        .gd-status-in-progress { background: #dbeafe; color: #3b82f6; }
        .gd-status-on-track { background: #d1fae5; color: #22c55e; }
        .gd-status-at-risk { background: #fef3c7; color: #f59e0b; }
        .gd-status-behind { background: #fee2e2; color: #ef4444; }
        .gd-status-completed { background: #d1fae5; color: #10b981; }
        .gd-status-cancelled { background: #f1f5f9; color: #94a3b8; }

        .gd-priority-badge {
          font-size: 13px;
          font-weight: 500;
          padding: 4px 14px;
          border-radius: 12px;
        }

        .gd-priority-critical { background: #fef2f2; color: #dc2626; }
        .gd-priority-high { background: #fffbeb; color: #d97706; }
        .gd-priority-medium { background: #eff6ff; color: #3b82f6; }
        .gd-priority-low { background: #ecfdf5; color: #22c55e; }

        .gd-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        .gd-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .gd-refresh-btn {
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

        .gd-refresh-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .gd-refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .gd-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .gd-edit-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gd-edit-btn:hover {
          background: #f1f5f9;
        }

        .gd-delete-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #ffffff;
          color: #ef4444;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gd-delete-btn:hover {
          background: #fef2f2;
        }

        .gd-btn-icon {
          width: 16px;
          height: 16px;
        }

        .gd-icon {
          width: 20px;
          height: 20px;
        }

        .gd-icon-green { color: #22c55e; }
        .gd-icon-red { color: #ef4444; }
        .gd-icon-blue { color: #3b82f6; }
        .gd-icon-gray { color: #94a3b8; }

        /* ============================================
           SAVE BAR
           ============================================ */
        .gd-save-bar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }

        .gd-save-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 28px;
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

        .gd-save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        .gd-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .gd-save-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: gdSpin 0.8s linear infinite;
        }

        /* ============================================
           PROGRESS CARD
           ============================================ */
        .gd-progress-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .gd-progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .gd-progress-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gd-progress-label {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .gd-progress-value {
          font-size: 14px;
          font-weight: 700;
          color: #3b82f6;
        }

        .gd-progress-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 13px;
          color: #64748b;
        }

        .gd-progress-target {
          font-weight: 500;
        }

        .gd-progress-expected-label {
          font-weight: 500;
          color: #94a3b8;
        }

        .gd-progress-bar-wrapper {
          position: relative;
          margin-top: 4px;
        }

        .gd-progress-bar-bg {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 6px;
          overflow: visible;
        }

        .gd-progress-bar-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.8s ease;
        }

        .gd-progress-green { background: #22c55e; }
        .gd-progress-blue { background: #3b82f6; }
        .gd-progress-yellow { background: #f59e0b; }
        .gd-progress-red { background: #ef4444; }

        .gd-progress-expected-marker {
          position: absolute;
          top: 0;
          width: 2px;
          height: 8px;
          background: #ef4444;
          border-radius: 2px;
        }

        .gd-progress-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
          font-size: 11px;
          color: #94a3b8;
        }

        /* ============================================
           TABS
           ============================================ */
        .gd-tabs {
          display: flex;
          gap: 4px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 20px;
          overflow-x: auto;
        }

        .gd-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
          color: #64748b;
          white-space: nowrap;
        }

        .gd-tab:hover {
          color: #0f172a;
        }

        .gd-tab-active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .gd-tab-inactive {
          color: #64748b;
        }

        .gd-tab-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           CONTENT
           ============================================ */
        .gd-content {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          animation: gdSlideUp 0.3s ease;
        }

        @keyframes gdSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gd-section {
          margin-bottom: 24px;
        }

        .gd-section:last-child {
          margin-bottom: 0;
        }

        .gd-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 12px 0;
        }

        .gd-description {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        .gd-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
          resize: vertical;
        }

        .gd-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .gd-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .gd-detail-item {
          padding: 8px 0;
        }

        .gd-detail-label {
          font-size: 11px;
          font-weight: 500;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .gd-detail-value {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
          margin: 2px 0 0 0;
        }

        .gd-context-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .gd-context-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .gd-context-segment { background: #eff6ff; color: #3b82f6; }
        .gd-context-department { background: #f5f3ff; color: #7c3aed; }
        .gd-context-team { background: #fffbeb; color: #d97706; }

        .gd-context-icon {
          width: 14px;
          height: 14px;
        }

        .gd-kpi-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .gd-kpi-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 13px;
          color: #475569;
        }

        .gd-kpi-icon {
          width: 14px;
          height: 14px;
          color: #8b5cf6;
        }

        /* ============================================
           TASKS
           ============================================ */
        .gd-tasks-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .gd-add-task-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gd-add-task-btn:hover {
          background: #2563eb;
        }

        .gd-task-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .gd-task-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #f8fafc;
          border-radius: 8px;
          transition: all 0.2s ease;
          flex-wrap: wrap;
          gap: 8px;
        }

        .gd-task-item:hover {
          background: #f1f5f9;
        }

        .gd-task-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .gd-task-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .gd-task-completed { background: #22c55e; }
        .gd-task-in-progress { background: #3b82f6; }
        .gd-task-pending { background: #94a3b8; }

        .gd-task-title {
          font-size: 14px;
          color: #0f172a;
        }

        .gd-task-status-label {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .gd-task-label-completed { background: #d1fae5; color: #22c55e; }
        .gd-task-label-in-progress { background: #dbeafe; color: #3b82f6; }
        .gd-task-label-pending { background: #f1f5f9; color: #64748b; }

        .gd-task-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #64748b;
        }

        .gd-task-assignee-icon {
          width: 14px;
          height: 14px;
        }

        .gd-empty-tasks {
          text-align: center;
          padding: 40px 0;
          color: #94a3b8;
        }

        .gd-empty-tasks .gd-empty-icon {
          width: 32px;
          height: 32px;
          margin: 0 auto 8px;
          opacity: 0.3;
        }

        /* ============================================
           ACTIVITY
           ============================================ */
        .gd-activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .gd-activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          background: #f8fafc;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .gd-activity-item:hover {
          background: #f1f5f9;
        }

        .gd-activity-icon-wrapper {
          width: 32px;
          height: 32px;
          background: #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gd-activity-icon {
          width: 14px;
          height: 14px;
          color: #64748b;
        }

        .gd-activity-content {
          flex: 1;
        }

        .gd-activity-text {
          font-size: 14px;
          color: #0f172a;
          margin: 0;
        }

        .gd-activity-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .gd-activity-user {
          font-weight: 500;
          color: #64748b;
        }

        .gd-activity-dot {
          color: #d1d5db;
        }

        .gd-empty-activity {
          text-align: center;
          padding: 40px 0;
          color: #94a3b8;
        }

        .gd-empty-activity .gd-empty-icon {
          width: 32px;
          height: 32px;
          margin: 0 auto 8px;
          opacity: 0.3;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .gd-container {
            padding: 16px;
          }

          .gd-header {
            flex-direction: column;
            align-items: stretch;
          }

          .gd-header-left {
            flex-wrap: wrap;
          }

          .gd-header-right {
            justify-content: flex-end;
          }

          .gd-title {
            font-size: 20px;
          }

          .gd-title-input {
            font-size: 20px;
          }

          .gd-progress-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .gd-progress-meta {
            flex-wrap: wrap;
          }

          .gd-tabs {
            gap: 0;
          }

          .gd-tab {
            padding: 10px 14px;
            font-size: 13px;
          }

          .gd-tab-icon {
            display: none;
          }

          .gd-content {
            padding: 16px;
          }

          .gd-details-grid {
            grid-template-columns: 1fr 1fr;
          }

          .gd-task-item {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .gd-container {
            padding: 12px;
          }

          .gd-header-right {
            flex-wrap: wrap;
          }

          .gd-edit-btn,
          .gd-delete-btn {
            flex: 1;
            justify-content: center;
          }

          .gd-details-grid {
            grid-template-columns: 1fr;
          }

          .gd-context-badges {
            flex-direction: column;
          }

          .gd-kpi-badges {
            flex-direction: column;
          }

          .gd-tasks-header {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .gd-add-task-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default GoalDetails;