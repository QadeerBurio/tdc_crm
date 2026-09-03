// pages/organization/Departments.jsx - Modern Design with #013E37, #FFEFB3, White

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Plus, Edit, Trash2, RefreshCw,
  Search, X, UserPlus, Layers, Building2,
  Check, Grid3x3, List, ArrowRight, Shield,
  Sparkles, TrendingUp, Zap, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

const Departments = () => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [segments, setSegments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    segmentId: '',
    headId: '',
    status: 'active'
  });

  const getHeaders = () => ({
    headers: token ? { 
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    } : {}
  });

  // Load companies
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
      let url = `${API_URL}/organization/segments?t=${Date.now()}`;
      if (companyId && companyId !== 'all') {
        url = `${API_URL}/organization/segments?companyId=${companyId}&t=${Date.now()}`;
      }
      const response = await axios.get(url, getHeaders());
      const data = response.data.data || [];
      setSegments(data);
      return data;
    } catch (error) {
      console.error('Error loading segments:', error);
      toast.error('Failed to load segments');
      return [];
    }
  };

  // Load departments with filters
  const loadDepartments = async (segmentId = null, companyId = null) => {
    try {
      let url = `${API_URL}/organization/departments?t=${Date.now()}`;
      
      if (segmentId && segmentId !== 'all') {
        url = `${API_URL}/organization/departments?segmentId=${segmentId}&t=${Date.now()}`;
      } else if (companyId && companyId !== 'all') {
        url = `${API_URL}/organization/departments?companyId=${companyId}&t=${Date.now()}`;
      }
      
      const response = await axios.get(url, getHeaders());
      const data = response.data.data || [];
      setDepartments(data);
      return data;
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('Failed to load departments');
      return [];
    }
  };

  // Load all data
  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const comps = await loadCompanies();
      const segs = await loadSegments(filterCompany !== 'all' ? filterCompany : null);
      
      let depts;
      if (filterSegment !== 'all') {
        depts = await loadDepartments(filterSegment, null);
      } else if (filterCompany !== 'all') {
        depts = await loadDepartments(null, filterCompany);
      } else {
        depts = await loadDepartments(null, null);
      }
      
      setSegments(segs);
      setDepartments(depts);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [filterCompany, filterSegment]);

  const handleCompanyChange = async (companyId) => {
    setFilterCompany(companyId);
    setFilterSegment('all');
    await loadAllData();
  };

  const handleSegmentChange = async (segmentId) => {
    setFilterSegment(segmentId);
    await loadAllData();
  };

  const getFilteredSegments = () => {
    if (filterCompany === 'all') return segments;
    return segments.filter(seg => {
      const companyId = typeof seg.companyId === 'object' ? seg.companyId?._id : seg.companyId;
      return companyId === filterCompany;
    });
  };

  const getFilteredDepartments = () => {
    let filtered = departments;
    
    if (searchTerm) {
      filtered = filtered.filter(dept => 
        (dept.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (dept.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredDepartments = getFilteredDepartments();
  const availableSegments = getFilteredSegments();

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRefresh = async () => {
    toast.loading('Refreshing...');
    await loadAllData();
    toast.dismiss();
    toast.success('Departments refreshed');
  };

  const openCreateModal = () => {
    setEditingDept(null);
    const defaultSegment = availableSegments.length > 0 ? availableSegments[0]._id : '';
    setFormData({
      name: '',
      slug: '',
      description: '',
      segmentId: defaultSegment,
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
      
      const submitData = {
        name: formData.name.trim(),
        slug: formData.slug || formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description || '',
        segmentId: formData.segmentId,
        status: formData.status || 'active'
      };

      if (formData.headId && formData.headId !== '' && formData.headId !== 'user1' && formData.headId !== 'user2') {
        submitData.headId = formData.headId;
      }

      let response;
      if (editingDept) {
        response = await axios.put(
          `${API_URL}/organization/departments/${editingDept._id}`,
          submitData,
          getHeaders()
        );
      } else {
        response = await axios.post(
          `${API_URL}/organization/departments`,
          submitData,
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
        await loadAllData();
      } else {
        toast.error(response.data.message || 'Failed to save department');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      const errorMsg = error.response?.data?.message || 'Failed to save department';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? This will also delete all teams under it.')) return;
    
    try {
      await axios.delete(`${API_URL}/organization/departments/${id}`, getHeaders());
      toast.success('Department deleted successfully');
      await loadAllData();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error(error.response?.data?.message || 'Failed to delete department');
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

  const getCompanyName = (segmentId) => {
    const segment = segments.find(s => s._id === segmentId);
    if (!segment) return 'Unknown Company';
    const companyId = typeof segment.companyId === 'object' ? segment.companyId?._id : segment.companyId;
    const company = companies.find(c => c._id === companyId);
    return company?.name || 'Unknown Company';
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
              <Users className="department-title-icon" color="#013E37" />
              Departments
            </h1>
            <p className="department-subtitle">Manage departments across segments</p>
          </div>
          <div className="department-header-right">
            <button
              onClick={handleRefresh}
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
            <Search className="department-search-icon" color="#013E37" />
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
              value={filterCompany}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="department-filter-select"
            >
              <option value="all">All Companies</option>
              {companies.map(comp => (
                <option key={comp._id} value={comp._id}>{comp.name}</option>
              ))}
            </select>
            <select
              value={filterSegment}
              onChange={(e) => handleSegmentChange(e.target.value)}
              className="department-filter-select"
            >
              <option value="all">All Segments</option>
              {availableSegments.map(seg => (
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
              {filteredDepartments.map((dept, index) => (
                <div 
                  key={dept._id} 
                  className="department-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onMouseEnter={() => setHoveredCard(dept._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="department-card-inner">
                    <div className="department-card-header">
                      <div className="department-card-icon" style={{ backgroundColor: '#FFEFB3' }}>
                        <Users className="department-card-icon-svg" color="#013E37" />
                      </div>
                      <div className="department-card-info">
                        <h3 className="department-card-title">{dept.name}</h3>
                        <p className="department-card-segment">{getSegmentName(dept.segmentId)}</p>
                        <p className="department-card-company">
                          <Building2 className="department-card-company-icon" />
                          {getCompanyName(dept.segmentId)}
                        </p>
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
                          <Layers className="department-stat-icon" color="#013E37" />
                          {dept.teamCount || 0} Teams
                        </span>
                        <span className="department-stat">
                          <Users className="department-stat-icon" color="#013E37" />
                          {dept.memberCount || 0} Members
                        </span>
                      </div>
                    </div>

                    {hoveredCard === dept._id && (
                      <div className="department-card-hover-indicator">
                        <ArrowRight size={18} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="department-list">
              {filteredDepartments.map((dept, index) => (
                <div 
                  key={dept._id} 
                  className="department-list-item"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="department-list-item-left">
                    <div className="department-list-icon" style={{ backgroundColor: '#FFEFB3' }}>
                      <Users className="department-list-icon-svg" color="#013E37" />
                    </div>
                    <div className="department-list-info">
                      <div className="department-list-title-row">
                        <span className="department-list-name">{dept.name}</span>
                        <span className="department-list-segment">{getSegmentName(dept.segmentId)}</span>
                        <span className="department-list-company">
                          <Building2 className="department-list-company-icon" />
                          {getCompanyName(dept.segmentId)}
                        </span>
                        <span className={`department-status ${getStatusColor(dept.status)}`}>
                          <span className="department-status-dot"></span>
                          {dept.status || 'Active'}
                        </span>
                      </div>
                      <p className="department-list-desc">{dept.description || 'No description'}</p>
                      <div className="department-list-stats">
                        <span className="department-stat">
                          <Layers className="department-stat-icon" color="#013E37" />
                          {dept.teamCount || 0} Teams
                        </span>
                        <span className="department-stat">
                          <Users className="department-stat-icon" color="#013E37" />
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
            <div className="department-empty-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
              <Users className="department-empty-icon" color="#013E37" />
            </div>
            <h3 className="department-empty-title">No Departments Found</h3>
            <p className="department-empty-subtitle">
              {searchTerm ? 'Try adjusting your search' : 
               filterSegment !== 'all' ? 'No departments in this segment' :
               filterCompany !== 'all' ? 'Create your first department for this company' :
               'Create your first department to get started'}
            </p>
            {!searchTerm && (
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
                  {segments.map(seg => {
                    const segCompanyId = typeof seg.companyId === 'object' ? seg.companyId?._id : seg.companyId;
                    if (filterCompany !== 'all' && segCompanyId !== filterCompany) return null;
                    return (
                      <option key={seg._id} value={seg._id}>
                        {seg.name} ({getCompanyName(seg._id)})
                      </option>
                    );
                  })}
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
                <div className="department-form-hint-text">
                  <p className="department-form-hint">User management coming soon. Leave empty for now.</p>
                  <input 
                    type="text" 
                    value={formData.headId}
                    onChange={(e) => handleChange('headId', e.target.value)}
                    className="department-form-input" 
                    placeholder="Enter user ID (optional)"
                  />
                </div>
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

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .department-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           HEADER
           ============================================ */
        .department-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
          animation: fadeInDown 0.6s ease;
        }
        .department-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .department-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .department-title-icon {
          width: 28px;
          height: 28px;
          animation: pulse 2s ease-in-out infinite;
        }
        .department-subtitle {
          color: #013E37;
          opacity: 0.6;
          font-size: 15px;
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
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .department-refresh-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: rotate(180deg);
        }
        .department-refresh-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          transition: transform 0.3s ease;
        }
        .department-view-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #FFEFB3;
          border-radius: 8px;
          padding: 4px;
          transition: all 0.3s ease;
        }
        .department-view-btn {
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
        .department-view-btn:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }
        .department-view-active {
          background: #013E37;
          color: #FFFFFF;
          opacity: 1;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.2);
          animation: popIn 0.3s ease;
        }
        .department-view-active:hover {
          opacity: 1;
          transform: scale(1);
        }
        .department-view-icon {
          width: 16px;
          height: 16px;
        }
        .department-add-btn {
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
        .department-add-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .department-add-btn:active {
          transform: scale(0.95);
        }
        .department-add-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        .department-add-btn:hover .department-add-icon {
          transform: rotate(90deg);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .department-filters {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          animation: fadeIn 0.8s ease;
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
          opacity: 0.5;
          transition: all 0.3s ease;
        }
        .department-search-input {
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
        .department-search-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
          transform: scale(1.01);
        }
        .department-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
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
          color: #013E37;
          opacity: 0.4;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }
        .department-search-clear:hover {
          opacity: 0.8;
          transform: translateY(-50%) scale(1.2);
        }
        .department-search-clear-icon {
          width: 16px;
          height: 16px;
        }
        .department-filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .department-filter-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          background: #ffffff;
          min-width: 160px;
          color: #013E37;
          cursor: pointer;
        }
        .department-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .department-filter-select:hover {
          border-color: #013E37;
        }
        .department-count {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          white-space: nowrap;
          font-weight: 500;
        }

        /* ============================================
           GRID VIEW
           ============================================ */
        .department-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .department-card {
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
        .department-card::before {
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
        .department-card:hover::before {
          transform: scaleX(1);
        }
        .department-card:hover {
          box-shadow: 0 8px 30px rgba(1, 62, 55, 0.12);
          transform: translateY(-6px) scale(1.01);
          border-color: #013E37;
        }
        .department-card-inner {
          position: relative;
          z-index: 1;
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
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .department-card:hover .department-card-icon {
          transform: scale(1.05) rotate(-5deg);
        }
        .department-card-icon-svg {
          width: 24px;
          height: 24px;
          transition: transform 0.3s ease;
        }
        .department-card:hover .department-card-icon-svg {
          transform: scale(1.1);
        }
        .department-card-info {
          flex: 1;
          min-width: 0;
        }
        .department-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
          transition: color 0.3s ease;
        }
        .department-card:hover .department-card-title {
          color: #0A5C54;
        }
        .department-card-segment {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }
        .department-card-company {
          font-size: 12px;
          color: #013E37;
          font-weight: 500;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 4px;
          background: #FFEFB3;
          padding: 2px 8px;
          border-radius: 9999px;
          display: inline-flex;
          transition: all 0.3s ease;
        }
        .department-card:hover .department-card-company {
          background: #013E37;
          color: #ffffff;
        }
        .department-card-company-icon {
          width: 12px;
          height: 12px;
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
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.4;
          display: flex;
          align-items: center;
        }
        .department-card-action:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }
        .department-card-action-delete:hover {
          background: #FFEBEE;
          color: #D32F2F;
          opacity: 1;
        }
        .department-card-action-icon {
          width: 16px;
          height: 16px;
        }
        .department-card-desc {
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
          transition: all 0.3s ease;
        }
        .department-status-active {
          background: #013E37;
          color: #ffffff;
        }
        .department-status-inactive {
          background: #FFEFB3;
          color: #013E37;
        }
        .department-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s ease-in-out infinite;
        }
        .department-status-active .department-status-dot {
          background: #ffffff;
        }
        .department-status-inactive .department-status-dot {
          background: #013E37;
        }
        .department-head-badge {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          background: #FFEFB3;
          color: #013E37;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.3s ease;
        }
        .department-card:hover .department-head-badge {
          background: #013E37;
          color: #ffffff;
        }
        .department-head-icon {
          width: 12px;
          height: 12px;
        }
        .department-card-footer {
          border-top: 1px solid #FFEFB3;
          padding-top: 12px;
          transition: border-color 0.3s ease;
        }
        .department-card:hover .department-card-footer {
          border-color: #013E37;
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
          color: #013E37;
          opacity: 0.7;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .department-card:hover .department-stat {
          opacity: 1;
        }
        .department-stat-icon {
          width: 14px;
          height: 14px;
        }
        .department-card-hover-indicator {
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
        .department-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .department-list-item {
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
        .department-list-item::before {
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
        .department-list-item:hover::before {
          transform: scaleY(1);
        }
        .department-list-item:hover {
          border-color: #013E37;
          box-shadow: 0 4px 20px rgba(1, 62, 55, 0.08);
          transform: translateX(4px);
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
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .department-list-item:hover .department-list-icon {
          transform: scale(1.05) rotate(-5deg);
        }
        .department-list-icon-svg {
          width: 20px;
          height: 20px;
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
          color: #013E37;
          transition: color 0.3s ease;
        }
        .department-list-item:hover .department-list-name {
          color: #0A5C54;
        }
        .department-list-segment {
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
        }
        .department-list-company {
          font-size: 12px;
          color: #013E37;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #FFEFB3;
          padding: 2px 8px;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }
        .department-list-item:hover .department-list-company {
          background: #013E37;
          color: #ffffff;
        }
        .department-list-company-icon {
          width: 12px;
          height: 12px;
        }
        .department-list-desc {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
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
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.4;
          display: flex;
          align-items: center;
        }
        .department-list-action:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }
        .department-list-action-delete:hover {
          background: #FFEBEE;
          color: #D32F2F;
          opacity: 1;
        }
        .department-list-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .department-empty {
          background: #ffffff;
          border: 2px dashed #FFEFB3;
          border-radius: 16px;
          padding: 60px 24px;
          text-align: center;
          animation: fadeIn 0.8s ease;
        }
        .department-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          transition: all 0.3s ease;
          animation: float 3s ease-in-out infinite;
        }
        .department-empty-icon {
          width: 40px;
          height: 40px;
        }
        .department-empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .department-empty-subtitle {
          color: #013E37;
          opacity: 0.6;
          margin-top: 4px;
          font-size: 15px;
        }
        .department-empty-btn {
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
        .department-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .department-empty-btn:active {
          transform: scale(0.95);
        }
        .department-empty-btn-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        .department-empty-btn:hover .department-empty-btn-icon {
          transform: rotate(90deg);
        }

        /* ============================================
           MODAL
           ============================================ */
        .department-modal-overlay {
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
        .department-modal {
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
        .department-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
        }
        .department-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }
        .department-modal-close {
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
        .department-modal-close:hover {
          background: rgba(1, 62, 55, 0.1);
          opacity: 1;
          transform: rotate(90deg);
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
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .department-form-group:nth-child(1) { animation-delay: 0.05s; }
        .department-form-group:nth-child(2) { animation-delay: 0.1s; }
        .department-form-group:nth-child(3) { animation-delay: 0.15s; }
        .department-form-group:nth-child(4) { animation-delay: 0.2s; }
        .department-form-group:nth-child(5) { animation-delay: 0.25s; }
        .department-form-group:nth-child(6) { animation-delay: 0.3s; }
        .department-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }
        .department-form-hint-text {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .department-form-hint {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
          margin: 0;
        }
        .department-form-input,
        .department-form-select,
        .department-form-textarea {
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
        .department-form-input:focus,
        .department-form-select:focus,
        .department-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
          transform: scale(1.01);
        }
        .department-form-input::placeholder,
        .department-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.4;
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
          border-top: 1px solid #FFEFB3;
          background: #F8FAFC;
        }
        .department-modal-cancel {
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
        .department-modal-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
          transform: scale(1.02);
        }
        .department-modal-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .department-modal-submit {
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
        .department-modal-submit:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .department-modal-submit:active:not(:disabled) {
          transform: scale(0.95);
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

        /* ============================================
           LOADING
           ============================================ */
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
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .department-loading-text {
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
          .department-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
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
            flex-wrap: wrap;
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
            border-top: 1px solid #FFEFB3;
            padding-top: 12px;
          }
          .department-modal {
            margin: 16px;
            max-height: 95vh;
          }
          .department-title {
            font-size: 24px;
          }
          .department-add-btn {
            flex: 1;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .department-container {
            padding: 0 8px 16px 8px;
          }
          .department-card {
            padding: 16px;
          }
          .department-card-header {
            flex-wrap: wrap;
          }
          .department-card-badges {
            flex-wrap: wrap;
          }
          .department-card-stats {
            flex-wrap: wrap;
            gap: 8px;
          }
          .department-list-item {
            padding: 12px 16px;
          }
          .department-list-item-left {
            flex-wrap: wrap;
          }
          .department-list-title-row {
            flex-wrap: wrap;
          }
          .department-modal-body {
            padding: 16px;
          }
          .department-modal-footer {
            flex-direction: column-reverse;
          }
          .department-modal-cancel,
          .department-modal-submit {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default Departments;