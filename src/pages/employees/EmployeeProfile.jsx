// pages/employees/EmployeeProfile.jsx - COMPLETE FIXED VERSION

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  Award,
  Edit,
  Save,
  X,
  BarChart,
  CheckCircle,
  TrendingUp,
  Loader,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EmployeeProfile = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const API_URL =  'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    console.log('🔍 EmployeeProfile mounted with id:', id);
    if (id) {
      fetchUserData();
    } else {
      setError('No user ID provided');
      setLoading(false);
    }
  }, [id]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching user data for ID:', id);
      
      const userResponse = await axios.get(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('📊 User response:', userResponse.data);

      if (userResponse.data) {
        const userData = userResponse.data.data || userResponse.data;
        setProfileUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          department: userData.department || '',
          position: userData.position || '',
          timezone: userData.timezone || 'America/New_York',
        });
      }

      // Fetch KPIs
      try {
        const kpisResponse = await axios.get(`${API_URL}/employees/kpis`, {
          params: { employeeId: id },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (kpisResponse.data) {
          setKpis(kpisResponse.data.data || []);
        }
      } catch (kpiErr) {
        console.log('No KPI data found, using empty array');
        setKpis([]);
      }

    } catch (err) {
      console.error('❌ Error fetching employee data:', err);
      
      let errorMessage = 'Failed to load employee data.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view this profile.';
        } else if (err.response.status === 404) {
          errorMessage = 'Employee not found.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.put(`${API_URL}/users/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        const updatedUser = response.data.data || response.data;
        setProfileUser(updatedUser);
        toast.success('Profile updated successfully');
        setIsEditing(false);
        await fetchUserData();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      let errorMessage = 'Failed to update profile.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to update this profile.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (hours) => {
    if (!hours) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const canEdit = user?.role === 'super_admin' || user?.role === 'admin' || user?._id === id;

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading profile...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={48} style={styles.errorIcon} />
        <h2 style={styles.errorTitle}>Something went wrong</h2>
        <p style={styles.errorMessage}>{error}</p>
        <div style={styles.errorActions}>
          <Link to="/team" style={styles.errorButton}>
            Back to Team
          </Link>
          <button onClick={fetchUserData} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!profileUser) {
    return (
      <div style={styles.notFoundContainer}>
        <User size={64} style={styles.notFoundIcon} />
        <h2 style={styles.notFoundTitle}>Employee Not Found</h2>
        <p style={styles.notFoundText}>The employee you're looking for doesn't exist or you don't have permission to view them.</p>
        <Link to="/team" style={styles.notFoundLink}>
          Back to Team
        </Link>
      </div>
    );
  }

  const avgProductivity = kpis.length > 0
    ? kpis.reduce((sum, k) => sum + (k.productivityScore || 0), 0) / kpis.length
    : 0;

  const totalTasksCompleted = kpis.reduce((sum, k) => sum + (k.tasksCompleted || 0), 0);
  const totalHours = kpis.reduce((sum, k) => sum + (k.billableHours || 0), 0);

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/team" style={styles.backButton}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={styles.title}>
              {profileUser.firstName} {profileUser.lastName}
            </h1>
            <p style={styles.subtitle}>
              {profileUser.position || 'Employee'} • {profileUser.department || 'No Department'}
            </p>
          </div>
        </div>
        <div style={styles.headerActions}>
          {canEdit && !isEditing && (
            <button style={styles.editButton} onClick={() => setIsEditing(true)}>
              <Edit size={16} />
              Edit Profile
            </button>
          )}
          {canEdit && isEditing && (
            <>
              <button style={styles.cancelButton} onClick={() => setIsEditing(false)}>
                <X size={16} />
                Cancel
              </button>
              <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Grid */}
      <div style={styles.profileGrid}>
        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.profileContent}>
            <div style={styles.avatarContainer}>
              <div style={styles.avatar}>
                {profileUser.firstName?.[0]}{profileUser.lastName?.[0]}
              </div>
              <h2 style={styles.profileName}>
                {profileUser.firstName} {profileUser.lastName}
              </h2>
              <p style={styles.profilePosition}>{profileUser.position || 'Employee'}</p>
              <p style={styles.profileDepartment}>{profileUser.department || 'No Department'}</p>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: profileUser.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                color: profileUser.status === 'active' ? '#065F46' : '#991B1B',
              }}>
                {profileUser.status || 'Active'}
              </span>
            </div>

            <div style={styles.contactInfo}>
              <div style={styles.contactItem}>
                <Mail size={16} style={styles.contactIcon} />
                <span style={styles.contactText}>{profileUser.email}</span>
              </div>
              {profileUser.phone && (
                <div style={styles.contactItem}>
                  <Phone size={16} style={styles.contactIcon} />
                  <span style={styles.contactText}>{profileUser.phone}</span>
                </div>
              )}
              <div style={styles.contactItem}>
                <Clock size={16} style={styles.contactIcon} />
                <span style={styles.contactText}>{profileUser.timezone || 'America/New_York'}</span>
              </div>
              <div style={styles.contactItem}>
                <Calendar size={16} style={styles.contactIcon} />
                <span style={styles.contactText}>
                  Joined {formatDate(profileUser.createdAt)}
                </span>
              </div>
              {profileUser.role && (
                <div style={styles.contactItem}>
                  <Briefcase size={16} style={styles.contactIcon} />
                  <span style={styles.contactText}>Role: {profileUser.role.replace('_', ' ').toUpperCase()}</span>
                </div>
              )}
            </div>

            {isEditing && (
              <div style={styles.editForm}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Timezone</label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    style={styles.formSelect}
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        <div style={styles.performanceSection}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statContent}>
                <div>
                  <p style={styles.statLabel}>Avg Productivity</p>
                  <p style={styles.statValue}>{Math.round(avgProductivity)}%</p>
                </div>
                <Award size={32} style={{...styles.statIcon, color: '#3B82F6'}} />
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statContent}>
                <div>
                  <p style={styles.statLabel}>Tasks Completed</p>
                  <p style={{...styles.statValue, color: '#16A34A'}}>
                    {totalTasksCompleted}
                  </p>
                </div>
                <CheckCircle size={32} style={{...styles.statIcon, color: '#22C55E'}} />
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statContent}>
                <div>
                  <p style={styles.statLabel}>Total Hours</p>
                  <p style={{...styles.statValue, color: '#D97706'}}>
                    {formatDuration(totalHours)}
                  </p>
                </div>
                <Clock size={32} style={{...styles.statIcon, color: '#F59E0B'}} />
              </div>
            </div>
          </div>

          {/* Recent KPI History */}
          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <h3 style={styles.kpiTitle}>Performance History</h3>
              {kpis.length === 0 && (
                <span style={styles.kpiBadge}>No data yet</span>
              )}
            </div>
            <div style={styles.kpiContent}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.tableHeaderCell}>Week</th>
                      <th style={styles.tableHeaderCell}>Productivity</th>
                      <th style={styles.tableHeaderCell}>Completion</th>
                      <th style={styles.tableHeaderCell}>Utilization</th>
                      <th style={styles.tableHeaderCell}>QA Pass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.length > 0 ? (
                      kpis.map((kpi) => (
                        <tr key={kpi._id || `kpi-${Math.random()}`} style={styles.tableRow}>
                          <td style={styles.tableCell}>{formatDate(kpi.weekStart)}</td>
                          <td style={{...styles.tableCell, ...styles.cellProductivity}}>
                            {kpi.productivityScore || 0}%
                          </td>
                          <td style={{...styles.tableCell, ...styles.cellCompletion}}>
                            {kpi.taskCompletionRate || 0}%
                          </td>
                          <td style={{...styles.tableCell, ...styles.cellUtilization}}>
                            {kpi.capacityUtilization || 0}%
                          </td>
                          <td style={{...styles.tableCell, ...styles.cellQaPass}}>
                            {kpi.qaPassRate || 0}%
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={styles.emptyTableState}>
                          <div style={styles.emptyContent}>
                            <BarChart size={32} style={styles.emptyIcon} />
                            <p>No performance data available</p>
                            <p style={styles.emptySubtext}>KPI data will appear here once available</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    backgroundColor: '#F8FAFC',
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
    color: '#64748B',
    fontSize: '14px',
    fontWeight: '500',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64vh',
    gap: '16px',
    textAlign: 'center',
    padding: '20px',
  },
  errorIcon: {
    color: '#EF4444',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#0F172A',
    margin: '8px 0',
  },
  errorMessage: {
    fontSize: '16px',
    color: '#64748B',
    maxWidth: '400px',
  },
  errorActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  errorButton: {
    padding: '10px 24px',
    backgroundColor: '#E2E8F0',
    color: '#0F172A',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  retryButton: {
    padding: '10px 24px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  notFoundContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64vh',
    gap: '16px',
    textAlign: 'center',
    padding: '20px',
  },
  notFoundIcon: {
    color: '#94A3B8',
  },
  notFoundTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#0F172A',
    margin: '8px 0',
  },
  notFoundText: {
    fontSize: '16px',
    color: '#64748B',
    maxWidth: '400px',
  },
  notFoundLink: {
    padding: '10px 24px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backButton: {
    padding: '8px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
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
  headerActions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '24px',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  profileContent: {
    padding: '24px',
  },
  avatarContainer: {
    textAlign: 'center',
  },
  avatar: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 auto',
  },
  profileName: {
    marginTop: '16px',
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
  },
  profilePosition: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  profileDepartment: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    marginTop: '8px',
  },
  contactInfo: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  contactIcon: {
    color: '#9CA3AF',
    flexShrink: 0,
  },
  contactText: {
    fontSize: '14px',
    color: '#374151',
  },
  editForm: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
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
  performanceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  statIcon: {
    opacity: 0.8,
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  kpiHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #E5E7EB',
  },
  kpiTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  kpiBadge: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    padding: '2px 10px',
    borderRadius: '12px',
  },
  kpiContent: {
    padding: '16px 24px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    borderBottom: '1px solid #E5E7EB',
  },
  tableHeaderCell: {
    textAlign: 'left',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: '1px solid #F3F4F6',
    transition: 'background-color 0.2s ease',
  },
  tableCell: {
    padding: '8px 12px',
    fontSize: '14px',
    color: '#374151',
  },
  cellProductivity: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  cellCompletion: {
    color: '#22C55E',
    fontWeight: '500',
  },
  cellUtilization: {
    color: '#F59E0B',
    fontWeight: '500',
  },
  cellQaPass: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  emptyTableState: {
    textAlign: 'center',
    padding: '32px 16px',
  },
  emptyContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  emptyIcon: {
    color: '#94A3B8',
  },
  emptySubtext: {
    fontSize: '12px',
    color: '#94A3B8',
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .back-button:hover {
    background-color: #F3F4F6 !important;
  }
  
  .edit-button:hover {
    background-color: #F9FAFB !important;
  }
  
  .cancel-button:hover {
    background-color: #F9FAFB !important;
  }
  
  .save-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .form-input:focus,
  .form-select:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  .table-row:hover {
    background-color: #F8FAFC !important;
  }
  
  .retry-button:hover {
    background-color: #2563EB !important;
  }
  
  .error-button:hover {
    background-color: #E2E8F0 !important;
  }
  
  .not-found-link:hover {
    background-color: #2563EB !important;
  }
  
  @media (max-width: 1024px) {
    .profile-grid {
      grid-template-columns: 1fr !important;
    }
    
    .stats-grid {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
  
  @media (max-width: 768px) {
    .container {
      padding: 16px !important;
    }
    
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .header-actions {
      width: 100% !important;
    }
    
    .edit-button,
    .cancel-button,
    .save-button {
      flex: 1 !important;
      justify-content: center !important;
    }
    
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    
    .error-actions {
      flex-direction: column !important;
      width: 100% !important;
    }
    
    .error-button,
    .retry-button {
      width: 100% !important;
      text-align: center !important;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 12px !important;
    }
    
    .header-actions {
      flex-direction: column !important;
    }
    
    .edit-button,
    .cancel-button,
    .save-button {
      width: 100% !important;
    }
    
    .profile-content {
      padding: 16px !important;
    }
    
    .avatar {
      width: 72px !important;
      height: 72px !important;
      font-size: 24px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default EmployeeProfile;