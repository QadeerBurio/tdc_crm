// pages/crm/Deals.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, X, Eye, Edit, Trash2, ChevronDown,
  RefreshCw, Briefcase, Clock, AlertCircle, CheckCircle, XCircle,
  FileText, DollarSign, Users, Calendar, TrendingUp, ArrowLeft,
  UserCheck, Building2, Mail, Phone, MapPin, Globe, Send
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
  const [clients, setClients] = useState([]);
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

  // Fetch deals on mount and when filters change
  useEffect(() => {
    fetchDeals();
    fetchLeadsForDropdown();
    fetchClientsForDropdown();
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

  const fetchClientsForDropdown = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients`, {
        params: { limit: 100 },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setClients(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
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

  // Handle create form input changes
  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Auto-calculate probability based on stage
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

    // Auto-populate deal name from lead
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

  // Handle product changes
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

  // Create deal
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

  // View deal details
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
      qualification: { bg: '#EFF6FF', text: '#3B82F6' },
      proposal: { bg: '#FFFBEB', text: '#F59E0B' },
      negotiation: { bg: '#F5F3FF', text: '#8B5CF6' },
      closed_won: { bg: '#D1FAE5', text: '#10B981' },
      closed_lost: { bg: '#FEE2E2', text: '#EF4444' },
    };
    return colors[stage] || { bg: '#F3F4F6', text: '#6B7280' };
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
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        icon: CheckCircle,
        label: 'Won'
      },
      lost: {
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
        icon: XCircle,
        label: 'Lost'
      },
      active: {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
        icon: Clock,
        label: 'Active'
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
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading deals...</p>
      </div>
    );
  }

  // Render View Deal Modal
  if (isViewing && viewingDeal) {
    const statusStyle = getStatusStyle(viewingDeal.status);
    const StatusIcon = statusStyle.icon;
    const stageColors = getStageColor(viewingDeal.stage);
    const StageIcon = getStageIcon(viewingDeal.stage);
    
    return (
      <div style={styles.modalOverlay} onClick={() => { setIsViewing(false); setViewingDeal(null); }}>
        <div style={{...styles.modal, maxWidth: '700px'}} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3 style={styles.modalTitle}>{viewingDeal.dealName}</h3>
            <button style={styles.modalCloseButton} onClick={() => { setIsViewing(false); setViewingDeal(null); }}>
              <X size={20} />
            </button>
          </div>
          <div style={styles.modalBody}>
            <div style={styles.viewDealGrid}>
              <div style={styles.viewDealItem}>
                <label style={styles.viewDealLabel}>Value</label>
                <span style={styles.viewDealValue}>{formatCurrency(viewingDeal.value)}</span>
              </div>
              <div style={styles.viewDealItem}>
                <label style={styles.viewDealLabel}>Stage</label>
                <span style={{...styles.stageBadge, backgroundColor: stageColors.bg, color: stageColors.text}}>
                  <StageIcon size={12} /> {viewingDeal.stage?.replace('_', ' ').toUpperCase() || 'N/A'}
                </span>
              </div>
              <div style={styles.viewDealItem}>
                <label style={styles.viewDealLabel}>Status</label>
                <span style={{...styles.statusBadge, backgroundColor: statusStyle.backgroundColor, color: statusStyle.color}}>
                  <StatusIcon size={12} /> {statusStyle.label}
                </span>
              </div>
              <div style={styles.viewDealItem}>
                <label style={styles.viewDealLabel}>Probability</label>
                <span style={styles.viewDealValue}>{viewingDeal.probability || 0}%</span>
              </div>
            </div>
            
            {viewingDeal.description && (
              <div style={styles.viewDealSection}>
                <label style={styles.viewDealLabel}>Description</label>
                <p style={styles.viewDealText}>{viewingDeal.description}</p>
              </div>
            )}

            <div style={styles.viewDealSection}>
              <label style={styles.viewDealLabel}>Products</label>
              {viewingDeal.products && viewingDeal.products.length > 0 ? (
                <div style={styles.viewProductsList}>
                  {viewingDeal.products.map((p, i) => (
                    <div key={i} style={styles.viewProductItem}>
                      <span>{p.name || 'Product'}</span>
                      <span>{p.quantity} × {formatCurrency(p.price)} = {formatCurrency(p.total)}</span>
                    </div>
                  ))}
                  <div style={styles.viewProductTotal}>
                    <strong>Total:</strong> {formatCurrency(viewingDeal.products.reduce((sum, p) => sum + (p.total || 0), 0))}
                  </div>
                </div>
              ) : (
                <span style={styles.viewDealText}>No products</span>
              )}
            </div>

            <div style={styles.viewDealSection}>
              <label style={styles.viewDealLabel}>Related</label>
              <div style={styles.viewDealRelated}>
                {viewingDeal.leadId && (
                  <span><strong>Lead:</strong> {viewingDeal.leadId.companyName || 'N/A'}</span>
                )}
                {viewingDeal.clientId && (
                  <span><strong>Client:</strong> {viewingDeal.clientId.companyName || 'N/A'}</span>
                )}
                {viewingDeal.expectedCloseDate && (
                  <span><strong>Expected Close:</strong> {formatDate(viewingDeal.expectedCloseDate)}</span>
                )}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button style={styles.modalCancelButton} onClick={() => { setIsViewing(false); setViewingDeal(null); }}>
                Close
              </button>
              {viewingDeal.status !== 'won' && viewingDeal.status !== 'lost' && (
                <button 
                  style={{...styles.modalPrimaryButton, backgroundColor: '#10B981'}}
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
      </div>
    );
  }

  // Render Create Form
  if (isCreating) {
    return (
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <div style={styles.headerLeft}>
            <button style={styles.backButton} onClick={() => setIsCreating(false)}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={styles.pageTitle}>Create New Deal</h1>
              <p style={styles.pageSubtitle}>Add a new deal to track in your pipeline</p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button style={{...styles.secondaryButton}} onClick={() => setIsCreating(false)}>
              Cancel
            </button>
            <button style={{...styles.primaryButton}} onClick={handleCreateDeal} disabled={actionLoading}>
              {actionLoading ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </div>

        <div style={styles.formGrid}>
          <div style={styles.formColumn}>
            <div style={styles.card}>
              <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Basic Information</h3></div>
              <div style={styles.cardContent}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Deal Name *</label>
                  <input type="text" name="dealName" value={formData.dealName} onChange={handleFormChange} style={styles.formInput} placeholder="Enter deal name" required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleFormChange} style={styles.formTextarea} placeholder="Enter deal description" rows={3} />
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Products / Services</h3>
                <button style={styles.smallButton} onClick={addProduct}><Plus size={16} /> Add Product</button>
              </div>
              <div style={styles.cardContent}>
                {formData.products.length === 0 ? (
                  <p style={styles.emptyText}>No products added. Click "Add Product" to add.</p>
                ) : (
                  formData.products.map((product, index) => (
                    <div key={index} style={styles.productRow}>
                      <div style={styles.productField}>
                        <input type="text" value={product.name} onChange={(e) => handleProductChange(index, 'name', e.target.value)} style={styles.productInput} placeholder="Product name" />
                      </div>
                      <div style={styles.productField}>
                        <input type="number" value={product.quantity} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} style={styles.productInputSmall} placeholder="Qty" min="1" />
                      </div>
                      <div style={styles.productField}>
                        <input type="number" value={product.price} onChange={(e) => handleProductChange(index, 'price', e.target.value)} style={styles.productInputSmall} placeholder="Price" min="0" />
                      </div>
                      <div style={styles.productField}>
                        <span style={styles.productTotal}>${(product.total || 0).toFixed(2)}</span>
                      </div>
                      <button style={styles.removeProductButton} onClick={() => removeProduct(index)}><X size={16} /></button>
                    </div>
                  ))
                )}
                {formData.products.length > 0 && (
                  <div style={styles.productTotalRow}>
                    <span style={styles.productTotalLabel}>Total Deal Value:</span>
                    <span style={styles.productTotalValue}>${formData.products.reduce((sum, p) => sum + (p.total || 0), 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={styles.formColumn}>
            <div style={styles.card}>
              <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Pipeline Settings</h3></div>
              <div style={styles.cardContent}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Stage</label>
                  <select name="stage" value={formData.stage} onChange={handleFormChange} style={styles.formSelect}>
                    <option value="qualification">Qualification</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Probability (%)</label>
                  <input type="number" name="probability" value={formData.probability} onChange={handleFormChange} style={styles.formInput} min="0" max="100" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Expected Close Date</label>
                  <input type="date" name="expectedCloseDate" value={formData.expectedCloseDate} onChange={handleFormChange} style={styles.formInput} />
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Associations</h3></div>
              <div style={styles.cardContent}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Related Lead (Optional)</label>
                  <select name="leadId" value={formData.leadId} onChange={handleFormChange} style={styles.formSelect}>
                    <option value="">Select a lead...</option>
                    {leads.map(lead => (
                      <option key={lead._id} value={lead._id}>
                        {lead.companyName} - {lead.contactName}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Related Client (Optional)</label>
                  <select name="clientId" value={formData.clientId} onChange={handleFormChange} style={styles.formSelect}>
                    <option value="">Select a client...</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>
                        {client.companyName} - {client.contactName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main List View
  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Deals</h1>
          <p style={styles.pageSubtitle}>Manage and track your sales deals pipeline</p>
        </div>
        <button style={styles.primaryButton} onClick={() => setIsCreating(true)}>
          <Plus size={18} /> Create Deal
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#EFF6FF'}}><Briefcase size={18} color="#3B82F6" /></div>
          <div>
            <p style={styles.statNumber}>{stats.total}</p>
            <p style={styles.statLabel}>Total Deals</p>
            <p style={styles.statSubtext}>{formatCurrency(stats.totalValue)}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#FFFBEB'}}><Clock size={18} color="#F59E0B" /></div>
          <div>
            <p style={styles.statNumber}>{stats.active}</p>
            <p style={styles.statLabel}>Active</p>
            <p style={styles.statSubtext}>In Progress</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#ECFDF5'}}><CheckCircle size={18} color="#10B981" /></div>
          <div>
            <p style={styles.statNumber}>{stats.won}</p>
            <p style={styles.statLabel}>Won</p>
            <p style={styles.statSubtext}>Closed Deals</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, backgroundColor: '#FEF2F2'}}><XCircle size={18} color="#EF4444" /></div>
          <div>
            <p style={styles.statNumber}>{stats.lost}</p>
            <p style={styles.statLabel}>Lost</p>
            <p style={styles.statSubtext}>Closed Lost</p>
          </div>
        </div>
      </div>

      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <Search size={18} style={styles.searchIcon} />
          <input type="text" placeholder="Search deals by name or company..." value={searchTerm} onChange={handleSearch} style={styles.searchInput} />
          {searchTerm && <button style={styles.clearSearch} onClick={() => setSearchTerm('')}><X size={16} /></button>}
        </div>
        <div style={styles.actionButtons}>
          <button style={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} /> Filters <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none' }} />
          </button>
          <button style={styles.refreshButton} onClick={() => fetchDeals(true)} disabled={refreshing}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div style={styles.filterPanel}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status</label>
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} style={styles.filterSelect}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Stage</label>
              <select value={filterStage} onChange={(e) => { setFilterStage(e.target.value); setCurrentPage(1); }} style={styles.filterSelect}>
                <option value="">All Stages</option>
                <option value="qualification">Qualification</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>
            <button style={styles.clearFiltersButton} onClick={clearFilters}>Clear Filters</button>
          </div>
        </div>
      )}

      <div style={styles.tableWrapper}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Deal Name</th>
                <th style={styles.tableHeader}>Company</th>
                <th style={{...styles.tableHeader, textAlign: 'right'}}>Value</th>
                <th style={styles.tableHeader}>Stage</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Probability</th>
                <th style={styles.tableHeader}>Expected Close</th>
                <th style={{...styles.tableHeader, textAlign: 'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 ? (
                <tr>
                  <td colSpan="8" style={styles.emptyState}>
                    <div style={styles.emptyContent}>
                      <Briefcase size={48} color="#94A3B8" />
                      <p style={styles.emptyText}>No deals found</p>
                      <p style={styles.emptySubtext}>Create your first deal to start tracking</p>
                      <button style={styles.emptyButton} onClick={() => setIsCreating(true)}><Plus size={16} /> Create Deal</button>
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
                    <tr key={deal._id} style={styles.tableRow}>
                      <td style={styles.dealCell}>
                        <span style={styles.dealName}>{deal.dealName}</span>
                      </td>
                      <td>
                        <span style={styles.companyText}>
                          {deal.leadId?.companyName || deal.clientId?.companyName || 'N/A'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={styles.valueText}>{formatCurrency(deal.value)}</span>
                      </td>
                      <td>
                        <span style={{...styles.stageBadge, backgroundColor: stageColors.bg, color: stageColors.text}}>
                          <StageIcon size={12} style={styles.stageIcon} />
                          {deal.stage ? deal.stage.replace('_', ' ').toUpperCase() : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span style={{...styles.statusBadge, backgroundColor: statusStyle.backgroundColor, color: statusStyle.color}}>
                          <StatusIcon size={12} style={styles.statusIcon} /> {statusStyle.label}
                        </span>
                      </td>
                      <td>
                        <div style={styles.probabilityContainer}>
                          <div style={styles.probabilityBar}>
                            <div style={{...styles.probabilityFill, width: `${deal.probability || 0}%`, backgroundColor: (deal.probability || 0) >= 70 ? '#10B981' : (deal.probability || 0) >= 40 ? '#F59E0B' : '#EF4444'}} />
                          </div>
                          <span style={styles.probabilityText}>{deal.probability || 0}%</span>
                        </div>
                      </td>
                      <td>
                        <span style={styles.dateText}>{deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : 'N/A'}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={styles.actionButtonsGroup}>
                          <button style={styles.actionButtonView} onClick={() => viewDeal(deal._id)} title="View">
                            <Eye size={15} />
                          </button>
                          {deal.status !== 'won' && deal.status !== 'lost' && (
                            <button style={styles.actionButtonWon} onClick={() => handleMarkWon(deal._id)} disabled={actionLoading} title="Mark as Won">
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <button style={styles.actionButtonDelete} onClick={() => { setSelectedDeal(deal); setShowDeleteModal(true); }} title="Delete">
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
        <div style={styles.paginationWrapper}>
          <div style={styles.paginationContainer}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{...styles.paginationButton, opacity: currentPage === 1 ? 0.5 : 1}}>Previous</button>
            <span style={styles.paginationInfo}>Page {currentPage} of {pagination.totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages} style={{...styles.paginationButton, opacity: currentPage === pagination.totalPages ? 0.5 : 1}}>Next</button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Delete Deal</h3>
            <div style={styles.modalContent}>
              <div style={styles.modalIconWrapper}><Trash2 size={40} color="#EF4444" /></div>
              <p style={styles.modalText}>Are you sure you want to delete <strong>{selectedDeal?.dealName}</strong>?</p>
              <p style={styles.modalSubtext}>This action cannot be undone. All associated data will be permanently removed.</p>
              <div style={styles.modalActions}>
                <button style={styles.modalCancelButton} onClick={() => { setShowDeleteModal(false); setSelectedDeal(null); }} disabled={deleteLoading}>Cancel</button>
                <button style={styles.modalDeleteButton} onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete Deal'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// STYLES (same as before - keeping compact)
// ============================================
const styles = {
  container: { padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#F8FAFC', minHeight: '100vh' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '64vh', gap: '16px' },
  loadingText: { color: '#64748B', fontSize: '14px', fontWeight: '500' },
  spinner: { width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#3B82F6', animation: 'spin 0.8s linear infinite' },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  backButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', cursor: 'pointer', color: '#475569' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#0F172A', margin: 0, letterSpacing: '-0.5px' },
  pageSubtitle: { fontSize: '15px', color: '#64748B', marginTop: '4px' },
  headerActions: { display: 'flex', gap: '8px' },
  primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' },
  secondaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0' },
  statIconWrapper: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statNumber: { fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0, lineHeight: 1.2 },
  statLabel: { fontSize: '13px', color: '#64748B', margin: 0, fontWeight: '500' },
  statSubtext: { fontSize: '12px', color: '#94A3B8', marginTop: '2px' },
  searchSection: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
  searchBar: { flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0 14px', minWidth: '200px' },
  searchIcon: { color: '#94A3B8', flexShrink: 0 },
  searchInput: { flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: '14px', backgroundColor: 'transparent', color: '#0F172A', minWidth: '120px' },
  clearSearch: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' },
  actionButtons: { display: 'flex', gap: '8px' },
  filterToggle: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' },
  refreshButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', color: '#64748B', cursor: 'pointer' },
  filterPanel: { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px' },
  filterRow: { display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '150px' },
  filterLabel: { fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' },
  filterSelect: { padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#0F172A', outline: 'none', cursor: 'pointer' },
  clearFiltersButton: { padding: '8px 16px', backgroundColor: '#F1F5F9', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap', alignSelf: 'center' },
  tableWrapper: { backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' },
  tableRow: { borderBottom: '1px solid #F1F5F9' },
  dealCell: { padding: '12px 16px' },
  dealName: { color: '#0F172A', fontWeight: '600', fontSize: '14px' },
  companyText: { padding: '12px 16px', color: '#475569', fontSize: '13px' },
  valueText: { padding: '12px 16px', fontWeight: '600', color: '#0F172A', fontSize: '14px' },
  stageBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' },
  stageIcon: { marginRight: '2px' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' },
  statusIcon: { marginRight: '2px' },
  probabilityContainer: { padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' },
  probabilityBar: { flex: 1, height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', minWidth: '40px' },
  probabilityFill: { height: '100%', borderRadius: '3px', transition: 'width 0.6s ease' },
  probabilityText: { fontSize: '12px', fontWeight: '600', color: '#0F172A', minWidth: '36px' },
  dateText: { padding: '12px 16px', color: '#64748B', fontSize: '13px' },
  actionButtonsGroup: { display: 'flex', gap: '4px', justifyContent: 'center' },
  actionButtonView: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px', borderRadius: '6px', border: 'none', backgroundColor: '#EFF6FF', color: '#3B82F6', cursor: 'pointer' },
  actionButtonWon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px', borderRadius: '6px', border: 'none', backgroundColor: '#D1FAE5', color: '#10B981', cursor: 'pointer' },
  actionButtonDelete: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px', borderRadius: '6px', border: 'none', backgroundColor: '#FEF2F2', color: '#EF4444', cursor: 'pointer' },
  paginationWrapper: { marginTop: '16px', display: 'flex', justifyContent: 'center' },
  paginationContainer: { display: 'flex', alignItems: 'center', gap: '16px' },
  paginationButton: { padding: '8px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#0F172A' },
  paginationInfo: { fontSize: '14px', color: '#64748B' },
  emptyState: { textAlign: 'center', padding: '48px 16px' },
  emptyContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  emptyText: { fontSize: '18px', fontWeight: '600', color: '#0F172A', margin: 0 },
  emptySubtext: { fontSize: '14px', color: '#94A3B8', margin: 0 },
  emptyButton: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '8px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  modalTitle: { fontSize: '20px', fontWeight: '600', color: '#0F172A', margin: 0 },
  modalCloseButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' },
  modalBody: { display: 'flex', flexDirection: 'column', gap: '16px' },
  modalContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '8px 0' },
  modalIconWrapper: { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalText: { fontSize: '16px', fontWeight: '500', color: '#0F172A', margin: 0, textAlign: 'center' },
  modalSubtext: { fontSize: '14px', color: '#64748B', margin: 0, textAlign: 'center' },
  modalActions: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '8px', width: '100%' },
  modalCancelButton: { padding: '8px 20px', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  modalDeleteButton: { padding: '8px 20px', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  modalPrimaryButton: { padding: '8px 20px', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  viewDealGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  viewDealItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  viewDealLabel: { fontSize: '12px', fontWeight: '500', color: '#64748B' },
  viewDealValue: { fontSize: '16px', fontWeight: '600', color: '#0F172A' },
  viewDealText: { fontSize: '14px', color: '#475569', margin: 0 },
  viewDealSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
  viewDealRelated: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: '#475569' },
  viewProductsList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  viewProductItem: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F1F5F9', fontSize: '14px' },
  viewProductTotal: { display: 'flex', justifyContent: 'flex-end', padding: '8px 0', fontSize: '16px', fontWeight: '700', color: '#0F172A' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  formColumn: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E5E7EB' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#0F172A', margin: 0 },
  cardContent: { padding: '20px 24px' },
  formGroup: { marginBottom: '16px' },
  formLabel: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
  formInput: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box' },
  formSelect: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box' },
  formTextarea: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
  smallButton: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', fontWeight: '500', color: '#475569', cursor: 'pointer' },
  productRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px' },
  productField: { flex: 1 },
  productInput: { width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  productInputSmall: { width: '70px', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  productTotal: { fontSize: '14px', fontWeight: '600', color: '#0F172A', minWidth: '70px', display: 'inline-block' },
  removeProductButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', backgroundColor: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', borderRadius: '4px' },
  productTotalRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #E5E7EB', marginTop: '8px' },
  productTotalLabel: { fontSize: '14px', fontWeight: '500', color: '#64748B' },
  productTotalValue: { fontSize: '16px', fontWeight: '700', color: '#0F172A' },
  emptyText: { color: '#94A3B8', fontSize: '14px', textAlign: 'center', padding: '16px 0' },
};

// Add global styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .primary-button:hover:not(:disabled) { background-color: #2563EB !important; box-shadow: 0 4px 8px rgba(59, 130, 246, 0.35) !important; transform: translateY(-1px); }
  .secondary-button:hover:not(:disabled) { background-color: #E2E8F0 !important; }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important; }
  .table-row:hover { background-color: #F8FAFC !important; }
  .action-button-view:hover:not(:disabled) { background-color: #DBEAFE !important; }
  .action-button-won:hover:not(:disabled) { background-color: #A7F3D0 !important; }
  .action-button-delete:hover:not(:disabled) { background-color: #FEE2E2 !important; }
  .form-input:focus, .form-select:focus, .form-textarea:focus, .product-input:focus, .product-input-small:focus { border-color: #3B82F6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important; }
  .back-button:hover { background-color: #F1F5F9 !important; }
  .small-button:hover { background-color: #E2E8F0 !important; }
  .remove-product-button:hover { background-color: #FEE2E2 !important; }
  @media (max-width: 1024px) { .form-grid { grid-template-columns: 1fr !important; } }
  @media (max-width: 768px) { .container { padding: 16px !important; } .page-header { flex-direction: column !important; align-items: stretch !important; } .primary-button { width: 100% !important; justify-content: center !important; } .stats-grid { grid-template-columns: 1fr 1fr !important; } .search-section { flex-direction: column !important; } .search-bar { width: 100% !important; } .action-buttons { width: 100% !important; } .filter-toggle { flex: 1 !important; justify-content: center !important; } .filter-row { flex-direction: column !important; align-items: stretch !important; } .filter-group { min-width: unset !important; } .clear-filters-button { align-self: stretch !important; } .action-buttons-group { flex-wrap: wrap !important; justify-content: center !important; } .product-row { flex-wrap: wrap !important; } .product-field { min-width: 80px !important; } .header-left { flex-direction: column !important; align-items: flex-start !important; } .header-actions { width: 100% !important; flex-direction: column !important; } .header-actions button { width: 100% !important; justify-content: center !important; } }
  @media (max-width: 480px) { .container { padding: 12px !important; } .stats-grid { grid-template-columns: 1fr !important; } .stat-card { padding: 12px 16px !important; } .stat-number { font-size: 18px !important; } .page-title { font-size: 22px !important; } .action-buttons-group { flex-direction: column !important; gap: 4px !important; } .action-button-view, .action-button-won, .action-button-delete { width: 100% !important; justify-content: center !important; } .modal-actions { flex-direction: column !important; } .modal-cancel-button, .modal-delete-button, .modal-primary-button { width: 100% !important; justify-content: center !important; } .form-grid { gap: 16px !important; } .card-header { flex-direction: column !important; gap: 8px !important; align-items: stretch !important; } .view-deal-grid { grid-template-columns: 1fr !important; } }
`;
document.head.appendChild(styleSheet);

export default Deals;