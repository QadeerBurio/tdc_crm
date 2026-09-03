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
  Clock,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight
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
  const [hoveredRow, setHoveredRow] = useState(null);

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
        backgroundColor: '#013E37',
        color: '#FFFFFF',
        icon: UserCheck,
        label: 'Active',
        dotColor: '#FFFFFF'
      },
      inactive: {
        backgroundColor: '#FFEFB3',
        color: '#013E37',
        icon: UserX,
        label: 'Inactive',
        dotColor: '#013E37'
      },
      customer: {
        backgroundColor: '#013E37',
        color: '#FFFFFF',
        icon: Users,
        label: 'Customer',
        dotColor: '#FFFFFF'
      },
      prospect: {
        backgroundColor: '#FFEFB3',
        color: '#013E37',
        icon: Clock,
        label: 'Prospect',
        dotColor: '#013E37'
      },
    };
    return statusStyles[status] || statusStyles.active;
  };

  const getIndustryColor = (industry) => {
    const colors = {
      'Technology': '#013E37',
      'Healthcare': '#0A5C54',
      'Finance': '#013E37',
      'Education': '#013E37',
      'Retail': '#013E37',
      'Manufacturing': '#013E37',
    };
    return colors[industry] || '#013E37';
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
      <div className="companies-loading">
        <div className="companies-loading-spinner"></div>
        <p className="companies-loading-text">Loading companies...</p>
      </div>
    );
  }

  return (
    <>
      <div className="companies-container">
        {/* Page Header */}
        <div className="companies-header">
          <div>
            <h1 className="companies-title">
              <Building2 className="companies-title-icon" color="#013E37" />
              Companies
            </h1>
            <p className="companies-subtitle">Manage and track your company relationships</p>
          </div>
          <Link to="/crm/companies/new" className="companies-add-link">
            <button className="companies-add-btn">
              <Plus size={18} />
              Add Company
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="companies-stats">
          <div className="companies-stat-card">
            <div className="companies-stat-icon" style={{ backgroundColor: '#FFEFB3' }}>
              <Building2 size={20} color="#013E37" />
            </div>
            <div>
              <p className="companies-stat-number">{stats.total}</p>
              <p className="companies-stat-label">Total Companies</p>
            </div>
          </div>
          <div className="companies-stat-card">
            <div className="companies-stat-icon" style={{ backgroundColor: '#FFEFB3' }}>
              <UserCheck size={20} color="#013E37" />
            </div>
            <div>
              <p className="companies-stat-number">{stats.active}</p>
              <p className="companies-stat-label">Active</p>
            </div>
          </div>
          <div className="companies-stat-card">
            <div className="companies-stat-icon" style={{ backgroundColor: '#FFEFB3' }}>
              <Users size={20} color="#013E37" />
            </div>
            <div>
              <p className="companies-stat-number">{stats.customers}</p>
              <p className="companies-stat-label">Customers</p>
            </div>
          </div>
          <div className="companies-stat-card">
            <div className="companies-stat-icon" style={{ backgroundColor: '#FFEFB3' }}>
              <Clock size={20} color="#013E37" />
            </div>
            <div>
              <p className="companies-stat-number">{stats.prospects}</p>
              <p className="companies-stat-label">Prospects</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="companies-search-section">
          <div className="companies-search-bar">
            <Search size={18} className="companies-search-icon" />
            <input
              type="text"
              placeholder="Search companies by name, industry, or location..."
              value={searchTerm}
              onChange={handleSearch}
              className="companies-search-input"
            />
            {searchTerm && (
              <button 
                className="companies-search-clear"
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="companies-actions">
            <button 
              className="companies-filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={14} className={showFilters ? 'companies-rotate' : ''} />
            </button>
            <button 
              className="companies-refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? 'companies-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="companies-filter-panel">
            <div className="companies-filter-row">
              <div className="companies-filter-group">
                <label className="companies-filter-label">Industry</label>
                <select
                  value={filterIndustry}
                  onChange={handleIndustryFilter}
                  className="companies-filter-select"
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
              <div className="companies-filter-group">
                <label className="companies-filter-label">Status</label>
                <select
                  value={filterStatus}
                  onChange={handleStatusFilter}
                  className="companies-filter-select"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="prospect">Prospect</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <button 
                className="companies-clear-filters"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Companies Table */}
        <div className="companies-table-wrapper">
          <div className="companies-table-container">
            <table className="companies-table">
              <thead>
                <tr>
                  <th className="companies-table-header">Company</th>
                  <th className="companies-table-header">Industry</th>
                  <th className="companies-table-header">Size</th>
                  <th className="companies-table-header">Status</th>
                  <th className="companies-table-header">Contacts</th>
                  <th className="companies-table-header">Created</th>
                  <th className="companies-table-header companies-text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="companies-empty-state">
                      <div className="companies-empty-content">
                        <div className="companies-empty-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
                          <Building2 size={40} color="#013E37" />
                        </div>
                        <p className="companies-empty-text">No companies found</p>
                        <p className="companies-empty-subtext">Add your first company to get started</p>
                        <Link to="/crm/companies/new" className="companies-empty-btn">
                          <Plus size={16} />
                          Add Company
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  companies.map((company, index) => {
                    const statusStyle = getStatusStyle(company.status);
                    const StatusIcon = statusStyle.icon;
                    const industryColor = getIndustryColor(company.industry);
                    const isHovered = hoveredRow === company._id;
                    
                    return (
                      <tr 
                        key={company._id} 
                        className="companies-table-row"
                        style={{ animationDelay: `${index * 0.05}s` }}
                        onMouseEnter={() => setHoveredRow(company._id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td className="companies-company-cell">
                          <div className="companies-company-info">
                            <div className="companies-company-avatar" style={{ backgroundColor: industryColor }}>
                              {company.companyName?.charAt(0) || '?'}
                            </div>
                            <Link
                              to={`/crm/companies/${company._id}`}
                              className="companies-company-link"
                            >
                              <span className="companies-company-name">{company.companyName}</span>
                              {company.website && (
                                <span className="companies-company-website">
                                  <Globe size={12} />
                                  {company.website.replace(/^https?:\/\//, '')}
                                </span>
                              )}
                            </Link>
                          </div>
                        </td>
                        <td>
                          <span className="companies-industry-badge" style={{
                            backgroundColor: `${industryColor}20`,
                            color: industryColor,
                          }}>
                            {company.industry || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="companies-size-text">
                            {company.companySize || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="companies-status-badge" style={{
                            backgroundColor: statusStyle.backgroundColor,
                            color: statusStyle.color,
                          }}>
                            <span className="companies-status-dot" style={{ 
                              backgroundColor: statusStyle.dotColor || statusStyle.color 
                            }}></span>
                            <StatusIcon size={12} className="companies-status-icon" />
                            {statusStyle.label}
                          </span>
                        </td>
                        <td>
                          <span className="companies-contact-count">
                            {company.contacts?.length || 0}
                          </span>
                        </td>
                        <td>
                          <span className="companies-date-text">{formatDate(company.createdAt)}</span>
                        </td>
                        <td className="companies-text-center">
                          <div className="companies-action-group">
                            <Link
                              to={`/crm/companies/${company._id}`}
                              className="companies-action-view"
                              title="View Company"
                            >
                              <Eye size={15} />
                            </Link>
                            <Link
                              to={`/crm/companies/${company._id}/edit`}
                              className="companies-action-edit"
                              title="Edit Company"
                            >
                              <Edit size={15} />
                            </Link>
                            <button
                              className="companies-action-delete"
                              onClick={() => handleDelete(company)}
                              disabled={actionLoading}
                              title="Delete Company"
                            >
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
          <div className="companies-pagination">
            <Pagination
              currentPage={pagination.page || currentPage}
              totalPages={pagination.totalPages || 1}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .companies-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          background: #FFFFFF;
          min-height: 100vh;
        }

        /* ============================================
           LOADING
           ============================================ */
        .companies-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 64vh;
          gap: 16px;
        }

        .companies-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .companies-loading-text {
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .companies-spin {
          animation: spin 1s linear infinite;
        }

        .companies-rotate {
          transform: rotate(180deg);
        }

        /* ============================================
           HEADER
           ============================================ */
        .companies-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeInDown 0.6s ease;
        }

        .companies-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .companies-title-icon {
          width: 28px;
          height: 28px;
          animation: pulse 2s ease-in-out infinite;
        }

        .companies-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin-top: 4px;
        }

        .companies-add-link {
          text-decoration: none;
        }

        .companies-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #013E37;
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.25);
        }

        .companies-add-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        .companies-add-btn:active {
          transform: scale(0.95);
        }

        /* ============================================
           STATS
           ============================================ */
        .companies-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
          animation: fadeInUp 0.8s ease;
        }

        .companies-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #FFFFFF;
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
        }

        .companies-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }

        .companies-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .companies-stat-card:hover .companies-stat-icon {
          transform: scale(1.05);
        }

        .companies-stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          line-height: 1.2;
        }

        .companies-stat-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
          font-weight: 500;
        }

        /* ============================================
           SEARCH & FILTERS
           ============================================ */
        .companies-search-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .companies-search-bar {
          flex: 1;
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          padding: 0 14px;
          transition: all 0.3s ease;
          min-width: 200px;
        }

        .companies-search-bar:focus-within {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .companies-search-icon {
          color: #013E37;
          opacity: 0.5;
          flex-shrink: 0;
        }

        .companies-search-input {
          flex: 1;
          padding: 10px 12px;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
          color: #013E37;
          min-width: 120px;
        }

        .companies-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }

        .companies-search-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          background: none;
          border: none;
          color: #013E37;
          opacity: 0.4;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 4px;
        }

        .companies-search-clear:hover {
          opacity: 0.8;
          transform: scale(1.2);
        }

        .companies-actions {
          display: flex;
          gap: 8px;
        }

        .companies-filter-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .companies-filter-toggle:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .companies-refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .companies-refresh-btn:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }

        /* ============================================
           FILTER PANEL
           ============================================ */
        .companies-filter-panel {
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 16px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .companies-filter-row {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }

        .companies-filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 150px;
        }

        .companies-filter-label {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .companies-filter-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #FFFFFF;
          color: #013E37;
          outline: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .companies-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .companies-clear-filters {
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

        .companies-clear-filters:hover {
          background: #013E37;
          color: #FFFFFF;
        }

        /* ============================================
           TABLE
           ============================================ */
        .companies-table-wrapper {
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .companies-table-wrapper:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }

        .companies-table-container {
          overflow-x: auto;
        }

        .companies-table {
          width: 100%;
          border-collapse: collapse;
        }

        .companies-table-header {
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          text-transform: uppercase;
          border-bottom: 2px solid #013E37;
          background: #FFEFB3;
        }

        .companies-text-center {
          text-align: center;
        }

        .companies-table-row {
          border-bottom: 1px solid #FFEFB3;
          transition: all 0.3s ease;
          animation: slideInRight 0.4s ease forwards;
          opacity: 0;
        }

        .companies-table-row:hover {
          background: #FFEFB3;
        }

        .companies-company-cell {
          padding: 12px 16px;
        }

        .companies-company-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .companies-company-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .companies-table-row:hover .companies-company-avatar {
          transform: scale(1.05);
        }

        .companies-company-link {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .companies-company-name {
          color: #013E37;
          font-weight: 600;
          font-size: 14px;
          transition: color 0.3s ease;
        }

        .companies-company-link:hover .companies-company-name {
          color: #0A5C54;
        }

        .companies-company-website {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #013E37;
          opacity: 0.5;
          font-size: 12px;
        }

        .companies-industry-badge {
          display: inline-flex;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .companies-size-text {
          color: #013E37;
          opacity: 0.7;
          font-size: 13px;
        }

        .companies-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }

        .companies-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s ease-in-out infinite;
        }

        .companies-status-icon {
          margin-right: 2px;
        }

        .companies-contact-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          padding: 2px 8px;
          border-radius: 12px;
          background: #FFEFB3;
          color: #013E37;
          font-size: 13px;
          font-weight: 600;
        }

        .companies-date-text {
          color: #013E37;
          opacity: 0.6;
          font-size: 13px;
        }

        .companies-action-group {
          display: flex;
          gap: 4px;
          justify-content: center;
        }

        .companies-action-view {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          background: #FFEFB3;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .companies-action-view:hover {
          background: #013E37;
          color: #FFFFFF;
          transform: scale(1.1);
        }

        .companies-action-edit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          background: #FFEFB3;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .companies-action-edit:hover {
          background: #013E37;
          color: #FFFFFF;
          transform: scale(1.1);
        }

        .companies-action-delete {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          background: #FFEBEE;
          color: #D32F2F;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .companies-action-delete:hover:not(:disabled) {
          background: #D32F2F;
          color: #FFFFFF;
          transform: scale(1.1);
        }

        .companies-action-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ============================================
           PAGINATION
           ============================================ */
        .companies-pagination {
          margin-top: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .companies-empty-state {
          text-align: center;
          padding: 48px 16px;
        }

        .companies-empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .companies-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px;
          animation: float 3s ease-in-out infinite;
        }

        .companies-empty-text {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .companies-empty-subtext {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }

        .companies-empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #013E37;
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .companies-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
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
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .companies-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .companies-container {
            padding: 16px;
          }

          .companies-header {
            flex-direction: column;
            align-items: stretch;
          }

          .companies-add-btn {
            width: 100%;
            justify-content: center;
          }

          .companies-stats {
            grid-template-columns: 1fr 1fr;
          }

          .companies-search-section {
            flex-direction: column;
          }

          .companies-search-bar {
            width: 100%;
          }

          .companies-actions {
            width: 100%;
          }

          .companies-filter-toggle {
            flex: 1;
            justify-content: center;
          }

          .companies-filter-row {
            flex-direction: column;
            align-items: stretch;
          }

          .companies-filter-group {
            min-width: unset;
          }

          .companies-clear-filters {
            align-self: stretch;
          }

          .companies-action-group {
            flex-wrap: wrap;
            justify-content: center;
          }

          .companies-title {
            font-size: 24px;
          }

          .companies-stat-number {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .companies-container {
            padding: 12px;
          }

          .companies-stats {
            grid-template-columns: 1fr;
          }

          .companies-stat-card {
            padding: 12px 16px;
          }

          .companies-title {
            font-size: 20px;
          }

          .companies-company-info {
            flex-direction: column;
            align-items: flex-start;
          }

          .companies-company-avatar {
            width: 32px;
            height: 32px;
            font-size: 12px;
          }

          .companies-action-group {
            flex-direction: column;
            gap: 4px;
          }

          .companies-action-view,
          .companies-action-edit,
          .companies-action-delete {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default Companies;