// pages/employees/EmployeeProfile.jsx
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
  AlertCircle,
  Layers,
  Target,
  Zap
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

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

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
      <div className="profile-loading">
        <div className="profile-loading-spinner"></div>
        <p className="profile-loading-text">Loading profile...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="profile-error">
        <AlertCircle className="profile-error-icon" size={48} />
        <h2 className="profile-error-title">Something went wrong</h2>
        <p className="profile-error-message">{error}</p>
        <div className="profile-error-actions">
          <Link to="/team" className="profile-error-btn">Back to Team</Link>
          <button onClick={fetchUserData} className="profile-retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!profileUser) {
    return (
      <div className="profile-notfound">
        <User className="profile-notfound-icon" size={64} />
        <h2 className="profile-notfound-title">Employee Not Found</h2>
        <p className="profile-notfound-text">The employee you're looking for doesn't exist or you don't have permission to view them.</p>
        <Link to="/team" className="profile-notfound-link">Back to Team</Link>
      </div>
    );
  }

  const avgProductivity = kpis.length > 0
    ? kpis.reduce((sum, k) => sum + (k.productivityScore || 0), 0) / kpis.length
    : 0;

  const totalTasksCompleted = kpis.reduce((sum, k) => sum + (k.tasksCompleted || 0), 0);
  const totalHours = kpis.reduce((sum, k) => sum + (k.billableHours || 0), 0);

  return (
    <>
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-header-left">
            <Link to="/team" className="profile-back-btn">
              <ArrowLeft className="profile-back-icon" />
            </Link>
            <div>
              <h1 className="profile-title">
                <Layers className="profile-title-icon" />
                {profileUser.firstName} {profileUser.lastName}
              </h1>
              <p className="profile-subtitle">
                {profileUser.position || 'Employee'} • {profileUser.department || 'No Department'}
              </p>
            </div>
          </div>
          <div className="profile-header-actions">
            {canEdit && !isEditing && (
              <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                <Edit className="profile-btn-icon" />
                Edit Profile
              </button>
            )}
            {canEdit && isEditing && (
              <>
                <button className="profile-cancel-btn" onClick={() => setIsEditing(false)}>
                  <X className="profile-btn-icon" />
                  Cancel
                </button>
                <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                  <Save className="profile-btn-icon" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Grid */}
        <div className="profile-grid">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-card-content">
              <div className="profile-avatar-container">
                <div className="profile-avatar" style={{ backgroundColor: '#013E37' }}>
                  {profileUser.firstName?.[0]}{profileUser.lastName?.[0]}
                </div>
                <h2 className="profile-card-name">
                  {profileUser.firstName} {profileUser.lastName}
                </h2>
                <p className="profile-card-position">{profileUser.position || 'Employee'}</p>
                <p className="profile-card-department">{profileUser.department || 'No Department'}</p>
                <span className="profile-status-badge" style={{
                  backgroundColor: profileUser.status === 'active' ? '#013E37' : '#FFEFB3',
                  color: profileUser.status === 'active' ? '#FFEFB3' : '#013E37',
                }}>
                  {profileUser.status || 'Active'}
                </span>
              </div>

              <div className="profile-contact-info">
                <div className="profile-contact-item">
                  <Mail className="profile-contact-icon" />
                  <span className="profile-contact-text">{profileUser.email}</span>
                </div>
                {profileUser.phone && (
                  <div className="profile-contact-item">
                    <Phone className="profile-contact-icon" />
                    <span className="profile-contact-text">{profileUser.phone}</span>
                  </div>
                )}
                <div className="profile-contact-item">
                  <Clock className="profile-contact-icon" />
                  <span className="profile-contact-text">{profileUser.timezone || 'America/New_York'}</span>
                </div>
                <div className="profile-contact-item">
                  <Calendar className="profile-contact-icon" />
                  <span className="profile-contact-text">Joined {formatDate(profileUser.createdAt)}</span>
                </div>
                {profileUser.role && (
                  <div className="profile-contact-item">
                    <Briefcase className="profile-contact-icon" />
                    <span className="profile-contact-text">Role: {profileUser.role.replace('_', ' ').toUpperCase()}</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="profile-edit-form">
                  <div className="profile-form-group">
                    <label className="profile-form-label">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="profile-form-input"
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-form-label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="profile-form-input"
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="profile-form-input"
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-form-label">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="profile-form-input"
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-form-label">Position</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="profile-form-input"
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-form-label">Timezone</label>
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className="profile-form-select"
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

          {/* Performance Section */}
          <div className="profile-performance">
            <div className="profile-stats-grid">
              <div className="profile-stat-card" style={{ borderTop: '4px solid #013E37' }}>
                <div className="profile-stat-content">
                  <div>
                    <p className="profile-stat-label">Avg Productivity</p>
                    <p className="profile-stat-value">{Math.round(avgProductivity)}%</p>
                  </div>
                  <Award className="profile-stat-icon" style={{ color: '#013E37' }} />
                </div>
                <div className="profile-stat-progress">
                  <div className="profile-stat-progress-fill" style={{ width: `${Math.round(avgProductivity)}%`, backgroundColor: '#013E37' }} />
                </div>
              </div>
              <div className="profile-stat-card" style={{ borderTop: '4px solid #0A5C54' }}>
                <div className="profile-stat-content">
                  <div>
                    <p className="profile-stat-label">Tasks Completed</p>
                    <p className="profile-stat-value" style={{ color: '#0A5C54' }}>
                      {totalTasksCompleted}
                    </p>
                  </div>
                  <CheckCircle className="profile-stat-icon" style={{ color: '#0A5C54' }} />
                </div>
              </div>
              <div className="profile-stat-card" style={{ borderTop: '4px solid #FFEFB3' }}>
                <div className="profile-stat-content">
                  <div>
                    <p className="profile-stat-label">Total Hours</p>
                    <p className="profile-stat-value" style={{ color: '#013E37' }}>
                      {formatDuration(totalHours)}
                    </p>
                  </div>
                  <Clock className="profile-stat-icon" style={{ color: '#013E37' }} />
                </div>
              </div>
            </div>

            {/* KPI History */}
            <div className="profile-kpi-card">
              <div className="profile-kpi-header">
                <h3 className="profile-kpi-title">
                  <Target className="profile-kpi-icon" />
                  Performance History
                </h3>
                {kpis.length === 0 && (
                  <span className="profile-kpi-badge">No data yet</span>
                )}
              </div>
              <div className="profile-kpi-content">
                <div className="profile-table-wrapper">
                  <table className="profile-table">
                    <thead>
                      <tr className="profile-table-header">
                        <th className="profile-table-header-cell">Week</th>
                        <th className="profile-table-header-cell">Productivity</th>
                        <th className="profile-table-header-cell">Completion</th>
                        <th className="profile-table-header-cell">Utilization</th>
                        <th className="profile-table-header-cell">QA Pass</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpis.length > 0 ? (
                        kpis.map((kpi, index) => (
                          <tr key={kpi._id || `kpi-${index}`} className="profile-table-row" style={{ animationDelay: `${index * 0.05}s` }}>
                            <td className="profile-table-cell">{formatDate(kpi.weekStart)}</td>
                            <td className="profile-table-cell profile-cell-productivity">
                              {kpi.productivityScore || 0}%
                            </td>
                            <td className="profile-table-cell profile-cell-completion">
                              {kpi.taskCompletionRate || 0}%
                            </td>
                            <td className="profile-table-cell profile-cell-utilization">
                              {kpi.capacityUtilization || 0}%
                            </td>
                            <td className="profile-table-cell profile-cell-qa">
                              {kpi.qaPassRate || 0}%
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="profile-empty-state">
                            <div className="profile-empty-content">
                              <BarChart className="profile-empty-icon" size={32} />
                              <p className="profile-empty-text">No performance data available</p>
                              <p className="profile-empty-subtext">KPI data will appear here once available</p>
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

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .profile-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .profile-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .profile-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .profile-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           ERROR
           ============================================ */
        .profile-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
          padding: 20px;
          text-align: center;
        }
        .profile-error-icon {
          color: #EF4444;
        }
        .profile-error-title {
          font-size: 24px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .profile-error-message {
          font-size: 16px;
          color: #013E37;
          opacity: 0.6;
          max-width: 400px;
          margin: 0;
        }
        .profile-error-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .profile-error-btn {
          padding: 10px 24px;
          background: #FFEFB3;
          color: #013E37;
          border: 1px solid #013E37;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .profile-error-btn:hover {
          background: #013E37;
          color: #FFEFB3;
        }
        .profile-retry-btn {
          padding: 10px 24px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .profile-retry-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        /* ============================================
           NOT FOUND
           ============================================ */
        .profile-notfound {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
          text-align: center;
          padding: 20px;
        }
        .profile-notfound-icon {
          color: #FFEFB3;
        }
        .profile-notfound-title {
          font-size: 24px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .profile-notfound-text {
          font-size: 16px;
          color: #013E37;
          opacity: 0.6;
          max-width: 400px;
          margin: 0;
        }
        .profile-notfound-link {
          padding: 10px 24px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .profile-notfound-link:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        /* ============================================
           HEADER
           ============================================ */
        .profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeInDown 0.6s ease;
        }
        .profile-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .profile-back-btn {
          padding: 8px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid #FFEFB3;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          color: #013E37;
        }
        .profile-back-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: translateX(-2px);
        }
        .profile-back-icon {
          width: 20px;
          height: 20px;
        }
        .profile-title {
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }
        .profile-title-icon {
          width: 24px;
          height: 24px;
          color: #013E37;
          animation: pulse 2s ease-in-out infinite;
        }
        .profile-subtitle {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin-top: 4px;
          margin: 4px 0 0 0;
        }
        .profile-header-actions {
          display: flex;
          gap: 8px;
        }
        .profile-edit-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: transparent;
          color: #013E37;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .profile-edit-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .profile-cancel-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: transparent;
          color: #013E37;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .profile-cancel-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .profile-save-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .profile-save-btn:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .profile-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .profile-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           PROFILE GRID
           ============================================ */
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 24px;
        }

        /* ============================================
           PROFILE CARD
           ============================================ */
        .profile-card {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        .profile-card:hover {
          border-color: #013E37;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }
        .profile-card-content {
          padding: 24px;
        }
        .profile-avatar-container {
          text-align: center;
        }
        .profile-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          color: #FFEFB3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          margin: 0 auto;
          transition: all 0.3s ease;
        }
        .profile-card:hover .profile-avatar {
          transform: scale(1.05);
        }
        .profile-card-name {
          margin-top: 16px;
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin-bottom: 4px;
        }
        .profile-card-position {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }
        .profile-card-department {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }
        .profile-status-badge {
          display: inline-block;
          padding: 4px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          margin-top: 8px;
          transition: all 0.3s ease;
        }
        .profile-status-badge:hover {
          transform: scale(1.05);
        }

        .profile-contact-info {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #FFEFB3;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .profile-contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .profile-contact-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.5;
          flex-shrink: 0;
        }
        .profile-contact-text {
          font-size: 14px;
          color: #013E37;
        }

        /* ============================================
           EDIT FORM
           ============================================ */
        .profile-edit-form {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #FFEFB3;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .profile-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .profile-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }
        .profile-form-input,
        .profile-form-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #013E37;
        }
        .profile-form-input:focus,
        .profile-form-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .profile-form-select {
          cursor: pointer;
        }

        /* ============================================
           PERFORMANCE SECTION
           ============================================ */
        .profile-performance {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .profile-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .profile-stat-card {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        .profile-stat-card:nth-child(1) { animation-delay: 0.1s; }
        .profile-stat-card:nth-child(2) { animation-delay: 0.15s; }
        .profile-stat-card:nth-child(3) { animation-delay: 0.2s; }
        .profile-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }
        .profile-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .profile-stat-label {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }
        .profile-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          margin-top: 4px;
          margin: 4px 0 0 0;
        }
        .profile-stat-icon {
          width: 32px;
          height: 32px;
          opacity: 0.8;
        }
        .profile-stat-progress {
          width: 100%;
          height: 4px;
          background: #FFEFB3;
          border-radius: 2px;
          margin-top: 12px;
          overflow: hidden;
        }
        .profile-stat-progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 1s ease;
        }

        /* ============================================
           KPI CARD
           ============================================ */
        .profile-kpi-card {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
          animation-delay: 0.25s;
        }
        .profile-kpi-card:hover {
          border-color: #013E37;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }
        .profile-kpi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFF9E6;
        }
        .profile-kpi-title {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }
        .profile-kpi-icon {
          width: 20px;
          height: 20px;
          color: #013E37;
        }
        .profile-kpi-badge {
          font-size: 12px;
          font-weight: 500;
          color: #013E37;
          background: #FFEFB3;
          padding: 2px 10px;
          border-radius: 12px;
        }
        .profile-kpi-content {
          padding: 16px 24px;
        }

        /* ============================================
           TABLE
           ============================================ */
        .profile-table-wrapper {
          overflow-x: auto;
        }
        .profile-table {
          width: 100%;
          border-collapse: collapse;
        }
        .profile-table-header {
          border-bottom: 2px solid #013E37;
        }
        .profile-table-header-cell {
          text-align: left;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .profile-table-row {
          border-bottom: 1px solid #FFEFB3;
          transition: all 0.2s ease;
          animation: fadeInRight 0.4s ease forwards;
          opacity: 0;
        }
        .profile-table-row:hover {
          background: #FFF9E6;
        }
        .profile-table-row:nth-child(1) { animation-delay: 0.3s; }
        .profile-table-row:nth-child(2) { animation-delay: 0.35s; }
        .profile-table-row:nth-child(3) { animation-delay: 0.4s; }
        .profile-table-row:nth-child(4) { animation-delay: 0.45s; }
        .profile-table-row:nth-child(5) { animation-delay: 0.5s; }
        .profile-table-cell {
          padding: 8px 12px;
          font-size: 14px;
          color: #013E37;
        }
        .profile-cell-productivity {
          color: #013E37;
          font-weight: 500;
        }
        .profile-cell-completion {
          color: #0A5C54;
          font-weight: 500;
        }
        .profile-cell-utilization {
          color: #1A7A6E;
          font-weight: 500;
        }
        .profile-cell-qa {
          color: #2A9A8A;
          font-weight: 500;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .profile-empty-state {
          text-align: center;
          padding: 32px 16px;
        }
        .profile-empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .profile-empty-icon {
          color: #FFEFB3;
        }
        .profile-empty-text {
          font-size: 14px;
          color: #013E37;
          margin: 0;
        }
        .profile-empty-subtext {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
          margin: 0;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.95);
          }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
          .profile-stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            align-items: stretch;
          }
          .profile-header-left {
            flex-wrap: wrap;
          }
          .profile-header-actions {
            width: 100%;
            flex-wrap: wrap;
          }
          .profile-edit-btn,
          .profile-cancel-btn,
          .profile-save-btn {
            flex: 1;
            justify-content: center;
          }
          .profile-stats-grid {
            grid-template-columns: 1fr;
          }
          .profile-error-actions {
            flex-direction: column;
            width: 100%;
          }
          .profile-error-btn,
          .profile-retry-btn {
            width: 100%;
            text-align: center;
          }
          .profile-kpi-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }

        @media (max-width: 480px) {
          .profile-title {
            font-size: 20px;
          }
          .profile-header-actions {
            flex-direction: column;
          }
          .profile-edit-btn,
          .profile-cancel-btn,
          .profile-save-btn {
            width: 100%;
          }
          .profile-card-content {
            padding: 16px;
          }
          .profile-avatar {
            width: 72px;
            height: 72px;
            font-size: 24px;
          }
          .profile-kpi-content {
            padding: 16px;
          }
          .profile-table-header-cell,
          .profile-table-cell {
            padding: 6px 8px;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default EmployeeProfile;