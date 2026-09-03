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
      qualification: { bg: '#FFEFB3', text: '#013E37' },
      proposal: { bg: '#FFEFB3', text: '#013E37' },
      negotiation: { bg: '#FFEFB3', text: '#013E37' },
      closed_won: { bg: '#FFEFB3', text: '#013E37' },
      closed_lost: { bg: '#FFEFB3', text: '#013E37' },
    };
    return colors[stage] || { bg: '#FFEFB3', text: '#013E37' };
  };

  const getStageStyle = (stage) => {
    const styles = {
      qualification: { backgroundColor: '#FFEFB3', color: '#013E37' },
      proposal: { backgroundColor: '#FFEFB3', color: '#013E37' },
      negotiation: { backgroundColor: '#FFEFB3', color: '#013E37' },
      closed_won: { backgroundColor: '#FFEFB3', color: '#013E37' },
      closed_lost: { backgroundColor: '#FFEFB3', color: '#013E37' },
    };
    return styles[stage] || { backgroundColor: '#FFEFB3', color: '#013E37' };
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
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Value</p>
              <p style={styles.statValue}>{formatCurrency(deal.value)}</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Stage</p>
              <span style={{
                ...styles.stageBadge,
                ...getStageStyle(deal.stage)
              }}>
                {deal.stage ? deal.stage.replace('_', ' ').toUpperCase() : 'N/A'}
              </span>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Probability</p>
              <p style={styles.statValue}>{formatPercentage(deal.probability)}</p>
            </div>
            <div style={styles.statCard}>
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
    border: '1px solid #f0f0f0',
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
    color: '#013E37',
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
    backgroundColor: '#FFEFB3',
    color: '#013E37',
    border: '1px solid #FFEFB3',
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
    color: '#013E37',
    border: '1px solid #013E37',
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
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
  statCard: {
    backgroundColor: '#FFEFB3',
    padding: '16px',
    borderRadius: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#013E37',
    margin: 0,
    fontWeight: '500',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#013E37',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  stageBadge: {
    display: 'inline-flex',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600',
    marginTop: '4px',
  },
  descriptionContainer: {
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: '#FFEFB3',
    borderRadius: '8px',
  },
  descriptionText: {
    fontSize: '14px',
    color: '#013E37',
    margin: 0,
  },
  productsSection: {
    marginTop: '16px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#013E37',
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
    padding: '12px 16px',
    backgroundColor: '#FFEFB3',
    borderRadius: '8px',
  },
  productName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#013E37',
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
    color: '#013E37',
  },
  assigneeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: '#FFEFB3',
    borderRadius: '8px',
  },
  assigneeAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  assigneeText: {
    fontSize: '14px',
    color: '#013E37',
    fontWeight: '500',
  },
  activitiesSection: {
    marginTop: '16px',
  },
  activitiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    padding: '8px 12px',
    backgroundColor: '#FFEFB3',
    borderRadius: '6px',
  },
  activityDate: {
    color: '#013E37',
    fontWeight: '500',
  },
  activityDescription: {
    color: '#013E37',
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
    color: '#013E37',
    marginBottom: '4px',
  },
  modalSelect: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #013E37',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#013E37',
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
    color: '#013E37',
    border: '1px solid #013E37',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modalSubmitButton: {
    padding: '8px 16px',
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .stage-button:hover:not(:disabled) {
    background-color: #FFFFFF !important;
    border-color: #013E37 !important;
    box-shadow: 0 2px 8px rgba(1, 62, 55, 0.15) !important;
  }
  
  .edit-button:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
    border-color: #013E37 !important;
    box-shadow: 0 2px 8px rgba(1, 62, 55, 0.1) !important;
  }
  
  .delete-button:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
    color: #013E37 !important;
    box-shadow: 0 2px 8px rgba(1, 62, 55, 0.2) !important;
  }
  
  .modal-cancel-button:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
    border-color: #FFEFB3 !important;
  }
  
  .modal-submit-button:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
    color: #013E37 !important;
    box-shadow: 0 2px 8px rgba(1, 62, 55, 0.2) !important;
  }
  
  .modal-select:focus {
    border-color: #013E37 !important;
    box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1) !important;
    background-color: #FFEFB3 !important;
  }
  
  .modal-submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .stat-card {
    transition: all 0.2s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(1, 62, 55, 0.1);
  }
  
  .product-item {
    transition: all 0.2s ease;
  }
  
  .product-item:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(1, 62, 55, 0.08);
  }
  
  .activity-item {
    transition: all 0.2s ease;
  }
  
  .activity-item:hover {
    background-color: #FFFFFF !important;
    box-shadow: 0 2px 8px rgba(1, 62, 55, 0.08);
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