// components/standup/StandupForm.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Clock,
  ListTodo
} from 'lucide-react';

const StandupForm = ({ onSuccess, defaultDate }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    date: defaultDate || new Date().toISOString().split('T')[0],
    completedTasks: '',
    blockers: '',
    tomorrowPlan: '',
    additionalNotes: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const data = {
        ...formData,
        completedTasks: formData.completedTasks.split('\n').filter(item => item.trim()),
        blockers: formData.blockers.split('\n').filter(item => item.trim()),
        tomorrowPlan: formData.tomorrowPlan.split('\n').filter(item => item.trim())
      };

      const response = await axios.post(`${API_URL}/employees/standup`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        toast.success('Standup submitted successfully!');
        setSubmitted(true);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error('Error submitting standup:', err);
      let errorMessage = 'Failed to submit standup.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to submit standup.';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid standup data.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div style={styles.successContainer}>
        <CheckCircle style={styles.successIcon} />
        <h3 style={styles.successTitle}>Standup Submitted! 🎉</h3>
        <p style={styles.successText}>Thank you for your update. Have a great day!</p>
        <button 
          style={styles.successButton}
          onClick={() => {
            setSubmitted(false);
            setFormData({
              date: new Date().toISOString().split('T')[0],
              completedTasks: '',
              blockers: '',
              tomorrowPlan: '',
              additionalNotes: ''
            });
          }}
        >
          Submit Another
        </button>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>
            <Calendar style={styles.headerIcon} />
            <span>Daily Standup</span>
          </div>
          <p style={styles.headerSubtitle}>
            Share your updates for {formatDate(formData.date)}
          </p>
        </div>
        <div style={styles.headerDue}>
          <Clock style={styles.dueIcon} />
          <span>Due: 5:00 PM</span>
        </div>
      </div>
      <div style={styles.content}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* What did you complete today? */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              What did you complete today?
              <span style={styles.requiredStar}>*</span>
            </label>
            <textarea
              name="completedTasks"
              value={formData.completedTasks}
              onChange={handleChange}
              placeholder="List what you accomplished today (one per line)"
              rows={4}
              required
              style={styles.textarea}
              disabled={isLoading}
            />
            <p style={styles.helperText}>
              <ListTodo style={styles.helperIcon} />
              Enter each task on a new line
            </p>
          </div>

          {/* Any blockers? */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              Any blockers?
            </label>
            <textarea
              name="blockers"
              value={formData.blockers}
              onChange={handleChange}
              placeholder="List any blockers or challenges (one per line)"
              rows={3}
              style={styles.textarea}
              disabled={isLoading}
            />
            <p style={styles.helperText}>
              <AlertCircle style={styles.helperIcon} />
              Include anything blocking your progress
            </p>
          </div>

          {/* Plan for tomorrow */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              Plan for tomorrow
              <span style={styles.requiredStar}>*</span>
            </label>
            <textarea
              name="tomorrowPlan"
              value={formData.tomorrowPlan}
              onChange={handleChange}
              placeholder="What are your priorities for tomorrow? (one per line)"
              rows={3}
              required
              style={styles.textarea}
              disabled={isLoading}
            />
            <p style={styles.helperText}>
              <ListTodo style={styles.helperIcon} />
              Enter each priority on a new line
            </p>
          </div>

          {/* Additional Notes */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              Additional Notes
            </label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              placeholder="Any additional context or updates..."
              rows={2}
              style={styles.textarea}
              disabled={isLoading}
            />
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              style={styles.resetButton}
              onClick={() => {
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  completedTasks: '',
                  blockers: '',
                  tomorrowPlan: '',
                  additionalNotes: ''
                });
              }}
              disabled={isLoading}
            >
              Reset
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={isLoading}
            >
              <Send style={styles.buttonIcon} />
              {isLoading ? 'Submitting...' : 'Submit Standup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  successContainer: {
    padding: '32px',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  successIcon: {
    width: '48px',
    height: '48px',
    color: '#22C55E',
    margin: '0 auto 16px',
  },
  successTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  successText: {
    color: '#6B7280',
    margin: '0 0 16px 0',
  },
  successButton: {
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
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #E5E7EB',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  },
  headerIcon: {
    width: '20px',
    height: '20px',
    color: '#3B82F6',
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  headerDue: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    color: '#6B7280',
  },
  dueIcon: {
    width: '16px',
    height: '16px',
  },
  content: {
    padding: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  requiredStar: {
    color: '#EF4444',
    marginLeft: '4px',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    minHeight: '80px',
  },
  helperText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#6B7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  helperIcon: {
    width: '16px',
    height: '16px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
  },
  resetButton: {
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
  buttonIcon: {
    width: '16px',
    height: '16px',
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .reset-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .submit-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .success-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .textarea:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  .reset-button:disabled,
  .submit-button:disabled,
  .success-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .header-due {
      align-self: flex-start !important;
    }
    
    .actions {
      flex-direction: column !important;
    }
    
    .reset-button,
    .submit-button {
      width: 100% !important;
      justify-content: center !important;
    }
  }
  
  @media (max-width: 480px) {
    .content {
      padding: 16px !important;
    }
    
    .header {
      padding: 12px 16px !important;
    }
    
    .header-title {
      font-size: 16px !important;
    }
    
    .header-subtitle {
      font-size: 13px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default StandupForm;