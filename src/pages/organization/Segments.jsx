// pages/organization/Segments.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, Edit, Trash2, Layers,
  Building2, Users, Briefcase, MoreVertical,
  X, Check, RefreshCw, Filter, Grid3x3, List
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

const Segments = () => {
  const { token } = useAuth();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'service',
    businessModel: 'project_based',
    color: '#3b82f6',
    status: 'active'
  });

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  // Load segments
  const loadSegments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/organization/segments`, getHeaders());
      setSegments(response.data.data || []);
    } catch (error) {
      console.error('Error loading segments:', error);
      toast.error('Failed to load segments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSegments();
  }, []);

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
      color: '#3b82f6',
      status: 'active'
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
      color: segment.color || '#3b82f6',
      status: segment.status || 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Please enter a segment name');
        return;
      }

      setSaving(true);
      
      let response;
      if (editingSegment) {
        response = await axios.put(
          `${API_URL}/organization/segments/${editingSegment._id}`,
          formData,
          getHeaders()
        );
      } else {
        response = await axios.post(
          `${API_URL}/organization/segments`,
          formData,
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
          color: '#3b82f6',
          status: 'active'
        });
        await loadSegments();
      }
    } catch (error) {
      console.error('Error saving segment:', error);
      toast.error(error.response?.data?.message || 'Failed to save segment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this segment? This will also delete all departments and teams under it.')) return;
    
    try {
      await axios.delete(`${API_URL}/organization/segments/${id}`, getHeaders());
      toast.success('Segment deleted successfully');
      await loadSegments();
    } catch (error) {
      console.error('Error deleting segment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete segment');
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

  const filteredSegments = segments.filter(segment =>
    segment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Layers className="segment-title-icon" />
              Segments
            </h1>
            <p className="segment-subtitle">Manage your business segments</p>
          </div>
          <div className="segment-header-right">
            <button
              onClick={loadSegments}
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

        {/* Search */}
        <div className="segment-search-wrapper">
          <div className="segment-search">
            <Search className="segment-search-icon" />
            <input
              type="text"
              placeholder="Search segments by name, description, or type..."
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
          <span className="segment-count">
            {filteredSegments.length} segment{filteredSegments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Segments Grid/List */}
        {filteredSegments.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="segment-grid">
              {filteredSegments.map((segment) => (
                <div key={segment._id} className="segment-card">
                  <div className="segment-card-header">
                    <div className="segment-card-icon" style={{ backgroundColor: segment.color || '#3b82f6' }}>
                      <Layers className="segment-card-icon-svg" />
                    </div>
                    <div className="segment-card-title-wrap">
                      <h3 className="segment-card-title">{segment.name}</h3>
                      <span className="segment-card-type">{segment.type}</span>
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
                        <Users className="segment-stat-icon" />
                        {segment.departmentCount || 0} Departments
                      </span>
                      <span className="segment-stat">
                        <Building2 className="segment-stat-icon" />
                        {segment.teamCount || 0} Teams
                      </span>
                    </div>
                    {segment.adminId && (
                      <div className="segment-admin">
                        <Users className="segment-admin-icon" />
                        <span className="segment-admin-name">
                          Admin: {segment.adminId.firstName} {segment.adminId.lastName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="segment-list">
              {filteredSegments.map((segment) => (
                <div key={segment._id} className="segment-list-item">
                  <div className="segment-list-item-left">
                    <div className="segment-list-icon" style={{ backgroundColor: segment.color || '#3b82f6' }}>
                      <Layers className="segment-list-icon-svg" />
                    </div>
                    <div className="segment-list-info">
                      <div className="segment-list-title-row">
                        <span className="segment-list-name">{segment.name}</span>
                        <span className="segment-list-type">{segment.type}</span>
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
              <Layers className="segment-empty-icon" />
            </div>
            <h3 className="segment-empty-title">No Segments Found</h3>
            <p className="segment-empty-subtitle">
              {searchTerm ? 'Try adjusting your search' : 'Create your first business segment'}
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
                disabled={saving || !formData.name.trim()}
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

      {/* Styles - Regular style tag without jsx attribute */}
      <style>{`
        .segment-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }
        .segment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .segment-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .segment-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }
        .segment-title-icon {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }
        .segment-subtitle {
          color: #6b7280;
          font-size: 14px;
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
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .segment-refresh-btn:hover {
          background: #f9fafb;
        }
        .segment-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }
        .segment-view-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 4px;
        }
        .segment-view-btn {
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          display: flex;
          align-items: center;
        }
        .segment-view-btn:hover {
          color: #374151;
        }
        .segment-view-active {
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          color: #111827;
        }
        .segment-view-icon {
          width: 16px;
          height: 16px;
        }
        .segment-add-btn {
          padding: 8px 16px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);
        }
        .segment-add-btn:hover {
          background: #2563eb;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
          transform: translateY(-1px);
        }
        .segment-add-icon {
          width: 16px;
          height: 16px;
        }
        .segment-search-wrapper {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
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
          color: #9ca3af;
        }
        .segment-search-input {
          width: 100%;
          padding: 8px 40px 8px 36px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
        }
        .segment-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
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
          color: #9ca3af;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
        }
        .segment-search-clear:hover {
          color: #6b7280;
        }
        .segment-search-clear-icon {
          width: 16px;
          height: 16px;
        }
        .segment-count {
          font-size: 14px;
          color: #6b7280;
          white-space: nowrap;
        }
        .segment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .segment-card {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .segment-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
          border-color: #e5e7eb;
        }
        .segment-card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }
        .segment-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .segment-card-icon-svg {
          width: 20px;
          height: 20px;
          color: #ffffff;
        }
        .segment-card-title-wrap {
          flex: 1;
          min-width: 0;
        }
        .segment-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        .segment-card-type {
          font-size: 12px;
          color: #6b7280;
          text-transform: capitalize;
          display: block;
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
          transition: all 0.2s ease;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }
        .segment-card-action:hover {
          background: #f3f4f6;
          color: #4b5563;
        }
        .segment-card-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }
        .segment-card-action-icon {
          width: 16px;
          height: 16px;
        }
        .segment-card-desc {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .segment-card-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .segment-badge {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }
        .segment-badge-project {
          background: #dbeafe;
          color: #1d4ed8;
        }
        .segment-badge-retainer {
          background: #dcfce7;
          color: #16a34a;
        }
        .segment-badge-product {
          background: #f3e8ff;
          color: #7c3aed;
        }
        .segment-badge-hybrid {
          background: #fef3c7;
          color: #d97706;
        }
        .segment-badge-default {
          background: #f3f4f6;
          color: #6b7280;
        }
        .segment-status {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .segment-status-active {
          background: #dcfce7;
          color: #16a34a;
        }
        .segment-status-inactive {
          background: #f3f4f6;
          color: #6b7280;
        }
        .segment-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .segment-status-active .segment-status-dot {
          background: #22c55e;
        }
        .segment-status-inactive .segment-status-dot {
          background: #9ca3af;
        }
        .segment-card-footer {
          border-top: 1px solid #f3f4f6;
          padding-top: 12px;
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
          color: #6b7280;
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
          color: #6b7280;
        }
        .segment-admin-icon {
          width: 14px;
          height: 14px;
        }
        .segment-admin-name {
          color: #374151;
        }
        .segment-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .segment-list-item {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 10px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
          flex-wrap: wrap;
          gap: 12px;
        }
        .segment-list-item:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .segment-list-item-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 200px;
        }
        .segment-list-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .segment-list-icon-svg {
          width: 18px;
          height: 18px;
          color: #ffffff;
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
          color: #111827;
        }
        .segment-list-type {
          font-size: 12px;
          color: #6b7280;
          text-transform: capitalize;
        }
        .segment-list-desc {
          font-size: 13px;
          color: #6b7280;
          margin: 2px 0 0 0;
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
          transition: all 0.2s ease;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }
        .segment-list-action:hover {
          background: #f3f4f6;
          color: #4b5563;
        }
        .segment-list-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }
        .segment-list-action-icon {
          width: 16px;
          height: 16px;
        }
        .segment-empty {
          background: #ffffff;
          border: 2px dashed #e5e7eb;
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
        }
        .segment-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #eff6ff;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .segment-empty-icon {
          width: 40px;
          height: 40px;
          color: #93c5fd;
        }
        .segment-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        .segment-empty-subtitle {
          color: #6b7280;
          margin-top: 4px;
        }
        .segment-empty-btn {
          margin-top: 16px;
          padding: 10px 24px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .segment-empty-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }
        .segment-empty-btn-icon {
          width: 16px;
          height: 16px;
        }
        .segment-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 16px;
        }
        .segment-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: modalIn 0.3s ease;
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
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
          border-bottom: 1px solid #f3f4f6;
        }
        .segment-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .segment-modal-close {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          display: flex;
          align-items: center;
        }
        .segment-modal-close:hover {
          background: #f3f4f6;
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
        }
        .segment-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        .segment-form-input,
        .segment-form-select,
        .segment-form-textarea {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
        }
        .segment-form-input:focus,
        .segment-form-select:focus,
        .segment-form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
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
          border: 2px solid #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          padding: 2px;
        }
        .segment-color-input:focus {
          border-color: #3b82f6;
        }
        .segment-color-hex {
          font-size: 14px;
          color: #6b7280;
          font-family: monospace;
        }
        .segment-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #f3f4f6;
        }
        .segment-modal-cancel {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: transparent;
          color: #4b5563;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .segment-modal-cancel:hover:not(:disabled) {
          background: #f9fafb;
        }
        .segment-modal-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .segment-modal-submit {
          padding: 8px 16px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .segment-modal-submit:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
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
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .segment-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
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
          }
          .segment-search-wrapper {
            flex-direction: column;
            align-items: stretch;
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
        }
      `}</style>
    </>
  );
};

export default Segments;