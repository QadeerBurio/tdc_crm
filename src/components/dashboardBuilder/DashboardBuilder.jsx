import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Layout, Plus, Save, X, Edit, Trash2,
  Copy, Eye, RefreshCw, Grid, List,
  Maximize, Minimize, Settings,
  GripVertical, ChevronDown, ChevronRight,
  BarChart2, PieChart, Activity, Users,
  Target, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import WidgetLibrary from './WidgetLibrary';
import WidgetConfig from './WidgetConfig';
import LayoutEditor from './LayoutEditor';
import AudienceSelector from './AudienceSelector';

const DashboardBuilder = ({ 
  dashboard, 
  onSave, 
  onCancel, 
  isOpen,
  readOnly = false 
}) => {
  const { api } = useAuth();
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview'
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [layout, setLayout] = useState([]);
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

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    try {
      const response = await api.get('/dashboards');
      setDashboards(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedDashboard(response.data.data[0]);
        setLayout(response.data.data[0].widgets || []);
        setDashboardConfig({
          name: response.data.data[0].name,
          description: response.data.data[0].description || '',
          audience: response.data.data[0].audience || 'all',
          segmentId: response.data.data[0].segmentId || '',
          departmentId: response.data.data[0].departmentId || '',
          teamId: response.data.data[0].teamId || '',
          userId: response.data.data[0].userId || '',
          isDefault: response.data.data[0].isDefault || false,
          isActive: response.data.data[0].isActive !== undefined ? response.data.data[0].isActive : true
        });
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWidget = (widget) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      widgetId: widget._id,
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
  };

  const removeWidget = (id) => {
    if (!window.confirm('Are you sure you want to remove this widget?')) return;
    setLayout(layout.filter(w => w.id !== id));
  };

  const updateWidgetConfig = (id, config) => {
    setLayout(layout.map(w => 
      w.id === id ? { ...w, config: { ...w.config, ...config } } : w
    ));
    setShowWidgetConfig(false);
    setEditingWidget(null);
  };

  const updateLayout = (newLayout) => {
    setLayout(newLayout);
  };

  const handleSave = async () => {
    const dashboardData = {
      ...dashboardConfig,
      widgets: layout,
      isActive: true
    };
    await onSave(dashboardData);
  };

  const selectDashboard = (dashboardId) => {
    const dashboard = dashboards.find(d => d._id === dashboardId);
    if (dashboard) {
      setSelectedDashboard(dashboard);
      setLayout(dashboard.widgets || []);
      setDashboardConfig({
        name: dashboard.name,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Layout className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Dashboard Builder</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Dashboard Selector */}
          <select
            value={selectedDashboard?._id || ''}
            onChange={(e) => selectDashboard(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Dashboard</option>
            {dashboards.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'edit' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-sm transition-colors border-l border-r border-gray-300 ${
                viewMode === 'preview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowWidgetLibrary(true)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Widget
          </button>

          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Dashboard
          </button>
        </div>
      </div>

      {/* Dashboard Config */}
      <div className="px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500">Dashboard Name</label>
            <input
              type="text"
              value={dashboardConfig.name}
              onChange={(e) => setDashboardConfig(prev => ({ ...prev, name: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Dashboard"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Audience</label>
            <AudienceSelector
              value={dashboardConfig.audience}
              onChange={(value) => setDashboardConfig(prev => ({ ...prev, audience: value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Status</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                checked={dashboardConfig.isActive}
                onChange={(e) => setDashboardConfig(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Active</span>
              <input
                type="checkbox"
                checked={dashboardConfig.isDefault}
                onChange={(e) => setDashboardConfig(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Default</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'edit' ? (
          <LayoutEditor
            layout={layout}
            onLayoutChange={updateLayout}
            onWidgetRemove={removeWidget}
            onWidgetConfig={(widget) => {
              setEditingWidget(widget);
              setShowWidgetConfig(true);
            }}
            readOnly={readOnly}
          />
        ) : (
          <div className="p-6 overflow-y-auto h-full">
            <div className="grid grid-cols-2 gap-4 max-w-7xl mx-auto">
              {layout.map((widget) => (
                <div 
                  key={widget.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                      {widget.type === 'kpi_card' && <Target className="w-4 h-4 text-blue-600" />}
                      {widget.type === 'task_status' && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {widget.type === 'activity_feed' && <Activity className="w-4 h-4 text-purple-600" />}
                      {widget.type === 'risk_list' && <AlertCircle className="w-4 h-4 text-red-600" />}
                      {widget.type === 'performance_chart' && <BarChart2 className="w-4 h-4 text-orange-600" />}
                      {widget.type === 'goal_progress' && <Target className="w-4 h-4 text-indigo-600" />}
                      <span className="font-medium text-gray-800">{widget.name}</span>
                    </div>
                  </div>
                  <div className="p-4 min-h-[200px] flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Widget Preview</p>
                      <p className="text-xs">(Configure in edit mode)</p>
                    </div>
                  </div>
                </div>
              ))}
              {layout.length === 0 && (
                <div className="col-span-2 text-center py-20 text-gray-400">
                  <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No widgets added yet</p>
                  <p className="text-sm">Click "Add Widget" to start building your dashboard</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Widget Library Modal */}
      {showWidgetLibrary && (
        <WidgetLibrary
          onAddWidget={addWidget}
          onClose={() => setShowWidgetLibrary(false)}
        />
      )}

      {/* Widget Config Modal */}
      {showWidgetConfig && editingWidget && (
        <WidgetConfig
          widget={editingWidget}
          onSave={updateWidgetConfig}
          onClose={() => {
            setShowWidgetConfig(false);
            setEditingWidget(null);
          }}
        />
      )}
    </div>
  );
};

export default DashboardBuilder;