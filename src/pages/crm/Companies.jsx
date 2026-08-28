// pages/crm/Companies.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Building2, 
  Users, 
  Globe, 
  MapPin, 
  Filter,
  X,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  RefreshCw,
  Briefcase,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card, { CardContent } from '../../components/common/Card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeadCell, 
  TableRow 
} from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Input from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import axios from 'axios';
import toast from 'react-hot-toast';

const Companies = () => {
  const { token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // API base URL
  const API_URL =  'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, searchTerm, filterIndustry, filterStatus]);

  const fetchCompanies = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${API_URL}/crm/companies`, {
        params: {
          page: currentPage,
          search: searchTerm,
          industry: filterIndustry,
          status: filterStatus,
          limit: 10
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setCompanies(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      let errorMessage = 'Failed to load companies.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view companies.';
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

  const handleDelete = async (company) => {
    if (!window.confirm(`Are you sure you want to delete "${company.companyName}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/crm/companies/${company._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Company deleted successfully');
      await fetchCompanies(true);
    } catch (err) {
      console.error('Error deleting company:', err);
      let errorMessage = 'Failed to delete company.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to delete this company.';
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    const statusStyles = {
      active: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        icon: UserCheck,
        label: 'Active'
      },
      inactive: {
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
        icon: UserX,
        label: 'Inactive'
      },
      customer: {
        backgroundColor: '#DBEAFE',
        color: '#1E40AF',
        icon: Users,
        label: 'Customer'
      },
      prospect: {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
        icon: Clock,
        label: 'Prospect'
      },
    };
    return statusStyles[status] || statusStyles.active;
  };

  const getIndustryColor = (industry) => {
    const colors = {
      'Technology': '#3B82F6',
      'Healthcare': '#10B981',
      'Finance': '#8B5CF6',
      'Education': '#F59E0B',
      'Retail': '#EC4899',
      'Manufacturing': '#EF4444',
    };
    return colors[industry] || '#6B7280';
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleIndustryFilter = (e) => {
    setFilterIndustry(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterIndustry('');
    setFilterStatus('');
    setSearchTerm('');
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handleRefresh = () => {
    fetchCompanies(true);
  };

  // Stats
  const stats = {
    total: companies.length,
    active: companies.filter(c => c.status === 'active').length,
    customers: companies.filter(c => c.status === 'customer').length,
    prospects: companies.filter(c => c.status === 'prospect').length,
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading companies...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Companies</h1>
          <p style={styles.pageSubtitle}>Manage and track your company relationships</p>
        </div>
        <Link to="/crm/companies/new" style={styles.addButtonLink}>
          <button style={styles.primaryButton}>
            <Plus size={18} />
            Add Company
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperBlue}>
            <Building2 size={18} style={styles.statIconBlue} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.total}</p>
            <p style={styles.statLabel}>Total Companies</p>
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
            <Users size={18} style={styles.statIconPurple} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.customers}</p>
            <p style={styles.statLabel}>Customers</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperYellow}>
            <Clock size={18} style={styles.statIconYellow} />
          </div>
          <div>
            <p style={styles.statNumber}>{stats.prospects}</p>
            <p style={styles.statLabel}>Prospects</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search companies by name, industry, or location..."
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
              <label style={styles.filterLabel}>Industry</label>
              <select
                value={filterIndustry}
                onChange={handleIndustryFilter}
                style={styles.filterSelect}
              >
                <option value="">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status</label>
              <select
                value={filterStatus}
                onChange={handleStatusFilter}
                style={styles.filterSelect}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
                <option value="customer">Customer</option>
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

      {/* Companies Table */}
      <div style={styles.tableWrapper}>
        <div style={styles.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Company</TableHeadCell>
                <TableHeadCell>Industry</TableHeadCell>
                <TableHeadCell>Size</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Contacts</TableHeadCell>
                <TableHeadCell>Created</TableHeadCell>
                <TableHeadCell style={{ textAlign: 'center' }}>Actions</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="7" style={styles.emptyState}>
                    <div style={styles.emptyContent}>
                      <Building2 size={48} style={styles.emptyIcon} />
                      <p style={styles.emptyText}>No companies found</p>
                      <p style={styles.emptySubtext}>Add your first company to get started</p>
                      <Link to="/crm/companies/new" style={styles.emptyButton}>
                        <Plus size={16} />
                        Add Company
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => {
                  const statusStyle = getStatusStyle(company.status);
                  const StatusIcon = statusStyle.icon;
                  const industryColor = getIndustryColor(company.industry);
                  
                  return (
                    <TableRow key={company._id} style={styles.tableRow}>
                      <TableCell style={styles.companyCell}>
                        <div style={styles.companyInfo}>
                          <div style={{
                            ...styles.companyAvatar,
                            backgroundColor: industryColor
                          }}>
                            {company.companyName?.charAt(0) || '?'}
                          </div>
                          <Link
                            to={`/crm/companies/${company._id}`}
                            style={styles.companyLink}
                          >
                            <span style={styles.companyName}>{company.companyName}</span>
                            {company.website && (
                              <span style={styles.companyWebsite}>
                                <Globe size={12} />
                                {company.website.replace(/^https?:\/\//, '')}
                              </span>
                            )}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span style={{
                          ...styles.industryBadge,
                          backgroundColor: `${industryColor}20`,
                          color: industryColor,
                        }}>
                          {company.industry || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={styles.sizeText}>
                          {company.companySize || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: statusStyle.backgroundColor,
                          color: statusStyle.color,
                        }}>
                          <StatusIcon size={12} style={styles.statusIcon} />
                          {statusStyle.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={styles.contactCount}>
                          {company.contacts?.length || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={styles.dateText}>{formatDate(company.createdAt)}</span>
                      </TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        <div style={styles.actionButtonsGroup}>
                          <Link
                            to={`/crm/companies/${company._id}`}
                            style={styles.actionButtonView}
                            title="View Company"
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            to={`/crm/companies/${company._id}/edit`}
                            style={styles.actionButtonEdit}
                            title="Edit Company"
                          >
                            <Edit size={15} />
                          </Link>
                          <button
                            style={styles.actionButtonDelete}
                            onClick={() => handleDelete(company)}
                            disabled={actionLoading}
                            title="Delete Company"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={styles.paginationWrapper}>
          <Pagination
            currentPage={pagination.page || currentPage}
            totalPages={pagination.totalPages || 1}
            onPageChange={setCurrentPage}
          />
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
    borderRadius: '4px',
    transition: 'all 0.2s ease',
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
    transition: 'all 0.2s ease',
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
  tableWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  tableRow: {
    transition: 'background-color 0.2s ease',
  },
  companyCell: {
    padding: '12px 16px',
  },
  companyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  companyAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '16px',
    flexShrink: 0,
  },
  companyLink: {
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  companyName: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: '14px',
  },
  companyWebsite: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#94A3B8',
    fontSize: '12px',
  },
  industryBadge: {
    display: 'inline-flex',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  sizeText: {
    color: '#475569',
    fontSize: '13px',
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
    marginRight: '2px',
  },
  contactCount: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '500',
  },
  dateText: {
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
    border: 'none',
    backgroundColor: '#EFF6FF',
    color: '#3B82F6',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  },
  actionButtonEdit: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#FEF3C7',
    color: '#F59E0B',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
    transition: 'all 0.2s ease',
  },
  paginationWrapper: {
    marginTop: '16px',
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
  emptyIcon: {
    color: '#94A3B8',
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
    transition: 'all 0.2s ease',
    marginTop: '8px',
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

  .clear-search:hover {
    background-color: #F1F5F9 !important;
  }

  .empty-button:hover {
    background-color: #2563EB !important;
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
    }

    .filter-toggle {
      flex: 1 !important;
      justify-content: center !important;
    }

    .refresh-button {
      flex: 0 !important;
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

    .action-buttons-group {
      flex-wrap: wrap !important;
      justify-content: center !important;
    }

    .company-info {
      flex-direction: column !important;
      align-items: flex-start !important;
    }

    .company-avatar {
      width: 32px !important;
      height: 32px !important;
      font-size: 12px !important;
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

    .action-buttons-group {
      flex-direction: column !important;
      gap: 4px !important;
    }

    .action-button-view,
    .action-button-edit,
    .action-button-delete {
      width: 100% !important;
      justify-content: center !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Companies;