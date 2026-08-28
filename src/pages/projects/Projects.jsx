// pages/projects/Projects.jsx - COMPLETE FIXED VERSION

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  ChevronDown,
  X,
  RefreshCw,
  FolderKanban,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Projects = () => {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';
  const isEmployee = user?.role === 'employee';

  useEffect(() => {
    fetchProjects();
  }, [currentPage, searchTerm, filterStatus, filterType]);

  const fetchProjects = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const params = {
        page: currentPage,
        search: searchTerm || undefined,
        status: filterStatus || undefined,
        projectType: filterType || undefined,
        limit: 10
      };

      console.log('🔍 Fetching projects with params:', params);
      console.log('👤 User role:', user?.role);

      const response = await axios.get(`${API_URL}/projects`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('📊 Projects response:', response.data);

      // Handle different response structures
      let projectsData = [];
      let paginationData = {};

      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          projectsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          projectsData = response.data;
        } else if (response.data.projects && Array.isArray(response.data.projects)) {
          projectsData = response.data.projects;
        } else {
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              projectsData = response.data[key];
              break;
            }
          }
        }

        if (response.data.pagination) {
          paginationData = response.data.pagination;
        } else if (response.data.meta) {
          paginationData = response.data.meta;
        }
      }

      console.log('📋 Projects found:', projectsData.length);
      setProjects(projectsData);
      setPagination({
        page: paginationData.page || currentPage,
        totalPages: paginationData.totalPages || 1,
        total: paginationData.total || projectsData.length,
        limit: paginationData.limit || 10
      });

    } catch (err) {
      console.error('Error fetching projects:', err);
      let errorMessage = 'Failed to load projects.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view projects.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
      setProjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;

    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/projects/${selectedProject._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Project deleted successfully');
      setShowDeleteModal(false);
      setSelectedProject(null);
      await fetchProjects(true);
    } catch (err) {
      console.error('Error deleting project:', err);
      let errorMessage = 'Failed to delete project.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to delete this project.';
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterType('');
    setSearchTerm('');
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handleRefresh = () => {
    fetchProjects(true);
  };

  const getStatusStyle = (status) => {
    const statusStyles = {
      'Active': {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        icon: CheckCircle,
        label: 'Active'
      },
      'Planning': {
        backgroundColor: '#DBEAFE',
        color: '#1E40AF',
        icon: Clock,
        label: 'Planning'
      },
      'On Hold': {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
        icon: AlertCircle,
        label: 'On Hold'
      },
      'Completed': {
        backgroundColor: '#EDE9FE',
        color: '#5B21B6',
        icon: CheckCircle,
        label: 'Completed'
      },
      'Archived': {
        backgroundColor: '#F3F4F6',
        color: '#374151',
        icon: FolderKanban,
        label: 'Archived'
      },
    };
    return statusStyles[status] || statusStyles.Active;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': '#10B981',
      'Planning': '#3B82F6',
      'On Hold': '#F59E0B',
      'Completed': '#8B5CF6',
      'Archived': '#6B7280',
    };
    return colors[status] || '#10B981';
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

  // Stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'Active').length,
    planning: projects.filter(p => p.status === 'Planning').length,
    completed: projects.filter(p => p.status === 'Completed').length,
  };

  // Project Card Component
  const ProjectCard = ({ project }) => {
    const statusStyle = getStatusStyle(project.status);
    const StatusIcon = statusStyle.icon;
    const statusColor = getStatusColor(project.status);

    return (
      <div style={styles.cardWrapper}>
        <div style={styles.cardTop}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconWrapper}>
              <FolderKanban size={18} style={styles.cardIcon} />
            </div>
            <span style={{
              ...styles.cardStatus,
              backgroundColor: statusStyle.backgroundColor,
              color: statusStyle.color,
            }}>
              <StatusIcon size={10} style={styles.cardStatusIcon} />
              {statusStyle.label}
            </span>
          </div>
          <Link to={`/projects/${project._id}`} style={styles.cardTitleLink}>
            <h3 style={styles.cardTitle}>{project.projectName}</h3>
          </Link>
          <p style={styles.cardDescription}>
            {project.description || 'No description provided'}
          </p>
        </div>

        <div style={styles.cardBody}>
          <div style={styles.cardMeta}>
            <span style={styles.cardMetaItem}>
              <Users size={14} style={styles.cardMetaIcon} />
              {project.clientId?.companyName || 'No Client'}
            </span>
            <span style={styles.cardMetaItem}>
              <Calendar size={14} style={styles.cardMetaIcon} />
              {project.endDate ? formatDate(project.endDate) : 'No deadline'}
            </span>
          </div>
          <div style={styles.cardProgress}>
            <div style={styles.cardProgressHeader}>
              <span style={styles.cardProgressLabel}>Progress</span>
              <span style={styles.cardProgressValue}>{project.completionPercentage || 0}%</span>
            </div>
            <div style={styles.cardProgressBar}>
              <div style={{
                ...styles.cardProgressFill,
                width: `${project.completionPercentage || 0}%`,
                backgroundColor: statusColor
              }} />
            </div>
          </div>
        </div>

        <div style={styles.cardFooter}>
          <Link to={`/projects/${project._id}`} style={styles.cardButtonView}>
            <Eye size={14} />
            View
          </Link>
          {!isEmployee && (
            <>
              <Link to={`/projects/${project._id}/edit`} style={styles.cardButtonEdit}>
                <Edit size={14} />
                Edit
              </Link>
              <button
                style={styles.cardButtonDelete}
                onClick={() => {
                  setSelectedProject(project);
                  setShowDeleteModal(true);
                }}
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading projects...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Projects</h1>
          <p style={styles.pageSubtitle}>
            {isEmployee ? 'Projects you are assigned to' : 'Manage all your client projects and tasks'}
          </p>
        </div>
        {!isEmployee && (
          <Link to="/projects/new" style={styles.addButtonLink}>
            <button style={styles.primaryButton}>
              <Plus size={18} />
              New Project
            </button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperBlue}>
            <FolderKanban size={18} style={styles.statIconBlue} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.total}</p>
            <p style={styles.statLabel}>Total Projects</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperGreen}>
            <CheckCircle size={18} style={styles.statIconGreen} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.active}</p>
            <p style={styles.statLabel}>Active</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperBlue}>
            <Clock size={18} style={styles.statIconBlue} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.planning}</p>
            <p style={styles.statLabel}>Planning</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperPurple}>
            <CheckCircle size={18} style={styles.statIconPurple} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.completed}</p>
            <p style={styles.statLabel}>Completed</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search projects by name or client..."
            value={searchTerm}
            onChange={handleSearch}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button 
              style={styles.clearSearch}
              onClick={() => setSearchTerm('')}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div style={styles.actionButtons}>
          <button 
            style={styles.filterToggle}
            onClick={() => setShowFilters(!showFilters)}
          >
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
              <LayoutGrid size={16} />
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
          <button 
            style={styles.refreshButton}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={16} style={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none' 
            }} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={styles.filterPanel}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status</label>
              <select
                value={filterStatus}
                onChange={handleStatusFilter}
                style={styles.filterSelect}
              >
                <option value="">All Status</option>
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Type</label>
              <select
                value={filterType}
                onChange={handleTypeFilter}
                style={styles.filterSelect}
              >
                <option value="">All Types</option>
                <option value="SEO">SEO</option>
                <option value="SMM">SMM</option>
                <option value="PPC">PPC</option>
                <option value="Content">Content</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Strategy">Strategy</option>
              </select>
            </div>
            <button 
              style={styles.clearFiltersButton}
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid/List View */}
      {projects.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyContent}>
            <FolderKanban size={64} style={styles.emptyIcon} />
            <h3 style={styles.emptyTitle}>No projects found</h3>
            <p style={styles.emptySubtext}>
              {isEmployee ? 'You are not assigned to any projects yet.' : 'Create your first project to get started'}
            </p>
            {!isEmployee && (
              <Link to="/projects/new" style={styles.emptyButton}>
                <Plus size={16} />
                Create Project
              </Link>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={styles.projectsGrid}>
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      ) : (
        <div style={styles.listWrapper}>
          <div style={styles.listHeader}>
            <span style={styles.listHeaderText}>Project Name</span>
            <span style={styles.listHeaderText}>Client</span>
            <span style={styles.listHeaderText}>Status</span>
            <span style={styles.listHeaderText}>Progress</span>
            <span style={styles.listHeaderText}>Deadline</span>
            <span style={styles.listHeaderText}>Actions</span>
          </div>
          {projects.map((project) => {
            const statusStyle = getStatusStyle(project.status);
            const StatusIcon = statusStyle.icon;
            const statusColor = getStatusColor(project.status);
            
            return (
              <div key={project._id} style={styles.listItem}>
                <div style={styles.listItemContent}>
                  <div style={styles.listItemName}>
                    <Link to={`/projects/${project._id}`} style={styles.listItemLink}>
                      {project.projectName}
                    </Link>
                  </div>
                  <div style={styles.listItemClient}>
                    {project.clientId?.companyName || '—'}
                  </div>
                  <div style={styles.listItemStatus}>
                    <span style={{
                      ...styles.listStatusBadge,
                      backgroundColor: statusStyle.backgroundColor,
                      color: statusStyle.color,
                    }}>
                      <StatusIcon size={10} style={styles.listStatusIcon} />
                      {statusStyle.label}
                    </span>
                  </div>
                  <div style={styles.listItemProgress}>
                    <div style={styles.listProgressBar}>
                      <div style={{
                        ...styles.listProgressFill,
                        width: `${project.completionPercentage || 0}%`,
                        backgroundColor: statusColor
                      }} />
                    </div>
                    <span style={styles.listProgressText}>{project.completionPercentage || 0}%</span>
                  </div>
                  <div style={styles.listItemDeadline}>
                    {project.endDate ? formatDate(project.endDate) : '—'}
                  </div>
                  <div style={styles.listItemActions}>
                    <Link to={`/projects/${project._id}`} style={styles.listActionView} title="View">
                      <Eye size={14} />
                    </Link>
                    {!isEmployee && (
                      <>
                        <Link to={`/projects/${project._id}/edit`} style={styles.listActionEdit} title="Edit">
                          <Edit size={14} />
                        </Link>
                        <button
                          style={styles.listActionDelete}
                          onClick={() => {
                            setSelectedProject(project);
                            setShowDeleteModal(true);
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalContent}>
              <div style={styles.modalIconWrapper}>
                <Trash2 size={40} style={styles.modalIcon} />
              </div>
              <h3 style={styles.modalTitle}>Delete Project?</h3>
              <p style={styles.modalText}>
                Are you sure you want to delete <strong>“{selectedProject?.projectName}”</strong>?
              </p>
              <p style={styles.modalSubtext}>
                This will permanently remove the project and all associated tasks. This action cannot be undone.
              </p>
              <div style={styles.modalActions}>
                <button
                  style={styles.modalCancelButton}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProject(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  style={styles.modalDeleteButton}
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
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
  addButtonLink: {
    textDecoration: 'none',
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
  statIconBlue: { color: '#3B82F6' },
  statIconGreen: { color: '#10B981' },
  statIconPurple: { color: '#8B5CF6' },
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
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '0 14px',
    transition: 'all 0.2s ease',
    minWidth: '200px',
  },
  searchIcon: { color: '#94A3B8', flexShrink: 0 },
  searchInput: {
    flex: 1,
    padding: '10px 12px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: 'transparent',
    color: '#0F172A',
    minWidth: '120px',
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
  actionButtons: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  filterToggle: {
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
  refreshButton: {
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
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
    marginTop: '8px',
  },
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTop: {
    padding: '16px 20px',
    borderBottom: '1px solid #F1F5F9',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  cardIconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: { color: '#3B82F6' },
  cardStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
  },
  cardStatusIcon: { marginRight: '2px' },
  cardTitleLink: { textDecoration: 'none', display: 'block' },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0F172A',
    margin: '0 0 6px 0',
    lineHeight: 1.3,
  },
  cardDescription: {
    fontSize: '14px',
    color: '#64748B',
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: 1.5,
  },
  cardBody: {
    padding: '16px 20px',
    flex: 1,
  },
  cardMeta: {
    display: 'flex',
    gap: '16px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  cardMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#64748B',
  },
  cardMetaIcon: { color: '#94A3B8' },
  cardProgress: { marginBottom: '12px' },
  cardProgressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: '4px',
  },
  cardProgressLabel: { color: '#64748B' },
  cardProgressValue: { fontWeight: '600', color: '#0F172A' },
  cardProgressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: '#E2E8F0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  cardProgressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.6s ease',
  },
  cardFooter: {
    padding: '12px 20px',
    borderTop: '1px solid #F1F5F9',
    display: 'flex',
    gap: '8px',
    backgroundColor: '#F8FAFC',
  },
  cardButtonView: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#EFF6FF',
    color: '#3B82F6',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    flex: 1,
    justifyContent: 'center',
  },
  cardButtonEdit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#FEF3C7',
    color: '#F59E0B',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    flex: 1,
    justifyContent: 'center',
  },
  cardButtonDelete: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#FEF2F2',
    color: '#EF4444',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
    justifyContent: 'center',
  },
  listWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    marginTop: '8px',
  },
  listHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.8fr',
    padding: '12px 16px',
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
    fontWeight: '600',
    fontSize: '12px',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  listHeaderText: { display: 'flex', alignItems: 'center' },
  listItem: { borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.2s ease' },
  listItemContent: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.8fr',
    padding: '12px 16px',
    alignItems: 'center',
    gap: '8px',
  },
  listItemName: { fontWeight: '500' },
  listItemLink: {
    color: '#0F172A',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
  listItemClient: { fontSize: '13px', color: '#64748B' },
  listItemStatus: { display: 'flex', alignItems: 'center' },
  listStatusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  listStatusIcon: { marginRight: '2px' },
  listItemProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  listProgressBar: {
    flex: 1,
    height: '6px',
    backgroundColor: '#E2E8F0',
    borderRadius: '3px',
    overflow: 'hidden',
    minWidth: '40px',
  },
  listProgressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.6s ease',
  },
  listProgressText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0F172A',
    minWidth: '32px',
    textAlign: 'right',
  },
  listItemDeadline: { fontSize: '13px', color: '#64748B' },
  listItemActions: {
    display: 'flex',
    gap: '4px',
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
  listActionDelete: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#FEF2F2',
    color: '#EF4444',
    cursor: 'pointer',
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
    marginTop: '8px',
  },
  emptyContent: {
    textAlign: 'center',
    padding: '48px',
  },
  emptyIcon: { color: '#94A3B8', marginBottom: '16px' },
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
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '32px 24px',
  },
  modalIconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#FEF2F2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIcon: { color: '#EF4444' },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0F172A',
    margin: '0',
  },
  modalText: {
    fontSize: '15px',
    color: '#475569',
    margin: '0',
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: '13px',
    color: '#94A3B8',
    margin: '0',
    textAlign: 'center',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '8px',
    width: '100%',
  },
  modalCancelButton: {
    padding: '8px 20px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modalDeleteButton: {
    padding: '8px 20px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

// Add keyframe animations
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

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
  }

  .filter-toggle:hover:not(:disabled) {
    background-color: #F1F5F9 !important;
  }

  .refresh-button:hover:not(:disabled) {
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

  .modal-cancel-button:hover:not(:disabled) {
    background-color: #E2E8F0 !important;
  }

  .modal-delete-button:hover:not(:disabled) {
    background-color: #DC2626 !important;
  }

  .modal-delete-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .list-item:hover {
    background-color: #F8FAFC !important;
  }

  .list-item-link:hover {
    color: #3B82F6 !important;
  }

  .list-action-view:hover:not(:disabled) {
    background-color: #DBEAFE !important;
  }

  .list-action-edit:hover:not(:disabled) {
    background-color: #FDE68A !important;
  }

  .list-action-delete:hover:not(:disabled) {
    background-color: #FEE2E2 !important;
  }

  .card-wrapper:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08) !important;
  }

  .card-title-link:hover .card-title {
    color: #3B82F6 !important;
  }

  .card-button-view:hover:not(:disabled) {
    background-color: #DBEAFE !important;
  }

  .card-button-edit:hover:not(:disabled) {
    background-color: #FDE68A !important;
  }

  .card-button-delete:hover:not(:disabled) {
    background-color: #FEE2E2 !important;
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
    .action-buttons {
      width: 100% !important;
      justify-content: flex-start !important;
    }
    .filter-toggle {
      flex: 1 !important;
      justify-content: center !important;
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
    .projects-grid {
      grid-template-columns: 1fr !important;
    }
    .list-header {
      display: none !important;
    }
    .list-item-content {
      grid-template-columns: 1fr !important;
      gap: 8px !important;
    }
    .list-item-name {
      font-size: 16px !important;
      font-weight: 600 !important;
    }
    .list-item-progress {
      width: 100% !important;
    }
    .list-item-actions {
      justify-content: flex-start !important;
    }
    .modal-actions {
      flex-direction: column !important;
    }
    .modal-cancel-button,
    .modal-delete-button {
      width: 100% !important;
      justify-content: center !important;
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
    .action-buttons {
      flex-wrap: wrap !important;
    }
    .view-toggle {
      flex: 0 !important;
    }
    .card-footer {
      flex-direction: column !important;
    }
    .card-button-view,
    .card-button-edit,
    .card-button-delete {
      width: 100% !important;
    }
    .list-item-actions {
      flex-wrap: wrap !important;
    }
    .list-action-view,
    .list-action-edit,
    .list-action-delete {
      flex: 1 !important;
      justify-content: center !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Projects;