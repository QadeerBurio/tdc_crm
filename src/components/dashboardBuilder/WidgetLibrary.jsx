// components/builder/WidgetLibrary.jsx - COMPLETE MODERN VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X, Search, Grid, BarChart2, PieChart,
  Activity, Target, Users, Clock,
  CheckCircle, AlertCircle, Plus,
  GripVertical, Filter, Layout,
  Eye, Star, TrendingUp, TrendingDown,
  FileText, Building2, Briefcase, User,
  Zap, Shield, Award, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const WidgetLibrary = ({ onAddWidget, onClose }) => {
  const { token } = useAuth();
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/dashboards/widgets`, getHeaders());
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        setWidgets(Array.isArray(data) ? data : []);
      } else {
        setWidgets(getMockWidgets());
        toast.info('Showing sample widgets');
      }
    } catch (error) {
      console.error('Error fetching widgets:', error);
      setWidgets(getMockWidgets());
      toast.error('Failed to load widgets, showing sample');
    } finally {
      setLoading(false);
    }
  };

  const getMockWidgets = () => {
    return [
      { 
        _id: '1', 
        name: 'KPI Card', 
        type: 'kpi_card', 
        category: 'kpi',
        description: 'Display key metrics and KPIs with trends',
        icon: 'Target',
        uses: 245,
        rating: 4.8
      },
      { 
        _id: '2', 
        name: 'Task Status', 
        type: 'task_status', 
        category: 'status',
        description: 'Show task progress and completion rates',
        icon: 'CheckCircle',
        uses: 189,
        rating: 4.6
      },
      { 
        _id: '3', 
        name: 'Activity Feed', 
        type: 'activity_feed', 
        category: 'activity',
        description: 'Recent activities and notifications',
        icon: 'Activity',
        uses: 156,
        rating: 4.5
      },
      { 
        _id: '4', 
        name: 'Risk List', 
        type: 'risk_list', 
        category: 'status',
        description: 'Active risks and issues tracking',
        icon: 'AlertCircle',
        uses: 98,
        rating: 4.3
      },
      { 
        _id: '5', 
        name: 'Performance Chart', 
        type: 'performance_chart', 
        category: 'chart',
        description: 'Visualize performance trends over time',
        icon: 'BarChart2',
        uses: 210,
        rating: 4.7
      },
      { 
        _id: '6', 
        name: 'Goal Progress', 
        type: 'goal_progress', 
        category: 'kpi',
        description: 'Track progress towards organizational goals',
        icon: 'Target',
        uses: 134,
        rating: 4.4
      },
      { 
        _id: '7', 
        name: 'Revenue Chart', 
        type: 'revenue_chart', 
        category: 'chart',
        description: 'Revenue trends and forecasting',
        icon: 'TrendingUp',
        uses: 178,
        rating: 4.6
      },
      { 
        _id: '8', 
        name: 'Team Ranking', 
        type: 'team_ranking', 
        category: 'kpi',
        description: 'Team performance rankings',
        icon: 'Users',
        uses: 87,
        rating: 4.2
      },
      { 
        _id: '9', 
        name: 'Project Status', 
        type: 'project_status', 
        category: 'status',
        description: 'Project health and milestone tracking',
        icon: 'Briefcase',
        uses: 112,
        rating: 4.3
      },
      { 
        _id: '10', 
        name: 'Employee Ranking', 
        type: 'employee_ranking', 
        category: 'kpi',
        description: 'Employee performance rankings',
        icon: 'User',
        uses: 76,
        rating: 4.1
      },
      { 
        _id: '11', 
        name: 'Calendar View', 
        type: 'calendar', 
        category: 'activity',
        description: 'Upcoming events and deadlines',
        icon: 'Calendar',
        uses: 65,
        rating: 4.0
      },
      { 
        _id: '12', 
        name: 'KPI Table', 
        type: 'kpi_table', 
        category: 'table',
        description: 'Tabular view of key metrics',
        icon: 'Grid',
        uses: 54,
        rating: 3.9
      }
    ];
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
    return <Icon className="wl-widget-icon" />;
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
      'kpi': 'wl-category-kpi',
      'chart': 'wl-category-chart',
      'table': 'wl-category-table',
      'activity': 'wl-category-activity',
      'status': 'wl-category-status'
    };
    return colors[category] || 'wl-category-default';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'kpi': 'KPI',
      'chart': 'Chart',
      'table': 'Table',
      'activity': 'Activity',
      'status': 'Status'
    };
    return labels[category] || category;
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

  const handleAddWidget = (widget) => {
    if (onAddWidget) {
      onAddWidget(widget);
    }
    toast.success(`"${widget.name}" added to dashboard`);
  };

  if (loading) {
    return (
      <div className="wl-modal-overlay" onClick={onClose}>
        <div className="wl-modal wl-modal-loading" onClick={(e) => e.stopPropagation()}>
          <div className="wl-spinner"></div>
          <p className="wl-loading-text">Loading widgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wl-modal-overlay" onClick={onClose}>
      <div className="wl-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wl-modal-header">
          <div className="wl-modal-header-left">
            <Grid className="wl-modal-header-icon" />
            <h3 className="wl-modal-title">Widget Library</h3>
            <span className="wl-modal-count">{filteredWidgets.length} widgets</span>
          </div>
          <button onClick={onClose} className="wl-modal-close">
            <X className="wl-modal-close-icon" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="wl-filters">
          <div className="wl-search-wrapper">
            <Search className="wl-search-icon" />
            <input
              type="text"
              placeholder="Search widgets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="wl-search-input"
            />
            {search && (
              <button className="wl-search-clear" onClick={() => setSearch('')}>
                <X className="wl-search-clear-icon" />
              </button>
            )}
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="wl-filter-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <div className="wl-view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`wl-view-btn ${viewMode === 'grid' ? 'wl-view-active' : ''}`}
              title="Grid View"
            >
              <Grid className="wl-view-icon" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`wl-view-btn ${viewMode === 'list' ? 'wl-view-active' : ''}`}
              title="List View"
            >
              <List className="wl-view-icon" />
            </button>
          </div>

          {(search || filterCategory !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setFilterCategory('all');
              }}
              className="wl-clear-btn"
            >
              <X className="wl-clear-icon" />
              Clear
            </button>
          )}
        </div>

        {/* Widget Grid */}
        <div className="wl-modal-body">
          {filteredWidgets.length === 0 ? (
            <div className="wl-empty">
              <Grid className="wl-empty-icon" />
              <h3 className="wl-empty-title">No widgets found</h3>
              <p className="wl-empty-subtitle">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="wl-grid">
              {filteredWidgets.map((widget) => (
                <div 
                  key={widget._id}
                  className="wl-widget-card"
                  onClick={() => handleAddWidget(widget)}
                >
                  <div className="wl-widget-header">
                    <div className="wl-widget-icon-wrapper">
                      {getWidgetIcon(widget.icon)}
                    </div>
                    <div className="wl-widget-info">
                      <h4 className="wl-widget-name">{widget.name}</h4>
                      <span className={`wl-widget-category ${getCategoryColor(widget.category)}`}>
                        {getCategoryLabel(widget.category)}
                      </span>
                    </div>
                  </div>
                  <p className="wl-widget-description">{widget.description}</p>
                  <div className="wl-widget-meta">
                    <span className="wl-widget-type">{getWidgetTypeLabel(widget.type)}</span>
                    <span className="wl-widget-rating">
                      <Star className="wl-widget-star" />
                      {widget.rating}
                    </span>
                    <span className="wl-widget-uses">{widget.uses} uses</span>
                  </div>
                  <button 
                    className="wl-widget-add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddWidget(widget);
                    }}
                  >
                    <Plus className="wl-widget-add-icon" />
                    Add Widget
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="wl-list">
              {filteredWidgets.map((widget) => (
                <div 
                  key={widget._id}
                  className="wl-list-item"
                  onClick={() => handleAddWidget(widget)}
                >
                  <div className="wl-list-item-icon">
                    {getWidgetIcon(widget.icon)}
                  </div>
                  <div className="wl-list-item-content">
                    <div className="wl-list-item-header">
                      <h4 className="wl-list-item-name">{widget.name}</h4>
                      <span className={`wl-list-item-category ${getCategoryColor(widget.category)}`}>
                        {getCategoryLabel(widget.category)}
                      </span>
                    </div>
                    <p className="wl-list-item-description">{widget.description}</p>
                    <div className="wl-list-item-meta">
                      <span className="wl-list-item-type">{getWidgetTypeLabel(widget.type)}</span>
                      <span className="wl-list-item-rating">
                        <Star className="wl-list-item-star" />
                        {widget.rating}
                      </span>
                      <span className="wl-list-item-uses">{widget.uses} uses</span>
                    </div>
                  </div>
                  <button 
                    className="wl-list-item-add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddWidget(widget);
                    }}
                  >
                    <Plus className="wl-list-item-add-icon" />
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wl-modal-footer">
          <span className="wl-footer-text">
            {filteredWidgets.length} of {widgets.length} widgets
          </span>
          <button onClick={onClose} className="wl-footer-close-btn">
            Close
          </button>
        </div>
      </div>

      <style>{`
        /* ============================================
           OVERLAY
           ============================================ */
        .wl-modal-overlay {
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

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           MODAL
           ============================================ */
        .wl-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          animation: modalSlideIn 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .wl-modal-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          gap: 16px;
        }

        .wl-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .wl-loading-text {
          color: #6b7280;
          font-size: 14px;
        }

        /* ============================================
           HEADER
           ============================================ */
        .wl-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .wl-modal-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .wl-modal-header-icon {
          width: 24px;
          height: 24px;
          color: #3b82f6;
        }

        .wl-modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .wl-modal-count {
          font-size: 12px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 10px;
          border-radius: 9999px;
        }

        .wl-modal-close {
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
        }

        .wl-modal-close:hover {
          background: #f3f4f6;
        }

        .wl-modal-close-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .wl-filters {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-bottom: 1px solid #f3f4f6;
          flex-shrink: 0;
        }

        .wl-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 180px;
        }

        .wl-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        .wl-search-input {
          width: 100%;
          padding: 6px 36px 6px 36px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
        }

        .wl-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .wl-search-clear {
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

        .wl-search-clear:hover {
          color: #6b7280;
        }

        .wl-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .wl-filter-select {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          min-width: 140px;
        }

        .wl-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .wl-view-toggle {
          display: flex;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          overflow: hidden;
          background: #ffffff;
        }

        .wl-view-btn {
          padding: 4px 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wl-view-btn:hover {
          background: #f3f4f6;
        }

        .wl-view-active {
          background: #3b82f6;
          color: #ffffff;
        }

        .wl-view-active:hover {
          background: #2563eb;
        }

        .wl-view-icon {
          width: 16px;
          height: 16px;
        }

        .wl-clear-btn {
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

        .wl-clear-btn:hover {
          background: #f3f4f6;
        }

        .wl-clear-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           BODY
           ============================================ */
        .wl-modal-body {
          padding: 16px 20px;
          overflow-y: auto;
          flex: 1;
        }

        /* ============================================
           GRID VIEW
           ============================================ */
        .wl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }

        @media (max-width: 640px) {
          .wl-grid {
            grid-template-columns: 1fr;
          }
        }

        .wl-widget-card {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wl-widget-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
          transform: translateY(-2px);
        }

        .wl-widget-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .wl-widget-icon-wrapper {
          width: 36px;
          height: 36px;
          background: #eff6ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wl-widget-icon {
          width: 18px;
          height: 18px;
          color: #3b82f6;
        }

        .wl-widget-info {
          flex: 1;
          min-width: 0;
        }

        .wl-widget-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .wl-widget-category {
          padding: 1px 6px;
          font-size: 9px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .wl-category-kpi { background: #dbeafe; color: #1d4ed8; }
        .wl-category-chart { background: #d1fae5; color: #065f46; }
        .wl-category-table { background: #f3e8ff; color: #6d28d9; }
        .wl-category-activity { background: #fef3c7; color: #92400e; }
        .wl-category-status { background: #fce7f3; color: #9d174d; }
        .wl-category-default { background: #f3f4f6; color: #6b7280; }

        .wl-widget-description {
          font-size: 12px;
          color: #6b7280;
          margin: 4px 0 8px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .wl-widget-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #9ca3af;
          margin-bottom: 10px;
        }

        .wl-widget-type {
          padding: 1px 6px;
          background: #f3f4f6;
          border-radius: 4px;
          color: #6b7280;
        }

        .wl-widget-rating {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #111827;
          font-weight: 500;
        }

        .wl-widget-star {
          width: 12px;
          height: 12px;
          color: #f59e0b;
          fill: #f59e0b;
        }

        .wl-widget-uses {
          color: #9ca3af;
        }

        .wl-widget-add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 100%;
          padding: 4px 0;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: transparent;
          color: #6b7280;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wl-widget-add-btn:hover {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .wl-widget-add-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           LIST VIEW
           ============================================ */
        .wl-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .wl-list-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wl-list-item:hover {
          border-color: #3b82f6;
          background: #f9fafb;
        }

        .wl-list-item-icon {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wl-list-item-icon .wl-widget-icon {
          width: 18px;
          height: 18px;
          color: #3b82f6;
        }

        .wl-list-item-content {
          flex: 1;
          min-width: 0;
        }

        .wl-list-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .wl-list-item-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .wl-list-item-category {
          padding: 1px 6px;
          font-size: 9px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .wl-list-item-description {
          font-size: 12px;
          color: #6b7280;
          margin: 2px 0 0 0;
        }

        .wl-list-item-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .wl-list-item-type {
          padding: 1px 6px;
          background: #f3f4f6;
          border-radius: 4px;
          color: #6b7280;
        }

        .wl-list-item-rating {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #111827;
          font-weight: 500;
        }

        .wl-list-item-star {
          width: 12px;
          height: 12px;
          color: #f59e0b;
          fill: #f59e0b;
        }

        .wl-list-item-uses {
          color: #9ca3af;
        }

        .wl-list-item-add-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 14px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: transparent;
          color: #6b7280;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .wl-list-item-add-btn:hover {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .wl-list-item-add-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .wl-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
        }

        .wl-empty-icon {
          width: 48px;
          height: 48px;
          color: #d1d5db;
          margin-bottom: 12px;
        }

        .wl-empty-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .wl-empty-subtitle {
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
        }

        /* ============================================
           FOOTER
           ============================================ */
        .wl-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          border-top: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .wl-footer-text {
          font-size: 13px;
          color: #6b7280;
        }

        .wl-footer-close-btn {
          padding: 6px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: transparent;
          color: #6b7280;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wl-footer-close-btn:hover {
          background: #f3f4f6;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 640px) {
          .wl-modal {
            max-height: 95vh;
            margin: 8px;
          }

          .wl-modal-header {
            flex-wrap: wrap;
          }

          .wl-modal-header-left {
            flex-wrap: wrap;
          }

          .wl-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .wl-search-wrapper {
            min-width: 0;
          }

          .wl-filter-select {
            width: 100%;
          }

          .wl-view-toggle {
            align-self: flex-start;
          }

          .wl-grid {
            grid-template-columns: 1fr;
          }

          .wl-list-item {
            flex-direction: column;
            align-items: stretch;
          }

          .wl-list-item-add-btn {
            width: 100%;
            justify-content: center;
          }

          .wl-modal-footer {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default WidgetLibrary;