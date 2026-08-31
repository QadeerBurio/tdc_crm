// pages/admin/Tenants.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2,
  Globe,
  Users,
  Settings,
  CreditCard,
  Calendar,
  Layers,
  Mail
} from 'lucide-react';

const Tenants = () => {
  const { token } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    status: 'active',
    subscription: {
      plan: 'free',
      startDate: ''
    }
  });

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/tenants`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setTenants(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
      let errorMessage = 'Failed to load tenants.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view tenants.';
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
      const tenantData = {
        name: formData.name,
        slug: formData.slug,
        domain: formData.domain,
        status: formData.status,
        subscription: {
          plan: formData.subscription.plan,
          startDate: formData.subscription.startDate
        }
      };

      let response;
      if (isEditing && selectedTenant) {
        response = await axios.put(`${API_URL}/tenants/${selectedTenant._id}`, tenantData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Tenant updated successfully');
      } else {
        response = await axios.post(`${API_URL}/tenants`, tenantData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Tenant created successfully');
      }

      if (response.data) {
        setShowModal(false);
        resetForm();
        await fetchTenants();
      }
    } catch (err) {
      console.error('Error saving tenant:', err);
      let errorMessage = isEditing ? 'Failed to update tenant.' : 'Failed to create tenant.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (err.response.status === 409) {
          errorMessage = 'Tenant slug already exists. Please use a different slug.';
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

  const handleDelete = async (tenant) => {
    if (!window.confirm(`Are you sure you want to delete the tenant "${tenant.name}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/tenants/${tenant._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Tenant deleted successfully');
      await fetchTenants();
    } catch (err) {
      console.error('Error deleting tenant:', err);
      let errorMessage = 'Failed to delete tenant.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to delete this tenant.';
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
    setSelectedTenant(null);
    setIsEditing(false);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (tenant) => {
    setSelectedTenant(tenant);
    setIsEditing(true);
    setFormData({
      name: tenant.name || '',
      slug: tenant.slug || '',
      domain: tenant.domain || '',
      status: tenant.status || 'active',
      subscription: {
        plan: tenant.subscription?.plan || 'free',
        startDate: tenant.subscription?.startDate?.split('T')[0] || ''
      }
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      domain: '',
      status: 'active',
      subscription: {
        plan: 'free',
        startDate: ''
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getPlanColor = (plan) => {
    const colors = {
      'free': 'bg-gray-100 text-gray-800',
      'starter': 'bg-blue-100 text-blue-800',
      'professional': 'bg-purple-100 text-purple-800',
      'enterprise': 'bg-green-100 text-green-800'
    };
    return colors[plan] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'suspended': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
          <h1 style={styles.title}>Tenant Management</h1>
          <p style={styles.subtitle}>Manage multi-tenant organizations</p>
        </div>
        <button style={styles.addButton} onClick={openCreateModal}>
          <Plus style={styles.buttonIcon} />
          Create Tenant
        </button>
      </div>

      {/* Tenants Grid */}
      <div style={styles.tenantsGrid}>
        {tenants.map((tenant) => (
          <div key={tenant._id} style={styles.tenantCard}>
            <div style={styles.tenantHeader}>
              <div style={styles.tenantHeaderLeft}>
                <div style={styles.tenantAvatar}>
                  {tenant.name.charAt(0)}
                </div>
                <div>
                  <h3 style={styles.tenantName}>{tenant.name}</h3>
                  <p style={styles.tenantDomain}>{tenant.domain}</p>
                </div>
              </div>
              <span style={{
                ...styles.statusBadge,
                ...parseColorStyle(getStatusColor(tenant.status))
              }}>
                {tenant.status ? tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1) : 'N/A'}
              </span>
            </div>
            <div style={styles.tenantContent}>
              <div style={styles.tenantDetail}>
                <span style={styles.detailLabel}>Plan</span>
                <span style={{
                  ...styles.planBadge,
                  ...parseColorStyle(getPlanColor(tenant.subscription?.plan))
                }}>
                  {tenant.subscription?.plan ? tenant.subscription.plan.charAt(0).toUpperCase() + tenant.subscription.plan.slice(1) : 'Free'}
                </span>
              </div>
              <div style={styles.tenantDetail}>
                <span style={styles.detailLabel}>Users</span>
                <span style={styles.detailValue}>{tenant.userCount || 0}</span>
              </div>
              <div style={styles.tenantDetail}>
                <span style={styles.detailLabel}>Brands</span>
                <span style={styles.detailValue}>{tenant.brandCount || 0}</span>
              </div>
              <div style={styles.tenantDetail}>
                <span style={styles.detailLabel}>Created</span>
                <span style={styles.detailValue}>{formatDate(tenant.createdAt)}</span>
              </div>
              <div style={styles.tenantActions}>
                <button 
                  style={{...styles.tenantActionButton, ...styles.tenantActionOutline}}
                  onClick={() => openEditModal(tenant)}
                  disabled={actionLoading}
                >
                  <Settings style={styles.actionIcon} />
                  Edit
                </button>
                <button 
                  style={{...styles.tenantActionButton, ...styles.tenantActionDanger}}
                  onClick={() => handleDelete(tenant)}
                  disabled={actionLoading}
                >
                  <Trash2 style={styles.actionIcon} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tenants.length === 0 && (
        <div style={styles.emptyState}>
          <Building style={styles.emptyIcon} />
          <p style={styles.emptyText}>No tenants found</p>
          <button style={styles.emptyButton} onClick={openCreateModal}>
            <Plus style={styles.buttonIcon} />
            Create Your First Tenant
          </button>
        </div>
      )}

      {/* Tenant Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={isEditing ? 'Edit Tenant' : 'Create Tenant'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Tenant Name</label>
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
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                style={styles.formInput}
                required
                disabled={actionLoading}
                placeholder="unique-identifier"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Domain</label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
                style={styles.formInput}
                disabled={actionLoading}
                placeholder="example.com"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Plan</label>
              <select
                name="subscription.plan"
                value={formData.subscription.plan}
                onChange={handleInputChange}
                style={styles.formSelect}
                disabled={actionLoading}
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={styles.formSelect}
                disabled={actionLoading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Subscription Start Date</label>
              <input
                type="date"
                name="subscription.startDate"
                value={formData.subscription.startDate}
                onChange={handleInputChange}
                style={styles.formInput}
                disabled={actionLoading}
              />
            </div>
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
              {actionLoading ? 'Saving...' : (isEditing ? 'Update Tenant' : 'Create Tenant')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Helper function to parse color styles
const parseColorStyle = (colorString) => {
  if (!colorString) return { backgroundColor: '#f3f4f6', color: '#6b7280' };
  const parts = colorString.split(' ');
  return {
    backgroundColor: parts[0] || '#f3f4f6',
    color: parts[1] || '#6b7280'
  };
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
  tenantsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  tenantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'box-shadow 0.3s ease',
  },
  tenantHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #F3F4F6',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  tenantHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  tenantAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px',
    flexShrink: 0,
  },
  tenantName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  tenantDomain: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  tenantContent: {
    padding: '16px 20px',
  },
  tenantDetail: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '14px',
  },
  detailLabel: {
    color: '#6B7280',
  },
  detailValue: {
    fontWeight: '500',
    color: '#111827',
  },
  planBadge: {
    display: 'inline-flex',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  tenantActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #F3F4F6',
  },
  tenantActionButton: {
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
  tenantActionOutline: {
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
  },
  tenantActionDanger: {
    backgroundColor: 'transparent',
    color: '#EF4444',
    border: '1px solid #D1D5DB',
    flex: 0.5,
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
    marginBottom: '16px',
  },
  emptyButton: {
    display: 'inline-flex',
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
  
  .tenant-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  }
  
  .tenant-action-outline:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .tenant-action-danger:hover:not(:disabled) {
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
  .form-select:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  .empty-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .add-button:disabled,
  .tenant-action-button:disabled,
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
    
    .tenants-grid {
      grid-template-columns: 1fr !important;
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
    
    .tenant-actions {
      flex-direction: column !important;
    }
    
    .tenant-action-button {
      width: 100% !important;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 16px !important;
    }
    
    .tenant-header {
      flex-direction: column !important;
      gap: 12px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Tenants;