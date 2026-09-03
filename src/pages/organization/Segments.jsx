// pages/organization/Segments.jsx - Modern Design with Animations

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, Edit, Trash2, Layers,
  Building2, Users, Briefcase, MoreVertical,
  X, Check, RefreshCw, Filter, Grid3x3, List,
  ChevronDown, ChevronRight, Zap, Star, TrendingUp,
  Clock, Award, Shield, Sparkles, ArrowRight,
  Github, Coffee, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

const Segments = () => {
  const { token } = useAuth();
  const [segments, setSegments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'service',
    businessModel: 'project_based',
    color: '#013E37',
    status: 'active',
    companyId: ''
  });

  const getHeaders = () => ({
    headers: token ? { 
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    } : {}
  });

  // Load companies first
  const loadCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/organization/companies?t=${Date.now()}`, getHeaders());
      const comps = response.data.data || [];
      setCompanies(comps);
      return comps;
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
      return [];
    }
  };

  // Load segments with optional company filter
  const loadSegments = async (companyId = null) => {
    try {
      setLoading(true);
      let url = `${API_URL}/organization/segments?t=${Date.now()}`;
      
      if (companyId && companyId !== 'all' && companyId !== 'undefined') {
        url = `${API_URL}/organization/segments?companyId=${companyId}&t=${Date.now()}`;
      }
      
      const response = await axios.get(url, getHeaders());
      const data = response.data.data || [];
      setSegments(data);
      return data;
    } catch (error) {
      console.error('Error loading segments:', error);
      toast.error('Failed to load segments');
      setSegments([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load all data on mount
  useEffect(() => {
    const init = async () => {
      const comps = await loadCompanies();
      if (comps.length > 0) {
        setSelectedCompany(comps[0]._id);
        await loadSegments(comps[0]._id);
      } else {
        setSelectedCompany('all');
        await loadSegments('all');
      }
    };
    init();
  }, []);

  // Handle company filter change
  const handleCompanyChange = async (companyId) => {
    setSelectedCompany(companyId);
    await loadSegments(companyId);
  };

  // Manual refresh
  const handleRefresh = async () => {
    toast.loading('Refreshing...');
    await loadCompanies();
    await loadSegments(selectedCompany);
    toast.dismiss();
    toast.success('Segments refreshed');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openCreateModal = () => {
    setEditingSegment(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      type: 'service',
      businessModel: 'project_based',
      color: '#013E37',
      status: 'active',
      companyId: selectedCompany !== 'all' ? selectedCompany : (companies[0]?._id || '')
    });
    setShowModal(true);
  };

  const openEditModal = (segment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name || '',
      slug: segment.slug || '',
      description: segment.description || '',
      type: segment.type || 'service',
      businessModel: segment.businessModel || 'project_based',
      color: segment.color || '#013E37',
      status: segment.status || 'active',
      companyId: segment.companyId?._id || segment.companyId || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Please enter a segment name');
        return;
      }
      if (!formData.companyId) {
        toast.error('Please select a company');
        return;
      }

      setSaving(true);
      
      const submitData = {
        name: formData.name.trim(),
        slug: formData.slug || formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description || '',
        type: formData.type || 'service',
        businessModel: formData.businessModel || 'project_based',
        color: formData.color || '#013E37',
        status: formData.status || 'active',
        companyId: formData.companyId
      };

      let response;
      if (editingSegment) {
        response = await axios.put(
          `${API_URL}/organization/segments/${editingSegment._id}`,
          submitData,
          getHeaders()
        );
      } else {
        response = await axios.post(
          `${API_URL}/organization/segments`,
          submitData,
          getHeaders()
        );
      }
      
      if (response.data.success) {
        toast.success(editingSegment ? 'Segment updated successfully' : 'Segment created successfully');
        setShowModal(false);
        setEditingSegment(null);
        setFormData({
          name: '',
          slug: '',
          description: '',
          type: 'service',
          businessModel: 'project_based',
          color: '#013E37',
          status: 'active',
          companyId: ''
        });
        await loadSegments(selectedCompany);
        await loadCompanies();
      } else {
        toast.error(response.data.message || 'Failed to save segment');
      }
    } catch (error) {
      console.error('Error saving segment:', error);
      const errorMsg = error.response?.data?.message || 'Failed to save segment';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this segment? This will also delete all departments and teams under it.')) return;
    
    try {
      await axios.delete(`${API_URL}/organization/segments/${id}`, getHeaders());
      toast.success('Segment deleted successfully');
      await loadSegments(selectedCompany);
    } catch (error) {
      console.error('Error deleting segment:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete segment';
      toast.error(errorMsg);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getBusinessModelBadge = (model) => {
    const colors = {
      'project_based': 'segment-badge-project',
      'retainer_based': 'segment-badge-retainer',
      'product_based': 'segment-badge-product',
      'hybrid': 'segment-badge-hybrid'
    };
    return colors[model] || 'segment-badge-default';
  };

  const getBusinessModelLabel = (model) => {
    const labels = {
      'project_based': 'Project Based',
      'retainer_based': 'Retainer Based',
      'product_based': 'Product Based',
      'hybrid': 'Hybrid'
    };
    return labels[model] || model;
  };

  const getCompanyName = (companyId) => {
    if (!companyId) return 'No Company';
    if (typeof companyId === 'object') return companyId.name || 'Unknown';
    const company = companies.find(c => c._id === companyId);
    return company?.name || 'Unknown Company';
  };

  const getTypeIcon = (type) => {
    const icons = {
      agency: <Briefcase size={14} />,
      product: <Zap size={14} />,
      service: <Shield size={14} />,
      app: <Sparkles size={14} />,
      outreach: <TrendingUp size={14} />,
      other: <Star size={14} />
    };
    return icons[type] || <Layers size={14} />;
  };

  const filteredSegments = segments.filter(segment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (segment.name?.toLowerCase() || '').includes(searchLower) ||
      (segment.description?.toLowerCase() || '').includes(searchLower) ||
      (segment.type?.toLowerCase() || '').includes(searchLower)
    );
  });

  if (loading && !segments.length) {
    return (
      <div className="segment-loading">
        <div className="segment-loading-spinner"></div>
        <p className="segment-loading-text">Loading segments...</p>
      </div>
    );
  }

  return (
    <>
      <div className="segment-container">
        {/* Header */}
        <div className="segment-header">
          <div className="segment-header-left">
            <h1 className="segment-title">
              <Layers className="segment-title-icon" color="#013E37" />
              Segments
            </h1>
            <p className="segment-subtitle">Manage your business segments by company</p>
          </div>
          <div className="segment-header-right">
            <button
              onClick={handleRefresh}
              className="segment-refresh-btn"
              title="Refresh"
            >
              <RefreshCw className="segment-refresh-icon" />
            </button>
            <div className="segment-view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`segment-view-btn ${viewMode === 'grid' ? 'segment-view-active' : ''}`}
              >
                <Grid3x3 className="segment-view-icon" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`segment-view-btn ${viewMode === 'list' ? 'segment-view-active' : ''}`}
              >
                <List className="segment-view-icon" />
              </button>
            </div>
            <button 
              onClick={openCreateModal}
              className="segment-add-btn"
            >
              <Plus className="segment-add-icon" />
              New Segment
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="segment-filters">
          <div className="segment-search">
            <Search className="segment-search-icon" color="#013E37" />
            <input
              type="text"
              placeholder="Search segments..."
              value={searchTerm}
              onChange={handleSearch}
              className="segment-search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="segment-search-clear"
              >
                <X className="segment-search-clear-icon" />
              </button>
            )}
          </div>
          <div className="segment-filter-group">
            <select
              value={selectedCompany}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="segment-company-select"
            >
              <option value="all">All Companies</option>
              {companies.map(company => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
            <span className="segment-count">
              {filteredSegments.length} segment{filteredSegments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Segments Grid/List */}
        {filteredSegments.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="segment-grid">
              {filteredSegments.map((segment, index) => (
                <div 
                  key={segment._id} 
                  className="segment-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onMouseEnter={() => setHoveredCard(segment._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="segment-card-inner">
                    <div className="segment-card-header">
                      <div className="segment-card-icon" style={{ backgroundColor: segment.color || '#013E37' }}>
                        <Layers className="segment-card-icon-svg" color="#FFFFFF" />
                      </div>
                      <div className="segment-card-title-wrap">
                        <h3 className="segment-card-title">{segment.name}</h3>
                        <span className="segment-card-type">
                          {getTypeIcon(segment.type)} {segment.type}
                        </span>
                      </div>
                      <div className="segment-card-actions">
                        <button 
                          onClick={() => openEditModal(segment)}
                          className="segment-card-action"
                          title="Edit"
                        >
                          <Edit className="segment-card-action-icon" />
                        </button>
                        <button 
                          onClick={() => handleDelete(segment._id)}
                          className="segment-card-action segment-card-action-delete"
                          title="Delete"
                        >
                          <Trash2 className="segment-card-action-icon" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="segment-card-desc">{segment.description || 'No description'}</p>
                    
                    <div className="segment-card-badges">
                      <span className="segment-company-badge">
                        <Building2 className="segment-company-icon" />
                        {getCompanyName(segment.companyId)}
                      </span>
                      <span className={`segment-badge ${getBusinessModelBadge(segment.businessModel)}`}>
                        {getBusinessModelLabel(segment.businessModel)}
                      </span>
                      <span className={`segment-status ${segment.status === 'active' ? 'segment-status-active' : 'segment-status-inactive'}`}>
                        <span className="segment-status-dot"></span>
                        {segment.status || 'Active'}
                      </span>
                    </div>
                    
                    <div className="segment-card-footer">
                      <div className="segment-card-stats">
                        <span className="segment-stat">
                          <Users className="segment-stat-icon" color="#013E37" />
                          {segment.departmentCount || 0} Departments
                        </span>
                        <span className="segment-stat">
                          <Building2 className="segment-stat-icon" color="#013E37" />
                          {segment.teamCount || 0} Teams
                        </span>
                      </div>
                      {segment.adminId && (
                        <div className="segment-admin">
                          <Users className="segment-admin-icon" color="#013E37" />
                          <span className="segment-admin-name">
                            Admin: {segment.adminId.firstName} {segment.adminId.lastName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hover overlay indicator */}
                    {hoveredCard === segment._id && (
                      <div className="segment-card-hover-indicator">
                        <ArrowRight size={18} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="segment-list">
              {filteredSegments.map((segment, index) => (
                <div 
                  key={segment._id} 
                  className="segment-list-item"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="segment-list-item-left">
                    <div className="segment-list-icon" style={{ backgroundColor: segment.color || '#013E37' }}>
                      <Layers className="segment-list-icon-svg" color="#FFFFFF" />
                    </div>
                    <div className="segment-list-info">
                      <div className="segment-list-title-row">
                        <span className="segment-list-name">{segment.name}</span>
                        <span className="segment-list-type">
                          {getTypeIcon(segment.type)} {segment.type}
                        </span>
                        <span className="segment-list-company">
                          <Building2 className="segment-list-company-icon" />
                          {getCompanyName(segment.companyId)}
                        </span>
                        <span className={`segment-status ${segment.status === 'active' ? 'segment-status-active' : 'segment-status-inactive'}`}>
                          <span className="segment-status-dot"></span>
                          {segment.status || 'Active'}
                        </span>
                      </div>
                      <p className="segment-list-desc">{segment.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="segment-list-item-right">
                    <span className={`segment-badge ${getBusinessModelBadge(segment.businessModel)}`}>
                      {getBusinessModelLabel(segment.businessModel)}
                    </span>
                    <div className="segment-list-actions">
                      <button 
                        onClick={() => openEditModal(segment)}
                        className="segment-list-action"
                      >
                        <Edit className="segment-list-action-icon" />
                      </button>
                      <button 
                        onClick={() => handleDelete(segment._id)}
                        className="segment-list-action segment-list-action-delete"
                      >
                        <Trash2 className="segment-list-action-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="segment-empty">
            <div className="segment-empty-icon-wrapper">
              <Layers className="segment-empty-icon" color="#013E37" />
            </div>
            <h3 className="segment-empty-title">No Segments Found</h3>
            <p className="segment-empty-subtitle">
              {searchTerm ? 'Try adjusting your search' : 
               selectedCompany !== 'all' ? 'Create your first segment for this company' :
               'Create your first business segment'}
            </p>
            {!searchTerm && (
              <button 
                onClick={openCreateModal}
                className="segment-empty-btn"
              >
                <Plus className="segment-empty-btn-icon" />
                Create Segment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="segment-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="segment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="segment-modal-header">
              <h2 className="segment-modal-title">
                {editingSegment ? 'Edit Segment' : 'Create New Segment'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="segment-modal-close"
              >
                <X className="segment-modal-close-icon" />
              </button>
            </div>
            
            <div className="segment-modal-body">
              <div className="segment-form-group">
                <label className="segment-form-label">Company *</label>
                <select 
                  value={formData.companyId}
                  onChange={(e) => handleChange('companyId', e.target.value)}
                  className="segment-form-select"
                  required
                >
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="segment-form-group">
                <label className="segment-form-label">Segment Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="segment-form-input" 
                  placeholder="e.g., Technology, Marketing, Operations"
                  autoFocus
                />
              </div>

              <div className="segment-form-group">
                <label className="segment-form-label">Slug</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  className="segment-form-input" 
                  placeholder="technology-segment"
                />
              </div>
              
              <div className="segment-form-group">
                <label className="segment-form-label">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="segment-form-textarea" 
                  rows="3" 
                  placeholder="Brief description of this segment"
                />
              </div>
              
              <div className="segment-form-row">
                <div className="segment-form-group">
                  <label className="segment-form-label">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="segment-form-select"
                  >
                    <option value="agency">Agency</option>
                    <option value="product">Product</option>
                    <option value="service">Service</option>
                    <option value="app">App</option>
                    <option value="outreach">Outreach</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="segment-form-group">
                  <label className="segment-form-label">Business Model</label>
                  <select 
                    value={formData.businessModel}
                    onChange={(e) => handleChange('businessModel', e.target.value)}
                    className="segment-form-select"
                  >
                    <option value="project_based">Project Based</option>
                    <option value="retainer_based">Retainer Based</option>
                    <option value="product_based">Product Based</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              
              <div className="segment-form-group">
                <label className="segment-form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="segment-form-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="segment-form-group">
                <label className="segment-form-label">Color</label>
                <div className="segment-color-wrapper">
                  <input 
                    type="color" 
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="segment-color-input"
                  />
                  <span className="segment-color-hex">{formData.color}</span>
                </div>
              </div>
            </div>
            
            <div className="segment-modal-footer">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="segment-modal-cancel"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !formData.name.trim() || !formData.companyId}
                className="segment-modal-submit"
              >
                {saving ? (
                  <>
                    <div className="segment-modal-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="segment-modal-submit-icon" />
                    {editingSegment ? 'Update Segment' : 'Create Segment'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .segment-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           HEADER
           ============================================ */
        .segment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
          animation: fadeInDown 0.6s ease;
        }
        .segment-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .segment-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .segment-title-icon {
          width: 28px;
          height: 28px;
          animation: pulse 2s ease-in-out infinite;
        }
        .segment-subtitle {
          color: #013E37;
          opacity: 0.6;
          font-size: 15px;
          margin: 0;
        }
        .segment-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .segment-refresh-btn {
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .segment-refresh-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: rotate(180deg);
        }
        .segment-refresh-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          transition: transform 0.3s ease;
        }
        .segment-view-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #FFEFB3;
          border-radius: 8px;
          padding: 4px;
          transition: all 0.3s ease;
        }
        .segment-view-btn {
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.5;
          display: flex;
          align-items: center;
        }
        .segment-view-btn:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }
        .segment-view-active {
          background: #013E37;
          color: #FFFFFF;
          opacity: 1;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.2);
          animation: popIn 0.3s ease;
        }
        .segment-view-active:hover {
          opacity: 1;
          transform: scale(1);
        }
        .segment-view-icon {
          width: 16px;
          height: 16px;
        }
        .segment-add-btn {
          padding: 8px 20px;
          background: #013E37;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.25);
        }
        .segment-add-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .segment-add-btn:active {
          transform: scale(0.95);
        }
        .segment-add-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        .segment-add-btn:hover .segment-add-icon {
          transform: rotate(90deg);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .segment-filters {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          animation: fadeIn 0.8s ease;
        }
        .segment-search {
          flex: 1;
          min-width: 200px;
          position: relative;
        }
        .segment-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          opacity: 0.5;
          transition: all 0.3s ease;
        }
        .segment-search-input {
          width: 100%;
          padding: 8px 40px 8px 36px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #013E37;
        }
        .segment-search-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
          transform: scale(1.01);
        }
        .segment-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }
        .segment-search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #013E37;
          opacity: 0.4;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }
        .segment-search-clear:hover {
          opacity: 0.8;
          transform: translateY(-50%) scale(1.2);
        }
        .segment-search-clear-icon {
          width: 16px;
          height: 16px;
        }
        .segment-filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .segment-company-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          background: #ffffff;
          min-width: 180px;
          color: #013E37;
          cursor: pointer;
        }
        .segment-company-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .segment-company-select:hover {
          border-color: #013E37;
        }
        .segment-count {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          white-space: nowrap;
          font-weight: 500;
        }

        /* ============================================
           GRID VIEW
           ============================================ */
        .segment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .segment-card {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.5s ease forwards;
          opacity: 0;
          position: relative;
          overflow: hidden;
        }
        .segment-card::before {
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
        .segment-card:hover::before {
          transform: scaleX(1);
        }
        .segment-card:hover {
          box-shadow: 0 8px 30px rgba(1, 62, 55, 0.12);
          transform: translateY(-6px) scale(1.01);
          border-color: #013E37;
        }
        .segment-card-inner {
          position: relative;
          z-index: 1;
        }
        .segment-card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }
        .segment-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .segment-card:hover .segment-card-icon {
          transform: scale(1.05) rotate(-5deg);
        }
        .segment-card-icon-svg {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }
        .segment-card:hover .segment-card-icon-svg {
          transform: scale(1.1);
        }
        .segment-card-title-wrap {
          flex: 1;
          min-width: 0;
        }
        .segment-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
          transition: color 0.3s ease;
        }
        .segment-card:hover .segment-card-title {
          color: #0A5C54;
        }
        .segment-card-type {
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .segment-card-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .segment-card-action {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.4;
          display: flex;
          align-items: center;
        }
        .segment-card-action:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }
        .segment-card-action-delete:hover {
          background: #FFEBEE;
          color: #D32F2F;
          opacity: 1;
        }
        .segment-card-action-icon {
          width: 16px;
          height: 16px;
        }
        .segment-card-desc {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }
        .segment-card-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .segment-company-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          background: #FFEFB3;
          color: #013E37;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }
        .segment-card:hover .segment-company-badge {
          background: #013E37;
          color: #ffffff;
        }
        .segment-company-icon {
          width: 12px;
          height: 12px;
        }
        .segment-badge {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }
        .segment-badge-project {
          background: #FFEFB3;
          color: #013E37;
        }
        .segment-card:hover .segment-badge-project {
          background: #013E37;
          color: #ffffff;
        }
        .segment-badge-retainer {
          background: #FFEFB3;
          color: #013E37;
        }
        .segment-card:hover .segment-badge-retainer {
          background: #013E37;
          color: #ffffff;
        }
        .segment-badge-product {
          background: #FFEFB3;
          color: #013E37;
        }
        .segment-card:hover .segment-badge-product {
          background: #013E37;
          color: #ffffff;
        }
        .segment-badge-hybrid {
          background: #FFEFB3;
          color: #013E37;
        }
        .segment-card:hover .segment-badge-hybrid {
          background: #013E37;
          color: #ffffff;
        }
        .segment-badge-default {
          background: #FFEFB3;
          color: #013E37;
        }
        .segment-card:hover .segment-badge-default {
          background: #013E37;
          color: #ffffff;
        }
        .segment-status {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.3s ease;
        }
        .segment-status-active {
          background: #013E37;
          color: #ffffff;
        }
        .segment-status-inactive {
          background: #FFEFB3;
          color: #013E37;
        }
        .segment-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s ease-in-out infinite;
        }
        .segment-status-active .segment-status-dot {
          background: #ffffff;
        }
        .segment-status-inactive .segment-status-dot {
          background: #013E37;
        }
        .segment-card-footer {
          border-top: 1px solid #FFEFB3;
          padding-top: 12px;
          transition: border-color 0.3s ease;
        }
        .segment-card:hover .segment-card-footer {
          border-color: #013E37;
        }
        .segment-card-stats {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .segment-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.7;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .segment-card:hover .segment-stat {
          opacity: 1;
        }
        .segment-stat-icon {
          width: 14px;
          height: 14px;
        }
        .segment-admin {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.7;
        }
        .segment-admin-icon {
          width: 14px;
          height: 14px;
        }
        .segment-admin-name {
          color: #013E37;
          font-weight: 500;
        }
        .segment-card-hover-indicator {
          position: absolute;
          bottom: 12px;
          right: 16px;
          color: #013E37;
          opacity: 0.5;
          animation: slideInRight 0.3s ease;
        }

        /* ============================================
           LIST VIEW
           ============================================ */
        .segment-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .segment-list-item {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          flex-wrap: wrap;
          gap: 12px;
          animation: slideInRight 0.5s ease forwards;
          opacity: 0;
          position: relative;
          overflow: hidden;
        }
        .segment-list-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #013E37;
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }
        .segment-list-item:hover::before {
          transform: scaleY(1);
        }
        .segment-list-item:hover {
          border-color: #013E37;
          box-shadow: 0 4px 20px rgba(1, 62, 55, 0.08);
          transform: translateX(4px);
        }
        .segment-list-item-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 200px;
        }
        .segment-list-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .segment-list-item:hover .segment-list-icon {
          transform: scale(1.05) rotate(-5deg);
        }
        .segment-list-icon-svg {
          width: 18px;
          height: 18px;
        }
        .segment-list-info {
          flex: 1;
          min-width: 0;
        }
        .segment-list-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .segment-list-name {
          font-size: 15px;
          font-weight: 600;
          color: #013E37;
          transition: color 0.3s ease;
        }
        .segment-list-item:hover .segment-list-name {
          color: #0A5C54;
        }
        .segment-list-type {
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .segment-list-company {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #013E37;
          background: #FFEFB3;
          padding: 2px 10px;
          border-radius: 9999px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .segment-list-item:hover .segment-list-company {
          background: #013E37;
          color: #ffffff;
        }
        .segment-list-company-icon {
          width: 12px;
          height: 12px;
        }
        .segment-list-desc {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 4px 0 0 0;
        }
        .segment-list-item-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .segment-list-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .segment-list-action {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.4;
          display: flex;
          align-items: center;
        }
        .segment-list-action:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }
        .segment-list-action-delete:hover {
          background: #FFEBEE;
          color: #D32F2F;
          opacity: 1;
        }
        .segment-list-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .segment-empty {
          background: #ffffff;
          border: 2px dashed #FFEFB3;
          border-radius: 16px;
          padding: 60px 24px;
          text-align: center;
          animation: fadeIn 0.8s ease;
        }
        .segment-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #FFEFB3;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          transition: all 0.3s ease;
          animation: float 3s ease-in-out infinite;
        }
        .segment-empty-icon {
          width: 40px;
          height: 40px;
        }
        .segment-empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .segment-empty-subtitle {
          color: #013E37;
          opacity: 0.6;
          margin-top: 4px;
          font-size: 15px;
        }
        .segment-empty-btn {
          margin-top: 20px;
          padding: 10px 24px;
          background: #013E37;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        .segment-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .segment-empty-btn:active {
          transform: scale(0.95);
        }
        .segment-empty-btn-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        .segment-empty-btn:hover .segment-empty-btn-icon {
          transform: rotate(90deg);
        }

        /* ============================================
           MODAL
           ============================================ */
        .segment-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(1, 62, 55, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 16px;
          animation: fadeIn 0.3s ease;
        }
        .segment-modal {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #FFEFB3;
          max-width: 560px;
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
        .segment-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
        }
        .segment-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }
        .segment-modal-close {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.5;
          display: flex;
          align-items: center;
        }
        .segment-modal-close:hover {
          background: rgba(1, 62, 55, 0.1);
          opacity: 1;
          transform: rotate(90deg);
        }
        .segment-modal-close-icon {
          width: 20px;
          height: 20px;
        }
        .segment-modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .segment-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .segment-form-group:nth-child(1) { animation-delay: 0.05s; }
        .segment-form-group:nth-child(2) { animation-delay: 0.1s; }
        .segment-form-group:nth-child(3) { animation-delay: 0.15s; }
        .segment-form-group:nth-child(4) { animation-delay: 0.2s; }
        .segment-form-group:nth-child(5) { animation-delay: 0.25s; }
        .segment-form-group:nth-child(6) { animation-delay: 0.3s; }
        .segment-form-group:nth-child(7) { animation-delay: 0.35s; }
        .segment-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }
        .segment-form-input,
        .segment-form-select,
        .segment-form-textarea {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          color: #013E37;
        }
        .segment-form-input:focus,
        .segment-form-select:focus,
        .segment-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
          transform: scale(1.01);
        }
        .segment-form-input::placeholder,
        .segment-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.4;
        }
        .segment-form-textarea {
          resize: vertical;
          min-height: 60px;
        }
        .segment-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 480px) {
          .segment-form-row {
            grid-template-columns: 1fr;
          }
        }
        .segment-color-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .segment-color-input {
          width: 40px;
          height: 40px;
          border: 2px solid #FFEFB3;
          border-radius: 8px;
          cursor: pointer;
          padding: 2px;
          transition: all 0.3s ease;
        }
        .segment-color-input:focus {
          border-color: #013E37;
          transform: scale(1.05);
        }
        .segment-color-hex {
          font-size: 14px;
          color: #013E37;
          font-family: monospace;
        }
        .segment-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #FFEFB3;
          background: #F8FAFC;
        }
        .segment-modal-cancel {
          padding: 8px 16px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: transparent;
          color: #013E37;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .segment-modal-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
          transform: scale(1.02);
        }
        .segment-modal-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .segment-modal-submit {
          padding: 8px 20px;
          background: #013E37;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        .segment-modal-submit:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .segment-modal-submit:active:not(:disabled) {
          transform: scale(0.95);
        }
        .segment-modal-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .segment-modal-submit-icon {
          width: 16px;
          height: 16px;
        }
        .segment-modal-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* ============================================
           LOADING
           ============================================ */
        .segment-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .segment-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .segment-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
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
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
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
        @keyframes popIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 992px) {
          .segment-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .segment-grid {
            grid-template-columns: 1fr;
          }
          .segment-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .segment-header-right {
            width: 100%;
            flex-wrap: wrap;
          }
          .segment-filters {
            flex-direction: column;
            align-items: stretch;
          }
          .segment-filter-group {
            flex-wrap: wrap;
            justify-content: space-between;
          }
          .segment-list-item {
            flex-direction: column;
            align-items: stretch;
          }
          .segment-list-item-right {
            justify-content: space-between;
          }
          .segment-modal {
            margin: 16px;
            max-height: 95vh;
          }
          .segment-title {
            font-size: 24px;
          }
          .segment-add-btn {
            flex: 1;
            justify-content: center;
          }
          .segment-company-select {
            min-width: 140px;
          }
        }

        @media (max-width: 480px) {
          .segment-container {
            padding: 0 8px 16px 8px;
          }
          .segment-card {
            padding: 16px;
          }
          .segment-card-header {
            flex-wrap: wrap;
          }
          .segment-card-badges {
            flex-wrap: wrap;
          }
          .segment-card-stats {
            flex-wrap: wrap;
            gap: 8px;
          }
          .segment-list-item {
            padding: 12px 16px;
          }
          .segment-list-item-left {
            flex-wrap: wrap;
          }
          .segment-list-title-row {
            flex-wrap: wrap;
          }
          .segment-modal-body {
            padding: 16px;
          }
          .segment-modal-footer {
            flex-direction: column-reverse;
          }
          .segment-modal-cancel,
          .segment-modal-submit {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default Segments;