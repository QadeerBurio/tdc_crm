// pages/kpi/KPIDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart2, TrendingUp, TrendingDown, Target,
  CheckCircle, AlertCircle, Clock, Users,
  Filter, Download, RefreshCw, Calendar,
  Activity, PieChart, ArrowRight, Zap,
  Award, Star, Layers
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

const KPIDashboard = () => {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [entityType, setEntityType] = useState('user');
  const [entityId, setEntityId] = useState(null);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';
  const COLORS = ['#013E37', '#FFEFB3', '#0A5C54', '#FFD580', '#E8F5E9', '#2A9A8A'];

  useEffect(() => {
    fetchDashboardData();
  }, [period, entityType, entityId]);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('entityType', entityType);
      if (entityId) params.append('entityId', entityId);
      params.append('period', period);
      
      const response = await fetch(
        `${API_URL}/kpis/dashboard?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data || []);
        } else {
          console.warn('API returned error:', result.message);
          setDashboardData(getMockData());
          toast.info('Showing sample KPI data');
        }
      } else {
        console.warn('API request failed, using mock data');
        setDashboardData(getMockData());
        toast.info('Showing sample KPI data');
      }
    } catch (error) {
      console.error('Error fetching KPI dashboard:', error);
      setDashboardData(getMockData());
      toast.error('Failed to load KPI data, showing sample data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const getMockData = () => {
    return [
      {
        definition: { 
          name: 'Revenue Growth', 
          category: 'financial', 
          target: { operator: '>=', value: 10, unit: 'percentage' } 
        },
        latestValue: { value: 8.5, isTargetMet: true, change: 2.3 }
      },
      {
        definition: { 
          name: 'Customer Satisfaction', 
          category: 'satisfaction', 
          target: { operator: '>=', value: 4.5, unit: 'score' } 
        },
        latestValue: { value: 4.7, isTargetMet: true, change: 0.3 }
      },
      {
        definition: { 
          name: 'Employee Engagement', 
          category: 'growth', 
          target: { operator: '>=', value: 80, unit: 'percentage' } 
        },
        latestValue: { value: 76, isTargetMet: false, change: -2 }
      },
      {
        definition: { 
          name: 'Project Completion', 
          category: 'productivity', 
          target: { operator: '>=', value: 90, unit: 'percentage' } 
        },
        latestValue: { value: 88, isTargetMet: false, change: 3 }
      },
      {
        definition: { 
          name: 'Client Retention', 
          category: 'retention', 
          target: { operator: '>=', value: 85, unit: 'percentage' } 
        },
        latestValue: { value: 91, isTargetMet: true, change: 4 }
      },
      {
        definition: { 
          name: 'Operational Efficiency', 
          category: 'efficiency', 
          target: { operator: '>=', value: 75, unit: 'percentage' } 
        },
        latestValue: { value: 82, isTargetMet: true, change: 5 }
      }
    ];
  };

  const getCategoryColor = (category) => {
    const colors = {
      productivity: 'kp-cat-productivity',
      quality: 'kp-cat-quality',
      efficiency: 'kp-cat-efficiency',
      satisfaction: 'kp-cat-satisfaction',
      growth: 'kp-cat-growth',
      retention: 'kp-cat-retention',
      financial: 'kp-cat-financial'
    };
    return colors[category] || 'kp-cat-default';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      productivity: 'Productivity',
      quality: 'Quality',
      efficiency: 'Efficiency',
      satisfaction: 'Satisfaction',
      growth: 'Growth',
      retention: 'Retention',
      financial: 'Financial'
    };
    return labels[category] || category;
  };

  const getStatusColor = (isTargetMet) => {
    return isTargetMet ? 'kp-status-success' : 'kp-status-danger';
  };

  const getStatusIcon = (isTargetMet) => {
    return isTargetMet ? 
      <CheckCircle className="kp-icon kp-icon-success" /> : 
      <AlertCircle className="kp-icon kp-icon-danger" />;
  };

  const getProgressColor = (value, target) => {
    const percentage = (value / target) * 100;
    if (percentage >= 80) return 'kp-progress-success';
    if (percentage >= 60) return 'kp-progress-warning';
    return 'kp-progress-danger';
  };

  const formatValue = (value, unit) => {
    if (unit === 'percentage') return `${value}%`;
    if (unit === 'currency') return `$${value.toLocaleString()}`;
    if (unit === 'score') return value.toFixed(1);
    return value;
  };

  if (loading) {
    return (
      <div className="kp-loading">
        <div className="kp-loading-spinner"></div>
        <p className="kp-loading-text">Loading KPI Dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="kp-container">
        {/* Header */}
        <div className="kp-header">
          <div className="kp-header-left">
            <div className="kp-title-wrapper">
              <div className="kp-title-icon">
                <Layers className="kp-title-svg" />
              </div>
              <div>
                <h1 className="kp-title">KPI Dashboard</h1>
                <p className="kp-subtitle">Real-time performance metrics</p>
              </div>
            </div>
          </div>
          <div className="kp-header-right">
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="kp-select"
            >
              <option value="company">🏢 Company</option>
              <option value="segment">📊 Segment</option>
              <option value="department">🏛️ Department</option>
              <option value="team">👥 Team</option>
              <option value="user">👤 Individual</option>
              <option value="project">📋 Project</option>
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="kp-select"
            >
              <option value="weekly">📅 Weekly</option>
              <option value="monthly">📅 Monthly</option>
              <option value="quarterly">📅 Quarterly</option>
              <option value="annual">📅 Annual</option>
            </select>
            <button className="kp-icon-btn" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`kp-refresh-icon ${refreshing ? 'kp-spin' : ''}`} />
            </button>
            <button className="kp-icon-btn">
              <Filter className="kp-btn-icon" />
            </button>
            <button className="kp-export-btn">
              <Download className="kp-btn-icon" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="kp-cards">
          {dashboardData.slice(0, 4).map((kpi, index) => {
            const isTargetMet = kpi.latestValue?.isTargetMet;
            const targetValue = kpi.definition?.target?.value || 100;
            const currentValue = kpi.latestValue?.value || 0;
            const progress = Math.min((currentValue / targetValue) * 100, 100);
            const unit = kpi.definition?.target?.unit;

            return (
              <div key={index} className="kp-card" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="kp-card-content">
                  <div className="kp-card-left">
                    <p className="kp-card-label">{kpi.definition?.name || 'KPI'}</p>
                    <p className="kp-card-value">
                      {formatValue(currentValue, unit)}
                    </p>
                    <div className="kp-card-change">
                      <span className={kpi.latestValue?.change >= 0 ? 'kp-change-up' : 'kp-change-down'}>
                        {kpi.latestValue?.change >= 0 ? '↑' : '↓'} {Math.abs(kpi.latestValue?.change || 0)}%
                      </span>
                      <span className="kp-card-target">
                        Target: {kpi.definition?.target?.operator} {targetValue}
                      </span>
                    </div>
                  </div>
                  <div className={`kp-card-icon ${isTargetMet ? 'kp-icon-success-bg' : 'kp-icon-danger-bg'}`}>
                    {getStatusIcon(isTargetMet)}
                  </div>
                </div>
                <div className="kp-card-progress">
                  <div className="kp-progress-bar">
                    <div 
                      className={`kp-progress-fill ${getProgressColor(currentValue, targetValue)}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="kp-progress-text">{Math.round(progress)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="kp-charts">
          {/* KPI Trends */}
          <div className="kp-chart-card">
            <div className="kp-chart-header">
              <h3 className="kp-chart-title">KPI Trends</h3>
              <span className="kp-chart-badge">Line Chart</span>
            </div>
            <div className="kp-chart-body">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dashboardData.map(d => ({ 
                  name: d.definition?.name || 'KPI', 
                  value: d.latestValue?.value || 0 
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFEFB3" />
                  <XAxis dataKey="name" stroke="#013E37" opacity={0.5} fontSize={12} />
                  <YAxis stroke="#013E37" opacity={0.5} fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #FFEFB3',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(1, 62, 55, 0.08)'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#013E37" strokeWidth={3} dot={{ fill: '#013E37', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="kp-chart-card">
            <div className="kp-chart-header">
              <h3 className="kp-chart-title">Performance Distribution</h3>
              <span className="kp-chart-badge">Pie Chart</span>
            </div>
            <div className="kp-chart-body">
              <ResponsiveContainer width="100%" height={280}>
                <RePieChart>
                  <Pie
                    data={[
                      { name: 'On Target', value: dashboardData.filter(d => d.latestValue?.isTargetMet).length || 0 },
                      { name: 'Below Target', value: dashboardData.filter(d => !d.latestValue?.isTargetMet).length || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#013E37" />
                    <Cell fill="#FFEFB3" />
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} KPIs`, name]}
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
        </div>

        {/* Detailed KPI Table */}
        <div className="kp-table-wrapper">
          <div className="kp-table-header">
            <h3 className="kp-table-title">Detailed KPI Values</h3>
            <span className="kp-table-count">{dashboardData.length} KPIs</span>
          </div>
          <div className="kp-table-container">
            <table className="kp-table">
              <thead>
                <tr>
                  <th>KPI</th>
                  <th>Category</th>
                  <th>Value</th>
                  <th>Change</th>
                  <th>Target</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.map((kpi, index) => (
                  <tr key={index} className="kp-table-row" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className="kp-table-name">{kpi.definition?.name || 'N/A'}</td>
                    <td>
                      <span className={`kp-table-category ${getCategoryColor(kpi.definition?.category)}`}>
                        {getCategoryLabel(kpi.definition?.category)}
                      </span>
                    </td>
                    <td className="kp-table-value">
                      {formatValue(kpi.latestValue?.value, kpi.definition?.target?.unit)}
                    </td>
                    <td className={kpi.latestValue?.change >= 0 ? 'kp-table-change-up' : 'kp-table-change-down'}>
                      {kpi.latestValue?.change >= 0 ? '+' : ''}{kpi.latestValue?.change?.toFixed(1) || 0}%
                    </td>
                    <td className="kp-table-target">
                      {kpi.definition?.target?.operator} {kpi.definition?.target?.value}
                    </td>
                    <td>
                      <span className={`kp-table-status ${getStatusColor(kpi.latestValue?.isTargetMet)}`}>
                        {kpi.latestValue?.isTargetMet ? '✅ On Target' : '⚠️ Below Target'}
                      </span>
                    </td>
                  </tr>
                ))}
                {dashboardData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="kp-table-empty">
                      <div className="kp-empty-state">
                        <BarChart2 className="kp-empty-icon" />
                        <p>No KPI data available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .kp-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .kp-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
          background: #FFFFFF;
        }

        .kp-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: kpSpin 0.8s linear infinite;
        }

        .kp-loading-text {
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes kpSpin {
          to { transform: rotate(360deg); }
        }

        .kp-spin {
          animation: kpSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .kp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeInDown 0.6s ease;
        }

        .kp-header-left {
          display: flex;
          align-items: center;
        }

        .kp-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .kp-title-icon {
          width: 48px;
          height: 48px;
          background: #013E37;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.25);
        }

        .kp-title-svg {
          width: 24px;
          height: 24px;
          color: #FFEFB3;
        }

        .kp-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .kp-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }

        .kp-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .kp-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #FFFFFF;
          color: #013E37;
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 140px;
        }

        .kp-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .kp-select:hover {
          border-color: #013E37;
        }

        .kp-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
        }

        .kp-icon-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .kp-refresh-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .kp-btn-icon {
          width: 16px;
          height: 16px;
        }

        .kp-export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid #013E37;
          border-radius: 8px;
          background: #013E37;
          color: #FFEFB3;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.2);
        }

        .kp-export-btn:hover {
          background: #0A5C54;
          border-color: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        .kp-export-btn .kp-btn-icon {
          color: #FFEFB3;
        }

        /* ============================================
           CARDS
           ============================================ */
        .kp-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .kp-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 18px 20px;
          border: 1px solid #FFEFB3;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideUp 0.5s ease both;
          opacity: 0;
        }

        .kp-card:nth-child(1) { animation-delay: 0.05s; }
        .kp-card:nth-child(2) { animation-delay: 0.1s; }
        .kp-card:nth-child(3) { animation-delay: 0.15s; }
        .kp-card:nth-child(4) { animation-delay: 0.2s; }

        .kp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(1, 62, 55, 0.12);
          border-color: #013E37;
        }

        .kp-card-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kp-card-left {
          flex: 1;
        }

        .kp-card-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
          font-weight: 500;
        }

        .kp-card-value {
          font-size: 26px;
          font-weight: 700;
          color: #013E37;
          margin: 4px 0 0 0;
        }

        .kp-card-change {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          font-size: 12px;
        }

        .kp-change-up { color: #013E37; font-weight: 600; }
        .kp-change-down { color: #D32F2F; font-weight: 600; }

        .kp-card-target {
          color: #013E37;
          opacity: 0.5;
        }

        .kp-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .kp-card:hover .kp-card-icon {
          transform: scale(1.05);
        }

        .kp-icon-success-bg { background: #E8F5E9; }
        .kp-icon-danger-bg { background: #FFEBEE; }

        .kp-icon {
          width: 22px;
          height: 22px;
        }

        .kp-icon-success { color: #013E37; }
        .kp-icon-danger { color: #D32F2F; }

        .kp-card-progress {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .kp-progress-bar {
          flex: 1;
          height: 4px;
          background: #FFEFB3;
          border-radius: 4px;
          overflow: hidden;
        }

        .kp-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .kp-progress-success { background: #013E37; }
        .kp-progress-warning { background: #FFD580; }
        .kp-progress-danger { background: #D32F2F; }

        .kp-progress-text {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          min-width: 36px;
        }

        /* ============================================
           CHARTS
           ============================================ */
        .kp-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .kp-chart-card {
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          padding: 20px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }

        .kp-chart-card:nth-child(1) { animation-delay: 0.25s; }
        .kp-chart-card:nth-child(2) { animation-delay: 0.3s; }

        .kp-chart-card:hover {
          box-shadow: 0 4px 20px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }

        .kp-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .kp-chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .kp-chart-badge {
          font-size: 11px;
          font-weight: 500;
          color: #013E37;
          background: #FFEFB3;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .kp-chart-body {
          width: 100%;
          height: 280px;
        }

        /* ============================================
           TABLE
           ============================================ */
        .kp-table-wrapper {
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
          animation-delay: 0.35s;
        }

        .kp-table-wrapper:hover {
          box-shadow: 0 4px 20px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }

        .kp-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFF9E6;
        }

        .kp-table-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .kp-table-count {
          font-size: 12px;
          font-weight: 500;
          color: #013E37;
          background: #FFEFB3;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .kp-table-container {
          overflow-x: auto;
          padding: 0 4px;
        }

        .kp-table {
          width: 100%;
          border-collapse: collapse;
        }

        .kp-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #013E37;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 2px solid #013E37;
          background: #FFEFB3;
        }

        .kp-table-row {
          border-bottom: 1px solid #FFEFB3;
          transition: background 0.2s ease;
          animation: slideInRight 0.3s ease forwards;
          opacity: 0;
        }

        .kp-table-row:nth-child(1) { animation-delay: 0.4s; }
        .kp-table-row:nth-child(2) { animation-delay: 0.45s; }
        .kp-table-row:nth-child(3) { animation-delay: 0.5s; }
        .kp-table-row:nth-child(4) { animation-delay: 0.55s; }
        .kp-table-row:nth-child(5) { animation-delay: 0.6s; }
        .kp-table-row:nth-child(6) { animation-delay: 0.65s; }

        .kp-table-row:hover {
          background: #FFF9E6;
        }

        .kp-table td {
          padding: 12px 16px;
          font-size: 14px;
          color: #013E37;
        }

        .kp-table-name {
          font-weight: 500;
          color: #013E37;
        }

        .kp-table-category {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .kp-table-category:hover {
          transform: scale(1.05);
        }

        .kp-cat-productivity { background: #013E37; color: #FFEFB3; }
        .kp-cat-quality { background: #0A5C54; color: #FFEFB3; }
        .kp-cat-efficiency { background: #1A7A6E; color: #FFEFB3; }
        .kp-cat-satisfaction { background: #FFEFB3; color: #013E37; }
        .kp-cat-growth { background: #2A9A8A; color: #FFEFB3; }
        .kp-cat-retention { background: #3ABAAA; color: #FFEFB3; }
        .kp-cat-financial { background: #013E37; color: #FFEFB3; }
        .kp-cat-default { background: #FFEFB3; color: #013E37; }

        .kp-table-value {
          font-weight: 600;
          color: #013E37;
        }

        .kp-table-change-up {
          color: #013E37;
          font-weight: 600;
        }

        .kp-table-change-down {
          color: #D32F2F;
          font-weight: 600;
        }

        .kp-table-target {
          color: #013E37;
          opacity: 0.6;
        }

        .kp-table-status {
          display: inline-block;
          padding: 2px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .kp-table-status:hover {
          transform: scale(1.05);
        }

        .kp-status-success {
          background: #013E37;
          color: #FFEFB3;
        }

        .kp-status-danger {
          background: #FFEBEE;
          color: #D32F2F;
        }

        .kp-table-empty {
          text-align: center;
          padding: 40px 20px;
        }

        .kp-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #013E37;
          opacity: 0.5;
        }

        .kp-empty-icon {
          width: 40px;
          height: 40px;
          opacity: 0.3;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes spin {
          to { transform: rotate(360deg); }
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
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .kp-charts {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .kp-header {
            flex-direction: column;
            align-items: stretch;
          }

          .kp-header-right {
            flex-wrap: wrap;
          }

          .kp-select {
            flex: 1;
            min-width: 100px;
          }

          .kp-export-btn {
            flex: 1;
            justify-content: center;
          }

          .kp-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .kp-card-value {
            font-size: 22px;
          }

          .kp-title {
            font-size: 22px;
          }

          .kp-title-icon {
            width: 40px;
            height: 40px;
          }

          .kp-title-svg {
            width: 20px;
            height: 20px;
          }

          .kp-chart-body {
            height: 220px;
          }

          .kp-table-container {
            padding: 0;
          }

          .kp-table th,
          .kp-table td {
            padding: 8px 12px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .kp-cards {
            grid-template-columns: 1fr;
          }

          .kp-header-right {
            flex-direction: column;
          }

          .kp-select {
            width: 100%;
          }

          .kp-export-btn {
            width: 100%;
          }

          .kp-icon-btn {
            align-self: flex-end;
          }

          .kp-title-wrapper {
            gap: 10px;
          }

          .kp-title {
            font-size: 20px;
          }

          .kp-subtitle {
            font-size: 13px;
          }

          .kp-chart-body {
            height: 180px;
          }

          .kp-chart-card {
            padding: 16px;
          }

          .kp-table th,
          .kp-table td {
            padding: 6px 10px;
            font-size: 11px;
          }

          .kp-table-status {
            font-size: 10px;
            padding: 1px 8px;
          }
        }
      `}</style>
    </>
  );
};

export default KPIDashboard;