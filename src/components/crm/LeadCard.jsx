// components/crm/LeadCard.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Mail, Phone, Building2, MapPin, MoreVertical } from 'lucide-react';
import Card, { CardContent } from '../common/Card';

const LeadCard = ({ lead, onAction }) => {
  const { user } = useAuth();

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      stale: 'bg-yellow-100 text-yellow-700',
      converted: 'bg-blue-100 text-blue-700',
      lost: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusStyle = (status) => {
    const styles = {
      active: { backgroundColor: '#d1fae5', color: '#065f46' },
      stale: { backgroundColor: '#fef3c7', color: '#92400e' },
      converted: { backgroundColor: '#dbeafe', color: '#1e40af' },
      lost: { backgroundColor: '#fee2e2', color: '#991b1b' }
    };
    return styles[status] || { backgroundColor: '#f3f4f6', color: '#374151' };
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

  return (
    <div style={styles.card}>
      <div style={styles.cardContent}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Link
              to={`/crm/leads/${lead._id}`}
              style={styles.companyLink}
            >
              {lead.companyName || 'N/A'}
            </Link>
            <p style={styles.contactName}>{lead.contactName || 'N/A'}</p>
          </div>
          <div style={styles.headerRight}>
            <span style={{
              ...styles.statusBadge,
              ...getStatusStyle(lead.status)
            }}>
              {lead.status ? lead.status.charAt(0).toUpperCase() + lead.status.slice(1) : 'N/A'}
            </span>
            <button
              onClick={() => onAction?.(lead)}
              style={styles.moreButton}
            >
              <MoreVertical style={styles.moreIcon} />
            </button>
          </div>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <Mail style={styles.infoIcon} />
            <span style={styles.infoText}>{lead.email || 'N/A'}</span>
          </div>
          {lead.phone && (
            <div style={styles.infoItem}>
              <Phone style={styles.infoIcon} />
              <span style={styles.infoText}>{lead.phone}</span>
            </div>
          )}
          {lead.industry && (
            <div style={styles.infoItem}>
              <Building2 style={styles.infoIcon} />
              <span style={styles.infoText}>{lead.industry}</span>
            </div>
          )}
          {lead.city && (
            <div style={styles.infoItem}>
              <MapPin style={styles.infoIcon} />
              <span style={styles.infoText}>{lead.city}, {lead.country || 'N/A'}</span>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <span style={styles.footerText}>Source: {lead.leadSource || 'N/A'}</span>
          <span style={styles.footerText}>Created: {formatDate(lead.createdAt)}</span>
          {lead.leadScore && (
            <span style={styles.footerText}>Score: {lead.leadScore}</span>
          )}
        </div>

        {lead.assignedTo && (
          <div style={styles.assigneeContainer}>
            <div style={styles.assigneeAvatar}>
              {lead.assignedTo.firstName?.[0] || '?'}
            </div>
            <span style={styles.assigneeName}>
              {lead.assignedTo.firstName} {lead.assignedTo.lastName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.3s ease',
    overflow: 'hidden',
  },
  cardContent: {
    padding: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  companyLink: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#3B82F6',
    textDecoration: 'none',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  contactName: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
    marginLeft: '12px',
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  moreButton: {
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreIcon: {
    width: '16px',
    height: '16px',
    color: '#9CA3AF',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '12px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6B7280',
  },
  infoIcon: {
    width: '12px',
    height: '12px',
    color: '#9CA3AF',
    flexShrink: 0,
  },
  infoText: {
    fontSize: '14px',
    color: '#6B7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '12px',
    fontSize: '12px',
    color: '#6B7280',
    flexWrap: 'wrap',
    gap: '8px',
  },
  footerText: {
    fontSize: '12px',
    color: '#6B7280',
  },
  assigneeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  assigneeAvatar: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '500',
  },
  assigneeName: {
    fontSize: '12px',
    color: '#6B7280',
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  }
  
  .company-link:hover {
    color: #1D4ED8 !important;
    text-decoration: underline !important;
  }
  
  .more-button:hover {
    background-color: #F3F4F6 !important;
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    
    .header-right {
      margin-left: 0 !important;
      margin-top: 8px !important;
      width: 100% !important;
      justify-content: space-between !important;
    }
    
    .info-grid {
      grid-template-columns: 1fr !important;
    }
    
    .footer {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
  }
  
  @media (max-width: 480px) {
    .card-content {
      padding: 12px !important;
    }
    
    .company-link {
      font-size: 16px !important;
    }
    
    .info-item {
      font-size: 13px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default LeadCard;