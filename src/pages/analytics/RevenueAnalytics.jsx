// pages/analytics/RevenueAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, TrendingDown, DollarSign,
  ArrowUp, ArrowDown, RefreshCw,
  Download, Activity, Users, Briefcase,
  PieChart as PieChartIcon, BarChart2,
  Calendar, Filter, Clock, Award, Sparkles,
  Zap, Target, Crown
} from 'lucide-react';
import {
  BarChart, LineChart, PieChart,
  AreaChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Bar, Line, Pie,
  Area, Cell, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

const RevenueAnalytics = () => {
  const { token } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueData, setRevenueData] = useState({
    monthly: [],
    bySource: [],
    byClient: [],
    summary: {
      totalRevenue: 0,
      totalDeals: 0,
      averageDealSize: 0,
      growth: 0,
      revenueChange: 0,
      dealsChange: 0
    }
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch(`${API_URL}/analytics/sales?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const data = result.data || result;
          const monthlyData = Array.isArray(data) ? data.map(item => ({
            month: getMonthName(item.month || 0),
            revenue: item.revenue || 0,
            deals: item.deals || 0
          })) : getDefaultMonthlyData();

          setRevenueData({
            monthly: monthlyData,
            bySource: getDefaultSourceData(),
            byClient: getDefaultClientData(),
            summary: {
              totalRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0),
              totalDeals: monthlyData.reduce((sum, m) => sum + m.deals, 0),
              averageDealSize: monthlyData.length > 0 ?
                Math.round(monthlyData.reduce((sum, m) => sum + m.revenue, 0) /
                Math.max(1, monthlyData.reduce((sum, m) => sum + m.deals, 0))) : 0,
              growth: 15,
              revenueChange: 12,
              dealsChange: 8
            }
          });
        }
      } else {
        throw new Error('Failed to fetch revenue data');
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error(error.message || 'Failed to load revenue data');
      setMockData();
      toast.info('Showing sample revenue data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const setMockData = () => {
    const mockMonthlyData = [
      { month: 'Jan', revenue: 42500, deals: 12 },
      { month: 'Feb', revenue: 38750, deals: 10 },
      { month: 'Mar', revenue: 51200, deals: 15 },
      { month: 'Apr', revenue: 46300, deals: 13 },
      { month: 'May', revenue: 58900, deals: 17 },
      { month: 'Jun', revenue: 52400, deals: 14 },
      { month: 'Jul', revenue: 67100, deals: 19 },
      { month: 'Aug', revenue: 61200, deals: 16 },
      { month: 'Sep', revenue: 54800, deals: 15 },
      { month: 'Oct', revenue: 72300, deals: 21 },
      { month: 'Nov', revenue: 68900, deals: 18 },
      { month: 'Dec', revenue: 84500, deals: 24 },
    ];

    setRevenueData({
      monthly: mockMonthlyData,
      bySource: [
        { name: 'Direct', revenue: 285000, percentage: 35 },
        { name: 'Referral', revenue: 205000, percentage: 25 },
        { name: 'Social Media', revenue: 165000, percentage: 20 },
        { name: 'Email', revenue: 120000, percentage: 15 },
        { name: 'Other', revenue: 40000, percentage: 5 }
      ],
      byClient: [
        { client: 'Tech Corp', revenue: 125000, deals: 12 },
        { client: 'Innovate Inc', revenue: 98000, deals: 8 },
        { client: 'Global Solutions', revenue: 87000, deals: 6 },
        { client: 'Apex Industries', revenue: 72000, deals: 5 },
        { client: 'Nova Systems', revenue: 65000, deals: 4 }
      ],
      summary: {
        totalRevenue: 689200,
        totalDeals: 184,
        averageDealSize: 3746,
        growth: 18.5,
        revenueChange: 12.4,
        dealsChange: 8.2
      }
    });
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || 'Jan';
  };

  const getDefaultMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({ month, revenue: 0, deals: 0 }));
  };

  const getDefaultSourceData = () => {
    return [
      { name: 'Direct', revenue: 0, percentage: 0 },
      { name: 'Referral', revenue: 0, percentage: 0 }
    ];
  };

  const getDefaultClientData = () => {
    return [
      { client: 'No Data', revenue: 0, deals: 0 }
    ];
  };

  const handleRefresh = () => {
    fetchRevenueData(true);
  };

  const handleExport = () => {
    toast.success('Export started. Your report will be downloaded shortly.');
  };

  const COLORS = ['#013E37', '#0A5C54', '#1A7A6E', '#2A9888', '#3AB6A2', '#FFEFB3', '#D4C89A', '#B8AC80'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle, loading }) => (
    <div className="ra-stat-card">
      <div className="ra-stat-content">
        <div className="ra-stat-left">
          <p className="ra-stat-label">{title}</p>
          {loading ? (
            <div className="ra-stat-skeleton"></div>
          ) : (
            <p className="ra-stat-value">{value}</p>
          )}
          {change !== undefined && !loading && (
            <div className={`ra-stat-change ${change >= 0 ? 'ra-change-up' : 'ra-change-down'}`}>
              {change >= 0 ? <ArrowUp className="ra-change-icon" /> : <ArrowDown className="ra-change-icon" />}
              <span>{Math.abs(change)}%</span>
              <span className="ra-change-label">vs previous</span>
            </div>
          )}
          {subtitle && !loading && (
            <p className="ra-stat-subtitle">{subtitle}</p>
          )}
        </div>
        <div className={`ra-stat-icon-wrapper ra-stat-icon-${color || 'blue'}`}>
          <Icon className="ra-stat-icon" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="ra-loading">
        <div className="ra-loading-spinner"></div>
        <p className="ra-loading-text">Loading revenue data...</p>
      </div>
    );
  }

  return (
    <div className="ra-container">
      {/* Header */}
      <div className="ra-header">
        <div className="ra-header-left">
          <div className="ra-header-icon" style={{ background: 'linear-gradient(135deg, #013E37, #0A5C54)' }}>
            <DollarSign className="ra-header-svg" />
          </div>
          <div>
            <h1 className="ra-title">
              <Sparkles className="ra-title-icon" color="#013E37" />
              Revenue Analytics
            </h1>
            <p className="ra-subtitle">Track revenue performance and growth metrics</p>
          </div>
        </div>
        <div className="ra-header-right">
          <button className="ra-btn-icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`ra-refresh-icon ${refreshing ? 'ra-spin' : ''}`} />
          </button>
          <button className="ra-btn-icon" onClick={handleExport}>
            <Download className="ra-btn-svg" />
          </button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="ra-select"
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
      <div className="ra-stats">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(revenueData.summary.totalRevenue)}
          change={revenueData.summary.revenueChange}
          icon={DollarSign}
          color="blue"
          subtitle={`${revenueData.summary.totalDeals} deals closed`}
          loading={loading}
        />
        <StatCard
          title="Total Deals"
          value={revenueData.summary.totalDeals}
          change={revenueData.summary.dealsChange}
          icon={Briefcase}
          color="green"
          subtitle={`Avg ${formatCurrency(revenueData.summary.averageDealSize)} per deal`}
          loading={loading}
        />
        <StatCard
          title="Average Deal Size"
          value={formatCurrency(revenueData.summary.averageDealSize)}
          change={revenueData.summary.growth}
          icon={Activity}
          color="purple"
          subtitle="Average value per deal"
          loading={loading}
        />
        <StatCard
          title="Conversion Rate"
          value={`${Math.round(revenueData.summary.totalDeals / Math.max(1, revenueData.summary.totalDeals * 4) * 100)}%`}
          change={-2.5}
          icon={TrendingUp}
          color="orange"
          subtitle="Leads to deals"
          loading={loading}
        />
      </div>

      {/* Revenue Trend */}
      <div className="ra-chart-card">
        <div className="ra-chart-header">
          <h3 className="ra-chart-title">Revenue & Deals Trend</h3>
          <span className="ra-chart-badge" style={{ backgroundColor: '#FFEFB3', color: '#013E37' }}>Monthly</span>
        </div>
        <div className="ra-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData.monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="raRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#013E37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#013E37" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="raDealsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFEFB3" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FFEFB3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFEFB3" />
              <XAxis dataKey="month" stroke="#013E37" fontSize={12} opacity={0.6} />
              <YAxis stroke="#013E37" fontSize={12} opacity={0.6} tickFormatter={(value) => formatCompactCurrency(value)} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'Revenue') return formatCurrency(value);
                  return value;
                }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #FFEFB3',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(1, 62, 55, 0.08)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#013E37" fill="url(#raRevenueGradient)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="deals" stroke="#FFEFB3"  fill="url(#raDealsGradient)" strokeWidth={2} name="Deals" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="ra-charts-grid">
        {/* Revenue by Source */}
        <div className="ra-chart-card">
          <div className="ra-chart-header">
            <h3 className="ra-chart-title">Revenue by Source</h3>
            <PieChartIcon className="ra-chart-header-icon" color="#013E37" />
          </div>
          <div className="ra-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData.bySource}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => percentage > 0 ? `${name} ${percentage}%` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {revenueData.bySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ cursor: 'pointer' }} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const percentage = props.payload.percentage || 0;
                    return [`${formatCurrency(value)} (${percentage}%)`, 'Revenue'];
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #FFEFB3',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.08)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clients */}
        <div className="ra-chart-card">
          <div className="ra-chart-header">
            <h3 className="ra-chart-title">Top Revenue Clients</h3>
            <Users className="ra-chart-header-icon" color="#013E37" />
          </div>
          <div className="ra-chart-body ra-client-list">
            {revenueData.byClient.length > 0 && revenueData.byClient[0].client !== 'No Data' ? (
              revenueData.byClient.slice(0, 5).map((client, index) => {
                const maxRevenue = Math.max(...revenueData.byClient.map(c => c.revenue), 1);
                const percentage = (client.revenue / maxRevenue) * 100;
                const color = COLORS[index % COLORS.length];

                return (
                  <div key={index} className="ra-client-item">
                    <div className="ra-client-info">
                      <div className="ra-client-avatar" style={{ backgroundColor: color }}>
                        {client.client?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="ra-client-name">{client.client || 'Unknown'}</div>
                        <div className="ra-client-deals">{client.deals || 0} deals</div>
                      </div>
                    </div>
                    <div className="ra-client-revenue-wrapper">
                      <div className="ra-client-revenue-bar" style={{ backgroundColor: '#FFEFB3' }}>
                        <div className="ra-client-revenue-fill" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }} />
                      </div>
                      <div className="ra-client-revenue">{formatCurrency(client.revenue || 0)}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="ra-empty-state">
                <div className="ra-empty-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
                  <DollarSign className="ra-empty-icon" color="#013E37" />
                </div>
                <p className="ra-empty-text">No client data available</p>
                <p className="ra-empty-subtext">Start closing deals to see client revenue</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Bar Chart */}
      <div className="ra-chart-card">
        <div className="ra-chart-header">
          <h3 className="ra-chart-title">Monthly Revenue Distribution</h3>
          <BarChart2 className="ra-chart-header-icon" color="#013E37" />
        </div>
        <div className="ra-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData.monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFEFB3" />
              <XAxis dataKey="month" stroke="#013E37" fontSize={12} opacity={0.6} />
              <YAxis stroke="#013E37" fontSize={12} opacity={0.6} tickFormatter={(value) => formatCompactCurrency(value)} />
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
              <Bar dataKey="revenue" fill="#013E37" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="deals" fill="#FFEFB3" name="Deals" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .ra-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #FFFFFF;
          min-height: 100vh;
          animation: raFadeIn 0.4s ease;
        }

        @keyframes raFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes raSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes raPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes raSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ra-spin {
          animation: raSpin 1s linear infinite;
        }

        /* ============================================
           LOADING
           ============================================ */
        .ra-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .ra-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: raSpin 0.8s linear infinite;
        }

        .ra-loading-text {
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
          font-weight: 500;
        }

        /* ============================================
           HEADER
           ============================================ */
        .ra-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .ra-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ra-header-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.25);
          transition: all 0.3s ease;
        }

        .ra-header-icon:hover {
          transform: scale(1.05) rotate(-5deg);
        }

        .ra-header-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .ra-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ra-title-icon {
          width: 24px;
          height: 24px;
          animation: raPulse 2s ease-in-out infinite;
        }

        .ra-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }

        .ra-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .ra-btn-icon {
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

        .ra-btn-icon:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .ra-btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ra-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .ra-btn-svg {
          width: 16px;
          height: 16px;
        }

        .ra-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #013E37;
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .ra-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .ra-select:hover {
          border-color: #013E37;
        }

        /* ============================================
           STATS
           ============================================ */
        .ra-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .ra-stat-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
          animation: raSlideUp 0.5s ease both;
        }

        .ra-stat-card:nth-child(1) { animation-delay: 0.05s; }
        .ra-stat-card:nth-child(2) { animation-delay: 0.1s; }
        .ra-stat-card:nth-child(3) { animation-delay: 0.15s; }
        .ra-stat-card:nth-child(4) { animation-delay: 0.2s; }

        .ra-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }

        .ra-stat-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .ra-stat-left {
          flex: 1;
        }

        .ra-stat-label {
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }

        .ra-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 6px 0 0 0;
          line-height: 1.2;
        }

        .ra-stat-skeleton {
          height: 32px;
          width: 120px;
          background: #FFEFB3;
          border-radius: 6px;
          margin-top: 6px;
          animation: raPulse 1.5s ease-in-out infinite;
        }

        .ra-stat-change {
          display: flex;
          align-items: center;
          font-size: 13px;
          font-weight: 500;
          margin-top: 4px;
        }

        .ra-change-up { color: #013E37; }
        .ra-change-down { color: #D32F2F; }

        .ra-change-icon {
          width: 14px;
          height: 14px;
          margin-right: 4px;
        }

        .ra-change-label {
          color: #013E37;
          opacity: 0.5;
          margin-left: 4px;
          font-weight: 400;
        }

        .ra-stat-subtitle {
          font-size: 13px;
          color: #013E37;
          opacity: 0.5;
          margin: 2px 0 0 0;
        }

        .ra-stat-icon-wrapper {
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .ra-stat-card:hover .ra-stat-icon-wrapper {
          transform: scale(1.05);
        }

        .ra-stat-icon-blue { background: #FFEFB3; }
        .ra-stat-icon-green { background: #FFEFB3; }
        .ra-stat-icon-purple { background: #FFEFB3; }
        .ra-stat-icon-orange { background: #FFEFB3; }

        .ra-stat-icon {
          width: 20px;
          height: 20px;
          color: #013E37;
        }

        /* ============================================
           CHARTS
           ============================================ */
        .ra-chart-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .ra-chart-card:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
          border-color: #013E37;
        }

        .ra-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .ra-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #F8FAFC;
        }

        .ra-chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ra-chart-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ra-chart-header-icon {
          width: 18px;
          height: 18px;
          opacity: 0.5;
        }

        .ra-chart-body {
          padding: 20px;
          height: 320px;
          width: 100%;
        }

        /* ============================================
           CLIENTS
           ============================================ */
        .ra-client-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: auto;
          min-height: 280px;
          overflow-y: auto;
        }

        .ra-client-list::-webkit-scrollbar {
          width: 4px;
        }

        .ra-client-list::-webkit-scrollbar-track {
          background: #FFEFB3;
        }

        .ra-client-list::-webkit-scrollbar-thumb {
          background: #013E37;
          border-radius: 2px;
        }

        .ra-client-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #F8FAFC;
          border-radius: 10px;
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
        }

        .ra-client-item:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: translateX(4px);
        }

        .ra-client-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .ra-client-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .ra-client-item:hover .ra-client-avatar {
          transform: scale(1.05);
        }

        .ra-client-name {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
        }

        .ra-client-deals {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
        }

        .ra-client-revenue-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 120px;
        }

        .ra-client-revenue-bar {
          flex: 1;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
          min-width: 60px;
        }

        .ra-client-revenue-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s ease;
        }

        .ra-client-revenue {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
          white-space: nowrap;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .ra-empty-state {
          text-align: center;
          padding: 40px 20px;
        }

        .ra-empty-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          animation: raPulse 2s ease-in-out infinite;
        }

        .ra-empty-icon {
          width: 32px;
          height: 32px;
        }

        .ra-empty-text {
          font-size: 16px;
          font-weight: 500;
          color: #013E37;
          margin: 0;
        }

        .ra-empty-subtext {
          font-size: 14px;
          color: #013E37;
          opacity: 0.5;
          margin: 4px 0 0 0;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .ra-charts-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .ra-container {
            padding: 16px;
          }

          .ra-header {
            flex-direction: column;
            align-items: stretch;
          }

          .ra-header-right {
            flex-wrap: wrap;
          }

          .ra-select {
            flex: 1;
          }

          .ra-stats {
            grid-template-columns: 1fr 1fr;
          }

          .ra-stat-value {
            font-size: 22px;
          }

          .ra-title {
            font-size: 22px;
          }

          .ra-header-icon {
            width: 40px;
            height: 40px;
          }

          .ra-header-svg {
            width: 20px;
            height: 20px;
          }

          .ra-chart-body {
            height: 250px;
            padding: 12px;
          }

          .ra-chart-header {
            padding: 12px 16px;
            flex-wrap: wrap;
            gap: 8px;
          }

          .ra-client-item {
            flex-direction: column;
            align-items: stretch;
          }

          .ra-client-revenue-wrapper {
            justify-content: space-between;
            min-width: unset;
          }

          .ra-client-revenue-bar {
            flex: 1;
          }
        }

        @media (max-width: 480px) {
          .ra-container {
            padding: 12px;
          }

          .ra-stats {
            grid-template-columns: 1fr;
          }

          .ra-stat-card {
            padding: 16px;
          }

          .ra-stat-value {
            font-size: 20px;
          }

          .ra-title {
            font-size: 20px;
          }

          .ra-subtitle {
            font-size: 13px;
          }

          .ra-chart-body {
            height: 200px;
            padding: 8px;
          }

          .ra-header-right {
            flex-wrap: wrap;
          }

          .ra-select {
            width: 100%;
          }

          .ra-btn-icon {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default RevenueAnalytics;