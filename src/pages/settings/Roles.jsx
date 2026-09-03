// pages/admin/Roles.js
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
import { Checkbox } from '../../components/common/Checkbox';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2,
  Check,
  X,
  Users
} from 'lucide-react';

const Roles = () => {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // API base URL
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    // Load permissions when editing
    if (selectedRole && isEditing) {
      setPermissions(selectedRole.permissions || []);
    } else {
      setPermissions([]);
    }
  }, [selectedRole, isEditing]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/roles`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setRoles(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      let errorMessage = 'Failed to load roles.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view roles.';
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
      const roleData = {
        name: formData.name,
        description: formData.description,
        permissions: permissions
      };

      let response;
      if (isEditing && selectedRole) {
        response = await axios.put(`${API_URL}/roles/${selectedRole._id}`, roleData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Role updated successfully');
      } else {
        response = await axios.post(`${API_URL}/roles`, roleData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Role created successfully');
      }

      if (response.data) {
        setShowModal(false);
        resetForm();
        await fetchRoles();
      }
    } catch (err) {
      console.error('Error saving role:', err);
      let errorMessage = isEditing ? 'Failed to update role.' : 'Failed to create role.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (err.response.status === 409) {
          errorMessage = 'Role name already exists. Please use a different name.';
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

  const handleDelete = async (role) => {
    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/roles/${role._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Role deleted successfully');
      await fetchRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
      let errorMessage = 'Failed to delete role.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to delete this role.';
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

  const togglePermission = (permission) => {
    setPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const openCreateModal = () => {
    setSelectedRole(null);
    setIsEditing(false);
    setPermissions([]);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setIsEditing(true);
    setPermissions(role.permissions || []);
    setFormData({
      name: role.name || '',
      description: role.description || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setPermissions([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getPermissionLabel = (permission) => {
    return permission.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Permission categories
  const permissionCategories = {
    'CRM': [
      'view_leads', 'create_leads', 'edit_leads', 'delete_leads',
      'view_deals', 'create_deals', 'edit_deals', 'delete_deals',
      'view_pipeline', 'edit_pipeline'
    ],
    'Projects': [
      'view_projects', 'create_projects', 'edit_projects', 'delete_projects',
      'view_tasks', 'create_tasks', 'edit_tasks', 'delete_tasks',
      'view_boards', 'edit_boards'
    ],
    'Employees': [
      'view_employees', 'edit_employees', 'delete_employees',
      'view_timesheets', 'edit_timesheets', 'approve_timesheets',
      'view_attendance', 'edit_attendance',
      'view_kpis', 'edit_kpis'
    ],
    'Clients': [
      'view_clients', 'create_clients', 'edit_clients', 'delete_clients',
      'view_approvals', 'approve_assets', 'request_revisions'
    ],
    'Settings': [
      'view_settings', 'edit_settings',
      'manage_users', 'manage_roles',
      'manage_brands', 'manage_tenants',
      'view_logs', 'manage_system'
    ]
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
          <h1 style={styles.title}>Role Management</h1>
          <p style={styles.subtitle}>Define roles and permissions for users</p>
        </div>
        <button style={styles.addButton} onClick={openCreateModal}>
          <Plus style={styles.buttonIcon} />
          Create Role
        </button>
      </div>

      {/* Roles Grid */}
      <div style={styles.rolesGrid}>
        {roles.map((role) => (
          <div key={role._id} style={styles.roleCard}>
            <div style={styles.roleHeader}>
              <div style={styles.roleHeaderLeft}>
                <div style={styles.roleIcon}>
                  <Shield style={styles.roleIconSvg} />
                </div>
                <div>
                  <h3 style={styles.roleName}>{role.name}</h3>
                  <p style={styles.roleDescription}>{role.description || 'No description'}</p>
                </div>
              </div>
              <span style={{
                ...styles.roleBadge,
                ...(role.isDefault ? styles.roleBadgePrimary : styles.roleBadgeSecondary)
              }}>
                {role.isDefault ? 'Default' : 'Custom'}
              </span>
            </div>
            <div style={styles.roleContent}>
              <div style={styles.roleDetail}>
                <span style={styles.detailLabel}>Users</span>
                <span style={styles.detailValue}>{role.userCount || 0}</span>
              </div>
              <div style={styles.roleDetail}>
                <span style={styles.detailLabel}>Permissions</span>
                <span style={styles.detailValue}>{role.permissions?.length || 0}</span>
              </div>
              <div style={styles.permissionsList}>
                {(role.permissions || []).slice(0, 5).map((perm, index) => (
                  <span key={index} style={styles.permissionBadge}>
                    {getPermissionLabel(perm)}
                  </span>
                ))}
                {(role.permissions || []).length > 5 && (
                  <span style={styles.permissionBadge}>
                    +{role.permissions.length - 5} more
                  </span>
                )}
              </div>
              <div style={styles.roleActions}>
                <button 
                  style={{...styles.roleActionButton, ...styles.roleActionOutline}}
                  onClick={() => openEditModal(role)}
                  disabled={actionLoading}
                >
                  <Edit style={styles.actionIcon} />
                  Edit
                </button>
                {!role.isDefault && (
                  <button 
                    style={{...styles.roleActionButton, ...styles.roleActionDanger}}
                    onClick={() => handleDelete(role)}
                    disabled={actionLoading}
                  >
                    <Trash2 style={styles.actionIcon} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {roles.length === 0 && (
        <div style={styles.emptyState}>
          <Shield style={styles.emptyIcon} />
          <p style={styles.emptyText}>No roles found</p>
          <button style={styles.emptyButton} onClick={openCreateModal}>
            <Plus style={styles.buttonIcon} />
            Create Your First Role
          </button>
        </div>
      )}

      {/* Role Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={isEditing ? 'Edit Role' : 'Create Role'}
        size="xl"
      >
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Role Name</label>
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
          </div>

          {/* Permissions */}
          <div style={styles.permissionsSection}>
            <h4 style={styles.permissionsTitle}>Permissions</h4>
            <div style={styles.permissionsContainer}>
              {Object.entries(permissionCategories).map(([category, perms]) => (
                <div key={category} style={styles.permissionCategory}>
                  <h5 style={styles.permissionCategoryTitle}>{category}</h5>
                  <div style={styles.permissionGrid}>
                    {perms.map((perm) => (
                      <label key={perm} style={styles.permissionCheckbox}>
                        <input
                          type="checkbox"
                          checked={permissions.includes(perm)}
                          onChange={() => togglePermission(perm)}
                          style={styles.checkboxInput}
                          disabled={actionLoading}
                        />
                        <span style={styles.permissionLabel}>
                          {getPermissionLabel(perm)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
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
              {actionLoading ? 'Saving...' : (isEditing ? 'Update Role' : 'Create Role')}
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
  rolesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'box-shadow 0.3s ease',
  },
  roleHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #F3F4F6',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  roleHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  roleIcon: {
    padding: '8px',
    backgroundColor: '#DBEAFE',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconSvg: {
    width: '20px',
    height: '20px',
    color: '#2563EB',
  },
  roleName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  roleDescription: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
  },
  roleBadge: {
    display: 'inline-flex',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '500',
  },
  roleBadgePrimary: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  roleBadgeSecondary: {
    backgroundColor: '#F3F4F6',
    color: '#374151',
  },
  roleContent: {
    padding: '16px 20px',
  },
  roleDetail: {
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
  permissionsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '8px',
  },
  permissionBadge: {
    display: 'inline-flex',
    padding: '2px 6px',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
  },
  roleActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #F3F4F6',
  },
  roleActionButton: {
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
  roleActionOutline: {
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
  },
  roleActionDanger: {
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
  permissionsSection: {
    borderTop: '1px solid #E5E7EB',
    paddingTop: '16px',
  },
  permissionsTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 12px 0',
  },
  permissionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  permissionCategory: {
    backgroundColor: '#F9FAFB',
    padding: '12px',
    borderRadius: '8px',
  },
  permissionCategoryTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 8px 0',
  },
  permissionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '6px',
  },
  permissionCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkboxInput: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  permissionLabel: {
    fontSize: '13px',
    color: '#374151',
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
  
  .role-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  }
  
  .role-action-outline:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .role-action-danger:hover:not(:disabled) {
    background-color: #FEE2E2 !important;
    border-color: #EF4444 !important;
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
  
  .empty-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .checkbox-input:focus {
    outline: 2px solid #3B82F6 !important;
    outline-offset: 2px !important;
  }
  
  .add-button:disabled,
  .role-action-button:disabled,
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
    
    .roles-grid {
      grid-template-columns: 1fr !important;
    }
    
    .form-grid {
      grid-template-columns: 1fr !important;
    }
    
    .permission-grid {
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
    
    .role-actions {
      flex-direction: column !important;
    }
    
    .role-action-button {
      width: 100% !important;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 16px !important;
    }
    
    .role-header {
      flex-direction: column !important;
      gap: 12px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Roles;