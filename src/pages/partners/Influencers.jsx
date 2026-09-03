// pages/partners/Influencers.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, Edit, Trash2, Star,
  Filter, Download, Eye, Instagram, Youtube,
  Twitter, Facebook, Users, DollarSign,
  X, RefreshCw, Mail, Phone, Globe,
  Award, Zap, Layers, Calendar, Clock,
  Hash, TrendingUp, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Influencers = () => {
  const { token } = useAuth();
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', category: 'all' });
  const [showModal, setShowModal] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    status: 'prospect',
    email: '',
    phone: '',
    website: '',
    platforms: [],
    rates: {
      perPost: '',
      perCampaign: '',
      perHour: ''
    },
    availability: {
      status: 'available',
      nextAvailable: ''
    },
    assignedTo: ''
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchInfluencers();
  }, [search, filters]);

  const fetchInfluencers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.category !== 'all') params.append('category', filters.category);
      
      let data = [];
      try {
        const response = await fetch(
          `${API_URL}/partners/influencers?${params.toString()}`,
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
        data = getMockInfluencers();
        toast.info('Showing sample influencer data');
      }

      setInfluencers(data);
    } catch (error) {
      console.error('Error fetching influencers:', error);
      setInfluencers(getMockInfluencers());
      toast.error('Failed to load influencers, showing sample data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockInfluencers = () => {
    return [
      {
        _id: '1',
        name: 'TechGuru',
        category: 'tech',
        description: 'Tech reviewer and educator with focus on AI and software',
        status: 'active',
        email: 'techguru@example.com',
        phone: '+1 (555) 123-4567',
        website: 'https://techguru.com',
        platforms: [
          { name: 'youtube', handle: '@techguru', followers: 250000 },
          { name: 'twitter', handle: '@techguru', followers: 120000 }
        ],
        rates: {
          perPost: 5000,
          perCampaign: 15000,
          perHour: 300
        },
        availability: {
          status: 'available',
          nextAvailable: '2024-12-01'
        },
        assignedTo: { firstName: 'John', lastName: 'Doe' }
      },
      {
        _id: '2',
        name: 'LifestyleLisa',
        category: 'lifestyle',
        description: 'Lifestyle and wellness content creator',
        status: 'onboarded',
        email: 'lisa@example.com',
        phone: '+1 (555) 234-5678',
        website: 'https://lifestylelisa.com',
        platforms: [
          { name: 'instagram', handle: '@lifestylelisa', followers: 450000 },
          { name: 'youtube', handle: '@lifestylelisa', followers: 150000 }
        ],
        rates: {
          perPost: 8000,
          perCampaign: 25000,
          perHour: 400
        },
        availability: {
          status: 'busy',
          nextAvailable: '2025-01-15'
        },
        assignedTo: { firstName: 'Sarah', lastName: 'Smith' }
      },
      {
        _id: '3',
        name: 'FoodieFrank',
        category: 'food',
        description: 'Gourmet food critic and recipe developer',
        status: 'interested',
        email: 'frank@example.com',
        phone: '+1 (555) 345-6789',
        website: 'https://foodiefrank.com',
        platforms: [
          { name: 'instagram', handle: '@foodiefrank', followers: 380000 },
          { name: 'youtube', handle: '@foodiefrank', followers: 95000 }
        ],
        rates: {
          perPost: 6000,
          perCampaign: 18000,
          perHour: 250
        },
        availability: {
          status: 'available',
          nextAvailable: '2024-11-15'
        },
        assignedTo: { firstName: 'Mike', lastName: 'Johnson' }
      },
      {
        _id: '4',
        name: 'TravelTina',
        category: 'travel',
        description: 'Adventure travel and destination content creator',
        status: 'negotiating',
        email: 'tina@example.com',
        phone: '+1 (555) 456-7890',
        website: 'https://traveltina.com',
        platforms: [
          { name: 'instagram', handle: '@traveltina', followers: 520000 },
          { name: 'youtube', handle: '@traveltina', followers: 200000 }
        ],
        rates: {
          perPost: 10000,
          perCampaign: 35000,
          perHour: 500
        },
        availability: {
          status: 'busy',
          nextAvailable: '2025-02-01'
        },
        assignedTo: { firstName: 'Emma', lastName: 'Wilson' }
      }
    ];
  };

  const handleRefresh = () => {
    fetchInfluencers(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Influencer name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingInfluencer 
        ? `${API_URL}/partners/influencers/${editingInfluencer._id}`
        : `${API_URL}/partners/influencers`;
      
      const method = editingInfluencer ? 'PUT' : 'POST';

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
          toast.success(editingInfluencer ? 'Influencer updated successfully!' : 'Influencer created successfully!');
          setShowModal(false);
          setEditingInfluencer(null);
          resetForm();
          await fetchInfluencers(true);
        }
      } else {
        throw new Error('Failed to save influencer');
      }
    } catch (error) {
      console.error('Error saving influencer:', error);
      toast.error(error.message || 'Failed to save influencer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this influencer?')) return;

    try {
      const response = await fetch(
        `${API_URL}/partners/influencers/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success('Influencer deleted successfully');
        await fetchInfluencers(true);
      } else {
        throw new Error('Failed to delete influencer');
      }
    } catch (error) {
      console.error('Error deleting influencer:', error);
      toast.error('Failed to delete influencer');
    }
  };

  const openModal = (influencer = null) => {
    if (influencer) {
      setEditingInfluencer(influencer);
      setFormData({
        name: influencer.name || '',
        category: influencer.category || '',
        description: influencer.description || '',
        status: influencer.status || 'prospect',
        email: influencer.email || '',
        phone: influencer.phone || '',
        website: influencer.website || '',
        platforms: influencer.platforms || [],
        rates: {
          perPost: influencer.rates?.perPost || '',
          perCampaign: influencer.rates?.perCampaign || '',
          perHour: influencer.rates?.perHour || ''
        },
        availability: {
          status: influencer.availability?.status || 'available',
          nextAvailable: influencer.availability?.nextAvailable || ''
        },
        assignedTo: influencer.assignedTo?._id || influencer.assignedTo || ''
      });
    } else {
      setEditingInfluencer(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      status: 'prospect',
      email: '',
      phone: '',
      website: '',
      platforms: [],
      rates: {
        perPost: '',
        perCampaign: '',
        perHour: ''
      },
      availability: {
        status: 'available',
        nextAvailable: ''
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

  const getPlatformIcon = (platform) => {
    const icons = {
      'instagram': Instagram,
      'youtube': Youtube,
      'twitter': Twitter,
      'facebook': Facebook,
      'tiktok': Star,
      'linkedin': Users
    };
    const Icon = icons[platform] || Users;
    return <Icon className="in-platform-icon" />;
  };

  const getPlatformColor = (platform) => {
    const colors = {
      'instagram': 'in-platform-instagram',
      'youtube': 'in-platform-youtube',
      'twitter': 'in-platform-twitter',
      'facebook': 'in-platform-facebook',
      'tiktok': 'in-platform-tiktok',
      'linkedin': 'in-platform-linkedin'
    };
    return colors[platform] || 'in-platform-default';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'in-status-active',
      'onboarded': 'in-status-onboarded',
      'interested': 'in-status-interested',
      'negotiating': 'in-status-negotiating',
      'prospect': 'in-status-prospect'
    };
    return colors[status] || 'in-status-default';
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

  const getCategoryLabel = (category) => {
    const labels = {
      'tech': 'Tech',
      'lifestyle': 'Lifestyle',
      'education': 'Education',
      'entertainment': 'Entertainment',
      'fashion': 'Fashion',
      'food': 'Food',
      'travel': 'Travel',
      'business': 'Business',
      'gaming': 'Gaming'
    };
    return labels[category] || category;
  };

  const getAvailabilityStatusLabel = (status) => {
    const labels = {
      'available': 'Available',
      'busy': 'Busy',
      'scheduled': 'Scheduled'
    };
    return labels[status] || status;
  };

  const statusOptions = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'interested', label: 'Interested' },
    { value: 'negotiating', label: 'Negotiating' },
    { value: 'onboarded', label: 'Onboarded' },
    { value: 'active', label: 'Active' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'tech', label: 'Tech' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'food', label: 'Food' },
    { value: 'travel', label: 'Travel' },
    { value: 'business', label: 'Business' },
    { value: 'gaming', label: 'Gaming' }
  ];

  const platformOptions = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'linkedin', label: 'LinkedIn' }
  ];

  const availabilityOptions = [
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' },
    { value: 'scheduled', label: 'Scheduled' }
  ];

  if (loading) {
    return (
      <div className="in-loading">
        <div className="in-loading-spinner"></div>
        <p className="in-loading-text">Loading influencers...</p>
      </div>
    );
  }

  return (
    <>
      <div className="in-container">
        {/* Header */}
        <div className="in-header">
          <div className="in-header-left">
            <div className="in-title-wrapper">
              <div className="in-title-icon">
                <Layers className="in-title-svg" />
              </div>
              <div>
                <h1 className="in-title">Influencers</h1>
                <p className="in-subtitle">Manage influencer partnerships</p>
              </div>
            </div>
            <span className="in-count">{influencers.length} influencers</span>
          </div>
          <div className="in-header-right">
            <button className="in-icon-btn" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`in-refresh-icon ${refreshing ? 'in-spin' : ''}`} />
            </button>
            <button className="in-export-btn">
              <Download className="in-btn-icon" />
              Export
            </button>
            <button 
              onClick={() => openModal()}
              className="in-add-btn"
            >
              <Plus className="in-btn-icon" />
              Add Influencer
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="in-filters">
          <div className="in-search-wrapper">
            <Search className="in-search-icon" />
            <input
              type="text"
              placeholder="Search influencers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="in-search-input"
            />
            {search && (
              <button className="in-search-clear" onClick={() => setSearch('')}>
                <X className="in-search-clear-icon" />
              </button>
            )}
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="in-filter-select"
          >
            <option value="all">All Status</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="in-filter-select"
          >
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Influencers Grid */}
        <div className="in-grid">
          {influencers.map((influencer, index) => (
            <div key={influencer._id} className="in-card" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="in-card-header">
                <div className="in-card-left">
                  <div className="in-card-icon">
                    <Star className="in-card-icon-svg" />
                  </div>
                  <div className="in-card-info">
                    <h3 className="in-card-title">{influencer.name}</h3>
                    <p className="in-card-category">{getCategoryLabel(influencer.category)}</p>
                  </div>
                </div>
                <span className={`in-card-status ${getStatusColor(influencer.status)}`}>
                  {getStatusLabel(influencer.status)}
                </span>
              </div>
              
              {influencer.description && (
                <p className="in-card-desc">{influencer.description}</p>
              )}
              
              {/* Platforms */}
              {influencer.platforms && influencer.platforms.length > 0 && (
                <div className="in-card-platforms">
                  {influencer.platforms.map((platform, idx) => (
                    <div key={idx} className={`in-platform-tag ${getPlatformColor(platform.name)}`}>
                      {getPlatformIcon(platform.name)}
                      <span className="in-platform-handle">{platform.handle}</span>
                      <span className="in-platform-separator">•</span>
                      <span className="in-platform-followers">
                        {platform.followers?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="in-card-badges">
                {influencer.rates && (
                  <>
                    {influencer.rates.perPost && (
                      <span className="in-badge in-badge-green">
                        <DollarSign className="in-badge-icon" />
                        Post: ${influencer.rates.perPost}
                      </span>
                    )}
                    {influencer.rates.perCampaign && (
                      <span className="in-badge in-badge-purple">
                        <TrendingUp className="in-badge-icon" />
                        Campaign: ${influencer.rates.perCampaign}
                      </span>
                    )}
                  </>
                )}
                {influencer.availability && (
                  <span className={`in-badge in-badge-${influencer.availability.status === 'available' ? 'green' : 'yellow'}`}>
                    <Clock className="in-badge-icon" />
                    {getAvailabilityStatusLabel(influencer.availability.status)}
                  </span>
                )}
              </div>
              
              <div className="in-card-footer">
                <div className="in-card-assignee">
                  <span className="in-assignee-label">Assigned:</span>
                  <span className="in-assignee-name">
                    {influencer.assignedTo?.firstName} {influencer.assignedTo?.lastName || 'Unassigned'}
                  </span>
                </div>
                <div className="in-card-actions">
                  <button 
                    className="in-action-btn in-action-view"
                    onClick={() => {
                      toast.info('View details coming soon');
                    }}
                    title="View"
                  >
                    <Eye className="in-action-icon" />
                  </button>
                  <button 
                    className="in-action-btn in-action-edit"
                    onClick={() => openModal(influencer)}
                    title="Edit"
                  >
                    <Edit className="in-action-icon" />
                  </button>
                  <button 
                    className="in-action-btn in-action-delete"
                    onClick={() => handleDelete(influencer._id)}
                    title="Delete"
                  >
                    <Trash2 className="in-action-icon" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {influencers.length === 0 && (
          <div className="in-empty">
            <div className="in-empty-icon-wrapper">
              <Star className="in-empty-icon" />
            </div>
            <h3 className="in-empty-title">No influencers found</h3>
            <p className="in-empty-subtitle">Start by adding your first influencer</p>
            <button className="in-empty-btn" onClick={() => openModal()}>
              <Plus className="in-btn-icon" />
              Add Influencer
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="in-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="in-modal" onClick={(e) => e.stopPropagation()}>
            <div className="in-modal-header">
              <div className="in-modal-title-wrapper">
                <Star className="in-modal-icon" />
                <h2 className="in-modal-title">
                  {editingInfluencer ? 'Edit Influencer' : 'Add New Influencer'}
                </h2>
              </div>
              <button className="in-modal-close" onClick={() => setShowModal(false)}>
                <X className="in-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="in-modal-form">
              <div className="in-form-group">
                <label className="in-form-label">
                  Name <span className="in-form-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="in-form-input"
                  placeholder="Enter influencer name"
                  autoFocus
                />
              </div>

              <div className="in-form-grid">
                <div className="in-form-group">
                  <label className="in-form-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="in-form-select"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.filter(c => c.value !== 'all').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="in-form-group">
                  <label className="in-form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="in-form-select"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="in-form-group">
                <label className="in-form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="in-form-textarea"
                  rows="2"
                  placeholder="Brief description of the influencer"
                />
              </div>

              <div className="in-form-grid">
                <div className="in-form-group">
                  <label className="in-form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="in-form-input"
                    placeholder="influencer@example.com"
                  />
                </div>
                <div className="in-form-group">
                  <label className="in-form-label">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="in-form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="in-form-group">
                <label className="in-form-label">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="in-form-input"
                  placeholder="https://example.com"
                />
              </div>

              <div className="in-form-section">
                <h4 className="in-form-section-title">Rates</h4>
                <div className="in-form-grid">
                  <div className="in-form-group">
                    <label className="in-form-label">Per Post ($)</label>
                    <input
                      type="number"
                      value={formData.rates.perPost}
                      onChange={(e) => handleChange('rates.perPost', e.target.value)}
                      className="in-form-input"
                      placeholder="5000"
                    />
                  </div>
                  <div className="in-form-group">
                    <label className="in-form-label">Per Campaign ($)</label>
                    <input
                      type="number"
                      value={formData.rates.perCampaign}
                      onChange={(e) => handleChange('rates.perCampaign', e.target.value)}
                      className="in-form-input"
                      placeholder="15000"
                    />
                  </div>
                </div>
                <div className="in-form-group">
                  <label className="in-form-label">Per Hour ($)</label>
                  <input
                    type="number"
                    value={formData.rates.perHour}
                    onChange={(e) => handleChange('rates.perHour', e.target.value)}
                    className="in-form-input"
                    placeholder="300"
                  />
                </div>
              </div>

              <div className="in-form-section">
                <h4 className="in-form-section-title">Availability</h4>
                <div className="in-form-grid">
                  <div className="in-form-group">
                    <label className="in-form-label">Status</label>
                    <select
                      value={formData.availability.status}
                      onChange={(e) => handleChange('availability.status', e.target.value)}
                      className="in-form-select"
                    >
                      {availabilityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="in-form-group">
                    <label className="in-form-label">Next Available</label>
                    <input
                      type="date"
                      value={formData.availability.nextAvailable}
                      onChange={(e) => handleChange('availability.nextAvailable', e.target.value)}
                      className="in-form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="in-form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="in-form-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="in-form-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="in-form-spinner"></div>
                      {editingInfluencer ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="in-btn-icon" />
                      {editingInfluencer ? 'Update Influencer' : 'Add Influencer'}
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
        .in-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .in-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .in-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .in-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           HEADER
           ============================================ */
        .in-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeInDown 0.6s ease;
        }
        .in-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .in-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .in-title-icon {
          width: 48px;
          height: 48px;
          background: #013E37;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.25);
        }
        .in-title-svg {
          width: 24px;
          height: 24px;
          color: #FFEFB3;
        }
        .in-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .in-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }
        .in-count {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          background: #FFEFB3;
          padding: 2px 14px;
          border-radius: 12px;
        }
        .in-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .in-icon-btn {
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
        .in-icon-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .in-refresh-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        .in-spin {
          animation: spin 1s linear infinite;
        }
        .in-btn-icon {
          width: 16px;
          height: 16px;
        }
        .in-export-btn {
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
        .in-export-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .in-add-btn {
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
        .in-add-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.4);
        }
        .in-add-btn:active {
          transform: scale(0.95);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .in-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .in-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }
        .in-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.4;
        }
        .in-search-input {
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
        .in-search-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .in-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }
        .in-search-clear {
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
        .in-search-clear:hover {
          background: #FFEFB3;
          opacity: 1;
        }
        .in-search-clear-icon {
          width: 14px;
          height: 14px;
        }
        .in-filter-select {
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
        .in-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .in-filter-select:hover {
          border-color: #013E37;
        }

        /* ============================================
           GRID
           ============================================ */
        .in-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .in-card {
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
        .in-card::before {
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
        .in-card:hover::before {
          transform: scaleX(1);
        }
        .in-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.1);
          border-color: #013E37;
        }
        .in-card:nth-child(1) { animation-delay: 0.05s; }
        .in-card:nth-child(2) { animation-delay: 0.1s; }
        .in-card:nth-child(3) { animation-delay: 0.15s; }
        .in-card:nth-child(4) { animation-delay: 0.2s; }
        .in-card:nth-child(5) { animation-delay: 0.25s; }

        .in-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .in-card-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .in-card-icon {
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
        .in-card:hover .in-card-icon {
          transform: scale(1.05) rotate(-5deg);
        }
        .in-card-icon-svg {
          width: 22px;
          height: 22px;
          color: #013E37;
        }
        .in-card-info {
          flex: 1;
          min-width: 0;
        }
        .in-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .in-card-category {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }
        .in-card-status {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .in-card-status:hover {
          transform: scale(1.05);
        }
        .in-status-active { background: #013E37; color: #FFEFB3; }
        .in-status-onboarded { background: #0A5C54; color: #FFEFB3; }
        .in-status-interested { background: #FFEFB3; color: #013E37; }
        .in-status-negotiating { background: #FFEFB3; color: #013E37; }
        .in-status-prospect { background: #FFEFB3; color: #013E37; }

        .in-card-desc {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ============================================
           PLATFORMS
           ============================================ */
        .in-card-platforms {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .in-platform-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .in-platform-tag:hover {
          transform: scale(1.05);
        }
        .in-platform-icon {
          width: 14px;
          height: 14px;
        }
        .in-platform-instagram { background: #FFEFB3; color: #013E37; }
        .in-platform-youtube { background: #FFEFB3; color: #013E37; }
        .in-platform-twitter { background: #FFEFB3; color: #013E37; }
        .in-platform-facebook { background: #FFEFB3; color: #013E37; }
        .in-platform-tiktok { background: #FFEFB3; color: #013E37; }
        .in-platform-linkedin { background: #FFEFB3; color: #013E37; }
        .in-platform-default { background: #FFEFB3; color: #013E37; }
        .in-platform-handle {
          color: #013E37;
        }
        .in-platform-separator {
          color: #013E37;
          opacity: 0.3;
        }
        .in-platform-followers {
          color: #013E37;
          opacity: 0.6;
        }

        /* ============================================
           BADGES
           ============================================ */
        .in-card-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .in-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }
        .in-badge:hover {
          transform: scale(1.05);
        }
        .in-badge-green { background: #013E37; color: #FFEFB3; }
        .in-badge-purple { background: #FFEFB3; color: #013E37; }
        .in-badge-yellow { background: #FFEFB3; color: #013E37; }
        .in-badge-icon {
          width: 12px;
          height: 12px;
        }

        /* ============================================
           FOOTER
           ============================================ */
        .in-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #FFEFB3;
          transition: border-color 0.3s ease;
        }
        .in-card:hover .in-card-footer {
          border-color: #013E37;
        }
        .in-card-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
        }
        .in-assignee-label {
          opacity: 0.5;
        }
        .in-assignee-name {
          font-weight: 500;
          color: #013E37;
        }
        .in-card-actions {
          display: flex;
          gap: 4px;
        }
        .in-action-btn {
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
        .in-action-btn:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }
        .in-action-view:hover {
          background: #FFEFB3;
          color: #013E37;
        }
        .in-action-edit:hover {
          background: #FFEFB3;
          color: #013E37;
        }
        .in-action-delete:hover {
          background: #FEE2E2;
          color: #EF4444;
        }
        .in-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .in-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 2px dashed #FFEFB3;
          text-align: center;
        }
        .in-empty-icon-wrapper {
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
        .in-empty-icon {
          width: 36px;
          height: 36px;
          color: #013E37;
        }
        .in-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .in-empty-subtitle {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 4px 0 16px 0;
        }
        .in-empty-btn {
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
        .in-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
        }

        /* ============================================
           MODAL
           ============================================ */
        .in-modal-overlay {
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
        .in-modal {
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
        .in-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
          border-radius: 16px 16px 0 0;
        }
        .in-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .in-modal-icon {
          width: 28px;
          height: 28px;
          color: #013E37;
        }
        .in-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }
        .in-modal-close {
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
        .in-modal-close:hover {
          background: rgba(1, 62, 55, 0.1);
          opacity: 1;
          transform: rotate(90deg);
        }
        .in-modal-close-icon {
          width: 18px;
          height: 18px;
        }
        .in-modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .in-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .in-form-group:nth-child(1) { animation-delay: 0.05s; }
        .in-form-group:nth-child(2) { animation-delay: 0.1s; }
        .in-form-group:nth-child(3) { animation-delay: 0.15s; }
        .in-form-group:nth-child(4) { animation-delay: 0.2s; }
        .in-form-group:nth-child(5) { animation-delay: 0.25s; }
        .in-form-group:nth-child(6) { animation-delay: 0.3s; }
        .in-form-group:nth-child(7) { animation-delay: 0.35s; }
        .in-form-group:nth-child(8) { animation-delay: 0.4s; }
        .in-form-group:nth-child(9) { animation-delay: 0.45s; }
        .in-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }
        .in-form-required {
          color: #EF4444;
        }
        .in-form-input,
        .in-form-select,
        .in-form-textarea {
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
        .in-form-input:focus,
        .in-form-select:focus,
        .in-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .in-form-input::placeholder,
        .in-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.4;
        }
        .in-form-textarea {
          resize: vertical;
          min-height: 60px;
        }
        .in-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .in-form-section {
          background: #FFF9E6;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #FFEFB3;
        }
        .in-form-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
          margin: 0 0 12px 0;
        }
        .in-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #FFEFB3;
        }
        .in-form-cancel {
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
        .in-form-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .in-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .in-form-submit {
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
        .in-form-submit:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
        }
        .in-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .in-form-spinner {
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
          .in-header {
            flex-direction: column;
            align-items: stretch;
          }
          .in-header-right {
            flex-wrap: wrap;
          }
          .in-export-btn,
          .in-add-btn {
            flex: 1;
            justify-content: center;
          }
          .in-filters {
            flex-direction: column;
          }
          .in-search-wrapper {
            width: 100%;
          }
          .in-filter-select {
            width: 100%;
          }
          .in-grid {
            grid-template-columns: 1fr;
          }
          .in-title {
            font-size: 22px;
          }
          .in-title-icon {
            width: 40px;
            height: 40px;
          }
          .in-title-svg {
            width: 20px;
            height: 20px;
          }
          .in-form-grid {
            grid-template-columns: 1fr;
          }
          .in-modal {
            margin: 16px;
            max-height: 95vh;
          }
          .in-header-left {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .in-header-right {
            flex-direction: column;
          }
          .in-export-btn,
          .in-add-btn {
            width: 100%;
          }
          .in-icon-btn {
            align-self: flex-end;
          }
          .in-title-wrapper {
            gap: 10px;
          }
          .in-title {
            font-size: 20px;
          }
          .in-subtitle {
            font-size: 13px;
          }
          .in-modal {
            padding: 0;
          }
          .in-modal-header {
            padding: 16px 18px;
          }
          .in-modal-form {
            padding: 18px;
          }
          .in-form-actions {
            flex-direction: column;
          }
          .in-form-cancel,
          .in-form-submit {
            width: 100%;
            justify-content: center;
          }
          .in-card {
            padding: 16px;
          }
          .in-card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .in-card-platforms {
            flex-direction: column;
          }
        }

        /* Scrollbar */
        .in-modal::-webkit-scrollbar {
          width: 6px;
        }
        .in-modal::-webkit-scrollbar-track {
          background: #FFEFB3;
          border-radius: 8px;
        }
        .in-modal::-webkit-scrollbar-thumb {
          background: #013E37;
          border-radius: 8px;
        }
        .in-modal::-webkit-scrollbar-thumb:hover {
          background: #0A5C54;
        }
      `}</style>
    </>
  );
};

export default Influencers;