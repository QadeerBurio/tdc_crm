// pages/kpi/KPIList.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart2, Search, Filter, ChevronDown, ChevronRight,
  Edit, Trash2, Eye, Plus, TrendingUp, Target,
  CheckCircle, AlertCircle, Clock, Users,
  RefreshCw, X, Zap, Award, Star, Layers, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const KPIList = () => {
  const { token } = useAuth();
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    appliesTo: 'all',
    isActive: 'all'
  });
  const [expanded, setExpanded] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchKPIs();
  }, [search, filters]);

  const fetchKPIs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.appliesTo !== 'all') params.append('appliesTo', filters.appliesTo);
      if (filters.isActive !== 'all') params.append('isActive', filters.isActive === 'true');
      
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
      },
      {
        _id: '4',
        name: 'Employee Engagement',
        description: 'Employee engagement survey scores',
        category: 'growth',
        formula: 'Average engagement score (1-10)',
        target: { value: 8, operator: '>=', unit: 'score' },
        weight: 1.5,
        appliesTo: 'company',
        frequency: 'monthly',
        isActive: true,
        applicableRoles: ['admin', 'manager', 'hr']
      },
      {
        _id: '5',
        name: 'Client Retention Rate',
        description: 'Percentage of clients retained',
        category: 'retention',
        formula: '(Clients Retained / Total Clients) * 100',
        target: { value: 85, operator: '>=', unit: 'percentage' },
        weight: 2,
        appliesTo: 'company',
        frequency: 'monthly',
        isActive: true,
        applicableRoles: ['admin', 'manager', 'sales']
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
      productivity: 'kl-cat-productivity',
      quality: 'kl-cat-quality',
      efficiency: 'kl-cat-efficiency',
      satisfaction: 'kl-cat-satisfaction',
      growth: 'kl-cat-growth',
      retention: 'kl-cat-retention',
      financial: 'kl-cat-financial'
    };
    return colors[category] || 'kl-cat-default';
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
    return <Icon className="kl-icon" />;
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

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      appliesTo: 'all',
      isActive: 'all'
    });
    setSearch('');
  };

  const hasActiveFilters = filters.category !== 'all' || filters.appliesTo !== 'all' || filters.isActive !== 'all' || search;

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

  const appliesToOptions = [
    { value: 'all', label: 'All' },
    { value: 'company', label: 'Company' },
    { value: 'segment', label: 'Segment' },
    { value: 'department', label: 'Department' },
    { value: 'team', label: 'Team' },
    { value: 'employee', label: 'Employee' },
    { value: 'project', label: 'Project' },
    { value: 'client', label: 'Client' }
  ];

  if (loading) {
    return (
      <div className="kl-loading">
        <div className="kl-spinner"></div>
        <p className="kl-loading-text">Loading KPIs...</p>
      </div>
    );
  }

  return (
    <div className="kl-container">
      {/* Header */}
      <div className="kl-header">
        <div className="kl-header-left">
          <div className="kl-title-wrapper">
            <div className="kl-title-icon">
              <BarChart2 className="kl-title-svg" />
            </div>
            <div>
              <h3 className="kl-title">KPI List</h3>
              <p className="kl-subtitle">Manage and track Key Performance Indicators</p>
            </div>
          </div>
          <span className="kl-count">{kpis.length} KPIs</span>
        </div>
        <div className="kl-header-right">
          <button className="kl-icon-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`kl-refresh-icon ${refreshing ? 'kl-spin' : ''}`} />
          </button>
          <button className="kl-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="kl-btn-icon" />
            Filters
            <ChevronDown className={`kl-chevron ${showFilters ? 'kl-chevron-open' : ''}`} />
          </button>
          <button className="kl-create-btn">
            <Plus className="kl-btn-icon" />
            New KPI
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`kl-filters ${showFilters ? 'kl-filters-open' : 'kl-filters-closed'}`}>
        <div className="kl-filters-row">
          <div className="kl-search-wrapper">
            <Search className="kl-search-icon" />
            <input
              type="text"
              placeholder="Search KPIs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="kl-search-input"
            />
            {search && (
              <button className="kl-search-clear" onClick={() => setSearch('')}>
                <X className="kl-search-clear-icon" />
              </button>
            )}
          </div>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="kl-filter-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            value={filters.appliesTo}
            onChange={(e) => setFilters(prev => ({ ...prev, appliesTo: e.target.value }))}
            className="kl-filter-select"
          >
            {appliesToOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filters.isActive}
            onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
            className="kl-filter-select"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          {hasActiveFilters && (
            <button className="kl-clear-filters" onClick={clearFilters}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* KPI Table */}
      <div className="kl-table-wrapper">
        <div className="kl-table-container">
          <table className="kl-table">
            <thead>
              <tr>
                <th className="kl-th">Name</th>
                <th className="kl-th">Category</th>
                <th className="kl-th">Applies To</th>
                <th className="kl-th">Formula</th>
                <th className="kl-th">Target</th>
                <th className="kl-th">Status</th>
                <th className="kl-th kl-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((kpi) => (
                <tr key={kpi._id} className="kl-row">
                  <td className="kl-td">
                    <div className="kl-name-cell">
                      <div className={`kl-name-icon ${getCategoryColor(kpi.category)}`}>
                        {getCategoryIcon(kpi.category)}
                      </div>
                      <div>
                        <span className="kl-name">{kpi.name}</span>
                        {kpi.description && (
                          <p className="kl-desc">{kpi.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="kl-td">
                    <span className={`kl-badge ${getCategoryColor(kpi.category)}`}>
                      {getCategoryLabel(kpi.category)}
                    </span>
                  </td>
                  <td className="kl-td kl-td-applies">
                    {kpi.appliesTo}
                  </td>
                  <td className="kl-td">
                    <code className="kl-formula">{kpi.formula || 'N/A'}</code>
                  </td>
                  <td className="kl-td kl-td-target">
                    {kpi.target?.operator} {kpi.target?.value}
                    {kpi.target?.unit === 'percentage' && '%'}
                  </td>
                  <td className="kl-td">
                    <span className={`kl-status ${kpi.isActive ? 'kl-status-active' : 'kl-status-inactive'}`}>
                      {kpi.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="kl-td kl-td-actions">
                    <div className="kl-actions">
                      <button className="kl-action kl-action-view" title="View">
                        <Eye className="kl-action-icon" />
                      </button>
                      <button className="kl-action kl-action-edit" title="Edit">
                        <Edit className="kl-action-icon" />
                      </button>
                      <button className="kl-action kl-action-delete" onClick={() => handleDelete(kpi._id)} title="Delete">
                        <Trash2 className="kl-action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {kpis.length === 0 && (
                <tr>
                  <td colSpan="7" className="kl-empty">
                    <div className="kl-empty-content">
                      <BarChart2 className="kl-empty-icon" />
                      <p className="kl-empty-text">No KPIs found</p>
                      <p className="kl-empty-subtext">Create your first KPI to start tracking performance</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .kl-container {
          padding: 20px 24px;
          max-width: 1400px;
          margin: 0 auto;
          animation: klFadeIn 0.4s ease;
        }

        @keyframes klFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .kl-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .kl-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: klSpin 0.8s linear infinite;
        }

        .kl-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes klSpin {
          to { transform: rotate(360deg); }
        }

        .kl-spin {
          animation: klSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .kl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .kl-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .kl-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .kl-title-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .kl-title-svg {
          width: 22px;
          height: 22px;
          color: #ffffff;
        }

        .kl-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .kl-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .kl-count {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 12px;
          border-radius: 12px;
        }

        .kl-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .kl-icon-btn {
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

        .kl-icon-btn:hover {
          background: #f1f5f9;
        }

        .kl-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .kl-btn-icon {
          width: 16px;
          height: 16px;
        }

        .kl-filter-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .kl-filter-toggle:hover {
          background: #f1f5f9;
        }

        .kl-chevron {
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
        }

        .kl-chevron-open {
          transform: rotate(180deg);
        }

        .kl-create-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .kl-create-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .kl-filters {
          overflow: hidden;
          transition: all 0.3s ease;
          margin-bottom: 16px;
        }

        .kl-filters-open {
          max-height: 200px;
          opacity: 1;
        }

        .kl-filters-closed {
          max-height: 0;
          opacity: 0;
          margin-bottom: 0;
        }

        .kl-filters-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          flex-wrap: wrap;
        }

        .kl-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 180px;
        }

        .kl-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .kl-search-input {
          width: 100%;
          padding: 6px 32px 6px 34px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
        }

        .kl-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .kl-search-clear {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          padding: 2px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }

        .kl-search-clear:hover {
          background: #f1f5f9;
        }

        .kl-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .kl-filter-select {
          padding: 6px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 120px;
        }

        .kl-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .kl-clear-filters {
          padding: 6px 14px;
          background: #fee2e2;
          color: #ef4444;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .kl-clear-filters:hover {
          background: #fecaca;
        }

        /* ============================================
           TABLE
           ============================================ */
        .kl-table-wrapper {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .kl-table-container {
          overflow-x: auto;
        }

        .kl-table {
          width: 100%;
          border-collapse: collapse;
        }

        .kl-th {
          padding: 10px 14px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          white-space: nowrap;
        }

        .kl-th-actions {
          text-align: right;
        }

        .kl-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s ease;
        }

        .kl-row:hover {
          background: #f8fafc;
        }

        .kl-row:last-child {
          border-bottom: none;
        }

        .kl-td {
          padding: 10px 14px;
          font-size: 14px;
          color: #0f172a;
          vertical-align: middle;
        }

        .kl-td-actions {
          text-align: right;
        }

        .kl-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .kl-name-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kl-cat-productivity { background: #dbeafe; color: #1d4ed8; }
        .kl-cat-quality { background: #d1fae5; color: #065f46; }
        .kl-cat-efficiency { background: #f3e8ff; color: #6d28d9; }
        .kl-cat-satisfaction { background: #fef3c7; color: #92400e; }
        .kl-cat-growth { background: #d1fae5; color: #065f46; }
        .kl-cat-retention { background: #ffedd5; color: #9a3412; }
        .kl-cat-financial { background: #fee2e2; color: #991b1b; }
        .kl-cat-default { background: #f3f4f6; color: #374151; }

        .kl-icon {
          width: 16px;
          height: 16px;
        }

        .kl-name {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .kl-desc {
          font-size: 12px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .kl-badge {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 12px;
          display: inline-block;
        }

        .kl-td-applies {
          text-transform: capitalize;
        }

        .kl-formula {
          font-size: 12px;
          font-family: monospace;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 4px;
          color: #475569;
          display: inline-block;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .kl-td-target {
          font-weight: 500;
        }

        .kl-status {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 12px;
          display: inline-block;
        }

        .kl-status-active {
          background: #d1fae5;
          color: #065f46;
        }

        .kl-status-inactive {
          background: #f1f5f9;
          color: #64748b;
        }

        .kl-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 2px;
        }

        .kl-action {
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

        .kl-action:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .kl-action-view:hover {
          background: #eff6ff;
          color: #3b82f6;
        }

        .kl-action-edit:hover {
          background: #ecfdf5;
          color: #22c55e;
        }

        .kl-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .kl-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .kl-empty {
          padding: 40px 20px;
          text-align: center;
        }

        .kl-empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .kl-empty-icon {
          width: 48px;
          height: 48px;
          color: #d1d5db;
        }

        .kl-empty-text {
          font-size: 16px;
          font-weight: 500;
          color: #0f172a;
          margin: 0;
        }

        .kl-empty-subtext {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .kl-container {
            padding: 16px;
          }

          .kl-header {
            flex-direction: column;
            align-items: stretch;
          }

          .kl-header-right {
            flex-wrap: wrap;
          }

          .kl-create-btn {
            flex: 1;
            justify-content: center;
          }

          .kl-filter-toggle {
            flex: 1;
            justify-content: center;
          }

          .kl-filters-row {
            flex-direction: column;
            align-items: stretch;
          }

          .kl-search-wrapper {
            width: 100%;
          }

          .kl-filter-select {
            width: 100%;
            min-width: unset;
          }

          .kl-clear-filters {
            align-self: stretch;
          }

          .kl-th,
          .kl-td {
            padding: 8px 10px;
            font-size: 12px;
          }

          .kl-name-cell {
            flex-direction: column;
            align-items: flex-start;
          }

          .kl-formula {
            max-width: 120px;
          }

          .kl-actions {
            flex-direction: column;
            align-items: flex-end;
          }

          .kl-title {
            font-size: 18px;
          }

          .kl-title-icon {
            width: 36px;
            height: 36px;
          }

          .kl-title-svg {
            width: 18px;
            height: 18px;
          }
        }

        @media (max-width: 480px) {
          .kl-container {
            padding: 12px;
          }

          .kl-header-right {
            flex-direction: column;
          }

          .kl-create-btn {
            width: 100%;
          }

          .kl-filter-toggle {
            width: 100%;
          }

          .kl-icon-btn {
            align-self: flex-end;
          }

          .kl-title-wrapper {
            gap: 8px;
          }

          .kl-title {
            font-size: 16px;
          }

          .kl-subtitle {
            font-size: 13px;
          }

          .kl-name {
            font-size: 13px;
          }

          .kl-formula {
            max-width: 80px;
            font-size: 10px;
          }

          .kl-th,
          .kl-td {
            padding: 6px 8px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default KPIList;