// pages/partners/Employers.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, Edit, Trash2, Briefcase,
  Filter, Download, Eye, MapPin, Users, DollarSign,
  X, RefreshCw, Mail, Phone, Globe, Building2,
  Calendar, Award, Star, Zap, Layers, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const Employers = () => {
  const { token } = useAuth();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all' });
  const [showModal, setShowModal] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    status: 'prospect',
    companySize: '',
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
    assignedTo: ''
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchEmployers();
  }, [search, filters]);

  const fetchEmployers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.status !== 'all') params.append('status', filters.status);
      
      let data = [];
      try {
        const response = await fetch(
          `${API_URL}/partners/employers?${params.toString()}`,
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
        data = getMockEmployers();
        toast.info('Showing sample employer data');
      }

      setEmployers(data);
    } catch (error) {
      console.error('Error fetching employers:', error);
      setEmployers(getMockEmployers());
      toast.error('Failed to load employers, showing sample data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockEmployers = () => {
    return [
      {
        _id: '1',
        name: 'TechCorp Inc.',
        industry: 'Technology',
        description: 'Leading software development company',
        status: 'active',
        companySize: '500-1000',
        website: 'https://techcorp.com',
        email: 'partners@techcorp.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA, USA',
        contactPerson: {
          name: 'John Smith',
          email: 'john.smith@techcorp.com',
          phone: '+1 (555) 987-6543',
          position: 'Director of Talent'
        },
        assignedTo: { firstName: 'John', lastName: 'Doe' }
      },
      {
        _id: '2',
        name: 'Global Finance Group',
        industry: 'Finance',
        description: 'International financial services firm',
        status: 'onboarded',
        companySize: '1000-5000',
        website: 'https://globalfinance.com',
        email: 'partners@globalfinance.com',
        phone: '+1 (555) 234-5678',
        location: 'New York, NY, USA',
        contactPerson: {
          name: 'Sarah Chen',
          email: 'sarah.chen@globalfinance.com',
          phone: '+1 (555) 876-5432',
          position: 'HR Director'
        },
        assignedTo: { firstName: 'Sarah', lastName: 'Smith' }
      },
      {
        _id: '3',
        name: 'HealthCare Plus',
        industry: 'Healthcare',
        description: 'Leading healthcare provider network',
        status: 'interested',
        companySize: '5000-10000',
        website: 'https://healthcareplus.com',
        email: 'partners@healthcareplus.com',
        phone: '+1 (555) 345-6789',
        location: 'Chicago, IL, USA',
        contactPerson: {
          name: 'Dr. Emily Davis',
          email: 'emily.davis@healthcareplus.com',
          phone: '+1 (555) 765-4321',
          position: 'VP of Operations'
        },
        assignedTo: { firstName: 'Mike', lastName: 'Johnson' }
      },
      {
        _id: '4',
        name: 'EduTech Solutions',
        industry: 'Education Technology',
        description: 'Innovative educational technology company',
        status: 'negotiating',
        companySize: '100-500',
        website: 'https://edutech.com',
        email: 'partners@edutech.com',
        phone: '+1 (555) 456-7890',
        location: 'Austin, TX, USA',
        contactPerson: {
          name: 'David Park',
          email: 'david.park@edutech.com',
          phone: '+1 (555) 654-3210',
          position: 'CEO'
        },
        assignedTo: { firstName: 'Emma', lastName: 'Wilson' }
      }
    ];
  };

  const handleRefresh = () => {
    fetchEmployers(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Employer name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingEmployer 
        ? `${API_URL}/partners/employers/${editingEmployer._id}`
        : `${API_URL}/partners/employers`;
      
      const method = editingEmployer ? 'PUT' : 'POST';

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
          toast.success(editingEmployer ? 'Employer updated successfully!' : 'Employer created successfully!');
          setShowModal(false);
          setEditingEmployer(null);
          resetForm();
          await fetchEmployers(true);
        }
      } else {
        throw new Error('Failed to save employer');
      }
    } catch (error) {
      console.error('Error saving employer:', error);
      toast.error(error.message || 'Failed to save employer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employer?')) return;

    try {
      const response = await fetch(
        `${API_URL}/partners/employers/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success('Employer deleted successfully');
        await fetchEmployers(true);
      } else {
        throw new Error('Failed to delete employer');
      }
    } catch (error) {
      console.error('Error deleting employer:', error);
      toast.error('Failed to delete employer');
    }
  };

  const openModal = (employer = null) => {
    if (employer) {
      setEditingEmployer(employer);
      setFormData({
        name: employer.name || '',
        industry: employer.industry || '',
        description: employer.description || '',
        status: employer.status || 'prospect',
        companySize: employer.companySize || '',
        website: employer.website || '',
        email: employer.email || '',
        phone: employer.phone || '',
        location: employer.location || '',
        contactPerson: {
          name: employer.contactPerson?.name || '',
          email: employer.contactPerson?.email || '',
          phone: employer.contactPerson?.phone || '',
          position: employer.contactPerson?.position || ''
        },
        assignedTo: employer.assignedTo?._id || employer.assignedTo || ''
      });
    } else {
      setEditingEmployer(null);
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
      companySize: '',
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
      'active': 'em-status-active',
      'onboarded': 'em-status-onboarded',
      'interested': 'em-status-interested',
      'negotiating': 'em-status-negotiating',
      'prospect': 'em-status-prospect'
    };
    return colors[status] || 'em-status-default';
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

  const getCompanySizeLabel = (size) => {
    const labels = {
      '1-10': '1-10 employees',
      '11-50': '11-50 employees',
      '51-200': '51-200 employees',
      '201-500': '201-500 employees',
      '501-1000': '501-1000 employees',
      '1000+': '1000+ employees'
    };
    return labels[size] || size;
  };

  const statusOptions = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'interested', label: 'Interested' },
    { value: 'negotiating', label: 'Negotiating' },
    { value: 'onboarded', label: 'Onboarded' },
    { value: 'active', label: 'Active' }
  ];

  const companySizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ];

  if (loading) {
    return (
      <div className="em-loading">
        <div className="em-loading-spinner"></div>
        <p className="em-loading-text">Loading employers...</p>
      </div>
    );
  }

  return (
    <>
      <div className="em-container">
        {/* Header */}
        <div className="em-header">
          <div className="em-header-left">
            <div className="em-title-wrapper">
              <div className="em-title-icon">
                <Layers className="em-title-svg" />
              </div>
              <div>
                <h1 className="em-title">Employers</h1>
                <p className="em-subtitle">Manage employer partnerships</p>
              </div>
            </div>
            <span className="em-count">{employers.length} employers</span>
          </div>
          <div className="em-header-right">
            <button className="em-icon-btn" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`em-refresh-icon ${refreshing ? 'em-spin' : ''}`} />
            </button>
            <button className="em-export-btn">
              <Download className="em-btn-icon" />
              Export
            </button>
            <button 
              onClick={() => openModal()}
              className="em-add-btn"
            >
              <Plus className="em-btn-icon" />
              Add Employer
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="em-filters">
          <div className="em-search-wrapper">
            <Search className="em-search-icon" />
            <input
              type="text"
              placeholder="Search employers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="em-search-input"
            />
            {search && (
              <button className="em-search-clear" onClick={() => setSearch('')}>
                <X className="em-search-clear-icon" />
              </button>
            )}
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="em-filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="onboarded">Onboarded</option>
            <option value="interested">Interested</option>
            <option value="negotiating">Negotiating</option>
            <option value="prospect">Prospect</option>
          </select>
        </div>

        {/* Employers Grid */}
        <div className="em-grid">
          {employers.map((employer, index) => (
            <div key={employer._id} className="em-card" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="em-card-header">
                <div className="em-card-left">
                  <div className="em-card-icon">
                    <Briefcase className="em-card-icon-svg" />
                  </div>
                  <div className="em-card-info">
                    <h3 className="em-card-title">{employer.name}</h3>
                    <p className="em-card-industry">{employer.industry || 'No industry'}</p>
                  </div>
                </div>
                <span className={`em-card-status ${getStatusColor(employer.status)}`}>
                  {getStatusLabel(employer.status)}
                </span>
              </div>
              
              {employer.description && (
                <p className="em-card-desc">{employer.description}</p>
              )}
              
              <div className="em-card-badges">
                {employer.companySize && (
                  <span className="em-badge em-badge-blue">
                    <Users className="em-badge-icon" />
                    {getCompanySizeLabel(employer.companySize)}
                  </span>
                )}
                {employer.jobsPosted && employer.jobsPosted.length > 0 && (
                  <span className="em-badge em-badge-green">
                    <Briefcase className="em-badge-icon" />
                    {employer.jobsPosted.length} jobs posted
                  </span>
                )}
              </div>
              
              {employer.contactPerson && employer.contactPerson.name && (
                <div className="em-card-contact">
                  <Users className="em-contact-icon" />
                  <span className="em-contact-text">
                    {employer.contactPerson.name}
                    {employer.contactPerson.position && (
                      <>
                        <span className="em-contact-separator">•</span>
                        <span className="em-contact-position">{employer.contactPerson.position}</span>
                      </>
                    )}
                  </span>
                </div>
              )}
              
              {employer.location && (
                <div className="em-card-location">
                  <MapPin className="em-location-icon" />
                  <span className="em-location-text">{employer.location}</span>
                </div>
              )}
              
              <div className="em-card-footer">
                <div className="em-card-assignee">
                  <span className="em-assignee-label">Assigned:</span>
                  <span className="em-assignee-name">
                    {employer.assignedTo?.firstName} {employer.assignedTo?.lastName || 'Unassigned'}
                  </span>
                </div>
                <div className="em-card-actions">
                  <button 
                    className="em-action-btn em-action-view"
                    onClick={() => {
                      toast.info('View details coming soon');
                    }}
                    title="View"
                  >
                    <Eye className="em-action-icon" />
                  </button>
                  <button 
                    className="em-action-btn em-action-edit"
                    onClick={() => openModal(employer)}
                    title="Edit"
                  >
                    <Edit className="em-action-icon" />
                  </button>
                  <button 
                    className="em-action-btn em-action-delete"
                    onClick={() => handleDelete(employer._id)}
                    title="Delete"
                  >
                    <Trash2 className="em-action-icon" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {employers.length === 0 && (
          <div className="em-empty">
            <div className="em-empty-icon-wrapper">
              <Briefcase className="em-empty-icon" />
            </div>
            <h3 className="em-empty-title">No employers found</h3>
            <p className="em-empty-subtitle">Start by adding your first employer partner</p>
            <button className="em-empty-btn" onClick={() => openModal()}>
              <Plus className="em-btn-icon" />
              Add Employer
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="em-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="em-modal" onClick={(e) => e.stopPropagation()}>
            <div className="em-modal-header">
              <div className="em-modal-title-wrapper">
                <Briefcase className="em-modal-icon" />
                <h2 className="em-modal-title">
                  {editingEmployer ? 'Edit Employer' : 'Add New Employer'}
                </h2>
              </div>
              <button className="em-modal-close" onClick={() => setShowModal(false)}>
                <X className="em-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="em-modal-form">
              <div className="em-form-group">
                <label className="em-form-label">
                  Employer Name <span className="em-form-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="em-form-input"
                  placeholder="Enter employer name"
                  autoFocus
                />
              </div>

              <div className="em-form-grid">
                <div className="em-form-group">
                  <label className="em-form-label">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    className="em-form-input"
                    placeholder="e.g., Technology, Finance"
                  />
                </div>
                <div className="em-form-group">
                  <label className="em-form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="em-form-select"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="em-form-group">
                <label className="em-form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="em-form-textarea"
                  rows="2"
                  placeholder="Brief description of the employer"
                />
              </div>

              <div className="em-form-grid">
                <div className="em-form-group">
                  <label className="em-form-label">Company Size</label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => handleChange('companySize', e.target.value)}
                    className="em-form-select"
                  >
                    <option value="">Select size</option>
                    {companySizeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="em-form-group">
                  <label className="em-form-label">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="em-form-input"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="em-form-grid">
                <div className="em-form-group">
                  <label className="em-form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="em-form-input"
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="em-form-group">
                  <label className="em-form-label">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="em-form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="em-form-group">
                <label className="em-form-label">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="em-form-input"
                  placeholder="City, State, Country"
                />
              </div>

              <div className="em-form-section">
                <h4 className="em-form-section-title">Contact Person</h4>
                <div className="em-form-grid">
                  <div className="em-form-group">
                    <label className="em-form-label">Name</label>
                    <input
                      type="text"
                      value={formData.contactPerson.name}
                      onChange={(e) => handleChange('contactPerson.name', e.target.value)}
                      className="em-form-input"
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="em-form-group">
                    <label className="em-form-label">Position</label>
                    <input
                      type="text"
                      value={formData.contactPerson.position}
                      onChange={(e) => handleChange('contactPerson.position', e.target.value)}
                      className="em-form-input"
                      placeholder="Position/Title"
                    />
                  </div>
                </div>
                <div className="em-form-grid">
                  <div className="em-form-group">
                    <label className="em-form-label">Email</label>
                    <input
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) => handleChange('contactPerson.email', e.target.value)}
                      className="em-form-input"
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div className="em-form-group">
                    <label className="em-form-label">Phone</label>
                    <input
                      type="text"
                      value={formData.contactPerson.phone}
                      onChange={(e) => handleChange('contactPerson.phone', e.target.value)}
                      className="em-form-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="em-form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="em-form-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="em-form-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="em-form-spinner"></div>
                      {editingEmployer ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="em-btn-icon" />
                      {editingEmployer ? 'Update Employer' : 'Add Employer'}
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
        .em-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .em-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .em-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .em-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           HEADER
           ============================================ */
        .em-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeInDown 0.6s ease;
        }
        .em-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .em-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .em-title-icon {
          width: 48px;
          height: 48px;
          background: #013E37;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.25);
        }
        .em-title-svg {
          width: 24px;
          height: 24px;
          color: #FFEFB3;
        }
        .em-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .em-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }
        .em-count {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          background: #FFEFB3;
          padding: 2px 14px;
          border-radius: 12px;
        }
        .em-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .em-icon-btn {
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
        .em-icon-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .em-refresh-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        .em-spin {
          animation: spin 1s linear infinite;
        }
        .em-btn-icon {
          width: 16px;
          height: 16px;
        }
        .em-export-btn {
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
        .em-export-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .em-add-btn {
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
        .em-add-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.4);
        }
        .em-add-btn:active {
          transform: scale(0.95);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .em-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .em-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }
        .em-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.4;
        }
        .em-search-input {
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
        .em-search-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .em-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }
        .em-search-clear {
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
        .em-search-clear:hover {
          background: #FFEFB3;
          opacity: 1;
        }
        .em-search-clear-icon {
          width: 14px;
          height: 14px;
        }
        .em-filter-select {
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
        .em-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .em-filter-select:hover {
          border-color: #013E37;
        }

        /* ============================================
           GRID
           ============================================ */
        .em-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .em-card {
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
        .em-card::before {
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
        .em-card:hover::before {
          transform: scaleX(1);
        }
        .em-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.1);
          border-color: #013E37;
        }
        .em-card:nth-child(1) { animation-delay: 0.05s; }
        .em-card:nth-child(2) { animation-delay: 0.1s; }
        .em-card:nth-child(3) { animation-delay: 0.15s; }
        .em-card:nth-child(4) { animation-delay: 0.2s; }
        .em-card:nth-child(5) { animation-delay: 0.25s; }

        .em-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .em-card-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .em-card-icon {
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
        .em-card:hover .em-card-icon {
          transform: scale(1.05) rotate(-5deg);
        }
        .em-card-icon-svg {
          width: 22px;
          height: 22px;
          color: #013E37;
        }
        .em-card-info {
          flex: 1;
          min-width: 0;
        }
        .em-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .em-card-industry {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }
        .em-card-status {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .em-card-status:hover {
          transform: scale(1.05);
        }
        .em-status-active { background: #013E37; color: #FFEFB3; }
        .em-status-onboarded { background: #0A5C54; color: #FFEFB3; }
        .em-status-interested { background: #FFEFB3; color: #013E37; }
        .em-status-negotiating { background: #FFEFB3; color: #013E37; }
        .em-status-prospect { background: #FFEFB3; color: #013E37; }

        .em-card-desc {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .em-card-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .em-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }
        .em-badge:hover {
          transform: scale(1.05);
        }
        .em-badge-blue { background: #FFEFB3; color: #013E37; }
        .em-badge-green { background: #013E37; color: #FFEFB3; }
        .em-badge-icon {
          width: 12px;
          height: 12px;
        }
        .em-card-contact {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.7;
        }
        .em-contact-icon {
          width: 14px;
          height: 14px;
          color: #013E37;
          opacity: 0.4;
        }
        .em-contact-text {
          font-size: 13px;
        }
        .em-contact-separator {
          color: #013E37;
          opacity: 0.3;
          margin: 0 4px;
        }
        .em-contact-position {
          opacity: 0.6;
        }
        .em-card-location {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 12px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.5;
        }
        .em-location-icon {
          width: 14px;
          height: 14px;
        }
        .em-location-text {
          font-size: 13px;
        }
        .em-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #FFEFB3;
          transition: border-color 0.3s ease;
        }
        .em-card:hover .em-card-footer {
          border-color: #013E37;
        }
        .em-card-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
        }
        .em-assignee-label {
          opacity: 0.5;
        }
        .em-assignee-name {
          font-weight: 500;
          color: #013E37;
        }
        .em-card-actions {
          display: flex;
          gap: 4px;
        }
        .em-action-btn {
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
        .em-action-btn:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }
        .em-action-view:hover {
          background: #FFEFB3;
          color: #013E37;
        }
        .em-action-edit:hover {
          background: #FFEFB3;
          color: #013E37;
        }
        .em-action-delete:hover {
          background: #FEE2E2;
          color: #EF4444;
        }
        .em-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .em-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 2px dashed #FFEFB3;
          text-align: center;
        }
        .em-empty-icon-wrapper {
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
        .em-empty-icon {
          width: 36px;
          height: 36px;
          color: #013E37;
        }
        .em-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .em-empty-subtitle {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 4px 0 16px 0;
        }
        .em-empty-btn {
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
        .em-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
        }

        /* ============================================
           MODAL
           ============================================ */
        .em-modal-overlay {
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
        .em-modal {
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
        .em-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
          border-radius: 16px 16px 0 0;
        }
        .em-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .em-modal-icon {
          width: 28px;
          height: 28px;
          color: #013E37;
        }
        .em-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }
        .em-modal-close {
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
        .em-modal-close:hover {
          background: rgba(1, 62, 55, 0.1);
          opacity: 1;
          transform: rotate(90deg);
        }
        .em-modal-close-icon {
          width: 18px;
          height: 18px;
        }
        .em-modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .em-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .em-form-group:nth-child(1) { animation-delay: 0.05s; }
        .em-form-group:nth-child(2) { animation-delay: 0.1s; }
        .em-form-group:nth-child(3) { animation-delay: 0.15s; }
        .em-form-group:nth-child(4) { animation-delay: 0.2s; }
        .em-form-group:nth-child(5) { animation-delay: 0.25s; }
        .em-form-group:nth-child(6) { animation-delay: 0.3s; }
        .em-form-group:nth-child(7) { animation-delay: 0.35s; }
        .em-form-group:nth-child(8) { animation-delay: 0.4s; }
        .em-form-group:nth-child(9) { animation-delay: 0.45s; }
        .em-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }
        .em-form-required {
          color: #EF4444;
        }
        .em-form-input,
        .em-form-select,
        .em-form-textarea {
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
        .em-form-input:focus,
        .em-form-select:focus,
        .em-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .em-form-input::placeholder,
        .em-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.4;
        }
        .em-form-textarea {
          resize: vertical;
          min-height: 60px;
        }
        .em-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .em-form-section {
          background: #FFF9E6;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #FFEFB3;
        }
        .em-form-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
          margin: 0 0 12px 0;
        }
        .em-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #FFEFB3;
        }
        .em-form-cancel {
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
        .em-form-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .em-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .em-form-submit {
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
        .em-form-submit:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
        }
        .em-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .em-form-spinner {
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
          .em-header {
            flex-direction: column;
            align-items: stretch;
          }
          .em-header-right {
            flex-wrap: wrap;
          }
          .em-export-btn,
          .em-add-btn {
            flex: 1;
            justify-content: center;
          }
          .em-filters {
            flex-direction: column;
          }
          .em-search-wrapper {
            width: 100%;
          }
          .em-filter-select {
            width: 100%;
          }
          .em-grid {
            grid-template-columns: 1fr;
          }
          .em-title {
            font-size: 22px;
          }
          .em-title-icon {
            width: 40px;
            height: 40px;
          }
          .em-title-svg {
            width: 20px;
            height: 20px;
          }
          .em-form-grid {
            grid-template-columns: 1fr;
          }
          .em-modal {
            margin: 16px;
            max-height: 95vh;
          }
          .em-header-left {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .em-header-right {
            flex-direction: column;
          }
          .em-export-btn,
          .em-add-btn {
            width: 100%;
          }
          .em-icon-btn {
            align-self: flex-end;
          }
          .em-title-wrapper {
            gap: 10px;
          }
          .em-title {
            font-size: 20px;
          }
          .em-subtitle {
            font-size: 13px;
          }
          .em-modal {
            padding: 0;
          }
          .em-modal-header {
            padding: 16px 18px;
          }
          .em-modal-form {
            padding: 18px;
          }
          .em-form-actions {
            flex-direction: column;
          }
          .em-form-cancel,
          .em-form-submit {
            width: 100%;
            justify-content: center;
          }
          .em-card {
            padding: 16px;
          }
          .em-card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }

        /* Scrollbar */
        .em-modal::-webkit-scrollbar {
          width: 6px;
        }
        .em-modal::-webkit-scrollbar-track {
          background: #FFEFB3;
          border-radius: 8px;
        }
        .em-modal::-webkit-scrollbar-thumb {
          background: #013E37;
          border-radius: 8px;
        }
        .em-modal::-webkit-scrollbar-thumb:hover {
          background: #0A5C54;
        }
      `}</style>
    </>
  );
};

export default Employers;