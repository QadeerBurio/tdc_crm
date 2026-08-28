// pages/crm/Leads.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, ChevronDown, X, Eye, Edit, Trash2,
  Users, UserCheck, UserX, Clock, TrendingUp, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Leads = () => {
  const { token } = useAuth();
  const [leads, setLeads] = useState([]);
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
  const [filterStage, setFilterStage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchLeads();
  }, [currentPage, searchTerm, filterStatus, filterStage]);

  const fetchLeads = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${API_URL}/crm/leads`, {
        params: {
          page: currentPage,
          search: searchTerm,
          status: filterStatus,
          currentStage: filterStage,
          limit: 10
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        setLeads(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      let errorMessage = 'Failed to load leads.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (err.request) {
        errorMessage = 'Cannot connect to server.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStageChange = async (leadId, newStage) => {
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/crm/leads/${leadId}/stage`, 
        { stage: newStage },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Stage updated successfully');
      await fetchLeads(true);
    } catch (err) {
      console.error('Error updating stage:', err);
      toast.error(err.response?.data?.message || 'Failed to update stage.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (lead) => {
    if (!window.confirm(`Are you sure you want to delete "${lead.companyName}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/crm/leads/${lead._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Lead deleted successfully');
      await fetchLeads(true);
    } catch (err) {
      console.error('Error deleting lead:', err);
      toast.error(err.response?.data?.message || 'Failed to delete lead.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      active: { bg: '#D1FAE5', color: '#065F46', icon: UserCheck, label: 'Active' },
      stale: { bg: '#FEF3C7', color: '#92400E', icon: Clock, label: 'Stale' },
      converted: { bg: '#DBEAFE', color: '#1E40AF', icon: TrendingUp, label: 'Converted' },
      lost: { bg: '#FEE2E2', color: '#991B1B', icon: UserX, label: 'Lost' },
    };
    return styles[status] || styles.active;
  };

  const getStageColor = (stage) => {
    const colors = {
      SCRAPED_SOURCED: '#8B5CF6',
      INITIAL_VERIFICATION: '#3B82F6',
      FIRST_SEQUENCE_SENT: '#06B6D4',
      FOLLOW_UP_PROTOCOL: '#F59E0B',
      DISCOVERY_CALL_SCHEDULED: '#8B5CF6',
      PROPOSAL_PITCHED: '#EC4899',
      NEGOTIATING: '#F97316',
      WON: '#10B981',
      LOST: '#EF4444'
    };
    return colors[stage] || '#6B7280';
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterStage('');
    setSearchTerm('');
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Stats
  const stats = {
    total: leads.length,
    active: leads.filter(l => l.status === 'active').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading leads...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Leads</h1>
          <p style={styles.pageSubtitle}>Manage and track your leads through the pipeline</p>
        </div>
        <Link to="/crm/leads/new" style={styles.addButtonLink}>
          <button style={styles.primaryButton}>
            <Plus size={18} />
            Add Lead
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#EFF6FF'}}>
            <Users size={18} color="#3B82F6" />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.total}</p>
            <p style={styles.statLabel}>Total Leads</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#ECFDF5'}}>
            <UserCheck size={18} color="#10B981" />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.active}</p>
            <p style={styles.statLabel}>Active</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#F5F3FF'}}>
            <TrendingUp size={18} color="#8B5CF6" />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.converted}</p>
            <p style={styles.statLabel}>Converted</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#FEF2F2'}}>
            <UserX size={18} color="#EF4444" />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.lost}</p>
            <p style={styles.statLabel}>Lost</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search leads by company, contact, or email..."
            value={searchTerm}
            onChange={handleSearch}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button style={styles.clearSearch} onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
        </div>
        <div style={styles.actionButtons}>
          <button style={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filters
            <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none' }} />
          </button>
          <button style={styles.refreshButton} onClick={() => fetchLeads(true)} disabled={refreshing}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={styles.filterPanel}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status</label>
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} style={styles.filterSelect}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="stale">Stale</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Stage</label>
              <select value={filterStage} onChange={(e) => { setFilterStage(e.target.value); setCurrentPage(1); }} style={styles.filterSelect}>
                <option value="">All Stages</option>
                <option value="SCRAPED_SOURCED">Scraped/Sourced</option>
                <option value="INITIAL_VERIFICATION">Initial Verification</option>
                <option value="FIRST_SEQUENCE_SENT">First Sequence Sent</option>
                <option value="FOLLOW_UP_PROTOCOL">Follow-up Protocol</option>
                <option value="DISCOVERY_CALL_SCHEDULED">Discovery Call Scheduled</option>
                <option value="PROPOSAL_PITCHED">Proposal Pitched</option>
                <option value="NEGOTIATING">Negotiating</option>
                <option value="WON">Won</option>
                <option value="LOST">Lost</option>
              </select>
            </div>
            <button style={styles.clearFiltersButton} onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div style={styles.tableWrapper}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Company</th>
                <th style={styles.tableHeader}>Contact</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Source</th>
                <th style={styles.tableHeader}>Stage</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Created</th>
                <th style={{...styles.tableHeader, textAlign: 'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="8" style={styles.emptyState}>
                    <div style={styles.emptyContent}>
                      <Users size={48} color="#94A3B8" />
                      <p style={styles.emptyText}>No leads found</p>
                      <p style={styles.emptySubtext}>Create your first lead to get started</p>
                      <Link to="/crm/leads/new" style={styles.emptyButton}>
                        <Plus size={16} />
                        Add Lead
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const statusStyle = getStatusStyle(lead.status);
                  const stageColor = getStageColor(lead.currentStage);
                  const StatusIcon = statusStyle.icon;
                  
                  return (
                    <tr key={lead._id} style={styles.tableRow}>
                      <td style={styles.companyCell}>
                        <Link to={`/crm/leads/${lead._id}`} style={styles.companyLink}>
                          <span style={styles.companyName}>{lead.companyName}</span>
                        </Link>
                      </td>
                      <td><span style={styles.contactName}>{lead.contactName}</span></td>
                      <td><span style={styles.emailText}>{lead.email}</span></td>
                      <td><span style={styles.sourceBadge}>{lead.leadSource || 'N/A'}</span></td>
                      <td>
                        <span style={{...styles.stageBadge, backgroundColor: `${stageColor}20`, color: stageColor, borderColor: `${stageColor}40` }}>
                          <span style={{...styles.stageDot, backgroundColor: stageColor}}></span>
                          {lead.currentStage ? lead.currentStage.replace(/_/g, ' ') : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span style={{...styles.statusBadge, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          <StatusIcon size={12} style={styles.statusIcon} />
                          {statusStyle.label}
                        </span>
                      </td>
                      <td><span style={styles.dateText}>{formatDate(lead.createdAt)}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={styles.actionButtonsGroup}>
                          <Link to={`/crm/leads/${lead._id}`} style={styles.actionButtonView} title="View">
                            <Eye size={15} />
                          </Link>
                          <Link to={`/crm/leads/${lead._id}/edit`} style={styles.actionButtonEdit} title="Edit">
                            <Edit size={15} />
                          </Link>
                          <button style={styles.actionButtonDelete} onClick={() => handleDelete(lead)} disabled={actionLoading} title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={styles.paginationWrapper}>
          <div style={styles.paginationContainer}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{...styles.paginationButton, opacity: currentPage === 1 ? 0.5 : 1}}
            >
              Previous
            </button>
            <span style={styles.paginationInfo}>
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              style={{...styles.paginationButton, opacity: currentPage === pagination.totalPages ? 0.5 : 1}}
            >
              Next
            </button>
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
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#64748B',
    marginTop: '4px',
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
    color: '#0F172A',
    margin: 0,
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
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
    minWidth: '200px',
  },
  searchIcon: {
    color: '#94A3B8',
    flexShrink: 0,
  },
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
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
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
    whiteSpace: 'nowrap',
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
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    outline: 'none',
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
    whiteSpace: 'nowrap',
    alignSelf: 'center',
  },
  tableWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
  },
  tableContainer: {
    overflowX: 'auto',
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
    color: '#64748B',
    textTransform: 'uppercase',
    borderBottom: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  tableRow: {
    borderBottom: '1px solid #F1F5F9',
  },
  companyCell: {
    padding: '12px 16px',
  },
  companyLink: {
    textDecoration: 'none',
  },
  companyName: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: '14px',
  },
  contactName: {
    padding: '12px 16px',
    color: '#0F172A',
    fontSize: '14px',
  },
  emailText: {
    padding: '12px 16px',
    color: '#64748B',
    fontSize: '13px',
  },
  sourceBadge: {
    display: 'inline-flex',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#F1F5F9',
    color: '#475569',
  },
  stageBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid',
  },
  stageDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  statusIcon: {
    marginRight: '4px',
  },
  dateText: {
    padding: '12px 16px',
    color: '#64748B',
    fontSize: '13px',
  },
  actionButtonsGroup: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
  },
  actionButtonView: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    backgroundColor: '#EFF6FF',
    color: '#3B82F6',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  actionButtonEdit: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    backgroundColor: '#FEF3C7',
    color: '#F59E0B',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  actionButtonDelete: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#FEF2F2',
    color: '#EF4444',
    cursor: 'pointer',
  },
  paginationWrapper: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'center',
  },
  paginationContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  paginationButton: {
    padding: '8px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#0F172A',
    transition: 'all 0.2s ease',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#64748B',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 16px',
  },
  emptyContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0F172A',
    margin: 0,
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#94A3B8',
    margin: 0,
  },
  emptyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    marginTop: '8px',
  },
};

// Add spin animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .primary-button:hover:not(:disabled) {
    background-color: #2563EB !important;
    transform: translateY(-1px);
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
  
  .table-row:hover {
    background-color: #F8FAFC !important;
  }
  
  .company-link:hover .company-name {
    color: #3B82F6 !important;
  }
  
  .action-button-view:hover:not(:disabled) {
    background-color: #DBEAFE !important;
  }
  
  .action-button-edit:hover:not(:disabled) {
    background-color: #FDE68A !important;
  }
  
  .action-button-delete:hover:not(:disabled) {
    background-color: #FEE2E2 !important;
  }
`;
document.head.appendChild(styleSheet);

export default Leads;