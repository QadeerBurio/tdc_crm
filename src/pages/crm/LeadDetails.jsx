// pages/crm/LeadDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Globe,
  Building2, Users, Calendar, Clock, CheckCircle, Save, X,
  UserCheck, TrendingUp, UserX
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeadDetails = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('LeadDetails - Full useParams():', useParams());
  console.log('LeadDetails - id from useParams:', id);
  console.log('LeadDetails - typeof id:', typeof id);
  
  // Check if we're in create mode
  const isCreateMode = !id || id === 'new' || id === '';
  
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState('');
  
  // Create mode state
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

  const API_URL =  'https://crmserver-production-4a42.up.railway.app/api';

  // Fetch lead on component mount or when id changes
  useEffect(() => {
    console.log('LeadDetails useEffect - id:', id, 'isCreateMode:', isCreateMode);
    
    if (isCreateMode) {
      console.log('LeadDetails - Create mode detected');
      setLoading(false);
      // Set default stage based on pipeline type
      setFormData(prev => ({
        ...prev,
        currentStage: prev.pipelineType === 'US_OUTREACH' ? 'SCRAPED_SOURCED' : 'INQUIRY'
      }));
    } else if (id) {
      console.log('LeadDetails - Fetching lead with ID:', id);
      fetchLead();
    } else {
      console.error('LeadDetails - No ID provided and not in create mode');
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
      console.log('Fetching lead with ID:', id);
      
      const response = await axios.get(`${API_URL}/crm/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Fetch response:', response.data);

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
        if (err.response.status === 400) {
          errorMessage = 'Invalid lead ID format.';
        } else if (err.response.status === 404) {
          errorMessage = 'Lead not found.';
          navigate('/crm/leads');
        } else if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle create form input changes
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

  // Handle create lead submission
  const handleCreateLead = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.companyName || !formData.contactName || !formData.email) {
      toast.error('Please fill in all required fields (Company Name, Contact Name, Email)');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Creating lead with data:', formData);
      
      const response = await axios.post(`${API_URL}/crm/leads`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Create response:', response.data);

      if (response.data && response.data.success) {
        toast.success('Lead created successfully!');
        const newLead = response.data.data;
        navigate(`/crm/leads/${newLead._id}`);
      } else {
        toast.error(response.data?.message || 'Failed to create lead.');
      }
    } catch (err) {
      console.error('Error creating lead:', err);
      
      let errorMessage = 'Failed to create lead.';
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid lead data.';
        } else if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to create leads.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle stage change
  const handleStageChange = async () => {
    if (!selectedStage) {
      toast.error('Please select a stage');
      return;
    }
    
    setActionLoading(true);
    try {
      console.log('Updating stage for lead:', id, 'to:', selectedStage);
      
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
      
      let errorMessage = 'Failed to update stage.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      console.log('Deleting lead:', id);
      
      await axios.delete(`${API_URL}/crm/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Lead deleted successfully');
      navigate('/crm/leads');
    } catch (err) {
      console.error('Error deleting lead:', err);
      
      let errorMessage = 'Failed to delete lead.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Handle convert to client
  const handleConvert = async () => {
    setActionLoading(true);
    try {
      console.log('Converting lead to client:', id);
      
      const response = await axios.post(`${API_URL}/crm/leads/${id}/convert`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Lead converted to client successfully!');
      setShowConvertModal(false);
      navigate('/crm/leads');
    } catch (err) {
      console.error('Error converting lead:', err);
      
      let errorMessage = 'Failed to convert lead.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Format date helper
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status style
  const getStatusStyle = (status) => {
    const styles = {
      active: { backgroundColor: '#d1fae5', color: '#065f46' },
      stale: { backgroundColor: '#fef3c7', color: '#92400e' },
      converted: { backgroundColor: '#dbeafe', color: '#1e40af' },
      lost: { backgroundColor: '#fee2e2', color: '#991b1b' },
    };
    return styles[status] || styles.active;
  };

  // Get stage color
  const getStageColor = (stage) => {
    const colors = {
      SCRAPED_SOURCED: '#8B5CF6',
      INITIAL_VERIFICATION: '#3B82F6',
      FIRST_SEQUENCE_SENT: '#06B6D4',
      FOLLOW_UP_PROTOCOL: '#F59E0B',
      DISCOVERY_CALL_SCHEDULED: '#8B5CF6',
      PROPOSAL_PITCHED: '#EC4899',
      NEGOTIATING: '#F97316',
      WON: '#10B981',
      LOST: '#EF4444',
      INQUIRY: '#3B82F6',
      BRIEFING_DISCOVERY: '#8B5CF6',
      AUDIT_PRESENTATION: '#F59E0B',
      COMMERCIAL_PROPOSAL: '#EC4899',
      CONTRACT_SIGNING: '#10B981',
      ONBOARDING: '#06B6D4'
    };
    return colors[stage] || '#6B7280';
  };

  // Get stages based on pipeline type
  const getStages = () => {
    if (!lead) return [];
    return lead.pipelineType === 'US_OUTREACH' 
      ? ['SCRAPED_SOURCED', 'INITIAL_VERIFICATION', 'FIRST_SEQUENCE_SENT', 
         'FOLLOW_UP_PROTOCOL', 'DISCOVERY_CALL_SCHEDULED', 'PROPOSAL_PITCHED', 
         'NEGOTIATING', 'WON', 'LOST']
      : ['INQUIRY', 'BRIEFING_DISCOVERY', 'AUDIT_PRESENTATION', 
         'COMMERCIAL_PROPOSAL', 'CONTRACT_SIGNING', 'ONBOARDING'];
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading lead details...</p>
      </div>
    );
  }

  // ============================================
  // CREATE MODE RENDER
  // ============================================
  if (isCreateMode) {
    return (
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Link to="/crm/leads" style={styles.backButton}>
              <ArrowLeft size={20} color="#374151" />
            </Link>
            <div>
              <h1 style={styles.title}>Create New Lead</h1>
              <p style={styles.subtitle}>Add a new lead to the CRM</p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button 
              style={{...styles.actionButton, ...styles.outlineButton}}
              onClick={() => navigate('/crm/leads')}
            >
              <X size={16} />
              Cancel
            </button>
            <button 
              style={{...styles.actionButton, ...styles.successButton}}
              onClick={handleCreateLead}
              disabled={isSubmitting}
            >
              <Save size={16} />
              {isSubmitting ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </div>

        {/* Create Form */}
        <div style={styles.createFormGrid}>
          {/* Basic Information */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Basic Information</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Contact Name *</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Enter contact name"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Enter phone number"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Enter website URL"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Additional Details</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Enter country"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Enter city"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Company Size</label>
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  style={styles.formSelect}
                >
                  <option value="N/A">N/A</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="200+">200+</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Enter industry"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Lead Source</label>
                <select
                  name="leadSource"
                  value={formData.leadSource}
                  onChange={handleInputChange}
                  style={styles.formSelect}
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

          {/* Pipeline Settings */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Pipeline Settings</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Pipeline Type</label>
                <select
                  name="pipelineType"
                  value={formData.pipelineType}
                  onChange={handleInputChange}
                  style={styles.formSelect}
                >
                  <option value="US_OUTREACH">US Outreach</option>
                  <option value="EU_INBOUND">EU Inbound</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Current Stage</label>
                <select
                  name="currentStage"
                  value={formData.currentStage}
                  onChange={handleInputChange}
                  style={styles.formSelect}
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
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={styles.formSelect}
                >
                  <option value="active">Active</option>
                  <option value="stale">Stale</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Timezone</label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  style={styles.formSelect}
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

          {/* Notes */}
          <div style={{...styles.card, gridColumn: '1 / -1'}}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Notes</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  style={styles.formTextarea}
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

  // ============================================
  // VIEW MODE - If no lead, show not found
  // ============================================
  if (!lead) {
    return (
      <div style={styles.notFoundContainer}>
        <p style={styles.notFoundText}>Lead not found</p>
        <Link to="/crm/leads" style={styles.notFoundLink}>Back to Leads</Link>
      </div>
    );
  }

  // ============================================
  // VIEW MODE RENDER
  // ============================================
  const stages = getStages();
  const statusStyle = getStatusStyle(lead.status);
  const stageColor = getStageColor(lead.currentStage);

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/crm/leads" style={styles.backButton}>
            <ArrowLeft size={20} color="#374151" />
          </Link>
          <div>
            <h1 style={styles.title}>{lead.companyName}</h1>
            <p style={styles.subtitle}>Contact: {lead.contactName}</p>
          </div>
        </div>
        <div style={styles.headerActions}>
          {lead.status !== 'converted' && lead.status !== 'lost' && (
            <button 
              style={{...styles.actionButton, ...styles.successButton}}
              onClick={() => setShowConvertModal(true)}
              disabled={actionLoading}
            >
              <UserCheck size={16} />
              Convert to Client
            </button>
          )}
          <button 
            style={{...styles.actionButton, ...styles.outlineButton}}
            onClick={() => setShowStageModal(true)}
            disabled={actionLoading}
          >
            Change Stage
          </button>
          <Link to={`/crm/leads/${id}/edit`} style={styles.actionLink}>
            <button style={{...styles.actionButton, ...styles.outlineButton}}>
              <Edit size={16} />
              Edit
            </button>
          </Link>
          <button 
            style={{...styles.actionButton, ...styles.dangerButton}}
            onClick={() => setShowDeleteModal(true)}
            disabled={actionLoading}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div style={styles.gridContainer}>
        {/* Contact Information */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Contact Information</h3>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.infoRow}>
              <Mail size={16} color="#9CA3AF" />
              <span style={styles.infoText}>{lead.email}</span>
            </div>
            {lead.phone && (
              <div style={styles.infoRow}>
                <Phone size={16} color="#9CA3AF" />
                <span style={styles.infoText}>{lead.phone}</span>
              </div>
            )}
            {lead.website && (
              <div style={styles.infoRow}>
                <Globe size={16} color="#9CA3AF" />
                <span style={styles.infoText}>{lead.website}</span>
              </div>
            )}
            <div style={styles.infoRow}>
              <MapPin size={16} color="#9CA3AF" />
              <span style={styles.infoText}>{lead.city}, {lead.country}</span>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Company Details</h3>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.infoRow}>
              <Building2 size={16} color="#9CA3AF" />
              <span style={styles.infoText}>{lead.companySize || 'N/A'}</span>
            </div>
            {lead.industry && (
              <div style={styles.infoRow}>
                <Users size={16} color="#9CA3AF" />
                <span style={styles.infoText}>{lead.industry}</span>
              </div>
            )}
            <div style={styles.infoRow}>
              <Clock size={16} color="#9CA3AF" />
              <span style={styles.infoText}>Timezone: {lead.timezone}</span>
            </div>
            <div style={styles.infoRow}>
              <Calendar size={16} color="#9CA3AF" />
              <span style={styles.infoText}>Created: {formatDate(lead.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Pipeline Status */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Pipeline Status</h3>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.infoRow}>
              <span style={styles.labelText}>Stage:</span>
              <span style={{
                ...styles.stageBadge,
                backgroundColor: `${stageColor}20`,
                color: stageColor,
                borderColor: `${stageColor}40`
              }}>
                <span style={{...styles.stageDot, backgroundColor: stageColor}}></span>
                {lead.currentStage ? lead.currentStage.replace(/_/g, ' ') : 'N/A'}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.labelText}>Status:</span>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: statusStyle.backgroundColor,
                color: statusStyle.color
              }}>
                {lead.status ? lead.status.charAt(0).toUpperCase() + lead.status.slice(1) : 'N/A'}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.labelText}>Score:</span>
              <span style={styles.scoreText}>{lead.leadScore || 0}/100</span>
            </div>
            {lead.lastContactDate && (
              <div style={styles.infoRow}>
                <span style={styles.labelText}>Last Contact:</span>
                <span style={styles.infoText}>{formatDate(lead.lastContactDate)}</span>
              </div>
            )}
            {lead.assignedTo && (
              <div style={styles.infoRow}>
                <span style={styles.labelText}>Assigned To:</span>
                <span style={styles.infoText}>
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
        <div style={styles.modalOverlay} onClick={() => setShowStageModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Change Stage</h3>
            <div style={styles.modalContent}>
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Select Stage</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  style={styles.modalSelect}
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
              <div style={styles.modalActions}>
                <button
                  style={styles.modalCancelButton}
                  onClick={() => {
                    setShowStageModal(false);
                    setSelectedStage('');
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  style={styles.modalPrimaryButton}
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
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Delete Lead</h3>
            <div style={styles.modalContent}>
              <p style={styles.modalText}>
                Are you sure you want to delete <strong>{lead.companyName}</strong>? This action cannot be undone.
              </p>
              <div style={styles.modalActions}>
                <button
                  style={styles.modalCancelButton}
                  onClick={() => setShowDeleteModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  style={styles.modalDangerButton}
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
        <div style={styles.modalOverlay} onClick={() => setShowConvertModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Convert to Client</h3>
            <div style={styles.modalContent}>
              <p style={styles.modalText}>
                Are you sure you want to convert <strong>{lead.companyName}</strong> to a client? 
                This will create a new client account and onboarding project.
              </p>
              <div style={styles.modalActions}>
                <button
                  style={styles.modalCancelButton}
                  onClick={() => setShowConvertModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  style={styles.modalSuccessButton}
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
    </div>
  );
};

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64vh',
    gap: '16px',
  },
  loadingText: {
    color: '#64748B',
    fontSize: '14px',
    fontWeight: '500',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
  },
  notFoundContainer: {
    textAlign: 'center',
    padding: '48px 0',
  },
  notFoundText: {
    color: '#6B7280',
    marginBottom: '8px',
  },
  notFoundLink: {
    color: '#3B82F6',
    textDecoration: 'none',
    display: 'inline-block',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backButton: {
    padding: '8px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748B',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  },
  actionLink: {
    textDecoration: 'none',
  },
  successButton: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    color: '#475569',
    border: '1px solid #E2E8F0',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid #E5E7EB',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0F172A',
    margin: 0,
  },
  cardContent: {
    padding: '24px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  infoText: {
    color: '#0F172A',
    fontSize: '14px',
  },
  labelText: {
    fontSize: '14px',
    color: '#64748B',
    minWidth: '60px',
  },
  stageBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid',
  },
  stageDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  scoreText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0F172A',
  },
  // Create form styles
  createFormGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  formInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
  },
  formSelect: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
  },
  formTextarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0F172A',
    margin: '0 0 16px 0',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  modalSelect: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  modalText: {
    color: '#374151',
    margin: 0,
    lineHeight: '1.6',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '8px',
  },
  modalCancelButton: {
    padding: '8px 16px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  modalPrimaryButton: {
    padding: '8px 16px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  modalDangerButton: {
    padding: '8px 16px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  modalSuccessButton: {
    padding: '8px 16px',
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
};

// Add global styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .back-button:hover {
    background-color: #F1F5F9 !important;
  }

  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed !important;
  }

  .success-button:hover:not(:disabled) {
    background-color: #059669 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4) !important;
  }

  .outline-button:hover:not(:disabled) {
    background-color: #F1F5F9 !important;
    transform: translateY(-1px);
  }

  .danger-button:hover:not(:disabled) {
    background-color: #DC2626 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4) !important;
  }

  .modal-cancel-button:hover:not(:disabled) {
    background-color: #E2E8F0 !important;
  }

  .modal-primary-button:hover:not(:disabled) {
    background-color: #2563EB !important;
    transform: translateY(-1px);
  }

  .modal-danger-button:hover:not(:disabled) {
    background-color: #DC2626 !important;
  }

  .modal-success-button:hover:not(:disabled) {
    background-color: #059669 !important;
  }

  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus,
  .modal-select:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }

  .card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
    transition: box-shadow 0.3s ease;
  }

  @media (max-width: 1024px) {
    .grid-container {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .create-form-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 16px !important;
    }

    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .header-left {
      flex-direction: column !important;
      align-items: flex-start !important;
    }

    .header-actions {
      width: 100% !important;
      flex-wrap: wrap !important;
    }

    .action-button {
      flex: 1 !important;
      justify-content: center !important;
      min-width: 100px !important;
    }

    .grid-container {
      grid-template-columns: 1fr !important;
    }

    .create-form-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 12px !important;
    }

    .title {
      font-size: 22px !important;
    }

    .header-actions {
      flex-direction: column !important;
    }

    .action-button {
      width: 100% !important;
    }

    .modal {
      width: 95% !important;
      padding: 16px !important;
    }

    .modal-actions {
      flex-direction: column !important;
    }

    .modal-actions button {
      width: 100% !important;
      justify-content: center !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default LeadDetails;