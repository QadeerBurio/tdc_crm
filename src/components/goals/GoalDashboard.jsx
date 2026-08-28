import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Target, TrendingUp, TrendingDown, Clock,
  CheckCircle, AlertCircle, Users, Calendar,
  BarChart2, PieChart, Activity, Filter,
  Award, Zap, Star, RefreshCw, ChevronRight
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

const GoalDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('monthly');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F472B6'];

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Try to fetch from API
      let statsData = null;
      let goalsData = [];

      try {
        const [statsRes, goalsRes] = await Promise.all([
          fetch(`${API_URL}/goals/dashboard/stats?period=${period}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/goals/dashboard/recent?limit=10`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          statsData = statsJson.data;
        }
        if (goalsRes.ok) {
          const goalsJson = await goalsRes.json();
          goalsData = goalsJson.data || [];
        }
      } catch (err) {
        console.warn('API not available, using mock data');
        // Use mock data if API fails
        statsData = getMockStats();
        goalsData = getMockGoals();
      }

      setStats(statsData);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
      // Set mock data on error
      setStats(getMockStats());
      setGoals(getMockGoals());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockStats = () => ({
    total: 24,
    onTrack: 12,
    atRisk: 5,
    behind: 3,
    completed: 4,
    averageProgress: 65,
    byStatus: [
      { _id: 'not_started', count: 3 },
      { _id: 'in_progress', count: 6 },
      { _id: 'on_track', count: 8 },
      { _id: 'at_risk', count: 4 },
      { _id: 'behind', count: 2 },
      { _id: 'completed', count: 1 }
    ],
    byLevel: [
      { _id: 'company', count: 4 },
      { _id: 'segment', count: 6 },
      { _id: 'department', count: 8 },
      { _id: 'team', count: 4 },
      { _id: 'individual', count: 2 }
    ]
  });

  const getMockGoals = () => [
    { _id: '1', name: 'Increase Revenue by 20%', level: 'company', status: 'on_track', progress: 65, ownerId: { firstName: 'John', lastName: 'Doe' } },
    { _id: '2', name: 'Launch New Product', level: 'segment', status: 'in_progress', progress: 45, ownerId: { firstName: 'Sarah', lastName: 'Smith' } },
    { _id: '3', name: 'Improve Customer Satisfaction', level: 'department', status: 'at_risk', progress: 30, ownerId: { firstName: 'Mike', lastName: 'Johnson' } },
    { _id: '4', name: 'Reduce Churn Rate', level: 'team', status: 'behind', progress: 20, ownerId: { firstName: 'Emma', lastName: 'Wilson' } },
    { _id: '5', name: 'Achieve 10k Users', level: 'company', status: 'not_started', progress: 0, ownerId: { firstName: 'Alex', lastName: 'Brown' } },
    { _id: '6', name: 'Complete Documentation', level: 'department', status: 'completed', progress: 100, ownerId: { firstName: 'Lisa', lastName: 'Davis' } },
  ];

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="gd-status-icon gd-icon-green" />;
    if (status === 'at_risk' || status === 'behind') return <AlertCircle className="gd-status-icon gd-icon-red" />;
    if (status === 'on_track') return <TrendingUp className="gd-status-icon gd-icon-green" />;
    if (status === 'in_progress') return <Activity className="gd-status-icon gd-icon-blue" />;
    return <Clock className="gd-status-icon gd-icon-gray" />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'not_started': 'Not Started',
      'in_progress': 'In Progress',
      'on_track': 'On Track',
      'at_risk': 'At Risk',
      'behind': 'Behind',
      'completed': 'Completed'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'not_started': 'gd-status-not-started',
      'in_progress': 'gd-status-in-progress',
      'on_track': 'gd-status-on-track',
      'at_risk': 'gd-status-at-risk',
      'behind': 'gd-status-behind',
      'completed': 'gd-status-completed'
    };
    return colors[status] || 'gd-status-default';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'gd-progress-green';
    if (progress >= 60) return 'gd-progress-blue';
    if (progress >= 40) return 'gd-progress-yellow';
    return 'gd-progress-red';
  };

  const periodOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' }
  ];

  if (loading) {
    return (
      <div className="gd-loading">
        <div className="gd-spinner"></div>
        <p className="gd-loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="gd-container">
      {/* Header */}
      <div className="gd-header">
        <div className="gd-header-left">
          <div className="gd-title-wrapper">
            <div className="gd-title-icon">
              <BarChart2 className="gd-title-svg" />
            </div>
            <div>
              <h2 className="gd-title">Goal Dashboard</h2>
              <p className="gd-subtitle">Track and monitor goal progress across the organization</p>
            </div>
          </div>
        </div>
        <div className="gd-header-right">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="gd-period-select"
          >
            {periodOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="gd-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`gd-refresh-icon ${refreshing ? 'gd-spin' : ''}`} />
          </button>
          <button className="gd-filter-btn">
            <Filter className="gd-btn-icon" />
            Filter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="gd-stats">
        <div className="gd-stat-card gd-stat-total">
          <div className="gd-stat-content">
            <div className="gd-stat-left">
              <p className="gd-stat-label">Total Goals</p>
              <p className="gd-stat-number">{stats?.total || 0}</p>
              <div className="gd-stat-change gd-change-up">↑ 8% from last {period}</div>
            </div>
            <div className="gd-stat-icon-wrapper gd-stat-icon-blue">
              <Target className="gd-stat-icon" />
            </div>
          </div>
        </div>

        <div className="gd-stat-card gd-stat-track">
          <div className="gd-stat-content">
            <div className="gd-stat-left">
              <p className="gd-stat-label">On Track</p>
              <p className="gd-stat-number gd-number-green">{stats?.onTrack || 0}</p>
              <div className="gd-stat-change gd-change-up">↑ 5% from last {period}</div>
            </div>
            <div className="gd-stat-icon-wrapper gd-stat-icon-green">
              <TrendingUp className="gd-stat-icon" />
            </div>
          </div>
        </div>

        <div className="gd-stat-card gd-stat-risk">
          <div className="gd-stat-content">
            <div className="gd-stat-left">
              <p className="gd-stat-label">At Risk</p>
              <p className="gd-stat-number gd-number-yellow">{stats?.atRisk || 0}</p>
              <div className="gd-stat-change gd-change-down">↑ 2% from last {period}</div>
            </div>
            <div className="gd-stat-icon-wrapper gd-stat-icon-yellow">
              <AlertCircle className="gd-stat-icon" />
            </div>
          </div>
        </div>

        <div className="gd-stat-card gd-stat-progress">
          <div className="gd-stat-content">
            <div className="gd-stat-left">
              <p className="gd-stat-label">Avg Progress</p>
              <p className="gd-stat-number gd-number-purple">{Math.round(stats?.averageProgress || 0)}%</p>
              <div className="gd-stat-change gd-change-up">↑ 3% from last {period}</div>
            </div>
            <div className="gd-stat-icon-wrapper gd-stat-icon-purple">
              <Activity className="gd-stat-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="gd-charts">
        {/* Status Distribution */}
        <div className="gd-chart-card">
          <div className="gd-chart-header">
            <h3 className="gd-chart-title">Status Distribution</h3>
            <span className="gd-chart-badge">Pie Chart</span>
          </div>
          <div className="gd-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <RePieChart>
                <Pie
                  data={stats?.byStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${getStatusLabel(_id)}: ${count}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(stats?.byStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    const item = props.payload;
                    return [`${value} goals`, getStatusLabel(item._id)];
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Level Distribution */}
        <div className="gd-chart-card">
          <div className="gd-chart-header">
            <h3 className="gd-chart-title">Goals by Level</h3>
            <span className="gd-chart-badge">Bar Chart</span>
          </div>
          <div className="gd-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats?.byLevel || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} goals`, 'Count']} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Goals */}
      <div className="gd-recent">
        <div className="gd-recent-header">
          <div className="gd-recent-title-wrapper">
            <h3 className="gd-recent-title">Recent Goals</h3>
            <span className="gd-recent-badge">{goals.length} goals</span>
          </div>
          <button className="gd-recent-view">View All <ChevronRight className="gd-recent-arrow" /></button>
        </div>
        <div className="gd-recent-list">
          {goals.map((goal, index) => (
            <div key={goal._id} className={`gd-recent-item gd-item-${index}`}>
              <div className="gd-recent-item-left">
                <div className={`gd-recent-icon ${getStatusColor(goal.status)}`}>
                  {getStatusIcon(goal.status)}
                </div>
                <div className="gd-recent-info">
                  <p className="gd-recent-name">{goal.name}</p>
                  <p className="gd-recent-meta">
                    <span className="gd-recent-level">{goal.level}</span>
                    <span className="gd-recent-dot">•</span>
                    <span className="gd-recent-owner">
                      {goal.ownerId?.firstName} {goal.ownerId?.lastName}
                    </span>
                  </p>
                </div>
              </div>
              <div className="gd-recent-item-right">
                <div className="gd-recent-progress">
                  <div className="gd-recent-progress-bar">
                    <div 
                      className={`gd-recent-progress-fill ${getProgressColor(goal.progress)}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="gd-recent-progress-text">{goal.progress}%</span>
                </div>
                <span className={`gd-recent-status ${getStatusColor(goal.status)}`}>
                  {getStatusLabel(goal.status)}
                </span>
              </div>
            </div>
          ))}
          {goals.length === 0 && (
            <div className="gd-empty-state">
              <div className="gd-empty-icon-wrapper">
                <Target className="gd-empty-icon" />
              </div>
              <p className="gd-empty-text">No recent goals found</p>
              <p className="gd-empty-subtext">Start creating goals to track progress</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .gd-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
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

        /* ============================================
           HEADER
           ============================================ */
        .gd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .gd-header-left {
          display: flex;
          align-items: center;
        }

        .gd-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .gd-title-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
          animation: gdPulse 2s ease-in-out infinite;
        }

        @keyframes gdPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .gd-title-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .gd-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .gd-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .gd-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .gd-period-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gd-period-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

        .gd-filter-btn {
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

        .gd-filter-btn:hover {
          background: #f1f5f9;
        }

        .gd-btn-icon {
          width: 16px;
          height: 16px;
        }

        .gd-spin {
          animation: gdSpin 1s linear infinite;
        }

        /* ============================================
           STATS
           ============================================ */
        .gd-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .gd-stat-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          animation: gdSlideUp 0.5s ease both;
        }

        .gd-stat-card:nth-child(1) { animation-delay: 0.1s; }
        .gd-stat-card:nth-child(2) { animation-delay: 0.2s; }
        .gd-stat-card:nth-child(3) { animation-delay: 0.3s; }
        .gd-stat-card:nth-child(4) { animation-delay: 0.4s; }

        @keyframes gdSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gd-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .gd-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .gd-stat-left {
          flex: 1;
        }

        .gd-stat-label {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .gd-stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 4px 0 0 0;
          line-height: 1.2;
        }

        .gd-number-green { color: #22c55e; }
        .gd-number-yellow { color: #f59e0b; }
        .gd-number-purple { color: #8b5cf6; }

        .gd-stat-change {
          font-size: 12px;
          margin-top: 4px;
          font-weight: 500;
        }

        .gd-change-up { color: #22c55e; }
        .gd-change-down { color: #ef4444; }

        .gd-stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gd-stat-icon-blue { background: #eff6ff; }
        .gd-stat-icon-green { background: #ecfdf5; }
        .gd-stat-icon-yellow { background: #fef3c7; }
        .gd-stat-icon-purple { background: #f5f3ff; }

        .gd-stat-icon {
          width: 22px;
          height: 22px;
        }

        .gd-stat-icon-blue .gd-stat-icon { color: #3b82f6; }
        .gd-stat-icon-green .gd-stat-icon { color: #22c55e; }
        .gd-stat-icon-yellow .gd-stat-icon { color: #f59e0b; }
        .gd-stat-icon-purple .gd-stat-icon { color: #8b5cf6; }

        .gd-stat-total { border-left: 4px solid #3b82f6; }
        .gd-stat-track { border-left: 4px solid #22c55e; }
        .gd-stat-risk { border-left: 4px solid #f59e0b; }
        .gd-stat-progress { border-left: 4px solid #8b5cf6; }

        /* ============================================
           CHARTS
           ============================================ */
        .gd-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .gd-chart-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .gd-chart-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .gd-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .gd-chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .gd-chart-badge {
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .gd-chart-body {
          width: 100%;
          height: 280px;
        }

        /* ============================================
           RECENT GOALS
           ============================================ */
        .gd-recent {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .gd-recent:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .gd-recent-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .gd-recent-title-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .gd-recent-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .gd-recent-badge {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .gd-recent-view {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 500;
          color: #3b82f6;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gd-recent-view:hover {
          color: #2563eb;
        }

        .gd-recent-arrow {
          width: 16px;
          height: 16px;
        }

        .gd-recent-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .gd-recent-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 8px;
          transition: all 0.3s ease;
          animation: gdSlideUp 0.4s ease both;
        }

        .gd-recent-item:nth-child(1) { animation-delay: 0.05s; }
        .gd-recent-item:nth-child(2) { animation-delay: 0.1s; }
        .gd-recent-item:nth-child(3) { animation-delay: 0.15s; }
        .gd-recent-item:nth-child(4) { animation-delay: 0.2s; }
        .gd-recent-item:nth-child(5) { animation-delay: 0.25s; }

        .gd-recent-item:hover {
          background: #f1f5f9;
          transform: translateX(4px);
        }

        .gd-recent-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .gd-recent-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gd-status-not-started { background: #f1f5f9; color: #64748b; }
        .gd-status-in-progress { background: #dbeafe; color: #3b82f6; }
        .gd-status-on-track { background: #d1fae5; color: #22c55e; }
        .gd-status-at-risk { background: #fef3c7; color: #f59e0b; }
        .gd-status-behind { background: #fee2e2; color: #ef4444; }
        .gd-status-completed { background: #d1fae5; color: #10b981; }

        .gd-status-icon {
          width: 16px;
          height: 16px;
        }

        .gd-icon-green { color: #22c55e; }
        .gd-icon-red { color: #ef4444; }
        .gd-icon-blue { color: #3b82f6; }
        .gd-icon-gray { color: #94a3b8; }

        .gd-recent-info {
          flex: 1;
          min-width: 0;
        }

        .gd-recent-name {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
          margin: 0;
          line-height: 1.3;
        }

        .gd-recent-meta {
          font-size: 12px;
          color: #64748b;
          margin: 2px 0 0 0;
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }

        .gd-recent-level {
          text-transform: capitalize;
        }

        .gd-recent-dot {
          color: #94a3b8;
        }

        .gd-recent-owner {
          color: #64748b;
        }

        .gd-recent-item-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .gd-recent-progress {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gd-recent-progress-bar {
          width: 80px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .gd-recent-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .gd-progress-green { background: #22c55e; }
        .gd-progress-blue { background: #3b82f6; }
        .gd-progress-yellow { background: #f59e0b; }
        .gd-progress-red { background: #ef4444; }

        .gd-recent-progress-text {
          font-size: 12px;
          font-weight: 600;
          color: #0f172a;
          min-width: 36px;
        }

        .gd-recent-status {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 12px;
          white-space: nowrap;
        }

        .gd-status-not-started { background: #f1f5f9; color: #64748b; }
        .gd-status-in-progress { background: #dbeafe; color: #3b82f6; }
        .gd-status-on-track { background: #d1fae5; color: #22c55e; }
        .gd-status-at-risk { background: #fef3c7; color: #f59e0b; }
        .gd-status-behind { background: #fee2e2; color: #ef4444; }
        .gd-status-completed { background: #d1fae5; color: #10b981; }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .gd-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 16px;
          color: #94a3b8;
        }

        .gd-empty-icon-wrapper {
          width: 60px;
          height: 60px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .gd-empty-icon {
          width: 28px;
          height: 28px;
          color: #94a3b8;
        }

        .gd-empty-text {
          font-size: 16px;
          font-weight: 500;
          color: #0f172a;
          margin: 0;
        }

        .gd-empty-subtext {
          font-size: 14px;
          color: #94a3b8;
          margin: 4px 0 0 0;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .gd-charts {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .gd-container {
            padding: 16px;
          }

          .gd-header {
            flex-direction: column;
            align-items: stretch;
          }

          .gd-header-right {
            flex-wrap: wrap;
          }

          .gd-period-select {
            flex: 1;
          }

          .gd-filter-btn {
            flex: 1;
            justify-content: center;
          }

          .gd-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .gd-stat-number {
            font-size: 22px;
          }

          .gd-recent-item {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .gd-recent-item-right {
            justify-content: space-between;
          }

          .gd-recent-progress {
            flex: 1;
          }

          .gd-recent-progress-bar {
            flex: 1;
            width: auto;
          }

          .gd-title {
            font-size: 22px;
          }

          .gd-title-icon {
            width: 40px;
            height: 40px;
          }

          .gd-stat-card {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .gd-container {
            padding: 12px;
          }

          .gd-stats {
            grid-template-columns: 1fr;
          }

          .gd-header-right {
            flex-direction: column;
          }

          .gd-period-select,
          .gd-filter-btn {
            width: 100%;
          }

          .gd-refresh-btn {
            align-self: flex-end;
          }

          .gd-chart-card {
            padding: 16px;
          }

          .gd-chart-body {
            height: 220px;
          }

          .gd-title-wrapper {
            gap: 10px;
          }

          .gd-title {
            font-size: 20px;
          }

          .gd-subtitle {
            font-size: 13px;
          }

          .gd-recent-header {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .gd-recent-view {
            align-self: flex-start;
          }

          .gd-recent-item {
            padding: 10px 12px;
          }

          .gd-recent-name {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default GoalDashboard;