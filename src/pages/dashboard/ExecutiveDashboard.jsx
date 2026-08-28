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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Executive Dashboard</h1>
        <div style={styles.timeRangeContainer}>
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                ...styles.timeRangeButton,
                backgroundColor: timeRange === range ? '#3B82F6' : '#F3F4F6',
                color: timeRange === range ? '#FFFFFF' : '#374151',
              }}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Total Revenue</p>
          <p style={styles.metricValue}>
            {formatCurrency(revenue.totalRevenue || 0)}
          </p>
          <p style={styles.metricChangePositive}>+15.3% from last month</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Conversion Rate</p>
          <p style={styles.metricValue}>
            {sales.conversionRate || 0}%
          </p>
          <p style={styles.metricChangePositive}>+2.1% from last month</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Active Projects</p>
          <p style={styles.metricValue}>
            {projects.active || 0}
          </p>
          <p style={styles.metricChangePositive}>+4 new this month</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Avg Productivity</p>
          <p style={styles.metricValue}>
            {employees.averageProductivity || 0}%
          </p>
          <p style={styles.metricChangePositive}>+5.2% from last month</p>
        </div>
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        {/* Revenue Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Revenue Trend</h3>
          </div>
          <div style={styles.chartContent}>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
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
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lead Pipeline */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Lead Pipeline</h3>
          </div>
          <div style={styles.chartContent}>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayStages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Department Productivity */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Department Productivity</h3>
          </div>
          <div style={styles.chartContent}>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayDepartments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="productivity" fill="#10B981" name="Productivity %" />
                  <Bar yAxisId="right" dataKey="taskCompletion" fill="#3B82F6" name="Tasks Completed" />
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
        </div>
        <div style={styles.performersContent}>
          <div style={styles.performersGrid}>
            {displayPerformers.map((performer, index) => (
              <div key={index} style={styles.performerCard}>
                <div style={styles.performerAvatar}>
                  {performer.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p style={styles.performerName}>
                    {performer.name || 'Unknown'}
                  </p>
                  <p style={styles.performerDepartment}>
                    {performer.department || 'N/A'}
                  </p>
                  <p style={styles.performerScore}>
                    Score: {performer.averageScore || 0}%
                  </p>
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
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '96vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  timeRangeContainer: {
    display: 'flex',
    gap: '8px',
  },
  timeRangeButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  metricLabel: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  metricChangePositive: {
    fontSize: '14px',
    color: '#22C55E',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  chartHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid #E5E7EB',
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  chartContent: {
    padding: '24px',
  },
  chartContainer: {
    height: '320px',
    width: '100%',
  },
  performersCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  performersHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid #E5E7EB',
  },
  performersTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  performersContent: {
    padding: '24px',
  },
  performersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
  },
  performerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
  },
  performerAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    flexShrink: 0,
  },
  performerName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
  },
  performerDepartment: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  performerScore: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#22C55E',
    margin: 0,
  },
};

// Add hover and responsive styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .metric-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s ease;
  }
  
  .time-range-button:hover:not(.active) {
    background-color: #E5E7EB !important;
  }
  
  .performer-card:hover {
    background-color: #F3F4F6 !important;
    transition: background-color 0.2s ease;
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
    }
  }
`;
document.head.appendChild(styleSheet);

export default ExecutiveDashboard;