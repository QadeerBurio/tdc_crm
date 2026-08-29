// pages/SuperAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  Users,
  Building2,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Zap,
  Briefcase,
  UserPlus,
  DollarSign,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLeads: 0,
    totalProjects: 0,
    totalCompanies: 0,
    totalRevenue: 0,
    activeProjects: 0,
    averageProductivity: 0,
    usersGrowth: 0,
    leadsGrowth: 0,
    projectsGrowth: 0,
    companiesGrowth: 0,
    revenueGrowth: 0,
    productivityGrowth: 0,
  });
  const [brands, setBrands] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
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

      // Fetch all data in parallel
      const [
        usersRes,
        leadsRes,
        projectsRes,
        companiesRes,
        revenueRes,
        brandsRes,
        activityRes
      ] = await Promise.allSettled([
        axios.get(`${API_URL}/users?limit=1`, config),
        axios.get(`${API_URL}/crm/leads?limit=1`, config),
        axios.get(`${API_URL}/projects?limit=1`, config),
        axios.get(`${API_URL}/crm/companies?limit=1`, config),
        axios.get(`${API_URL}/analytics/revenue`, config),
        axios.get(`${API_URL}/analytics/brands`, config),
        axios.get(`${API_URL}/analytics/activities/recent`, config)
      ]);

      let totalUsers = 0;
      let totalLeads = 0;
      let totalProjects = 0;
      let totalCompanies = 0;
      let totalRevenue = 0;
      let activeProjects = 0;
      let averageProductivity = 0;
      let brandsData = [];
      let activityData = [];

      // Process Users
      if (usersRes.status === 'fulfilled' && usersRes.value.data) {
        totalUsers = usersRes.value.data.pagination?.total || usersRes.value.data.data?.length || 0;
      }

      // Process Leads
      if (leadsRes.status === 'fulfilled' && leadsRes.value.data) {
        totalLeads = leadsRes.value.data.pagination?.total || leadsRes.value.data.data?.length || 0;
      }

      // Process Projects
      if (projectsRes.status === 'fulfilled' && projectsRes.value.data) {
        const data = projectsRes.value.data;
        totalProjects = data.pagination?.total || data.data?.length || 0;
        activeProjects = data.data?.filter(p => p.status === 'active').length || 0;
      }

      // Process Companies
      if (companiesRes.status === 'fulfilled' && companiesRes.value.data) {
        totalCompanies = companiesRes.value.data.pagination?.total || companiesRes.value.data.data?.length || 0;
      }

      // Process Revenue
      if (revenueRes.status === 'fulfilled' && revenueRes.value.data) {
        totalRevenue = revenueRes.value.data.totalRevenue || 0;
      }

      // Process Brands - ensure it's an array
      if (brandsRes.status === 'fulfilled' && brandsRes.value.data) {
        const data = brandsRes.value.data;
        brandsData = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      }

      // Process Activity - ensure it's an array
      if (activityRes.status === 'fulfilled' && activityRes.value.data) {
        const data = activityRes.value.data;
        activityData = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      }

      // Mock growth data
      const mockGrowth = {
        usersGrowth: 8,
        leadsGrowth: 12,
        projectsGrowth: 5,
        companiesGrowth: 3,
        revenueGrowth: 15,
        productivityGrowth: 7,
      };

      // Default brands if none fetched or invalid
      if (!brandsData || brandsData.length === 0) {
        brandsData = [
          { brandName: 'Tech Solutions', revenue: 125000, leads: 45, clients: 28, growth: 12 },
          { brandName: 'Creative Agency', revenue: 87500, leads: 32, clients: 19, growth: 8 },
          { brandName: 'Digital Marketing', revenue: 62000, leads: 28, clients: 15, growth: 15 },
          { brandName: 'Software Development', revenue: 156000, leads: 52, clients: 34, growth: 20 },
        ];
      }

      // Default activity if none fetched or invalid
      if (!activityData || activityData.length === 0) {
        activityData = getDefaultActivity();
      }

      setStats({
        totalUsers,
        totalLeads,
        totalProjects,
        totalCompanies,
        totalRevenue,
        activeProjects,
        averageProductivity: 78,
        usersGrowth: mockGrowth.usersGrowth,
        leadsGrowth: mockGrowth.leadsGrowth,
        projectsGrowth: mockGrowth.projectsGrowth,
        companiesGrowth: mockGrowth.companiesGrowth,
        revenueGrowth: mockGrowth.revenueGrowth,
        productivityGrowth: mockGrowth.productivityGrowth,
      });

      setBrands(brandsData);
      setRecentActivity(activityData);
      setApiAvailable(true);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      } else {
        // Use mock data
        setStats({
          totalUsers: 124,
          totalLeads: 156,
          totalProjects: 42,
          totalCompanies: 18,
          totalRevenue: 284500,
          activeProjects: 28,
          averageProductivity: 78,
          usersGrowth: 8,
          leadsGrowth: 12,
          projectsGrowth: 5,
          companiesGrowth: 3,
          revenueGrowth: 15,
          productivityGrowth: 7,
        });
        setBrands([
          { brandName: 'Tech Solutions', revenue: 125000, leads: 45, clients: 28, growth: 12 },
          { brandName: 'Creative Agency', revenue: 87500, leads: 32, clients: 19, growth: 8 },
          { brandName: 'Digital Marketing', revenue: 62000, leads: 28, clients: 15, growth: 15 },
          { brandName: 'Software Development', revenue: 156000, leads: 52, clients: 34, growth: 20 },
        ]);
        setRecentActivity(getDefaultActivity());
        setApiAvailable(false);
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
      type: 'lead',
      status: 'new',
    },
    {
      id: 2,
      title: 'Project "Website Redesign" created',
      time: '1 hour ago',
      type: 'project',
      status: 'completed',
    },
    {
      id: 3,
      title: 'New user registered: Sarah Johnson',
      time: '3 hours ago',
      type: 'user',
      status: 'new',
    },
    {
      id: 4,
      title: 'Company added: Acme Corp',
      time: '5 hours ago',
      type: 'company',
      status: 'active',
    },
    {
      id: 5,
      title: 'Revenue milestone: $250,000 reached',
      time: '1 day ago',
      type: 'revenue',
      status: 'success',
    },
  ];

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loaderWrapper}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: stats.usersGrowth,
      icon: Users,
      color: '#3b82f6',
      bg: '#eff6ff',
      link: '/admin/users',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueGrowth,
      icon: DollarSign,
      color: '#22c55e',
      bg: '#f0fdf4',
      link: '/analytics/revenue',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      change: stats.projectsGrowth,
      icon: Briefcase,
      color: '#8b5cf6',
      bg: '#f5f3ff',
      link: '/projects',
    },
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      change: stats.leadsGrowth,
      icon: UserPlus,
      color: '#f59e0b',
      bg: '#fffbeb',
      link: '/crm/leads',
    },
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      change: stats.companiesGrowth,
      icon: Building2,
      color: '#ef4444',
      bg: '#fef2f2',
      link: '/crm/companies',
    },
    {
      title: 'Avg Productivity',
      value: `${stats.averageProductivity}%`,
      change: stats.productivityGrowth,
      icon: Activity,
      color: '#06b6d4',
      bg: '#ecfeff',
      link: '/analytics/productivity',
    },
  ];

  const getActivityIcon = (type) => {
    const icons = {
      lead: { icon: UserPlus, color: '#3b82f6', bg: '#eff6ff' },
      project: { icon: Briefcase, color: '#8b5cf6', bg: '#f5f3ff' },
      user: { icon: Users, color: '#22c55e', bg: '#f0fdf4' },
      company: { icon: Building2, color: '#f59e0b', bg: '#fffbeb' },
      revenue: { icon: DollarSign, color: '#06b6d4', bg: '#ecfeff' },
    };
    return icons[type] || icons.lead;
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { label: 'New', color: '#3b82f6', bg: '#eff6ff' },
      completed: { label: 'Completed', color: '#22c55e', bg: '#f0fdf4' },
      active: { label: 'Active', color: '#8b5cf6', bg: '#f5f3ff' },
      success: { label: 'Success', color: '#06b6d4', bg: '#ecfeff' },
      pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb' },
    };
    return badges[status] || badges.new;
  };

  // Safely render activity items - ensure recentActivity is an array
  const renderActivityItems = () => {
    if (!Array.isArray(recentActivity) || recentActivity.length === 0) {
      return (
        <div style={styles.emptyState}>
          <Activity size={32} style={{ color: '#9ca3af', margin: '0 auto 8px', display: 'block' }} />
          <p style={styles.emptyStateText}>No recent activity</p>
        </div>
      );
    }

    return recentActivity.map((activity) => {
      const iconInfo = getActivityIcon(activity.type);
      const IconComponent = iconInfo.icon;
      const statusBadge = getStatusBadge(activity.status);
      return (
        <div key={activity.id || Math.random()} style={styles.activityItem}>
          <div style={{ ...styles.activityIcon, backgroundColor: iconInfo.bg }}>
            <IconComponent style={{ ...styles.activityIconSvg, color: iconInfo.color }} size={16} />
          </div>
          <div style={styles.activityContent}>
            <p style={styles.activityTitle}>{activity.title || 'Unknown activity'}</p>
            <div style={styles.activityMeta}>
              <span style={styles.activityTime}>{activity.time || 'Just now'}</span>
              <span style={{
                ...styles.activityBadge,
                backgroundColor: statusBadge.bg,
                color: statusBadge.color,
              }}>
                {statusBadge.label}
              </span>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div style={styles.container}>
      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <div style={styles.welcomeHeader}>
          <div>
            <h1 style={styles.welcomeTitle}>
              Welcome back, {user?.firstName || user?.name || 'Super Admin'}! 👋
            </h1>
            <p style={styles.welcomeSubtitle}>
              Here's your executive overview of company-wide performance
            </p>
          </div>
          <div style={styles.welcomeActions}>
            <div style={styles.periodSelector}>
              <button
                style={{ ...styles.periodBtn, ...(selectedPeriod === 'week' ? styles.periodBtnActive : {}) }}
                onClick={() => setSelectedPeriod('week')}
              >
                Week
              </button>
              <button
                style={{ ...styles.periodBtn, ...(selectedPeriod === 'month' ? styles.periodBtnActive : {}) }}
                onClick={() => setSelectedPeriod('month')}
              >
                Month
              </button>
              <button
                style={{ ...styles.periodBtn, ...(selectedPeriod === 'year' ? styles.periodBtnActive : {}) }}
                onClick={() => setSelectedPeriod('year')}
              >
                Year
              </button>
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
        </div>
        {!apiAvailable && (
          <div style={styles.demoBanner}>
            <Zap size={16} style={{ marginRight: '8px' }} />
            Using demo data - Connect your API for live data
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <Link to={stat.link} key={index} style={styles.statCardLink}>
            <div style={styles.statCard}>
              <div style={styles.statContent}>
                <div style={styles.statLeft}>
                  <p style={styles.statTitle}>{stat.title}</p>
                  <p style={styles.statValue}>{stat.value}</p>
                </div>
                <div style={{ ...styles.statIconWrapper, backgroundColor: stat.bg }}>
                  <stat.icon style={{ ...styles.statIcon, color: stat.color }} size={24} />
                </div>
              </div>
              <div style={styles.statFooter}>
                <span style={stat.change >= 0 ? styles.changeUp : styles.changeDown}>
                  {stat.change >= 0 ? (
                    <TrendingUp style={styles.changeIcon} size={16} />
                  ) : (
                    <TrendingDown style={styles.changeIcon} size={16} />
                  )}
                  {Math.abs(stat.change)}%
                </span>
                <span style={styles.changeText}>vs last month</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Grid: Segment Performance + Recent Activity */}
      <div style={styles.bottomGrid}>
        {/* Segment Performance */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderBetween}>
              <h2 style={styles.cardTitle}>Segment Performance</h2>
              <Link to="/analytics/brands" style={styles.viewAllLink}>
                View All <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.brandsGrid}>
              {Array.isArray(brands) && brands.map((brand, index) => (
                <div key={index} style={styles.brandCard}>
                  <div style={styles.brandHeader}>
                    <h3 style={styles.brandName}>{brand.brandName || 'Unknown'}</h3>
                    <span style={{
                      ...styles.brandBadge,
                      backgroundColor: (brand.revenue || 0) > 100000 ? '#f0fdf4' : '#fffbeb',
                      color: (brand.revenue || 0) > 100000 ? '#22c55e' : '#f59e0b',
                    }}>
                      {(brand.revenue || 0) > 100000 ? 'High' : 'Medium'}
                    </span>
                  </div>
                  <div style={styles.brandStats}>
                    <div style={styles.brandStat}>
                      <span style={styles.brandStatLabel}>Revenue</span>
                      <span style={styles.brandStatValue}>${(brand.revenue || 0).toLocaleString()}</span>
                    </div>
                    <div style={styles.brandStat}>
                      <span style={styles.brandStatLabel}>Leads</span>
                      <span style={styles.brandStatValue}>{brand.leads || 0}</span>
                    </div>
                    <div style={styles.brandStat}>
                      <span style={styles.brandStatLabel}>Clients</span>
                      <span style={styles.brandStatValue}>{brand.clients || 0}</span>
                    </div>
                    <div style={styles.brandStat}>
                      <span style={styles.brandStatLabel}>Growth</span>
                      <span style={{
                        ...styles.brandStatValue,
                        color: (brand.growth || 0) > 10 ? '#22c55e' : '#f59e0b',
                      }}>
                        {brand.growth || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderBetween}>
              <h2 style={styles.cardTitle}>Recent Activity</h2>
              <Link to="/activities" style={styles.viewAllLink}>
                View All <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.activityList}>
              {renderActivityItems()}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActionsSection}>
        <div style={styles.quickActionsGrid}>
          <Link to="/admin/users/new" style={styles.quickAction}>
            <Users size={24} style={styles.quickActionIconBlue} />
            <span style={styles.quickActionText}>Add User</span>
          </Link>
          <Link to="/crm/leads/new" style={styles.quickAction}>
            <Target size={24} style={styles.quickActionIconGreen} />
            <span style={styles.quickActionText}>Create Goal</span>
          </Link>
          <Link to="/crm/companies/new" style={styles.quickAction}>
            <Building2 size={24} style={styles.quickActionIconPurple} />
            <span style={styles.quickActionText}>New Segment</span>
          </Link>
          <Link to="/analytics/reports" style={styles.quickAction}>
            <BarChart3 size={24} style={styles.quickActionIconYellow} />
            <span style={styles.quickActionText}>View Reports</span>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .stat-card {
          transition: all 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .brand-card {
          transition: all 0.2s ease;
        }
        .brand-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .quick-action {
          transition: all 0.2s ease;
        }
        .quick-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .activity-item {
          transition: background 0.2s ease;
        }
        .activity-item:hover {
          background: #f9fafb;
        }
        @media (max-width: 1024px) {
          .bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .welcome-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .welcome-actions {
            flex-direction: column !important;
            width: 100% !important;
          }
          .period-selector {
            width: 100% !important;
            justify-content: center !important;
          }
          .brands-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .quick-actions-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .brands-grid {
            grid-template-columns: 1fr !important;
          }
          .quick-actions-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .welcome-section {
            padding: 16px !important;
          }
          .welcome-title {
            font-size: 20px !important;
          }
          .stat-value {
            font-size: 18px !important;
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
    minHeight: '60vh',
  },
  loaderWrapper: {
    textAlign: 'center',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e5e7eb',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
  loadingText: {
    marginTop: '12px',
    color: '#6b7280',
    fontSize: '14px',
  },
  welcomeSection: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    borderRadius: '16px',
    padding: '28px 32px',
    color: '#ffffff',
    marginBottom: '24px',
  },
  welcomeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  welcomeTitle: {
    fontSize: '26px',
    fontWeight: '700',
    margin: 0,
  },
  welcomeSubtitle: {
    marginTop: '4px',
    color: '#bfdbfe',
    margin: '4px 0 0 0',
    fontSize: '15px',
  },
  welcomeActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  periodSelector: {
    display: 'flex',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: '8px',
    padding: '4px',
    gap: '2px',
  },
  periodBtn: {
    padding: '6px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  periodBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    color: '#ffffff',
  },
  refreshButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: '#ffffff',
    padding: '8px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  demoBanner: {
    marginTop: '14px',
    padding: '10px 16px',
    background: 'rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#fcd34d',
    display: 'flex',
    alignItems: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  statCardLink: {
    textDecoration: 'none',
    display: 'block',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px 22px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #f3f4f6',
    transition: 'all 0.2s ease',
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
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
    fontWeight: '500',
  },
  statValue: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#111827',
    marginTop: '4px',
  },
  statIconWrapper: {
    padding: '10px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statIcon: {
    width: '22px',
    height: '22px',
  },
  statFooter: {
    marginTop: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  changeUp: {
    color: '#22c55e',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '600',
  },
  changeDown: {
    color: '#ef4444',
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
    color: '#6b7280',
    fontSize: '13px',
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
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #f3f4f6',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #f3f4f6',
  },
  cardHeaderBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  cardContent: {
    padding: '20px 24px',
  },
  viewAllLink: {
    fontSize: '14px',
    color: '#3b82f6',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '500',
  },
  brandsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  brandCard: {
    padding: '16px',
    backgroundColor: '#fafbfc',
    borderRadius: '10px',
    border: '1px solid #f3f4f6',
    transition: 'all 0.2s ease',
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  brandName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  brandBadge: {
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  brandStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
  },
  brandStat: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandStatLabel: {
    fontSize: '11px',
    color: '#6b7280',
  },
  brandStatValue: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
  },
  activityIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activityIconSvg: {
    width: '18px',
    height: '18px',
  },
  activityContent: {
    flex: 1,
    minWidth: 0,
  },
  activityTitle: {
    fontSize: '14px',
    color: '#111827',
    margin: 0,
    fontWeight: '500',
  },
  activityMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  },
  activityTime: {
    fontSize: '12px',
    color: '#6b7280',
  },
  activityBadge: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '1px 10px',
    borderRadius: '12px',
  },
  quickActionsSection: {
    marginTop: '4px',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  quickAction: {
    padding: '18px 16px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #f3f4f6',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    display: 'block',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
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
    color: '#f59e0b',
  },
  quickActionText: {
    display: 'block',
    marginTop: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: '14px',
    margin: 0,
  },
};

export default SuperAdminDashboard;