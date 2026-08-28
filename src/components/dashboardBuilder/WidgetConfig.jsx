// components/builder/WidgetConfig.jsx - COMPLETE MODERN VERSION
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X, Save, Settings, Target, Clock,
  Users, BarChart2, Activity, AlertCircle,
  CheckCircle, Calendar, Filter,
  Eye, RefreshCw, Download, Share2,
  Grid, List, Layout, PieChart,
  TrendingUp, TrendingDown, Zap,
  Shield, Award, User, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

const WidgetConfig = ({ widget, onSave, onClose }) => {
  const { token } = useAuth();
  const [config, setConfig] = useState(widget?.config || {});
  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    try {
      onSave(widget.id, config);
      toast.success('Widget configuration saved!');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const getWidgetIcon = (type) => {
    const icons = {
      'kpi_card': Target,
      'task_status': CheckCircle,
      'activity_feed': Activity,
      'risk_list': AlertCircle,
      'performance_chart': BarChart2,
      'goal_progress': Target,
      'number': BarChart2,
      'percentage': PieChart,
      'progress_bar': Layout,
      'table': Grid,
      'employee_ranking': Users,
      'team_ranking': Users,
      'revenue_chart': TrendingUp,
      'project_status': Briefcase,
      'calendar': Calendar,
      'kpi_table': Grid
    };
    const Icon = icons[type] || Settings;
    return <Icon className="wc-config-icon" />;
  };

  const getWidgetTypeLabel = (type) => {
    const labels = {
      'kpi_card': 'KPI Card',
      'task_status': 'Task Status',
      'activity_feed': 'Activity Feed',
      'risk_list': 'Risk List',
      'performance_chart': 'Performance Chart',
      'goal_progress': 'Goal Progress',
      'revenue_chart': 'Revenue Chart',
      'team_ranking': 'Team Ranking',
      'project_status': 'Project Status',
      'employee_ranking': 'Employee Ranking',
      'calendar': 'Calendar',
      'kpi_table': 'KPI Table',
      'number': 'Number',
      'percentage': 'Percentage',
      'progress_bar': 'Progress Bar'
    };
    return labels[type] || type.replace(/_/g, ' ');
  };

  // Render different config options based on widget type
  const renderConfigFields = () => {
    const type = widget?.type;

    switch (type) {
      case 'kpi_card':
        return (
          <div className="wc-config-fields">
            <div className="wc-field-group">
              <label className="wc-field-label">KPI Definition</label>
              <select
                value={config.definitionId || ''}
                onChange={(e) => handleChange('definitionId', e.target.value)}
                className="wc-field-select"
              >
                <option value="">Select KPI</option>
                <option value="1">Task Completion Rate</option>
                <option value="2">Capacity Utilization</option>
                <option value="3">QA Pass Rate</option>
                <option value="4">Revenue Growth</option>
                <option value="5">Client Satisfaction</option>
              </select>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Display Mode</label>
              <select
                value={config.displayMode || 'number'}
                onChange={(e) => handleChange('displayMode', e.target.value)}
                className="wc-field-select"
              >
                <option value="number">Number</option>
                <option value="percentage">Percentage</option>
                <option value="progress">Progress Bar</option>
                <option value="currency">Currency</option>
              </select>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Time Period</label>
              <select
                value={config.period || 'monthly'}
                onChange={(e) => handleChange('period', e.target.value)}
                className="wc-field-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Show Trend</label>
              <div className="wc-field-checkbox">
                <input
                  type="checkbox"
                  checked={config.showTrend !== false}
                  onChange={(e) => handleChange('showTrend', e.target.checked)}
                  className="wc-checkbox"
                />
                <span className="wc-checkbox-label">Display trend indicator</span>
              </div>
            </div>
          </div>
        );

      case 'task_status':
        return (
          <div className="wc-config-fields">
            <div className="wc-field-group">
              <label className="wc-field-label">Show Completed Tasks</label>
              <div className="wc-field-checkbox">
                <input
                  type="checkbox"
                  checked={config.showCompleted || false}
                  onChange={(e) => handleChange('showCompleted', e.target.checked)}
                  className="wc-checkbox"
                />
                <span className="wc-checkbox-label">Include completed tasks</span>
              </div>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Task Limit</label>
              <input
                type="number"
                value={config.limit || 10}
                onChange={(e) => handleChange('limit', parseInt(e.target.value) || 10)}
                className="wc-field-input"
                min="1"
                max="50"
              />
              <p className="wc-field-hint">Maximum number of tasks to display</p>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Show Assignee</label>
              <div className="wc-field-checkbox">
                <input
                  type="checkbox"
                  checked={config.showAssignee !== false}
                  onChange={(e) => handleChange('showAssignee', e.target.checked)}
                  className="wc-checkbox"
                />
                <span className="wc-checkbox-label">Display task assignee</span>
              </div>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Show Due Date</label>
              <div className="wc-field-checkbox">
                <input
                  type="checkbox"
                  checked={config.showDueDate !== false}
                  onChange={(e) => handleChange('showDueDate', e.target.checked)}
                  className="wc-checkbox"
                />
                <span className="wc-checkbox-label">Display due date</span>
              </div>
            </div>
          </div>
        );

      case 'activity_feed':
        return (
          <div className="wc-config-fields">
            <div className="wc-field-group">
              <label className="wc-field-label">Activity Types</label>
              <div className="wc-checkbox-group">
                {['created', 'updated', 'completed', 'deleted', 'commented'].map(type => (
                  <label key={type} className="wc-checkbox-item">
                    <input
                      type="checkbox"
                      checked={config.types?.includes(type) || false}
                      onChange={(e) => {
                        const types = e.target.checked 
                          ? [...(config.types || []), type]
                          : (config.types || []).filter(t => t !== type);
                        handleChange('types', types);
                      }}
                      className="wc-checkbox"
                    />
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Limit</label>
              <input
                type="number"
                value={config.limit || 20}
                onChange={(e) => handleChange('limit', parseInt(e.target.value) || 20)}
                className="wc-field-input"
                min="5"
                max="50"
              />
              <p className="wc-field-hint">Number of activities to display</p>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Show User Avatars</label>
              <div className="wc-field-checkbox">
                <input
                  type="checkbox"
                  checked={config.showAvatars !== false}
                  onChange={(e) => handleChange('showAvatars', e.target.checked)}
                  className="wc-checkbox"
                />
                <span className="wc-checkbox-label">Display user avatars</span>
              </div>
            </div>
          </div>
        );

      case 'risk_list':
        return (
          <div className="wc-config-fields">
            <div className="wc-field-group">
              <label className="wc-field-label">Severity Levels</label>
              <div className="wc-checkbox-group">
                {['critical', 'high', 'medium', 'low'].map(level => (
                  <label key={level} className="wc-checkbox-item">
                    <input
                      type="checkbox"
                      checked={config.severities?.includes(level) || false}
                      onChange={(e) => {
                        const severities = e.target.checked 
                          ? [...(config.severities || []), level]
                          : (config.severities || []).filter(s => s !== level);
                        handleChange('severities', severities);
                      }}
                      className="wc-checkbox"
                    />
                    <span className={`wc-severity-${level}`}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Show Resolved</label>
              <div className="wc-field-checkbox">
                <input
                  type="checkbox"
                  checked={config.showResolved || false}
                  onChange={(e) => handleChange('showResolved', e.target.checked)}
                  className="wc-checkbox"
                />
                <span className="wc-checkbox-label">Include resolved risks</span>
              </div>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Show Risk Owner</label>
              <div className="wc-field-checkbox">
                <input
                  type="checkbox"
                  checked={config.showOwner !== false}
                  onChange={(e) => handleChange('showOwner', e.target.checked)}
                  className="wc-checkbox"
                />
                <span className="wc-checkbox-label">Display risk owner</span>
              </div>
            </div>
          </div>
        );

      case 'performance_chart':
      case 'revenue_chart':
        return (
          <div className="wc-config-fields">
            <div className="wc-field-group">
              <label className="wc-field-label">Chart Type</label>
              <select
                value={config.chartType || 'line'}
                onChange={(e) => handleChange('chartType', e.target.value)}
                className="wc-field-select"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="area">Area Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="donut">Donut Chart</option>
              </select>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Period</label>
              <select
                value={config.period || 'monthly'}
                onChange={(e) => handleChange('period', e.target.value)}
                className="wc-field-select"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Show Legend</label>
              <div className="wc-field-checkbox">
                <input
                  type="checkbox"
                  checked={config.showLegend !== false}
                  onChange={(e) => handleChange('showLegend', e.target.checked)}
                  className="wc-checkbox"
                />
                <span className="wc-checkbox-label">Display chart legend</span>
              </div>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Show Data Labels</label>
              <div className="wc-field-checkbox">
                <input
                  type="checkbox"
                  checked={config.showLabels || false}
                  onChange={(e) => handleChange('showLabels', e.target.checked)}
                  className="wc-checkbox"
                />
                <span className="wc-checkbox-label">Display data labels</span>
              </div>
            </div>
          </div>
        );

      case 'employee_ranking':
      case 'team_ranking':
        return (
          <div className="wc-config-fields">
            <div className="wc-field-group">
              <label className="wc-field-label">Ranking Limit</label>
              <input
                type="number"
                value={config.limit || 10}
                onChange={(e) => handleChange('limit', parseInt(e.target.value) || 10)}
                className="wc-field-input"
                min="3"
                max="20"
              />
              <p className="wc-field-hint">Number of top performers to display</p>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Metric</label>
              <select
                value={config.metric || 'productivity'}
                onChange={(e) => handleChange('metric', e.target.value)}
                className="wc-field-select"
              >
                <option value="productivity">Productivity</option>
                <option value="quality">Quality</option>
                <option value="efficiency">Efficiency</option>
                <option value="completion">Task Completion</option>
              </select>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Show Avatars</label>
              <div className="wc-field-checkbox">
                <input
                  type="checkbox"
                  checked={config.showAvatars !== false}
                  onChange={(e) => handleChange('showAvatars', e.target.checked)}
                  className="wc-checkbox"
                />
                <span className="wc-checkbox-label">Display user avatars</span>
              </div>
            </div>
          </div>
        );

      case 'goal_progress':
        return (
          <div className="wc-config-fields">
            <div className="wc-field-group">
              <label className="wc-field-label">Goal Type</label>
              <select
                value={config.goalType || 'all'}
                onChange={(e) => handleChange('goalType', e.target.value)}
                className="wc-field-select"
              >
                <option value="all">All Goals</option>
                <option value="personal">Personal Goals</option>
                <option value="team">Team Goals</option>
                <option value="department">Department Goals</option>
                <option value="company">Company Goals</option>
              </select>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Show Completed</label>
              <div className="wc-field-checkbox">
                <input
                  type="checkbox"
                  checked={config.showCompleted || false}
                  onChange={(e) => handleChange('showCompleted', e.target.checked)}
                  className="wc-checkbox"
                />
                <span className="wc-checkbox-label">Include completed goals</span>
              </div>
            </div>

            <div className="wc-field-group">
              <label className="wc-field-label">Show Timeline</label>
              <div className="wc-field-checkbox">
                <input
                  type="checkbox"
                  checked={config.showTimeline !== false}
                  onChange={(e) => handleChange('showTimeline', e.target.checked)}
                  className="wc-checkbox"
                />
                <span className="wc-checkbox-label">Display goal timeline</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="wc-empty-config">
            <Settings className="wc-empty-icon" />
            <p>No configuration options available for this widget</p>
            <span className="wc-empty-sub">The widget will use default settings</span>
          </div>
        );
    }
  };

  if (!widget) {
    return (
      <div className="wc-modal-overlay" onClick={onClose}>
        <div className="wc-modal" onClick={(e) => e.stopPropagation()}>
          <div className="wc-empty-config wc-empty-modal">
            <AlertCircle className="wc-empty-icon" />
            <p>Widget not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wc-modal-overlay" onClick={onClose}>
      <div className="wc-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wc-modal-header">
          <div className="wc-modal-header-left">
            <div className="wc-modal-icon">
              {getWidgetIcon(widget.type)}
            </div>
            <div>
              <h4 className="wc-modal-title">Widget Configuration</h4>
              <p className="wc-modal-subtitle">
                {widget.name} • {getWidgetTypeLabel(widget.type)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="wc-modal-close">
            <X className="wc-modal-close-icon" />
          </button>
        </div>

        {/* Content */}
        <div className="wc-modal-body">
          {renderConfigFields()}
        </div>

        {/* Footer */}
        <div className="wc-modal-footer">
          <button
            onClick={onClose}
            className="wc-cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="wc-save-btn"
          >
            {saving ? (
              <>
                <div className="wc-save-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="wc-save-icon" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        /* ============================================
           OVERLAY
           ============================================ */
        .wc-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
          animation: overlayFadeIn 0.3s ease;
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           MODAL
           ============================================ */
        .wc-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 480px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          animation: modalSlideIn 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        /* ============================================
           HEADER
           ============================================ */
        .wc-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .wc-modal-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wc-modal-icon {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wc-config-icon {
          width: 20px;
          height: 20px;
          color: #3b82f6;
        }

        .wc-modal-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .wc-modal-subtitle {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        .wc-modal-close {
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
        }

        .wc-modal-close:hover {
          background: #f3f4f6;
        }

        .wc-modal-close-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
        }

        /* ============================================
           BODY
           ============================================ */
        .wc-modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        /* ============================================
           CONFIG FIELDS
           ============================================ */
        .wc-config-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .wc-field-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wc-field-label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .wc-field-input,
        .wc-field-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          width: 100%;
        }

        .wc-field-input:focus,
        .wc-field-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .wc-field-hint {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 2px;
        }

        .wc-field-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
        }

        .wc-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #3b82f6;
          cursor: pointer;
        }

        .wc-checkbox-label {
          font-size: 14px;
          color: #374151;
          cursor: pointer;
        }

        .wc-checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 4px 0;
        }

        .wc-checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
        }

        .wc-checkbox-item input {
          cursor: pointer;
        }

        .wc-severity-critical { color: #dc2626; font-weight: 500; }
        .wc-severity-high { color: #f59e0b; font-weight: 500; }
        .wc-severity-medium { color: #3b82f6; font-weight: 500; }
        .wc-severity-low { color: #22c55e; font-weight: 500; }

        /* ============================================
           EMPTY CONFIG
           ============================================ */
        .wc-empty-config {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          text-align: center;
        }

        .wc-empty-icon {
          width: 48px;
          height: 48px;
          color: #d1d5db;
          margin-bottom: 12px;
        }

        .wc-empty-config p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .wc-empty-sub {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .wc-empty-modal {
          padding: 60px 20px;
        }

        /* ============================================
           FOOTER
           ============================================ */
        .wc-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 20px;
          border-top: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .wc-cancel-btn {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wc-cancel-btn:hover {
          background: #f3f4f6;
        }

        .wc-save-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wc-save-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .wc-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .wc-save-icon {
          width: 16px;
          height: 16px;
        }

        .wc-save-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 480px) {
          .wc-modal {
            margin: 12px;
          }

          .wc-modal-header {
            flex-wrap: wrap;
          }

          .wc-modal-header-left {
            flex-wrap: wrap;
          }

          .wc-modal-footer {
            flex-direction: column;
          }

          .wc-cancel-btn,
          .wc-save-btn {
            width: 100%;
            justify-content: center;
          }

          .wc-field-input,
          .wc-field-select {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default WidgetConfig;