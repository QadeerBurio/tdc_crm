// pages/partners/Universities.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, Edit, Trash2, GraduationCap,
  Filter, Download, Eye, MapPin, Users, Calendar,
  X, RefreshCw, Mail, Phone, Globe, Award,
  BookOpen, Star, Zap, Layers, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Universities = () => {
  const { token } = useAuth();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all' });
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'public',
    description: '',
    status: 'prospect',
    website: '',
    email: '',
    phone: '',
    location: {
      city: '',
      state: '',
      country: '',
      address: ''
    },
    studentCount: '',
    departments: [],
    partnerships: [],
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
    fetchUniversities();
  }, [search, filters]);

  const fetchUniversities = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.status !== 'all') params.append('status', filters.status);
      
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
        description: 'World-class research university in Silicon Valley',
        status: 'active',
        website: 'https://stanford.edu',
        email: 'partners@stanford.edu',
        phone: '+1 (650) 723-2300',
        location: {
          city: 'Stanford',
          state: 'California',
          country: 'USA',
          address: '450 Serra Mall, Stanford, CA 94305'
        },
        studentCount: 17000,
        departments: [
          { name: 'Computer Science' },
          { name: 'Engineering' },
          { name: 'Business' },
          { name: 'Medicine' }
        ],
        partnerships: [{ type: 'research' }, { type: 'internship' }],
        contactPerson: {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@stanford.edu',
          phone: '+1 (650) 723-4567',
          position: 'Director of Partnerships'
        },
        assignedTo: { firstName: 'John', lastName: 'Doe' }
      },
      {
        _id: '2',
        name: 'MIT',
        type: 'private',
        description: 'Leading institution in science and technology',
        status: 'onboarded',
        website: 'https://mit.edu',
        email: 'partners@mit.edu',
        phone: '+1 (617) 253-1000',
        location: {
          city: 'Cambridge',
          state: 'Massachusetts',
          country: 'USA',
          address: '77 Massachusetts Ave, Cambridge, MA 02139'
        },
        studentCount: 12000,
        departments: [
          { name: 'Aerospace Engineering' },
          { name: 'Computer Science' },
          { name: 'Physics' }
        ],
        partnerships: [{ type: 'research' }],
        contactPerson: {
          name: 'Prof. Michael Chen',
          email: 'mchen@mit.edu',
          phone: '+1 (617) 253-7890',
          position: 'Dean of Research'
        },
        assignedTo: { firstName: 'Sarah', lastName: 'Smith' }
      },
      {
        _id: '3',
        name: 'Oxford University',
        type: 'public',
        description: 'One of the oldest and most prestigious universities',
        status: 'interested',
        website: 'https://ox.ac.uk',
        email: 'partners@ox.ac.uk',
        phone: '+44 1865 270000',
        location: {
          city: 'Oxford',
          state: 'England',
          country: 'UK',
          address: 'University Offices, Wellington Square, Oxford OX1 2JD'
        },
        studentCount: 25000,
        departments: [
          { name: 'Humanities' },
          { name: 'Sciences' },
          { name: 'Social Sciences' }
        ],
        partnerships: [],
        contactPerson: {
          name: 'Dr. Emma Wilson',
          email: 'emma.wilson@ox.ac.uk',
          phone: '+44 1865 270111',
          position: 'Head of Partnerships'
        },
        assignedTo: { firstName: 'Mike', lastName: 'Johnson' }
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
          toast.success(editingUniversity ? 'University updated successfully!' : 'University created successfully!');
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
        type: university.type || 'public',
        description: university.description || '',
        status: university.status || 'prospect',
        website: university.website || '',
        email: university.email || '',
        phone: university.phone || '',
        location: {
          city: university.location?.city || '',
          state: university.location?.state || '',
          country: university.location?.country || '',
          address: university.location?.address || ''
        },
        studentCount: university.studentCount || '',
        departments: university.departments || [],
        partnerships: university.partnerships || [],
        contactPerson: {
          name: university.contactPerson?.name || '',
          email: university.contactPerson?.email || '',
          phone: university.contactPerson?.phone || '',
          position: university.contactPerson?.position || ''
        },
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
      type: 'public',
      description: '',
      status: 'prospect',
      website: '',
      email: '',
      phone: '',
      location: {
        city: '',
        state: '',
        country: '',
        address: ''
      },
      studentCount: '',
      departments: [],
      partnerships: [],
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
      'active': 'un-status-active',
      'onboarded': 'un-status-onboarded',
      'interested': 'un-status-interested',
      'negotiating': 'un-status-negotiating',
      'prospect': 'un-status-prospect'
    };
    return colors[status] || 'un-status-default';
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

  const getTypeLabel = (type) => {
    const labels = {
      'public': 'Public',
      'private': 'Private',
      'ivy_league': 'Ivy League',
      'international': 'International'
    };
    return labels[type] || type;
  };

  const statusOptions = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'interested', label: 'Interested' },
    { value: 'negotiating', label: 'Negotiating' },
    { value: 'onboarded', label: 'Onboarded' },
    { value: 'active', label: 'Active' }
  ];

  const typeOptions = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'ivy_league', label: 'Ivy League' },
    { value: 'international', label: 'International' }
  ];

  if (loading) {
    return (
      <div className="un-loading">
        <div className="un-spinner"></div>
        <p className="un-loading-text">Loading universities...</p>
      </div>
    );
  }

  return (
    <div className="un-container">
      {/* Header */}
      <div className="un-header">
        <div className="un-header-left">
          <div className="un-title-wrapper">
            <div className="un-title-icon">
              <GraduationCap className="un-title-svg" />
            </div>
            <div>
              <h1 className="un-title">Universities</h1>
              <p className="un-subtitle">Manage university partnerships</p>
            </div>
          </div>
          <span className="un-count">{universities.length} universities</span>
        </div>
        <div className="un-header-right">
          <button className="un-icon-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`un-refresh-icon ${refreshing ? 'un-spin' : ''}`} />
          </button>
          <button className="un-export-btn">
            <Download className="un-btn-icon" />
            Export
          </button>
          <button 
            onClick={() => openModal()}
            className="un-add-btn"
          >
            <Plus className="un-btn-icon" />
            Add University
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="un-filters">
        <div className="un-search-wrapper">
          <Search className="un-search-icon" />
          <input
            type="text"
            placeholder="Search universities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="un-search-input"
          />
          {search && (
            <button className="un-search-clear" onClick={() => setSearch('')}>
              <X className="un-search-clear-icon" />
            </button>
          )}
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="un-filter-select"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="onboarded">Onboarded</option>
          <option value="interested">Interested</option>
          <option value="negotiating">Negotiating</option>
          <option value="prospect">Prospect</option>
        </select>
      </div>

      {/* Universities Grid */}
      <div className="un-grid">
        {universities.map((uni) => (
          <div key={uni._id} className="un-card">
            <div className="un-card-header">
              <div className="un-card-left">
                <div className="un-card-icon">
                  <GraduationCap className="un-card-icon-svg" />
                </div>
                <div className="un-card-info">
                  <h3 className="un-card-title">{uni.name}</h3>
                  <p className="un-card-type">{getTypeLabel(uni.type)}</p>
                </div>
              </div>
              <span className={`un-card-status ${getStatusColor(uni.status)}`}>
                {getStatusLabel(uni.status)}
              </span>
            </div>
            
            {uni.description && (
              <p className="un-card-desc">{uni.description}</p>
            )}
            
            {uni.location && (uni.location.city || uni.location.country) && (
              <div className="un-card-location">
                <MapPin className="un-location-icon" />
                <span className="un-location-text">
                  {uni.location.city && `${uni.location.city}, `}
                  {uni.location.country}
                </span>
              </div>
            )}
            
            <div className="un-card-badges">
              {uni.studentCount && (
                <span className="un-badge un-badge-blue">
                  <Users className="un-badge-icon" />
                  {uni.studentCount} students
                </span>
              )}
              {uni.partnerships && uni.partnerships.length > 0 && (
                <span className="un-badge un-badge-green">
                  <Star className="un-badge-icon" />
                  {uni.partnerships.length} partnerships
                </span>
              )}
            </div>
            
            {uni.departments && uni.departments.length > 0 && (
              <div className="un-card-departments">
                <span className="un-departments-label">Departments:</span>
                <div className="un-departments-list">
                  {uni.departments.slice(0, 3).map((dept, idx) => (
                    <span key={idx} className="un-department-tag">
                      {dept.name}
                    </span>
                  ))}
                  {uni.departments.length > 3 && (
                    <span className="un-department-more">
                      +{uni.departments.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {uni.contactPerson && uni.contactPerson.name && (
              <div className="un-card-contact">
                <Users className="un-contact-icon" />
                <span className="un-contact-text">
                  {uni.contactPerson.name}
                  {uni.contactPerson.position && (
                    <>
                      <span className="un-contact-separator">•</span>
                      <span className="un-contact-position">{uni.contactPerson.position}</span>
                    </>
                  )}
                </span>
              </div>
            )}
            
            <div className="un-card-footer">
              <div className="un-card-assignee">
                <span className="un-assignee-label">Assigned:</span>
                <span className="un-assignee-name">
                  {uni.assignedTo?.firstName} {uni.assignedTo?.lastName || 'Unassigned'}
                </span>
              </div>
              <div className="un-card-actions">
                <button 
                  className="un-action-btn un-action-view"
                  onClick={() => {
                    toast.info('View details coming soon');
                  }}
                  title="View"
                >
                  <Eye className="un-action-icon" />
                </button>
                <button 
                  className="un-action-btn un-action-edit"
                  onClick={() => openModal(uni)}
                  title="Edit"
                >
                  <Edit className="un-action-icon" />
                </button>
                <button 
                  className="un-action-btn un-action-delete"
                  onClick={() => handleDelete(uni._id)}
                  title="Delete"
                >
                  <Trash2 className="un-action-icon" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {universities.length === 0 && (
        <div className="un-empty">
          <div className="un-empty-icon-wrapper">
            <GraduationCap className="un-empty-icon" />
          </div>
          <h3 className="un-empty-title">No universities found</h3>
          <p className="un-empty-subtitle">Start by adding your first university partner</p>
          <button className="un-empty-btn" onClick={() => openModal()}>
            <Plus className="un-btn-icon" />
            Add University
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="un-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="un-modal" onClick={(e) => e.stopPropagation()}>
            <div className="un-modal-header">
              <div className="un-modal-title-wrapper">
                <GraduationCap className="un-modal-icon" />
                <h2 className="un-modal-title">
                  {editingUniversity ? 'Edit University' : 'Add New University'}
                </h2>
              </div>
              <button className="un-modal-close" onClick={() => setShowModal(false)}>
                <X className="un-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="un-modal-form">
              <div className="un-form-group">
                <label className="un-form-label">
                  University Name <span className="un-form-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="un-form-input"
                  placeholder="Enter university name"
                  autoFocus
                />
              </div>

              <div className="un-form-grid">
                <div className="un-form-group">
                  <label className="un-form-label">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="un-form-select"
                  >
                    {typeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="un-form-group">
                  <label className="un-form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="un-form-select"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="un-form-group">
                <label className="un-form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="un-form-textarea"
                  rows="2"
                  placeholder="Brief description of the university"
                />
              </div>

              <div className="un-form-grid">
                <div className="un-form-group">
                  <label className="un-form-label">Student Count</label>
                  <input
                    type="number"
                    value={formData.studentCount}
                    onChange={(e) => handleChange('studentCount', e.target.value)}
                    className="un-form-input"
                    placeholder="0"
                  />
                </div>
                <div className="un-form-group">
                  <label className="un-form-label">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="un-form-input"
                    placeholder="https://example.edu"
                  />
                </div>
              </div>

              <div className="un-form-group">
                <label className="un-form-label">Location</label>
                <div className="un-form-grid">
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => handleChange('location.city', e.target.value)}
                    className="un-form-input"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={formData.location.state}
                    onChange={(e) => handleChange('location.state', e.target.value)}
                    className="un-form-input"
                    placeholder="State/Province"
                  />
                </div>
                <div className="un-form-grid" style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    value={formData.location.country}
                    onChange={(e) => handleChange('location.country', e.target.value)}
                    className="un-form-input"
                    placeholder="Country"
                  />
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) => handleChange('location.address', e.target.value)}
                    className="un-form-input"
                    placeholder="Full Address"
                  />
                </div>
              </div>

              <div className="un-form-section">
                <h4 className="un-form-section-title">Contact Person</h4>
                <div className="un-form-grid">
                  <div className="un-form-group">
                    <label className="un-form-label">Name</label>
                    <input
                      type="text"
                      value={formData.contactPerson.name}
                      onChange={(e) => handleChange('contactPerson.name', e.target.value)}
                      className="un-form-input"
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="un-form-group">
                    <label className="un-form-label">Position</label>
                    <input
                      type="text"
                      value={formData.contactPerson.position}
                      onChange={(e) => handleChange('contactPerson.position', e.target.value)}
                      className="un-form-input"
                      placeholder="Position/Title"
                    />
                  </div>
                </div>
                <div className="un-form-grid">
                  <div className="un-form-group">
                    <label className="un-form-label">Email</label>
                    <input
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) => handleChange('contactPerson.email', e.target.value)}
                      className="un-form-input"
                      placeholder="contact@example.edu"
                    />
                  </div>
                  <div className="un-form-group">
                    <label className="un-form-label">Phone</label>
                    <input
                      type="text"
                      value={formData.contactPerson.phone}
                      onChange={(e) => handleChange('contactPerson.phone', e.target.value)}
                      className="un-form-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="un-form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="un-form-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="un-form-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="un-form-spinner"></div>
                      {editingUniversity ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="un-btn-icon" />
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
        .un-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: unFadeIn 0.4s ease;
        }

        @keyframes unFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .un-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .un-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: unSpin 0.8s linear infinite;
        }

        .un-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes unSpin {
          to { transform: rotate(360deg); }
        }

        .un-spin {
          animation: unSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .un-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .un-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .un-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .un-title-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
        }

        .un-title-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .un-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .un-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .un-count {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 14px;
          border-radius: 12px;
        }

        .un-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .un-icon-btn {
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

        .un-icon-btn:hover {
          background: #f1f5f9;
        }

        .un-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .un-btn-icon {
          width: 16px;
          height: 16px;
        }

        .un-export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
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

        .un-export-btn:hover {
          background: #f1f5f9;
        }

        .un-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
        }

        .un-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .un-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .un-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .un-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .un-search-input {
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

        .un-search-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .un-search-clear {
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

        .un-search-clear:hover {
          background: #f1f5f9;
        }

        .un-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .un-filter-select {
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

        .un-filter-select:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        /* ============================================
           GRID
           ============================================ */
        .un-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .un-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: all 0.3s ease;
          animation: unSlideUp 0.4s ease both;
        }

        .un-card:nth-child(1) { animation-delay: 0.05s; }
        .un-card:nth-child(2) { animation-delay: 0.1s; }
        .un-card:nth-child(3) { animation-delay: 0.15s; }
        .un-card:nth-child(4) { animation-delay: 0.2s; }

        @keyframes unSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .un-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: #d1d5db;
        }

        .un-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .un-card-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .un-card-icon {
          width: 44px;
          height: 44px;
          background: #f5f3ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .un-card-icon-svg {
          width: 22px;
          height: 22px;
          color: #8b5cf6;
        }

        .un-card-info {
          flex: 1;
          min-width: 0;
        }

        .un-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .un-card-type {
          font-size: 13px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .un-card-status {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        .un-status-active { background: #d1fae5; color: #065f46; }
        .un-status-onboarded { background: #dbeafe; color: #1d4ed8; }
        .un-status-interested { background: #fef3c7; color: #92400e; }
        .un-status-negotiating { background: #f3e8ff; color: #6d28d9; }
        .un-status-prospect { background: #f1f5f9; color: #475569; }

        .un-card-desc {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .un-card-location {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 8px;
          font-size: 13px;
          color: #64748b;
        }

        .un-location-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .un-location-text {
          font-size: 13px;
        }

        .un-card-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .un-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .un-badge-blue { background: #dbeafe; color: #1d4ed8; }
        .un-badge-green { background: #d1fae5; color: #065f46; }

        .un-badge-icon {
          width: 12px;
          height: 12px;
        }

        .un-card-departments {
          margin-bottom: 12px;
        }

        .un-departments-label {
          font-size: 11px;
          color: #94a3b8;
          display: block;
          margin-bottom: 4px;
        }

        .un-departments-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .un-department-tag {
          padding: 2px 8px;
          font-size: 11px;
          background: #f1f5f9;
          border-radius: 12px;
          color: #475569;
        }

        .un-department-more {
          padding: 2px 8px;
          font-size: 11px;
          color: #94a3b8;
        }

        .un-card-contact {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          font-size: 13px;
          color: #475569;
        }

        .un-contact-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .un-contact-text {
          font-size: 13px;
        }

        .un-contact-separator {
          color: #d1d5db;
          margin: 0 4px;
        }

        .un-contact-position {
          color: #64748b;
        }

        .un-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .un-card-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #64748b;
        }

        .un-assignee-label {
          color: #94a3b8;
        }

        .un-assignee-name {
          font-weight: 500;
          color: #0f172a;
        }

        .un-card-actions {
          display: flex;
          gap: 4px;
        }

        .un-action-btn {
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

        .un-action-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .un-action-view:hover {
          background: #eff6ff;
          color: #3b82f6;
        }

        .un-action-edit:hover {
          background: #ecfdf5;
          color: #22c55e;
        }

        .un-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .un-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .un-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .un-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .un-empty-icon {
          width: 36px;
          height: 36px;
          color: #94a3b8;
        }

        .un-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .un-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .un-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
        }

        .un-empty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
        }

        /* ============================================
           MODAL
           ============================================ */
        .un-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: unFadeIn 0.3s ease;
        }

        .un-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: unModalIn 0.3s ease;
        }

        @keyframes unModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .un-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .un-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .un-modal-icon {
          width: 28px;
          height: 28px;
          color: #8b5cf6;
        }

        .un-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .un-modal-close {
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

        .un-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .un-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        .un-modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .un-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .un-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .un-form-required {
          color: #ef4444;
        }

        .un-form-input,
        .un-form-select,
        .un-form-textarea {
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

        .un-form-input:focus,
        .un-form-select:focus,
        .un-form-textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .un-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .un-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .un-form-section {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }

        .un-form-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 12px 0;
        }

        .un-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .un-form-cancel {
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

        .un-form-cancel:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .un-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .un-form-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
        }

        .un-form-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
        }

        .un-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .un-form-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: unSpin 0.8s linear infinite;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .un-container {
            padding: 16px;
          }

          .un-header {
            flex-direction: column;
            align-items: stretch;
          }

          .un-header-right {
            flex-wrap: wrap;
          }

          .un-export-btn,
          .un-add-btn {
            flex: 1;
            justify-content: center;
          }

          .un-filters {
            flex-direction: column;
          }

          .un-search-wrapper {
            width: 100%;
          }

          .un-filter-select {
            width: 100%;
          }

          .un-grid {
            grid-template-columns: 1fr;
          }

          .un-title {
            font-size: 22px;
          }

          .un-title-icon {
            width: 40px;
            height: 40px;
          }

          .un-title-svg {
            width: 20px;
            height: 20px;
          }

          .un-form-grid {
            grid-template-columns: 1fr;
          }

          .un-modal {
            margin: 16px;
            max-height: 95vh;
          }
        }

        @media (max-width: 480px) {
          .un-container {
            padding: 12px;
          }

          .un-header-right {
            flex-direction: column;
          }

          .un-export-btn,
          .un-add-btn {
            width: 100%;
          }

          .un-icon-btn {
            align-self: flex-end;
          }

          .un-title-wrapper {
            gap: 10px;
          }

          .un-title {
            font-size: 20px;
          }

          .un-subtitle {
            font-size: 13px;
          }

          .un-modal {
            padding: 0;
          }

          .un-modal-header {
            padding: 16px 18px;
          }

          .un-modal-form {
            padding: 18px;
          }

          .un-form-actions {
            flex-direction: column;
          }

          .un-form-cancel,
          .un-form-submit {
            width: 100%;
            justify-content: center;
          }
        }

        /* Scrollbar */
        .un-modal::-webkit-scrollbar {
          width: 6px;
        }

        .un-modal::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }

        .un-modal::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }

        .un-modal::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Universities;