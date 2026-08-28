// components/client/RetainerHealth.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../common/Card';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign
} from 'lucide-react';

const RetainerHealth = ({ retainerData }) => {
  const { user } = useAuth();

  if (!retainerData) {
    return (
      <div style={styles.emptyState}>
        <p style={styles.emptyText}>No retainer data available</p>
      </div>
    );
  }

  const {
    healthPercentage = 0,
    completed = 0,
    remaining = 0,
    total = 0,
    deliverables = [],
    monthlyFee = 0,
    startDate,
    endDate,
    usedHours = 0,
    retainerHours = 0,
    status = 'active'
  } = retainerData;

  const getHealthColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600 bg-green-50 border-green-600';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-600';
    return 'text-red-600 bg-red-50 border-red-600';
  };

  const getHealthColorStyle = (percentage) => {
    if (percentage >= 75) return { color: '#16A34A', backgroundColor: '#D1FAE5', borderColor: '#16A34A' };
    if (percentage >= 50) return { color: '#CA8A04', backgroundColor: '#FEF3C7', borderColor: '#CA8A04' };
    return { color: '#DC2626', backgroundColor: '#FEE2E2', borderColor: '#DC2626' };
  };

  const getHealthBarColor = (percentage) => {
    if (percentage >= 75) return '#22C55E';
    if (percentage >= 50) return '#EAB308';
    return '#EF4444';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadgeStyle = (status) => {
    const badges = {
      'active': { backgroundColor: '#D1FAE5', color: '#065F46' },
      'pending': { backgroundColor: '#FEF3C7', color: '#92400E' },
      'expired': { backgroundColor: '#FEE2E2', color: '#991B1B' },
      'cancelled': { backgroundColor: '#F3F4F6', color: '#374151' }
    };
    return badges[status] || badges.cancelled;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'active': <CheckCircle style={styles.statusIconSmall} />,
      'pending': <Clock style={styles.statusIconSmall} />,
      'expired': <AlertCircle style={styles.statusIconSmall} />,
      'cancelled': <AlertCircle style={styles.statusIconSmall} />
    };
    return icons[status] || <Clock style={styles.statusIconSmall} />;
  };

  const healthStyle = getHealthColorStyle(healthPercentage);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={{
          ...styles.header,
          borderColor: healthStyle.borderColor,
          backgroundColor: healthStyle.backgroundColor,
        }}>
          <div style={styles.headerLeft}>
            <h2 style={styles.title}>Retainer Health Dashboard</h2>
            <p style={styles.subtitle}>Monthly deliverables and progress tracking</p>
          </div>
          <div style={{
            ...styles.healthBadge,
            color: healthStyle.color,
            backgroundColor: healthStyle.backgroundColor,
            borderColor: healthStyle.borderColor,
          }}>
            <span style={styles.healthBadgeContent}>
              {healthPercentage >= 75 ? <TrendingUp style={styles.healthIcon} /> : <TrendingDown style={styles.healthIcon} />}
              <span>{healthPercentage}% Healthy</span>
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Quick Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{completed}</div>
              <div style={styles.statLabel}>Completed</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{remaining}</div>
              <div style={styles.statLabel}>Remaining</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{total}</div>
              <div style={styles.statLabel}>Total Deliverables</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{formatCurrency(monthlyFee)}</div>
              <div style={styles.statLabel}>Monthly Fee</div>
            </div>
          </div>

          {/* Health Progress Bar */}
          <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
              <span style={styles.progressLabel}>Overall Health</span>
              <span style={styles.progressValue}>{healthPercentage}%</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: `${healthPercentage}%`,
                backgroundColor: getHealthBarColor(healthPercentage)
              }} />
            </div>
          </div>

          {/* Deliverables List */}
          {deliverables && deliverables.length > 0 && (
            <div style={styles.deliverablesSection}>
              <h4 style={styles.deliverablesTitle}>Deliverables Progress</h4>
              <div style={styles.deliverablesList}>
                {deliverables.map((item, index) => {
                  const progress = item.quantity > 0 
                    ? Math.round((item.completed / item.quantity) * 100) 
                    : 0;
                  return (
                    <div key={index} style={styles.deliverableItem}>
                      <div style={styles.deliverableHeader}>
                        <span style={styles.deliverableName}>{item.name}</span>
                        <span style={styles.deliverableCount}>
                          {item.completed} / {item.quantity} {item.unit || 'items'}
                        </span>
                      </div>
                      <div style={styles.deliverableProgressBar}>
                        <div style={{
                          ...styles.deliverableProgressFill,
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: getHealthBarColor(progress)
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hours Usage */}
          {retainerHours > 0 && (
            <div style={styles.hoursSection}>
              <h4 style={styles.hoursTitle}>Hours Usage</h4>
              <div style={styles.hoursContainer}>
                <div style={styles.hoursHeader}>
                  <span style={styles.hoursLabel}>Used Hours</span>
                  <span style={styles.hoursValue}>{usedHours} / {retainerHours} hours</span>
                </div>
                <div style={styles.hoursProgressBar}>
                  <div style={{
                    ...styles.hoursProgressFill,
                    width: `${Math.min((usedHours / retainerHours) * 100, 100)}%`,
                    backgroundColor: getHealthBarColor((usedHours / retainerHours) * 100)
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* Retainer Info */}
          <div style={styles.retainerInfoGrid}>
            <div style={styles.retainerInfoItem}>
              <Calendar style={styles.retainerInfoIcon} />
              <span style={styles.retainerInfoText}>
                Started: {formatDate(startDate)}
              </span>
            </div>
            <div style={styles.retainerInfoItem}>
              <Calendar style={styles.retainerInfoIcon} />
              <span style={styles.retainerInfoText}>
                Ends: {formatDate(endDate)}
              </span>
            </div>
            <div style={styles.retainerInfoItem}>
              <DollarSign style={styles.retainerInfoIcon} />
              <span style={styles.retainerInfoText}>
                Monthly: {formatCurrency(monthlyFee)}
              </span>
            </div>
            <div style={styles.retainerInfoItem}>
              <span style={styles.retainerStatusLabel}>Status:</span>
              <span style={{
                ...styles.retainerStatusBadge,
                ...getStatusBadgeStyle(status)
              }}>
                <span style={styles.retainerStatusIconWrapper}>
                  {getStatusIcon(status)}
                </span>
                <span style={styles.retainerStatusText}>
                  {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '24px',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  emptyText: {
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  header: {
    padding: '20px 24px',
    borderBottom: '2px solid',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    flex: 1,
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
  healthBadge: {
    padding: '8px 16px',
    borderRadius: '9999px',
    fontSize: '14px',
    fontWeight: '500',
    border: '2px solid',
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  healthBadgeContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  healthIcon: {
    width: '16px',
    height: '16px',
  },
  body: {
    padding: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  statItem: {
    textAlign: 'center',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  progressSection: {
    marginBottom: '24px',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '4px',
  },
  progressLabel: {
    color: '#6B7280',
  },
  progressValue: {
    fontWeight: '500',
    color: '#111827',
  },
  progressBar: {
    width: '100%',
    height: '12px',
    backgroundColor: '#E5E7EB',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 1s ease',
  },
  deliverablesSection: {
    marginBottom: '24px',
  },
  deliverablesTitle: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#374151',
    margin: '0 0 12px 0',
  },
  deliverablesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  deliverableItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    padding: '12px',
  },
  deliverableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    marginBottom: '4px',
  },
  deliverableName: {
    fontWeight: '500',
    color: '#111827',
  },
  deliverableCount: {
    color: '#6B7280',
  },
  deliverableProgressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: '#E5E7EB',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  deliverableProgressFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.5s ease',
  },
  hoursSection: {
    marginBottom: '24px',
  },
  hoursTitle: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#374151',
    margin: '0 0 8px 0',
  },
  hoursContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    padding: '12px',
  },
  hoursHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  hoursLabel: {
    color: '#6B7280',
  },
  hoursValue: {
    fontWeight: '500',
    color: '#111827',
  },
  hoursProgressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: '#E5E7EB',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginTop: '8px',
  },
  hoursProgressFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.5s ease',
  },
  retainerInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
  },
  retainerInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6B7280',
  },
  retainerInfoIcon: {
    width: '16px',
    height: '16px',
    flexShrink: 0,
  },
  retainerInfoText: {
    fontSize: '14px',
    color: '#6B7280',
  },
  retainerStatusLabel: {
    fontSize: '14px',
    color: '#6B7280',
  },
  retainerStatusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  retainerStatusIconWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  statusIconSmall: {
    width: '14px',
    height: '14px',
  },
  retainerStatusText: {
    textTransform: 'capitalize',
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .stat-item:hover {
    background-color: #F3F4F6 !important;
    transition: background-color 0.2s ease;
  }
  
  .deliverable-item:hover {
    background-color: #F3F4F6 !important;
    transition: background-color 0.2s ease;
  }
  
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    
    .retainer-info-grid {
      grid-template-columns: 1fr !important;
    }
    
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .health-badge {
      align-self: flex-start !important;
    }
  }
  
  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    
    .body {
      padding: 16px !important;
    }
    
    .header {
      padding: 16px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default RetainerHealth;