// components/crm/LeadFormModal.jsx - COMPLETE FIXED VERSION WITH NEW COLOR SCHEME
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeadFormModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    contactName: initialData?.contactName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    website: initialData?.website || '',
    leadSource: initialData?.leadSource || '',
    pipelineType: initialData?.pipelineType || 'US_OUTREACH',
    country: initialData?.country || '',
    city: initialData?.city || '',
    timezone: initialData?.timezone || 'America/New_York',
    companySize: initialData?.companySize || '',
    industry: initialData?.industry || '',
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (initialData) {
        response = await axios.put(`${API_URL}/crm/leads/${initialData._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Lead updated successfully');
      } else {
        response = await axios.post(`${API_URL}/crm/leads`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Lead created successfully');
      }

      if (response.data) {
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error('Error saving lead:', err);
      let errorMessage = initialData ? 'Failed to update lead.' : 'Failed to create lead.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (err.response.status === 409) {
          errorMessage = 'Lead with this email already exists.';
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

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {initialData ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button style={styles.closeButton} onClick={onClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                style={styles.input}
                required
                placeholder="Enter company name"
                disabled={loading}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Contact Name *</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                style={styles.input}
                required
                placeholder="Enter contact name"
                disabled={loading}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                required
                placeholder="Enter email address"
                disabled={loading}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter phone number"
                disabled={loading}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter website URL"
                disabled={loading}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Lead Source *</label>
              <select
                name="leadSource"
                value={formData.leadSource}
                onChange={handleChange}
                style={styles.select}
                required
                disabled={loading}
              >
                <option value="">Select source...</option>
                <option value="Cold Email">Cold Email</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Inbound">Inbound</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Pipeline Type *</label>
              <select
                name="pipelineType"
                value={formData.pipelineType}
                onChange={handleChange}
                style={styles.select}
                required
                disabled={loading}
              >
                <option value="US_OUTREACH">US Outreach</option>
                <option value="LOCAL_RETAINER">Local Retainer</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Country *</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                style={styles.input}
                required
                placeholder="Enter country"
                disabled={loading}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter city"
                disabled={loading}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Timezone</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                style={styles.select}
                disabled={loading}
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Anchorage">Alaska Time (AKT)</option>
                <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Company Size</label>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                style={styles.select}
                disabled={loading}
              >
                <option value="">Select size...</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="200+">200+</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter industry"
                disabled={loading}
              />
            </div>
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.cancelButton} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? 'Saving...' : (initialData ? 'Update Lead' : 'Create Lead')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(1, 62, 55, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(1, 62, 55, 0.2)',
    border: '1px solid #FFEFB3',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #FFEFB3',
    backgroundColor: '#FFEFB3',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#013E37',
    margin: 0,
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#013E37',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  closeButtonHover: {
    backgroundColor: 'rgba(1, 62, 55, 0.1)',
  },
  form: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#013E37',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #FFEFB3',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: '#FFFFFF',
    color: '#013E37',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: '#013E37',
    boxShadow: '0 0 0 3px rgba(1, 62, 55, 0.1)',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #FFEFB3',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: '#FFFFFF',
    color: '#013E37',
    width: '100%',
    boxSizing: 'border-box',
  },
  selectFocus: {
    borderColor: '#013E37',
    boxShadow: '0 0 0 3px rgba(1, 62, 55, 0.1)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #FFEFB3',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#013E37',
    border: '1px solid #FFEFB3',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  cancelButtonHover: {
    backgroundColor: '#FFEFB3',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  submitButtonHover: {
    backgroundColor: '#0A5C54',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.2)',
  },
};

// Add styles and animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .close-button:hover:not(:disabled) {
    background-color: rgba(1, 62, 55, 0.1) !important;
  }
  
  .input:focus,
  .select:focus {
    border-color: #013E37 !important;
    box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1) !important;
  }
  
  .cancel-button:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
    border-color: #013E37 !important;
  }
  
  .submit-button:hover:not(:disabled) {
    background-color: #0A5C54 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(1, 62, 55, 0.2) !important;
  }
  
  .cancel-button:disabled,
  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .input:disabled,
  .select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr !important;
    }
    
    .actions {
      flex-direction: column !important;
    }
    
    .cancel-button,
    .submit-button {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .modal {
      max-height: 95vh !important;
      margin: 10px !important;
    }
    
    .modal-header {
      padding: 16px !important;
    }
    
    .form {
      padding: 16px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default LeadFormModal;