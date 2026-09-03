// pages/risk/RiskDashboard.jsx - COMPLETE FIXED VERSION WITH NEW COLOR SCHEME
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle, AlertCircle, AlertOctagon,
  CheckCircle, Activity, TrendingUp, TrendingDown,
  BarChart3, PieChart, Filter, Download,
  RefreshCw, Eye, ArrowRight, Calendar,
  Users, Clock, Target, MapPin, Zap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

const RiskDashboard = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    type: 'all'
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';
  const COLORS = ['#013E37', '#0A5C54', '#FFEFB3', '#FFD580', '#E8F5E9'];

  useEffect(() => {
    fetchDashboardData();
  }, [period, filters]);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (filters.severity !== 'all') params.append('severity', filters.severity);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (period) params.append('period', period);

      const response = await fetch(`${API_URL}/risks/dashboard?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSummary(result.data?.summary || result.data);
          setRisks(result.data?.recentRisks || result.data?.risks || []);
        } else {
          throw new Error(result.message || 'Failed to fetch dashboard data');
        }
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching risk dashboard:', error);
      toast.error(error.message || 'Failed to load dashboard');
      setSummary(getMockSummary());
      setRisks(getMockRisks());
      toast.info('Showing sample dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockSummary = () => ({
    total: 24,
    bySeverity: {
      critical: 3,
      high: 5,
      medium: 8,
      low: 8
    },
    byStatus: {
      detected: 6,
      in_progress: 4,
      mitigated: 5,
      resolved: 7,
      ignored: 2
    },
    byType: {
      security: 6,
      operational: 5,
      compliance: 4,
      financial: 5,
      strategic: 4
    },
    averageScore: 62,
    trend: [
      { month: 'Jan', risks: 12 },
      { month: 'Feb', risks: 15 },
      { month: 'Mar', risks: 10 },
      { month: 'Apr', risks: 18 },
      { month: 'May', risks: 14 },
      { month: 'Jun', risks: 8 }
    ]
  });

  const getMockRisks = () => [
    {
      _id: '1',
      name: 'Data Breach Risk',
      description: 'Potential data breach due to unpatched vulnerabilities',
      severity: 'critical',
      status: 'detected',
      type: 'security',
      riskScore: 95,
      detectedAt: new Date().toISOString(),
      assignedTo: { firstName: 'John', lastName: 'Doe' }
    },
    {
      _id: '2',
      name: 'Project Delay Risk',
      description: 'Potential delay due to resource constraints',
      severity: 'high',
      status: 'in_progress',
      type: 'operational',
      riskScore: 75,
      detectedAt: new Date().toISOString(),
      assignedTo: { firstName: 'Sarah', lastName: 'Smith' }
    },
    {
      _id: '3',
      name: 'Compliance Risk',
      description: 'GDPR compliance requirements not fully met',
      severity: 'medium',
      status: 'mitigated',
      type: 'compliance',
      riskScore: 45,
      detectedAt: new Date().toISOString(),
      assignedTo: { firstName: 'Mike', lastName: 'Johnson' }
    },
    {
      _id: '4',
      name: 'Budget Overrun',
      description: 'Potential budget overrun due to increased costs',
      severity: 'low',
      status: 'resolved',
      type: 'financial',
      riskScore: 25,
      detectedAt: new Date().toISOString(),
      assignedTo: { firstName: 'Emma', lastName: 'Wilson' }
    }
  ];

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'rd-bg-critical',
      'high': 'rd-bg-high',
      'medium': 'rd-bg-medium',
      'low': 'rd-bg-low'
    };
    return colors[severity] || 'rd-bg-default';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return <AlertOctagon className="rd-icon" />;
    if (severity === 'high') return <AlertCircle className="rd-icon" />;
    if (severity === 'medium') return <AlertTriangle className="rd-icon" />;
    return <CheckCircle className="rd-icon" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'detected': 'rd-status-detected',
      'in_progress': 'rd-status-progress',
      'mitigated': 'rd-status-mitigated',
      'resolved': 'rd-status-resolved',
      'ignored': 'rd-status-ignored'
    };
    return colors[status] || 'rd-status-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'detected': 'Detected',
      'in_progress': 'In Progress',
      'mitigated': 'Mitigated',
      'resolved': 'Resolved',
      'ignored': 'Ignored'
    };
    return labels[status] || status;
  };

  const severityOptions = [
    { value: 'all', label: 'All Severity' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'detected', label: 'Detected' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'mitigated', label: 'Mitigated' },
    { value: 'resolved', label: 'Resolved' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'security', label: 'Security' },
    { value: 'operational', label: 'Operational' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'financial', label: 'Financial' },
    { value: 'strategic', label: 'Strategic' }
  ];

  if (loading) {
    return (
      <div className="rd-loading">
        <div className="rd-spinner"></div>
        <p className="rd-loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="rd-container">
      {/* Header */}
      <div className="rd-header">
        <div className="rd-header-left">
          <div className="rd-header-icon">
            <AlertCircle className="rd-header-svg" />
          </div>
          <div>
            <h1 className="rd-title">Risk Dashboard</h1>
            <p className="rd-subtitle">Monitor and manage organizational risks</p>
          </div>
        </div>
        <div className="rd-header-right">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rd-period-select"
          >
            <option value="weekly">📅 Weekly</option>
            <option value="monthly">📅 Monthly</option>
            <option value="quarterly">📅 Quarterly</option>
            <option value="annual">📅 Annual</option>
          </select>
          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="rd-filter-select"
          >
            {severityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="rd-filter-select"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="rd-filter-select"
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="rd-icon-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`rd-refresh-icon ${refreshing ? 'rd-spin' : ''}`} />
          </button>
          <button className="rd-icon-btn">
            <Download className="rd-btn-icon" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="rd-stats">
        <div className="rd-stat-card rd-stat-total">
          <div className="rd-stat-content">
            <div className="rd-stat-left">
              <p className="rd-stat-label">Total Risks</p>
              <p className="rd-stat-number">{summary?.total || 0}</p>
              <div className="rd-stat-change rd-change-up">↑ 5% from last {period}</div>
            </div>
            <div className="rd-stat-icon-wrapper">
              <AlertCircle className="rd-stat-icon" />
            </div>
          </div>
        </div>

        <div className="rd-stat-card rd-stat-critical">
          <div className="rd-stat-content">
            <div className="rd-stat-left">
              <p className="rd-stat-label">Critical</p>
              <p className="rd-stat-number rd-stat-number-critical">{summary?.bySeverity?.critical || 0}</p>
              <div className="rd-stat-change rd-change-up">↑ 2% from last {period}</div>
            </div>
            <div className="rd-stat-icon-wrapper rd-stat-icon-critical">
              <AlertOctagon className="rd-stat-icon" />
            </div>
          </div>
        </div>

        <div className="rd-stat-card rd-stat-progress">
          <div className="rd-stat-content">
            <div className="rd-stat-left">
              <p className="rd-stat-label">In Progress</p>
              <p className="rd-stat-number rd-stat-number-progress">{summary?.byStatus?.in_progress || 0}</p>
              <div className="rd-stat-change rd-change-up">↑ 8% from last {period}</div>
            </div>
            <div className="rd-stat-icon-wrapper rd-stat-icon-progress">
              <Activity className="rd-stat-icon" />
            </div>
          </div>
        </div>

        <div className="rd-stat-card rd-stat-score">
          <div className="rd-stat-content">
            <div className="rd-stat-left">
              <p className="rd-stat-label">Avg Risk Score</p>
              <p className="rd-stat-number rd-stat-number-score">{Math.round(summary?.averageScore || 0)}</p>
              <div className="rd-stat-change rd-change-down">↓ 3% from last {period}</div>
            </div>
            <div className="rd-stat-icon-wrapper rd-stat-icon-score">
              <BarChart3 className="rd-stat-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="rd-charts">
        {/* Severity Distribution */}
        <div className="rd-chart-card">
          <div className="rd-chart-header">
            <h3 className="rd-chart-title">Risk Severity Distribution</h3>
            <span className="rd-chart-badge">Pie Chart</span>
          </div>
          <div className="rd-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <RePieChart>
                <Pie
                  data={[
                    { name: 'Critical', value: summary?.bySeverity?.critical || 0 },
                    { name: 'High', value: summary?.bySeverity?.high || 0 },
                    { name: 'Medium', value: summary?.bySeverity?.medium || 0 },
                    { name: 'Low', value: summary?.bySeverity?.low || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #FFEFB3',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.08)'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Trend */}
        <div className="rd-chart-card">
          <div className="rd-chart-header">
            <h3 className="rd-chart-title">Risk Trend</h3>
            <span className="rd-chart-badge">Area Chart</span>
          </div>
          <div className="rd-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={summary?.trend || [
                { month: 'Jan', risks: 12 },
                { month: 'Feb', risks: 15 },
                { month: 'Mar', risks: 10 },
                { month: 'Apr', risks: 18 },
                { month: 'May', risks: 14 },
                { month: 'Jun', risks: 8 }
              ]}>
                <defs>
                  <linearGradient id="rdGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#013E37" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#013E37" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFEFB3" />
                <XAxis dataKey="month" stroke="#013E37" fontSize={12} />
                <YAxis stroke="#013E37" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #FFEFB3',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.08)'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="risks"
                  name="Risks"
                  stroke="#013E37"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#rdGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Type Distribution */}
      <div className="rd-types">
        <div className="rd-types-header">
          <h3 className="rd-chart-title">Risk Type Distribution</h3>
          <span className="rd-chart-badge">Breakdown</span>
        </div>
        <div className="rd-types-grid">
          {summary?.byType && Object.entries(summary.byType).map(([type, count]) => (
            <div key={type} className="rd-type-item">
              <p className="rd-type-count">{count}</p>
              <p className="rd-type-label capitalize">{type}</p>
            </div>
          ))}
          {!summary?.byType && (
            <>
              <div className="rd-type-item"><p className="rd-type-count">6</p><p className="rd-type-label">Security</p></div>
              <div className="rd-type-item"><p className="rd-type-count">5</p><p className="rd-type-label">Operational</p></div>
              <div className="rd-type-item"><p className="rd-type-count">4</p><p className="rd-type-label">Compliance</p></div>
              <div className="rd-type-item"><p className="rd-type-count">5</p><p className="rd-type-label">Financial</p></div>
              <div className="rd-type-item"><p className="rd-type-count">4</p><p className="rd-type-label">Strategic</p></div>
            </>
          )}
        </div>
      </div>

      {/* Recent Risks */}
      <div className="rd-recent">
        <div className="rd-recent-header">
          <h3 className="rd-chart-title">Recent Risks</h3>
          <button className="rd-recent-view">View All →</button>
        </div>
        <div className="rd-recent-list">
          {(risks || []).slice(0, 5).map((risk) => (
            <div key={risk._id} className="rd-recent-item">
              <div className="rd-recent-left">
                <div className={`rd-recent-severity ${getSeverityColor(risk.severity)}`}>
                  {getSeverityIcon(risk.severity)}
                </div>
                <div className="rd-recent-info">
                  <p className="rd-recent-name">{risk.name}</p>
                  <div className="rd-recent-meta">
                    <span className="rd-recent-type capitalize">{risk.type}</span>
                    <span className="rd-recent-separator">•</span>
                    <span className={`rd-recent-status ${getStatusColor(risk.status)}`}>
                      {getStatusLabel(risk.status)}
                    </span>
                    {risk.assignedTo && (
                      <>
                        <span className="rd-recent-separator">•</span>
                        <span className="rd-recent-assignee">
                          {risk.assignedTo.firstName} {risk.assignedTo.lastName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="rd-recent-right">
                <span className="rd-recent-score">Score: {risk.riskScore}</span>
                <button className="rd-recent-view-btn">
                  <Eye className="rd-recent-view-icon" />
                </button>
              </div>
            </div>
          ))}
          {(risks || []).length === 0 && (
            <div className="rd-recent-empty">
              <AlertCircle className="rd-recent-empty-icon" />
              <p>No risks found</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rd-actions">
        <button className="rd-action-btn rd-action-danger" onClick={() => toast.info('Report Risk form coming soon')}>
          <AlertCircle className="rd-action-icon" />
          <span>Report Risk</span>
        </button>
        <button className="rd-action-btn rd-action-primary" onClick={() => toast.info('View all risks coming soon')}>
          <Activity className="rd-action-icon" />
          <span>View All Risks</span>
        </button>
        <button className="rd-action-btn rd-action-purple" onClick={() => toast.info('Risk analysis coming soon')}>
          <BarChart3 className="rd-action-icon" />
          <span>Risk Analysis</span>
        </button>
        <button className="rd-action-btn rd-action-success" onClick={() => toast.info('Export report coming soon')}>
          <Download className="rd-action-icon" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Custom CSS - Modern Design with #FFFFFF, #FFEFB3, #013E37 */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .rd-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #FFFFFF;
          min-height: 100vh;
          animation: rdFadeIn 0.4s ease;
        }

        @keyframes rdFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .rd-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
          background: #FFFFFF;
        }

        .rd-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: rdSpin 0.8s linear infinite;
        }

        @keyframes rdSpin {
          to { transform: rotate(360deg); }
        }

        .rd-loading-text {
          color: #013E37;
          font-size: 14px;
          font-weight: 500;
        }

        .rd-spin {
          animation: rdSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .rd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .rd-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .rd-header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #013E37, #0A5C54);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.25);
        }

        .rd-header-svg {
          width: 24px;
          height: 24px;
          color: #FFFFFF;
        }

        .rd-title {
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .rd-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.7;
          margin: 2px 0 0 0;
        }

        .rd-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rd-period-select,
        .rd-filter-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #FFFFFF;
          color: #013E37;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 130px;
        }

        .rd-period-select:focus,
        .rd-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .rd-period-select:hover,
        .rd-filter-select:hover {
          border-color: #013E37;
        }

        .rd-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #013E37;
        }

        .rd-icon-btn:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .rd-icon-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rd-refresh-icon,
        .rd-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           STATS
           ============================================ */
        .rd-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .rd-stat-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
          animation: rdSlideUp 0.5s ease both;
        }

        .rd-stat-card:nth-child(1) { animation-delay: 0.1s; }
        .rd-stat-card:nth-child(2) { animation-delay: 0.15s; }
        .rd-stat-card:nth-child(3) { animation-delay: 0.2s; }
        .rd-stat-card:nth-child(4) { animation-delay: 0.25s; }

        @keyframes rdSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .rd-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.1);
          border-color: #013E37;
        }

        .rd-stat-total { border-left: 4px solid #013E37; }
        .rd-stat-critical { border-left: 4px solid #D32F2F; }
        .rd-stat-progress { border-left: 4px solid #1976D2; }
        .rd-stat-score { border-left: 4px solid #6D28D9; }

        .rd-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rd-stat-left {
          flex: 1;
        }

        .rd-stat-label {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
          margin: 0;
          font-weight: 500;
        }

        .rd-stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 4px 0 0 0;
          line-height: 1.2;
        }

        .rd-stat-number-critical { color: #D32F2F; }
        .rd-stat-number-progress { color: #1976D2; }
        .rd-stat-number-score { color: #6D28D9; }

        .rd-stat-change {
          font-size: 12px;
          margin-top: 4px;
          font-weight: 500;
        }

        .rd-change-up { color: #013E37; }
        .rd-change-down { color: #D32F2F; }

        .rd-stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: #FFEFB3;
        }

        .rd-stat-icon-critical { background: #FFEBEE; }
        .rd-stat-icon-progress { background: #E3F2FD; }
        .rd-stat-icon-score { background: #EDE7F6; }

        .rd-stat-icon {
          width: 22px;
          height: 22px;
          color: #013E37;
        }

        .rd-stat-critical .rd-stat-icon { color: #D32F2F; }
        .rd-stat-progress .rd-stat-icon { color: #1976D2; }
        .rd-stat-score .rd-stat-icon { color: #6D28D9; }

        /* ============================================
           CHARTS
           ============================================ */
        .rd-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .rd-chart-card {
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .rd-chart-card:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }

        .rd-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .rd-chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .rd-chart-badge {
          font-size: 11px;
          font-weight: 500;
          color: #013E37;
          background: #FFEFB3;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .rd-chart-body {
          width: 100%;
          height: 280px;
        }

        /* ============================================
           TYPES
           ============================================ */
        .rd-types {
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          padding: 20px;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .rd-types:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }

        .rd-types-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .rd-types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .rd-type-item {
          background: #FFFFFF;
          border-radius: 10px;
          padding: 16px;
          text-align: center;
          border: 1px solid #FFEFB3;
          transition: all 0.2s ease;
        }

        .rd-type-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
          background: #FFEFB3;
        }

        .rd-type-count {
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }

        .rd-type-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.7;
          margin: 2px 0 0 0;
        }

        /* ============================================
           RECENT
           ============================================ */
        .rd-recent {
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          padding: 20px;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .rd-recent:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }

        .rd-recent-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .rd-recent-view {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rd-recent-view:hover {
          color: #0A5C54;
          opacity: 0.8;
        }

        .rd-recent-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rd-recent-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #FFFFFF;
          border-radius: 8px;
          border: 1px solid #FFEFB3;
          transition: all 0.2s ease;
        }

        .rd-recent-item:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .rd-recent-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .rd-recent-severity {
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rd-bg-critical { background: #D32F2F; color: #FFFFFF; }
        .rd-bg-high { background: #E65100; color: #FFFFFF; }
        .rd-bg-medium { background: #F9A825; color: #FFFFFF; }
        .rd-bg-low { background: #013E37; color: #FFFFFF; }
        .rd-bg-default { background: #013E37; opacity: 0.5; color: #FFFFFF; }

        .rd-icon {
          width: 18px;
          height: 18px;
        }

        .rd-recent-info {
          flex: 1;
        }

        .rd-recent-name {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          margin: 0;
        }

        .rd-recent-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #013E37;
          opacity: 0.7;
          margin-top: 2px;
        }

        .rd-recent-type {
          text-transform: capitalize;
        }

        .rd-recent-separator {
          color: #013E37;
          opacity: 0.3;
        }

        .rd-recent-status {
          padding: 1px 8px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .rd-status-detected { background: #FFEFB3; color: #013E37; }
        .rd-status-progress { background: #BBDEFB; color: #0D47A1; }
        .rd-status-mitigated { background: #E1BEE7; color: #4A148C; }
        .rd-status-resolved { background: #C8E6C9; color: #013E37; }
        .rd-status-ignored { background: #F5F5F5; color: #013E37; }
        .rd-status-default { background: #F5F5F5; color: #013E37; }

        .rd-recent-assignee {
          color: #013E37;
          opacity: 0.8;
        }

        .rd-recent-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rd-recent-score {
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
          opacity: 0.7;
        }

        .rd-recent-view-btn {
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
          color: #013E37;
          opacity: 0.5;
          display: flex;
          align-items: center;
        }

        .rd-recent-view-btn:hover {
          background: #013E37;
          color: #FFFFFF;
          opacity: 1;
        }

        .rd-recent-view-icon {
          width: 16px;
          height: 16px;
        }

        .rd-recent-empty {
          text-align: center;
          padding: 32px 0;
          color: #013E37;
          opacity: 0.5;
        }

        .rd-recent-empty-icon {
          width: 32px;
          height: 32px;
          color: #013E37;
          opacity: 0.3;
          margin: 0 auto 8px;
        }

        /* ============================================
           ACTIONS
           ============================================ */
        .rd-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }

        .rd-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 20px;
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }

        .rd-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.1);
          border-color: #013E37;
        }

        .rd-action-danger:hover { border-color: #D32F2F; color: #D32F2F; background: #FFEBEE; }
        .rd-action-primary:hover { border-color: #1976D2; color: #1976D2; background: #E3F2FD; }
        .rd-action-purple:hover { border-color: #6D28D9; color: #6D28D9; background: #EDE7F6; }
        .rd-action-success:hover { border-color: #013E37; color: #013E37; background: #E8F5E9; }

        .rd-action-icon {
          width: 20px;
          height: 20px;
        }

        .rd-action-danger .rd-action-icon { color: #D32F2F; }
        .rd-action-primary .rd-action-icon { color: #1976D2; }
        .rd-action-purple .rd-action-icon { color: #6D28D9; }
        .rd-action-success .rd-action-icon { color: #013E37; }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .rd-charts {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .rd-container {
            padding: 16px;
          }

          .rd-header {
            flex-direction: column;
            align-items: stretch;
          }

          .rd-header-right {
            flex-wrap: wrap;
          }

          .rd-period-select,
          .rd-filter-select {
            flex: 1;
            min-width: 100px;
          }

          .rd-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .rd-stat-number {
            font-size: 22px;
          }

          .rd-title {
            font-size: 22px;
          }

          .rd-header-icon {
            width: 40px;
            height: 40px;
          }

          .rd-header-svg {
            width: 20px;
            height: 20px;
          }

          .rd-types-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .rd-actions {
            grid-template-columns: 1fr 1fr;
          }

          .rd-action-btn {
            padding: 12px 16px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .rd-container {
            padding: 12px;
          }

          .rd-header-right {
            flex-direction: column;
          }

          .rd-period-select,
          .rd-filter-select {
            width: 100%;
          }

          .rd-icon-btn {
            align-self: flex-end;
          }

          .rd-stats {
            grid-template-columns: 1fr;
          }

          .rd-title {
            font-size: 20px;
          }

          .rd-subtitle {
            font-size: 13px;
          }

          .rd-types-grid {
            grid-template-columns: 1fr;
          }

          .rd-actions {
            grid-template-columns: 1fr;
          }

          .rd-recent-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .rd-recent-right {
            width: 100%;
            justify-content: flex-end;
          }
        }

        /* Utility */
        .capitalize {
          text-transform: capitalize;
        }

        /* Scrollbar */
        .rd-chart-body::-webkit-scrollbar {
          width: 4px;
        }

        .rd-chart-body::-webkit-scrollbar-track {
          background: #FFEFB3;
          border-radius: 4px;
        }

        .rd-chart-body::-webkit-scrollbar-thumb {
          background: #013E37;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default RiskDashboard;