// components/crm/LeadCard.js - COMPLETE FIXED VERSION WITH NEW COLOR SCHEME
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
      active: { backgroundColor: '#E8F5E9', color: '#013E37' },
      stale: { backgroundColor: '#FFEFB3', color: '#013E37' },
      converted: { backgroundColor: '#E8F5E9', color: '#013E37' },
      lost: { backgroundColor: '#FFEBEE', color: '#D32F2F' }
    };
    return styles[status] || { backgroundColor: '#F5F5F5', color: '#013E37' };
  };

  const getStageColor = (stage) => {
    const colors = {
      SCRAPED_SOURCED: '#013E37',
      INITIAL_VERIFICATION: '#0A5C54',
      FIRST_SEQUENCE_SENT: '#1A7A6E',
      FOLLOW_UP_PROTOCOL: '#2A9888',
      DISCOVERY_CALL_SCHEDULED: '#3AB6A2',
      PROPOSAL_PITCHED: '#4AD4BC',
      NEGOTIATING: '#5AF2D6',
      WON: '#013E37',
      LOST: '#D32F2F',
      INQUIRY: '#013E37',
      BRIEFING_DISCOVERY: '#0A5C54',
      AUDIT_PRESENTATION: '#1A7A6E',
      COMMERCIAL_PROPOSAL: '#2A9888',
      CONTRACT_SIGNING: '#3AB6A2',
      ONBOARDING: '#4AD4BC'
    };
    return colors[stage] || '#013E37';
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

  const stageColor = getStageColor(lead.currentStage);

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
              ...styles.stageBadge,
              backgroundColor: `${stageColor}20`,
              color: stageColor,
              borderColor: `${stageColor}40`
            }}>
              <span style={{...styles.stageDot, backgroundColor: stageColor}}></span>
              {lead.currentStage ? lead.currentStage.replace(/_/g, ' ') : 'N/A'}
            </span>
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
    border: '1px solid #FFEFB3',
    transition: 'all 0.3s ease',
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
    color: '#013E37',
    textDecoration: 'none',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    transition: 'color 0.2s ease',
  },
  contactName: {
    fontSize: '14px',
    color: '#013E37',
    opacity: 0.7,
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
    marginLeft: '12px',
    flexWrap: 'wrap',
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  stageBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '500',
    border: '1px solid',
    whiteSpace: 'nowrap',
  },
  stageDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
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
    color: '#013E37',
    opacity: 0.5,
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
    color: '#013E37',
    opacity: 0.7,
  },
  infoIcon: {
    width: '14px',
    height: '14px',
    color: '#013E37',
    opacity: 0.5,
    flexShrink: 0,
  },
  infoText: {
    fontSize: '13px',
    color: '#013E37',
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
    color: '#013E37',
    opacity: 0.6,
    flexWrap: 'wrap',
    gap: '8px',
    paddingTop: '12px',
    borderTop: '1px solid #FFEFB3',
  },
  footerText: {
    fontSize: '12px',
    color: '#013E37',
    opacity: 0.6,
  },
  assigneeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #FFEFB3',
  },
  assigneeAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '600',
  },
  assigneeName: {
    fontSize: '13px',
    color: '#013E37',
    opacity: 0.7,
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .card:hover {
    box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08) !important;
    border-color: #013E37 !important;
    transform: translateY(-2px);
  }
  
  .company-link:hover {
    color: #0A5C54 !important;
    text-decoration: none !important;
  }
  
  .more-button:hover {
    background-color: #FFEFB3 !important;
  }
  
  .more-button:hover .more-icon {
    opacity: 1 !important;
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
      justify-content: flex-start !important;
      gap: 6px !important;
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
    
    .header-right {
      flex-wrap: wrap !important;
    }
    
    .stage-badge,
    .status-badge {
      font-size: 10px !important;
      padding: 2px 6px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default LeadCard;