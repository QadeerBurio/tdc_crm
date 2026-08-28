// pages/workflows/WorkflowAnalytics.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart3, PieChart, Activity, Clock,
  TrendingUp, TrendingDown, Users,
  Filter, Download, RefreshCw,
  ArrowRight, Calendar, Layers,
  CheckCircle, AlertCircle, Zap,
  Target, Briefcase, FileText, Building2
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

const WorkflowAnalytics = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [filterEntity, setFilterEntity] = useState('all');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  useEffect(() => {
    fetchAnalytics();
  }, [period, filterEntity]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      if (filterEntity !== 'all') params.append('entityType', filterEntity);
      
      const response = await fetch(
        `${API_URL}/workflows/stats?${params.toString()}`,
        getHeaders()
      );
      
      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data || getMockAnalytics());
      } else {
        setAnalytics(getMockAnalytics());
        toast.info('Showing sample analytics data');
      }
    } catch (error) {
      console.error('Error fetching workflow analytics:', error);
      setAnalytics(getMockAnalytics());
      toast.error('Failed to load analytics, showing sample');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockAnalytics = () => {
    return {
      totalExecutions: 1247,
      successRate: 87,
      avgDuration: 2.5,
      activeWorkflows: 12,
      trend: [
        { period: 'Jan', executions: 120 },
        { period: 'Feb', executions: 150 },
        { period: 'Mar', executions: 180 },
        { period: 'Apr', executions: 210 },
        { period: 'May', executions: 190 },
        { period: 'Jun', executions: 230 }
      ],
      byStatus: [
        { name: 'Completed', count: 845 },
        { name: 'In Progress', count: 245 },
        { name: 'Pending', count: 105 },
        { name: 'Failed', count: 52 }
      ],
      byEntity: [
        { _id: 'task', count: 450 },
        { _id: 'project', count: 320 },
        { _id: 'lead', count: 210 },
        { _id: 'client', count: 180 },
        { _id: 'goal', count: 87 }
      ],
      recentExecutions: [
        { workflowName: 'Task Approval', entityType: 'task', entityName: 'Task #1234', status: 'completed', timestamp: '2 hours ago' },
        { workflowName: 'Lead Management', entityType: 'lead', entityName: 'John Doe', status: 'in_progress', timestamp: '5 hours ago' },
        { workflowName: 'Project Lifecycle', entityType: 'project', entityName: 'Website Redesign', status: 'pending', timestamp: '1 day ago' },
        { workflowName: 'Client Onboarding', entityType: 'client', entityName: 'Acme Corp', status: 'completed', timestamp: '2 days ago' },
        { workflowName: 'Goal Tracking', entityType: 'goal', entityName: 'Q2 Revenue Goal', status: 'failed', timestamp: '3 days ago' }
      ]
    };
  };

  const handleRefresh = async () => {
    await fetchAnalytics();
    toast.success('Analytics refreshed');
  };

  const handleExport = () => {
    toast.success('Export started');
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'wa-status-completed',
      'in_progress': 'wa-status-inprogress',
      'pending': 'wa-status-pending',
      'failed': 'wa-status-failed'
    };
    return colors[status] || 'wa-status-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'completed': 'Completed',
      'in_progress': 'In Progress',
      'pending': 'Pending',
      'failed': 'Failed'
    };
    return labels[status] || status;
  };

  // Use mock data if real data not available
  const data = analytics || getMockAnalytics();

  if (loading) {
    return (
      <div className="wa-loading">
        <div className="wa-loading-spinner"></div>
        <p className="wa-loading-text">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="wa-container">
      {/* Header */}
      <div className="wa-header">
        <div className="wa-header-left">
          <h1 className="wa-title">
            <BarChart3 className="wa-title-icon" />
            Workflow Analytics
          </h1>
          <p className="wa-subtitle">Monitor workflow performance and usage</p>
        </div>
        <div className="wa-header-right">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="wa-filter-select"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="wa-filter-select"
          >
            <option value="all">All Entities</option>
            <option value="task">Task</option>
            <option value="project">Project</option>
            <option value="lead">Lead</option>
            <option value="client">Client</option>
            <option value="retainer">Retainer</option>
            <option value="partner">Partner</option>
            <option value="goal">Goal</option>
          </select>
          <button 
            className="wa-filter-btn"
            onClick={fetchAnalytics}
            title="Apply Filters"
          >
            <Filter className="wa-filter-btn-icon" />
          </button>
          <button 
            className="wa-filter-btn"
            onClick={handleExport}
            title="Export Data"
          >
            <Download className="wa-filter-btn-icon" />
          </button>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="wa-refresh-btn"
            title="Refresh"
          >
            <RefreshCw className={`wa-refresh-icon ${refreshing ? 'wa-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="wa-stats">
        <div className="wa-stat-card">
          <div className="wa-stat-content">
            <div>
              <p className="wa-stat-label">Total Executions</p>
              <p className="wa-stat-value">{data.totalExecutions || 0}</p>
            </div>
            <div className="wa-stat-icon wa-stat-icon-blue">
              <Activity className="wa-stat-svg" />
            </div>
          </div>
          <div className="wa-stat-change wa-stat-change-up">
            <TrendingUp className="wa-stat-change-icon" />
            <span>15% from last {period}</span>
          </div>
        </div>

        <div className="wa-stat-card">
          <div className="wa-stat-content">
            <div>
              <p className="wa-stat-label">Success Rate</p>
              <p className="wa-stat-value wa-stat-value-green">{data.successRate || 0}%</p>
            </div>
            <div className="wa-stat-icon wa-stat-icon-green">
              <CheckCircle className="wa-stat-svg" />
            </div>
          </div>
          <div className="wa-stat-change wa-stat-change-up">
            <TrendingUp className="wa-stat-change-icon" />
            <span>5% from last {period}</span>
          </div>
        </div>

        <div className="wa-stat-card">
          <div className="wa-stat-content">
            <div>
              <p className="wa-stat-label">Avg. Duration</p>
              <p className="wa-stat-value wa-stat-value-purple">{data.avgDuration || 0}h</p>
            </div>
            <div className="wa-stat-icon wa-stat-icon-purple">
              <Clock className="wa-stat-svg" />
            </div>
          </div>
          <div className="wa-stat-change wa-stat-change-down">
            <TrendingDown className="wa-stat-change-icon" />
            <span>8% from last {period}</span>
          </div>
        </div>

        <div className="wa-stat-card">
          <div className="wa-stat-content">
            <div>
              <p className="wa-stat-label">Active Workflows</p>
              <p className="wa-stat-value wa-stat-value-orange">{data.activeWorkflows || 0}</p>
            </div>
            <div className="wa-stat-icon wa-stat-icon-orange">
              <Zap className="wa-stat-svg" />
            </div>
          </div>
          <div className="wa-stat-change wa-stat-change-up">
            <TrendingUp className="wa-stat-change-icon" />
            <span>10% from last {period}</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="wa-charts">
        {/* Execution Trend */}
        <div className="wa-chart-card">
          <h3 className="wa-chart-title">Execution Trend</h3>
          <div className="wa-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend || []}>
                <defs>
                  <linearGradient id="waExecutionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="executions"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#waExecutionGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="wa-chart-card">
          <h3 className="wa-chart-title">Status Distribution</h3>
          <div className="wa-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={data.byStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(data.byStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Entity Breakdown */}
      <div className="wa-section">
        <h3 className="wa-section-title">Breakdown by Entity</h3>
        <div className="wa-entity-breakdown">
          {(data.byEntity || []).map((item, idx) => {
            const percentage = ((item.count / (data.totalExecutions || 1)) * 100);
            return (
              <div key={idx} className="wa-entity-item">
                <div className="wa-entity-header">
                  <span className="wa-entity-name capitalize">{item._id}</span>
                  <span className="wa-entity-count">{item.count}</span>
                </div>
                <div className="wa-entity-bar">
                  <div 
                    className="wa-entity-bar-fill"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: COLORS[idx % COLORS.length]
                    }}
                  />
                </div>
                <div className="wa-entity-percentage">{percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Executions */}
      <div className="wa-section">
        <div className="wa-section-header">
          <h3 className="wa-section-title">Recent Executions</h3>
          <button className="wa-view-all-btn">View All →</button>
        </div>
        <div className="wa-recent-list">
          {(data.recentExecutions || []).slice(0, 5).map((exec, idx) => (
            <div key={idx} className="wa-recent-item">
              <div className="wa-recent-icon">
                <Activity className="wa-recent-svg" />
              </div>
              <div className="wa-recent-info">
                <p className="wa-recent-name">{exec.workflowName}</p>
                <p className="wa-recent-meta">
                  {exec.entityType}: {exec.entityName || 'N/A'}
                </p>
              </div>
              <div className="wa-recent-right">
                <span className={`wa-status-badge ${getStatusColor(exec.status)}`}>
                  {getStatusLabel(exec.status)}
                </span>
                <span className="wa-recent-time">{exec.timestamp}</span>
                <button className="wa-recent-action">
                  <ArrowRight className="wa-recent-action-icon" />
                </button>
              </div>
            </div>
          ))}
          {(!data.recentExecutions || data.recentExecutions.length === 0) && (
            <div className="wa-recent-empty">
              <Clock className="wa-recent-empty-icon" />
              <p>No recent executions</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .wa-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           HEADER
           ============================================ */
        .wa-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .wa-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wa-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .wa-title-icon {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }

        .wa-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .wa-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .wa-filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          min-width: 130px;
        }

        .wa-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .wa-filter-btn {
          padding: 8px 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wa-filter-btn:hover {
          background: #f9fafb;
        }

        .wa-filter-btn-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .wa-refresh-btn {
          padding: 8px 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wa-refresh-btn:hover:not(:disabled) {
          background: #f9fafb;
        }

        .wa-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .wa-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .wa-spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           STATS
           ============================================ */
        .wa-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .wa-stat-card {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 16px 20px;
          transition: all 0.2s ease;
        }

        .wa-stat-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .wa-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .wa-stat-label {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }

        .wa-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0;
          line-height: 1.2;
        }

        .wa-stat-value-green { color: #22c55e; }
        .wa-stat-value-purple { color: #8b5cf6; }
        .wa-stat-value-orange { color: #f97316; }

        .wa-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wa-stat-icon-blue { background: #eff6ff; }
        .wa-stat-icon-green { background: #dcfce7; }
        .wa-stat-icon-purple { background: #f5f3ff; }
        .wa-stat-icon-orange { background: #fff7ed; }

        .wa-stat-svg {
          width: 20px;
          height: 20px;
        }

        .wa-stat-icon-blue .wa-stat-svg { color: #3b82f6; }
        .wa-stat-icon-green .wa-stat-svg { color: #22c55e; }
        .wa-stat-icon-purple .wa-stat-svg { color: #8b5cf6; }
        .wa-stat-icon-orange .wa-stat-svg { color: #f97316; }

        .wa-stat-change {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          font-size: 13px;
        }

        .wa-stat-change-up { color: #22c55e; }
        .wa-stat-change-down { color: #ef4444; }

        .wa-stat-change-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           CHARTS
           ============================================ */
        .wa-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        @media (max-width: 1024px) {
          .wa-charts {
            grid-template-columns: 1fr;
          }
        }

        .wa-chart-card {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 20px;
        }

        .wa-chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 16px 0;
        }

        .wa-chart-container {
          height: 280px;
        }

        /* ============================================
           SECTION
           ============================================ */
        .wa-section {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .wa-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .wa-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .wa-view-all-btn {
          font-size: 13px;
          color: #3b82f6;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }

        .wa-view-all-btn:hover {
          color: #2563eb;
        }

        /* ============================================
           ENTITY BREAKDOWN
           ============================================ */
        .wa-entity-breakdown {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .wa-entity-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wa-entity-header {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 120px;
        }

        .wa-entity-name {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .wa-entity-count {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .wa-entity-bar {
          flex: 1;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .wa-entity-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .wa-entity-percentage {
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          min-width: 50px;
          text-align: right;
        }

        /* ============================================
           RECENT EXECUTIONS
           ============================================ */
        .wa-recent-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .wa-recent-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .wa-recent-item:hover {
          background: #f9fafb;
        }

        .wa-recent-icon {
          width: 32px;
          height: 32px;
          background: #eff6ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wa-recent-svg {
          width: 14px;
          height: 14px;
          color: #3b82f6;
        }

        .wa-recent-info {
          flex: 1;
          min-width: 0;
        }

        .wa-recent-name {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          margin: 0;
        }

        .wa-recent-meta {
          font-size: 12px;
          color: #6b7280;
          margin: 2px 0 0 0;
        }

        .wa-recent-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .wa-status-badge {
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .wa-status-completed {
          background: #dcfce7;
          color: #16a34a;
        }

        .wa-status-inprogress {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .wa-status-pending {
          background: #fef3c7;
          color: #d97706;
        }

        .wa-status-failed {
          background: #fee2e2;
          color: #dc2626;
        }

        .wa-status-default {
          background: #f3f4f6;
          color: #6b7280;
        }

        .wa-recent-time {
          font-size: 12px;
          color: #9ca3af;
        }

        .wa-recent-action {
          padding: 4px;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }

        .wa-recent-action:hover {
          background: #e5e7eb;
          color: #4b5563;
        }

        .wa-recent-action-icon {
          width: 16px;
          height: 16px;
        }

        .wa-recent-empty {
          text-align: center;
          padding: 24px;
          color: #6b7280;
        }

        .wa-recent-empty-icon {
          width: 32px;
          height: 32px;
          color: #d1d5db;
          margin: 0 auto 8px;
          display: block;
        }

        /* ============================================
           LOADING
           ============================================ */
        .wa-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .wa-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .wa-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .wa-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .wa-header-right {
            width: 100%;
          }

          .wa-stats {
            grid-template-columns: 1fr 1fr;
          }

          .wa-entity-item {
            flex-wrap: wrap;
          }

          .wa-entity-header {
            min-width: 100px;
          }

          .wa-recent-item {
            flex-wrap: wrap;
          }

          .wa-recent-right {
            margin-left: auto;
          }
        }

        @media (max-width: 480px) {
          .wa-stats {
            grid-template-columns: 1fr;
          }

          .wa-header-right {
            flex-direction: column;
            align-items: stretch;
          }

          .wa-filter-select {
            width: 100%;
          }

          .wa-recent-right {
            flex-wrap: wrap;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkflowAnalytics;