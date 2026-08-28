// components/crm/DealView.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Edit, Trash2, TrendingUp, Calendar, DollarSign, Users, CheckCircle, XCircle } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';

const DealView = ({ deal, onEdit, onDelete, onStageChange }) => {
  const { user } = useAuth();
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState('');

  const stages = ['qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

  const getStageColor = (stage) => {
    const colors = {
      qualification: 'bg-blue-100 text-blue-700',
      proposal: 'bg-yellow-100 text-yellow-700',
      negotiation: 'bg-purple-100 text-purple-700',
      closed_won: 'bg-green-100 text-green-700',
      closed_lost: 'bg-red-100 text-red-700',
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  const getStageStyle = (stage) => {
    const styles = {
      qualification: { backgroundColor: '#dbeafe', color: '#1e40af' },
      proposal: { backgroundColor: '#fef3c7', color: '#92400e' },
      negotiation: { backgroundColor: '#ede9fe', color: '#5b21b6' },
      closed_won: { backgroundColor: '#d1fae5', color: '#065f46' },
      closed_lost: { backgroundColor: '#fee2e2', color: '#991b1b' },
    };
    return styles[stage] || { backgroundColor: '#f3f4f6', color: '#374151' };
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  const formatPercentage = (value) => {
    if (!value) return '0%';
    return `${Math.round(value)}%`;
  };

  const handleStageChange = () => {
    if (selectedStage) {
      onStageChange?.(deal._id, selectedStage);
      setShowStageModal(false);
      setSelectedStage('');
    }
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>{deal.dealName || 'N/A'}</h2>
            <p style={styles.subtitle}>
              {deal.leadId?.companyName || deal.clientId?.companyName || 'No Company'}
            </p>
          </div>
          <div style={styles.actions}>
            <button style={styles.stageButton} onClick={() => setShowStageModal(true)}>
              <TrendingUp style={styles.buttonIcon} />
              Change Stage
            </button>
            <button style={styles.editButton} onClick={() => onEdit?.(deal)}>
              <Edit style={styles.buttonIcon} />
              Edit
            </button>
            <button style={styles.deleteButton} onClick={() => onDelete?.(deal._id)}>
              <Trash2 style={styles.buttonIcon} />
              Delete
            </button>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.statsGrid}>
            <div>
              <p style={styles.statLabel}>Value</p>
              <p style={styles.statValue}>{formatCurrency(deal.value)}</p>
            </div>
            <div>
              <p style={styles.statLabel}>Stage</p>
              <span style={{
                ...styles.stageBadge,
                ...getStageStyle(deal.stage)
              }}>
                {deal.stage ? deal.stage.replace('_', ' ').toUpperCase() : 'N/A'}
              </span>
            </div>
            <div>
              <p style={styles.statLabel}>Probability</p>
              <p style={styles.statValue}>{formatPercentage(deal.probability)}</p>
            </div>
            <div>
              <p style={styles.statLabel}>Expected Close</p>
              <p style={styles.statValue}>
                {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : 'N/A'}
              </p>
            </div>
          </div>

          {deal.description && (
            <div style={styles.descriptionContainer}>
              <p style={styles.descriptionText}>{deal.description}</p>
            </div>
          )}

          {deal.products && deal.products.length > 0 && (
            <div style={styles.productsSection}>
              <h4 style={styles.sectionTitle}>Products</h4>
              <div style={styles.productsList}>
                {deal.products.map((product, index) => (
                  <div key={index} style={styles.productItem}>
                    <div>
                      <p style={styles.productName}>{product.name}</p>
                      <p style={styles.productDetails}>
                        Qty: {product.quantity} × {formatCurrency(product.price)}
                      </p>
                    </div>
                    <p style={styles.productTotal}>
                      {formatCurrency(product.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {deal.assignedTo && (
            <div style={styles.assigneeContainer}>
              <div style={styles.assigneeAvatar}>
                {deal.assignedTo.firstName?.[0] || '?'}
              </div>
              <span style={styles.assigneeText}>
                Assigned to: {deal.assignedTo.firstName} {deal.assignedTo.lastName}
              </span>
            </div>
          )}

          {deal.activities && deal.activities.length > 0 && (
            <div style={styles.activitiesSection}>
              <h4 style={styles.sectionTitle}>Recent Activity</h4>
              <div style={styles.activitiesList}>
                {deal.activities.slice(-3).map((activity, index) => (
                  <div key={index} style={styles.activityItem}>
                    <span style={styles.activityDate}>{formatDate(activity.date)}</span>
                    <span style={styles.activityDescription}>{activity.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stage Change Modal */}
      <Modal
        isOpen={showStageModal}
        onClose={() => {
          setShowStageModal(false);
          setSelectedStage('');
        }}
        title="Change Stage"
      >
        <div style={styles.modalContent}>
          <div>
            <label style={styles.modalLabel}>Select Stage</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              style={styles.modalSelect}
            >
              <option value="">Select stage...</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.modalActions}>
            <button
              style={styles.modalCancelButton}
              onClick={() => {
                setShowStageModal(false);
                setSelectedStage('');
              }}
            >
              Cancel
            </button>
            <button
              style={styles.modalSubmitButton}
              onClick={handleStageChange}
              disabled={!selectedStage}
            >
              Update Stage
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const styles = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #E5E7EB',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  stageButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  buttonIcon: {
    width: '16px',
    height: '16px',
  },
  content: {
    padding: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  stageBadge: {
    display: 'inline-flex',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
  },
  descriptionText: {
    fontSize: '14px',
    color: '#374151',
    margin: 0,
  },
  productsSection: {
    marginTop: '16px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    margin: '0 0 8px 0',
  },
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  productItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '6px',
  },
  productName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
  },
  productDetails: {
    fontSize: '12px',
    color: '#6B7280',
    margin: 0,
  },
  productTotal: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  assigneeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
  },
  assigneeAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '500',
  },
  assigneeText: {
    fontSize: '14px',
    color: '#6B7280',
  },
  activitiesSection: {
    marginTop: '16px',
  },
  activitiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
  },
  activityDate: {
    color: '#6B7280',
  },
  activityDescription: {
    color: '#374151',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px',
  },
  modalSelect: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
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
  modalSubmitButton: {
    padding: '8px 16px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .stage-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .edit-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .delete-button:hover:not(:disabled) {
    background-color: #DC2626 !important;
  }
  
  .modal-cancel-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .modal-submit-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .modal-select:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  .modal-submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .actions {
      flex-direction: column !important;
    }
    
    .stage-button,
    .edit-button,
    .delete-button {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .stats-grid {
      grid-template-columns: 1fr 1fr !important;
    }
    
    .product-item {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    
    .modal-actions {
      flex-direction: column !important;
    }
    
    .modal-cancel-button,
    .modal-submit-button {
      width: 100% !important;
      justify-content: center !important;
    }
  }
  
  @media (max-width: 480px) {
    .content {
      padding: 16px !important;
    }
    
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    
    .header {
      padding: 12px 16px !important;
    }
    
    .title {
      font-size: 18px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default DealView;