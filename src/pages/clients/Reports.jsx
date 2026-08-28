// pages/Reports.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { 
  BarChart, 
  LineChart, 
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Download, 
  FileText, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Reports = () => {
  const { token } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    overview: null,
    projectProgress: [],
    taskCompletion: [],
    spending: [],
    timeline: []
  });

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchReportData();
  }, [timeRange, reportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/clients/reports`, {
        params: { 
          timeRange, 
          reportType 
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setReportData({
          overview: response.data.data?.overview || null,
          projectProgress: response.data.data?.projectProgress || [],
          taskCompletion: response.data.data?.taskCompletion || [],
          spending: response.data.data?.spending || [],
          timeline: response.data.data?.timeline || []
        });
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      let errorMessage = 'Failed to load report data.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view reports.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const handleExport = async (format = 'pdf') => {
    try {
      const response = await axios.get(`${API_URL}/clients/reports/export`, {
        params: {
          timeRange,
          reportType,
          format
        },
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Error exporting report:', err);
      toast.error('Failed to export report. Please try again.');
    }
  };

  const renderOverviewReport = () => {
    const overview = reportData.overview;
    if (!overview) return null;

    return (
      <div style={styles.overviewContainer}>
        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <div>
                <p style={styles.statLabel}>Total Projects</p>
                <p style={styles.statValue}>{overview.totalProjects || 0}</p>
              </div>
              <div style={{...styles.statIconWrapper, backgroundColor: '#dbeafe'}}>
                <FileText style={{...styles.statIcon, color: '#2563EB'}} />
              </div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <div>
                <p style={styles.statLabel}>Completion Rate</p>
                <p style={{...styles.statValue, color: '#16A34A'}}>
                  {overview.completionRate || 0}%
                </p>
              </div>
              <div style={{...styles.statIconWrapper, backgroundColor: '#d1fae5'}}>
                <CheckCircle style={{...styles.statIcon, color: '#16A34A'}} />
              </div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <div>
                <p style={styles.statLabel}>Total Spent</p>
                <p style={{...styles.statValue, color: '#7C3AED'}}>
                  {formatCurrency(overview.totalSpent)}
                </p>
              </div>
              <div style={{...styles.statIconWrapper, backgroundColor: '#ede9fe'}}>
                <DollarSign style={{...styles.statIcon, color: '#7C3AED'}} />
              </div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <div>
                <p style={styles.statLabel}>Budget Remaining</p>
                <p style={{...styles.statValue, color: '#2563EB'}}>
                  {formatCurrency(overview.budgetRemaining)}
                </p>
              </div>
              <div style={{...styles.statIconWrapper, backgroundColor: '#dbeafe'}}>
                <TrendingUp style={{...styles.statIcon, color: '#2563EB'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Project Progress Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Project Progress</h3>
          </div>
          <div style={styles.chartContent}>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.projectProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progress" fill="#3B82F6" name="Progress %" />
                  <Bar dataKey="budgetUsed" fill="#8B5CF6" name="Budget Used %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProjectReport = () => {
    // Default data if empty
    const defaultTaskData = [
      { date: 'Jan', completed: 0, inProgress: 0 },
      { date: 'Feb', completed: 0, inProgress: 0 },
      { date: 'Mar', completed: 0, inProgress: 0 },
    ];

    const taskData = reportData.taskCompletion?.length > 0 
      ? reportData.taskCompletion 
      : defaultTaskData;

    const spendingData = reportData.spending?.length > 0 
      ? reportData.spending 
      : [{ name: 'No Data', value: 1 }];

    const timelineData = reportData.timeline?.length > 0 
      ? reportData.timeline 
      : [{ date: 'Jan', value: 0 }];

    return (
      <div style={styles.projectReportContainer}>
        {/* Task Completion Trends */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Task Completion Trends</h3>
          </div>
          <div style={styles.chartContent}>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={taskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" name="Completed" />
                  <Line type="monotone" dataKey="inProgress" stroke="#3B82F6" name="In Progress" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={styles.chartsGrid}>
          {/* Spending Breakdown */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Spending Breakdown</h3>
            </div>
            <div style={styles.chartContent}>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {spendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Timeline Overview */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Timeline Overview</h3>
            </div>
            <div style={styles.chartContent}>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Reports</h1>
          <p style={styles.subtitle}>View project performance and analytics</p>
        </div>
        <div style={styles.headerActions}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={[
              { value: 'week', label: 'Last 7 Days' },
              { value: 'month', label: 'Last 30 Days' },
              { value: 'quarter', label: 'Last 3 Months' },
              { value: 'year', label: 'Last 12 Months' }
            ]}
            style={styles.select}
          />
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'overview', label: 'Overview' },
              { value: 'project', label: 'Project Report' },
              { value: 'financial', label: 'Financial Report' },
              { value: 'performance', label: 'Performance Report' }
            ]}
            style={styles.select}
          />
          <button style={{...styles.exportButton, ...styles.exportButtonOutline}} onClick={() => handleExport('pdf')}>
            <Download style={styles.exportIcon} />
            Export PDF
          </button>
          <button style={{...styles.exportButton, ...styles.exportButtonOutline}} onClick={() => handleExport('excel')}>
            <FileText style={styles.exportIcon} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
        </div>
      ) : (
        <>
          {reportType === 'overview' ? renderOverviewReport() : renderProjectReport()}
        </>
      )}
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
  header: {
    display: 'flex',
    flexDirection: 'row',
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
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  select: {
    minWidth: '150px',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  exportButtonOutline: {
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
  },
  exportIcon: {
    width: '16px',
    height: '16px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '48px 0',
  },
  spinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
  },
  overviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  statIconWrapper: {
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    width: '24px',
    height: '24px',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
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
    height: '300px',
    width: '100%',
  },
  projectReportContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
};

// Add keyframe and hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .export-button-outline:hover {
    background-color: #F9FAFB !important;
  }
  
  @media (max-width: 1024px) {
    .charts-grid {
      grid-template-columns: 1fr !important;
    }
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .header-actions {
      flex-direction: column !important;
      width: 100% !important;
    }
    
    .select {
      width: 100% !important;
    }
    
    .export-button {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 16px !important;
    }
    
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Reports;