// pages/organization/Departments.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Plus, Edit, Trash2, RefreshCw,
  Search, X, UserPlus, Layers,
  Check, Grid3x3, List
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

const Departments = () => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    segmentId: '',
    headId: '',
    status: 'active'
  });

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  // Load all data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [deptsRes, segsRes] = await Promise.all([
        axios.get(`${API_URL}/organization/departments`, getHeaders()),
        axios.get(`${API_URL}/organization/segments`, getHeaders())
      ]);
      
      setDepartments(deptsRes.data.data || []);
      setSegments(segsRes.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter departments
  const getFilteredDepartments = () => {
    let filtered = departments;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(dept => 
        dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by segment
    if (filterSegment !== 'all') {
      filtered = filtered.filter(dept => dept.segmentId === filterSegment);
    }
    
    return filtered;
  };

  const filteredDepartments = getFilteredDepartments();

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      segmentId: '',
      headId: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name || '',
      slug: dept.slug || '',
      description: dept.description || '',
      segmentId: dept.segmentId || '',
      headId: dept.headId?._id || dept.headId || '',
      status: dept.status || 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Please enter a department name');
        return;
      }
      if (!formData.segmentId) {
        toast.error('Please select a segment');
        return;
      }

      setSaving(true);
      
      let response;
      if (editingDept) {
        // Update existing department
        response = await axios.put(
          `${API_URL}/organization/departments/${editingDept._id}`,
          formData,
          getHeaders()
        );
      } else {
        // Create new department
        response = await axios.post(
          `${API_URL}/organization/departments`,
          formData,
          getHeaders()
        );
      }
      
      if (response.data.success) {
        toast.success(editingDept ? 'Department updated successfully' : 'Department created successfully');
        setShowModal(false);
        setEditingDept(null);
        setFormData({
          name: '',
          slug: '',
          description: '',
          segmentId: '',
          headId: '',
          status: 'active'
        });
        // Reload data
        await loadAllData();
      }
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(error.response?.data?.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? This will also delete all teams under it.')) return;
    
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/organization/departments/${id}`, getHeaders());
      toast.success('Department deleted successfully');
      await loadAllData();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error(error.response?.data?.message || 'Failed to delete department');
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'department-status-active'
      : 'department-status-inactive';
  };

  const getSegmentName = (segmentId) => {
    const segment = segments.find(s => s._id === segmentId);
    return segment?.name || 'Unknown Segment';
  };

  const getHeadName = (head) => {
    if (!head) return null;
    if (typeof head === 'object') {
      return `${head.firstName || ''} ${head.lastName || ''}`.trim() || head.name || 'Unknown';
    }
    return 'Unknown';
  };

  if (loading && !departments.length) {
    return (
      <div className="department-loading">
        <div className="department-loading-spinner"></div>
        <p className="department-loading-text">Loading departments...</p>
      </div>
    );
  }

  return (
    <>
      <div className="department-container">
        {/* Header */}
        <div className="department-header">
          <div className="department-header-left">
            <h1 className="department-title">
              <Users className="department-title-icon" />
              Departments
            </h1>
            <p className="department-subtitle">Manage departments across segments</p>
          </div>
          <div className="department-header-right">
            <button
              onClick={loadAllData}
              className="department-refresh-btn"
              title="Refresh"
            >
              <RefreshCw className="department-refresh-icon" />
            </button>
            <div className="department-view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`department-view-btn ${viewMode === 'grid' ? 'department-view-active' : ''}`}
              >
                <Grid3x3 className="department-view-icon" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`department-view-btn ${viewMode === 'list' ? 'department-view-active' : ''}`}
              >
                <List className="department-view-icon" />
              </button>
            </div>
            <button 
              onClick={openCreateModal}
              className="department-add-btn"
            >
              <Plus className="department-add-icon" />
              New Department
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="department-filters">
          <div className="department-search">
            <Search className="department-search-icon" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={handleSearch}
              className="department-search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="department-search-clear"
              >
                <X className="department-search-clear-icon" />
              </button>
            )}
          </div>
          <div className="department-filter-group">
            <select
              value={filterSegment}
              onChange={(e) => setFilterSegment(e.target.value)}
              className="department-filter-select"
            >
              <option value="all">All Segments</option>
              {segments && segments.map(seg => (
                <option key={seg._id} value={seg._id}>{seg.name}</option>
              ))}
            </select>
            <span className="department-count">
              {filteredDepartments.length} department{filteredDepartments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Departments Grid/List */}
        {filteredDepartments.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="department-grid">
              {filteredDepartments.map((dept) => (
                <div key={dept._id} className="department-card">
                  <div className="department-card-header">
                    <div className="department-card-icon">
                      <Users className="department-card-icon-svg" />
                    </div>
                    <div className="department-card-info">
                      <h3 className="department-card-title">{dept.name}</h3>
                      <p className="department-card-segment">{getSegmentName(dept.segmentId)}</p>
                    </div>
                    <div className="department-card-actions">
                      <button 
                        onClick={() => openEditModal(dept)}
                        className="department-card-action"
                        title="Edit"
                      >
                        <Edit className="department-card-action-icon" />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept._id)}
                        className="department-card-action department-card-action-delete"
                        title="Delete"
                      >
                        <Trash2 className="department-card-action-icon" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="department-card-desc">{dept.description || 'No description'}</p>
                  
                  <div className="department-card-badges">
                    <span className={`department-status ${getStatusColor(dept.status)}`}>
                      <span className="department-status-dot"></span>
                      {dept.status || 'Active'}
                    </span>
                    {dept.headId && (
                      <span className="department-head-badge">
                        <UserPlus className="department-head-icon" />
                        Head: {getHeadName(dept.headId)}
                      </span>
                    )}
                  </div>

                  <div className="department-card-footer">
                    <div className="department-card-stats">
                      <span className="department-stat">
                        <Layers className="department-stat-icon" />
                        {dept.teamCount || 0} Teams
                      </span>
                      <span className="department-stat">
                        <Users className="department-stat-icon" />
                        {dept.memberCount || 0} Members
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="department-list">
              {filteredDepartments.map((dept) => (
                <div key={dept._id} className="department-list-item">
                  <div className="department-list-item-left">
                    <div className="department-list-icon">
                      <Users className="department-list-icon-svg" />
                    </div>
                    <div className="department-list-info">
                      <div className="department-list-title-row">
                        <span className="department-list-name">{dept.name}</span>
                        <span className="department-list-segment">{getSegmentName(dept.segmentId)}</span>
                        <span className={`department-status ${getStatusColor(dept.status)}`}>
                          <span className="department-status-dot"></span>
                          {dept.status || 'Active'}
                        </span>
                      </div>
                      <p className="department-list-desc">{dept.description || 'No description'}</p>
                      <div className="department-list-stats">
                        <span className="department-stat">
                          <Layers className="department-stat-icon" />
                          {dept.teamCount || 0} Teams
                        </span>
                        <span className="department-stat">
                          <Users className="department-stat-icon" />
                          {dept.memberCount || 0} Members
                        </span>
                        {dept.headId && (
                          <span className="department-head-badge">
                            <UserPlus className="department-head-icon" />
                            Head: {getHeadName(dept.headId)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="department-list-item-right">
                    <button 
                      onClick={() => openEditModal(dept)}
                      className="department-list-action"
                      title="Edit"
                    >
                      <Edit className="department-list-action-icon" />
                    </button>
                    <button 
                      onClick={() => handleDelete(dept._id)}
                      className="department-list-action department-list-action-delete"
                      title="Delete"
                    >
                      <Trash2 className="department-list-action-icon" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="department-empty">
            <div className="department-empty-icon-wrapper">
              <Users className="department-empty-icon" />
            </div>
            <h3 className="department-empty-title">No Departments Found</h3>
            <p className="department-empty-subtitle">
              {searchTerm || filterSegment !== 'all' ? 'Try adjusting your filters' : 'Create your first department to get started'}
            </p>
            {!searchTerm && filterSegment === 'all' && (
              <button 
                onClick={openCreateModal}
                className="department-empty-btn"
              >
                <Plus className="department-empty-btn-icon" />
                Create Department
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="department-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="department-modal" onClick={(e) => e.stopPropagation()}>
            <div className="department-modal-header">
              <h2 className="department-modal-title">
                {editingDept ? 'Edit Department' : 'Create New Department'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="department-modal-close"
              >
                <X className="department-modal-close-icon" />
              </button>
            </div>
            
            <div className="department-modal-body">
              <div className="department-form-group">
                <label className="department-form-label">Department Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="department-form-input" 
                  placeholder="e.g., Engineering, Marketing, Sales"
                  autoFocus
                />
              </div>

              <div className="department-form-group">
                <label className="department-form-label">Slug</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  className="department-form-input" 
                  placeholder="engineering-department"
                />
              </div>
              
              <div className="department-form-group">
                <label className="department-form-label">Segment *</label>
                <select 
                  value={formData.segmentId}
                  onChange={(e) => handleChange('segmentId', e.target.value)}
                  className="department-form-select"
                  required
                >
                  <option value="">Select Segment</option>
                  {segments && segments.map(seg => (
                    <option key={seg._id} value={seg._id}>{seg.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="department-form-group">
                <label className="department-form-label">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="department-form-textarea" 
                  rows="3" 
                  placeholder="Brief description of this department"
                />
              </div>
              
              <div className="department-form-group">
                <label className="department-form-label">Department Head</label>
                <select 
                  value={formData.headId}
                  onChange={(e) => handleChange('headId', e.target.value)}
                  className="department-form-select"
                >
                  <option value="">Select Department Head</option>
                  <option value="user1">John Doe</option>
                  <option value="user2">Jane Smith</option>
                </select>
                <p className="department-form-hint">User management coming soon</p>
              </div>
              
              <div className="department-form-group">
                <label className="department-form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="department-form-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            
            <div className="department-modal-footer">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="department-modal-cancel"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !formData.name.trim() || !formData.segmentId}
                className="department-modal-submit"
              >
                {saving ? (
                  <>
                    <div className="department-modal-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="department-modal-submit-icon" />
                    {editingDept ? 'Update Department' : 'Create Department'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .department-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }
        .department-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .department-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .department-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }
        .department-title-icon {
          width: 28px;
          height: 28px;
          color: #8b5cf6;
        }
        .department-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }
        .department-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .department-refresh-btn {
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
        .department-refresh-btn:hover {
          background: #f9fafb;
        }
        .department-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }
        .department-view-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 4px;
        }
        .department-view-btn {
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
        .department-view-btn:hover {
          color: #374151;
        }
        .department-view-active {
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          color: #111827;
        }
        .department-view-icon {
          width: 16px;
          height: 16px;
        }
        .department-add-btn {
          padding: 8px 16px;
          background: #8b5cf6;
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
          box-shadow: 0 1px 3px rgba(139, 92, 246, 0.2);
        }
        .department-add-btn:hover {
          background: #7c3aed;
          box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);
          transform: translateY(-1px);
        }
        .department-add-icon {
          width: 16px;
          height: 16px;
        }
        .department-filters {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .department-search {
          flex: 1;
          min-width: 200px;
          position: relative;
        }
        .department-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }
        .department-search-input {
          width: 100%;
          padding: 8px 40px 8px 36px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
        }
        .department-search-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }
        .department-search-clear {
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
        .department-search-clear:hover {
          color: #6b7280;
        }
        .department-search-clear-icon {
          width: 16px;
          height: 16px;
        }
        .department-filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .department-filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          min-width: 160px;
        }
        .department-filter-select:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }
        .department-count {
          font-size: 14px;
          color: #6b7280;
          white-space: nowrap;
        }
        .department-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .department-card {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .department-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
          border-color: #e5e7eb;
        }
        .department-card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }
        .department-card-icon {
          width: 48px;
          height: 48px;
          background: #f3e8ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .department-card-icon-svg {
          width: 24px;
          height: 24px;
          color: #8b5cf6;
        }
        .department-card-info {
          flex: 1;
          min-width: 0;
        }
        .department-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        .department-card-segment {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }
        .department-card-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .department-card-action {
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
        .department-card-action:hover {
          background: #f3f4f6;
          color: #4b5563;
        }
        .department-card-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }
        .department-card-action-icon {
          width: 16px;
          height: 16px;
        }
        .department-card-desc {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .department-card-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .department-status {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .department-status-active {
          background: #dcfce7;
          color: #16a34a;
        }
        .department-status-inactive {
          background: #f3f4f6;
          color: #6b7280;
        }
        .department-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .department-status-active .department-status-dot {
          background: #22c55e;
        }
        .department-status-inactive .department-status-dot {
          background: #9ca3af;
        }
        .department-head-badge {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          background: #dbeafe;
          color: #1d4ed8;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .department-head-icon {
          width: 12px;
          height: 12px;
        }
        .department-card-footer {
          border-top: 1px solid #f3f4f6;
          padding-top: 12px;
        }
        .department-card-stats {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .department-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #6b7280;
        }
        .department-stat-icon {
          width: 14px;
          height: 14px;
        }
        .department-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .department-list-item {
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
        .department-list-item:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .department-list-item-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 200px;
        }
        .department-list-icon {
          width: 40px;
          height: 40px;
          background: #f3e8ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .department-list-icon-svg {
          width: 20px;
          height: 20px;
          color: #8b5cf6;
        }
        .department-list-info {
          flex: 1;
          min-width: 0;
        }
        .department-list-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .department-list-name {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
        }
        .department-list-segment {
          font-size: 12px;
          color: #6b7280;
        }
        .department-list-desc {
          font-size: 13px;
          color: #6b7280;
          margin: 2px 0 0 0;
        }
        .department-list-stats {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 4px;
          flex-wrap: wrap;
        }
        .department-list-item-right {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .department-list-action {
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
        .department-list-action:hover {
          background: #f3f4f6;
          color: #4b5563;
        }
        .department-list-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }
        .department-list-action-icon {
          width: 16px;
          height: 16px;
        }
        .department-empty {
          background: #ffffff;
          border: 2px dashed #e5e7eb;
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
        }
        .department-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f3e8ff;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .department-empty-icon {
          width: 40px;
          height: 40px;
          color: #a78bfa;
        }
        .department-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        .department-empty-subtitle {
          color: #6b7280;
          margin-top: 4px;
        }
        .department-empty-btn {
          margin-top: 16px;
          padding: 10px 24px;
          background: #8b5cf6;
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
        .department-empty-btn:hover {
          background: #7c3aed;
          transform: translateY(-1px);
        }
        .department-empty-btn-icon {
          width: 16px;
          height: 16px;
        }
        .department-modal-overlay {
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
        .department-modal {
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
        .department-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
        }
        .department-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .department-modal-close {
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
        .department-modal-close:hover {
          background: #f3f4f6;
        }
        .department-modal-close-icon {
          width: 20px;
          height: 20px;
        }
        .department-modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .department-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .department-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        .department-form-hint {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
        }
        .department-form-input,
        .department-form-select,
        .department-form-textarea {
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
        .department-form-input:focus,
        .department-form-select:focus,
        .department-form-textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }
        .department-form-textarea {
          resize: vertical;
          min-height: 60px;
        }
        .department-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #f3f4f6;
        }
        .department-modal-cancel {
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
        .department-modal-cancel:hover:not(:disabled) {
          background: #f9fafb;
        }
        .department-modal-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .department-modal-submit {
          padding: 8px 16px;
          background: #8b5cf6;
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
        .department-modal-submit:hover:not(:disabled) {
          background: #7c3aed;
          transform: translateY(-1px);
        }
        .department-modal-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .department-modal-submit-icon {
          width: 16px;
          height: 16px;
        }
        .department-modal-spinner {
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
        .department-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .department-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3e8ff;
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .department-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
        }
        @media (max-width: 768px) {
          .department-grid {
            grid-template-columns: 1fr;
          }
          .department-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .department-header-right {
            width: 100%;
          }
          .department-filters {
            flex-direction: column;
            align-items: stretch;
          }
          .department-filter-group {
            flex-wrap: wrap;
          }
          .department-list-item {
            flex-direction: column;
            align-items: stretch;
          }
          .department-list-item-right {
            justify-content: flex-end;
            border-top: 1px solid #f3f4f6;
            padding-top: 12px;
          }
          .department-modal {
            margin: 16px;
            max-height: 95vh;
          }
        }
      `}</style>
    </>
  );
};

export default Departments;