// components/attendance/AttendanceChart.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart, 
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Badge } from '../common/Badge';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Clock
} from 'lucide-react';

const AttendanceChart = ({ data, type = 'bar', title = 'Attendance Overview' }) => {
  const { user } = useAuth();

  if (!data || data.length === 0) {
    return (
      <div style={styles.emptyState}>
        <Calendar style={styles.emptyIcon} />
        <p style={styles.emptyText}>No attendance data available</p>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const getStatusStyle = (status) => {
    const colors = {
      'Present': { backgroundColor: '#d1fae5', color: '#065f46' },
      'Late': { backgroundColor: '#fef3c7', color: '#92400e' },
      'Absent': { backgroundColor: '#fee2e2', color: '#991b1b' },
      'Leave': { backgroundColor: '#ede9fe', color: '#5b21b6' },
      'Half Day': { backgroundColor: '#dbeafe', color: '#1e40af' },
      'Holiday': { backgroundColor: '#f3f4f6', color: '#374151' }
    };
    return colors[status] || colors.Holiday;
  };

  const renderBarChart = () => (
    <div style={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [value, name]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Bar dataKey="present" stackId="a" fill="#10B981" name="Present" />
          <Bar dataKey="late" stackId="a" fill="#F59E0B" name="Late" />
          <Bar dataKey="absent" stackId="a" fill="#EF4444" name="Absent" />
          <Bar dataKey="leave" stackId="a" fill="#8B5CF6" name="Leave" />
          <Bar dataKey="halfDay" stackId="a" fill="#3B82F6" name="Half Day" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderPieChart = () => {
    const pieData = [
      { name: 'Present', value: data.reduce((sum, d) => sum + d.present, 0) },
      { name: 'Late', value: data.reduce((sum, d) => sum + d.late, 0) },
      { name: 'Absent', value: data.reduce((sum, d) => sum + d.absent, 0) },
      { name: 'Leave', value: data.reduce((sum, d) => sum + d.leave, 0) },
      { name: 'Half Day', value: data.reduce((sum, d) => sum + d.halfDay, 0) }
    ].filter(item => item.value > 0);

    return (
      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'Days']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderLineChart = () => {
    const lineData = data.map(d => ({
      date: d.date,
      attendanceRate: Math.round((d.present / (d.present + d.absent + d.late)) * 100) || 0,
      present: d.present,
      absent: d.absent
    }));

    return (
      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="attendanceRate" 
              stroke="#3B82F6" 
              name="Attendance Rate %"
              strokeWidth={3}
            />
            <Line 
              type="monotone" 
              dataKey="present" 
              stroke="#10B981" 
              name="Present"
            />
            <Line 
              type="monotone" 
              dataKey="absent" 
              stroke="#EF4444" 
              name="Absent"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderSummary = () => {
    const totals = data.reduce((acc, d) => ({
      present: acc.present + d.present,
      late: acc.late + d.late,
      absent: acc.absent + d.absent,
      leave: acc.leave + d.leave,
      halfDay: acc.halfDay + d.halfDay
    }), { present: 0, late: 0, absent: 0, leave: 0, halfDay: 0 });

    const total = Object.values(totals).reduce((sum, val) => sum + val, 0);
    const attendanceRate = total > 0 ? Math.round((totals.present / total) * 100) : 0;

    const summaryData = [
      { label: 'Present', value: totals.present, color: '#d1fae5', textColor: '#065f46' },
      { label: 'Late', value: totals.late, color: '#fef3c7', textColor: '#92400e' },
      { label: 'Absent', value: totals.absent, color: '#fee2e2', textColor: '#991b1b' },
      { label: 'Leave', value: totals.leave, color: '#ede9fe', textColor: '#5b21b6' },
      { label: 'Half Day', value: totals.halfDay, color: '#dbeafe', textColor: '#1e40af' }
    ];

    return (
      <div style={styles.summaryContainer}>
        <div style={styles.totalRow}>
          <div style={styles.totalLeft}>
            <Users style={styles.totalIcon} />
            <span style={styles.totalLabel}>Total Days</span>
          </div>
          <div style={styles.totalRight}>
            <span style={styles.totalValue}>{total}</span>
            <span style={{
              ...styles.attendanceBadge,
              ...(attendanceRate >= 90 ? styles.attendanceBadgeSuccess : 
                  attendanceRate >= 70 ? styles.attendanceBadgeWarning : 
                  styles.attendanceBadgeDanger)
            }}>
              <span style={styles.attendanceBadgeContent}>
                {attendanceRate >= 90 ? <TrendingUp style={styles.trendIconSmall} /> : <TrendingDown style={styles.trendIconSmall} />}
                <span>{attendanceRate}% Attendance</span>
              </span>
            </span>
          </div>
        </div>

        <div style={styles.summaryGrid}>
          {summaryData.map((item, index) => (
            <div key={index} style={{
              ...styles.summaryItem,
              backgroundColor: item.color,
              color: item.textColor
            }}>
              <div style={styles.summaryValue}>{item.value}</div>
              <div style={styles.summaryLabel}>{item.label}</div>
              <div style={styles.summaryPercentage}>
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardHeader}>
        <div style={styles.cardHeaderLeft}>
          <Calendar style={styles.cardHeaderIcon} />
          <span style={styles.cardTitle}>{title}</span>
        </div>
        <div style={styles.cardHeaderRight}>
          <span style={styles.dayCount}>{data.length} days</span>
          {type === 'bar' && (
            <span style={styles.viewBadge}>
              <Clock style={styles.badgeIcon} />
              <span>Bar View</span>
            </span>
          )}
        </div>
      </div>
      <div style={styles.cardContent}>
        {type === 'pie' && renderPieChart()}
        {type === 'line' && renderLineChart()}
        {type === 'bar' && renderBarChart()}
        
        {renderSummary()}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    color: '#D1D5DB',
    margin: '0 auto 12px',
  },
  emptyText: {
    color: '#6B7280',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #E5E7EB',
    flexWrap: 'wrap',
    gap: '8px',
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardHeaderIcon: {
    width: '20px',
    height: '20px',
    color: '#3B82F6',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  },
  cardHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dayCount: {
    fontSize: '14px',
    color: '#6B7280',
  },
  viewBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    backgroundColor: 'transparent',
    border: '1px solid #D1D5DB',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151',
  },
  badgeIcon: {
    width: '12px',
    height: '12px',
  },
  cardContent: {
    padding: '24px',
  },
  chartContainer: {
    width: '100%',
    height: '350px',
  },
  summaryContainer: {
    marginTop: '16px',
  },
  totalRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  totalLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  totalIcon: {
    width: '20px',
    height: '20px',
    color: '#6B7280',
  },
  totalLabel: {
    fontSize: '14px',
    color: '#6B7280',
  },
  totalRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  totalValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
  },
  attendanceBadge: {
    display: 'inline-flex',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '500',
  },
  attendanceBadgeSuccess: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  attendanceBadgeWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  attendanceBadgeDanger: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  attendanceBadgeContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  trendIconSmall: {
    width: '14px',
    height: '14px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '12px',
  },
  summaryItem: {
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: '12px',
    opacity: 0.75,
    marginTop: '2px',
  },
  summaryPercentage: {
    fontSize: '11px',
    opacity: 0.6,
    marginTop: '2px',
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .summary-item:hover {
    transform: scale(1.02);
    transition: transform 0.2s ease;
  }
  
  @media (max-width: 768px) {
    .card-header {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    
    .total-row {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    
    .total-right {
      width: 100% !important;
      justify-content: space-between !important;
    }
    
    .summary-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    
    .chart-container {
      height: 280px !important;
    }
  }
  
  @media (max-width: 480px) {
    .card-content {
      padding: 16px !important;
    }
    
    .card-header {
      padding: 12px 16px !important;
    }
    
    .summary-grid {
      grid-template-columns: 1fr !important;
    }
    
    .chart-container {
      height: 240px !important;
    }
    
    .total-right {
      flex-wrap: wrap !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default AttendanceChart;