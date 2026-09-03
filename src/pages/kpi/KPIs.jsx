// pages/kpi/KPIs.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit, Trash2, BarChart2,
  Target, TrendingUp, Filter, Download,
  X, Check, RefreshCw, AlertCircle,
  Zap, Award, Star, Activity, Layers,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const KPIs = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingKPI, setEditingKPI] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'productivity',
    formula: '',
    target: { value: 100, operator: '>=', unit: 'percentage' },
    weight: 1,
    appliesTo: 'company',
    isActive: true,
    source: 'manual'
  });

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
      
      let data = [];
      try {
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
            data = result.data || [];
          }
        }
      } catch (err) {
        console.warn('API not available, using mock data');
        data = getMockKPIs();
      }

      setKpis(data);
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
        isActive: true,
        source: 'api'
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
        isActive: true,
        source: 'manual'
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
        isActive: false,
        source: 'api'
      }
    ];
  };

  const handleRefresh = () => {
    fetchKPIs(true);
  };

  const handleViewKPI = (kpiId) => {
    navigate(`/kpis/${kpiId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a KPI name');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingKPI 
        ? `${API_URL}/kpis/definitions/${editingKPI._id}`
        : `${API_URL}/kpis/definitions`;
      
      const method = editingKPI ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingKPI ? 'KPI updated successfully!' : 'KPI created successfully!');
        setShowModal(false);
        setEditingKPI(null);
        resetForm();
        await fetchKPIs(true);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save KPI');
      }
    } catch (error) {
      console.error('Error saving KPI:', error);
      toast.error(error.message || 'Failed to save KPI');
      
      const newKPI = {
        _id: `temp_${Date.now()}`,
        ...formData
      };
      
      if (editingKPI) {
        setKpis(kpis.map(k => k._id === editingKPI._id ? newKPI : k));
        toast.success('KPI updated locally!');
      } else {
        setKpis([...kpis, newKPI]);
        toast.success('KPI created locally!');
      }
      
      setShowModal(false);
      setEditingKPI(null);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this KPI?')) return;

    try {
      const response = await fetch(`${API_URL}/kpis/definitions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('KPI deleted successfully');
        await fetchKPIs(true);
      } else {
        throw new Error('Failed to delete KPI');
      }
    } catch (error) {
      console.error('Error deleting KPI:', error);
      setKpis(kpis.filter(k => k._id !== id));
      toast.success('KPI deleted locally');
    }
  };

  const openModal = (kpi = null) => {
    if (kpi) {
      setEditingKPI(kpi);
      setFormData({
        name: kpi.name || '',
        description: kpi.description || '',
        category: kpi.category || 'productivity',
        formula: kpi.formula || '',
        target: kpi.target || { value: 100, operator: '>=', unit: 'percentage' },
        weight: kpi.weight || 1,
        appliesTo: kpi.appliesTo || 'company',
        isActive: kpi.isActive !== undefined ? kpi.isActive : true,
        source: kpi.source || 'manual'
      });
    } else {
      setEditingKPI(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'productivity',
      formula: '',
      target: { value: 100, operator: '>=', unit: 'percentage' },
      weight: 1,
      appliesTo: 'company',
      isActive: true,
      source: 'manual'
    });
  };

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      productivity: 'kp-cat-productivity',
      quality: 'kp-cat-quality',
      efficiency: 'kp-cat-efficiency',
      satisfaction: 'kp-cat-satisfaction',
      growth: 'kp-cat-growth',
      retention: 'kp-cat-retention',
      financial: 'kp-cat-financial'
    };
    return colors[category] || 'kp-cat-default';
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

  const getAppliesToLabel = (appliesTo) => {
    const labels = {
      company: '🏢 Company',
      segment: '📊 Segment',
      department: '🏛️ Department',
      team: '👥 Team',
      individual: '👤 Individual',
      project: '📋 Project'
    };
    return labels[appliesTo] || appliesTo;
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

  const appliesToOptions = [
    { value: 'company', label: 'Company' },
    { value: 'segment', label: 'Segment' },
    { value: 'department', label: 'Department' },
    { value: 'team', label: 'Team' },
    { value: 'individual', label: 'Individual' },
    { value: 'project', label: 'Project' }
  ];

  const unitOptions = [
    { value: 'percentage', label: 'Percentage' },
    { value: 'number', label: 'Number' },
    { value: 'currency', label: 'Currency' },
    { value: 'score', label: 'Score' },
    { value: 'hours', label: 'Hours' }
  ];

  if (loading) {
    return (
      <div className="kp-loading">
        <div className="kp-loading-spinner"></div>
        <p className="kp-loading-text">Loading KPIs...</p>
      </div>
    );
  }

  return (
    <>
      <div className="kp-container">
        {/* Header */}
        <div className="kp-header">
          <div className="kp-header-left">
            <div className="kp-title-wrapper">
              <div className="kp-title-icon">
                <Layers className="kp-title-svg" />
              </div>
              <div>
                <h1 className="kp-title">KPIs</h1>
                <p className="kp-subtitle">Define and manage Key Performance Indicators</p>
              </div>
            </div>
          </div>
          <div className="kp-header-right">
            <button className="kp-icon-btn" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`kp-refresh-icon ${refreshing ? 'kp-spin' : ''}`} />
            </button>
            <button className="kp-export-btn">
              <Download className="kp-btn-icon" />
              Export
            </button>
            <button 
              onClick={() => openModal()}
              className="kp-create-btn"
            >
              <Plus className="kp-btn-icon" />
              New KPI
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="kp-filters">
          <div className="kp-search-wrapper">
            <Search className="kp-search-icon" />
            <input
              type="text"
              placeholder="Search KPIs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="kp-search-input"
            />
            {search && (
              <button className="kp-search-clear" onClick={() => setSearch('')}>
                <X className="kp-search-clear-icon" />
              </button>
            )}
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="kp-filter-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <button className="kp-filter-btn">
            <Filter className="kp-btn-icon" />
            More Filters
          </button>
        </div>

        {/* KPI Cards */}
        <div className="kp-grid">
          {kpis.map((kpi, index) => (
            <div 
              key={kpi._id} 
              className="kp-card" 
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => handleViewKPI(kpi._id)}
            >
              <div className="kp-card-header">
                <div className="kp-card-icon-wrapper">
                  <BarChart2 className="kp-card-icon" />
                </div>
                <div className="kp-card-info">
                  <h3 className="kp-card-title">{kpi.name}</h3>
                  <p className="kp-card-category">{getCategoryLabel(kpi.category)}</p>
                </div>
                <div className="kp-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="kp-action-btn kp-action-view" 
                    onClick={() => handleViewKPI(kpi._id)}
                    title="View Details"
                  >
                    <Eye className="kp-action-icon" />
                  </button>
                  <button className="kp-action-btn kp-action-edit" onClick={() => openModal(kpi)}>
                    <Edit className="kp-action-icon" />
                  </button>
                  <button className="kp-action-btn kp-action-delete" onClick={() => handleDelete(kpi._id)}>
                    <Trash2 className="kp-action-icon" />
                  </button>
                </div>
              </div>
              
              <p className="kp-card-desc">{kpi.description || 'No description'}</p>
              
              <div className="kp-card-badges">
                <span className={`kp-badge ${getCategoryColor(kpi.category)}`}>
                  {getCategoryLabel(kpi.category)}
                </span>
                <span className="kp-badge kp-badge-applies">{getAppliesToLabel(kpi.appliesTo)}</span>
                <span className={`kp-badge ${kpi.isActive ? 'kp-badge-active' : 'kp-badge-inactive'}`}>
                  {kpi.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="kp-card-footer">
                <div className="kp-card-stats">
                  <span className="kp-stat">
                    <Target className="kp-stat-icon" />
                    Target: {kpi.target?.value} {kpi.target?.operator}
                  </span>
                  <span className="kp-stat">
                    <Zap className="kp-stat-icon" />
                    Weight: {kpi.weight || 1}
                  </span>
                </div>
                {kpi.formula && (
                  <div className="kp-card-formula">
                    <span className="kp-formula-label">Formula:</span>
                    <span className="kp-formula-text">{kpi.formula}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {kpis.length === 0 && (
          <div className="kp-empty">
            <div className="kp-empty-icon-wrapper">
              <Target className="kp-empty-icon" />
            </div>
            <h3 className="kp-empty-title">No KPIs Found</h3>
            <p className="kp-empty-subtitle">Create your first KPI to start tracking performance</p>
            <button className="kp-empty-btn" onClick={() => openModal()}>
              <Plus className="kp-btn-icon" />
              Create KPI
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="kp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="kp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kp-modal-header">
              <div className="kp-modal-title-wrapper">
                <BarChart2 className="kp-modal-icon" />
                <h2 className="kp-modal-title">
                  {editingKPI ? 'Edit KPI' : 'Create New KPI'}
                </h2>
              </div>
              <button className="kp-modal-close" onClick={() => setShowModal(false)}>
                <X className="kp-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="kp-modal-form">
              <div className="kp-form-group">
                <label className="kp-form-label">
                  KPI Name <span className="kp-form-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="kp-form-input"
                  placeholder="Enter KPI name"
                  autoFocus
                />
              </div>

              <div className="kp-form-group">
                <label className="kp-form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="kp-form-textarea"
                  rows="2"
                  placeholder="Enter KPI description"
                />
              </div>

              <div className="kp-form-row">
                <div className="kp-form-group">
                  <label className="kp-form-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="kp-form-select"
                  >
                    {categories.filter(c => c.value !== 'all').map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="kp-form-group">
                  <label className="kp-form-label">Applies To</label>
                  <select
                    value={formData.appliesTo}
                    onChange={(e) => handleChange('appliesTo', e.target.value)}
                    className="kp-form-select"
                  >
                    {appliesToOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="kp-form-group">
                <label className="kp-form-label">Formula</label>
                <input
                  type="text"
                  value={formData.formula}
                  onChange={(e) => handleChange('formula', e.target.value)}
                  className="kp-form-input"
                  placeholder="e.g., (Current - Previous) / Previous * 100"
                />
              </div>

              <div className="kp-form-row">
                <div className="kp-form-group">
                  <label className="kp-form-label">Target Value</label>
                  <input
                    type="number"
                    value={formData.target.value}
                    onChange={(e) => handleChange('target.value', parseFloat(e.target.value) || 0)}
                    className="kp-form-input"
                    placeholder="100"
                    min="0"
                  />
                </div>
                <div className="kp-form-group">
                  <label className="kp-form-label">Target Operator</label>
                  <select
                    value={formData.target.operator}
                    onChange={(e) => handleChange('target.operator', e.target.value)}
                    className="kp-form-select"
                  >
                    <option value=">=">Greater than or equal</option>
                    <option value="<=">Less than or equal</option>
                    <option value="==">Equal to</option>
                  </select>
                </div>
                <div className="kp-form-group">
                  <label className="kp-form-label">Unit</label>
                  <select
                    value={formData.target.unit}
                    onChange={(e) => handleChange('target.unit', e.target.value)}
                    className="kp-form-select"
                  >
                    {unitOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="kp-form-row">
                <div className="kp-form-group">
                  <label className="kp-form-label">Weight</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 1)}
                    className="kp-form-input"
                    placeholder="1"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div className="kp-form-group">
                  <label className="kp-form-label">Status</label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => handleChange('isActive', e.target.value === 'active')}
                    className="kp-form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="kp-form-actions">
                <button type="button" className="kp-form-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="kp-form-submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="kp-form-spinner"></div>
                      {editingKPI ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check className="kp-btn-icon" />
                      {editingKPI ? 'Update KPI' : 'Create KPI'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .kp-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .kp-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
        }

        .kp-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: kpSpin 0.8s linear infinite;
        }

        .kp-loading-text {
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes kpSpin {
          to { transform: rotate(360deg); }
        }

        .kp-spin {
          animation: kpSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .kp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeInDown 0.6s ease;
        }

        .kp-header-left {
          display: flex;
          align-items: center;
        }

        .kp-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .kp-title-icon {
          width: 48px;
          height: 48px;
          background: #013E37;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.25);
        }

        .kp-title-svg {
          width: 24px;
          height: 24px;
          color: #FFEFB3;
        }

        .kp-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .kp-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }

        .kp-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .kp-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
        }

        .kp-icon-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .kp-refresh-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .kp-export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid #013E37;
          border-radius: 8px;
          background: #013E37;
          color: #FFEFB3;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.2);
        }

        .kp-export-btn:hover {
          background: #0A5C54;
          border-color: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        .kp-create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(1, 62, 55, 0.3);
        }

        .kp-create-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.4);
        }

        .kp-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .kp-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .kp-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .kp-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.4;
        }

        .kp-search-input {
          width: 100%;
          padding: 8px 36px 8px 36px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: #FFFFFF;
          color: #013E37;
          transition: all 0.3s ease;
        }

        .kp-search-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .kp-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }

        .kp-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          background: none;
          border: none;
          color: #013E37;
          opacity: 0.4;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        .kp-search-clear:hover {
          background: #FFEFB3;
          opacity: 1;
        }

        .kp-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .kp-filter-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #FFFFFF;
          color: #013E37;
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 160px;
        }

        .kp-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .kp-filter-select:hover {
          border-color: #013E37;
        }

        .kp-filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #FFFFFF;
          color: #013E37;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .kp-filter-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }

        /* ============================================
           GRID - Cards with cursor pointer
           ============================================ */
        .kp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .kp-card {
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          padding: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideUp 0.5s ease both;
          opacity: 0;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .kp-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #013E37, #0A5C54, #013E37);
          transform: scaleX(0);
          transition: transform 0.4s ease;
          transform-origin: left;
        }

        .kp-card:hover::before {
          transform: scaleX(1);
        }

        .kp-card:nth-child(1) { animation-delay: 0.05s; }
        .kp-card:nth-child(2) { animation-delay: 0.1s; }
        .kp-card:nth-child(3) { animation-delay: 0.15s; }
        .kp-card:nth-child(4) { animation-delay: 0.2s; }

        .kp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(1, 62, 55, 0.12);
          border-color: #013E37;
        }

        .kp-card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .kp-card-icon-wrapper {
          width: 44px;
          height: 44px;
          background: #FFEFB3;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .kp-card:hover .kp-card-icon-wrapper {
          transform: scale(1.05) rotate(-5deg);
        }

        .kp-card-icon {
          width: 22px;
          height: 22px;
          color: #013E37;
        }

        .kp-card-info {
          flex: 1;
          min-width: 0;
        }

        .kp-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .kp-card-category {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }

        .kp-card-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }

        .kp-action-btn {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.3;
          display: flex;
          align-items: center;
        }

        .kp-action-btn:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }

        .kp-action-view:hover {
          background: #EFF6FF;
          color: #3B82F6;
        }

        .kp-action-edit:hover {
          background: #FFEFB3;
          color: #013E37;
        }

        .kp-action-delete:hover {
          background: #FEE2E2;
          color: #EF4444;
        }

        .kp-action-icon {
          width: 16px;
          height: 16px;
        }

        .kp-card-desc {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .kp-card-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .kp-badge {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }

        .kp-badge:hover {
          transform: scale(1.05);
        }

        .kp-cat-productivity { background: #013E37; color: #FFEFB3; }
        .kp-cat-quality { background: #0A5C54; color: #FFEFB3; }
        .kp-cat-efficiency { background: #1A7A6E; color: #FFEFB3; }
        .kp-cat-satisfaction { background: #FFEFB3; color: #013E37; }
        .kp-cat-growth { background: #2A9A8A; color: #FFEFB3; }
        .kp-cat-retention { background: #3ABAAA; color: #FFEFB3; }
        .kp-cat-financial { background: #013E37; color: #FFEFB3; }
        .kp-cat-default { background: #FFEFB3; color: #013E37; }

        .kp-badge-applies { background: #FFEFB3; color: #013E37; }
        .kp-badge-active { background: #013E37; color: #FFEFB3; }
        .kp-badge-inactive { background: #FFEFB3; color: #013E37; }

        .kp-card-footer {
          padding-top: 12px;
          border-top: 1px solid #FFEFB3;
          transition: border-color 0.3s ease;
        }

        .kp-card:hover .kp-card-footer {
          border-color: #013E37;
        }

        .kp-card-stats {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
        }

        .kp-stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .kp-stat-icon {
          width: 14px;
          height: 14px;
          color: #013E37;
          opacity: 0.4;
        }

        .kp-card-formula {
          margin-top: 6px;
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .kp-formula-label {
          font-weight: 500;
          color: #013E37;
          opacity: 0.7;
        }

        .kp-formula-text {
          font-family: monospace;
          color: #013E37;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .kp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: #FFFFFF;
          border-radius: 12px;
          border: 2px dashed #FFEFB3;
          text-align: center;
        }

        .kp-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #FFEFB3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          animation: float 3s ease-in-out infinite;
        }

        .kp-empty-icon {
          width: 36px;
          height: 36px;
          color: #013E37;
        }

        .kp-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .kp-empty-subtitle {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 4px 0 16px 0;
        }

        .kp-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(1, 62, 55, 0.25);
        }

        .kp-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
        }

        /* ============================================
           MODAL
           ============================================ */
        .kp-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(1, 62, 55, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: fadeIn 0.3s ease;
        }

        .kp-modal {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #FFEFB3;
          max-width: 640px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(1, 62, 55, 0.2);
          animation: modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .kp-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
          border-radius: 16px 16px 0 0;
        }

        .kp-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .kp-modal-icon {
          width: 28px;
          height: 28px;
          color: #013E37;
        }

        .kp-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }

        .kp-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: none;
          background: transparent;
          border-radius: 8px;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0.5;
        }

        .kp-modal-close:hover {
          background: rgba(1, 62, 55, 0.1);
          opacity: 1;
          transform: rotate(90deg);
        }

        .kp-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        .kp-modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ============================================
           FORM
           ============================================ */
        .kp-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }

        .kp-form-group:nth-child(1) { animation-delay: 0.05s; }
        .kp-form-group:nth-child(2) { animation-delay: 0.1s; }
        .kp-form-group:nth-child(3) { animation-delay: 0.15s; }
        .kp-form-group:nth-child(4) { animation-delay: 0.2s; }
        .kp-form-group:nth-child(5) { animation-delay: 0.25s; }
        .kp-form-group:nth-child(6) { animation-delay: 0.3s; }

        .kp-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }

        .kp-form-required {
          color: #EF4444;
        }

        .kp-form-input,
        .kp-form-textarea,
        .kp-form-select {
          padding: 10px 14px;
          border: 1.5px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          width: 100%;
          font-family: inherit;
          background: #FFFFFF;
          color: #013E37;
        }

        .kp-form-input:focus,
        .kp-form-textarea:focus,
        .kp-form-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .kp-form-input::placeholder,
        .kp-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.4;
        }

        .kp-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .kp-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }

        .kp-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #FFEFB3;
          margin-top: 4px;
        }

        .kp-form-cancel {
          padding: 10px 24px;
          background: transparent;
          color: #013E37;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .kp-form-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .kp-form-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(1, 62, 55, 0.25);
        }

        .kp-form-submit:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
        }

        .kp-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .kp-form-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 239, 179, 0.3);
          border-top-color: #FFEFB3;
          border-radius: 50%;
          animation: kpSpin 0.8s linear infinite;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .kp-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }

          .kp-form-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .kp-header {
            flex-direction: column;
            align-items: stretch;
          }

          .kp-header-right {
            flex-wrap: wrap;
          }

          .kp-export-btn,
          .kp-create-btn {
            flex: 1;
            justify-content: center;
          }

          .kp-filters {
            flex-direction: column;
          }

          .kp-search-wrapper {
            width: 100%;
          }

          .kp-filter-select {
            width: 100%;
          }

          .kp-filter-btn {
            width: 100%;
            justify-content: center;
          }

          .kp-grid {
            grid-template-columns: 1fr;
          }

          .kp-title {
            font-size: 22px;
          }

          .kp-title-icon {
            width: 40px;
            height: 40px;
          }

          .kp-title-svg {
            width: 20px;
            height: 20px;
          }

          .kp-form-row {
            grid-template-columns: 1fr;
          }

          .kp-modal {
            margin: 16px;
            max-height: 95vh;
          }
        }

        @media (max-width: 480px) {
          .kp-header-right {
            flex-direction: column;
          }

          .kp-export-btn,
          .kp-create-btn {
            width: 100%;
          }

          .kp-icon-btn {
            align-self: flex-end;
          }

          .kp-title-wrapper {
            gap: 10px;
          }

          .kp-title {
            font-size: 20px;
          }

          .kp-subtitle {
            font-size: 13px;
          }

          .kp-modal {
            padding: 0;
          }

          .kp-modal-header {
            padding: 16px 18px;
          }

          .kp-modal-form {
            padding: 18px;
          }

          .kp-form-actions {
            flex-direction: column;
          }

          .kp-form-cancel,
          .kp-form-submit {
            width: 100%;
            justify-content: center;
          }
        }

        /* Scrollbar */
        .kp-modal::-webkit-scrollbar {
          width: 6px;
        }

        .kp-modal::-webkit-scrollbar-track {
          background: #FFEFB3;
          border-radius: 8px;
        }

        .kp-modal::-webkit-scrollbar-thumb {
          background: #013E37;
          border-radius: 8px;
        }

        .kp-modal::-webkit-scrollbar-thumb:hover {
          background: #0A5C54;
        }
      `}</style>
    </>
  );
};

export default KPIs;