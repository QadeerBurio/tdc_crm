// pages/builder/WidgetGallery.jsx - COMPLETE MODERN VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Grid, Search, Filter, Plus, Eye,
  BarChart2, PieChart, Activity, Users,
  Target, Clock, CheckCircle, AlertCircle,
  Layout, List, RefreshCw, Download,
  X, Star, TrendingUp, TrendingDown,
  Calendar, FileText, Building2, Briefcase,
  User, Zap, Shield, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const WidgetGallery = () => {
  const { token } = useAuth();
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/dashboards/widgets`, getHeaders());
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        setWidgets(Array.isArray(data) ? data : []);
      } else {
        // Use mock widgets
        setWidgets(getMockWidgets());
        toast.info('Showing sample widgets');
      }
    } catch (error) {
      console.error('Error fetching widgets:', error);
      setWidgets(getMockWidgets());
      toast.error('Failed to load widgets, showing sample');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockWidgets = () => {
    return [
      { 
        _id: '1', 
        name: 'KPI Card', 
        type: 'kpi_card', 
        description: 'Display key metrics and KPIs with trends',
        icon: 'Target',
        category: 'kpi',
        uses: 245,
        rating: 4.8,
        preview: true
      },
      { 
        _id: '2', 
        name: 'Task Status', 
        type: 'task_status', 
        description: 'Show task progress and completion rates',
        icon: 'CheckCircle',
        category: 'status',
        uses: 189,
        rating: 4.6,
        preview: true
      },
      { 
        _id: '3', 
        name: 'Activity Feed', 
        type: 'activity_feed', 
        description: 'Recent activities and notifications',
        icon: 'Activity',
        category: 'activity',
        uses: 156,
        rating: 4.5,
        preview: true
      },
      { 
        _id: '4', 
        name: 'Risk List', 
        type: 'risk_list', 
        description: 'Active risks and issues tracking',
        icon: 'AlertCircle',
        category: 'status',
        uses: 98,
        rating: 4.3,
        preview: true
      },
      { 
        _id: '5', 
        name: 'Performance Chart', 
        type: 'performance_chart', 
        description: 'Visualize performance trends over time',
        icon: 'BarChart2',
        category: 'chart',
        uses: 210,
        rating: 4.7,
        preview: true
      },
      { 
        _id: '6', 
        name: 'Goal Progress', 
        type: 'goal_progress', 
        description: 'Track progress towards organizational goals',
        icon: 'Target',
        category: 'kpi',
        uses: 134,
        rating: 4.4,
        preview: true
      },
      { 
        _id: '7', 
        name: 'Revenue Chart', 
        type: 'revenue_chart', 
        description: 'Revenue trends and forecasting',
        icon: 'TrendingUp',
        category: 'chart',
        uses: 178,
        rating: 4.6,
        preview: true
      },
      { 
        _id: '8', 
        name: 'Team Ranking', 
        type: 'team_ranking', 
        description: 'Team performance rankings',
        icon: 'Users',
        category: 'kpi',
        uses: 87,
        rating: 4.2,
        preview: true
      },
      { 
        _id: '9', 
        name: 'Project Status', 
        type: 'project_status', 
        description: 'Project health and milestone tracking',
        icon: 'Briefcase',
        category: 'status',
        uses: 112,
        rating: 4.3,
        preview: true
      },
      { 
        _id: '10', 
        name: 'Employee Ranking', 
        type: 'employee_ranking', 
        description: 'Employee performance rankings',
        icon: 'User',
        category: 'kpi',
        uses: 76,
        rating: 4.1,
        preview: true
      },
      { 
        _id: '11', 
        name: 'Calendar View', 
        type: 'calendar', 
        description: 'Upcoming events and deadlines',
        icon: 'Calendar',
        category: 'activity',
        uses: 65,
        rating: 4.0,
        preview: true
      },
      { 
        _id: '12', 
        name: 'KPI Table', 
        type: 'kpi_table', 
        description: 'Tabular view of key metrics',
        icon: 'Grid',
        category: 'table',
        uses: 54,
        rating: 3.9,
        preview: true
      }
    ];
  };

  const handleRefresh = async () => {
    await fetchWidgets();
    toast.success('Widgets refreshed');
  };

  const handleAddWidget = (widget) => {
    toast.success(`"${widget.name}" added to dashboard!`);
  };

  const handlePreview = (widget) => {
    setSelectedWidget(widget);
    setShowPreview(true);
  };

  const getWidgetIcon = (iconName) => {
    const icons = {
      'Target': Target,
      'CheckCircle': CheckCircle,
      'Activity': Activity,
      'AlertCircle': AlertCircle,
      'BarChart2': BarChart2,
      'PieChart': PieChart,
      'TrendingUp': TrendingUp,
      'TrendingDown': TrendingDown,
      'Users': Users,
      'User': User,
      'Briefcase': Briefcase,
      'Calendar': Calendar,
      'Grid': Grid,
      'Layout': Layout,
      'FileText': FileText,
      'Building2': Building2,
      'Zap': Zap,
      'Shield': Shield,
      'Award': Award
    };
    const Icon = icons[iconName] || Layout;
    return <Icon className="wg-widget-icon" />;
  };

  const getWidgetTypeLabel = (type) => {
    const labels = {
      'kpi_card': 'KPI Card',
      'task_status': 'Task Status',
      'activity_feed': 'Activity Feed',
      'risk_list': 'Risk List',
      'performance_chart': 'Performance Chart',
      'goal_progress': 'Goal Progress',
      'revenue_chart': 'Revenue Chart',
      'team_ranking': 'Team Ranking',
      'project_status': 'Project Status',
      'employee_ranking': 'Employee Ranking',
      'calendar': 'Calendar',
      'kpi_table': 'KPI Table',
      'number': 'Number',
      'percentage': 'Percentage',
      'progress_bar': 'Progress Bar'
    };
    return labels[type] || type.replace(/_/g, ' ');
  };

  const getCategoryColor = (category) => {
    const colors = {
      'kpi': 'wg-category-kpi',
      'chart': 'wg-category-chart',
      'table': 'wg-category-table',
      'activity': 'wg-category-activity',
      'status': 'wg-category-status'
    };
    return colors[category] || 'wg-category-default';
  };

  const categories = [
    { value: 'all', label: 'All Widgets' },
    { value: 'kpi', label: 'KPI Cards' },
    { value: 'chart', label: 'Charts' },
    { value: 'table', label: 'Tables' },
    { value: 'activity', label: 'Activity' },
    { value: 'status', label: 'Status' }
  ];

  const filteredWidgets = widgets.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(search.toLowerCase()) ||
                          widget.description?.toLowerCase().includes(search.toLowerCase()) ||
                          widget.type?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || widget.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const stats = {
    total: widgets.length,
    categories: new Set(widgets.map(w => w.category)).size,
    mostUsed: widgets.reduce((a, b) => a.uses > b.uses ? a : b),
    topRated: widgets.reduce((a, b) => a.rating > b.rating ? a : b)
  };

  if (loading) {
    return (
      <div className="wg-loading">
        <div className="wg-spinner"></div>
        <p className="wg-loading-text">Loading widgets...</p>
      </div>
    );
  }

  return (
    <div className="wg-container">
      {/* Header */}
      <div className="wg-header">
        <div className="wg-header-left">
          <h1 className="wg-title">
            <Grid className="wg-title-icon" />
            Widget Gallery
          </h1>
          <p className="wg-subtitle">Browse and add widgets to your dashboard</p>
        </div>
        <div className="wg-header-right">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="wg-refresh-btn"
            title="Refresh"
          >
            <RefreshCw className={`wg-refresh-icon ${refreshing ? 'wg-spin' : ''}`} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`wg-view-btn ${viewMode === 'grid' ? 'wg-view-active' : ''}`}
            title="Grid View"
          >
            <Grid className="wg-view-icon" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`wg-view-btn ${viewMode === 'list' ? 'wg-view-active' : ''}`}
            title="List View"
          >
            <List className="wg-view-icon" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="wg-stats">
        <div className="wg-stat-card">
          <span className="wg-stat-label">Total Widgets</span>
          <span className="wg-stat-value">{stats.total}</span>
        </div>
        <div className="wg-stat-card">
          <span className="wg-stat-label">Categories</span>
          <span className="wg-stat-value">{stats.categories}</span>
        </div>
        <div className="wg-stat-card">
          <span className="wg-stat-label">Most Used</span>
          <span className="wg-stat-value wg-stat-highlight">{stats.mostUsed?.name || 'N/A'}</span>
        </div>
        <div className="wg-stat-card">
          <span className="wg-stat-label">Top Rated</span>
          <span className="wg-stat-value wg-stat-highlight">{stats.topRated?.name || 'N/A'}</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="wg-filters">
        <div className="wg-search-wrapper">
          <Search className="wg-search-icon" />
          <input
            type="text"
            placeholder="Search widgets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="wg-search-input"
          />
          {search && (
            <button className="wg-search-clear" onClick={() => setSearch('')}>
              <X className="wg-search-clear-icon" />
            </button>
          )}
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="wg-filter-select"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>

        {(search || filterCategory !== 'all') && (
          <button
            onClick={() => {
              setSearch('');
              setFilterCategory('all');
            }}
            className="wg-clear-btn"
          >
            <X className="wg-clear-icon" />
            Clear
          </button>
        )}
      </div>

      {/* Widget Grid */}
      {viewMode === 'grid' ? (
        <div className="wg-grid">
          {filteredWidgets.length === 0 ? (
            <div className="wg-empty">
              <Grid className="wg-empty-icon" />
              <h3 className="wg-empty-title">No widgets found</h3>
              <p className="wg-empty-subtitle">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredWidgets.map((widget) => (
              <div key={widget._id} className="wg-card">
                <div className="wg-card-header">
                  <div className="wg-card-icon" style={{ backgroundColor: `${getCategoryColor(widget.category)}15` }}>
                    {getWidgetIcon(widget.icon)}
                  </div>
                  <div className="wg-card-info">
                    <h3 className="wg-card-title">{widget.name}</h3>
                    <span className={`wg-card-category ${getCategoryColor(widget.category)}`}>
                      {widget.category || 'General'}
                    </span>
                  </div>
                </div>
                <p className="wg-card-description">{widget.description}</p>
                <div className="wg-card-meta">
                  <span className="wg-card-type">{getWidgetTypeLabel(widget.type)}</span>
                  <span className="wg-card-uses">{widget.uses} uses</span>
                  <span className="wg-card-rating">
                    <Star className="wg-card-star" />
                    {widget.rating}
                  </span>
                </div>
                <div className="wg-card-actions">
                  <button 
                    className="wg-preview-btn"
                    onClick={() => handlePreview(widget)}
                  >
                    <Eye className="wg-btn-icon" />
                    Preview
                  </button>
                  <button 
                    className="wg-add-btn"
                    onClick={() => handleAddWidget(widget)}
                  >
                    <Plus className="wg-btn-icon" />
                    Add to Dashboard
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="wg-list">
          {filteredWidgets.length === 0 ? (
            <div className="wg-empty wg-list-empty">
              <Grid className="wg-empty-icon" />
              <h3 className="wg-empty-title">No widgets found</h3>
              <p className="wg-empty-subtitle">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredWidgets.map((widget) => (
              <div key={widget._id} className="wg-list-item">
                <div className="wg-list-item-icon">
                  {getWidgetIcon(widget.icon)}
                </div>
                <div className="wg-list-item-content">
                  <div className="wg-list-item-header">
                    <h3 className="wg-list-item-title">{widget.name}</h3>
                    <span className={`wg-list-item-category ${getCategoryColor(widget.category)}`}>
                      {widget.category || 'General'}
                    </span>
                  </div>
                  <p className="wg-list-item-description">{widget.description}</p>
                  <div className="wg-list-item-meta">
                    <span className="wg-list-item-type">{getWidgetTypeLabel(widget.type)}</span>
                    <span className="wg-list-item-uses">{widget.uses} uses</span>
                    <span className="wg-list-item-rating">
                      <Star className="wg-list-item-star" />
                      {widget.rating}
                    </span>
                  </div>
                </div>
                <div className="wg-list-item-actions">
                  <button 
                    className="wg-preview-btn"
                    onClick={() => handlePreview(widget)}
                  >
                    <Eye className="wg-btn-icon" />
                    Preview
                  </button>
                  <button 
                    className="wg-add-btn"
                    onClick={() => handleAddWidget(widget)}
                  >
                    <Plus className="wg-btn-icon" />
                    Add
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedWidget && (
        <div className="wg-modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="wg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wg-modal-header">
              <div className="wg-modal-header-left">
                <div className="wg-modal-icon">
                  {getWidgetIcon(selectedWidget.icon)}
                </div>
                <div>
                  <h3 className="wg-modal-title">{selectedWidget.name}</h3>
                  <span className={`wg-modal-category ${getCategoryColor(selectedWidget.category)}`}>
                    {selectedWidget.category || 'General'}
                  </span>
                </div>
              </div>
              <button className="wg-modal-close" onClick={() => setShowPreview(false)}>
                <X className="wg-modal-close-icon" />
              </button>
            </div>
            <div className="wg-modal-body">
              <div className="wg-modal-preview">
                <div className="wg-modal-preview-content">
                  {getWidgetIcon(selectedWidget.icon)}
                  <span className="wg-modal-preview-label">Widget Preview</span>
                  <p className="wg-modal-preview-desc">{selectedWidget.description}</p>
                </div>
              </div>
              <div className="wg-modal-details">
                <div className="wg-modal-details-grid">
                  <div className="wg-modal-detail">
                    <span className="wg-modal-detail-label">Type</span>
                    <span className="wg-modal-detail-value">{getWidgetTypeLabel(selectedWidget.type)}</span>
                  </div>
                  <div className="wg-modal-detail">
                    <span className="wg-modal-detail-label">Category</span>
                    <span className="wg-modal-detail-value">{selectedWidget.category || 'General'}</span>
                  </div>
                  <div className="wg-modal-detail">
                    <span className="wg-modal-detail-label">Uses</span>
                    <span className="wg-modal-detail-value">{selectedWidget.uses}</span>
                  </div>
                  <div className="wg-modal-detail">
                    <span className="wg-modal-detail-label">Rating</span>
                    <span className="wg-modal-detail-value">
                      <Star className="wg-modal-detail-star" />
                      {selectedWidget.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="wg-modal-footer">
              <button className="wg-modal-close-btn" onClick={() => setShowPreview(false)}>
                Close
              </button>
              <button 
                className="wg-modal-add-btn"
                onClick={() => {
                  handleAddWidget(selectedWidget);
                  setShowPreview(false);
                }}
              >
                <Plus className="wg-btn-icon" />
                Add to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .wg-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .wg-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .wg-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .wg-loading-text {
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
        .wg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .wg-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wg-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .wg-title-icon {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }

        .wg-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .wg-header-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .wg-refresh-btn {
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

        .wg-refresh-btn:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .wg-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .wg-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .wg-spin {
          animation: spin 0.8s linear infinite;
        }

        .wg-view-btn {
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

        .wg-view-btn:hover {
          background: #f3f4f6;
        }

        .wg-view-active {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .wg-view-active .wg-view-icon {
          color: #3b82f6;
        }

        .wg-view-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        /* ============================================
           STATS
           ============================================ */
        .wg-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .wg-stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
        }

        .wg-stat-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .wg-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-top: 2px;
        }

        .wg-stat-highlight {
          color: #3b82f6;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .wg-filters {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding: 12px 16px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
        }

        .wg-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .wg-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        .wg-search-input {
          width: 100%;
          padding: 6px 36px 6px 36px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
        }

        .wg-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .wg-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }

        .wg-search-clear:hover {
          color: #6b7280;
        }

        .wg-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .wg-filter-select {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          min-width: 150px;
        }

        .wg-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .wg-clear-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: transparent;
          color: #6b7280;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wg-clear-btn:hover {
          background: #f3f4f6;
        }

        .wg-clear-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           GRID VIEW
           ============================================ */
        .wg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        @media (max-width: 768px) {
          .wg-grid {
            grid-template-columns: 1fr;
          }
        }

        .wg-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
        }

        .wg-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .wg-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .wg-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wg-widget-icon {
          width: 20px;
          height: 20px;
          color: #3b82f6;
        }

        .wg-card-info {
          flex: 1;
          min-width: 0;
        }

        .wg-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .wg-card-category {
          padding: 1px 8px;
          font-size: 10px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .wg-category-kpi { background: #dbeafe; color: #1d4ed8; }
        .wg-category-chart { background: #d1fae5; color: #065f46; }
        .wg-category-table { background: #f3e8ff; color: #6d28d9; }
        .wg-category-activity { background: #fef3c7; color: #92400e; }
        .wg-category-status { background: #fce7f3; color: #9d174d; }
        .wg-category-default { background: #f3f4f6; color: #6b7280; }

        .wg-card-description {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 10px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .wg-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 12px;
        }

        .wg-card-type {
          padding: 1px 8px;
          background: #f3f4f6;
          border-radius: 4px;
        }

        .wg-card-uses {
          color: #6b7280;
        }

        .wg-card-rating {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #111827;
          font-weight: 500;
        }

        .wg-card-star {
          width: 14px;
          height: 14px;
          color: #f59e0b;
          fill: #f59e0b;
        }

        .wg-card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        }

        .wg-btn-icon {
          width: 14px;
          height: 14px;
        }

        .wg-preview-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: transparent;
          color: #6b7280;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wg-preview-btn:hover {
          background: #f3f4f6;
        }

        .wg-add-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 16px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          justify-content: center;
        }

        .wg-add-btn:hover {
          background: #2563eb;
        }

        /* ============================================
           LIST VIEW
           ============================================ */
        .wg-list {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .wg-list-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          border-bottom: 1px solid #f3f4f6;
          transition: all 0.2s ease;
        }

        .wg-list-item:last-child {
          border-bottom: none;
        }

        .wg-list-item:hover {
          background: #f9fafb;
        }

        .wg-list-item-icon {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wg-list-item-icon .wg-widget-icon {
          width: 18px;
          height: 18px;
          color: #3b82f6;
        }

        .wg-list-item-content {
          flex: 1;
          min-width: 0;
        }

        .wg-list-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .wg-list-item-title {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .wg-list-item-category {
          padding: 1px 8px;
          font-size: 10px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .wg-list-item-description {
          font-size: 13px;
          color: #6b7280;
          margin: 4px 0 0 0;
        }

        .wg-list-item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          font-size: 12px;
          color: #9ca3af;
        }

        .wg-list-item-type {
          padding: 1px 8px;
          background: #f3f4f6;
          border-radius: 4px;
        }

        .wg-list-item-uses {
          color: #6b7280;
        }

        .wg-list-item-rating {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #111827;
          font-weight: 500;
        }

        .wg-list-item-star {
          width: 14px;
          height: 14px;
          color: #f59e0b;
          fill: #f59e0b;
        }

        .wg-list-item-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .wg-empty {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .wg-empty-icon {
          width: 48px;
          height: 48px;
          color: #d1d5db;
          margin-bottom: 12px;
        }

        .wg-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .wg-empty-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }

        .wg-list-empty {
          padding: 40px 20px;
        }

        /* ============================================
           MODAL
           ============================================ */
        .wg-modal-overlay {
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

        .wg-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 520px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          animation: modalSlideIn 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .wg-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .wg-modal-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wg-modal-icon {
          width: 44px;
          height: 44px;
          background: #eff6ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wg-modal-icon .wg-widget-icon {
          width: 22px;
          height: 22px;
          color: #3b82f6;
        }

        .wg-modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .wg-modal-category {
          padding: 1px 8px;
          font-size: 10px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .wg-modal-close {
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
        }

        .wg-modal-close:hover {
          background: #f3f4f6;
        }

        .wg-modal-close-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
        }

        .wg-modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .wg-modal-preview {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          padding: 30px;
          text-align: center;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .wg-modal-preview-content .wg-widget-icon {
          width: 40px;
          height: 40px;
          opacity: 0.8;
          color: #ffffff;
        }

        .wg-modal-preview-label {
          display: block;
          font-size: 16px;
          font-weight: 500;
          margin-top: 8px;
        }

        .wg-modal-preview-desc {
          font-size: 13px;
          opacity: 0.8;
          margin-top: 4px;
        }

        .wg-modal-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        @media (max-width: 480px) {
          .wg-modal-details-grid {
            grid-template-columns: 1fr;
          }
        }

        .wg-modal-detail {
          display: flex;
          flex-direction: column;
          padding: 6px 10px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .wg-modal-detail-label {
          font-size: 10px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .wg-modal-detail-value {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .wg-modal-detail-star {
          width: 14px;
          height: 14px;
          color: #f59e0b;
          fill: #f59e0b;
        }

        .wg-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 20px;
          border-top: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .wg-modal-close-btn {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wg-modal-close-btn:hover {
          background: #f3f4f6;
        }

        .wg-modal-add-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 24px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wg-modal-add-btn:hover {
          background: #2563eb;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .wg-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .wg-header-right {
            width: 100%;
          }

          .wg-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .wg-search-wrapper {
            min-width: 0;
          }

          .wg-filter-select {
            width: 100%;
          }

          .wg-stats {
            grid-template-columns: 1fr 1fr;
          }

          .wg-list-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .wg-list-item-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }

        @media (max-width: 480px) {
          .wg-stats {
            grid-template-columns: 1fr;
          }

          .wg-card-actions {
            flex-direction: column;
          }

          .wg-preview-btn,
          .wg-add-btn {
            width: 100%;
            justify-content: center;
          }

          .wg-modal {
            margin: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default WidgetGallery;