// pages/Approvals.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Image,
  Video,
  File,
  AlertCircle,
  MessageSquare,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Approvals = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/clients/approvals`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setApprovals(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching approvals:', err);
      let errorMessage = 'Failed to load approvals.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view approvals.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId) => {
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/clients/approvals/${approvalId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Approval submitted successfully');
      await fetchApprovals(); // Refresh data
    } catch (err) {
      console.error('Error approving:', err);
      let errorMessage = 'Failed to submit approval.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to approve this item.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevise = async (approvalId) => {
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/clients/approvals/${approvalId}/revise`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Revision requested successfully');
      await fetchApprovals(); // Refresh data
    } catch (err) {
      console.error('Error requesting revision:', err);
      let errorMessage = 'Failed to request revision.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to request revision.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getFilteredApprovals = () => {
    switch (activeTab) {
      case 'pending':
        return approvals.filter(a => a.status === 'Pending' || a.status === 'pending');
      case 'approved':
        return approvals.filter(a => a.status === 'Approved' || a.status === 'approved');
      case 'revision':
        return approvals.filter(a => a.status === 'Revision Requested' || a.status === 'revision_requested');
      case 'all':
      default:
        return approvals;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'approved': 'bg-green-100 text-green-800',
      'Revision Requested': 'bg-red-100 text-red-800',
      'revision_requested': 'bg-red-100 text-red-800',
      'Expired': 'bg-gray-100 text-gray-800',
      'expired': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': <Clock style={styles.statusIconSmall} />,
      'pending': <Clock style={styles.statusIconSmall} />,
      'Approved': <CheckCircle style={{...styles.statusIconSmall, color: '#22C55E'}} />,
      'approved': <CheckCircle style={{...styles.statusIconSmall, color: '#22C55E'}} />,
      'Revision Requested': <XCircle style={{...styles.statusIconSmall, color: '#EF4444'}} />,
      'revision_requested': <XCircle style={{...styles.statusIconSmall, color: '#EF4444'}} />,
      'Expired': <AlertCircle style={{...styles.statusIconSmall, color: '#6B7280'}} />,
      'expired': <AlertCircle style={{...styles.statusIconSmall, color: '#6B7280'}} />
    };
    return icons[status] || <Clock style={styles.statusIconSmall} />;
  };

  const getAssetIcon = (assetType) => {
    const icons = {
      design: Image,
      video: Video,
      copy: FileText,
      strategy: FileText,
      report: FileText,
      other: File
    };
    const Icon = icons[assetType] || File;
    return <Icon style={styles.assetIcon} />;
  };

  const formatStatusDisplay = (status) => {
    if (!status) return 'Pending';
    const statusMap = {
      'pending': 'Pending',
      'approved': 'Approved',
      'revision_requested': 'Revision Requested',
      'expired': 'Expired'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const tabs = [
    { id: 'pending', label: 'Pending', count: approvals.filter(a => a.status === 'Pending' || a.status === 'pending').length },
    { id: 'approved', label: 'Approved', count: approvals.filter(a => a.status === 'Approved' || a.status === 'approved').length },
    { id: 'revision', label: 'Revision Requested', count: approvals.filter(a => a.status === 'Revision Requested' || a.status === 'revision_requested').length },
    { id: 'all', label: 'All', count: approvals.length }
  ];

  const filteredApprovals = getFilteredApprovals();

  return (
    <div style={styles.container}>
      <div>
        <h1 style={styles.title}>Approvals</h1>
        <p style={styles.subtitle}>Review and approve project assets</p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Pending Approval</p>
              <p style={{...styles.statValue, color: '#D97706'}}>
                {approvals.filter(a => a.status === 'Pending' || a.status === 'pending').length}
              </p>
            </div>
            <Clock style={{...styles.statIcon, color: '#F59E0B'}} />
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Approved</p>
              <p style={{...styles.statValue, color: '#16A34A'}}>
                {approvals.filter(a => a.status === 'Approved' || a.status === 'approved').length}
              </p>
            </div>
            <CheckCircle style={{...styles.statIcon, color: '#22C55E'}} />
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Revision Requested</p>
              <p style={{...styles.statValue, color: '#DC2626'}}>
                {approvals.filter(a => a.status === 'Revision Requested' || a.status === 'revision_requested').length}
              </p>
            </div>
            <XCircle style={{...styles.statIcon, color: '#EF4444'}} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Approval List */}
      <div style={styles.approvalsCard}>
        <div style={styles.cardContent}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div style={styles.emptyState}>
              <CheckCircle style={styles.emptyIcon} />
              <p style={styles.emptyText}>No {activeTab} approvals</p>
            </div>
          ) : (
            <div style={styles.approvalsList}>
              {filteredApprovals.map((approval) => (
                <div key={approval._id} style={styles.approvalItem}>
                  <div style={styles.approvalContent}>
                    <div style={styles.approvalHeader}>
                      <div style={styles.approvalIconWrapper}>
                        {getAssetIcon(approval.assetType)}
                      </div>
                      <div style={styles.approvalInfo}>
                        <div style={styles.approvalTitleRow}>
                          <h4 style={styles.approvalTitle}>{approval.title}</h4>
                          <span style={{
                            ...styles.approvalBadge,
                            ...parseColorStyle(getStatusColor(approval.status))
                          }}>
                            <span style={styles.badgeContent}>
                              {getStatusIcon(approval.status)}
                              <span>{formatStatusDisplay(approval.status)}</span>
                            </span>
                          </span>
                        </div>
                        <p style={styles.approvalDescription}>{approval.description}</p>
                        <div style={styles.approvalMeta}>
                          <span style={styles.metaItem}>
                            <Calendar style={styles.metaIcon} />
                            <span>{new Date(approval.createdAt).toLocaleDateString()}</span>
                          </span>
                          <span style={styles.metaSeparator}>•</span>
                          <span style={styles.metaItem}>
                            <FileText style={styles.metaIcon} />
                            <span style={styles.metaText}>
                              {approval.assetType ? approval.assetType.charAt(0).toUpperCase() + approval.assetType.slice(1) : 'File'}
                            </span>
                          </span>
                          {approval.assetUrl && (
                            <>
                              <span style={styles.metaSeparator}>•</span>
                              <button 
                                onClick={() => window.open(approval.assetUrl, '_blank')}
                                style={styles.viewAssetButton}
                              >
                                View Asset
                              </button>
                            </>
                          )}
                        </div>
                        {approval.comment && (
                          <div style={styles.feedbackContainer}>
                            <span style={styles.feedbackLabel}>Feedback:</span> 
                            <span style={styles.feedbackText}>{approval.comment}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {(approval.status === 'Pending' || approval.status === 'pending') && (
                      <div style={styles.actionButtons}>
                        <button 
                          style={styles.approveButton}
                          onClick={() => handleApprove(approval._id)}
                          disabled={actionLoading}
                        >
                          <CheckCircle style={styles.buttonIcon} />
                          Approve
                        </button>
                        <button 
                          style={styles.reviseButton}
                          onClick={() => handleRevise(approval._id)}
                          disabled={actionLoading}
                        >
                          <XCircle style={styles.buttonIcon} />
                          Revise
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to parse color styles
const parseColorStyle = (colorString) => {
  if (!colorString) return { backgroundColor: '#f3f4f6', color: '#6b7280' };
  const parts = colorString.split(' ');
  return {
    backgroundColor: parts[0] || '#f3f4f6',
    color: parts[1] || '#6b7280'
  };
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '24px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  statIcon: {
    width: '32px',
    height: '32px',
    color: '#6B7280',
  },
  approvalsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    marginTop: '24px',
  },
  cardContent: {
    padding: '0',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '32px 0',
  },
  spinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 16px',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    color: '#D1D5DB',
    margin: '0 auto 12px',
  },
  emptyText: {
    color: '#6B7280',
  },
  approvalsList: {
    display: 'flex',
    flexDirection: 'column',
  },
  approvalItem: {
    padding: '16px 20px',
    borderBottom: '1px solid #F3F4F6',
    transition: 'background-color 0.2s ease',
  },
  approvalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  approvalHeader: {
    display: 'flex',
    gap: '12px',
    flex: 1,
  },
  approvalIconWrapper: {
    padding: '8px',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '40px',
    height: '40px',
  },
  assetIcon: {
    width: '20px',
    height: '20px',
    color: '#6B7280',
  },
  approvalInfo: {
    flex: 1,
    minWidth: 0,
  },
  approvalTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  approvalTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
  },
  approvalBadge: {
    display: 'inline-flex',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  badgeContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statusIconSmall: {
    width: '14px',
    height: '14px',
  },
  approvalDescription: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  approvalMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#9CA3AF',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  metaIcon: {
    width: '14px',
    height: '14px',
  },
  metaSeparator: {
    color: '#D1D5DB',
  },
  metaText: {
    textTransform: 'capitalize',
  },
  viewAssetButton: {
    color: '#3B82F6',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    padding: 0,
    textDecoration: 'underline',
  },
  feedbackContainer: {
    marginTop: '8px',
    padding: '8px 12px',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#374151',
  },
  feedbackLabel: {
    fontWeight: '500',
  },
  feedbackText: {
    marginLeft: '4px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  approveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  reviseButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  buttonIcon: {
    width: '16px',
    height: '16px',
  },
};

// Add keyframe and hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .approval-item:hover {
    background-color: #F9FAFB !important;
  }
  
  .approve-button:hover:not(:disabled) {
    background-color: #16A34A !important;
  }
  
  .revise-button:hover:not(:disabled) {
    background-color: #DC2626 !important;
  }
  
  .view-asset-button:hover {
    color: #1D4ED8 !important;
  }
  
  .approve-button:disabled,
  .revise-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    
    .approval-header {
      flex-direction: column !important;
    }
    
    .approval-title-row {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    
    .action-buttons {
      width: 100% !important;
    }
    
    .approve-button,
    .revise-button {
      flex: 1 !important;
      justify-content: center !important;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 16px !important;
    }
    
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    
    .approval-meta {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    
    .meta-separator {
      display: none !important;
    }
    
    .action-buttons {
      flex-direction: column !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Approvals;