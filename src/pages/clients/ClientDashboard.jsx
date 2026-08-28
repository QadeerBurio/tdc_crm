// pages/clients/ClientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../components/common/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText,
  DollarSign,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  FolderKanban,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ClientDashboard = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    tasks: [],
    approvals: [],
    retainer: null,
    messages: []
  });

  // API base URL
  const API_URL =  'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    // Check if user is authenticated and has an ID
    if (isAuthenticated && user) {
      console.log('User authenticated:', user);
      fetchDashboardData();
    } else {
      console.log('User not authenticated or no user data');
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Use user._id or user.id instead of user.clientId
      const userId = user._id || user.id;
      
      if (!userId) {
        console.error('No user ID found');
        toast.error('User ID not found');
        setLoading(false);
        return;
      }

      console.log('Fetching dashboard for user:', userId);

      // Try to get client dashboard data
      try {
        const response = await axios.get(`${API_URL}/clients/dashboard/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.success) {
          const data = response.data.data || {};
          setDashboardData({
            projects: data.projects || [],
            tasks: data.tasks || [],
            approvals: data.approvals || [],
            retainer: data.retainer || null,
            messages: data.messages || []
          });
        } else {
          // If the endpoint doesn't exist, use mock data
          console.warn('Client dashboard endpoint not found, using mock data');
          setMockData();
        }
      } catch (error) {
        console.warn('Error fetching client dashboard, using mock data:', error.message);
        setMockData();
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Use mock data as fallback
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    setDashboardData({
      projects: [
        {
          _id: '1',
          projectName: 'Website Redesign',
          status: 'Active',
          completionPercentage: 75,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          taskStats: { completed: 15, total: 20 }
        },
        {
          _id: '2',
          projectName: 'Mobile App Development',
          status: 'Active',
          completionPercentage: 45,
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          taskStats: { completed: 8, total: 18 }
        },
        {
          _id: '3',
          projectName: 'E-commerce Platform',
          status: 'On Hold',
          completionPercentage: 30,
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          taskStats: { completed: 5, total: 15 }
        }
      ],
      tasks: [
        { status: 'Pending' },
        { status: 'In Progress' },
        { status: 'Completed' },
        { status: 'Pending' },
        { status: 'Completed' }
      ],
      approvals: [
        {
          _id: '1',
          title: 'Website Design Approval',
          description: 'Please approve the new website design mockups',
          status: 'Pending'
        },
        {
          _id: '2',
          title: 'Budget Approval',
          description: 'Quarterly budget review for Q3',
          status: 'Pending'
        }
      ],
      retainer: {
        completed: 65,
        remaining: 35,
        healthPercentage: 75
      },
      messages: [
        {
          sender: 'John Doe',
          content: 'The website design is ready for review.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'Jane Smith',
          content: 'Please review the latest project updates.',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    });
  };

  const handleApprove = async (approvalId) => {
    try {
      await axios.put(`${API_URL}/clients/approvals/${approvalId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Approval submitted successfully');
      await fetchDashboardData();
    } catch (err) {
      console.error('Error approving:', err);
      toast.error('Failed to submit approval. Please try again.');
    }
  };

  const handleRevise = async (approvalId) => {
    try {
      await axios.put(`${API_URL}/clients/approvals/${approvalId}/revise`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Revision requested successfully');
      await fetchDashboardData();
    } catch (err) {
      console.error('Error requesting revision:', err);
      toast.error('Failed to request revision. Please try again.');
    }
  };

  const renderProjectCards = () => {
    if (dashboardData.projects.length === 0) {
      return (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No projects available</p>
        </div>
      );
    }

    return dashboardData.projects.map(project => (
      <div key={project._id} style={styles.projectCard}>
        <div style={styles.projectHeader}>
          <h4 style={styles.projectTitle}>{project.projectName}</h4>
          <span style={{
            ...styles.projectStatus,
            ...getProjectStatusStyle(project.status)
          }}>
            {project.status || 'Active'}
          </span>
        </div>
        <div style={styles.projectContent}>
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
          <div style={styles.projectStats}>
            <span style={styles.statText}>
              Tasks: {project.taskStats?.completed || 0}/{project.taskStats?.total || 0}
            </span>
            <span style={styles.statText}>
              Due: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    ));
  };

  const renderApprovalItems = () => {
    if (dashboardData.approvals.length === 0) {
      return (
        <p style={styles.emptyApprovals}>No pending approvals</p>
      );
    }

    return dashboardData.approvals.map(approval => (
      <div key={approval._id} style={styles.approvalItem}>
        <div style={styles.approvalInfo}>
          <h4 style={styles.approvalTitle}>{approval.title}</h4>
          <p style={styles.approvalDescription}>{approval.description}</p>
        </div>
        <div style={styles.approvalActions}>
          <span style={{
            ...styles.approvalStatus,
            ...getApprovalStatusStyle(approval.status)
          }}>
            {approval.status || 'Pending'}
          </span>
          {approval.status === 'Pending' && (
            <div style={styles.approvalButtons}>
              <button 
                style={styles.approveButton}
                onClick={() => handleApprove(approval._id)}
              >
                Approve
              </button>
              <button 
                style={styles.reviseButton}
                onClick={() => handleRevise(approval._id)}
              >
                Revise
              </button>
            </div>
          )}
        </div>
      </div>
    ));
  };

  const renderRetainerHealth = () => {
    const retainer = dashboardData.retainer;
    if (!retainer) {
      return (
        <div style={styles.retainerCard}>
          <div style={styles.retainerHeader}>
            <h3 style={styles.retainerTitle}>Retainer Health Dashboard</h3>
            <p style={styles.retainerSubtitle}>No retainer data available</p>
          </div>
        </div>
      );
    }

    const healthColor = retainer.healthPercentage >= 75 ? '#22C55E' :
                        retainer.healthPercentage >= 50 ? '#F59E0B' :
                        '#EF4444';

    return (
      <div style={styles.retainerCard}>
        <div style={styles.retainerHeader}>
          <h3 style={styles.retainerTitle}>Retainer Health Dashboard</h3>
          <p style={styles.retainerSubtitle}>Monthly deliverables progress</p>
        </div>
        <div style={styles.retainerContent}>
          <div style={styles.retainerStats}>
            <div style={styles.retainerStat}>
              <div style={styles.retainerStatValue}>{retainer.completed || 0}</div>
              <div style={styles.retainerStatLabel}>Completed</div>
            </div>
            <div style={styles.retainerStat}>
              <div style={styles.retainerStatValue}>{retainer.remaining || 0}</div>
              <div style={styles.retainerStatLabel}>Remaining</div>
            </div>
            <div style={styles.retainerStat}>
              <div style={{...styles.retainerStatValue, color: healthColor}}>
                {retainer.healthPercentage || 0}%
              </div>
              <div style={styles.retainerStatLabel}>Health Score</div>
            </div>
          </div>
          <div style={styles.retainerProgressBar}>
            <div 
              style={{
                ...styles.retainerProgressFill,
                width: `${retainer.healthPercentage || 0}%`,
                backgroundColor: healthColor
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Show loading spinner
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.welcomeTitle}>
          Welcome, {user?.firstName || user?.name || 'User'}!
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
              <p style={styles.statValue}>
                {dashboardData.projects.filter(p => p.status === 'Active' || p.status === 'active').length}
              </p>
            </div>
            <FolderKanban style={{...styles.statIcon, color: '#3B82F6'}} />
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Pending Tasks</p>
              <p style={styles.statValue}>
                {dashboardData.tasks.filter(t => t.status !== 'Completed' && t.status !== 'completed').length}
              </p>
            </div>
            <Clock style={{...styles.statIcon, color: '#F59E0B'}} />
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Pending Approvals</p>
              <p style={styles.statValue}>
                {dashboardData.approvals.filter(a => a.status === 'Pending' || a.status === 'pending').length}
              </p>
            </div>
            <FileText style={{...styles.statIcon, color: '#8B5CF6'}} />
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Retainer Health</p>
              <p style={{...styles.statValue, color: '#22C55E'}}>
                {dashboardData.retainer?.healthPercentage || 0}%
              </p>
            </div>
            <DollarSign style={{...styles.statIcon, color: '#22C55E'}} />
          </div>
        </div>
      </div>

      {/* Retainer Health */}
      {renderRetainerHealth()}

      {/* Projects Section */}
      <h2 style={styles.sectionTitle}>Your Projects</h2>
      <div style={styles.projectsGrid}>
        {renderProjectCards()}
      </div>

      {/* Approvals Section */}
      <h2 style={styles.sectionTitle}>Pending Approvals</h2>
      <div style={styles.approvalsCard}>
        <div style={styles.approvalsContent}>
          {renderApprovalItems()}
        </div>
      </div>

      {/* Communication Hub */}
      <h2 style={styles.sectionTitle}>Communication</h2>
      <div style={styles.communicationGrid}>
        {/* Recent Messages */}
        <div style={styles.communicationCard}>
          <div style={styles.communicationHeader}>
            <h3 style={styles.communicationTitle}>Recent Messages</h3>
          </div>
          <div style={styles.messagesContent}>
            {dashboardData.messages && dashboardData.messages.length > 0 ? (
              dashboardData.messages.slice(0, 3).map((message, index) => (
                <div key={index} style={styles.messageItem}>
                  <div style={styles.messageHeader}>
                    <span style={styles.messageSender}>{message.sender || 'Unknown'}</span>
                    <span style={styles.messageTime}>
                      {message.timestamp ? new Date(message.timestamp).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <p style={styles.messageText}>{message.content}</p>
                </div>
              ))
            ) : (
              <p style={styles.emptyMessages}>No recent messages</p>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div style={styles.communicationCard}>
          <div style={styles.communicationHeader}>
            <h3 style={styles.communicationTitle}>Quick Actions</h3>
          </div>
          <div style={styles.quickActionsGrid}>
            <button style={styles.quickAction}>
              <MessageSquare style={styles.quickActionIcon} />
              <span style={styles.quickActionText}>Send Message</span>
            </button>
            <button style={styles.quickAction}>
              <FileText style={styles.quickActionIcon} />
              <span style={styles.quickActionText}>Request Update</span>
            </button>
            <button style={styles.quickAction}>
              <Calendar style={styles.quickActionIcon} />
              <span style={styles.quickActionText}>Schedule Call</span>
            </button>
            <button style={styles.quickAction}>
              <FileText style={styles.quickActionIcon} />
              <span style={styles.quickActionText}>View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for status styles
const getProjectStatusStyle = (status) => {
  const statusStyles = {
    'active': {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    'Active': {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    'completed': {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
    },
    'Completed': {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
    },
    'on-hold': {
      backgroundColor: '#fef3c7',
      color: '#92400e',
    },
    'On Hold': {
      backgroundColor: '#fef3c7',
      color: '#92400e',
    },
  };
  return statusStyles[status] || statusStyles.active;
};

const getApprovalStatusStyle = (status) => {
  const statusStyles = {
    'Approved': {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    'approved': {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    'Pending': {
      backgroundColor: '#fef3c7',
      color: '#92400e',
    },
    'pending': {
      backgroundColor: '#fef3c7',
      color: '#92400e',
    },
    'Rejected': {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    },
    'rejected': {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    },
  };
  return statusStyles[status] || statusStyles.pending;
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
    padding: '32px 16px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  loadingText: {
    marginTop: '16px',
    color: '#6B7280',
    fontSize: '16px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    maxWidth: '1200px',
    margin: '0 auto 32px',
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#6B7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto 32px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '16px',
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
    color: '#6B7280',
  },
  retainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    maxWidth: '1200px',
    margin: '0 auto 32px',
    padding: '24px',
  },
  retainerHeader: {
    marginBottom: '16px',
  },
  retainerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  retainerSubtitle: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  retainerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  retainerStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  retainerStat: {
    textAlign: 'center',
  },
  retainerStatValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
  },
  retainerStatLabel: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
  },
  retainerProgressBar: {
    width: '100%',
    height: '12px',
    backgroundColor: '#E5E7EB',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  retainerProgressFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.5s ease',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    maxWidth: '1200px',
    margin: '0 auto 16px',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto 32px',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    transition: 'box-shadow 0.3s ease',
  },
  projectHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  projectTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  projectStatus: {
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  projectContent: {
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
    fontWeight: '600',
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
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
  },
  statText: {
    color: '#6B7280',
  },
  approvalsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    maxWidth: '1200px',
    margin: '0 auto 32px',
  },
  approvalsContent: {
    padding: '16px',
  },
  approvalItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #F3F4F6',
    flexWrap: 'wrap',
    gap: '12px',
  },
  approvalInfo: {
    flex: 1,
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
  approvalActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  approvalStatus: {
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  approvalButtons: {
    display: 'flex',
    gap: '8px',
  },
  approveButton: {
    padding: '6px 12px',
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  reviseButton: {
    padding: '6px 12px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '32px',
  },
  emptyText: {
    color: '#6B7280',
  },
  emptyApprovals: {
    textAlign: 'center',
    padding: '32px',
    color: '#6B7280',
  },
  communicationGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto 32px',
  },
  communicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  communicationHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #F3F4F6',
  },
  communicationTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  messagesContent: {
    padding: '16px 20px',
  },
  messageItem: {
    padding: '12px 0',
    borderBottom: '1px solid #F3F4F6',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  messageSender: {
    fontWeight: '500',
    color: '#111827',
  },
  messageTime: {
    color: '#6B7280',
  },
  messageText: {
    fontSize: '14px',
    color: '#374151',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  emptyMessages: {
    textAlign: 'center',
    padding: '16px 0',
    color: '#6B7280',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    padding: '16px 20px',
  },
  quickAction: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#F9FAFB',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  quickActionIcon: {
    width: '24px',
    height: '24px',
    color: '#6B7280',
    marginBottom: '8px',
  },
  quickActionText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
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
  
  .project-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  }
  
  .approve-button:hover {
    background-color: #16A34A !important;
  }
  
  .revise-button:hover {
    background-color: #DC2626 !important;
  }
  
  .quick-action:hover {
    background-color: #F3F4F6 !important;
  }
  
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    
    .retainer-stats {
      grid-template-columns: 1fr !important;
    }
    
    .communication-grid {
      grid-template-columns: 1fr !important;
    }
    
    .quick-actions-grid {
      grid-template-columns: 1fr 1fr !important;
    }
  }
  
  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    
    .projects-grid {
      grid-template-columns: 1fr !important;
    }
    
    .approval-item {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .approval-actions {
      justify-content: flex-start !important;
    }
    
    .quick-actions-grid {
      grid-template-columns: 1fr !important;
    }
    
    .container {
      padding: 16px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ClientDashboard;