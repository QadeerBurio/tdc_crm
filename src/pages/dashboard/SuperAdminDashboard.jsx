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

      if (usersRes.status === 'fulfilled' && usersRes.value.data) {
        totalUsers = usersRes.value.data.pagination?.total || usersRes.value.data.data?.length || 0;
      }

      if (leadsRes.status === 'fulfilled' && leadsRes.value.data) {
        totalLeads = leadsRes.value.data.pagination?.total || leadsRes.value.data.data?.length || 0;
      }

      if (projectsRes.status === 'fulfilled' && projectsRes.value.data) {
        const data = projectsRes.value.data;
        totalProjects = data.pagination?.total || data.data?.length || 0;
        activeProjects = data.data?.filter(p => p.status === 'active').length || 0;
      }

      if (companiesRes.status === 'fulfilled' && companiesRes.value.data) {
        totalCompanies = companiesRes.value.data.pagination?.total || companiesRes.value.data.data?.length || 0;
      }

      if (revenueRes.status === 'fulfilled' && revenueRes.value.data) {
        totalRevenue = revenueRes.value.data.totalRevenue || 0;
      }

      if (brandsRes.status === 'fulfilled' && brandsRes.value.data) {
        const data = brandsRes.value.data;
        brandsData = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      }

      if (activityRes.status === 'fulfilled' && activityRes.value.data) {
        const data = activityRes.value.data;
        activityData = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      }

      const mockGrowth = {
        usersGrowth: 8,
        leadsGrowth: 12,
        projectsGrowth: 5,
        companiesGrowth: 3,
        revenueGrowth: 15,
        productivityGrowth: 7,
      };

      if (!brandsData || brandsData.length === 0) {
        brandsData = [
          { brandName: 'Tech Solutions', revenue: 125000, leads: 45, clients: 28, growth: 12 },
          { brandName: 'Creative Agency', revenue: 87500, leads: 32, clients: 19, growth: 8 },
          { brandName: 'Digital Marketing', revenue: 62000, leads: 28, clients: 15, growth: 15 },
          { brandName: 'Software Development', revenue: 156000, leads: 52, clients: 34, growth: 20 },
        ];
      }

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
      color: '#013E37',
      bg: '#FFEFB3',
      link: '/admin/users',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueGrowth,
      icon: DollarSign,
      color: '#013E37',
      bg: '#FFEFB3',
      link: '/analytics/revenue',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      change: stats.projectsGrowth,
      icon: Briefcase,
      color: '#013E37',
      bg: '#FFEFB3',
      link: '/projects',
    },
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      change: stats.leadsGrowth,
      icon: UserPlus,
      color: '#013E37',
      bg: '#FFEFB3',
      link: '/crm/leads',
    },
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      change: stats.companiesGrowth,
      icon: Building2,
      color: '#013E37',
      bg: '#FFEFB3',
      link: '/crm/companies',
    },
    {
      title: 'Avg Productivity',
      value: `${stats.averageProductivity}%`,
      change: stats.productivityGrowth,
      icon: Activity,
      color: '#013E37',
      bg: '#FFEFB3',
      link: '/analytics/productivity',
    },
  ];

  const getActivityIcon = (type) => {
    const icons = {
      lead: { icon: UserPlus, color: '#013E37', bg: '#FFEFB3' },
      project: { icon: Briefcase, color: '#013E37', bg: '#FFEFB3' },
      user: { icon: Users, color: '#013E37', bg: '#FFEFB3' },
      company: { icon: Building2, color: '#013E37', bg: '#FFEFB3' },
      revenue: { icon: DollarSign, color: '#013E37', bg: '#FFEFB3' },
    };
    return icons[type] || icons.lead;
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { label: 'New', color: '#013E37', bg: '#FFEFB3' },
      completed: { label: 'Completed', color: '#013E37', bg: '#FFEFB3' },
      active: { label: 'Active', color: '#013E37', bg: '#FFEFB3' },
      success: { label: 'Success', color: '#013E37', bg: '#FFEFB3' },
      pending: { label: 'Pending', color: '#013E37', bg: '#FFEFB3' },
    };
    return badges[status] || badges.new;
  };

  const renderActivityItems = () => {
    if (!Array.isArray(recentActivity) || recentActivity.length === 0) {
      return (
        <div style={styles.emptyState}>
          <Activity size={32} style={{ color: '#013E37', margin: '0 auto 8px', display: 'block' }} />
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
        {statCards.map((stat, index) => {
          const gradientColors = [
            'linear-gradient(135deg, #013E37 0%, #013E37 100%)',
            'linear-gradient(135deg, #013E37 0%, #013E37 100%)',
            'linear-gradient(135deg, #013E37 0%, #013E37 100%)',
            'linear-gradient(135deg, #013E37 0%, #013E37 100%)',
            'linear-gradient(135deg, #013E37 0%, #013E37 100%)',
            'linear-gradient(135deg, #013E37 0%, #013E37 100%)',
          ];
          return (
            <Link to={stat.link} key={index} style={styles.statCardLink}>
              <div style={{ ...styles.statCard, background: gradientColors[index % gradientColors.length] }}>
                <div style={styles.statContent}>
                  <div style={styles.statLeft}>
                    <p style={styles.statTitle}>{stat.title}</p>
                    <p style={styles.statValue}>{stat.value}</p>
                  </div>
                  <div style={styles.statIconWrapper}>
                    <stat.icon style={styles.statIcon} size={28} />
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
          );
        })}
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
                      backgroundColor: (brand.revenue || 0) > 100000 ? '#FFEFB3' : '#FFEFB3',
                      color: '#013E37',
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
                        color: (brand.growth || 0) > 10 ? '#013E37' : '#013E37',
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
            <div style={styles.quickActionIconWrapper}>
              <Users size={24} style={styles.quickActionIcon} />
            </div>
            <span style={styles.quickActionText}>Add User</span>
          </Link>
          <Link to="/crm/leads/new" style={styles.quickAction}>
            <div style={styles.quickActionIconWrapper}>
              <Target size={24} style={styles.quickActionIcon} />
            </div>
            <span style={styles.quickActionText}>Create Goal</span>
          </Link>
          <Link to="/crm/companies/new" style={styles.quickAction}>
            <div style={styles.quickActionIconWrapper}>
              <Building2 size={24} style={styles.quickActionIcon} />
            </div>
            <span style={styles.quickActionText}>New Segment</span>
          </Link>
          <Link to="/analytics/reports" style={styles.quickAction}>
            <div style={styles.quickActionIconWrapper}>
              <BarChart3 size={24} style={styles.quickActionIcon} />
            </div>
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
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .stat-card {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          transform: scale(0);
          transition: transform 0.6s ease;
        }
        .stat-card:hover::before {
          transform: scale(3);
        }
        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(1, 62, 55, 0.2);
        }
        
        .brand-card {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .brand-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #013E37, #FFEFB3);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .brand-card:hover::after {
          transform: scaleX(1);
        }
        .brand-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(1, 62, 55, 0.1);
        }
        
        .quick-action {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .quick-action::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #FFEFB3, transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .quick-action:hover::before {
          opacity: 0.1;
        }
        .quick-action:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(1, 62, 55, 0.12);
          border-color: #013E37;
        }
        
        .activity-item {
          transition: all 0.2s ease;
          border-radius: 8px;
          border-left: 3px solid transparent;
        }
        .activity-item:hover {
          background-color: #FFEFB3;
          border-left-color: #013E37;
        }

        .period-btn {
          transition: all 0.2s ease;
        }
        .period-btn:hover {
          background-color: rgba(255, 239, 179, 0.2);
        }

        .refresh-button {
          transition: all 0.2s ease;
        }
        .refresh-button:hover {
          background-color: rgba(255, 239, 179, 0.15);
          transform: scale(1.02);
        }

        @media (max-width: 1024px) {
          .bottom-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
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
    border: '4px solid #FFEFB3',
    borderTopColor: '#013E37',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
  loadingText: {
    marginTop: '12px',
    color: '#013E37',
    fontSize: '14px',
    fontWeight: '500',
  },
  welcomeSection: {
    background: 'linear-gradient(135deg, #013E37 0%, #013E37 100%)',
    borderRadius: '16px',
    padding: '28px 32px',
    color: '#ffffff',
    marginBottom: '24px',
    border: '2px solid #FFEFB3',
    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.1)',
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
    color: '#FFEFB3',
    margin: '4px 0 0 0',
    fontSize: '15px',
    opacity: 0.9,
  },
  welcomeActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  periodSelector: {
    display: 'flex',
    backgroundColor: 'rgba(255, 239, 179, 0.15)',
    borderRadius: '8px',
    padding: '4px',
    gap: '2px',
  },
  periodBtn: {
    padding: '6px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'rgba(255, 239, 179, 0.7)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  periodBtnActive: {
    backgroundColor: '#FFEFB3',
    color: '#013E37',
  },
  refreshButton: {
    background: 'rgba(255, 239, 179, 0.15)',
    border: '1px solid rgba(255, 239, 179, 0.3)',
    color: '#FFEFB3',
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
    background: 'rgba(255, 239, 179, 0.12)',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#FFEFB3',
    display: 'flex',
    alignItems: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  statCardLink: {
    textDecoration: 'none',
    display: 'block',
  },
  statCard: {
    borderRadius: '14px',
    padding: '22px 24px',
    boxShadow: '0 4px 15px rgba(1, 62, 55, 0.08)',
    border: '2px solid #FFEFB3',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  statContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  statLeft: {
    flex: 1,
  },
  statTitle: {
    fontSize: '13px',
    color: '#FFEFB3',
    margin: 0,
    fontWeight: '500',
    opacity: 0.8,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    marginTop: '6px',
    letterSpacing: '0.5px',
  },
  statIconWrapper: {
    padding: '12px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255, 239, 179, 0.15)',
    border: '2px solid rgba(255, 239, 179, 0.2)',
  },
  statIcon: {
    width: '28px',
    height: '28px',
    color: '#FFEFB3',
  },
  statFooter: {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    paddingTop: '14px',
    borderTop: '1px solid rgba(255, 239, 179, 0.15)',
  },
  changeUp: {
    color: '#FFEFB3',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '600',
  },
  changeDown: {
    color: '#FFEFB3',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '600',
    opacity: 0.6,
  },
  changeIcon: {
    width: '16px',
    height: '16px',
  },
  changeText: {
    color: 'rgba(255, 239, 179, 0.6)',
    fontSize: '13px',
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '28px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 2px 10px rgba(1, 62, 55, 0.06)',
    border: '2px solid #FFEFB3',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '18px 24px',
    borderBottom: '2px solid #FFEFB3',
    backgroundColor: '#faf9f6',
  },
  cardHeaderBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#013E37',
    margin: 0,
  },
  cardContent: {
    padding: '20px 24px',
  },
  viewAllLink: {
    fontSize: '14px',
    color: '#013E37',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '500',
    opacity: 0.7,
    transition: 'all 0.2s ease',
  },
  brandsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  brandCard: {
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '2px solid #FFEFB3',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  brandName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#013E37',
    margin: 0,
  },
  brandBadge: {
    padding: '2px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    border: '1px solid #013E37',
  },
  brandStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  brandStat: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandStatLabel: {
    fontSize: '11px',
    color: '#013E37',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  brandStatValue: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#013E37',
    marginTop: '2px',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    borderLeft: '3px solid transparent',
  },
  activityIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '2px solid #013E37',
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
    color: '#013E37',
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
    color: '#013E37',
    opacity: 0.6,
  },
  activityBadge: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '1px 12px',
    borderRadius: '12px',
    border: '1px solid #013E37',
  },
  quickActionsSection: {
    marginTop: '4px',
    marginBottom: '20px',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  quickAction: {
    padding: '20px 16px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '2px solid #FFEFB3',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'block',
    boxShadow: '0 2px 8px rgba(1, 62, 55, 0.04)',
    position: 'relative',
    overflow: 'hidden',
  },
  quickActionIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#FFEFB3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 10px',
    border: '2px solid #013E37',
    transition: 'all 0.3s ease',
  },
  quickActionIcon: {
    margin: '0 auto',
    color: '#013E37',
  },
  quickActionText: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#013E37',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
  },
  emptyStateText: {
    color: '#013E37',
    fontSize: '14px',
    margin: 0,
    opacity: 0.6,
  },
};

export default SuperAdminDashboard;