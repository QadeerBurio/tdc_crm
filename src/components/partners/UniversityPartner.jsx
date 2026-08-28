// pages/partners/UniversityPartner.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap, Edit, Trash2, Eye, Plus,
  Search, Filter, Mail, Phone, MapPin,
  Users, Calendar, Star, BookOpen,
  CheckCircle, XCircle, AlertCircle, Clock,
  Download, RefreshCw, Building2, X,
  Globe, Award, TrendingUp, Link
} from 'lucide-react';
import toast from 'react-hot-toast';

const UniversityPartner = () => {
  const { token } = useAuth();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    country: 'all'
  });
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'prospect',
    description: '',
    location: {
      city: '',
      country: '',
      address: ''
    },
    contactPerson: {
      name: '',
      email: '',
      phone: '',
      position: ''
    },
    website: '',
    email: '',
    phone: '',
    studentCount: '',
    departments: [],
    partnerships: [],
    establishedYear: '',
    accreditation: '',
    assignedTo: ''
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchUniversities();
  }, [search, filters]);

  const fetchUniversities = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.country !== 'all') params.append('country', filters.country);

      let data = [];
      try {
        const response = await fetch(
          `${API_URL}/partners/universities?${params.toString()}`,
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
        data = getMockUniversities();
        toast.info('Showing sample university data');
      }

      setUniversities(data);
    } catch (error) {
      console.error('Error fetching universities:', error);
      setUniversities(getMockUniversities());
      toast.error('Failed to load universities, showing sample data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockUniversities = () => {
    return [
      {
        _id: '1',
        name: 'Stanford University',
        type: 'private',
        status: 'active',
        description: 'Leading research university in Silicon Valley',
        location: {
          city: 'Stanford',
          country: 'United States',
          address: '450 Serra Mall, Stanford, CA 94305'
        },
        contactPerson: {
          name: 'Dr. Sarah Mitchell',
          email: 'sarah.mitchell@stanford.edu',
          phone: '+1 (650) 723-2300',
          position: 'Director of Partnerships'
        },
        website: 'https://stanford.edu',
        email: 'partnerships@stanford.edu',
        phone: '+1 (650) 723-2300',
        studentCount: 17000,
        departments: [
          { name: 'Computer Science' },
          { name: 'Engineering' },
          { name: 'Business' },
          { name: 'Medicine' }
        ],
        partnerships: [
          { type: 'research', startDate: '2020-01-01' },
          { type: 'exchange', startDate: '2021-06-01' }
        ],
        establishedYear: 1885,
        accreditation: 'WASC',
        assignedTo: { firstName: 'John', lastName: 'Doe' }
      },
      {
        _id: '2',
        name: 'University of Cambridge',
        type: 'public',
        status: 'onboarded',
        description: 'World-renowned university with rich history',
        location: {
          city: 'Cambridge',
          country: 'United Kingdom',
          address: 'The Old Schools, Trinity Ln, Cambridge CB2 1TN'
        },
        contactPerson: {
          name: 'Prof. James Anderson',
          email: 'james.anderson@cambridge.ac.uk',
          phone: '+44 1223 337733',
          position: 'Head of International Relations'
        },
        website: 'https://cambridge.ac.uk',
        email: 'partnerships@cambridge.ac.uk',
        phone: '+44 1223 337733',
        studentCount: 24000,
        departments: [
          { name: 'Natural Sciences' },
          { name: 'Humanities' },
          { name: 'Social Sciences' },
          { name: 'Engineering' }
        ],
        partnerships: [
          { type: 'research', startDate: '2019-09-01' },
          { type: 'academic', startDate: '2020-03-01' }
        ],
        establishedYear: 1209,
        accreditation: 'QS',
        assignedTo: { firstName: 'Sarah', lastName: 'Smith' }
      },
      {
        _id: '3',
        name: 'Harvard University',
        type: 'private',
        status: 'interested',
        description: 'Ivy League research university',
        location: {
          city: 'Cambridge',
          country: 'United States',
          address: 'Massachusetts Hall, Cambridge, MA 02138'
        },
        contactPerson: {
          name: 'Dr. Michael Roberts',
          email: 'michael.roberts@harvard.edu',
          phone: '+1 (617) 495-1000',
          position: 'Director of Strategic Partnerships'
        },
        website: 'https://harvard.edu',
        email: 'partnerships@harvard.edu',
        phone: '+1 (617) 495-1000',
        studentCount: 22000,
        departments: [
          { name: 'Law' },
          { name: 'Medicine' },
          { name: 'Business' },
          { name: 'Arts & Sciences' }
        ],
        partnerships: [
          { type: 'research', startDate: '2022-01-01' }
        ],
        establishedYear: 1636,
        accreditation: 'NEASC',
        assignedTo: { firstName: 'Mike', lastName: 'Johnson' }
      },
      {
        _id: '4',
        name: 'University of Melbourne',
        type: 'public',
        status: 'negotiating',
        description: 'Leading Australian university with global impact',
        location: {
          city: 'Melbourne',
          country: 'Australia',
          address: 'Parkville VIC 3010'
        },
        contactPerson: {
          name: 'Prof. Emma Williams',
          email: 'emma.williams@unimelb.edu.au',
          phone: '+61 3 9035 5511',
          position: 'International Partnerships Manager'
        },
        website: 'https://unimelb.edu.au',
        email: 'partnerships@unimelb.edu.au',
        phone: '+61 3 9035 5511',
        studentCount: 52000,
        departments: [
          { name: 'Sciences' },
          { name: 'Engineering' },
          { name: 'Medicine' },
          { name: 'Business & Economics' }
        ],
        partnerships: [],
        establishedYear: 1853,
        accreditation: 'TEQSA',
        assignedTo: { firstName: 'Emily', lastName: 'Brown' }
      },
      {
        _id: '5',
        name: 'National University of Singapore',
        type: 'international',
        status: 'prospect',
        description: 'Asia\'s top university for research and innovation',
        location: {
          city: 'Singapore',
          country: 'Singapore',
          address: '21 Lower Kent Ridge Rd, Singapore 119077'
        },
        contactPerson: {
          name: 'Dr. Tan Wei Ming',
          email: 'wei.ming.tan@nus.edu.sg',
          phone: '+65 6516 6666',
          position: 'Director of Global Partnerships'
        },
        website: 'https://nus.edu.sg',
        email: 'partnerships@nus.edu.sg',
        phone: '+65 6516 6666',
        studentCount: 38000,
        departments: [
          { name: 'Engineering' },
          { name: 'Computing' },
          { name: 'Business' },
          { name: 'Medicine' }
        ],
        partnerships: [
          { type: 'research', startDate: '2023-01-01' }
        ],
        establishedYear: 1905,
        accreditation: 'AACSB',
        assignedTo: { firstName: 'David', lastName: 'Lee' }
      }
    ];
  };

  const handleRefresh = () => {
    fetchUniversities(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('University name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingUniversity 
        ? `${API_URL}/partners/universities/${editingUniversity._id}`
        : `${API_URL}/partners/universities`;
      
      const method = editingUniversity ? 'PUT' : 'POST';

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
          toast.success(editingUniversity ? 'University updated successfully!' : 'University added successfully!');
          setShowModal(false);
          setEditingUniversity(null);
          resetForm();
          await fetchUniversities(true);
        }
      } else {
        throw new Error('Failed to save university');
      }
    } catch (error) {
      console.error('Error saving university:', error);
      toast.error(error.message || 'Failed to save university');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this university?')) return;

    try {
      const response = await fetch(
        `${API_URL}/partners/universities/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success('University deleted successfully');
        await fetchUniversities(true);
      } else {
        throw new Error('Failed to delete university');
      }
    } catch (error) {
      console.error('Error deleting university:', error);
      toast.error('Failed to delete university');
    }
  };

  const openModal = (university = null) => {
    if (university) {
      setEditingUniversity(university);
      setFormData({
        name: university.name || '',
        type: university.type || '',
        status: university.status || 'prospect',
        description: university.description || '',
        location: {
          city: university.location?.city || '',
          country: university.location?.country || '',
          address: university.location?.address || ''
        },
        contactPerson: {
          name: university.contactPerson?.name || '',
          email: university.contactPerson?.email || '',
          phone: university.contactPerson?.phone || '',
          position: university.contactPerson?.position || ''
        },
        website: university.website || '',
        email: university.email || '',
        phone: university.phone || '',
        studentCount: university.studentCount || '',
        departments: university.departments || [],
        partnerships: university.partnerships || [],
        establishedYear: university.establishedYear || '',
        accreditation: university.accreditation || '',
        assignedTo: university.assignedTo?._id || university.assignedTo || ''
      });
    } else {
      setEditingUniversity(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      status: 'prospect',
      description: '',
      location: {
        city: '',
        country: '',
        address: ''
      },
      contactPerson: {
        name: '',
        email: '',
        phone: '',
        position: ''
      },
      website: '',
      email: '',
      phone: '',
      studentCount: '',
      departments: [],
      partnerships: [],
      establishedYear: '',
      accreditation: '',
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

  const handleDepartmentAdd = (department) => {
    if (department.trim()) {
      setFormData(prev => ({
        ...prev,
        departments: [...prev.departments, { name: department.trim() }]
      }));
    }
  };

  const handleDepartmentRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'up-status-active',
      'onboarded': 'up-status-onboarded',
      'interested': 'up-status-interested',
      'negotiating': 'up-status-negotiating',
      'prospect': 'up-status-prospect',
      'inactive': 'up-status-inactive'
    };
    return colors[status] || 'up-status-default';
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
    if (status === 'active') return <CheckCircle className="up-status-icon up-icon-green" />;
    if (status === 'onboarded') return <CheckCircle className="up-status-icon up-icon-blue" />;
    if (status === 'interested') return <Clock className="up-status-icon up-icon-yellow" />;
    if (status === 'negotiating') return <Clock className="up-status-icon up-icon-purple" />;
    if (status === 'inactive') return <XCircle className="up-status-icon up-icon-red" />;
    return <AlertCircle className="up-status-icon up-icon-gray" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      'public': 'up-type-public',
      'private': 'up-type-private',
      'international': 'up-type-international'
    };
    return colors[type] || 'up-type-default';
  };

  const getTypeLabel = (type) => {
    const labels = {
      'public': 'Public',
      'private': 'Private',
      'international': 'International'
    };
    return labels[type] || type || 'University';
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

  const universityTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'international', label: 'International' }
  ];

  const countries = [
    { value: 'all', label: 'All Countries' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Canada', label: 'Canada' }
  ];

  if (loading) {
    return (
      <div className="up-loading">
        <div className="up-spinner"></div>
        <p className="up-loading-text">Loading universities...</p>
      </div>
    );
  }

  return (
    <div className="up-container">
      {/* Header */}
      <div className="up-header">
        <div className="up-header-left">
          <div className="up-title-wrapper">
            <div className="up-title-icon">
              <GraduationCap className="up-title-svg" />
            </div>
            <div>
              <h3 className="up-title">University Partners</h3>
              <p className="up-subtitle">Manage university partnerships and collaborations</p>
            </div>
          </div>
          <span className="up-count">{universities.length} universities</span>
        </div>
        <div className="up-header-right">
          <button className="up-icon-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`up-refresh-icon ${refreshing ? 'up-spin' : ''}`} />
          </button>
          <button className="up-icon-btn">
            <Download className="up-btn-icon" />
          </button>
          <button 
            onClick={() => openModal()}
            className="up-add-btn"
          >
            <Plus className="up-btn-icon" />
            Add University
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="up-filters">
        <div className="up-search-wrapper">
          <Search className="up-search-icon" />
          <input
            type="text"
            placeholder="Search universities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="up-search-input"
          />
          {search && (
            <button className="up-search-clear" onClick={() => setSearch('')}>
              <X className="up-search-clear-icon" />
            </button>
          )}
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="up-filter-select"
        >
          {statuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          className="up-filter-select"
        >
          {universityTypes.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          value={filters.country}
          onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
          className="up-filter-select"
        >
          {countries.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="up-stats">
        <div className="up-stat-card">
          <div className="up-stat-icon up-stat-total">
            <GraduationCap className="up-stat-svg" />
          </div>
          <div className="up-stat-info">
            <span className="up-stat-value">{universities.length}</span>
            <span className="up-stat-label">Total Universities</span>
          </div>
        </div>
        <div className="up-stat-card">
          <div className="up-stat-icon up-stat-active">
            <CheckCircle className="up-stat-svg" />
          </div>
          <div className="up-stat-info">
            <span className="up-stat-value">{universities.filter(u => u.status === 'active').length}</span>
            <span className="up-stat-label">Active Partners</span>
          </div>
        </div>
        <div className="up-stat-card">
          <div className="up-stat-icon up-stat-onboarded">
            <Users className="up-stat-svg" />
          </div>
          <div className="up-stat-info">
            <span className="up-stat-value">{universities.filter(u => u.status === 'onboarded').length}</span>
            <span className="up-stat-label">Onboarded</span>
          </div>
        </div>
        <div className="up-stat-card">
          <div className="up-stat-icon up-stat-interested">
            <TrendingUp className="up-stat-svg" />
          </div>
          <div className="up-stat-info">
            <span className="up-stat-value">{universities.filter(u => u.status === 'interested' || u.status === 'negotiating').length}</span>
            <span className="up-stat-label">In Progress</span>
          </div>
        </div>
      </div>

      {/* Universities Grid */}
      <div className="up-grid">
        {universities.map((university) => (
          <div 
            key={university._id} 
            className="up-card"
            onClick={() => {
              setSelectedUniversity(university);
              setShowDetails(true);
            }}
          >
            <div className="up-card-header">
              <div className="up-card-left">
                <div className="up-card-icon">
                  <GraduationCap className="up-card-icon-svg" />
                </div>
                <div className="up-card-info">
                  <h4 className="up-card-title">{university.name}</h4>
                  <div className="up-card-tags">
                    <span className={`up-card-type ${getTypeColor(university.type)}`}>
                      {getTypeLabel(university.type)}
                    </span>
                    {university.location?.country && (
                      <span className="up-card-country">
                        <MapPin className="up-card-country-icon" />
                        {university.location.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className={`up-card-status ${getStatusColor(university.status)}`}>
                {getStatusLabel(university.status)}
              </span>
            </div>
            
            {university.description && (
              <p className="up-card-desc">{university.description}</p>
            )}
            
            <div className="up-card-badges">
              {university.establishedYear && (
                <span className="up-badge up-badge-blue">
                  <Calendar className="up-badge-icon" />
                  Est. {university.establishedYear}
                </span>
              )}
              {university.studentCount && (
                <span className="up-badge up-badge-purple">
                  <Users className="up-badge-icon" />
                  {university.studentCount.toLocaleString()} students
                </span>
              )}
              {university.accreditation && (
                <span className="up-badge up-badge-green">
                  <Award className="up-badge-icon" />
                  {university.accreditation}
                </span>
              )}
            </div>
            
            {university.departments && university.departments.length > 0 && (
              <div className="up-card-departments">
                <span className="up-department-label">Departments:</span>
                <div className="up-department-tags">
                  {university.departments.slice(0, 3).map((dept, idx) => (
                    <span key={idx} className="up-department-tag">
                      {dept.name}
                    </span>
                  ))}
                  {university.departments.length > 3 && (
                    <span className="up-department-more">
                      +{university.departments.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {university.contactPerson && university.contactPerson.name && (
              <div className="up-card-contact">
                <Users className="up-contact-icon" />
                <span className="up-contact-text">{university.contactPerson.name}</span>
                {university.contactPerson.email && (
                  <>
                    <span className="up-contact-separator">•</span>
                    <span className="up-contact-email">{university.contactPerson.email}</span>
                  </>
                )}
              </div>
            )}

            {university.website && (
              <div className="up-card-website">
                <Globe className="up-website-icon" />
                <span className="up-website-text">{university.website}</span>
              </div>
            )}
            
            <div className="up-card-footer">
              <div className="up-card-assignee">
                <span className="up-assignee-label">Assigned:</span>
                <span className="up-assignee-name">
                  {university.assignedTo?.firstName} {university.assignedTo?.lastName || 'Unassigned'}
                </span>
              </div>
              <div className="up-card-actions">
                <button 
                  className="up-action-btn up-action-view"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUniversity(university);
                    setShowDetails(true);
                  }}
                  title="View"
                >
                  <Eye className="up-action-icon" />
                </button>
                <button 
                  className="up-action-btn up-action-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(university);
                  }}
                  title="Edit"
                >
                  <Edit className="up-action-icon" />
                </button>
                <button 
                  className="up-action-btn up-action-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(university._id);
                  }}
                  title="Delete"
                >
                  <Trash2 className="up-action-icon" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {universities.length === 0 && (
        <div className="up-empty">
          <div className="up-empty-icon-wrapper">
            <GraduationCap className="up-empty-icon" />
          </div>
          <h3 className="up-empty-title">No universities found</h3>
          <p className="up-empty-subtitle">Start by adding your first university partner</p>
          <button className="up-empty-btn" onClick={() => openModal()}>
            <Plus className="up-btn-icon" />
            Add University
          </button>
        </div>
      )}

      {/* University Details Modal */}
      {showDetails && selectedUniversity && (
        <div className="up-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="up-modal up-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="up-modal-header">
              <div className="up-modal-title-wrapper">
                <div className="up-modal-icon-wrapper">
                  <GraduationCap className="up-modal-icon" />
                </div>
                <div>
                  <h2 className="up-modal-title">{selectedUniversity.name}</h2>
                  <p className="up-modal-subtitle">{getTypeLabel(selectedUniversity.type)} • {selectedUniversity.location?.country || 'Location TBD'}</p>
                </div>
              </div>
              <button className="up-modal-close" onClick={() => setShowDetails(false)}>
                <X className="up-modal-close-icon" />
              </button>
            </div>
            
            <div className="up-modal-body">
              <div className="up-modal-section">
                <h4 className="up-modal-label">Description</h4>
                <p className="up-modal-text">{selectedUniversity.description || 'No description provided'}</p>
              </div>
              
              <div className="up-modal-grid">
                <div className="up-modal-item">
                  <h4 className="up-modal-label">Status</h4>
                  <span className={`up-modal-status ${getStatusColor(selectedUniversity.status)}`}>
                    {getStatusLabel(selectedUniversity.status)}
                  </span>
                </div>
                <div className="up-modal-item">
                  <h4 className="up-modal-label">Type</h4>
                  <p className="up-modal-value">{getTypeLabel(selectedUniversity.type)}</p>
                </div>
                <div className="up-modal-item">
                  <h4 className="up-modal-label">Students</h4>
                  <p className="up-modal-value">{selectedUniversity.studentCount?.toLocaleString() || 'N/A'}</p>
                </div>
                <div className="up-modal-item">
                  <h4 className="up-modal-label">Established</h4>
                  <p className="up-modal-value">{selectedUniversity.establishedYear || 'N/A'}</p>
                </div>
              </div>

              {selectedUniversity.location && (
                <div className="up-modal-section">
                  <h4 className="up-modal-label">Location</h4>
                  <div className="up-modal-location">
                    {selectedUniversity.location.address && (
                      <p>{selectedUniversity.location.address}</p>
                    )}
                    <p>
                      {selectedUniversity.location.city && `${selectedUniversity.location.city}, `}
                      {selectedUniversity.location.country}
                    </p>
                  </div>
                </div>
              )}
              
              {selectedUniversity.contactPerson && (selectedUniversity.contactPerson.name || selectedUniversity.contactPerson.email) && (
                <div className="up-modal-section">
                  <h4 className="up-modal-label">Contact Person</h4>
                  <div className="up-modal-contact">
                    {selectedUniversity.contactPerson.name && (
                      <p className="up-modal-contact-name">{selectedUniversity.contactPerson.name}</p>
                    )}
                    {selectedUniversity.contactPerson.position && (
                      <p className="up-modal-contact-position">{selectedUniversity.contactPerson.position}</p>
                    )}
                    {selectedUniversity.contactPerson.email && (
                      <p className="up-modal-contact-email">
                        <Mail className="up-modal-contact-icon" />
                        {selectedUniversity.contactPerson.email}
                      </p>
                    )}
                    {selectedUniversity.contactPerson.phone && (
                      <p className="up-modal-contact-phone">
                        <Phone className="up-modal-contact-icon" />
                        {selectedUniversity.contactPerson.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedUniversity.departments && selectedUniversity.departments.length > 0 && (
                <div className="up-modal-section">
                  <h4 className="up-modal-label">Departments</h4>
                  <div className="up-modal-departments">
                    {selectedUniversity.departments.map((dept, idx) => (
                      <span key={idx} className="up-modal-department">
                        {dept.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedUniversity.partnerships && selectedUniversity.partnerships.length > 0 && (
                <div className="up-modal-section">
                  <h4 className="up-modal-label">Partnerships</h4>
                  <div className="up-modal-partnerships">
                    {selectedUniversity.partnerships.map((partnership, idx) => (
                      <div key={idx} className="up-modal-partnership">
                        <span className="up-modal-partnership-type">{partnership.type}</span>
                        <span className="up-modal-partnership-date">
                          Since {new Date(partnership.startDate).getFullYear()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="up-modal-footer">
              <button
                onClick={() => setShowDetails(false)}
                className="up-modal-cancel"
              >
                Close
              </button>
              <button 
                className="up-modal-edit"
                onClick={() => {
                  setShowDetails(false);
                  openModal(selectedUniversity);
                }}
              >
                <Edit className="up-btn-icon" />
                Edit University
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="up-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="up-modal up-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="up-modal-header">
              <div className="up-modal-title-wrapper">
                <GraduationCap className="up-modal-icon" />
                <h2 className="up-modal-title">
                  {editingUniversity ? 'Edit University' : 'Add New University'}
                </h2>
              </div>
              <button className="up-modal-close" onClick={() => setShowModal(false)}>
                <X className="up-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="up-modal-form">
              <div className="up-form-group">
                <label className="up-form-label">
                  University Name <span className="up-form-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="up-form-input"
                  placeholder="Enter university name"
                  autoFocus
                />
              </div>

              <div className="up-form-grid">
                <div className="up-form-group">
                  <label className="up-form-label">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="up-form-select"
                  >
                    <option value="">Select type</option>
                    {universityTypes.filter(t => t.value !== 'all').map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="up-form-group">
                  <label className="up-form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="up-form-select"
                  >
                    {statuses.filter(s => s.value !== 'all').map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="up-form-group">
                <label className="up-form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="up-form-textarea"
                  rows="2"
                  placeholder="Brief description of the university"
                />
              </div>

              <div className="up-form-section">
                <h4 className="up-form-section-title">Location</h4>
                <div className="up-form-grid">
                  <div className="up-form-group">
                    <label className="up-form-label">City</label>
                    <input
                      type="text"
                      value={formData.location.city}
                      onChange={(e) => handleChange('location.city', e.target.value)}
                      className="up-form-input"
                      placeholder="City"
                    />
                  </div>
                  <div className="up-form-group">
                    <label className="up-form-label">Country</label>
                    <select
                      value={formData.location.country}
                      onChange={(e) => handleChange('location.country', e.target.value)}
                      className="up-form-select"
                    >
                      <option value="">Select country</option>
                      {countries.filter(c => c.value !== 'all').map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="up-form-group">
                  <label className="up-form-label">Address</label>
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) => handleChange('location.address', e.target.value)}
                    className="up-form-input"
                    placeholder="Full address"
                  />
                </div>
              </div>

              <div className="up-form-section">
                <h4 className="up-form-section-title">Contact Person</h4>
                <div className="up-form-grid">
                  <div className="up-form-group">
                    <label className="up-form-label">Name</label>
                    <input
                      type="text"
                      value={formData.contactPerson.name}
                      onChange={(e) => handleChange('contactPerson.name', e.target.value)}
                      className="up-form-input"
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="up-form-group">
                    <label className="up-form-label">Position</label>
                    <input
                      type="text"
                      value={formData.contactPerson.position}
                      onChange={(e) => handleChange('contactPerson.position', e.target.value)}
                      className="up-form-input"
                      placeholder="Position/Title"
                    />
                  </div>
                </div>
                <div className="up-form-grid">
                  <div className="up-form-group">
                    <label className="up-form-label">Email</label>
                    <input
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) => handleChange('contactPerson.email', e.target.value)}
                      className="up-form-input"
                      placeholder="contact@university.edu"
                    />
                  </div>
                  <div className="up-form-group">
                    <label className="up-form-label">Phone</label>
                    <input
                      type="text"
                      value={formData.contactPerson.phone}
                      onChange={(e) => handleChange('contactPerson.phone', e.target.value)}
                      className="up-form-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="up-form-grid">
                <div className="up-form-group">
                  <label className="up-form-label">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="up-form-input"
                    placeholder="https://university.edu"
                  />
                </div>
                <div className="up-form-group">
                  <label className="up-form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="up-form-input"
                    placeholder="partnerships@university.edu"
                  />
                </div>
              </div>

              <div className="up-form-grid">
                <div className="up-form-group">
                  <label className="up-form-label">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="up-form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="up-form-group">
                  <label className="up-form-label">Student Count</label>
                  <input
                    type="number"
                    value={formData.studentCount}
                    onChange={(e) => handleChange('studentCount', e.target.value)}
                    className="up-form-input"
                    placeholder="Number of students"
                  />
                </div>
              </div>

              <div className="up-form-grid">
                <div className="up-form-group">
                  <label className="up-form-label">Established Year</label>
                  <input
                    type="number"
                    value={formData.establishedYear}
                    onChange={(e) => handleChange('establishedYear', e.target.value)}
                    className="up-form-input"
                    placeholder="e.g., 1885"
                  />
                </div>
                <div className="up-form-group">
                  <label className="up-form-label">Accreditation</label>
                  <input
                    type="text"
                    value={formData.accreditation}
                    onChange={(e) => handleChange('accreditation', e.target.value)}
                    className="up-form-input"
                    placeholder="e.g., WASC"
                  />
                </div>
              </div>

              <div className="up-form-section">
                <h4 className="up-form-section-title">Departments</h4>
                <div className="up-form-group">
                  <div className="up-form-department-input">
                    <input
                      type="text"
                      id="departmentInput"
                      placeholder="Enter department name"
                      className="up-form-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleDepartmentAdd(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="up-form-department-add"
                      onClick={() => {
                        const input = document.getElementById('departmentInput');
                        handleDepartmentAdd(input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="up-btn-icon" />
                    </button>
                  </div>
                </div>
                {formData.departments.length > 0 && (
                  <div className="up-form-departments">
                    {formData.departments.map((dept, idx) => (
                      <span key={idx} className="up-form-department">
                        {dept.name}
                        <button
                          type="button"
                          onClick={() => handleDepartmentRemove(idx)}
                          className="up-form-department-remove"
                        >
                          <X className="up-form-department-remove-icon" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="up-form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="up-form-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="up-form-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="up-form-spinner"></div>
                      {editingUniversity ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="up-btn-icon" />
                      {editingUniversity ? 'Update University' : 'Add University'}
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
        .up-container {
          padding: 20px 24px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: upFadeIn 0.4s ease;
        }

        @keyframes upFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .up-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .up-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: upSpin 0.8s linear infinite;
        }

        .up-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes upSpin {
          to { transform: rotate(360deg); }
        }

        .up-spin {
          animation: upSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .up-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .up-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .up-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .up-title-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
        }

        .up-title-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .up-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .up-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .up-count {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 14px;
          border-radius: 12px;
        }

        .up-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .up-icon-btn {
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

        .up-icon-btn:hover {
          background: #f1f5f9;
        }

        .up-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .up-btn-icon {
          width: 16px;
          height: 16px;
        }

        .up-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
        }

        .up-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }

        /* ============================================
           STATS
           ============================================ */
        .up-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .up-stat-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s ease;
        }

        .up-stat-card:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .up-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .up-stat-total { background: #f3e8ff; }
        .up-stat-active { background: #d1fae5; }
        .up-stat-onboarded { background: #dbeafe; }
        .up-stat-interested { background: #fef3c7; }

        .up-stat-svg {
          width: 20px;
          height: 20px;
        }

        .up-stat-total .up-stat-svg { color: #7c3aed; }
        .up-stat-active .up-stat-svg { color: #059669; }
        .up-stat-onboarded .up-stat-svg { color: #2563eb; }
        .up-stat-interested .up-stat-svg { color: #d97706; }

        .up-stat-info {
          display: flex;
          flex-direction: column;
        }

        .up-stat-value {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .up-stat-label {
          font-size: 13px;
          color: #64748b;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .up-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .up-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .up-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .up-search-input {
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

        .up-search-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .up-search-clear {
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

        .up-search-clear:hover {
          background: #f1f5f9;
        }

        .up-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .up-filter-select {
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

        .up-filter-select:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        /* ============================================
           GRID
           ============================================ */
        .up-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .up-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          animation: upSlideUp 0.4s ease both;
        }

        .up-card:nth-child(1) { animation-delay: 0.05s; }
        .up-card:nth-child(2) { animation-delay: 0.1s; }
        .up-card:nth-child(3) { animation-delay: 0.15s; }

        @keyframes upSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .up-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: #d1d5db;
        }

        .up-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .up-card-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .up-card-icon {
          width: 44px;
          height: 44px;
          background: #f3e8ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .up-card-icon-svg {
          width: 22px;
          height: 22px;
          color: #8b5cf6;
        }

        .up-card-info {
          flex: 1;
          min-width: 0;
        }

        .up-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .up-card-tags {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
          flex-wrap: wrap;
        }

        .up-card-type {
          font-size: 11px;
          font-weight: 500;
          padding: 1px 10px;
          border-radius: 9999px;
        }

        .up-type-public { background: #dbeafe; color: #1d4ed8; }
        .up-type-private { background: #f3e8ff; color: #6d28d9; }
        .up-type-international { background: #d1fae5; color: #065f46; }
        .up-type-default { background: #f1f5f9; color: #475569; }

        .up-card-country {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;
          color: #64748b;
        }

        .up-card-country-icon {
          width: 12px;
          height: 12px;
        }

        .up-card-status {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        .up-status-active { background: #d1fae5; color: #065f46; }
        .up-status-onboarded { background: #dbeafe; color: #1d4ed8; }
        .up-status-interested { background: #fef3c7; color: #92400e; }
        .up-status-negotiating { background: #f3e8ff; color: #6d28d9; }
        .up-status-prospect { background: #f1f5f9; color: #475569; }
        .up-status-inactive { background: #fee2e2; color: #991b1b; }
        .up-status-default { background: #f1f5f9; color: #475569; }

        .up-status-icon {
          width: 16px;
          height: 16px;
        }

        .up-icon-green { color: #22c55e; }
        .up-icon-blue { color: #3b82f6; }
        .up-icon-yellow { color: #f59e0b; }
        .up-icon-purple { color: #8b5cf6; }
        .up-icon-red { color: #ef4444; }
        .up-icon-gray { color: #94a3b8; }

        .up-card-desc {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .up-card-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .up-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .up-badge-blue { background: #dbeafe; color: #1d4ed8; }
        .up-badge-purple { background: #f3e8ff; color: #6d28d9; }
        .up-badge-green { background: #d1fae5; color: #065f46; }
        .up-badge-gray { background: #f1f5f9; color: #475569; }

        .up-badge-icon {
          width: 12px;
          height: 12px;
        }

        .up-card-departments {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }

        .up-department-label {
          font-size: 12px;
          color: #94a3b8;
        }

        .up-department-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .up-department-tag {
          font-size: 11px;
          padding: 2px 8px;
          background: #f1f5f9;
          color: #475569;
          border-radius: 4px;
        }

        .up-department-more {
          font-size: 11px;
          color: #94a3b8;
        }

        .up-card-contact {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          font-size: 13px;
          color: #475569;
        }

        .up-contact-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .up-contact-text {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
        }

        .up-contact-separator {
          color: #d1d5db;
          margin: 0 4px;
        }

        .up-contact-email {
          color: #64748b;
        }

        .up-card-website {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 10px;
          font-size: 13px;
          color: #3b82f6;
        }

        .up-website-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .up-website-text {
          font-size: 13px;
          word-break: break-all;
        }

        .up-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .up-card-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #64748b;
        }

        .up-assignee-label {
          color: #94a3b8;
        }

        .up-assignee-name {
          font-weight: 500;
          color: #0f172a;
        }

        .up-card-actions {
          display: flex;
          gap: 4px;
        }

        .up-action-btn {
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

        .up-action-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .up-action-view:hover {
          background: #eff6ff;
          color: #3b82f6;
        }

        .up-action-edit:hover {
          background: #ecfdf5;
          color: #22c55e;
        }

        .up-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .up-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .up-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .up-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f3e8ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .up-empty-icon {
          width: 36px;
          height: 36px;
          color: #8b5cf6;
        }

        .up-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .up-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .up-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
        }

        .up-empty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
        }

        /* ============================================
           MODAL
           ============================================ */
        .up-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: upFadeIn 0.3s ease;
        }

        .up-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: upModalIn 0.3s ease;
        }

        .up-modal-lg {
          max-width: 680px;
        }

        @keyframes upModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .up-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .up-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .up-modal-icon-wrapper {
          width: 44px;
          height: 44px;
          background: #f3e8ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .up-modal-icon {
          width: 22px;
          height: 22px;
          color: #8b5cf6;
        }

        .up-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .up-modal-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .up-modal-close {
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

        .up-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .up-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        .up-modal-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .up-modal-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .up-modal-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .up-modal-text {
          font-size: 14px;
          color: #0f172a;
          margin: 0;
        }

        .up-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .up-modal-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .up-modal-value {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
          margin: 0;
        }

        .up-modal-status {
          font-size: 13px;
          font-weight: 500;
          padding: 2px 12px;
          border-radius: 12px;
          display: inline-block;
          width: fit-content;
        }

        .up-modal-location {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
        }

        .up-modal-location p {
          margin: 0;
          font-size: 14px;
          color: #0f172a;
        }

        .up-modal-location p:not(:last-child) {
          margin-bottom: 4px;
        }

        .up-modal-contact {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
        }

        .up-modal-contact-name {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .up-modal-contact-position {
          font-size: 13px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .up-modal-contact-email,
        .up-modal-contact-phone {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #0f172a;
          margin: 4px 0 0 0;
        }

        .up-modal-contact-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .up-modal-departments {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .up-modal-department {
          padding: 4px 12px;
          background: #f1f5f9;
          border-radius: 6px;
          font-size: 13px;
          color: #475569;
        }

        .up-modal-partnerships {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .up-modal-partnership {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .up-modal-partnership-type {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
          text-transform: capitalize;
        }

        .up-modal-partnership-date {
          font-size: 12px;
          color: #94a3b8;
        }

        .up-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
        }

        .up-modal-cancel {
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

        .up-modal-cancel:hover {
          background: #f1f5f9;
        }

        .up-modal-edit {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
        }

        .up-modal-edit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
        }

        /* ============================================
           FORM
           ============================================ */
        .up-modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .up-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .up-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .up-form-required {
          color: #ef4444;
        }

        .up-form-input,
        .up-form-select,
        .up-form-textarea {
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

        .up-form-input:focus,
        .up-form-select:focus,
        .up-form-textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .up-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .up-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .up-form-section {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }

        .up-form-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 12px 0;
        }

        .up-form-department-input {
          display: flex;
          gap: 8px;
        }

        .up-form-department-input .up-form-input {
          flex: 1;
        }

        .up-form-department-add {
          padding: 10px 14px;
          background: #8b5cf6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }

        .up-form-department-add:hover {
          background: #7c3aed;
        }

        .up-form-departments {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .up-form-department {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #f3e8ff;
          color: #6d28d9;
          border-radius: 6px;
          font-size: 13px;
        }

        .up-form-department-remove {
          display: flex;
          align-items: center;
          padding: 2px;
          background: none;
          border: none;
          color: #8b5cf6;
          cursor: pointer;
          border-radius: 4px;
        }

        .up-form-department-remove:hover {
          background: rgba(139, 92, 246, 0.1);
        }

        .up-form-department-remove-icon {
          width: 14px;
          height: 14px;
        }

        .up-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .up-form-cancel {
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

        .up-form-cancel:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .up-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .up-form-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
        }

        .up-form-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
        }

        .up-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .up-form-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: upSpin 0.8s linear infinite;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .up-container {
            padding: 16px;
          }

          .up-header {
            flex-direction: column;
            align-items: stretch;
          }

          .up-header-right {
            flex-wrap: wrap;
          }

          .up-add-btn {
            flex: 1;
            justify-content: center;
          }

          .up-filters {
            flex-direction: column;
          }

          .up-search-wrapper {
            width: 100%;
          }

          .up-filter-select {
            width: 100%;
          }

          .up-grid {
            grid-template-columns: 1fr;
          }

          .up-stats {
            grid-template-columns: 1fr 1fr;
          }

          .up-title {
            font-size: 22px;
          }

          .up-title-icon {
            width: 40px;
            height: 40px;
          }

          .up-title-svg {
            width: 20px;
            height: 20px;
          }

          .up-modal {
            margin: 16px;
            max-height: 95vh;
          }

          .up-modal-grid {
            grid-template-columns: 1fr;
          }

          .up-form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .up-container {
            padding: 12px;
          }

          .up-header-right {
            flex-direction: column;
          }

          .up-add-btn {
            width: 100%;
          }

          .up-icon-btn {
            align-self: flex-end;
          }

          .up-title-wrapper {
            gap: 10px;
          }

          .up-title {
            font-size: 20px;
          }

          .up-subtitle {
            font-size: 13px;
          }

          .up-stats {
            grid-template-columns: 1fr;
          }

          .up-modal {
            padding: 0;
          }

          .up-modal-header {
            padding: 16px 18px;
          }

          .up-modal-body {
            padding: 16px 18px;
          }

          .up-modal-footer {
            flex-direction: column;
          }

          .up-modal-cancel,
          .up-modal-edit {
            width: 100%;
            justify-content: center;
          }

          .up-modal-form {
            padding: 18px;
          }

          .up-form-actions {
            flex-direction: column;
          }

          .up-form-cancel,
          .up-form-submit {
            width: 100%;
            justify-content: center;
          }
        }

        /* Scrollbar */
        .up-modal::-webkit-scrollbar {
          width: 6px;
        }

        .up-modal::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }

        .up-modal::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }

        .up-modal::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default UniversityPartner;