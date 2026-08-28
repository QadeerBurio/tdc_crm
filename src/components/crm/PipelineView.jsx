// components/crm/PipelineView.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { MoreVertical, ArrowUp, ArrowDown } from 'lucide-react';
import Card from '../common/Card';

const PipelineView = ({ pipeline, onDragEnd, onStageClick }) => {
  const { user } = useAuth();
  const [expandedStages, setExpandedStages] = useState({});

  const toggleStage = (stage) => {
    setExpandedStages(prev => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusStyle = (status) => {
    const styles = {
      'active': { backgroundColor: '#d1fae5', color: '#065f46' },
      'stale': { backgroundColor: '#fef3c7', color: '#92400e' },
      'converted': { backgroundColor: '#dbeafe', color: '#1e40af' },
      'lost': { backgroundColor: '#fee2e2', color: '#991b1b' }
    };
    return styles[status] || styles.active;
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={styles.container}>
        {pipeline.map((stage) => (
          <div key={stage.stage} style={styles.column}>
            <div 
              style={styles.stageContainer}
              onClick={() => onStageClick?.(stage.stage)}
            >
              <div style={styles.stageHeader}>
                <div>
                  <h3 style={styles.stageTitle}>
                    {stage.stage ? stage.stage.replace(/_/g, ' ') : 'N/A'}
                  </h3>
                  <div style={styles.stageStats}>
                    <span style={styles.stageCount}>
                      {stage.count || 0} leads
                    </span>
                    {stage.totalValue > 0 && (
                      <span style={styles.stageValue}>
                        • {formatCurrency(stage.totalValue)}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  style={styles.toggleButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStage(stage.stage);
                  }}
                >
                  {expandedStages[stage.stage] ? (
                    <ArrowUp style={styles.toggleIcon} />
                  ) : (
                    <ArrowDown style={styles.toggleIcon} />
                  )}
                </button>
              </div>

              {expandedStages[stage.stage] !== false && (
                <Droppable droppableId={stage.stage}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        ...styles.droppableArea,
                        backgroundColor: snapshot.isDraggingOver ? '#f3f4f6' : 'transparent',
                      }}
                    >
                      {stage.leads && stage.leads.map((lead, index) => (
                        <Draggable
                          key={lead._id}
                          draggableId={lead._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...styles.leadCard,
                                ...provided.draggableProps.style,
                                borderColor: snapshot.isDragging ? '#3B82F6' : '#E5E7EB',
                                boxShadow: snapshot.isDragging 
                                  ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
                                  : '0 1px 3px rgba(0, 0, 0, 0.1)',
                              }}
                            >
                              <div style={styles.leadContent}>
                                <div style={styles.leadInfo}>
                                  <p style={styles.leadCompany}>
                                    {lead.companyName || 'N/A'}
                                  </p>
                                  <p style={styles.leadContact}>
                                    {lead.contactName || 'N/A'}
                                  </p>
                                </div>
                                <button style={styles.moreButton}>
                                  <MoreVertical style={styles.moreIcon} />
                                </button>
                              </div>
                              <div style={styles.leadFooter}>
                                <span style={{
                                  ...styles.statusBadge,
                                  ...getStatusStyle(lead.status)
                                }}>
                                  {lead.status ? lead.status.charAt(0).toUpperCase() + lead.status.slice(1) : 'N/A'}
                                </span>
                                {lead.leadScore && (
                                  <span style={styles.scoreText}>
                                    Score: {lead.leadScore}
                                  </span>
                                )}
                              </div>
                              {lead.assignedTo && (
                                <div style={styles.assigneeContainer}>
                                  <div style={styles.assigneeAvatar}>
                                    {lead.assignedTo.firstName?.[0] || '?'}
                                  </div>
                                  <span style={styles.assigneeName}>
                                    {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {(!stage.leads || stage.leads.length === 0) && (
                        <p style={styles.emptyState}>No leads in this stage</p>
                      )}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    overflowX: 'auto',
  },
  column: {
    minWidth: '280px',
  },
  stageContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
  },
  stageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  stageTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
    textTransform: 'capitalize',
  },
  stageStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  },
  stageCount: {
    fontSize: '14px',
    color: '#6B7280',
  },
  stageValue: {
    fontSize: '14px',
    color: '#6B7280',
  },
  toggleButton: {
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleIcon: {
    width: '16px',
    height: '16px',
    color: '#9CA3AF',
  },
  droppableArea: {
    minHeight: '100px',
    padding: '4px',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease',
  },
  leadCard: {
    backgroundColor: '#FFFFFF',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    cursor: 'grab',
  },
  leadContent: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  leadInfo: {
    flex: 1,
    minWidth: 0,
  },
  leadCompany: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  leadContact: {
    fontSize: '12px',
    color: '#6B7280',
    margin: 0,
  },
  moreButton: {
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreIcon: {
    width: '16px',
    height: '16px',
    color: '#9CA3AF',
  },
  leadFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '500',
  },
  scoreText: {
    fontSize: '11px',
    color: '#6B7280',
  },
  assigneeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
  },
  assigneeAvatar: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '500',
  },
  assigneeName: {
    fontSize: '12px',
    color: '#6B7280',
  },
  emptyState: {
    textAlign: 'center',
    padding: '16px 0',
    fontSize: '14px',
    color: '#9CA3AF',
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .toggle-button:hover {
    background-color: #F3F4F6 !important;
  }
  
  .more-button:hover {
    background-color: #F3F4F6 !important;
  }
  
  .lead-card:hover {
    border-color: #9CA3AF !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  }
  
  .lead-card:active {
    cursor: grabbing !important;
  }
  
  .stage-container:hover {
    background-color: #F3F4F6 !important;
  }
  
  @media (max-width: 1200px) {
    .container {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
  
  @media (max-width: 1024px) {
    .container {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  
  @media (max-width: 768px) {
    .container {
      grid-template-columns: 1fr !important;
    }
    
    .stage-container {
      padding: 12px !important;
    }
    
    .stage-title {
      font-size: 14px !important;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      grid-template-columns: 1fr !important;
    }
    
    .lead-card {
      padding: 10px 12px !important;
    }
    
    .stage-stats {
      flex-wrap: wrap !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default PipelineView;