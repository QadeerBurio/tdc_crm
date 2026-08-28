// pages/kpi/KPIDashboard.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart2, TrendingUp, TrendingDown, Target,
  CheckCircle, AlertCircle, Clock, Users,
  Filter, Download, Calendar, RefreshCw,
  Zap, Award, Star, Activity
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

const KPIDashboard = () => {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [entityType, setEntityType] = useState('user');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F472B6'];

  useEffect(() => {
    fetchDashboardData();
  }, [period, entityType]);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Direct fetch API call - NO api.get()
      const response = await fetch(
        `${API_URL}/kpis/dashboard?entityType=${entityType}&period=${period}`,
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
          setDashboardData(result.data);
        } else {
          // If API returns error, use mock data
          console.warn('API returned error:', result.message);
          setDashboardData(getMockData());
          toast.info('Showing sample KPI data');
        }
      } else {
        // If API fails, use mock data
        console.warn('API request failed, using mock data');
        setDashboardData(getMockData());
        toast.info('Showing sample KPI data');
      }
    } catch (error) {
      console.error('Error fetching KPI dashboard:', error);
      // Use mock data on error
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
          category: 'Financial', 
          target: { operator: '>=', value: 100, unit: 'percentage' } 
        },
        latestValue: { value: 85, isTargetMet: true, change: 12, previousValue: 73 }
      },
      {
        definition: { 
          name: 'Customer Satisfaction', 
          category: 'Customer', 
          target: { operator: '>=', value: 90, unit: 'percentage' } 
        },
        latestValue: { value: 92, isTargetMet: true, change: 5, previousValue: 87 }
      },
      {
        definition: { 
          name: 'Employee Engagement', 
          category: 'Employee', 
          target: { operator: '>=', value: 80, unit: 'percentage' } 
        },
        latestValue: { value: 76, isTargetMet: false, change: -3, previousValue: 79 }
      },
      {
        definition: { 
          name: 'Project Completion', 
          category: 'Operations', 
          target: { operator: '>=', value: 95, unit: 'percentage' } 
        },
        latestValue: { value: 88, isTargetMet: false, change: 2, previousValue: 86 }
      },
      {
        definition: { 
          name: 'Client Retention', 
          category: 'Customer', 
          target: { operator: '>=', value: 85, unit: 'percentage' } 
        },
        latestValue: { value: 91, isTargetMet: true, change: 8, previousValue: 83 }
      },
      {
        definition: { 
          name: 'Operational Efficiency', 
          category: 'Operations', 
          target: { operator: '>=', value: 75, unit: 'percentage' } 
        },
        latestValue: { value: 82, isTargetMet: true, change: 6, previousValue: 76 }
      }
    ];
  };

  const formatValue = (value, unit) => {
    if (unit === 'percentage') return `${value}%`;
    if (unit === 'currency') return `$${value.toLocaleString()}`;
    return value;
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

  if (loading) {
    return (
      <div className="kp-loading">
        <div className="kp-spinner"></div>
        <p className="kp-loading-text">Loading KPI Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="kp-container">
      {/* Header */}
      <div className="kp-header">
        <div className="kp-header-left">
          <div className="kp-title-wrapper">
            <div className="kp-title-icon">
              <BarChart2 className="kp-title-svg" />
            </div>
            <div>
              <h2 className="kp-title">KPI Dashboard</h2>
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

      {/* KPI Cards */}
      <div className="kp-cards">
        {dashboardData?.slice(0, 4).map((kpi, index) => {
          const isTargetMet = kpi.latestValue?.isTargetMet;
          const targetValue = kpi.definition?.target?.value || 100;
          const currentValue = kpi.latestValue?.value || 0;
          const progress = Math.min((currentValue / targetValue) * 100, 100);

          return (
            <div key={index} className="kp-card">
              <div className="kp-card-content">
                <div className="kp-card-left">
                  <p className="kp-card-label">{kpi.definition?.name || 'KPI'}</p>
                  <p className="kp-card-value">
                    {formatValue(currentValue, kpi.definition?.target?.unit)}
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
            <h4 className="kp-chart-title">KPI Trends</h4>
            <span className="kp-chart-badge">Line Chart</span>
          </div>
          <div className="kp-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dashboardData?.map(d => ({ 
                name: d.definition?.name, 
                value: d.latestValue?.value || 0 
              })) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="kp-chart-card">
          <div className="kp-chart-header">
            <h4 className="kp-chart-title">Performance Distribution</h4>
            <span className="kp-chart-badge">Pie Chart</span>
          </div>
          <div className="kp-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'On Target', value: dashboardData?.filter(d => d.latestValue?.isTargetMet).length || 0 },
                    { name: 'Below Target', value: dashboardData?.filter(d => !d.latestValue?.isTargetMet).length || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed KPI Table */}
      <div className="kp-table-wrapper">
        <div className="kp-table-header">
          <h4 className="kp-table-title">Detailed KPI Values</h4>
          <span className="kp-table-count">{dashboardData?.length || 0} KPIs</span>
        </div>
        <div className="kp-table-container">
          <table className="kp-table">
            <thead>
              <tr>
                <th>KPI</th>
                <th>Category</th>
                <th>Value</th>
                <th>Previous</th>
                <th>Change</th>
                <th>Target</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.map((kpi, index) => (
                <tr key={index} className="kp-table-row">
                  <td className="kp-table-name">{kpi.definition?.name}</td>
                  <td>
                    <span className="kp-table-category">{kpi.definition?.category}</span>
                  </td>
                  <td className="kp-table-value">
                    {kpi.latestValue?.value}
                    {kpi.definition?.target?.unit === 'percentage' && '%'}
                  </td>
                  <td className="kp-table-previous">{kpi.latestValue?.previousValue || '-'}</td>
                  <td className={kpi.latestValue?.change >= 0 ? 'kp-table-change-up' : 'kp-table-change-down'}>
                    {kpi.latestValue?.change >= 0 ? '+' : ''}{kpi.latestValue?.change || 0}%
                  </td>
                  <td className="kp-table-target">
                    {kpi.definition?.target?.operator} {kpi.definition?.target?.value}
                  </td>
                  <td>
                    <span className={`kp-table-status ${getStatusColor(kpi.latestValue?.isTargetMet)}`}>
                      {kpi.latestValue?.isTargetMet ? 'On Target' : 'Below Target'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        .kp-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: kpFadeIn 0.4s ease;
        }

        @keyframes kpFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .kp-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .kp-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: kpSpin 0.8s linear infinite;
        }

        .kp-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes kpSpin {
          to { transform: rotate(360deg); }
        }

        .kp-spin {
          animation: kpSpin 1s linear infinite;
        }

        .kp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
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
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .kp-title-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .kp-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .kp-subtitle {
          font-size: 15px;
          color: #64748b;
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
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .kp-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .kp-icon-btn {
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

        .kp-icon-btn:hover {
          background: #f1f5f9;
        }

        .kp-refresh-icon {
          width: 16px;
          height: 16px;
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
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .kp-export-btn:hover {
          background: #f1f5f9;
        }

        .kp-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .kp-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 18px 20px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          animation: kpSlideUp 0.5s ease both;
        }

        .kp-card:nth-child(1) { animation-delay: 0.1s; }
        .kp-card:nth-child(2) { animation-delay: 0.2s; }
        .kp-card:nth-child(3) { animation-delay: 0.3s; }
        .kp-card:nth-child(4) { animation-delay: 0.4s; }

        @keyframes kpSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .kp-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
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
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .kp-card-value {
          font-size: 26px;
          font-weight: 700;
          color: #0f172a;
          margin: 4px 0 0 0;
        }

        .kp-card-change {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          font-size: 12px;
        }

        .kp-change-up { color: #22c55e; font-weight: 600; }
        .kp-change-down { color: #ef4444; font-weight: 600; }

        .kp-card-target {
          color: #94a3b8;
        }

        .kp-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kp-icon-success-bg { background: #ecfdf5; }
        .kp-icon-danger-bg { background: #fef2f2; }

        .kp-icon {
          width: 22px;
          height: 22px;
        }

        .kp-icon-success { color: #22c55e; }
        .kp-icon-danger { color: #ef4444; }

        .kp-card-progress {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .kp-progress-bar {
          flex: 1;
          height: 4px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .kp-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .kp-progress-success { background: #22c55e; }
        .kp-progress-warning { background: #f59e0b; }
        .kp-progress-danger { background: #ef4444; }

        .kp-progress-text {
          font-size: 12px;
          font-weight: 600;
          color: #0f172a;
          min-width: 36px;
        }

        .kp-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .kp-chart-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .kp-chart-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .kp-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .kp-chart-title {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .kp-chart-badge {
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .kp-chart-body {
          width: 100%;
          height: 280px;
        }

        .kp-table-wrapper {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .kp-table-wrapper:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .kp-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .kp-table-title {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .kp-table-count {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
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
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .kp-table-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s ease;
        }

        .kp-table-row:hover {
          background: #f8fafc;
        }

        .kp-table td {
          padding: 12px 16px;
          font-size: 14px;
          color: #0f172a;
        }

        .kp-table-name {
          font-weight: 500;
        }

        .kp-table-category {
          font-size: 12px;
          padding: 2px 10px;
          border-radius: 12px;
          background: #f1f5f9;
          color: #64748b;
        }

        .kp-table-value {
          font-weight: 600;
        }

        .kp-table-previous {
          color: #64748b;
        }

        .kp-table-change-up {
          color: #22c55e;
          font-weight: 600;
        }

        .kp-table-change-down {
          color: #ef4444;
          font-weight: 600;
        }

        .kp-table-target {
          color: #64748b;
        }

        .kp-table-status {
          display: inline-block;
          padding: 2px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .kp-status-success {
          background: #d1fae5;
          color: #065f46;
        }

        .kp-status-danger {
          background: #fee2e2;
          color: #991b1b;
        }

        @media (max-width: 1024px) {
          .kp-charts {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .kp-container {
            padding: 16px;
          }

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
          .kp-container {
            padding: 12px;
          }

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
    </div>
  );
};

export default KPIDashboard;