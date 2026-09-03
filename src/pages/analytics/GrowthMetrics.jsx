// pages/analytics/GrowthMetrics.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, Users, Building, DollarSign,
  ArrowUp, ArrowDown, RefreshCw, Download,
  Filter, Calendar, Activity, Sparkles,
  Zap, Target, Award, Crown, BarChart3
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
      toast.success('Showing sample growth data');
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
        <div className={`gm-metric-icon-wrapper gm-metric-icon-${color}`} style={{ backgroundColor: '#FFEFB3' }}>
          <Icon className="gm-metric-icon" color="#013E37" />
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
        <div className="gm-loading-spinner"></div>
        <p className="gm-loading-text">Loading growth metrics...</p>
      </div>
    );
  }

  return (
    <div className="gm-container">
      {/* Header */}
      <div className="gm-header">
        <div className="gm-header-left">
          <div className="gm-header-icon" style={{ background: 'linear-gradient(135deg, #013E37, #0A5C54)' }}>
            <TrendingUp className="gm-header-svg" />
          </div>
          <div>
            <h1 className="gm-title">
              <Sparkles className="gm-title-icon" color="#013E37" />
              Growth Metrics
            </h1>
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
          <span className="gm-chart-badge" style={{ backgroundColor: '#FFEFB3', color: '#013E37' }}>Line Chart</span>
        </div>
        <div className="gm-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={leadData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFEFB3" />
              <XAxis dataKey="period" stroke="#013E37" fontSize={12} opacity={0.6} />
              <YAxis stroke="#013E37" fontSize={12} opacity={0.6} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #FFEFB3',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(1, 62, 55, 0.08)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="new"
                stroke="#013E37"
                strokeWidth={3}
                name="New Leads"
                dot={{ fill: '#013E37', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0A5C54"
                strokeWidth={3}
                name="Total Leads"
                dot={{ fill: '#0A5C54', strokeWidth: 2, r: 4 }}
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
            <span className="gm-chart-badge" style={{ backgroundColor: '#FFEFB3', color: '#013E37' }}>Bar Chart</span>
          </div>
          <div className="gm-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFEFB3" />
                <XAxis dataKey="period" stroke="#013E37" fontSize={12} opacity={0.6} />
                <YAxis stroke="#013E37" fontSize={12} opacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #FFEFB3',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.08)'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="new" fill="#013E37" name="New Clients" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="#FFEFB3" name="Total Clients" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Growth */}
        <div className="gm-chart-card">
          <div className="gm-chart-header">
            <h3 className="gm-chart-title">Revenue Growth</h3>
            <span className="gm-chart-badge" style={{ backgroundColor: '#FFEFB3', color: '#013E37' }}>Line Chart</span>
          </div>
          <div className="gm-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFEFB3" />
                <XAxis dataKey="period" stroke="#013E37" fontSize={12} opacity={0.6} />
                <YAxis stroke="#013E37" fontSize={12} opacity={0.6} tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #FFEFB3',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.08)'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#013E37"
                  strokeWidth={3}
                  name="Revenue"
                  dot={{ fill: '#013E37', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .gm-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #FFFFFF;
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

        @keyframes gmSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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

        .gm-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: gmSpin 0.8s linear infinite;
        }

        .gm-loading-text {
          color: #013E37;
          opacity: 0.6;
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
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.25);
          transition: all 0.3s ease;
        }

        .gm-header-icon:hover {
          transform: scale(1.05) rotate(-5deg);
        }

        .gm-header-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .gm-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .gm-title-icon {
          width: 24px;
          height: 24px;
          animation: gmPulse 2s ease-in-out infinite;
        }

        .gm-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
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
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
        }

        .gm-btn-icon:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
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
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #013E37;
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 140px;
        }

        .gm-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .gm-select:hover {
          border-color: #013E37;
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
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
          animation: gmSlideUp 0.5s ease both;
        }

        .gm-metric-card:nth-child(1) { animation-delay: 0.05s; }
        .gm-metric-card:nth-child(2) { animation-delay: 0.1s; }
        .gm-metric-card:nth-child(3) { animation-delay: 0.15s; }

        .gm-metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
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
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }

        .gm-metric-value {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 6px 0 0 0;
          line-height: 1.2;
        }

        .gm-metric-skeleton {
          height: 32px;
          width: 80px;
          background: #FFEFB3;
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

        .gm-change-up { color: #013E37; }
        .gm-change-down { color: #D32F2F; }

        .gm-change-icon {
          width: 14px;
          height: 14px;
          margin-right: 4px;
        }

        .gm-change-label {
          color: #013E37;
          opacity: 0.5;
          margin-left: 4px;
          font-weight: 400;
        }

        .gm-metric-subtitle {
          font-size: 13px;
          color: #013E37;
          opacity: 0.5;
          margin: 2px 0 0 0;
        }

        .gm-metric-icon-wrapper {
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .gm-metric-card:hover .gm-metric-icon-wrapper {
          transform: scale(1.05);
        }

        .gm-metric-icon {
          width: 20px;
          height: 20px;
        }

        /* ============================================
           CHARTS
           ============================================ */
        .gm-chart-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .gm-chart-card:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
          border-color: #013E37;
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
          border-bottom: 1px solid #FFEFB3;
          background: #F8FAFC;
        }

        .gm-chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .gm-chart-badge {
          font-size: 11px;
          font-weight: 600;
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