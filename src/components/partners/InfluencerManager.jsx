// pages/partners/InfluencerManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Star, Edit, Trash2, Eye, Plus,
  Search, Filter, Mail, Phone, Instagram,
  Youtube, Twitter, Facebook, Users,
  DollarSign, Calendar, Award, TrendingUp,
  CheckCircle, XCircle, AlertCircle, Clock,
  Download, RefreshCw, BarChart2, X,
  Globe, Linkedin, Video, Music, Camera,
  MessageCircle, Zap, Layers, Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

const InfluencerManager = () => {
  const { token } = useAuth();
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    platform: 'all'
  });
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    status: 'prospect',
    bio: '',
    email: '',
    phone: '',
    location: '',
    platforms: [],
    rates: {
      perPost: '',
      perCampaign: '',
      perStory: ''
    },
    availability: {
      status: 'available',
      nextAvailable: ''
    },
    collaborationHistory: [],
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
      if (filters.platform !== 'all') params.append('platform', filters.platform);

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
        name: 'Emma Tech',
        category: 'tech',
        status: 'active',
        bio: 'Tech reviewer and content creator passionate about gadgets and innovation.',
        email: 'emma@techcreator.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        platforms: [
          { name: 'youtube', handle: '@emmatech', followers: 2500000, engagement: 4.2 },
          { name: 'instagram', handle: '@emma.tech', followers: 850000, engagement: 3.8 },
          { name: 'twitter', handle: '@emma_tech', followers: 120000, engagement: 2.5 }
        ],
        rates: {
          perPost: 15000,
          perCampaign: 45000,
          perStory: 8000
        },
        availability: {
          status: 'available',
          nextAvailable: '2024-02-01'
        },
        collaborationHistory: [
          { campaignName: 'Tech Summit 2024', startDate: '2024-01-01', endDate: '2024-01-15', value: 25000 },
          { campaignName: 'Product Launch', startDate: '2023-11-01', endDate: '2023-12-01', value: 35000 }
        ],
        assignedTo: { firstName: 'John', lastName: 'Doe' }
      },
      {
        _id: '2',
        name: 'Travel With Sarah',
        category: 'travel',
        status: 'onboarded',
        bio: 'Wanderlust enthusiast sharing travel tips and adventures around the world.',
        email: 'sarah@travelblog.com',
        phone: '+1 (555) 234-5678',
        location: 'New York, NY',
        platforms: [
          { name: 'instagram', handle: '@sarah.travels', followers: 1200000, engagement: 5.1 },
          { name: 'youtube', handle: '@sarahtravels', followers: 450000, engagement: 3.9 }
        ],
        rates: {
          perPost: 12000,
          perCampaign: 35000,
          perStory: 6000
        },
        availability: {
          status: 'busy',
          nextAvailable: '2024-03-15'
        },
        collaborationHistory: [
          { campaignName: 'Summer Getaway', startDate: '2023-07-01', endDate: '2023-08-01', value: 20000 }
        ],
        assignedTo: { firstName: 'Sarah', lastName: 'Smith' }
      },
      {
        _id: '3',
        name: 'Fashion By Mia',
        category: 'fashion',
        status: 'interested',
        bio: 'Fashion influencer sharing style tips, outfit ideas, and sustainable fashion.',
        email: 'mia@fashionista.com',
        phone: '+1 (555) 345-6789',
        location: 'Los Angeles, CA',
        platforms: [
          { name: 'instagram', handle: '@mia.fashion', followers: 3500000, engagement: 4.8 },
          { name: 'tiktok', handle: '@miafashion', followers: 2800000, engagement: 5.2 }
        ],
        rates: {
          perPost: 20000,
          perCampaign: 60000,
          perStory: 10000
        },
        availability: {
          status: 'available',
          nextAvailable: '2024-02-15'
        },
        collaborationHistory: [],
        assignedTo: { firstName: 'Mike', lastName: 'Johnson' }
      },
      {
        _id: '4',
        name: 'Chef David',
        category: 'food',
        status: 'negotiating',
        bio: 'Professional chef creating delicious recipes and cooking tutorials.',
        email: 'david@chefkitchen.com',
        phone: '+1 (555) 456-7890',
        location: 'Chicago, IL',
        platforms: [
          { name: 'youtube', handle: '@chefdavid', followers: 1800000, engagement: 4.5 },
          { name: 'instagram', handle: '@chef.david', followers: 650000, engagement: 3.7 }
        ],
        rates: {
          perPost: 18000,
          perCampaign: 50000,
          perStory: 9000
        },
        availability: {
          status: 'available',
          nextAvailable: '2024-02-10'
        },
        collaborationHistory: [
          { campaignName: 'Holiday Recipes', startDate: '2023-11-15', endDate: '2023-12-15', value: 30000 }
        ],
        assignedTo: { firstName: 'Emily', lastName: 'Brown' }
      },
      {
        _id: '5',
        name: 'GamingWith Alex',
        category: 'gaming',
        status: 'prospect',
        bio: 'Professional gamer and content creator specializing in esports.',
        email: 'alex@gaminghub.com',
        phone: '+1 (555) 567-8901',
        location: 'Austin, TX',
        platforms: [
          { name: 'twitch', handle: '@alexgaming', followers: 2000000, engagement: 6.0 },
          { name: 'youtube', handle: '@alexgaming', followers: 850000, engagement: 4.1 },
          { name: 'instagram', handle: '@alex.gaming', followers: 200000, engagement: 2.8 }
        ],
        rates: {
          perPost: 10000,
          perCampaign: 30000,
          perStory: 5000
        },
        availability: {
          status: 'available',
          nextAvailable: '2024-02-20'
        },
        collaborationHistory: [],
        assignedTo: { firstName: 'David', lastName: 'Lee' }
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
          toast.success(editingInfluencer ? 'Influencer updated successfully!' : 'Influencer added successfully!');
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
        status: influencer.status || 'prospect',
        bio: influencer.bio || '',
        email: influencer.email || '',
        phone: influencer.phone || '',
        location: influencer.location || '',
        platforms: influencer.platforms || [],
        rates: {
          perPost: influencer.rates?.perPost || '',
          perCampaign: influencer.rates?.perCampaign || '',
          perStory: influencer.rates?.perStory || ''
        },
        availability: {
          status: influencer.availability?.status || 'available',
          nextAvailable: influencer.availability?.nextAvailable || ''
        },
        collaborationHistory: influencer.collaborationHistory || [],
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
      status: 'prospect',
      bio: '',
      email: '',
      phone: '',
      location: '',
      platforms: [],
      rates: {
        perPost: '',
        perCampaign: '',
        perStory: ''
      },
      availability: {
        status: 'available',
        nextAvailable: ''
      },
      collaborationHistory: [],
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

  const handlePlatformAdd = (platform) => {
    if (platform.name.trim()) {
      setFormData(prev => ({
        ...prev,
        platforms: [...prev.platforms, { 
          name: platform.name,
          handle: platform.handle || '',
          followers: platform.followers || 0,
          engagement: platform.engagement || 0
        }]
      }));
    }
  };

  const handlePlatformRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'im-status-active',
      'onboarded': 'im-status-onboarded',
      'interested': 'im-status-interested',
      'negotiating': 'im-status-negotiating',
      'prospect': 'im-status-prospect',
      'inactive': 'im-status-inactive'
    };
    return colors[status] || 'im-status-default';
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
    if (status === 'active') return <CheckCircle className="im-status-icon im-icon-green" />;
    if (status === 'onboarded') return <CheckCircle className="im-status-icon im-icon-blue" />;
    if (status === 'interested') return <Clock className="im-status-icon im-icon-yellow" />;
    if (status === 'negotiating') return <Clock className="im-status-icon im-icon-purple" />;
    if (status === 'inactive') return <XCircle className="im-status-icon im-icon-red" />;
    return <AlertCircle className="im-status-icon im-icon-gray" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'tech': 'im-category-tech',
      'lifestyle': 'im-category-lifestyle',
      'education': 'im-category-education',
      'entertainment': 'im-category-entertainment',
      'fashion': 'im-category-fashion',
      'food': 'im-category-food',
      'travel': 'im-category-travel',
      'business': 'im-category-business',
      'gaming': 'im-category-gaming',
      'fitness': 'im-category-fitness'
    };
    return colors[category] || 'im-category-default';
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
      'gaming': 'Gaming',
      'fitness': 'Fitness'
    };
    return labels[category] || category || 'No category';
  };

  const getPlatformIcon = (platformName) => {
    const icons = {
      'instagram': Instagram,
      'youtube': Youtube,
      'twitter': Twitter,
      'facebook': Facebook,
      'linkedin': Linkedin,
      'tiktok': Video,
      'twitch': Music,
      'snapchat': Camera,
      'pinterest': Hash
    };
    const Icon = icons[platformName?.toLowerCase()] || Users;
    return Icon;
  };

  const getPlatformColor = (platformName) => {
    const colors = {
      'instagram': 'im-platform-instagram',
      'youtube': 'im-platform-youtube',
      'twitter': 'im-platform-twitter',
      'facebook': 'im-platform-facebook',
      'linkedin': 'im-platform-linkedin',
      'tiktok': 'im-platform-tiktok',
      'twitch': 'im-platform-twitch',
      'snapchat': 'im-platform-snapchat'
    };
    return colors[platformName?.toLowerCase()] || 'im-platform-default';
  };

  const formatFollowers = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'tech', label: 'Tech' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'food', label: 'Food' },
    { value: 'travel', label: 'Travel' },
    { value: 'business', label: 'Business' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'fitness', label: 'Fitness' }
  ];

  const platforms = [
    { value: 'all', label: 'All Platforms' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'twitch', label: 'Twitch' },
    { value: 'snapchat', label: 'Snapchat' }
  ];

  const platformOptions = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'twitch', label: 'Twitch' },
    { value: 'snapchat', label: 'Snapchat' }
  ];

  if (loading) {
    return (
      <div className="im-loading">
        <div className="im-spinner"></div>
        <p className="im-loading-text">Loading influencers...</p>
      </div>
    );
  }

  return (
    <div className="im-container">
      {/* Header */}
      <div className="im-header">
        <div className="im-header-left">
          <div className="im-title-wrapper">
            <div className="im-title-icon">
              <Star className="im-title-svg" />
            </div>
            <div>
              <h3 className="im-title">Influencers</h3>
              <p className="im-subtitle">Manage influencer partnerships and collaborations</p>
            </div>
          </div>
          <span className="im-count">{influencers.length} influencers</span>
        </div>
        <div className="im-header-right">
          <button className="im-icon-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`im-refresh-icon ${refreshing ? 'im-spin' : ''}`} />
          </button>
          <button className="im-icon-btn">
            <Download className="im-btn-icon" />
          </button>
          <button 
            onClick={() => openModal()}
            className="im-add-btn"
          >
            <Plus className="im-btn-icon" />
            Add Influencer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="im-stats">
        <div className="im-stat-card">
          <div className="im-stat-icon im-stat-total">
            <Star className="im-stat-svg" />
          </div>
          <div className="im-stat-info">
            <span className="im-stat-value">{influencers.length}</span>
            <span className="im-stat-label">Total Influencers</span>
          </div>
        </div>
        <div className="im-stat-card">
          <div className="im-stat-icon im-stat-active">
            <CheckCircle className="im-stat-svg" />
          </div>
          <div className="im-stat-info">
            <span className="im-stat-value">{influencers.filter(i => i.status === 'active').length}</span>
            <span className="im-stat-label">Active Partners</span>
          </div>
        </div>
        <div className="im-stat-card">
          <div className="im-stat-icon im-stat-engagement">
            <TrendingUp className="im-stat-svg" />
          </div>
          <div className="im-stat-info">
            <span className="im-stat-value">
              {influencers.reduce((acc, i) => {
                const totalEngagement = i.platforms?.reduce((sum, p) => sum + (p.engagement || 0), 0) || 0;
                return acc + totalEngagement;
              }, 0) || 0}
            </span>
            <span className="im-stat-label">Total Engagement</span>
          </div>
        </div>
        <div className="im-stat-card">
          <div className="im-stat-icon im-stat-interested">
            <Users className="im-stat-svg" />
          </div>
          <div className="im-stat-info">
            <span className="im-stat-value">
              {influencers.reduce((acc, i) => acc + (i.platforms?.reduce((sum, p) => sum + (p.followers || 0), 0) || 0), 0)}
            </span>
            <span className="im-stat-label">Total Followers</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="im-filters">
        <div className="im-search-wrapper">
          <Search className="im-search-icon" />
          <input
            type="text"
            placeholder="Search influencers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="im-search-input"
          />
          {search && (
            <button className="im-search-clear" onClick={() => setSearch('')}>
              <X className="im-search-clear-icon" />
            </button>
          )}
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="im-filter-select"
        >
          {statuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          className="im-filter-select"
        >
          {categories.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={filters.platform}
          onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
          className="im-filter-select"
        >
          {platforms.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Influencers Grid */}
      <div className="im-grid">
        {influencers.map((influencer) => (
          <div 
            key={influencer._id} 
            className="im-card"
            onClick={() => {
              setSelectedInfluencer(influencer);
              setShowDetails(true);
            }}
          >
            <div className="im-card-header">
              <div className="im-card-left">
                <div className="im-card-icon">
                  <Star className="im-card-icon-svg" />
                </div>
                <div className="im-card-info">
                  <h4 className="im-card-title">{influencer.name}</h4>
                  <div className="im-card-tags">
                    <span className={`im-card-category ${getCategoryColor(influencer.category)}`}>
                      {getCategoryLabel(influencer.category)}
                    </span>
                    {influencer.location && (
                      <span className="im-card-location">
                        <MapPin className="im-card-location-icon" />
                        {influencer.location.split(',').slice(0, 2).join(',')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className={`im-card-status ${getStatusColor(influencer.status)}`}>
                {getStatusIcon(influencer.status)}
                {getStatusLabel(influencer.status)}
              </span>
            </div>
            
            {influencer.bio && (
              <p className="im-card-desc">{influencer.bio}</p>
            )}
            
            {/* Platforms */}
            {influencer.platforms && influencer.platforms.length > 0 && (
              <div className="im-card-platforms">
                {influencer.platforms.map((platform, idx) => {
                  const PlatformIcon = getPlatformIcon(platform.name);
                  return (
                    <div key={idx} className={`im-card-platform ${getPlatformColor(platform.name)}`}>
                      <PlatformIcon className="im-card-platform-icon" />
                      <span className="im-card-platform-handle">{platform.handle}</span>
                      <span className="im-card-platform-followers">
                        {formatFollowers(platform.followers)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Rates */}
            {influencer.rates && (influencer.rates.perPost || influencer.rates.perCampaign) && (
              <div className="im-card-rates">
                {influencer.rates.perPost && (
                  <span className="im-rate">
                    <DollarSign className="im-rate-icon" />
                    Post: ${influencer.rates.perPost.toLocaleString()}
                  </span>
                )}
                {influencer.rates.perCampaign && (
                  <span className="im-rate">
                    <DollarSign className="im-rate-icon" />
                    Campaign: ${influencer.rates.perCampaign.toLocaleString()}
                  </span>
                )}
                {influencer.rates.perStory && (
                  <span className="im-rate">
                    <DollarSign className="im-rate-icon" />
                    Story: ${influencer.rates.perStory.toLocaleString()}
                  </span>
                )}
              </div>
            )}
            
            {influencer.availability && (
              <div className="im-card-availability">
                <span className={`im-availability-status ${
                  influencer.availability.status === 'available' ? 'im-avail-available' :
                  influencer.availability.status === 'busy' ? 'im-avail-busy' :
                  'im-avail-booked'
                }`}>
                  {influencer.availability.status}
                </span>
                {influencer.availability.nextAvailable && (
                  <span className="im-availability-date">
                    Next: {new Date(influencer.availability.nextAvailable).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
            
            <div className="im-card-footer">
              <div className="im-card-assignee">
                <span className="im-assignee-label">Assigned:</span>
                <span className="im-assignee-name">
                  {influencer.assignedTo?.firstName} {influencer.assignedTo?.lastName || 'Unassigned'}
                </span>
              </div>
              <div className="im-card-actions">
                <button 
                  className="im-action-btn im-action-view"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedInfluencer(influencer);
                    setShowDetails(true);
                  }}
                  title="View"
                >
                  <Eye className="im-action-icon" />
                </button>
                <button 
                  className="im-action-btn im-action-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(influencer);
                  }}
                  title="Edit"
                >
                  <Edit className="im-action-icon" />
                </button>
                <button 
                  className="im-action-btn im-action-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(influencer._id);
                  }}
                  title="Delete"
                >
                  <Trash2 className="im-action-icon" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {influencers.length === 0 && (
        <div className="im-empty">
          <div className="im-empty-icon-wrapper">
            <Star className="im-empty-icon" />
          </div>
          <h3 className="im-empty-title">No influencers found</h3>
          <p className="im-empty-subtitle">Start by adding your first influencer</p>
          <button className="im-empty-btn" onClick={() => openModal()}>
            <Plus className="im-btn-icon" />
            Add Influencer
          </button>
        </div>
      )}

      {/* Influencer Details Modal */}
      {showDetails && selectedInfluencer && (
        <div className="im-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="im-modal im-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="im-modal-header">
              <div className="im-modal-title-wrapper">
                <div className="im-modal-icon-wrapper">
                  <Star className="im-modal-icon" />
                </div>
                <div>
                  <h2 className="im-modal-title">{selectedInfluencer.name}</h2>
                  <p className="im-modal-subtitle">{getCategoryLabel(selectedInfluencer.category)} • {selectedInfluencer.location || 'Location TBD'}</p>
                </div>
              </div>
              <button className="im-modal-close" onClick={() => setShowDetails(false)}>
                <X className="im-modal-close-icon" />
              </button>
            </div>
            
            <div className="im-modal-body">
              <div className="im-modal-section">
                <h4 className="im-modal-label">Bio</h4>
                <p className="im-modal-text">{selectedInfluencer.bio || 'No bio provided'}</p>
              </div>
              
              <div className="im-modal-grid">
                <div className="im-modal-item">
                  <h4 className="im-modal-label">Status</h4>
                  <span className={`im-modal-status ${getStatusColor(selectedInfluencer.status)}`}>
                    {getStatusLabel(selectedInfluencer.status)}
                  </span>
                </div>
                <div className="im-modal-item">
                  <h4 className="im-modal-label">Category</h4>
                  <p className="im-modal-value">{getCategoryLabel(selectedInfluencer.category)}</p>
                </div>
              </div>

              {/* Platforms */}
              {selectedInfluencer.platforms && selectedInfluencer.platforms.length > 0 && (
                <div className="im-modal-section">
                  <h4 className="im-modal-label">Platforms</h4>
                  <div className="im-modal-platforms">
                    {selectedInfluencer.platforms.map((platform, idx) => {
                      const PlatformIcon = getPlatformIcon(platform.name);
                      return (
                        <div key={idx} className={`im-modal-platform ${getPlatformColor(platform.name)}`}>
                          <PlatformIcon className="im-modal-platform-icon" />
                          <span className="im-modal-platform-name">{platform.name}</span>
                          <span className="im-modal-platform-handle">{platform.handle}</span>
                          <span className="im-modal-platform-followers">
                            {formatFollowers(platform.followers)} followers
                          </span>
                          {platform.engagement && (
                            <span className="im-modal-platform-engagement">
                              {platform.engagement}% engagement
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rates */}
              {selectedInfluencer.rates && (selectedInfluencer.rates.perPost || selectedInfluencer.rates.perCampaign) && (
                <div className="im-modal-section">
                  <h4 className="im-modal-label">Rates</h4>
                  <div className="im-modal-rates">
                    {selectedInfluencer.rates.perPost && (
                      <div className="im-modal-rate">
                        <span className="im-modal-rate-label">Per Post</span>
                        <span className="im-modal-rate-value">${selectedInfluencer.rates.perPost.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedInfluencer.rates.perCampaign && (
                      <div className="im-modal-rate">
                        <span className="im-modal-rate-label">Per Campaign</span>
                        <span className="im-modal-rate-value">${selectedInfluencer.rates.perCampaign.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedInfluencer.rates.perStory && (
                      <div className="im-modal-rate">
                        <span className="im-modal-rate-label">Per Story</span>
                        <span className="im-modal-rate-value">${selectedInfluencer.rates.perStory.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Availability */}
              {selectedInfluencer.availability && (
                <div className="im-modal-section">
                  <h4 className="im-modal-label">Availability</h4>
                  <div className="im-modal-availability">
                    <span className={`im-modal-availability-status ${
                      selectedInfluencer.availability.status === 'available' ? 'im-avail-available' :
                      selectedInfluencer.availability.status === 'busy' ? 'im-avail-busy' :
                      'im-avail-booked'
                    }`}>
                      {selectedInfluencer.availability.status}
                    </span>
                    {selectedInfluencer.availability.nextAvailable && (
                      <span className="im-modal-availability-date">
                        Next available: {new Date(selectedInfluencer.availability.nextAvailable).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Collaboration History */}
              {selectedInfluencer.collaborationHistory && selectedInfluencer.collaborationHistory.length > 0 && (
                <div className="im-modal-section">
                  <h4 className="im-modal-label">Collaboration History</h4>
                  <div className="im-modal-collabs">
                    {selectedInfluencer.collaborationHistory.map((collab, idx) => (
                      <div key={idx} className="im-modal-collab">
                        <div className="im-modal-collab-header">
                          <span className="im-modal-collab-name">{collab.campaignName}</span>
                          <span className="im-modal-collab-value">${collab.value.toLocaleString()}</span>
                        </div>
                        <span className="im-modal-collab-dates">
                          {new Date(collab.startDate).toLocaleDateString()} - {new Date(collab.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="im-modal-section">
                <h4 className="im-modal-label">Contact Information</h4>
                <div className="im-modal-contact">
                  {selectedInfluencer.email && (
                    <p className="im-modal-contact-item">
                      <Mail className="im-modal-contact-icon" />
                      {selectedInfluencer.email}
                    </p>
                  )}
                  {selectedInfluencer.phone && (
                    <p className="im-modal-contact-item">
                      <Phone className="im-modal-contact-icon" />
                      {selectedInfluencer.phone}
                    </p>
                  )}
                  {selectedInfluencer.location && (
                    <p className="im-modal-contact-item">
                      <MapPin className="im-modal-contact-icon" />
                      {selectedInfluencer.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="im-modal-footer">
              <button
                onClick={() => setShowDetails(false)}
                className="im-modal-cancel"
              >
                Close
              </button>
              <button 
                className="im-modal-edit"
                onClick={() => {
                  setShowDetails(false);
                  openModal(selectedInfluencer);
                }}
              >
                <Edit className="im-btn-icon" />
                Edit Influencer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="im-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="im-modal im-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="im-modal-header">
              <div className="im-modal-title-wrapper">
                <Star className="im-modal-icon" />
                <h2 className="im-modal-title">
                  {editingInfluencer ? 'Edit Influencer' : 'Add New Influencer'}
                </h2>
              </div>
              <button className="im-modal-close" onClick={() => setShowModal(false)}>
                <X className="im-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="im-modal-form">
              <div className="im-form-group">
                <label className="im-form-label">
                  Influencer Name <span className="im-form-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="im-form-input"
                  placeholder="Enter influencer name"
                  autoFocus
                />
              </div>

              <div className="im-form-grid">
                <div className="im-form-group">
                  <label className="im-form-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="im-form-select"
                  >
                    <option value="">Select category</option>
                    {categories.filter(c => c.value !== 'all').map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="im-form-group">
                  <label className="im-form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="im-form-select"
                  >
                    {statuses.filter(s => s.value !== 'all').map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="im-form-group">
                <label className="im-form-label">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="im-form-textarea"
                  rows="2"
                  placeholder="Brief bio of the influencer"
                />
              </div>

              <div className="im-form-section">
                <h4 className="im-form-section-title">Rates</h4>
                <div className="im-form-grid">
                  <div className="im-form-group">
                    <label className="im-form-label">Per Post ($)</label>
                    <input
                      type="number"
                      value={formData.rates.perPost}
                      onChange={(e) => handleChange('rates.perPost', e.target.value)}
                      className="im-form-input"
                      placeholder="0"
                    />
                  </div>
                  <div className="im-form-group">
                    <label className="im-form-label">Per Campaign ($)</label>
                    <input
                      type="number"
                      value={formData.rates.perCampaign}
                      onChange={(e) => handleChange('rates.perCampaign', e.target.value)}
                      className="im-form-input"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="im-form-group">
                  <label className="im-form-label">Per Story ($)</label>
                  <input
                    type="number"
                    value={formData.rates.perStory}
                    onChange={(e) => handleChange('rates.perStory', e.target.value)}
                    className="im-form-input"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="im-form-section">
                <h4 className="im-form-section-title">Availability</h4>
                <div className="im-form-grid">
                  <div className="im-form-group">
                    <label className="im-form-label">Status</label>
                    <select
                      value={formData.availability.status}
                      onChange={(e) => handleChange('availability.status', e.target.value)}
                      className="im-form-select"
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="booked">Booked</option>
                    </select>
                  </div>
                  <div className="im-form-group">
                    <label className="im-form-label">Next Available</label>
                    <input
                      type="date"
                      value={formData.availability.nextAvailable}
                      onChange={(e) => handleChange('availability.nextAvailable', e.target.value)}
                      className="im-form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="im-form-section">
                <h4 className="im-form-section-title">Contact Information</h4>
                <div className="im-form-grid">
                  <div className="im-form-group">
                    <label className="im-form-label">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="im-form-input"
                      placeholder="influencer@example.com"
                    />
                  </div>
                  <div className="im-form-group">
                    <label className="im-form-label">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="im-form-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div className="im-form-group">
                  <label className="im-form-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="im-form-input"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="im-form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="im-form-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="im-form-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="im-form-spinner"></div>
                      {editingInfluencer ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="im-btn-icon" />
                      {editingInfluencer ? 'Update Influencer' : 'Add Influencer'}
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
        .im-container {
          padding: 20px 24px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: imFadeIn 0.4s ease;
        }

        @keyframes imFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .im-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .im-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #ec4899;
          border-radius: 50%;
          animation: imSpin 0.8s linear infinite;
        }

        .im-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes imSpin {
          to { transform: rotate(360deg); }
        }

        .im-spin {
          animation: imSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .im-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .im-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .im-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .im-title-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #ec4899, #db2777);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.25);
        }

        .im-title-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .im-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .im-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .im-count {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 14px;
          border-radius: 12px;
        }

        .im-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .im-icon-btn {
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

        .im-icon-btn:hover {
          background: #f1f5f9;
        }

        .im-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .im-btn-icon {
          width: 16px;
          height: 16px;
        }

        .im-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #ec4899, #db2777);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(236, 72, 153, 0.3);
        }

        .im-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
        }

        /* ============================================
           STATS
           ============================================ */
        .im-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .im-stat-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s ease;
        }

        .im-stat-card:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .im-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .im-stat-total { background: #fce7f3; }
        .im-stat-active { background: #d1fae5; }
        .im-stat-engagement { background: #dbeafe; }
        .im-stat-interested { background: #fef3c7; }

        .im-stat-svg {
          width: 20px;
          height: 20px;
        }

        .im-stat-total .im-stat-svg { color: #ec4899; }
        .im-stat-active .im-stat-svg { color: #059669; }
        .im-stat-engagement .im-stat-svg { color: #2563eb; }
        .im-stat-interested .im-stat-svg { color: #d97706; }

        .im-stat-info {
          display: flex;
          flex-direction: column;
        }

        .im-stat-value {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .im-stat-label {
          font-size: 13px;
          color: #64748b;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .im-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .im-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .im-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .im-search-input {
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

        .im-search-input:focus {
          border-color: #ec4899;
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
        }

        .im-search-clear {
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

        .im-search-clear:hover {
          background: #f1f5f9;
        }

        .im-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .im-filter-select {
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

        .im-filter-select:focus {
          border-color: #ec4899;
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
        }

        /* ============================================
           GRID
           ============================================ */
        .im-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .im-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          animation: imSlideUp 0.4s ease both;
        }

        .im-card:nth-child(1) { animation-delay: 0.05s; }
        .im-card:nth-child(2) { animation-delay: 0.1s; }
        .im-card:nth-child(3) { animation-delay: 0.15s; }

        @keyframes imSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .im-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: #d1d5db;
        }

        .im-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .im-card-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .im-card-icon {
          width: 44px;
          height: 44px;
          background: #fce7f3;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .im-card-icon-svg {
          width: 22px;
          height: 22px;
          color: #ec4899;
        }

        .im-card-info {
          flex: 1;
          min-width: 0;
        }

        .im-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .im-card-tags {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
          flex-wrap: wrap;
        }

        .im-card-category {
          font-size: 11px;
          font-weight: 500;
          padding: 1px 10px;
          border-radius: 9999px;
        }

        .im-category-tech { background: #dbeafe; color: #1d4ed8; }
        .im-category-lifestyle { background: #fce7f3; color: #9d174d; }
        .im-category-education { background: #f3e8ff; color: #6d28d9; }
        .im-category-entertainment { background: #fef3c7; color: #92400e; }
        .im-category-fashion { background: #fecdd3; color: #9f1239; }
        .im-category-food { background: #ffedd5; color: #9a3412; }
        .im-category-travel { background: #ccfbf1; color: #0f766e; }
        .im-category-business { background: #e0e7ff; color: #3730a3; }
        .im-category-gaming { background: #ede9fe; color: #5b21b6; }
        .im-category-fitness { background: #d1fae5; color: #065f46; }
        .im-category-default { background: #f1f5f9; color: #475569; }

        .im-card-location {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;
          color: #64748b;
        }

        .im-card-location-icon {
          width: 12px;
          height: 12px;
        }

        .im-card-status {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        .im-status-active { background: #d1fae5; color: #065f46; }
        .im-status-onboarded { background: #dbeafe; color: #1d4ed8; }
        .im-status-interested { background: #fef3c7; color: #92400e; }
        .im-status-negotiating { background: #f3e8ff; color: #6d28d9; }
        .im-status-prospect { background: #f1f5f9; color: #475569; }
        .im-status-inactive { background: #fee2e2; color: #991b1b; }
        .im-status-default { background: #f1f5f9; color: #475569; }

        .im-status-icon {
          width: 14px;
          height: 14px;
        }

        .im-icon-green { color: #22c55e; }
        .im-icon-blue { color: #3b82f6; }
        .im-icon-yellow { color: #f59e0b; }
        .im-icon-purple { color: #8b5cf6; }
        .im-icon-red { color: #ef4444; }
        .im-icon-gray { color: #94a3b8; }

        .im-card-desc {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .im-card-platforms {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .im-card-platform {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
        }

        .im-platform-instagram { background: #fce7f3; color: #9d174d; }
        .im-platform-youtube { background: #fee2e2; color: #991b1b; }
        .im-platform-twitter { background: #dbeafe; color: #1d4ed8; }
        .im-platform-facebook { background: #dbeafe; color: #1d4ed8; }
        .im-platform-linkedin { background: #dbeafe; color: #1d4ed8; }
        .im-platform-tiktok { background: #f1f5f9; color: #475569; }
        .im-platform-twitch { background: #ede9fe; color: #5b21b6; }
        .im-platform-snapchat { background: #fef3c7; color: #92400e; }
        .im-platform-default { background: #f1f5f9; color: #475569; }

        .im-card-platform-icon {
          width: 14px;
          height: 14px;
        }

        .im-card-platform-handle {
          font-weight: 500;
        }

        .im-card-platform-followers {
          color: #64748b;
          font-weight: 400;
        }

        .im-card-rates {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }

        .im-rate {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 12px;
          padding: 2px 10px;
          background: #f1f5f9;
          border-radius: 4px;
          color: #475569;
        }

        .im-rate-icon {
          width: 12px;
          height: 12px;
          color: #94a3b8;
        }

        .im-card-availability {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .im-availability-status {
          font-size: 12px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 4px;
        }

        .im-avail-available { background: #d1fae5; color: #065f46; }
        .im-avail-busy { background: #fee2e2; color: #991b1b; }
        .im-avail-booked { background: #fef3c7; color: #92400e; }

        .im-availability-date {
          font-size: 12px;
          color: #94a3b8;
        }

        .im-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .im-card-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #64748b;
        }

        .im-assignee-label {
          color: #94a3b8;
        }

        .im-assignee-name {
          font-weight: 500;
          color: #0f172a;
        }

        .im-card-actions {
          display: flex;
          gap: 4px;
        }

        .im-action-btn {
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

        .im-action-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .im-action-view:hover {
          background: #eff6ff;
          color: #3b82f6;
        }

        .im-action-edit:hover {
          background: #ecfdf5;
          color: #22c55e;
        }

        .im-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .im-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .im-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .im-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #fce7f3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .im-empty-icon {
          width: 36px;
          height: 36px;
          color: #ec4899;
        }

        .im-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .im-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .im-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #ec4899, #db2777);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(236, 72, 153, 0.25);
        }

        .im-empty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(236, 72, 153, 0.35);
        }

        /* ============================================
           MODAL
           ============================================ */
        .im-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: imFadeIn 0.3s ease;
        }

        .im-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: imModalIn 0.3s ease;
        }

        .im-modal-lg {
          max-width: 680px;
        }

        @keyframes imModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .im-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .im-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .im-modal-icon-wrapper {
          width: 44px;
          height: 44px;
          background: #fce7f3;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .im-modal-icon {
          width: 22px;
          height: 22px;
          color: #ec4899;
        }

        .im-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .im-modal-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .im-modal-close {
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

        .im-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .im-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        .im-modal-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .im-modal-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .im-modal-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .im-modal-text {
          font-size: 14px;
          color: #0f172a;
          margin: 0;
        }

        .im-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .im-modal-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .im-modal-value {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
          margin: 0;
        }

        .im-modal-status {
          font-size: 13px;
          font-weight: 500;
          padding: 2px 12px;
          border-radius: 12px;
          display: inline-block;
          width: fit-content;
        }

        .im-modal-platforms {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .im-modal-platform {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }

        .im-modal-platform-icon {
          width: 16px;
          height: 16px;
        }

        .im-modal-platform-name {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
        }

        .im-modal-platform-handle {
          font-size: 13px;
          color: #64748b;
        }

        .im-modal-platform-followers {
          font-size: 12px;
          color: #94a3b8;
        }

        .im-modal-platform-engagement {
          font-size: 12px;
          padding: 1px 8px;
          background: #d1fae5;
          color: #065f46;
          border-radius: 4px;
        }

        .im-modal-rates {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .im-modal-rate {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #f1f5f9;
          border-radius: 6px;
        }

        .im-modal-rate-label {
          font-size: 12px;
          color: #64748b;
        }

        .im-modal-rate-value {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .im-modal-availability {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .im-modal-availability-status {
          font-size: 13px;
          font-weight: 500;
          padding: 2px 12px;
          border-radius: 6px;
        }

        .im-modal-availability-date {
          font-size: 13px;
          color: #64748b;
        }

        .im-modal-collabs {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .im-modal-collab {
          display: flex;
          flex-direction: column;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .im-modal-collab-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .im-modal-collab-name {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .im-modal-collab-value {
          font-size: 14px;
          font-weight: 600;
          color: #059669;
        }

        .im-modal-collab-dates {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .im-modal-contact {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
        }

        .im-modal-contact-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #0f172a;
          margin: 4px 0;
        }

        .im-modal-contact-item:first-child {
          margin-top: 0;
        }

        .im-modal-contact-item:last-child {
          margin-bottom: 0;
        }

        .im-modal-contact-icon {
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .im-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
        }

        .im-modal-cancel {
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

        .im-modal-cancel:hover {
          background: #f1f5f9;
        }

        .im-modal-edit {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #ec4899, #db2777);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(236, 72, 153, 0.25);
        }

        .im-modal-edit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(236, 72, 153, 0.35);
        }

        /* ============================================
           FORM
           ============================================ */
        .im-modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .im-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .im-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .im-form-required {
          color: #ef4444;
        }

        .im-form-input,
        .im-form-select,
        .im-form-textarea {
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

        .im-form-input:focus,
        .im-form-select:focus,
        .im-form-textarea:focus {
          border-color: #ec4899;
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
        }

        .im-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .im-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .im-form-section {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }

        .im-form-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 12px 0;
        }

        .im-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .im-form-cancel {
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

        .im-form-cancel:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .im-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .im-form-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #ec4899, #db2777);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(236, 72, 153, 0.25);
        }

        .im-form-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(236, 72, 153, 0.35);
        }

        .im-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .im-form-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: imSpin 0.8s linear infinite;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .im-container {
            padding: 16px;
          }

          .im-header {
            flex-direction: column;
            align-items: stretch;
          }

          .im-header-right {
            flex-wrap: wrap;
          }

          .im-add-btn {
            flex: 1;
            justify-content: center;
          }

          .im-filters {
            flex-direction: column;
          }

          .im-search-wrapper {
            width: 100%;
          }

          .im-filter-select {
            width: 100%;
          }

          .im-grid {
            grid-template-columns: 1fr;
          }

          .im-stats {
            grid-template-columns: 1fr 1fr;
          }

          .im-title {
            font-size: 22px;
          }

          .im-title-icon {
            width: 40px;
            height: 40px;
          }

          .im-title-svg {
            width: 20px;
            height: 20px;
          }

          .im-modal {
            margin: 16px;
            max-height: 95vh;
          }

          .im-modal-grid {
            grid-template-columns: 1fr;
          }

          .im-form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .im-container {
            padding: 12px;
          }

          .im-header-right {
            flex-direction: column;
          }

          .im-add-btn {
            width: 100%;
          }

          .im-icon-btn {
            align-self: flex-end;
          }

          .im-title-wrapper {
            gap: 10px;
          }

          .im-title {
            font-size: 20px;
          }

          .im-subtitle {
            font-size: 13px;
          }

          .im-stats {
            grid-template-columns: 1fr;
          }

          .im-modal {
            padding: 0;
          }

          .im-modal-header {
            padding: 16px 18px;
          }

          .im-modal-body {
            padding: 16px 18px;
          }

          .im-modal-footer {
            flex-direction: column;
          }

          .im-modal-cancel,
          .im-modal-edit {
            width: 100%;
            justify-content: center;
          }

          .im-modal-form {
            padding: 18px;
          }

          .im-form-actions {
            flex-direction: column;
          }

          .im-form-cancel,
          .im-form-submit {
            width: 100%;
            justify-content: center;
          }
        }

        /* Scrollbar */
        .im-modal::-webkit-scrollbar {
          width: 6px;
        }

        .im-modal::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }

        .im-modal::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }

        .im-modal::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default InfluencerManager;