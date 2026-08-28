// pages/kpi/KPIDefinition.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart2, Edit, Trash2, Eye, Plus,
  Target, TrendingUp, Users, CheckCircle,
  AlertCircle, Clock, Filter, Search,
  X, RefreshCw, Download, Zap,
  Award, Star, Layers, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const KPIDefinition = () => {
  const { token } = useAuth();
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchKPIs();
  }, [search, filterCategory]);

  const fetchKPIs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      
      const response = await fetch(
        `${API_URL}/kpis/definitions?${params.toString()}`,
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
          setKpis(result.data || []);
        } else {
          console.warn('API returned error:', result.message);
          setKpis(getMockKPIs());
          toast.info('Showing sample KPI data');
        }
      } else {
        console.warn('API request failed, using mock data');
        setKpis(getMockKPIs());
        toast.info('Showing sample KPI data');
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      setKpis(getMockKPIs());
      toast.error('Failed to load KPIs, showing sample data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockKPIs = () => {
    return [
      {
        _id: '1',
        name: 'Revenue Growth',
        description: 'Track monthly revenue growth percentage',
        category: 'financial',
        formula: '(Current Revenue - Previous Revenue) / Previous Revenue * 100',
        target: { value: 10, operator: '>=', unit: 'percentage' },
        weight: 2,
        appliesTo: 'company',
        frequency: 'monthly',
        isActive: true,
        applicableRoles: ['admin', 'manager']
      },
      {
        _id: '2',
        name: 'Customer Satisfaction Score',
        description: 'CSAT score from customer surveys',
        category: 'satisfaction',
        formula: 'Average of survey scores (1-5)',
        target: { value: 4.5, operator: '>=', unit: 'score' },
        weight: 1.5,
        appliesTo: 'department',
        frequency: 'monthly',
        isActive: true,
        applicableRoles: ['admin', 'manager', 'employee']
      },
      {
        _id: '3',
        name: 'Project Completion Rate',
        description: 'Percentage of projects completed on time',
        category: 'productivity',
        formula: '(Completed Projects / Total Projects) * 100',
        target: { value: 90, operator: '>=', unit: 'percentage' },
        weight: 1,
        appliesTo: 'team',
        frequency: 'weekly',
        isActive: false,
        applicableRoles: ['admin', 'manager']
      }
    ];
  };

  const handleRefresh = () => {
    fetchKPIs(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this KPI?')) return;
    
    try {
      const response = await fetch(
        `${API_URL}/kpis/definitions/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success('KPI deleted successfully');
        await fetchKPIs(true);
      } else {
        throw new Error('Failed to delete KPI');
      }
    } catch (error) {
      console.error('Error deleting KPI:', error);
      toast.error('Failed to delete KPI');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      productivity: 'kd-cat-productivity',
      quality: 'kd-cat-quality',
      efficiency: 'kd-cat-efficiency',
      satisfaction: 'kd-cat-satisfaction',
      growth: 'kd-cat-growth',
      retention: 'kd-cat-retention',
      financial: 'kd-cat-financial'
    };
    return colors[category] || 'kd-cat-default';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      productivity: 'Productivity',
      quality: 'Quality',
      efficiency: 'Efficiency',
      satisfaction: 'Satisfaction',
      growth: 'Growth',
      retention: 'Retention',
      financial: 'Financial'
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      productivity: TrendingUp,
      quality: CheckCircle,
      efficiency: Clock,
      satisfaction: Users,
      growth: Target,
      retention: Users,
      financial: BarChart2
    };
    const Icon = icons[category] || BarChart2;
    return <Icon className="kd-icon" />;
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly'
    };
    return labels[frequency] || frequency;
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'quality', label: 'Quality' },
    { value: 'efficiency', label: 'Efficiency' },
    { value: 'satisfaction', label: 'Satisfaction' },
    { value: 'growth', label: 'Growth' },
    { value: 'retention', label: 'Retention' },
    { value: 'financial', label: 'Financial' }
  ];

  if (loading) {
    return (
      <div className="kd-loading">
        <div className="kd-spinner"></div>
        <p className="kd-loading-text">Loading KPI definitions...</p>
      </div>
    );
  }

  return (
    <div className="kd-container">
      {/* Header */}
      <div className="kd-header">
        <div className="kd-header-left">
          <div className="kd-title-wrapper">
            <div className="kd-title-icon">
              <BarChart2 className="kd-title-svg" />
            </div>
            <div>
              <h3 className="kd-title">KPI Definitions</h3>
              <p className="kd-subtitle">Define and manage Key Performance Indicators</p>
            </div>
          </div>
          <span className="kd-count">{kpis.length} KPIs</span>
        </div>
        <div className="kd-header-right">
          <button className="kd-icon-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`kd-refresh-icon ${refreshing ? 'kd-spin' : ''}`} />
          </button>
          <button className="kd-icon-btn">
            <Download className="kd-btn-icon" />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="kd-create-btn"
          >
            <Plus className="kd-btn-icon" />
            New KPI
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="kd-filters">
        <div className="kd-search-wrapper">
          <Search className="kd-search-icon" />
          <input
            type="text"
            placeholder="Search KPIs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="kd-search-input"
          />
          {search && (
            <button className="kd-search-clear" onClick={() => setSearch('')}>
              <X className="kd-search-clear-icon" />
            </button>
          )}
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="kd-filter-select"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <button className="kd-filter-btn">
          <Filter className="kd-btn-icon" />
          More Filters
        </button>
      </div>

      {/* KPI Grid */}
      <div className="kd-grid">
        {kpis.map((kpi) => (
          <div 
            key={kpi._id} 
            className="kd-card"
            onClick={() => {
              setSelectedKPI(kpi);
              setShowDetails(true);
            }}
          >
            <div className="kd-card-header">
              <div className="kd-card-left">
                <div className={`kd-card-icon ${getCategoryColor(kpi.category)}`}>
                  {getCategoryIcon(kpi.category)}
                </div>
                <div className="kd-card-info">
                  <h4 className="kd-card-title">{kpi.name}</h4>
                  <p className="kd-card-category">{getCategoryLabel(kpi.category)}</p>
                </div>
              </div>
              <div className="kd-card-actions">
                <button 
                  className="kd-action-btn kd-action-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Edit action - navigate to edit page
                    toast.info('Edit functionality coming soon');
                  }}
                >
                  <Edit className="kd-action-icon" />
                </button>
                <button 
                  className="kd-action-btn kd-action-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(kpi._id);
                  }}
                >
                  <Trash2 className="kd-action-icon" />
                </button>
              </div>
            </div>
            
            <p className="kd-card-desc">{kpi.description || 'No description'}</p>
            
            <div className="kd-card-badges">
              <span className={`kd-badge ${getCategoryColor(kpi.category)}`}>
                {getCategoryLabel(kpi.category)}
              </span>
              <span className="kd-badge kd-badge-gray">{kpi.appliesTo}</span>
              <span className="kd-badge kd-badge-gray">{getFrequencyLabel(kpi.frequency)}</span>
              <span className={`kd-badge ${kpi.isActive ? 'kd-badge-active' : 'kd-badge-inactive'}`}>
                {kpi.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="kd-card-footer">
              <div className="kd-card-stats">
                <span className="kd-stat">
                  <Target className="kd-stat-icon" />
                  Target: {kpi.target?.operator} {kpi.target?.value}
                </span>
                <span className="kd-stat">
                  <Zap className="kd-stat-icon" />
                  Weight: {kpi.weight || 1}
                </span>
              </div>
              {kpi.formula && (
                <div className="kd-card-formula">
                  <span className="kd-formula-label">Formula:</span>
                  <span className="kd-formula-text">{kpi.formula}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {kpis.length === 0 && (
        <div className="kd-empty">
          <div className="kd-empty-icon-wrapper">
            <BarChart2 className="kd-empty-icon" />
          </div>
          <h3 className="kd-empty-title">No KPIs Found</h3>
          <p className="kd-empty-subtitle">Create your first KPI to start tracking performance</p>
          <button className="kd-empty-btn" onClick={() => setShowCreateModal(true)}>
            <Plus className="kd-btn-icon" />
            Create KPI
          </button>
        </div>
      )}

      {/* KPI Details Modal */}
      {showDetails && selectedKPI && (
        <div className="kd-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="kd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <div className="kd-modal-title-wrapper">
                <div className={`kd-modal-icon ${getCategoryColor(selectedKPI.category)}`}>
                  {getCategoryIcon(selectedKPI.category)}
                </div>
                <div>
                  <h2 className="kd-modal-title">{selectedKPI.name}</h2>
                  <p className="kd-modal-subtitle">{getCategoryLabel(selectedKPI.category)}</p>
                </div>
              </div>
              <button className="kd-modal-close" onClick={() => setShowDetails(false)}>
                <X className="kd-modal-close-icon" />
              </button>
            </div>
            
            <div className="kd-modal-body">
              <div className="kd-modal-section">
                <h4 className="kd-modal-label">Description</h4>
                <p className="kd-modal-text">{selectedKPI.description || 'No description provided'}</p>
              </div>
              
              <div className="kd-modal-grid">
                <div className="kd-modal-item">
                  <h4 className="kd-modal-label">Applies To</h4>
                  <p className="kd-modal-value">{selectedKPI.appliesTo}</p>
                </div>
                <div className="kd-modal-item">
                  <h4 className="kd-modal-label">Frequency</h4>
                  <p className="kd-modal-value">{getFrequencyLabel(selectedKPI.frequency)}</p>
                </div>
                <div className="kd-modal-item">
                  <h4 className="kd-modal-label">Status</h4>
                  <span className={`kd-modal-status ${selectedKPI.isActive ? 'kd-status-active' : 'kd-status-inactive'}`}>
                    {selectedKPI.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="kd-modal-item">
                  <h4 className="kd-modal-label">Weight</h4>
                  <p className="kd-modal-value">{selectedKPI.weight || 1}</p>
                </div>
              </div>
              
              <div className="kd-modal-section">
                <h4 className="kd-modal-label">Formula</h4>
                <div className="kd-modal-formula">
                  <code>{selectedKPI.formula || 'N/A'}</code>
                </div>
              </div>
              
              <div className="kd-modal-section">
                <h4 className="kd-modal-label">Target</h4>
                <div className="kd-modal-target">
                  <span className="kd-modal-target-value">
                    {selectedKPI.target?.operator} {selectedKPI.target?.value}
                  </span>
                  <span className="kd-modal-target-unit">
                    {selectedKPI.target?.unit || 'Number'}
                  </span>
                </div>
              </div>
              
              {selectedKPI.applicableRoles && selectedKPI.applicableRoles.length > 0 && (
                <div className="kd-modal-section">
                  <h4 className="kd-modal-label">Applicable Roles</h4>
                  <div className="kd-modal-roles">
                    {selectedKPI.applicableRoles.map((role, idx) => (
                      <span key={idx} className="kd-modal-role">
                        {role.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="kd-modal-footer">
              <button
                onClick={() => setShowDetails(false)}
                className="kd-modal-cancel"
              >
                Close
              </button>
              <button 
                className="kd-modal-edit"
                onClick={() => {
                  setShowDetails(false);
                  toast.info('Edit functionality coming soon');
                }}
              >
                <Edit className="kd-btn-icon" />
                Edit KPI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .kd-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: kdFadeIn 0.4s ease;
        }

        @keyframes kdFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .kd-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .kd-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: kdSpin 0.8s linear infinite;
        }

        .kd-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes kdSpin {
          to { transform: rotate(360deg); }
        }

        .kd-spin {
          animation: kdSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .kd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .kd-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .kd-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .kd-title-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .kd-title-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .kd-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .kd-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .kd-count {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 14px;
          border-radius: 12px;
        }

        .kd-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .kd-icon-btn {
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

        .kd-icon-btn:hover {
          background: #f1f5f9;
        }

        .kd-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .kd-btn-icon {
          width: 16px;
          height: 16px;
        }

        .kd-create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }

        .kd-create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .kd-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .kd-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .kd-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .kd-search-input {
          width: 100%;
          padding: 8px 36px 8px 36px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
        }

        .kd-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .kd-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }

        .kd-search-clear:hover {
          background: #f1f5f9;
        }

        .kd-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .kd-filter-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 160px;
        }

        .kd-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .kd-filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
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

        .kd-filter-btn:hover {
          background: #f1f5f9;
        }

        /* ============================================
           GRID
           ============================================ */
        .kd-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .kd-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          animation: kdSlideUp 0.4s ease both;
        }

        .kd-card:nth-child(1) { animation-delay: 0.05s; }
        .kd-card:nth-child(2) { animation-delay: 0.1s; }
        .kd-card:nth-child(3) { animation-delay: 0.15s; }

        @keyframes kdSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .kd-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: #d1d5db;
        }

        .kd-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .kd-card-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .kd-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kd-cat-productivity { background: #dbeafe; color: #1d4ed8; }
        .kd-cat-quality { background: #d1fae5; color: #065f46; }
        .kd-cat-efficiency { background: #f3e8ff; color: #6d28d9; }
        .kd-cat-satisfaction { background: #fef3c7; color: #92400e; }
        .kd-cat-growth { background: #d1fae5; color: #065f46; }
        .kd-cat-retention { background: #ffedd5; color: #9a3412; }
        .kd-cat-financial { background: #fee2e2; color: #991b1b; }
        .kd-cat-default { background: #f3f4f6; color: #374151; }

        .kd-icon {
          width: 20px;
          height: 20px;
        }

        .kd-card-info {
          flex: 1;
          min-width: 0;
        }

        .kd-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .kd-card-category {
          font-size: 13px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .kd-card-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }

        .kd-action-btn {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #94a3b8;
          display: flex;
          align-items: center;
        }

        .kd-action-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .kd-action-edit:hover {
          background: #eff6ff;
          color: #3b82f6;
        }

        .kd-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .kd-action-icon {
          width: 16px;
          height: 16px;
        }

        .kd-card-desc {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .kd-card-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .kd-badge {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .kd-badge-gray { background: #f1f5f9; color: #475569; }
        .kd-badge-active { background: #d1fae5; color: #065f46; }
        .kd-badge-inactive { background: #f3f4f6; color: #6b7280; }

        .kd-card-footer {
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .kd-card-stats {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 13px;
          color: #64748b;
        }

        .kd-stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .kd-stat-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .kd-card-formula {
          margin-top: 6px;
          font-size: 12px;
          color: #94a3b8;
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .kd-formula-label {
          font-weight: 500;
          color: #64748b;
        }

        .kd-formula-text {
          font-family: monospace;
          color: #475569;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .kd-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .kd-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .kd-empty-icon {
          width: 36px;
          height: 36px;
          color: #94a3b8;
        }

        .kd-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .kd-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .kd-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .kd-empty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        /* ============================================
           MODAL
           ============================================ */
        .kd-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: kdFadeIn 0.3s ease;
        }

        .kd-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: kdModalIn 0.3s ease;
        }

        @keyframes kdModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .kd-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .kd-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .kd-modal-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kd-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .kd-modal-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .kd-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: none;
          background: #f1f5f9;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .kd-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .kd-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        .kd-modal-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .kd-modal-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .kd-modal-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .kd-modal-text {
          font-size: 14px;
          color: #0f172a;
          margin: 0;
        }

        .kd-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .kd-modal-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .kd-modal-value {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
          margin: 0;
        }

        .kd-modal-status {
          font-size: 13px;
          font-weight: 500;
          padding: 2px 12px;
          border-radius: 12px;
          display: inline-block;
        }

        .kd-status-active {
          background: #d1fae5;
          color: #065f46;
        }

        .kd-status-inactive {
          background: #f1f5f9;
          color: #64748b;
        }

        .kd-modal-formula {
          background: #f8fafc;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .kd-modal-formula code {
          font-size: 14px;
          color: #0f172a;
          font-family: monospace;
        }

        .kd-modal-target {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .kd-modal-target-value {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .kd-modal-target-unit {
          font-size: 13px;
          color: #64748b;
        }

        .kd-modal-roles {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .kd-modal-role {
          padding: 2px 10px;
          background: #f1f5f9;
          border-radius: 12px;
          font-size: 12px;
          color: #475569;
        }

        .kd-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
        }

        .kd-modal-cancel {
          padding: 8px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .kd-modal-cancel:hover {
          background: #f1f5f9;
        }

        .kd-modal-edit {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .kd-modal-edit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .kd-container {
            padding: 16px;
          }

          .kd-header {
            flex-direction: column;
            align-items: stretch;
          }

          .kd-header-right {
            flex-wrap: wrap;
          }

          .kd-create-btn {
            flex: 1;
            justify-content: center;
          }

          .kd-filters {
            flex-direction: column;
          }

          .kd-search-wrapper {
            width: 100%;
          }

          .kd-filter-select {
            width: 100%;
          }

          .kd-filter-btn {
            width: 100%;
            justify-content: center;
          }

          .kd-grid {
            grid-template-columns: 1fr;
          }

          .kd-title {
            font-size: 22px;
          }

          .kd-title-icon {
            width: 40px;
            height: 40px;
          }

          .kd-title-svg {
            width: 20px;
            height: 20px;
          }

          .kd-modal {
            margin: 16px;
            max-height: 95vh;
          }

          .kd-modal-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .kd-container {
            padding: 12px;
          }

          .kd-header-right {
            flex-direction: column;
          }

          .kd-create-btn {
            width: 100%;
          }

          .kd-icon-btn {
            align-self: flex-end;
          }

          .kd-title-wrapper {
            gap: 10px;
          }

          .kd-title {
            font-size: 20px;
          }

          .kd-subtitle {
            font-size: 13px;
          }

          .kd-modal {
            padding: 0;
          }

          .kd-modal-header {
            padding: 16px 18px;
          }

          .kd-modal-body {
            padding: 16px 18px;
          }

          .kd-modal-footer {
            flex-direction: column;
          }

          .kd-modal-cancel,
          .kd-modal-edit {
            width: 100%;
            justify-content: center;
          }
        }

        /* Scrollbar */
        .kd-modal::-webkit-scrollbar {
          width: 6px;
        }

        .kd-modal::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }

        .kd-modal::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }

        .kd-modal::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default KPIDefinition;