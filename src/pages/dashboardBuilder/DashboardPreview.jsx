// pages/builder/DashboardPreview.jsx - COMPLETE MODERN VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Layout, Eye, Download, Share2, Printer,
  RefreshCw, ArrowLeft, Maximize, Minimize,
  BarChart2, PieChart, Activity, Users,
  Target, Clock, CheckCircle, AlertCircle,
  Grid, List, ZoomIn, ZoomOut,
  FileText, Building2, Briefcase, User,
  Star, TrendingUp, TrendingDown
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

const DashboardPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    fetchDashboard();
  }, [id]);

  const fetchDashboard = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/dashboards/${id}`, getHeaders());
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setDashboard(data);
        setWidgets(data.widgets || []);
      } else {
        // Use mock data
        setDashboard(getMockDashboard(id));
        setWidgets(getMockDashboard(id).widgets || []);
        toast.info('Showing sample dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setDashboard(getMockDashboard(id));
      setWidgets(getMockDashboard(id).widgets || []);
      toast.error('Failed to load dashboard, showing sample');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockDashboard = (id) => {
    return {
      _id: id || 'mock_123',
      name: 'Executive Dashboard',
      description: 'High-level overview of key business metrics',
      audience: 'all',
      isActive: true,
      createdAt: new Date().toISOString(),
      widgets: [
        {
          id: 'widget-1',
          name: 'Total Revenue',
          type: 'kpi_card',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: { metric: 'revenue', value: '$1,234,567', change: '+12.5%' }
        },
        {
          id: 'widget-2',
          name: 'Active Users',
          type: 'kpi_card',
          position: { x: 3, y: 0, w: 3, h: 2 },
          config: { metric: 'users', value: '8,492', change: '+8.3%' }
        },
        {
          id: 'widget-3',
          name: 'Revenue Trend',
          type: 'performance_chart',
          position: { x: 0, y: 2, w: 6, h: 3 },
          config: { chartType: 'area' }
        },
        {
          id: 'widget-4',
          name: 'Task Status',
          type: 'task_status',
          position: { x: 0, y: 5, w: 3, h: 2 },
          config: {}
        },
        {
          id: 'widget-5',
          name: 'Top Performers',
          type: 'employee_ranking',
          position: { x: 3, y: 5, w: 3, h: 2 },
          config: { limit: 5 }
        }
      ]
    };
  };

  const handleRefresh = async () => {
    await fetchDashboard();
    toast.success('Dashboard refreshed');
  };

  const handleExport = () => {
    toast.success('Export started');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    if (!fullscreen) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const getWidgetIcon = (type) => {
    const icons = {
      'kpi_card': Target,
      'task_status': CheckCircle,
      'activity_feed': Activity,
      'risk_list': AlertCircle,
      'performance_chart': BarChart2,
      'goal_progress': Target,
      'number': BarChart2,
      'percentage': PieChart,
      'progress_bar': Layout,
      'table': Grid,
      'employee_ranking': Users,
      'team_ranking': Users,
      'revenue_chart': TrendingUp,
      'user_activity': User
    };
    const Icon = icons[type] || Layout;
    return <Icon className="dp-widget-icon" />;
  };

  const getWidgetColor = (type) => {
    const colors = {
      'kpi_card': 'dp-widget-kpi',
      'task_status': 'dp-widget-task',
      'activity_feed': 'dp-widget-activity',
      'risk_list': 'dp-widget-risk',
      'performance_chart': 'dp-widget-chart',
      'goal_progress': 'dp-widget-goal',
      'number': 'dp-widget-number',
      'percentage': 'dp-widget-percentage',
      'progress_bar': 'dp-widget-progress',
      'table': 'dp-widget-table',
      'employee_ranking': 'dp-widget-ranking',
      'team_ranking': 'dp-widget-ranking'
    };
    return colors[type] || 'dp-widget-default';
  };

  const getWidgetSize = (widget) => {
    const sizeMap = {
      1: 'dp-col-span-1',
      2: 'dp-col-span-2',
      3: 'dp-col-span-3',
      4: 'dp-col-span-4',
      5: 'dp-col-span-5',
      6: 'dp-col-span-6'
    };
    return sizeMap[widget.position?.w || 3] || 'dp-col-span-3';
  };

  const getWidgetHeight = (widget) => {
    const heightMap = {
      1: 'dp-h-32',
      2: 'dp-h-48',
      3: 'dp-h-64',
      4: 'dp-h-80',
      5: 'dp-h-96',
      6: 'dp-h-112'
    };
    return heightMap[widget.position?.h || 3] || 'dp-h-64';
  };

  // Sample chart data
  const chartData = [
    { month: 'Jan', value: 4000 },
    { month: 'Feb', value: 3000 },
    { month: 'Mar', value: 5000 },
    { month: 'Apr', value: 4500 },
    { month: 'May', value: 6000 },
    { month: 'Jun', value: 5500 }
  ];

  const pieData = [
    { name: 'Completed', value: 60 },
    { name: 'In Progress', value: 25 },
    { name: 'Pending', value: 15 }
  ];

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];

  if (loading) {
    return (
      <div className="dp-loading">
        <div className="dp-spinner"></div>
        <p className="dp-loading-text">Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="dp-not-found">
        <Layout className="dp-not-found-icon" />
        <h2 className="dp-not-found-title">Dashboard Not Found</h2>
        <p className="dp-not-found-subtitle">The dashboard you're looking for doesn't exist</p>
        <button
          onClick={() => navigate('/dashboard-builder')}
          className="dp-not-found-btn"
        >
          <ArrowLeft className="dp-not-found-btn-icon" />
          Back to Builder
        </button>
      </div>
    );
  }

  return (
    <div className={`dp-container ${fullscreen ? 'dp-fullscreen' : ''}`}>
      {/* Header */}
      <div className="dp-header">
        <div className="dp-header-left">
          <button 
            onClick={() => navigate('/dashboard-builder')}
            className="dp-back-btn"
            title="Back to Builder"
          >
            <ArrowLeft className="dp-back-icon" />
          </button>
          <div>
            <h1 className="dp-title">{dashboard.name}</h1>
            <p className="dp-subtitle">{dashboard.description || 'Dashboard Preview'}</p>
          </div>
        </div>
        <div className="dp-header-right">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`dp-details-btn ${showDetails ? 'dp-details-active' : ''}`}
            title="Toggle Details"
          >
            <Eye className="dp-details-icon" />
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="dp-refresh-btn"
            title="Refresh"
          >
            <RefreshCw className={`dp-refresh-icon ${refreshing ? 'dp-spin' : ''}`} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="dp-fullscreen-btn"
            title="Fullscreen"
          >
            {fullscreen ? <Minimize className="dp-fullscreen-icon" /> : <Maximize className="dp-fullscreen-icon" />}
          </button>
          <button
            onClick={handlePrint}
            className="dp-print-btn"
            title="Print"
          >
            <Printer className="dp-print-icon" />
          </button>
          <button
            onClick={handleShare}
            className="dp-share-btn"
            title="Share"
          >
            <Share2 className="dp-share-icon" />
          </button>
          <button
            onClick={handleExport}
            className="dp-export-btn"
            title="Export"
          >
            <Download className="dp-export-icon" />
          </button>
        </div>
      </div>

      {/* Dashboard Info */}
      {showDetails && (
        <div className="dp-info">
          <div className="dp-info-grid">
            <div className="dp-info-item">
              <span className="dp-info-label">Audience</span>
              <span className="dp-info-value capitalize">{dashboard.audience || 'All'}</span>
            </div>
            <div className="dp-info-item">
              <span className="dp-info-label">Widgets</span>
              <span className="dp-info-value">{widgets.length}</span>
            </div>
            <div className="dp-info-item">
              <span className="dp-info-label">Status</span>
              <span className={`dp-info-value ${dashboard.isActive ? 'dp-info-active' : 'dp-info-inactive'}`}>
                {dashboard.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="dp-info-item">
              <span className="dp-info-label">Created</span>
              <span className="dp-info-value">
                {new Date(dashboard.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {widgets.length > 0 && (
        <div className="dp-stats">
          <div className="dp-stat-card">
            <span className="dp-stat-label">Total Widgets</span>
            <span className="dp-stat-value">{widgets.length}</span>
          </div>
          <div className="dp-stat-card">
            <span className="dp-stat-label">Widget Types</span>
            <span className="dp-stat-value">
              {new Set(widgets.map(w => w.type)).size}
            </span>
          </div>
          <div className="dp-stat-card">
            <span className="dp-stat-label">Layout</span>
            <span className="dp-stat-value">
              {widgets.length > 0 ? `${Math.ceil(widgets.length / 2)} rows` : 'Empty'}
            </span>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="dp-grid-wrapper">
        <div className="dp-grid" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`${getWidgetSize(widget)} ${getWidgetHeight(widget)} dp-widget ${getWidgetColor(widget.type)}`}
            >
              <div className="dp-widget-header">
                <div className="dp-widget-header-left">
                  {getWidgetIcon(widget.type)}
                  <span className="dp-widget-name">{widget.name}</span>
                </div>
                <span className="dp-widget-type">{widget.type.replace(/_/g, ' ')}</span>
              </div>
              <div className="dp-widget-body">
                {widget.type === 'kpi_card' && (
                  <div className="dp-widget-kpi-content">
                    <div className="dp-kpi-value">{widget.config?.value || 'N/A'}</div>
                    <div className="dp-kpi-change dp-kpi-up">
                      <TrendingUp className="dp-kpi-change-icon" />
                      {widget.config?.change || '+0%'}
                    </div>
                    <div className="dp-kpi-label">{widget.config?.metric || 'Metric'}</div>
                  </div>
                )}
                {widget.type === 'performance_chart' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="dpChartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#ffffff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#dpChartGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
                {widget.type === 'task_status' && (
                  <div className="dp-widget-task-content">
                    <div className="dp-task-stats">
                      <div className="dp-task-stat">
                        <span className="dp-task-stat-value">45</span>
                        <span className="dp-task-stat-label">Completed</span>
                      </div>
                      <div className="dp-task-stat">
                        <span className="dp-task-stat-value">28</span>
                        <span className="dp-task-stat-label">In Progress</span>
                      </div>
                      <div className="dp-task-stat">
                        <span className="dp-task-stat-value">12</span>
                        <span className="dp-task-stat-label">Pending</span>
                      </div>
                    </div>
                    <div className="dp-task-progress">
                      <div className="dp-task-progress-bar">
                        <div className="dp-task-progress-fill" style={{ width: '60%' }} />
                      </div>
                      <span className="dp-task-progress-label">60% Complete</span>
                    </div>
                  </div>
                )}
                {widget.type === 'employee_ranking' && (
                  <div className="dp-widget-ranking-content">
                    {['John Doe', 'Sarah Smith', 'Mike Johnson', 'Emily Davis', 'Tom Wilson'].map((name, i) => (
                      <div key={i} className="dp-ranking-item">
                        <span className="dp-ranking-position">{i + 1}</span>
                        <span className="dp-ranking-name">{name}</span>
                        <span className="dp-ranking-score">{Math.floor(Math.random() * 40 + 60)}%</span>
                      </div>
                    ))}
                  </div>
                )}
                {widget.type === 'pie' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: '#ffffff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px'
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
                {!['kpi_card', 'performance_chart', 'task_status', 'employee_ranking', 'pie'].includes(widget.type) && (
                  <div className="dp-widget-placeholder">
                    {getWidgetIcon(widget.type)}
                    <span className="dp-widget-placeholder-text">Widget Preview</span>
                    <span className="dp-widget-placeholder-hint">Configure in builder</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {widgets.length === 0 && (
            <div className="dp-empty">
              <Layout className="dp-empty-icon" />
              <h3 className="dp-empty-title">No widgets in this dashboard</h3>
              <p className="dp-empty-subtitle">Add widgets in the builder</p>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="dp-zoom-controls">
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          className="dp-zoom-btn"
          title="Zoom Out"
        >
          <ZoomOut className="dp-zoom-icon" />
        </button>
        <span className="dp-zoom-label">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
          className="dp-zoom-btn"
          title="Zoom In"
        >
          <ZoomIn className="dp-zoom-icon" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="dp-zoom-reset"
        >
          Reset
        </button>
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .dp-container {
          padding: 0 0 24px 0;
          max-width: 100%;
          transition: all 0.3s ease;
        }

        .dp-fullscreen {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: #f8fafc;
          padding: 20px;
          overflow: auto;
        }

        /* ============================================
           LOADING
           ============================================ */
        .dp-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .dp-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .dp-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           NOT FOUND
           ============================================ */
        .dp-not-found {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .dp-not-found-icon {
          width: 64px;
          height: 64px;
          color: #d1d5db;
          margin-bottom: 16px;
        }

        .dp-not-found-title {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .dp-not-found-subtitle {
          color: #6b7280;
          margin-top: 4px;
        }

        .dp-not-found-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          padding: 8px 24px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dp-not-found-btn:hover {
          background: #2563eb;
        }

        .dp-not-found-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           HEADER
           ============================================ */
        .dp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .dp-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dp-back-btn {
          padding: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .dp-back-btn:hover {
          background: #f3f4f6;
        }

        .dp-back-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
        }

        .dp-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .dp-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 2px 0 0 0;
        }

        .dp-header-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .dp-details-btn,
        .dp-refresh-btn,
        .dp-fullscreen-btn,
        .dp-print-btn,
        .dp-share-btn,
        .dp-export-btn {
          padding: 8px 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dp-details-btn:hover,
        .dp-refresh-btn:hover:not(:disabled),
        .dp-fullscreen-btn:hover,
        .dp-print-btn:hover,
        .dp-share-btn:hover,
        .dp-export-btn:hover {
          background: #f3f4f6;
        }

        .dp-details-active {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .dp-details-active .dp-details-icon {
          color: #3b82f6;
        }

        .dp-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .dp-refresh-icon,
        .dp-fullscreen-icon,
        .dp-print-icon,
        .dp-share-icon,
        .dp-export-icon,
        .dp-details-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .dp-spin {
          animation: spin 0.8s linear infinite;
        }

        /* ============================================
           INFO
           ============================================ */
        .dp-info {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 16px;
        }

        .dp-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .dp-info-item {
          display: flex;
          flex-direction: column;
        }

        .dp-info-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dp-info-value {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }

        .dp-info-active { color: #22c55e; }
        .dp-info-inactive { color: #9ca3af; }

        /* ============================================
           STATS
           ============================================ */
        .dp-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .dp-stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
        }

        .dp-stat-label {
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
        }

        .dp-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-top: 2px;
        }

        /* ============================================
           GRID
           ============================================ */
        .dp-grid-wrapper {
          overflow: auto;
          padding-bottom: 16px;
        }

        .dp-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          min-height: 300px;
          transition: transform 0.3s ease;
          width: 100%;
        }

        .dp-col-span-1 { grid-column: span 1; }
        .dp-col-span-2 { grid-column: span 2; }
        .dp-col-span-3 { grid-column: span 3; }
        .dp-col-span-4 { grid-column: span 4; }
        .dp-col-span-5 { grid-column: span 5; }
        .dp-col-span-6 { grid-column: span 6; }

        .dp-h-32 { min-height: 128px; }
        .dp-h-48 { min-height: 192px; }
        .dp-h-64 { min-height: 256px; }
        .dp-h-80 { min-height: 320px; }
        .dp-h-96 { min-height: 384px; }
        .dp-h-112 { min-height: 448px; }

        .dp-widget {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .dp-widget-kpi { border-color: #bfdbfe; background: #eff6ff; }
        .dp-widget-task { border-color: #bbf7d0; background: #f0fdf4; }
        .dp-widget-activity { border-color: #e9d5ff; background: #faf5ff; }
        .dp-widget-risk { border-color: #fecaca; background: #fef2f2; }
        .dp-widget-chart { border-color: #fed7aa; background: #fff7ed; }
        .dp-widget-goal { border-color: #c7d2fe; background: #eef2ff; }
        .dp-widget-number { border-color: #e5e7eb; background: #f9fafb; }
        .dp-widget-percentage { border-color: #bfdbfe; background: #eff6ff; }
        .dp-widget-progress { border-color: #e5e7eb; background: #f9fafb; }
        .dp-widget-table { border-color: #e5e7eb; background: #f9fafb; }
        .dp-widget-ranking { border-color: #bfdbfe; background: #eff6ff; }
        .dp-widget-default { border-color: #e5e7eb; background: #ffffff; }

        .dp-widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #ffffff;
          border-bottom: 1px solid #f3f4f6;
          flex-shrink: 0;
        }

        .dp-widget-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .dp-widget-icon {
          width: 16px;
          height: 16px;
          color: #3b82f6;
          flex-shrink: 0;
        }

        .dp-widget-name {
          font-size: 13px;
          font-weight: 500;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dp-widget-type {
          font-size: 10px;
          color: #9ca3af;
          text-transform: capitalize;
          flex-shrink: 0;
        }

        .dp-widget-body {
          flex: 1;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
        }

        .dp-widget-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #9ca3af;
        }

        .dp-widget-placeholder .dp-widget-icon {
          width: 32px;
          height: 32px;
          color: #d1d5db;
        }

        .dp-widget-placeholder-text {
          font-size: 14px;
          font-weight: 500;
        }

        .dp-widget-placeholder-hint {
          font-size: 11px;
          color: #d1d5db;
        }

        /* ============================================
           KPI WIDGET
           ============================================ */
        .dp-widget-kpi-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          text-align: center;
        }

        .dp-kpi-value {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
        }

        .dp-kpi-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 500;
          margin-top: 4px;
        }

        .dp-kpi-up { color: #22c55e; }
        .dp-kpi-down { color: #ef4444; }

        .dp-kpi-change-icon {
          width: 16px;
          height: 16px;
        }

        .dp-kpi-label {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        /* ============================================
           TASK WIDGET
           ============================================ */
        .dp-widget-task-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .dp-task-stats {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
        }

        .dp-task-stat {
          text-align: center;
          padding: 8px;
          background: #ffffff;
          border-radius: 6px;
          border: 1px solid #f3f4f6;
        }

        .dp-task-stat-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }

        .dp-task-stat-label {
          font-size: 11px;
          color: #6b7280;
        }

        .dp-task-progress {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dp-task-progress-bar {
          height: 6px;
          background: #f3f4f6;
          border-radius: 9999px;
          overflow: hidden;
        }

        .dp-task-progress-fill {
          height: 100%;
          background: #3b82f6;
          border-radius: 9999px;
          transition: width 0.6s ease;
        }

        .dp-task-progress-label {
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }

        /* ============================================
           RANKING WIDGET
           ============================================ */
        .dp-widget-ranking-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }

        .dp-ranking-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 8px;
          background: #ffffff;
          border-radius: 4px;
          border: 1px solid #f3f4f6;
        }

        .dp-ranking-position {
          width: 24px;
          height: 24px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
        }

        .dp-ranking-name {
          flex: 1;
          font-size: 13px;
          color: #111827;
        }

        .dp-ranking-score {
          font-size: 13px;
          font-weight: 600;
          color: #3b82f6;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .dp-empty {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .dp-empty-icon {
          width: 48px;
          height: 48px;
          color: #d1d5db;
          margin-bottom: 12px;
        }

        .dp-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .dp-empty-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }

        /* ============================================
           ZOOM CONTROLS
           ============================================ */
        .dp-zoom-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
          padding: 8px 16px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
        }

        .dp-zoom-btn {
          padding: 4px 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dp-zoom-btn:hover {
          background: #f3f4f6;
        }

        .dp-zoom-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .dp-zoom-label {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          min-width: 48px;
          text-align: center;
        }

        .dp-zoom-reset {
          padding: 4px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 13px;
          color: #6b7280;
        }

        .dp-zoom-reset:hover {
          background: #f3f4f6;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .dp-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .dp-col-span-1,
          .dp-col-span-2,
          .dp-col-span-3,
          .dp-col-span-4,
          .dp-col-span-5,
          .dp-col-span-6 {
            grid-column: span 1;
          }
        }

        @media (max-width: 768px) {
          .dp-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .dp-header-right {
            width: 100%;
          }

          .dp-grid {
            grid-template-columns: 1fr 1fr;
          }
          .dp-col-span-1,
          .dp-col-span-2,
          .dp-col-span-3,
          .dp-col-span-4,
          .dp-col-span-5,
          .dp-col-span-6 {
            grid-column: span 1;
          }

          .dp-info-grid {
            grid-template-columns: 1fr 1fr;
          }

          .dp-stats {
            grid-template-columns: 1fr 1fr;
          }

          .dp-task-stats {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .dp-grid {
            grid-template-columns: 1fr;
          }

          .dp-header-right {
            flex-wrap: wrap;
          }

          .dp-info-grid {
            grid-template-columns: 1fr;
          }

          .dp-stats {
            grid-template-columns: 1fr;
          }

          .dp-zoom-controls {
            flex-wrap: wrap;
          }

          .dp-title {
            font-size: 20px;
          }
        }

        /* Print styles */
        @media print {
          .dp-header,
          .dp-info,
          .dp-stats,
          .dp-zoom-controls {
            display: none !important;
          }
          .dp-container {
            padding: 0 !important;
          }
          .dp-grid {
            transform: scale(1) !important;
          }
          .dp-widget {
            border-color: #d1d5db !important;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPreview;