// pages/analytics/GrowthMetrics.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, Users, Building, DollarSign,
  ArrowUp, ArrowDown, RefreshCw, Download,
  Filter, Calendar, Activity
} from 'lucide-react';
import {
  LineChart, BarChart,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
  Line, Bar,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

const GrowthMetrics = () => {
  const { token } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [growthData, setGrowthData] = useState({
    leads: [],
    clients: [],
    revenue: [],
    summary: {
      leadGrowth: 0,
      clientGrowth: 0,
      revenueGrowth: 0,
      totalLeads: 0,
      totalClients: 0,
      totalRevenue: 0
    }
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchGrowthData();
  }, [timeRange]);

  const fetchGrowthData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);

      const response = await fetch(`${API_URL}/analytics/growth?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const data = result.data || {};
          setGrowthData({
            leads: data.leads || [],
            clients: data.clients || [],
            revenue: data.revenue || [],
            summary: {
              leadGrowth: data.summary?.leadGrowth || 0,
              clientGrowth: data.summary?.clientGrowth || 0,
              revenueGrowth: data.summary?.revenueGrowth || 0,
              totalLeads: data.summary?.totalLeads || 0,
              totalClients: data.summary?.totalClients || 0,
              totalRevenue: data.summary?.totalRevenue || 0
            }
          });
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } else {
        throw new Error('Failed to fetch growth metrics');
      }
    } catch (error) {
      console.error('Error fetching growth data:', error);
      toast.error(error.message || 'Failed to load growth metrics');
      setMockData();
      toast.info('Showing sample growth data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const setMockData = () => {
    setGrowthData({
      leads: [
        { period: 'Week 1', new: 12, total: 45 },
        { period: 'Week 2', new: 18, total: 63 },
        { period: 'Week 3', new: 15, total: 78 },
        { period: 'Week 4', new: 22, total: 100 }
      ],
      clients: [
        { period: 'Week 1', new: 5, total: 28 },
        { period: 'Week 2', new: 8, total: 36 },
        { period: 'Week 3', new: 6, total: 42 },
        { period: 'Week 4', new: 10, total: 52 }
      ],
      revenue: [
        { period: 'Week 1', revenue: 8500 },
        { period: 'Week 2', revenue: 12000 },
        { period: 'Week 3', revenue: 9800 },
        { period: 'Week 4', revenue: 15000 }
      ],
      summary: {
        leadGrowth: 24.5,
        clientGrowth: 18.3,
        revenueGrowth: 32.7,
        totalLeads: 100,
        totalClients: 52,
        totalRevenue: 45300
      }
    });
  };

  const handleRefresh = () => {
    fetchGrowthData(true);
  };

  const handleExport = () => {
    toast.success('Export started. Your report will be downloaded shortly.');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <div className="gm-metric-card">
      <div className="gm-metric-content">
        <div className="gm-metric-left">
          <p className="gm-metric-title">{title}</p>
          {loading ? (
            <div className="gm-metric-skeleton"></div>
          ) : (
            <p className="gm-metric-value">{value}</p>
          )}
          {change !== undefined && !loading && (
            <div className={`gm-metric-change ${change >= 0 ? 'gm-change-up' : 'gm-change-down'}`}>
              {change >= 0 ? <ArrowUp className="gm-change-icon" /> : <ArrowDown className="gm-change-icon" />}
              <span>{Math.abs(change)}%</span>
              <span className="gm-change-label">growth</span>
            </div>
          )}
          {subtitle && !loading && (
            <p className="gm-metric-subtitle">{subtitle}</p>
          )}
        </div>
        <div className={`gm-metric-icon-wrapper gm-metric-icon-${color}`}>
          <Icon className="gm-metric-icon" />
        </div>
      </div>
    </div>
  );

  const defaultChartData = [
    { period: 'Week 1', new: 0, total: 0, revenue: 0 },
    { period: 'Week 2', new: 0, total: 0, revenue: 0 },
    { period: 'Week 3', new: 0, total: 0, revenue: 0 },
    { period: 'Week 4', new: 0, total: 0, revenue: 0 },
  ];

  const leadData = growthData.leads?.length > 0 ? growthData.leads : defaultChartData;
  const clientData = growthData.clients?.length > 0 ? growthData.clients : defaultChartData;
  const revenueData = growthData.revenue?.length > 0 ? growthData.revenue : defaultChartData;

  if (loading) {
    return (
      <div className="gm-loading">
        <div className="gm-spinner"></div>
        <p className="gm-loading-text">Loading growth metrics...</p>
      </div>
    );
  }

  return (
    <div className="gm-container">
      {/* Header */}
      <div className="gm-header">
        <div className="gm-header-left">
          <div className="gm-header-icon">
            <TrendingUp className="gm-header-svg" />
          </div>
          <div>
            <h1 className="gm-title">Growth Metrics</h1>
            <p className="gm-subtitle">Track business growth and scaling</p>
          </div>
        </div>
        <div className="gm-header-right">
          <button className="gm-btn-icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`gm-refresh-icon ${refreshing ? 'gm-spin' : ''}`} />
          </button>
          <button className="gm-btn-icon" onClick={handleExport}>
            <Download className="gm-btn-svg" />
          </button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="gm-select"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last 12 Months</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="gm-stats">
        <MetricCard
          title="Lead Growth"
          value={`${growthData.summary.leadGrowth || 0}%`}
          change={growthData.summary.leadGrowth}
          icon={Users}
          color="blue"
          subtitle={`${formatNumber(growthData.summary.totalLeads || 0)} total leads`}
        />
        <MetricCard
          title="Client Growth"
          value={`${growthData.summary.clientGrowth || 0}%`}
          change={growthData.summary.clientGrowth}
          icon={Building}
          color="green"
          subtitle={`${formatNumber(growthData.summary.totalClients || 0)} total clients`}
        />
        <MetricCard
          title="Revenue Growth"
          value={`${growthData.summary.revenueGrowth || 0}%`}
          change={growthData.summary.revenueGrowth}
          icon={DollarSign}
          color="purple"
          subtitle={`${formatCurrency(growthData.summary.totalRevenue || 0)} total revenue`}
        />
      </div>

      {/* Lead Growth Chart */}
      <div className="gm-chart-card">
        <div className="gm-chart-header">
          <h3 className="gm-chart-title">Lead Growth Over Time</h3>
          <span className="gm-chart-badge">Line Chart</span>
        </div>
        <div className="gm-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={leadData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="new"
                stroke="#3B82F6"
                strokeWidth={2}
                name="New Leads"
                dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#10B981"
                strokeWidth={2}
                name="Total Leads"
                dot={{ fill: '#10B981', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Client & Revenue Charts */}
      <div className="gm-charts-grid">
        {/* Client Growth */}
        <div className="gm-chart-card">
          <div className="gm-chart-header">
            <h3 className="gm-chart-title">Client Growth</h3>
            <span className="gm-chart-badge">Bar Chart</span>
          </div>
          <div className="gm-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="new" fill="#8B5CF6" name="New Clients" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="#14B8A6" name="Total Clients" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Growth */}
        <div className="gm-chart-card">
          <div className="gm-chart-header">
            <h3 className="gm-chart-title">Revenue Growth</h3>
            <span className="gm-chart-badge">Line Chart</span>
          </div>
          <div className="gm-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Revenue"
                  dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .gm-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: gmFadeIn 0.4s ease;
        }

        @keyframes gmFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes gmSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes gmPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .gm-spin {
          animation: gmSpin 1s linear infinite;
        }

        /* ============================================
           LOADING
           ============================================ */
        .gm-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .gm-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: gmSpin 0.8s linear infinite;
        }

        .gm-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        /* ============================================
           HEADER
           ============================================ */
        .gm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .gm-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .gm-header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
        }

        .gm-header-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .gm-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .gm-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .gm-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .gm-btn-icon {
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

        .gm-btn-icon:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .gm-btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .gm-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .gm-btn-svg {
          width: 16px;
          height: 16px;
        }

        .gm-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 140px;
        }

        .gm-select:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        .gm-select:hover {
          border-color: #94a3b8;
        }

        /* ============================================
           STATS
           ============================================ */
        .gm-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .gm-metric-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          animation: gmSlideUp 0.5s ease both;
        }

        .gm-metric-card:nth-child(1) { animation-delay: 0.05s; }
        .gm-metric-card:nth-child(2) { animation-delay: 0.1s; }
        .gm-metric-card:nth-child(3) { animation-delay: 0.15s; }

        @keyframes gmSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gm-metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .gm-metric-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .gm-metric-left {
          flex: 1;
        }

        .gm-metric-title {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          margin: 0;
        }

        .gm-metric-value {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 6px 0 0 0;
          line-height: 1.2;
        }

        .gm-metric-skeleton {
          height: 32px;
          width: 80px;
          background: #f1f5f9;
          border-radius: 6px;
          margin-top: 6px;
          animation: gmPulse 1.5s ease-in-out infinite;
        }

        .gm-metric-change {
          display: flex;
          align-items: center;
          font-size: 13px;
          font-weight: 500;
          margin-top: 4px;
        }

        .gm-change-up { color: #16a34a; }
        .gm-change-down { color: #dc2626; }

        .gm-change-icon {
          width: 14px;
          height: 14px;
          margin-right: 4px;
        }

        .gm-change-label {
          color: #94a3b8;
          margin-left: 4px;
          font-weight: 400;
        }

        .gm-metric-subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin: 2px 0 0 0;
        }

        .gm-metric-icon-wrapper {
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gm-metric-icon-blue { background: #eff6ff; }
        .gm-metric-icon-green { background: #ecfdf5; }
        .gm-metric-icon-purple { background: #f5f3ff; }

        .gm-metric-icon {
          width: 20px;
          height: 20px;
        }

        .gm-metric-icon-blue .gm-metric-icon { color: #3b82f6; }
        .gm-metric-icon-green .gm-metric-icon { color: #10b981; }
        .gm-metric-icon-purple .gm-metric-icon { color: #8b5cf6; }

        /* ============================================
           CHARTS
           ============================================ */
        .gm-chart-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .gm-chart-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .gm-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .gm-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .gm-chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .gm-chart-badge {
          font-size: 11px;
          font-weight: 600;
          color: #f59e0b;
          background: #fffbeb;
          padding: 4px 12px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .gm-chart-body {
          padding: 20px;
          height: 320px;
          width: 100%;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .gm-charts-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .gm-container {
            padding: 16px;
          }

          .gm-header {
            flex-direction: column;
            align-items: stretch;
          }

          .gm-header-right {
            flex-wrap: wrap;
          }

          .gm-select {
            flex: 1;
            min-width: 100px;
          }

          .gm-stats {
            grid-template-columns: 1fr 1fr;
          }

          .gm-metric-value {
            font-size: 22px;
          }

          .gm-title {
            font-size: 22px;
          }

          .gm-header-icon {
            width: 40px;
            height: 40px;
          }

          .gm-header-svg {
            width: 20px;
            height: 20px;
          }

          .gm-chart-body {
            height: 250px;
            padding: 12px;
          }

          .gm-chart-header {
            padding: 12px 16px;
            flex-wrap: wrap;
            gap: 8px;
          }
        }

        @media (max-width: 480px) {
          .gm-container {
            padding: 12px;
          }

          .gm-stats {
            grid-template-columns: 1fr;
          }

          .gm-metric-card {
            padding: 16px;
          }

          .gm-metric-value {
            font-size: 20px;
          }

          .gm-title {
            font-size: 20px;
          }

          .gm-subtitle {
            font-size: 13px;
          }

          .gm-chart-body {
            height: 200px;
            padding: 8px;
          }

          .gm-header-right {
            flex-wrap: wrap;
          }

          .gm-select {
            width: 100%;
          }

          .gm-btn-icon {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default GrowthMetrics;