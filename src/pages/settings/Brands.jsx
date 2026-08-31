// pages/admin/Brands.js
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
  Building2, 
  Plus, 
  Edit, 
  Trash2,
  Globe,
  Users,
  Settings,
  ChevronRight,
  Layers
} from 'lucide-react';

const Brands = () => {
  const { token } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'agency',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    status: 'active'
  });

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/brands`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setBrands(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
      let errorMessage = 'Failed to load brands.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view brands.';
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
      const brandData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        type: formData.type,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        status: formData.status
      };

      let response;
      if (isEditing && selectedBrand) {
        response = await axios.put(`${API_URL}/brands/${selectedBrand._id}`, brandData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Brand updated successfully');
      } else {
        response = await axios.post(`${API_URL}/brands`, brandData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Brand created successfully');
      }

      if (response.data) {
        setShowModal(false);
        resetForm();
        await fetchBrands();
      }
    } catch (err) {
      console.error('Error saving brand:', err);
      let errorMessage = isEditing ? 'Failed to update brand.' : 'Failed to create brand.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (err.response.status === 409) {
          errorMessage = 'Brand slug already exists. Please use a different slug.';
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

  const handleDelete = async (brand) => {
    if (!window.confirm(`Are you sure you want to delete the brand "${brand.name}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/brands/${brand._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Brand deleted successfully');
      await fetchBrands();
    } catch (err) {
      console.error('Error deleting brand:', err);
      let errorMessage = 'Failed to delete brand.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to delete this brand.';
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
    setSelectedBrand(null);
    setIsEditing(false);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (brand) => {
    setSelectedBrand(brand);
    setIsEditing(true);
    setFormData({
      name: brand.name || '',
      slug: brand.slug || '',
      description: brand.description || '',
      type: brand.type || 'agency',
      primaryColor: brand.primaryColor || '#3B82F6',
      secondaryColor: brand.secondaryColor || '#10B981',
      status: brand.status || 'active'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      type: 'agency',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      status: 'active'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getTypeColor = (type) => {
    const colors = {
      'agency': 'bg-blue-100 text-blue-800',
      'outreach': 'bg-green-100 text-green-800',
      'app': 'bg-purple-100 text-purple-800',
      'subsidiary': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getTypeStyle = (type) => {
    const styles = {
      'agency': { backgroundColor: '#dbeafe', color: '#1e40af' },
      'outreach': { backgroundColor: '#d1fae5', color: '#065f46' },
      'app': { backgroundColor: '#ede9fe', color: '#5b21b6' },
      'subsidiary': { backgroundColor: '#ffedd5', color: '#9a3412' }
    };
    return styles[type] || { backgroundColor: '#f3f4f6', color: '#374151' };
  };

  const getTypeIcon = (type) => {
    const icons = {
      'agency': <Building2 style={styles.badgeIcon} />,
      'outreach': <Globe style={styles.badgeIcon} />,
      'app': <Layers style={styles.badgeIcon} />,
      'subsidiary': <ChevronRight style={styles.badgeIcon} />
    };
    return icons[type] || <Building2 style={styles.badgeIcon} />;
  };

  const getStatusStyle = (status) => {
    const styles = {
      'active': { backgroundColor: '#d1fae5', color: '#065f46' },
      'inactive': { backgroundColor: '#fee2e2', color: '#991b1b' }
    };
    return styles[status] || styles.active;
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
          <h1 style={styles.title}>Brand Management</h1>
          <p style={styles.subtitle}>Manage your brands and business units</p>
        </div>
        <button style={styles.addButton} onClick={openCreateModal}>
          <Plus style={styles.buttonIcon} />
          Create Brand
        </button>
      </div>

      {/* Brands Grid */}
      <div style={styles.brandsGrid}>
        {brands.map((brand) => (
          <div key={brand._id} style={styles.brandCard}>
            <div style={styles.brandHeader}>
              <div style={styles.brandHeaderLeft}>
                <div style={styles.brandAvatar}>
                  {brand.name.charAt(0)}
                </div>
                <div>
                  <h3 style={styles.brandName}>{brand.name}</h3>
                  <p style={styles.brandDescription}>{brand.description || 'No description'}</p>
                </div>
              </div>
              <span style={{
                ...styles.typeBadge,
                ...getTypeStyle(brand.type)
              }}>
                <span style={styles.badgeContent}>
                  {getTypeIcon(brand.type)}
                  <span style={styles.badgeText}>{brand.type ? brand.type.charAt(0).toUpperCase() + brand.type.slice(1) : 'N/A'}</span>
                </span>
              </span>
            </div>
            <div style={styles.brandContent}>
              <div style={styles.brandDetail}>
                <span style={styles.detailLabel}>Slug</span>
                <span style={styles.detailSlug}>{brand.slug}</span>
              </div>
              <div style={styles.brandDetail}>
                <span style={styles.detailLabel}>Team Members</span>
                <span style={styles.detailValue}>{brand.team?.length || 0}</span>
              </div>
              <div style={styles.brandDetail}>
                <span style={styles.detailLabel}>Status</span>
                <span style={{
                  ...styles.statusBadge,
                  ...getStatusStyle(brand.status)
                }}>
                  {brand.status ? brand.status.charAt(0).toUpperCase() + brand.status.slice(1) : 'N/A'}
                </span>
              </div>
              <div style={styles.brandActions}>
                <button 
                  style={{...styles.brandActionButton, ...styles.brandActionOutline}}
                  onClick={() => openEditModal(brand)}
                  disabled={actionLoading}
                >
                  <Settings style={styles.actionIcon} />
                  Configure
                </button>
                <button 
                  style={{...styles.brandActionButton, ...styles.brandActionDanger}}
                  onClick={() => handleDelete(brand)}
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
      {brands.length === 0 && (
        <div style={styles.emptyState}>
          <Building2 style={styles.emptyIcon} />
          <p style={styles.emptyText}>No brands found</p>
          <button style={styles.emptyButton} onClick={openCreateModal}>
            <Plus style={styles.buttonIcon} />
            Create Your First Brand
          </button>
        </div>
      )}

      {/* Brand Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={isEditing ? 'Edit Brand' : 'Create Brand'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Brand Name</label>
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
              <label style={styles.formLabel}>Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                style={styles.formInput}
                disabled={actionLoading}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Brand Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                style={styles.formSelect}
                required
                disabled={actionLoading}
              >
                <option value="agency">Agency</option>
                <option value="outreach">Outreach</option>
                <option value="app">App</option>
                <option value="subsidiary">Subsidiary</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Primary Color</label>
              <input
                type="color"
                name="primaryColor"
                value={formData.primaryColor}
                onChange={handleInputChange}
                style={styles.colorInput}
                disabled={actionLoading}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Secondary Color</label>
              <input
                type="color"
                name="secondaryColor"
                value={formData.secondaryColor}
                onChange={handleInputChange}
                style={styles.colorInput}
                disabled={actionLoading}
              />
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
              </select>
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
              {actionLoading ? 'Saving...' : (isEditing ? 'Update Brand' : 'Create Brand')}
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
  brandsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  brandCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'box-shadow 0.3s ease',
  },
  brandHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #F3F4F6',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  brandHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandAvatar: {
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
  brandName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  brandDescription: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
  },
  typeBadge: {
    display: 'inline-flex',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '500',
  },
  badgeContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  badgeIcon: {
    width: '14px',
    height: '14px',
  },
  badgeText: {
    textTransform: 'capitalize',
  },
  brandContent: {
    padding: '16px 20px',
  },
  brandDetail: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 0',
    fontSize: '14px',
  },
  detailLabel: {
    color: '#6B7280',
  },
  detailSlug: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#111827',
  },
  detailValue: {
    fontWeight: '500',
    color: '#111827',
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  brandActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #F3F4F6',
  },
  brandActionButton: {
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
  brandActionOutline: {
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
  },
  brandActionDanger: {
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
  colorInput: {
    width: '100%',
    height: '40px',
    padding: '4px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s ease',
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
  
  .brand-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  }
  
  .brand-action-outline:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .brand-action-danger:hover:not(:disabled) {
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
  .color-input:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  .empty-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .add-button:disabled,
  .brand-action-button:disabled,
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
    
    .brands-grid {
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
    
    .brand-actions {
      flex-direction: column !important;
    }
    
    .brand-action-button {
      width: 100% !important;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 16px !important;
    }
    
    .brand-header {
      flex-direction: column !important;
      gap: 12px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Brands;