import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, TrendingDown, Clock, AlertCircle,
  CheckCircle, Calendar, Target, Users,
  BarChart2, Activity, RefreshCw, Award, Star,
  Zap, ChevronDown, ChevronRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import toast from 'react-hot-toast';

const GoalProgress = ({ goalId }) => {
  const { token } = useAuth();
  const [progress, setProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [expandedMilestones, setExpandedMilestones] = useState(true);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    if (goalId) {
      fetchProgress();
    }
  }, [goalId, period]);

  const fetchProgress = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Try to fetch from API
      let progressData = null;
      try {
        const response = await fetch(`${API_URL}/goals/${goalId}/progress?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          progressData = data.data;
        }
      } catch (err) {
        console.warn('API not available, using mock data');
        progressData = getMockProgress();
      }

      setProgress(progressData);
      setHistory(progressData?.history || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
      toast.error('Failed to load progress data');
      // Set mock data on error
      const mockData = getMockProgress();
      setProgress(mockData);
      setHistory(mockData?.history || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockProgress = () => ({
    progress: 65,
    status: 'on_track',
    expectedProgress: 60,
    target: { value: 1000000, unit: 'USD' },
    history: [
      { period: 'Jan', progressPercentage: 10, expectedProgress: 15 },
      { period: 'Feb', progressPercentage: 20, expectedProgress: 25 },
      { period: 'Mar', progressPercentage: 35, expectedProgress: 30 },
      { period: 'Apr', progressPercentage: 45, expectedProgress: 40 },
      { period: 'May', progressPercentage: 50, expectedProgress: 50 },
      { period: 'Jun', progressPercentage: 65, expectedProgress: 60 },
    ],
    milestones: [
      { name: 'Phase 1 Complete', targetValue: '25%', achievedValue: '25%', status: 'achieved' },
      { name: 'Phase 2 Complete', targetValue: '50%', achievedValue: '48%', status: 'missed' },
      { name: 'Phase 3 Complete', targetValue: '75%', achievedValue: '65%', status: 'in_progress' },
      { name: 'Final Phase', targetValue: '100%', achievedValue: null, status: 'pending' },
    ]
  });

  const handleRefresh = () => {
    fetchProgress(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'on_track': 'gp-status-on-track',
      'at_risk': 'gp-status-at-risk',
      'behind': 'gp-status-behind',
      'completed': 'gp-status-completed',
      'not_started': 'gp-status-not-started'
    };
    return colors[status] || 'gp-status-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'on_track': 'On Track',
      'at_risk': 'At Risk',
      'behind': 'Behind',
      'completed': 'Completed',
      'not_started': 'Not Started'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="gp-icon gp-icon-green" />;
    if (status === 'at_risk' || status === 'behind') return <AlertCircle className="gp-icon gp-icon-red" />;
    if (status === 'on_track') return <TrendingUp className="gp-icon gp-icon-green" />;
    return <Clock className="gp-icon gp-icon-gray" />;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'gp-progress-green';
    if (progress >= 60) return 'gp-progress-blue';
    if (progress >= 40) return 'gp-progress-yellow';
    return 'gp-progress-red';
  };

  const getProgressLabel = (progress) => {
    if (progress >= 80) return 'Excellent';
    if (progress >= 60) return 'Good';
    if (progress >= 40) return 'Average';
    return 'Needs Attention';
  };

  const getMilestoneStatusColor = (status) => {
    const colors = {
      'achieved': 'gp-milestone-achieved',
      'missed': 'gp-milestone-missed',
      'in_progress': 'gp-milestone-in-progress',
      'pending': 'gp-milestone-pending'
    };
    return colors[status] || 'gp-milestone-pending';
  };

  const getMilestoneStatusLabel = (status) => {
    const labels = {
      'achieved': '✅ Achieved',
      'missed': '❌ Missed',
      'in_progress': '🔄 In Progress',
      'pending': '⏳ Pending'
    };
    return labels[status] || status;
  };

  const periodOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' }
  ];

  if (loading) {
    return (
      <div className="gp-loading">
        <div className="gp-spinner"></div>
        <p className="gp-loading-text">Loading progress data...</p>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="gp-empty">
        <div className="gp-empty-icon-wrapper">
          <Activity className="gp-empty-icon" />
        </div>
        <h4 className="gp-empty-title">No Progress Data</h4>
        <p className="gp-empty-subtitle">No progress data available for this goal</p>
      </div>
    );
  }

  return (
    <div className="gp-container">
      {/* Header */}
      <div className="gp-header">
        <div className="gp-header-left">
          <div className="gp-title-wrapper">
            <div className="gp-title-icon">
              <Target className="gp-title-svg" />
            </div>
            <div>
              <h3 className="gp-title">Goal Progress</h3>
              <p className="gp-subtitle">Track and monitor goal progress</p>
            </div>
          </div>
        </div>
        <div className="gp-header-right">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="gp-period-select"
          >
            {periodOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="gp-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`gp-refresh-icon ${refreshing ? 'gp-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Current Progress */}
      <div className="gp-current">
        <div className="gp-current-header">
          <span className="gp-current-label">Current Progress</span>
          <span className={`gp-current-status ${getStatusColor(progress.status)}`}>
            {getStatusIcon(progress.status)}
            {getStatusLabel(progress.status)}
          </span>
        </div>

        <div className="gp-current-stats">
          <div className="gp-stat">
            <p className="gp-stat-label">Progress</p>
            <p className={`gp-stat-value ${getProgressColor(progress.progress)}`}>
              {progress.progress}%
            </p>
            <span className="gp-stat-badge">{getProgressLabel(progress.progress)}</span>
          </div>
          <div className="gp-stat">
            <p className="gp-stat-label">Expected</p>
            <p className="gp-stat-value gp-stat-expected">{progress.expectedProgress || 0}%</p>
            <span className="gp-stat-badge gp-stat-badge-gray">Target</span>
          </div>
          <div className="gp-stat">
            <p className="gp-stat-label">Status</p>
            <p className={`gp-stat-value gp-stat-status ${getStatusColor(progress.status)}`}>
              {getStatusLabel(progress.status)}
            </p>
            <span className="gp-stat-badge gp-stat-badge-gray">Current</span>
          </div>
          <div className="gp-stat">
            <p className="gp-stat-label">Target</p>
            <p className="gp-stat-value gp-stat-target">
              {progress.target?.value} {progress.target?.unit}
            </p>
            <span className="gp-stat-badge gp-stat-badge-gray">Goal</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="gp-progress-wrapper">
          <div className="gp-progress-bar">
            <div 
              className={`gp-progress-fill ${getProgressColor(progress.progress)}`}
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <div className="gp-progress-labels">
            <span className="gp-progress-label">0%</span>
            <span className="gp-progress-label gp-progress-expected">
              Expected: {progress.expectedProgress || 0}%
            </span>
            <span className="gp-progress-label">100%</span>
          </div>
          <div className="gp-progress-marker" style={{ left: `${progress.progress}%` }}>
            <div className="gp-progress-marker-dot" />
            <span className="gp-progress-marker-text">{progress.progress}%</span>
          </div>
        </div>

        {/* Progress Difference */}
        <div className="gp-diff">
          {progress.progress >= (progress.expectedProgress || 0) ? (
            <div className="gp-diff-positive">
              <TrendingUp className="gp-diff-icon" />
              <span>
                Ahead of target by {Math.abs(progress.progress - (progress.expectedProgress || 0))}%
              </span>
            </div>
          ) : (
            <div className="gp-diff-negative">
              <TrendingDown className="gp-diff-icon" />
              <span>
                Behind target by {Math.abs(progress.progress - (progress.expectedProgress || 0))}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Chart */}
      {history.length > 0 && (
        <div className="gp-chart">
          <div className="gp-chart-header">
            <h4 className="gp-chart-title">Progress Trend</h4>
            <span className="gp-chart-badge">Area Chart</span>
          </div>
          <div className="gp-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="gpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="gpGradientExpected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="progressPercentage"
                  name="Actual Progress"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gpGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="expectedProgress"
                  name="Expected Progress"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#gpGradientExpected)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Milestones */}
      {progress.milestones && progress.milestones.length > 0 && (
        <div className="gp-milestones">
          <div className="gp-milestones-header" onClick={() => setExpandedMilestones(!expandedMilestones)}>
            <div className="gp-milestones-title-wrapper">
              <Award className="gp-milestones-icon" />
              <h4 className="gp-milestones-title">Milestones</h4>
              <span className="gp-milestones-count">{progress.milestones.length}</span>
            </div>
            <button className="gp-milestones-toggle">
              {expandedMilestones ? (
                <ChevronDown className="gp-toggle-icon" />
              ) : (
                <ChevronRight className="gp-toggle-icon" />
              )}
            </button>
          </div>

          {expandedMilestones && (
            <div className="gp-milestones-list">
              {progress.milestones.map((milestone, idx) => (
                <div key={idx} className={`gp-milestone ${getMilestoneStatusColor(milestone.status)}`}>
                  <div className="gp-milestone-left">
                    <div className={`gp-milestone-dot ${getMilestoneStatusColor(milestone.status)}`} />
                    <div className="gp-milestone-info">
                      <p className="gp-milestone-name">{milestone.name}</p>
                      <p className="gp-milestone-meta">
                        Target: {milestone.targetValue} • 
                        Achieved: {milestone.achievedValue || 'Not yet'}
                      </p>
                    </div>
                  </div>
                  <span className={`gp-milestone-status ${getMilestoneStatusColor(milestone.status)}`}>
                    {getMilestoneStatusLabel(milestone.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .gp-container {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          animation: gpFadeIn 0.4s ease;
        }

        @keyframes gpFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .gp-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 0;
          gap: 16px;
        }

        .gp-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: gpSpin 0.8s linear infinite;
        }

        .gp-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes gpSpin {
          to { transform: rotate(360deg); }
        }

        .gp-spin {
          animation: gpSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .gp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .gp-header-left {
          display: flex;
          align-items: center;
        }

        .gp-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .gp-title-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .gp-title-svg {
          width: 20px;
          height: 20px;
          color: #ffffff;
        }

        .gp-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .gp-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .gp-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gp-period-select {
          padding: 6px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gp-period-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .gp-refresh-btn {
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

        .gp-refresh-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .gp-refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .gp-refresh-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           CURRENT PROGRESS
           ============================================ */
        .gp-current {
          background: #f8fafc;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 20px;
          border: 1px solid #f1f5f9;
        }

        .gp-current-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .gp-current-label {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .gp-current-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
        }

        .gp-status-on-track { background: #d1fae5; color: #22c55e; }
        .gp-status-at-risk { background: #fef3c7; color: #f59e0b; }
        .gp-status-behind { background: #fee2e2; color: #ef4444; }
        .gp-status-completed { background: #d1fae5; color: #10b981; }
        .gp-status-not-started { background: #f1f5f9; color: #64748b; }

        .gp-current-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .gp-stat {
          text-align: center;
        }

        .gp-stat-label {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }

        .gp-stat-value {
          font-size: 22px;
          font-weight: 700;
          margin: 2px 0 0 0;
        }

        .gp-stat-expected { color: #0f172a; }
        .gp-stat-target { color: #8b5cf6; }
        .gp-stat-status { font-size: 16px; }

        .gp-stat-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 500;
          padding: 1px 8px;
          border-radius: 10px;
          margin-top: 2px;
        }

        .gp-stat-badge-gray { background: #f1f5f9; color: #64748b; }

        .gp-progress-green { color: #22c55e; }
        .gp-progress-blue { color: #3b82f6; }
        .gp-progress-yellow { color: #f59e0b; }
        .gp-progress-red { color: #ef4444; }

        /* Progress Bar */
        .gp-progress-wrapper {
          position: relative;
          margin-bottom: 4px;
        }

        .gp-progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 6px;
          overflow: visible;
          position: relative;
        }

        .gp-progress-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.8s ease;
          position: relative;
        }

        .gp-progress-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
          font-size: 11px;
          color: #94a3b8;
        }

        .gp-progress-expected {
          color: #64748b;
          font-weight: 500;
        }

        .gp-progress-marker {
          position: absolute;
          top: -20px;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: left 0.8s ease;
        }

        .gp-progress-marker-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        }

        .gp-progress-marker-text {
          font-size: 10px;
          font-weight: 600;
          color: #0f172a;
          margin-top: 2px;
        }

        .gp-diff {
          margin-top: 12px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .gp-diff-positive {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #22c55e;
        }

        .gp-diff-negative {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ef4444;
        }

        .gp-diff-icon {
          width: 18px;
          height: 18px;
        }

        /* ============================================
           CHART
           ============================================ */
        .gp-chart {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .gp-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .gp-chart-title {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .gp-chart-badge {
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .gp-chart-body {
          width: 100%;
          height: 280px;
        }

        /* ============================================
           MILESTONES
           ============================================ */
        .gp-milestones {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 10px;
          overflow: hidden;
        }

        .gp-milestones-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gp-milestones-header:hover {
          background: #f1f5f9;
        }

        .gp-milestones-title-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .gp-milestones-icon {
          width: 20px;
          height: 20px;
          color: #f59e0b;
        }

        .gp-milestones-title {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .gp-milestones-count {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          background: #ffffff;
          padding: 1px 10px;
          border-radius: 12px;
        }

        .gp-milestones-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gp-milestones-toggle:hover {
          color: #475569;
        }

        .gp-toggle-icon {
          width: 18px;
          height: 18px;
        }

        .gp-milestones-list {
          padding: 0 18px 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: gpSlideDown 0.3s ease;
        }

        @keyframes gpSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gp-milestone {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
          transition: all 0.2s ease;
        }

        .gp-milestone:hover {
          border-color: #e2e8f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .gp-milestone-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .gp-milestone-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .gp-milestone-achieved .gp-milestone-dot { background: #22c55e; }
        .gp-milestone-missed .gp-milestone-dot { background: #ef4444; }
        .gp-milestone-in-progress .gp-milestone-dot { background: #f59e0b; }
        .gp-milestone-pending .gp-milestone-dot { background: #94a3b8; }

        .gp-milestone-info {
          flex: 1;
        }

        .gp-milestone-name {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
          margin: 0;
        }

        .gp-milestone-meta {
          font-size: 12px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .gp-milestone-status {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 12px;
          white-space: nowrap;
        }

        .gp-milestone-achieved { border-left: 3px solid #22c55e; }
        .gp-milestone-missed { border-left: 3px solid #ef4444; }
        .gp-milestone-in-progress { border-left: 3px solid #f59e0b; }
        .gp-milestone-pending { border-left: 3px solid #94a3b8; }

        .gp-milestone-achieved .gp-milestone-status { background: #d1fae5; color: #22c55e; }
        .gp-milestone-missed .gp-milestone-status { background: #fee2e2; color: #ef4444; }
        .gp-milestone-in-progress .gp-milestone-status { background: #fef3c7; color: #f59e0b; }
        .gp-milestone-pending .gp-milestone-status { background: #f1f5f9; color: #94a3b8; }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .gp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }

        .gp-empty-icon-wrapper {
          width: 72px;
          height: 72px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .gp-empty-icon {
          width: 32px;
          height: 32px;
          color: #94a3b8;
        }

        .gp-empty-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .gp-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .gp-container {
            padding: 16px;
          }

          .gp-header {
            flex-direction: column;
            align-items: stretch;
          }

          .gp-header-right {
            justify-content: stretch;
          }

          .gp-period-select {
            flex: 1;
          }

          .gp-current-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .gp-stat-value {
            font-size: 18px;
          }

          .gp-milestone {
            flex-direction: column;
            align-items: stretch;
            gap: 6px;
          }

          .gp-milestone-status {
            align-self: flex-start;
          }

          .gp-progress-marker {
            display: none;
          }

          .gp-title-wrapper {
            gap: 10px;
          }

          .gp-title-icon {
            width: 34px;
            height: 34px;
          }

          .gp-title-svg {
            width: 16px;
            height: 16px;
          }

          .gp-title {
            font-size: 16px;
          }

          .gp-chart-body {
            height: 220px;
          }
        }

        @media (max-width: 480px) {
          .gp-container {
            padding: 12px;
          }

          .gp-current {
            padding: 12px 14px;
          }

          .gp-current-stats {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .gp-stat-value {
            font-size: 16px;
          }

          .gp-progress-labels {
            font-size: 10px;
          }

          .gp-milestones-header {
            padding: 10px 14px;
          }

          .gp-milestones-list {
            padding: 0 14px 12px 14px;
          }

          .gp-milestone {
            padding: 8px 12px;
          }

          .gp-milestone-name {
            font-size: 13px;
          }

          .gp-milestone-meta {
            font-size: 11px;
          }

          .gp-chart-body {
            height: 180px;
          }

          .gp-header-right {
            flex-direction: column;
          }

          .gp-refresh-btn {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default GoalProgress;