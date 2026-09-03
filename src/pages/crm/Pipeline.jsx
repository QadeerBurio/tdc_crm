// pages/crm/Pipeline.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Filter, TrendingUp, Users, RefreshCw, Plus, Search, Activity, Zap, Clock, Award, Target, BarChart3 } from 'lucide-react';
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
  const [hoveredStage, setHoveredStage] = useState(null);

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
      'SCRAPED_SOURCED': '📋 Sourced',
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
      'SCRAPED_SOURCED': { bg: '#FFEFB3', text: '#013E37', border: '#013E37' },
      'INITIAL_VERIFICATION': { bg: '#FFEFB3', text: '#013E37', border: '#013E37' },
      'FIRST_SEQUENCE_SENT': { bg: '#FFEFB3', text: '#013E37', border: '#013E37' },
      'FOLLOW_UP_PROTOCOL': { bg: '#FFEFB3', text: '#013E37', border: '#013E37' },
      'DISCOVERY_CALL_SCHEDULED': { bg: '#FFEFB3', text: '#013E37', border: '#013E37' },
      'PROPOSAL_PITCHED': { bg: '#FFEFB3', text: '#013E37', border: '#013E37' },
      'NEGOTIATING': { bg: '#FFEFB3', text: '#013E37', border: '#013E37' },
      'WON': { bg: '#013E37', text: '#FFFFFF', border: '#013E37' },
      'LOST': { bg: '#FFEBEE', text: '#D32F2F', border: '#D32F2F' },
    };
    return colors[stage] || { bg: '#FFEFB3', text: '#013E37', border: '#013E37' };
  };

  const getStageIcon = (stage) => {
    const icons = {
      'SCRAPED_SOURCED': <Zap size={14} />,
      'INITIAL_VERIFICATION': <CheckCircle size={14} />,
      'FIRST_SEQUENCE_SENT': <Mail size={14} />,
      'FOLLOW_UP_PROTOCOL': <RefreshCw size={14} />,
      'DISCOVERY_CALL_SCHEDULED': <Calendar size={14} />,
      'PROPOSAL_PITCHED': <FileText size={14} />,
      'NEGOTIATING': <Users size={14} />,
      'WON': <Award size={14} />,
      'LOST': <X size={14} />,
    };
    return icons[stage] || <Activity size={14} />;
  };

  // Helper icons
  const CheckCircle = ({ size }) => <svg className={`w-${size} h-${size}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  const Mail = ({ size }) => <svg className={`w-${size} h-${size}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
  const Calendar = ({ size }) => <svg className={`w-${size} h-${size}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  const FileText = ({ size }) => <svg className={`w-${size} h-${size}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
  const X = ({ size }) => <svg className={`w-${size} h-${size}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

  if (loading) {
    return (
      <div className="pipeline-loading">
        <div className="pipeline-loading-spinner"></div>
        <p className="pipeline-loading-text">Loading pipeline...</p>
      </div>
    );
  }

  // Calculate total metrics
  const totalLeads = pipeline.reduce((sum, stage) => sum + (stage.count || 0), 0);
  const totalValue = pipeline.reduce((sum, stage) => sum + (stage.totalValue || 0), 0);
  const wonLeads = pipeline.find(s => s.stage === 'WON')?.count || 0;

  return (
    <div className="pipeline-container">
      {/* Header */}
      <div className="pipeline-header">
        <div className="pipeline-header-left">
          <h1 className="pipeline-title">
            <TrendingUp className="pipeline-title-icon" color="#013E37" />
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
              className={`pipeline-toggle-btn ${pipelineType === 'US_OUTREACH' ? 'pipeline-toggle-active' : ''}`}
            >
              US Outreach
            </button>
            <button
              onClick={() => setPipelineType('LOCAL_RETAINER')}
              className={`pipeline-toggle-btn ${pipelineType === 'LOCAL_RETAINER' ? 'pipeline-toggle-active' : ''}`}
            >
              Local Retainer
            </button>
          </div>
          <button onClick={fetchPipeline} className="pipeline-refresh-btn">
            <RefreshCw className="pipeline-refresh-icon" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {pipeline && pipeline.length > 0 && (
        <div className="pipeline-stats">
          <div className="pipeline-stat-card">
            <div className="pipeline-stat-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
              <Users size={20} color="#013E37" />
            </div>
            <div>
              <p className="pipeline-stat-value">{totalLeads}</p>
              <p className="pipeline-stat-label">Total Leads</p>
            </div>
          </div>
          <div className="pipeline-stat-card">
            <div className="pipeline-stat-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
              <DollarSign size={20} color="#013E37" />
            </div>
            <div>
              <p className="pipeline-stat-value">{formatCurrency(totalValue)}</p>
              <p className="pipeline-stat-label">Total Value</p>
            </div>
          </div>
          <div className="pipeline-stat-card">
            <div className="pipeline-stat-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
              <Award size={20} color="#013E37" />
            </div>
            <div>
              <p className="pipeline-stat-value">{wonLeads}</p>
              <p className="pipeline-stat-label">Won Deals</p>
            </div>
          </div>
          <div className="pipeline-stat-card">
            <div className="pipeline-stat-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
              <Activity size={20} color="#013E37" />
            </div>
            <div>
              <p className="pipeline-stat-value">{pipeline.length}</p>
              <p className="pipeline-stat-label">Active Stages</p>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Boards */}
      {pipeline && pipeline.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="pipeline-grid">
            {pipeline.map((stage) => {
              const colors = getStageColor(stage.stage);
              const isHovered = hoveredStage === stage.stage;
              
              return (
                <div 
                  key={stage.stage} 
                  className="pipeline-stage"
                  style={{ 
                    backgroundColor: isHovered ? '#FFEFB3' : '#F8FAFC',
                    borderColor: colors.border,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                  onMouseEnter={() => setHoveredStage(stage.stage)}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  <div className="pipeline-stage-header">
                    <div className="pipeline-stage-info">
                      <h3 className="pipeline-stage-title">
                        {getStageIcon(stage.stage)}
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
                    <div 
                      className="pipeline-stage-badge"
                      style={{ 
                        backgroundColor: colors.bg, 
                        color: colors.text,
                        border: `2px solid ${colors.border}`
                      }}
                    >
                      {stage.count || 0}
                    </div>
                  </div>

                  <Droppable droppableId={stage.stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`pipeline-droppable ${snapshot.isDraggingOver ? 'pipeline-droppable-drag' : ''}`}
                        style={{
                          backgroundColor: snapshot.isDraggingOver ? '#FFEFB3' : 'transparent',
                          transition: 'background-color 0.3s ease'
                        }}
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
                                style={{
                                  ...provided.draggableProps.style,
                                  borderColor: snapshot.isDragging ? '#013E37' : '#FFEFB3'
                                }}
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
                                      <div className="pipeline-lead-avatar" style={{ background: 'linear-gradient(135deg, #013E37, #0A5C54)' }}>
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
                          <div className="pipeline-empty-state">
                            <div className="pipeline-empty-state-icon">
                              <Activity size={24} color="#013E37" opacity="0.3" />
                            </div>
                            <p>No leads in this stage</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        <div className="pipeline-empty">
          <div className="pipeline-empty-content">
            <div className="pipeline-empty-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
              <TrendingUp className="pipeline-empty-icon" color="#013E37" />
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
          <div className="pipeline-updating-spinner"></div>
          <span className="pipeline-updating-text">Updating...</span>
        </div>
      )}

      {/* Styles */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .pipeline-container {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .pipeline-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 64vh;
          gap: 16px;
        }

        .pipeline-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .pipeline-loading-text {
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           HEADER
           ============================================ */
        .pipeline-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeInDown 0.6s ease;
        }

        .pipeline-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pipeline-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .pipeline-title-icon {
          width: 28px;
          height: 28px;
          animation: pulse 2s ease-in-out infinite;
        }

        .pipeline-subtitle {
          color: #013E37;
          opacity: 0.6;
          font-size: 15px;
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
          border: 1px solid #FFEFB3;
          background: #FFFFFF;
        }

        .pipeline-toggle-btn {
          padding: 8px 20px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #FFFFFF;
          color: #013E37;
        }

        .pipeline-toggle-btn:hover {
          background: #FFEFB3;
        }

        .pipeline-toggle-active {
          background: #013E37;
          color: #FFFFFF;
        }

        .pipeline-toggle-active:hover {
          background: #0A5C54;
        }

        .pipeline-refresh-btn {
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pipeline-refresh-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: rotate(180deg);
        }

        .pipeline-refresh-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
        }

        /* ============================================
           STATS
           ============================================ */
        .pipeline-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
          animation: fadeInUp 0.8s ease;
        }

        .pipeline-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #FFFFFF;
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
        }

        .pipeline-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }

        .pipeline-stat-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .pipeline-stat-card:hover .pipeline-stat-icon-wrapper {
          transform: scale(1.05);
        }

        .pipeline-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          line-height: 1.2;
        }

        .pipeline-stat-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
          font-weight: 500;
        }

        /* ============================================
           PIPELINE GRID
           ============================================ */
        .pipeline-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          animation: fadeIn 1s ease;
        }

        .pipeline-stage {
          border-radius: 14px;
          padding: 16px;
          height: 100%;
          min-width: 280px;
          transition: all 0.3s ease;
          position: relative;
        }

        .pipeline-stage::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #013E37, #0A5C54);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 14px 14px 0 0;
        }

        .pipeline-stage:hover::before {
          opacity: 1;
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
          color: #013E37;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pipeline-stage-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }

        .pipeline-stage-count {
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
        }

        .pipeline-stage-value {
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
        }

        .pipeline-stage-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          padding: 0 10px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .pipeline-stage:hover .pipeline-stage-badge {
          transform: scale(1.1);
        }

        /* ============================================
           DROPPABLE
           ============================================ */
        .pipeline-droppable {
          min-height: 200px;
          padding: 4px;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .pipeline-droppable-drag {
          background-color: #FFEFB3 !important;
          border: 2px dashed #013E37;
        }

        /* ============================================
           LEAD CARD
           ============================================ */
        .pipeline-lead {
          background: #FFFFFF;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #FFEFB3;
          margin-bottom: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: grab;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .pipeline-lead:hover {
          border-color: #013E37;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.08);
          transform: translateY(-2px);
        }

        .pipeline-lead:active {
          cursor: grabbing;
        }

        .pipeline-lead-dragging {
          border-color: #013E37;
          box-shadow: 0 10px 25px rgba(1, 62, 55, 0.15);
          transform: rotate(2deg) scale(1.02);
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
          font-weight: 600;
          color: #013E37;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pipeline-lead-contact {
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }

        .pipeline-lead-status {
          display: inline-flex;
          align-items: center;
          padding: 2px 10px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 600;
          margin-left: 8px;
          flex-shrink: 0;
        }

        .pipeline-lead-status.active {
          background: #FFEFB3;
          color: #013E37;
        }

        .pipeline-lead-status.stale {
          background: #FFEFB3;
          color: #013E37;
        }

        .pipeline-lead-status.converted {
          background: #013E37;
          color: #FFFFFF;
        }

        .pipeline-lead-status.lost {
          background: #FFEBEE;
          color: #D32F2F;
        }

        .pipeline-lead-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #FFEFB3;
        }

        .pipeline-lead-score {
          font-size: 11px;
          color: #013E37;
          opacity: 0.6;
          font-weight: 500;
        }

        .pipeline-lead-assignee {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pipeline-lead-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 600;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 4px rgba(1, 62, 55, 0.15);
        }

        .pipeline-lead-assignee-name {
          font-size: 11px;
          color: #013E37;
          opacity: 0.6;
        }

        .pipeline-empty-state {
          text-align: center;
          padding: 32px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .pipeline-empty-state-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pipeline-empty-state p {
          font-size: 14px;
          color: #013E37;
          opacity: 0.4;
          margin: 0;
        }

        /* ============================================
           EMPTY PIPELINE
           ============================================ */
        .pipeline-empty {
          background: #ffffff;
          border: 2px dashed #FFEFB3;
          border-radius: 16px;
          padding: 60px 24px;
          text-align: center;
        }

        .pipeline-empty-content {
          max-width: 400px;
          margin: 0 auto;
        }

        .pipeline-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          animation: float 3s ease-in-out infinite;
        }

        .pipeline-empty-icon {
          width: 40px;
          height: 40px;
        }

        .pipeline-empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0 0 8px 0;
        }

        .pipeline-empty-text {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }

        /* ============================================
           UPDATING OVERLAY
           ============================================ */
        .pipeline-updating {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #FFFFFF;
          padding: 12px 24px;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          box-shadow: 0 10px 30px rgba(1, 62, 55, 0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1000;
          animation: slideInUp 0.3s ease;
        }

        .pipeline-updating-spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .pipeline-updating-text {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .pipeline-grid {
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          }
        }

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
            flex-wrap: wrap;
          }

          .pipeline-toggle {
            flex: 1;
          }

          .pipeline-toggle-btn {
            flex: 1;
            text-align: center;
            padding: 8px 12px;
            font-size: 13px;
          }

          .pipeline-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .pipeline-stage {
            min-width: unset;
          }

          .pipeline-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .pipeline-title {
            font-size: 24px;
          }

          .pipeline-stat-value {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .pipeline-container {
            padding: 12px;
          }

          .pipeline-title {
            font-size: 20px;
          }

          .pipeline-stats {
            grid-template-columns: 1fr;
          }

          .pipeline-header-right {
            flex-direction: column;
          }

          .pipeline-toggle {
            width: 100%;
          }

          .pipeline-stat-card {
            padding: 12px 16px;
          }

          .pipeline-lead {
            padding: 10px 12px;
          }

          .pipeline-updating {
            bottom: 12px;
            right: 12px;
            padding: 10px 16px;
          }

          .pipeline-updating-text {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

// Add missing DollarSign import at top
const DollarSign = ({ size }) => <svg className={`w-${size} h-${size}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default Pipeline;