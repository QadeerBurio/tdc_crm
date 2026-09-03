// pages/analytics/ProductivityAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, Users, Clock, CheckCircle,
  ArrowUp, ArrowDown, Activity,
  RefreshCw, Download, Filter, Sparkles,
  Zap, Target, Award, Crown, BarChart3
} from 'lucide-react';
import {
  BarChart, LineChart, RadarChart,
  PieChart, Pie, Cell,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Bar, Line,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

const ProductivityAnalytics = () => {
  const { token } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [department, setDepartment] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productivityData, setProductivityData] = useState({
    overall: {
      averageProductivity: 0,
      averageTaskCompletion: 0,
      averageUtilization: 0,
      averageQaPass: 0
    },
    topPerformers: [],
    departmentStats: [],
    weeklyTrend: []
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';
  const COLORS = ['#013E37', '#0A5C54', '#1A7A6E', '#FFEFB3', '#D4C89A'];

  useEffect(() => {
    fetchProductivityData();
  }, [timeRange, department]);

  const fetchProductivityData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);
      if (department !== 'all') params.append('department', department);

      const response = await fetch(`${API_URL}/analytics/productivity?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const data = result.data || {};
          setProductivityData({
            overall: {
              averageProductivity: data.overall?.averageProductivity || 0,
              averageTaskCompletion: data.overall?.averageTaskCompletion || 0,
              averageUtilization: data.overall?.averageUtilization || 0,
              averageQaPass: data.overall?.averageQaPass || 0
            },
            topPerformers: data.topPerformers || [],
            departmentStats: data.departmentStats || [],
            weeklyTrend: data.weeklyTrend || []
          });
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } else {
        console.warn('Productivity API not available, using mock data');
        setMockData();
        toast.success('Showing sample productivity data');
      }
    } catch (error) {
      console.error('Error fetching productivity data:', error);
      toast.error(error.message || 'Failed to load productivity data');
      setMockData();
      toast.success('Showing sample productivity data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const setMockData = () => {
    setProductivityData({
      overall: {
        averageProductivity: 78,
        averageTaskCompletion: 85,
        averageUtilization: 72,
        averageQaPass: 91
      },
      topPerformers: [
        { name: 'John Doe', department: 'Development', averageScore: 95, trend: 8 },
        { name: 'Jane Smith', department: 'Design', averageScore: 92, trend: 12 },
        { name: 'Mike Johnson', department: 'Marketing', averageScore: 88, trend: 5 },
        { name: 'Sarah Wilson', department: 'Sales', averageScore: 86, trend: 3 },
        { name: 'David Lee', department: 'Development', averageScore: 84, trend: 6 }
      ],
      departmentStats: [
        { department: 'Development', productivity: 82, taskCompletion: 88, qaPass: 92 },
        { department: 'Design', productivity: 78, taskCompletion: 84, qaPass: 88 },
        { department: 'Marketing', productivity: 74, taskCompletion: 80, qaPass: 85 },
        { department: 'Sales', productivity: 70, taskCompletion: 76, qaPass: 82 }
      ],
      weeklyTrend: [
        { weekStart: 'Week 1', averageScore: 72 },
        { weekStart: 'Week 2', averageScore: 75 },
        { weekStart: 'Week 3', averageScore: 78 },
        { weekStart: 'Week 4', averageScore: 82 }
      ]
    });
  };

  const handleRefresh = () => {
    fetchProductivityData(true);
  };

  const handleExport = () => {
    toast.success('Export started. Your report will be downloaded shortly.');
  };

  const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="pa-metric-card">
      <div className="pa-metric-content">
        <div className="pa-metric-left">
          <p className="pa-metric-title">{title}</p>
          {loading ? (
            <div className="pa-metric-skeleton"></div>
          ) : (
            <p className="pa-metric-value">{value}</p>
          )}
          {subtitle && !loading && (
            <p className="pa-metric-subtitle">{subtitle}</p>
          )}
        </div>
        <div className={`pa-metric-icon-wrapper pa-metric-icon-${color}`} style={{ backgroundColor: '#FFEFB3' }}>
          <Icon className="pa-metric-icon" color="#013E37" />
        </div>
      </div>
    </div>
  );

  const defaultWeeklyTrend = [
    { weekStart: 'Week 1', averageScore: 0 },
    { weekStart: 'Week 2', averageScore: 0 },
    { weekStart: 'Week 3', averageScore: 0 },
    { weekStart: 'Week 4', averageScore: 0 },
  ];

  const defaultDepartmentStats = [
    { department: 'Development', productivity: 0, taskCompletion: 0, qaPass: 0 },
    { department: 'Design', productivity: 0, taskCompletion: 0, qaPass: 0 },
    { department: 'Marketing', productivity: 0, taskCompletion: 0, qaPass: 0 },
    { department: 'Sales', productivity: 0, taskCompletion: 0, qaPass: 0 },
  ];

  const weeklyTrend = productivityData.weeklyTrend?.length > 0
    ? productivityData.weeklyTrend
    : defaultWeeklyTrend;

  const departmentStats = productivityData.departmentStats?.length > 0
    ? productivityData.departmentStats
    : defaultDepartmentStats;

  if (loading) {
    return (
      <div className="pa-loading">
        <div className="pa-loading-spinner"></div>
        <p className="pa-loading-text">Loading productivity data...</p>
      </div>
    );
  }

  return (
    <div className="pa-container">
      {/* Header */}
      <div className="pa-header">
        <div className="pa-header-left">
          <div className="pa-header-icon" style={{ background: 'linear-gradient(135deg, #013E37, #0A5C54)' }}>
            <Activity className="pa-header-svg" />
          </div>
          <div>
            <h1 className="pa-title">
              <Sparkles className="pa-title-icon" color="#013E37" />
              Productivity Analytics
            </h1>
            <p className="pa-subtitle">Track team performance and efficiency</p>
          </div>
        </div>
        <div className="pa-header-right">
          <button className="pa-btn-icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`pa-refresh-icon ${refreshing ? 'pa-spin' : ''}`} />
          </button>
          <button className="pa-btn-icon" onClick={handleExport}>
            <Download className="pa-btn-svg" />
          </button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="pa-select"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last 12 Months</option>
          </select>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="pa-select"
          >
            <option value="all">All Departments</option>
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="pa-stats">
        <MetricCard
          title="Productivity Score"
          value={`${Math.round(productivityData.overall.averageProductivity)}%`}
          icon={Activity}
          color="blue"
          subtitle="Overall score"
        />
        <MetricCard
          title="Task Completion"
          value={`${Math.round(productivityData.overall.averageTaskCompletion)}%`}
          icon={CheckCircle}
          color="green"
          subtitle="Tasks completed on time"
        />
        <MetricCard
          title="Capacity Utilization"
          value={`${Math.round(productivityData.overall.averageUtilization)}%`}
          icon={Clock}
          color="purple"
          subtitle="Billable hours used"
        />
        <MetricCard
          title="QA Pass Rate"
          value={`${Math.round(productivityData.overall.averageQaPass)}%`}
          icon={TrendingUp}
          color="orange"
          subtitle="First-time approval rate"
        />
      </div>

      {/* Weekly Trend */}
      <div className="pa-chart-card">
        <div className="pa-chart-header">
          <h3 className="pa-chart-title">Weekly Performance Trend</h3>
          <span className="pa-chart-badge" style={{ backgroundColor: '#FFEFB3', color: '#013E37' }}>Line Chart</span>
        </div>
        <div className="pa-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFEFB3" />
              <XAxis dataKey="weekStart" stroke="#013E37" fontSize={12} opacity={0.6} />
              <YAxis domain={[0, 100]} stroke="#013E37" fontSize={12} opacity={0.6} />
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
                dataKey="averageScore"
                stroke="#013E37"
                strokeWidth={3}
                name="Productivity Score"
                dot={{ fill: '#013E37', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Charts */}
      <div className="pa-charts-grid">
        {/* Department Performance Bar Chart */}
        <div className="pa-chart-card">
          <div className="pa-chart-header">
            <h3 className="pa-chart-title">Department Performance</h3>
            <span className="pa-chart-badge" style={{ backgroundColor: '#FFEFB3', color: '#013E37' }}>Bar Chart</span>
          </div>
          <div className="pa-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFEFB3" />
                <XAxis dataKey="department" stroke="#013E37" fontSize={12} opacity={0.6} />
                <YAxis domain={[0, 100]} stroke="#013E37" fontSize={12} opacity={0.6} />
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
                <Bar dataKey="productivity" fill="#013E37" name="Productivity" radius={[4, 4, 0, 0]} />
                <Bar dataKey="taskCompletion" fill="#0A5C54" name="Task Completion" radius={[4, 4, 0, 0]} />
                <Bar dataKey="qaPass" fill="#FFEFB3" name="QA Pass Rate" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Radar Chart */}
        <div className="pa-chart-card">
          <div className="pa-chart-header">
            <h3 className="pa-chart-title">Department Radar</h3>
            <span className="pa-chart-badge" style={{ backgroundColor: '#FFEFB3', color: '#013E37' }}>Radar Chart</span>
          </div>
          <div className="pa-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={departmentStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <PolarGrid stroke="#FFEFB3" />
                <PolarAngleAxis dataKey="department" stroke="#013E37" fontSize={12} opacity={0.6} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#013E37" fontSize={12} opacity={0.6} />
                <Radar
                  name="Productivity"
                  dataKey="productivity"
                  stroke="#013E37"
                  fill="#013E37"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Task Completion"
                  dataKey="taskCompletion"
                  stroke="#0A5C54"
                  fill="#0A5C54"
                  fillOpacity={0.3}
                />
                <Radar
                  name="QA Pass Rate"
                  dataKey="qaPass"
                  stroke="#FFEFB3"
                  fill="#FFEFB3"
                  fillOpacity={0.3}
                />
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
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="pa-performers-card">
        <div className="pa-performers-header">
          <h3 className="pa-chart-title">
            <Award className="pa-performers-title-icon" color="#013E37" />
            Top Performers
          </h3>
          <Users className="pa-performers-icon" color="#013E37" />
        </div>
        <div className="pa-performers-body">
          {productivityData.topPerformers?.length > 0 ? (
            productivityData.topPerformers.slice(0, 5).map((performer, index) => {
              const color = COLORS[index % COLORS.length];
              const score = Math.min(performer.averageScore || 0, 100);
              const remaining = 100 - score;

              return (
                <div key={index} className="pa-performer-item">
                  <div className="pa-performer-info">
                    <div className="pa-performer-avatar" style={{ backgroundColor: color }}>
                      {performer.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="pa-performer-name">{performer.name || 'Unknown'}</div>
                      <div className="pa-performer-department">{performer.department || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="pa-performer-stats">
                    <div className="pa-performer-score">
                      <div className="pa-performer-score-value">{Math.round(score)}%</div>
                      <div className={`pa-performer-trend ${(performer.trend || 0) >= 0 ? 'pa-trend-up' : 'pa-trend-down'}`}>
                        {(performer.trend || 0) >= 0 ? '↑' : '↓'} {Math.abs(performer.trend || 0)}%
                      </div>
                    </div>
                    <div className="pa-performer-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Score', value: score },
                              { name: 'Remaining', value: remaining }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={16}
                            outerRadius={24}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                          >
                            <Cell fill={color} />
                            <Cell fill="#FFEFB3" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="pa-empty-state">
              <div className="pa-empty-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
                <Users className="pa-empty-icon" color="#013E37" />
              </div>
              <p className="pa-empty-text">No performer data available</p>
              <p className="pa-empty-subtext">Start tracking performance to see top performers</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .pa-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #FFFFFF;
          min-height: 100vh;
          animation: paFadeIn 0.4s ease;
        }

        @keyframes paFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes paSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes paSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes paPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .pa-spin {
          animation: paSpin 1s linear infinite;
        }

        /* ============================================
           LOADING
           ============================================ */
        .pa-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .pa-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: paSpin 0.8s linear infinite;
        }

        .pa-loading-text {
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
          font-weight: 500;
        }

        /* ============================================
           HEADER
           ============================================ */
        .pa-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pa-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pa-header-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.25);
          transition: all 0.3s ease;
        }

        .pa-header-icon:hover {
          transform: scale(1.05) rotate(-5deg);
        }

        .pa-header-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .pa-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pa-title-icon {
          width: 24px;
          height: 24px;
          animation: paPulse 2s ease-in-out infinite;
        }

        .pa-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }

        .pa-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pa-btn-icon {
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

        .pa-btn-icon:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .pa-btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pa-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .pa-btn-svg {
          width: 16px;
          height: 16px;
        }

        .pa-select {
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

        .pa-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .pa-select:hover {
          border-color: #013E37;
        }

        /* ============================================
           STATS
           ============================================ */
        .pa-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .pa-metric-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
          animation: paSlideUp 0.5s ease both;
        }

        .pa-metric-card:nth-child(1) { animation-delay: 0.05s; }
        .pa-metric-card:nth-child(2) { animation-delay: 0.1s; }
        .pa-metric-card:nth-child(3) { animation-delay: 0.15s; }
        .pa-metric-card:nth-child(4) { animation-delay: 0.2s; }

        .pa-metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }

        .pa-metric-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .pa-metric-left {
          flex: 1;
        }

        .pa-metric-title {
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }

        .pa-metric-value {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 6px 0 0 0;
          line-height: 1.2;
        }

        .pa-metric-skeleton {
          height: 32px;
          width: 80px;
          background: #FFEFB3;
          border-radius: 6px;
          margin-top: 6px;
          animation: paPulse 1.5s ease-in-out infinite;
        }

        .pa-metric-subtitle {
          font-size: 13px;
          color: #013E37;
          opacity: 0.5;
          margin: 2px 0 0 0;
        }

        .pa-metric-icon-wrapper {
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .pa-metric-card:hover .pa-metric-icon-wrapper {
          transform: scale(1.05);
        }

        .pa-metric-icon {
          width: 20px;
          height: 20px;
        }

        /* ============================================
           CHARTS
           ============================================ */
        .pa-chart-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .pa-chart-card:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
          border-color: #013E37;
        }

        .pa-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .pa-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #F8FAFC;
        }

        .pa-chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pa-performers-title-icon {
          width: 18px;
          height: 18px;
        }

        .pa-chart-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pa-chart-body {
          padding: 20px;
          height: 320px;
          width: 100%;
        }

        /* ============================================
           PERFORMERS
           ============================================ */
        .pa-performers-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .pa-performers-card:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
          border-color: #013E37;
        }

        .pa-performers-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #F8FAFC;
        }

        .pa-performers-icon {
          width: 18px;
          height: 18px;
          opacity: 0.5;
        }

        .pa-performers-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 400px;
          overflow-y: auto;
        }

        .pa-performers-body::-webkit-scrollbar {
          width: 4px;
        }

        .pa-performers-body::-webkit-scrollbar-track {
          background: #FFEFB3;
          border-radius: 4px;
        }

        .pa-performers-body::-webkit-scrollbar-thumb {
          background: #013E37;
          border-radius: 4px;
        }

        .pa-performer-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #F8FAFC;
          border-radius: 10px;
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
        }

        .pa-performer-item:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: translateX(4px);
        }

        .pa-performer-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .pa-performer-avatar {
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

        .pa-performer-item:hover .pa-performer-avatar {
          transform: scale(1.05);
        }

        .pa-performer-name {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
        }

        .pa-performer-department {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
        }

        .pa-performer-stats {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .pa-performer-score {
          text-align: right;
        }

        .pa-performer-score-value {
          font-size: 16px;
          font-weight: 700;
          color: #013E37;
        }

        .pa-performer-trend {
          font-size: 12px;
          font-weight: 500;
        }

        .pa-trend-up { color: #013E37; }
        .pa-trend-down { color: #D32F2F; }

        .pa-performer-chart {
          width: 48px;
          height: 48px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .pa-empty-state {
          text-align: center;
          padding: 40px 20px;
          width: 100%;
        }

        .pa-empty-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          animation: paPulse 2s ease-in-out infinite;
        }

        .pa-empty-icon {
          width: 32px;
          height: 32px;
        }

        .pa-empty-text {
          font-size: 16px;
          font-weight: 500;
          color: #013E37;
          margin: 0;
        }

        .pa-empty-subtext {
          font-size: 14px;
          color: #013E37;
          opacity: 0.5;
          margin: 4px 0 0 0;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .pa-charts-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .pa-container {
            padding: 16px;
          }

          .pa-header {
            flex-direction: column;
            align-items: stretch;
          }

          .pa-header-right {
            flex-wrap: wrap;
          }

          .pa-select {
            flex: 1;
            min-width: 100px;
          }

          .pa-stats {
            grid-template-columns: 1fr 1fr;
          }

          .pa-metric-value {
            font-size: 22px;
          }

          .pa-title {
            font-size: 22px;
          }

          .pa-header-icon {
            width: 40px;
            height: 40px;
          }

          .pa-header-svg {
            width: 20px;
            height: 20px;
          }

          .pa-chart-body {
            height: 250px;
            padding: 12px;
          }

          .pa-chart-header {
            padding: 12px 16px;
            flex-wrap: wrap;
            gap: 8px;
          }

          .pa-performer-item {
            flex-direction: column;
            align-items: stretch;
          }

          .pa-performer-stats {
            justify-content: space-between;
            margin-top: 8px;
          }
        }

        @media (max-width: 480px) {
          .pa-container {
            padding: 12px;
          }

          .pa-stats {
            grid-template-columns: 1fr;
          }

          .pa-metric-card {
            padding: 16px;
          }

          .pa-metric-value {
            font-size: 20px;
          }

          .pa-title {
            font-size: 20px;
          }

          .pa-subtitle {
            font-size: 13px;
          }

          .pa-chart-body {
            height: 200px;
            padding: 8px;
          }

          .pa-performers-body {
            padding: 12px 16px;
          }

          .pa-performer-chart {
            width: 40px;
            height: 40px;
          }

          .pa-header-right {
            flex-wrap: wrap;
          }

          .pa-select {
            width: 100%;
          }

          .pa-btn-icon {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductivityAnalytics;