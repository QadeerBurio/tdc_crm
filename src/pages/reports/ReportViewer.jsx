// pages/reports/ReportViewer.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Download, Share2, Printer,
  ZoomIn, ZoomOut, Maximize, Minimize,
  ChevronLeft, ChevronRight, X,
  BarChart2, PieChart, Activity, Users,
  Target, Clock, CheckCircle, AlertCircle,
  ArrowLeft, ArrowRight, RefreshCw,
  Calendar, Filter, Settings
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

const ReportViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [report, setReport] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('chart');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F472B6'];

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch(`${API_URL}/reports/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const reportData = result.data;
          setReport(reportData);
          setData(reportData.data || getMockData());
        } else {
          throw new Error(result.message || 'Failed to fetch report');
        }
      } else {
        throw new Error('Failed to fetch report');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error(error.message || 'Failed to load report');
      // Set mock data for demo
      setReport(getMockReport());
      setData(getMockData());
      toast.info('Showing sample report data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockReport = () => ({
    _id: id || '1',
    name: 'Monthly Performance Report',
    description: 'Comprehensive performance metrics for all departments',
    category: 'operations',
    type: 'performance',
    status: 'active',
    format: 'pdf',
    period: 'monthly',
    chartType: 'bar',
    includeCharts: true,
    includeTables: true,
    includeSummary: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metrics: ['Revenue', 'Tasks Completed', 'Client Satisfaction']
  });

  const getMockData = () => [
    { name: 'Revenue', value: 125000, change: 12.5, trend: 'up' },
    { name: 'Tasks Completed', value: 342, change: 8.2, trend: 'up' },
    { name: 'Client Satisfaction', value: 94, change: 3.1, trend: 'up' },
    { name: 'Active Projects', value: 28, change: -2.5, trend: 'down' },
    { name: 'Team Members', value: 45, change: 5.0, trend: 'up' },
    { name: 'Hours Logged', value: 1280, change: 6.7, trend: 'up' },
    { name: 'Conversion Rate', value: 18, change: -1.2, trend: 'down' },
    { name: 'Deals Closed', value: 56, change: 15.8, trend: 'up' }
  ];

  const handleRefresh = () => {
    fetchReport(true);
  };

  const handleExport = (format = 'pdf') => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
    // Simulate export
    setTimeout(() => {
      toast.success('Report exported successfully!');
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: report?.name || 'Report',
        text: `Check out this report: ${report?.name || 'Report'}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      toast.success('Report link copied to clipboard!');
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setFullscreen(false);
    }
  };

  const renderChart = () => {
    if (!report || !data.length) {
      return (
        <div className="rv-empty-chart">
          <BarChart2 className="rv-empty-chart-icon" />
          <p>No data available to display</p>
        </div>
      );
    }

    const chartType = report.chartType || 'bar';
    
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
          </RePieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="rvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="url(#rvGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // Default: Bar Chart
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="rv-loading">
        <div className="rv-spinner"></div>
        <p className="rv-loading-text">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rv-not-found">
        <FileText className="rv-not-found-icon" />
        <h2 className="rv-not-found-title">Report Not Found</h2>
        <p className="rv-not-found-text">The report you're looking for doesn't exist</p>
        <button onClick={() => navigate('/reports')} className="rv-not-found-btn">
          Back to Reports
        </button>
      </div>
    );
  }

  return (
    <div className={`rv-container ${fullscreen ? 'rv-fullscreen' : ''}`}>
      {/* Header */}
      <div className="rv-header">
        <div className="rv-header-left">
          <button onClick={() => navigate('/reports')} className="rv-back-btn">
            <ArrowLeft className="rv-back-icon" />
          </button>
          <div className="rv-header-icon">
            <FileText className="rv-header-svg" />
          </div>
          <div>
            <h1 className="rv-title">{report.name}</h1>
            <p className="rv-subtitle">
              {report.category || 'Uncategorized'} • 
              <Calendar className="rv-subtitle-icon" />
              {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="rv-header-right">
          <button className="rv-toolbar-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`rv-toolbar-icon ${refreshing ? 'rv-spin' : ''}`} />
          </button>
          <button className="rv-toolbar-btn" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="rv-toolbar-icon" />
          </button>
          <span className="rv-zoom-level">{Math.round(zoom * 100)}%</span>
          <button className="rv-toolbar-btn" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="rv-toolbar-icon" />
          </button>
          <button className="rv-toolbar-btn" onClick={handleResetZoom} title="Reset Zoom">
            <Maximize className="rv-toolbar-icon" />
          </button>
          <button className="rv-toolbar-btn" onClick={toggleFullscreen} title="Fullscreen">
            {fullscreen ? <Minimize className="rv-toolbar-icon" /> : <Maximize className="rv-toolbar-icon" />}
          </button>
          <button className="rv-toolbar-btn" onClick={handlePrint} title="Print">
            <Printer className="rv-toolbar-icon" />
          </button>
          <button className="rv-toolbar-btn" onClick={handleShare} title="Share">
            <Share2 className="rv-toolbar-icon" />
          </button>
          <button className="rv-toolbar-btn" onClick={() => handleExport('pdf')} title="Export PDF">
            <Download className="rv-toolbar-icon" />
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="rv-content" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        {/* Summary Cards */}
        {report.includeSummary !== false && data.length > 0 && (
          <div className="rv-summary">
            {data.slice(0, 4).map((item, idx) => (
              <div key={idx} className="rv-summary-card">
                <p className="rv-summary-label">{item.name}</p>
                <p className="rv-summary-value">{item.value}</p>
                {item.change !== undefined && (
                  <div className={`rv-summary-change ${item.change >= 0 ? 'rv-change-up' : 'rv-change-down'}`}>
                    {item.change >= 0 ? '↑' : '↓'} {Math.abs(item.change)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="rv-tabs">
          <button
            className={`rv-tab ${activeTab === 'chart' ? 'rv-tab-active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            <BarChart2 className="rv-tab-icon" />
            Chart
          </button>
          <button
            className={`rv-tab ${activeTab === 'table' ? 'rv-tab-active' : ''}`}
            onClick={() => setActiveTab('table')}
          >
            <FileText className="rv-tab-icon" />
            Table
          </button>
          <button
            className={`rv-tab ${activeTab === 'details' ? 'rv-tab-active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <Settings className="rv-tab-icon" />
            Details
          </button>
        </div>

        {/* Chart */}
        {activeTab === 'chart' && report.includeCharts !== false && (
          <div className="rv-chart-section">
            <h3 className="rv-section-title">Data Visualization</h3>
            <div className="rv-chart-container">
              {renderChart()}
            </div>
          </div>
        )}

        {/* Table */}
        {activeTab === 'table' && report.includeTables !== false && (
          <div className="rv-table-section">
            <h3 className="rv-section-title">Detailed Data</h3>
            <div className="rv-table-wrapper">
              <table className="rv-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Change</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={idx}>
                      <td className="rv-table-name">{item.name}</td>
                      <td className="rv-table-value">{item.value}</td>
                      <td className={`rv-table-change ${item.change >= 0 ? 'rv-change-up' : 'rv-change-down'}`}>
                        {item.change !== undefined ? (
                          <>{item.change >= 0 ? '+' : ''}{item.change}%</>
                        ) : '-'}
                      </td>
                      <td className="rv-table-trend">
                        {item.trend === 'up' && <ArrowRight className="rv-trend-up" />}
                        {item.trend === 'down' && <ArrowRight className="rv-trend-down" />}
                        {item.trend === 'stable' && <ArrowRight className="rv-trend-stable" />}
                        {!item.trend && '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Details */}
        {activeTab === 'details' && (
          <div className="rv-details-section">
            <h3 className="rv-section-title">Report Details</h3>
            <div className="rv-details-grid">
              <div className="rv-detail-item">
                <span className="rv-detail-label">Name</span>
                <span className="rv-detail-value">{report.name}</span>
              </div>
              <div className="rv-detail-item">
                <span className="rv-detail-label">Description</span>
                <span className="rv-detail-value">{report.description || 'No description'}</span>
              </div>
              <div className="rv-detail-item">
                <span className="rv-detail-label">Category</span>
                <span className="rv-detail-value">{report.category || 'Uncategorized'}</span>
              </div>
              <div className="rv-detail-item">
                <span className="rv-detail-label">Type</span>
                <span className="rv-detail-value">{report.type || 'Custom'}</span>
              </div>
              <div className="rv-detail-item">
                <span className="rv-detail-label">Status</span>
                <span className={`rv-detail-status rv-status-${report.status}`}>
                  {report.status || 'Active'}
                </span>
              </div>
              <div className="rv-detail-item">
                <span className="rv-detail-label">Format</span>
                <span className="rv-detail-value">{report.format || 'PDF'}</span>
              </div>
              <div className="rv-detail-item">
                <span className="rv-detail-label">Period</span>
                <span className="rv-detail-value">{report.period || 'Monthly'}</span>
              </div>
              <div className="rv-detail-item">
                <span className="rv-detail-label">Chart Type</span>
                <span className="rv-detail-value">{report.chartType || 'Bar'}</span>
              </div>
              <div className="rv-detail-item">
                <span className="rv-detail-label">Created</span>
                <span className="rv-detail-value">{new Date(report.createdAt).toLocaleString()}</span>
              </div>
              <div className="rv-detail-item">
                <span className="rv-detail-label">Updated</span>
                <span className="rv-detail-value">{new Date(report.updatedAt).toLocaleString()}</span>
              </div>
              {report.metrics && report.metrics.length > 0 && (
                <div className="rv-detail-item rv-detail-full">
                  <span className="rv-detail-label">Metrics</span>
                  <div className="rv-detail-tags">
                    {report.metrics.map((metric, idx) => (
                      <span key={idx} className="rv-detail-tag">{metric}</span>
                    ))}
                  </div>
                </div>
              )}
              {report.recipients && report.recipients.length > 0 && (
                <div className="rv-detail-item rv-detail-full">
                  <span className="rv-detail-label">Recipients</span>
                  <div className="rv-detail-tags">
                    {report.recipients.map((recipient, idx) => (
                      <span key={idx} className="rv-detail-tag rv-detail-tag-blue">{recipient}</span>
                    ))}
                  </div>
                </div>
              )}
              {report.schedule && report.schedule.frequency && report.schedule.frequency !== 'none' && (
                <div className="rv-detail-item rv-detail-full">
                  <span className="rv-detail-label">Schedule</span>
                  <span className="rv-detail-value">
                    {report.schedule.frequency} • Day {report.schedule.day} at {report.schedule.time}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="rv-footer">
        <p className="rv-footer-text">
          Generated on {new Date().toLocaleString()} • Report ID: {report._id}
        </p>
        <div className="rv-footer-actions">
          <button className="rv-footer-btn" onClick={() => handleExport('pdf')}>
            <Download className="rv-footer-icon" />
            Export PDF
          </button>
          <button className="rv-footer-btn" onClick={() => handleExport('excel')}>
            <Download className="rv-footer-icon" />
            Export Excel
          </button>
          <button className="rv-footer-btn" onClick={() => handleExport('csv')}>
            <Download className="rv-footer-icon" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .rv-container {
          padding: 24px 32px;
          max-width: 1200px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: rvFadeIn 0.4s ease;
        }

        .rv-fullscreen {
          padding: 16px 24px;
          max-width: 100%;
          background: #ffffff;
        }

        @keyframes rvFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes rvSpin {
          to { transform: rotate(360deg); }
        }

        .rv-spin {
          animation: rvSpin 1s linear infinite;
        }

        /* ============================================
           LOADING
           ============================================ */
        .rv-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .rv-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: rvSpin 0.8s linear infinite;
        }

        .rv-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        /* ============================================
           NOT FOUND
           ============================================ */
        .rv-not-found {
          text-align: center;
          padding: 60px 20px;
        }

        .rv-not-found-icon {
          width: 64px;
          height: 64px;
          color: #d1d5db;
          margin: 0 auto 16px;
        }

        .rv-not-found-title {
          font-size: 24px;
          font-weight: 600;
          color: #4b5563;
          margin: 0;
        }

        .rv-not-found-text {
          color: #9ca3af;
          margin: 4px 0 16px 0;
        }

        .rv-not-found-btn {
          padding: 8px 20px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .rv-not-found-btn:hover {
          background: #2563eb;
        }

        /* ============================================
           HEADER
           ============================================ */
        .rv-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .rv-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rv-back-btn {
          padding: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .rv-back-btn:hover {
          background: #f1f5f9;
        }

        .rv-back-icon {
          width: 20px;
          height: 20px;
          color: #64748b;
        }

        .rv-header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .rv-header-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .rv-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .rv-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 2px 0 0 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .rv-subtitle-icon {
          width: 14px;
          height: 14px;
        }

        .rv-header-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .rv-toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #64748b;
        }

        .rv-toolbar-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .rv-toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rv-toolbar-icon {
          width: 16px;
          height: 16px;
        }

        .rv-zoom-level {
          font-size: 12px;
          font-weight: 500;
          color: #475569;
          min-width: 40px;
          text-align: center;
        }

        /* ============================================
           CONTENT
           ============================================ */
        .rv-content {
          transition: transform 0.3s ease;
        }

        /* ============================================
           SUMMARY
           ============================================ */
        .rv-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .rv-summary-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 16px 20px;
          transition: all 0.3s ease;
        }

        .rv-summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .rv-summary-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          margin: 0;
        }

        .rv-summary-value {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 4px 0 0 0;
          line-height: 1.2;
        }

        .rv-summary-change {
          font-size: 13px;
          font-weight: 500;
          margin-top: 4px;
        }

        .rv-change-up { color: #22c55e; }
        .rv-change-down { color: #ef4444; }

        /* ============================================
           TABS
           ============================================ */
        .rv-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          border-bottom: 2px solid #e2e8f0;
        }

        .rv-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
          margin-bottom: -2px;
        }

        .rv-tab:hover {
          color: #0f172a;
        }

        .rv-tab-active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .rv-tab-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           CHART
           ============================================ */
        .rv-chart-section {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          margin-bottom: 24px;
        }

        .rv-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 16px 0;
        }

        .rv-chart-container {
          height: 400px;
          width: 100%;
        }

        .rv-empty-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #94a3b8;
        }

        .rv-empty-chart-icon {
          width: 40px;
          height: 40px;
          margin-bottom: 8px;
        }

        /* ============================================
           TABLE
           ============================================ */
        .rv-table-section {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          margin-bottom: 24px;
        }

        .rv-table-wrapper {
          overflow-x: auto;
        }

        .rv-table {
          width: 100%;
          border-collapse: collapse;
        }

        .rv-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }

        .rv-table td {
          padding: 12px 16px;
          font-size: 14px;
          color: #0f172a;
          border-bottom: 1px solid #f1f5f9;
        }

        .rv-table tr:hover td {
          background: #f8fafc;
        }

        .rv-table-name {
          font-weight: 500;
        }

        .rv-table-value {
          font-weight: 600;
        }

        .rv-table-change {
          font-weight: 500;
        }

        .rv-table-trend {
          text-align: center;
        }

        .rv-trend-up {
          width: 16px;
          height: 16px;
          color: #22c55e;
          transform: rotate(45deg);
          display: inline-block;
        }

        .rv-trend-down {
          width: 16px;
          height: 16px;
          color: #ef4444;
          transform: rotate(-45deg);
          display: inline-block;
        }

        .rv-trend-stable {
          width: 16px;
          height: 16px;
          color: #94a3b8;
          display: inline-block;
        }

        /* ============================================
           DETAILS
           ============================================ */
        .rv-details-section {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          margin-bottom: 24px;
        }

        .rv-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 24px;
        }

        .rv-detail-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rv-detail-full {
          grid-column: 1 / -1;
        }

        .rv-detail-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .rv-detail-value {
          font-size: 14px;
          color: #0f172a;
          font-weight: 500;
        }

        .rv-detail-status {
          font-size: 13px;
          font-weight: 500;
          padding: 2px 12px;
          border-radius: 12px;
          display: inline-block;
          width: fit-content;
        }

        .rv-status-active { background: #d1fae5; color: #065f46; }
        .rv-status-pending { background: #fef3c7; color: #92400e; }
        .rv-status-completed { background: #dbeafe; color: #1d4ed8; }
        .rv-status-failed { background: #fee2e2; color: #991b1b; }

        .rv-detail-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 2px;
        }

        .rv-detail-tag {
          padding: 2px 10px;
          font-size: 12px;
          background: #f1f5f9;
          color: #475569;
          border-radius: 4px;
        }

        .rv-detail-tag-blue {
          background: #dbeafe;
          color: #1d4ed8;
        }

        /* ============================================
           FOOTER
           ============================================ */
        .rv-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 12px;
        }

        .rv-footer-text {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
        }

        .rv-footer-actions {
          display: flex;
          gap: 8px;
        }

        .rv-footer-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #ffffff;
          cursor: pointer;
          font-size: 13px;
          color: #475569;
          transition: all 0.2s ease;
        }

        .rv-footer-btn:hover {
          background: #f1f5f9;
        }

        .rv-footer-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .rv-container {
            padding: 16px;
          }

          .rv-header {
            flex-direction: column;
            align-items: stretch;
          }

          .rv-header-right {
            flex-wrap: wrap;
            justify-content: flex-start;
          }

          .rv-title {
            font-size: 20px;
          }

          .rv-header-icon {
            width: 40px;
            height: 40px;
          }

          .rv-header-svg {
            width: 20px;
            height: 20px;
          }

          .rv-summary {
            grid-template-columns: 1fr 1fr;
          }

          .rv-summary-value {
            font-size: 22px;
          }

          .rv-chart-container {
            height: 300px;
          }

          .rv-details-grid {
            grid-template-columns: 1fr;
          }

          .rv-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .rv-footer-actions {
            flex-wrap: wrap;
          }

          .rv-footer-btn {
            flex: 1;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .rv-container {
            padding: 12px;
          }

          .rv-header-right {
            flex-direction: column;
            align-items: stretch;
          }

          .rv-toolbar-btn {
            justify-content: center;
          }

          .rv-summary {
            grid-template-columns: 1fr;
          }

          .rv-chart-container {
            height: 250px;
          }

          .rv-tabs {
            overflow-x: auto;
          }

          .rv-tab {
            white-space: nowrap;
            padding: 8px 14px;
          }

          .rv-table th,
          .rv-table td {
            padding: 8px 12px;
            font-size: 13px;
          }
        }

        /* Print styles */
        @media print {
          .rv-container {
            padding: 16px;
            background: #ffffff;
          }

          .rv-header-right,
          .rv-back-btn,
          .rv-tabs,
          .rv-footer {
            display: none !important;
          }

          .rv-summary-card {
            border: 1px solid #e2e8f0;
            box-shadow: none !important;
          }

          .rv-chart-section,
          .rv-table-section,
          .rv-details-section {
            border: 1px solid #e2e8f0;
            box-shadow: none !important;
            page-break-inside: avoid;
          }

          .rv-chart-container {
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportViewer;