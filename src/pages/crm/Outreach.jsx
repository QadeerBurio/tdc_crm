// pages/crm/Outreach.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Send, Mail, Linkedin, Phone, CheckCircle, Clock, 
  XCircle, Filter, Search, ArrowLeft, X, Eye, Edit, Trash2,
  Users, UserCheck, Calendar, TrendingUp, RefreshCw, Save,
  MessageCircle, Zap, Target, Sparkles, Award, Activity
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
  const [hoveredRow, setHoveredRow] = useState(null);
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
      case 'sent': return <Send size={14} />;
      case 'opened': return <CheckCircle size={14} />;
      case 'replied': return <CheckCircle size={14} />;
      case 'bounced': return <XCircle size={14} />;
      case 'failed': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      draft: { backgroundColor: '#FFEFB3', color: '#013E37', borderColor: '#013E37' },
      sent: { backgroundColor: '#FFEFB3', color: '#013E37', borderColor: '#013E37' },
      opened: { backgroundColor: '#013E37', color: '#FFFFFF', borderColor: '#013E37' },
      replied: { backgroundColor: '#013E37', color: '#FFFFFF', borderColor: '#013E37' },
      bounced: { backgroundColor: '#FFEBEE', color: '#D32F2F', borderColor: '#D32F2F' },
      failed: { backgroundColor: '#FFEBEE', color: '#D32F2F', borderColor: '#D32F2F' },
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
        <div className="outreach-loading-spinner"></div>
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
            <h3 className="outreach-modal-title">
              <Eye className="outreach-modal-title-icon" />
              Outreach Details
            </h3>
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
              <h1 className="outreach-title">
                <Send className="outreach-title-icon" color="#013E37" />
                Create New Outreach
              </h1>
              <p className="outreach-subtitle">Send a new outreach to a lead</p>
            </div>
          </div>
          <div className="outreach-header-actions">
            <button className="outreach-secondary-btn" onClick={() => setIsCreating(false)}>
              Cancel
            </button>
            <button className="outreach-primary-btn" onClick={handleCreateOutreach} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <div className="outreach-btn-spinner"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Outreach
                </>
              )}
            </button>
          </div>
        </div>

        <div className="outreach-create-form">
          <div className="outreach-card">
            <div className="outreach-card-header">
              <h3 className="outreach-card-title">
                <Sparkles className="outreach-card-title-icon" color="#013E37" />
                Outreach Details
              </h3>
            </div>
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
                  <option value="email">📧 Email</option>
                  <option value="linkedin">🔗 LinkedIn</option>
                  <option value="cold_call">📞 Cold Call</option>
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
          <h1 className="outreach-title">
            <Send className="outreach-title-icon" color="#013E37" />
            Outreach
          </h1>
          <p className="outreach-subtitle">Track and manage your outreach campaigns</p>
        </div>
        <button className="outreach-primary-btn" onClick={() => setIsCreating(true)}>
          <Plus size={18} /> New Outreach
        </button>
      </div>

      <div className="outreach-stats">
        <div className="outreach-stat-card">
          <div className="outreach-stat-icon" style={{ backgroundColor: '#FFEFB3' }}>
            <Send size={20} color="#013E37" />
          </div>
          <div>
            <p className="outreach-stat-number">{outreach.length}</p>
            <p className="outreach-stat-label">Total</p>
          </div>
        </div>
        <div className="outreach-stat-card">
          <div className="outreach-stat-icon" style={{ backgroundColor: '#FFEFB3' }}>
            <CheckCircle size={20} color="#013E37" />
          </div>
          <div>
            <p className="outreach-stat-number">{outreach.filter(o => o.status === 'opened' || o.status === 'replied').length}</p>
            <p className="outreach-stat-label">Engaged</p>
          </div>
        </div>
        <div className="outreach-stat-card">
          <div className="outreach-stat-icon" style={{ backgroundColor: '#FFEFB3' }}>
            <Clock size={20} color="#013E37" />
          </div>
          <div>
            <p className="outreach-stat-number">{outreach.filter(o => o.status === 'sent' || o.status === 'draft').length}</p>
            <p className="outreach-stat-label">Pending</p>
          </div>
        </div>
        <div className="outreach-stat-card">
          <div className="outreach-stat-icon" style={{ backgroundColor: '#FFEBEE' }}>
            <XCircle size={20} color="#D32F2F" />
          </div>
          <div>
            <p className="outreach-stat-number">{outreach.filter(o => o.status === 'bounced' || o.status === 'failed').length}</p>
            <p className="outreach-stat-label">Failed</p>
          </div>
        </div>
      </div>

      <div className="outreach-filters">
        <div className="outreach-search">
          <Search size={18} className="outreach-search-icon" color="#013E37" />
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
                      <div className="outreach-empty-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
                        <Send size={40} color="#013E37" />
                      </div>
                      <p className="outreach-empty-text">No outreach activities found</p>
                      <p className="outreach-empty-subtext">Create your first outreach to start engaging leads</p>
                      <button className="outreach-empty-btn" onClick={() => setIsCreating(true)}>
                        <Plus size={16} /> New Outreach
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                outreach.map((item, index) => {
                  const statusStyle = getStatusStyle(item.status);
                  const isHovered = hoveredRow === item._id;
                  return (
                    <tr 
                      key={item._id} 
                      className="outreach-table-row"
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onMouseEnter={() => setHoveredRow(item._id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td>
                        <span className="outreach-channel-cell">
                          <span className="outreach-channel-icon" style={{ backgroundColor: '#FFEFB3' }}>
                            {getChannelIcon(item.channel)}
                          </span>
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
                      <td className="outreach-date-cell">{formatDate(item.sentAt)}</td>
                      <td>
                        <span className="outreach-step-badge">
                          {item.step || 0}/{item.totalSteps || 0}
                        </span>
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

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .outreach-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #FFFFFF;
          min-height: 100vh;
        }

        /* ============================================
           LOADING
           ============================================ */
        .outreach-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 64vh;
          gap: 16px;
        }

        .outreach-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .outreach-loading-text {
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .outreach-spin {
          animation: spin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .outreach-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeInDown 0.6s ease;
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
          border: 1px solid #FFEFB3;
          background: #ffffff;
          cursor: pointer;
          color: #013E37;
          transition: all 0.3s ease;
        }

        .outreach-back-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: translateX(-4px);
        }

        .outreach-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .outreach-title-icon {
          width: 28px;
          height: 28px;
          animation: pulse 2s ease-in-out infinite;
        }

        .outreach-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin-top: 4px;
        }

        .outreach-header-actions {
          display: flex;
          gap: 8px;
        }

        /* ============================================
           BUTTONS
           ============================================ */
        .outreach-primary-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #013E37;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.25);
        }

        .outreach-primary-btn:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        .outreach-primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .outreach-btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .outreach-secondary-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: transparent;
          color: #013E37;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .outreach-secondary-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }

        /* ============================================
           STATS
           ============================================ */
        .outreach-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
          animation: fadeInUp 0.8s ease;
        }

        .outreach-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #FFFFFF;
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
        }

        .outreach-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }

        .outreach-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .outreach-stat-card:hover .outreach-stat-icon {
          transform: scale(1.05);
        }

        .outreach-stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          line-height: 1.2;
        }

        .outreach-stat-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
          font-weight: 500;
        }

        /* ============================================
           FILTERS
           ============================================ */
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
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          padding: 0 14px;
          min-width: 200px;
          transition: all 0.3s ease;
        }

        .outreach-search:focus-within {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .outreach-search-icon {
          opacity: 0.5;
          flex-shrink: 0;
        }

        .outreach-search-input {
          flex: 1;
          padding: 10px 12px;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
          color: #013E37;
          min-width: 120px;
        }

        .outreach-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }

        .outreach-search-clear {
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
        }

        .outreach-search-clear:hover {
          opacity: 0.8;
          transform: scale(1.2);
        }

        .outreach-filter-actions {
          display: flex;
          gap: 8px;
        }

        .outreach-filter-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #013E37;
          outline: none;
          cursor: pointer;
          min-width: 140px;
          transition: all 0.3s ease;
        }

        .outreach-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .outreach-refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .outreach-refresh-btn:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }

        /* ============================================
           TABLE
           ============================================ */
        .outreach-table-wrapper {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .outreach-table-wrapper:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
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
          color: #013E37;
          text-transform: uppercase;
          border-bottom: 2px solid #013E37;
          background: #FFEFB3;
        }

        .outreach-table-header-center {
          text-align: center;
        }

        .outreach-table-row {
          border-bottom: 1px solid #FFEFB3;
          transition: all 0.3s ease;
          animation: slideInRight 0.4s ease forwards;
          opacity: 0;
        }

        .outreach-table-row:hover {
          background: #FFEFB3;
        }

        .outreach-channel-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .outreach-channel-icon {
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .outreach-channel-label {
          text-transform: capitalize;
          font-size: 14px;
          color: #013E37;
          font-weight: 500;
        }

        .outreach-lead-link {
          color: #013E37;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .outreach-lead-link:hover {
          color: #0A5C54;
          text-decoration: underline;
        }

        .outreach-subject-cell {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #013E37;
        }

        .outreach-date-cell {
          color: #013E37;
          opacity: 0.7;
          font-size: 13px;
        }

        .outreach-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid;
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
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          background: #FFEFB3;
          color: #013E37;
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
          background: #FFEFB3;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .outreach-action-view:hover {
          background: #013E37;
          color: #FFFFFF;
          transform: scale(1.1);
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
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

        .outreach-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px;
          animation: float 3s ease-in-out infinite;
        }

        .outreach-empty-text {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .outreach-empty-subtext {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }

        .outreach-empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #013E37;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.3s ease;
        }

        .outreach-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        /* ============================================
           PAGINATION
           ============================================ */
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
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #013E37;
          transition: all 0.3s ease;
        }

        .outreach-pagination-btn:hover:not(:disabled) {
          background: #013E37;
          color: #FFFFFF;
          border-color: #013E37;
        }

        .outreach-pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .outreach-pagination-info {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
        }

        /* ============================================
           MODAL
           ============================================ */
        .outreach-modal-overlay {
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
          animation: fadeIn 0.3s ease;
        }

        .outreach-modal {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #FFEFB3;
          padding: 24px;
          max-width: 540px;
          width: 90%;
          box-shadow: 0 24px 64px rgba(1, 62, 55, 0.2);
          animation: modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .outreach-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #FFEFB3;
        }

        .outreach-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .outreach-modal-title-icon {
          width: 20px;
          height: 20px;
        }

        .outreach-modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #013E37;
          opacity: 0.5;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .outreach-modal-close:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: rotate(90deg);
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
          padding-top: 12px;
          border-top: 1px solid #FFEFB3;
        }

        .outreach-modal-cancel {
          padding: 8px 20px;
          background: transparent;
          color: #013E37;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .outreach-modal-cancel:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }

        /* ============================================
           VIEW
           ============================================ */
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
          font-size: 11px;
          font-weight: 600;
          color: #013E37;
          opacity: 0.5;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .outreach-view-value {
          font-size: 14px;
          color: #013E37;
          font-weight: 500;
        }

        .outreach-view-text {
          font-size: 14px;
          color: #013E37;
          opacity: 0.8;
          margin: 0;
          white-space: pre-wrap;
          padding: 10px 14px;
          background: #F8FAFC;
          border-radius: 8px;
          border-left: 3px solid #FFEFB3;
        }

        .outreach-view-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* ============================================
           CREATE FORM
           ============================================ */
        .outreach-create-form {
          max-width: 800px;
          margin: 0 auto;
        }

        .outreach-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .outreach-card:hover {
          border-color: #013E37;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }

        .outreach-card-header {
          padding: 16px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #F8FAFC;
        }

        .outreach-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .outreach-card-title-icon {
          width: 18px;
          height: 18px;
        }

        .outreach-card-body {
          padding: 24px;
        }

        .outreach-form-group {
          margin-bottom: 16px;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .outreach-form-group:nth-child(1) { animation-delay: 0.05s; }
        .outreach-form-group:nth-child(2) { animation-delay: 0.1s; }
        .outreach-form-group:nth-child(3) { animation-delay: 0.15s; }
        .outreach-form-group:nth-child(4) { animation-delay: 0.2s; }
        .outreach-form-group:nth-child(5) { animation-delay: 0.25s; }

        .outreach-form-group:last-child {
          margin-bottom: 0;
        }

        .outreach-form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          margin-bottom: 6px;
        }

        .outreach-form-input,
        .outreach-form-select,
        .outreach-form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          color: #013E37;
          background: #ffffff;
          outline: none;
          box-sizing: border-box;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .outreach-form-input:focus,
        .outreach-form-select:focus,
        .outreach-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
          transform: scale(1.01);
        }

        .outreach-form-input::placeholder,
        .outreach-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.4;
        }

        .outreach-form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
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
        @media (max-width: 768px) {
          .outreach-container {
            padding: 16px;
          }

          .outreach-header {
            flex-direction: column;
            align-items: stretch;
          }

          .outreach-header-left {
            flex-direction: column;
            align-items: flex-start;
          }

          .outreach-primary-btn {
            width: 100%;
            justify-content: center;
          }

          .outreach-header-actions {
            width: 100%;
            flex-direction: column;
          }

          .outreach-header-actions button {
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

          .outreach-view-grid {
            grid-template-columns: 1fr;
          }

          .outreach-title {
            font-size: 24px;
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
            font-size: 20px;
          }

          .outreach-stat-number {
            font-size: 20px;
          }

          .outreach-modal {
            padding: 16px;
          }

          .outreach-form-input,
          .outreach-form-select,
          .outreach-form-textarea {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default Outreach;