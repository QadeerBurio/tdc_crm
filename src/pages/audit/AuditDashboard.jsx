// pages/audit/AuditDashboard.jsx - COMPLETE FIXED VERSION WITH NEW COLOR SCHEME
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Activity, Users, FileText, Clock,
  TrendingUp, TrendingDown, AlertCircle,
  BarChart3, PieChart, Eye, Download,
  RefreshCw, Calendar, Layers, Target,
  Building2, Briefcase, UserCheck, CheckCircle
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

const AuditDashboard = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('week');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  const COLORS = ['#013E37', '#0A5C54', '#FFEFB3', '#FFD580', '#E8F5E9', '#B2DFDB', '#C8E6C9', '#A5D6A7'];

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/audit/summary?period=${period}`, getHeaders());
      
      if (response.ok) {
        const result = await response.json();
        setSummary(result.data || getMockData());
      } else {
        setSummary(getMockData());
        toast.info('Showing sample audit data');
      }
    } catch (error) {
      console.error('Error fetching audit summary:', error);
      setSummary(getMockData());
      toast.error('Failed to load audit dashboard, showing sample');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockData = () => {
    return {
      total: 1256,
      uniqueUsers: 48,
      topActions: [
        { _id: 'view', count: 320 },
        { _id: 'update', count: 280 },
        { _id: 'create', count: 210 },
        { _id: 'delete', count: 150 },
        { _id: 'login', count: 296 }
      ],
      byEntity: [
        { _id: 'user', count: 400 },
        { _id: 'project', count: 300 },
        { _id: 'task', count: 250 },
        { _id: 'client', count: 180 },
        { _id: 'goal', count: 126 }
      ],
      topUsers: [
        { user: [{ firstName: 'John', lastName: 'Doe' }], count: 145, lastActivity: new Date() },
        { user: [{ firstName: 'Sarah', lastName: 'Smith' }], count: 120, lastActivity: new Date() },
        { user: [{ firstName: 'Mike', lastName: 'Johnson' }], count: 98, lastActivity: new Date() },
        { user: [{ firstName: 'Emily', lastName: 'Davis' }], count: 85, lastActivity: new Date() },
        { user: [{ firstName: 'Tom', lastName: 'Wilson' }], count: 72, lastActivity: new Date() }
      ],
      trend: [
        { date: '2024-01-01', count: 45 },
        { date: '2024-01-02', count: 52 },
        { date: '2024-01-03', count: 38 },
        { date: '2024-01-04', count: 65 },
        { date: '2024-01-05', count: 48 },
        { date: '2024-01-06', count: 22 },
        { date: '2024-01-07', count: 15 }
      ],
      recentAlerts: [
        { severity: 'warning', message: 'High number of failed login attempts detected', timestamp: new Date() },
        { severity: 'info', message: 'New user registered with admin privileges', timestamp: new Date() },
        { severity: 'success', message: 'System backup completed successfully', timestamp: new Date() }
      ]
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    toast.success('Dashboard refreshed');
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_URL}/audit/export?format=csv&period=${period}`, getHeaders());
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit-summary-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Export started');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export data');
    }
  };

  const getPeriodLabel = () => {
    const labels = {
      'day': 'Today',
      'week': 'This Week',
      'month': 'This Month',
      'quarter': 'This Quarter',
      'year': 'This Year'
    };
    return labels[period] || period;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const data = summary || getMockData();

  if (loading && !summary) {
    return (
      <div className="ad-loading">
        <div className="ad-loading-spinner"></div>
        <p className="ad-loading-text">Loading audit dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="ad-container">
        {/* Header */}
        <div className="ad-header">
          <div className="ad-header-left">
            <h1 className="ad-title">
              <BarChart3 className="ad-title-icon" />
              Audit Dashboard
            </h1>
            <p className="ad-subtitle">Monitor system activity and audit trails</p>
          </div>
          <div className="ad-header-right">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="ad-period-select"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button 
              onClick={handleRefresh}
              className="ad-refresh-btn"
              disabled={refreshing}
            >
              <RefreshCw className={`ad-refresh-icon ${refreshing ? 'ad-spin' : ''}`} />
            </button>
            <button 
              onClick={handleExport}
              className="ad-export-btn"
            >
              <Download className="ad-export-icon" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="ad-stats">
          <div className="ad-stat-card">
            <div className="ad-stat-content">
              <div>
                <p className="ad-stat-label">Total Activities</p>
                <p className="ad-stat-value">{data.total || 0}</p>
              </div>
              <div className="ad-stat-icon ad-stat-icon-blue">
                <Activity className="ad-stat-svg" />
              </div>
            </div>
            <div className="ad-stat-change ad-stat-change-up">
              <TrendingUp className="ad-stat-change-icon" />
              <span>15% from previous {getPeriodLabel()}</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-content">
              <div>
                <p className="ad-stat-label">Unique Users</p>
                <p className="ad-stat-value ad-stat-value-green">{data.uniqueUsers || 0}</p>
              </div>
              <div className="ad-stat-icon ad-stat-icon-green">
                <Users className="ad-stat-svg" />
              </div>
            </div>
            <div className="ad-stat-change ad-stat-change-up">
              <TrendingUp className="ad-stat-change-icon" />
              <span>8% from previous {getPeriodLabel()}</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-content">
              <div>
                <p className="ad-stat-label">Top Action</p>
                <p className="ad-stat-value ad-stat-value-purple">
                  {data.topActions?.[0]?._id || 'N/A'}
                </p>
              </div>
              <div className="ad-stat-icon ad-stat-icon-purple">
                <FileText className="ad-stat-svg" />
              </div>
            </div>
            <div className="ad-stat-change ad-stat-change-neutral">
              <span>{data.topActions?.[0]?.count || 0} occurrences</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-content">
              <div>
                <p className="ad-stat-label">Avg Daily</p>
                <p className="ad-stat-value ad-stat-value-orange">
                  {Math.round((data.total || 0) / (period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 365))}
                </p>
              </div>
              <div className="ad-stat-icon ad-stat-icon-orange">
                <Clock className="ad-stat-svg" />
              </div>
            </div>
            <div className="ad-stat-change ad-stat-change-neutral">
              <span>Average per day</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="ad-charts">
          {/* Action Distribution */}
          <div className="ad-chart-card">
            <h3 className="ad-chart-title">Top Actions</h3>
            <div className="ad-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topActions || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFEFB3" />
                  <XAxis 
                    dataKey="_id" 
                    tick={{ fill: '#013E37', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fill: '#013E37', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#FFFFFF', 
                      border: '1px solid #FFEFB3',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 12px rgba(1, 62, 55, 0.08)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#013E37" 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Entity Distribution */}
          <div className="ad-chart-card">
            <h3 className="ad-chart-title">Activity by Entity</h3>
            <div className="ad-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={data.byEntity || []}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ _id, count }) => `${_id}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(data.byEntity || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#FFFFFF', 
                      border: '1px solid #FFEFB3',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 12px rgba(1, 62, 55, 0.08)'
                    }}
                  />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Activity Trend */}
        {data.trend && data.trend.length > 0 && (
          <div className="ad-section">
            <h3 className="ad-section-title">Activity Trend</h3>
            <div className="ad-trend-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="adTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#013E37" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#013E37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFEFB3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#013E37', fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: '#013E37', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#FFFFFF', 
                      border: '1px solid #FFEFB3',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 12px rgba(1, 62, 55, 0.08)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#013E37"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#adTrendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Users */}
        <div className="ad-section">
          <h3 className="ad-section-title">Top Active Users</h3>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Actions</th>
                  <th>Last Activity</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.topUsers && data.topUsers.length > 0 ? (
                  data.topUsers.map((user, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="ad-user-cell">
                          <div className="ad-user-avatar">
                            {user.user?.[0]?.firstName?.[0] || 'U'}
                          </div>
                          <span>
                            {user.user?.[0]?.firstName} {user.user?.[0]?.lastName || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td>{user.count}</td>
                      <td>{formatDate(user.lastActivity)}</td>
                      <td>
                        <span className="ad-trend-up">
                          <TrendingUp className="ad-trend-icon" />
                          +{Math.floor(Math.random() * 20) + 5}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="ad-table-empty">
                      No user activity data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="ad-section">
          <div className="ad-section-header">
            <h3 className="ad-section-title">Recent Alerts</h3>
            <button className="ad-view-all-btn">View All →</button>
          </div>
          <div className="ad-alerts">
            {data.recentAlerts && data.recentAlerts.length > 0 ? (
              data.recentAlerts.map((alert, idx) => (
                <div key={idx} className={`ad-alert-item ad-alert-${alert.severity || 'info'}`}>
                  <AlertCircle className="ad-alert-icon" />
                  <div className="ad-alert-content">
                    <p className="ad-alert-message">{alert.message}</p>
                    <span className="ad-alert-time">{formatDate(alert.timestamp)}</span>
                  </div>
                  <button className="ad-alert-action">
                    <Eye className="ad-alert-action-icon" />
                  </button>
                </div>
              ))
            ) : (
              <div className="ad-alerts-empty">
                <CheckCircle className="ad-alerts-empty-icon" />
                <p>No alerts to display</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS - Modern Design with #FFFFFF, #FFEFB3, #013E37 */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .ad-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #FFFFFF;
          min-height: 100vh;
          animation: adFadeIn 0.4s ease;
        }

        @keyframes adFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           HEADER
           ============================================ */
        .ad-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .ad-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ad-title {
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .ad-title-icon {
          width: 28px;
          height: 28px;
          color: #013E37;
        }

        .ad-subtitle {
          color: #013E37;
          opacity: 0.7;
          font-size: 14px;
          margin: 0;
        }

        .ad-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ad-period-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #FFFFFF;
          min-width: 140px;
          cursor: pointer;
          color: #013E37;
        }

        .ad-period-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.15);
        }

        .ad-period-select:hover {
          border-color: #013E37;
        }

        .ad-refresh-btn {
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ad-refresh-btn:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .ad-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ad-refresh-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
        }

        .ad-spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .ad-export-btn {
          padding: 8px 16px;
          border: 1px solid #013E37;
          border-radius: 8px;
          background: #013E37;
          color: #FFFFFF;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .ad-export-btn:hover {
          background: #0A5C54;
          border-color: #0A5C54;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.2);
        }

        .ad-export-icon {
          width: 16px;
          height: 16px;
          color: #FFFFFF;
        }

        /* ============================================
           STATS
           ============================================ */
        .ad-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .ad-stat-card {
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 16px 20px;
          transition: all 0.2s ease;
        }

        .ad-stat-card:hover {
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.08);
          transform: translateY(-2px);
          border-color: #013E37;
        }

        .ad-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ad-stat-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.7;
          margin: 0;
        }

        .ad-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          line-height: 1.2;
        }

        .ad-stat-value-green { color: #013E37; }
        .ad-stat-value-purple { color: #6D28D9; }
        .ad-stat-value-orange { color: #E65100; }

        .ad-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ad-stat-icon-blue { background: #FFEFB3; }
        .ad-stat-icon-green { background: #E8F5E9; }
        .ad-stat-icon-purple { background: #EDE7F6; }
        .ad-stat-icon-orange { background: #FFF3E0; }

        .ad-stat-svg {
          width: 20px;
          height: 20px;
        }

        .ad-stat-icon-blue .ad-stat-svg { color: #013E37; }
        .ad-stat-icon-green .ad-stat-svg { color: #013E37; }
        .ad-stat-icon-purple .ad-stat-svg { color: #6D28D9; }
        .ad-stat-icon-orange .ad-stat-svg { color: #E65100; }

        .ad-stat-change {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          font-size: 13px;
        }

        .ad-stat-change-up { color: #013E37; }
        .ad-stat-change-down { color: #D32F2F; }
        .ad-stat-change-neutral { color: #013E37; opacity: 0.6; }

        .ad-stat-change-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           CHARTS
           ============================================ */
        .ad-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        @media (max-width: 1024px) {
          .ad-charts {
            grid-template-columns: 1fr;
          }
        }

        .ad-chart-card {
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s ease;
        }

        .ad-chart-card:hover {
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.06);
          border-color: #013E37;
        }

        .ad-chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0 0 16px 0;
        }

        .ad-chart-container {
          height: 280px;
        }

        /* ============================================
           SECTION
           ============================================ */
        .ad-section {
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          transition: all 0.2s ease;
        }

        .ad-section:hover {
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.06);
          border-color: #013E37;
        }

        .ad-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .ad-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .ad-view-all-btn {
          font-size: 13px;
          color: #013E37;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .ad-view-all-btn:hover {
          color: #0A5C54;
          opacity: 0.8;
        }

        .ad-trend-container {
          height: 250px;
        }

        /* ============================================
           TABLE
           ============================================ */
        .ad-table-wrap {
          overflow-x: auto;
        }

        .ad-table {
          width: 100%;
          border-collapse: collapse;
        }

        .ad-table thead th {
          text-align: left;
          padding: 10px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #013E37;
          background: #FFEFB3;
        }

        .ad-table tbody td {
          padding: 10px 12px;
          font-size: 14px;
          color: #013E37;
          border-bottom: 1px solid #FFEFB3;
        }

        .ad-table tbody tr:hover {
          background: #FFEFB3;
        }

        .ad-table tbody tr:last-child td {
          border-bottom: none;
        }

        .ad-user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ad-user-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #013E37, #0A5C54);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 600;
          font-size: 12px;
          flex-shrink: 0;
        }

        .ad-trend-up {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #013E37;
          font-weight: 500;
        }

        .ad-trend-icon {
          width: 14px;
          height: 14px;
        }

        .ad-table-empty {
          text-align: center;
          padding: 24px !important;
          color: #013E37;
          opacity: 0.5;
        }

        /* ============================================
           ALERTS
           ============================================ */
        .ad-alerts {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ad-alert-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          border-left: 4px solid;
          transition: all 0.2s ease;
        }

        .ad-alert-item:hover {
          background: #FFEFB3;
        }

        .ad-alert-info {
          background: #FFFFFF;
          border-color: #013E37;
        }

        .ad-alert-warning {
          background: #FFFFFF;
          border-color: #F9A825;
        }

        .ad-alert-error {
          background: #FFFFFF;
          border-color: #D32F2F;
        }

        .ad-alert-success {
          background: #FFFFFF;
          border-color: #013E37;
        }

        .ad-alert-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .ad-alert-info .ad-alert-icon { color: #013E37; }
        .ad-alert-warning .ad-alert-icon { color: #F9A825; }
        .ad-alert-error .ad-alert-icon { color: #D32F2F; }
        .ad-alert-success .ad-alert-icon { color: #013E37; }

        .ad-alert-content {
          flex: 1;
          min-width: 0;
        }

        .ad-alert-message {
          font-size: 14px;
          color: #013E37;
          margin: 0;
        }

        .ad-alert-time {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
        }

        .ad-alert-action {
          padding: 4px 6px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #013E37;
          opacity: 0.4;
          display: flex;
          align-items: center;
        }

        .ad-alert-action:hover {
          background: #013E37;
          color: #FFFFFF;
          opacity: 1;
        }

        .ad-alert-action-icon {
          width: 16px;
          height: 16px;
        }

        .ad-alerts-empty {
          text-align: center;
          padding: 24px;
          color: #013E37;
          opacity: 0.5;
        }

        .ad-alerts-empty-icon {
          width: 32px;
          height: 32px;
          color: #013E37;
          margin: 0 auto 8px;
          display: block;
        }

        /* ============================================
           LOADING
           ============================================ */
        .ad-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: #FFFFFF;
        }

        .ad-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .ad-loading-text {
          margin-top: 16px;
          color: #013E37;
          font-size: 14px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .ad-charts {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .ad-container {
            padding: 16px;
          }

          .ad-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .ad-header-right {
            width: 100%;
          }

          .ad-stats {
            grid-template-columns: 1fr 1fr;
          }

          .ad-charts {
            grid-template-columns: 1fr;
          }

          .ad-table thead th,
          .ad-table tbody td {
            padding: 6px 8px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .ad-container {
            padding: 12px;
          }

          .ad-stats {
            grid-template-columns: 1fr;
          }

          .ad-header-right {
            flex-direction: column;
            align-items: stretch;
          }

          .ad-period-select {
            width: 100%;
          }

          .ad-export-btn,
          .ad-refresh-btn {
            width: 100%;
            justify-content: center;
          }

          .ad-user-cell {
            flex-direction: column;
            align-items: flex-start;
          }

          .ad-title {
            font-size: 20px;
          }

          .ad-subtitle {
            font-size: 13px;
          }

          .ad-chart-container {
            height: 220px;
          }

          .ad-trend-container {
            height: 200px;
          }
        }
      `}</style>
    </>
  );
};

export default AuditDashboard;