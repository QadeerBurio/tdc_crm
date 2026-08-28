// pages/crm/Pipeline.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Filter, TrendingUp, Users, RefreshCw, Plus, Search } from 'lucide-react';
import { Loader } from '../../components/common/Loader';
import axios from 'axios';
import toast from 'react-hot-toast';

const Pipeline = () => {
  const { token } = useAuth();
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pipelineType, setPipelineType] = useState('US_OUTREACH');
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchPipeline();
  }, [pipelineType]);

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/crm/leads/pipeline`, {
        params: { pipelineType },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setPipeline(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching pipeline:', err);
      let errorMessage = 'Failed to load pipeline data.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view the pipeline.';
        } else if (err.response.status === 404) {
          errorMessage = 'Pipeline not found. Please check your configuration.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
      setPipeline([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    // Optimistic update
    const optimisticPipeline = pipeline.map(stage => {
      if (stage.stage === source.droppableId) {
        return {
          ...stage,
          leads: stage.leads.filter(lead => lead._id !== draggableId),
          count: stage.count - 1
        };
      }
      if (stage.stage === destination.droppableId) {
        const movedLead = pipeline.find(s => s.stage === source.droppableId)
          ?.leads.find(l => l._id === draggableId);
        if (movedLead) {
          return {
            ...stage,
            leads: [...stage.leads, movedLead],
            count: stage.count + 1
          };
        }
      }
      return stage;
    });
    
    setPipeline(optimisticPipeline);
    setUpdating(true);

    try {
      await axios.patch(`${API_URL}/crm/leads/${draggableId}/stage`, 
        { stage: destination.droppableId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Lead stage updated successfully');
      await fetchPipeline();
    } catch (err) {
      console.error('Error updating lead stage:', err);
      let errorMessage = 'Failed to update lead stage.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to update this lead.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
      // Revert optimistic update on error
      await fetchPipeline();
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStageLabel = (stage) => {
    const labels = {
      'SCRAPED_SOURCED': '📋 Scraped/Sourced',
      'INITIAL_VERIFICATION': '✅ Verification',
      'FIRST_SEQUENCE_SENT': '📧 First Sequence',
      'FOLLOW_UP_PROTOCOL': '🔄 Follow Up',
      'DISCOVERY_CALL_SCHEDULED': '📅 Discovery Call',
      'PROPOSAL_PITCHED': '📄 Proposal',
      'NEGOTIATING': '🤝 Negotiating',
      'WON': '🏆 Won',
      'LOST': '❌ Lost',
    };
    return labels[stage] || stage.replace(/_/g, ' ');
  };

  const getStageColor = (stage) => {
    const colors = {
      'SCRAPED_SOURCED': '#dbeafe',
      'INITIAL_VERIFICATION': '#dbeafe',
      'FIRST_SEQUENCE_SENT': '#fef3c7',
      'FOLLOW_UP_PROTOCOL': '#fef3c7',
      'DISCOVERY_CALL_SCHEDULED': '#d1fae5',
      'PROPOSAL_PITCHED': '#d1fae5',
      'NEGOTIATING': '#ede9fe',
      'WON': '#dcfce7',
      'LOST': '#fee2e2',
    };
    return colors[stage] || '#f3f4f6';
  };

  if (loading) {
    return (
      <div className="pipeline-loading">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="pipeline-container">
      {/* Header */}
      <div className="pipeline-header">
        <div className="pipeline-header-left">
          <h1 className="pipeline-title">
            <TrendingUp className="pipeline-title-icon" />
            Sales Pipeline
          </h1>
          <p className="pipeline-subtitle">
            Drag and drop leads between stages to update their progress
          </p>
        </div>
        <div className="pipeline-header-right">
          <div className="pipeline-toggle">
            <button
              onClick={() => setPipelineType('US_OUTREACH')}
              className={`pipeline-toggle-btn ${pipelineType === 'US_OUTREACH' ? 'pipeline-toggle-active' : 'pipeline-toggle-inactive'}`}
            >
              US Outreach
            </button>
            <button
              onClick={() => setPipelineType('LOCAL_RETAINER')}
              className={`pipeline-toggle-btn ${pipelineType === 'LOCAL_RETAINER' ? 'pipeline-toggle-active' : 'pipeline-toggle-inactive'}`}
            >
              Local Retainer
            </button>
          </div>
          <button onClick={fetchPipeline} className="pipeline-refresh-btn">
            <RefreshCw className="pipeline-refresh-icon" />
          </button>
        </div>
      </div>

      {/* Pipeline Boards */}
      {pipeline && pipeline.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="pipeline-grid">
            {pipeline.map((stage) => (
              <div key={stage.stage} className="pipeline-stage">
                <div className="pipeline-stage-header">
                  <div className="pipeline-stage-info">
                    <h3 className="pipeline-stage-title">
                      {getStageLabel(stage.stage)}
                    </h3>
                    <div className="pipeline-stage-stats">
                      <span className="pipeline-stage-count">
                        {stage.count || 0} leads
                      </span>
                      {stage.totalValue > 0 && (
                        <span className="pipeline-stage-value">
                          • {formatCurrency(stage.totalValue)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="pipeline-stage-badge">
                    {stage.count || 0}
                  </div>
                </div>

                <Droppable droppableId={stage.stage}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`pipeline-droppable ${snapshot.isDraggingOver ? 'pipeline-droppable-drag' : ''}`}
                    >
                      {stage.leads && stage.leads.map((lead, index) => (
                        <Draggable
                          key={lead._id}
                          draggableId={lead._id}
                          index={index}
                          isDragDisabled={updating}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`pipeline-lead ${snapshot.isDragging ? 'pipeline-lead-dragging' : ''}`}
                            >
                              <div className="pipeline-lead-content">
                                <div className="pipeline-lead-info">
                                  <p className="pipeline-lead-company">
                                    {lead.companyName || 'N/A'}
                                  </p>
                                  <p className="pipeline-lead-contact">
                                    {lead.contactName || 'N/A'}
                                  </p>
                                </div>
                                <span className={`pipeline-lead-status ${lead.status || 'active'}`}>
                                  {lead.status ? lead.status.charAt(0).toUpperCase() + lead.status.slice(1) : 'N/A'}
                                </span>
                              </div>
                              <div className="pipeline-lead-footer">
                                <span className="pipeline-lead-score">
                                  Score: {lead.leadScore || 0}
                                </span>
                                {lead.assignedTo && (
                                  <div className="pipeline-lead-assignee">
                                    <div className="pipeline-lead-avatar">
                                      {lead.assignedTo.firstName?.[0] || '?'}
                                    </div>
                                    <span className="pipeline-lead-assignee-name">
                                      {lead.assignedTo.firstName || 'Unknown'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {(!stage.leads || stage.leads.length === 0) && (
                        <p className="pipeline-empty-state">
                          No leads in this stage
                        </p>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="pipeline-empty">
          <div className="pipeline-empty-content">
            <div className="pipeline-empty-icon-wrapper">
              <TrendingUp className="pipeline-empty-icon" />
            </div>
            <h3 className="pipeline-empty-title">No Pipeline Data</h3>
            <p className="pipeline-empty-text">
              No leads found in the pipeline. Start by adding leads to track your sales process.
            </p>
          </div>
        </div>
      )}

      {updating && (
        <div className="pipeline-updating">
          <Loader size="sm" />
          <span className="pipeline-updating-text">Updating...</span>
        </div>
      )}

      {/* Styles */}
      <style>{`
        /* Container */
        .pipeline-container {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .pipeline-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 64vh;
        }

        /* Header */
        .pipeline-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pipeline-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pipeline-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .pipeline-title-icon {
          width: 28px;
          height: 28px;
          color: #3b82f6;
        }

        .pipeline-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .pipeline-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pipeline-toggle {
          display: flex;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #d1d5db;
        }

        .pipeline-toggle-btn {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #f3f4f6;
          color: #374151;
        }

        .pipeline-toggle-btn:hover {
          background: #e5e7eb;
        }

        .pipeline-toggle-active {
          background: #3b82f6;
          color: #ffffff;
        }

        .pipeline-toggle-active:hover {
          background: #2563eb;
        }

        .pipeline-toggle-inactive {
          background: #f3f4f6;
          color: #374151;
        }

        .pipeline-refresh-btn {
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

        .pipeline-refresh-btn:hover {
          background: #f9fafb;
        }

        .pipeline-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        /* Pipeline Grid */
        .pipeline-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .pipeline-stage {
          background: #f9fafb;
          border-radius: 12px;
          padding: 16px;
          height: 100%;
          min-width: 260px;
        }

        .pipeline-stage-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .pipeline-stage-info {
          flex: 1;
          min-width: 0;
        }

        .pipeline-stage-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .pipeline-stage-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }

        .pipeline-stage-count {
          font-size: 12px;
          color: #6b7280;
        }

        .pipeline-stage-value {
          font-size: 12px;
          color: #6b7280;
        }

        .pipeline-stage-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          padding: 0 8px;
          background: #ffffff;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Droppable */
        .pipeline-droppable {
          min-height: 200px;
          padding: 4px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        .pipeline-droppable-drag {
          background-color: #f3f4f6;
        }

        /* Lead Card */
        .pipeline-lead {
          background: #ffffff;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          margin-bottom: 8px;
          transition: all 0.2s ease;
          cursor: grab;
        }

        .pipeline-lead:hover {
          border-color: #9ca3af;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .pipeline-lead:active {
          cursor: grabbing;
        }

        .pipeline-lead-dragging {
          border-color: #3b82f6;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .pipeline-lead-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pipeline-lead-info {
          flex: 1;
          min-width: 0;
        }

        .pipeline-lead-company {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pipeline-lead-contact {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        .pipeline-lead-status {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 500;
          margin-left: 8px;
          flex-shrink: 0;
        }

        .pipeline-lead-status.active {
          background: #d1fae5;
          color: #065f46;
        }

        .pipeline-lead-status.stale {
          background: #fef3c7;
          color: #92400e;
        }

        .pipeline-lead-status.converted {
          background: #dbeafe;
          color: #1e40af;
        }

        .pipeline-lead-status.lost {
          background: #fee2e2;
          color: #991b1b;
        }

        .pipeline-lead-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
        }

        .pipeline-lead-score {
          font-size: 11px;
          color: #6b7280;
        }

        .pipeline-lead-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pipeline-lead-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 600;
        }

        .pipeline-lead-assignee-name {
          font-size: 11px;
          color: #6b7280;
        }

        .pipeline-empty-state {
          text-align: center;
          padding: 32px 0;
          font-size: 14px;
          color: #9ca3af;
        }

        /* Empty Pipeline */
        .pipeline-empty {
          background: #ffffff;
          border: 2px dashed #e5e7eb;
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
        }

        .pipeline-empty-content {
          max-width: 400px;
          margin: 0 auto;
        }

        .pipeline-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #eff6ff;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .pipeline-empty-icon {
          width: 40px;
          height: 40px;
          color: #93c5fd;
        }

        .pipeline-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .pipeline-empty-text {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        /* Updating Overlay */
        .pipeline-updating {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #ffffff;
          padding: 12px 20px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1000;
        }

        .pipeline-updating-text {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .pipeline-container {
            padding: 16px;
          }

          .pipeline-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .pipeline-header-right {
            width: 100%;
          }

          .pipeline-toggle {
            flex: 1;
          }

          .pipeline-toggle-btn {
            flex: 1;
            text-align: center;
          }

          .pipeline-grid {
            grid-template-columns: 1fr;
          }

          .pipeline-stage {
            min-width: unset;
          }
        }

        @media (max-width: 480px) {
          .pipeline-container {
            padding: 12px;
          }

          .pipeline-title {
            font-size: 20px;
          }

          .pipeline-header-right {
            flex-direction: column;
          }

          .pipeline-toggle {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Pipeline;