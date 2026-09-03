// pages/employees/Team.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Mail, 
  Phone, 
  Search, 
  Filter, 
  Plus, 
  UserPlus,
  X,
  RefreshCw,
  ChevronDown,
  Grid,
  List,
  MoreVertical,
  Star,
  Award,
  Clock,
  Briefcase,
  MapPin,
  Calendar,
  MessageSquare,
  Shield,
  UserCheck,
  UserX,
  Activity,
  BarChart3,
  Settings,
  Layers
} from 'lucide-react';
import { Loader } from '../../components/common/Loader';
import axios from 'axios';
import toast from 'react-hot-toast';

const Team = () => {
  const { token } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${API_URL}/users`, {
        params: { limit: 100 },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setTeamMembers(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      let errorMessage = 'Failed to load team members.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view team members.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchTeamMembers(true);
  };

  const getRoleBadge = (role) => {
    const styles = {
      'super_admin': { bg: '#013E37', text: '#FFEFB3', icon: Shield, label: 'Super Admin' },
      'admin': { bg: '#0A5C54', text: '#FFEFB3', icon: Shield, label: 'Admin' },
      'manager': { bg: '#1A7A6E', text: '#FFEFB3', icon: Briefcase, label: 'Manager' },
      'project_manager': { bg: '#2A9A8A', text: '#FFEFB3', icon: Briefcase, label: 'Project Manager' },
      'employee': { bg: '#6B7280', text: '#FFFFFF', icon: Users, label: 'Employee' },
      'client': { bg: '#EC4899', text: '#FFFFFF', icon: UserCheck, label: 'Client' }
    };
    return styles[role] || styles.employee;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'active': { bg: '#013E37', text: '#FFEFB3', icon: UserCheck, label: 'Active' },
      'inactive': { bg: '#FEE2E2', text: '#991B1B', icon: UserX, label: 'Inactive' },
      'suspended': { bg: '#FFEFB3', text: '#013E37', icon: Clock, label: 'Suspended' }
    };
    return styles[status] || styles.active;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  const getRandomColor = (name) => {
    const colors = [
      '#013E37', '#0A5C54', '#1A7A6E', '#2A9A8A', '#FFEFB3',
      '#3A9A8A', '#4AAAAA', '#5ABABA', '#6ACACA', '#7ADADA'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const filteredMembers = teamMembers.filter(member => {
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(searchLower) || 
                         (member.email || '').toLowerCase().includes(searchLower) ||
                         (member.department || '').toLowerCase().includes(searchLower) ||
                         (member.position || '').toLowerCase().includes(searchLower);
    
    const matchesRole = filterRole ? member.role === filterRole : true;
    const matchesStatus = filterStatus ? member.status === filterStatus : true;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'active').length,
    admins: teamMembers.filter(m => m.role === 'admin' || m.role === 'super_admin').length,
    managers: teamMembers.filter(m => m.role === 'manager' || m.role === 'project_manager').length,
  };

  if (loading) {
    return (
      <div className="team-loading">
        <div className="team-loading-spinner"></div>
        <p className="team-loading-text">Loading team members...</p>
      </div>
    );
  }

  return (
    <>
      <div className="team-container">
        {/* Header Section */}
        <div className="team-header">
          <div className="team-header-left">
            <h1 className="team-title">
              <Layers className="team-title-icon" />
              Team
            </h1>
            <p className="team-subtitle">Manage your team members and their roles</p>
          </div>
          <div className="team-header-right">
            <button className="team-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`team-refresh-icon ${refreshing ? 'team-spinning' : ''}`} />
            </button>
            <button className="team-filter-btn" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="team-filter-icon" />
              Filters
              <ChevronDown className={`team-chevron ${showFilters ? 'team-chevron-open' : ''}`} />
            </button>
            <div className="team-view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`team-view-btn ${viewMode === 'grid' ? 'team-view-active' : ''}`}
                title="Grid View"
              >
                <Grid className="team-view-icon" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`team-view-btn ${viewMode === 'list' ? 'team-view-active' : ''}`}
                title="List View"
              >
                <List className="team-view-icon" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="team-stats">
          <div className="team-stat-card">
            <div className="team-stat-icon-wrapper team-stat-icon-blue">
              <Users className="team-stat-icon" />
            </div>
            <div>
              <p className="team-stat-number">{stats.total}</p>
              <p className="team-stat-label">Total Members</p>
            </div>
          </div>
          <div className="team-stat-card">
            <div className="team-stat-icon-wrapper team-stat-icon-green">
              <UserCheck className="team-stat-icon" />
            </div>
            <div>
              <p className="team-stat-number">{stats.active}</p>
              <p className="team-stat-label">Active</p>
            </div>
          </div>
          <div className="team-stat-card">
            <div className="team-stat-icon-wrapper team-stat-icon-purple">
              <Shield className="team-stat-icon" />
            </div>
            <div>
              <p className="team-stat-number">{stats.admins}</p>
              <p className="team-stat-label">Admins</p>
            </div>
          </div>
          <div className="team-stat-card">
            <div className="team-stat-icon-wrapper team-stat-icon-yellow">
              <Briefcase className="team-stat-icon" />
            </div>
            <div>
              <p className="team-stat-number">{stats.managers}</p>
              <p className="team-stat-label">Managers</p>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="team-filter-panel">
            <div className="team-filter-row">
              <div className="team-filter-group">
                <label className="team-filter-label">Search</label>
                <div className="team-search-bar">
                  <Search className="team-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name, email, department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="team-search-input"
                  />
                  {searchTerm && (
                    <button className="team-search-clear" onClick={() => setSearchTerm('')}>
                      <X className="team-search-clear-icon" />
                    </button>
                  )}
                </div>
              </div>
              <div className="team-filter-group">
                <label className="team-filter-label">Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="team-filter-select"
                >
                  <option value="">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="employee">Employee</option>
                  <option value="client">Client</option>
                </select>
              </div>
              <div className="team-filter-group">
                <label className="team-filter-label">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="team-filter-select"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <button className="team-clear-filters" onClick={() => {
                setSearchTerm('');
                setFilterRole('');
                setFilterStatus('');
                setShowFilters(false);
              }}>
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Team Grid/List View */}
        {filteredMembers.length === 0 ? (
          <div className="team-empty">
            <div className="team-empty-content">
              <Users className="team-empty-icon" size={64} />
              <h3 className="team-empty-title">No team members found</h3>
              <p className="team-empty-subtext">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="team-grid">
            {filteredMembers.map((member, index) => {
              const roleStyle = getRoleBadge(member.role);
              const statusStyle = getStatusBadge(member.status);
              const StatusIcon = statusStyle.icon;
              const avatarColor = getRandomColor(member.firstName || '');
              
              return (
                <Link 
                  key={member._id} 
                  to={`/employees/profile/${member._id}`}
                  className="team-card-link"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="team-card">
                    <div className="team-card-header">
                      <div className="team-card-badges">
                        <span className="team-role-badge" style={{
                          backgroundColor: roleStyle.bg,
                          color: roleStyle.text,
                        }}>
                          {roleStyle.label}
                        </span>
                        <span className="team-status-badge" style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                        }}>
                          <StatusIcon className="team-status-icon" />
                          {statusStyle.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="team-card-body">
                      <div className="team-card-avatar">
                        <div className="team-avatar" style={{ backgroundColor: avatarColor }}>
                          {getInitials(member.firstName, member.lastName)}
                        </div>
                      </div>
                      <h3 className="team-card-name">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="team-card-position">{member.position || 'Team Member'}</p>
                      {member.department && (
                        <div className="team-card-department">
                          <Briefcase className="team-card-icon" />
                          {member.department}
                        </div>
                      )}
                    </div>
                    
                    <div className="team-card-footer">
                      <div className="team-card-contact">
                        <Mail className="team-card-contact-icon" />
                        <span className="team-card-contact-text">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="team-card-contact">
                          <Phone className="team-card-contact-icon" />
                          <span className="team-card-contact-text">{member.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="team-list-wrapper">
            <div className="team-list-header">
              <span className="team-list-header-text">Member</span>
              <span className="team-list-header-text">Role</span>
              <span className="team-list-header-text">Department</span>
              <span className="team-list-header-text">Status</span>
              <span className="team-list-header-text">Contact</span>
              <span className="team-list-header-text">Action</span>
            </div>
            {filteredMembers.map((member, index) => {
              const roleStyle = getRoleBadge(member.role);
              const statusStyle = getStatusBadge(member.status);
              const StatusIcon = statusStyle.icon;
              const avatarColor = getRandomColor(member.firstName || '');
              
              return (
                <div key={member._id} className="team-list-item" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="team-list-item-content">
                    <div className="team-list-item-member">
                      <div className="team-list-avatar" style={{ backgroundColor: avatarColor }}>
                        {getInitials(member.firstName, member.lastName)}
                      </div>
                      <div>
                        <div className="team-list-item-name">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="team-list-item-position">
                          {member.position || 'Team Member'}
                        </div>
                      </div>
                    </div>
                    <div className="team-list-item-role">
                      <span className="team-list-role-badge" style={{
                        backgroundColor: roleStyle.bg,
                        color: roleStyle.text,
                      }}>
                        {roleStyle.label}
                      </span>
                    </div>
                    <div className="team-list-item-department">
                      {member.department || '—'}
                    </div>
                    <div className="team-list-item-status">
                      <span className="team-list-status-badge" style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                      }}>
                        <StatusIcon className="team-list-status-icon" />
                        {statusStyle.label}
                      </span>
                    </div>
                    <div className="team-list-item-contact">
                      <div className="team-list-contact-item">
                        <Mail className="team-list-contact-icon" />
                        <span className="team-list-contact-text">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="team-list-contact-item">
                          <Phone className="team-list-contact-icon" />
                          <span className="team-list-contact-text">{member.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="team-list-item-actions">
                      <Link to={`/employees/profile/${member._id}`} className="team-list-action-view" title="View Profile">
                        <Users className="team-list-action-icon" />
                      </Link>
                      <Link to={`/employees/profile/${member._id}/edit`} className="team-list-action-edit" title="Edit">
                        <Settings className="team-list-action-icon" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .team-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .team-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .team-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .team-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           HEADER
           ============================================ */
        .team-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
          animation: fadeInDown 0.6s ease;
        }
        .team-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .team-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .team-title-icon {
          width: 28px;
          height: 28px;
          color: #013E37;
          animation: pulse 2s ease-in-out infinite;
        }
        .team-subtitle {
          color: #013E37;
          opacity: 0.6;
          font-size: 15px;
          margin: 0;
        }
        .team-header-right {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .team-refresh-btn {
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .team-refresh-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .team-refresh-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          transition: transform 0.3s ease;
        }
        .team-spinning {
          animation: spin 1s linear infinite;
        }
        .team-filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .team-filter-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .team-filter-icon {
          width: 16px;
          height: 16px;
        }
        .team-chevron {
          width: 14px;
          height: 14px;
          transition: transform 0.3s ease;
        }
        .team-chevron-open {
          transform: rotate(180deg);
        }
        .team-view-toggle {
          display: flex;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #FFEFB3;
          background: #ffffff;
        }
        .team-view-btn {
          padding: 8px 10px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #013E37;
          opacity: 0.5;
        }
        .team-view-btn:hover {
          opacity: 0.8;
        }
        .team-view-active {
          background: #013E37;
          color: #FFEFB3;
          opacity: 1;
        }
        .team-view-active:hover {
          opacity: 1;
        }
        .team-view-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           STATS
           ============================================ */
        .team-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .team-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 16px 20px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        .team-stat-card:nth-child(1) { animation-delay: 0.05s; }
        .team-stat-card:nth-child(2) { animation-delay: 0.1s; }
        .team-stat-card:nth-child(3) { animation-delay: 0.15s; }
        .team-stat-card:nth-child(4) { animation-delay: 0.2s; }
        .team-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }
        .team-stat-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .team-stat-icon-blue {
          background: #E8F0FE;
        }
        .team-stat-icon-green {
          background: #E6F7EC;
        }
        .team-stat-icon-purple {
          background: #F0ECFA;
        }
        .team-stat-icon-yellow {
          background: #FFF8E6;
        }
        .team-stat-icon {
          width: 18px;
          height: 18px;
        }
        .team-stat-icon-blue .team-stat-icon {
          color: #013E37;
        }
        .team-stat-icon-green .team-stat-icon {
          color: #0A5C54;
        }
        .team-stat-icon-purple .team-stat-icon {
          color: #1A7A6E;
        }
        .team-stat-icon-yellow .team-stat-icon {
          color: #013E37;
        }
        .team-stat-number {
          font-size: 22px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          line-height: 1.2;
        }
        .team-stat-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
          font-weight: 500;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .team-filter-panel {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 16px;
          animation: fadeIn 0.3s ease;
        }
        .team-filter-row {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }
        .team-filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 150px;
        }
        .team-filter-label {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .team-search-bar {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          padding: 0 12px;
          transition: all 0.3s ease;
          width: 100%;
        }
        .team-search-bar:focus-within {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .team-search-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.4;
          flex-shrink: 0;
        }
        .team-search-input {
          flex: 1;
          padding: 8px 10px;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
          color: #013E37;
        }
        .team-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }
        .team-search-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          background: none;
          border: none;
          color: #013E37;
          opacity: 0.4;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        .team-search-clear:hover {
          background: #FFEFB3;
          opacity: 1;
        }
        .team-search-clear-icon {
          width: 14px;
          height: 14px;
        }
        .team-filter-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #013E37;
          outline: none;
          transition: all 0.3s ease;
          cursor: pointer;
          width: 100%;
        }
        .team-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .team-clear-filters {
          padding: 8px 16px;
          background: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          align-self: center;
        }
        .team-clear-filters:hover {
          background: #013E37;
          color: #FFEFB3;
        }

        /* ============================================
           GRID VIEW
           ============================================ */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .team-card-link {
          text-decoration: none;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        .team-card-link:nth-child(1) { animation-delay: 0.05s; }
        .team-card-link:nth-child(2) { animation-delay: 0.1s; }
        .team-card-link:nth-child(3) { animation-delay: 0.15s; }
        .team-card-link:nth-child(4) { animation-delay: 0.2s; }
        .team-card-link:nth-child(5) { animation-delay: 0.25s; }
        .team-card {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .team-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #013E37, #0A5C54, #013E37);
          transform: scaleX(0);
          transition: transform 0.4s ease;
          transform-origin: left;
        }
        .team-card:hover::before {
          transform: scaleX(1);
        }
        .team-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 30px rgba(1, 62, 55, 0.12);
          border-color: #013E37;
        }
        .team-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFF9E6;
        }
        .team-card-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .team-role-badge {
          padding: 3px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          transition: all 0.3s ease;
        }
        .team-role-badge:hover {
          transform: scale(1.05);
        }
        .team-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .team-status-badge:hover {
          transform: scale(1.05);
        }
        .team-status-icon {
          width: 10px;
          height: 10px;
        }

        .team-card-body {
          padding: 16px;
          text-align: center;
          flex: 1;
        }
        .team-card-avatar {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }
        .team-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFEFB3;
          font-size: 28px;
          font-weight: 700;
          transition: all 0.3s ease;
        }
        .team-card:hover .team-avatar {
          transform: scale(1.05);
        }
        .team-card-name {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .team-card-position {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 4px 0 0 0;
        }
        .team-card-department {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #013E37;
          margin-top: 8px;
          padding: 4px 12px;
          background: #FFEFB3;
          border-radius: 6px;
          transition: all 0.3s ease;
        }
        .team-card:hover .team-card-department {
          background: #013E37;
          color: #FFEFB3;
        }
        .team-card-icon {
          width: 12px;
          height: 12px;
        }

        .team-card-footer {
          padding: 12px 16px;
          border-top: 1px solid #FFEFB3;
          background: #FFF9E6;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: border-color 0.3s ease;
        }
        .team-card:hover .team-card-footer {
          border-color: #013E37;
        }
        .team-card-contact {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .team-card-contact-icon {
          width: 14px;
          height: 14px;
          color: #013E37;
          opacity: 0.5;
        }
        .team-card-contact-text {
          font-size: 13px;
          color: #013E37;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ============================================
           LIST VIEW
           ============================================ */
        .team-list-wrapper {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .team-list-wrapper:hover {
          border-color: #013E37;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }
        .team-list-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 0.8fr 1.5fr 0.8fr;
          padding: 12px 16px;
          background: #FFF9E6;
          border-bottom: 2px solid #013E37;
          font-weight: 600;
          font-size: 12px;
          color: #013E37;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .team-list-header-text {
          display: flex;
          align-items: center;
        }
        .team-list-item {
          border-bottom: 1px solid #FFEFB3;
          transition: all 0.2s ease;
          animation: fadeInRight 0.4s ease forwards;
          opacity: 0;
        }
        .team-list-item:nth-child(1) { animation-delay: 0.05s; }
        .team-list-item:nth-child(2) { animation-delay: 0.1s; }
        .team-list-item:nth-child(3) { animation-delay: 0.15s; }
        .team-list-item:nth-child(4) { animation-delay: 0.2s; }
        .team-list-item:nth-child(5) { animation-delay: 0.25s; }
        .team-list-item:hover {
          background: #FFF9E6;
        }
        .team-list-item-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 0.8fr 1.5fr 0.8fr;
          padding: 12px 16px;
          align-items: center;
          gap: 8px;
        }
        .team-list-item-member {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .team-list-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFEFB3;
          font-size: 16px;
          font-weight: 600;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .team-list-item:hover .team-list-avatar {
          transform: scale(1.05);
        }
        .team-list-item-name {
          font-weight: 500;
          color: #013E37;
          font-size: 14px;
        }
        .team-list-item-position {
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
        }
        .team-list-role-badge {
          padding: 3px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          transition: all 0.3s ease;
        }
        .team-list-role-badge:hover {
          transform: scale(1.05);
        }
        .team-list-item-department {
          font-size: 13px;
          color: #013E37;
          opacity: 0.7;
        }
        .team-list-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .team-list-status-badge:hover {
          transform: scale(1.05);
        }
        .team-list-status-icon {
          width: 10px;
          height: 10px;
        }
        .team-list-item-contact {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .team-list-contact-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #013E37;
          opacity: 0.7;
        }
        .team-list-contact-icon {
          width: 12px;
          height: 12px;
          color: #013E37;
          opacity: 0.4;
        }
        .team-list-contact-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .team-list-item-actions {
          display: flex;
          gap: 6px;
          justify-content: center;
        }
        .team-list-action-view {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          background: #FFEFB3;
          color: #013E37;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .team-list-action-view:hover {
          background: #013E37;
          color: #FFEFB3;
          transform: scale(1.05);
        }
        .team-list-action-edit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          background: #FFEFB3;
          color: #013E37;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .team-list-action-edit:hover {
          background: #013E37;
          color: #FFEFB3;
          transform: scale(1.05);
        }
        .team-list-action-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .team-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: #ffffff;
          border: 2px dashed #FFEFB3;
          border-radius: 12px;
        }
        .team-empty-content {
          text-align: center;
          padding: 48px;
        }
        .team-empty-icon {
          color: #FFEFB3;
          margin-bottom: 16px;
        }
        .team-empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0 0 8px 0;
        }
        .team-empty-subtext {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
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
          .team-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .team-header {
            flex-direction: column;
            align-items: stretch;
          }
          .team-header-right {
            width: 100%;
            flex-wrap: wrap;
          }
          .team-filter-btn {
            flex: 1;
            justify-content: center;
          }
          .team-view-toggle {
            flex: 0;
          }
          .team-stats {
            grid-template-columns: 1fr 1fr;
          }
          .team-filter-row {
            flex-direction: column;
            align-items: stretch;
          }
          .team-filter-group {
            min-width: unset;
          }
          .team-clear-filters {
            align-self: stretch;
          }
          .team-grid {
            grid-template-columns: 1fr;
          }
          .team-list-header {
            display: none;
          }
          .team-list-item-content {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .team-list-item-member {
            font-size: 16px;
            font-weight: 600;
          }
          .team-list-item-actions {
            justify-content: flex-start;
          }
          .team-empty-content {
            padding: 32px;
          }
        }

        @media (max-width: 480px) {
          .team-stats {
            grid-template-columns: 1fr;
          }
          .team-stat-card {
            padding: 12px 16px;
          }
          .team-stat-number {
            font-size: 18px;
          }
          .team-title {
            font-size: 24px;
          }
          .team-header-right {
            flex-wrap: wrap;
          }
          .team-view-toggle {
            flex: 0;
          }
          .team-card-body {
            padding: 12px;
          }
          .team-avatar {
            width: 56px;
            height: 56px;
            font-size: 22px;
          }
          .team-card-name {
            font-size: 16px;
          }
          .team-list-item-actions {
            flex-wrap: wrap;
          }
          .team-list-action-view,
          .team-list-action-edit {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default Team;