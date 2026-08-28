import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Briefcase, CheckSquare, Clock,
  TrendingUp, AlertCircle, UserCheck, Calendar,
  Activity, BarChart3, Target, RefreshCw,
  ArrowRight
} from 'lucide-react';

const ManagerDashboard = () => {
  const { user, api } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get('/analytics/manager');
      setStats(response.data.data);
      setTeamMembers(response.data.team || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      // Fallback mock data
      setStats({
        team: { total: 12 },
        tasks: { active: 18, completed: 42 },
        productivity: 84
      });
      setTeamMembers([
        { _id: '1', firstName: 'Sarah', lastName: 'Chen', tasks: { total: 8, completion: 92 }, productivity: 88, status: 'active' },
        { _id: '2', firstName: 'Michael', lastName: 'Rodriguez', tasks: { total: 12, completion: 75 }, productivity: 70, status: 'overloaded' },
        { _id: '3', firstName: 'Emily', lastName: 'Johnson', tasks: { total: 6, completion: 100 }, productivity: 95, status: 'active' },
        { _id: '4', firstName: 'James', lastName: 'Kim', tasks: { total: 9, completion: 67 }, productivity: 65, status: 'idle' },
        { _id: '5', firstName: 'Lisa', lastName: 'Patel', tasks: { total: 10, completion: 85 }, productivity: 82, status: 'active' }
      ]);
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
          <p style={styles.loadingText}>Loading team dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Team Members', value: stats?.team?.total || 0, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { title: 'Active Tasks', value: stats?.tasks?.active || 0, icon: CheckSquare, color: '#f59e0b', bg: '#fffbeb' },
    { title: 'Completed Tasks', value: stats?.tasks?.completed || 0, icon: CheckSquare, color: '#22c55e', bg: '#f0fdf4' },
    { title: 'Team Productivity', value: `${stats?.productivity || 0}%`, icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff' }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: 'Active', color: '#22c55e', bg: '#f0fdf4' },
      overloaded: { label: 'Overloaded', color: '#ef4444', bg: '#fef2f2' },
      idle: { label: 'Idle', color: '#f59e0b', bg: '#fffbeb' }
    };
    return badges[status] || badges.active;
  };

  return (
    <div style={styles.container}>
      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <div style={styles.welcomeHeader}>
          <div>
            <h1 style={styles.welcomeTitle}>
              Team Dashboard, {user?.firstName || 'Manager'} 👋
            </h1>
            <p style={styles.welcomeSubtitle}>
              Manage and track your team's performance in real-time
            </p>
          </div>
          <div style={styles.welcomeActions}>
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
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <div key={index} style={styles.statCard}>
            <div style={styles.statContent}>
              <div>
                <p style={styles.statTitle}>{stat.title}</p>
                <p style={styles.statValue}>{stat.value}</p>
              </div>
              <div style={{ ...styles.statIconWrapper, backgroundColor: stat.bg }}>
                <stat.icon style={{ ...styles.statIcon, color: stat.color }} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Performance Table */}
      <div style={styles.cardFull}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderBetween}>
            <h2 style={styles.cardTitle}>Team Performance</h2>
            <span style={styles.viewAllLink}>View All <ArrowRight size={16} /></span>
          </div>
        </div>
        <div style={styles.cardContent}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.tableHead}>Member</th>
                  <th style={styles.tableHead}>Tasks</th>
                  <th style={styles.tableHead}>Completion</th>
                  <th style={styles.tableHead}>Productivity</th>
                  <th style={styles.tableHead}>Status</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => {
                  const badge = getStatusBadge(member.status);
                  return (
                    <tr key={member._id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <div style={styles.memberInfo}>
                          <div style={{ ...styles.avatar, backgroundColor: member.status === 'active' ? '#3b82f6' : member.status === 'overloaded' ? '#ef4444' : '#f59e0b' }}>
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </div>
                          <span style={styles.memberName}>{member.firstName} {member.lastName}</span>
                        </div>
                      </td>
                      <td style={styles.tableCell}>{member.tasks?.total || 0}</td>
                      <td style={styles.tableCell}>
                        <div style={styles.progressWrapper}>
                          <div style={styles.progressTrack}>
                            <div style={{ ...styles.progressFill, width: `${member.tasks?.completion || 0}%`, backgroundColor: member.tasks?.completion >= 80 ? '#22c55e' : member.tasks?.completion >= 60 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span style={styles.progressLabel}>{member.tasks?.completion || 0}%</span>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{ fontWeight: '600', color: member.productivity >= 80 ? '#22c55e' : member.productivity >= 60 ? '#f59e0b' : '#ef4444' }}>
                          {member.productivity || 0}%
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{ ...styles.statusBadge, backgroundColor: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActionsSection}>
        <div style={styles.quickActionsGrid}>
          <div style={styles.quickAction}>
            <UserCheck size={24} style={styles.quickActionIconBlue} />
            <span style={styles.quickActionText}>Assign Task</span>
          </div>
          <div style={styles.quickAction}>
            <Calendar size={24} style={styles.quickActionIconGreen} />
            <span style={styles.quickActionText}>Schedule Meeting</span>
          </div>
          <div style={styles.quickAction}>
            <Target size={24} style={styles.quickActionIconPurple} />
            <span style={styles.quickActionText}>Set Goals</span>
          </div>
          <div style={styles.quickAction}>
            <BarChart3 size={24} style={styles.quickActionIconYellow} />
            <span style={styles.quickActionText}>View Reports</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .stat-card { transition: all 0.2s ease; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.12); }
        .table-row { transition: background 0.15s ease; }
        .table-row:hover { background: #f8fafc; }
        .quick-action { transition: all 0.2s ease; }
        .quick-action:hover { transform: translateY(-3px); box-shadow: 0 8px 16px -6px rgba(0,0,0,0.08); }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .welcome-header { flex-direction: column !important; align-items: flex-start !important; }
          .welcome-actions { width: 100% !important; }
          .quick-actions-grid { grid-template-columns: 1fr 1fr !important; }
          .table-wrapper { overflow-x: auto; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .quick-actions-grid { grid-template-columns: 1fr 1fr !important; }
          .welcome-section { padding: 16px !important; }
          .welcome-title { font-size: 20px !important; }
          .stat-value { font-size: 18px !important; }
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
    background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    borderRadius: '16px', padding: '28px 32px', color: '#ffffff', marginBottom: '24px'
  },
  welcomeHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' },
  welcomeTitle: { fontSize: '26px', fontWeight: '700', margin: 0 },
  welcomeSubtitle: { marginTop: '4px', color: '#bae6fd', fontSize: '15px', margin: '4px 0 0 0' },
  welcomeActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  refreshButton: {
    background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
    color: '#ffffff', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', transition: 'all 0.2s ease'
  },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' },
  statCard: {
    backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px 22px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', cursor: 'default'
  },
  statContent: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  statTitle: { fontSize: '13px', color: '#6b7280', margin: 0, fontWeight: '500' },
  statValue: { fontSize: '26px', fontWeight: '700', color: '#111827', marginTop: '4px' },
  statIconWrapper: { padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statIcon: { width: '22px', height: '22px' },

  cardFull: {
    backgroundColor: '#ffffff', borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
    overflow: 'hidden', marginBottom: '24px'
  },
  cardHeader: { padding: '16px 24px', borderBottom: '1px solid #f1f5f9' },
  cardHeaderBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: '17px', fontWeight: '600', color: '#111827', margin: 0 },
  cardContent: { padding: '20px 24px' },
  viewAllLink: {
    fontSize: '14px', color: '#3b82f6', textDecoration: 'none',
    fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
  },

  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeadRow: { borderBottom: '1px solid #e5e7eb' },
  tableHead: { textAlign: 'left', padding: '10px 12px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tableRow: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' },
  tableCell: { padding: '12px 12px', fontSize: '14px', color: '#111827' },

  memberInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#ffffff',
    fontSize: '12px', fontWeight: '700', flexShrink: 0
  },
  memberName: { fontWeight: '500' },

  progressWrapper: { display: 'flex', alignItems: 'center', gap: '8px' },
  progressTrack: { width: '80px', height: '5px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '4px' },
  progressLabel: { fontSize: '13px', fontWeight: '500', color: '#374151', minWidth: '36px' },

  statusBadge: { padding: '3px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },

  quickActionsSection: { marginTop: '4px' },
  quickActionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  quickAction: {
    padding: '18px 16px', backgroundColor: '#ffffff', borderRadius: '12px',
    border: '1px solid #f1f5f9', textAlign: 'center', cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.2s ease'
  },
  quickActionIconBlue: { margin: '0 auto', color: '#3b82f6' },
  quickActionIconGreen: { margin: '0 auto', color: '#22c55e' },
  quickActionIconPurple: { margin: '0 auto', color: '#8b5cf6' },
  quickActionIconYellow: { margin: '0 auto', color: '#f59e0b' },
  quickActionText: { display: 'block', marginTop: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }
};

export default ManagerDashboard;