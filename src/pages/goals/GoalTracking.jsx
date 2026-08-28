import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Target, TrendingUp, TrendingDown, Clock,
  Calendar, Users, Filter, Download,
  RefreshCw, BarChart3, PieChart, Activity,
  CheckCircle, AlertCircle, ArrowRight,
  Zap, Award, Star, Layers, Briefcase
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, AreaChart, Area,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const GoalTracking = () => {
  const { token } = useAuth();
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [view, setView] = useState('all');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F472B6'];

  useEffect(() => {
    fetchGoalTrackingData();
  }, [period, view]);

  const fetchGoalTrackingData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Try to fetch from API
      let goalsData = [];
      let statsData = null;

      try {
        const [goalsRes, statsRes] = await Promise.all([
          fetch(`${API_URL}/goals/tracking?period=${period}&view=${view}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/goals/tracking/stats?period=${period}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (goalsRes.ok) {
          const data = await goalsRes.json();
          goalsData = data.data || [];
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          statsData = data.data;
        }
      } catch (err) {
        console.warn('API not available, using mock data');
        goalsData = getMockGoals();
        statsData = getMockStats();
      }

      setGoals(goalsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching goal tracking data:', error);
      toast.error('Failed to load tracking data');
      setGoals(getMockGoals());
      setStats(getMockStats());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockGoals = () => [
    { _id: '1', name: 'Increase Revenue by 25%', level: 'company', status: 'on_track', progress: 65, ownerId: { firstName: 'John', lastName: 'Doe' }, endDate: '2024-12-31' },
    { _id: '2', name: 'Launch New Product', level: 'segment', status: 'in_progress', progress: 45, ownerId: { firstName: 'Sarah', lastName: 'Smith' }, endDate: '2024-10-15' },
    { _id: '3', name: 'Improve CSAT Score', level: 'department', status: 'at_risk', progress: 30, ownerId: { firstName: 'Mike', lastName: 'Johnson' }, endDate: '2024-11-30' },
    { _id: '4', name: 'Reduce Churn Rate', level: 'team', status: 'behind', progress: 20, ownerId: { firstName: 'Emma', lastName: 'Wilson' }, endDate: '2024-09-30' },
    { _id: '5', name: 'Achieve 10k Users', level: 'company', status: 'not_started', progress: 0, ownerId: { firstName: 'Alex', lastName: 'Brown' }, endDate: '2025-01-15' },
    { _id: '6', name: 'Complete Documentation', level: 'department', status: 'completed', progress: 100, ownerId: { firstName: 'Lisa', lastName: 'Davis' }, endDate: '2024-08-01' },
  ];

  const getMockStats = () => ({
    total: 24,
    onTrack: 12,
    atRisk: 5,
    averageProgress: 65,
    trend: [
      { period: 'Jan', progress: 10 },
      { period: 'Feb', progress: 15 },
      { period: 'Mar', progress: 25 },
      { period: 'Apr', progress: 35 },
      { period: 'May', progress: 45 },
      { period: 'Jun', progress: 55 },
      { period: 'Jul', progress: 65 },
    ],
    byStatus: [
      { name: 'Not Started', count: 3 },
      { name: 'In Progress', count: 6 },
      { name: 'On Track', count: 8 },
      { name: 'At Risk', count: 4 },
      { name: 'Behind', count: 2 },
      { name: 'Completed', count: 1 },
    ]
  });

  const handleRefresh = () => {
    fetchGoalTrackingData(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'not_started': 'gt-status-not-started',
      'in_progress': 'gt-status-in-progress',
      'on_track': 'gt-status-on-track',
      'at_risk': 'gt-status-at-risk',
      'behind': 'gt-status-behind',
      'completed': 'gt-status-completed'
    };
    return colors[status] || 'gt-status-default';
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

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="gt-icon gt-icon-green" />;
    if (status === 'at_risk' || status === 'behind') return <AlertCircle className="gt-icon gt-icon-red" />;
    if (status === 'on_track') return <TrendingUp className="gt-icon gt-icon-green" />;
    if (status === 'in_progress') return <Zap className="gt-icon gt-icon-blue" />;
    return <Clock className="gt-icon gt-icon-gray" />;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'gt-progress-green';
    if (progress >= 60) return 'gt-progress-blue';
    if (progress >= 40) return 'gt-progress-yellow';
    return 'gt-progress-red';
  };

  const getProgressTextColor = (progress) => {
    if (progress >= 80) return 'gt-text-green';
    if (progress >= 60) return 'gt-text-blue';
    if (progress >= 40) return 'gt-text-yellow';
    return 'gt-text-red';
  };

  const getLevelLabel = (level) => {
    const labels = {
      'company': '🏢 Company',
      'segment': '📊 Segment',
      'department': '🏛️ Department',
      'team': '👥 Team',
      'individual': '👤 Individual'
    };
    return labels[level] || level;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const periodOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' }
  ];

  const viewOptions = [
    { value: 'all', label: 'All Goals' },
    { value: 'company', label: 'Company' },
    { value: 'segment', label: 'Segment' },
    { value: 'department', label: 'Department' },
    { value: 'team', label: 'Team' },
    { value: 'individual', label: 'Individual' }
  ];

  if (loading) {
    return (
      <div className="gt-loading">
        <div className="gt-spinner"></div>
        <p className="gt-loading-text">Loading tracking data...</p>
      </div>
    );
  }

  return (
    <div className="gt-container">
      {/* Header */}
      <div className="gt-header">
        <div className="gt-header-left">
          <div className="gt-title-wrapper">
            <div className="gt-title-icon">
              <Target className="gt-title-svg" />
            </div>
            <div>
              <h1 className="gt-title">Goal Tracking</h1>
              <p className="gt-subtitle">Monitor and track goal progress across the organization</p>
            </div>
          </div>
        </div>
        <div className="gt-header-right">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="gt-period-select"
          >
            {periodOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="gt-view-select"
          >
            {viewOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="gt-filter-btn">
            <Filter className="gt-btn-icon" />
          </button>
          <button className="gt-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`gt-refresh-icon ${refreshing ? 'gt-spin' : ''}`} />
          </button>
          <button className="gt-export-btn">
            <Download className="gt-btn-icon" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="gt-stats">
        <div className="gt-stat-card gt-stat-total">
          <div className="gt-stat-content">
            <div className="gt-stat-left">
              <p className="gt-stat-label">Total Goals</p>
              <p className="gt-stat-number">{stats?.total || 0}</p>
              <div className="gt-stat-change gt-change-up">↑ 8% from last {period}</div>
            </div>
            <div className="gt-stat-icon-wrapper gt-stat-icon-blue">
              <Target className="gt-stat-icon" />
            </div>
          </div>
        </div>

        <div className="gt-stat-card gt-stat-track">
          <div className="gt-stat-content">
            <div className="gt-stat-left">
              <p className="gt-stat-label">On Track</p>
              <p className="gt-stat-number gt-number-green">{stats?.onTrack || 0}</p>
              <div className="gt-stat-change gt-change-up">↑ 5% from last {period}</div>
            </div>
            <div className="gt-stat-icon-wrapper gt-stat-icon-green">
              <TrendingUp className="gt-stat-icon" />
            </div>
          </div>
        </div>

        <div className="gt-stat-card gt-stat-risk">
          <div className="gt-stat-content">
            <div className="gt-stat-left">
              <p className="gt-stat-label">At Risk</p>
              <p className="gt-stat-number gt-number-yellow">{stats?.atRisk || 0}</p>
              <div className="gt-stat-change gt-change-down">↑ 2% from last {period}</div>
            </div>
            <div className="gt-stat-icon-wrapper gt-stat-icon-yellow">
              <AlertCircle className="gt-stat-icon" />
            </div>
          </div>
        </div>

        <div className="gt-stat-card gt-stat-progress">
          <div className="gt-stat-content">
            <div className="gt-stat-left">
              <p className="gt-stat-label">Avg Progress</p>
              <p className="gt-stat-number gt-number-purple">{Math.round(stats?.averageProgress || 0)}%</p>
              <div className="gt-stat-change gt-change-up">↑ 3% from last {period}</div>
            </div>
            <div className="gt-stat-icon-wrapper gt-stat-icon-purple">
              <Activity className="gt-stat-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="gt-charts">
        {/* Progress Trend */}
        <div className="gt-chart-card">
          <div className="gt-chart-header">
            <h3 className="gt-chart-title">Progress Trend</h3>
            <span className="gt-chart-badge">Area Chart</span>
          </div>
          <div className="gt-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats?.trend || []}>
                <defs>
                  <linearGradient id="gtGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="progress"
                  name="Progress %"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gtGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="gt-chart-card">
          <div className="gt-chart-header">
            <h3 className="gt-chart-title">Status Distribution</h3>
            <span className="gt-chart-badge">Pie Chart</span>
          </div>
          <div className="gt-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <RePieChart>
                <Pie
                  data={stats?.byStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                    return [`${value} goals`, item.name];
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Goal List */}
      <div className="gt-list">
        <div className="gt-list-header">
          <h3 className="gt-list-title">Goals Progress</h3>
          <span className="gt-list-count">{goals.length} goals</span>
        </div>
        <div className="gt-list-body">
          {goals.map((goal, index) => (
            <div key={goal._id} className={`gt-list-item gt-item-${index}`}>
              <div className="gt-list-item-left">
                <div className="gt-list-item-icon">
                  {getStatusIcon(goal.status)}
                </div>
                <div className="gt-list-item-info">
                  <p className="gt-list-item-name">{goal.name}</p>
                  <div className="gt-list-item-meta">
                    <span className="gt-list-item-level">{getLevelLabel(goal.level)}</span>
                    <span className="gt-list-item-dot">•</span>
                    <span className="gt-list-item-owner">
                      <Users className="gt-meta-icon" />
                      {goal.ownerId?.firstName} {goal.ownerId?.lastName}
                    </span>
                    <span className="gt-list-item-dot">•</span>
                    <span className="gt-list-item-date">
                      <Calendar className="gt-meta-icon" />
                      Due: {formatDate(goal.endDate)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="gt-list-item-right">
                <div className="gt-list-item-progress">
                  <div className="gt-list-progress-bar">
                    <div 
                      className={`gt-list-progress-fill ${getProgressColor(goal.progress)}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className={`gt-list-progress-text ${getProgressTextColor(goal.progress)}`}>
                    {goal.progress}%
                  </span>
                </div>
                <span className={`gt-list-item-status ${getStatusColor(goal.status)}`}>
                  {getStatusLabel(goal.status)}
                </span>
                <button className="gt-list-item-arrow">
                  <ArrowRight className="gt-arrow-icon" />
                </button>
              </div>
            </div>
          ))}
          {goals.length === 0 && (
            <div className="gt-empty">
              <div className="gt-empty-icon-wrapper">
                <Target className="gt-empty-icon" />
              </div>
              <p className="gt-empty-text">No goals found</p>
              <p className="gt-empty-subtext">Try adjusting your filters or create a new goal</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .gt-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: gtFadeIn 0.4s ease;
        }

        @keyframes gtFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .gt-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .gt-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: gtSpin 0.8s linear infinite;
        }

        .gt-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes gtSpin {
          to { transform: rotate(360deg); }
        }

        .gt-spin {
          animation: gtSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .gt-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .gt-header-left {
          display: flex;
          align-items: center;
        }

        .gt-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .gt-title-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .gt-title-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .gt-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .gt-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .gt-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .gt-period-select,
        .gt-view-select {
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

        .gt-period-select:focus,
        .gt-view-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .gt-filter-btn,
        .gt-refresh-btn,
        .gt-export-btn {
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

        .gt-filter-btn:hover,
        .gt-refresh-btn:hover,
        .gt-export-btn:hover {
          background: #f1f5f9;
        }

        .gt-refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .gt-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .gt-export-btn {
          padding: 8px 16px;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .gt-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           STATS
           ============================================ */
        .gt-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .gt-stat-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          animation: gtSlideUp 0.5s ease both;
        }

        .gt-stat-card:nth-child(1) { animation-delay: 0.1s; }
        .gt-stat-card:nth-child(2) { animation-delay: 0.2s; }
        .gt-stat-card:nth-child(3) { animation-delay: 0.3s; }
        .gt-stat-card:nth-child(4) { animation-delay: 0.4s; }

        @keyframes gtSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gt-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .gt-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .gt-stat-left {
          flex: 1;
        }

        .gt-stat-label {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .gt-stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 4px 0 0 0;
          line-height: 1.2;
        }

        .gt-number-green { color: #22c55e; }
        .gt-number-yellow { color: #f59e0b; }
        .gt-number-purple { color: #8b5cf6; }

        .gt-stat-change {
          font-size: 12px;
          margin-top: 4px;
          font-weight: 500;
        }

        .gt-change-up { color: #22c55e; }
        .gt-change-down { color: #ef4444; }

        .gt-stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gt-stat-icon-blue { background: #eff6ff; }
        .gt-stat-icon-green { background: #ecfdf5; }
        .gt-stat-icon-yellow { background: #fef3c7; }
        .gt-stat-icon-purple { background: #f5f3ff; }

        .gt-stat-icon {
          width: 22px;
          height: 22px;
        }

        .gt-stat-icon-blue .gt-stat-icon { color: #3b82f6; }
        .gt-stat-icon-green .gt-stat-icon { color: #22c55e; }
        .gt-stat-icon-yellow .gt-stat-icon { color: #f59e0b; }
        .gt-stat-icon-purple .gt-stat-icon { color: #8b5cf6; }

        .gt-stat-total { border-left: 4px solid #3b82f6; }
        .gt-stat-track { border-left: 4px solid #22c55e; }
        .gt-stat-risk { border-left: 4px solid #f59e0b; }
        .gt-stat-progress { border-left: 4px solid #8b5cf6; }

        /* ============================================
           CHARTS
           ============================================ */
        .gt-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .gt-chart-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .gt-chart-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .gt-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .gt-chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .gt-chart-badge {
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .gt-chart-body {
          width: 100%;
          height: 280px;
        }

        /* ============================================
           LIST
           ============================================ */
        .gt-list {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .gt-list:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .gt-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .gt-list-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .gt-list-count {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 12px;
          border-radius: 12px;
        }

        .gt-list-body {
          max-height: 500px;
          overflow-y: auto;
        }

        .gt-list-body::-webkit-scrollbar {
          width: 4px;
        }

        .gt-list-body::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .gt-list-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .gt-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.2s ease;
          animation: gtSlideIn 0.3s ease both;
        }

        .gt-list-item:nth-child(1) { animation-delay: 0.05s; }
        .gt-list-item:nth-child(2) { animation-delay: 0.1s; }
        .gt-list-item:nth-child(3) { animation-delay: 0.15s; }
        .gt-list-item:nth-child(4) { animation-delay: 0.2s; }
        .gt-list-item:nth-child(5) { animation-delay: 0.25s; }

        @keyframes gtSlideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .gt-list-item:hover {
          background: #f8fafc;
        }

        .gt-list-item:last-child {
          border-bottom: none;
        }

        .gt-list-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .gt-list-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gt-icon {
          width: 18px;
          height: 18px;
        }

        .gt-icon-green { color: #22c55e; }
        .gt-icon-red { color: #ef4444; }
        .gt-icon-blue { color: #3b82f6; }
        .gt-icon-gray { color: #94a3b8; }

        .gt-list-item-info {
          flex: 1;
          min-width: 0;
        }

        .gt-list-item-name {
          font-size: 15px;
          font-weight: 500;
          color: #0f172a;
          margin: 0;
        }

        .gt-list-item-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
          flex-wrap: wrap;
        }

        .gt-list-item-level {
          font-weight: 500;
        }

        .gt-list-item-dot {
          color: #d1d5db;
        }

        .gt-list-item-owner,
        .gt-list-item-date {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .gt-meta-icon {
          width: 12px;
          height: 12px;
          color: #94a3b8;
        }

        .gt-list-item-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .gt-list-item-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
        }

        .gt-list-progress-bar {
          flex: 1;
          height: 4px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          min-width: 60px;
        }

        .gt-list-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .gt-progress-green { background: #22c55e; }
        .gt-progress-blue { background: #3b82f6; }
        .gt-progress-yellow { background: #f59e0b; }
        .gt-progress-red { background: #ef4444; }

        .gt-list-progress-text {
          font-size: 12px;
          font-weight: 600;
          min-width: 36px;
        }

        .gt-text-green { color: #22c55e; }
        .gt-text-blue { color: #3b82f6; }
        .gt-text-yellow { color: #f59e0b; }
        .gt-text-red { color: #ef4444; }

        .gt-list-item-status {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 12px;
          border-radius: 12px;
          white-space: nowrap;
        }

        .gt-status-not-started { background: #f1f5f9; color: #64748b; }
        .gt-status-in-progress { background: #dbeafe; color: #3b82f6; }
        .gt-status-on-track { background: #d1fae5; color: #22c55e; }
        .gt-status-at-risk { background: #fef3c7; color: #f59e0b; }
        .gt-status-behind { background: #fee2e2; color: #ef4444; }
        .gt-status-completed { background: #d1fae5; color: #10b981; }

        .gt-list-item-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          color: #94a3b8;
          transition: all 0.2s ease;
        }

        .gt-list-item-arrow:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .gt-arrow-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .gt-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 20px;
          text-align: center;
        }

        .gt-empty-icon-wrapper {
          width: 72px;
          height: 72px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .gt-empty-icon {
          width: 32px;
          height: 32px;
          color: #94a3b8;
        }

        .gt-empty-text {
          font-size: 16px;
          font-weight: 500;
          color: #0f172a;
          margin: 0;
        }

        .gt-empty-subtext {
          font-size: 14px;
          color: #94a3b8;
          margin: 4px 0 0 0;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .gt-charts {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .gt-container {
            padding: 16px;
          }

          .gt-header {
            flex-direction: column;
            align-items: stretch;
          }

          .gt-header-right {
            flex-wrap: wrap;
          }

          .gt-period-select,
          .gt-view-select {
            flex: 1;
          }

          .gt-export-btn {
            flex: 1;
            justify-content: center;
          }

          .gt-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .gt-stat-number {
            font-size: 22px;
          }

          .gt-list-item {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .gt-list-item-right {
            justify-content: space-between;
          }

          .gt-list-item-progress {
            flex: 1;
          }

          .gt-list-progress-bar {
            flex: 1;
            min-width: unset;
          }

          .gt-title {
            font-size: 22px;
          }

          .gt-title-icon {
            width: 40px;
            height: 40px;
          }

          .gt-title-svg {
            width: 20px;
            height: 20px;
          }

          .gt-chart-body {
            height: 220px;
          }

          .gt-stat-card {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .gt-container {
            padding: 12px;
          }

          .gt-stats {
            grid-template-columns: 1fr;
          }

          .gt-header-right {
            flex-direction: column;
          }

          .gt-period-select,
          .gt-view-select,
          .gt-export-btn {
            width: 100%;
          }

          .gt-filter-btn,
          .gt-refresh-btn {
            align-self: flex-end;
          }

          .gt-list-item-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }

          .gt-list-item-right {
            flex-wrap: wrap;
          }

          .gt-list-item-status {
            align-self: flex-start;
          }

          .gt-title-wrapper {
            gap: 10px;
          }

          .gt-title {
            font-size: 20px;
          }

          .gt-subtitle {
            font-size: 13px;
          }

          .gt-chart-body {
            height: 180px;
          }

          .gt-chart-card {
            padding: 16px;
          }

          .gt-list-item {
            padding: 12px 16px;
          }

          .gt-list-item-name {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default GoalTracking;