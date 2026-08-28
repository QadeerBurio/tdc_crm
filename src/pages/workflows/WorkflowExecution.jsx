// pages/workflows/WorkflowExecution.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import {
  Play, Pause, Check, X, ArrowRight,
  Clock, AlertCircle, CheckCircle,
  RefreshCw, Eye, Settings, Zap,
  History, Users, Calendar, FileText,
  ChevronDown, ChevronRight, Activity,
  Layers, Target, Building2, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

const WorkflowExecution = () => {
  const { entityType, entityId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [currentStage, setCurrentStage] = useState(null);
  const [entityDetails, setEntityDetails] = useState(null);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    if (entityType && entityId) {
      fetchWorkflowStatus();
      fetchEntityDetails();
    }
  }, [entityType, entityId]);

  const fetchWorkflowStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/workflows/status/${entityType}/${entityId}`,
        getHeaders()
      );
      const data = response.data.data;
      setWorkflow(data);
      setCurrentStage(data.currentStage);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching workflow status:', error);
      toast.error('Failed to load workflow status');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntityDetails = async () => {
    try {
      const endpoints = {
        task: `/tasks/${entityId}`,
        project: `/projects/${entityId}`,
        lead: `/crm/leads/${entityId}`,
        client: `/clients/${entityId}`,
        retainer: `/retainers/${entityId}`,
        partner: `/partners/${entityId}`,
        goal: `/goals/${entityId}`
      };
      
      const endpoint = endpoints[entityType];
      if (endpoint) {
        const response = await axios.get(`${API_URL}${endpoint}`, getHeaders());
        setEntityDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching entity details:', error);
    }
  };

  const executeTransition = async (fromStage, toStage) => {
    setExecuting(true);
    try {
      await axios.post(
        `${API_URL}/workflows/transition`,
        {
          workflowId: workflow?.workflow?.id,
          fromStage,
          toStage,
          entityType,
          entityId
        },
        getHeaders()
      );
      toast.success('Transition executed successfully');
      await fetchWorkflowStatus();
    } catch (error) {
      console.error('Error executing transition:', error);
      toast.error('Failed to execute transition');
    } finally {
      setExecuting(false);
    }
  };

  const getStageColor = (color) => {
    return color || '#6B7280';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="we-status-icon we-status-completed" />;
    if (status === 'in_progress') return <Clock className="we-status-icon we-status-inprogress" />;
    if (status === 'pending') return <Clock className="we-status-icon we-status-pending" />;
    if (status === 'failed') return <AlertCircle className="we-status-icon we-status-failed" />;
    return <Activity className="we-status-icon we-status-default" />;
  };

  const getStageStatus = (stageName) => {
    if (currentStage === stageName) return 'in_progress';
    if (history.some(h => h.toStage === stageName)) return 'completed';
    return 'pending';
  };

  const getEntityIcon = () => {
    const icons = {
      task: FileText,
      project: Briefcase,
      lead: Target,
      client: Users,
      retainer: Layers,
      partner: Building2,
      goal: Target
    };
    const Icon = icons[entityType] || FileText;
    return <Icon className="we-entity-icon" />;
  };

  const getEntityLabel = () => {
    const labels = {
      task: 'Task',
      project: 'Project',
      lead: 'Lead',
      client: 'Client',
      retainer: 'Retainer',
      partner: 'Partner',
      goal: 'Goal'
    };
    return labels[entityType] || entityType;
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="we-loading">
        <div className="we-loading-spinner"></div>
        <p className="we-loading-text">Loading workflow execution...</p>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="we-empty">
        <div className="we-empty-icon-wrapper">
          <Settings className="we-empty-icon" />
        </div>
        <h2 className="we-empty-title">No Workflow Found</h2>
        <p className="we-empty-subtitle">No workflow configured for this {getEntityLabel().toLowerCase()}</p>
        <button
          onClick={() => navigate(`/${entityType}s`)}
          className="we-empty-btn"
        >
          Back to {getEntityLabel()}s
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="we-container">
        {/* Header */}
        <div className="we-header">
          <div className="we-header-left">
            <div className="we-header-title-wrap">
              <div className="we-header-icon">
                {getEntityIcon()}
              </div>
              <div>
                <h1 className="we-title">Workflow Execution</h1>
                <p className="we-subtitle">
                  <span className="we-entity-label">{getEntityLabel()}</span>
                  <span className="we-entity-id">#{entityId}</span>
                  <span className="we-workflow-name">• {workflow.workflow?.name || 'Workflow'}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="we-header-right">
            <button
              onClick={fetchWorkflowStatus}
              className="we-refresh-btn"
              disabled={executing}
            >
              <RefreshCw className={`we-refresh-icon ${executing ? 'we-spin' : ''}`} />
            </button>
            <span className={`we-status-badge ${workflow.workflow?.isActive ? 'we-status-active' : 'we-status-inactive'}`}>
              {workflow.workflow?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Entity Info */}
        {entityDetails && (
          <div className="we-entity-info">
            <div className="we-entity-info-content">
              <span className="we-entity-info-label">Entity:</span>
              <span className="we-entity-info-name">{entityDetails.name || entityDetails.title || 'N/A'}</span>
              {entityDetails.status && (
                <span className="we-entity-info-status">{entityDetails.status}</span>
              )}
            </div>
          </div>
        )}

        {/* Workflow Visual */}
        <div className="we-section">
          <h3 className="we-section-title">Workflow Progress</h3>
          <div className="we-workflow-visual">
            <div className="we-stages">
              {workflow.stages?.sort((a, b) => a.order - b.order).map((stage, index) => {
                const status = getStageStatus(stage.name);
                const isCurrent = status === 'in_progress';
                const isCompleted = status === 'completed';
                const isPending = status === 'pending';
                
                return (
                  <div key={stage.id} className="we-stage-wrap">
                    <div 
                      className={`we-stage ${isCurrent ? 'we-stage-current' : ''} ${isCompleted ? 'we-stage-completed' : ''} ${isPending ? 'we-stage-pending' : ''}`}
                    >
                      <div 
                        className="we-stage-dot"
                        style={{ backgroundColor: getStageColor(stage.color) }}
                      />
                      <div className="we-stage-name">{stage.name}</div>
                      <div className="we-stage-order">#{index + 1}</div>
                      <div className="we-stage-status">
                        {getStatusIcon(status)}
                        <span className={`we-stage-status-label ${isCurrent ? 'we-status-inprogress' : ''} ${isCompleted ? 'we-status-completed' : ''} ${isPending ? 'we-status-pending' : ''}`}>
                          {isCurrent ? 'Current' : isCompleted ? 'Done' : 'Pending'}
                        </span>
                      </div>
                      {stage.description && (
                        <div className="we-stage-desc">{stage.description}</div>
                      )}
                    </div>

                    {index < workflow.stages.length - 1 && (
                      <div className="we-transition-wrap">
                        <ArrowRight className="we-transition-arrow" />
                        {workflow.transitions
                          ?.filter(t => t.fromStage === stage.name)
                          .map((transition, idx) => {
                            const isCompletedTransition = history.some(h => h.fromStage === transition.fromStage && h.toStage === transition.toStage);
                            return (
                              <button
                                key={idx}
                                onClick={() => executeTransition(transition.fromStage, transition.toStage)}
                                disabled={executing || isCompletedTransition || !isCurrent}
                                className={`we-transition-btn ${isCompletedTransition ? 'we-transition-completed' : ''} ${isCurrent && !isCompletedTransition ? 'we-transition-available' : ''} ${!isCurrent && !isCompletedTransition ? 'we-transition-disabled' : ''}`}
                              >
                                {isCompletedTransition ? (
                                  <Check className="we-transition-icon" />
                                ) : (
                                  transition.label || 'Transition'
                                )}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="we-legend">
            <div className="we-legend-item">
              <div className="we-legend-dot we-legend-current"></div>
              <span>Current</span>
            </div>
            <div className="we-legend-item">
              <div className="we-legend-dot we-legend-completed"></div>
              <span>Completed</span>
            </div>
            <div className="we-legend-item">
              <div className="we-legend-dot we-legend-pending"></div>
              <span>Pending</span>
            </div>
          </div>
        </div>

        {/* Execution History */}
        <div className="we-section">
          <div className="we-section-header">
            <h3 className="we-section-title">Execution History</h3>
            <button className="we-view-all-btn">
              View All →
            </button>
          </div>
          <div className="we-history">
            {history.length === 0 ? (
              <div className="we-history-empty">
                <Clock className="we-history-empty-icon" />
                <p>No execution history yet</p>
              </div>
            ) : (
              history.map((item, idx) => (
                <div key={idx} className="we-history-item">
                  <div className="we-history-icon">
                    <Check className="we-history-check" />
                  </div>
                  <div className="we-history-content">
                    <p className="we-history-text">
                      <span className="we-history-from">{item.fromStage}</span>
                      <ArrowRight className="we-history-arrow" />
                      <span className="we-history-to">{item.toStage}</span>
                    </p>
                    <div className="we-history-meta">
                      <span>{item.user || 'System'}</span>
                      <span>•</span>
                      <span>{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                  <button className="we-history-action">
                    <Eye className="we-history-action-icon" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="we-actions">
          <button 
            className="we-action-btn we-action-primary"
            onClick={() => {
              const nextTransition = workflow.transitions?.find(t => t.fromStage === currentStage);
              if (nextTransition) {
                executeTransition(nextTransition.fromStage, nextTransition.toStage);
              } else {
                toast.info('No next transition available');
              }
            }}
            disabled={executing}
          >
            <Zap className="we-action-icon" />
            Execute Next
          </button>
          <button 
            className="we-action-btn we-action-secondary"
            onClick={() => navigate(`/workflows/execution/${entityType}/${entityId}/history`)}
          >
            <History className="we-action-icon" />
            View History
          </button>
          <button 
            className="we-action-btn we-action-secondary"
            onClick={() => navigate(`/${entityType}s/${entityId}`)}
          >
            <FileText className="we-action-icon" />
            View {getEntityLabel()}
          </button>
          <button 
            className="we-action-btn we-action-secondary"
            onClick={() => navigate('/workflows')}
          >
            <Settings className="we-action-icon" />
            All Workflows
          </button>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .we-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           HEADER
           ============================================ */
        .we-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .we-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .we-header-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .we-header-icon {
          width: 44px;
          height: 44px;
          background: #eff6ff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .we-entity-icon {
          width: 22px;
          height: 22px;
          color: #3b82f6;
        }

        .we-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .we-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .we-entity-label {
          font-weight: 600;
          color: #374151;
        }

        .we-entity-id {
          font-family: monospace;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .we-workflow-name {
          color: #6b7280;
        }

        .we-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .we-refresh-btn {
          padding: 8px 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .we-refresh-btn:hover:not(:disabled) {
          background: #f9fafb;
        }

        .we-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .we-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .we-spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .we-status-badge {
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .we-status-active {
          background: #dcfce7;
          color: #16a34a;
        }

        .we-status-inactive {
          background: #f3f4f6;
          color: #6b7280;
        }

        /* ============================================
           ENTITY INFO
           ============================================ */
        .we-entity-info {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 20px;
        }

        .we-entity-info-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .we-entity-info-label {
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
        }

        .we-entity-info-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .we-entity-info-status {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          background: #dbeafe;
          color: #1d4ed8;
          border-radius: 9999px;
        }

        /* ============================================
           SECTIONS
           ============================================ */
        .we-section {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 20px;
          transition: all 0.2s ease;
        }

        .we-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .we-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .we-view-all-btn {
          font-size: 13px;
          color: #3b82f6;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }

        .we-view-all-btn:hover {
          color: #2563eb;
        }

        /* ============================================
           WORKFLOW VISUAL
           ============================================ */
        .we-workflow-visual {
          overflow-x: auto;
          padding: 8px 0;
        }

        .we-stages {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: max-content;
          padding: 8px 4px;
        }

        .we-stage-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .we-stage {
          padding: 16px 20px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          min-width: 130px;
          text-align: center;
          transition: all 0.3s ease;
          background: #ffffff;
        }

        .we-stage-current {
          border-color: #3b82f6;
          background: #eff6ff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .we-stage-completed {
          border-color: #22c55e;
          background: #f0fdf4;
        }

        .we-stage-pending {
          border-color: #e5e7eb;
          background: #ffffff;
          opacity: 0.7;
        }

        .we-stage-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin: 0 auto 8px;
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 2px #d1d5db;
        }

        .we-stage-current .we-stage-dot {
          box-shadow: 0 0 0 2px #3b82f6;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 2px #3b82f6; }
          50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.2); }
          100% { box-shadow: 0 0 0 2px #3b82f6; }
        }

        .we-stage-name {
          font-weight: 600;
          color: #111827;
          font-size: 14px;
        }

        .we-stage-order {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }

        .we-stage-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-top: 6px;
        }

        .we-status-icon {
          width: 16px;
          height: 16px;
        }

        .we-status-completed { color: #22c55e; }
        .we-status-inprogress { color: #3b82f6; }
        .we-status-pending { color: #eab308; }
        .we-status-failed { color: #ef4444; }
        .we-status-default { color: #9ca3af; }

        .we-stage-status-label {
          font-size: 11px;
          font-weight: 500;
        }

        .we-stage-status-label.we-status-completed { color: #22c55e; }
        .we-stage-status-label.we-status-inprogress { color: #3b82f6; }
        .we-stage-status-label.we-status-pending { color: #eab308; }

        .we-stage-desc {
          font-size: 11px;
          color: #6b7280;
          margin-top: 4px;
          max-width: 120px;
        }

        .we-transition-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 0 4px;
        }

        .we-transition-arrow {
          width: 20px;
          height: 20px;
          color: #d1d5db;
        }

        .we-transition-btn {
          padding: 2px 10px;
          font-size: 10px;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          white-space: nowrap;
        }

        .we-transition-completed {
          background: #dcfce7;
          color: #16a34a;
          cursor: default;
        }

        .we-transition-available {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .we-transition-available:hover {
          background: #bfdbfe;
          transform: scale(1.05);
        }

        .we-transition-disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .we-transition-icon {
          width: 12px;
          height: 12px;
        }

        /* ============================================
           LEGEND
           ============================================ */
        .we-legend {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-top: 16px;
          margin-top: 16px;
          border-top: 1px solid #f3f4f6;
          flex-wrap: wrap;
        }

        .we-legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6b7280;
        }

        .we-legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .we-legend-current { background: #3b82f6; }
        .we-legend-completed { background: #22c55e; }
        .we-legend-pending { background: #d1d5db; }

        /* ============================================
           HISTORY
           ============================================ */
        .we-history {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .we-history-empty {
          text-align: center;
          padding: 24px;
          color: #6b7280;
        }

        .we-history-empty-icon {
          width: 32px;
          height: 32px;
          color: #d1d5db;
          margin: 0 auto 8px;
          display: block;
        }

        .we-history-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: #f9fafb;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .we-history-item:hover {
          background: #f3f4f6;
        }

        .we-history-icon {
          width: 32px;
          height: 32px;
          background: #dcfce7;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .we-history-check {
          width: 16px;
          height: 16px;
          color: #16a34a;
        }

        .we-history-content {
          flex: 1;
          min-width: 0;
        }

        .we-history-text {
          font-size: 14px;
          color: #111827;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .we-history-from,
        .we-history-to {
          font-weight: 500;
        }

        .we-history-from { color: #3b82f6; }
        .we-history-to { color: #22c55e; }

        .we-history-arrow {
          width: 14px;
          height: 14px;
          color: #9ca3af;
        }

        .we-history-meta {
          font-size: 12px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }

        .we-history-action {
          padding: 4px;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #9ca3af;
        }

        .we-history-action:hover {
          background: #e5e7eb;
          color: #4b5563;
        }

        .we-history-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           ACTIONS
           ============================================ */
        .we-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .we-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .we-action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .we-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .we-action-primary {
          background: #3b82f6;
          color: #ffffff;
          border-color: #3b82f6;
        }

        .we-action-primary:hover:not(:disabled) {
          background: #2563eb;
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .we-action-secondary:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .we-action-icon {
          width: 18px;
          height: 18px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .we-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .we-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .we-empty-icon {
          width: 40px;
          height: 40px;
          color: #9ca3af;
        }

        .we-empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .we-empty-subtitle {
          color: #6b7280;
          margin-top: 4px;
        }

        .we-empty-btn {
          margin-top: 16px;
          padding: 10px 24px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .we-empty-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        /* ============================================
           LOADING
           ============================================ */
        .we-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .we-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .we-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .we-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .we-header-right {
            width: 100%;
          }

          .we-section {
            padding: 16px;
          }

          .we-stage {
            min-width: 100px;
            padding: 12px 14px;
          }

          .we-actions {
            grid-template-columns: 1fr 1fr;
          }

          .we-stages {
            gap: 4px;
          }

          .we-stage-wrap {
            flex-direction: column;
            align-items: center;
          }

          .we-transition-wrap {
            flex-direction: row;
            padding: 4px 0;
          }

          .we-transition-arrow {
            transform: rotate(90deg);
            width: 16px;
            height: 16px;
          }

          .we-subtitle {
            font-size: 13px;
          }

          .we-history-item {
            flex-wrap: wrap;
          }

          .we-history-action {
            margin-left: auto;
          }
        }

        @media (max-width: 480px) {
          .we-actions {
            grid-template-columns: 1fr;
          }

          .we-stage {
            min-width: 80px;
            padding: 10px 12px;
          }

          .we-stage-name {
            font-size: 12px;
          }

          .we-header-title-wrap {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
};

export default WorkflowExecution;