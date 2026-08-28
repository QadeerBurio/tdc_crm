// pages/workflows/Workflows.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Settings, Plus, Edit, Trash2, Copy,
  Play, Pause, Eye, Search,
  ChevronDown, ChevronRight, ArrowRight,
  CheckCircle, AlertCircle, Clock, RefreshCw,
  Layers, X, Grid3x3, List, Activity, Zap,
  Users, Building2, UserPlus, Target, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

const Workflows = () => {
  const { token } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntity, setFilterEntity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expanded, setExpanded] = useState({});
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entityType: 'task',
    isActive: true,
    isDefault: false,
    stages: [],
    transitions: []
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    fetchWorkflows();
  }, [searchTerm, filterEntity, filterStatus]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterEntity !== 'all') params.append('entityType', filterEntity);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await fetch(`${API_URL}/workflows?${params.toString()}`, getHeaders());
      
      if (response.ok) {
        const result = await response.json();
        // ✅ Ensure data is always an array
        const data = result.data || [];
        setWorkflows(Array.isArray(data) ? data : []);
      } else {
        setWorkflows(getMockWorkflows());
        toast.info('Showing sample workflow data');
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      setWorkflows(getMockWorkflows());
      toast.error('Failed to load workflows, showing sample');
    } finally {
      setLoading(false);
    }
  };

  const getMockWorkflows = () => {
    return [
      {
        _id: '1',
        name: 'Task Approval Workflow',
        description: 'Automated approval process for tasks',
        entityType: 'task',
        isActive: true,
        isDefault: true,
        stages: [
          { name: 'Draft', order: 0, color: '#9ca3af' },
          { name: 'Review', order: 1, color: '#3b82f6' },
          { name: 'Approved', order: 2, color: '#22c55e' }
        ],
        transitions: [
          { fromStage: 'Draft', toStage: 'Review', label: 'Submit for Review' },
          { fromStage: 'Review', toStage: 'Approved', label: 'Approve' }
        ]
      },
      {
        _id: '2',
        name: 'Lead Management',
        description: 'Lead qualification and conversion workflow',
        entityType: 'lead',
        isActive: true,
        isDefault: false,
        stages: [
          { name: 'New Lead', order: 0, color: '#9ca3af' },
          { name: 'Contacted', order: 1, color: '#3b82f6' },
          { name: 'Qualified', order: 2, color: '#8b5cf6' },
          { name: 'Converted', order: 3, color: '#22c55e' }
        ],
        transitions: [
          { fromStage: 'New Lead', toStage: 'Contacted', label: 'Make Contact' },
          { fromStage: 'Contacted', toStage: 'Qualified', label: 'Qualify' },
          { fromStage: 'Qualified', toStage: 'Converted', label: 'Convert' }
        ]
      },
      {
        _id: '3',
        name: 'Project Lifecycle',
        description: 'Complete project management workflow',
        entityType: 'project',
        isActive: false,
        isDefault: false,
        stages: [
          { name: 'Planning', order: 0, color: '#9ca3af' },
          { name: 'In Progress', order: 1, color: '#3b82f6' },
          { name: 'Review', order: 2, color: '#f59e0b' },
          { name: 'Completed', order: 3, color: '#22c55e' }
        ],
        transitions: [
          { fromStage: 'Planning', toStage: 'In Progress', label: 'Start Project' },
          { fromStage: 'In Progress', toStage: 'Review', label: 'Submit for Review' },
          { fromStage: 'Review', toStage: 'Completed', label: 'Complete' }
        ]
      }
    ];
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await fetch(`${API_URL}/workflows/${id}`, {
        method: 'PUT',
        headers: {
          ...getHeaders().headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      toast.success(`Workflow ${currentStatus ? 'paused' : 'activated'} successfully`);
      fetchWorkflows();
    } catch (error) {
      console.error('Error toggling workflow status:', error);
      toast.error('Failed to toggle workflow status');
    }
  };

  const deleteWorkflow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await fetch(`${API_URL}/workflows/${id}`, {
        method: 'DELETE',
        ...getHeaders()
      });
      toast.success('Workflow deleted successfully');
      fetchWorkflows();
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  const duplicateWorkflow = async (id) => {
    try {
      const workflow = workflows.find(w => w._id === id);
      if (!workflow) return;
      
      const newWorkflow = {
        ...workflow,
        name: `${workflow.name} (Copy)`,
        isActive: false,
        isDefault: false
      };
      delete newWorkflow._id;
      delete newWorkflow.createdAt;
      delete newWorkflow.updatedAt;
      
      await fetch(`${API_URL}/workflows`, {
        method: 'POST',
        headers: {
          ...getHeaders().headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWorkflow)
      });
      toast.success('Workflow duplicated successfully');
      fetchWorkflows();
    } catch (error) {
      console.error('Error duplicating workflow:', error);
      toast.error('Failed to duplicate workflow');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Please enter a workflow name');
        return;
      }

      setSaving(true);
      const url = editingWorkflow 
        ? `${API_URL}/workflows/${editingWorkflow._id}`
        : `${API_URL}/workflows`;
      const method = editingWorkflow ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          ...getHeaders().headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success(editingWorkflow ? 'Workflow updated successfully' : 'Workflow created successfully');
        setShowModal(false);
        fetchWorkflows();
      } else {
        throw new Error('Failed to save workflow');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const getEntityTypeLabel = (type) => {
    const labels = {
      'task': 'Task',
      'project': 'Project',
      'lead': 'Lead',
      'client': 'Client',
      'retainer': 'Retainer',
      'partner': 'Partner',
      'goal': 'Goal',
      'opportunity': 'Opportunity',
      'deal': 'Deal'
    };
    return labels[type] || type;
  };

  const getEntityTypeColor = (type) => {
    const colors = {
      'task': 'wf-entity-task',
      'project': 'wf-entity-project',
      'lead': 'wf-entity-lead',
      'client': 'wf-entity-client',
      'retainer': 'wf-entity-retainer',
      'partner': 'wf-entity-partner',
      'goal': 'wf-entity-goal',
      'opportunity': 'wf-entity-opportunity',
      'deal': 'wf-entity-deal'
    };
    return colors[type] || 'wf-entity-default';
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'wf-status-active' : 'wf-status-inactive';
  };

  const getStageColor = (color) => {
    return color || '#6B7280';
  };

  const entityTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'task', label: 'Task' },
    { value: 'project', label: 'Project' },
    { value: 'lead', label: 'Lead' },
    { value: 'client', label: 'Client' },
    { value: 'retainer', label: 'Retainer' },
    { value: 'partner', label: 'Partner' },
    { value: 'goal', label: 'Goal' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Star icon component
  const Star = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );

  // ✅ Ensure workflows is an array before filtering
  const workflowsArray = Array.isArray(workflows) ? workflows : [];

  // ✅ Calculate stats safely
  const stats = {
    total: workflowsArray.length,
    active: workflowsArray.filter(w => w.isActive).length,
    inactive: workflowsArray.filter(w => !w.isActive).length,
    default: workflowsArray.filter(w => w.isDefault).length
  };

  if (loading) {
    return (
      <div className="wf-loading">
        <div className="wf-loading-spinner"></div>
        <p className="wf-loading-text">Loading workflows...</p>
      </div>
    );
  }

  return (
    <>
      <div className="wf-container">
        {/* Header */}
        <div className="wf-header">
          <div className="wf-header-left">
            <h1 className="wf-title">
              <Zap className="wf-title-icon" />
              Workflows
            </h1>
            <p className="wf-subtitle">Design and manage automated workflows</p>
          </div>
          <div className="wf-header-right">
            <button
              onClick={fetchWorkflows}
              className="wf-refresh-btn"
              title="Refresh"
            >
              <RefreshCw className="wf-refresh-icon" />
            </button>
            <div className="wf-view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`wf-view-btn ${viewMode === 'grid' ? 'wf-view-active' : ''}`}
              >
                <Grid3x3 className="wf-view-icon" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`wf-view-btn ${viewMode === 'list' ? 'wf-view-active' : ''}`}
              >
                <List className="wf-view-icon" />
              </button>
            </div>
            <button 
              onClick={() => {
                setEditingWorkflow(null);
                setFormData({
                  name: '',
                  description: '',
                  entityType: 'task',
                  isActive: true,
                  isDefault: false,
                  stages: [],
                  transitions: []
                });
                setShowModal(true);
              }}
              className="wf-add-btn"
            >
              <Plus className="wf-add-icon" />
              New Workflow
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="wf-stats">
          <div className="wf-stat-card">
            <div className="wf-stat-icon wf-stat-total">
              <Settings className="wf-stat-svg" />
            </div>
            <div>
              <p className="wf-stat-value">{stats.total}</p>
              <p className="wf-stat-label">Total Workflows</p>
            </div>
          </div>
          <div className="wf-stat-card">
            <div className="wf-stat-icon wf-stat-active">
              <Play className="wf-stat-svg" />
            </div>
            <div>
              <p className="wf-stat-value wf-stat-active-value">{stats.active}</p>
              <p className="wf-stat-label">Active</p>
            </div>
          </div>
          <div className="wf-stat-card">
            <div className="wf-stat-icon wf-stat-inactive">
              <Pause className="wf-stat-svg" />
            </div>
            <div>
              <p className="wf-stat-value wf-stat-inactive-value">{stats.inactive}</p>
              <p className="wf-stat-label">Inactive</p>
            </div>
          </div>
          <div className="wf-stat-card">
            <div className="wf-stat-icon wf-stat-default">
              <Star className="wf-stat-svg" />
            </div>
            <div>
              <p className="wf-stat-value wf-stat-default-value">{stats.default}</p>
              <p className="wf-stat-label">Default</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="wf-filters">
          <div className="wf-search">
            <Search className="wf-search-icon" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="wf-search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="wf-search-clear"
              >
                <X className="wf-search-clear-icon" />
              </button>
            )}
          </div>
          <div className="wf-filter-group">
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="wf-filter-select"
            >
              {entityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="wf-filter-select"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            <span className="wf-count">
              {stats.total} workflow{stats.total !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Workflow Grid/List */}
        {workflowsArray.length === 0 ? (
          <div className="wf-empty">
            <div className="wf-empty-icon-wrapper">
              <Settings className="wf-empty-icon" />
            </div>
            <h3 className="wf-empty-title">No Workflows Found</h3>
            <p className="wf-empty-subtitle">Create your first workflow to automate processes</p>
            <button 
              onClick={() => {
                setEditingWorkflow(null);
                setFormData({
                  name: '',
                  description: '',
                  entityType: 'task',
                  isActive: true,
                  isDefault: false,
                  stages: [],
                  transitions: []
                });
                setShowModal(true);
              }}
              className="wf-empty-btn"
            >
              <Plus className="wf-empty-btn-icon" />
              Create Workflow
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="wf-grid">
            {workflowsArray.map((workflow) => (
              <div key={workflow._id} className="wf-card">
                <div className="wf-card-header">
                  <div className="wf-card-icon">
                    <Settings className="wf-card-icon-svg" />
                  </div>
                  <div className="wf-card-info">
                    <h4 className="wf-card-title">{workflow.name}</h4>
                    <span className={`wf-entity-badge ${getEntityTypeColor(workflow.entityType)}`}>
                      {getEntityTypeLabel(workflow.entityType)}
                    </span>
                  </div>
                  <div className="wf-card-actions">
                    <button 
                      onClick={() => toggleStatus(workflow._id, workflow.isActive)}
                      className="wf-card-action wf-card-action-toggle"
                      title={workflow.isActive ? 'Pause' : 'Activate'}
                    >
                      {workflow.isActive ? (
                        <Pause className="wf-card-action-icon" />
                      ) : (
                        <Play className="wf-card-action-icon" />
                      )}
                    </button>
                    <button 
                      className="wf-card-action"
                      onClick={() => {
                        setSelectedWorkflow(workflow);
                        setShowDetails(true);
                      }}
                      title="View Details"
                    >
                      <Eye className="wf-card-action-icon" />
                    </button>
                    <button 
                      onClick={() => duplicateWorkflow(workflow._id)}
                      className="wf-card-action"
                      title="Duplicate"
                    >
                      <Copy className="wf-card-action-icon" />
                    </button>
                    <button 
                      onClick={() => deleteWorkflow(workflow._id)}
                      className="wf-card-action wf-card-action-delete"
                      title="Delete"
                    >
                      <Trash2 className="wf-card-action-icon" />
                    </button>
                  </div>
                </div>
                
                <p className="wf-card-desc">{workflow.description || 'No description'}</p>
                
                <div className="wf-card-badges">
                  <span className={`wf-status ${getStatusColor(workflow.isActive)}`}>
                    <span className="wf-status-dot"></span>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {workflow.isDefault && (
                    <span className="wf-default-badge">
                      Default
                    </span>
                  )}
                  {workflow.stages && (
                    <span className="wf-stage-count">
                      <Layers className="wf-stage-count-icon" />
                      {workflow.stages.length} stages
                    </span>
                  )}
                </div>

                {workflow.stages && workflow.stages.length > 0 && (
                  <div className="wf-card-stages">
                    {workflow.stages.sort((a, b) => a.order - b.order).slice(0, 3).map((stage, idx) => (
                      <div key={idx} className="wf-stage-preview">
                        <div 
                          className="wf-stage-dot"
                          style={{ backgroundColor: getStageColor(stage.color) }}
                        />
                        <span className="wf-stage-name">{stage.name}</span>
                      </div>
                    ))}
                    {workflow.stages.length > 3 && (
                      <span className="wf-stage-more">+{workflow.stages.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="wf-list">
            {workflowsArray.map((workflow) => (
              <div key={workflow._id} className="wf-list-item">
                <div 
                  className="wf-list-item-main"
                  onClick={() => toggleExpand(workflow._id)}
                >
                  <div className="wf-list-expand">
                    {expanded[workflow._id] ? (
                      <ChevronDown className="wf-list-expand-icon" />
                    ) : (
                      <ChevronRight className="wf-list-expand-icon" />
                    )}
                  </div>
                  <div className="wf-list-icon">
                    <Settings className="wf-list-icon-svg" />
                  </div>
                  <div className="wf-list-info">
                    <div className="wf-list-title-row">
                      <span className="wf-list-name">{workflow.name}</span>
                      <span className={`wf-entity-badge ${getEntityTypeColor(workflow.entityType)}`}>
                        {getEntityTypeLabel(workflow.entityType)}
                      </span>
                      <span className={`wf-status ${getStatusColor(workflow.isActive)}`}>
                        <span className="wf-status-dot"></span>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {workflow.isDefault && (
                        <span className="wf-default-badge">Default</span>
                      )}
                    </div>
                    <p className="wf-list-desc">{workflow.description || 'No description'}</p>
                    {workflow.stages && workflow.stages.length > 0 && (
                      <div className="wf-list-stages">
                        {workflow.stages.sort((a, b) => a.order - b.order).map((stage, idx) => (
                          <div key={idx} className="wf-list-stage">
                            <div 
                              className="wf-stage-dot"
                              style={{ backgroundColor: getStageColor(stage.color) }}
                            />
                            <span className="wf-stage-name">{stage.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="wf-list-actions">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(workflow._id, workflow.isActive);
                      }}
                      className="wf-list-action wf-list-action-toggle"
                      title={workflow.isActive ? 'Pause' : 'Activate'}
                    >
                      {workflow.isActive ? (
                        <Pause className="wf-list-action-icon" />
                      ) : (
                        <Play className="wf-list-action-icon" />
                      )}
                    </button>
                    <button 
                      className="wf-list-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkflow(workflow);
                        setShowDetails(true);
                      }}
                      title="View Details"
                    >
                      <Eye className="wf-list-action-icon" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateWorkflow(workflow._id);
                      }}
                      className="wf-list-action"
                      title="Duplicate"
                    >
                      <Copy className="wf-list-action-icon" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWorkflow(workflow._id);
                      }}
                      className="wf-list-action wf-list-action-delete"
                      title="Delete"
                    >
                      <Trash2 className="wf-list-action-icon" />
                    </button>
                  </div>
                </div>
                {expanded[workflow._id] && (
                  <div className="wf-list-expanded">
                    <div className="wf-list-expanded-content">
                      <div className="wf-expanded-section">
                        <h5 className="wf-expanded-title">Stages</h5>
                        <div className="wf-expanded-list">
                          {workflow.stages?.sort((a, b) => a.order - b.order).map((stage, idx) => (
                            <div key={idx} className="wf-expanded-item">
                              <div 
                                className="wf-expanded-dot"
                                style={{ backgroundColor: getStageColor(stage.color) }}
                              />
                              <span className="wf-expanded-name">{stage.name}</span>
                              <span className="wf-expanded-order">(Order: {stage.order})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="wf-expanded-section">
                        <h5 className="wf-expanded-title">Transitions</h5>
                        <div className="wf-expanded-list">
                          {workflow.transitions?.map((transition, idx) => (
                            <div key={idx} className="wf-expanded-item">
                              <span className="wf-expanded-from">{transition.fromStage}</span>
                              <ArrowRight className="wf-expanded-arrow" />
                              <span className="wf-expanded-to">{transition.toStage}</span>
                              <span className="wf-expanded-label">({transition.label})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetails && selectedWorkflow && (
        <div className="wf-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="wf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wf-modal-header">
              <div className="wf-modal-title-wrap">
                <div className="wf-modal-icon">
                  <Settings className="wf-modal-icon-svg" />
                </div>
                <div>
                  <h2 className="wf-modal-title">{selectedWorkflow.name}</h2>
                  <p className="wf-modal-subtitle">{getEntityTypeLabel(selectedWorkflow.entityType)}</p>
                </div>
              </div>
              <button onClick={() => setShowDetails(false)} className="wf-modal-close">
                <X className="wf-modal-close-icon" />
              </button>
            </div>
            
            <div className="wf-modal-body">
              {selectedWorkflow.description && (
                <div className="wf-modal-section">
                  <h4 className="wf-modal-section-title">Description</h4>
                  <p className="wf-modal-text">{selectedWorkflow.description}</p>
                </div>
              )}
              
              <div className="wf-modal-section">
                <h4 className="wf-modal-section-title">Workflow Visual</h4>
                <div className="wf-modal-visual">
                  {selectedWorkflow.stages?.sort((a, b) => a.order - b.order).map((stage, idx) => (
                    <div key={idx} className="wf-modal-stage-wrap">
                      <div 
                        className="wf-modal-stage"
                        style={{ backgroundColor: getStageColor(stage.color) }}
                      >
                        {stage.name}
                      </div>
                      {idx < selectedWorkflow.stages.length - 1 && (
                        <ArrowRight className="wf-modal-arrow" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="wf-modal-grid">
                <div className="wf-modal-section">
                  <h4 className="wf-modal-section-title">Stages</h4>
                  <div className="wf-modal-stages">
                    {selectedWorkflow.stages?.sort((a, b) => a.order - b.order).map((stage, idx) => (
                      <div key={idx} className="wf-modal-stage-item">
                        <div 
                          className="wf-modal-stage-dot"
                          style={{ backgroundColor: getStageColor(stage.color) }}
                        />
                        <span className="wf-modal-stage-name">{stage.name}</span>
                        <span className="wf-modal-stage-order">(Order: {stage.order})</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="wf-modal-section">
                  <h4 className="wf-modal-section-title">Transitions</h4>
                  <div className="wf-modal-transitions">
                    {selectedWorkflow.transitions?.map((transition, idx) => (
                      <div key={idx} className="wf-modal-transition-item">
                        <span className="wf-modal-from">{transition.fromStage}</span>
                        <ArrowRight className="wf-modal-transition-arrow" />
                        <span className="wf-modal-to">{transition.toStage}</span>
                        <span className="wf-modal-transition-label">({transition.label})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="wf-modal-footer">
              <button
                onClick={() => setShowDetails(false)}
                className="wf-modal-cancel"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowDetails(false);
                  setEditingWorkflow(selectedWorkflow);
                  setFormData({
                    name: selectedWorkflow.name,
                    description: selectedWorkflow.description || '',
                    entityType: selectedWorkflow.entityType || 'task',
                    isActive: selectedWorkflow.isActive !== undefined ? selectedWorkflow.isActive : true,
                    isDefault: selectedWorkflow.isDefault || false,
                    stages: selectedWorkflow.stages || [],
                    transitions: selectedWorkflow.transitions || []
                  });
                  setShowModal(true);
                }}
                className="wf-modal-submit"
              >
                <Edit className="wf-modal-submit-icon" />
                Edit Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="wf-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="wf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wf-modal-header">
              <h2 className="wf-modal-title">
                {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
              </h2>
              <button onClick={() => setShowModal(false)} className="wf-modal-close">
                <X className="wf-modal-close-icon" />
              </button>
            </div>
            
            <div className="wf-modal-body">
              <div className="wf-form-group">
                <label className="wf-form-label">Workflow Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="wf-form-input" 
                  placeholder="Enter workflow name"
                  autoFocus
                />
              </div>

              <div className="wf-form-group">
                <label className="wf-form-label">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="wf-form-textarea" 
                  rows="3" 
                  placeholder="Brief description of this workflow"
                />
              </div>

              <div className="wf-form-row">
                <div className="wf-form-group">
                  <label className="wf-form-label">Entity Type</label>
                  <select 
                    value={formData.entityType}
                    onChange={(e) => setFormData(prev => ({ ...prev, entityType: e.target.value }))}
                    className="wf-form-select"
                  >
                    <option value="task">Task</option>
                    <option value="project">Project</option>
                    <option value="lead">Lead</option>
                    <option value="client">Client</option>
                    <option value="retainer">Retainer</option>
                    <option value="partner">Partner</option>
                    <option value="goal">Goal</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="deal">Deal</option>
                  </select>
                </div>
                <div className="wf-form-group">
                  <label className="wf-form-label">Status</label>
                  <select 
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                    className="wf-form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="wf-form-group">
                <label className="wf-form-label">Default Workflow</label>
                <div className="wf-form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="wf-form-checkbox-input"
                  />
                  <span className="wf-form-checkbox-label">Set as default workflow</span>
                </div>
              </div>
            </div>
            
            <div className="wf-modal-footer">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="wf-modal-cancel"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !formData.name.trim()}
                className="wf-modal-submit"
              >
                {saving ? (
                  <>
                    <div className="wf-modal-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="wf-modal-submit-icon" />
                    {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .wf-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           HEADER
           ============================================ */
        .wf-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .wf-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wf-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .wf-title-icon {
          width: 28px;
          height: 28px;
          color: #eab308;
        }

        .wf-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .wf-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .wf-refresh-btn {
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

        .wf-refresh-btn:hover {
          background: #f9fafb;
        }

        .wf-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .wf-view-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 4px;
        }

        .wf-view-btn {
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          display: flex;
          align-items: center;
        }

        .wf-view-btn:hover {
          color: #374151;
        }

        .wf-view-active {
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          color: #111827;
        }

        .wf-view-icon {
          width: 16px;
          height: 16px;
        }

        .wf-add-btn {
          padding: 8px 16px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);
        }

        .wf-add-btn:hover {
          background: #2563eb;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
          transform: translateY(-1px);
        }

        .wf-add-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           STATS
           ============================================ */
        .wf-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .wf-stat-card {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }

        .wf-stat-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }

        .wf-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wf-stat-total { background: #eff6ff; }
        .wf-stat-active { background: #dcfce7; }
        .wf-stat-inactive { background: #f3f4f6; }
        .wf-stat-default { background: #fef3c7; }

        .wf-stat-svg {
          width: 20px;
          height: 20px;
        }

        .wf-stat-total .wf-stat-svg { color: #3b82f6; }
        .wf-stat-active .wf-stat-svg { color: #22c55e; }
        .wf-stat-inactive .wf-stat-svg { color: #6b7280; }
        .wf-stat-default .wf-stat-svg { color: #eab308; }

        .wf-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0;
          line-height: 1.2;
        }

        .wf-stat-active-value { color: #22c55e; }
        .wf-stat-inactive-value { color: #6b7280; }
        .wf-stat-default-value { color: #eab308; }

        .wf-stat-label {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .wf-filters {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .wf-search {
          flex: 1;
          min-width: 200px;
          position: relative;
        }

        .wf-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        .wf-search-input {
          width: 100%;
          padding: 8px 40px 8px 36px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
        }

        .wf-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .wf-search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #9ca3af;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
        }

        .wf-search-clear:hover {
          color: #6b7280;
        }

        .wf-search-clear-icon {
          width: 16px;
          height: 16px;
        }

        .wf-filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .wf-filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          min-width: 140px;
        }

        .wf-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .wf-count {
          font-size: 14px;
          color: #6b7280;
          white-space: nowrap;
        }

        /* ============================================
           GRID VIEW
           ============================================ */
        .wf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .wf-card {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .wf-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
          border-color: #e5e7eb;
        }

        .wf-card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .wf-card-icon {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wf-card-icon-svg {
          width: 20px;
          height: 20px;
          color: #3b82f6;
        }

        .wf-card-info {
          flex: 1;
          min-width: 0;
        }

        .wf-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .wf-card-actions {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }

        .wf-card-action {
          padding: 4px 6px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }

        .wf-card-action:hover {
          background: #f3f4f6;
          color: #4b5563;
        }

        .wf-card-action-toggle:hover {
          background: #eff6ff;
          color: #3b82f6;
        }

        .wf-card-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .wf-card-action-icon {
          width: 15px;
          height: 15px;
        }

        .wf-card-desc {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .wf-card-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .wf-entity-badge {
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .wf-entity-task { background: #dbeafe; color: #1d4ed8; }
        .wf-entity-project { background: #f3e8ff; color: #7c3aed; }
        .wf-entity-lead { background: #dcfce7; color: #16a34a; }
        .wf-entity-client { background: #fef3c7; color: #d97706; }
        .wf-entity-retainer { background: #ffedd5; color: #ea580c; }
        .wf-entity-partner { background: #fce7f3; color: #db2777; }
        .wf-entity-goal { background: #e0e7ff; color: #4f46e5; }
        .wf-entity-opportunity { background: #cffafe; color: #0891b2; }
        .wf-entity-deal { background: #fee2e2; color: #dc2626; }
        .wf-entity-default { background: #f3f4f6; color: #6b7280; }

        .wf-status {
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .wf-status-active {
          background: #dcfce7;
          color: #16a34a;
        }

        .wf-status-inactive {
          background: #f3f4f6;
          color: #6b7280;
        }

        .wf-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
        }

        .wf-status-active .wf-status-dot {
          background: #22c55e;
        }

        .wf-status-inactive .wf-status-dot {
          background: #9ca3af;
        }

        .wf-default-badge {
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 500;
          background: #fef3c7;
          color: #d97706;
          border-radius: 9999px;
        }

        .wf-stage-count {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 500;
          background: #f3f4f6;
          color: #6b7280;
          border-radius: 9999px;
        }

        .wf-stage-count-icon {
          width: 12px;
          height: 12px;
        }

        .wf-card-stages {
          display: flex;
          align-items: center;
          gap: 6px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
          flex-wrap: wrap;
        }

        .wf-stage-preview {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .wf-stage-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .wf-stage-name {
          font-size: 12px;
          color: #6b7280;
        }

        .wf-stage-more {
          font-size: 12px;
          color: #9ca3af;
          font-weight: 500;
        }

        /* ============================================
           LIST VIEW
           ============================================ */
        .wf-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .wf-list-item {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .wf-list-item:hover {
          border-color: #e5e7eb;
        }

        .wf-list-item-main {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wf-list-item-main:hover {
          background: #f9fafb;
        }

        .wf-list-expand {
          flex-shrink: 0;
          color: #9ca3af;
        }

        .wf-list-expand-icon {
          width: 16px;
          height: 16px;
        }

        .wf-list-icon {
          width: 36px;
          height: 36px;
          background: #eff6ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wf-list-icon-svg {
          width: 18px;
          height: 18px;
          color: #3b82f6;
        }

        .wf-list-info {
          flex: 1;
          min-width: 0;
        }

        .wf-list-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .wf-list-name {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
        }

        .wf-list-desc {
          font-size: 13px;
          color: #6b7280;
          margin: 2px 0 0 0;
        }

        .wf-list-stages {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .wf-list-stage {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .wf-list-actions {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }

        .wf-list-action {
          padding: 4px 6px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }

        .wf-list-action:hover {
          background: #f3f4f6;
          color: #4b5563;
        }

        .wf-list-action-toggle:hover {
          background: #eff6ff;
          color: #3b82f6;
        }

        .wf-list-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .wf-list-action-icon {
          width: 15px;
          height: 15px;
        }

        .wf-list-expanded {
          padding: 0 18px 18px 18px;
        }

        .wf-list-expanded-content {
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #f3f4f6;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .wf-list-expanded-content {
            grid-template-columns: 1fr;
          }
        }

        .wf-expanded-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .wf-expanded-title {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .wf-expanded-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wf-expanded-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #374151;
        }

        .wf-expanded-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .wf-expanded-name {
          font-weight: 500;
        }

        .wf-expanded-order {
          font-size: 12px;
          color: #9ca3af;
        }

        .wf-expanded-from,
        .wf-expanded-to {
          font-weight: 500;
        }

        .wf-expanded-arrow {
          width: 14px;
          height: 14px;
          color: #9ca3af;
        }

        .wf-expanded-label {
          font-size: 12px;
          color: #9ca3af;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .wf-empty {
          background: #ffffff;
          border: 2px dashed #e5e7eb;
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
        }

        .wf-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #eff6ff;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .wf-empty-icon {
          width: 40px;
          height: 40px;
          color: #93c5fd;
        }

        .wf-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .wf-empty-subtitle {
          color: #6b7280;
          margin-top: 4px;
        }

        .wf-empty-btn {
          margin-top: 16px;
          padding: 10px 24px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .wf-empty-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .wf-empty-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           LOADING
           ============================================ */
        .wf-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .wf-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .wf-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           MODAL
           ============================================ */
        .wf-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 16px;
        }

        .wf-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 640px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: modalIn 0.3s ease;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .wf-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
          position: sticky;
          top: 0;
          background: #ffffff;
          z-index: 1;
        }

        .wf-modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wf-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .wf-modal-subtitle {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }

        .wf-modal-icon {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wf-modal-icon-svg {
          width: 20px;
          height: 20px;
          color: #3b82f6;
        }

        .wf-modal-close {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          display: flex;
          align-items: center;
        }

        .wf-modal-close:hover {
          background: #f3f4f6;
        }

        .wf-modal-close-icon {
          width: 20px;
          height: 20px;
        }

        .wf-modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .wf-modal-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .wf-modal-section-title {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin: 0;
        }

        .wf-modal-text {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .wf-modal-visual {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          padding: 16px;
          background: #f9fafb;
          border-radius: 10px;
          border: 1px solid #f3f4f6;
        }

        .wf-modal-stage-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wf-modal-stage {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .wf-modal-arrow {
          width: 18px;
          height: 18px;
          color: #9ca3af;
        }

        .wf-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .wf-modal-grid {
            grid-template-columns: 1fr;
          }
        }

        .wf-modal-stages,
        .wf-modal-transitions {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .wf-modal-stage-item,
        .wf-modal-transition-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f9fafb;
          border-radius: 8px;
          font-size: 13px;
        }

        .wf-modal-stage-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .wf-modal-stage-name {
          font-weight: 500;
          color: #111827;
        }

        .wf-modal-stage-order {
          font-size: 12px;
          color: #9ca3af;
        }

        .wf-modal-from,
        .wf-modal-to {
          font-weight: 500;
          color: #111827;
        }

        .wf-modal-transition-arrow {
          width: 14px;
          height: 14px;
          color: #9ca3af;
        }

        .wf-modal-transition-label {
          font-size: 12px;
          color: #9ca3af;
        }

        .wf-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #f3f4f6;
          position: sticky;
          bottom: 0;
          background: #ffffff;
        }

        .wf-modal-cancel {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: transparent;
          color: #4b5563;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wf-modal-cancel:hover:not(:disabled) {
          background: #f9fafb;
        }

        .wf-modal-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .wf-modal-submit {
          padding: 8px 16px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .wf-modal-submit:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .wf-modal-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .wf-modal-submit-icon {
          width: 16px;
          height: 16px;
        }

        .wf-modal-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* ============================================
           FORM
           ============================================ */
        .wf-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wf-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .wf-form-input,
        .wf-form-select,
        .wf-form-textarea {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
        }

        .wf-form-input:focus,
        .wf-form-select:focus,
        .wf-form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .wf-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .wf-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 480px) {
          .wf-form-row {
            grid-template-columns: 1fr;
          }
        }

        .wf-form-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
        }

        .wf-form-checkbox-input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .wf-form-checkbox-label {
          font-size: 14px;
          color: #374151;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .wf-grid {
            grid-template-columns: 1fr;
          }

          .wf-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .wf-header-right {
            width: 100%;
          }

          .wf-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .wf-filter-group {
            flex-wrap: wrap;
          }

          .wf-modal {
            max-width: 100%;
            margin: 16px;
          }

          .wf-list-item-main {
            flex-wrap: wrap;
          }

          .wf-list-actions {
            margin-left: auto;
          }

          .wf-stats {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .wf-stats {
            grid-template-columns: 1fr;
          }

          .wf-list-item-main {
            flex-direction: column;
            align-items: flex-start;
          }

          .wf-list-actions {
            margin-left: 0;
            width: 100%;
            justify-content: flex-end;
            border-top: 1px solid #f3f4f6;
            padding-top: 8px;
          }
        }
      `}</style>
    </>
  );
};

export default Workflows;