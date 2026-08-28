import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, Users, Briefcase, Target,
  CheckCircle, Clock, AlertCircle, DollarSign,
  BarChart3, PieChart, Activity,
  Zap, Building2, UserPlus, ArrowRight, RefreshCw
} from 'lucide-react';

const SegmentAdminDashboard = () => {
  const { user, api } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get('/analytics/segment');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      // Fallback mock data for demo
      setStats({
        projects: { total: 24, active: 14, completed: 8, atRisk: 2, activePercent: 58, completedPercent: 33, riskPercent: 8 },
        clients: { active: 18 },
        revenue: 284500,
        productivity: 82,
        teams: [
          { name: 'Design', performance: 92 },
          { name: 'Development', performance: 78 },
          { name: 'Marketing', performance: 85 },
          { name: 'Sales', performance: 70 }
        ],
        activities: [
          { description: 'New project "E-commerce Revamp" created', timestamp: new Date(Date.now() - 1000 * 60 * 5), type: 'success' },
          { description: 'Client Acme Corp signed contract', timestamp: new Date(Date.now() - 1000 * 60 * 45), type: 'success' },
          { description: 'Project "Mobile App" milestone reached', timestamp: new Date(Date.now() - 1000 * 60 * 120), type: 'warning' },
          { description: 'New team member joined: Sarah Lee', timestamp: new Date(Date.now() - 1000 * 60 * 240), type: 'info' },
          { description: 'Revenue milestone: $250,000', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), type: 'success' }
        ]
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loaderWrapper}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading segment dashboard...</p>
        </div>
      </div>
    );
  }

  // Stat cards configuration - 3 cards in a row
  const statCards = [
    { 
      title: 'Total Projects', 
      value: stats?.projects?.total || 0, 
      icon: Briefcase, 
      color: '#3b82f6', 
      bg: '#eff6ff',
      borderColor: '#bfdbfe',
      subtitle: `${stats?.projects?.active || 0} active projects`
    },
    { 
      title: 'Revenue', 
      value: `$${stats?.revenue?.toLocaleString() || 0}`, 
      icon: DollarSign, 
      color: '#8b5cf6', 
      bg: '#f5f3ff',
      borderColor: '#ddd6fe',
      subtitle: 'Total segment revenue'
    },
    { 
      title: 'Productivity', 
      value: `${stats?.productivity || 0}%`, 
      icon: TrendingUp, 
      color: '#f59e0b', 
      bg: '#fffbeb',
      borderColor: '#fde68a',
      subtitle: 'Team efficiency rate'
    }
  ];

  return (
    <div style={styles.container}>
      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <div style={styles.welcomeHeader}>
          <div>
            <h1 style={styles.welcomeTitle}>
              Segment Dashboard, {user?.segmentId?.name || 'Segment'} 👋
            </h1>
            <p style={styles.welcomeSubtitle}>
              Real-time overview of your segment performance and team metrics
            </p>
          </div>
          <div style={styles.welcomeActions}>
            <div style={styles.periodSelector}>
              <button style={{ ...styles.periodBtn, ...styles.periodBtnActive }}>Week</button>
              <button style={styles.periodBtn}>Month</button>
              <button style={styles.periodBtn}>Year</button>
            </div>
            <button
              onClick={handleRefresh}
              style={styles.refreshButton}
              disabled={refreshing}
            >
              <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
        <div style={styles.segmentBadge}>
          <Users size={16} style={{ marginRight: '6px' }} />
          <span>{stats?.clients?.active || 0} Active Clients</span>
          <span style={styles.badgeDivider}>|</span>
          <span>${stats?.revenue?.toLocaleString() || 0} Total Revenue</span>
        </div>
      </div>

      {/* Stats Grid - 3 columns */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <div key={index} style={{ ...styles.statCard, borderBottom: `3px solid ${stat.color}` }}>
            <div style={styles.statContent}>
              <div style={styles.statLeft}>
                <p style={styles.statTitle}>{stat.title}</p>
                <p style={styles.statValue}>{stat.value}</p>
                <p style={styles.statSubtitle}>{stat.subtitle}</p>
              </div>
              <div style={{ ...styles.statIconWrapper, backgroundColor: stat.bg, borderColor: stat.borderColor }}>
                <stat.icon style={{ ...styles.statIcon, color: stat.color }} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Team Performance Row */}
      <div style={styles.bottomGrid}>
        {/* Project Status */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderBetween}>
              <h2 style={styles.cardTitle}>Project Status</h2>
              <span style={styles.viewAllLink}>View All →</span>
            </div>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.statusList}>
              <div style={styles.statusItem}>
                <div style={styles.statusRow}>
                  <span style={styles.statusLabel}>
                    <span style={{ ...styles.statusDot, backgroundColor: '#3b82f6' }}></span>
                    Active
                  </span>
                  <span style={styles.statusValue}>{stats?.projects?.active || 0}</span>
                </div>
                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressFill, width: `${stats?.projects?.activePercent || 0}%`, backgroundColor: '#3b82f6' }} />
                </div>
              </div>
              <div style={styles.statusItem}>
                <div style={styles.statusRow}>
                  <span style={styles.statusLabel}>
                    <span style={{ ...styles.statusDot, backgroundColor: '#22c55e' }}></span>
                    Completed
                  </span>
                  <span style={styles.statusValue}>{stats?.projects?.completed || 0}</span>
                </div>
                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressFill, width: `${stats?.projects?.completedPercent || 0}%`, backgroundColor: '#22c55e' }} />
                </div>
              </div>
              <div style={styles.statusItem}>
                <div style={styles.statusRow}>
                  <span style={styles.statusLabel}>
                    <span style={{ ...styles.statusDot, backgroundColor: '#ef4444' }}></span>
                    At Risk
                  </span>
                  <span style={styles.statusValue}>{stats?.projects?.atRisk || 0}</span>
                </div>
                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressFill, width: `${stats?.projects?.riskPercent || 0}%`, backgroundColor: '#ef4444' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderBetween}>
              <h2 style={styles.cardTitle}>Team Performance</h2>
              <span style={styles.viewAllLink}>View All →</span>
            </div>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.teamList}>
              {stats?.teams?.map((team, idx) => (
                <div key={idx} style={styles.teamRow}>
                  <div style={styles.teamInfo}>
                    <div style={{ 
                      ...styles.teamAvatar, 
                      backgroundColor: team.performance >= 80 ? '#22c55e' : team.performance >= 60 ? '#f59e0b' : '#ef4444' 
                    }}>
                      {team.name.charAt(0)}
                    </div>
                    <span style={styles.teamName}>{team.name}</span>
                  </div>
                  <div style={styles.teamMeta}>
                    <span style={{ 
                      ...styles.teamPercent, 
                      color: team.performance >= 80 ? '#22c55e' : team.performance >= 60 ? '#f59e0b' : '#ef4444' 
                    }}>
                      {team.performance}%
                    </span>
                    <div style={styles.teamProgressTrack}>
                      <div
                        style={{
                          ...styles.teamProgressFill,
                          width: `${team.performance}%`,
                          backgroundColor: team.performance >= 80 ? '#22c55e' : team.performance >= 60 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.cardFull}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderBetween}>
            <h2 style={styles.cardTitle}>Recent Activity</h2>
            <span style={styles.viewAllLink}>View All →</span>
          </div>
        </div>
        <div style={styles.cardContent}>
          <div style={styles.activityList}>
            {stats?.activities?.slice(0, 5).map((activity, idx) => (
              <div key={idx} style={styles.activityItem}>
                <div style={{ 
                  ...styles.activityIcon, 
                  backgroundColor: activity.type === 'success' ? '#f0fdf4' : activity.type === 'warning' ? '#fffbeb' : '#eff6ff',
                  borderColor: activity.type === 'success' ? '#bbf7d0' : activity.type === 'warning' ? '#fde68a' : '#bfdbfe'
                }}>
                  <Activity size={18} style={{ color: activity.type === 'success' ? '#22c55e' : activity.type === 'warning' ? '#f59e0b' : '#3b82f6' }} />
                </div>
                <div style={styles.activityContent}>
                  <p style={styles.activityTitle}>{activity.description}</p>
                  <div style={styles.activityMeta}>
                    <span style={styles.activityTime}>{new Date(activity.timestamp).toLocaleString()}</span>
                    <span style={{
                      ...styles.activityBadge,
                      backgroundColor: activity.type === 'success' ? '#f0fdf4' : activity.type === 'warning' ? '#fffbeb' : '#eff6ff',
                      color: activity.type === 'success' ? '#22c55e' : activity.type === 'warning' ? '#f59e0b' : '#3b82f6'
                    }}>
                      {activity.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActionsSection}>
        <div style={styles.quickActionsGrid}>
          <div style={styles.quickAction}>
            <div style={{ ...styles.quickActionIcon, backgroundColor: '#eff6ff', color: '#3b82f6' }}>
              <Briefcase size={20} />
            </div>
            <span style={styles.quickActionText}>New Project</span>
          </div>
          <div style={styles.quickAction}>
            <div style={{ ...styles.quickActionIcon, backgroundColor: '#f0fdf4', color: '#22c55e' }}>
              <UserPlus size={20} />
            </div>
            <span style={styles.quickActionText}>Add Client</span>
          </div>
          <div style={styles.quickAction}>
            <div style={{ ...styles.quickActionIcon, backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
              <Target size={20} />
            </div>
            <span style={styles.quickActionText}>Set Goal</span>
          </div>
          <div style={styles.quickAction}>
            <div style={{ ...styles.quickActionIcon, backgroundColor: '#fffbeb', color: '#f59e0b' }}>
              <BarChart3 size={20} />
            </div>
            <span style={styles.quickActionText}>View Reports</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .stat-card { transition: all 0.25s ease; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.12); }
        .activity-item { transition: background 0.15s ease; }
        .activity-item:hover { background: #f9fafb; }
        .quick-action { transition: all 0.2s ease; }
        .quick-action:hover { transform: translateY(-3px); box-shadow: 0 8px 16px -6px rgba(0,0,0,0.08); }
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .bottom-grid { grid-template-columns: 1fr !important; }
          .welcome-header { flex-direction: column !important; align-items: flex-start !important; }
          .welcome-actions { width: 100% !important; flex-wrap: wrap !important; }
          .period-selector { width: 100% !important; justify-content: center !important; }
          .quick-actions-grid { grid-template-columns: 1fr 1fr !important; }
          .segment-badge { flex-wrap: wrap !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
          .quick-actions-grid { grid-template-columns: 1fr 1fr !important; }
          .welcome-section { padding: 16px !important; }
          .welcome-title { font-size: 20px !important; }
          .stat-value { font-size: 20px !important; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { padding: '0', maxWidth: '100%', width: '100%' },
  loadingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  loaderWrapper: { textAlign: 'center' },
  spinner: {
    width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6',
    borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto'
  },
  loadingText: { marginTop: '12px', color: '#6b7280', fontSize: '14px' },

  welcomeSection: {
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    borderRadius: '16px', padding: '28px 32px', color: '#ffffff', marginBottom: '24px'
  },
  welcomeHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' },
  welcomeTitle: { fontSize: '26px', fontWeight: '700', margin: 0 },
  welcomeSubtitle: { marginTop: '4px', color: '#bfdbfe', fontSize: '15px', margin: '4px 0 0 0' },
  welcomeActions: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  periodSelector: {
    display: 'flex', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '8px',
    padding: '4px', gap: '2px'
  },
  periodBtn: {
    padding: '6px 16px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  periodBtnActive: { backgroundColor: 'rgba(255,255,255,0.25)', color: '#ffffff' },
  refreshButton: {
    background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
    color: '#ffffff', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  segmentBadge: {
    marginTop: '14px',
    padding: '10px 18px',
    background: 'rgba(255,255,255,0.12)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#bfdbfe',
    flexWrap: 'wrap'
  },
  badgeDivider: { margin: '0 8px', opacity: 0.4 },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' },
  statCard: {
    backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', cursor: 'default'
  },
  statContent: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  statLeft: { flex: 1 },
  statTitle: { fontSize: '13px', color: '#6b7280', margin: 0, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.03em' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#111827', marginTop: '4px' },
  statSubtitle: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' },
  statIconWrapper: {
    padding: '10px', borderRadius: '12px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', border: '1px solid'
  },
  statIcon: { width: '22px', height: '22px' },

  bottomGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
  card: { backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' },
  cardFull: { backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden', marginBottom: '24px' },
  cardHeader: { padding: '16px 24px', borderBottom: '1px solid #f1f5f9' },
  cardHeaderBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: '17px', fontWeight: '600', color: '#111827', margin: 0 },
  cardContent: { padding: '20px 24px' },
  viewAllLink: { fontSize: '14px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' },

  statusList: { display: 'flex', flexDirection: 'column', gap: '18px' },
  statusItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  statusRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: '14px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' },
  statusValue: { fontSize: '15px', fontWeight: '600', color: '#111827' },
  progressTrack: { width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' },

  teamList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  teamRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' },
  teamInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  teamAvatar: {
    width: '32px', height: '32px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#ffffff',
    fontSize: '13px', fontWeight: '700'
  },
  teamName: { fontSize: '14px', color: '#374151', fontWeight: '500' },
  teamMeta: { display: 'flex', alignItems: 'center', gap: '10px' },
  teamPercent: { fontSize: '14px', fontWeight: '600', minWidth: '40px' },
  teamProgressTrack: { width: '100px', height: '5px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' },
  teamProgressFill: { height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' },

  activityList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  activityItem: {
    display: 'flex', alignItems: 'flex-start', gap: '14px',
    padding: '10px 12px', borderRadius: '8px', cursor: 'default'
  },
  activityIcon: {
    width: '38px', height: '38px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    border: '1px solid'
  },
  activityContent: { flex: 1, minWidth: 0 },
  activityTitle: { fontSize: '14px', color: '#111827', margin: 0, fontWeight: '500' },
  activityMeta: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' },
  activityTime: { fontSize: '12px', color: '#6b7280' },
  activityBadge: { fontSize: '10px', fontWeight: '600', padding: '2px 10px', borderRadius: '12px' },

  quickActionsSection: { marginTop: '4px' },
  quickActionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  quickAction: {
    padding: '20px 16px', backgroundColor: '#ffffff', borderRadius: '12px',
    border: '1px solid #f1f5f9', textAlign: 'center', cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.2s ease'
  },
  quickActionIcon: {
    width: '44px', height: '44px', borderRadius: '12px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px'
  },
  quickActionText: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151' }
};

export default SegmentAdminDashboard;