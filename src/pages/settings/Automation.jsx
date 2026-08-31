// pages/admin/Automation.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Switch } from '../../components/common/Switch';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2,
  Play,
  Pause,
  Clock,
  Mail,
  MessageSquare,
  Users,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

const Automation = () => {
  const { token } = useAuth();
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    trigger: 'lead_created',
    action: 'send_email',
    conditions: '{}',
    config: '{}'
  });

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/automations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setAutomations(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching automations:', err);
      let errorMessage = 'Failed to load automations.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view automations.';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const automationData = {
        name: formData.name,
        trigger: formData.trigger,
        action: formData.action,
        conditions: JSON.parse(formData.conditions || '{}'),
        config: JSON.parse(formData.config || '{}')
      };

      let response;
      if (isEditing && selectedAutomation) {
        response = await axios.put(`${API_URL}/automations/${selectedAutomation._id}`, automationData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Automation updated successfully');
      } else {
        response = await axios.post(`${API_URL}/automations`, automationData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Automation created successfully');
      }

      if (response.data) {
        setShowModal(false);
        resetForm();
        await fetchAutomations();
      }
    } catch (err) {
      console.error('Error saving automation:', err);
      let errorMessage = isEditing ? 'Failed to update automation.' : 'Failed to create automation.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (automation) => {
    if (!window.confirm(`Are you sure you want to delete the automation "${automation.name}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/automations/${automation._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Automation deleted successfully');
      await fetchAutomations();
    } catch (err) {
      console.error('Error deleting automation:', err);
      let errorMessage = 'Failed to delete automation.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to delete this automation.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (automation) => {
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/automations/${automation._id}/toggle`, 
        { enabled: !automation.enabled },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Automation toggled successfully');
      await fetchAutomations();
    } catch (err) {
      console.error('Error toggling automation:', err);
      let errorMessage = 'Failed to toggle automation.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to modify this automation.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedAutomation(null);
    setIsEditing(false);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (automation) => {
    setSelectedAutomation(automation);
    setIsEditing(true);
    setFormData({
      name: automation.name || '',
      trigger: automation.trigger || 'lead_created',
      action: automation.action || 'send_email',
      conditions: JSON.stringify(automation.conditions || {}),
      config: JSON.stringify(automation.config || {})
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      trigger: 'lead_created',
      action: 'send_email',
      conditions: '{}',
      config: '{}'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getTriggerIcon = (trigger) => {
    const icons = {
      'lead_created': <Users style={styles.triggerIcon} />,
      'lead_updated': <Edit style={styles.triggerIcon} />,
      'deal_won': <Target style={styles.triggerIcon} />,
      'task_completed': <CheckCircle style={styles.triggerIcon} />,
      'email_opened': <Mail style={styles.triggerIcon} />,
      'time_based': <Clock style={styles.triggerIcon} />,
      'approval_approved': <CheckCircle style={styles.triggerIcon} />,
      'approval_revised': <Edit style={styles.triggerIcon} />
    };
    return icons[trigger] || <Zap style={styles.triggerIcon} />;
  };

  const getActionIcon = (action) => {
    const icons = {
      'send_email': <Mail style={styles.actionIcon} />,
      'create_task': <CheckCircle style={styles.actionIcon} />,
      'send_notification': <MessageSquare style={styles.actionIcon} />,
      'update_status': <TrendingUp style={styles.actionIcon} />,
      'assign_user': <Users style={styles.actionIcon} />,
      'webhook': <Zap style={styles.actionIcon} />
    };
    return icons[action] || <Zap style={styles.actionIcon} />;
  };

  const getTriggerLabel = (trigger) => {
    const labels = {
      'lead_created': 'Lead Created',
      'lead_updated': 'Lead Updated',
      'deal_won': 'Deal Won',
      'task_completed': 'Task Completed',
      'email_opened': 'Email Opened',
      'time_based': 'Time Based (Cron)',
      'approval_approved': 'Approval Approved',
      'approval_revised': 'Approval Revised'
    };
    return labels[trigger] || trigger;
  };

  const getActionLabel = (action) => {
    const labels = {
      'send_email': 'Send Email',
      'create_task': 'Create Task',
      'send_notification': 'Send Notification',
      'update_status': 'Update Status',
      'assign_user': 'Assign User',
      'webhook': 'Call Webhook'
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Automation Rules</h1>
          <p style={styles.subtitle}>Configure automated workflows and triggers</p>
        </div>
        <button style={styles.addButton} onClick={openCreateModal}>
          <Plus style={styles.buttonIcon} />
          Create Automation
        </button>
      </div>

      {/* Automations List */}
      <div style={styles.automationsList}>
        {automations.map((automation) => (
          <div key={automation._id} style={styles.automationCard}>
            <div style={styles.automationContent}>
              <div style={styles.automationInfo}>
                <div style={{
                  ...styles.automationIcon,
                  backgroundColor: automation.enabled ? '#d1fae5' : '#f3f4f6'
                }}>
                  {automation.enabled ? (
                    <Zap style={{...styles.automationIconSvg, color: '#16A34A'}} />
                  ) : (
                    <Zap style={{...styles.automationIconSvg, color: '#9CA3AF'}} />
                  )}
                </div>
                <div>
                  <h4 style={styles.automationName}>{automation.name}</h4>
                  <div style={styles.automationDetails}>
                    <span style={styles.automationTrigger}>
                      {getTriggerIcon(automation.trigger)}
                      <span style={styles.detailText}>When: {getTriggerLabel(automation.trigger)}</span>
                    </span>
                    <span style={styles.detailSeparator}>|</span>
                    <span style={styles.automationAction}>
                      {getActionIcon(automation.action)}
                      <span style={styles.detailText}>Action: {getActionLabel(automation.action)}</span>
                    </span>
                    <span style={{
                      ...styles.statusBadge,
                      ...(automation.enabled ? styles.statusBadgeSuccess : styles.statusBadgeSecondary)
                    }}>
                      {automation.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div style={styles.automationControls}>
                <Switch
                  checked={automation.enabled || false}
                  onChange={() => handleToggle(automation)}
                  disabled={actionLoading}
                />
                <button 
                  style={{...styles.controlButton, ...styles.controlButtonOutline}}
                  onClick={() => openEditModal(automation)}
                  disabled={actionLoading}
                >
                  <Edit style={styles.controlIcon} />
                </button>
                <button 
                  style={{...styles.controlButton, ...styles.controlButtonDanger}}
                  onClick={() => handleDelete(automation)}
                  disabled={actionLoading}
                >
                  <Trash2 style={styles.controlIcon} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {automations.length === 0 && (
          <div style={styles.emptyState}>
            <Zap style={styles.emptyIcon} />
            <p style={styles.emptyText}>No automation rules configured</p>
            <button style={styles.emptyButton} onClick={openCreateModal}>
              Create your first automation
            </button>
          </div>
        )}
      </div>

      {/* Automation Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={isEditing ? 'Edit Automation' : 'Create Automation'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Automation Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              style={styles.formInput}
              required
              disabled={actionLoading}
            />
          </div>
          
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Trigger</label>
              <select
                name="trigger"
                value={formData.trigger}
                onChange={handleInputChange}
                style={styles.formSelect}
                required
                disabled={actionLoading}
              >
                <option value="lead_created">Lead Created</option>
                <option value="lead_updated">Lead Updated</option>
                <option value="deal_won">Deal Won</option>
                <option value="task_completed">Task Completed</option>
                <option value="email_opened">Email Opened</option>
                <option value="time_based">Time Based (Cron)</option>
                <option value="approval_approved">Approval Approved</option>
                <option value="approval_revised">Approval Revised</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Action</label>
              <select
                name="action"
                value={formData.action}
                onChange={handleInputChange}
                style={styles.formSelect}
                required
                disabled={actionLoading}
              >
                <option value="send_email">Send Email</option>
                <option value="create_task">Create Task</option>
                <option value="send_notification">Send Notification</option>
                <option value="update_status">Update Status</option>
                <option value="assign_user">Assign User</option>
                <option value="webhook">Call Webhook</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Conditions (JSON)</label>
            <textarea
              name="conditions"
              value={formData.conditions}
              onChange={handleInputChange}
              style={{...styles.formInput, ...styles.textarea}}
              rows="3"
              placeholder='{"field": "value"}'
              disabled={actionLoading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Configuration (JSON)</label>
            <textarea
              name="config"
              value={formData.config}
              onChange={handleInputChange}
              style={{...styles.formInput, ...styles.textarea}}
              rows="3"
              placeholder='{"key": "value"}'
              disabled={actionLoading}
            />
          </div>

          <div style={styles.modalActions}>
            <button
              type="button"
              style={styles.modalCancelButton}
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.modalSubmitButton}
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : (isEditing ? 'Update Automation' : 'Create Automation')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64vh',
  },
  spinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  buttonIcon: {
    width: '16px',
    height: '16px',
  },
  automationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  automationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '16px',
    transition: 'box-shadow 0.3s ease',
  },
  automationContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  automationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  automationIcon: {
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  automationIconSvg: {
    width: '20px',
    height: '20px',
  },
  automationName: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
  },
  automationDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
    flexWrap: 'wrap',
  },
  automationTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#6B7280',
  },
  automationAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#6B7280',
  },
  triggerIcon: {
    width: '14px',
    height: '14px',
  },
  actionIcon: {
    width: '14px',
    height: '14px',
  },
  detailText: {
    fontSize: '13px',
    color: '#6B7280',
  },
  detailSeparator: {
    color: '#D1D5DB',
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '500',
  },
  statusBadgeSuccess: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusBadgeSecondary: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
  automationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  controlButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  controlButtonOutline: {
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
  },
  controlButtonDanger: {
    backgroundColor: 'transparent',
    color: '#EF4444',
    border: '1px solid #D1D5DB',
  },
  controlIcon: {
    width: '16px',
    height: '16px',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '32px',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    color: '#D1D5DB',
    margin: '0 auto 12px',
  },
  emptyText: {
    color: '#6B7280',
    marginBottom: '12px',
  },
  emptyButton: {
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
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  formLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  formInput: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  formSelect: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
  },
  modalCancelButton: {
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
  modalSubmitButton: {
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

// Add keyframe and hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .add-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .automation-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  }
  
  .control-button-outline:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .control-button-danger:hover:not(:disabled) {
    background-color: #FEE2E2 !important;
    border-color: #EF4444 !important;
  }
  
  .modal-cancel-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .modal-submit-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .form-input:focus,
  .form-select:focus,
  .textarea:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  .empty-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .add-button:disabled,
  .control-button:disabled,
  .modal-submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .add-button {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .automation-content {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .automation-info {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    
    .automation-controls {
      width: 100% !important;
      justify-content: flex-start !important;
    }
    
    .form-grid {
      grid-template-columns: 1fr !important;
    }
    
    .modal-actions {
      flex-direction: column !important;
    }
    
    .modal-cancel-button,
    .modal-submit-button {
      width: 100% !important;
      justify-content: center !important;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 16px !important;
    }
    
    .automation-details {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    
    .detail-separator {
      display: none !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Automation;