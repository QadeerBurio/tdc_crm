// pages/ExecutiveDashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Loader } from '../../components/common/Loader';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Target,
  DollarSign,
  Award,
  Calendar,
  Activity
} from 'lucide-react';

// Updated color palette
const COLORS = ['#013E37', '#FFEFB3', '#2D6A5F', '#FFD966', '#4A8C7A'];
const PRIMARY_COLOR = '#013E37';
const ACCENT_COLOR = '#FFEFB3';
const WHITE = '#FFFFFF';
const TEXT_DARK = '#013E37';
const TEXT_LIGHT = '#4A6A6A';
const SUCCESS_COLOR = '#2D6A5F';
const CHART_GRADIENT_START = '#013E37';
const CHART_GRADIENT_END = '#4A8C7A';

const ExecutiveDashboard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    revenue: { totalRevenue: 0, revenueData: [] },
    sales: { conversionRate: 0, stageBreakdown: [] },
    projects: { active: 0 },
    employees: { averageProductivity: 0, departmentStats: [], topPerformers: [] },
    brands: []
  });
  const [timeRange, setTimeRange] = useState('month');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/analytics/executive-dashboard`, {
        params: { timeRange },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success && response.data?.data) {
        setDashboardData(response.data.data);
      } else {
        toast.error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      let errorMessage = 'Failed to load dashboard data.';
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to view this dashboard.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader size="lg" />
      </div>
    );
  }

  const {
    revenue = { totalRevenue: 0, revenueData: [] },
    sales = { conversionRate: 0, stageBreakdown: [] },
    projects = { active: 0 },
    employees = { averageProductivity: 0, departmentStats: [], topPerformers: [] },
    brands = []
  } = dashboardData;

  const revenueData = revenue.revenueData || [];
  const stageBreakdown = sales.stageBreakdown || [];
  const departmentStats = employees.departmentStats || [];
  const topPerformers = employees.topPerformers || [];

  // Default data for empty states
  const defaultRevenueData = [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
    { month: 'Jun', revenue: 0 },
  ];

  const displayRevenueData = revenueData.length > 0 ? revenueData : defaultRevenueData;
  const displayBrands = brands.length > 0 ? brands : [{ name: 'No Data', revenue: 1 }];
  const displayStages = stageBreakdown.length > 0 ? stageBreakdown : [{ _id: 'No Data', count: 0 }];
  const displayDepartments = departmentStats.length > 0 ? departmentStats : [{ department: 'No Data', productivity: 0, taskCompletion: 0 }];
  const displayPerformers = topPerformers.length > 0 ? topPerformers : [{ name: 'No Data', department: 'N/A', averageScore: 0 }];

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Metric cards data
  const metricCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(revenue.totalRevenue || 0),
      change: '+15.3%',
      changeLabel: 'from last month',
      icon: DollarSign,
      iconBg: '#013E37',
      iconColor: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #013E37 0%, #2D6A5F 100%)',
    },
    {
      title: 'Conversion Rate',
      value: `${sales.conversionRate || 0}%`,
      change: '+2.1%',
      changeLabel: 'from last month',
      icon: Target,
      iconBg: '#2D6A5F',
      iconColor: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #2D6A5F 0%, #4A8C7A 100%)',
    },
    {
      title: 'Active Projects',
      value: projects.active || 0,
      change: '+4',
      changeLabel: 'new this month',
      icon: Briefcase,
      iconBg: '#FFD966',
      iconColor: '#013E37',
      gradient: 'linear-gradient(135deg, #FFD966 0%, #FFEFB3 100%)',
    },
    {
      title: 'Avg Productivity',
      value: `${employees.averageProductivity || 0}%`,
      change: '+5.2%',
      changeLabel: 'from last month',
      icon: Activity,
      iconBg: '#4A8C7A',
      iconColor: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #4A8C7A 0%, #2D6A5F 100%)',
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Executive Dashboard</h1>
          <p style={styles.subtitle}>Welcome back! Here's what's happening with your business</p>
        </div>
        <div style={styles.timeRangeContainer}>
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                ...styles.timeRangeButton,
                backgroundColor: timeRange === range ? PRIMARY_COLOR : ACCENT_COLOR,
                color: timeRange === range ? WHITE : TEXT_DARK,
              }}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={styles.metricsGrid}>
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} style={styles.metricCard}>
              <div style={styles.metricCardHeader}>
                <div style={styles.metricIconWrapper}>
                  <div style={{ ...styles.metricIcon, background: card.iconBg }}>
                    <Icon size={20} color={card.iconColor} />
                  </div>
                </div>
                <div style={styles.metricTrend}>
                  <span style={styles.trendIndicator}>↑</span>
                  <span style={styles.trendValue}>{card.change}</span>
                </div>
              </div>
              <p style={styles.metricValue}>{card.value}</p>
              <p style={styles.metricLabel}>{card.title}</p>
              <div style={styles.metricFooter}>
                <span style={styles.metricChangePositive}>
                  {card.change} {card.changeLabel}
                </span>
              </div>
              <div style={styles.metricProgressBar}>
                <div style={{ ...styles.metricProgressFill, width: '65%', background: card.gradient }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        {/* Revenue Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Revenue Trend</h3>
            <span style={styles.chartBadge}>This {timeRange}</span>
          </div>
          <div style={styles.chartContent}>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_GRADIENT_START} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={CHART_GRADIENT_END} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" />
                  <XAxis dataKey="month" stroke={TEXT_LIGHT} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} stroke={TEXT_LIGHT} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: WHITE, borderColor: ACCENT_COLOR }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={PRIMARY_COLOR}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Brand Performance */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Brand Performance</h3>
            <span style={styles.chartBadge}>Revenue Share</span>
          </div>
          <div style={styles.chartContent}>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayBrands}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {displayBrands.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: WHITE, borderColor: ACCENT_COLOR }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lead Pipeline */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Lead Pipeline</h3>
            <span style={styles.chartBadge}>Stage Distribution</span>
          </div>
          <div style={styles.chartContent}>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayStages}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" />
                  <XAxis dataKey="_id" stroke={TEXT_LIGHT} />
                  <YAxis stroke={TEXT_LIGHT} />
                  <Tooltip contentStyle={{ backgroundColor: WHITE, borderColor: ACCENT_COLOR }} />
                  <Bar dataKey="count" fill={PRIMARY_COLOR} name="Leads" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Department Productivity */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Department Productivity</h3>
            <span style={styles.chartBadge}>Performance</span>
          </div>
          <div style={styles.chartContent}>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayDepartments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" />
                  <XAxis dataKey="department" stroke={TEXT_LIGHT} />
                  <YAxis yAxisId="left" stroke={TEXT_LIGHT} />
                  <YAxis yAxisId="right" orientation="right" stroke={TEXT_LIGHT} />
                  <Tooltip contentStyle={{ backgroundColor: WHITE, borderColor: ACCENT_COLOR }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="productivity" fill="#2D6A5F" name="Productivity %" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="taskCompletion" fill={PRIMARY_COLOR} name="Tasks Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div style={styles.performersCard}>
        <div style={styles.performersHeader}>
          <h3 style={styles.performersTitle}>Top Performers</h3>
          <span style={styles.chartBadge}>This Month</span>
        </div>
        <div style={styles.performersContent}>
          <div style={styles.performersGrid}>
            {displayPerformers.map((performer, index) => (
              <div key={index} style={styles.performerCard}>
                <div style={styles.performerRank}>#{index + 1}</div>
                <div style={styles.performerAvatar}>
                  {performer.name?.charAt(0) || '?'}
                </div>
                <div style={styles.performerInfo}>
                  <p style={styles.performerName}>
                    {performer.name || 'Unknown'}
                  </p>
                  <p style={styles.performerDepartment}>
                    {performer.department || 'N/A'}
                  </p>
                </div>
                <div style={styles.performerScore}>
                  <span style={styles.performerScoreValue}>
                    {performer.averageScore || 0}%
                  </span>
                  <span style={styles.performerScoreLabel}>Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    backgroundColor: '#FFFDF5',
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '96vh',
    backgroundColor: '#FFFDF5',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: PRIMARY_COLOR,
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: TEXT_LIGHT,
    margin: '4px 0 0 0',
  },
  timeRangeContainer: {
    display: 'flex',
    gap: '8px',
  },
  timeRangeButton: {
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    border: `1px solid ${ACCENT_COLOR}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  metricCard: {
    backgroundColor: WHITE,
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(1, 62, 55, 0.08)',
    border: `1px solid ${ACCENT_COLOR}`,
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  metricCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  metricIconWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  metricIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    backgroundColor: '#E8F5E9',
    borderRadius: '20px',
  },
  trendIndicator: {
    color: SUCCESS_COLOR,
    fontSize: '14px',
    fontWeight: '700',
  },
  trendValue: {
    color: SUCCESS_COLOR,
    fontSize: '13px',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: PRIMARY_COLOR,
    margin: 0,
    lineHeight: 1.2,
  },
  metricLabel: {
    fontSize: '14px',
    color: TEXT_LIGHT,
    margin: '4px 0 0 0',
    fontWeight: '500',
  },
  metricFooter: {
    marginTop: '12px',
  },
  metricChangePositive: {
    fontSize: '13px',
    color: SUCCESS_COLOR,
    fontWeight: '500',
  },
  metricProgressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#F0F0F0',
    borderRadius: '4px',
    marginTop: '16px',
    overflow: 'hidden',
  },
  metricProgressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.6s ease',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '32px',
  },
  chartCard: {
    backgroundColor: WHITE,
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(1, 62, 55, 0.08)',
    overflow: 'hidden',
    border: `1px solid ${ACCENT_COLOR}`,
    transition: 'all 0.3s ease',
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: `2px solid ${ACCENT_COLOR}`,
    backgroundColor: '#FFFDF5',
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: PRIMARY_COLOR,
    margin: 0,
  },
  chartBadge: {
    fontSize: '12px',
    fontWeight: '500',
    color: TEXT_LIGHT,
    backgroundColor: '#F0F0F0',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  chartContent: {
    padding: '24px',
  },
  chartContainer: {
    height: '320px',
    width: '100%',
  },
  performersCard: {
    backgroundColor: WHITE,
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(1, 62, 55, 0.08)',
    overflow: 'hidden',
    border: `1px solid ${ACCENT_COLOR}`,
  },
  performersHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: `2px solid ${ACCENT_COLOR}`,
    backgroundColor: '#FFFDF5',
  },
  performersTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: PRIMARY_COLOR,
    margin: 0,
  },
  performersContent: {
    padding: '24px',
  },
  performersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  performerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#FFFDF5',
    borderRadius: '12px',
    border: `1px solid ${ACCENT_COLOR}`,
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  performerRank: {
    position: 'absolute',
    top: '8px',
    right: '12px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#D0C8B8',
  },
  performerAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: PRIMARY_COLOR,
    color: WHITE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    flexShrink: 0,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: '16px',
    fontWeight: '500',
    color: PRIMARY_COLOR,
    margin: 0,
  },
  performerDepartment: {
    fontSize: '13px',
    color: TEXT_LIGHT,
    margin: 0,
  },
  performerScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingLeft: '12px',
    borderLeft: `2px solid ${ACCENT_COLOR}`,
  },
  performerScoreValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: SUCCESS_COLOR,
  },
  performerScoreLabel: {
    fontSize: '11px',
    color: TEXT_LIGHT,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

// Add hover and responsive styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .metric-card:hover {
    box-shadow: 0 8px 24px rgba(1, 62, 55, 0.15) !important;
    transform: translateY(-4px);
    transition: all 0.3s ease;
  }
  
  .time-range-button:hover:not(.active) {
    background-color: #E8E0D0 !important;
    border-color: #013E37 !important;
  }
  
  .time-range-button.active {
    background-color: #013E37 !important;
    color: #FFFFFF !important;
  }
  
  .performer-card:hover {
    background-color: ${ACCENT_COLOR} !important;
    border-color: ${PRIMARY_COLOR} !important;
    transform: translateX(4px);
    transition: all 0.2s ease;
  }
  
  .chart-card:hover {
    box-shadow: 0 8px 24px rgba(1, 62, 55, 0.12) !important;
    transition: all 0.3s ease;
  }
  
  @media (max-width: 1024px) {
    .charts-grid {
      grid-template-columns: 1fr !important;
    }
  }
  
  @media (max-width: 768px) {
    .metrics-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .time-range-container {
      justify-content: center !important;
    }
    
    .performers-grid {
      grid-template-columns: 1fr !important;
    }
  }
  
  @media (max-width: 480px) {
    .metrics-grid {
      grid-template-columns: 1fr !important;
    }
    
    .container {
      padding: 16px !important;
    }
    
    .time-range-container {
      flex-wrap: wrap !important;
    }
    
    .time-range-button {
      flex: 1 !important;
      min-width: 60px !important;
      text-align: center !important;
      padding: 8px 12px !important;
    }
    
    .metric-value {
      font-size: 24px !important;
    }
    
    .title {
      font-size: 22px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ExecutiveDashboard;