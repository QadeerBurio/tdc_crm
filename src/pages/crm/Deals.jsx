// pages/crm/Deals.jsx - WITHOUT CLIENTS API
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, X, Eye, Edit, Trash2, ChevronDown,
  RefreshCw, Briefcase, Clock, AlertCircle, CheckCircle, XCircle,
  FileText, DollarSign, Users, Calendar, TrendingUp, ArrowLeft,
  UserCheck, Building2, Mail, Phone, MapPin, Globe, Send,
  Award, Target, Zap, Save, Package, Tag, Calendar as CalendarIcon,
  User, Building, Percent, Activity
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Deals = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [leads, setLeads] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [viewingDeal, setViewingDeal] = useState(null);
  const [formData, setFormData] = useState({
    dealName: '',
    description: '',
    value: 0,
    stage: 'qualification',
    probability: 20,
    expectedCloseDate: '',
    leadId: '',
    clientId: '',
    assignedTo: '',
    products: []
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchDeals();
    fetchLeadsForDropdown();
  }, [currentPage, searchTerm, filterStatus, filterStage]);

  const fetchDeals = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${API_URL}/crm/deals`, {
        params: {
          page: currentPage,
          search: searchTerm,
          status: filterStatus,
          stage: filterStage,
          limit: 10
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        setDeals(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
      toast.error(err.response?.data?.message || 'Failed to load deals.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLeadsForDropdown = async () => {
    try {
      const response = await axios.get(`${API_URL}/crm/leads`, {
        params: { limit: 100 },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setLeads(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedDeal) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_URL}/crm/deals/${selectedDeal._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Deal deleted successfully');
      setShowDeleteModal(false);
      setSelectedDeal(null);
      await fetchDeals(true);
    } catch (err) {
      console.error('Error deleting deal:', err);
      toast.error(err.response?.data?.message || 'Failed to delete deal.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMarkWon = async (dealId) => {
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/crm/deals/${dealId}/won`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Deal marked as Won! 🎉');
      await fetchDeals(true);
    } catch (err) {
      console.error('Error marking deal as won:', err);
      toast.error(err.response?.data?.message || 'Failed to mark deal as won.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    if (name === 'stage') {
      const stageProbability = {
        'qualification': 20,
        'proposal': 40,
        'negotiation': 60,
        'closed_won': 100,
        'closed_lost': 0
      };
      setFormData(prev => ({
        ...prev,
        probability: stageProbability[value] || 20
      }));
    }

    if (name === 'leadId' && value) {
      const selectedLead = leads.find(l => l._id === value);
      if (selectedLead && !formData.dealName) {
        setFormData(prev => ({
          ...prev,
          dealName: `Deal - ${selectedLead.companyName}`
        }));
      }
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: field === 'price' || field === 'quantity' ? parseFloat(value) || 0 : value
    };
    updatedProducts[index].total = (updatedProducts[index].quantity || 0) * (updatedProducts[index].price || 0);
    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }));
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        { name: '', quantity: 1, price: 0, total: 0 }
      ]
    }));
  };

  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const totalValue = formData.products.reduce((sum, p) => sum + (p.total || 0), 0);
      
      const payload = {
        ...formData,
        value: totalValue > 0 ? totalValue : formData.value
      };

      const response = await axios.post(`${API_URL}/crm/deals`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        toast.success('Deal created successfully!');
        setFormData({
          dealName: '',
          description: '',
          value: 0,
          stage: 'qualification',
          probability: 20,
          expectedCloseDate: '',
          leadId: '',
          clientId: '',
          assignedTo: '',
          products: []
        });
        setIsCreating(false);
        await fetchDeals(true);
      }
    } catch (err) {
      console.error('Error creating deal:', err);
      toast.error(err.response?.data?.message || 'Failed to create deal.');
    } finally {
      setActionLoading(false);
    }
  };

  const viewDeal = async (dealId) => {
    try {
      setActionLoading(true);
      const response = await axios.get(`${API_URL}/crm/deals/${dealId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setViewingDeal(response.data.data);
        setIsViewing(true);
      }
    } catch (err) {
      console.error('Error fetching deal:', err);
      toast.error('Failed to load deal details');
    } finally {
      setActionLoading(false);
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      qualification: { bg: '#FFEFB3', text: '#013E37', icon: AlertCircle },
      proposal: { bg: '#FFEFB3', text: '#013E37', icon: FileText },
      negotiation: { bg: '#FFEFB3', text: '#013E37', icon: Users },
      closed_won: { bg: '#E8F5E9', text: '#013E37', icon: CheckCircle },
      closed_lost: { bg: '#FFEBEE', text: '#D32F2F', icon: XCircle },
    };
    return colors[stage] || { bg: '#FFEFB3', text: '#013E37', icon: Briefcase };
  };

  const getStageIcon = (stage) => {
    const icons = {
      qualification: AlertCircle,
      proposal: FileText,
      negotiation: Users,
      closed_won: CheckCircle,
      closed_lost: XCircle,
    };
    return icons[stage] || Briefcase;
  };

  const getStatusStyle = (status) => {
    const statusStyles = {
      won: {
        backgroundColor: '#013E37',
        color: '#FFFFFF',
        icon: CheckCircle,
        label: 'Won',
        emoji: '🏆'
      },
      lost: {
        backgroundColor: '#FFEBEE',
        color: '#D32F2F',
        icon: XCircle,
        label: 'Lost',
        emoji: '❌'
      },
      active: {
        backgroundColor: '#FFEFB3',
        color: '#013E37',
        icon: Clock,
        label: 'Active',
        emoji: '🔄'
      },
    };
    return statusStyles[status] || statusStyles.active;
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    total: deals.length,
    active: deals.filter(d => d.status === 'active').length,
    won: deals.filter(d => d.status === 'won').length,
    lost: deals.filter(d => d.status === 'lost').length,
    totalValue: deals.reduce((sum, d) => sum + (d.value || 0), 0),
  };

  if (loading) {
    return (
      <div className="deals-loading">
        <div className="deals-spinner"></div>
        <p className="deals-loading-text">Loading deals...</p>
      </div>
    );
  }

  // ============================================
  // VIEW DEAL MODAL - COMPACT & MODERN
  // ============================================
  if (isViewing && viewingDeal) {
    const statusStyle = getStatusStyle(viewingDeal.status);
    const StatusIcon = statusStyle.icon;
    const stageData = getStageColor(viewingDeal.stage);
    const StageIcon = stageData.icon || Briefcase;
    
    const totalProductsValue = viewingDeal.products?.reduce((sum, p) => sum + (p.total || 0), 0) || 0;
    const displayValue = totalProductsValue > 0 ? totalProductsValue : viewingDeal.value;
    
    return (
      <div className="deals-modal-overlay" onClick={() => { setIsViewing(false); setViewingDeal(null); }}>
        <div className="deals-view-modal" onClick={e => e.stopPropagation()}>
          {/* Header - Same style as Create Deal Modal */}
          <div className="deals-view-header">
            <div>
              <h3 className="deals-view-title">{viewingDeal.dealName}</h3>
              <p className="deals-view-subtitle">
                {viewingDeal.leadId?.companyName || viewingDeal.clientId?.companyName || 'No Company'}
              </p>
            </div>
            <button className="deals-view-close" onClick={() => { setIsViewing(false); setViewingDeal(null); }}>
              <X size={20} />
            </button>
          </div>

          <div className="deals-view-body">
            {/* Stats Grid - Compact Cards */}
            <div className="deals-view-stats-grid">
              <div className="deals-view-stat-card">
                <div className="deals-view-stat-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
                  <DollarSign size={16} color="#013E37" />
                </div>
                <div>
                  <span className="deals-view-stat-label">Value</span>
                  <span className="deals-view-stat-value">{formatCurrency(displayValue)}</span>
                </div>
              </div>
              
              <div className="deals-view-stat-card">
                <div className="deals-view-stat-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
                  <Target size={16} color="#013E37" />
                </div>
                <div>
                  <span className="deals-view-stat-label">Stage</span>
                  <span className="deals-view-stage-badge" style={{ backgroundColor: stageData.bg, color: stageData.text }}>
                    <StageIcon size={12} /> 
                    {viewingDeal.stage?.replace('_', ' ').toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="deals-view-stat-card">
                <div className="deals-view-stat-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
                  <Percent size={16} color="#013E37" />
                </div>
                <div>
                  <span className="deals-view-stat-label">Probability</span>
                  <div className="deals-view-probability">
                    <div className="deals-view-probability-bar">
                      <div className="deals-view-probability-fill" style={{ 
                        width: `${viewingDeal.probability || 0}%`,
                        backgroundColor: (viewingDeal.probability || 0) >= 70 ? '#013E37' : (viewingDeal.probability || 0) >= 40 ? '#FFD580' : '#D32F2F'
                      }} />
                    </div>
                    <span className="deals-view-probability-text">{viewingDeal.probability || 0}%</span>
                  </div>
                </div>
              </div>
              
              <div className="deals-view-stat-card">
                <div className="deals-view-stat-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
                  <CalendarIcon size={16} color="#013E37" />
                </div>
                <div>
                  <span className="deals-view-stat-label">Expected Close</span>
                  <span className="deals-view-stat-value">
                    {viewingDeal.expectedCloseDate ? formatDate(viewingDeal.expectedCloseDate) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Badge Row */}
            <div className="deals-view-status-row">
              <span className="deals-view-status-badge" style={{ 
                backgroundColor: statusStyle.backgroundColor,
                color: statusStyle.color
              }}>
                <StatusIcon size={14} /> {statusStyle.label}
              </span>
            </div>

            {/* Description */}
            {viewingDeal.description && (
              <div className="deals-view-description">
                <FileText size={14} color="#013E37" />
                <p>{viewingDeal.description}</p>
              </div>
            )}

            {/* Products & Related - Compact Grid */}
            <div className="deals-view-grid">
              {/* Products */}
              <div className="deals-view-card">
                <div className="deals-view-card-header">
                  <Package size={14} color="#013E37" />
                  <h4>Products</h4>
                  {viewingDeal.products && viewingDeal.products.length > 0 && (
                    <span className="deals-view-badge">{viewingDeal.products.length}</span>
                  )}
                </div>
                <div className="deals-view-card-body">
                  {viewingDeal.products && viewingDeal.products.length > 0 ? (
                    <>
                      {viewingDeal.products.map((p, i) => (
                        <div key={i} className="deals-view-product">
                          <span className="deals-view-product-name">{p.name || 'Product'}</span>
                          <span className="deals-view-product-details">
                            {p.quantity} × {formatCurrency(p.price)}
                          </span>
                          <span className="deals-view-product-total">{formatCurrency(p.total)}</span>
                        </div>
                      ))}
                      <div className="deals-view-total-row">
                        <span>Total</span>
                        <span className="deals-view-total-value">{formatCurrency(totalProductsValue)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="deals-view-empty">
                      <Package size={20} color="#013E37" opacity="0.3" />
                      <span>No products</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Related */}
              <div className="deals-view-card">
                <div className="deals-view-card-header">
                  <Users size={14} color="#013E37" />
                  <h4>Related</h4>
                </div>
                <div className="deals-view-card-body">
                  {viewingDeal.leadId && (
                    <div className="deals-view-related-item">
                      <span className="deals-view-related-label">Lead</span>
                      <span className="deals-view-related-value">
                        <Building size={14} />
                        {viewingDeal.leadId.companyName || 'N/A'}
                      </span>
                    </div>
                  )}
                  {viewingDeal.clientId && (
                    <div className="deals-view-related-item">
                      <span className="deals-view-related-label">Client</span>
                      <span className="deals-view-related-value">
                        <Building size={14} />
                        {viewingDeal.clientId.companyName || 'N/A'}
                      </span>
                    </div>
                  )}
                  {viewingDeal.assignedTo && (
                    <div className="deals-view-related-item">
                      <span className="deals-view-related-label">Assigned To</span>
                      <span className="deals-view-related-value">
                        <User size={14} />
                        {viewingDeal.assignedTo.firstName} {viewingDeal.assignedTo.lastName}
                      </span>
                    </div>
                  )}
                  {viewingDeal.expectedCloseDate && (
                    <div className="deals-view-related-item">
                      <span className="deals-view-related-label">Close Date</span>
                      <span className="deals-view-related-value">
                        <CalendarIcon size={14} />
                        {formatDate(viewingDeal.expectedCloseDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions - Same as Create Deal */}
          <div className="deals-view-actions">
            <button className="deals-view-btn deals-view-btn-cancel" onClick={() => { setIsViewing(false); setViewingDeal(null); }}>
              Close
            </button>
            {viewingDeal.status !== 'won' && viewingDeal.status !== 'lost' && (
              <button 
                className="deals-view-btn deals-view-btn-primary"
                onClick={() => {
                  handleMarkWon(viewingDeal._id);
                  setIsViewing(false);
                  setViewingDeal(null);
                }}
              >
                <CheckCircle size={16} /> Mark as Won
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN LIST VIEW
  // ============================================
  return (
    <div className="deals-container">
      <div className="deals-header">
        <div>
          <h1 className="deals-title">Deals</h1>
          <p className="deals-subtitle">Manage and track your sales deals pipeline</p>
        </div>
        <button className="deals-btn deals-btn-primary" onClick={() => setIsCreating(true)}>
          <Plus size={18} /> Create Deal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="deals-stats">
        <div className="deals-stat-card">
          <div className="deals-stat-icon" style={{ backgroundColor: '#FFEFB3' }}>
            <Briefcase size={18} color="#013E37" />
          </div>
          <div>
            <p className="deals-stat-number">{stats.total}</p>
            <p className="deals-stat-label">Total Deals</p>
            <p className="deals-stat-subtext">{formatCurrency(stats.totalValue)}</p>
          </div>
        </div>
        <div className="deals-stat-card">
          <div className="deals-stat-icon" style={{ backgroundColor: '#FFEFB3' }}>
            <Clock size={18} color="#013E37" />
          </div>
          <div>
            <p className="deals-stat-number">{stats.active}</p>
            <p className="deals-stat-label">Active</p>
            <p className="deals-stat-subtext">In Progress</p>
          </div>
        </div>
        <div className="deals-stat-card">
          <div className="deals-stat-icon" style={{ backgroundColor: '#E8F5E9' }}>
            <CheckCircle size={18} color="#013E37" />
          </div>
          <div>
            <p className="deals-stat-number">{stats.won}</p>
            <p className="deals-stat-label">Won</p>
            <p className="deals-stat-subtext">Closed Deals</p>
          </div>
        </div>
        <div className="deals-stat-card">
          <div className="deals-stat-icon" style={{ backgroundColor: '#FFEBEE' }}>
            <XCircle size={18} color="#D32F2F" />
          </div>
          <div>
            <p className="deals-stat-number">{stats.lost}</p>
            <p className="deals-stat-label">Lost</p>
            <p className="deals-stat-subtext">Closed Lost</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="deals-search-section">
        <div className="deals-search-bar">
          <Search size={18} className="deals-search-icon" />
          <input type="text" placeholder="Search deals by name or company..." value={searchTerm} onChange={handleSearch} className="deals-search-input" />
          {searchTerm && <button className="deals-clear-search" onClick={() => setSearchTerm('')}><X size={16} /></button>}
        </div>
        <div className="deals-action-buttons">
          <button className="deals-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} /> Filters <ChevronDown size={14} className={showFilters ? 'deals-rotate' : ''} />
          </button>
          <button className="deals-refresh-btn" onClick={() => fetchDeals(true)} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'deals-spin' : ''} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="deals-filter-panel">
          <div className="deals-filter-row">
            <div className="deals-filter-group">
              <label className="deals-filter-label">Status</label>
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="deals-filter-select">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="deals-filter-group">
              <label className="deals-filter-label">Stage</label>
              <select value={filterStage} onChange={(e) => { setFilterStage(e.target.value); setCurrentPage(1); }} className="deals-filter-select">
                <option value="">All Stages</option>
                <option value="qualification">Qualification</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>
            <button className="deals-clear-filters" onClick={clearFilters}>Clear Filters</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="deals-table-wrapper">
        <div className="deals-table-container">
          <table className="deals-table">
            <thead>
              <tr>
                <th className="deals-table-header">Deal Name</th>
                <th className="deals-table-header">Company</th>
                <th className="deals-table-header deals-text-right">Value</th>
                <th className="deals-table-header">Stage</th>
                <th className="deals-table-header">Status</th>
                <th className="deals-table-header">Probability</th>
                <th className="deals-table-header">Expected Close</th>
                <th className="deals-table-header deals-text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="deals-empty-state">
                    <div className="deals-empty-content">
                      <Briefcase size={48} color="#013E37" opacity="0.3" />
                      <p className="deals-empty-text">No deals found</p>
                      <p className="deals-empty-subtext">Create your first deal to start tracking</p>
                      <button className="deals-empty-btn" onClick={() => setIsCreating(true)}><Plus size={16} /> Create Deal</button>
                    </div>
                  </td>
                </tr>
              ) : (
                deals.map((deal) => {
                  const statusStyle = getStatusStyle(deal.status);
                  const StatusIcon = statusStyle.icon;
                  const stageColors = getStageColor(deal.stage);
                  const StageIcon = getStageIcon(deal.stage);
                  
                  return (
                    <tr key={deal._id} className="deals-table-row">
                      <td className="deals-deal-cell">
                        <span className="deals-deal-name">{deal.dealName}</span>
                      </td>
                      <td>
                        <span className="deals-company-text">
                          {deal.leadId?.companyName || deal.clientId?.companyName || 'N/A'}
                        </span>
                      </td>
                      <td className="deals-text-right">
                        <span className="deals-value-text">{formatCurrency(deal.value)}</span>
                      </td>
                      <td>
                        <span className="deals-stage-badge" style={{ backgroundColor: stageColors.bg, color: stageColors.text }}>
                          <StageIcon size={12} className="deals-stage-icon" />
                          {deal.stage ? deal.stage.replace('_', ' ').toUpperCase() : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="deals-status-badge" style={{ backgroundColor: statusStyle.backgroundColor, color: statusStyle.color }}>
                          <StatusIcon size={12} className="deals-status-icon" /> {statusStyle.label}
                        </span>
                      </td>
                      <td>
                        <div className="deals-probability">
                          <div className="deals-probability-bar">
                            <div className="deals-probability-fill" style={{ width: `${deal.probability || 0}%`, backgroundColor: (deal.probability || 0) >= 70 ? '#013E37' : (deal.probability || 0) >= 40 ? '#FFD580' : '#D32F2F' }} />
                          </div>
                          <span className="deals-probability-text">{deal.probability || 0}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="deals-date-text">{deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : 'N/A'}</span>
                      </td>
                      <td className="deals-text-center">
                        <div className="deals-action-group">
                          <button className="deals-action-view" onClick={() => viewDeal(deal._id)} title="View">
                            <Eye size={15} />
                          </button>
                          {deal.status !== 'won' && deal.status !== 'lost' && (
                            <button className="deals-action-won" onClick={() => handleMarkWon(deal._id)} disabled={actionLoading} title="Mark as Won">
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <button className="deals-action-delete" onClick={() => { setSelectedDeal(deal); setShowDeleteModal(true); }} title="Delete">
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

      {pagination.totalPages > 1 && (
        <div className="deals-pagination">
          <div className="deals-pagination-container">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="deals-pagination-btn" style={{ opacity: currentPage === 1 ? 0.5 : 1 }}>Previous</button>
            <span className="deals-pagination-info">Page {currentPage} of {pagination.totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages} className="deals-pagination-btn" style={{ opacity: currentPage === pagination.totalPages ? 0.5 : 1 }}>Next</button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="deals-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="deals-modal" onClick={e => e.stopPropagation()}>
            <div className="deals-modal-icon-wrapper">
              <Trash2 size={40} color="#D32F2F" />
            </div>
            <h3 className="deals-modal-title">Delete Deal</h3>
            <p className="deals-modal-text">Are you sure you want to delete <strong>{selectedDeal?.dealName}</strong>?</p>
            <p className="deals-modal-subtext">This action cannot be undone. All associated data will be permanently removed.</p>
            <div className="deals-modal-actions">
              <button className="deals-modal-btn deals-modal-btn-cancel" onClick={() => { setShowDeleteModal(false); setSelectedDeal(null); }} disabled={deleteLoading}>Cancel</button>
              <button className="deals-modal-btn deals-modal-btn-danger" onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete Deal'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Deal Modal */}
      {isCreating && (
        <div className="deals-modal-overlay" onClick={() => setIsCreating(false)}>
          <div className="deals-modal deals-modal-create" onClick={e => e.stopPropagation()}>
            <div className="deals-modal-header">
              <div>
                <h3 className="deals-modal-title">Create New Deal</h3>
                <p className="deals-modal-subtitle">Add a new deal to track in your pipeline</p>
              </div>
              <button className="deals-modal-close" onClick={() => setIsCreating(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="deals-modal-form">
              <div className="deals-modal-form-grid">
                {/* Left Column */}
                <div className="deals-modal-form-col">
                  {/* Basic Information */}
                  <div className="deals-modal-card">
                    <div className="deals-modal-card-header">
                      <h4 className="deals-modal-card-title">
                        <FileText size={14} /> Basic Information
                      </h4>
                    </div>
                    <div className="deals-modal-card-body">
                      <div className="deals-form-group">
                        <label className="deals-form-label">Deal Name</label>
                        <input 
                          type="text" 
                          name="dealName" 
                          value={formData.dealName} 
                          onChange={handleFormChange} 
                          className="deals-form-input" 
                          placeholder="Enter deal name" 
                          required 
                        />
                      </div>
                      <div className="deals-form-group">
                        <label className="deals-form-label">Description</label>
                        <textarea 
                          name="description" 
                          value={formData.description} 
                          onChange={handleFormChange} 
                          className="deals-form-textarea" 
                          placeholder="Enter deal description" 
                          rows={2} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="deals-modal-card">
                    <div className="deals-modal-card-header">
                      <h4 className="deals-modal-card-title">
                        <Package size={14} /> Products
                      </h4>
                      <button type="button" className="deals-small-btn" onClick={addProduct}>
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    <div className="deals-modal-card-body">
                      {formData.products.length === 0 ? (
                        <div className="deals-empty-products">
                          <Package size={24} color="#013E37" opacity="0.3" />
                          <p>No products added.</p>
                          <span>Click "Add" to add items.</span>
                        </div>
                      ) : (
                        <>
                          {formData.products.map((product, index) => (
                            <div key={index} className="deals-product-row">
                              <div className="deals-product-field">
                                <input 
                                  type="text" 
                                  value={product.name} 
                                  onChange={(e) => handleProductChange(index, 'name', e.target.value)} 
                                  className="deals-product-input" 
                                  placeholder="Product name" 
                                />
                              </div>
                              <div className="deals-product-field deals-product-field-sm">
                                <input 
                                  type="number" 
                                  value={product.quantity} 
                                  onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} 
                                  className="deals-product-input-sm" 
                                  placeholder="Qty" 
                                  min="1" 
                                />
                              </div>
                              <div className="deals-product-field deals-product-field-sm">
                                <input 
                                  type="number" 
                                  value={product.price} 
                                  onChange={(e) => handleProductChange(index, 'price', e.target.value)} 
                                  className="deals-product-input-sm" 
                                  placeholder="Price" 
                                  min="0" 
                                />
                              </div>
                              <div className="deals-product-field deals-product-field-total">
                                <span className="deals-product-total">${(product.total || 0).toFixed(0)}</span>
                              </div>
                              <button type="button" className="deals-remove-product" onClick={() => removeProduct(index)}>
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          <div className="deals-product-total-row">
                            <span className="deals-product-total-label">Total:</span>
                            <span className="deals-product-total-value">
                              ${formData.products.reduce((sum, p) => sum + (p.total || 0), 0).toFixed(0)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="deals-modal-form-col">
                  {/* Pipeline Settings */}
                  <div className="deals-modal-card">
                    <div className="deals-modal-card-header">
                      <h4 className="deals-modal-card-title">
                        <Target size={14} /> Pipeline
                      </h4>
                    </div>
                    <div className="deals-modal-card-body">
                      <div className="deals-form-group">
                        <label className="deals-form-label">Stage</label>
                        <select name="stage" value={formData.stage} onChange={handleFormChange} className="deals-form-select">
                          <option value="qualification">Qualification</option>
                          <option value="proposal">Proposal</option>
                          <option value="negotiation">Negotiation</option>
                          <option value="closed_won">Closed Won</option>
                          <option value="closed_lost">Closed Lost</option>
                        </select>
                      </div>
                      <div className="deals-form-group">
                        <label className="deals-form-label">Probability</label>
                        <input 
                          type="number" 
                          name="probability" 
                          value={formData.probability} 
                          onChange={handleFormChange} 
                          className="deals-form-input" 
                          min="0" 
                          max="100" 
                        />
                      </div>
                      <div className="deals-form-group">
                        <label className="deals-form-label">Expected Close</label>
                        <input 
                          type="date" 
                          name="expectedCloseDate" 
                          value={formData.expectedCloseDate} 
                          onChange={handleFormChange} 
                          className="deals-form-input" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Associations */}
                  <div className="deals-modal-card">
                    <div className="deals-modal-card-header">
                      <h4 className="deals-modal-card-title">
                        <Users size={14} /> Associations
                      </h4>
                    </div>
                    <div className="deals-modal-card-body">
                      <div className="deals-form-group">
                        <label className="deals-form-label">Related Lead</label>
                        <select name="leadId" value={formData.leadId} onChange={handleFormChange} className="deals-form-select">
                          <option value="">Select a lead...</option>
                          {leads.map(lead => (
                            <option key={lead._id} value={lead._id}>
                              {lead.companyName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="deals-form-group" style={{ display: 'none' }}>
                        <label className="deals-form-label">Client ID</label>
                        <input 
                          type="text" 
                          name="clientId" 
                          value={formData.clientId} 
                          onChange={handleFormChange} 
                          className="deals-form-input" 
                          placeholder="Enter client ID (optional)" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="deals-modal-actions">
                <button type="button" className="deals-modal-btn deals-modal-btn-cancel" onClick={() => setIsCreating(false)} disabled={actionLoading}>
                  Cancel
                </button>
                <button type="submit" className="deals-modal-btn deals-modal-btn-primary" disabled={actionLoading}>
                  <Save size={16} />
                  {actionLoading ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .deals-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #FFFFFF;
          min-height: 100vh;
        }

        /* ============================================
           LOADING
           ============================================ */
        .deals-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
          background: #FFFFFF;
        }
        .deals-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: dealsSpin 0.8s linear infinite;
        }
        @keyframes dealsSpin {
          to { transform: rotate(360deg); }
        }
        .deals-loading-text {
          color: #013E37;
          font-size: 14px;
          font-weight: 500;
        }
        .deals-spin {
          animation: dealsSpin 1s linear infinite;
        }
        .deals-rotate {
          transform: rotate(180deg);
        }

        /* ============================================
           HEADER
           ============================================ */
        .deals-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .deals-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .deals-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.7;
          margin-top: 4px;
        }

        .deals-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .deals-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .deals-btn-primary {
          background: #013E37;
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.3);
        }
        .deals-btn-primary:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.3);
        }
        .deals-small-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #FFEFB3;
          border: 1px solid #FFEFB3;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .deals-small-btn:hover {
          background: #013E37;
          color: #FFFFFF;
          border-color: #013E37;
        }

        /* ============================================
           STATS
           ============================================ */
        .deals-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .deals-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #FFFFFF;
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
        }
        .deals-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }
        .deals-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .deals-stat-number {
          font-size: 22px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          line-height: 1.2;
        }
        .deals-stat-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.7;
          margin: 0;
          font-weight: 500;
        }
        .deals-stat-subtext {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
          margin-top: 2px;
        }

        /* ============================================
           SEARCH
           ============================================ */
        .deals-search-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .deals-search-bar {
          flex: 1;
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          padding: 0 14px;
          min-width: 200px;
          transition: all 0.3s ease;
        }
        .deals-search-bar:focus-within {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .deals-search-icon {
          color: #013E37;
          opacity: 0.5;
          flex-shrink: 0;
        }
        .deals-search-input {
          flex: 1;
          padding: 10px 12px;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
          color: #013E37;
          min-width: 120px;
        }
        .deals-clear-search {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          background: none;
          border: none;
          color: #013E37;
          opacity: 0.5;
          cursor: pointer;
        }
        .deals-action-buttons {
          display: flex;
          gap: 8px;
        }
        .deals-filter-toggle {
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
          white-space: nowrap;
          transition: all 0.3s ease;
        }
        .deals-filter-toggle:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .deals-refresh-btn {
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
        .deals-refresh-btn:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .deals-filter-panel {
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 16px;
          animation: dealsSlideDown 0.3s ease;
        }
        @keyframes dealsSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .deals-filter-row {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }
        .deals-filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 150px;
        }
        .deals-filter-label {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.7;
          text-transform: uppercase;
        }
        .deals-filter-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #FFFFFF;
          color: #013E37;
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .deals-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .deals-clear-filters {
          padding: 8px 16px;
          background: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
          cursor: pointer;
          white-space: nowrap;
          align-self: center;
          transition: all 0.3s ease;
        }
        .deals-clear-filters:hover {
          background: #013E37;
          color: #FFFFFF;
        }

        /* ============================================
           TABLE
           ============================================ */
        .deals-table-wrapper {
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .deals-table-wrapper:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }
        .deals-table-container {
          overflow-x: auto;
        }
        .deals-table {
          width: 100%;
          border-collapse: collapse;
        }
        .deals-table-header {
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          text-transform: uppercase;
          border-bottom: 2px solid #013E37;
          background: #FFEFB3;
        }
        .deals-text-right { text-align: right; }
        .deals-text-center { text-align: center; }
        .deals-table-row {
          border-bottom: 1px solid #FFEFB3;
          transition: background 0.2s ease;
        }
        .deals-table-row:hover {
          background: #FFEFB3;
        }
        .deals-deal-cell { padding: 12px 16px; }
        .deals-deal-name {
          color: #013E37;
          font-weight: 600;
          font-size: 14px;
        }
        .deals-company-text {
          padding: 12px 16px;
          color: #013E37;
          opacity: 0.7;
          font-size: 13px;
        }
        .deals-value-text {
          padding: 12px 16px;
          font-weight: 600;
          color: #013E37;
          font-size: 14px;
        }
        .deals-stage-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .deals-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .deals-probability {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .deals-probability-bar {
          flex: 1;
          height: 6px;
          background: #FFEFB3;
          border-radius: 3px;
          overflow: hidden;
          min-width: 40px;
        }
        .deals-probability-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s ease;
        }
        .deals-probability-text {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          min-width: 36px;
        }
        .deals-date-text {
          padding: 12px 16px;
          color: #013E37;
          opacity: 0.7;
          font-size: 13px;
        }
        .deals-action-group {
          display: flex;
          gap: 4px;
          justify-content: center;
        }
        .deals-action-view {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          background: #FFEFB3;
          color: #013E37;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .deals-action-view:hover:not(:disabled) {
          background: #013E37;
          color: #FFFFFF;
        }
        .deals-action-won {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          background: #FFEFB3;
          color: #013E37;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .deals-action-won:hover:not(:disabled) {
          background: #013E37;
          color: #FFFFFF;
        }
        .deals-action-delete {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          background: #FFEBEE;
          color: #D32F2F;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .deals-action-delete:hover:not(:disabled) {
          background: #D32F2F;
          color: #FFFFFF;
        }

        .deals-pagination {
          margin-top: 16px;
          display: flex;
          justify-content: center;
        }
        .deals-pagination-container {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .deals-pagination-btn {
          padding: 8px 16px;
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #013E37;
          transition: all 0.3s ease;
        }
        .deals-pagination-btn:hover:not(:disabled) {
          background: #013E37;
          color: #FFFFFF;
          border-color: #013E37;
        }
        .deals-pagination-info {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
        }

        .deals-empty-state {
          text-align: center;
          padding: 48px 16px;
        }
        .deals-empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .deals-empty-text {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .deals-empty-subtext {
          font-size: 14px;
          color: #013E37;
          opacity: 0.5;
          margin: 0;
        }
        .deals-empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: #013E37;
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.3s ease;
        }
        .deals-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.2);
        }

        /* ============================================
           MODAL OVERLAY
           ============================================ */
        .deals-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(1, 62, 55, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: dealsFadeIn 0.3s ease;
        }
        @keyframes dealsFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ============================================
           MODAL - COMPACT SIZE
           ============================================ */
        .deals-modal {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #FFEFB3;
          box-shadow: 0 20px 60px rgba(1, 62, 55, 0.2);
          animation: dealsModalIn 0.3s ease;
          max-width: 500px;
          width: 100%;
        }
        .deals-modal-lg {
          max-width: 700px;
          width: 100%;
        }
        .deals-modal-create {
          max-width: 780px;
          width: 100%;
          padding: 0;
          overflow: hidden;
        }
        @keyframes dealsModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ============================================
           MODAL HEADER - COMPACT
           ============================================ */
        .deals-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
        }
        .deals-modal-header .deals-modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }
        .deals-modal-header .deals-modal-subtitle {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }
        .deals-modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #013E37;
          opacity: 0.5;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .deals-modal-close:hover {
          background: rgba(1, 62, 55, 0.1);
          opacity: 1;
        }

        /* ============================================
           VIEW DEAL MODAL - COMPACT & MODERN
           ============================================ */
        .deals-view-modal {
          max-width: 580px;
          width: 100%;
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #FFEFB3;
          box-shadow: 0 20px 60px rgba(1, 62, 55, 0.25);
          animation: dealsModalIn 0.3s ease;
          overflow: hidden;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        /* View Modal Header - Same as Create Deal */
        .deals-view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
          flex-shrink: 0;
        }
        .deals-view-title {
          font-size: 18px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }
        .deals-view-subtitle {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }
        .deals-view-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #013E37;
          opacity: 0.5;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .deals-view-close:hover {
          background: rgba(1, 62, 55, 0.1);
          opacity: 1;
        }

        /* View Modal Body */
        .deals-view-body {
          padding: 20px 24px;
          overflow-y: auto;
          flex: 1;
        }

        /* Stats Grid - 4 Compact Cards */
        .deals-view-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .deals-view-stat-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .deals-view-stat-card:hover {
          border-color: #013E37;
        }
        .deals-view-stat-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .deals-view-stat-label {
          font-size: 10px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.5;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          display: block;
        }
        .deals-view-stat-value {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
          display: block;
        }
        .deals-view-stage-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        .deals-view-probability {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
        }
        .deals-view-probability-bar {
          flex: 1;
          height: 4px;
          background: #FFEFB3;
          border-radius: 2px;
          overflow: hidden;
          min-width: 30px;
        }
        .deals-view-probability-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.6s ease;
        }
        .deals-view-probability-text {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          min-width: 28px;
        }

        /* Status Row */
        .deals-view-status-row {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }
        .deals-view-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }

        /* Description */
        .deals-view-description {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: #F8FAFC;
          border-radius: 8px;
          border-left: 3px solid #FFEFB3;
          margin-bottom: 12px;
        }
        .deals-view-description p {
          margin: 0;
          font-size: 13px;
          color: #013E37;
          line-height: 1.5;
          flex: 1;
        }

        /* Grid for Products & Related */
        .deals-view-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .deals-view-card {
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          overflow: hidden;
        }
        .deals-view-card:hover {
          border-color: #013E37;
        }
        .deals-view-card-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #F8FAFC;
          border-bottom: 1px solid #FFEFB3;
        }
        .deals-view-card-header h4 {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
          flex: 1;
        }
        .deals-view-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: #FFEFB3;
          color: #013E37;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }
        .deals-view-card-body {
          padding: 8px 12px;
          max-height: 150px;
          overflow-y: auto;
        }

        /* Products */
        .deals-view-product {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 0;
          border-bottom: 1px solid #FFEFB3;
          font-size: 12px;
        }
        .deals-view-product:last-child {
          border-bottom: none;
        }
        .deals-view-product-name {
          flex: 1;
          font-weight: 500;
          color: #013E37;
        }
        .deals-view-product-details {
          color: #013E37;
          opacity: 0.6;
        }
        .deals-view-product-total {
          font-weight: 600;
          color: #013E37;
        }
        .deals-view-total-row {
          display: flex;
          justify-content: space-between;
          padding-top: 6px;
          margin-top: 6px;
          border-top: 2px solid #013E37;
          font-size: 13px;
          font-weight: 600;
          color: #013E37;
        }
        .deals-view-total-value {
          color: #013E37;
        }
        .deals-view-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          color: #013E37;
          opacity: 0.4;
          font-size: 12px;
        }
        .deals-view-empty span {
          margin-top: 4px;
        }

        /* Related */
        .deals-view-related-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          border-bottom: 1px solid #FFEFB3;
          font-size: 12px;
        }
        .deals-view-related-item:last-child {
          border-bottom: none;
        }
        .deals-view-related-label {
          font-weight: 600;
          color: #013E37;
          opacity: 0.5;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .deals-view-related-value {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
          color: #013E37;
          font-size: 12px;
        }
        .deals-view-related-value svg {
          opacity: 0.5;
        }

        /* View Modal Footer - Same as Create Deal */
        .deals-view-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 24px 16px 24px;
          border-top: 1px solid #FFEFB3;
          background: #F8FAFC;
          flex-shrink: 0;
          border-radius: 0 0 16px 16px;
        }
        .deals-view-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .deals-view-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .deals-view-btn-cancel {
          background: transparent;
          color: #013E37;
          border: 1px solid #FFEFB3;
        }
        .deals-view-btn-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .deals-view-btn-primary {
          background: #013E37;
          color: #FFFFFF;
        }
        .deals-view-btn-primary:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.3);
        }

        /* ============================================
           MODAL FORM - COMPACT
           ============================================ */
        .deals-modal-form {
          padding: 20px 24px;
        }
        .deals-modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .deals-modal-form-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ============================================
           MODAL CARD - COMPACT
           ============================================ */
        .deals-modal-card {
          background: #FFFFFF;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          overflow: hidden;
        }
        .deals-modal-card:hover {
          border-color: #013E37;
        }
        .deals-modal-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #F8FAFC;
          border-bottom: 1px solid #FFEFB3;
        }
        .deals-modal-card-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .deals-modal-card-body {
          padding: 12px;
        }

        /* ============================================
           FORM ELEMENTS - COMPACT
           ============================================ */
        .deals-form-group {
          margin-bottom: 10px;
        }
        .deals-form-group:last-child {
          margin-bottom: 0;
        }
        .deals-form-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #013E37;
          opacity: 0.7;
          margin-bottom: 3px;
        }
        .deals-form-input,
        .deals-form-select,
        .deals-form-textarea {
          width: 100%;
          padding: 6px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 6px;
          font-size: 13px;
          color: #013E37;
          background: #FFFFFF;
          outline: none;
          transition: all 0.3s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .deals-form-input:focus,
        .deals-form-select:focus,
        .deals-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .deals-form-textarea {
          resize: vertical;
          min-height: 50px;
        }

        /* ============================================
           PRODUCTS - COMPACT
           ============================================ */
        .deals-empty-products {
          text-align: center;
          padding: 16px;
          color: #013E37;
          opacity: 0.5;
        }
        .deals-empty-products p {
          margin: 4px 0 0 0;
          font-weight: 500;
          font-size: 13px;
        }
        .deals-empty-products span {
          font-size: 12px;
        }
        .deals-product-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
          padding: 6px;
          background: #F8FAFC;
          border-radius: 6px;
          border: 1px solid #FFEFB3;
        }
        .deals-product-field {
          flex: 1;
        }
        .deals-product-field-sm {
          flex: 0.5;
          min-width: 50px;
        }
        .deals-product-field-total {
          flex: 0.4;
          min-width: 50px;
        }
        .deals-product-input {
          width: 100%;
          padding: 4px 8px;
          border: 1px solid #FFEFB3;
          border-radius: 4px;
          font-size: 12px;
          outline: none;
          box-sizing: border-box;
          color: #013E37;
          background: #FFFFFF;
          transition: all 0.3s ease;
        }
        .deals-product-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .deals-product-input-sm {
          width: 100%;
          padding: 4px 8px;
          border: 1px solid #FFEFB3;
          border-radius: 4px;
          font-size: 12px;
          outline: none;
          box-sizing: border-box;
          color: #013E37;
          background: #FFFFFF;
          transition: all 0.3s ease;
        }
        .deals-product-input-sm:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .deals-product-total {
          font-size: 13px;
          font-weight: 600;
          color: #013E37;
          display: inline-block;
        }
        .deals-remove-product {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          background: transparent;
          border: none;
          color: #D32F2F;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .deals-remove-product:hover {
          background: #FFEBEE;
        }
        .deals-product-total-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0 0 0;
          border-top: 1px solid #FFEFB3;
          margin-top: 6px;
        }
        .deals-product-total-label {
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
          opacity: 0.7;
        }
        .deals-product-total-value {
          font-size: 14px;
          font-weight: 700;
          color: #013E37;
        }

        /* ============================================
           MODAL ACTIONS - COMPACT
           ============================================ */
        .deals-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 24px 16px 24px;
          border-top: 1px solid #FFEFB3;
          background: #F8FAFC;
        }
        .deals-modal-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .deals-modal-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .deals-modal-btn-cancel {
          background: transparent;
          color: #013E37;
          border: 1px solid #FFEFB3;
        }
        .deals-modal-btn-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .deals-modal-btn-primary {
          background: #013E37;
          color: #FFFFFF;
        }
        .deals-modal-btn-primary:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.3);
        }
        .deals-modal-btn-danger {
          background: #D32F2F;
          color: #FFFFFF;
        }
        .deals-modal-btn-danger:hover:not(:disabled) {
          background: #B71C1C;
        }
        .deals-modal-btn-success {
          background: #013E37;
          color: #FFFFFF;
        }
        .deals-modal-btn-success:hover:not(:disabled) {
          background: #0A5C54;
        }
        .deals-modal-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #FFEBEE;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }
        .deals-modal-text {
          font-size: 16px;
          font-weight: 500;
          color: #013E37;
          margin: 0;
        }
        .deals-modal-subtext {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
          margin: 0;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .deals-modal-form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .deals-container { padding: 16px; }
          .deals-header {
            flex-direction: column;
            align-items: stretch;
          }
          .deals-header .deals-btn {
            width: 100%;
            justify-content: center;
          }
          .deals-title { font-size: 22px; }
          .deals-stats { grid-template-columns: 1fr 1fr; }
          .deals-search-section { flex-direction: column; }
          .deals-search-bar { width: 100%; }
          .deals-action-buttons { width: 100%; }
          .deals-filter-toggle { flex: 1; justify-content: center; }
          .deals-filter-row { flex-direction: column; align-items: stretch; }
          .deals-filter-group { min-width: unset; }
          .deals-clear-filters { align-self: stretch; }
          .deals-action-group { flex-wrap: wrap; justify-content: center; }
          .deals-modal-create { max-width: 95%; }
          .deals-modal-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .deals-modal-form { padding: 16px; }
          .deals-modal-form-grid { grid-template-columns: 1fr; gap: 12px; }
          .deals-modal-actions {
            flex-direction: column;
            padding: 12px 16px;
          }
          .deals-modal-btn { width: 100%; justify-content: center; }
          .deals-product-row { flex-wrap: wrap; }
          .deals-product-field-sm { flex: 1; min-width: 50px; }
          
          /* View Modal Responsive */
          .deals-view-modal {
            max-width: 95%;
            max-height: 95vh;
          }
          .deals-view-header {
            padding: 14px 18px;
          }
          .deals-view-title {
            font-size: 16px;
          }
          .deals-view-body {
            padding: 16px 18px;
          }
          .deals-view-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
          .deals-view-stat-card {
            padding: 8px 10px;
          }
          .deals-view-stat-value {
            font-size: 13px;
          }
          .deals-view-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .deals-view-actions {
            flex-direction: column;
            padding: 10px 18px 14px;
          }
          .deals-view-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .deals-container { padding: 12px; }
          .deals-stats { grid-template-columns: 1fr; }
          .deals-stat-card { padding: 12px 16px; }
          .deals-stat-number { font-size: 18px; }
          .deals-title { font-size: 20px; }
          .deals-action-group { flex-direction: column; gap: 4px; }
          .deals-action-view,
          .deals-action-won,
          .deals-action-delete { width: 100%; justify-content: center; }
          .deals-modal { padding: 16px; }
          .deals-modal-header { padding: 12px 16px; }
          .deals-modal-header .deals-modal-title { font-size: 16px; }
          .deals-modal-form { padding: 12px; }
          .deals-modal-actions { padding: 12px; }
          .deals-product-row { flex-direction: column; align-items: stretch; }
          .deals-product-field-sm { width: 100%; }
          .deals-pagination-container { flex-wrap: wrap; justify-content: center; }
          
          /* View Modal Mobile */
          .deals-view-header {
            padding: 12px 14px;
          }
          .deals-view-title {
            font-size: 15px;
          }
          .deals-view-subtitle {
            font-size: 12px;
          }
          .deals-view-body {
            padding: 12px 14px;
          }
          .deals-view-stats-grid {
            grid-template-columns: 1fr;
          }
          .deals-view-stat-card {
            padding: 8px 10px;
          }
          .deals-view-actions {
            padding: 10px 14px 12px;
          }
          .deals-view-btn {
            font-size: 13px;
            padding: 8px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default Deals;