// pages/crm/CompanyDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Globe,
  Building2, Users, Calendar, Briefcase, Save, X, UserPlus, ExternalLink,
} from 'lucide-react';
import { Loader } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import axios from 'axios';
import toast from 'react-hot-toast';

const CompanyDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  // Check if we're in create mode
  const isCreateMode = id === 'new';
  
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  
  // Create mode state
  const [formData, setFormData] = useState({
    companyName: '', email: '', phone: '', website: '', industry: '',
    companySize: '', country: '', city: '', address: '', status: 'active', description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '', email: '', phone: '', title: '', department: '',
  });
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    // If id is undefined or null, treat as create mode
    if (!id) {
      setLoading(false);
      return;
    }
    
    if (isCreateMode) {
      setLoading(false);
    } else {
      fetchCompany();
    }
  }, [id]);

  const fetchCompany = async () => {
    // Don't fetch if id is undefined or 'new'
    if (!id || id === 'new') {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching company with ID:', id);
      const response = await axios.get(`${API_URL}/crm/companies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setCompany(response.data.data || response.data);
      }
    } catch (err) {
      console.error('Error fetching company:', err);
      let errorMessage = 'Failed to load company details.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view this company.';
        } else if (err.response.status === 404) {
          errorMessage = 'Company not found.';
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle contact form input changes
  const handleContactInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create company submission
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${API_URL}/crm/companies`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Company created successfully!');
      const newCompany = response.data.data || response.data;
      navigate(`/crm/companies/${newCompany._id}`);
    } catch (err) {
      console.error('Error creating company:', err);
      let errorMessage = 'Failed to create company.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to create companies.';
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

  // Handle add contact
  const handleAddContact = async () => {
    if (!contactForm.name || !contactForm.email) {
      toast.error('Name and email are required');
      return;
    }

    setIsContactSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/crm/companies/${id}/contacts`,
        contactForm,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Contact added successfully');
      setShowAddContactModal(false);
      setContactForm({ name: '', email: '', phone: '', title: '', department: '' });
      await fetchCompany();
    } catch (err) {
      console.error('Error adding contact:', err);
      let errorMessage = 'Failed to add contact.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsContactSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/crm/companies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Company deleted successfully');
      navigate('/crm/companies');
    } catch (err) {
      console.error('Error deleting company:', err);
      let errorMessage = 'Failed to delete company.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to delete this company.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    const statusStyles = {
      active: { backgroundColor: '#D1FAE5', color: '#065F46', label: 'Active' },
      inactive: { backgroundColor: '#FEE2E2', color: '#991B1B', label: 'Inactive' },
      customer: { backgroundColor: '#DBEAFE', color: '#1E40AF', label: 'Customer' },
      prospect: { backgroundColor: '#FEF3C7', color: '#92400E', label: 'Prospect' },
    };
    return statusStyles[status] || statusStyles.active;
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader size="lg" />
      </div>
    );
  }

  // Create mode render - when id is undefined or 'new'
  if (!id || isCreateMode) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Link to="/crm/companies" style={styles.backButton}>
              <ArrowLeft style={styles.backIcon} />
            </Link>
            <div>
              <h1 style={styles.title}>Create New Company</h1>
              <p style={styles.subtitle}>Add a new company to the CRM</p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button style={{...styles.actionButton, ...styles.outlineButton}} onClick={() => navigate('/crm/companies')}>
              <X style={styles.buttonIcon} /> Cancel
            </button>
            <button style={{...styles.actionButton, ...styles.successButton}} onClick={handleCreateCompany} disabled={isSubmitting}>
              <Save style={styles.buttonIcon} /> {isSubmitting ? 'Creating...' : 'Create Company'}
            </button>
          </div>
        </div>
        <div style={styles.createFormContainer}>
          <div style={styles.createFormGrid}>
            <div style={styles.card}>
              <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Basic Information</h3></div>
              <div style={styles.cardContent}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Company Name *</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} style={styles.formInput} placeholder="Enter company name" required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={styles.formInput} placeholder="Enter company email" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={styles.formInput} placeholder="Enter phone number" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Website</label>
                  <input type="text" name="website" value={formData.website} onChange={handleInputChange} style={styles.formInput} placeholder="Enter website URL" />
                </div>
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Additional Details</h3></div>
              <div style={styles.cardContent}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Industry</label>
                  <select name="industry" value={formData.industry} onChange={handleInputChange} style={styles.formSelect}>
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Company Size</label>
                  <select name="companySize" value={formData.companySize} onChange={handleInputChange} style={styles.formSelect}>
                    <option value="">Select Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Country</label>
                  <input type="text" name="country" value={formData.country} onChange={handleInputChange} style={styles.formInput} placeholder="Enter country" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} style={styles.formInput} placeholder="Enter city" />
                </div>
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Status & Description</h3></div>
              <div style={styles.cardContent}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} style={styles.formSelect}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="prospect">Prospect</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} style={styles.formInput} placeholder="Enter street address" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} style={styles.formTextarea} placeholder="Enter company description..." rows={4} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If company not found
  if (!company) {
    return (
      <div style={styles.notFoundContainer}>
        <p style={styles.notFoundText}>Company not found</p>
        <Link to="/crm/companies" style={styles.notFoundLink}>Back to Companies</Link>
      </div>
    );
  }

  const statusStyle = getStatusStyle(company.status);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/crm/companies" style={styles.backButton}>
            <ArrowLeft style={styles.backIcon} />
          </Link>
          <div>
            <h1 style={styles.title}>{company.companyName}</h1>
            <p style={styles.subtitle}>
              <span style={{...styles.statusBadgeSmall, backgroundColor: statusStyle.backgroundColor, color: statusStyle.color}}>
                {statusStyle.label}
              </span>
              {company.industry && <span style={styles.industryText}> • {company.industry}</span>}
            </p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <Link to={`/crm/companies/${id}/edit`} style={styles.actionLink}>
            <button style={{...styles.actionButton, ...styles.outlineButton}}><Edit style={styles.buttonIcon} /> Edit</button>
          </Link>
          <button style={{...styles.actionButton, ...styles.dangerButton}} onClick={() => setShowDeleteModal(true)} disabled={actionLoading}>
            <Trash2 style={styles.buttonIcon} /> Delete
          </button>
        </div>
      </div>

      <div style={styles.gridContainer}>
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Contact Information</h3></div>
          <div style={styles.cardContent}>
            {company.email && <div style={styles.infoRow}><Mail style={styles.infoIcon} /><span style={styles.infoText}>{company.email}</span></div>}
            {company.phone && <div style={styles.infoRow}><Phone style={styles.infoIcon} /><span style={styles.infoText}>{company.phone}</span></div>}
            {company.website && <div style={styles.infoRow}><Globe style={styles.infoIcon} /><a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" style={styles.websiteLink}>{company.website}<ExternalLink size={12} style={styles.externalIcon} /></a></div>}
            {(company.city || company.country) && <div style={styles.infoRow}><MapPin style={styles.infoIcon} /><span style={styles.infoText}>{[company.city, company.country].filter(Boolean).join(', ')}</span></div>}
            {company.address && <div style={styles.infoRow}><Building2 style={styles.infoIcon} /><span style={styles.infoText}>{company.address}</span></div>}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Company Details</h3></div>
          <div style={styles.cardContent}>
            {company.industry && <div style={styles.infoRow}><Briefcase style={styles.infoIcon} /><span style={styles.infoText}>{company.industry}</span></div>}
            {company.companySize && <div style={styles.infoRow}><Users style={styles.infoIcon} /><span style={styles.infoText}>{company.companySize} employees</span></div>}
            <div style={styles.infoRow}><Calendar style={styles.infoIcon} /><span style={styles.infoText}>Created: {formatDate(company.createdAt)}</span></div>
            {company.updatedAt && company.updatedAt !== company.createdAt && <div style={styles.infoRow}><Calendar style={styles.infoIcon} /><span style={styles.infoText}>Updated: {formatDate(company.updatedAt)}</span></div>}
          </div>
        </div>

        {company.description && <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Description</h3></div>
          <div style={styles.cardContent}><p style={styles.descriptionText}>{company.description}</p></div>
        </div>}
      </div>

      <div style={styles.contactsCard}>
        <div style={styles.contactsHeader}>
          <div style={styles.contactsHeaderLeft}>
            <h3 style={styles.cardTitle}>Contacts</h3>
            <span style={styles.contactCountBadge}>{company.contacts?.length || 0}</span>
          </div>
          <button style={styles.addContactButton} onClick={() => setShowAddContactModal(true)}>
            <UserPlus size={16} /> Add Contact
          </button>
        </div>
        <div style={styles.cardContent}>
          {company.contacts && company.contacts.length > 0 ? (
            <div style={styles.contactsList}>
              {company.contacts.map((contact, index) => (
                <div key={index} style={styles.contactItem}>
                  <div style={styles.contactAvatar}>{contact.name?.charAt(0) || '?'}</div>
                  <div style={styles.contactInfo}>
                    <div style={styles.contactName}>{contact.name}</div>
                    {contact.title && <div style={styles.contactTitle}>{contact.title}</div>}
                    {contact.email && <div style={styles.contactDetail}><Mail size={12} style={styles.contactDetailIcon} />{contact.email}</div>}
                    {contact.phone && <div style={styles.contactDetail}><Phone size={12} style={styles.contactDetailIcon} />{contact.phone}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : <p style={styles.emptyContacts}>No contacts added yet</p>}
        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Company">
        <div style={styles.modalContent}>
          <p style={styles.modalText}>Are you sure you want to delete <strong>{company.companyName}</strong>? This action cannot be undone.</p>
          <div style={styles.modalActions}>
            <button style={styles.modalCancelButton} onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>Cancel</button>
            <button style={styles.modalDangerButton} onClick={handleDelete} disabled={actionLoading}>{actionLoading ? 'Deleting...' : 'Delete'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAddContactModal} onClose={() => { setShowAddContactModal(false); setContactForm({ name: '', email: '', phone: '', title: '', department: '' }); }} title="Add Contact">
        <div style={styles.modalContent}>
          <div style={styles.formGroup}><label style={styles.formLabel}>Name *</label><input type="text" name="name" value={contactForm.name} onChange={handleContactInputChange} style={styles.formInput} placeholder="Enter contact name" /></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>Email *</label><input type="email" name="email" value={contactForm.email} onChange={handleContactInputChange} style={styles.formInput} placeholder="Enter contact email" /></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>Phone</label><input type="text" name="phone" value={contactForm.phone} onChange={handleContactInputChange} style={styles.formInput} placeholder="Enter contact phone" /></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>Title</label><input type="text" name="title" value={contactForm.title} onChange={handleContactInputChange} style={styles.formInput} placeholder="Enter job title" /></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>Department</label><input type="text" name="department" value={contactForm.department} onChange={handleContactInputChange} style={styles.formInput} placeholder="Enter department" /></div>
          <div style={styles.modalActions}>
            <button style={styles.modalCancelButton} onClick={() => { setShowAddContactModal(false); setContactForm({ name: '', email: '', phone: '', title: '', department: '' }); }} disabled={isContactSubmitting}>Cancel</button>
            <button style={styles.modalPrimaryButton} onClick={handleAddContact} disabled={isContactSubmitting || !contactForm.name || !contactForm.email}>{isContactSubmitting ? 'Adding...' : 'Add Contact'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  container: { padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', width: '100%', backgroundColor: '#F8FAFC', minHeight: '100vh' },
  loadingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '64vh' },
  notFoundContainer: { textAlign: 'center', padding: '48px 0' },
  notFoundText: { color: '#6B7280', marginBottom: '8px' },
  notFoundLink: { color: '#3B82F6', textDecoration: 'none', display: 'inline-block' },
  header: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  backButton: { padding: '8px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  backIcon: { width: '20px', height: '20px', color: '#374151' },
  title: { fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6B7280', marginTop: '4px', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  headerActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  actionButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer' },
  actionLink: { textDecoration: 'none' },
  buttonIcon: { width: '16px', height: '16px' },
  successButton: { backgroundColor: '#22C55E', color: '#FFFFFF' },
  outlineButton: { backgroundColor: 'transparent', color: '#374151', border: '1px solid #D1D5DB' },
  dangerButton: { backgroundColor: '#EF4444', color: '#FFFFFF' },
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' },
  card: { backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
  cardHeader: { padding: '16px 24px', borderBottom: '1px solid #E5E7EB' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 },
  cardContent: { padding: '24px' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  infoIcon: { width: '16px', height: '16px', color: '#9CA3AF', flexShrink: 0 },
  infoText: { color: '#374151', fontSize: '14px' },
  websiteLink: { color: '#3B82F6', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' },
  externalIcon: { color: '#3B82F6' },
  statusBadgeSmall: { display: 'inline-flex', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' },
  industryText: { color: '#6B7280', fontSize: '14px' },
  descriptionText: { color: '#374151', fontSize: '14px', lineHeight: '1.6', margin: 0 },
  contactsCard: { backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginBottom: '24px' },
  contactsHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E5E7EB' },
  contactsHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  contactCountBadge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px', padding: '2px 10px', borderRadius: '12px', backgroundColor: '#F1F5F9', color: '#475569', fontSize: '13px', fontWeight: '500' },
  addContactButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  contactsList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  contactItem: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' },
  contactAvatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '16px', flexShrink: 0 },
  contactInfo: { flex: 1, minWidth: 0 },
  contactName: { fontSize: '14px', fontWeight: '600', color: '#111827' },
  contactTitle: { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  contactDetail: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B7280', marginTop: '4px' },
  contactDetailIcon: { color: '#9CA3AF' },
  emptyContacts: { textAlign: 'center', padding: '32px 0', color: '#6B7280', margin: 0 },
  modalContent: { display: 'flex', flexDirection: 'column', gap: '16px' },
  modalText: { color: '#374151', margin: 0 },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' },
  modalCancelButton: { padding: '8px 16px', backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  modalPrimaryButton: { padding: '8px 16px', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  modalDangerButton: { padding: '8px 16px', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  createFormContainer: { marginTop: '8px' },
  createFormGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' },
  formGroup: { marginBottom: '16px' },
  formLabel: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
  formInput: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box' },
  formSelect: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box' },
  formTextarea: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
};

export default CompanyDetails;