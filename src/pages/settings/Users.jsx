// pages/admin/Users.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  Users as UsersIcon, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus,
  Search,
  Filter,
  ChevronDown,
  X,
  Check,
  UserCheck,
  UserX,
  Activity,
  Layers,
  ArrowLeft,
  Shield,
  Mail,
  Phone,
  Calendar,
  Clock,
  MoreVertical
} from 'lucide-react';

// Color Palette
const COLORS = {
  primary: '#013E37',
  secondary: '#FFEFB3',
  white: '#FFFFFF',
  primaryLight: '#015A50',
  primaryDark: '#002A25',
  secondaryLight: '#FFF9E6',
  textPrimary: '#013E37',
  textSecondary: '#5A7A75',
  border: '#E8F0EE',
  bgLight: '#F7FAF9',
  success: '#2D8B7A',
  warning: '#D4A843',
  danger: '#C0392B',
  info: '#3B82F6',
};

const Users = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    timezone: 'America/New_York',
    status: 'active',
    password: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users`, {
        params: filters,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setUsers(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        timezone: formData.timezone,
        status: formData.status,
      };
      if (!isEditing) userData.password = formData.password;

      if (isEditing && selectedUser) {
        await axios.put(`${API_URL}/users/${selectedUser._id}`, userData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('User updated successfully');
      } else {
        await axios.post(`${API_URL}/users`, userData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('User created successfully');
      }
      setShowModal(false);
      resetForm();
      await fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      toast.error(isEditing ? 'Failed to update user.' : 'Failed to create user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsEditing(false);
    resetForm();
    setCurrentStep(1);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      department: user.department || '',
      timezone: user.timezone || 'America/New_York',
      status: user.status || 'active',
      password: ''
    });
    setCurrentStep(1);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      timezone: 'America/New_York',
      status: 'active',
      password: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      super_admin: { bg: '#8B5CF6', text: '#FFFFFF' },
      admin: { bg: COLORS.primary, text: '#FFFFFF' },
      manager: { bg: '#2D8B7A', text: '#FFFFFF' },
      employee: { bg: '#6B7280', text: '#FFFFFF' },
      client: { bg: '#D4A843', text: '#FFFFFF' },
    };
    return colors[role] || colors.employee;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: { bg: '#D1FAE5', text: '#065F46' },
      inactive: { bg: '#FEE2E2', text: '#991B1B' },
      suspended: { bg: '#FEF3C7', text: '#92400E' },
    };
    return colors[status] || colors.active;
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
    managers: users.filter(u => u.role === 'manager').length,
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>User Management</h1>
          <p style={styles.pageSubtitle}>Manage team members and their access permissions</p>
        </div>
        <button style={styles.primaryButton} onClick={openCreateModal}>
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: `${COLORS.primary}15` }}>
            <UsersIcon size={20} style={{ color: COLORS.primary }} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.total}</p>
            <p style={styles.statLabel}>Total Users</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#2D8B7A15' }}>
            <UserCheck size={20} style={{ color: '#2D8B7A' }} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.active}</p>
            <p style={styles.statLabel}>Active</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#8B5CF615' }}>
            <Shield size={20} style={{ color: '#8B5CF6' }} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.admins}</p>
            <p style={styles.statLabel}>Admins</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#D4A84315' }}>
            <Layers size={20} style={{ color: '#D4A843' }} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.managers}</p>
            <p style={styles.statLabel}>Managers</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={styles.searchInput}
          />
          {filters.search && (
            <button style={styles.clearSearch} onClick={() => setFilters({ ...filters, search: '' })}>
              <X size={16} />
            </button>
          )}
        </div>
        <button style={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
          <Filter size={16} />
          Filters
          <ChevronDown size={14} style={{
            transform: showFilters ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease'
          }} />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={styles.filterPanel}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                style={styles.filterSelect}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={styles.filterSelect}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <button style={styles.clearFilters} onClick={() => setFilters({ role: '', status: '', search: '' })}>
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>User</th>
              <th style={styles.tableHeader}>Role</th>
              <th style={styles.tableHeader}>Department</th>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Last Login</th>
              <th style={{...styles.tableHeader, textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.emptyState}>
                  <UsersIcon size={40} style={{ color: COLORS.textSecondary, marginBottom: '12px' }} />
                  <p style={styles.emptyStateText}>No users found</p>
                  <p style={styles.emptyStateSubtext}>Create your first user to get started</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <div style={styles.userCell}>
                      <div style={{...styles.avatar, backgroundColor: COLORS.secondary, color: COLORS.primary }}>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <div style={styles.userName}>{user.firstName} {user.lastName}</div>
                        <div style={styles.userEmail}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.roleBadge,
                      backgroundColor: getRoleColor(user.role).bg,
                      color: getRoleColor(user.role).text,
                    }}>
                      {user.role ? user.role.replace('_', ' ').toUpperCase() : 'N/A'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.departmentText}>{user.department || '—'}</span>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(user.status).bg,
                      color: getStatusColor(user.status).text,
                    }}>
                      {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'N/A'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.lastLoginText}>{formatDate(user.lastLogin)}</span>
                  </td>
                  <td style={{...styles.tableCell, textAlign: 'right'}}>
                    <div style={styles.actionButtons}>
                      <button style={styles.actionButtonEdit} onClick={() => openEditModal(user)} disabled={actionLoading}>
                        <Edit size={16} />
                      </button>
                      <button style={styles.actionButtonDelete} onClick={() => handleDelete(user)} disabled={actionLoading}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Full Screen Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <button style={styles.modalBackButton} onClick={() => { setShowModal(false); resetForm(); }}>
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 style={styles.modalTitle}>{isEditing ? 'Edit User' : 'Create New User'}</h2>
                  <p style={styles.modalSubtitle}>
                    {isEditing ? 'Update user information and permissions' : 'Add a new team member to your organization'}
                  </p>
                </div>
              </div>
              <button style={styles.modalCloseButton} onClick={() => { setShowModal(false); resetForm(); }}>
                <X size={24} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit} style={styles.modalForm}>
                <div style={styles.stepIndicator}>
                  <div style={{...styles.stepItem, ...(currentStep === 1 ? styles.stepActive : {})}}>
                    <span style={styles.stepNumber}>1</span>
                    <span style={styles.stepLabel}>Personal Info</span>
                  </div>
                  <div style={styles.stepLine} />
                  <div style={{...styles.stepItem, ...(currentStep === 2 ? styles.stepActive : {})}}>
                    <span style={styles.stepNumber}>2</span>
                    <span style={styles.stepLabel}>Account Details</span>
                  </div>
                  <div style={styles.stepLine} />
                  <div style={{...styles.stepItem, ...(currentStep === 3 ? styles.stepActive : {})}}>
                    <span style={styles.stepNumber}>3</span>
                    <span style={styles.stepLabel}>Review</span>
                  </div>
                </div>

                {currentStep === 1 && (
                  <div style={styles.stepContent}>
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          style={styles.formInput}
                          required
                          disabled={actionLoading}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          style={styles.formInput}
                          required
                          disabled={actionLoading}
                          placeholder="Enter last name"
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
                          required
                          disabled={actionLoading}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          style={styles.formInput}
                          disabled={actionLoading}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    <div style={styles.stepActions}>
                      <button
                        type="button"
                        style={styles.stepNextButton}
                        onClick={() => setCurrentStep(2)}
                        disabled={!formData.firstName || !formData.lastName || !formData.email}
                      >
                        Next Step →
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div style={styles.stepContent}>
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Role *</label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          style={styles.formSelect}
                          required
                          disabled={actionLoading}
                        >
                          <option value="">Select Role</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="employee">Employee</option>
                          <option value="client">Client</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Department</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          style={styles.formSelect}
                          disabled={actionLoading}
                        >
                          <option value="">Select Department</option>
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Development">Development</option>
                          <option value="Design">Design</option>
                          <option value="Management">Management</option>
                          <option value="Client Services">Client Services</option>
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
                        <label style={styles.formLabel}>Timezone</label>
                        <input
                          type="text"
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleInputChange}
                          style={styles.formInput}
                          disabled={actionLoading}
                          placeholder="e.g., America/New_York"
                        />
                      </div>
                    </div>

                    {!isEditing && (
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Password *</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          style={styles.formInput}
                          placeholder="Enter password (min 8 characters)"
                          required={!isEditing}
                          disabled={actionLoading}
                          minLength="8"
                        />
                      </div>
                    )}

                    <div style={styles.stepActions}>
                      <button type="button" style={styles.stepBackButton} onClick={() => setCurrentStep(1)}>
                        ← Back
                      </button>
                      <button
                        type="button"
                        style={styles.stepNextButton}
                        onClick={() => setCurrentStep(3)}
                        disabled={!formData.role}
                      >
                        Review →
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div style={styles.stepContent}>
                    <div style={styles.reviewSection}>
                      <h3 style={styles.reviewTitle}>Review User Details</h3>
                      <div style={styles.reviewGrid}>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>Full Name</span>
                          <span style={styles.reviewValue}>{formData.firstName} {formData.lastName}</span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>Email</span>
                          <span style={styles.reviewValue}>{formData.email}</span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>Phone</span>
                          <span style={styles.reviewValue}>{formData.phone || 'Not provided'}</span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>Role</span>
                          <span style={styles.reviewValue}>
                            {formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : 'Not selected'}
                          </span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>Department</span>
                          <span style={styles.reviewValue}>{formData.department || 'Not selected'}</span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>Status</span>
                          <span style={styles.reviewValue}>
                            {formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : 'Not selected'}
                          </span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>Timezone</span>
                          <span style={styles.reviewValue}>{formData.timezone || 'Not set'}</span>
                        </div>
                        {!isEditing && (
                          <div style={styles.reviewItem}>
                            <span style={styles.reviewLabel}>Password</span>
                            <span style={styles.reviewValue}>••••••••</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={styles.stepActions}>
                      <button type="button" style={styles.stepBackButton} onClick={() => setCurrentStep(2)}>
                        ← Back
                      </button>
                      <button type="submit" style={styles.modalSubmitButton} disabled={actionLoading}>
                        {actionLoading ? (
                          <>
                            <span style={styles.spinnerSmall} />
                            Saving...
                          </>
                        ) : (
                          isEditing ? 'Update User' : 'Create User'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    backgroundColor: COLORS.bgLight,
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
    color: COLORS.textSecondary,
    fontSize: '14px',
    fontWeight: '500',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: `3px solid ${COLORS.border}`,
    borderTopColor: COLORS.primary,
    animation: 'spin 0.8s linear infinite',
  },
  spinnerSmall: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid #FFFFFF',
    borderTopColor: 'transparent',
    animation: 'spin 0.6s linear infinite',
    marginRight: '8px',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: COLORS.textPrimary,
    margin: 0,
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: COLORS.textSecondary,
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: `0 2px 4px ${COLORS.primary}40`,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: COLORS.white,
    borderRadius: '12px',
    padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    border: `1px solid ${COLORS.border}`,
    transition: 'all 0.2s ease',
    cursor: 'default',
  },
  statIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statNumber: {
    fontSize: '22px',
    fontWeight: '700',
    color: COLORS.textPrimary,
    margin: 0,
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: '13px',
    color: COLORS.textSecondary,
    margin: 0,
    fontWeight: '500',
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  searchBar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    padding: '0 14px',
    transition: 'all 0.2s ease',
    minWidth: '200px',
  },
  searchIcon: {
    color: COLORS.textSecondary,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    padding: '10px 12px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: 'transparent',
    color: COLORS.textPrimary,
    minWidth: '120px',
  },
  clearSearch: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    background: 'none',
    border: 'none',
    color: COLORS.textSecondary,
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: COLORS.textSecondary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  filterPanel: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    padding: '16px 20px',
    marginBottom: '16px',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '16px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: '150px',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  filterSelect: {
    padding: '8px 12px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
    outline: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  clearFilters: {
    padding: '8px 16px',
    backgroundColor: COLORS.secondary,
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: COLORS.primary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    alignSelf: 'center',
  },
  tableWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: '12px',
    border: `1px solid ${COLORS.border}`,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: COLORS.textSecondary,
    backgroundColor: COLORS.bgLight,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  tableRow: {
    borderBottom: `1px solid ${COLORS.border}`,
    transition: 'background-color 0.15s ease',
  },
  tableCell: {
    padding: '12px 16px',
    fontSize: '14px',
    color: COLORS.textPrimary,
  },
  emptyState: {
    padding: '48px 24px',
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  emptyStateText: {
    fontSize: '16px',
    fontWeight: '600',
    color: COLORS.textPrimary,
    margin: '0 0 4px 0',
  },
  emptyStateSubtext: {
    fontSize: '14px',
    color: COLORS.textSecondary,
    margin: 0,
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '13px',
    flexShrink: 0,
  },
  userName: {
    fontWeight: '500',
    color: COLORS.textPrimary,
    fontSize: '14px',
  },
  userEmail: {
    fontSize: '12px',
    color: COLORS.textSecondary,
  },
  roleBadge: {
    display: 'inline-flex',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  departmentText: {
    fontSize: '13px',
    color: COLORS.textSecondary,
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  lastLoginText: {
    fontSize: '13px',
    color: COLORS.textSecondary,
  },
  actionButtons: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'flex-end',
  },
  actionButtonEdit: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: `${COLORS.secondary}`,
    color: COLORS.primary,
    transition: 'all 0.2s ease',
  },
  actionButtonDelete: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#FEF2F2',
    color: '#EF4444',
    transition: 'all 0.2s ease',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    animation: 'fadeIn 0.3s ease',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: '20px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    animation: 'slideUp 0.3s ease',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 32px',
    borderBottom: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.bgLight,
    flexShrink: 0,
  },
  modalHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  modalBackButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    color: COLORS.textSecondary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: COLORS.textPrimary,
    margin: 0,
  },
  modalSubtitle: {
    fontSize: '14px',
    color: COLORS.textSecondary,
    marginTop: '2px',
    margin: '2px 0 0 0',
  },
  modalCloseButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    color: COLORS.textSecondary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modalBody: {
    padding: '32px',
    overflowY: 'auto',
    flex: 1,
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0',
    marginBottom: '24px',
    padding: '0 20px',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: COLORS.bgLight,
    color: COLORS.textSecondary,
    transition: 'all 0.3s ease',
  },
  stepActive: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  stepNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepLabel: {
    fontSize: '13px',
    fontWeight: '600',
  },
  stepLine: {
    width: '40px',
    height: '2px',
    backgroundColor: COLORS.border,
    margin: '0 4px',
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  stepActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    paddingTop: '16px',
    borderTop: `1px solid ${COLORS.border}`,
    flexWrap: 'wrap',
  },
  stepNextButton: {
    padding: '10px 24px',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stepBackButton: {
    padding: '10px 24px',
    backgroundColor: 'transparent',
    color: COLORS.textSecondary,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  reviewSection: {
    backgroundColor: COLORS.bgLight,
    borderRadius: '12px',
    padding: '24px',
    border: `1px solid ${COLORS.border}`,
  },
  reviewTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: COLORS.textPrimary,
    margin: '0 0 16px 0',
  },
  reviewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  reviewItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '8px 12px',
    backgroundColor: COLORS.white,
    borderRadius: '8px',
  },
  reviewLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  reviewValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  formLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  formInput: {
    padding: '9px 14px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
  },
  formSelect: {
    padding: '9px 14px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
  },
  modalSubmitButton: {
    padding: '10px 24px',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

// Add keyframe and hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px) scale(0.98);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .primary-button:hover:not(:disabled) {
    background-color: ${COLORS.primaryDark} !important;
    box-shadow: 0 4px 8px ${COLORS.primary}50 !important;
    transform: translateY(-1px);
  }
  
  .filter-toggle:hover:not(:disabled) {
    background-color: ${COLORS.secondary} !important;
    border-color: ${COLORS.primary} !important;
  }
  
  .clear-filters:hover:not(:disabled) {
    background-color: ${COLORS.primary} !important;
    color: ${COLORS.white} !important;
  }
  
  .search-bar:focus-within {
    border-color: ${COLORS.primary} !important;
    box-shadow: 0 0 0 3px ${COLORS.primary}20 !important;
  }
  
  .form-input:focus,
  .form-select:focus {
    border-color: ${COLORS.primary} !important;
    box-shadow: 0 0 0 3px ${COLORS.primary}20 !important;
  }
  
  .action-button-edit:hover:not(:disabled) {
    background-color: ${COLORS.primary} !important;
    color: ${COLORS.white} !important;
  }
  
  .action-button-delete:hover:not(:disabled) {
    background-color: #EF4444 !important;
    color: ${COLORS.white} !important;
  }
  
  .modal-back-button:hover:not(:disabled) {
    background-color: ${COLORS.secondary} !important;
  }
  
  .modal-close-button:hover:not(:disabled) {
    background-color: ${COLORS.secondary} !important;
  }
  
  .step-next-button:hover:not(:disabled) {
    background-color: ${COLORS.primaryDark} !important;
  }
  
  .step-back-button:hover:not(:disabled) {
    background-color: ${COLORS.secondary} !important;
    border-color: ${COLORS.primary} !important;
  }
  
  .modal-submit-button:hover:not(:disabled) {
    background-color: ${COLORS.primaryDark} !important;
  }
  
  .clear-search:hover {
    background-color: ${COLORS.secondary} !important;
    border-radius: 4px;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
    border-color: ${COLORS.primary} !important;
  }
  
  .table-row:hover {
    background-color: ${COLORS.secondary} !important;
  }
  
  /* Responsive Styles */
  @media (max-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  
  @media (max-width: 768px) {
    .container {
      padding: 16px !important;
    }
    
    .page-header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .primary-button {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .stats-grid {
      grid-template-columns: 1fr 1fr !important;
    }
    
    .search-section {
      flex-direction: column !important;
    }
    
    .search-bar {
      width: 100% !important;
    }
    
    .filter-toggle {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .filter-row {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .filter-group {
      min-width: unset !important;
    }
    
    .clear-filters {
      align-self: stretch !important;
    }
    
    .form-grid {
      grid-template-columns: 1fr !important;
    }
    
    .modal-overlay {
      padding: 0 !important;
    }
    
    .modal-container {
      max-height: 100vh !important;
      border-radius: 0 !important;
      max-width: 100% !important;
    }
    
    .modal-header {
      padding: 16px 20px !important;
      flex-wrap: wrap !important;
    }
    
    .modal-header-left {
      flex: 1 !important;
    }
    
    .modal-body {
      padding: 20px !important;
    }
    
    .modal-title {
      font-size: 18px !important;
    }
    
    .modal-subtitle {
      font-size: 13px !important;
    }
    
    .step-indicator {
      flex-wrap: wrap !important;
      gap: 8px !important;
      padding: 0 !important;
    }
    
    .step-item {
      padding: 6px 12px !important;
      font-size: 12px !important;
    }
    
    .step-line {
      width: 20px !important;
    }
    
    .step-actions {
      flex-direction: column !important;
    }
    
    .step-next-button,
    .step-back-button,
    .modal-submit-button {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .review-grid {
      grid-template-columns: 1fr !important;
    }
    
    .review-section {
      padding: 16px !important;
    }
    
    .action-buttons {
      justify-content: center !important;
    }
  }
  
  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    
    .container {
      padding: 12px !important;
    }
    
    .modal-body {
      padding: 16px !important;
    }
    
    .modal-header {
      padding: 12px 16px !important;
    }
    
    .modal-title {
      font-size: 16px !important;
    }
    
    .step-item {
      font-size: 11px !important;
      padding: 4px 10px !important;
    }
    
    .step-number {
      width: 20px !important;
      height: 20px !important;
      font-size: 10px !important;
    }
    
    .step-label {
      font-size: 11px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Users;