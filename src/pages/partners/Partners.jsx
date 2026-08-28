// pages/partners/Partners.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, Filter, Users, Building2, 
  GraduationCap, Briefcase, Star, Edit, Trash2,
  X, RefreshCw, Download, Eye, Mail, Phone,
  Calendar, MapPin, Award, Zap, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const Partners = () => {
  const { token } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'brand',
    email: '',
    phone: '',
    status: 'prospect',
    assignedTo: '',
    description: '',
    website: '',
    location: ''
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchPartners();
  }, [search, filterType]);

  const fetchPartners = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterType !== 'all') params.append('type', filterType);
      
      let data = [];
      try {
        const response = await fetch(
          `${API_URL}/partners?${params.toString()}`,
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
        data = getMockPartners();
        toast.info('Showing sample partner data');
      }

      setPartners(data);
    } catch (error) {
      console.error('Error fetching partners:', error);
      setPartners(getMockPartners());
      toast.error('Failed to load partners, showing sample data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockPartners = () => {
    return [
      {
        _id: '1',
        name: 'TechCorp Solutions',
        type: 'brand',
        email: 'info@techcorp.com',
        phone: '+1 (555) 123-4567',
        status: 'active',
        assignedTo: { firstName: 'John', lastName: 'Doe' },
        description: 'Leading technology solutions provider',
        website: 'https://techcorp.com',
        location: 'New York, USA'
      },
      {
        _id: '2',
        name: 'University of Innovation',
        type: 'university',
        email: 'partners@innov.edu',
        phone: '+1 (555) 234-5678',
        status: 'onboarded',
        assignedTo: { firstName: 'Sarah', lastName: 'Smith' },
        description: 'Premier research university',
        website: 'https://innov.edu',
        location: 'Boston, USA'
      },
      {
        _id: '3',
        name: 'Global Employers Network',
        type: 'employer',
        email: 'info@globalemployers.com',
        phone: '+1 (555) 345-6789',
        status: 'interested',
        assignedTo: { firstName: 'Mike', lastName: 'Johnson' },
        description: 'International employer network',
        website: 'https://globalemployers.com',
        location: 'Remote'
      },
      {
        _id: '4',
        name: 'SocialMedia Influencers',
        type: 'influencer',
        email: 'contact@socialinfluencers.com',
        phone: '+1 (555) 456-7890',
        status: 'negotiating',
        assignedTo: { firstName: 'Emma', lastName: 'Wilson' },
        description: 'Top social media influencers',
        website: 'https://socialinfluencers.com',
        location: 'Los Angeles, USA'
      }
    ];
  };

  const handleRefresh = () => {
    fetchPartners(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Partner name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingPartner 
        ? `${API_URL}/partners/${editingPartner._id}`
        : `${API_URL}/partners`;
      
      const method = editingPartner ? 'PUT' : 'POST';

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
          toast.success(editingPartner ? 'Partner updated successfully!' : 'Partner created successfully!');
          setShowModal(false);
          setEditingPartner(null);
          resetForm();
          await fetchPartners(true);
        }
      } else {
        throw new Error('Failed to save partner');
      }
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error(error.message || 'Failed to save partner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return;

    try {
      const response = await fetch(
        `${API_URL}/partners/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success('Partner deleted successfully');
        await fetchPartners(true);
      } else {
        throw new Error('Failed to delete partner');
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Failed to delete partner');
    }
  };

  const openModal = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name || '',
        type: partner.type || 'brand',
        email: partner.email || '',
        phone: partner.phone || '',
        status: partner.status || 'prospect',
        assignedTo: partner.assignedTo?._id || partner.assignedTo || '',
        description: partner.description || '',
        website: partner.website || '',
        location: partner.location || ''
      });
    } else {
      setEditingPartner(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'brand',
      email: '',
      phone: '',
      status: 'prospect',
      assignedTo: '',
      description: '',
      website: '',
      location: ''
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTypeIcon = (type) => {
    const icons = {
      'brand': Building2,
      'university': GraduationCap,
      'employer': Briefcase,
      'influencer': Star
    };
    const Icon = icons[type] || Users;
    return <Icon className="pr-icon" />;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'brand': 'Brand',
      'university': 'University',
      'employer': 'Employer',
      'influencer': 'Influencer'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'pr-status-active',
      'onboarded': 'pr-status-onboarded',
      'interested': 'pr-status-interested',
      'negotiating': 'pr-status-negotiating',
      'prospect': 'pr-status-prospect'
    };
    return colors[status] || 'pr-status-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Active',
      'onboarded': 'Onboarded',
      'interested': 'Interested',
      'negotiating': 'Negotiating',
      'prospect': 'Prospect'
    };
    return labels[status] || status;
  };

  const typeOptions = [
    { value: 'brand', label: 'Brand' },
    { value: 'university', label: 'University' },
    { value: 'employer', label: 'Employer' },
    { value: 'influencer', label: 'Influencer' }
  ];

  const statusOptions = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'interested', label: 'Interested' },
    { value: 'negotiating', label: 'Negotiating' },
    { value: 'onboarded', label: 'Onboarded' },
    { value: 'active', label: 'Active' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'brand', label: 'Brands' },
    { value: 'university', label: 'Universities' },
    { value: 'employer', label: 'Employers' },
    { value: 'influencer', label: 'Influencers' }
  ];

  if (loading) {
    return (
      <div className="pr-loading">
        <div className="pr-spinner"></div>
        <p className="pr-loading-text">Loading partners...</p>
      </div>
    );
  }

  return (
    <div className="pr-container">
      {/* Header */}
      <div className="pr-header">
        <div className="pr-header-left">
          <div className="pr-title-wrapper">
            <div className="pr-title-icon">
              <Users className="pr-title-svg" />
            </div>
            <div>
              <h1 className="pr-title">Partners</h1>
              <p className="pr-subtitle">Manage all your business partners</p>
            </div>
          </div>
          <span className="pr-count">{partners.length} partners</span>
        </div>
        <div className="pr-header-right">
          <button className="pr-icon-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`pr-refresh-icon ${refreshing ? 'pr-spin' : ''}`} />
          </button>
          <button className="pr-icon-btn">
            <Download className="pr-btn-icon" />
          </button>
          <button 
            onClick={() => openModal()}
            className="pr-add-btn"
          >
            <Plus className="pr-btn-icon" />
            Add Partner
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="pr-filters">
        <div className="pr-search-wrapper">
          <Search className="pr-search-icon" />
          <input
            type="text"
            placeholder="Search partners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-search-input"
          />
          {search && (
            <button className="pr-search-clear" onClick={() => setSearch('')}>
              <X className="pr-search-clear-icon" />
            </button>
          )}
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="pr-filter-select"
        >
          {filterOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button className="pr-filter-btn">
          <Filter className="pr-btn-icon" />
          Filters
        </button>
      </div>

      {/* Partners Grid */}
      <div className="pr-grid">
        {partners.map((partner) => (
          <div key={partner._id} className="pr-card">
            <div className="pr-card-header">
              <div className="pr-card-left">
                <div className={`pr-card-icon pr-card-icon-${partner.type}`}>
                  {getTypeIcon(partner.type)}
                </div>
                <div className="pr-card-info">
                  <h3 className="pr-card-title">{partner.name}</h3>
                  <p className="pr-card-type">{getTypeLabel(partner.type)}</p>
                </div>
              </div>
              <span className={`pr-card-status ${getStatusColor(partner.status)}`}>
                {getStatusLabel(partner.status)}
              </span>
            </div>
            
            {(partner.email || partner.phone) && (
              <div className="pr-card-contact">
                {partner.email && (
                  <span className="pr-card-contact-item">
                    <Mail className="pr-contact-icon" />
                    {partner.email}
                  </span>
                )}
                {partner.phone && (
                  <span className="pr-card-contact-item">
                    <Phone className="pr-contact-icon" />
                    {partner.phone}
                  </span>
                )}
              </div>
            )}
            
            {partner.description && (
              <p className="pr-card-desc">{partner.description}</p>
            )}
            
            {partner.location && (
              <div className="pr-card-location">
                <MapPin className="pr-location-icon" />
                <span className="pr-location-text">{partner.location}</span>
              </div>
            )}
            
            <div className="pr-card-footer">
              <div className="pr-card-assignee">
                <span className="pr-assignee-label">Assigned to:</span>
                <span className="pr-assignee-name">
                  {partner.assignedTo?.firstName} {partner.assignedTo?.lastName || 'Unassigned'}
                </span>
              </div>
              <div className="pr-card-actions">
                <button 
                  className="pr-action-btn pr-action-edit"
                  onClick={() => openModal(partner)}
                  title="Edit"
                >
                  <Edit className="pr-action-icon" />
                </button>
                <button 
                  className="pr-action-btn pr-action-delete"
                  onClick={() => handleDelete(partner._id)}
                  title="Delete"
                >
                  <Trash2 className="pr-action-icon" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {partners.length === 0 && (
        <div className="pr-empty">
          <div className="pr-empty-icon-wrapper">
            <Users className="pr-empty-icon" />
          </div>
          <h3 className="pr-empty-title">No partners found</h3>
          <p className="pr-empty-subtitle">Start by adding your first partner</p>
          <button className="pr-empty-btn" onClick={() => openModal()}>
            <Plus className="pr-btn-icon" />
            Add Partner
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="pr-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="pr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-header">
              <div className="pr-modal-title-wrapper">
                <Users className="pr-modal-icon" />
                <h2 className="pr-modal-title">
                  {editingPartner ? 'Edit Partner' : 'Add New Partner'}
                </h2>
              </div>
              <button className="pr-modal-close" onClick={() => setShowModal(false)}>
                <X className="pr-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="pr-modal-form">
              <div className="pr-form-group">
                <label className="pr-form-label">
                  Partner Name <span className="pr-form-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="pr-form-input"
                  placeholder="Enter partner name"
                  autoFocus
                />
              </div>

              <div className="pr-form-grid">
                <div className="pr-form-group">
                  <label className="pr-form-label">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="pr-form-select"
                  >
                    {typeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="pr-form-group">
                  <label className="pr-form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="pr-form-select"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pr-form-grid">
                <div className="pr-form-group">
                  <label className="pr-form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="pr-form-input"
                    placeholder="partner@example.com"
                  />
                </div>
                <div className="pr-form-group">
                  <label className="pr-form-label">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="pr-form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="pr-form-group">
                <label className="pr-form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="pr-form-textarea"
                  rows="2"
                  placeholder="Brief description of the partner"
                />
              </div>

              <div className="pr-form-grid">
                <div className="pr-form-group">
                  <label className="pr-form-label">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="pr-form-input"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="pr-form-group">
                  <label className="pr-form-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="pr-form-input"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="pr-form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="pr-form-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pr-form-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="pr-form-spinner"></div>
                      {editingPartner ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="pr-btn-icon" />
                      {editingPartner ? 'Update Partner' : 'Add Partner'}
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
        .pr-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: prFadeIn 0.4s ease;
        }

        @keyframes prFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .pr-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .pr-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: prSpin 0.8s linear infinite;
        }

        .pr-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes prSpin {
          to { transform: rotate(360deg); }
        }

        .pr-spin {
          animation: prSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .pr-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pr-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pr-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pr-title-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .pr-title-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .pr-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .pr-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .pr-count {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 14px;
          border-radius: 12px;
        }

        .pr-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pr-icon-btn {
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

        .pr-icon-btn:hover {
          background: #f1f5f9;
        }

        .pr-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .pr-btn-icon {
          width: 16px;
          height: 16px;
        }

        .pr-add-btn {
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

        .pr-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .pr-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .pr-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .pr-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .pr-search-input {
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

        .pr-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .pr-search-clear {
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

        .pr-search-clear:hover {
          background: #f1f5f9;
        }

        .pr-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .pr-filter-select {
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

        .pr-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .pr-filter-btn {
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

        .pr-filter-btn:hover {
          background: #f1f5f9;
        }

        /* ============================================
           GRID
           ============================================ */
        .pr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .pr-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: all 0.3s ease;
          animation: prSlideUp 0.4s ease both;
        }

        .pr-card:nth-child(1) { animation-delay: 0.05s; }
        .pr-card:nth-child(2) { animation-delay: 0.1s; }
        .pr-card:nth-child(3) { animation-delay: 0.15s; }
        .pr-card:nth-child(4) { animation-delay: 0.2s; }

        @keyframes prSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pr-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: #d1d5db;
        }

        .pr-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .pr-card-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .pr-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pr-card-icon-brand { background: #dbeafe; color: #3b82f6; }
        .pr-card-icon-university { background: #f3e8ff; color: #8b5cf6; }
        .pr-card-icon-employer { background: #d1fae5; color: #10b981; }
        .pr-card-icon-influencer { background: #fef3c7; color: #f59e0b; }

        .pr-icon {
          width: 20px;
          height: 20px;
        }

        .pr-card-info {
          flex: 1;
          min-width: 0;
        }

        .pr-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .pr-card-type {
          font-size: 13px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .pr-card-status {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        .pr-status-active { background: #d1fae5; color: #065f46; }
        .pr-status-onboarded { background: #dbeafe; color: #1d4ed8; }
        .pr-status-interested { background: #fef3c7; color: #92400e; }
        .pr-status-negotiating { background: #f3e8ff; color: #6d28d9; }
        .pr-status-prospect { background: #f1f5f9; color: #475569; }

        .pr-card-contact {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin: 8px 0 4px 0;
        }

        .pr-card-contact-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #475569;
        }

        .pr-contact-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .pr-card-desc {
          font-size: 14px;
          color: #64748b;
          margin: 8px 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pr-card-location {
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 6px 0 0 0;
          font-size: 13px;
          color: #94a3b8;
        }

        .pr-location-icon {
          width: 14px;
          height: 14px;
        }

        .pr-location-text {
          font-size: 13px;
        }

        .pr-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          margin-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .pr-card-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #64748b;
        }

        .pr-assignee-label {
          color: #94a3b8;
        }

        .pr-assignee-name {
          font-weight: 500;
          color: #0f172a;
        }

        .pr-card-actions {
          display: flex;
          gap: 4px;
        }

        .pr-action-btn {
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

        .pr-action-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .pr-action-edit:hover {
          background: #eff6ff;
          color: #3b82f6;
        }

        .pr-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .pr-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .pr-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .pr-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .pr-empty-icon {
          width: 36px;
          height: 36px;
          color: #94a3b8;
        }

        .pr-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .pr-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .pr-empty-btn {
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

        .pr-empty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        /* ============================================
           MODAL
           ============================================ */
        .pr-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: prFadeIn 0.3s ease;
        }

        .pr-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: prModalIn 0.3s ease;
        }

        @keyframes prModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .pr-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .pr-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pr-modal-icon {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }

        .pr-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .pr-modal-close {
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

        .pr-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .pr-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        .pr-modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pr-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pr-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .pr-form-required {
          color: #ef4444;
        }

        .pr-form-input,
        .pr-form-select,
        .pr-form-textarea {
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

        .pr-form-input:focus,
        .pr-form-select:focus,
        .pr-form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .pr-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .pr-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .pr-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
          margin-top: 4px;
        }

        .pr-form-cancel {
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

        .pr-form-cancel:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .pr-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pr-form-submit {
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

        .pr-form-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        .pr-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .pr-form-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: prSpin 0.8s linear infinite;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .pr-container {
            padding: 16px;
          }

          .pr-header {
            flex-direction: column;
            align-items: stretch;
          }

          .pr-header-right {
            flex-wrap: wrap;
          }

          .pr-add-btn {
            flex: 1;
            justify-content: center;
          }

          .pr-filters {
            flex-direction: column;
          }

          .pr-search-wrapper {
            width: 100%;
          }

          .pr-filter-select {
            width: 100%;
          }

          .pr-filter-btn {
            width: 100%;
            justify-content: center;
          }

          .pr-grid {
            grid-template-columns: 1fr;
          }

          .pr-title {
            font-size: 22px;
          }

          .pr-title-icon {
            width: 40px;
            height: 40px;
          }

          .pr-title-svg {
            width: 20px;
            height: 20px;
          }

          .pr-form-grid {
            grid-template-columns: 1fr;
          }

          .pr-modal {
            margin: 16px;
            max-height: 95vh;
          }
        }

        @media (max-width: 480px) {
          .pr-container {
            padding: 12px;
          }

          .pr-header-right {
            flex-direction: column;
          }

          .pr-add-btn {
            width: 100%;
          }

          .pr-icon-btn {
            align-self: flex-end;
          }

          .pr-title-wrapper {
            gap: 10px;
          }

          .pr-title {
            font-size: 20px;
          }

          .pr-subtitle {
            font-size: 13px;
          }

          .pr-modal {
            padding: 0;
          }

          .pr-modal-header {
            padding: 16px 18px;
          }

          .pr-modal-form {
            padding: 18px;
          }

          .pr-form-actions {
            flex-direction: column;
          }

          .pr-form-cancel,
          .pr-form-submit {
            width: 100%;
            justify-content: center;
          }
        }

        /* Scrollbar */
        .pr-modal::-webkit-scrollbar {
          width: 6px;
        }

        .pr-modal::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }

        .pr-modal::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }

        .pr-modal::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Partners;