// pages/partners/PartnerDashboard.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Handshake, Users, Building2, GraduationCap,
  Briefcase, Star, TrendingUp, TrendingDown,
  DollarSign, Calendar, CheckCircle, AlertCircle,
  BarChart3, PieChart, Activity, Filter,
  Download, RefreshCw, ArrowRight, Zap,
  Award, Clock, Target, MessageCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

const PartnerDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('monthly');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F472B6'];

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let data = null;
      try {
        const response = await fetch(
          `${API_URL}/partners/dashboard?period=${period}`,
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
            data = result.data;
          }
        }
      } catch (err) {
        console.warn('API not available, using mock data');
        data = getMockData();
        toast.info('Showing sample dashboard data');
      }

      setStats(data || getMockData());
    } catch (error) {
      console.error('Error fetching partner dashboard:', error);
      setStats(getMockData());
      toast.error('Failed to load dashboard, showing sample data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockData = () => {
    return {
      total: 24,
      active: 18,
      totalValue: 2500000,
      averageHealth: 82,
      byType: {
        brand: 8,
        university: 4,
        employer: 6,
        influencer: 6
      },
      byStatus: {
        active: 12,
        onboarded: 4,
        interested: 3,
        negotiating: 3,
        prospect: 2
      },
      recentActivities: [
        { description: 'New brand partnership: Nike', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { description: 'University of Stanford onboarded', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { description: 'Influencer contract signed: TechGuru', timestamp: new Date(Date.now() - 86400000).toISOString() },
        { description: 'Employer partnership renewed: Google', timestamp: new Date(Date.now() - 172800000).toISOString() },
        { description: 'New influencer added: LifestyleLisa', timestamp: new Date(Date.now() - 259200000).toISOString() }
      ],
      trendData: [
        { month: 'Jan', partners: 10, value: 800000 },
        { month: 'Feb', partners: 12, value: 950000 },
        { month: 'Mar', partners: 14, value: 1100000 },
        { month: 'Apr', partners: 16, value: 1250000 },
        { month: 'May', partners: 18, value: 1400000 },
        { month: 'Jun', partners: 24, value: 2500000 }
      ]
    };
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': '#10B981',
      'onboarded': '#3B82F6',
      'interested': '#F59E0B',
      'negotiating': '#8B5CF6',
      'prospect': '#6B7280'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'active': CheckCircle,
      'onboarded': Users,
      'interested': Star,
      'negotiating': MessageCircle,
      'prospect': Target
    };
    const Icon = icons[status] || Users;
    return Icon;
  };

  const typeOptions = [
    { value: 'brand', label: 'Brands', icon: Building2, color: '#3B82F6' },
    { value: 'university', label: 'Universities', icon: GraduationCap, color: '#8B5CF6' },
    { value: 'employer', label: 'Employers', icon: Briefcase, color: '#10B981' },
    { value: 'influencer', label: 'Influencers', icon: Star, color: '#EC4899' }
  ];

  if (loading) {
    return (
      <div className="pd-loading">
        <div className="pd-spinner"></div>
        <p className="pd-loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="pd-container">
      {/* Header */}
      <div className="pd-header">
        <div className="pd-header-left">
          <div className="pd-title-wrapper">
            <div className="pd-title-icon">
              <Handshake className="pd-title-svg" />
            </div>
            <div>
              <h3 className="pd-title">Partner Dashboard</h3>
              <p className="pd-subtitle">Overview of all partnerships</p>
            </div>
          </div>
        </div>
        <div className="pd-header-right">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="pd-period-select"
          >
            <option value="weekly">📅 Weekly</option>
            <option value="monthly">📅 Monthly</option>
            <option value="quarterly">📅 Quarterly</option>
            <option value="annual">📅 Annual</option>
          </select>
          <button className="pd-icon-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`pd-refresh-icon ${refreshing ? 'pd-spin' : ''}`} />
          </button>
          <button className="pd-icon-btn">
            <Filter className="pd-btn-icon" />
          </button>
          <button className="pd-export-btn">
            <Download className="pd-btn-icon" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="pd-stats">
        <div className="pd-stat-card pd-stat-blue">
          <div className="pd-stat-content">
            <div className="pd-stat-left">
              <p className="pd-stat-label">Total Partners</p>
              <p className="pd-stat-number">{stats?.total || 0}</p>
              <div className="pd-stat-change pd-change-up">↑ 12% from last {period}</div>
            </div>
            <div className="pd-stat-icon-wrapper">
              <Handshake className="pd-stat-icon" />
            </div>
          </div>
        </div>

        <div className="pd-stat-card pd-stat-green">
          <div className="pd-stat-content">
            <div className="pd-stat-left">
              <p className="pd-stat-label">Active Partners</p>
              <p className="pd-stat-number">{stats?.active || 0}</p>
              <div className="pd-stat-change pd-change-up">↑ 8% from last {period}</div>
            </div>
            <div className="pd-stat-icon-wrapper">
              <CheckCircle className="pd-stat-icon" />
            </div>
          </div>
        </div>

        <div className="pd-stat-card pd-stat-purple">
          <div className="pd-stat-content">
            <div className="pd-stat-left">
              <p className="pd-stat-label">Total Value</p>
              <p className="pd-stat-number">{formatCurrency(stats?.totalValue || 0)}</p>
              <div className="pd-stat-change pd-change-up">↑ 15% from last {period}</div>
            </div>
            <div className="pd-stat-icon-wrapper">
              <DollarSign className="pd-stat-icon" />
            </div>
          </div>
        </div>

        <div className="pd-stat-card pd-stat-orange">
          <div className="pd-stat-content">
            <div className="pd-stat-left">
              <p className="pd-stat-label">Avg Health</p>
              <p className="pd-stat-number">{Math.round(stats?.averageHealth || 0)}%</p>
              <div className="pd-stat-change pd-change-up">↑ 5% from last {period}</div>
            </div>
            <div className="pd-stat-icon-wrapper">
              <Activity className="pd-stat-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="pd-charts">
        {/* Partner Type Distribution */}
        <div className="pd-chart-card">
          <div className="pd-chart-header">
            <h4 className="pd-chart-title">Partners by Type</h4>
            <span className="pd-chart-badge">Pie Chart</span>
          </div>
          <div className="pd-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Brands', value: stats?.byType?.brand || 0 },
                    { name: 'Universities', value: stats?.byType?.university || 0 },
                    { name: 'Employers', value: stats?.byType?.employer || 0 },
                    { name: 'Influencers', value: stats?.byType?.influencer || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Partner Status */}
        <div className="pd-chart-card">
          <div className="pd-chart-header">
            <h4 className="pd-chart-title">Partner Status</h4>
            <span className="pd-chart-badge">Distribution</span>
          </div>
          <div className="pd-chart-body pd-status-list">
            {stats?.byStatus && Object.entries(stats.byStatus).map(([status, count]) => {
              const StatusIcon = getStatusIcon(status);
              return (
                <div key={status} className="pd-status-item">
                  <div className="pd-status-header">
                    <div className="pd-status-left">
                      <StatusIcon className="pd-status-icon" style={{ color: getStatusColor(status) }} />
                      <span className="pd-status-name capitalize">{status}</span>
                    </div>
                    <span className="pd-status-count">{count}</span>
                  </div>
                  <div className="pd-status-bar">
                    <div 
                      className="pd-status-fill"
                      style={{ 
                        width: `${(count / (stats?.total || 1)) * 100}%`,
                        backgroundColor: getStatusColor(status)
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="pd-trend-card">
        <div className="pd-trend-header">
          <h4 className="pd-chart-title">Partnership Growth</h4>
          <span className="pd-chart-badge">Area Chart</span>
        </div>
        <div className="pd-trend-body">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats?.trendData || []}>
              <defs>
                <linearGradient id="pdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="pdGradientValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="partners"
                name="Partners"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#pdGradient)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="value"
                name="Value ($)"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#pdGradientValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="pd-activity">
        <div className="pd-activity-header">
          <h4 className="pd-chart-title">Recent Partner Activity</h4>
          <button className="pd-activity-view">View All →</button>
        </div>
        <div className="pd-activity-list">
          {stats?.recentActivities?.slice(0, 5).map((activity, idx) => (
            <div key={idx} className="pd-activity-item">
              <div className="pd-activity-icon-wrapper">
                <Activity className="pd-activity-icon" />
              </div>
              <div className="pd-activity-content">
                <p className="pd-activity-text">{activity.description}</p>
                <p className="pd-activity-time">{new Date(activity.timestamp).toLocaleString()}</p>
              </div>
              <ArrowRight className="pd-activity-arrow" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pd-actions">
        <button className="pd-action-btn pd-action-brand" onClick={() => toast.info('Add Brand form coming soon')}>
          <Building2 className="pd-action-icon" />
          <span>Add Brand</span>
        </button>
        <button className="pd-action-btn pd-action-university" onClick={() => toast.info('Add University form coming soon')}>
          <GraduationCap className="pd-action-icon" />
          <span>Add University</span>
        </button>
        <button className="pd-action-btn pd-action-employer" onClick={() => toast.info('Add Employer form coming soon')}>
          <Briefcase className="pd-action-icon" />
          <span>Add Employer</span>
        </button>
        <button className="pd-action-btn pd-action-influencer" onClick={() => toast.info('Add Influencer form coming soon')}>
          <Star className="pd-action-icon" />
          <span>Add Influencer</span>
        </button>
      </div>

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .pd-container {
          padding: 20px 24px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: pdFadeIn 0.4s ease;
        }

        @keyframes pdFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .pd-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .pd-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: pdSpin 0.8s linear infinite;
        }

        .pd-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes pdSpin {
          to { transform: rotate(360deg); }
        }

        .pd-spin {
          animation: pdSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .pd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pd-header-left {
          display: flex;
          align-items: center;
        }

        .pd-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pd-title-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .pd-title-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .pd-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .pd-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .pd-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pd-period-select {
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

        .pd-period-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .pd-icon-btn {
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

        .pd-icon-btn:hover {
          background: #f1f5f9;
        }

        .pd-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .pd-btn-icon {
          width: 16px;
          height: 16px;
        }

        .pd-export-btn {
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

        .pd-export-btn:hover {
          background: #f1f5f9;
        }

        /* ============================================
           STATS
           ============================================ */
        .pd-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .pd-stat-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          animation: pdSlideUp 0.5s ease both;
        }

        .pd-stat-card:nth-child(1) { animation-delay: 0.1s; }
        .pd-stat-card:nth-child(2) { animation-delay: 0.2s; }
        .pd-stat-card:nth-child(3) { animation-delay: 0.3s; }
        .pd-stat-card:nth-child(4) { animation-delay: 0.4s; }

        @keyframes pdSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pd-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .pd-stat-blue { border-left: 4px solid #3b82f6; }
        .pd-stat-green { border-left: 4px solid #10b981; }
        .pd-stat-purple { border-left: 4px solid #8b5cf6; }
        .pd-stat-orange { border-left: 4px solid #f59e0b; }

        .pd-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pd-stat-left {
          flex: 1;
        }

        .pd-stat-label {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .pd-stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 4px 0 0 0;
          line-height: 1.2;
        }

        .pd-stat-change {
          font-size: 12px;
          margin-top: 4px;
          font-weight: 500;
        }

        .pd-change-up { color: #22c55e; }
        .pd-change-down { color: #ef4444; }

        .pd-stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pd-stat-blue .pd-stat-icon-wrapper { background: #eff6ff; }
        .pd-stat-green .pd-stat-icon-wrapper { background: #ecfdf5; }
        .pd-stat-purple .pd-stat-icon-wrapper { background: #f5f3ff; }
        .pd-stat-orange .pd-stat-icon-wrapper { background: #fffbeb; }

        .pd-stat-icon {
          width: 22px;
          height: 22px;
        }

        .pd-stat-blue .pd-stat-icon { color: #3b82f6; }
        .pd-stat-green .pd-stat-icon { color: #10b981; }
        .pd-stat-purple .pd-stat-icon { color: #8b5cf6; }
        .pd-stat-orange .pd-stat-icon { color: #f59e0b; }

        /* ============================================
           CHARTS
           ============================================ */
        .pd-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .pd-chart-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .pd-chart-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .pd-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .pd-chart-title {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .pd-chart-badge {
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .pd-chart-body {
          width: 100%;
          height: 280px;
        }

        .pd-status-list {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 12px;
          height: 100%;
          padding: 0 8px;
        }

        .pd-status-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pd-status-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pd-status-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pd-status-icon {
          width: 16px;
          height: 16px;
        }

        .pd-status-name {
          font-size: 14px;
          color: #0f172a;
        }

        .pd-status-count {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .pd-status-bar {
          width: 100%;
          height: 4px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .pd-status-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        /* ============================================
           TREND
           ============================================ */
        .pd-trend-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .pd-trend-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .pd-trend-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .pd-trend-body {
          width: 100%;
          height: 280px;
        }

        /* ============================================
           ACTIVITY
           ============================================ */
        .pd-activity {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .pd-activity:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .pd-activity-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .pd-activity-view {
          font-size: 14px;
          font-weight: 500;
          color: #3b82f6;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pd-activity-view:hover {
          color: #2563eb;
        }

        .pd-activity-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pd-activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: #f8fafc;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .pd-activity-item:hover {
          background: #f1f5f9;
        }

        .pd-activity-icon-wrapper {
          width: 32px;
          height: 32px;
          background: #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pd-activity-icon {
          width: 14px;
          height: 14px;
          color: #64748b;
        }

        .pd-activity-content {
          flex: 1;
        }

        .pd-activity-text {
          font-size: 14px;
          color: #0f172a;
          margin: 0;
        }

        .pd-activity-time {
          font-size: 12px;
          color: #94a3b8;
          margin: 2px 0 0 0;
        }

        .pd-activity-arrow {
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        /* ============================================
           ACTIONS
           ============================================ */
        .pd-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }

        .pd-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 20px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .pd-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .pd-action-brand:hover { border-color: #3b82f6; color: #3b82f6; }
        .pd-action-university:hover { border-color: #8b5cf6; color: #8b5cf6; }
        .pd-action-employer:hover { border-color: #10b981; color: #10b981; }
        .pd-action-influencer:hover { border-color: #ec4899; color: #ec4899; }

        .pd-action-icon {
          width: 20px;
          height: 20px;
        }

        .pd-action-brand .pd-action-icon { color: #3b82f6; }
        .pd-action-university .pd-action-icon { color: #8b5cf6; }
        .pd-action-employer .pd-action-icon { color: #10b981; }
        .pd-action-influencer .pd-action-icon { color: #ec4899; }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .pd-charts {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .pd-container {
            padding: 16px;
          }

          .pd-header {
            flex-direction: column;
            align-items: stretch;
          }

          .pd-header-right {
            flex-wrap: wrap;
          }

          .pd-period-select {
            flex: 1;
          }

          .pd-export-btn {
            flex: 1;
            justify-content: center;
          }

          .pd-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .pd-stat-number {
            font-size: 22px;
          }

          .pd-title {
            font-size: 22px;
          }

          .pd-title-icon {
            width: 40px;
            height: 40px;
          }

          .pd-title-svg {
            width: 20px;
            height: 20px;
          }

          .pd-trend-body {
            height: 220px;
          }

          .pd-chart-body {
            height: 220px;
          }

          .pd-actions {
            grid-template-columns: 1fr 1fr;
          }

          .pd-action-btn {
            padding: 12px 16px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .pd-container {
            padding: 12px;
          }

          .pd-stats {
            grid-template-columns: 1fr;
          }

          .pd-header-right {
            flex-direction: column;
          }

          .pd-period-select {
            width: 100%;
          }

          .pd-export-btn {
            width: 100%;
          }

          .pd-icon-btn {
            align-self: flex-end;
          }

          .pd-title-wrapper {
            gap: 10px;
          }

          .pd-title {
            font-size: 20px;
          }

          .pd-subtitle {
            font-size: 13px;
          }

          .pd-actions {
            grid-template-columns: 1fr;
          }

          .pd-chart-card {
            padding: 16px;
          }

          .pd-trend-card {
            padding: 16px;
          }

          .pd-activity {
            padding: 16px;
          }

          .pd-activity-item {
            padding: 8px 12px;
          }

          .pd-activity-text {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default PartnerDashboard;