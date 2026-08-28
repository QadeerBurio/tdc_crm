// components/approvals/ApprovalInterface.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Image, 
  Video,
  File,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const ApprovalInterface = ({ approvals, onApprovalUpdate }) => {
  const { token } = useAuth();
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  // API base URL
  const API_URL = 'http://localhost:5000/api';

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

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Revision Requested': 'bg-red-100 text-red-800',
      'Expired': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Pending': { backgroundColor: '#fef3c7', color: '#92400e' },
      'Approved': { backgroundColor: '#d1fae5', color: '#065f46' },
      'Revision Requested': { backgroundColor: '#fee2e2', color: '#991b1b' },
      'Expired': { backgroundColor: '#f3f4f6', color: '#374151' }
    };
    return styles[status] || styles.Pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': <Clock style={styles.statusIconSmall} />,
      'Approved': <CheckCircle style={{...styles.statusIconSmall, color: '#22C55E'}} />,
      'Revision Requested': <XCircle style={{...styles.statusIconSmall, color: '#EF4444'}} />,
      'Expired': <AlertCircle style={{...styles.statusIconSmall, color: '#6B7280'}} />
    };
    return icons[status] || <Clock style={styles.statusIconSmall} />;
  };

  const handleApprove = async (approvalId) => {
    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/approvals/${approvalId}/approve`, 
        { comment: feedback || 'Approved' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('Asset approved successfully');
      if (onApprovalUpdate) onApprovalUpdate(response.data);
      setShowModal(false);
      setFeedback('');
    } catch (err) {
      console.error('Error approving asset:', err);
      let errorMessage = 'Failed to approve asset.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to approve this asset.';
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

  const handleRevision = async (approvalId) => {
    if (!feedback.trim()) {
      toast.error('Please provide revision feedback');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/approvals/${approvalId}/revise`, 
        { comment: feedback },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('Revision requested successfully');
      if (onApprovalUpdate) onApprovalUpdate(response.data);
      setShowModal(false);
      setFeedback('');
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
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openApprovalModal = (approval) => {
    setSelectedApproval(approval);
    setFeedback('');
    setShowModal(true);
  };

  if (!approvals || approvals.length === 0) {
    return (
      <div style={styles.emptyState}>
        <CheckCircle style={styles.emptyIcon} />
        <p style={styles.emptyText}>No approvals to review</p>
      </div>
    );
  }

  return (
    <>
      <div style={styles.container}>
        {approvals.map((approval) => (
          <div 
            key={approval._id} 
            style={styles.approvalCard}
            onClick={() => openApprovalModal(approval)}
          >
            <div style={styles.approvalContent}>
              <div style={styles.approvalInfo}>
                <div style={styles.assetIconWrapper}>
                  {getAssetIcon(approval.assetType)}
                </div>
                <div>
                  <h4 style={styles.approvalTitle}>{approval.title}</h4>
                  <p style={styles.approvalDescription}>{approval.description}</p>
                  <div style={styles.approvalMeta}>
                    <span style={styles.approvalDate}>
                      Created: {new Date(approval.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{
                      ...styles.statusBadge,
                      ...getStatusStyle(approval.status)
                    }}>
                      <span style={styles.badgeContent}>
                        {getStatusIcon(approval.status)}
                        <span>{approval.status}</span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              {approval.status === 'Pending' && (
                <div style={styles.actionButtons}>
                  <button 
                    style={styles.approveButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(approval._id);
                    }}
                    disabled={loading}
                  >
                    <CheckCircle style={styles.buttonIconSmall} />
                    Approve
                  </button>
                  <button 
                    style={styles.reviseButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      openApprovalModal(approval);
                    }}
                    disabled={loading}
                  >
                    <XCircle style={styles.buttonIconSmall} />
                    Revise
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Approval Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFeedback('');
        }}
        title={`Review: ${selectedApproval?.title || 'Asset'}`}
        size="lg"
      >
        <div style={styles.modalContent}>
          {/* Asset Preview */}
          {selectedApproval && (
            <div style={styles.assetPreview}>
              <div style={styles.assetHeader}>
                <div style={styles.assetTypeWrapper}>
                  {getAssetIcon(selectedApproval.assetType)}
                  <span style={styles.assetTypeText}>
                    {selectedApproval.assetType ? 
                      selectedApproval.assetType.charAt(0).toUpperCase() + selectedApproval.assetType.slice(1) : 
                      'File'
                    }
                  </span>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  ...getStatusStyle(selectedApproval.status)
                }}>
                  {selectedApproval.status}
                </span>
              </div>
              <p style={styles.assetDescription}>{selectedApproval.description}</p>
              {selectedApproval.assetUrl && (
                <div style={styles.assetLinkWrapper}>
                  <a 
                    href={selectedApproval.assetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.assetLink}
                  >
                    View Asset →
                  </a>
                </div>
              )}
              {selectedApproval.comment && (
                <div style={styles.feedbackContainer}>
                  <p style={styles.feedbackText}>
                    <span style={styles.feedbackLabel}>Previous feedback:</span> {selectedApproval.comment}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Feedback Form */}
          <div style={styles.feedbackForm}>
            <label style={styles.feedbackLabel}>Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide your feedback or revision requests..."
              style={styles.feedbackTextarea}
              rows="4"
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div style={styles.modalActions}>
            <button
              style={styles.modalCancelButton}
              onClick={() => {
                setShowModal(false);
                setFeedback('');
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              style={styles.modalReviseButton}
              onClick={() => handleRevision(selectedApproval?._id)}
              disabled={loading || !feedback.trim()}
            >
              <XCircle style={styles.buttonIcon} />
              Request Revision
            </button>
            <button
              style={styles.modalApproveButton}
              onClick={() => handleApprove(selectedApproval?._id)}
              disabled={loading}
            >
              <CheckCircle style={styles.buttonIcon} />
              Approve
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    color: '#22C55E',
    margin: '0 auto 12px',
  },
  emptyText: {
    color: '#6B7280',
  },
  approvalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '16px',
    cursor: 'pointer',
    transition: 'box-shadow 0.3s ease',
  },
  approvalContent: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  approvalInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flex: 1,
  },
  assetIconWrapper: {
    padding: '8px',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetIcon: {
    width: '20px',
    height: '20px',
    color: '#6B7280',
  },
  approvalTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
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
    gap: '12px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  approvalDate: {
    fontSize: '12px',
    color: '#9CA3AF',
  },
  statusBadge: {
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
  actionButtons: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  approveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#16A34A',
    border: '1px solid #16A34A',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  reviseButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#DC2626',
    border: '1px solid #DC2626',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonIconSmall: {
    width: '14px',
    height: '14px',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  assetPreview: {
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    padding: '16px',
  },
  assetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  assetTypeWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  assetTypeText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  assetDescription: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  assetLinkWrapper: {
    marginTop: '8px',
  },
  assetLink: {
    fontSize: '14px',
    color: '#3B82F6',
    textDecoration: 'none',
  },
  feedbackContainer: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
  },
  feedbackText: {
    fontSize: '14px',
    color: '#374151',
    margin: 0,
  },
  feedbackLabel: {
    fontWeight: '500',
  },
  feedbackForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  feedbackLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  feedbackTextarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
  },
  modalCancelButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modalReviseButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  modalApproveButton: {
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
  buttonIcon: {
    width: '16px',
    height: '16px',
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .approval-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  }
  
  .approve-button:hover:not(:disabled) {
    background-color: #D1FAE5 !important;
  }
  
  .revise-button:hover:not(:disabled) {
    background-color: #FEE2E2 !important;
  }
  
  .modal-cancel-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .modal-revise-button:hover:not(:disabled) {
    background-color: #DC2626 !important;
  }
  
  .modal-approve-button:hover:not(:disabled) {
    background-color: #16A34A !important;
  }
  
  .feedback-textarea:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  .asset-link:hover {
    color: #1D4ED8 !important;
    text-decoration: underline !important;
  }
  
  .approve-button:disabled,
  .revise-button:disabled,
  .modal-revise-button:disabled,
  .modal-approve-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .approval-content {
      flex-direction: column !important;
    }
    
    .approval-info {
      flex-direction: column !important;
    }
    
    .action-buttons {
      width: 100% !important;
    }
    
    .approve-button,
    .revise-button {
      flex: 1 !important;
      justify-content: center !important;
    }
    
    .modal-actions {
      flex-direction: column !important;
    }
    
    .modal-cancel-button,
    .modal-revise-button,
    .modal-approve-button {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .asset-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
  }
  
  @media (max-width: 480px) {
    .approval-card {
      padding: 12px !important;
    }
    
    .approval-meta {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ApprovalInterface;