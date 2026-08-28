// pages/partners/EmployerPartner.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase, Edit, Trash2, Eye, Plus,
  Search, Filter, Mail, Phone, MapPin,
  Users, Calendar, DollarSign, Building2,
  CheckCircle, XCircle, AlertCircle, Clock,
  Download, RefreshCw, FileText, X,
  Globe, Award, TrendingUp, Link, 
  MessageCircle, Star, Zap, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const EmployerPartner = () => {
  const { token } = useAuth();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    industry: 'all',
    size: 'all'
  });
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    status: 'prospect',
    description: '',
    website: '',
    email: '',
    phone: '',
    location: '',
    companySize: '',
    foundedYear: '',
    contactPerson: {
      name: '',
      email: '',
      phone: '',
      position: ''
    },
    benefits: [],
    jobsPosted: [],
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
      if (filters.industry !== 'all') params.append('industry', filters.industry);
      if (filters.size !== 'all') params.append('companySize', filters.size);

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
        name: 'Google',
        industry: 'Technology',
        status: 'active',
        description: 'Global technology company specializing in internet-related services and products.',
        website: 'https://google.com',
        email: 'partners@google.com',
        phone: '+1 (650) 253-0000',
        location: 'Mountain View, California, USA',
        companySize: '10000+',
        foundedYear: 1998,
        contactPerson: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@google.com',
          phone: '+1 (650) 253-1234',
          position: 'Director of Partnerships'
        },
        benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours', 'Remote Work'],
        jobsPosted: [
          { title: 'Senior Software Engineer', status: 'live', type: 'Full-time' },
          { title: 'Product Manager', status: 'live', type: 'Full-time' }
        ],
        assignedTo: { firstName: 'John', lastName: 'Doe' }
      },
      {
        _id: '2',
        name: 'Microsoft',
        industry: 'Technology',
        status: 'onboarded',
        description: 'Multinational technology company developing software, hardware, and cloud services.',
        website: 'https://microsoft.com',
        email: 'partners@microsoft.com',
        phone: '+1 (425) 882-8080',
        location: 'Redmond, Washington, USA',
        companySize: '10000+',
        foundedYear: 1975,
        contactPerson: {
          name: 'Mike Chen',
          email: 'mike.chen@microsoft.com',
          phone: '+1 (425) 882-1234',
          position: 'Head of Talent Acquisition'
        },
        benefits: ['Health Insurance', '401k Matching', 'Paid Time Off', 'Tuition Reimbursement'],
        jobsPosted: [
          { title: 'Cloud Architect', status: 'live', type: 'Full-time' },
          { title: 'Data Scientist', status: 'pending', type: 'Full-time' }
        ],
        assignedTo: { firstName: 'Sarah', lastName: 'Smith' }
      },
      {
        _id: '3',
        name: 'Amazon',
        industry: 'E-commerce',
        status: 'interested',
        description: 'Global e-commerce and cloud computing company.',
        website: 'https://amazon.com',
        email: 'partners@amazon.com',
        phone: '+1 (206) 266-1000',
        location: 'Seattle, Washington, USA',
        companySize: '10000+',
        foundedYear: 1994,
        contactPerson: {
          name: 'Emily Davis',
          email: 'emily.davis@amazon.com',
          phone: '+1 (206) 266-1234',
          position: 'Strategic Partnerships Manager'
        },
        benefits: ['Health Insurance', 'Stock Options', 'Career Development'],
        jobsPosted: [
          { title: 'Operations Manager', status: 'live', type: 'Full-time' }
        ],
        assignedTo: { firstName: 'Mike', lastName: 'Johnson' }
      },
      {
        _id: '4',
        name: 'Johnson & Johnson',
        industry: 'Healthcare',
        status: 'negotiating',
        description: 'Global healthcare company developing pharmaceuticals and medical devices.',
        website: 'https://jnj.com',
        email: 'partners@jnj.com',
        phone: '+1 (732) 524-0400',
        location: 'New Brunswick, New Jersey, USA',
        companySize: '5000-10000',
        foundedYear: 1886,
        contactPerson: {
          name: 'Dr. James Wilson',
          email: 'james.wilson@jnj.com',
          phone: '+1 (732) 524-1234',
          position: 'Director of Research Partnerships'
        },
        benefits: ['Health Insurance', '401k Matching', 'Paid Time Off'],
        jobsPosted: [],
        assignedTo: { firstName: 'Emily', lastName: 'Brown' }
      },
      {
        _id: '5',
        name: 'Goldman Sachs',
        industry: 'Finance',
        status: 'prospect',
        description: 'Leading global investment banking and financial services firm.',
        website: 'https://goldmansachs.com',
        email: 'partners@gs.com',
        phone: '+1 (212) 902-1000',
        location: 'New York, New York, USA',
        companySize: '1000-5000',
        foundedYear: 1869,
        contactPerson: {
          name: 'David Lee',
          email: 'david.lee@gs.com',
          phone: '+1 (212) 902-1234',
          position: 'Head of Corporate Partnerships'
        },
        benefits: ['Health Insurance', 'Stock Options', 'Performance Bonus'],
        jobsPosted: [],
        assignedTo: { firstName: 'David', lastName: 'Lee' }
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
          toast.success(editingEmployer ? 'Employer updated successfully!' : 'Employer added successfully!');
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
        status: employer.status || 'prospect',
        description: employer.description || '',
        website: employer.website || '',
        email: employer.email || '',
        phone: employer.phone || '',
        location: employer.location || '',
        companySize: employer.companySize || '',
        foundedYear: employer.foundedYear || '',
        contactPerson: {
          name: employer.contactPerson?.name || '',
          email: employer.contactPerson?.email || '',
          phone: employer.contactPerson?.phone || '',
          position: employer.contactPerson?.position || ''
        },
        benefits: employer.benefits || [],
        jobsPosted: employer.jobsPosted || [],
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
      status: 'prospect',
      description: '',
      website: '',
      email: '',
      phone: '',
      location: '',
      companySize: '',
      foundedYear: '',
      contactPerson: {
        name: '',
        email: '',
        phone: '',
        position: ''
      },
      benefits: [],
      jobsPosted: [],
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
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleBenefitAdd = (benefit) => {
    if (benefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit.trim()]
      }));
    }
  };

  const handleBenefitRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'ep-status-active',
      'onboarded': 'ep-status-onboarded',
      'interested': 'ep-status-interested',
      'negotiating': 'ep-status-negotiating',
      'prospect': 'ep-status-prospect',
      'inactive': 'ep-status-inactive'
    };
    return colors[status] || 'ep-status-default';
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
    if (status === 'active') return <CheckCircle className="ep-status-icon ep-icon-green" />;
    if (status === 'onboarded') return <CheckCircle className="ep-status-icon ep-icon-blue" />;
    if (status === 'interested') return <Clock className="ep-status-icon ep-icon-yellow" />;
    if (status === 'negotiating') return <Clock className="ep-status-icon ep-icon-purple" />;
    if (status === 'inactive') return <XCircle className="ep-status-icon ep-icon-red" />;
    return <AlertCircle className="ep-status-icon ep-icon-gray" />;
  };

  const getIndustryColor = (industry) => {
    const colors = {
      'Technology': 'ep-industry-tech',
      'Healthcare': 'ep-industry-health',
      'Finance': 'ep-industry-finance',
      'Education': 'ep-industry-education',
      'E-commerce': 'ep-industry-ecommerce',
      'Manufacturing': 'ep-industry-manufacturing',
      'Retail': 'ep-industry-retail',
      'Real Estate': 'ep-industry-realestate',
      'Hospitality': 'ep-industry-hospitality',
      'Media': 'ep-industry-media'
    };
    return colors[industry] || 'ep-industry-default';
  };

  const getIndustryLabel = (industry) => {
    return industry || 'No industry';
  };

  const getJobStatusColor = (status) => {
    const colors = {
      'live': 'ep-job-live',
      'pending': 'ep-job-pending',
      'closed': 'ep-job-closed',
      'draft': 'ep-job-draft'
    };
    return colors[status] || 'ep-job-default';
  };

  const getJobStatusLabel = (status) => {
    const labels = {
      'live': 'Live',
      'pending': 'Pending',
      'closed': 'Closed',
      'draft': 'Draft'
    };
    return labels[status] || status;
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
    { value: 'Retail', label: 'Retail' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Hospitality', label: 'Hospitality' },
    { value: 'Media', label: 'Media' }
  ];

  const companySizes = [
    { value: 'all', label: 'All Sizes' },
    { value: '1-50', label: '1-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000-5000', label: '1000-5000 employees' },
    { value: '5000-10000', label: '5000-10000 employees' },
    { value: '10000+', label: '10000+ employees' }
  ];

  if (loading) {
    return (
      <div className="ep-loading">
        <div className="ep-spinner"></div>
        <p className="ep-loading-text">Loading employers...</p>
      </div>
    );
  }

  return (
    <div className="ep-container">
      {/* Header */}
      <div className="ep-header">
        <div className="ep-header-left">
          <div className="ep-title-wrapper">
            <div className="ep-title-icon">
              <Briefcase className="ep-title-svg" />
            </div>
            <div>
              <h3 className="ep-title">Employer Partners</h3>
              <p className="ep-subtitle">Manage employer partnerships and job opportunities</p>
            </div>
          </div>
          <span className="ep-count">{employers.length} employers</span>
        </div>
        <div className="ep-header-right">
          <button className="ep-icon-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`ep-refresh-icon ${refreshing ? 'ep-spin' : ''}`} />
          </button>
          <button className="ep-icon-btn">
            <Download className="ep-btn-icon" />
          </button>
          <button 
            onClick={() => openModal()}
            className="ep-add-btn"
          >
            <Plus className="ep-btn-icon" />
            Add Employer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="ep-stats">
        <div className="ep-stat-card">
          <div className="ep-stat-icon ep-stat-total">
            <Briefcase className="ep-stat-svg" />
          </div>
          <div className="ep-stat-info">
            <span className="ep-stat-value">{employers.length}</span>
            <span className="ep-stat-label">Total Employers</span>
          </div>
        </div>
        <div className="ep-stat-card">
          <div className="ep-stat-icon ep-stat-active">
            <CheckCircle className="ep-stat-svg" />
          </div>
          <div className="ep-stat-info">
            <span className="ep-stat-value">{employers.filter(e => e.status === 'active').length}</span>
            <span className="ep-stat-label">Active Partners</span>
          </div>
        </div>
        <div className="ep-stat-card">
          <div className="ep-stat-icon ep-stat-jobs">
            <FileText className="ep-stat-svg" />
          </div>
          <div className="ep-stat-info">
            <span className="ep-stat-value">
              {employers.reduce((acc, e) => acc + (e.jobsPosted?.filter(j => j.status === 'live').length || 0), 0)}
            </span>
            <span className="ep-stat-label">Live Jobs</span>
          </div>
        </div>
        <div className="ep-stat-card">
          <div className="ep-stat-icon ep-stat-interested">
            <TrendingUp className="ep-stat-svg" />
          </div>
          <div className="ep-stat-info">
            <span className="ep-stat-value">{employers.filter(e => e.status === 'interested' || e.status === 'negotiating').length}</span>
            <span className="ep-stat-label">In Progress</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="ep-filters">
        <div className="ep-search-wrapper">
          <Search className="ep-search-icon" />
          <input
            type="text"
            placeholder="Search employers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ep-search-input"
          />
          {search && (
            <button className="ep-search-clear" onClick={() => setSearch('')}>
              <X className="ep-search-clear-icon" />
            </button>
          )}
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="ep-filter-select"
        >
          {statuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filters.industry}
          onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
          className="ep-filter-select"
        >
          {industries.map(i => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>
        <select
          value={filters.size}
          onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
          className="ep-filter-select"
        >
          {companySizes.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Employers Grid */}
      <div className="ep-grid">
        {employers.map((employer) => (
          <div 
            key={employer._id} 
            className="ep-card"
            onClick={() => {
              setSelectedEmployer(employer);
              setShowDetails(true);
            }}
          >
            <div className="ep-card-header">
              <div className="ep-card-left">
                <div className="ep-card-icon">
                  <Briefcase className="ep-card-icon-svg" />
                </div>
                <div className="ep-card-info">
                  <h4 className="ep-card-title">{employer.name}</h4>
                  <div className="ep-card-tags">
                    <span className={`ep-card-industry ${getIndustryColor(employer.industry)}`}>
                      {getIndustryLabel(employer.industry)}
                    </span>
                    {employer.companySize && (
                      <span className="ep-card-size">
                        <Users className="ep-card-size-icon" />
                        {employer.companySize}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className={`ep-card-status ${getStatusColor(employer.status)}`}>
                {getStatusIcon(employer.status)}
                {getStatusLabel(employer.status)}
              </span>
            </div>
            
            {employer.description && (
              <p className="ep-card-desc">{employer.description}</p>
            )}
            
            <div className="ep-card-badges">
              {employer.foundedYear && (
                <span className="ep-badge ep-badge-blue">
                  <Calendar className="ep-badge-icon" />
                  Est. {employer.foundedYear}
                </span>
              )}
              {employer.location && (
                <span className="ep-badge ep-badge-purple">
                  <MapPin className="ep-badge-icon" />
                  {employer.location.split(',').slice(0, 2).join(',')}
                </span>
              )}
              {employer.jobsPosted && employer.jobsPosted.filter(j => j.status === 'live').length > 0 && (
                <span className="ep-badge ep-badge-green">
                  <FileText className="ep-badge-icon" />
                  {employer.jobsPosted.filter(j => j.status === 'live').length} jobs
                </span>
              )}
            </div>
            
            {employer.contactPerson && employer.contactPerson.name && (
              <div className="ep-card-contact">
                <Users className="ep-contact-icon" />
                <span className="ep-contact-text">{employer.contactPerson.name}</span>
                {employer.contactPerson.position && (
                  <>
                    <span className="ep-contact-separator">•</span>
                    <span className="ep-contact-position">{employer.contactPerson.position}</span>
                  </>
                )}
              </div>
            )}

            {employer.benefits && employer.benefits.length > 0 && (
              <div className="ep-card-benefits">
                <span className="ep-benefit-label">Benefits:</span>
                <div className="ep-benefit-tags">
                  {employer.benefits.slice(0, 3).map((benefit, idx) => (
                    <span key={idx} className="ep-benefit-tag">
                      <Star className="ep-benefit-tag-icon" />
                      {benefit}
                    </span>
                  ))}
                  {employer.benefits.length > 3 && (
                    <span className="ep-benefit-more">
                      +{employer.benefits.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="ep-card-footer">
              <div className="ep-card-assignee">
                <span className="ep-assignee-label">Assigned:</span>
                <span className="ep-assignee-name">
                  {employer.assignedTo?.firstName} {employer.assignedTo?.lastName || 'Unassigned'}
                </span>
              </div>
              <div className="ep-card-actions">
                <button 
                  className="ep-action-btn ep-action-view"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEmployer(employer);
                    setShowDetails(true);
                  }}
                  title="View"
                >
                  <Eye className="ep-action-icon" />
                </button>
                <button 
                  className="ep-action-btn ep-action-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(employer);
                  }}
                  title="Edit"
                >
                  <Edit className="ep-action-icon" />
                </button>
                <button 
                  className="ep-action-btn ep-action-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(employer._id);
                  }}
                  title="Delete"
                >
                  <Trash2 className="ep-action-icon" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {employers.length === 0 && (
        <div className="ep-empty">
          <div className="ep-empty-icon-wrapper">
            <Briefcase className="ep-empty-icon" />
          </div>
          <h3 className="ep-empty-title">No employers found</h3>
          <p className="ep-empty-subtitle">Start by adding your first employer partner</p>
          <button className="ep-empty-btn" onClick={() => openModal()}>
            <Plus className="ep-btn-icon" />
            Add Employer
          </button>
        </div>
      )}

      {/* Employer Details Modal */}
      {showDetails && selectedEmployer && (
        <div className="ep-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="ep-modal ep-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="ep-modal-header">
              <div className="ep-modal-title-wrapper">
                <div className="ep-modal-icon-wrapper">
                  <Briefcase className="ep-modal-icon" />
                </div>
                <div>
                  <h2 className="ep-modal-title">{selectedEmployer.name}</h2>
                  <p className="ep-modal-subtitle">{getIndustryLabel(selectedEmployer.industry)} • {selectedEmployer.companySize || 'Size TBD'}</p>
                </div>
              </div>
              <button className="ep-modal-close" onClick={() => setShowDetails(false)}>
                <X className="ep-modal-close-icon" />
              </button>
            </div>
            
            <div className="ep-modal-body">
              <div className="ep-modal-section">
                <h4 className="ep-modal-label">Description</h4>
                <p className="ep-modal-text">{selectedEmployer.description || 'No description provided'}</p>
              </div>
              
              <div className="ep-modal-grid">
                <div className="ep-modal-item">
                  <h4 className="ep-modal-label">Status</h4>
                  <span className={`ep-modal-status ${getStatusColor(selectedEmployer.status)}`}>
                    {getStatusLabel(selectedEmployer.status)}
                  </span>
                </div>
                <div className="ep-modal-item">
                  <h4 className="ep-modal-label">Industry</h4>
                  <p className="ep-modal-value">{getIndustryLabel(selectedEmployer.industry)}</p>
                </div>
                <div className="ep-modal-item">
                  <h4 className="ep-modal-label">Company Size</h4>
                  <p className="ep-modal-value">{selectedEmployer.companySize || 'N/A'}</p>
                </div>
                <div className="ep-modal-item">
                  <h4 className="ep-modal-label">Founded</h4>
                  <p className="ep-modal-value">{selectedEmployer.foundedYear || 'N/A'}</p>
                </div>
              </div>

              {selectedEmployer.location && (
                <div className="ep-modal-section">
                  <h4 className="ep-modal-label">Location</h4>
                  <p className="ep-modal-text">{selectedEmployer.location}</p>
                </div>
              )}
              
              {selectedEmployer.contactPerson && (selectedEmployer.contactPerson.name || selectedEmployer.contactPerson.email) && (
                <div className="ep-modal-section">
                  <h4 className="ep-modal-label">Contact Person</h4>
                  <div className="ep-modal-contact">
                    {selectedEmployer.contactPerson.name && (
                      <p className="ep-modal-contact-name">{selectedEmployer.contactPerson.name}</p>
                    )}
                    {selectedEmployer.contactPerson.position && (
                      <p className="ep-modal-contact-position">{selectedEmployer.contactPerson.position}</p>
                    )}
                    {selectedEmployer.contactPerson.email && (
                      <p className="ep-modal-contact-email">
                        <Mail className="ep-modal-contact-icon" />
                        {selectedEmployer.contactPerson.email}
                      </p>
                    )}
                    {selectedEmployer.contactPerson.phone && (
                      <p className="ep-modal-contact-phone">
                        <Phone className="ep-modal-contact-icon" />
                        {selectedEmployer.contactPerson.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedEmployer.benefits && selectedEmployer.benefits.length > 0 && (
                <div className="ep-modal-section">
                  <h4 className="ep-modal-label">Benefits & Perks</h4>
                  <div className="ep-modal-benefits">
                    {selectedEmployer.benefits.map((benefit, idx) => (
                      <span key={idx} className="ep-modal-benefit">
                        <Star className="ep-modal-benefit-icon" />
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEmployer.jobsPosted && selectedEmployer.jobsPosted.length > 0 && (
                <div className="ep-modal-section">
                  <h4 className="ep-modal-label">Job Postings</h4>
                  <div className="ep-modal-jobs">
                    {selectedEmployer.jobsPosted.map((job, idx) => (
                      <div key={idx} className="ep-modal-job">
                        <div className="ep-modal-job-header">
                          <span className="ep-modal-job-title">{job.title}</span>
                          <span className={`ep-modal-job-status ${getJobStatusColor(job.status)}`}>
                            {getJobStatusLabel(job.status)}
                          </span>
                        </div>
                        {job.type && (
                          <span className="ep-modal-job-type">{job.type}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEmployer.website && (
                <div className="ep-modal-section">
                  <h4 className="ep-modal-label">Website</h4>
                  <a 
                    href={selectedEmployer.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ep-modal-link"
                  >
                    <Globe className="ep-modal-link-icon" />
                    {selectedEmployer.website}
                  </a>
                </div>
              )}
            </div>
            
            <div className="ep-modal-footer">
              <button
                onClick={() => setShowDetails(false)}
                className="ep-modal-cancel"
              >
                Close
              </button>
              <button 
                className="ep-modal-edit"
                onClick={() => {
                  setShowDetails(false);
                  openModal(selectedEmployer);
                }}
              >
                <Edit className="ep-btn-icon" />
                Edit Employer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="ep-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ep-modal ep-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="ep-modal-header">
              <div className="ep-modal-title-wrapper">
                <Briefcase className="ep-modal-icon" />
                <h2 className="ep-modal-title">
                  {editingEmployer ? 'Edit Employer' : 'Add New Employer'}
                </h2>
              </div>
              <button className="ep-modal-close" onClick={() => setShowModal(false)}>
                <X className="ep-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="ep-modal-form">
              <div className="ep-form-group">
                <label className="ep-form-label">
                  Employer Name <span className="ep-form-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="ep-form-input"
                  placeholder="Enter employer name"
                  autoFocus
                />
              </div>

              <div className="ep-form-grid">
                <div className="ep-form-group">
                  <label className="ep-form-label">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    className="ep-form-select"
                  >
                    <option value="">Select industry</option>
                    {industries.filter(i => i.value !== 'all').map(i => (
                      <option key={i.value} value={i.value}>{i.label}</option>
                    ))}
                  </select>
                </div>
                <div className="ep-form-group">
                  <label className="ep-form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="ep-form-select"
                  >
                    {statuses.filter(s => s.value !== 'all').map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ep-form-group">
                <label className="ep-form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="ep-form-textarea"
                  rows="2"
                  placeholder="Brief description of the employer"
                />
              </div>

              <div className="ep-form-grid">
                <div className="ep-form-group">
                  <label className="ep-form-label">Company Size</label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => handleChange('companySize', e.target.value)}
                    className="ep-form-select"
                  >
                    <option value="">Select size</option>
                    {companySizes.filter(s => s.value !== 'all').map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="ep-form-group">
                  <label className="ep-form-label">Founded Year</label>
                  <input
                    type="number"
                    value={formData.foundedYear}
                    onChange={(e) => handleChange('foundedYear', e.target.value)}
                    className="ep-form-input"
                    placeholder="e.g., 1998"
                  />
                </div>
              </div>

              <div className="ep-form-section">
                <h4 className="ep-form-section-title">Contact Person</h4>
                <div className="ep-form-grid">
                  <div className="ep-form-group">
                    <label className="ep-form-label">Name</label>
                    <input
                      type="text"
                      value={formData.contactPerson.name}
                      onChange={(e) => handleChange('contactPerson.name', e.target.value)}
                      className="ep-form-input"
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="ep-form-group">
                    <label className="ep-form-label">Position</label>
                    <input
                      type="text"
                      value={formData.contactPerson.position}
                      onChange={(e) => handleChange('contactPerson.position', e.target.value)}
                      className="ep-form-input"
                      placeholder="Position/Title"
                    />
                  </div>
                </div>
                <div className="ep-form-grid">
                  <div className="ep-form-group">
                    <label className="ep-form-label">Email</label>
                    <input
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) => handleChange('contactPerson.email', e.target.value)}
                      className="ep-form-input"
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="ep-form-group">
                    <label className="ep-form-label">Phone</label>
                    <input
                      type="text"
                      value={formData.contactPerson.phone}
                      onChange={(e) => handleChange('contactPerson.phone', e.target.value)}
                      className="ep-form-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="ep-form-grid">
                <div className="ep-form-group">
                  <label className="ep-form-label">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="ep-form-input"
                    placeholder="https://company.com"
                  />
                </div>
                <div className="ep-form-group">
                  <label className="ep-form-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="ep-form-input"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="ep-form-grid">
                <div className="ep-form-group">
                  <label className="ep-form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="ep-form-input"
                    placeholder="partnerships@company.com"
                  />
                </div>
                <div className="ep-form-group">
                  <label className="ep-form-label">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="ep-form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="ep-form-section">
                <h4 className="ep-form-section-title">Benefits & Perks</h4>
                <div className="ep-form-group">
                  <div className="ep-form-benefit-input">
                    <input
                      type="text"
                      id="benefitInput"
                      placeholder="Enter benefit (e.g., Health Insurance)"
                      className="ep-form-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleBenefitAdd(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="ep-form-benefit-add"
                      onClick={() => {
                        const input = document.getElementById('benefitInput');
                        handleBenefitAdd(input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="ep-btn-icon" />
                    </button>
                  </div>
                </div>
                {formData.benefits.length > 0 && (
                  <div className="ep-form-benefits">
                    {formData.benefits.map((benefit, idx) => (
                      <span key={idx} className="ep-form-benefit">
                        <Star className="ep-form-benefit-icon" />
                        {benefit}
                        <button
                          type="button"
                          onClick={() => handleBenefitRemove(idx)}
                          className="ep-form-benefit-remove"
                        >
                          <X className="ep-form-benefit-remove-icon" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="ep-form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="ep-form-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ep-form-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="ep-form-spinner"></div>
                      {editingEmployer ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="ep-btn-icon" />
                      {editingEmployer ? 'Update Employer' : 'Add Employer'}
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
        .ep-container {
          padding: 20px 24px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: epFadeIn 0.4s ease;
        }

        @keyframes epFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .ep-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .ep-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #059669;
          border-radius: 50%;
          animation: epSpin 0.8s linear infinite;
        }

        .ep-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes epSpin {
          to { transform: rotate(360deg); }
        }

        .ep-spin {
          animation: epSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .ep-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .ep-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ep-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ep-title-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #059669, #047857);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
        }

        .ep-title-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .ep-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .ep-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .ep-count {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 14px;
          border-radius: 12px;
        }

        .ep-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .ep-icon-btn {
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

        .ep-icon-btn:hover {
          background: #f1f5f9;
        }

        .ep-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .ep-btn-icon {
          width: 16px;
          height: 16px;
        }

        .ep-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #059669, #047857);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
        }

        .ep-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
        }

        /* ============================================
           STATS
           ============================================ */
        .ep-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .ep-stat-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s ease;
        }

        .ep-stat-card:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .ep-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ep-stat-total { background: #d1fae5; }
        .ep-stat-active { background: #d1fae5; }
        .ep-stat-jobs { background: #dbeafe; }
        .ep-stat-interested { background: #fef3c7; }

        .ep-stat-svg {
          width: 20px;
          height: 20px;
        }

        .ep-stat-total .ep-stat-svg { color: #059669; }
        .ep-stat-active .ep-stat-svg { color: #059669; }
        .ep-stat-jobs .ep-stat-svg { color: #2563eb; }
        .ep-stat-interested .ep-stat-svg { color: #d97706; }

        .ep-stat-info {
          display: flex;
          flex-direction: column;
        }

        .ep-stat-value {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .ep-stat-label {
          font-size: 13px;
          color: #64748b;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .ep-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .ep-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .ep-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .ep-search-input {
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

        .ep-search-input:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .ep-search-clear {
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

        .ep-search-clear:hover {
          background: #f1f5f9;
        }

        .ep-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .ep-filter-select {
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

        .ep-filter-select:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        /* ============================================
           GRID
           ============================================ */
        .ep-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .ep-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          animation: epSlideUp 0.4s ease both;
        }

        .ep-card:nth-child(1) { animation-delay: 0.05s; }
        .ep-card:nth-child(2) { animation-delay: 0.1s; }
        .ep-card:nth-child(3) { animation-delay: 0.15s; }

        @keyframes epSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ep-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: #d1d5db;
        }

        .ep-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .ep-card-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .ep-card-icon {
          width: 44px;
          height: 44px;
          background: #d1fae5;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ep-card-icon-svg {
          width: 22px;
          height: 22px;
          color: #059669;
        }

        .ep-card-info {
          flex: 1;
          min-width: 0;
        }

        .ep-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ep-card-tags {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
          flex-wrap: wrap;
        }

        .ep-card-industry {
          font-size: 11px;
          font-weight: 500;
          padding: 1px 10px;
          border-radius: 9999px;
        }

        .ep-industry-tech { background: #dbeafe; color: #1d4ed8; }
        .ep-industry-health { background: #d1fae5; color: #065f46; }
        .ep-industry-finance { background: #fef3c7; color: #92400e; }
        .ep-industry-education { background: #f3e8ff; color: #6d28d9; }
        .ep-industry-ecommerce { background: #fce7f3; color: #9d174d; }
        .ep-industry-manufacturing { background: #ffedd5; color: #9a3412; }
        .ep-industry-retail { background: #fee2e2; color: #991b1b; }
        .ep-industry-realestate { background: #ccfbf1; color: #0f766e; }
        .ep-industry-hospitality { background: #fef3c7; color: #92400e; }
        .ep-industry-media { background: #f3e8ff; color: #6d28d9; }
        .ep-industry-default { background: #f1f5f9; color: #475569; }

        .ep-card-size {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;
          color: #64748b;
        }

        .ep-card-size-icon {
          width: 12px;
          height: 12px;
        }

        .ep-card-status {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        .ep-status-active { background: #d1fae5; color: #065f46; }
        .ep-status-onboarded { background: #dbeafe; color: #1d4ed8; }
        .ep-status-interested { background: #fef3c7; color: #92400e; }
        .ep-status-negotiating { background: #f3e8ff; color: #6d28d9; }
        .ep-status-prospect { background: #f1f5f9; color: #475569; }
        .ep-status-inactive { background: #fee2e2; color: #991b1b; }
        .ep-status-default { background: #f1f5f9; color: #475569; }

        .ep-status-icon {
          width: 14px;
          height: 14px;
        }

        .ep-icon-green { color: #22c55e; }
        .ep-icon-blue { color: #3b82f6; }
        .ep-icon-yellow { color: #f59e0b; }
        .ep-icon-purple { color: #8b5cf6; }
        .ep-icon-red { color: #ef4444; }
        .ep-icon-gray { color: #94a3b8; }

        .ep-card-desc {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ep-card-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .ep-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .ep-badge-blue { background: #dbeafe; color: #1d4ed8; }
        .ep-badge-purple { background: #f3e8ff; color: #6d28d9; }
        .ep-badge-green { background: #d1fae5; color: #065f46; }
        .ep-badge-gray { background: #f1f5f9; color: #475569; }

        .ep-badge-icon {
          width: 12px;
          height: 12px;
        }

        .ep-card-contact {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
          font-size: 13px;
          color: #475569;
        }

        .ep-contact-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .ep-contact-text {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
        }

        .ep-contact-separator {
          color: #d1d5db;
          margin: 0 4px;
        }

        .ep-contact-position {
          font-size: 12px;
          color: #64748b;
        }

        .ep-card-benefits {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }

        .ep-benefit-label {
          font-size: 12px;
          color: #94a3b8;
        }

        .ep-benefit-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .ep-benefit-tag {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;
          padding: 2px 8px;
          background: #f1f5f9;
          color: #475569;
          border-radius: 4px;
        }

        .ep-benefit-tag-icon {
          width: 10px;
          height: 10px;
          color: #f59e0b;
        }

        .ep-benefit-more {
          font-size: 11px;
          color: #94a3b8;
        }

        .ep-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .ep-card-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #64748b;
        }

        .ep-assignee-label {
          color: #94a3b8;
        }

        .ep-assignee-name {
          font-weight: 500;
          color: #0f172a;
        }

        .ep-card-actions {
          display: flex;
          gap: 4px;
        }

        .ep-action-btn {
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

        .ep-action-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .ep-action-view:hover {
          background: #eff6ff;
          color: #3b82f6;
        }

        .ep-action-edit:hover {
          background: #ecfdf5;
          color: #22c55e;
        }

        .ep-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .ep-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .ep-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .ep-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #d1fae5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .ep-empty-icon {
          width: 36px;
          height: 36px;
          color: #059669;
        }

        .ep-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .ep-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .ep-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #059669, #047857);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
        }

        .ep-empty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.35);
        }

        /* ============================================
           MODAL
           ============================================ */
        .ep-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: epFadeIn 0.3s ease;
        }

        .ep-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: epModalIn 0.3s ease;
        }

        .ep-modal-lg {
          max-width: 680px;
        }

        @keyframes epModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .ep-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .ep-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .ep-modal-icon-wrapper {
          width: 44px;
          height: 44px;
          background: #d1fae5;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ep-modal-icon {
          width: 22px;
          height: 22px;
          color: #059669;
        }

        .ep-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .ep-modal-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .ep-modal-close {
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

        .ep-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .ep-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        .ep-modal-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ep-modal-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ep-modal-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .ep-modal-text {
          font-size: 14px;
          color: #0f172a;
          margin: 0;
        }

        .ep-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .ep-modal-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ep-modal-value {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
          margin: 0;
        }

        .ep-modal-status {
          font-size: 13px;
          font-weight: 500;
          padding: 2px 12px;
          border-radius: 12px;
          display: inline-block;
          width: fit-content;
        }

        .ep-modal-contact {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
        }

        .ep-modal-contact-name {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .ep-modal-contact-position {
          font-size: 13px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .ep-modal-contact-email,
        .ep-modal-contact-phone {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #0f172a;
          margin: 4px 0 0 0;
        }

        .ep-modal-contact-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .ep-modal-benefits {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .ep-modal-benefit {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          background: #f1f5f9;
          border-radius: 6px;
          font-size: 13px;
          color: #475569;
        }

        .ep-modal-benefit-icon {
          width: 12px;
          height: 12px;
          color: #f59e0b;
        }

        .ep-modal-jobs {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ep-modal-job {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .ep-modal-job-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ep-modal-job-title {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .ep-modal-job-status {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .ep-job-live { background: #d1fae5; color: #065f46; }
        .ep-job-pending { background: #fef3c7; color: #92400e; }
        .ep-job-closed { background: #fee2e2; color: #991b1b; }
        .ep-job-draft { background: #f1f5f9; color: #475569; }
        .ep-job-default { background: #f1f5f9; color: #475569; }

        .ep-modal-job-type {
          font-size: 12px;
          color: #94a3b8;
        }

        .ep-modal-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #059669;
          text-decoration: none;
          font-size: 14px;
        }

        .ep-modal-link:hover {
          text-decoration: underline;
        }

        .ep-modal-link-icon {
          width: 16px;
          height: 16px;
        }

        .ep-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
        }

        .ep-modal-cancel {
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

        .ep-modal-cancel:hover {
          background: #f1f5f9;
        }

        .ep-modal-edit {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #059669, #047857);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
        }

        .ep-modal-edit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.35);
        }

        /* ============================================
           FORM
           ============================================ */
        .ep-modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ep-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ep-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .ep-form-required {
          color: #ef4444;
        }

        .ep-form-input,
        .ep-form-select,
        .ep-form-textarea {
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

        .ep-form-input:focus,
        .ep-form-select:focus,
        .ep-form-textarea:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .ep-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .ep-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .ep-form-section {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }

        .ep-form-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 12px 0;
        }

        .ep-form-benefit-input {
          display: flex;
          gap: 8px;
        }

        .ep-form-benefit-input .ep-form-input {
          flex: 1;
        }

        .ep-form-benefit-add {
          padding: 10px 14px;
          background: #059669;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }

        .ep-form-benefit-add:hover {
          background: #047857;
        }

        .ep-form-benefits {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .ep-form-benefit {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #d1fae5;
          color: #065f46;
          border-radius: 6px;
          font-size: 13px;
        }

        .ep-form-benefit-icon {
          width: 12px;
          height: 12px;
          color: #f59e0b;
        }

        .ep-form-benefit-remove {
          display: flex;
          align-items: center;
          padding: 2px;
          background: none;
          border: none;
          color: #059669;
          cursor: pointer;
          border-radius: 4px;
        }

        .ep-form-benefit-remove:hover {
          background: rgba(5, 150, 105, 0.1);
        }

        .ep-form-benefit-remove-icon {
          width: 14px;
          height: 14px;
        }

        .ep-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .ep-form-cancel {
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

        .ep-form-cancel:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .ep-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ep-form-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #059669, #047857);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
        }

        .ep-form-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.35);
        }

        .ep-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .ep-form-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: epSpin 0.8s linear infinite;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .ep-container {
            padding: 16px;
          }

          .ep-header {
            flex-direction: column;
            align-items: stretch;
          }

          .ep-header-right {
            flex-wrap: wrap;
          }

          .ep-add-btn {
            flex: 1;
            justify-content: center;
          }

          .ep-filters {
            flex-direction: column;
          }

          .ep-search-wrapper {
            width: 100%;
          }

          .ep-filter-select {
            width: 100%;
          }

          .ep-grid {
            grid-template-columns: 1fr;
          }

          .ep-stats {
            grid-template-columns: 1fr 1fr;
          }

          .ep-title {
            font-size: 22px;
          }

          .ep-title-icon {
            width: 40px;
            height: 40px;
          }

          .ep-title-svg {
            width: 20px;
            height: 20px;
          }

          .ep-modal {
            margin: 16px;
            max-height: 95vh;
          }

          .ep-modal-grid {
            grid-template-columns: 1fr;
          }

          .ep-form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .ep-container {
            padding: 12px;
          }

          .ep-header-right {
            flex-direction: column;
          }

          .ep-add-btn {
            width: 100%;
          }

          .ep-icon-btn {
            align-self: flex-end;
          }

          .ep-title-wrapper {
            gap: 10px;
          }

          .ep-title {
            font-size: 20px;
          }

          .ep-subtitle {
            font-size: 13px;
          }

          .ep-stats {
            grid-template-columns: 1fr;
          }

          .ep-modal {
            padding: 0;
          }

          .ep-modal-header {
            padding: 16px 18px;
          }

          .ep-modal-body {
            padding: 16px 18px;
          }

          .ep-modal-footer {
            flex-direction: column;
          }

          .ep-modal-cancel,
          .ep-modal-edit {
            width: 100%;
            justify-content: center;
          }

          .ep-modal-form {
            padding: 18px;
          }

          .ep-form-actions {
            flex-direction: column;
          }

          .ep-form-cancel,
          .ep-form-submit {
            width: 100%;
            justify-content: center;
          }
        }

        /* Scrollbar */
        .ep-modal::-webkit-scrollbar {
          width: 6px;
        }

        .ep-modal::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }

        .ep-modal::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }

        .ep-modal::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default EmployerPartner;