// pages/partners/Brands.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, Edit, Trash2, Building2,
  Filter, Download, Eye, Briefcase, Users,
  X, RefreshCw, Mail, Phone, MapPin,
  Globe, Award, Star, Zap, Layers, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const Brands = () => {
  const { token } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all' });
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    partnershipType: 'strategic',
    partnershipValue: '',
    status: 'prospect',
    website: '',
    email: '',
    phone: '',
    location: '',
    contactPerson: {
      name: '',
      email: '',
      phone: ''
    },
    assignedTo: ''
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchBrands();
  }, [search, filters]);

  const fetchBrands = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.status !== 'all') params.append('status', filters.status);
      
      let data = [];
      try {
        const response = await fetch(
          `${API_URL}/partners/brands?${params.toString()}`,
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
        data = getMockBrands();
        toast.info('Showing sample brand data');
      }

      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands(getMockBrands());
      toast.error('Failed to load brands, showing sample data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockBrands = () => {
    return [
      {
        _id: '1',
        name: 'Nike',
        industry: 'Sports & Fitness',
        description: 'Global leader in athletic footwear and apparel',
        partnershipType: 'strategic',
        partnershipValue: 1000000,
        status: 'active',
        website: 'https://nike.com',
        email: 'partners@nike.com',
        phone: '+1 (555) 123-4567',
        location: 'Beaverton, Oregon, USA',
        contactPerson: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@nike.com',
          phone: '+1 (555) 987-6543'
        },
        assignedTo: { firstName: 'John', lastName: 'Doe' }
      },
      {
        _id: '2',
        name: 'Apple',
        industry: 'Technology',
        description: 'Leading technology company specializing in consumer electronics',
        partnershipType: 'technology',
        partnershipValue: 2500000,
        status: 'onboarded',
        website: 'https://apple.com',
        email: 'partners@apple.com',
        phone: '+1 (555) 234-5678',
        location: 'Cupertino, California, USA',
        contactPerson: {
          name: 'Mike Chen',
          email: 'mike.chen@apple.com',
          phone: '+1 (555) 876-5432'
        },
        assignedTo: { firstName: 'Sarah', lastName: 'Smith' }
      },
      {
        _id: '3',
        name: 'Coca-Cola',
        industry: 'Beverage',
        description: 'Global beverage company with iconic brands',
        partnershipType: 'marketing',
        partnershipValue: 750000,
        status: 'interested',
        website: 'https://coca-cola.com',
        email: 'partners@coca-cola.com',
        phone: '+1 (555) 345-6789',
        location: 'Atlanta, Georgia, USA',
        contactPerson: {
          name: 'Emily Davis',
          email: 'emily.davis@coca-cola.com',
          phone: '+1 (555) 765-4321'
        },
        assignedTo: { firstName: 'Mike', lastName: 'Johnson' }
      },
      {
        _id: '4',
        name: 'Google',
        industry: 'Technology',
        description: 'Global technology company focused on internet services',
        partnershipType: 'technology',
        partnershipValue: 3000000,
        status: 'negotiating',
        website: 'https://google.com',
        email: 'partners@google.com',
        phone: '+1 (555) 456-7890',
        location: 'Mountain View, California, USA',
        contactPerson: {
          name: 'David Park',
          email: 'david.park@google.com',
          phone: '+1 (555) 654-3210'
        },
        assignedTo: { firstName: 'Emma', lastName: 'Wilson' }
      }
    ];
  };

  const handleRefresh = () => {
    fetchBrands(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingBrand 
        ? `${API_URL}/partners/brands/${editingBrand._id}`
        : `${API_URL}/partners/brands`;
      
      const method = editingBrand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success(editingBrand ? 'Brand updated successfully!' : 'Brand created successfully!');
          setShowModal(false);
          setEditingBrand(null);
          resetForm();
          await fetchBrands(true);
        }
      } else {
        throw new Error('Failed to save brand');
      }
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error(error.message || 'Failed to save brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;

    try {
      const response = await fetch(
        `${API_URL}/partners/brands/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success('Brand deleted successfully');
        await fetchBrands(true);
      } else {
        throw new Error('Failed to delete brand');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Failed to delete brand');
    }
  };

  const openModal = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name || '',
        industry: brand.industry || '',
        description: brand.description || '',
        partnershipType: brand.partnershipType || 'strategic',
        partnershipValue: brand.partnershipValue || '',
        status: brand.status || 'prospect',
        website: brand.website || '',
        email: brand.email || '',
        phone: brand.phone || '',
        location: brand.location || '',
        contactPerson: {
          name: brand.contactPerson?.name || '',
          email: brand.contactPerson?.email || '',
          phone: brand.contactPerson?.phone || ''
        },
        assignedTo: brand.assignedTo?._id || brand.assignedTo || ''
      });
    } else {
      setEditingBrand(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      description: '',
      partnershipType: 'strategic',
      partnershipValue: '',
      status: 'prospect',
      website: '',
      email: '',
      phone: '',
      location: '',
      contactPerson: {
        name: '',
        email: '',
        phone: ''
      },
      assignedTo: ''
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

  const getStatusColor = (status) => {
    const colors = {
      'active': 'br-status-active',
      'onboarded': 'br-status-onboarded',
      'interested': 'br-status-interested',
      'negotiating': 'br-status-negotiating',
      'prospect': 'br-status-prospect',
      'inactive': 'br-status-inactive'
    };
    return colors[status] || 'br-status-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Active',
      'onboarded': 'Onboarded',
      'interested': 'Interested',
      'negotiating': 'Negotiating',
      'prospect': 'Prospect',
      'inactive': 'Inactive'
    };
    return labels[status] || status;
  };

  const getPartnershipTypeLabel = (type) => {
    const labels = {
      'strategic': 'Strategic',
      'technology': 'Technology',
      'marketing': 'Marketing',
      'distribution': 'Distribution',
      'joint_venture': 'Joint Venture',
      'licensing': 'Licensing'
    };
    return labels[type] || type;
  };

  const statusOptions = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'interested', label: 'Interested' },
    { value: 'negotiating', label: 'Negotiating' },
    { value: 'onboarded', label: 'Onboarded' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const partnershipTypeOptions = [
    { value: 'strategic', label: 'Strategic' },
    { value: 'technology', label: 'Technology' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'distribution', label: 'Distribution' },
    { value: 'joint_venture', label: 'Joint Venture' },
    { value: 'licensing', label: 'Licensing' }
  ];

  if (loading) {
    return (
      <div className="br-loading">
        <div className="br-loading-spinner"></div>
        <p className="br-loading-text">Loading brands...</p>
      </div>
    );
  }

  return (
    <>
      <div className="br-container">
        {/* Header */}
        <div className="br-header">
          <div className="br-header-left">
            <div className="br-title-wrapper">
              <div className="br-title-icon">
                <Layers className="br-title-svg" />
              </div>
              <div>
                <h1 className="br-title">Brands</h1>
                <p className="br-subtitle">Manage brand partnerships</p>
              </div>
            </div>
            <span className="br-count">{brands.length} brands</span>
          </div>
          <div className="br-header-right">
            <button className="br-icon-btn" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`br-refresh-icon ${refreshing ? 'br-spin' : ''}`} />
            </button>
            <button className="br-export-btn">
              <Download className="br-btn-icon" />
              Export
            </button>
            <button 
              onClick={() => openModal()}
              className="br-add-btn"
            >
              <Plus className="br-btn-icon" />
              Add Brand
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="br-filters">
          <div className="br-search-wrapper">
            <Search className="br-search-icon" />
            <input
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="br-search-input"
            />
            {search && (
              <button className="br-search-clear" onClick={() => setSearch('')}>
                <X className="br-search-clear-icon" />
              </button>
            )}
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="br-filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="onboarded">Onboarded</option>
            <option value="interested">Interested</option>
            <option value="negotiating">Negotiating</option>
            <option value="prospect">Prospect</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Brands Grid */}
        <div className="br-grid">
          {brands.map((brand, index) => (
            <div key={brand._id} className="br-card" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="br-card-header">
                <div className="br-card-left">
                  <div className="br-card-icon">
                    <Building2 className="br-card-icon-svg" />
                  </div>
                  <div className="br-card-info">
                    <h3 className="br-card-title">{brand.name}</h3>
                    <p className="br-card-industry">{brand.industry || 'No industry'}</p>
                  </div>
                </div>
                <span className={`br-card-status ${getStatusColor(brand.status)}`}>
                  {getStatusLabel(brand.status)}
                </span>
              </div>
              
              {brand.description && (
                <p className="br-card-desc">{brand.description}</p>
              )}
              
              <div className="br-card-badges">
                {brand.partnershipType && (
                  <span className="br-badge br-badge-purple">
                    {getPartnershipTypeLabel(brand.partnershipType)}
                  </span>
                )}
                {brand.partnershipValue && (
                  <span className="br-badge br-badge-green">
                    ${Number(brand.partnershipValue).toLocaleString()}
                  </span>
                )}
              </div>
              
              {brand.contactPerson && brand.contactPerson.name && (
                <div className="br-card-contact">
                  <Users className="br-contact-icon" />
                  <span className="br-contact-text">
                    {brand.contactPerson.name}
                    {brand.contactPerson.email && (
                      <>
                        <span className="br-contact-separator">•</span>
                        <span className="br-contact-email">{brand.contactPerson.email}</span>
                      </>
                    )}
                  </span>
                </div>
              )}
              
              {brand.location && (
                <div className="br-card-location">
                  <MapPin className="br-location-icon" />
                  <span className="br-location-text">{brand.location}</span>
                </div>
              )}
              
              <div className="br-card-footer">
                <div className="br-card-assignee">
                  <span className="br-assignee-label">Assigned:</span>
                  <span className="br-assignee-name">
                    {brand.assignedTo?.firstName} {brand.assignedTo?.lastName || 'Unassigned'}
                  </span>
                </div>
                <div className="br-card-actions">
                  <button 
                    className="br-action-btn br-action-view"
                    onClick={() => {
                      toast.info('View details coming soon');
                    }}
                    title="View"
                  >
                    <Eye className="br-action-icon" />
                  </button>
                  <button 
                    className="br-action-btn br-action-edit"
                    onClick={() => openModal(brand)}
                    title="Edit"
                  >
                    <Edit className="br-action-icon" />
                  </button>
                  <button 
                    className="br-action-btn br-action-delete"
                    onClick={() => handleDelete(brand._id)}
                    title="Delete"
                  >
                    <Trash2 className="br-action-icon" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {brands.length === 0 && (
          <div className="br-empty">
            <div className="br-empty-icon-wrapper">
              <Building2 className="br-empty-icon" />
            </div>
            <h3 className="br-empty-title">No brands found</h3>
            <p className="br-empty-subtitle">Start by adding your first brand partner</p>
            <button className="br-empty-btn" onClick={() => openModal()}>
              <Plus className="br-btn-icon" />
              Add Brand
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="br-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="br-modal" onClick={(e) => e.stopPropagation()}>
            <div className="br-modal-header">
              <div className="br-modal-title-wrapper">
                <Building2 className="br-modal-icon" />
                <h2 className="br-modal-title">
                  {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                </h2>
              </div>
              <button className="br-modal-close" onClick={() => setShowModal(false)}>
                <X className="br-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="br-modal-form">
              <div className="br-form-group">
                <label className="br-form-label">
                  Brand Name <span className="br-form-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="br-form-input"
                  placeholder="Enter brand name"
                  autoFocus
                />
              </div>

              <div className="br-form-grid">
                <div className="br-form-group">
                  <label className="br-form-label">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    className="br-form-input"
                    placeholder="e.g., Technology, Sports"
                  />
                </div>
                <div className="br-form-group">
                  <label className="br-form-label">Partnership Type</label>
                  <select
                    value={formData.partnershipType}
                    onChange={(e) => handleChange('partnershipType', e.target.value)}
                    className="br-form-select"
                  >
                    {partnershipTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="br-form-group">
                <label className="br-form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="br-form-textarea"
                  rows="2"
                  placeholder="Brief description of the brand"
                />
              </div>

              <div className="br-form-grid">
                <div className="br-form-group">
                  <label className="br-form-label">Partnership Value</label>
                  <input
                    type="number"
                    value={formData.partnershipValue}
                    onChange={(e) => handleChange('partnershipValue', e.target.value)}
                    className="br-form-input"
                    placeholder="0"
                  />
                </div>
                <div className="br-form-group">
                  <label className="br-form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="br-form-select"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="br-form-grid">
                <div className="br-form-group">
                  <label className="br-form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="br-form-input"
                    placeholder="brand@example.com"
                  />
                </div>
                <div className="br-form-group">
                  <label className="br-form-label">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="br-form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="br-form-grid">
                <div className="br-form-group">
                  <label className="br-form-label">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="br-form-input"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="br-form-group">
                  <label className="br-form-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="br-form-input"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="br-form-section">
                <h4 className="br-form-section-title">Contact Person</h4>
                <div className="br-form-grid">
                  <div className="br-form-group">
                    <label className="br-form-label">Name</label>
                    <input
                      type="text"
                      value={formData.contactPerson.name}
                      onChange={(e) => handleChange('contactPerson.name', e.target.value)}
                      className="br-form-input"
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="br-form-group">
                    <label className="br-form-label">Email</label>
                    <input
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) => handleChange('contactPerson.email', e.target.value)}
                      className="br-form-input"
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>
                <div className="br-form-group">
                  <label className="br-form-label">Phone</label>
                  <input
                    type="text"
                    value={formData.contactPerson.phone}
                    onChange={(e) => handleChange('contactPerson.phone', e.target.value)}
                    className="br-form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="br-form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="br-form-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="br-form-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="br-form-spinner"></div>
                      {editingBrand ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="br-btn-icon" />
                      {editingBrand ? 'Update Brand' : 'Add Brand'}
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
        .br-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .br-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .br-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .br-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           HEADER
           ============================================ */
        .br-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeInDown 0.6s ease;
        }
        .br-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .br-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .br-title-icon {
          width: 48px;
          height: 48px;
          background: #013E37;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.25);
        }
        .br-title-svg {
          width: 24px;
          height: 24px;
          color: #FFEFB3;
        }
        .br-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .br-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }
        .br-count {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          background: #FFEFB3;
          padding: 2px 14px;
          border-radius: 12px;
        }
        .br-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .br-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
        }
        .br-icon-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .br-refresh-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        .br-spin {
          animation: spin 1s linear infinite;
        }
        .br-btn-icon {
          width: 16px;
          height: 16px;
        }
        .br-export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          color: #013E37;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .br-export-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .br-add-btn {
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
        .br-add-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.4);
        }
        .br-add-btn:active {
          transform: scale(0.95);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .br-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .br-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }
        .br-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.4;
        }
        .br-search-input {
          width: 100%;
          padding: 8px 36px 8px 36px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          color: #013E37;
          transition: all 0.3s ease;
        }
        .br-search-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .br-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }
        .br-search-clear {
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
        .br-search-clear:hover {
          background: #FFEFB3;
          opacity: 1;
        }
        .br-search-clear-icon {
          width: 14px;
          height: 14px;
        }
        .br-filter-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #013E37;
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 140px;
        }
        .br-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .br-filter-select:hover {
          border-color: #013E37;
        }

        /* ============================================
           GRID
           ============================================ */
        .br-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .br-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          padding: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.5s ease both;
          opacity: 0;
          position: relative;
          overflow: hidden;
        }
        .br-card::before {
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
        .br-card:hover::before {
          transform: scaleX(1);
        }
        .br-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.1);
          border-color: #013E37;
        }
        .br-card:nth-child(1) { animation-delay: 0.05s; }
        .br-card:nth-child(2) { animation-delay: 0.1s; }
        .br-card:nth-child(3) { animation-delay: 0.15s; }
        .br-card:nth-child(4) { animation-delay: 0.2s; }
        .br-card:nth-child(5) { animation-delay: 0.25s; }

        .br-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .br-card-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .br-card-icon {
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
        .br-card:hover .br-card-icon {
          transform: scale(1.05) rotate(-5deg);
        }
        .br-card-icon-svg {
          width: 22px;
          height: 22px;
          color: #013E37;
        }
        .br-card-info {
          flex: 1;
          min-width: 0;
        }
        .br-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .br-card-industry {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }
        .br-card-status {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .br-card-status:hover {
          transform: scale(1.05);
        }
        .br-status-active { background: #013E37; color: #FFEFB3; }
        .br-status-onboarded { background: #0A5C54; color: #FFEFB3; }
        .br-status-interested { background: #FFEFB3; color: #013E37; }
        .br-status-negotiating { background: #FFEFB3; color: #013E37; }
        .br-status-prospect { background: #FFEFB3; color: #013E37; }
        .br-status-inactive { background: #FEE2E2; color: #991B1B; }

        .br-card-desc {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .br-card-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .br-badge {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }
        .br-badge:hover {
          transform: scale(1.05);
        }
        .br-badge-purple { background: #FFEFB3; color: #013E37; }
        .br-badge-green { background: #013E37; color: #FFEFB3; }

        .br-card-contact {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.7;
        }
        .br-contact-icon {
          width: 14px;
          height: 14px;
          color: #013E37;
          opacity: 0.4;
        }
        .br-contact-text {
          font-size: 13px;
        }
        .br-contact-separator {
          color: #013E37;
          opacity: 0.3;
          margin: 0 4px;
        }
        .br-contact-email {
          opacity: 0.6;
        }
        .br-card-location {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 12px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.5;
        }
        .br-location-icon {
          width: 14px;
          height: 14px;
        }
        .br-location-text {
          font-size: 13px;
        }
        .br-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #FFEFB3;
          transition: border-color 0.3s ease;
        }
        .br-card:hover .br-card-footer {
          border-color: #013E37;
        }
        .br-card-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
        }
        .br-assignee-label {
          opacity: 0.5;
        }
        .br-assignee-name {
          font-weight: 500;
          color: #013E37;
        }
        .br-card-actions {
          display: flex;
          gap: 4px;
        }
        .br-action-btn {
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
        .br-action-btn:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }
        .br-action-view:hover {
          background: #FFEFB3;
          color: #013E37;
        }
        .br-action-edit:hover {
          background: #FFEFB3;
          color: #013E37;
        }
        .br-action-delete:hover {
          background: #FEE2E2;
          color: #EF4444;
        }
        .br-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .br-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 2px dashed #FFEFB3;
          text-align: center;
        }
        .br-empty-icon-wrapper {
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
        .br-empty-icon {
          width: 36px;
          height: 36px;
          color: #013E37;
        }
        .br-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .br-empty-subtitle {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 4px 0 16px 0;
        }
        .br-empty-btn {
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
        .br-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
        }

        /* ============================================
           MODAL
           ============================================ */
        .br-modal-overlay {
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
        .br-modal {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #FFEFB3;
          max-width: 600px;
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
        .br-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
          border-radius: 16px 16px 0 0;
        }
        .br-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .br-modal-icon {
          width: 28px;
          height: 28px;
          color: #013E37;
        }
        .br-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }
        .br-modal-close {
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
        .br-modal-close:hover {
          background: rgba(1, 62, 55, 0.1);
          opacity: 1;
          transform: rotate(90deg);
        }
        .br-modal-close-icon {
          width: 18px;
          height: 18px;
        }
        .br-modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .br-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .br-form-group:nth-child(1) { animation-delay: 0.05s; }
        .br-form-group:nth-child(2) { animation-delay: 0.1s; }
        .br-form-group:nth-child(3) { animation-delay: 0.15s; }
        .br-form-group:nth-child(4) { animation-delay: 0.2s; }
        .br-form-group:nth-child(5) { animation-delay: 0.25s; }
        .br-form-group:nth-child(6) { animation-delay: 0.3s; }
        .br-form-group:nth-child(7) { animation-delay: 0.35s; }
        .br-form-group:nth-child(8) { animation-delay: 0.4s; }
        .br-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }
        .br-form-required {
          color: #EF4444;
        }
        .br-form-input,
        .br-form-select,
        .br-form-textarea {
          padding: 10px 14px;
          border: 1.5px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          color: #013E37;
        }
        .br-form-input:focus,
        .br-form-select:focus,
        .br-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .br-form-input::placeholder,
        .br-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.4;
        }
        .br-form-textarea {
          resize: vertical;
          min-height: 60px;
        }
        .br-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .br-form-section {
          background: #FFF9E6;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #FFEFB3;
        }
        .br-form-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
          margin: 0 0 12px 0;
        }
        .br-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #FFEFB3;
        }
        .br-form-cancel {
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
        .br-form-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .br-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .br-form-submit {
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
        .br-form-submit:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
        }
        .br-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .br-form-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 239, 179, 0.3);
          border-top-color: #FFEFB3;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
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
        @media (max-width: 768px) {
          .br-header {
            flex-direction: column;
            align-items: stretch;
          }
          .br-header-right {
            flex-wrap: wrap;
          }
          .br-export-btn,
          .br-add-btn {
            flex: 1;
            justify-content: center;
          }
          .br-filters {
            flex-direction: column;
          }
          .br-search-wrapper {
            width: 100%;
          }
          .br-filter-select {
            width: 100%;
          }
          .br-grid {
            grid-template-columns: 1fr;
          }
          .br-title {
            font-size: 22px;
          }
          .br-title-icon {
            width: 40px;
            height: 40px;
          }
          .br-title-svg {
            width: 20px;
            height: 20px;
          }
          .br-form-grid {
            grid-template-columns: 1fr;
          }
          .br-modal {
            margin: 16px;
            max-height: 95vh;
          }
          .br-header-left {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .br-header-right {
            flex-direction: column;
          }
          .br-export-btn,
          .br-add-btn {
            width: 100%;
          }
          .br-icon-btn {
            align-self: flex-end;
          }
          .br-title-wrapper {
            gap: 10px;
          }
          .br-title {
            font-size: 20px;
          }
          .br-subtitle {
            font-size: 13px;
          }
          .br-modal {
            padding: 0;
          }
          .br-modal-header {
            padding: 16px 18px;
          }
          .br-modal-form {
            padding: 18px;
          }
          .br-form-actions {
            flex-direction: column;
          }
          .br-form-cancel,
          .br-form-submit {
            width: 100%;
            justify-content: center;
          }
          .br-card {
            padding: 16px;
          }
          .br-card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }

        /* Scrollbar */
        .br-modal::-webkit-scrollbar {
          width: 6px;
        }
        .br-modal::-webkit-scrollbar-track {
          background: #FFEFB3;
          border-radius: 8px;
        }
        .br-modal::-webkit-scrollbar-thumb {
          background: #013E37;
          border-radius: 8px;
        }
        .br-modal::-webkit-scrollbar-thumb:hover {
          background: #0A5C54;
        }
      `}</style>
    </>
  );
};

export default Brands;