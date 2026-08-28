// pages/builder/Templates.jsx - COMPLETE MODERN VERSION
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Layout, Plus, Copy, Eye, Download,
  Grid, List, ChevronRight, RefreshCw,
  Star, Users, BarChart2, PieChart,
  Activity, Target, Clock, CheckCircle,
  Search, Filter, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Templates = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  const templates = [
    {
      id: 1,
      name: 'Executive Dashboard',
      description: 'High-level overview for executives with KPI tracking and strategic metrics',
      category: 'executive',
      widgets: 6,
      uses: 120,
      rating: 4.8,
      icon: 'BarChart2',
      tags: ['KPI', 'Revenue', 'Growth'],
      features: ['Real-time data', 'Interactive charts', 'Export reports']
    },
    {
      id: 2,
      name: 'Sales Dashboard',
      description: 'Track sales performance, pipeline, and revenue metrics',
      category: 'sales',
      widgets: 5,
      uses: 85,
      rating: 4.6,
      icon: 'Activity',
      tags: ['CRM', 'Pipeline', 'Revenue'],
      features: ['Pipeline tracking', 'Lead conversion', 'Revenue forecasting']
    },
    {
      id: 3,
      name: 'Project Management',
      description: 'Monitor project status, tasks, and team productivity',
      category: 'project',
      widgets: 4,
      uses: 65,
      rating: 4.5,
      icon: 'CheckCircle',
      tags: ['Tasks', 'Progress', 'Team'],
      features: ['Task tracking', 'Milestone monitoring', 'Resource allocation']
    },
    {
      id: 4,
      name: 'Employee Performance',
      description: 'Track employee KPIs, productivity, and goal achievement',
      category: 'hr',
      widgets: 5,
      uses: 45,
      rating: 4.3,
      icon: 'Users',
      tags: ['KPI', 'Productivity', 'Goals'],
      features: ['Goal tracking', 'Performance reviews', 'Skill assessment']
    },
    {
      id: 5,
      name: 'Marketing Dashboard',
      description: 'Campaign performance and marketing analytics',
      category: 'marketing',
      widgets: 6,
      uses: 38,
      rating: 4.4,
      icon: 'PieChart',
      tags: ['Campaigns', 'Analytics', 'ROI'],
      features: ['Campaign tracking', 'ROI analysis', 'Audience insights']
    },
    {
      id: 6,
      name: 'Client Success',
      description: 'Monitor client health, satisfaction, and retention metrics',
      category: 'client',
      widgets: 4,
      uses: 30,
      rating: 4.2,
      icon: 'Target',
      tags: ['Clients', 'Satisfaction', 'Retention'],
      features: ['Client health', 'Satisfaction scores', 'Retention tracking']
    },
    {
      id: 7,
      name: 'Financial Dashboard',
      description: 'Track financial performance, expenses, and profitability',
      category: 'financial',
      widgets: 5,
      uses: 28,
      rating: 4.1,
      icon: 'BarChart2',
      tags: ['Finance', 'Expenses', 'Profit'],
      features: ['Expense tracking', 'Revenue analysis', 'Budget monitoring']
    },
    {
      id: 8,
      name: 'Operations Dashboard',
      description: 'Monitor operational efficiency and process metrics',
      category: 'operations',
      widgets: 4,
      uses: 22,
      rating: 4.0,
      icon: 'Activity',
      tags: ['Operations', 'Efficiency', 'Process'],
      features: ['Process monitoring', 'Efficiency metrics', 'Quality tracking']
    }
  ];

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'executive', label: 'Executive' },
    { value: 'sales', label: 'Sales' },
    { value: 'project', label: 'Project' },
    { value: 'hr', label: 'HR' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'client', label: 'Client' },
    { value: 'financial', label: 'Financial' },
    { value: 'operations', label: 'Operations' }
  ];

  const getIcon = (iconName) => {
    const icons = {
      'BarChart2': BarChart2,
      'Activity': Activity,
      'CheckCircle': CheckCircle,
      'Users': Users,
      'PieChart': PieChart,
      'Target': Target,
      'Clock': Clock
    };
    const Icon = icons[iconName] || Layout;
    return <Icon className="t-icon" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'executive': 't-category-executive',
      'sales': 't-category-sales',
      'project': 't-category-project',
      'hr': 't-category-hr',
      'marketing': 't-category-marketing',
      'client': 't-category-client',
      'financial': 't-category-financial',
      'operations': 't-category-operations'
    };
    return colors[category] || 't-category-default';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'executive': 'Executive',
      'sales': 'Sales',
      'project': 'Project',
      'hr': 'HR',
      'marketing': 'Marketing',
      'client': 'Client',
      'financial': 'Financial',
      'operations': 'Operations'
    };
    return labels[category] || category;
  };

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template) => {
    toast.success(`Template "${template.name}" applied successfully!`);
    // Navigate to builder with template data
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleRefresh = () => {
    toast.success('Templates refreshed');
  };

  return (
    <div className="t-container">
      {/* Header */}
      <div className="t-header">
        <div className="t-header-left">
          <h1 className="t-title">
            <Layout className="t-title-icon" />
            Dashboard Templates
          </h1>
          <p className="t-subtitle">Choose from pre-built dashboard templates to get started quickly</p>
        </div>
        <div className="t-header-right">
          <button 
            onClick={handleRefresh}
            className="t-refresh-btn"
          >
            <RefreshCw className="t-refresh-icon" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="t-stats">
        <div className="t-stat-card">
          <span className="t-stat-label">Total Templates</span>
          <span className="t-stat-value">{templates.length}</span>
        </div>
        <div className="t-stat-card">
          <span className="t-stat-label">Categories</span>
          <span className="t-stat-value">{categories.length - 1}</span>
        </div>
        <div className="t-stat-card">
          <span className="t-stat-label">Most Used</span>
          <span className="t-stat-value t-stat-highlight">
            {templates.reduce((a, b) => a.uses > b.uses ? a : b).name}
          </span>
        </div>
        <div className="t-stat-card">
          <span className="t-stat-label">Highest Rated</span>
          <span className="t-stat-value t-stat-highlight">
            {templates.reduce((a, b) => a.rating > b.rating ? a : b).name}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="t-filters">
        <div className="t-search-wrapper">
          <Search className="t-search-icon" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="t-search-input"
          />
          {searchTerm && (
            <button className="t-search-clear" onClick={() => setSearchTerm('')}>
              <X className="t-search-clear-icon" />
            </button>
          )}
        </div>

        <div className="t-filter-group">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="t-filter-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="t-view-toggle">
          <button
            onClick={() => setViewMode('grid')}
            className={`t-view-btn ${viewMode === 'grid' ? 't-view-active' : ''}`}
            title="Grid View"
          >
            <Grid className="t-view-icon" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`t-view-btn ${viewMode === 'list' ? 't-view-active' : ''}`}
            title="List View"
          >
            <List className="t-view-icon" />
          </button>
        </div>

        {(selectedCategory !== 'all' || searchTerm) && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
            }}
            className="t-clear-btn"
          >
            <X className="t-clear-icon" />
            Clear
          </button>
        )}
      </div>

      {/* Templates Grid */}
      {viewMode === 'grid' ? (
        <div className="t-grid">
          {filteredTemplates.length === 0 ? (
            <div className="t-empty">
              <Layout className="t-empty-icon" />
              <h3 className="t-empty-title">No templates found</h3>
              <p className="t-empty-subtitle">Try adjusting your filters or search term</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div key={template.id} className="t-card">
                <div className="t-card-preview">
                  <div className="t-card-preview-content">
                    {getIcon(template.icon)}
                    <span className="t-card-preview-label">Preview</span>
                  </div>
                  <span className={`t-card-category ${getCategoryColor(template.category)}`}>
                    {getCategoryLabel(template.category)}
                  </span>
                </div>
                <div className="t-card-body">
                  <div className="t-card-header">
                    <div>
                      <h3 className="t-card-title">{template.name}</h3>
                      <p className="t-card-description">{template.description}</p>
                    </div>
                    <div className="t-card-rating">
                      <Star className="t-card-star" />
                      <span>{template.rating}</span>
                    </div>
                  </div>
                  <div className="t-card-tags">
                    {template.tags.map((tag, idx) => (
                      <span key={idx} className="t-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="t-card-features">
                    {template.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="t-feature">
                        <CheckCircle className="t-feature-icon" />
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="t-card-footer">
                    <div className="t-card-meta">
                      <span>{template.widgets} widgets</span>
                      <span>•</span>
                      <span>{template.uses} uses</span>
                    </div>
                    <div className="t-card-actions">
                      <button 
                        className="t-preview-btn"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="t-btn-icon" />
                        Preview
                      </button>
                      <button 
                        className="t-use-btn"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <Plus className="t-btn-icon" />
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="t-list">
          {filteredTemplates.length === 0 ? (
            <div className="t-empty t-list-empty">
              <Layout className="t-empty-icon" />
              <h3 className="t-empty-title">No templates found</h3>
              <p className="t-empty-subtitle">Try adjusting your filters or search term</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div key={template.id} className="t-list-item">
                <div className="t-list-item-icon">
                  {getIcon(template.icon)}
                </div>
                <div className="t-list-item-content">
                  <div className="t-list-item-header">
                    <h3 className="t-list-item-title">{template.name}</h3>
                    <span className={`t-list-item-category ${getCategoryColor(template.category)}`}>
                      {getCategoryLabel(template.category)}
                    </span>
                  </div>
                  <p className="t-list-item-description">{template.description}</p>
                  <div className="t-list-item-tags">
                    {template.tags.map((tag, idx) => (
                      <span key={idx} className="t-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="t-list-item-meta">
                    <span>{template.widgets} widgets</span>
                    <span>•</span>
                    <span>{template.uses} uses</span>
                    <span>•</span>
                    <span className="t-list-item-rating">
                      <Star className="t-list-item-star" />
                      {template.rating}
                    </span>
                  </div>
                </div>
                <div className="t-list-item-actions">
                  <button 
                    className="t-preview-btn"
                    onClick={() => handlePreview(template)}
                  >
                    <Eye className="t-btn-icon" />
                    Preview
                  </button>
                  <button 
                    className="t-use-btn"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <Plus className="t-btn-icon" />
                    Use
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="t-modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="t-modal" onClick={(e) => e.stopPropagation()}>
            <div className="t-modal-header">
              <div className="t-modal-header-left">
                <div className="t-modal-icon">
                  {getIcon(selectedTemplate.icon)}
                </div>
                <div>
                  <h3 className="t-modal-title">{selectedTemplate.name}</h3>
                  <span className={`t-modal-category ${getCategoryColor(selectedTemplate.category)}`}>
                    {getCategoryLabel(selectedTemplate.category)}
                  </span>
                </div>
              </div>
              <button className="t-modal-close" onClick={() => setShowPreview(false)}>
                <X className="t-modal-close-icon" />
              </button>
            </div>
            <div className="t-modal-body">
              <div className="t-modal-preview">
                <div className="t-modal-preview-content">
                  {getIcon(selectedTemplate.icon)}
                  <span className="t-modal-preview-label">Dashboard Preview</span>
                  <p className="t-modal-preview-desc">{selectedTemplate.description}</p>
                </div>
              </div>
              <div className="t-modal-details">
                <div className="t-modal-details-grid">
                  <div className="t-modal-detail">
                    <span className="t-modal-detail-label">Widgets</span>
                    <span className="t-modal-detail-value">{selectedTemplate.widgets}</span>
                  </div>
                  <div className="t-modal-detail">
                    <span className="t-modal-detail-label">Uses</span>
                    <span className="t-modal-detail-value">{selectedTemplate.uses}</span>
                  </div>
                  <div className="t-modal-detail">
                    <span className="t-modal-detail-label">Rating</span>
                    <span className="t-modal-detail-value">
                      <Star className="t-modal-detail-star" />
                      {selectedTemplate.rating}
                    </span>
                  </div>
                  <div className="t-modal-detail">
                    <span className="t-modal-detail-label">Category</span>
                    <span className="t-modal-detail-value">{getCategoryLabel(selectedTemplate.category)}</span>
                  </div>
                </div>
                <div className="t-modal-features">
                  <h4 className="t-modal-features-title">Features</h4>
                  <div className="t-modal-features-list">
                    {selectedTemplate.features.map((feature, idx) => (
                      <span key={idx} className="t-modal-feature">
                        <CheckCircle className="t-modal-feature-icon" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="t-modal-tags">
                  <h4 className="t-modal-tags-title">Tags</h4>
                  <div className="t-modal-tags-list">
                    {selectedTemplate.tags.map((tag, idx) => (
                      <span key={idx} className="t-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="t-modal-footer">
              <button className="t-modal-close-btn" onClick={() => setShowPreview(false)}>
                Close
              </button>
              <button 
                className="t-modal-use-btn"
                onClick={() => {
                  handleUseTemplate(selectedTemplate);
                  setShowPreview(false);
                }}
              >
                <Plus className="t-btn-icon" />
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .t-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           HEADER
           ============================================ */
        .t-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .t-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .t-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .t-title-icon {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }

        .t-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .t-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .t-refresh-btn {
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

        .t-refresh-btn:hover {
          background: #f3f4f6;
        }

        .t-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        /* ============================================
           STATS
           ============================================ */
        .t-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .t-stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
        }

        .t-stat-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .t-stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-top: 2px;
        }

        .t-stat-highlight {
          color: #3b82f6;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .t-filters {
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

        .t-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .t-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        .t-search-input {
          width: 100%;
          padding: 6px 36px 6px 36px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
        }

        .t-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .t-search-clear {
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

        .t-search-clear:hover {
          color: #6b7280;
        }

        .t-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .t-filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .t-filter-select {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          min-width: 150px;
        }

        .t-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .t-view-toggle {
          display: flex;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          overflow: hidden;
          background: #ffffff;
        }

        .t-view-btn {
          padding: 4px 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .t-view-btn:hover {
          background: #f3f4f6;
        }

        .t-view-active {
          background: #3b82f6;
          color: #ffffff;
        }

        .t-view-active:hover {
          background: #2563eb;
        }

        .t-view-icon {
          width: 16px;
          height: 16px;
        }

        .t-clear-btn {
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

        .t-clear-btn:hover {
          background: #f3f4f6;
        }

        .t-clear-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           GRID VIEW
           ============================================ */
        .t-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        @media (max-width: 768px) {
          .t-grid {
            grid-template-columns: 1fr;
          }
        }

        .t-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .t-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .t-card-preview {
          height: 120px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .t-card-preview-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #ffffff;
          opacity: 0.8;
        }

        .t-card-preview-content .t-icon {
          width: 36px;
          height: 36px;
          margin-bottom: 4px;
        }

        .t-card-preview-label {
          font-size: 12px;
        }

        .t-card-category {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          background: rgba(255,255,255,0.9);
        }

        .t-category-executive { background: rgba(255,255,255,0.9); color: #3b82f6; }
        .t-category-sales { background: rgba(255,255,255,0.9); color: #22c55e; }
        .t-category-project { background: rgba(255,255,255,0.9); color: #f59e0b; }
        .t-category-hr { background: rgba(255,255,255,0.9); color: #8b5cf6; }
        .t-category-marketing { background: rgba(255,255,255,0.9); color: #ec4899; }
        .t-category-client { background: rgba(255,255,255,0.9); color: #14b8a6; }
        .t-category-financial { background: rgba(255,255,255,0.9); color: #059669; }
        .t-category-operations { background: rgba(255,255,255,0.9); color: #6b7280; }
        .t-category-default { background: rgba(255,255,255,0.9); color: #6b7280; }

        .t-card-body {
          padding: 16px;
        }

        .t-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .t-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .t-card-description {
          font-size: 13px;
          color: #6b7280;
          margin: 4px 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .t-card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          flex-shrink: 0;
        }

        .t-card-star {
          width: 16px;
          height: 16px;
          color: #f59e0b;
          fill: #f59e0b;
        }

        .t-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 8px;
        }

        .t-tag {
          padding: 2px 8px;
          font-size: 11px;
          background: #f3f4f6;
          color: #6b7280;
          border-radius: 4px;
        }

        .t-card-features {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
        }

        .t-feature {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
        }

        .t-feature-icon {
          width: 14px;
          height: 14px;
          color: #22c55e;
        }

        .t-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        }

        .t-card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #9ca3af;
        }

        .t-card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .t-btn-icon {
          width: 14px;
          height: 14px;
        }

        .t-preview-btn {
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

        .t-preview-btn:hover {
          background: #f3f4f6;
        }

        .t-use-btn {
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
        }

        .t-use-btn:hover {
          background: #2563eb;
        }

        /* ============================================
           LIST VIEW
           ============================================ */
        .t-list {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .t-list-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          transition: all 0.2s ease;
        }

        .t-list-item:last-child {
          border-bottom: none;
        }

        .t-list-item:hover {
          background: #f9fafb;
        }

        .t-list-item-icon {
          width: 48px;
          height: 48px;
          background: #eff6ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .t-list-item-icon .t-icon {
          width: 24px;
          height: 24px;
          color: #3b82f6;
        }

        .t-list-item-content {
          flex: 1;
          min-width: 0;
        }

        .t-list-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .t-list-item-title {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .t-list-item-category {
          padding: 1px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .t-list-item-description {
          font-size: 13px;
          color: #6b7280;
          margin: 4px 0 0 0;
        }

        .t-list-item-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 6px;
        }

        .t-list-item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
          font-size: 12px;
          color: #9ca3af;
        }

        .t-list-item-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #111827;
          font-weight: 500;
        }

        .t-list-item-star {
          width: 14px;
          height: 14px;
          color: #f59e0b;
          fill: #f59e0b;
        }

        .t-list-item-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .t-empty {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .t-empty-icon {
          width: 48px;
          height: 48px;
          color: #d1d5db;
          margin-bottom: 12px;
        }

        .t-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .t-empty-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }

        .t-list-empty {
          padding: 40px 20px;
        }

        /* ============================================
           MODAL
           ============================================ */
        .t-modal-overlay {
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

        .t-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 640px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          animation: modalSlideIn 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .t-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .t-modal-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .t-modal-icon {
          width: 44px;
          height: 44px;
          background: #eff6ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .t-modal-icon .t-icon {
          width: 22px;
          height: 22px;
          color: #3b82f6;
        }

        .t-modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .t-modal-category {
          padding: 1px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .t-modal-close {
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
        }

        .t-modal-close:hover {
          background: #f3f4f6;
        }

        .t-modal-close-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
        }

        .t-modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .t-modal-preview {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          padding: 40px;
          text-align: center;
          color: #ffffff;
          margin-bottom: 20px;
        }

        .t-modal-preview-content .t-icon {
          width: 48px;
          height: 48px;
          opacity: 0.8;
        }

        .t-modal-preview-label {
          display: block;
          font-size: 16px;
          font-weight: 500;
          margin-top: 8px;
        }

        .t-modal-preview-desc {
          font-size: 14px;
          opacity: 0.8;
          margin-top: 4px;
        }

        .t-modal-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        @media (max-width: 480px) {
          .t-modal-details-grid {
            grid-template-columns: 1fr;
          }
        }

        .t-modal-detail {
          display: flex;
          flex-direction: column;
          padding: 8px 12px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .t-modal-detail-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .t-modal-detail-value {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .t-modal-detail-star {
          width: 16px;
          height: 16px;
          color: #f59e0b;
          fill: #f59e0b;
        }

        .t-modal-features {
          margin-bottom: 16px;
        }

        .t-modal-features-title,
        .t-modal-tags-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .t-modal-features-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .t-modal-feature {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
        }

        .t-modal-feature-icon {
          width: 16px;
          height: 16px;
          color: #22c55e;
        }

        .t-modal-tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .t-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 20px;
          border-top: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .t-modal-close-btn {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .t-modal-close-btn:hover {
          background: #f3f4f6;
        }

        .t-modal-use-btn {
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

        .t-modal-use-btn:hover {
          background: #2563eb;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .t-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .t-header-right {
            width: 100%;
          }

          .t-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .t-search-wrapper {
            min-width: 0;
          }

          .t-filter-group {
            width: 100%;
          }

          .t-filter-select {
            width: 100%;
          }

          .t-view-toggle {
            align-self: flex-start;
          }

          .t-stats {
            grid-template-columns: 1fr 1fr;
          }

          .t-list-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .t-list-item-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }

        @media (max-width: 480px) {
          .t-stats {
            grid-template-columns: 1fr;
          }

          .t-card-actions {
            flex-direction: column;
            width: 100%;
          }

          .t-preview-btn,
          .t-use-btn {
            width: 100%;
            justify-content: center;
          }

          .t-modal {
            margin: 12px;
          }

          .t-modal-details-grid {
            grid-template-columns: 1fr;
          }

          .t-modal-preview {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Templates;