// pages/employees/Performance.jsx - COMPLETE FIXED VERSION

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, CheckCircle, Clock, Award, 
  Filter, Calendar, Download, RefreshCw, Eye, Star, Target,
  Zap, Activity, Briefcase, UserCheck, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const Performance = () => {
  const { token, user } = useAuth();
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const [employees, setEmployees] = useState([]);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [viewMode, setViewMode] = useState('chart'); // ✅ ADD THIS LINE
  const [stats, setStats] = useState({
    avgProductivity: 0,
    avgTaskCompletion: 0,
    avgUtilization: 0,
    avgQaPass: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });
  const [summary, setSummary] = useState(null);

  const API_URL =  'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee || employees.length > 0) {
      fetchKPIs();
      fetchSummary();
    }
  }, [selectedEmployee, timeRange]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        params: { role: 'employee' },
        headers: { Authorization: `Bearer ${token}` }
      });

      let users = [];
      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          users = response.data.data;
        } else if (response.data.users && Array.isArray(response.data.users)) {
          users = response.data.users;
        } else if (Array.isArray(response.data)) {
          users = response.data;
        }
      }
      
      users = users.filter(u => u.role === 'employee' && u.status !== 'inactive');
      setEmployees(users);
      
      if (!selectedEmployee && users.length > 0) {
        setSelectedEmployee(users[0]._id);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      toast.error('Failed to load employees');
    }
  };

  const fetchKPIs = async () => {
    setLoading(true);
    setUsingDemoData(false);
    
    try {
      const params = {
        timeRange: timeRange,
      };
      if (selectedEmployee) {
        params.employeeId = selectedEmployee;
      }

      console.log('📊 Fetching real KPI data from API...');
      const response = await axios.get(`${API_URL}/employees/kpis`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      let data = [];
      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.kpis && Array.isArray(response.data.kpis)) {
          data = response.data.kpis;
        }
      }

      // ✅ Check if we got real data
      if (data.length > 0 && !data[0]?._id?.startsWith?.('mock-')) {
        console.log('✅ Using REAL KPI data from database:', data.length, 'records');
        setKpis(data);
        calculateStats(data);
        setUsingDemoData(false);
      } else if (data.length > 0) {
        console.log('📊 Backend returned mock data, treating as no data');
        setKpis([]);
        calculateStats([]);
        setUsingDemoData(true);
        toast.info('No real data available. Showing demo data for preview.');
        const mockData = generateMockData();
        setKpis(mockData);
        calculateStats(mockData);
      } else {
        console.log('📊 No KPI data from API');
        setKpis([]);
        calculateStats([]);
        setUsingDemoData(true);
        toast.info('No real data available. Showing demo data for preview.');
        const mockData = generateMockData();
        setKpis(mockData);
        calculateStats(mockData);
      }
    } catch (err) {
      console.error('❌ Error fetching KPIs:', err);
      setUsingDemoData(true);
      toast.error('Could not fetch real data. Showing demo data.');
      const mockData = generateMockData();
      setKpis(mockData);
      calculateStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = {};
      if (selectedEmployee) {
        params.employeeId = selectedEmployee;
      }

      console.log('📊 Fetching real summary data from API...');
      const response = await axios.get(`${API_URL}/employees/kpi/summary`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        const summaryData = response.data.data || response.data;
        if (summaryData.totalTasks > 0 || summaryData.averageProductivity > 0) {
          console.log('✅ Using REAL summary data');
          setSummary(summaryData);
        } else {
          console.log('📊 Using demo summary data');
          setSummary(generateMockSummary());
        }
      } else {
        setSummary(generateMockSummary());
      }
    } catch (err) {
      console.error('❌ Error fetching summary:', err);
      setSummary(generateMockSummary());
    }
  };

  const generateMockSummary = () => {
    return {
      totalTasks: 35 + Math.floor(Math.random() * 30),
      completedTasks: 25 + Math.floor(Math.random() * 20),
      overdueTasks: 2 + Math.floor(Math.random() * 5),
      averageProductivity: 65 + Math.floor(Math.random() * 25),
      averageQuality: 70 + Math.floor(Math.random() * 20),
      averageEfficiency: 60 + Math.floor(Math.random() * 25)
    };
  };

  const generateMockData = () => {
    const data = [];
    const weeks = timeRange === 'week' ? 4 : timeRange === 'month' ? 8 : 12;
    const startDate = new Date();
    
    const emp = employees.find(e => e._id === selectedEmployee);
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Employee';
    
    for (let i = weeks; i >= 0; i--) {
      const date = new Date(startDate);
      date.setDate(date.getDate() - (i * 7));
      
      const productivity = 55 + Math.random() * 40;
      const completion = 50 + Math.random() * 45;
      const utilization = 45 + Math.random() * 45;
      const qaPass = 55 + Math.random() * 40;
      
      data.push({
        _id: `mock-${i}`,
        weekStart: date,
        employeeId: {
          firstName: empName.split(' ')[0] || 'Employee',
          lastName: empName.split(' ')[1] || ''
        },
        productivityScore: Math.round(productivity),
        taskCompletionRate: Math.round(completion),
        capacityUtilization: Math.round(utilization),
        qaPassRate: Math.round(qaPass),
        tasksCompleted: Math.floor(2 + Math.random() * 8),
        tasksAssigned: Math.floor(4 + Math.random() * 10),
        avgTaskTime: Math.round((1 + Math.random() * 4) * 10) / 10,
        qualityScore: Math.round(60 + Math.random() * 35),
        overdueTasks: Math.floor(Math.random() * 3),
        tasksOverdue: Math.floor(Math.random() * 3)
      });
    }
    return data;
  };

  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setStats({
        avgProductivity: 0,
        avgTaskCompletion: 0,
        avgUtilization: 0,
        avgQaPass: 0,
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
      });
      return;
    }

    const avgProductivity = data.reduce((sum, k) => sum + (k.productivityScore || 0), 0) / data.length;
    const avgTaskCompletion = data.reduce((sum, k) => sum + (k.taskCompletionRate || 0), 0) / data.length;
    const avgUtilization = data.reduce((sum, k) => sum + (k.capacityUtilization || 0), 0) / data.length;
    const avgQaPass = data.reduce((sum, k) => sum + (k.qaPassRate || 0), 0) / data.length;
    const totalTasks = data.reduce((sum, k) => sum + (k.tasksAssigned || 0), 0);
    const completedTasks = data.reduce((sum, k) => sum + (k.tasksCompleted || 0), 0);
    const overdueTasks = data.reduce((sum, k) => sum + (k.tasksOverdue || k.overdueTasks || 0), 0);

    setStats({
      avgProductivity: Math.round(avgProductivity),
      avgTaskCompletion: Math.round(avgTaskCompletion),
      avgUtilization: Math.round(avgUtilization),
      avgQaPass: Math.round(avgQaPass),
      totalTasks,
      completedTasks,
      overdueTasks,
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeekNumber = (date) => {
    if (!date) return 'Week';
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return `W${1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)}`;
  };

  const chartData = kpis.map(kpi => ({
    week: getWeekNumber(kpi.weekStart),
    date: formatDate(kpi.weekStart),
    productivity: Math.round(kpi.productivityScore || 0),
    completion: Math.round(kpi.taskCompletionRate || 0),
    utilization: Math.round(kpi.capacityUtilization || 0),
    qa: Math.round(kpi.qaPassRate || 0),
    quality: Math.round(kpi.qualityScore || 0),
  }));

  const pieData = [
    { name: 'Productivity', value: stats.avgProductivity || 0 },
    { name: 'Task Completion', value: stats.avgTaskCompletion || 0 },
    { name: 'Utilization', value: stats.avgUtilization || 0 },
    { name: 'QA Pass Rate', value: stats.avgQaPass || 0 },
  ];

  const radarData = [
    { subject: 'Productivity', value: stats.avgProductivity || 0, fullMark: 100 },
    { subject: 'Task Completion', value: stats.avgTaskCompletion || 0, fullMark: 100 },
    { subject: 'Utilization', value: stats.avgUtilization || 0, fullMark: 100 },
    { subject: 'QA Pass Rate', value: stats.avgQaPass || 0, fullMark: 100 },
    { subject: 'Quality', value: stats.avgQaPass || 0, fullMark: 100 },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return '#22C55E';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '📈';
    return '📉';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading performance data...</p>
      </div>
    );
  }

  const selectedEmployeeName = employees.find(e => e._id === selectedEmployee);
  const employeeName = selectedEmployeeName 
    ? `${selectedEmployeeName.firstName} ${selectedEmployeeName.lastName}`
    : 'All Employees';

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Performance Dashboard</h1>
          <p style={styles.subtitle}>Track team performance and KPIs</p>
        </div>
        <div style={styles.headerActions}>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            style={styles.filterSelect}
          >
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
          <div style={styles.viewToggle}>
            <button
              onClick={() => setViewMode('chart')}
              style={{
                ...styles.viewButton,
                ...(viewMode === 'chart' ? styles.viewButtonActive : styles.viewButtonInactive)
              }}
              title="Chart View"
            >
              <BarChart3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('radar')}
              style={{
                ...styles.viewButton,
                ...(viewMode === 'radar' ? styles.viewButtonActive : styles.viewButtonInactive)
              }}
              title="Radar View"
            >
              <Activity size={16} />
            </button>
          </div>
          <button style={styles.refreshButton} onClick={() => { fetchKPIs(); fetchSummary(); }}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Demo Data Indicator */}
      {usingDemoData && (
        <div style={styles.demoBanner}>
          <span>📊</span>
          <span>Showing demo data. Connect your backend to see real performance data.</span>
        </div>
      )}

      {/* Employee Summary */}
      {summary && (
        <div style={styles.summaryCard}>
          <div style={styles.summaryHeader}>
            <div style={styles.summaryUser}>
              <div style={styles.summaryAvatar}>
                {employeeName.charAt(0)}
              </div>
              <div>
                <h3 style={styles.summaryName}>{employeeName}</h3>
                <p style={styles.summaryRole}>
                  Performance Overview
                  {usingDemoData && <span style={styles.demoTag}> (Demo)</span>}
                </p>
              </div>
            </div>
            <div style={styles.summaryStats}>
              <div style={styles.summaryStat}>
                <span style={styles.summaryStatLabel}>Total Tasks</span>
                <span style={styles.summaryStatValue}>{summary.totalTasks || 0}</span>
              </div>
              <div style={styles.summaryStat}>
                <span style={styles.summaryStatLabel}>Completed</span>
                <span style={{...styles.summaryStatValue, color: '#22C55E'}}>
                  {summary.completedTasks || 0}
                </span>
              </div>
              <div style={styles.summaryStat}>
                <span style={styles.summaryStatLabel}>Overdue</span>
                <span style={{...styles.summaryStatValue, color: '#EF4444'}}>
                  {summary.overdueTasks || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTop: '4px solid #3B82F6'}}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Productivity</p>
              <p style={styles.statValue}>
                {stats.avgProductivity}%
                <span style={styles.statEmoji}>{getScoreEmoji(stats.avgProductivity)}</span>
              </p>
            </div>
            <Award style={{...styles.statIcon, color: '#3B82F6'}} />
          </div>
          <div style={styles.statProgress}>
            <div style={{...styles.statProgressFill, width: `${stats.avgProductivity}%`, backgroundColor: getScoreColor(stats.avgProductivity)}} />
          </div>
        </div>

        <div style={{...styles.statCard, borderTop: '4px solid #22C55E'}}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Task Completion</p>
              <p style={styles.statValue}>
                {stats.avgTaskCompletion}%
                <span style={styles.statEmoji}>{getScoreEmoji(stats.avgTaskCompletion)}</span>
              </p>
            </div>
            <CheckCircle style={{...styles.statIcon, color: '#22C55E'}} />
          </div>
          <div style={styles.statProgress}>
            <div style={{...styles.statProgressFill, width: `${stats.avgTaskCompletion}%`, backgroundColor: getScoreColor(stats.avgTaskCompletion)}} />
          </div>
        </div>

        <div style={{...styles.statCard, borderTop: '4px solid #F59E0B'}}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Utilization</p>
              <p style={styles.statValue}>
                {stats.avgUtilization}%
                <span style={styles.statEmoji}>{getScoreEmoji(stats.avgUtilization)}</span>
              </p>
            </div>
            <Clock style={{...styles.statIcon, color: '#F59E0B'}} />
          </div>
          <div style={styles.statProgress}>
            <div style={{...styles.statProgressFill, width: `${stats.avgUtilization}%`, backgroundColor: getScoreColor(stats.avgUtilization)}} />
          </div>
        </div>

        <div style={{...styles.statCard, borderTop: '4px solid #8B5CF6'}}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>QA Pass Rate</p>
              <p style={styles.statValue}>
                {stats.avgQaPass}%
                <span style={styles.statEmoji}>{getScoreEmoji(stats.avgQaPass)}</span>
              </p>
            </div>
            <Target style={{...styles.statIcon, color: '#8B5CF6'}} />
          </div>
          <div style={styles.statProgress}>
            <div style={{...styles.statProgressFill, width: `${stats.avgQaPass}%`, backgroundColor: getScoreColor(stats.avgQaPass)}} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={styles.chartsGrid}>
        {/* Performance Trend Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Performance Trend</h3>
            <span style={styles.chartBadge}>
              {chartData.length} Weeks {usingDemoData && '📊'}
            </span>
          </div>
          <div style={styles.chartContent}>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === 'chart' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                      formatter={(value) => [`${value}%`, '']}
                      labelFormatter={(label, items) => {
                        const item = items?.[0]?.payload;
                        return item?.date || label;
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="productivity" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="completion" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="utilization" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="qa" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                ) : (
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Performance" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                      formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <Legend />
                  </RadarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* KPI Breakdown Pie Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>KPI Breakdown</h3>
            <span style={styles.chartBadge}>
              Overall {usingDemoData && '📊'}
            </span>
          </div>
          <div style={styles.chartContent}>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                    formatter={(value) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* KPI History Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>KPI History</h3>
          <span style={styles.tableBadge}>
            {kpis.length} Records {usingDemoData && '📊'}
          </span>
        </div>
        <div style={styles.tableContent}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.tableHeadCell}>Week</th>
                  <th style={styles.tableHeadCell}>Employee</th>
                  <th style={styles.tableHeadCell}>Productivity</th>
                  <th style={styles.tableHeadCell}>Completion</th>
                  <th style={styles.tableHeadCell}>Utilization</th>
                  <th style={styles.tableHeadCell}>QA Pass</th>
                  <th style={styles.tableHeadCell}>Status</th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((kpi, index) => {
                  const productivity = Math.round(kpi.productivityScore || 0);
                  const completion = Math.round(kpi.taskCompletionRate || 0);
                  const utilization = Math.round(kpi.capacityUtilization || 0);
                  const qaPass = Math.round(kpi.qaPassRate || 0);
                  const avg = Math.round((productivity + completion + utilization + qaPass) / 4);
                  
                  return (
                    <tr key={kpi._id || index} style={styles.tableRow}>
                      <td style={styles.tableCell}>{getWeekNumber(kpi.weekStart)}</td>
                      <td style={styles.tableCell}>
                        {kpi.employeeId?.firstName || 'Employee'} {kpi.employeeId?.lastName || ''}
                      </td>
                      <td style={{...styles.tableCell, ...styles.cellProductivity}}>
                        {productivity}%
                      </td>
                      <td style={{...styles.tableCell, ...styles.cellCompletion}}>
                        {completion}%
                      </td>
                      <td style={{...styles.tableCell, ...styles.cellUtilization}}>
                        {utilization}%
                      </td>
                      <td style={{...styles.tableCell, ...styles.cellQaPass}}>
                        {qaPass}%
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: avg >= 80 ? '#D1FAE5' : avg >= 60 ? '#FEF3C7' : '#FEE2E2',
                          color: avg >= 80 ? '#065F46' : avg >= 60 ? '#92400E' : '#991B1B',
                        }}>
                          {avg >= 80 ? '🌟 Excellent' : avg >= 60 ? '📈 Good' : '📉 Needs Improvement'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {kpis.length === 0 && (
                  <tr>
                    <td colSpan="7" style={styles.emptyState}>
                      <div style={styles.emptyContent}>
                        <Activity size={48} style={styles.emptyIcon} />
                        <p style={styles.emptyText}>No KPI data available</p>
                        <p style={styles.emptySubtext}>Performance data will appear here once available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles object - COMPLETE
const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64vh',
    gap: '16px',
  },
  loadingText: {
    color: '#64748B',
    fontSize: '14px',
    fontWeight: '500',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
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
    fontSize: '28px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748B',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterSelect: {
    padding: '8px 14px',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    fontSize: '14px',
    minWidth: '150px',
    outline: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  viewToggle: {
    display: 'flex',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  viewButton: {
    padding: '8px 12px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  viewButtonActive: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
  },
  viewButtonInactive: {
    backgroundColor: '#FFFFFF',
    color: '#94A3B8',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    color: '#64748B',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  demoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    backgroundColor: '#FEF3C7',
    borderRadius: '10px',
    border: '1px solid #FDE68A',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#92400E',
  },
  demoTag: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#F59E0B',
    marginLeft: '4px',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    padding: '16px 20px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  summaryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  summaryUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  summaryAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    flexShrink: 0,
  },
  summaryName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0F172A',
    margin: 0,
  },
  summaryRole: {
    fontSize: '14px',
    color: '#64748B',
    margin: 0,
  },
  summaryStats: {
    display: 'flex',
    gap: '24px',
  },
  summaryStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  summaryStatLabel: {
    fontSize: '12px',
    color: '#94A3B8',
    fontWeight: '500',
  },
  summaryStatValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0F172A',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px 20px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s ease',
  },
  statContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
    fontWeight: '500',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0F172A',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  statEmoji: {
    fontSize: '18px',
    marginLeft: '8px',
  },
  statIcon: {
    width: '32px',
    height: '32px',
    opacity: 0.8,
  },
  statProgress: {
    width: '100%',
    height: '4px',
    backgroundColor: '#E2E8F0',
    borderRadius: '2px',
    marginTop: '12px',
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.6s ease',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '24px',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0F172A',
    margin: 0,
  },
  chartBadge: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    padding: '2px 10px',
    borderRadius: '12px',
  },
  chartContent: {
    padding: '16px',
  },
  chartContainer: {
    height: '320px',
    width: '100%',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  tableTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0F172A',
    margin: 0,
  },
  tableBadge: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    padding: '2px 10px',
    borderRadius: '12px',
  },
  tableContent: {
    padding: '0',
    overflowX: 'auto',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeadRow: {
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  tableHeadCell: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: '1px solid #F1F5F9',
    transition: 'background-color 0.2s ease',
  },
  tableCell: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#0F172A',
  },
  cellProductivity: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  cellCompletion: {
    color: '#22C55E',
    fontWeight: '600',
  },
  cellUtilization: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  cellQaPass: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 16px',
  },
  emptyContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  emptyIcon: {
    color: '#94A3B8',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#0F172A',
    margin: 0,
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#94A3B8',
    margin: 0,
  },
};

// Add keyframe animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .filter-select:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }

  .filter-select:hover {
    border-color: #94A3B8 !important;
  }

  .refresh-button:hover {
    background-color: #F1F5F9 !important;
  }

  .view-button-inactive:hover {
    background-color: #F1F5F9 !important;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  }

  .table-row:hover {
    background-color: #F8FAFC !important;
  }

  .stat-progress {
    background-color: #E2E8F0;
  }

  .demo-banner {
    animation: fadeIn 0.5s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 1024px) {
    .charts-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 16px !important;
    }

    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .header-actions {
      flex-direction: column !important;
    }

    .filter-select {
      width: 100% !important;
    }

    .refresh-button {
      width: 100% !important;
      justify-content: center !important;
    }

    .view-toggle {
      width: 100% !important;
    }

    .view-button {
      flex: 1 !important;
      justify-content: center !important;
    }

    .stats-grid {
      grid-template-columns: 1fr 1fr !important;
    }

    .summary-header {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .summary-stats {
      justify-content: space-around !important;
    }

    .summary-user {
      justify-content: center !important;
    }

    .table-head-cell,
    .table-cell {
      padding: 8px 12px !important;
      font-size: 12px !important;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 12px !important;
    }

    .stats-grid {
      grid-template-columns: 1fr !important;
    }

    .stat-value {
      font-size: 22px !important;
    }

    .title {
      font-size: 22px !important;
    }

    .summary-stats {
      flex-direction: column !important;
      gap: 8px !important;
    }

    .summary-stat {
      flex-direction: row !important;
      justify-content: space-between !important;
      width: 100% !important;
    }

    .summary-stat-value {
      font-size: 16px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Performance;