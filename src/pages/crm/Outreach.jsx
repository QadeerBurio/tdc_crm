// pages/crm/Outreach.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Send, Mail, Linkedin, Phone, CheckCircle, Clock, 
  XCircle, Filter, Search, ArrowLeft, X, Eye, Edit, Trash2,
  Users, UserCheck, Calendar, TrendingUp, RefreshCw, Save,
  MessageCircle, Zap, Target
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Outreach = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [outreach, setOutreach] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [viewingOutreach, setViewingOutreach] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [formData, setFormData] = useState({
    leadId: '',
    channel: 'email',
    subject: '',
    body: '',
    sequenceId: '',
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchOutreach();
    fetchLeadsForDropdown();
    fetchSequencesForDropdown();
  }, [currentPage, filterStatus, filterChannel, searchTerm]);

  const fetchOutreach = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/crm/outreach`, {
        params: {
          page: currentPage,
          status: filterStatus,
          channel: filterChannel,
          search: searchTerm,
          limit: 10
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setOutreach(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching outreach:', err);
      toast.error(err.response?.data?.message || 'Failed to load outreach activities.');
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

  const fetchSequencesForDropdown = async () => {
    try {
      const response = await axios.get(`${API_URL}/crm/outreach/sequences`, {
        params: { limit: 100, status: 'active' },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setSequences(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching sequences:', err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'leadId' && value) {
      const selectedLead = leads.find(l => l._id === value);
      if (selectedLead && !formData.subject) {
        setFormData(prev => ({
          ...prev,
          subject: `Outreach - ${selectedLead.companyName}`
        }));
      }
    }
  };

  const handleCreateOutreach = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const response = await axios.post(`${API_URL}/crm/outreach`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        toast.success('Outreach created successfully!');
        setFormData({
          leadId: '',
          channel: 'email',
          subject: '',
          body: '',
          sequenceId: '',
        });
        setIsCreating(false);
        await fetchOutreach(true);
      }
    } catch (err) {
      console.error('Error creating outreach:', err);
      toast.error(err.response?.data?.message || 'Failed to create outreach.');
    } finally {
      setActionLoading(false);
    }
  };

  const viewOutreach = async (id) => {
    try {
      setActionLoading(true);
      const response = await axios.get(`${API_URL}/crm/outreach/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setViewingOutreach(response.data.data);
        setIsViewing(true);
      }
    } catch (err) {
      console.error('Error fetching outreach:', err);
      toast.error('Failed to load outreach details');
    } finally {
      setActionLoading(false);
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email': return <Mail size={16} />;
      case 'linkedin': return <Linkedin size={16} />;
      case 'cold_call': return <Phone size={16} />;
      default: return <Send size={16} />;
    }
  };

  const getChannelLabel = (channel) => {
    const labels = { email: 'Email', linkedin: 'LinkedIn', cold_call: 'Cold Call' };
    return labels[channel] || channel || 'N/A';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <Send size={14} color="#3B82F6" />;
      case 'opened': return <CheckCircle size={14} color="#22C55E" />;
      case 'replied': return <CheckCircle size={14} color="#22C55E" />;
      case 'bounced': return <XCircle size={14} color="#EF4444" />;
      case 'failed': return <XCircle size={14} color="#EF4444" />;
      default: return <Clock size={14} color="#F59E0B" />;
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      draft: { backgroundColor: '#f3f4f6', color: '#374151' },
      sent: { backgroundColor: '#dbeafe', color: '#1e40af' },
      opened: { backgroundColor: '#d1fae5', color: '#065f46' },
      replied: { backgroundColor: '#d1fae5', color: '#065f46' },
      bounced: { backgroundColor: '#fee2e2', color: '#991b1b' },
      failed: { backgroundColor: '#fee2e2', color: '#991b1b' },
    };
    return styles[status] || styles.draft;
  };

  const formatDate = (date) => {
    if (!date) return 'Pending';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="outreach-loading">
        <div className="outreach-spinner"></div>
        <p className="outreach-loading-text">Loading outreach activities...</p>
      </div>
    );
  }

  // View Mode
  if (isViewing && viewingOutreach) {
    const statusStyle = getStatusStyle(viewingOutreach.status);
    return (
      <div className="outreach-modal-overlay" onClick={() => { setIsViewing(false); setViewingOutreach(null); }}>
        <div className="outreach-modal" onClick={e => e.stopPropagation()}>
          <div className="outreach-modal-header">
            <h3 className="outreach-modal-title">Outreach Details</h3>
            <button className="outreach-modal-close" onClick={() => { setIsViewing(false); setViewingOutreach(null); }}>
              <X size={20} />
            </button>
          </div>
          <div className="outreach-modal-body">
            <div className="outreach-view-grid">
              <div className="outreach-view-item">
                <label className="outreach-view-label">Channel</label>
                <span className="outreach-view-value">{getChannelLabel(viewingOutreach.channel)}</span>
              </div>
              <div className="outreach-view-item">
                <label className="outreach-view-label">Status</label>
                <span className="outreach-status-badge" style={statusStyle}>
                  {getStatusIcon(viewingOutreach.status)} {viewingOutreach.status || 'Draft'}
                </span>
              </div>
              <div className="outreach-view-item">
                <label className="outreach-view-label">Lead</label>
                <span className="outreach-view-value">{viewingOutreach.leadId?.companyName || 'N/A'}</span>
              </div>
              <div className="outreach-view-item">
                <label className="outreach-view-label">Sent At</label>
                <span className="outreach-view-value">{formatDate(viewingOutreach.sentAt)}</span>
              </div>
            </div>
            
            {viewingOutreach.subject && (
              <div className="outreach-view-section">
                <label className="outreach-view-label">Subject</label>
                <p className="outreach-view-text">{viewingOutreach.subject}</p>
              </div>
            )}
            
            {viewingOutreach.body && (
              <div className="outreach-view-section">
                <label className="outreach-view-label">Body</label>
                <p className="outreach-view-text">{viewingOutreach.body}</p>
              </div>
            )}

            {viewingOutreach.sequenceId && (
              <div className="outreach-view-section">
                <label className="outreach-view-label">Sequence</label>
                <span className="outreach-view-value">{viewingOutreach.sequenceId.name || 'N/A'}</span>
              </div>
            )}

            <div className="outreach-modal-actions">
              <button className="outreach-modal-cancel" onClick={() => { setIsViewing(false); setViewingOutreach(null); }}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create Mode
  if (isCreating) {
    return (
      <div className="outreach-container">
        <div className="outreach-header">
          <div className="outreach-header-left">
            <button className="outreach-back-btn" onClick={() => setIsCreating(false)}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="outreach-title">Create New Outreach</h1>
              <p className="outreach-subtitle">Send a new outreach to a lead</p>
            </div>
          </div>
          <div className="outreach-header-actions">
            <button className="outreach-secondary-btn" onClick={() => setIsCreating(false)}>
              Cancel
            </button>
            <button className="outreach-primary-btn" onClick={handleCreateOutreach} disabled={actionLoading}>
              {actionLoading ? 'Sending...' : 'Send Outreach'}
            </button>
          </div>
        </div>

        <div className="outreach-create-form">
          <div className="outreach-card">
            <div className="outreach-card-header"><h3 className="outreach-card-title">Outreach Details</h3></div>
            <div className="outreach-card-body">
              <div className="outreach-form-group">
                <label className="outreach-form-label">Select Lead *</label>
                <select name="leadId" value={formData.leadId} onChange={handleFormChange} className="outreach-form-select" required>
                  <option value="">Select a lead...</option>
                  {leads.map(lead => (
                    <option key={lead._id} value={lead._id}>
                      {lead.companyName} - {lead.contactName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="outreach-form-group">
                <label className="outreach-form-label">Channel *</label>
                <select name="channel" value={formData.channel} onChange={handleFormChange} className="outreach-form-select">
                  <option value="email">Email</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="cold_call">Cold Call</option>
                </select>
              </div>

              <div className="outreach-form-group">
                <label className="outreach-form-label">Sequence (Optional)</label>
                <select name="sequenceId" value={formData.sequenceId} onChange={handleFormChange} className="outreach-form-select">
                  <option value="">No sequence</option>
                  {sequences.map(seq => (
                    <option key={seq._id} value={seq._id}>{seq.name}</option>
                  ))}
                </select>
              </div>

              <div className="outreach-form-group">
                <label className="outreach-form-label">Subject</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleFormChange} className="outreach-form-input" placeholder="Enter subject" />
              </div>

              <div className="outreach-form-group">
                <label className="outreach-form-label">Message Body *</label>
                <textarea name="body" value={formData.body} onChange={handleFormChange} className="outreach-form-textarea" placeholder="Enter your message..." rows={6} required />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main List View
  return (
    <div className="outreach-container">
      <div className="outreach-header">
        <div>
          <h1 className="outreach-title">Outreach</h1>
          <p className="outreach-subtitle">Track and manage your outreach campaigns</p>
        </div>
        <button className="outreach-primary-btn" onClick={() => setIsCreating(true)}>
          <Plus size={18} /> New Outreach
        </button>
      </div>

      <div className="outreach-stats">
        <div className="outreach-stat-card">
          <div className="outreach-stat-icon outreach-stat-icon-blue"><Send size={18} color="#3B82F6" /></div>
          <div><p className="outreach-stat-number">{outreach.length}</p><p className="outreach-stat-label">Total</p></div>
        </div>
        <div className="outreach-stat-card">
          <div className="outreach-stat-icon outreach-stat-icon-green"><CheckCircle size={18} color="#10B981" /></div>
          <div><p className="outreach-stat-number">{outreach.filter(o => o.status === 'opened' || o.status === 'replied').length}</p><p className="outreach-stat-label">Engaged</p></div>
        </div>
        <div className="outreach-stat-card">
          <div className="outreach-stat-icon outreach-stat-icon-yellow"><Clock size={18} color="#F59E0B" /></div>
          <div><p className="outreach-stat-number">{outreach.filter(o => o.status === 'sent' || o.status === 'draft').length}</p><p className="outreach-stat-label">Pending</p></div>
        </div>
        <div className="outreach-stat-card">
          <div className="outreach-stat-icon outreach-stat-icon-red"><XCircle size={18} color="#EF4444" /></div>
          <div><p className="outreach-stat-number">{outreach.filter(o => o.status === 'bounced' || o.status === 'failed').length}</p><p className="outreach-stat-label">Failed</p></div>
        </div>
      </div>

      <div className="outreach-filters">
        <div className="outreach-search">
          <Search size={18} className="outreach-search-icon" />
          <input type="text" placeholder="Search outreach..." value={searchTerm} onChange={handleSearch} className="outreach-search-input" />
          {searchTerm && <button className="outreach-search-clear" onClick={() => setSearchTerm('')}><X size={16} /></button>}
        </div>
        <div className="outreach-filter-actions">
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="outreach-filter-select">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="opened">Opened</option>
            <option value="replied">Replied</option>
            <option value="bounced">Bounced</option>
            <option value="failed">Failed</option>
          </select>
          <select value={filterChannel} onChange={(e) => { setFilterChannel(e.target.value); setCurrentPage(1); }} className="outreach-filter-select">
            <option value="">All Channels</option>
            <option value="email">Email</option>
            <option value="linkedin">LinkedIn</option>
            <option value="cold_call">Cold Call</option>
          </select>
          <button className="outreach-refresh-btn" onClick={() => fetchOutreach(true)} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'outreach-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="outreach-table-wrapper">
        <div className="outreach-table-container">
          <table className="outreach-table">
            <thead>
              <tr>
                <th className="outreach-table-header">Channel</th>
                <th className="outreach-table-header">Lead</th>
                <th className="outreach-table-header">Subject</th>
                <th className="outreach-table-header">Status</th>
                <th className="outreach-table-header">Sent</th>
                <th className="outreach-table-header">Step</th>
                <th className="outreach-table-header outreach-table-header-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {outreach.length === 0 ? (
                <tr>
                  <td colSpan="7" className="outreach-empty">
                    <div className="outreach-empty-content">
                      <Send size={48} color="#94A3B8" />
                      <p className="outreach-empty-text">No outreach activities found</p>
                      <p className="outreach-empty-subtext">Create your first outreach to start engaging leads</p>
                      <button className="outreach-empty-btn" onClick={() => setIsCreating(true)}><Plus size={16} /> New Outreach</button>
                    </div>
                  </td>
                </tr>
              ) : (
                outreach.map((item) => {
                  const statusStyle = getStatusStyle(item.status);
                  return (
                    <tr key={item._id} className="outreach-table-row">
                      <td>
                        <span className="outreach-channel-cell">
                          {getChannelIcon(item.channel)}
                          <span className="outreach-channel-label">{getChannelLabel(item.channel)}</span>
                        </span>
                      </td>
                      <td>
                        <Link to={`/crm/leads/${item.leadId?._id}`} className="outreach-lead-link">
                          {item.leadId?.companyName || 'N/A'}
                        </Link>
                      </td>
                      <td className="outreach-subject-cell">{item.subject || 'N/A'}</td>
                      <td>
                        <span className="outreach-status-badge" style={statusStyle}>
                          <span className="outreach-status-icon">{getStatusIcon(item.status)}</span>
                          <span className="outreach-status-label">{item.status || 'Draft'}</span>
                        </span>
                      </td>
                      <td>{formatDate(item.sentAt)}</td>
                      <td>
                        <span className="outreach-step-badge">{item.step || 0}/{item.totalSteps || 0}</span>
                      </td>
                      <td className="outreach-table-actions">
                        <button className="outreach-action-view" onClick={() => viewOutreach(item._id)} title="View">
                          <Eye size={15} />
                        </button>
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
        <div className="outreach-pagination">
          <div className="outreach-pagination-container">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="outreach-pagination-btn">Previous</button>
            <span className="outreach-pagination-info">Page {currentPage} of {pagination.totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages} className="outreach-pagination-btn">Next</button>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        /* Container */
        .outreach-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background-color: #f8fafc;
          min-height: 100vh;
        }

        /* Loading */
        .outreach-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 64vh;
          gap: 16px;
        }

        .outreach-loading-text {
          color: #64748b;
          font-size: 14px;
        }

        .outreach-spinner {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .outreach-spin {
          animation: spin 1s linear infinite;
        }

        /* Header */
        .outreach-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .outreach-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .outreach-back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          cursor: pointer;
          color: #475569;
          transition: all 0.2s ease;
        }

        .outreach-back-btn:hover {
          background: #f1f5f9;
        }

        .outreach-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .outreach-subtitle {
          font-size: 15px;
          color: #64748b;
          margin-top: 4px;
        }

        .outreach-header-actions {
          display: flex;
          gap: 8px;
        }

        .outreach-primary-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .outreach-primary-btn:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .outreach-primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .outreach-secondary-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .outreach-secondary-btn:hover {
          background: #e2e8f0;
        }

        /* Stats */
        .outreach-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .outreach-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #ffffff;
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .outreach-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .outreach-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .outreach-stat-icon-blue { background: #eff6ff; }
        .outreach-stat-icon-green { background: #d1fae5; }
        .outreach-stat-icon-yellow { background: #fef3c7; }
        .outreach-stat-icon-red { background: #fee2e2; }

        .outreach-stat-number {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
        }

        .outreach-stat-label {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        /* Filters */
        .outreach-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .outreach-search {
          flex: 1;
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0 14px;
          min-width: 200px;
        }

        .outreach-search-icon {
          color: #94a3b8;
          flex-shrink: 0;
        }

        .outreach-search-input {
          flex: 1;
          padding: 10px 12px;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
          color: #0f172a;
          min-width: 120px;
        }

        .outreach-search-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .outreach-filter-actions {
          display: flex;
          gap: 8px;
        }

        .outreach-filter-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          min-width: 140px;
        }

        .outreach-refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .outreach-refresh-btn:hover {
          background: #f1f5f9;
        }

        /* Table */
        .outreach-table-wrapper {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .outreach-table-container {
          overflow-x: auto;
        }

        .outreach-table {
          width: 100%;
          border-collapse: collapse;
        }

        .outreach-table-header {
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .outreach-table-header-center {
          text-align: center;
        }

        .outreach-table-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s ease;
        }

        .outreach-table-row:hover {
          background: #f8fafc;
        }

        .outreach-channel-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .outreach-channel-label {
          text-transform: capitalize;
          font-size: 14px;
          color: #374151;
        }

        .outreach-lead-link {
          color: #3b82f6;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .outreach-lead-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .outreach-subject-cell {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .outreach-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
        }

        .outreach-status-icon {
          display: flex;
          align-items: center;
        }

        .outreach-status-label {
          text-transform: capitalize;
        }

        .outreach-step-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          background: #f3f4f6;
          color: #374151;
        }

        .outreach-table-actions {
          text-align: center;
        }

        .outreach-action-view {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          background: #eff6ff;
          color: #3b82f6;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .outreach-action-view:hover {
          background: #dbeafe;
        }

        /* Empty State */
        .outreach-empty {
          text-align: center;
          padding: 48px 16px;
        }

        .outreach-empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .outreach-empty-text {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .outreach-empty-subtext {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .outreach-empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.2s ease;
        }

        .outreach-empty-btn:hover {
          background: #2563eb;
        }

        /* Pagination */
        .outreach-pagination {
          margin-top: 16px;
          display: flex;
          justify-content: center;
        }

        .outreach-pagination-container {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .outreach-pagination-btn {
          padding: 8px 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #0f172a;
          transition: all 0.2s ease;
        }

        .outreach-pagination-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .outreach-pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .outreach-pagination-info {
          font-size: 14px;
          color: #64748b;
        }

        /* Modal */
        .outreach-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .outreach-modal {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .outreach-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .outreach-modal-title {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .outreach-modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .outreach-modal-close:hover {
          background: #f1f5f9;
        }

        .outreach-modal-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .outreach-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }

        .outreach-modal-cancel {
          padding: 8px 16px;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .outreach-modal-cancel:hover {
          background: #e2e8f0;
        }

        /* View */
        .outreach-view-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .outreach-view-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .outreach-view-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
        }

        .outreach-view-value {
          font-size: 14px;
          color: #0f172a;
        }

        .outreach-view-text {
          font-size: 14px;
          color: #475569;
          margin: 0;
          white-space: pre-wrap;
        }

        .outreach-view-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* Create Form */
        .outreach-create-form {
          max-width: 800px;
          margin: 0 auto;
        }

        .outreach-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .outreach-card-header {
          padding: 16px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .outreach-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .outreach-card-body {
          padding: 24px;
        }

        .outreach-form-group {
          margin-bottom: 16px;
        }

        .outreach-form-group:last-child {
          margin-bottom: 0;
        }

        .outreach-form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .outreach-form-input,
        .outreach-form-select,
        .outreach-form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color: #111827;
          background: #ffffff;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .outreach-form-input:focus,
        .outreach-form-select:focus,
        .outreach-form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .outreach-form-textarea {
          resize: vertical;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .outreach-container {
            padding: 16px;
          }

          .outreach-header {
            flex-direction: column;
            align-items: stretch;
          }

          .outreach-primary-btn {
            width: 100%;
            justify-content: center;
          }

          .outreach-stats {
            grid-template-columns: 1fr 1fr;
          }

          .outreach-filters {
            flex-direction: column;
          }

          .outreach-search {
            width: 100%;
          }

          .outreach-filter-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .outreach-filter-select {
            flex: 1;
            min-width: 120px;
          }

          .outreach-header-left {
            flex-direction: column;
            align-items: flex-start;
          }

          .outreach-header-actions {
            width: 100%;
            flex-direction: column;
          }

          .outreach-header-actions button {
            width: 100%;
            justify-content: center;
          }

          .outreach-view-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .outreach-container {
            padding: 12px;
          }

          .outreach-stats {
            grid-template-columns: 1fr;
          }

          .outreach-title {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
};

export default Outreach;