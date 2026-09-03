// pages/employees/Performance.jsx
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
  Zap, Activity, Briefcase, UserCheck, BarChart3, PieChart as PieChartIcon,
  Layers
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const COLORS = ['#013E37', '#FFEFB3', '#0A5C54', '#F5D98A', '#1A7A6E', '#E8D4A0', '#2A9A8A'];

const Performance = () => {
  const { token, user } = useAuth();
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const [employees, setEmployees] = useState([]);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [viewMode, setViewMode] = useState('chart');
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

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

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

      // Check if we got real data
      if (data.length > 0 && !data[0]?._id?.startsWith?.('mock-')) {
        setKpis(data);
        calculateStats(data);
        setUsingDemoData(false);
      } else if (data.length > 0) {
        setKpis([]);
        calculateStats([]);
        setUsingDemoData(true);
        toast.info('No real data available. Showing demo data for preview.');
        const mockData = generateMockData();
        setKpis(mockData);
        calculateStats(mockData);
      } else {
        setKpis([]);
        calculateStats([]);
        setUsingDemoData(true);
        toast.info('No real data available. Showing demo data for preview.');
        const mockData = generateMockData();
        setKpis(mockData);
        calculateStats(mockData);
      }
    } catch (err) {
      console.error('Error fetching KPIs:', err);
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

      const response = await axios.get(`${API_URL}/employees/kpi/summary`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        const summaryData = response.data.data || response.data;
        if (summaryData.totalTasks > 0 || summaryData.averageProductivity > 0) {
          setSummary(summaryData);
        } else {
          setSummary(generateMockSummary());
        }
      } else {
        setSummary(generateMockSummary());
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
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
    if (score >= 80) return '#013E37';
    if (score >= 60) return '#FFEFB3';
    return '#EF4444';
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '📈';
    return '📉';
  };

  if (loading) {
    return (
      <div className="performance-loading">
        <div className="performance-loading-spinner"></div>
        <p className="performance-loading-text">Loading performance data...</p>
      </div>
    );
  }

  const selectedEmployeeName = employees.find(e => e._id === selectedEmployee);
  const employeeName = selectedEmployeeName 
    ? `${selectedEmployeeName.firstName} ${selectedEmployeeName.lastName}`
    : 'All Employees';

  return (
    <>
      <div className="performance-container">
        {/* Header Section */}
        <div className="performance-header">
          <div className="performance-header-left">
            <h1 className="performance-title">
              <Layers className="performance-title-icon" />
              Performance Dashboard
            </h1>
            <p className="performance-subtitle">Track team performance and KPIs in real-time</p>
          </div>
          <div className="performance-header-right">
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="performance-filter-select"
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
              className="performance-filter-select"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>
            <div className="performance-view-toggle">
              <button
                onClick={() => setViewMode('chart')}
                className={`performance-view-btn ${viewMode === 'chart' ? 'performance-view-active' : ''}`}
                title="Chart View"
              >
                <BarChart3 className="performance-view-icon" />
              </button>
              <button
                onClick={() => setViewMode('radar')}
                className={`performance-view-btn ${viewMode === 'radar' ? 'performance-view-active' : ''}`}
                title="Radar View"
              >
                <Activity className="performance-view-icon" />
              </button>
            </div>
            <button className="performance-refresh-btn" onClick={() => { fetchKPIs(); fetchSummary(); }}>
              <RefreshCw className="performance-refresh-icon" />
            </button>
          </div>
        </div>

        {/* Demo Data Indicator */}
        {usingDemoData && (
          <div className="performance-demo-banner">
            <span>📊</span>
            <span>Showing demo data. Connect your backend to see real performance data.</span>
          </div>
        )}

        {/* Employee Summary */}
        {summary && (
          <div className="performance-summary-card">
            <div className="performance-summary-header">
              <div className="performance-summary-user">
                <div className="performance-summary-avatar" style={{ backgroundColor: '#013E37' }}>
                  {employeeName.charAt(0)}
                </div>
                <div>
                  <h3 className="performance-summary-name">{employeeName}</h3>
                  <p className="performance-summary-role">
                    Performance Overview
                    {usingDemoData && <span className="performance-demo-tag"> (Demo)</span>}
                  </p>
                </div>
              </div>
              <div className="performance-summary-stats">
                <div className="performance-summary-stat">
                  <span className="performance-summary-stat-label">Total Tasks</span>
                  <span className="performance-summary-stat-value">{summary.totalTasks || 0}</span>
                </div>
                <div className="performance-summary-stat">
                  <span className="performance-summary-stat-label">Completed</span>
                  <span className="performance-summary-stat-value" style={{ color: '#013E37' }}>
                    {summary.completedTasks || 0}
                  </span>
                </div>
                <div className="performance-summary-stat">
                  <span className="performance-summary-stat-label">Overdue</span>
                  <span className="performance-summary-stat-value" style={{ color: '#EF4444' }}>
                    {summary.overdueTasks || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="performance-stats-grid">
          <div className="performance-stat-card" style={{ borderTop: '4px solid #013E37' }}>
            <div className="performance-stat-content">
              <div>
                <p className="performance-stat-label">Productivity</p>
                <p className="performance-stat-value">
                  {stats.avgProductivity}%
                  <span className="performance-stat-emoji">{getScoreEmoji(stats.avgProductivity)}</span>
                </p>
              </div>
              <Award className="performance-stat-icon" style={{ color: '#013E37' }} />
            </div>
            <div className="performance-stat-progress">
              <div className="performance-stat-progress-fill" style={{ 
                width: `${stats.avgProductivity}%`, 
                backgroundColor: getScoreColor(stats.avgProductivity)
              }} />
            </div>
          </div>

          <div className="performance-stat-card" style={{ borderTop: '4px solid #0A5C54' }}>
            <div className="performance-stat-content">
              <div>
                <p className="performance-stat-label">Task Completion</p>
                <p className="performance-stat-value">
                  {stats.avgTaskCompletion}%
                  <span className="performance-stat-emoji">{getScoreEmoji(stats.avgTaskCompletion)}</span>
                </p>
              </div>
              <CheckCircle className="performance-stat-icon" style={{ color: '#0A5C54' }} />
            </div>
            <div className="performance-stat-progress">
              <div className="performance-stat-progress-fill" style={{ 
                width: `${stats.avgTaskCompletion}%`, 
                backgroundColor: getScoreColor(stats.avgTaskCompletion)
              }} />
            </div>
          </div>

          <div className="performance-stat-card" style={{ borderTop: '4px solid #FFEFB3' }}>
            <div className="performance-stat-content">
              <div>
                <p className="performance-stat-label">Utilization</p>
                <p className="performance-stat-value">
                  {stats.avgUtilization}%
                  <span className="performance-stat-emoji">{getScoreEmoji(stats.avgUtilization)}</span>
                </p>
              </div>
              <Clock className="performance-stat-icon" style={{ color: '#013E37' }} />
            </div>
            <div className="performance-stat-progress">
              <div className="performance-stat-progress-fill" style={{ 
                width: `${stats.avgUtilization}%`, 
                backgroundColor: getScoreColor(stats.avgUtilization)
              }} />
            </div>
          </div>

          <div className="performance-stat-card" style={{ borderTop: '4px solid #1A7A6E' }}>
            <div className="performance-stat-content">
              <div>
                <p className="performance-stat-label">QA Pass Rate</p>
                <p className="performance-stat-value">
                  {stats.avgQaPass}%
                  <span className="performance-stat-emoji">{getScoreEmoji(stats.avgQaPass)}</span>
                </p>
              </div>
              <Target className="performance-stat-icon" style={{ color: '#1A7A6E' }} />
            </div>
            <div className="performance-stat-progress">
              <div className="performance-stat-progress-fill" style={{ 
                width: `${stats.avgQaPass}%`, 
                backgroundColor: getScoreColor(stats.avgQaPass)
              }} />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="performance-charts-grid">
          {/* Performance Trend Chart */}
          <div className="performance-chart-card">
            <div className="performance-chart-header">
              <h3 className="performance-chart-title">Performance Trend</h3>
              <span className="performance-chart-badge">
                {chartData.length} Weeks {usingDemoData && '📊'}
              </span>
            </div>
            <div className="performance-chart-content">
              <div className="performance-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  {viewMode === 'chart' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#013E37' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#013E37' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          borderRadius: '8px', 
                          border: '1px solid #FFEFB3',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value) => [`${value}%`, '']}
                        labelFormatter={(label, items) => {
                          const item = items?.[0]?.payload;
                          return item?.date || label;
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="productivity" stroke="#013E37" strokeWidth={2} dot={{ r: 4, fill: '#013E37' }} />
                      <Line type="monotone" dataKey="completion" stroke="#0A5C54" strokeWidth={2} dot={{ r: 4, fill: '#0A5C54' }} />
                      <Line type="monotone" dataKey="utilization" stroke="#FFEFB3" strokeWidth={2} dot={{ r: 4, fill: '#FFEFB3' }} />
                      <Line type="monotone" dataKey="qa" stroke="#1A7A6E" strokeWidth={2} dot={{ r: 4, fill: '#1A7A6E' }} />
                    </LineChart>
                  ) : (
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#013E37' }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#013E37' }} />
                      <Radar name="Performance" dataKey="value" stroke="#013E37" fill="#013E37" fillOpacity={0.2} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          borderRadius: '8px', 
                          border: '1px solid #FFEFB3',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
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
          <div className="performance-chart-card">
            <div className="performance-chart-header">
              <h3 className="performance-chart-title">KPI Breakdown</h3>
              <span className="performance-chart-badge">
                Overall {usingDemoData && '📊'}
              </span>
            </div>
            <div className="performance-chart-content">
              <div className="performance-chart-container">
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
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        borderRadius: '8px', 
                        border: '1px solid #FFEFB3',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => [`${value}%`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* KPI History Table */}
        <div className="performance-table-card">
          <div className="performance-table-header">
            <h3 className="performance-table-title">KPI History</h3>
            <span className="performance-table-badge">
              {kpis.length} Records {usingDemoData && '📊'}
            </span>
          </div>
          <div className="performance-table-content">
            <div className="performance-table-wrapper">
              <table className="performance-table">
                <thead>
                  <tr className="performance-table-head-row">
                    <th className="performance-table-head-cell">Week</th>
                    <th className="performance-table-head-cell">Employee</th>
                    <th className="performance-table-head-cell">Productivity</th>
                    <th className="performance-table-head-cell">Completion</th>
                    <th className="performance-table-head-cell">Utilization</th>
                    <th className="performance-table-head-cell">QA Pass</th>
                    <th className="performance-table-head-cell">Status</th>
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
                      <tr key={kpi._id || index} className="performance-table-row" style={{ animationDelay: `${index * 0.05}s` }}>
                        <td className="performance-table-cell">{getWeekNumber(kpi.weekStart)}</td>
                        <td className="performance-table-cell">
                          {kpi.employeeId?.firstName || 'Employee'} {kpi.employeeId?.lastName || ''}
                        </td>
                        <td className="performance-table-cell performance-cell-productivity">
                          {productivity}%
                        </td>
                        <td className="performance-table-cell performance-cell-completion">
                          {completion}%
                        </td>
                        <td className="performance-table-cell performance-cell-utilization">
                          {utilization}%
                        </td>
                        <td className="performance-table-cell performance-cell-qa">
                          {qaPass}%
                        </td>
                        <td className="performance-table-cell">
                          <span className="performance-status-badge" style={{
                            backgroundColor: avg >= 80 ? '#013E37' : avg >= 60 ? '#FFEFB3' : '#FEE2E2',
                            color: avg >= 80 ? '#FFEFB3' : avg >= 60 ? '#013E37' : '#991B1B',
                          }}>
                            {avg >= 80 ? '🌟 Excellent' : avg >= 60 ? '📈 Good' : '📉 Needs Improvement'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {kpis.length === 0 && (
                    <tr>
                      <td colSpan="7" className="performance-empty-state">
                        <div className="performance-empty-content">
                          <Activity className="performance-empty-icon" size={48} />
                          <p className="performance-empty-text">No KPI data available</p>
                          <p className="performance-empty-subtext">Performance data will appear here once available</p>
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

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .performance-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .performance-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .performance-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .performance-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           HEADER
           ============================================ */
        .performance-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
          animation: fadeInDown 0.6s ease;
        }
        .performance-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .performance-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .performance-title-icon {
          width: 28px;
          height: 28px;
          color: #013E37;
          animation: pulse 2s ease-in-out infinite;
        }
        .performance-subtitle {
          color: #013E37;
          opacity: 0.6;
          font-size: 15px;
          margin: 0;
        }
        .performance-header-right {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .performance-filter-select {
          padding: 8px 14px;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          background: #ffffff;
          color: #013E37;
          font-size: 14px;
          min-width: 150px;
          outline: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .performance-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .performance-filter-select:hover {
          border-color: #013E37;
        }
        .performance-view-toggle {
          display: flex;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #FFEFB3;
          background: #ffffff;
        }
        .performance-view-btn {
          padding: 8px 12px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #013E37;
          opacity: 0.5;
        }
        .performance-view-btn:hover {
          opacity: 0.8;
        }
        .performance-view-active {
          background: #013E37;
          color: #FFFFFF;
          opacity: 1;
        }
        .performance-view-active:hover {
          opacity: 1;
        }
        .performance-view-icon {
          width: 16px;
          height: 16px;
        }
        .performance-refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .performance-refresh-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .performance-refresh-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        .performance-refresh-btn:hover .performance-refresh-icon {
          transform: rotate(180deg);
        }

        /* ============================================
           DEMO BANNER
           ============================================ */
        .performance-demo-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: #FFEFB3;
          border-radius: 10px;
          border: 1px solid #013E37;
          margin-bottom: 20px;
          font-size: 14px;
          color: #013E37;
          animation: fadeIn 0.5s ease;
        }
        .performance-demo-tag {
          font-size: 12px;
          font-weight: 500;
          color: #013E37;
          opacity: 0.6;
          margin-left: 4px;
        }

        /* ============================================
           SUMMARY CARD
           ============================================ */
        .performance-summary-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          padding: 16px 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }
        .performance-summary-card:hover {
          border-color: #013E37;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
        }
        .performance-summary-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .performance-summary-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .performance-summary-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          color: #FFEFB3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .performance-summary-card:hover .performance-summary-avatar {
          transform: scale(1.05);
        }
        .performance-summary-name {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .performance-summary-role {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }
        .performance-summary-stats {
          display: flex;
          gap: 24px;
        }
        .performance-summary-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .performance-summary-stat-label {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
          font-weight: 500;
        }
        .performance-summary-stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
        }

        /* ============================================
           STATS GRID
           ============================================ */
        .performance-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .performance-stat-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid #FFEFB3;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }
        .performance-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(1, 62, 55, 0.1);
          border-color: #013E37;
        }
        .performance-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .performance-stat-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
          font-weight: 500;
        }
        .performance-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin-top: 4px;
          margin: 4px 0 0 0;
        }
        .performance-stat-emoji {
          font-size: 18px;
          margin-left: 8px;
        }
        .performance-stat-icon {
          width: 32px;
          height: 32px;
          opacity: 0.8;
        }
        .performance-stat-progress {
          width: 100%;
          height: 4px;
          background: #FFEFB3;
          border-radius: 2px;
          margin-top: 12px;
          overflow: hidden;
        }
        .performance-stat-progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 1s ease;
        }

        /* ============================================
           CHARTS
           ============================================ */
        .performance-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .performance-chart-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }
        .performance-chart-card:hover {
          border-color: #013E37;
          box-shadow: 0 4px 20px rgba(1, 62, 55, 0.08);
        }
        .performance-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFF9E6;
        }
        .performance-chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .performance-chart-badge {
          font-size: 12px;
          font-weight: 500;
          color: #013E37;
          background: #FFEFB3;
          padding: 2px 10px;
          border-radius: 12px;
        }
        .performance-chart-content {
          padding: 16px;
        }
        .performance-chart-container {
          height: 320px;
          width: 100%;
        }

        /* ============================================
           TABLE
           ============================================ */
        .performance-table-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }
        .performance-table-card:hover {
          border-color: #013E37;
          box-shadow: 0 4px 20px rgba(1, 62, 55, 0.08);
        }
        .performance-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFF9E6;
        }
        .performance-table-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .performance-table-badge {
          font-size: 12px;
          font-weight: 500;
          color: #013E37;
          background: #FFEFB3;
          padding: 2px 10px;
          border-radius: 12px;
        }
        .performance-table-content {
          padding: 0;
          overflow-x: auto;
        }
        .performance-table-wrapper {
          overflow-x: auto;
        }
        .performance-table {
          width: 100%;
          border-collapse: collapse;
        }
        .performance-table-head-row {
          background: #FFF9E6;
          border-bottom: 2px solid #013E37;
        }
        .performance-table-head-cell {
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .performance-table-row {
          border-bottom: 1px solid #FFEFB3;
          transition: all 0.2s ease;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .performance-table-row:hover {
          background: #FFF9E6;
        }
        .performance-table-row:nth-child(1) { animation-delay: 0.05s; }
        .performance-table-row:nth-child(2) { animation-delay: 0.1s; }
        .performance-table-row:nth-child(3) { animation-delay: 0.15s; }
        .performance-table-row:nth-child(4) { animation-delay: 0.2s; }
        .performance-table-row:nth-child(5) { animation-delay: 0.25s; }
        .performance-table-cell {
          padding: 12px 16px;
          font-size: 14px;
          color: #013E37;
        }
        .performance-cell-productivity {
          color: #013E37;
          font-weight: 600;
        }
        .performance-cell-completion {
          color: #0A5C54;
          font-weight: 600;
        }
        .performance-cell-utilization {
          color: #1A7A6E;
          font-weight: 600;
        }
        .performance-cell-qa {
          color: #2A9A8A;
          font-weight: 600;
        }
        .performance-status-badge {
          display: inline-flex;
          padding: 3px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .performance-status-badge:hover {
          transform: scale(1.05);
        }
        .performance-empty-state {
          text-align: center;
          padding: 40px 16px;
        }
        .performance-empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .performance-empty-icon {
          color: #FFEFB3;
        }
        .performance-empty-text {
          font-size: 16px;
          font-weight: 500;
          color: #013E37;
          margin: 0;
        }
        .performance-empty-subtext {
          font-size: 14px;
          color: #013E37;
          opacity: 0.5;
          margin: 0;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.95);
          }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .performance-charts-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .performance-header {
            flex-direction: column;
            align-items: stretch;
          }
          .performance-header-right {
            flex-direction: column;
            width: 100%;
          }
          .performance-filter-select {
            width: 100%;
          }
          .performance-view-toggle {
            width: 100%;
          }
          .performance-view-btn {
            flex: 1;
            justify-content: center;
          }
          .performance-refresh-btn {
            width: 100%;
            justify-content: center;
          }
          .performance-stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          .performance-summary-header {
            flex-direction: column;
            align-items: stretch;
          }
          .performance-summary-user {
            justify-content: center;
          }
          .performance-summary-stats {
            justify-content: space-around;
          }
          .performance-table-head-cell,
          .performance-table-cell {
            padding: 8px 12px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .performance-stats-grid {
            grid-template-columns: 1fr;
          }
          .performance-stat-value {
            font-size: 22px;
          }
          .performance-title {
            font-size: 24px;
          }
          .performance-summary-stats {
            flex-direction: column;
            gap: 8px;
          }
          .performance-summary-stat {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
          }
          .performance-summary-stat-value {
            font-size: 16px;
          }
          .performance-chart-container {
            height: 250px;
          }
        }
      `}</style>
    </>
  );
};

export default Performance;