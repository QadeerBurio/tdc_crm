// components/performance/PerformanceScore.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Clock,
  Award,
  Target,
  Activity,
  Star
} from 'lucide-react';

const PerformanceScore = ({ performance }) => {
  const { user } = useAuth();

  if (!performance) {
    return (
      <div style={styles.emptyState}>
        <p style={styles.emptyText}>No performance data available</p>
      </div>
    );
  }

  const {
    score = 0,
    taskCompletion = 0,
    capacityUtilization = 0,
    qaPassRate = 0,
    tasksCompleted = 0,
    tasksAssigned = 0,
    billableHours = 0,
    totalHours = 0,
    trend = 0,
    category = 'Good',
    rank = 'Average',
    achievements = []
  } = performance;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Excellent': <Star style={styles.categoryIcon} />,
      'Good': <Award style={styles.categoryIcon} />,
      'Average': <Target style={styles.categoryIcon} />,
      'Below Average': <Activity style={styles.categoryIcon} />,
      'Needs Improvement': <Clock style={styles.categoryIcon} />
    };
    return icons[category] || <Activity style={styles.categoryIcon} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Average': 'bg-yellow-100 text-yellow-800',
      'Below Average': 'bg-orange-100 text-orange-800',
      'Needs Improvement': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryStyle = (category) => {
    const styles = {
      'Excellent': { backgroundColor: '#d1fae5', color: '#065f46' },
      'Good': { backgroundColor: '#dbeafe', color: '#1e40af' },
      'Average': { backgroundColor: '#fef3c7', color: '#92400e' },
      'Below Average': { backgroundColor: '#ffedd5', color: '#9a3412' },
      'Needs Improvement': { backgroundColor: '#fee2e2', color: '#991b1b' }
    };
    return styles[category] || { backgroundColor: '#f3f4f6', color: '#374151' };
  };

  const getProgressVariant = (value) => {
    if (value >= 80) return 'success';
    if (value >= 60) return 'warning';
    return 'danger';
  };

  const formatHours = (hours) => {
    return Math.round(hours * 10) / 10;
  };

  return (
    <div style={styles.container}>
      {/* Score Header */}
      <div style={styles.scoreHeader}>
        <div>
          <h3 style={styles.scoreTitle}>Performance Score</h3>
          <p style={styles.scoreSubtitle}>Weekly performance evaluation</p>
        </div>
        <div style={styles.scoreRight}>
          <div style={styles.scoreValue}>{Math.round(score)}%</div>
          <div style={styles.scoreTrend}>
            {trend >= 0 ? (
              <TrendingUp style={styles.trendIcon} />
            ) : (
              <TrendingDown style={styles.trendIcon} />
            )}
            <span>{Math.abs(trend)}% {trend >= 0 ? 'improvement' : 'decline'}</span>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {/* Category Badge */}
        <div style={styles.categoryRow}>
          <div style={styles.categoryBadgeContainer}>
            <span style={{
              ...styles.categoryBadge,
              ...getCategoryStyle(category)
            }}>
              <span style={styles.categoryBadgeContent}>
                {getCategoryIcon(category)}
                <span>{category}</span>
              </span>
            </span>
            <span style={styles.rankText}>Rank: {rank}</span>
          </div>
          <div style={styles.taskCount}>
            {tasksCompleted} / {tasksAssigned} tasks completed
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricItem}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>Task Completion</span>
              <span style={styles.metricValue}>{Math.round(taskCompletion)}%</span>
            </div>
            <ProgressBar 
              value={taskCompletion} 
              style={styles.progressBar}
              variant={getProgressVariant(taskCompletion)}
            />
          </div>
          <div style={styles.metricItem}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>Capacity Utilization</span>
              <span style={styles.metricValue}>{Math.round(capacityUtilization)}%</span>
            </div>
            <ProgressBar 
              value={capacityUtilization} 
              style={styles.progressBar}
              variant={getProgressVariant(capacityUtilization)}
            />
          </div>
          <div style={styles.metricItem}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>QA Pass Rate</span>
              <span style={styles.metricValue}>{Math.round(qaPassRate)}%</span>
            </div>
            <ProgressBar 
              value={qaPassRate} 
              style={styles.progressBar}
              variant={getProgressVariant(qaPassRate)}
            />
          </div>
        </div>

        {/* Hours Breakdown */}
        <div style={styles.hoursSection}>
          <div style={styles.hoursRow}>
            <span style={styles.hoursLabel}>Billable Hours</span>
            <span style={styles.hoursValue}>{formatHours(billableHours)} hrs</span>
          </div>
          <div style={styles.hoursRow}>
            <span style={styles.hoursLabel}>Total Hours</span>
            <span style={styles.hoursValue}>{formatHours(totalHours)} hrs</span>
          </div>
          <div style={styles.hoursRow}>
            <span style={styles.hoursLabel}>Utilization Rate</span>
            <span style={styles.hoursValue}>
              {Math.round((billableHours / (totalHours || 1)) * 100)}%
            </span>
          </div>
        </div>

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <div style={styles.achievementsSection}>
            <h4 style={styles.achievementsTitle}>Achievements</h4>
            <div style={styles.achievementsList}>
              {achievements.map((achievement, index) => (
                <span key={index} style={styles.achievementBadge}>
                  <CheckCircle style={styles.achievementIcon} />
                  <span>{achievement}</span>
                </span>
              ))}
            </div>
          </div>
        )}
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
  emptyText: {
    color: '#6B7280',
  },
  scoreHeader: {
    padding: '24px',
    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
  },
  scoreSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  scoreRight: {
    textAlign: 'right',
  },
  scoreValue: {
    fontSize: '36px',
    fontWeight: '700',
  },
  scoreTrend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: '4px',
  },
  trendIcon: {
    width: '16px',
    height: '16px',
  },
  content: {
    padding: '24px',
  },
  categoryRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  categoryBadgeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  categoryBadge: {
    display: 'inline-flex',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '500',
  },
  categoryBadgeContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  categoryIcon: {
    width: '16px',
    height: '16px',
  },
  rankText: {
    fontSize: '14px',
    color: '#6B7280',
  },
  taskCount: {
    fontSize: '14px',
    color: '#6B7280',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  metricItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    padding: '12px',
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  metricLabel: {
    fontSize: '13px',
    color: '#6B7280',
  },
  metricValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
  },
  progressBar: {
    height: '8px',
  },
  hoursSection: {
    borderTop: '1px solid #E5E7EB',
    paddingTop: '16px',
  },
  hoursRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '14px',
    padding: '4px 0',
  },
  hoursLabel: {
    color: '#6B7280',
  },
  hoursValue: {
    fontWeight: '500',
    color: '#111827',
  },
  achievementsSection: {
    borderTop: '1px solid #E5E7EB',
    paddingTop: '16px',
    marginTop: '16px',
  },
  achievementsTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    margin: '0 0 8px 0',
  },
  achievementsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  achievementBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  achievementIcon: {
    width: '12px',
    height: '12px',
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .metric-item:hover {
    background-color: #F3F4F6 !important;
    transition: background-color 0.2s ease;
  }
  
  .achievement-badge:hover {
    opacity: 0.8 !important;
    transition: opacity 0.2s ease;
  }
  
  @media (max-width: 768px) {
    .score-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 12px !important;
    }
    
    .score-right {
      text-align: left !important;
      width: 100% !important;
    }
    
    .score-trend {
      justify-content: flex-start !important;
    }
    
    .category-row {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    
    .metrics-grid {
      grid-template-columns: 1fr !important;
    }
  }
  
  @media (max-width: 480px) {
    .content {
      padding: 16px !important;
    }
    
    .score-header {
      padding: 16px !important;
    }
    
    .score-value {
      font-size: 28px !important;
    }
    
    .achievements-list {
      flex-direction: column !important;
    }
    
    .achievement-badge {
      width: 100% !important;
      justify-content: center !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default PerformanceScore;