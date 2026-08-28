// pages/builder/Builder.jsx - COMPLETE MODERN VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Layout, Plus, Save, X, Edit, Trash2,
  Copy, Eye, RefreshCw, Grid, List,
  Maximize, Minimize, Settings,
  GripVertical, ChevronDown, ChevronRight,
  BarChart2, PieChart, Activity, Users,
  Target, Clock, CheckCircle, AlertCircle,
  Download, Share2, Printer
} from 'lucide-react';
import toast from 'react-hot-toast';

const Builder = () => {
  const { token } = useAuth();
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('edit');
  const [layout, setLayout] = useState([]);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [dashboardConfig, setDashboardConfig] = useState({
    name: '',
    description: '',
    audience: 'all',
    segmentId: '',
    departmentId: '',
    teamId: '',
    userId: '',
    isDefault: false,
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/dashboards`, getHeaders());
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        setDashboards(Array.isArray(data) ? data : []);
        
        if (data.length > 0) {
          selectDashboard(data[0]._id, data);
        }
      } else {
        // Use mock data
        setDashboards(getMockDashboards());
        toast.info('Showing sample dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      setDashboards(getMockDashboards());
      toast.error('Failed to load dashboards, showing sample');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockDashboards = () => {
    return [
      {
        _id: '1',
        name: 'Executive Dashboard',
        description: 'High-level overview for executives',
        audience: 'all',
        isDefault: true,
        isActive: true,
        widgets: [
          {
            id: 'widget-1',
            widgetId: 'kpi_1',
            name: 'Total Revenue',
            type: 'kpi_card',
            position: { x: 0, y: 0, w: 4, h: 3 },
            config: { metric: 'revenue', period: 'monthly' }
          },
          {
            id: 'widget-2',
            widgetId: 'kpi_2',
            name: 'Active Users',
            type: 'kpi_card',
            position: { x: 4, y: 0, w: 4, h: 3 },
            config: { metric: 'users', period: 'monthly' }
          },
          {
            id: 'widget-3',
            widgetId: 'chart_1',
            name: 'Revenue Trend',
            type: 'performance_chart',
            position: { x: 0, y: 3, w: 8, h: 4 },
            config: { chartType: 'line', metric: 'revenue' }
          }
        ]
      },
      {
        _id: '2',
        name: 'Operations Dashboard',
        description: 'Operational metrics and KPIs',
        audience: 'department',
        isDefault: false,
        isActive: true,
        widgets: [
          {
            id: 'widget-4',
            widgetId: 'kpi_3',
            name: 'Task Completion Rate',
            type: 'percentage',
            position: { x: 0, y: 0, w: 4, h: 3 },
            config: { metric: 'task_completion' }
          }
        ]
      }
    ];
  };

  const selectDashboard = (id, dashboardsList = null) => {
    const list = dashboardsList || dashboards;
    const dashboard = list.find(d => d._id === id);
    if (dashboard) {
      setSelectedDashboard(dashboard);
      setLayout(dashboard.widgets || []);
      setDashboardConfig({
        name: dashboard.name || '',
        description: dashboard.description || '',
        audience: dashboard.audience || 'all',
        segmentId: dashboard.segmentId || '',
        departmentId: dashboard.departmentId || '',
        teamId: dashboard.teamId || '',
        userId: dashboard.userId || '',
        isDefault: dashboard.isDefault || false,
        isActive: dashboard.isActive !== undefined ? dashboard.isActive : true
      });
    }
  };

  const handleSave = async () => {
    if (!dashboardConfig.name.trim()) {
      toast.error('Dashboard name is required');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...dashboardConfig,
        widgets: layout
      };
      
      const url = selectedDashboard 
        ? `${API_URL}/dashboards/${selectedDashboard._id}` 
        : `${API_URL}/dashboards`;
      const method = selectedDashboard ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          ...getHeaders().headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        toast.success(selectedDashboard ? 'Dashboard updated!' : 'Dashboard created!');
        fetchDashboards();
      } else {
        throw new Error('Failed to save dashboard');
      }
    } catch (error) {
      console.error('Error saving dashboard:', error);
      toast.error('Failed to save dashboard');
    } finally {
      setSaving(false);
    }
  };

  const addWidget = (widget) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      widgetId: widget._id || `widget-${Date.now()}`,
      name: widget.name,
      type: widget.type,
      position: {
        x: layout.length % 2 === 0 ? 0 : 6,
        y: Math.floor(layout.length / 2) * 2,
        w: 6,
        h: 4
      },
      config: widget.defaultConfig || {}
    };
    setLayout([...layout, newWidget]);
    setShowWidgetLibrary(false);
    toast.success(`Added "${widget.name}" widget`);
  };

  const removeWidget = (id) => {
    if (!window.confirm('Are you sure you want to remove this widget?')) return;
    setLayout(layout.filter(w => w.id !== id));
    toast.success('Widget removed');
  };

  const updateWidgetConfig = (id, config) => {
    setLayout(layout.map(w => 
      w.id === id ? { ...w, config: { ...w.config, ...config } } : w
    ));
    setShowWidgetConfig(false);
    setEditingWidget(null);
    toast.success('Widget updated');
  };

  const duplicateWidget = (id) => {
    const widget = layout.find(w => w.id === id);
    if (widget) {
      const newWidget = {
        ...widget,
        id: `widget-${Date.now()}`,
        position: {
          ...widget.position,
          x: Math.min(widget.position.x + 2, 10),
          y: widget.position.y + 2
        }
      };
      setLayout([...layout, newWidget]);
      toast.success('Widget duplicated');
    }
  };

  const handleDeleteDashboard = async () => {
    if (!selectedDashboard) return;
    if (!window.confirm(`Are you sure you want to delete "${selectedDashboard.name}"?`)) return;
    
    try {
      const response = await fetch(`${API_URL}/dashboards/${selectedDashboard._id}`, {
        method: 'DELETE',
        ...getHeaders()
      });
      
      if (response.ok) {
        toast.success('Dashboard deleted');
        setSelectedDashboard(null);
        setLayout([]);
        fetchDashboards();
      } else {
        throw new Error('Failed to delete dashboard');
      }
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      toast.error('Failed to delete dashboard');
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
      'revenue_chart': BarChart2,
      'user_activity': Activity
    };
    const Icon = icons[type] || Layout;
    return <Icon className="b-widget-icon" />;
  };

  const getWidgetSize = (widget) => {
    const sizeMap = {
      2: 'b-col-span-1',
      4: 'b-col-span-2',
      6: 'b-col-span-3',
      8: 'b-col-span-4',
      10: 'b-col-span-5',
      12: 'b-col-span-6'
    };
    return sizeMap[widget.position?.w] || 'b-col-span-3';
  };

  const mockWidgetLibrary = [
    { _id: 'w1', name: 'KPI Card', type: 'kpi_card', defaultConfig: { metric: 'revenue' } },
    { _id: 'w2', name: 'Task Status', type: 'task_status', defaultConfig: {} },
    { _id: 'w3', name: 'Activity Feed', type: 'activity_feed', defaultConfig: { limit: 10 } },
    { _id: 'w4', name: 'Risk List', type: 'risk_list', defaultConfig: {} },
    { _id: 'w5', name: 'Performance Chart', type: 'performance_chart', defaultConfig: { chartType: 'bar' } },
    { _id: 'w6', name: 'Goal Progress', type: 'goal_progress', defaultConfig: {} },
    { _id: 'w7', name: 'Number Widget', type: 'number', defaultConfig: { value: 0 } },
    { _id: 'w8', name: 'Percentage Widget', type: 'percentage', defaultConfig: { value: 0 } },
    { _id: 'w9', name: 'Employee Ranking', type: 'employee_ranking', defaultConfig: { limit: 5 } },
    { _id: 'w10', name: 'Team Ranking', type: 'team_ranking', defaultConfig: { limit: 5 } }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboards();
    toast.success('Refreshed');
  };

  if (loading) {
    return (
      <div className="b-loading">
        <div className="b-spinner"></div>
        <p className="b-loading-text">Loading dashboards...</p>
      </div>
    );
  }

  return (
    <div className="b-container">
      {/* Header */}
      <div className="b-header">
        <div className="b-header-left">
          <h1 className="b-title">
            <Layout className="b-title-icon" />
            Dashboard Builder
          </h1>
          <p className="b-subtitle">Create and customize your dashboards</p>
        </div>
        <div className="b-header-right">
          <select
            value={selectedDashboard?._id || ''}
            onChange={(e) => selectDashboard(e.target.value)}
            className="b-select"
          >
            <option value="">Select Dashboard</option>
            {dashboards.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="b-refresh-btn"
          >
            <RefreshCw className={`b-refresh-icon ${refreshing ? 'b-spin' : ''}`} />
          </button>

          <div className="b-view-toggle">
            <button
              onClick={() => setViewMode('edit')}
              className={`b-view-btn ${viewMode === 'edit' ? 'b-view-active' : ''}`}
              title="Edit Mode"
            >
              <Edit className="b-view-icon" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`b-view-btn ${viewMode === 'preview' ? 'b-view-active' : ''}`}
              title="Preview Mode"
            >
              <Eye className="b-view-icon" />
            </button>
          </div>

          <button
            onClick={() => setShowWidgetLibrary(true)}
            className="b-add-widget-btn"
          >
            <Plus className="b-btn-icon" />
            Add Widget
          </button>

          {selectedDashboard && (
            <button
              onClick={handleDeleteDashboard}
              className="b-delete-btn"
              title="Delete Dashboard"
            >
              <Trash2 className="b-btn-icon" />
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="b-save-btn"
          >
            {saving ? (
              <>
                <div className="b-save-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="b-btn-icon" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dashboard Config */}
      <div className="b-config">
        <div className="b-config-grid">
          <div className="b-config-group">
            <label className="b-config-label">Dashboard Name</label>
            <input
              type="text"
              value={dashboardConfig.name}
              onChange={(e) => setDashboardConfig(prev => ({ ...prev, name: e.target.value }))}
              className="b-config-input"
              placeholder="My Dashboard"
            />
          </div>
          <div className="b-config-group">
            <label className="b-config-label">Description</label>
            <input
              type="text"
              value={dashboardConfig.description}
              onChange={(e) => setDashboardConfig(prev => ({ ...prev, description: e.target.value }))}
              className="b-config-input"
              placeholder="Dashboard description"
            />
          </div>
          <div className="b-config-group">
            <label className="b-config-label">Audience</label>
            <select
              value={dashboardConfig.audience}
              onChange={(e) => setDashboardConfig(prev => ({ ...prev, audience: e.target.value }))}
              className="b-config-select"
            >
              <option value="all">Company Wide</option>
              <option value="segment">Segment</option>
              <option value="department">Department</option>
              <option value="team">Team</option>
              <option value="individual">Individual</option>
            </select>
          </div>
        </div>
        <div className="b-config-actions">
          <label className="b-config-checkbox">
            <input
              type="checkbox"
              checked={dashboardConfig.isDefault}
              onChange={(e) => setDashboardConfig(prev => ({ ...prev, isDefault: e.target.checked }))}
            />
            <span>Default</span>
          </label>
          <label className="b-config-checkbox">
            <input
              type="checkbox"
              checked={dashboardConfig.isActive}
              onChange={(e) => setDashboardConfig(prev => ({ ...prev, isActive: e.target.checked }))}
            />
            <span>Active</span>
          </label>
        </div>
      </div>

      {/* Widget Stats */}
      <div className="b-stats">
        <div className="b-stat-card">
          <span className="b-stat-label">Total Widgets</span>
          <span className="b-stat-value">{layout.length}</span>
        </div>
        <div className="b-stat-card">
          <span className="b-stat-label">Widget Types</span>
          <span className="b-stat-value">
            {new Set(layout.map(w => w.type)).size}
          </span>
        </div>
        <div className="b-stat-card">
          <span className="b-stat-label">Status</span>
          <span className={`b-stat-value ${selectedDashboard?.isActive ? 'b-stat-active' : 'b-stat-inactive'}`}>
            {selectedDashboard?.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Layout Editor */}
      {viewMode === 'edit' ? (
        <div className="b-editor">
          <div className="b-editor-grid">
            {layout.map((widget) => (
              <div
                key={widget.id}
                className={`${getWidgetSize(widget)} b-widget`}
              >
                <div className="b-widget-header">
                  <div className="b-widget-header-left">
                    <GripVertical className="b-widget-grip" />
                    {getWidgetIcon(widget.type)}
                    <span className="b-widget-name">{widget.name}</span>
                  </div>
                  <div className="b-widget-actions">
                    <button 
                      className="b-widget-action"
                      onClick={() => {
                        setEditingWidget(widget);
                        setShowWidgetConfig(true);
                      }}
                      title="Configure"
                    >
                      <Settings className="b-widget-action-icon" />
                    </button>
                    <button 
                      className="b-widget-action"
                      onClick={() => duplicateWidget(widget.id)}
                      title="Duplicate"
                    >
                      <Copy className="b-widget-action-icon" />
                    </button>
                    <button 
                      className="b-widget-action b-widget-action-delete"
                      onClick={() => removeWidget(widget.id)}
                      title="Remove"
                    >
                      <Trash2 className="b-widget-action-icon" />
                    </button>
                  </div>
                </div>
                <div className="b-widget-body">
                  <div className="b-widget-preview">
                    {getWidgetIcon(widget.type)}
                    <span className="b-widget-preview-text">{widget.name}</span>
                    <span className="b-widget-preview-hint">Click settings to configure</span>
                  </div>
                </div>
              </div>
            ))}
            
            {layout.length === 0 && (
              <div className="b-empty">
                <Layout className="b-empty-icon" />
                <h3 className="b-empty-title">No widgets added yet</h3>
                <p className="b-empty-subtitle">Click "Add Widget" to start building your dashboard</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="b-preview">
          <div className="b-preview-grid">
            {layout.map((widget) => (
              <div key={widget.id} className={`${getWidgetSize(widget)} b-preview-widget`}>
                <div className="b-preview-widget-header">
                  <div className="b-preview-widget-header-left">
                    {getWidgetIcon(widget.type)}
                    <span className="b-preview-widget-name">{widget.name}</span>
                  </div>
                </div>
                <div className="b-preview-widget-body">
                  <div className="b-preview-widget-content">
                    {getWidgetIcon(widget.type)}
                    <span className="b-preview-widget-text">Widget Preview</span>
                  </div>
                </div>
              </div>
            ))}
            {layout.length === 0 && (
              <div className="b-empty b-preview-empty">
                <Layout className="b-empty-icon" />
                <h3 className="b-empty-title">No widgets to preview</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Widget Library Modal */}
      {showWidgetLibrary && (
        <div className="b-modal-overlay" onClick={() => setShowWidgetLibrary(false)}>
          <div className="b-modal" onClick={(e) => e.stopPropagation()}>
            <div className="b-modal-header">
              <h3 className="b-modal-title">Add Widget</h3>
              <button className="b-modal-close" onClick={() => setShowWidgetLibrary(false)}>
                <X className="b-modal-close-icon" />
              </button>
            </div>
            <div className="b-modal-body">
              <div className="b-widget-library">
                {mockWidgetLibrary.map((widget) => (
                  <div
                    key={widget._id}
                    className="b-library-item"
                    onClick={() => addWidget(widget)}
                  >
                    <div className="b-library-item-icon">
                      {getWidgetIcon(widget.type)}
                    </div>
                    <div className="b-library-item-content">
                      <h4 className="b-library-item-name">{widget.name}</h4>
                      <p className="b-library-item-type">{widget.type}</p>
                    </div>
                    <Plus className="b-library-item-add" />
                  </div>
                ))}
              </div>
            </div>
            <div className="b-modal-footer">
              <button className="b-modal-close-btn" onClick={() => setShowWidgetLibrary(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Widget Config Modal */}
      {showWidgetConfig && editingWidget && (
        <div className="b-modal-overlay" onClick={() => setShowWidgetConfig(false)}>
          <div className="b-modal" onClick={(e) => e.stopPropagation()}>
            <div className="b-modal-header">
              <h3 className="b-modal-title">Configure Widget</h3>
              <button className="b-modal-close" onClick={() => setShowWidgetConfig(false)}>
                <X className="b-modal-close-icon" />
              </button>
            </div>
            <div className="b-modal-body">
              <div className="b-config-form">
                <div className="b-config-group">
                  <label className="b-config-label">Widget Name</label>
                  <input
                    type="text"
                    value={editingWidget.name}
                    onChange={(e) => setEditingWidget({ ...editingWidget, name: e.target.value })}
                    className="b-config-input"
                  />
                </div>
                <div className="b-config-group">
                  <label className="b-config-label">Widget Type</label>
                  <input
                    type="text"
                    value={editingWidget.type}
                    className="b-config-input"
                    disabled
                  />
                </div>
                <div className="b-config-group">
                  <label className="b-config-label">Width (columns)</label>
                  <select
                    value={editingWidget.position?.w || 6}
                    onChange={(e) => setEditingWidget({
                      ...editingWidget,
                      position: { ...editingWidget.position, w: parseInt(e.target.value) }
                    })}
                    className="b-config-select"
                  >
                    <option value="2">2 columns</option>
                    <option value="4">4 columns</option>
                    <option value="6">6 columns</option>
                    <option value="8">8 columns</option>
                    <option value="10">10 columns</option>
                    <option value="12">12 columns</option>
                  </select>
                </div>
                <div className="b-config-group">
                  <label className="b-config-label">Height</label>
                  <select
                    value={editingWidget.position?.h || 4}
                    onChange={(e) => setEditingWidget({
                      ...editingWidget,
                      position: { ...editingWidget.position, h: parseInt(e.target.value) }
                    })}
                    className="b-config-select"
                  >
                    <option value="2">2 rows</option>
                    <option value="3">3 rows</option>
                    <option value="4">4 rows</option>
                    <option value="5">5 rows</option>
                    <option value="6">6 rows</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="b-modal-footer">
              <button 
                className="b-modal-cancel-btn" 
                onClick={() => setShowWidgetConfig(false)}
              >
                Cancel
              </button>
              <button 
                className="b-modal-save-btn"
                onClick={() => updateWidgetConfig(editingWidget.id, editingWidget.config)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .b-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .b-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .b-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .b-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           HEADER
           ============================================ */
        .b-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .b-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .b-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .b-title-icon {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }

        .b-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .b-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .b-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          min-width: 180px;
        }

        .b-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .b-refresh-btn {
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

        .b-refresh-btn:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .b-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .b-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .b-spin {
          animation: spin 0.8s linear infinite;
        }

        .b-view-toggle {
          display: flex;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          overflow: hidden;
          background: #ffffff;
        }

        .b-view-btn {
          padding: 6px 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .b-view-btn:hover {
          background: #f3f4f6;
        }

        .b-view-active {
          background: #3b82f6;
          color: #ffffff;
        }

        .b-view-active:hover {
          background: #2563eb;
        }

        .b-view-icon {
          width: 16px;
          height: 16px;
        }

        .b-btn-icon {
          width: 16px;
          height: 16px;
        }

        .b-add-widget-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .b-add-widget-btn:hover {
          background: #2563eb;
        }

        .b-delete-btn {
          padding: 8px 10px;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #fef2f2;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .b-delete-btn:hover {
          background: #fee2e2;
        }

        .b-save-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          background: #22c55e;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .b-save-btn:hover:not(:disabled) {
          background: #16a34a;
        }

        .b-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .b-save-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* ============================================
           CONFIG
           ============================================ */
        .b-config {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 16px;
        }

        .b-config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .b-config-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .b-config-grid {
            grid-template-columns: 1fr;
          }
        }

        .b-config-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .b-config-label {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .b-config-input,
        .b-config-select {
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          width: 100%;
        }

        .b-config-input:focus,
        .b-config-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .b-config-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .b-config-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
        }

        .b-config-checkbox input {
          width: 16px;
          height: 16px;
          accent-color: #3b82f6;
          cursor: pointer;
        }

        /* ============================================
           STATS
           ============================================ */
        .b-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .b-stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
        }

        .b-stat-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .b-stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-top: 2px;
        }

        .b-stat-active { color: #22c55e; }
        .b-stat-inactive { color: #ef4444; }

        /* ============================================
           EDITOR
           ============================================ */
        .b-editor {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          min-height: 400px;
        }

        .b-editor-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 16px;
        }

        .b-col-span-1 { grid-column: span 1; }
        .b-col-span-2 { grid-column: span 2; }
        .b-col-span-3 { grid-column: span 3; }
        .b-col-span-4 { grid-column: span 4; }
        .b-col-span-5 { grid-column: span 5; }
        .b-col-span-6 { grid-column: span 6; }

        .b-widget {
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          transition: all 0.2s ease;
          min-height: 150px;
          display: flex;
          flex-direction: column;
        }

        .b-widget:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .b-widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #f9fafb;
          border-radius: 8px 8px 0 0;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .b-widget-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .b-widget-grip {
          width: 14px;
          height: 14px;
          color: #9ca3af;
          cursor: grab;
        }

        .b-widget-icon {
          width: 16px;
          height: 16px;
          color: #3b82f6;
        }

        .b-widget-name {
          font-size: 13px;
          font-weight: 500;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .b-widget-actions {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }

        .b-widget-action {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }

        .b-widget-action:hover {
          background: #e5e7eb;
          color: #4b5563;
        }

        .b-widget-action-delete:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .b-widget-action-icon {
          width: 14px;
          height: 14px;
        }

        .b-widget-body {
          flex: 1;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .b-widget-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: #9ca3af;
        }

        .b-widget-preview .b-widget-icon {
          width: 32px;
          height: 32px;
          color: #9ca3af;
        }

        .b-widget-preview-text {
          font-size: 14px;
          font-weight: 500;
        }

        .b-widget-preview-hint {
          font-size: 11px;
          color: #d1d5db;
        }

        /* ============================================
           PREVIEW
           ============================================ */
        .b-preview {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          min-height: 400px;
        }

        .b-preview-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 16px;
        }

        .b-preview-widget {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          min-height: 150px;
          display: flex;
          flex-direction: column;
        }

        .b-preview-widget-header {
          display: flex;
          align-items: center;
          padding: 10px 14px;
          background: #ffffff;
          border-radius: 8px 8px 0 0;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .b-preview-widget-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .b-preview-widget-name {
          font-size: 13px;
          font-weight: 500;
          color: #111827;
        }

        .b-preview-widget-body {
          flex: 1;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .b-preview-widget-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: #9ca3af;
        }

        .b-preview-widget-content .b-widget-icon {
          width: 32px;
          height: 32px;
          color: #9ca3af;
        }

        .b-preview-widget-text {
          font-size: 14px;
          font-weight: 500;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .b-empty {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .b-empty-icon {
          width: 48px;
          height: 48px;
          color: #d1d5db;
          margin-bottom: 12px;
        }

        .b-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .b-empty-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }

        .b-preview-empty {
          min-height: 300px;
        }

        /* ============================================
           MODAL
           ============================================ */
        .b-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
          animation: overlayFadeIn 0.3s ease;
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .b-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          animation: modalSlideIn 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .b-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .b-modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .b-modal-close {
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
        }

        .b-modal-close:hover {
          background: #f3f4f6;
        }

        .b-modal-close-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
        }

        .b-modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .b-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 20px;
          border-top: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .b-modal-close-btn {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .b-modal-close-btn:hover {
          background: #f3f4f6;
        }

        .b-modal-cancel-btn {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .b-modal-cancel-btn:hover {
          background: #f3f4f6;
        }

        .b-modal-save-btn {
          padding: 8px 20px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .b-modal-save-btn:hover {
          background: #2563eb;
        }

        /* ============================================
           WIDGET LIBRARY
           ============================================ */
        .b-widget-library {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        @media (max-width: 480px) {
          .b-widget-library {
            grid-template-columns: 1fr;
          }
        }

        .b-library-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .b-library-item:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .b-library-item-icon {
          width: 36px;
          height: 36px;
          background: #f3f4f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .b-library-item-icon .b-widget-icon {
          width: 18px;
          height: 18px;
          color: #3b82f6;
        }

        .b-library-item-content {
          flex: 1;
          min-width: 0;
        }

        .b-library-item-name {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          margin: 0;
        }

        .b-library-item-type {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
          text-transform: capitalize;
        }

        .b-library-item-add {
          width: 18px;
          height: 18px;
          color: #3b82f6;
          flex-shrink: 0;
        }

        /* ============================================
           CONFIG FORM
           ============================================ */
        .b-config-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .b-editor-grid,
          .b-preview-grid {
            grid-template-columns: repeat(6, 1fr);
          }
          .b-col-span-1 { grid-column: span 1; }
          .b-col-span-2 { grid-column: span 2; }
          .b-col-span-3 { grid-column: span 3; }
          .b-col-span-4 { grid-column: span 4; }
          .b-col-span-5 { grid-column: span 5; }
          .b-col-span-6 { grid-column: span 6; }
        }

        @media (max-width: 768px) {
          .b-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .b-header-right {
            width: 100%;
          }

          .b-select {
            flex: 1;
            min-width: 0;
          }

          .b-editor-grid,
          .b-preview-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .b-col-span-1 { grid-column: span 1; }
          .b-col-span-2 { grid-column: span 2; }
          .b-col-span-3 { grid-column: span 2; }
          .b-col-span-4 { grid-column: span 2; }
          .b-col-span-5 { grid-column: span 2; }
          .b-col-span-6 { grid-column: span 2; }
        }

        @media (max-width: 480px) {
          .b-header-right {
            flex-wrap: wrap;
          }

          .b-editor-grid,
          .b-preview-grid {
            grid-template-columns: 1fr;
          }
          .b-col-span-1,
          .b-col-span-2,
          .b-col-span-3,
          .b-col-span-4,
          .b-col-span-5,
          .b-col-span-6 { grid-column: span 1; }

          .b-config-grid {
            grid-template-columns: 1fr;
          }

          .b-stats {
            grid-template-columns: 1fr;
          }

          .b-modal {
            margin: 12px;
          }

          .b-widget-library {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Builder;