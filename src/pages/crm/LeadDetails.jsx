// pages/crm/LeadDetails.jsx - COMPLETE MODERN RESPONSIVE VERSION
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Globe,
  Building2, Users, Calendar, Clock, CheckCircle, Save, X,
  UserCheck, TrendingUp, UserX, Award, Target, Briefcase
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeadDetails = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const isCreateMode = !id || id === 'new' || id === '';
  
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState('');
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    country: 'USA',
    city: '',
    companySize: 'N/A',
    industry: '',
    timezone: 'America/New_York',
    leadSource: 'Website',
    pipelineType: 'US_OUTREACH',
    currentStage: 'SCRAPED_SOURCED',
    status: 'active',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    if (isCreateMode) {
      setLoading(false);
      setFormData(prev => ({
        ...prev,
        currentStage: prev.pipelineType === 'US_OUTREACH' ? 'SCRAPED_SOURCED' : 'INQUIRY'
      }));
    } else if (id) {
      fetchLead();
    } else {
      navigate('/crm/leads');
    }
  }, [id]);

  const fetchLead = async () => {
    if (!id || id === 'new' || id === '') {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/crm/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        setLead(response.data.data);
      } else {
        toast.error('Lead not found');
        navigate('/crm/leads');
      }
    } catch (err) {
      console.error('Error fetching lead:', err);
      let errorMessage = 'Failed to load lead details.';
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Lead not found.';
          navigate('/crm/leads');
        } else if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'pipelineType') {
      setFormData(prev => ({
        ...prev,
        currentStage: value === 'US_OUTREACH' ? 'SCRAPED_SOURCED' : 'INQUIRY'
      }));
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.contactName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${API_URL}/crm/leads`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        toast.success('Lead created successfully!');
        const newLead = response.data.data;
        navigate(`/crm/leads/${newLead._id}`);
      } else {
        toast.error(response.data?.message || 'Failed to create lead.');
      }
    } catch (err) {
      console.error('Error creating lead:', err);
      toast.error(err.response?.data?.message || 'Failed to create lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStageChange = async () => {
    if (!selectedStage) {
      toast.error('Please select a stage');
      return;
    }
    
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/crm/leads/${id}/stage`, 
        { stage: selectedStage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Stage updated successfully');
      setShowStageModal(false);
      setSelectedStage('');
      await fetchLead();
    } catch (err) {
      console.error('Error updating stage:', err);
      toast.error(err.response?.data?.message || 'Failed to update stage.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/crm/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Lead deleted successfully');
      navigate('/crm/leads');
    } catch (err) {
      console.error('Error deleting lead:', err);
      toast.error(err.response?.data?.message || 'Failed to delete lead.');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleConvert = async () => {
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/crm/leads/${id}/convert`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Lead converted to client successfully!');
      setShowConvertModal(false);
      navigate('/crm/leads');
    } catch (err) {
      console.error('Error converting lead:', err);
      toast.error(err.response?.data?.message || 'Failed to convert lead.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      active: { backgroundColor: '#E8F5E9', color: '#013E37', icon: CheckCircle },
      stale: { backgroundColor: '#FFEFB3', color: '#013E37', icon: Clock },
      converted: { backgroundColor: '#E8F5E9', color: '#013E37', icon: UserCheck },
      lost: { backgroundColor: '#FFEBEE', color: '#D32F2F', icon: UserX },
    };
    return styles[status] || styles.active;
  };

  const getStageColor = (stage) => {
    const colors = {
      SCRAPED_SOURCED: '#013E37',
      INITIAL_VERIFICATION: '#0A5C54',
      FIRST_SEQUENCE_SENT: '#1A7A6E',
      FOLLOW_UP_PROTOCOL: '#2A9888',
      DISCOVERY_CALL_SCHEDULED: '#3AB6A2',
      PROPOSAL_PITCHED: '#4AD4BC',
      NEGOTIATING: '#5AF2D6',
      WON: '#013E37',
      LOST: '#D32F2F',
      INQUIRY: '#013E37',
      BRIEFING_DISCOVERY: '#0A5C54',
      AUDIT_PRESENTATION: '#1A7A6E',
      COMMERCIAL_PROPOSAL: '#2A9888',
      CONTRACT_SIGNING: '#3AB6A2',
      ONBOARDING: '#4AD4BC'
    };
    return colors[stage] || '#013E37';
  };

  const getStages = () => {
    if (!lead) return [];
    return lead.pipelineType === 'US_OUTREACH' 
      ? ['SCRAPED_SOURCED', 'INITIAL_VERIFICATION', 'FIRST_SEQUENCE_SENT', 
         'FOLLOW_UP_PROTOCOL', 'DISCOVERY_CALL_SCHEDULED', 'PROPOSAL_PITCHED', 
         'NEGOTIATING', 'WON', 'LOST']
      : ['INQUIRY', 'BRIEFING_DISCOVERY', 'AUDIT_PRESENTATION', 
         'COMMERCIAL_PROPOSAL', 'CONTRACT_SIGNING', 'ONBOARDING'];
  };

  if (loading) {
    return (
      <div className="ld-loading">
        <div className="ld-spinner"></div>
        <p className="ld-loading-text">Loading lead details...</p>
      </div>
    );
  }

  // ============================================
  // CREATE MODE RENDER
  // ============================================
  if (isCreateMode) {
    return (
      <div className="ld-container">
        <div className="ld-header">
          <div className="ld-header-left">
            <Link to="/crm/leads" className="ld-back-btn">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="ld-title">Create New Lead</h1>
              <p className="ld-subtitle">Add a new lead to the CRM</p>
            </div>
          </div>
          <div className="ld-header-actions">
            <button className="ld-btn ld-btn-outline" onClick={() => navigate('/crm/leads')}>
              <X size={16} />
              Cancel
            </button>
            <button className="ld-btn ld-btn-primary" onClick={handleCreateLead} disabled={isSubmitting}>
              <Save size={16} />
              {isSubmitting ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </div>

        <div className="ld-form-grid">
          <div className="ld-card ld-card-animate">
            <div className="ld-card-header">
              <h3 className="ld-card-title">Basic Information</h3>
            </div>
            <div className="ld-card-body">
              <div className="ld-form-group">
                <label className="ld-form-label">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="ld-form-input"
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="ld-form-group">
                <label className="ld-form-label">Contact Name *</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="ld-form-input"
                  placeholder="Enter contact name"
                  required
                />
              </div>
              <div className="ld-form-group">
                <label className="ld-form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="ld-form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="ld-form-group">
                <label className="ld-form-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="ld-form-input"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="ld-form-group">
                <label className="ld-form-label">Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="ld-form-input"
                  placeholder="Enter website URL"
                />
              </div>
            </div>
          </div>

          <div className="ld-card ld-card-animate" style={{ animationDelay: '0.1s' }}>
            <div className="ld-card-header">
              <h3 className="ld-card-title">Additional Details</h3>
            </div>
            <div className="ld-card-body">
              <div className="ld-form-group">
                <label className="ld-form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="ld-form-input"
                  placeholder="Enter country"
                />
              </div>
              <div className="ld-form-group">
                <label className="ld-form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="ld-form-input"
                  placeholder="Enter city"
                />
              </div>
              <div className="ld-form-group">
                <label className="ld-form-label">Company Size</label>
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  className="ld-form-select"
                >
                  <option value="N/A">N/A</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="200+">200+</option>
                </select>
              </div>
              <div className="ld-form-group">
                <label className="ld-form-label">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="ld-form-input"
                  placeholder="Enter industry"
                />
              </div>
              <div className="ld-form-group">
                <label className="ld-form-label">Lead Source</label>
                <select
                  name="leadSource"
                  value={formData.leadSource}
                  onChange={handleInputChange}
                  className="ld-form-select"
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Cold Email">Cold Email</option>
                  <option value="Advertisement">Advertisement</option>
                  <option value="Inbound">Inbound</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="ld-card ld-card-animate" style={{ animationDelay: '0.2s', gridColumn: '1 / -1' }}>
            <div className="ld-card-header">
              <h3 className="ld-card-title">Pipeline Settings</h3>
            </div>
            <div className="ld-card-body ld-pipeline-grid">
              <div className="ld-form-group">
                <label className="ld-form-label">Pipeline Type</label>
                <select
                  name="pipelineType"
                  value={formData.pipelineType}
                  onChange={handleInputChange}
                  className="ld-form-select"
                >
                  <option value="US_OUTREACH">US Outreach</option>
                  <option value="EU_INBOUND">EU Inbound</option>
                </select>
              </div>
              <div className="ld-form-group">
                <label className="ld-form-label">Current Stage</label>
                <select
                  name="currentStage"
                  value={formData.currentStage}
                  onChange={handleInputChange}
                  className="ld-form-select"
                >
                  {formData.pipelineType === 'US_OUTREACH' ? (
                    <>
                      <option value="SCRAPED_SOURCED">Scraped/Sourced</option>
                      <option value="INITIAL_VERIFICATION">Initial Verification</option>
                      <option value="FIRST_SEQUENCE_SENT">First Sequence Sent</option>
                      <option value="FOLLOW_UP_PROTOCOL">Follow Up Protocol</option>
                      <option value="DISCOVERY_CALL_SCHEDULED">Discovery Call Scheduled</option>
                      <option value="PROPOSAL_PITCHED">Proposal Pitched</option>
                      <option value="NEGOTIATING">Negotiating</option>
                      <option value="WON">Won</option>
                      <option value="LOST">Lost</option>
                    </>
                  ) : (
                    <>
                      <option value="INQUIRY">Inquiry</option>
                      <option value="BRIEFING_DISCOVERY">Briefing/Discovery</option>
                      <option value="AUDIT_PRESENTATION">Audit Presentation</option>
                      <option value="COMMERCIAL_PROPOSAL">Commercial Proposal</option>
                      <option value="CONTRACT_SIGNING">Contract Signing</option>
                      <option value="ONBOARDING">Onboarding</option>
                    </>
                  )}
                </select>
              </div>
              <div className="ld-form-group">
                <label className="ld-form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="ld-form-select"
                >
                  <option value="active">Active</option>
                  <option value="stale">Stale</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div className="ld-form-group">
                <label className="ld-form-label">Timezone</label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="ld-form-select"
                >
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Chicago">America/Chicago (CST)</option>
                  <option value="America/Denver">America/Denver (MST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Europe/Paris">Europe/Paris (CET)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="ld-card ld-card-animate" style={{ animationDelay: '0.3s', gridColumn: '1 / -1' }}>
            <div className="ld-card-header">
              <h3 className="ld-card-title">Notes</h3>
            </div>
            <div className="ld-card-body">
              <div className="ld-form-group">
                <label className="ld-form-label">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="ld-form-textarea"
                  placeholder="Enter any additional notes about this lead..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="ld-not-found">
        <p className="ld-not-found-text">Lead not found</p>
        <Link to="/crm/leads" className="ld-not-found-link">Back to Leads</Link>
      </div>
    );
  }

  // ============================================
  // VIEW MODE RENDER
  // ============================================
  const stages = getStages();
  const statusStyle = getStatusStyle(lead.status);
  const stageColor = getStageColor(lead.currentStage);
  const StatusIcon = statusStyle.icon;

  return (
    <div className="ld-container">
      {/* Header */}
      <div className="ld-header">
        <div className="ld-header-left">
          <Link to="/crm/leads" className="ld-back-btn">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="ld-title">{lead.companyName}</h1>
            <p className="ld-subtitle">Contact: {lead.contactName}</p>
          </div>
        </div>
        <div className="ld-header-actions">
          {lead.status !== 'converted' && lead.status !== 'lost' && (
            <button className="ld-btn ld-btn-success" onClick={() => setShowConvertModal(true)} disabled={actionLoading}>
              <UserCheck size={16} />
              Convert
            </button>
          )}
          <button className="ld-btn ld-btn-outline" onClick={() => setShowStageModal(true)} disabled={actionLoading}>
            <Target size={16} />
            Stage
          </button>
          <Link to={`/crm/leads/${id}/edit`} className="ld-btn ld-btn-outline">
            <Edit size={16} />
            Edit
          </Link>
          <button className="ld-btn ld-btn-danger" onClick={() => setShowDeleteModal(true)} disabled={actionLoading}>
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Stats Cards - Mobile Friendly */}
      <div className="ld-stats-grid">
        <div className="ld-stat-card ld-stat-animate" style={{ animationDelay: '0.05s' }}>
          <div className="ld-stat-icon" style={{ backgroundColor: '#E8F5E9' }}>
            <Briefcase size={20} color="#013E37" />
          </div>
          <div className="ld-stat-info">
            <span className="ld-stat-label">Company</span>
            <span className="ld-stat-value">{lead.companyName}</span>
          </div>
        </div>
        <div className="ld-stat-card ld-stat-animate" style={{ animationDelay: '0.1s' }}>
          <div className="ld-stat-icon" style={{ backgroundColor: '#FFEFB3' }}>
            <Users size={20} color="#013E37" />
          </div>
          <div className="ld-stat-info">
            <span className="ld-stat-label">Contact</span>
            <span className="ld-stat-value">{lead.contactName}</span>
          </div>
        </div>
        <div className="ld-stat-card ld-stat-animate" style={{ animationDelay: '0.15s' }}>
          <div className="ld-stat-icon" style={{ backgroundColor: '#E8F5E9' }}>
            <Award size={20} color="#013E37" />
          </div>
          <div className="ld-stat-info">
            <span className="ld-stat-label">Score</span>
            <span className="ld-stat-value">{lead.leadScore || 0}/100</span>
          </div>
        </div>
        <div className="ld-stat-card ld-stat-animate" style={{ animationDelay: '0.2s' }}>
          <div className="ld-stat-icon" style={{ backgroundColor: '#FFEFB3' }}>
            <Calendar size={20} color="#013E37" />
          </div>
          <div className="ld-stat-info">
            <span className="ld-stat-label">Created</span>
            <span className="ld-stat-value">{formatDate(lead.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Info Cards - Mobile Responsive */}
      <div className="ld-cards-grid">
        {/* Contact Information */}
        <div className="ld-card ld-card-animate" style={{ animationDelay: '0.1s' }}>
          <div className="ld-card-header">
            <h3 className="ld-card-title">Contact Information</h3>
          </div>
          <div className="ld-card-body">
            <div className="ld-info-row">
              <Mail size={16} className="ld-info-icon" />
              <span className="ld-info-text">{lead.email}</span>
            </div>
            {lead.phone && (
              <div className="ld-info-row">
                <Phone size={16} className="ld-info-icon" />
                <span className="ld-info-text">{lead.phone}</span>
              </div>
            )}
            {lead.website && (
              <div className="ld-info-row">
                <Globe size={16} className="ld-info-icon" />
                <span className="ld-info-text">{lead.website}</span>
              </div>
            )}
            <div className="ld-info-row">
              <MapPin size={16} className="ld-info-icon" />
              <span className="ld-info-text">{lead.city}, {lead.country}</span>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="ld-card ld-card-animate" style={{ animationDelay: '0.15s' }}>
          <div className="ld-card-header">
            <h3 className="ld-card-title">Company Details</h3>
          </div>
          <div className="ld-card-body">
            <div className="ld-info-row">
              <Building2 size={16} className="ld-info-icon" />
              <span className="ld-info-text">{lead.companySize || 'N/A'}</span>
            </div>
            {lead.industry && (
              <div className="ld-info-row">
                <Users size={16} className="ld-info-icon" />
                <span className="ld-info-text">{lead.industry}</span>
              </div>
            )}
            <div className="ld-info-row">
              <Clock size={16} className="ld-info-icon" />
              <span className="ld-info-text">Timezone: {lead.timezone}</span>
            </div>
            <div className="ld-info-row">
              <Calendar size={16} className="ld-info-icon" />
              <span className="ld-info-text">Created: {formatDate(lead.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Pipeline Status */}
        <div className="ld-card ld-card-animate" style={{ animationDelay: '0.2s' }}>
          <div className="ld-card-header">
            <h3 className="ld-card-title">Pipeline Status</h3>
          </div>
          <div className="ld-card-body">
            <div className="ld-info-row">
              <span className="ld-label-text">Stage:</span>
              <span className="ld-stage-badge" style={{
                backgroundColor: `${stageColor}20`,
                color: stageColor,
                borderColor: `${stageColor}40`
              }}>
                <span className="ld-stage-dot" style={{ backgroundColor: stageColor }}></span>
                {lead.currentStage ? lead.currentStage.replace(/_/g, ' ') : 'N/A'}
              </span>
            </div>
            <div className="ld-info-row">
              <span className="ld-label-text">Status:</span>
              <span className="ld-status-badge" style={{
                backgroundColor: statusStyle.backgroundColor,
                color: statusStyle.color
              }}>
                <StatusIcon size={12} className="ld-status-icon" />
                {lead.status ? lead.status.charAt(0).toUpperCase() + lead.status.slice(1) : 'N/A'}
              </span>
            </div>
            <div className="ld-info-row">
              <span className="ld-label-text">Score:</span>
              <span className="ld-score-text">{lead.leadScore || 0}/100</span>
            </div>
            {lead.lastContactDate && (
              <div className="ld-info-row">
                <span className="ld-label-text">Last Contact:</span>
                <span className="ld-info-text">{formatDate(lead.lastContactDate)}</span>
              </div>
            )}
            {lead.assignedTo && (
              <div className="ld-info-row">
                <span className="ld-label-text">Assigned To:</span>
                <span className="ld-info-text">
                  {typeof lead.assignedTo === 'object' 
                    ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` 
                    : 'Unassigned'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stage Change Modal */}
      {showStageModal && (
        <div className="ld-modal-overlay" onClick={() => setShowStageModal(false)}>
          <div className="ld-modal" onClick={e => e.stopPropagation()}>
            <h3 className="ld-modal-title">Change Stage</h3>
            <div className="ld-modal-body">
              <div className="ld-modal-field">
                <label className="ld-modal-label">Select Stage</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="ld-modal-select"
                  disabled={actionLoading}
                >
                  <option value="">Select stage...</option>
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ld-modal-actions">
                <button
                  className="ld-modal-btn ld-modal-btn-cancel"
                  onClick={() => {
                    setShowStageModal(false);
                    setSelectedStage('');
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  className="ld-modal-btn ld-modal-btn-primary"
                  onClick={handleStageChange}
                  disabled={!selectedStage || actionLoading}
                >
                  {actionLoading ? 'Updating...' : 'Update Stage'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="ld-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="ld-modal" onClick={e => e.stopPropagation()}>
            <h3 className="ld-modal-title">Delete Lead</h3>
            <div className="ld-modal-body">
              <p className="ld-modal-text">
                Are you sure you want to delete <strong>{lead.companyName}</strong>? This action cannot be undone.
              </p>
              <div className="ld-modal-actions">
                <button
                  className="ld-modal-btn ld-modal-btn-cancel"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  className="ld-modal-btn ld-modal-btn-danger"
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <div className="ld-modal-overlay" onClick={() => setShowConvertModal(false)}>
          <div className="ld-modal" onClick={e => e.stopPropagation()}>
            <h3 className="ld-modal-title">Convert to Client</h3>
            <div className="ld-modal-body">
              <p className="ld-modal-text">
                Are you sure you want to convert <strong>{lead.companyName}</strong> to a client? 
                This will create a new client account and onboarding project.
              </p>
              <div className="ld-modal-actions">
                <button
                  className="ld-modal-btn ld-modal-btn-cancel"
                  onClick={() => setShowConvertModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  className="ld-modal-btn ld-modal-btn-success"
                  onClick={handleConvert}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Converting...' : 'Convert to Client'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .ld-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #FFFFFF;
          min-height: 100vh;
        }

        /* ============================================
           LOADING
           ============================================ */
        .ld-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
          background: #FFFFFF;
        }
        .ld-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: ldSpin 0.8s linear infinite;
        }
        @keyframes ldSpin {
          to { transform: rotate(360deg); }
        }
        .ld-loading-text {
          color: #013E37;
          font-size: 14px;
          font-weight: 500;
        }

        /* ============================================
           HEADER
           ============================================ */
        .ld-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .ld-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .ld-back-btn {
          padding: 8px;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #013E37;
          transition: background 0.2s ease;
        }
        .ld-back-btn:hover {
          background: #FFEFB3;
        }
        .ld-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .ld-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.7;
          margin: 4px 0 0 0;
        }
        .ld-header-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* ============================================
           BUTTONS
           ============================================ */
        .ld-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          white-space: nowrap;
        }
        .ld-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ld-btn-primary {
          background: #013E37;
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.3);
        }
        .ld-btn-primary:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.3);
        }
        .ld-btn-success {
          background: #013E37;
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.3);
        }
        .ld-btn-success:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.3);
        }
        .ld-btn-outline {
          background: transparent;
          color: #013E37;
          border: 1px solid #FFEFB3;
        }
        .ld-btn-outline:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
          transform: translateY(-2px);
        }
        .ld-btn-danger {
          background: #D32F2F;
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(211, 47, 47, 0.3);
        }
        .ld-btn-danger:hover:not(:disabled) {
          background: #B71C1C;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
        }

        /* ============================================
           STATS CARDS
           ============================================ */
        .ld-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .ld-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 16px 20px;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
        }
        .ld-stat-animate {
          animation: ldSlideUp 0.5s ease forwards;
        }
        @keyframes ldSlideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .ld-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }
        .ld-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ld-stat-info {
          flex: 1;
          min-width: 0;
        }
        .ld-stat-label {
          display: block;
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .ld-stat-value {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ============================================
           CARDS
           ============================================ */
        .ld-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }
        .ld-card {
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
        }
        .ld-card-animate {
          animation: ldSlideUp 0.5s ease forwards;
        }
        .ld-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }
        .ld-card-header {
          padding: 14px 20px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
        }
        .ld-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .ld-card-body {
          padding: 20px;
        }

        /* ============================================
           INFO ROWS
           ============================================ */
        .ld-info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #FFEFB3;
        }
        .ld-info-row:last-child {
          border-bottom: none;
        }
        .ld-info-icon {
          color: #013E37;
          opacity: 0.5;
          flex-shrink: 0;
        }
        .ld-info-text {
          color: #013E37;
          font-size: 14px;
          word-break: break-word;
        }
        .ld-label-text {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
          min-width: 80px;
          flex-shrink: 0;
        }

        /* ============================================
           BADGES
           ============================================ */
        .ld-stage-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid;
        }
        .ld-stage-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .ld-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .ld-status-icon {
          flex-shrink: 0;
        }
        .ld-score-text {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
        }

        /* ============================================
           FORM
           ============================================ */
        .ld-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .ld-pipeline-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .ld-form-group {
          margin-bottom: 16px;
        }
        .ld-form-group:last-child {
          margin-bottom: 0;
        }
        .ld-form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          margin-bottom: 6px;
        }
        .ld-form-input,
        .ld-form-select,
        .ld-form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          color: #013E37;
          background: #FFFFFF;
          outline: none;
          transition: all 0.3s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .ld-form-input:focus,
        .ld-form-select:focus,
        .ld-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .ld-form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        /* ============================================
           MODAL
           ============================================ */
        .ld-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(1, 62, 55, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .ld-modal {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 100%;
          border: 1px solid #FFEFB3;
          box-shadow: 0 20px 60px rgba(1, 62, 55, 0.2);
          animation: ldModalIn 0.3s ease;
        }
        @keyframes ldModalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .ld-modal-title {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0 0 16px 0;
        }
        .ld-modal-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ld-modal-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ld-modal-label {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }
        .ld-modal-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          color: #013E37;
          background: #FFFFFF;
          outline: none;
          transition: all 0.3s ease;
        }
        .ld-modal-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .ld-modal-text {
          color: #013E37;
          margin: 0;
          line-height: 1.6;
        }
        .ld-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }
        .ld-modal-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .ld-modal-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ld-modal-btn-cancel {
          background: transparent;
          color: #013E37;
          border: 1px solid #FFEFB3;
        }
        .ld-modal-btn-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .ld-modal-btn-primary {
          background: #013E37;
          color: #FFFFFF;
        }
        .ld-modal-btn-primary:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.2);
        }
        .ld-modal-btn-danger {
          background: #D32F2F;
          color: #FFFFFF;
        }
        .ld-modal-btn-danger:hover:not(:disabled) {
          background: #B71C1C;
        }
        .ld-modal-btn-success {
          background: #013E37;
          color: #FFFFFF;
        }
        .ld-modal-btn-success:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.2);
        }

        /* ============================================
           NOT FOUND
           ============================================ */
        .ld-not-found {
          text-align: center;
          padding: 48px 0;
          background: #FFFFFF;
        }
        .ld-not-found-text {
          color: #013E37;
          margin-bottom: 8px;
        }
        .ld-not-found-link {
          color: #013E37;
          text-decoration: none;
          font-weight: 500;
        }
        .ld-not-found-link:hover {
          text-decoration: underline;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .ld-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .ld-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .ld-pipeline-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .ld-container {
            padding: 16px;
          }
          .ld-header {
            flex-direction: column;
            align-items: stretch;
          }
          .ld-header-left {
            flex-direction: column;
            align-items: flex-start;
          }
          .ld-header-actions {
            width: 100%;
            flex-wrap: wrap;
          }
          .ld-header-actions .ld-btn {
            flex: 1;
            justify-content: center;
            min-width: 80px;
          }
          .ld-title {
            font-size: 22px;
          }
          .ld-cards-grid {
            grid-template-columns: 1fr;
          }
          .ld-stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          .ld-form-grid {
            grid-template-columns: 1fr;
          }
          .ld-pipeline-grid {
            grid-template-columns: 1fr 1fr;
          }
          .ld-stat-card {
            padding: 14px 16px;
          }
          .ld-stat-value {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .ld-container {
            padding: 12px;
          }
          .ld-stats-grid {
            grid-template-columns: 1fr;
          }
          .ld-pipeline-grid {
            grid-template-columns: 1fr;
          }
          .ld-header-actions {
            flex-direction: column;
          }
          .ld-header-actions .ld-btn {
            width: 100%;
            justify-content: center;
          }
          .ld-title {
            font-size: 20px;
          }
          .ld-subtitle {
            font-size: 13px;
          }
          .ld-card-body {
            padding: 16px;
          }
          .ld-modal {
            padding: 16px;
            margin: 10px;
          }
          .ld-modal-actions {
            flex-direction: column;
          }
          .ld-modal-actions .ld-modal-btn {
            width: 100%;
            justify-content: center;
          }
          .ld-info-row {
            flex-wrap: wrap;
          }
          .ld-label-text {
            min-width: 60px;
          }
          .ld-stage-badge,
          .ld-status-badge {
            font-size: 11px;
            padding: 3px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default LeadDetails;