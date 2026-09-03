// pages/crm/Leads.jsx - COMPLETE FIXED VERSION WITH NEW COLOR SCHEME
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, ChevronDown, X, Eye, Edit, Trash2,
  Users, UserCheck, UserX, Clock, TrendingUp, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LeadFormModal from '../../components/crm/LeadForm';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

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

  const handleEditClick = (lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingLead(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingLead(null);
    fetchLeads(true);
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
      active: { bg: '#E8F5E9', color: '#013E37', icon: UserCheck, label: 'Active' },
      stale: { bg: '#FFEFB3', color: '#013E37', icon: Clock, label: 'Stale' },
      converted: { bg: '#E8F5E9', color: '#013E37', icon: TrendingUp, label: 'Converted' },
      lost: { bg: '#FFEBEE', color: '#D32F2F', icon: UserX, label: 'Lost' },
    };
    return styles[status] || styles.active;
  };

  const getStageColor = (stage) => {
    const colors = {
      SCRAPED_SOURCED: '#013E37',
      INITIAL_VERIFICATION: '#0A5C54',
      FIRST_SEQUENCE_SENT: '#1A7A6E',
      FOLLOW_UP_PROTOCOL: '#2A9888',
      DISCOVERY_CALL_SCHEDULED: '#3AB6A2',
      PROPOSAL_PITCHED: '#4AD4BC',
      NEGOTIATING: '#5AF2D6',
      WON: '#013E37',
      LOST: '#D32F2F'
    };
    return colors[stage] || '#013E37';
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
        <button onClick={handleAddClick} style={styles.primaryButton}>
          <Plus size={18} />
          Add Lead
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#E8F5E9'}}>
            <Users size={18} color="#013E37" />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.total}</p>
            <p style={styles.statLabel}>Total Leads</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#E8F5E9'}}>
            <UserCheck size={18} color="#013E37" />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.active}</p>
            <p style={styles.statLabel}>Active</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#FFEFB3'}}>
            <TrendingUp size={18} color="#013E37" />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.converted}</p>
            <p style={styles.statLabel}>Converted</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#FFEBEE'}}>
            <UserX size={18} color="#D32F2F" />
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
                      <Users size={48} color="#013E37" opacity="0.3" />
                      <p style={styles.emptyText}>No leads found</p>
                      <p style={styles.emptySubtext}>Create your first lead to get started</p>
                      <button onClick={handleAddClick} style={styles.emptyButton}>
                        <Plus size={16} />
                        Add Lead
                      </button>
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
                          <button style={styles.actionButtonEdit} onClick={() => handleEditClick(lead)} title="Edit">
                            <Edit size={15} />
                          </button>
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

      {/* Lead Form Modal */}
      <LeadFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        initialData={editingLead}
      />
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
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
    color: '#013E37',
    fontSize: '14px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid #FFEFB3',
    borderTopColor: '#013E37',
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
    color: '#013E37',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#013E37',
    opacity: 0.7,
    marginTop: '4px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  primaryButtonHover: {
    backgroundColor: '#0A5C54',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.2)',
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
    border: '1px solid #FFEFB3',
    transition: 'all 0.3s ease',
  },
  statCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.06)',
    borderColor: '#013E37',
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
    color: '#013E37',
    margin: 0,
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: '13px',
    color: '#013E37',
    opacity: 0.7,
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
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    padding: '0 14px',
    minWidth: '200px',
    transition: 'all 0.3s ease',
  },
  searchBarFocus: {
    borderColor: '#013E37',
    boxShadow: '0 0 0 3px rgba(1, 62, 55, 0.1)',
  },
  searchIcon: {
    color: '#013E37',
    opacity: 0.5,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    padding: '10px 12px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: 'transparent',
    color: '#013E37',
    minWidth: '120px',
  },
  clearSearch: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    background: 'none',
    border: 'none',
    color: '#013E37',
    opacity: 0.5,
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
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#013E37',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease',
  },
  filterToggleHover: {
    borderColor: '#013E37',
    backgroundColor: '#FFEFB3',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    color: '#013E37',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  refreshButtonHover: {
    borderColor: '#013E37',
    backgroundColor: '#FFEFB3',
  },
  filterPanel: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #FFEFB3',
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
    color: '#013E37',
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #FFEFB3',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    color: '#013E37',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  filterSelectFocus: {
    borderColor: '#013E37',
    boxShadow: '0 0 0 3px rgba(1, 62, 55, 0.1)',
  },
  clearFiltersButton: {
    padding: '8px 16px',
    backgroundColor: '#FFEFB3',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#013E37',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    alignSelf: 'center',
    transition: 'all 0.3s ease',
  },
  clearFiltersButtonHover: {
    backgroundColor: '#013E37',
    color: '#FFFFFF',
  },
  tableWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #FFEFB3',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  tableWrapperHover: {
    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.06)',
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
    color: '#013E37',
    textTransform: 'uppercase',
    borderBottom: '2px solid #013E37',
    backgroundColor: '#FFEFB3',
  },
  tableRow: {
    borderBottom: '1px solid #FFEFB3',
    transition: 'background 0.2s ease',
  },
  tableRowHover: {
    backgroundColor: '#FFEFB3',
  },
  companyCell: {
    padding: '12px 16px',
  },
  companyLink: {
    textDecoration: 'none',
  },
  companyName: {
    color: '#013E37',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'color 0.2s ease',
  },
  companyNameHover: {
    color: '#0A5C54',
  },
  contactName: {
    padding: '12px 16px',
    color: '#013E37',
    fontSize: '14px',
  },
  emailText: {
    padding: '12px 16px',
    color: '#013E37',
    opacity: 0.7,
    fontSize: '13px',
  },
  sourceBadge: {
    display: 'inline-flex',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#FFEFB3',
    color: '#013E37',
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
    color: '#013E37',
    opacity: 0.7,
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
    backgroundColor: '#E8F5E9',
    color: '#013E37',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  actionButtonViewHover: {
    backgroundColor: '#013E37',
    color: '#FFFFFF',
  },
  actionButtonEdit: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    backgroundColor: '#FFEFB3',
    color: '#013E37',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
  },
  actionButtonEditHover: {
    backgroundColor: '#013E37',
    color: '#FFFFFF',
  },
  actionButtonDelete: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#FFEBEE',
    color: '#D32F2F',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actionButtonDeleteHover: {
    backgroundColor: '#D32F2F',
    color: '#FFFFFF',
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
    border: '1px solid #FFEFB3',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#013E37',
    transition: 'all 0.3s ease',
  },
  paginationButtonHover: {
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    borderColor: '#013E37',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#013E37',
    opacity: 0.7,
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
    color: '#013E37',
    margin: 0,
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#013E37',
    opacity: 0.5,
    margin: 0,
  },
  emptyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    marginTop: '8px',
    transition: 'all 0.3s ease',
  },
  emptyButtonHover: {
    backgroundColor: '#0A5C54',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.2)',
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
    background-color: #0A5C54 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(1, 62, 55, 0.2);
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(1, 62, 55, 0.06);
    border-color: #013E37;
  }
  
  .table-row:hover {
    background-color: #FFEFB3 !important;
  }
  
  .company-link:hover .company-name {
    color: #0A5C54 !important;
  }
  
  .action-button-view:hover:not(:disabled) {
    background-color: #013E37 !important;
    color: #FFFFFF !important;
  }
  
  .action-button-edit:hover:not(:disabled) {
    background-color: #013E37 !important;
    color: #FFFFFF !important;
  }
  
  .action-button-delete:hover:not(:disabled) {
    background-color: #D32F2F !important;
    color: #FFFFFF !important;
  }
  
  .filter-toggle:hover:not(:disabled) {
    border-color: #013E37 !important;
    background-color: #FFEFB3 !important;
  }
  
  .refresh-button:hover:not(:disabled) {
    border-color: #013E37 !important;
    background-color: #FFEFB3 !important;
  }
  
  .clear-filters-button:hover:not(:disabled) {
    background-color: #013E37 !important;
    color: #FFFFFF !important;
  }
  
  .pagination-button:hover:not(:disabled):not(:disabled) {
    background-color: #013E37 !important;
    color: #FFFFFF !important;
    border-color: #013E37 !important;
  }
  
  .empty-button:hover:not(:disabled) {
    background-color: #0A5C54 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(1, 62, 55, 0.2);
  }
  
  .search-bar:focus-within {
    border-color: #013E37 !important;
    box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1) !important;
  }
  
  .filter-select:focus {
    border-color: #013E37 !important;
    box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1) !important;
  }
  
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr 1fr !important;
    }
  }
  
  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    
    .search-section {
      flex-direction: column !important;
    }
    
    .search-bar {
      width: 100% !important;
    }
    
    .action-buttons {
      width: 100% !important;
      justify-content: stretch !important;
    }
    
    .filter-toggle,
    .refresh-button {
      flex: 1 !important;
      justify-content: center !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Leads;