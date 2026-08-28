// pages/workflows/WorkflowBuilder.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Settings, Save, X, Plus, Edit, Trash2,
  ArrowRight, ArrowLeft, Copy, Eye,
  GripVertical, Check, AlertCircle,
  RefreshCw, Layers, Target, Users,
  Building2, Briefcase, FileText,
  Zap, Clock, Calendar, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const WorkflowBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    entityType: 'task',
    applicableSegments: [],
    applicableDepartments: [],
    applicableTeams: [],
    isDefault: false,
    isActive: true,
    stages: [
      { id: 'stage-1', name: 'Start', order: 0, color: '#10B981', description: 'Beginning of workflow' },
      { id: 'stage-2', name: 'In Progress', order: 1, color: '#3B82F6', description: 'Work in progress' },
      { id: 'stage-3', name: 'Review', order: 2, color: '#F59E0B', description: 'Under review' },
      { id: 'stage-4', name: 'Complete', order: 3, color: '#10B981', description: 'Workflow completed' }
    ],
    transitions: [
      { fromStage: 'stage-1', toStage: 'stage-2', label: 'Start Work', condition: '' },
      { fromStage: 'stage-2', toStage: 'stage-3', label: 'Submit for Review', condition: '' },
      { fromStage: 'stage-3', toStage: 'stage-4', label: 'Approve', condition: '' },
      { fromStage: 'stage-3', toStage: 'stage-2', label: 'Request Changes', condition: '' }
    ]
  });

  const [segments, setSegments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stageIdCounter, setStageIdCounter] = useState(5);
  const [editingStage, setEditingStage] = useState(null);
  const [editingTransition, setEditingTransition] = useState(null);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    fetchOptions();
    if (id) {
      fetchWorkflow();
    }
  }, [id]);

  const fetchOptions = async () => {
    try {
      // Try to fetch from API, but use mock data if fails
      const [segRes, deptRes, teamRes] = await Promise.all([
        fetch(`${API_URL}/organization/segments`, getHeaders()).catch(() => null),
        fetch(`${API_URL}/organization/departments`, getHeaders()).catch(() => null),
        fetch(`${API_URL}/organization/teams`, getHeaders()).catch(() => null)
      ]);
      
      let segData = [];
      let deptData = [];
      let teamData = [];
      
      if (segRes && segRes.ok) {
        const result = await segRes.json();
        segData = result.data || [];
      } else {
        segData = getMockSegments();
      }
      
      if (deptRes && deptRes.ok) {
        const result = await deptRes.json();
        deptData = result.data || [];
      } else {
        deptData = getMockDepartments();
      }
      
      if (teamRes && teamRes.ok) {
        const result = await teamRes.json();
        teamData = result.data || [];
      } else {
        teamData = getMockTeams();
      }
      
      setSegments(segData);
      setDepartments(deptData);
      setTeams(teamData);
    } catch (error) {
      console.error('Error fetching options:', error);
      setSegments(getMockSegments());
      setDepartments(getMockDepartments());
      setTeams(getMockTeams());
    }
  };

  const getMockSegments = () => [
    { _id: 'seg_1', name: 'Enterprise' },
    { _id: 'seg_2', name: 'SMB' },
    { _id: 'seg_3', name: 'Startup' }
  ];

  const getMockDepartments = () => [
    { _id: 'dept_1', name: 'Sales' },
    { _id: 'dept_2', name: 'Marketing' },
    { _id: 'dept_3', name: 'Engineering' },
    { _id: 'dept_4', name: 'HR' }
  ];

  const getMockTeams = () => [
    { _id: 'team_1', name: 'Team Alpha' },
    { _id: 'team_2', name: 'Team Beta' },
    { _id: 'team_3', name: 'Team Gamma' }
  ];

  const fetchWorkflow = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/workflows/${id}`, getHeaders());
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data;
        // Ensure stages have ids
        const stages = (data.stages || []).map((s, i) => ({
          ...s,
          id: s.id || `stage-${i + 1}`
        }));
        setFormData({
          ...data,
          stages
        });
        setStageIdCounter((stages.length || 0) + 1);
      } else {
        // Use mock data if API fails
        toast.info('Showing sample workflow data');
      }
    } catch (error) {
      console.error('Error fetching workflow:', error);
      toast.error('Failed to load workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }
    
    if (formData.stages.length < 2) {
      toast.error('Workflow must have at least 2 stages');
      return;
    }

    // Validate stages have names
    const emptyStage = formData.stages.find(s => !s.name.trim());
    if (emptyStage) {
      toast.error('All stages must have a name');
      return;
    }

    setSaving(true);
    try {
      // Prepare data for API
      const data = {
        name: formData.name.trim(),
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description || '',
        entityType: formData.entityType,
        applicableSegments: formData.applicableSegments || [],
        applicableDepartments: formData.applicableDepartments || [],
        applicableTeams: formData.applicableTeams || [],
        isDefault: formData.isDefault || false,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        stages: formData.stages.map((s, i) => ({
          name: s.name.trim(),
          order: i,
          color: s.color || '#6B7280',
          description: s.description || ''
        })),
        transitions: formData.transitions.map(t => ({
          fromStage: t.fromStage,
          toStage: t.toStage,
          label: t.label || 'Transition',
          condition: t.condition || ''
        }))
      };
      
      const url = id ? `${API_URL}/workflows/${id}` : `${API_URL}/workflows`;
      const method = id ? 'PUT' : 'POST';
      
      console.log('Sending data:', data);
      
      const response = await fetch(url, {
        method: method,
        headers: {
          ...getHeaders().headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      // Try to parse error response
      let result;
      try {
        result = await response.json();
      } catch (e) {
        result = { success: false, message: 'Invalid response from server' };
      }
      
      if (response.ok && result.success !== false) {
        toast.success(id ? 'Workflow updated successfully' : 'Workflow created successfully');
        navigate('/workflows');
      } else {
        // Show detailed error
        const errorMsg = result.message || result.error || 'Failed to save workflow';
        if (result.errors) {
          const errorDetails = Object.values(result.errors).map(e => e.message).join(', ');
          toast.error(`${errorMsg}: ${errorDetails}`);
        } else {
          toast.error(errorMsg);
        }
        setError(result);
        console.error('Save error:', result);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error(error.message || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const addStage = () => {
    const newStage = {
      id: `stage-${stageIdCounter}`,
      name: `Stage ${stageIdCounter}`,
      order: formData.stages.length,
      color: '#6B7280',
      description: 'New stage'
    };
    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, newStage]
    }));
    setStageIdCounter(stageIdCounter + 1);
  };

  const updateStage = (id, updates) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const deleteStage = (id) => {
    if (formData.stages.length <= 2) {
      toast.error('Workflow must have at least 2 stages');
      return;
    }
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.filter(s => s.id !== id),
      transitions: prev.transitions.filter(t => t.fromStage !== id && t.toStage !== id)
    }));
  };

  const addTransition = () => {
    if (formData.stages.length < 2) {
      toast.error('Need at least 2 stages to create a transition');
      return;
    }
    const newTransition = {
      fromStage: formData.stages[0].id,
      toStage: formData.stages[1].id,
      label: 'Transition',
      condition: ''
    };
    setFormData(prev => ({
      ...prev,
      transitions: [...prev.transitions, newTransition]
    }));
  };

  const updateTransition = (index, updates) => {
    setFormData(prev => ({
      ...prev,
      transitions: prev.transitions.map((t, i) => i === index ? { ...t, ...updates } : t)
    }));
  };

  const deleteTransition = (index) => {
    setFormData(prev => ({
      ...prev,
      transitions: prev.transitions.filter((_, i) => i !== index)
    }));
  };

  const getStageColor = (color) => {
    return color || '#6B7280';
  };

  const getStageName = (id) => {
    const stage = formData.stages.find(s => s.id === id);
    return stage?.name || 'Unknown';
  };

  const entityTypes = [
    { value: 'task', label: 'Task', icon: FileText, color: '#3B82F6' },
    { value: 'project', label: 'Project', icon: Briefcase, color: '#8B5CF6' },
    { value: 'lead', label: 'Lead', icon: Target, color: '#22C55E' },
    { value: 'client', label: 'Client', icon: Users, color: '#F59E0B' },
    { value: 'retainer', label: 'Retainer', icon: Layers, color: '#F97316' },
    { value: 'partner', label: 'Partner', icon: Building2, color: '#EC4899' },
    { value: 'goal', label: 'Goal', icon: Target, color: '#6366F1' }
  ];

  const getEntityIcon = (type) => {
    const entity = entityTypes.find(e => e.value === type);
    const Icon = entity?.icon || FileText;
    return Icon;
  };

  if (loading) {
    return (
      <div className="wb-loading">
        <div className="wb-loading-spinner"></div>
        <p className="wb-loading-text">Loading workflow...</p>
      </div>
    );
  }

  return (
    <>
      <div className="wb-container">
        {/* Header */}
        <div className="wb-header">
          <div className="wb-header-left">
            <h1 className="wb-title">
              <Zap className="wb-title-icon" />
              {id ? 'Edit Workflow' : 'Create New Workflow'}
            </h1>
            <p className="wb-subtitle">Design and configure your workflow</p>
          </div>
          <div className="wb-header-right">
            <button
              onClick={() => navigate('/workflows')}
              className="wb-cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="wb-save-btn"
            >
              {saving ? (
                <>
                  <div className="wb-save-spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="wb-save-icon" />
                  Save Workflow
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="wb-error">
            <AlertCircle className="wb-error-icon" />
            <div>
              <h4 className="wb-error-title">Save Failed</h4>
              <p className="wb-error-message">{error.message || 'Please check your input and try again'}</p>
            </div>
            <button onClick={() => setError(null)} className="wb-error-close">
              <X className="wb-error-close-icon" />
            </button>
          </div>
        )}

        {/* Basic Info */}
        <div className="wb-section">
          <div className="wb-grid-2">
            <div className="wb-form-group">
              <label className="wb-form-label">Workflow Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="wb-form-input"
                placeholder="e.g., Task Approval Workflow"
              />
            </div>
            <div className="wb-form-group">
              <label className="wb-form-label">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="wb-form-input"
                placeholder="task-approval-workflow"
              />
            </div>
          </div>
          <div className="wb-form-group">
            <label className="wb-form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="wb-form-textarea"
              rows="2"
              placeholder="Brief description of this workflow"
            />
          </div>
          <div className="wb-grid-2">
            <div className="wb-form-group">
              <label className="wb-form-label">Entity Type *</label>
              <select
                value={formData.entityType}
                onChange={(e) => setFormData(prev => ({ ...prev, entityType: e.target.value }))}
                className="wb-form-select"
              >
                {entityTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="wb-checkbox-group">
              <label className="wb-checkbox">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="wb-checkbox-input"
                />
                Set as Default
              </label>
              <label className="wb-checkbox">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="wb-checkbox-input"
                />
                Active
              </label>
            </div>
          </div>
        </div>

        {/* Applicable To */}
        <div className="wb-section">
          <h3 className="wb-section-title">Applicable To</h3>
          <p className="wb-section-subtitle">Select which segments, departments, and teams this workflow applies to</p>
          <div className="wb-grid-3">
            <div className="wb-form-group">
              <label className="wb-form-label">Segments</label>
              <select
                multiple
                value={formData.applicableSegments}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({ ...prev, applicableSegments: values }));
                }}
                className="wb-form-select-multiple"
              >
                {segments.map(seg => (
                  <option key={seg._id} value={seg._id}>{seg.name}</option>
                ))}
              </select>
              <p className="wb-form-hint">Hold Ctrl/Cmd to select multiple</p>
            </div>
            <div className="wb-form-group">
              <label className="wb-form-label">Departments</label>
              <select
                multiple
                value={formData.applicableDepartments}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({ ...prev, applicableDepartments: values }));
                }}
                className="wb-form-select-multiple"
              >
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="wb-form-group">
              <label className="wb-form-label">Teams</label>
              <select
                multiple
                value={formData.applicableTeams}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({ ...prev, applicableTeams: values }));
                }}
                className="wb-form-select-multiple"
              >
                {teams.map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stages */}
        <div className="wb-section">
          <div className="wb-section-header">
            <div>
              <h3 className="wb-section-title">Stages</h3>
              <p className="wb-section-subtitle">Define the stages in your workflow</p>
            </div>
            <button
              onClick={addStage}
              className="wb-add-btn"
            >
              <Plus className="wb-add-icon" />
              Add Stage
            </button>
          </div>
          <div className="wb-stages">
            {formData.stages.sort((a, b) => a.order - b.order).map((stage) => (
              <div key={stage.id} className="wb-stage-item">
                <div 
                  className="wb-stage-dot"
                  style={{ backgroundColor: getStageColor(stage.color) }}
                />
                <div className="wb-stage-info">
                  <span className="wb-stage-name">{stage.name}</span>
                  <span className="wb-stage-order">(Order: {stage.order})</span>
                  {stage.description && (
                    <p className="wb-stage-desc">{stage.description}</p>
                  )}
                </div>
                <div className="wb-stage-actions">
                  <button
                    onClick={() => {
                      setEditingStage(stage);
                      setShowStageModal(true);
                    }}
                    className="wb-stage-action"
                  >
                    <Edit className="wb-stage-action-icon" />
                  </button>
                  <button
                    onClick={() => deleteStage(stage.id)}
                    className="wb-stage-action wb-stage-action-delete"
                  >
                    <Trash2 className="wb-stage-action-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transitions */}
        <div className="wb-section">
          <div className="wb-section-header">
            <div>
              <h3 className="wb-section-title">Transitions</h3>
              <p className="wb-section-subtitle">Define how stages connect to each other</p>
            </div>
            <button
              onClick={addTransition}
              className="wb-add-btn"
            >
              <Plus className="wb-add-icon" />
              Add Transition
            </button>
          </div>
          <div className="wb-transitions">
            {formData.transitions.map((transition, index) => (
              <div key={index} className="wb-transition-item">
                <div className="wb-transition-info">
                  <span className="wb-transition-from">{getStageName(transition.fromStage)}</span>
                  <ArrowRight className="wb-transition-arrow" />
                  <span className="wb-transition-to">{getStageName(transition.toStage)}</span>
                  <span className="wb-transition-label">({transition.label || 'Transition'})</span>
                  {transition.condition && (
                    <span className="wb-transition-condition">Condition: {transition.condition}</span>
                  )}
                </div>
                <div className="wb-transition-actions">
                  <button
                    onClick={() => {
                      setEditingTransition({ index, ...transition });
                      setShowTransitionModal(true);
                    }}
                    className="wb-transition-action"
                  >
                    <Edit className="wb-transition-action-icon" />
                  </button>
                  <button
                    onClick={() => deleteTransition(index)}
                    className="wb-transition-action wb-transition-action-delete"
                  >
                    <Trash2 className="wb-transition-action-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stage Edit Modal - same as before */}
      {showStageModal && editingStage && (
        <div className="wb-modal-overlay" onClick={() => setShowStageModal(false)}>
          <div className="wb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wb-modal-header">
              <h3 className="wb-modal-title">Edit Stage</h3>
              <button onClick={() => setShowStageModal(false)} className="wb-modal-close">
                <X className="wb-modal-close-icon" />
              </button>
            </div>
            <div className="wb-modal-body">
              <div className="wb-form-group">
                <label className="wb-form-label">Stage Name</label>
                <input
                  type="text"
                  value={editingStage.name}
                  onChange={(e) => setEditingStage(prev => ({ ...prev, name: e.target.value }))}
                  className="wb-form-input"
                />
              </div>
              <div className="wb-form-group">
                <label className="wb-form-label">Description</label>
                <textarea
                  value={editingStage.description}
                  onChange={(e) => setEditingStage(prev => ({ ...prev, description: e.target.value }))}
                  className="wb-form-textarea"
                  rows="2"
                />
              </div>
              <div className="wb-form-group">
                <label className="wb-form-label">Color</label>
                <input
                  type="color"
                  value={editingStage.color}
                  onChange={(e) => setEditingStage(prev => ({ ...prev, color: e.target.value }))}
                  className="wb-color-input"
                />
              </div>
              <div className="wb-form-group">
                <label className="wb-form-label">Order</label>
                <input
                  type="number"
                  value={editingStage.order}
                  onChange={(e) => setEditingStage(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                  className="wb-form-input"
                />
              </div>
            </div>
            <div className="wb-modal-footer">
              <button
                onClick={() => setShowStageModal(false)}
                className="wb-modal-cancel"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateStage(editingStage.id, {
                    name: editingStage.name,
                    description: editingStage.description,
                    color: editingStage.color,
                    order: editingStage.order
                  });
                  setShowStageModal(false);
                  toast.success('Stage updated');
                }}
                className="wb-modal-submit"
              >
                <Check className="wb-modal-submit-icon" />
                Update Stage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transition Edit Modal - same as before */}
      {showTransitionModal && editingTransition && (
        <div className="wb-modal-overlay" onClick={() => setShowTransitionModal(false)}>
          <div className="wb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wb-modal-header">
              <h3 className="wb-modal-title">Edit Transition</h3>
              <button onClick={() => setShowTransitionModal(false)} className="wb-modal-close">
                <X className="wb-modal-close-icon" />
              </button>
            </div>
            <div className="wb-modal-body">
              <div className="wb-form-group">
                <label className="wb-form-label">From Stage</label>
                <select
                  value={editingTransition.fromStage}
                  onChange={(e) => setEditingTransition(prev => ({ ...prev, fromStage: e.target.value }))}
                  className="wb-form-select"
                >
                  {formData.stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>
              <div className="wb-form-group">
                <label className="wb-form-label">To Stage</label>
                <select
                  value={editingTransition.toStage}
                  onChange={(e) => setEditingTransition(prev => ({ ...prev, toStage: e.target.value }))}
                  className="wb-form-select"
                >
                  {formData.stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>
              <div className="wb-form-group">
                <label className="wb-form-label">Label</label>
                <input
                  type="text"
                  value={editingTransition.label}
                  onChange={(e) => setEditingTransition(prev => ({ ...prev, label: e.target.value }))}
                  className="wb-form-input"
                  placeholder="e.g., Approve, Reject"
                />
              </div>
              <div className="wb-form-group">
                <label className="wb-form-label">Condition</label>
                <input
                  type="text"
                  value={editingTransition.condition || ''}
                  onChange={(e) => setEditingTransition(prev => ({ ...prev, condition: e.target.value }))}
                  className="wb-form-input"
                  placeholder="e.g., task.completed === true"
                />
              </div>
            </div>
            <div className="wb-modal-footer">
              <button
                onClick={() => setShowTransitionModal(false)}
                className="wb-modal-cancel"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateTransition(editingTransition.index, {
                    fromStage: editingTransition.fromStage,
                    toStage: editingTransition.toStage,
                    label: editingTransition.label,
                    condition: editingTransition.condition
                  });
                  setShowTransitionModal(false);
                  toast.success('Transition updated');
                }}
                className="wb-modal-submit"
              >
                <Check className="wb-modal-submit-icon" />
                Update Transition
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .wb-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           HEADER
           ============================================ */
        .wb-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .wb-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wb-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .wb-title-icon {
          width: 28px;
          height: 28px;
          color: #eab308;
        }

        .wb-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .wb-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .wb-cancel-btn {
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

        .wb-cancel-btn:hover {
          background: #f9fafb;
        }

        .wb-save-btn {
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
          box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);
        }

        .wb-save-btn:hover:not(:disabled) {
          background: #2563eb;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
          transform: translateY(-1px);
        }

        .wb-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .wb-save-icon {
          width: 16px;
          height: 16px;
        }

        .wb-save-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           ERROR
           ============================================ */
        .wb-error {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .wb-error-icon {
          width: 20px;
          height: 20px;
          color: #dc2626;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .wb-error-title {
          font-size: 14px;
          font-weight: 600;
          color: #991b1b;
          margin: 0;
        }

        .wb-error-message {
          font-size: 13px;
          color: #7f1d1d;
          margin: 2px 0 0 0;
        }

        .wb-error-close {
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #991b1b;
          margin-left: auto;
          flex-shrink: 0;
        }

        .wb-error-close-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           SECTIONS
           ============================================ */
        .wb-section {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 20px;
          transition: all 0.2s ease;
        }

        .wb-section:hover {
          border-color: #e5e7eb;
        }

        .wb-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .wb-section-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 16px 0;
        }

        .wb-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        /* ============================================
           FORM
           ============================================ */
        .wb-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .wb-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .wb-grid-2,
          .wb-grid-3 {
            grid-template-columns: 1fr;
          }
        }

        .wb-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wb-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .wb-form-hint {
          font-size: 12px;
          color: #9ca3af;
        }

        .wb-form-input,
        .wb-form-select,
        .wb-form-textarea {
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

        .wb-form-input:focus,
        .wb-form-select:focus,
        .wb-form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .wb-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .wb-form-select-multiple {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          min-height: 100px;
        }

        .wb-form-select-multiple:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .wb-form-select-multiple option {
          padding: 4px 8px;
        }

        .wb-form-select-multiple option:checked {
          background: #3b82f6;
          color: #ffffff;
        }

        .wb-checkbox-group {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-top: 24px;
          flex-wrap: wrap;
        }

        .wb-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
        }

        .wb-checkbox-input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .wb-color-input {
          width: 60px;
          height: 40px;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          padding: 2px;
        }

        .wb-color-input:focus {
          border-color: #3b82f6;
        }

        .wb-add-btn {
          padding: 6px 14px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .wb-add-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .wb-add-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           STAGES
           ============================================ */
        .wb-stages {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .wb-stage-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: 1px solid #f3f4f6;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .wb-stage-item:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .wb-stage-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 1px #d1d5db;
        }

        .wb-stage-info {
          flex: 1;
          min-width: 0;
        }

        .wb-stage-name {
          font-weight: 600;
          color: #111827;
          font-size: 14px;
        }

        .wb-stage-order {
          font-size: 12px;
          color: #9ca3af;
          margin-left: 8px;
        }

        .wb-stage-desc {
          font-size: 13px;
          color: #6b7280;
          margin: 2px 0 0 0;
        }

        .wb-stage-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .wb-stage-action {
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

        .wb-stage-action:hover {
          background: #f3f4f6;
          color: #4b5563;
        }

        .wb-stage-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .wb-stage-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           TRANSITIONS
           ============================================ */
        .wb-transitions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .wb-transition-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border: 1px solid #f3f4f6;
          border-radius: 8px;
          transition: all 0.2s ease;
          flex-wrap: wrap;
          gap: 8px;
        }

        .wb-transition-item:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .wb-transition-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .wb-transition-from,
        .wb-transition-to {
          font-weight: 500;
          color: #111827;
          font-size: 14px;
        }

        .wb-transition-arrow {
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        .wb-transition-label {
          font-size: 13px;
          color: #6b7280;
        }

        .wb-transition-condition {
          font-size: 12px;
          color: #3b82f6;
          background: #eff6ff;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .wb-transition-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .wb-transition-action {
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

        .wb-transition-action:hover {
          background: #f3f4f6;
          color: #4b5563;
        }

        .wb-transition-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .wb-transition-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           LOADING
           ============================================ */
        .wb-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .wb-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .wb-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
        }

        /* ============================================
           MODAL
           ============================================ */
        .wb-modal-overlay {
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

        .wb-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 480px;
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

        .wb-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          position: sticky;
          top: 0;
          background: #ffffff;
          z-index: 1;
        }

        .wb-modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .wb-modal-close {
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

        .wb-modal-close:hover {
          background: #f3f4f6;
        }

        .wb-modal-close-icon {
          width: 20px;
          height: 20px;
        }

        .wb-modal-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .wb-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid #f3f4f6;
          position: sticky;
          bottom: 0;
          background: #ffffff;
        }

        .wb-modal-cancel {
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

        .wb-modal-cancel:hover {
          background: #f9fafb;
        }

        .wb-modal-submit {
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

        .wb-modal-submit:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .wb-modal-submit-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .wb-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .wb-header-right {
            width: 100%;
          }

          .wb-section {
            padding: 16px;
          }

          .wb-stage-item {
            flex-wrap: wrap;
          }

          .wb-transition-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .wb-transition-actions {
            align-self: flex-end;
          }

          .wb-modal {
            max-width: 100%;
            margin: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default WorkflowBuilder;