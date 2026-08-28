// components/crm/LeadForm.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeadForm = ({ initialData = null, onSuccess, onCancel }) => {
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

  // API base URL
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

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Company Name</label>
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
          <label style={styles.label}>Contact Name</label>
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
          <label style={styles.label}>Email</label>
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
          <label style={styles.label}>Lead Source</label>
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
          <label style={styles.label}>Pipeline Type</label>
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
          <label style={styles.label}>Country</label>
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
        <button type="button" style={styles.cancelButton} onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" style={styles.submitButton} disabled={loading}>
          {loading ? 'Saving...' : (initialData ? 'Update Lead' : 'Create Lead')}
        </button>
      </div>
    </form>
  );
};

const styles = {
  form: {
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
    color: '#374151',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    width: '100%',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  submitButton: {
    padding: '8px 16px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .cancel-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .submit-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .input:focus,
  .select:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  .cancel-button:disabled,
  .submit-button:disabled {
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
  }
`;
document.head.appendChild(styleSheet);

export default LeadForm;