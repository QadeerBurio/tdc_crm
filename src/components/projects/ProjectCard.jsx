// components/projects/ProjectCard.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Users, DollarSign, CheckCircle, MoreVertical } from 'lucide-react';
import Card, { CardContent } from '../common/Card';

const ProjectCard = ({ project, onDelete }) => {
  const { user } = useAuth();

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-700',
      'Planning': 'bg-blue-100 text-blue-700',
      'On Hold': 'bg-yellow-100 text-yellow-700',
      'Completed': 'bg-purple-100 text-purple-700',
      'Archived': 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Active': { backgroundColor: '#d1fae5', color: '#065f46' },
      'Planning': { backgroundColor: '#dbeafe', color: '#1e40af' },
      'On Hold': { backgroundColor: '#fef3c7', color: '#92400e' },
      'Completed': { backgroundColor: '#ede9fe', color: '#5b21b6' },
      'Archived': { backgroundColor: '#f3f4f6', color: '#374151' },
    };
    return styles[status] || styles.Active;
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

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardContent}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Link
              to={`/projects/${project._id}`}
              style={styles.projectLink}
            >
              {project.projectName}
            </Link>
            <p style={styles.clientName}>
              {project.clientId?.companyName || 'No Client'}
            </p>
          </div>
          <div style={styles.headerRight}>
            <span style={{
              ...styles.statusBadge,
              ...getStatusStyle(project.status)
            }}>
              {project.status || 'N/A'}
            </span>
            {onDelete && (
              <button
                onClick={() => onDelete(project)}
                style={styles.deleteButton}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Project Type & Date */}
        <div style={styles.metaRow}>
          <span style={styles.metaText}>{project.projectType || 'N/A'}</span>
          <span style={styles.metaText}>{formatDate(project.startDate)}</span>
        </div>

        {/* Progress */}
        <div style={styles.progressSection}>
          <div style={styles.progressRow}>
            <span style={styles.progressLabel}>Progress</span>
            <span style={styles.progressValue}>{project.completionPercentage || 0}%</span>
          </div>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${project.completionPercentage || 0}%`
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <Users style={styles.statIcon} />
            <span style={styles.statText}>{project.teamMembers?.length || 0}</span>
          </div>
          <div style={styles.statItem}>
            <DollarSign style={styles.statIcon} />
            <span style={styles.statText}>{formatCurrency(project.budget || 0)}</span>
          </div>
          <div style={styles.statItem}>
            <Calendar style={styles.statIcon} />
            <span style={styles.statText}>
              {project.endDate ? formatDate(project.endDate) : 'No end date'}
            </span>
          </div>
        </div>

        {/* Project Manager */}
        {project.projectManager && (
          <div style={styles.pmSection}>
            <div style={styles.pmAvatar}>
              {project.projectManager.firstName?.[0] || '?'}
            </div>
            <span style={styles.pmText}>
              PM: {project.projectManager.firstName} {project.projectManager.lastName}
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
  projectLink: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#3B82F6',
    textDecoration: 'none',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  clientName: {
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
  deleteButton: {
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9CA3AF',
    fontSize: '18px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '12px',
  },
  metaText: {
    fontSize: '14px',
    color: '#6B7280',
  },
  progressSection: {
    marginTop: '12px',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '14px',
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
    height: '8px',
    backgroundColor: '#E5E7EB',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginTop: '4px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: '9999px',
    transition: 'width 0.3s ease',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '12px',
    fontSize: '14px',
    color: '#6B7280',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statIcon: {
    width: '14px',
    height: '14px',
    color: '#9CA3AF',
  },
  statText: {
    fontSize: '14px',
    color: '#6B7280',
  },
  pmSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  pmAvatar: {
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
    flexShrink: 0,
  },
  pmText: {
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
  
  .project-link:hover {
    color: #1D4ED8 !important;
    text-decoration: underline !important;
  }
  
  .delete-button:hover {
    background-color: #FEE2E2 !important;
    color: #EF4444 !important;
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
    
    .stats-row {
      gap: 8px !important;
    }
  }
  
  @media (max-width: 480px) {
    .card-content {
      padding: 12px !important;
    }
    
    .project-link {
      font-size: 16px !important;
    }
    
    .stats-row {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 4px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ProjectCard;