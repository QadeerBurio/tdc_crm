// pages/goals/GoalDetails.jsx
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
        <div className="gd-loading-spinner"></div>
        <p className="gd-loading-text">Loading goal details...</p>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="gd-notfound">
        <div className="gd-notfound-icon-wrapper">
          <Target className="gd-notfound-icon" />
        </div>
        <h2 className="gd-notfound-title">Goal Not Found</h2>
        <p className="gd-notfound-text">The goal you're looking for doesn't exist</p>
        <button onClick={() => navigate('/goals')} className="gd-notfound-btn">
          Back to Goals
        </button>
      </div>
    );
  }

  return (
    <>
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

        {/* Progress Card */}
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
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .gd-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .gd-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .gd-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .gd-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           NOT FOUND
           ============================================ */
        .gd-notfound {
          text-align: center;
          padding: 60px 20px;
        }
        .gd-notfound-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #FFEFB3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .gd-notfound-icon {
          width: 36px;
          height: 36px;
          color: #013E37;
        }
        .gd-notfound-title {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .gd-notfound-text {
          color: #013E37;
          opacity: 0.6;
          margin: 4px 0 16px 0;
        }
        .gd-notfound-btn {
          padding: 8px 24px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(1, 62, 55, 0.25);
        }
        .gd-notfound-btn:hover {
          background: #0A5C54;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
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
          animation: fadeInDown 0.6s ease;
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
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          margin-top: 2px;
        }
        .gd-back-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
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
          color: #013E37;
          margin: 0;
        }
        .gd-title-input {
          padding: 4px 12px;
          border: 1.5px solid #FFEFB3;
          border-radius: 8px;
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          outline: none;
          width: 100%;
          min-width: 200px;
          transition: all 0.3s ease;
        }
        .gd-title-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .gd-status-badge {
          font-size: 13px;
          font-weight: 500;
          padding: 4px 14px;
          border-radius: 12px;
        }
        .gd-status-not-started { background: #FFEFB3; color: #013E37; }
        .gd-status-in-progress { background: #013E37; color: #FFEFB3; }
        .gd-status-on-track { background: #0A5C54; color: #FFEFB3; }
        .gd-status-at-risk { background: #FFEFB3; color: #013E37; }
        .gd-status-behind { background: #FEE2E2; color: #991B1B; }
        .gd-status-completed { background: #013E37; color: #FFEFB3; }
        .gd-status-cancelled { background: #FFEFB3; color: #013E37; }

        .gd-priority-badge {
          font-size: 13px;
          font-weight: 500;
          padding: 4px 14px;
          border-radius: 12px;
        }
        .gd-priority-critical { background: #FEE2E2; color: #991B1B; }
        .gd-priority-high { background: #FFEFB3; color: #013E37; }
        .gd-priority-medium { background: #013E37; color: #FFEFB3; }
        .gd-priority-low { background: #0A5C54; color: #FFEFB3; }

        .gd-subtitle {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
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
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
        }
        .gd-refresh-btn:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .gd-refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .gd-refresh-icon {
          width: 16px;
          height: 16px;
        }
        .gd-spin {
          animation: spin 1s linear infinite;
        }
        .gd-edit-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          color: #013E37;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .gd-edit-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .gd-delete-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #FEE2E2;
          border-radius: 8px;
          background: #ffffff;
          color: #EF4444;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .gd-delete-btn:hover {
          background: #FEF2F2;
        }
        .gd-btn-icon {
          width: 16px;
          height: 16px;
        }
        .gd-icon {
          width: 20px;
          height: 20px;
        }
        .gd-icon-green { color: #0A5C54; }
        .gd-icon-red { color: #EF4444; }
        .gd-icon-blue { color: #013E37; }
        .gd-icon-gray { color: #013E37; opacity: 0.4; }

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
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(1, 62, 55, 0.25);
        }
        .gd-save-btn:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
        }
        .gd-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .gd-save-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 239, 179, 0.3);
          border-top-color: #FFEFB3;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* ============================================
           PROGRESS CARD
           ============================================ */
        .gd-progress-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        .gd-progress-card:hover {
          border-color: #013E37;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
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
          color: #013E37;
        }
        .gd-progress-value {
          font-size: 14px;
          font-weight: 700;
          color: #013E37;
        }
        .gd-progress-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
        }
        .gd-progress-target {
          font-weight: 500;
        }
        .gd-progress-expected-label {
          font-weight: 500;
          opacity: 0.5;
        }
        .gd-progress-bar-wrapper {
          position: relative;
          margin-top: 4px;
        }
        .gd-progress-bar-bg {
          width: 100%;
          height: 8px;
          background: #FFEFB3;
          border-radius: 6px;
          overflow: visible;
        }
        .gd-progress-bar-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.8s ease;
        }
        .gd-progress-green { background: #013E37; }
        .gd-progress-blue { background: #0A5C54; }
        .gd-progress-yellow { background: #FFEFB3; }
        .gd-progress-red { background: #EF4444; }

        .gd-progress-expected-marker {
          position: absolute;
          top: 0;
          width: 2px;
          height: 8px;
          background: #EF4444;
          border-radius: 2px;
        }
        .gd-progress-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
          font-size: 11px;
          color: #013E37;
          opacity: 0.4;
        }

        /* ============================================
           TABS
           ============================================ */
        .gd-tabs {
          display: flex;
          gap: 4px;
          border-bottom: 2px solid #FFEFB3;
          margin-bottom: 20px;
          overflow-x: auto;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
          animation-delay: 0.1s;
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
          transition: all 0.3s ease;
          border-bottom: 2px solid transparent;
          color: #013E37;
          opacity: 0.5;
          white-space: nowrap;
        }
        .gd-tab:hover {
          opacity: 0.8;
        }
        .gd-tab-active {
          color: #013E37;
          opacity: 1;
          border-bottom-color: #013E37;
        }
        .gd-tab-inactive {
          color: #013E37;
          opacity: 0.5;
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
          border: 1px solid #FFEFB3;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.3s ease;
          transition: all 0.3s ease;
        }
        .gd-content:hover {
          border-color: #013E37;
        }

        .gd-section {
          margin-bottom: 24px;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .gd-section:nth-child(1) { animation-delay: 0.05s; }
        .gd-section:nth-child(2) { animation-delay: 0.1s; }
        .gd-section:nth-child(3) { animation-delay: 0.15s; }
        .gd-section:nth-child(4) { animation-delay: 0.2s; }
        .gd-section:last-child {
          margin-bottom: 0;
        }
        .gd-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
          margin: 0 0 12px 0;
        }
        .gd-description {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
          line-height: 1.6;
          margin: 0;
        }
        .gd-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          font-family: inherit;
          resize: vertical;
          color: #013E37;
        }
        .gd-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
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
          color: #013E37;
          opacity: 0.4;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }
        .gd-detail-value {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
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
          transition: all 0.3s ease;
        }
        .gd-context-badge:hover {
          transform: scale(1.05);
        }
        .gd-context-segment { background: #FFEFB3; color: #013E37; }
        .gd-context-department { background: #FFEFB3; color: #013E37; }
        .gd-context-team { background: #FFEFB3; color: #013E37; }
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
          background: #FFEFB3;
          border-radius: 8px;
          font-size: 13px;
          color: #013E37;
          transition: all 0.3s ease;
        }
        .gd-kpi-badge:hover {
          transform: scale(1.05);
        }
        .gd-kpi-icon {
          width: 14px;
          height: 14px;
          color: #013E37;
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
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .gd-add-task-btn:hover {
          background: #0A5C54;
          transform: translateY(-1px);
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
          background: #FFF9E6;
          border-radius: 8px;
          transition: all 0.3s ease;
          flex-wrap: wrap;
          gap: 8px;
          animation: fadeInRight 0.4s ease forwards;
          opacity: 0;
        }
        .gd-task-item:nth-child(1) { animation-delay: 0.05s; }
        .gd-task-item:nth-child(2) { animation-delay: 0.1s; }
        .gd-task-item:nth-child(3) { animation-delay: 0.15s; }
        .gd-task-item:hover {
          background: #FFEFB3;
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
        .gd-task-completed { background: #013E37; }
        .gd-task-in-progress { background: #0A5C54; }
        .gd-task-pending { background: #013E37; opacity: 0.3; }
        .gd-task-title {
          font-size: 14px;
          color: #013E37;
        }
        .gd-task-status-label {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 12px;
        }
        .gd-task-label-completed { background: #013E37; color: #FFEFB3; }
        .gd-task-label-in-progress { background: #0A5C54; color: #FFEFB3; }
        .gd-task-label-pending { background: #FFEFB3; color: #013E37; }
        .gd-task-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
        }
        .gd-task-assignee-icon {
          width: 14px;
          height: 14px;
        }
        .gd-empty-tasks {
          text-align: center;
          padding: 40px 0;
          color: #013E37;
          opacity: 0.4;
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
          background: #FFF9E6;
          border-radius: 8px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .gd-activity-item:nth-child(1) { animation-delay: 0.05s; }
        .gd-activity-item:nth-child(2) { animation-delay: 0.1s; }
        .gd-activity-item:nth-child(3) { animation-delay: 0.15s; }
        .gd-activity-item:hover {
          background: #FFEFB3;
        }
        .gd-activity-icon-wrapper {
          width: 32px;
          height: 32px;
          background: #FFEFB3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .gd-activity-icon {
          width: 14px;
          height: 14px;
          color: #013E37;
        }
        .gd-activity-content {
          flex: 1;
        }
        .gd-activity-text {
          font-size: 14px;
          color: #013E37;
          margin: 0;
        }
        .gd-activity-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
          margin-top: 2px;
        }
        .gd-activity-user {
          font-weight: 500;
          color: #013E37;
          opacity: 0.7;
        }
        .gd-activity-dot {
          color: #013E37;
          opacity: 0.3;
        }
        .gd-empty-activity {
          text-align: center;
          padding: 40px 0;
          color: #013E37;
          opacity: 0.4;
        }
        .gd-empty-activity .gd-empty-icon {
          width: 32px;
          height: 32px;
          margin: 0 auto 8px;
          opacity: 0.3;
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
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
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
    </>
  );
};

export default GoalDetails;