// pages/Dashboard.jsx - COMPLETE FIXED VERSION WITH NEW COLOR SCHEME
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

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

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

      if (usersRes.status === 'fulfilled' && usersRes.value.data) {
        const data = usersRes.value.data;
        totalUsers = data.pagination?.total || data.data?.length || 0;
      }

      if (leadsRes.status === 'fulfilled' && leadsRes.value.data) {
        const data = leadsRes.value.data;
        totalLeads = data.pagination?.total || data.data?.length || 0;
      }

      if (projectsRes.status === 'fulfilled' && projectsRes.value.data) {
        const data = projectsRes.value.data;
        totalProjects = data.pagination?.total || data.data?.length || 0;
      }

      if (companiesRes.status === 'fulfilled' && companiesRes.value.data) {
        const data = companiesRes.value.data;
        totalCompanies = data.pagination?.total || data.data?.length || 0;
      }

      if (activityRes.status === 'fulfilled' && activityRes.value.data) {
        activityData = activityRes.value.data.data || activityRes.value.data || [];
      }

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
      color: '#013E37',
      bg: '#E8F5E9',
    },
    {
      id: 2,
      title: 'Project "Website Redesign" created',
      time: '1 hour ago',
      icon: 'Briefcase',
      color: '#013E37',
      bg: '#E8F5E9',
    },
    {
      id: 3,
      title: 'New user registered: Sarah Johnson',
      time: '3 hours ago',
      icon: 'Users',
      color: '#013E37',
      bg: '#FFEFB3',
    },
    {
      id: 4,
      title: 'New company added: Acme Corp',
      time: '5 hours ago',
      icon: 'Building2',
      color: '#013E37',
      bg: '#FFEFB3',
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
      color: '#013E37',
      bg: '#E8F5E9',
      link: '/admin/users',
    },
    {
      title: 'Total Leads',
      value: stats.totalLeads || 0,
      change: `${stats.leadsGrowth || 0}%`,
      icon: UserPlus,
      color: '#013E37',
      bg: '#E8F5E9',
      link: '/crm/leads',
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects || 0,
      change: `${stats.projectsGrowth || 0}%`,
      icon: Briefcase,
      color: '#013E37',
      bg: '#FFEFB3',
      link: '/projects',
    },
    {
      title: 'Total Companies',
      value: stats.totalCompanies || 0,
      change: `${stats.companiesGrowth || 0}%`,
      icon: Building2,
      color: '#013E37',
      bg: '#FFEFB3',
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

      <ExecutiveDashboard />

      {/* CSS for animations and hover effects */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .stat-card {
          transition: all 0.3s ease;
          border: 1px solid #FFEFB3;
        }
        .stat-card:hover {
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.12) !important;
          transform: translateY(-3px);
          border-color: #013E37;
        }
        .stat-card-link {
          text-decoration: none;
          display: block;
        }
        .quick-action {
          transition: all 0.3s ease;
          border: 1px solid #FFEFB3;
        }
        .quick-action:hover {
          background-color: #FFEFB3 !important;
          transform: translateY(-2px);
          border-color: #013E37;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.08);
        }
        .view-all-link:hover {
          color: #0A5C54 !important;
        }
        .activity-item:last-child {
          border-bottom: none !important;
          padding-bottom: 0 !important;
        }
        .dashboard-card {
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
        }
        .dashboard-card:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
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
    padding: '24px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    background: '#FFFFFF',
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64vh',
    background: '#FFFFFF',
  },
  welcomeSection: {
    background: 'linear-gradient(135deg, #013E37 0%, #0A5C54 100%)',
    borderRadius: '12px',
    padding: '24px 32px',
    color: '#FFFFFF',
    marginBottom: '24px',
    border: '1px solid #013E37',
    boxShadow: '0 4px 16px rgba(1, 62, 55, 0.15)',
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
    color: '#FFFFFF',
  },
  welcomeSubtitle: {
    marginTop: '4px',
    color: '#FFEFB3',
    margin: '4px 0 0 0',
    fontSize: '15px',
    opacity: 0.9,
  },
  refreshButton: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    color: '#FFFFFF',
    padding: '8px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  refreshButtonHover: {
    background: 'rgba(255, 255, 255, 0.25)',
    borderColor: '#FFEFB3',
  },
  demoBanner: {
    marginTop: '12px',
    padding: '8px 16px',
    background: 'rgba(255, 239, 179, 0.2)',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#FFEFB3',
    border: '1px solid rgba(255, 239, 179, 0.2)',
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
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #FFEFB3',
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
    color: '#013E37',
    opacity: 0.7,
    margin: 0,
    fontWeight: '500',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#013E37',
    marginTop: '4px',
  },
  statIconWrapper: {
    padding: '12px',
    borderRadius: '10px',
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
    color: '#013E37',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '600',
  },
  changeDown: {
    color: '#D32F2F',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '600',
  },
  changeIcon: {
    width: '16px',
    height: '16px',
  },
  changeText: {
    color: '#013E37',
    opacity: 0.5,
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #FFEFB3',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #FFEFB3',
  },
  cardHeaderBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#013E37',
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
    backgroundColor: '#FFFFFF',
    border: '1px solid #FFEFB3',
    borderRadius: '8px',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'block',
  },
  quickActionIconBlue: {
    margin: '0 auto',
    color: '#013E37',
  },
  quickActionIconGreen: {
    margin: '0 auto',
    color: '#013E37',
  },
  quickActionIconPurple: {
    margin: '0 auto',
    color: '#013E37',
  },
  quickActionIconYellow: {
    margin: '0 auto',
    color: '#013E37',
  },
  quickActionText: {
    display: 'block',
    marginTop: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#013E37',
  },
  viewAllLink: {
    fontSize: '14px',
    color: '#013E37',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
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
    borderBottom: '1px solid #FFEFB3',
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
    color: '#013E37',
    margin: 0,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: '12px',
    color: '#013E37',
    opacity: 0.5,
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
};

export default Dashboard;