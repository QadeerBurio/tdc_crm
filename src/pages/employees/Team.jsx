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
  Settings
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
  const API_URL =  'https://crmserver-production-4a42.up.railway.app/api';

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
      'super_admin': { bg: '#8B5CF6', text: '#FFFFFF', icon: Shield, label: 'Super Admin' },
      'admin': { bg: '#3B82F6', text: '#FFFFFF', icon: Shield, label: 'Admin' },
      'manager': { bg: '#F59E0B', text: '#FFFFFF', icon: Briefcase, label: 'Manager' },
      'project_manager': { bg: '#10B981', text: '#FFFFFF', icon: Briefcase, label: 'Project Manager' },
      'employee': { bg: '#6B7280', text: '#FFFFFF', icon: Users, label: 'Employee' },
      'client': { bg: '#EC4899', text: '#FFFFFF', icon: UserCheck, label: 'Client' }
    };
    return styles[role] || styles.employee;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'active': { bg: '#D1FAE5', text: '#065F46', icon: UserCheck, label: 'Active' },
      'inactive': { bg: '#FEE2E2', text: '#991B1B', icon: UserX, label: 'Inactive' },
      'suspended': { bg: '#FEF3C7', text: '#92400E', icon: Clock, label: 'Suspended' }
    };
    return styles[status] || styles.active;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  const getRandomColor = (name) => {
    const colors = [
      '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
      '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4'
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
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading team members...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Team</h1>
          <p style={styles.pageSubtitle}>Manage your team members and their roles</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.iconButton} onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button style={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filters
            <ChevronDown size={14} style={{
              transform: showFilters ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease'
            }} />
          </button>
          <div style={styles.viewToggle}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                ...styles.viewButton,
                ...(viewMode === 'grid' ? styles.viewButtonActive : styles.viewButtonInactive)
              }}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                ...styles.viewButton,
                ...(viewMode === 'list' ? styles.viewButtonActive : styles.viewButtonInactive)
              }}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
          
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperBlue}>
            <Users size={18} style={styles.statIconBlue} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.total}</p>
            <p style={styles.statLabel}>Total Members</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperGreen}>
            <UserCheck size={18} style={styles.statIconGreen} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.active}</p>
            <p style={styles.statLabel}>Active</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperPurple}>
            <Shield size={18} style={styles.statIconPurple} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.admins}</p>
            <p style={styles.statLabel}>Admins</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperYellow}>
            <Briefcase size={18} style={styles.statIconYellow} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.managers}</p>
            <p style={styles.statLabel}>Managers</p>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={styles.filterPanel}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search</label>
              <div style={styles.searchBar}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by name, email, department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                {searchTerm && (
                  <button style={styles.clearSearch} onClick={() => setSearchTerm('')}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={styles.filterSelect}
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
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <button style={styles.clearFiltersButton} onClick={() => {
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
        <div style={styles.emptyState}>
          <div style={styles.emptyContent}>
            <Users size={64} style={styles.emptyIcon} />
            <h3 style={styles.emptyTitle}>No team members found</h3>
            <p style={styles.emptySubtext}>Try adjusting your search or filters</p>
            <button style={styles.emptyButton}>
              <UserPlus size={16} />
              Add Member
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={styles.grid}>
          {filteredMembers.map((member) => {
            const roleStyle = getRoleBadge(member.role);
            const statusStyle = getStatusBadge(member.status);
            const StatusIcon = statusStyle.icon;
            const avatarColor = getRandomColor(member.firstName || '');
            
            return (
              <Link 
                key={member._id} 
                to={`/employees/profile/${member._id}`}
                style={styles.cardLink}
              >
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardBadges}>
                      <span style={{
                        ...styles.roleBadge,
                        backgroundColor: roleStyle.bg,
                        color: roleStyle.text,
                      }}>
                        {roleStyle.label}
                      </span>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                      }}>
                        <StatusIcon size={10} style={styles.statusIcon} />
                        {statusStyle.label}
                      </span>
                    </div>
                    <button style={styles.cardMoreButton}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  
                  <div style={styles.cardBody}>
                    <div style={styles.cardAvatar}>
                      <div style={{
                        ...styles.avatar,
                        backgroundColor: avatarColor
                      }}>
                        {getInitials(member.firstName, member.lastName)}
                      </div>
                    </div>
                    <h3 style={styles.cardName}>
                      {member.firstName} {member.lastName}
                    </h3>
                    <p style={styles.cardPosition}>{member.position || 'Team Member'}</p>
                    {member.department && (
                      <div style={styles.cardDepartment}>
                        <Briefcase size={12} style={styles.cardIcon} />
                        {member.department}
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.cardFooter}>
                    <div style={styles.cardContact}>
                      <Mail size={14} style={styles.cardContactIcon} />
                      <span style={styles.cardContactText}>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div style={styles.cardContact}>
                        <Phone size={14} style={styles.cardContactIcon} />
                        <span style={styles.cardContactText}>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div style={styles.listWrapper}>
          <div style={styles.listHeader}>
            <span style={styles.listHeaderText}>Member</span>
            <span style={styles.listHeaderText}>Role</span>
            <span style={styles.listHeaderText}>Department</span>
            <span style={styles.listHeaderText}>Status</span>
            <span style={styles.listHeaderText}>Contact</span>
            <span style={styles.listHeaderText} >Action</span>
          </div>
          {filteredMembers.map((member) => {
            const roleStyle = getRoleBadge(member.role);
            const statusStyle = getStatusBadge(member.status);
            const StatusIcon = statusStyle.icon;
            const avatarColor = getRandomColor(member.firstName || '');
            
            return (
              <div key={member._id} style={styles.listItem}>
                <div style={styles.listItemContent}>
                  <div style={styles.listItemMember}>
                    <div style={{
                      ...styles.listAvatar,
                      backgroundColor: avatarColor
                    }}>
                      {getInitials(member.firstName, member.lastName)}
                    </div>
                    <div>
                      <div style={styles.listItemName}>
                        {member.firstName} {member.lastName}
                      </div>
                      <div style={styles.listItemPosition}>
                        {member.position || 'Team Member'}
                      </div>
                    </div>
                  </div>
                  <div style={styles.listItemRole}>
                    <span style={{
                      ...styles.listRoleBadge,
                      backgroundColor: roleStyle.bg,
                      color: roleStyle.text,
                    }}>
                      {roleStyle.label}
                    </span>
                  </div>
                  <div style={styles.listItemDepartment}>
                    {member.department || '—'}
                  </div>
                  <div style={styles.listItemStatus}>
                    <span style={{
                      ...styles.listStatusBadge,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                    }}>
                      <StatusIcon size={10} style={styles.listStatusIcon} />
                      {statusStyle.label}
                    </span>
                  </div>
                  <div style={styles.listItemContact}>
                    <div style={styles.listContactItem}>
                      <Mail size={12} style={styles.listContactIcon} />
                      <span style={styles.listContactText}>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div style={styles.listContactItem}>
                        <Phone size={12} style={styles.listContactIcon} />
                        <span style={styles.listContactText}>{member.phone}</span>
                      </div>
                    )}
                  </div>
                  <div style={styles.listItemActions}>
                    <Link to={`/employees/profile/${member._id}`} style={styles.listActionView} title="View Profile">
                      <Users size={14} />
                    </Link>
                    <Link to={`/employees/profile/${member._id}/edit`} style={styles.listActionEdit} title="Edit">
                      <Settings size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
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
    color: '#0F172A',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#64748B',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    color: '#64748B',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  viewToggle: {
    display: 'flex',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  viewButton: {
    padding: '10px 12px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  viewButtonActive: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
  },
  viewButtonInactive: {
    backgroundColor: '#FFFFFF',
    color: '#94A3B8',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
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
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px 20px',
    border: '1px solid #E2E8F0',
    transition: 'all 0.2s ease',
  },
  statIconWrapperBlue: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statIconWrapperGreen: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#ECFDF5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statIconWrapperPurple: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#F5F3FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statIconWrapperYellow: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#FFFBEB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statIconBlue: {
    color: '#3B82F6',
  },
  statIconGreen: {
    color: '#10B981',
  },
  statIconPurple: {
    color: '#8B5CF6',
  },
  statIconYellow: {
    color: '#F59E0B',
  },
  statNumber: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
    fontWeight: '500',
  },
  filterPanel: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
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
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '0 12px',
    transition: 'all 0.2s ease',
  },
  searchIcon: {
    color: '#94A3B8',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    padding: '8px 10px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: 'transparent',
    color: '#0F172A',
  },
  clearSearch: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    outline: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  clearFiltersButton: {
    padding: '8px 16px',
    backgroundColor: '#F1F5F9',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    alignSelf: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  cardLink: {
    textDecoration: 'none',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  cardBadges: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  roleBadge: {
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  statusIcon: {
    marginRight: '2px',
  },
  cardMoreButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  cardBody: {
    padding: '16px',
    textAlign: 'center',
    flex: 1,
  },
  cardAvatar: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: '28px',
    fontWeight: '700',
  },
  cardName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0F172A',
    margin: 0,
  },
  cardPosition: {
    fontSize: '14px',
    color: '#64748B',
    margin: '4px 0 0 0',
  },
  cardDepartment: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#64748B',
    marginTop: '8px',
    padding: '4px 12px',
    backgroundColor: '#F1F5F9',
    borderRadius: '6px',
  },
  cardIcon: {
    color: '#94A3B8',
  },
  cardFooter: {
    padding: '12px 16px',
    borderTop: '1px solid #F1F5F9',
    backgroundColor: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  cardContact: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  cardContactIcon: {
    color: '#94A3B8',
  },
  cardContactText: {
    fontSize: '13px',
    color: '#475569',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  listWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
  },
  listHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 0.8fr 1.5fr 0.8fr',
    padding: '12px 16px',
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
    fontWeight: '600',
    fontSize: '12px',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  listHeaderText: {
    display: 'flex',
    alignItems: 'center',
  },
  listItem: {
    borderBottom: '1px solid #F1F5F9',
    transition: 'background-color 0.2s ease',
  },
  listItemContent: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 0.8fr 1.5fr 0.8fr',
    padding: '12px 16px',
    alignItems: 'center',
    gap: '8px',
  },
  listItemMember: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  listAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '600',
    flexShrink: 0,
  },
  listItemName: {
    fontWeight: '500',
    color: '#0F172A',
    fontSize: '14px',
  },
  listItemPosition: {
    fontSize: '12px',
    color: '#64748B',
  },
  listRoleBadge: {
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  listItemDepartment: {
    fontSize: '13px',
    color: '#64748B',
  },
  listStatusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  listStatusIcon: {
    marginRight: '2px',
  },
  listItemContact: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  listContactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#64748B',
  },
  listContactIcon: {
    color: '#94A3B8',
  },
  listContactText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  listItemActions: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
  },
  listActionView: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#EFF6FF',
    color: '#3B82F6',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  listActionEdit: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#FEF3C7',
    color: '#F59E0B',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
  },
  emptyContent: {
    textAlign: 'center',
    padding: '48px',
  },
  emptyIcon: {
    color: '#94A3B8',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0F172A',
    margin: '0 0 8px 0',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#64748B',
    margin: '0 0 20px 0',
  },
  emptyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

// Add keyframe and hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .primary-button:hover:not(:disabled) {
    background-color: #2563EB !important;
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.35) !important;
    transform: translateY(-1px);
  }

  .icon-button:hover:not(:disabled) {
    background-color: #F1F5F9 !important;
  }

  .filter-button:hover:not(:disabled) {
    background-color: #F1F5F9 !important;
  }

  .clear-filters-button:hover:not(:disabled) {
    background-color: #E2E8F0 !important;
  }

  .search-bar:focus-within {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }

  .filter-select:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }

  .view-button-inactive:hover:not(:disabled) {
    background-color: #F1F5F9 !important;
  }

  .clear-search:hover {
    background-color: #F1F5F9 !important;
  }

  .empty-button:hover {
    background-color: #2563EB !important;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08) !important;
  }

  .card-more-button:hover {
    background-color: #F1F5F9 !important;
  }

  .list-item:hover {
    background-color: #F8FAFC !important;
  }

  .list-action-view:hover:not(:disabled) {
    background-color: #DBEAFE !important;
  }

  .list-action-edit:hover:not(:disabled) {
    background-color: #FDE68A !important;
  }

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

    .header-actions {
      width: 100% !important;
      justify-content: flex-start !important;
    }

    .primary-button {
      flex: 1 !important;
      justify-content: center !important;
    }

    .filter-button {
      flex: 1 !important;
      justify-content: center !important;
    }

    .stats-grid {
      grid-template-columns: 1fr 1fr !important;
    }

    .filter-row {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .filter-group {
      min-width: unset !important;
    }

    .clear-filters-button {
      align-self: stretch !important;
    }

    .grid {
      grid-template-columns: 1fr !important;
    }

    .list-header {
      display: none !important;
    }

    .list-item-content {
      grid-template-columns: 1fr !important;
      gap: 8px !important;
    }

    .list-item-member {
      font-size: 16px !important;
      font-weight: 600 !important;
    }

    .list-item-actions {
      justify-content: flex-start !important;
    }

    .empty-content {
      padding: 32px !important;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 12px !important;
    }

    .stats-grid {
      grid-template-columns: 1fr !important;
    }

    .stat-card {
      padding: 12px 16px !important;
    }

    .stat-number {
      font-size: 18px !important;
    }

    .page-title {
      font-size: 22px !important;
    }

    .header-actions {
      flex-wrap: wrap !important;
    }

    .view-toggle {
      flex: 0 !important;
    }

    .card-body {
      padding: 12px !important;
    }

    .avatar {
      width: 56px !important;
      height: 56px !important;
      font-size: 22px !important;
    }

    .card-name {
      font-size: 16px !important;
    }

    .list-item-actions {
      flex-wrap: wrap !important;
    }

    .list-action-view,
    .list-action-edit {
      flex: 1 !important;
      justify-content: center !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Team;