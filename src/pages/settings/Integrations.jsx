// pages/admin/Integrations.js
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
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  Mail, 
  MessageSquare, 
  Calendar, 
  Cloud, 
  Database,
  Github,
  GitBranch,
  Slack,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Zap,
  Plug,
  Settings,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

const Integrations = () => {
  const { token } = useAuth();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [configData, setConfigData] = useState({});

  // API base URL
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/integrations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setIntegrations(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching integrations:', err);
      let errorMessage = 'Failed to load integrations.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view integrations.';
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

  const handleToggle = async (integration) => {
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/integrations/${integration._id}/toggle`, 
        { enabled: !integration.enabled },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Integration updated successfully');
      await fetchIntegrations();
    } catch (err) {
      console.error('Error toggling integration:', err);
      let errorMessage = 'Failed to update integration.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to modify this integration.';
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

  const handleConfigure = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      await axios.put(`${API_URL}/integrations/${selectedIntegration._id}/configure`, 
        configData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Integration configured successfully');
      setShowModal(false);
      setSelectedIntegration(null);
      setConfigData({});
      await fetchIntegrations();
    } catch (err) {
      console.error('Error configuring integration:', err);
      let errorMessage = 'Failed to configure integration.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to configure this integration.';
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

  const getIntegrationIcon = (type) => {
    const icons = {
      'email': Mail,
      'slack': Slack,
      'calendly': Calendar,
      'google': Cloud,
      'github': Github,
      'gitlab': GitBranch,
      'twitter': Twitter,
      'facebook': Facebook,
      'instagram': Instagram,
      'linkedin': Linkedin,
      'youtube': Youtube,
      'database': Database,
      'webhook': Zap,
      'api': Plug
    };
    const Icon = icons[type] || Plug;
    return <Icon style={styles.integrationIcon} />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'error': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusStyle = (status) => {
    const statusStyles = {
      'active': { backgroundColor: '#d1fae5', color: '#065f46' },
      'inactive': { backgroundColor: '#f3f4f6', color: '#374151' },
      'error': { backgroundColor: '#fee2e2', color: '#991b1b' },
      'pending': { backgroundColor: '#fef3c7', color: '#92400e' }
    };
    return statusStyles[status] || statusStyles.inactive;
  };

  const openConfigureModal = (integration) => {
    setSelectedIntegration(integration);
    // Initialize config data with existing values
    const initialConfig = {};
    if (integration.configFields) {
      integration.configFields.forEach(field => {
        initialConfig[field.name] = field.value || '';
      });
    }
    setConfigData(initialConfig);
    setShowModal(true);
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfigData(prev => ({ ...prev, [name]: value }));
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
          <h1 style={styles.title}>Integrations</h1>
          <p style={styles.subtitle}>Connect external services and tools</p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div style={styles.integrationsGrid}>
        {integrations.map((integration) => (
          <div key={integration._id} style={styles.integrationCard}>
            <div style={styles.integrationHeader}>
              <div style={styles.integrationHeaderLeft}>
                <div style={styles.integrationIconWrapper}>
                  {getIntegrationIcon(integration.type)}
                </div>
                <div>
                  <h3 style={styles.integrationName}>{integration.name}</h3>
                  <p style={styles.integrationDescription}>{integration.description}</p>
                </div>
              </div>
              <span style={{
                ...styles.statusBadge,
                ...getStatusStyle(integration.status)
              }}>
                {integration.status ? integration.status.charAt(0).toUpperCase() + integration.status.slice(1) : 'N/A'}
              </span>
            </div>
            <div style={styles.integrationContent}>
              <div style={styles.integrationToggle}>
                <span style={styles.toggleLabel}>Enabled</span>
                <Switch
                  checked={integration.enabled || false}
                  onChange={() => handleToggle(integration)}
                  disabled={actionLoading}
                />
              </div>
              {integration.lastSync && (
                <div style={styles.integrationDetail}>
                  <span style={styles.detailLabel}>Last Sync</span>
                  <span style={styles.detailValue}>
                    {new Date(integration.lastSync).toLocaleString()}
                  </span>
                </div>
              )}
              <div style={styles.integrationActions}>
                <button 
                  style={{...styles.actionButton, ...styles.actionButtonOutline}}
                  onClick={() => openConfigureModal(integration)}
                  disabled={actionLoading}
                >
                  <Settings style={styles.actionIcon} />
                  Configure
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {integrations.length === 0 && (
        <div style={styles.emptyState}>
          <Plug style={styles.emptyIcon} />
          <p style={styles.emptyText}>No integrations available</p>
        </div>
      )}

      {/* Configure Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedIntegration(null);
          setConfigData({});
        }}
        title={`Configure ${selectedIntegration?.name}`}
        size="lg"
      >
        <form onSubmit={handleConfigure} style={styles.modalForm}>
          <div style={styles.configFields}>
            {selectedIntegration?.configFields?.map((field) => (
              <div key={field.name} style={styles.formGroup}>
                <label style={styles.formLabel}>
                  {field.label}
                  {field.required && <span style={styles.requiredStar}>*</span>}
                </label>
                {field.type === 'password' ? (
                  <input
                    type="password"
                    name={field.name}
                    value={configData[field.name] || ''}
                    onChange={handleConfigChange}
                    style={styles.formInput}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={actionLoading}
                  />
                ) : field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={configData[field.name] || ''}
                    onChange={handleConfigChange}
                    style={{...styles.formInput, ...styles.textarea}}
                    rows="3"
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={actionLoading}
                  />
                ) : (
                  <input
                    type="text"
                    name={field.name}
                    value={configData[field.name] || ''}
                    onChange={handleConfigChange}
                    style={styles.formInput}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={actionLoading}
                  />
                )}
                {field.help && (
                  <p style={styles.helpText}>{field.help}</p>
                )}
              </div>
            ))}
          </div>

          <div style={styles.modalActions}>
            <button
              type="button"
              style={styles.modalCancelButton}
              onClick={() => {
                setShowModal(false);
                setSelectedIntegration(null);
                setConfigData({});
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
              {actionLoading ? 'Saving...' : 'Save Configuration'}
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
  integrationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
  },
  integrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'box-shadow 0.3s ease',
  },
  integrationHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #F3F4F6',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  integrationHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  integrationIconWrapper: {
    padding: '8px',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  integrationIcon: {
    width: '32px',
    height: '32px',
    color: '#374151',
  },
  integrationName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  integrationDescription: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '500',
  },
  integrationContent: {
    padding: '16px 20px',
  },
  integrationToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 0',
  },
  toggleLabel: {
    fontSize: '14px',
    color: '#6B7280',
  },
  integrationDetail: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 0',
    fontSize: '14px',
  },
  detailLabel: {
    color: '#6B7280',
  },
  detailValue: {
    fontWeight: '500',
    color: '#111827',
  },
  integrationActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #F3F4F6',
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
  },
  actionIcon: {
    width: '16px',
    height: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    color: '#D1D5DB',
    margin: '0 auto 12px',
  },
  emptyText: {
    color: '#6B7280',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  configFields: {
    display: 'flex',
    flexDirection: 'column',
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
  requiredStar: {
    color: '#EF4444',
    marginLeft: '4px',
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
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  helpText: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
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
  
  .integration-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  }
  
  .action-button-outline:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .modal-cancel-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .modal-submit-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .form-input:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  .action-button:disabled,
  .modal-submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .integrations-grid {
      grid-template-columns: 1fr !important;
    }
    
    .integration-header {
      flex-direction: column !important;
      gap: 12px !important;
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
    
    .integration-header-left {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Integrations;