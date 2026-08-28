// pages/partners/BrandPartner.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, Edit, Trash2, Eye, Plus,
  Search, Filter, Mail, Phone, Globe,
  Users, DollarSign, Calendar, Star,
  Instagram, Facebook, Twitter, Linkedin,
  CheckCircle, XCircle, AlertCircle, Clock,
  Download, RefreshCw, MoreVertical, X,
  MapPin, Award, Zap, Layers, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const BrandPartner = () => {
  const { token } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    industry: 'all',
    partnershipType: 'all'
  });
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    status: 'prospect',
    partnershipType: '',
    partnershipValue: '',
    website: '',
    email: '',
    phone: '',
    location: '',
    contactPerson: {
      name: '',
      email: '',
      phone: '',
      position: ''
    },
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: ''
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
      if (filters.industry !== 'all') params.append('industry', filters.industry);
      if (filters.partnershipType !== 'all') params.append('partnershipType', filters.partnershipType);
      
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
        industry: 'Technology',
        description: 'Global leader in athletic footwear and apparel',
        status: 'active',
        partnershipType: 'sponsorship',
        partnershipValue: 1000000,
        website: 'https://nike.com',
        email: 'partners@nike.com',
        phone: '+1 (555) 123-4567',
        location: 'Beaverton, Oregon, USA',
        startDate: '2023-01-15',
        contactPerson: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@nike.com',
          phone: '+1 (555) 987-6543',
          position: 'Director of Partnerships'
        },
        socialMedia: {
          instagram: '@nike',
          facebook: 'nike',
          twitter: '@nike',
          linkedin: 'nike'
        },
        assignedTo: { firstName: 'John', lastName: 'Doe' },
        campaignHistory: [
          { name: 'Summer Campaign', startDate: '2023-06-01', endDate: '2023-08-31', value: 250000, performance: 'excellent' }
        ]
      },
      {
        _id: '2',
        name: 'Apple',
        industry: 'Healthcare',
        description: 'Leading technology company specializing in consumer electronics',
        status: 'onboarded',
        partnershipType: 'collaboration',
        partnershipValue: 2500000,
        website: 'https://apple.com',
        email: 'partners@apple.com',
        phone: '+1 (555) 234-5678',
        location: 'Cupertino, California, USA',
        startDate: '2022-06-01',
        contactPerson: {
          name: 'Mike Chen',
          email: 'mike.chen@apple.com',
          phone: '+1 (555) 876-5432',
          position: 'Head of Partnerships'
        },
        socialMedia: {
          instagram: '@apple',
          facebook: 'apple',
          twitter: '@apple',
          linkedin: 'apple'
        },
        assignedTo: { firstName: 'Sarah', lastName: 'Smith' },
        campaignHistory: []
      },
      {
        _id: '3',
        name: 'Coca-Cola',
        industry: 'Finance',
        description: 'Global beverage company with iconic brands',
        status: 'interested',
        partnershipType: 'advertising',
        partnershipValue: 750000,
        website: 'https://coca-cola.com',
        email: 'partners@coca-cola.com',
        phone: '+1 (555) 345-6789',
        location: 'Atlanta, Georgia, USA',
        startDate: '2023-09-01',
        contactPerson: {
          name: 'Emily Davis',
          email: 'emily.davis@coca-cola.com',
          phone: '+1 (555) 765-4321',
          position: 'Brand Manager'
        },
        socialMedia: {
          instagram: '@cocacola',
          facebook: 'cocacola',
          twitter: '@cocacola',
          linkedin: 'cocacola'
        },
        assignedTo: { firstName: 'Mike', lastName: 'Johnson' },
        campaignHistory: []
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
        status: brand.status || 'prospect',
        partnershipType: brand.partnershipType || '',
        partnershipValue: brand.partnershipValue || '',
        website: brand.website || '',
        email: brand.email || '',
        phone: brand.phone || '',
        location: brand.location || '',
        contactPerson: {
          name: brand.contactPerson?.name || '',
          email: brand.contactPerson?.email || '',
          phone: brand.contactPerson?.phone || '',
          position: brand.contactPerson?.position || ''
        },
        socialMedia: {
          instagram: brand.socialMedia?.instagram || '',
          facebook: brand.socialMedia?.facebook || '',
          twitter: brand.socialMedia?.twitter || '',
          linkedin: brand.socialMedia?.linkedin || ''
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
      status: 'prospect',
      partnershipType: '',
      partnershipValue: '',
      website: '',
      email: '',
      phone: '',
      location: '',
      contactPerson: {
        name: '',
        email: '',
        phone: '',
        position: ''
      },
      socialMedia: {
        instagram: '',
        facebook: '',
        twitter: '',
        linkedin: ''
      },
      assignedTo: ''
    });
  };

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: { ...prev[parent], [child]: value }
        }));
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: { 
            ...prev[parent], 
            [child]: { ...prev[parent][child], [grandchild]: value }
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bp-status-active',
      'onboarded': 'bp-status-onboarded',
      'interested': 'bp-status-interested',
      'negotiating': 'bp-status-negotiating',
      'prospect': 'bp-status-prospect',
      'inactive': 'bp-status-inactive'
    };
    return colors[status] || 'bp-status-default';
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

  const getStatusIcon = (status) => {
    if (status === 'active') return <CheckCircle className="bp-status-icon bp-icon-green" />;
    if (status === 'onboarded') return <CheckCircle className="bp-status-icon bp-icon-blue" />;
    if (status === 'interested') return <Clock className="bp-status-icon bp-icon-yellow" />;
    if (status === 'negotiating') return <Clock className="bp-status-icon bp-icon-purple" />;
    if (status === 'inactive') return <XCircle className="bp-status-icon bp-icon-red" />;
    return <AlertCircle className="bp-status-icon bp-icon-gray" />;
  };

  const getIndustryColor = (industry) => {
    const colors = {
      'Technology': 'bp-industry-tech',
      'Healthcare': 'bp-industry-health',
      'Finance': 'bp-industry-finance',
      'Education': 'bp-industry-education',
      'E-commerce': 'bp-industry-ecommerce',
      'Manufacturing': 'bp-industry-manufacturing',
      'Retail': 'bp-industry-retail',
      'Real Estate': 'bp-industry-realestate',
      'Hospitality': 'bp-industry-hospitality',
      'Media': 'bp-industry-media'
    };
    return colors[industry] || 'bp-industry-default';
  };

  const getIndustryLabel = (industry) => {
    return industry || 'No industry';
  };

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'onboarded', label: 'Onboarded' },
    { value: 'interested', label: 'Interested' },
    { value: 'negotiating', label: 'Negotiating' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const industries = [
    { value: 'all', label: 'All Industries' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Education', label: 'Education' },
    { value: 'E-commerce', label: 'E-commerce' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Retail', label: 'Retail' }
  ];

  const partnershipTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'sponsorship', label: 'Sponsorship' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'advertising', label: 'Advertising' },
    { value: 'affiliate', label: 'Affiliate' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <div className="bp-loading">
        <div className="bp-spinner"></div>
        <p className="bp-loading-text">Loading brands...</p>
      </div>
    );
  }

  return (
    <div className="bp-container">
      {/* Header */}
      <div className="bp-header">
        <div className="bp-header-left">
          <div className="bp-title-wrapper">
            <div className="bp-title-icon">
              <Building2 className="bp-title-svg" />
            </div>
            <div>
              <h3 className="bp-title">Brand Partners</h3>
              <p className="bp-subtitle">Manage brand partnerships and collaborations</p>
            </div>
          </div>
          <span className="bp-count">{brands.length} brands</span>
        </div>
        <div className="bp-header-right">
          <button className="bp-icon-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`bp-refresh-icon ${refreshing ? 'bp-spin' : ''}`} />
          </button>
          <button className="bp-icon-btn">
            <Download className="bp-btn-icon" />
          </button>
          <button 
            onClick={() => openModal()}
            className="bp-add-btn"
          >
            <Plus className="bp-btn-icon" />
            Add Brand
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bp-filters">
        <div className="bp-search-wrapper">
          <Search className="bp-search-icon" />
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bp-search-input"
          />
          {search && (
            <button className="bp-search-clear" onClick={() => setSearch('')}>
              <X className="bp-search-clear-icon" />
            </button>
          )}
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="bp-filter-select"
        >
          {statuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filters.industry}
          onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
          className="bp-filter-select"
        >
          {industries.map(i => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>
        <select
          value={filters.partnershipType}
          onChange={(e) => setFilters(prev => ({ ...prev, partnershipType: e.target.value }))}
          className="bp-filter-select"
        >
          {partnershipTypes.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Brands Grid */}
      <div className="bp-grid">
        {brands.map((brand) => (
          <div 
            key={brand._id} 
            className="bp-card"
            onClick={() => {
              setSelectedBrand(brand);
              setShowDetails(true);
            }}
          >
            <div className="bp-card-header">
              <div className="bp-card-left">
                <div className="bp-card-icon">
                  <Building2 className="bp-card-icon-svg" />
                </div>
                <div className="bp-card-info">
                  <h4 className="bp-card-title">{brand.name}</h4>
                  <p className="bp-card-industry">{getIndustryLabel(brand.industry)}</p>
                </div>
              </div>
              <span className={`bp-card-status ${getStatusColor(brand.status)}`}>
                {getStatusLabel(brand.status)}
              </span>
            </div>
            
            {brand.description && (
              <p className="bp-card-desc">{brand.description}</p>
            )}
            
            <div className="bp-card-badges">
              {brand.partnershipType && (
                <span className="bp-badge bp-badge-purple">
                  <Star className="bp-badge-icon" />
                  {brand.partnershipType}
                </span>
              )}
              {brand.partnershipValue && (
                <span className="bp-badge bp-badge-green">
                  <DollarSign className="bp-badge-icon" />
                  ${brand.partnershipValue.toLocaleString()}
                </span>
              )}
              {brand.startDate && (
                <span className="bp-badge bp-badge-gray">
                  <Calendar className="bp-badge-icon" />
                  Since {new Date(brand.startDate).getFullYear()}
                </span>
              )}
            </div>
            
            {brand.contactPerson && brand.contactPerson.name && (
              <div className="bp-card-contact">
                <Users className="bp-contact-icon" />
                <span className="bp-contact-text">{brand.contactPerson.name}</span>
                {brand.contactPerson.email && (
                  <>
                    <span className="bp-contact-separator">•</span>
                    <span className="bp-contact-email">{brand.contactPerson.email}</span>
                  </>
                )}
              </div>
            )}

            {brand.location && (
              <div className="bp-card-location">
                <MapPin className="bp-location-icon" />
                <span className="bp-location-text">{brand.location}</span>
              </div>
            )}

            {brand.socialMedia && (
              <div className="bp-card-social">
                {brand.socialMedia.instagram && (
                  <Instagram className="bp-social-icon bp-social-instagram" />
                )}
                {brand.socialMedia.facebook && (
                  <Facebook className="bp-social-icon bp-social-facebook" />
                )}
                {brand.socialMedia.twitter && (
                  <Twitter className="bp-social-icon bp-social-twitter" />
                )}
                {brand.socialMedia.linkedin && (
                  <Linkedin className="bp-social-icon bp-social-linkedin" />
                )}
              </div>
            )}
            
            <div className="bp-card-footer">
              <div className="bp-card-assignee">
                <span className="bp-assignee-label">Assigned:</span>
                <span className="bp-assignee-name">
                  {brand.assignedTo?.firstName} {brand.assignedTo?.lastName || 'Unassigned'}
                </span>
              </div>
              <div className="bp-card-actions">
                <button 
                  className="bp-action-btn bp-action-view"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBrand(brand);
                    setShowDetails(true);
                  }}
                  title="View"
                >
                  <Eye className="bp-action-icon" />
                </button>
                <button 
                  className="bp-action-btn bp-action-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(brand);
                  }}
                  title="Edit"
                >
                  <Edit className="bp-action-icon" />
                </button>
                <button 
                  className="bp-action-btn bp-action-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(brand._id);
                  }}
                  title="Delete"
                >
                  <Trash2 className="bp-action-icon" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {brands.length === 0 && (
        <div className="bp-empty">
          <div className="bp-empty-icon-wrapper">
            <Building2 className="bp-empty-icon" />
          </div>
          <h3 className="bp-empty-title">No brands found</h3>
          <p className="bp-empty-subtitle">Start by adding your first brand partner</p>
          <button className="bp-empty-btn" onClick={() => openModal()}>
            <Plus className="bp-btn-icon" />
            Add Brand
          </button>
        </div>
      )}

      {/* Brand Details Modal */}
      {showDetails && selectedBrand && (
        <div className="bp-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="bp-modal bp-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="bp-modal-header">
              <div className="bp-modal-title-wrapper">
                <div className="bp-modal-icon-wrapper">
                  <Building2 className="bp-modal-icon" />
                </div>
                <div>
                  <h2 className="bp-modal-title">{selectedBrand.name}</h2>
                  <p className="bp-modal-subtitle">{getIndustryLabel(selectedBrand.industry)}</p>
                </div>
              </div>
              <button className="bp-modal-close" onClick={() => setShowDetails(false)}>
                <X className="bp-modal-close-icon" />
              </button>
            </div>
            
            <div className="bp-modal-body">
              <div className="bp-modal-section">
                <h4 className="bp-modal-label">Description</h4>
                <p className="bp-modal-text">{selectedBrand.description || 'No description provided'}</p>
              </div>
              
              <div className="bp-modal-grid">
                <div className="bp-modal-item">
                  <h4 className="bp-modal-label">Status</h4>
                  <span className={`bp-modal-status ${getStatusColor(selectedBrand.status)}`}>
                    {getStatusLabel(selectedBrand.status)}
                  </span>
                </div>
                <div className="bp-modal-item">
                  <h4 className="bp-modal-label">Partnership Type</h4>
                  <p className="bp-modal-value">{selectedBrand.partnershipType || 'N/A'}</p>
                </div>
                <div className="bp-modal-item">
                  <h4 className="bp-modal-label">Value</h4>
                  <p className="bp-modal-value">
                    ${selectedBrand.partnershipValue ? selectedBrand.partnershipValue.toLocaleString() : '0'}
                  </p>
                </div>
                <div className="bp-modal-item">
                  <h4 className="bp-modal-label">Since</h4>
                  <p className="bp-modal-value">
                    {selectedBrand.startDate ? new Date(selectedBrand.startDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              {selectedBrand.contactPerson && (selectedBrand.contactPerson.name || selectedBrand.contactPerson.email) && (
                <div className="bp-modal-section">
                  <h4 className="bp-modal-label">Contact Person</h4>
                  <div className="bp-modal-contact">
                    {selectedBrand.contactPerson.name && (
                      <p className="bp-modal-contact-name">{selectedBrand.contactPerson.name}</p>
                    )}
                    {selectedBrand.contactPerson.position && (
                      <p className="bp-modal-contact-position">{selectedBrand.contactPerson.position}</p>
                    )}
                    {selectedBrand.contactPerson.email && (
                      <p className="bp-modal-contact-email">
                        <Mail className="bp-modal-contact-icon" />
                        {selectedBrand.contactPerson.email}
                      </p>
                    )}
                    {selectedBrand.contactPerson.phone && (
                      <p className="bp-modal-contact-phone">
                        <Phone className="bp-modal-contact-icon" />
                        {selectedBrand.contactPerson.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedBrand.campaignHistory && selectedBrand.campaignHistory.length > 0 && (
                <div className="bp-modal-section">
                  <h4 className="bp-modal-label">Campaign History</h4>
                  <div className="bp-modal-campaigns">
                    {selectedBrand.campaignHistory.map((campaign, idx) => (
                      <div key={idx} className="bp-modal-campaign">
                        <div className="bp-modal-campaign-header">
                          <span className="bp-modal-campaign-name">{campaign.name}</span>
                          <span className={`bp-modal-campaign-performance bp-performance-${campaign.performance}`}>
                            {campaign.performance}
                          </span>
                        </div>
                        <p className="bp-modal-campaign-dates">
                          {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                        </p>
                        <p className="bp-modal-campaign-value">Value: ${campaign.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bp-modal-footer">
              <button
                onClick={() => setShowDetails(false)}
                className="bp-modal-cancel"
              >
                Close
              </button>
              <button 
                className="bp-modal-edit"
                onClick={() => {
                  setShowDetails(false);
                  openModal(selectedBrand);
                }}
              >
                <Edit className="bp-btn-icon" />
                Edit Brand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="bp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="bp-modal bp-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="bp-modal-header">
              <div className="bp-modal-title-wrapper">
                <Building2 className="bp-modal-icon" />
                <h2 className="bp-modal-title">
                  {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                </h2>
              </div>
              <button className="bp-modal-close" onClick={() => setShowModal(false)}>
                <X className="bp-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="bp-modal-form">
              <div className="bp-form-group">
                <label className="bp-form-label">
                  Brand Name <span className="bp-form-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="bp-form-input"
                  placeholder="Enter brand name"
                  autoFocus
                />
              </div>

              <div className="bp-form-grid">
                <div className="bp-form-group">
                  <label className="bp-form-label">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    className="bp-form-select"
                  >
                    <option value="">Select industry</option>
                    {industries.filter(i => i.value !== 'all').map(i => (
                      <option key={i.value} value={i.value}>{i.label}</option>
                    ))}
                  </select>
                </div>
                <div className="bp-form-group">
                  <label className="bp-form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="bp-form-select"
                  >
                    {statuses.filter(s => s.value !== 'all').map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bp-form-group">
                <label className="bp-form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="bp-form-textarea"
                  rows="2"
                  placeholder="Brief description of the brand"
                />
              </div>

              <div className="bp-form-grid">
                <div className="bp-form-group">
                  <label className="bp-form-label">Partnership Type</label>
                  <select
                    value={formData.partnershipType}
                    onChange={(e) => handleChange('partnershipType', e.target.value)}
                    className="bp-form-select"
                  >
                    <option value="">Select type</option>
                    {partnershipTypes.filter(p => p.value !== 'all').map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="bp-form-group">
                  <label className="bp-form-label">Partnership Value ($)</label>
                  <input
                    type="number"
                    value={formData.partnershipValue}
                    onChange={(e) => handleChange('partnershipValue', e.target.value)}
                    className="bp-form-input"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="bp-form-grid">
                <div className="bp-form-group">
                  <label className="bp-form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="bp-form-input"
                    placeholder="brand@example.com"
                  />
                </div>
                <div className="bp-form-group">
                  <label className="bp-form-label">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="bp-form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="bp-form-grid">
                <div className="bp-form-group">
                  <label className="bp-form-label">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="bp-form-input"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="bp-form-group">
                  <label className="bp-form-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="bp-form-input"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="bp-form-section">
                <h4 className="bp-form-section-title">Contact Person</h4>
                <div className="bp-form-grid">
                  <div className="bp-form-group">
                    <label className="bp-form-label">Name</label>
                    <input
                      type="text"
                      value={formData.contactPerson.name}
                      onChange={(e) => handleChange('contactPerson.name', e.target.value)}
                      className="bp-form-input"
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="bp-form-group">
                    <label className="bp-form-label">Position</label>
                    <input
                      type="text"
                      value={formData.contactPerson.position}
                      onChange={(e) => handleChange('contactPerson.position', e.target.value)}
                      className="bp-form-input"
                      placeholder="Position/Title"
                    />
                  </div>
                </div>
                <div className="bp-form-grid">
                  <div className="bp-form-group">
                    <label className="bp-form-label">Email</label>
                    <input
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) => handleChange('contactPerson.email', e.target.value)}
                      className="bp-form-input"
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div className="bp-form-group">
                    <label className="bp-form-label">Phone</label>
                    <input
                      type="text"
                      value={formData.contactPerson.phone}
                      onChange={(e) => handleChange('contactPerson.phone', e.target.value)}
                      className="bp-form-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="bp-form-section">
                <h4 className="bp-form-section-title">Social Media</h4>
                <div className="bp-form-grid">
                  <div className="bp-form-group">
                    <label className="bp-form-label">Instagram</label>
                    <input
                      type="text"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleChange('socialMedia.instagram', e.target.value)}
                      className="bp-form-input"
                      placeholder="@username"
                    />
                  </div>
                  <div className="bp-form-group">
                    <label className="bp-form-label">Facebook</label>
                    <input
                      type="text"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => handleChange('socialMedia.facebook', e.target.value)}
                      className="bp-form-input"
                      placeholder="page-name"
                    />
                  </div>
                </div>
                <div className="bp-form-grid">
                  <div className="bp-form-group">
                    <label className="bp-form-label">Twitter</label>
                    <input
                      type="text"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => handleChange('socialMedia.twitter', e.target.value)}
                      className="bp-form-input"
                      placeholder="@username"
                    />
                  </div>
                  <div className="bp-form-group">
                    <label className="bp-form-label">LinkedIn</label>
                    <input
                      type="text"
                      value={formData.socialMedia.linkedin}
                      onChange={(e) => handleChange('socialMedia.linkedin', e.target.value)}
                      className="bp-form-input"
                      placeholder="company-name"
                    />
                  </div>
                </div>
              </div>

              <div className="bp-form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bp-form-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bp-form-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="bp-form-spinner"></div>
                      {editingBrand ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="bp-btn-icon" />
                      {editingBrand ? 'Update Brand' : 'Add Brand'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .bp-container {
          padding: 20px 24px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: bpFadeIn 0.4s ease;
        }

        @keyframes bpFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .bp-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .bp-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: bpSpin 0.8s linear infinite;
        }

        .bp-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes bpSpin {
          to { transform: rotate(360deg); }
        }

        .bp-spin {
          animation: bpSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .bp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .bp-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .bp-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .bp-title-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .bp-title-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .bp-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .bp-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .bp-count {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 14px;
          border-radius: 12px;
        }

        .bp-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .bp-icon-btn {
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

        .bp-icon-btn:hover {
          background: #f1f5f9;
        }

        .bp-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .bp-btn-icon {
          width: 16px;
          height: 16px;
        }

        .bp-add-btn {
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

        .bp-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .bp-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .bp-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .bp-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .bp-search-input {
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

        .bp-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .bp-search-clear {
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

        .bp-search-clear:hover {
          background: #f1f5f9;
        }

        .bp-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .bp-filter-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 140px;
        }

        .bp-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* ============================================
           GRID
           ============================================ */
        .bp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .bp-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          animation: bpSlideUp 0.4s ease both;
        }

        .bp-card:nth-child(1) { animation-delay: 0.05s; }
        .bp-card:nth-child(2) { animation-delay: 0.1s; }
        .bp-card:nth-child(3) { animation-delay: 0.15s; }

        @keyframes bpSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: #d1d5db;
        }

        .bp-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .bp-card-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .bp-card-icon {
          width: 44px;
          height: 44px;
          background: #eff6ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bp-card-icon-svg {
          width: 22px;
          height: 22px;
          color: #3b82f6;
        }

        .bp-card-info {
          flex: 1;
          min-width: 0;
        }

        .bp-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .bp-card-industry {
          font-size: 13px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .bp-card-status {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        .bp-status-active { background: #d1fae5; color: #065f46; }
        .bp-status-onboarded { background: #dbeafe; color: #1d4ed8; }
        .bp-status-interested { background: #fef3c7; color: #92400e; }
        .bp-status-negotiating { background: #f3e8ff; color: #6d28d9; }
        .bp-status-prospect { background: #f1f5f9; color: #475569; }
        .bp-status-inactive { background: #fee2e2; color: #991b1b; }

        .bp-status-icon {
          width: 16px;
          height: 16px;
        }

        .bp-icon-green { color: #22c55e; }
        .bp-icon-blue { color: #3b82f6; }
        .bp-icon-yellow { color: #f59e0b; }
        .bp-icon-purple { color: #8b5cf6; }
        .bp-icon-red { color: #ef4444; }
        .bp-icon-gray { color: #94a3b8; }

        .bp-card-desc {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .bp-card-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .bp-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .bp-badge-purple { background: #f3e8ff; color: #6d28d9; }
        .bp-badge-green { background: #d1fae5; color: #065f46; }
        .bp-badge-gray { background: #f1f5f9; color: #475569; }

        .bp-badge-icon {
          width: 12px;
          height: 12px;
        }

        .bp-card-contact {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          font-size: 13px;
          color: #475569;
        }

        .bp-contact-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .bp-contact-text {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
        }

        .bp-contact-separator {
          color: #d1d5db;
          margin: 0 4px;
        }

        .bp-contact-email {
          color: #64748b;
        }

        .bp-card-location {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 8px;
          font-size: 13px;
          color: #94a3b8;
        }

        .bp-location-icon {
          width: 14px;
          height: 14px;
        }

        .bp-location-text {
          font-size: 13px;
        }

        .bp-card-social {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .bp-social-icon {
          width: 16px;
          height: 16px;
        }

        .bp-social-instagram { color: #e4405f; }
        .bp-social-facebook { color: #1877f2; }
        .bp-social-twitter { color: #1da1f2; }
        .bp-social-linkedin { color: #0a66c2; }

        .bp-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .bp-card-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #64748b;
        }

        .bp-assignee-label {
          color: #94a3b8;
        }

        .bp-assignee-name {
          font-weight: 500;
          color: #0f172a;
        }

        .bp-card-actions {
          display: flex;
          gap: 4px;
        }

        .bp-action-btn {
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

        .bp-action-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .bp-action-view:hover {
          background: #eff6ff;
          color: #3b82f6;
        }

        .bp-action-edit:hover {
          background: #ecfdf5;
          color: #22c55e;
        }

        .bp-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .bp-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .bp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .bp-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .bp-empty-icon {
          width: 36px;
          height: 36px;
          color: #94a3b8;
        }

        .bp-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .bp-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .bp-empty-btn {
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

        .bp-empty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        /* ============================================
           MODAL
           ============================================ */
        .bp-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: bpFadeIn 0.3s ease;
        }

        .bp-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: bpModalIn 0.3s ease;
        }

        .bp-modal-lg {
          max-width: 680px;
        }

        @keyframes bpModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .bp-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .bp-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .bp-modal-icon-wrapper {
          width: 44px;
          height: 44px;
          background: #eff6ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bp-modal-icon {
          width: 22px;
          height: 22px;
          color: #3b82f6;
        }

        .bp-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .bp-modal-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .bp-modal-close {
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

        .bp-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .bp-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        .bp-modal-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bp-modal-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .bp-modal-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .bp-modal-text {
          font-size: 14px;
          color: #0f172a;
          margin: 0;
        }

        .bp-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .bp-modal-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .bp-modal-value {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
          margin: 0;
        }

        .bp-modal-status {
          font-size: 13px;
          font-weight: 500;
          padding: 2px 12px;
          border-radius: 12px;
          display: inline-block;
        }

        .bp-modal-contact {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
        }

        .bp-modal-contact-name {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .bp-modal-contact-position {
          font-size: 13px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .bp-modal-contact-email,
        .bp-modal-contact-phone {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #0f172a;
          margin: 4px 0 0 0;
        }

        .bp-modal-contact-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .bp-modal-campaigns {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bp-modal-campaign {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
        }

        .bp-modal-campaign-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .bp-modal-campaign-name {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .bp-modal-campaign-performance {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .bp-performance-excellent { background: #d1fae5; color: #065f46; }
        .bp-performance-good { background: #dbeafe; color: #1d4ed8; }
        .bp-performance-average { background: #fef3c7; color: #92400e; }
        .bp-performance-poor { background: #fee2e2; color: #991b1b; }

        .bp-modal-campaign-dates {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        .bp-modal-campaign-value {
          font-size: 13px;
          color: #94a3b8;
          margin: 2px 0 0 0;
        }

        .bp-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
        }

        .bp-modal-cancel {
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

        .bp-modal-cancel:hover {
          background: #f1f5f9;
        }

        .bp-modal-edit {
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

        .bp-modal-edit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        /* ============================================
           FORM
           ============================================ */
        .bp-modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bp-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .bp-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .bp-form-required {
          color: #ef4444;
        }

        .bp-form-input,
        .bp-form-select,
        .bp-form-textarea {
          padding: 10px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          color: #0f172a;
        }

        .bp-form-input:focus,
        .bp-form-select:focus,
        .bp-form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .bp-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .bp-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .bp-form-section {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }

        .bp-form-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 12px 0;
        }

        .bp-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .bp-form-cancel {
          padding: 10px 24px;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bp-form-cancel:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .bp-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .bp-form-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .bp-form-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        .bp-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .bp-form-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: bpSpin 0.8s linear infinite;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .bp-container {
            padding: 16px;
          }

          .bp-header {
            flex-direction: column;
            align-items: stretch;
          }

          .bp-header-right {
            flex-wrap: wrap;
          }

          .bp-add-btn {
            flex: 1;
            justify-content: center;
          }

          .bp-filters {
            flex-direction: column;
          }

          .bp-search-wrapper {
            width: 100%;
          }

          .bp-filter-select {
            width: 100%;
          }

          .bp-grid {
            grid-template-columns: 1fr;
          }

          .bp-title {
            font-size: 22px;
          }

          .bp-title-icon {
            width: 40px;
            height: 40px;
          }

          .bp-title-svg {
            width: 20px;
            height: 20px;
          }

          .bp-modal {
            margin: 16px;
            max-height: 95vh;
          }

          .bp-modal-grid {
            grid-template-columns: 1fr;
          }

          .bp-form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .bp-container {
            padding: 12px;
          }

          .bp-header-right {
            flex-direction: column;
          }

          .bp-add-btn {
            width: 100%;
          }

          .bp-icon-btn {
            align-self: flex-end;
          }

          .bp-title-wrapper {
            gap: 10px;
          }

          .bp-title {
            font-size: 20px;
          }

          .bp-subtitle {
            font-size: 13px;
          }

          .bp-modal {
            padding: 0;
          }

          .bp-modal-header {
            padding: 16px 18px;
          }

          .bp-modal-body {
            padding: 16px 18px;
          }

          .bp-modal-footer {
            flex-direction: column;
          }

          .bp-modal-cancel,
          .bp-modal-edit {
            width: 100%;
            justify-content: center;
          }

          .bp-modal-form {
            padding: 18px;
          }

          .bp-form-actions {
            flex-direction: column;
          }

          .bp-form-cancel,
          .bp-form-submit {
            width: 100%;
            justify-content: center;
          }
        }

        /* Scrollbar */
        .bp-modal::-webkit-scrollbar {
          width: 6px;
        }

        .bp-modal::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }

        .bp-modal::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }

        .bp-modal::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default BrandPartner;