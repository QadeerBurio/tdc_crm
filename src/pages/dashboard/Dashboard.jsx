// pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Briefcase,
  UserPlus,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  DollarSign,
  Building2,
  UserCheck,
} from 'lucide-react';
import { Loader } from '../../components/common/Loader';
import axios from 'axios';
import toast from 'react-hot-toast';
import ExecutiveDashboard from './ExecutiveDashboard';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLeads: 0,
    totalProjects: 0,
    totalCompanies: 0,
    usersGrowth: 0,
    leadsGrowth: 0,
    projectsGrowth: 0,
    companiesGrowth: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [apiAvailable, setApiAvailable] = useState(true);

  // API base URL
  const API_URL =  'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
      toast.error('Please login to view dashboard');
    }
  }, [token]);

  const fetchDashboardData = async (isRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };

      // Fetch all stats in parallel
      const [usersRes, leadsRes, projectsRes, companiesRes, activityRes] = await Promise.allSettled([
        axios.get(`${API_URL}/users?limit=1`, config),
        axios.get(`${API_URL}/crm/leads?limit=1`, config),
        axios.get(`${API_URL}/projects?limit=1`, config),
        axios.get(`${API_URL}/crm/companies?limit=1`, config),
        axios.get(`${API_URL}/activities/recent?limit=4`, config),
      ]);

      let totalUsers = 0;
      let totalLeads = 0;
      let totalProjects = 0;
      let totalCompanies = 0;
      let activityData = [];

      // Process Users
      if (usersRes.status === 'fulfilled' && usersRes.value.data) {
        const data = usersRes.value.data;
        totalUsers = data.pagination?.total || data.data?.length || 0;
      }

      // Process Leads
      if (leadsRes.status === 'fulfilled' && leadsRes.value.data) {
        const data = leadsRes.value.data;
        totalLeads = data.pagination?.total || data.data?.length || 0;
      }

      // Process Projects
      if (projectsRes.status === 'fulfilled' && projectsRes.value.data) {
        const data = projectsRes.value.data;
        totalProjects = data.pagination?.total || data.data?.length || 0;
      }

      // Process Companies
      if (companiesRes.status === 'fulfilled' && companiesRes.value.data) {
        const data = companiesRes.value.data;
        totalCompanies = data.pagination?.total || data.data?.length || 0;
      }

      // Process Activity
      if (activityRes.status === 'fulfilled' && activityRes.value.data) {
        activityData = activityRes.value.data.data || activityRes.value.data || [];
      }

      // Set mock growth data (would come from real API in production)
      const mockGrowth = {
        usersGrowth: 8,
        leadsGrowth: 12,
        projectsGrowth: 5,
        companiesGrowth: 3,
      };

      setStats({
        totalUsers,
        totalLeads,
        totalProjects,
        totalCompanies,
        usersGrowth: mockGrowth.usersGrowth,
        leadsGrowth: mockGrowth.leadsGrowth,
        projectsGrowth: mockGrowth.projectsGrowth,
        companiesGrowth: mockGrowth.companiesGrowth,
      });

      setRecentActivity(activityData.length > 0 ? activityData : getDefaultActivity());
      setApiAvailable(true);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        logout();
      } else {
        // Use mock data for demo
        setStats({
          totalUsers: 24,
          totalLeads: 156,
          totalProjects: 42,
          totalCompanies: 18,
          usersGrowth: 8,
          leadsGrowth: 12,
          projectsGrowth: 5,
          companiesGrowth: 3,
        });
        setRecentActivity(getDefaultActivity());
        setApiAvailable(false);
        toast.error('Could not fetch dashboard data. Showing sample data.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDefaultActivity = () => [
    {
      id: 1,
      title: 'New lead added: TechCorp Inc.',
      time: '2 minutes ago',
      icon: 'UserPlus',
      color: '#3b82f6',
      bg: '#eff6ff',
    },
    {
      id: 2,
      title: 'Project "Website Redesign" created',
      time: '1 hour ago',
      icon: 'Briefcase',
      color: '#22c55e',
      bg: '#f0fdf4',
    },
    {
      id: 3,
      title: 'New user registered: Sarah Johnson',
      time: '3 hours ago',
      icon: 'Users',
      color: '#8b5cf6',
      bg: '#f5f3ff',
    },
    {
      id: 4,
      title: 'New company added: Acme Corp',
      time: '5 hours ago',
      icon: 'Building2',
      color: '#eab308',
      bg: '#fefce8',
    },
  ];

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      change: `${stats.usersGrowth || 0}%`,
      icon: Users,
      color: '#3b82f6',
      bg: '#eff6ff',
      link: '/admin/users',
    },
    {
      title: 'Total Leads',
      value: stats.totalLeads || 0,
      change: `${stats.leadsGrowth || 0}%`,
      icon: UserPlus,
      color: '#22c55e',
      bg: '#f0fdf4',
      link: '/crm/leads',
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects || 0,
      change: `${stats.projectsGrowth || 0}%`,
      icon: Briefcase,
      color: '#8b5cf6',
      bg: '#f5f3ff',
      link: '/projects',
    },
    {
      title: 'Total Companies',
      value: stats.totalCompanies || 0,
      change: `${stats.companiesGrowth || 0}%`,
      icon: Building2,
      color: '#eab308',
      bg: '#fefce8',
      link: '/crm/companies',
    },
  ];

  const getIconComponent = (iconName) => {
    const icons = {
      Users: Users,
      UserPlus: UserPlus,
      Briefcase: Briefcase,
      Building2: Building2,
      TrendingUp: TrendingUp,
      TrendingDown: TrendingDown,
    };
    return icons[iconName] || Users;
  };

  const displayActivity = recentActivity.length > 0 ? recentActivity : getDefaultActivity();

  return (
    <div style={styles.container}>
      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <div style={styles.welcomeHeader}>
          <div>
            <h1 style={styles.welcomeTitle}>
              Welcome back, {user?.firstName || user?.name || 'User'}! 👋
            </h1>
            <p style={styles.welcomeSubtitle}>
              Here's an overview of your business metrics.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            style={styles.refreshButton}
            disabled={refreshing}
          >
            <RefreshCw size={18} style={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
        {!apiAvailable && (
          <div style={styles.demoBanner}>
            ⚡ Using demo data - Connect your API for live data
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <Link to={stat.link} key={index} style={styles.statCardLink}>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statContent}>
                <div style={styles.statLeft}>
                  <p style={styles.statTitle}>{stat.title}</p>
                  <p style={styles.statValue}>{stat.value.toLocaleString()}</p>
                </div>
                <div style={{ ...styles.statIconWrapper, backgroundColor: stat.bg }}>
                  <stat.icon style={{ ...styles.statIcon, color: stat.color }} size={24} />
                </div>
              </div>
              <div style={styles.statChange}>
                <span style={parseInt(stat.change) >= 0 ? styles.changeUp : styles.changeDown}>
                  {parseInt(stat.change) >= 0 ? (
                    <TrendingUp style={styles.changeIcon} size={16} />
                  ) : (
                    <TrendingDown style={styles.changeIcon} size={16} />
                  )}
                  {stat.change}
                </span>
                <span style={styles.changeText}>vs last month</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <ExecutiveDashboard/>

     
      {/* CSS for animations and hover effects */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .stat-card {
          transition: all 0.2s ease;
        }
        .stat-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          transform: translateY(-2px);
        }
        .stat-card-link {
          text-decoration: none;
          display: block;
        }
        .quick-action {
          transition: all 0.2s ease;
        }
        .quick-action:hover {
          background-color: #dbeafe !important;
          transform: translateY(-2px);
        }
        .view-all-link:hover {
          color: #2563eb !important;
        }
        .activity-item:last-child {
          border-bottom: none !important;
          padding-bottom: 0 !important;
        }
        @media (max-width: 768px) {
          .bottom-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          .quick-actions-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .quick-actions-grid {
            grid-template-columns: 1fr !important;
          }
          .welcome-section {
            padding: 16px !important;
          }
          .welcome-title {
            font-size: 20px !important;
          }
        }
      `}</style>

      
    </div>
  );
};

const styles = {
  container: {
    padding: '0',
    maxWidth: '100%',
    width: '100%',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64vh',
  },
  welcomeSection: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    borderRadius: '12px',
    padding: '24px',
    color: '#ffffff',
    marginBottom: '24px',
  },
  welcomeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
  },
  welcomeSubtitle: {
    marginTop: '4px',
    color: '#bfdbfe',
    margin: '4px 0 0 0',
  },
  refreshButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    transition: 'background 0.2s ease',
  },
  demoBanner: {
    marginTop: '12px',
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#fbbf24',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  statCardLink: {
    textDecoration: 'none',
    display: 'block',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    height: '100%',
  },
  statContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLeft: {
    flex: 1,
  },
  statTitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginTop: '4px',
  },
  statIconWrapper: {
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    width: '24px',
    height: '24px',
  },
  statChange: {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  changeUp: {
    color: '#22c55e',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  changeDown: {
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  changeIcon: {
    width: '16px',
    height: '16px',
  },
  changeText: {
    color: '#6b7280',
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
  },
  cardHeaderBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  cardContent: {
    padding: '24px',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  quickAction: {
    padding: '16px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    display: 'block',
  },
  quickActionIconBlue: {
    margin: '0 auto',
    color: '#3b82f6',
  },
  quickActionIconGreen: {
    margin: '0 auto',
    color: '#22c55e',
  },
  quickActionIconPurple: {
    margin: '0 auto',
    color: '#8b5cf6',
  },
  quickActionIconYellow: {
    margin: '0 auto',
    color: '#eab308',
  },
  quickActionText: {
    display: 'block',
    marginTop: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  viewAllLink: {
    fontSize: '14px',
    color: '#3b82f6',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  viewAllIcon: {
    width: '16px',
    height: '16px',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f3f4f6',
  },
  activityIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activityIconSvg: {
    width: '16px',
    height: '16px',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: '14px',
    color: '#111827',
    margin: 0,
  },
  activityTime: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
};

export default Dashboard;