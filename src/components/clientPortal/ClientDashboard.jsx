// pages/client/ClientDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../common/Card';
import { 
  FolderKanban, 
  Clock, 
  FileText, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RetainerHealth from './RetainerHealth';
import ApprovalInterface from './ApprovalInterface';
import axios from 'axios';
import toast from 'react-hot-toast';

const ClientDashboard = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    tasks: [],
    approvals: [],
    retainer: null,
    recentActivity: [],
    metrics: {
      activeProjects: 0,
      pendingTasks: 0,
      pendingApprovals: 0,
      retainerHealth: 0
    }
  });

  // API base URL
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (user?.clientId) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/clients/dashboard/${user.clientId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        const data = response.data.data || {};
        setDashboardData({
          projects: data.projects || [],
          tasks: data.tasks || [],
          approvals: data.approvals || [],
          retainer: data.retainer || null,
          recentActivity: data.recentActivity || [],
          metrics: {
            activeProjects: data.metrics?.activeProjects || 0,
            pendingTasks: data.metrics?.pendingTasks || 0,
            pendingApprovals: data.metrics?.pendingApprovals || 0,
            retainerHealth: data.metrics?.retainerHealth || 0
          }
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      let errorMessage = 'Failed to load dashboard data.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view this dashboard.';
        } else if (err.response.status === 404) {
          errorMessage = 'Dashboard data not found.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'text-green-600 bg-green-50',
      'On Hold': 'text-yellow-600 bg-yellow-50',
      'Completed': 'text-blue-600 bg-blue-50',
      'Planning': 'text-gray-600 bg-gray-50',
      'Backlog': 'text-gray-600 bg-gray-50',
      'In Progress': 'text-blue-600 bg-blue-50',
      'Internal QA': 'text-purple-600 bg-purple-50',
      'Client Review': 'text-orange-600 bg-orange-50',
      'Approved': 'text-green-600 bg-green-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorContent}>
          <AlertCircle style={styles.errorIcon} />
          <p style={styles.errorText}>Failed to load dashboard data</p>
          <button style={styles.retryButton} onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <h1 style={styles.welcomeTitle}>
          Welcome back, {user?.firstName || 'Client'}!
        </h1>
        <p style={styles.welcomeSubtitle}>
          Here's what's happening with your projects
        </p>
      </div>

      {/* Quick Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Active Projects</p>
              <p style={styles.statValue}>{dashboardData.metrics.activeProjects || 0}</p>
            </div>
            <FolderKanban style={{...styles.statIcon, color: '#3B82F6'}} />
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Pending Tasks</p>
              <p style={styles.statValue}>{dashboardData.metrics.pendingTasks || 0}</p>
            </div>
            <Clock style={{...styles.statIcon, color: '#F59E0B'}} />
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Pending Approvals</p>
              <p style={styles.statValue}>{dashboardData.metrics.pendingApprovals || 0}</p>
            </div>
            <FileText style={{...styles.statIcon, color: '#8B5CF6'}} />
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Retainer Health</p>
              <p style={{...styles.statValue, color: '#22C55E'}}>
                {dashboardData.metrics.retainerHealth || 0}%
              </p>
            </div>
            <DollarSign style={{...styles.statIcon, color: '#22C55E'}} />
          </div>
        </div>
      </div>

      {/* Retainer Health */}
      {dashboardData.retainer && (
        <RetainerHealth retainerData={dashboardData.retainer} />
      )}

      {/* Projects Section */}
      <div>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Your Projects</h2>
          <Link to="/client/projects" style={styles.viewAllLink}>
            View All →
          </Link>
        </div>
        <div style={styles.projectsGrid}>
          {dashboardData.projects.slice(0, 4).map((project) => (
            <Link 
              key={project._id} 
              to={`/client/projects/${project._id}`}
              style={styles.projectLink}
            >
              <div style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={styles.projectTitle}>{project.projectName}</h3>
                  <span style={{
                    ...styles.projectStatus,
                    ...parseColorStyle(getStatusColor(project.status))
                  }}>
                    {project.status || 'N/A'}
                  </span>
                </div>
                <p style={styles.projectDescription}>{project.description}</p>
                <div style={styles.projectProgress}>
                  <div style={styles.progressRow}>
                    <span style={styles.progressLabel}>Progress</span>
                    <span style={styles.progressValue}>{project.completionPercentage || 0}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${project.completionPercentage || 0}%`
                    }} />
                  </div>
                  <div style={styles.projectStats}>
                    <span style={styles.statText}>
                      Tasks: {project.taskStats?.completed || 0}/{project.taskStats?.total || 0}
                    </span>
                    <span style={styles.statText}>
                      Due: {project.endDate ? formatDate(project.endDate) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Approvals Section */}
      <div>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Pending Approvals</h2>
          <Link to="/client/approvals" style={styles.viewAllLink}>
            View All →
          </Link>
        </div>
        {dashboardData.approvals.length > 0 ? (
          <ApprovalInterface 
            approvals={dashboardData.approvals.slice(0, 3)} 
            onApprovalUpdate={fetchDashboardData}
          />
        ) : (
          <div style={styles.emptyCard}>
            <CheckCircle style={styles.emptyIcon} />
            <p style={styles.emptyText}>No pending approvals</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActionsGrid}>
        <div style={styles.quickActionCard}>
          <Link to="/client/messages" style={styles.quickActionLink}>
            <MessageSquare style={styles.quickActionIcon} />
            <span style={styles.quickActionText}>Send Message</span>
          </Link>
        </div>
        <div style={styles.quickActionCard}>
          <Link to="/client/reports" style={styles.quickActionLink}>
            <FileText style={styles.quickActionIcon} />
            <span style={styles.quickActionText}>View Reports</span>
          </Link>
        </div>
        <div style={styles.quickActionCard}>
          <Link to="/client/calendar" style={styles.quickActionLink}>
            <Calendar style={styles.quickActionIcon} />
            <span style={styles.quickActionText}>Schedule Call</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Helper function to parse color styles
const parseColorStyle = (colorString) => {
  if (!colorString) return { color: '#6B7280', backgroundColor: '#F3F4F6' };
  const parts = colorString.split(' ');
  return {
    color: parts[0]?.replace('text-', '') || '#6B7280',
    backgroundColor: parts[1]?.replace('bg-', '') || '#F3F4F6'
  };
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  errorContent: {
    textAlign: 'center',
  },
  errorIcon: {
    width: '48px',
    height: '48px',
    color: '#EF4444',
    margin: '0 auto 16px',
  },
  errorText: {
    color: '#6B7280',
    marginBottom: '12px',
  },
  retryButton: {
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
  welcomeSection: {
    background: 'linear-gradient(135deg, #3B82F6, #4F46E5)',
    borderRadius: '12px',
    padding: '24px',
    color: '#FFFFFF',
    marginBottom: '24px',
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
  },
  welcomeSubtitle: {
    color: '#BFDBFE',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
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
    color: '#111827',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  statIcon: {
    width: '32px',
    height: '32px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  viewAllLink: {
    fontSize: '14px',
    color: '#3B82F6',
    textDecoration: 'none',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  projectLink: {
    textDecoration: 'none',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.3s ease',
    cursor: 'pointer',
    height: '100%',
  },
  projectHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  projectTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    flex: 1,
    marginRight: '8px',
  },
  projectStatus: {
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  projectDescription: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 12px 0',
  },
  projectProgress: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  progressRow: {
    display: 'flex',
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
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: '9999px',
    transition: 'width 0.5s ease',
  },
  projectStats: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#6B7280',
    marginTop: '4px',
  },
  statText: {
    fontSize: '13px',
    color: '#6B7280',
  },
  emptyCard: {
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
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '24px',
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '16px',
  },
  quickActionLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#374151',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
  quickActionIcon: {
    width: '20px',
    height: '20px',
    color: '#6B7280',
  },
  quickActionText: {
    fontSize: '14px',
    fontWeight: '500',
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
  
  .retry-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .project-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  }
  
  .view-all-link:hover {
    color: #1D4ED8 !important;
    text-decoration: underline !important;
  }
  
  .quick-action-link:hover {
    color: #3B82F6 !important;
  }
  
  .quick-action-link:hover .quick-action-icon {
    color: #3B82F6 !important;
  }
  
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    
    .projects-grid {
      grid-template-columns: 1fr !important;
    }
    
    .quick-actions-grid {
      grid-template-columns: 1fr !important;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 16px !important;
    }
    
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    
    .welcome-title {
      font-size: 20px !important;
    }
    
    .section-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ClientDashboard;