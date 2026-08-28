import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Add this import
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle, AlertCircle, AlertOctagon,
  CheckCircle, Filter, Search, Eye, Activity,
  Plus, X, Trash2, RefreshCw, ChevronDown,
  ChevronUp, Clock, User, Calendar, Tag,
  Shield, Save
} from 'lucide-react';
import toast from 'react-hot-toast';

const Risks = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();  // Add navigation hook
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    type: 'all'
  });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  // Remove selectedRisk and showDetails state - we'll use navigation instead
  const [showNewRiskModal, setShowNewRiskModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [entities, setEntities] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'security',
    severity: 'medium',
    status: 'detected',
    impact: 'moderate',
    likelihood: 'possible',
    entityType: 'project',
    entityId: '',
    assignedTo: '',
    mitigationPlan: ''
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchRisks();
    fetchEntities();
    fetchUsers();
  }, [filters, search, sortBy, sortOrder]);

  const fetchRisks = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (filters.severity !== 'all') params.append('severity', filters.severity);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (search) params.append('search', search);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const response = await fetch(`${API_URL}/risks?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRisks(result.data || []);
        } else {
          throw new Error(result.message || 'Failed to fetch risks');
        }
      } else {
        throw new Error('Failed to fetch risks');
      }
    } catch (error) {
      console.error('Error fetching risks:', error);
      toast.error(error.message || 'Failed to load risks');
      setRisks(getMockRisks());
      toast.info('Showing sample risk data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEntities = async () => {
    try {
      const response = await fetch(`${API_URL}/projects?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        setEntities(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching entities:', error);
      setEntities([
        { _id: '1', name: 'Project Alpha' },
        { _id: '2', name: 'Project Beta' },
        { _id: '3', name: 'Project Gamma' }
      ]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([
        { _id: 'user1', firstName: 'John', lastName: 'Doe' },
        { _id: 'user2', firstName: 'Sarah', lastName: 'Smith' },
        { _id: 'user3', firstName: 'Mike', lastName: 'Johnson' }
      ]);
    }
  };

  const getMockRisks = () => {
    return [
      {
        _id: '1',
        name: 'Data Breach Risk',
        description: 'Potential data breach due to unpatched vulnerabilities in the authentication system.',
        severity: 'critical',
        status: 'detected',
        type: 'security',
        impact: 'critical',
        likelihood: 'high',
        riskScore: 95,
        detectedAt: new Date(Date.now() - 3600000).toISOString(),
        assignedTo: { firstName: 'John', lastName: 'Doe' },
        mitigation: 'Implement security patches and conduct security audit'
      },
      {
        _id: '2',
        name: 'Project Delay Risk',
        description: 'Potential delay in project delivery due to resource constraints and scope creep.',
        severity: 'high',
        status: 'in_progress',
        type: 'operational',
        impact: 'significant',
        likelihood: 'medium',
        riskScore: 75,
        detectedAt: new Date(Date.now() - 7200000).toISOString(),
        assignedTo: { firstName: 'Sarah', lastName: 'Smith' },
        mitigation: 'Reallocate resources and prioritize critical features'
      },
      {
        _id: '3',
        name: 'Compliance Violation Risk',
        description: 'Potential violation of GDPR compliance requirements in data processing.',
        severity: 'medium',
        status: 'mitigated',
        type: 'compliance',
        impact: 'moderate',
        likelihood: 'low',
        riskScore: 45,
        detectedAt: new Date(Date.now() - 86400000).toISOString(),
        assignedTo: { firstName: 'Mike', lastName: 'Johnson' },
        mitigation: 'Updated data processing procedures and staff training completed'
      },
      {
        _id: '4',
        name: 'Budget Overrun Risk',
        description: 'Potential budget overrun due to increased operational costs.',
        severity: 'low',
        status: 'resolved',
        type: 'financial',
        impact: 'minimal',
        likelihood: 'low',
        riskScore: 25,
        detectedAt: new Date(Date.now() - 172800000).toISOString(),
        assignedTo: { firstName: 'Emma', lastName: 'Wilson' },
        mitigation: 'Cost optimization measures implemented'
      }
    ];
  };

  const handleRefresh = () => {
    fetchRisks(true);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Updated: Navigate to risk details page instead of showing modal
  const handleViewRisk = (risk) => {
    navigate(`/risks/${risk._id}`);
  };

  const handleMitigate = async (riskId) => {
    if (!window.confirm('Are you sure you want to start mitigating this risk?')) return;

    try {
      const response = await fetch(`${API_URL}/risks/${riskId}/mitigate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'in_progress' })
      });

      if (response.ok) {
        toast.success('Risk mitigation started');
        fetchRisks(true);
      } else {
        throw new Error('Failed to start mitigation');
      }
    } catch (error) {
      console.error('Error mitigating risk:', error);
      toast.error('Failed to start mitigation');
    }
  };

  const handleCreateRisk = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Risk name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Risk description is required');
      return;
    }
    if (!formData.entityId) {
      toast.error('Please select a related entity');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/risks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          ownerId: user?._id || 'user1'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('Risk created successfully!');
          setShowNewRiskModal(false);
          resetForm();
          fetchRisks(true);
        } else {
          throw new Error(result.message || 'Failed to create risk');
        }
      } else {
        throw new Error('Failed to create risk');
      }
    } catch (error) {
      console.error('Error creating risk:', error);
      toast.error(error.message || 'Failed to create risk');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'security',
      severity: 'medium',
      status: 'detected',
      impact: 'moderate',
      likelihood: 'possible',
      entityType: 'project',
      entityId: '',
      assignedTo: '',
      mitigationPlan: ''
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'entityType') {
      setFormData(prev => ({ ...prev, entityId: '' }));
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'risks-bg-critical',
      'high': 'risks-bg-high',
      'medium': 'risks-bg-medium',
      'low': 'risks-bg-low'
    };
    return colors[severity] || 'risks-bg-default';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return <AlertOctagon className="risks-icon" />;
    if (severity === 'high') return <AlertCircle className="risks-icon" />;
    if (severity === 'medium') return <AlertTriangle className="risks-icon" />;
    return <CheckCircle className="risks-icon" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'detected': 'risks-status-detected',
      'in_progress': 'risks-status-progress',
      'mitigated': 'risks-status-mitigated',
      'resolved': 'risks-status-resolved',
      'ignored': 'risks-status-ignored'
    };
    return colors[status] || 'risks-status-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'detected': 'Detected',
      'in_progress': 'In Progress',
      'mitigated': 'Mitigated',
      'resolved': 'Resolved',
      'ignored': 'Ignored'
    };
    return labels[status] || status;
  };

  const getImpactBadge = (impact) => {
    const colors = {
      'minimal': 'risks-impact-minimal',
      'moderate': 'risks-impact-moderate',
      'significant': 'risks-impact-significant',
      'critical': 'risks-impact-critical'
    };
    return colors[impact] || 'risks-impact-default';
  };

  const getTypeBadge = (type) => {
    const colors = {
      'security': 'risks-type-security',
      'operational': 'risks-type-operational',
      'compliance': 'risks-type-compliance',
      'financial': 'risks-type-financial',
      'strategic': 'risks-type-strategic'
    };
    return colors[type] || 'risks-type-default';
  };

  const getLikelihoodLabel = (likelihood) => {
    const labels = {
      'very_high': 'Very High',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low',
      'very_low': 'Very Low'
    };
    return labels[likelihood] || likelihood;
  };

  if (loading) {
    return (
      <div className="risks-loading-container">
        <div className="risks-spinner"></div>
        <p className="risks-loading-text">Loading risks...</p>
      </div>
    );
  }

  return (
    <div className="risks-container">
      {/* Header */}
      <div className="risks-header">
        <div className="risks-header-left">
          <div className="risks-header-icon">
            <AlertCircle className="risks-header-svg" />
          </div>
          <div>
            <h1 className="risks-title">Risk Management</h1>
            <p className="risks-subtitle">Identify, assess, and manage potential risks</p>
          </div>
        </div>
        <div className="risks-header-right">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="risks-btn-icon"
          >
            <RefreshCw className={`risks-refresh-icon ${refreshing ? 'risks-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowNewRiskModal(true)}
            className="risks-btn-primary"
          >
            <Plus className="risks-btn-icon-svg" />
            New Risk
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="risks-stats">
        <div className="risks-stat-card">
          <div className="risks-stat-header">
            <span className="risks-stat-label">Total Risks</span>
            <Activity className="risks-stat-icon" />
          </div>
          <p className="risks-stat-value">{risks.length}</p>
        </div>
        <div className="risks-stat-card">
          <div className="risks-stat-header">
            <span className="risks-stat-label">Critical</span>
            <AlertOctagon className="risks-stat-icon risks-stat-icon-critical" />
          </div>
          <p className="risks-stat-value risks-stat-value-critical">
            {risks.filter(r => r.severity === 'critical').length}
          </p>
        </div>
        <div className="risks-stat-card">
          <div className="risks-stat-header">
            <span className="risks-stat-label">In Progress</span>
            <Clock className="risks-stat-icon risks-stat-icon-progress" />
          </div>
          <p className="risks-stat-value risks-stat-value-progress">
            {risks.filter(r => r.status === 'in_progress').length}
          </p>
        </div>
        <div className="risks-stat-card">
          <div className="risks-stat-header">
            <span className="risks-stat-label">Resolved</span>
            <CheckCircle className="risks-stat-icon risks-stat-icon-resolved" />
          </div>
          <p className="risks-stat-value risks-stat-value-resolved">
            {risks.filter(r => r.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="risks-filters-container">
        <div className="risks-filters">
          <div className="risks-search-wrapper">
            <Search className="risks-search-icon" />
            <input
              type="text"
              placeholder="Search risks..."
              value={search}
              onChange={handleSearch}
              className="risks-search-input"
            />
          </div>

          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="risks-filter-select"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="risks-filter-select"
          >
            <option value="all">All Status</option>
            <option value="detected">Detected</option>
            <option value="in_progress">In Progress</option>
            <option value="mitigated">Mitigated</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="risks-filter-select"
          >
            <option value="all">All Types</option>
            <option value="security">Security</option>
            <option value="operational">Operational</option>
            <option value="compliance">Compliance</option>
            <option value="financial">Financial</option>
            <option value="strategic">Strategic</option>
          </select>

          <div className="risks-sort-wrapper">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="risks-filter-select"
            >
              <option value="createdAt">Created</option>
              <option value="riskScore">Risk Score</option>
              <option value="severity">Severity</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="risks-sort-btn"
            >
              {sortOrder === 'asc' ? <ChevronUp className="risks-sort-icon" /> : <ChevronDown className="risks-sort-icon" />}
            </button>
          </div>

          {(filters.severity !== 'all' || filters.status !== 'all' || filters.type !== 'all' || search) && (
            <button
              onClick={() => {
                setFilters({ severity: 'all', status: 'all', type: 'all' });
                setSearch('');
              }}
              className="risks-clear-btn"
            >
              <X className="risks-clear-icon" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Risks List */}
      <div className="risks-list-container">
        {risks.length === 0 ? (
          <div className="risks-empty">
            <div className="risks-empty-icon-wrapper">
              <AlertCircle className="risks-empty-icon" />
            </div>
            <h3 className="risks-empty-title">No risks found</h3>
            <p className="risks-empty-subtitle">Everything looks good! 🎉</p>
            <button
              onClick={() => setShowNewRiskModal(true)}
              className="risks-empty-btn"
            >
              <Plus className="risks-btn-icon-svg" />
              Add Risk
            </button>
          </div>
        ) : (
          <div className="risks-list">
            {risks.map((risk) => (
              <div key={risk._id} className="risks-card">
                <div className="risks-card-content">
                  <div className="risks-card-main">
                    <div className="risks-card-header">
                      <div className={`risks-card-severity ${getSeverityColor(risk.severity)}`}>
                        {getSeverityIcon(risk.severity)}
                      </div>
                      <h4 className="risks-card-title">{risk.name}</h4>
                      <span className={`risks-card-status ${getStatusColor(risk.status)}`}>
                        {getStatusLabel(risk.status)}
                      </span>
                      <span className={`risks-card-type ${getTypeBadge(risk.type)}`}>
                        {risk.type}
                      </span>
                      <span className="risks-card-score">Score: {risk.riskScore}</span>
                    </div>

                    <p className="risks-card-description">{risk.description}</p>

                    <div className="risks-card-meta">
                      <span className="risks-card-meta-item">
                        <Tag className="risks-card-meta-icon" />
                        Impact: <span className={`risks-card-meta-badge ${getImpactBadge(risk.impact)}`}>
                          {risk.impact}
                        </span>
                      </span>
                      <span className="risks-card-meta-item">
                        Likelihood: {getLikelihoodLabel(risk.likelihood)}
                      </span>
                      <span className="risks-card-meta-item">
                        <Calendar className="risks-card-meta-icon" />
                        {new Date(risk.detectedAt).toLocaleDateString()}
                      </span>
                      {risk.assignedTo && (
                        <span className="risks-card-meta-item">
                          <User className="risks-card-meta-icon" />
                          {risk.assignedTo.firstName} {risk.assignedTo.lastName}
                        </span>
                      )}
                    </div>

                    {risk.mitigation && (
                      <p className="risks-card-mitigation">
                        <span className="risks-card-mitigation-label">Mitigation: </span>
                        {risk.mitigation}
                      </p>
                    )}
                  </div>

                  <div className="risks-card-actions">
                    <button
                      onClick={() => handleViewRisk(risk)}
                      className="risks-action-btn risks-action-view"
                      title="View Details"
                    >
                      <Eye className="risks-action-icon" />
                    </button>
                    {risk.status === 'detected' && (
                      <button
                        onClick={() => handleMitigate(risk._id)}
                        className="risks-action-mitigate"
                      >
                        Mitigate
                      </button>
                    )}
                    {risk.status === 'in_progress' && (
                      <span className="risks-action-progress">
                        In Progress...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Risk Modal */}
      {showNewRiskModal && (
        <div className="risks-modal-overlay" onClick={() => setShowNewRiskModal(false)}>
          <div className="risks-modal risks-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="risks-modal-header">
              <div className="risks-modal-title-wrapper">
                <div className="risks-modal-new-icon">
                  <Shield className="risks-modal-new-svg" />
                </div>
                <h2 className="risks-modal-title">Create New Risk</h2>
              </div>
              <button onClick={() => setShowNewRiskModal(false)} className="risks-modal-close">
                <X className="risks-modal-close-icon" />
              </button>
            </div>

            <form onSubmit={handleCreateRisk} className="risks-modal-form">
              <div className="risks-form-grid">
                {/* Left Column */}
                <div className="risks-form-main">
                  <div className="risks-form-group">
                    <label className="risks-form-label">
                      Risk Name <span className="risks-form-required">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="risks-form-input"
                      placeholder="Enter a descriptive risk name"
                      autoFocus
                    />
                  </div>

                  <div className="risks-form-group">
                    <label className="risks-form-label">
                      Description <span className="risks-form-required">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      className="risks-form-textarea"
                      rows="3"
                      placeholder="Describe the risk in detail, including potential causes and impacts"
                    />
                  </div>

                  <div className="risks-form-group">
                    <label className="risks-form-label">Mitigation Plan</label>
                    <textarea
                      value={formData.mitigationPlan}
                      onChange={(e) => handleFormChange('mitigationPlan', e.target.value)}
                      className="risks-form-textarea"
                      rows="2"
                      placeholder="Describe the plan to mitigate this risk"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="risks-form-sidebar">
                  <div className="risks-form-group">
                    <label className="risks-form-label">Risk Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleFormChange('type', e.target.value)}
                      className="risks-form-select"
                    >
                      <option value="security">Security</option>
                      <option value="operational">Operational</option>
                      <option value="compliance">Compliance</option>
                      <option value="financial">Financial</option>
                      <option value="strategic">Strategic</option>
                      <option value="overdue">Overdue</option>
                      <option value="delayed">Delayed</option>
                      <option value="underperforming">Underperforming</option>
                      <option value="budget">Budget</option>
                      <option value="scope">Scope</option>
                      <option value="quality">Quality</option>
                      <option value="resource">Resource</option>
                      <option value="client">Client</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="risks-form-group">
                    <label className="risks-form-label">Severity</label>
                    <div className="risks-severity-selector">
                      {['critical', 'high', 'medium', 'low'].map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => handleFormChange('severity', sev)}
                          className={`risks-severity-btn risks-severity-${sev} ${formData.severity === sev ? 'risks-severity-active' : ''}`}
                        >
                          {sev === 'critical' && <AlertOctagon className="risks-severity-icon" />}
                          {sev === 'high' && <AlertCircle className="risks-severity-icon" />}
                          {sev === 'medium' && <AlertTriangle className="risks-severity-icon" />}
                          {sev === 'low' && <CheckCircle className="risks-severity-icon" />}
                          <span className="risks-severity-label">{getSeverityLabel(sev)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="risks-form-group">
                    <label className="risks-form-label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="risks-form-select"
                    >
                      <option value="detected">Detected</option>
                      <option value="in_progress">In Progress</option>
                      <option value="mitigated">Mitigated</option>
                      <option value="resolved">Resolved</option>
                      <option value="ignored">Ignored</option>
                    </select>
                  </div>

                  <div className="risks-form-group">
                    <label className="risks-form-label">Impact</label>
                    <select
                      value={formData.impact}
                      onChange={(e) => handleFormChange('impact', e.target.value)}
                      className="risks-form-select"
                    >
                      <option value="minimal">Minimal</option>
                      <option value="moderate">Moderate</option>
                      <option value="significant">Significant</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="risks-form-group">
                    <label className="risks-form-label">Likelihood</label>
                    <select
                      value={formData.likelihood}
                      onChange={(e) => handleFormChange('likelihood', e.target.value)}
                      className="risks-form-select"
                    >
                      <option value="unlikely">Unlikely</option>
                      <option value="possible">Possible</option>
                      <option value="likely">Likely</option>
                      <option value="almost_certain">Almost Certain</option>
                    </select>
                  </div>

                  <div className="risks-form-group">
                    <label className="risks-form-label">
                      Related Entity <span className="risks-form-required">*</span>
                    </label>
                    <select
                      value={formData.entityType}
                      onChange={(e) => handleFormChange('entityType', e.target.value)}
                      className="risks-form-select"
                    >
                      <option value="project">Project</option>
                      <option value="task">Task</option>
                      <option value="goal">Goal</option>
                      <option value="lead">Lead</option>
                      <option value="deal">Deal</option>
                      <option value="client">Client</option>
                      <option value="employee">Employee</option>
                      <option value="team">Team</option>
                      <option value="department">Department</option>
                      <option value="segment">Segment</option>
                    </select>
                  </div>

                  <div className="risks-form-group">
                    <label className="risks-form-label">
                      Select Entity <span className="risks-form-required">*</span>
                    </label>
                    <select
                      value={formData.entityId}
                      onChange={(e) => handleFormChange('entityId', e.target.value)}
                      className="risks-form-select"
                    >
                      <option value="">Select {formData.entityType}</option>
                      {entities.map((entity) => (
                        <option key={entity._id} value={entity._id}>
                          {entity.name || entity.title || entity.companyName || 'Unnamed'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="risks-form-group">
                    <label className="risks-form-label">Assign To</label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => handleFormChange('assignedTo', e.target.value)}
                      className="risks-form-select"
                    >
                      <option value="">Unassigned</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="risks-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowNewRiskModal(false)}
                  className="risks-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="risks-modal-submit"
                >
                  {submitting ? (
                    <>
                      <div className="risks-submit-spinner"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="risks-btn-icon-svg" />
                      Create Risk
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .risks-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: risksFadeIn 0.4s ease;
        }

        @keyframes risksFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .risks-loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .risks-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: risksSpin 0.8s linear infinite;
        }

        @keyframes risksSpin {
          to { transform: rotate(360deg); }
        }

        .risks-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        /* ============================================
           HEADER
           ============================================ */
        .risks-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .risks-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .risks-header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
        }

        .risks-header-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .risks-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .risks-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .risks-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .risks-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #64748b;
        }

        .risks-btn-icon:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .risks-btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .risks-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .risks-spin {
          animation: risksSpin 1s linear infinite;
        }

        .risks-btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }

        .risks-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .risks-btn-icon-svg {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           STATS
           ============================================ */
        .risks-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .risks-stat-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 16px 20px;
          transition: all 0.2s ease;
          animation: risksSlideUp 0.5s ease both;
        }

        .risks-stat-card:nth-child(1) { animation-delay: 0.05s; }
        .risks-stat-card:nth-child(2) { animation-delay: 0.1s; }
        .risks-stat-card:nth-child(3) { animation-delay: 0.15s; }
        .risks-stat-card:nth-child(4) { animation-delay: 0.2s; }

        @keyframes risksSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .risks-stat-card:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .risks-stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .risks-stat-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .risks-stat-icon {
          width: 20px;
          height: 20px;
          color: #94a3b8;
        }

        .risks-stat-icon-critical {
          color: #ef4444;
        }

        .risks-stat-icon-progress {
          color: #3b82f6;
        }

        .risks-stat-icon-resolved {
          color: #22c55e;
        }

        .risks-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 4px 0 0 0;
          line-height: 1.2;
        }

        .risks-stat-value-critical {
          color: #ef4444;
        }

        .risks-stat-value-progress {
          color: #3b82f6;
        }

        .risks-stat-value-resolved {
          color: #22c55e;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .risks-filters-container {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 16px 20px;
          margin-bottom: 24px;
        }

        .risks-filters {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
        }

        .risks-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .risks-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .risks-search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
        }

        .risks-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .risks-filter-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 140px;
        }

        .risks-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .risks-sort-wrapper {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .risks-sort-btn {
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #64748b;
          display: flex;
          align-items: center;
        }

        .risks-sort-btn:hover {
          background: #f1f5f9;
        }

        .risks-sort-icon {
          width: 16px;
          height: 16px;
        }

        .risks-clear-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: #f1f5f9;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .risks-clear-btn:hover {
          background: #e2e8f0;
        }

        .risks-clear-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           LIST
           ============================================ */
        .risks-list-container {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .risks-list {
          divide-y: 1px solid #e2e8f0;
        }

        .risks-card {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s ease;
        }

        .risks-card:last-child {
          border-bottom: none;
        }

        .risks-card:hover {
          background: #f8fafc;
        }

        .risks-card-content {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        @media (min-width: 768px) {
          .risks-card-content {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
          }
        }

        .risks-card-main {
          flex: 1;
          min-width: 0;
        }

        .risks-card-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .risks-card-severity {
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .risks-bg-critical { background: #ef4444; color: #ffffff; }
        .risks-bg-high { background: #f97316; color: #ffffff; }
        .risks-bg-medium { background: #eab308; color: #ffffff; }
        .risks-bg-low { background: #22c55e; color: #ffffff; }
        .risks-bg-default { background: #94a3b8; color: #ffffff; }

        .risks-icon {
          width: 20px;
          height: 20px;
        }

        .risks-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .risks-card-status {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .risks-status-detected { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .risks-status-progress { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
        .risks-status-mitigated { background: #f3e8ff; color: #6d28d9; border: 1px solid #d8b4fe; }
        .risks-status-resolved { background: #d1fae5; color: #065f46; border: 1px solid #86efac; }
        .risks-status-ignored { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
        .risks-status-default { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

        .risks-card-type {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .risks-type-security { background: #fee2e2; color: #991b1b; }
        .risks-type-operational { background: #dbeafe; color: #1d4ed8; }
        .risks-type-compliance { background: #f3e8ff; color: #6d28d9; }
        .risks-type-financial { background: #d1fae5; color: #065f46; }
        .risks-type-strategic { background: #fef3c7; color: #92400e; }
        .risks-type-default { background: #f1f5f9; color: #475569; }

        .risks-card-score {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
        }

        .risks-card-description {
          font-size: 14px;
          color: #64748b;
          margin: 8px 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .risks-card-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
          font-size: 12px;
          color: #64748b;
        }

        .risks-card-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .risks-card-meta-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .risks-card-meta-badge {
          padding: 1px 8px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .risks-impact-minimal { background: #d1fae5; color: #065f46; }
        .risks-impact-moderate { background: #fef3c7; color: #92400e; }
        .risks-impact-significant { background: #ffedd5; color: #9a3412; }
        .risks-impact-critical { background: #fee2e2; color: #991b1b; }
        .risks-impact-default { background: #f1f5f9; color: #475569; }

        .risks-card-mitigation {
          font-size: 14px;
          color: #475569;
          margin-top: 8px;
          background: #f8fafc;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .risks-card-mitigation-label {
          font-weight: 600;
          color: #0f172a;
        }

        .risks-card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          margin-top: 8px;
        }

        @media (min-width: 768px) {
          .risks-card-actions {
            margin-top: 0;
          }
        }

        .risks-action-btn {
          padding: 8px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #94a3b8;
          display: flex;
          align-items: center;
        }

        .risks-action-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .risks-action-view:hover {
          background: #eff6ff;
          color: #3b82f6;
        }

        .risks-action-icon {
          width: 18px;
          height: 18px;
        }

        .risks-action-mitigate {
          padding: 6px 14px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .risks-action-mitigate:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .risks-action-progress {
          padding: 6px 14px;
          background: #dbeafe;
          color: #1d4ed8;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          animation: risksPulse 2s ease-in-out infinite;
        }

        @keyframes risksPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .risks-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }

        .risks-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .risks-empty-icon {
          width: 36px;
          height: 36px;
          color: #94a3b8;
        }

        .risks-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .risks-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .risks-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .risks-empty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        /* ============================================
           MODAL
           ============================================ */
        .risks-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: risksFadeIn 0.3s ease;
        }

        .risks-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: risksModalIn 0.3s ease;
        }

        .risks-modal-lg {
          max-width: 800px;
        }

        @keyframes risksModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .risks-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          position: sticky;
          top: 0;
          background: #ffffff;
          z-index: 10;
          border-radius: 16px 16px 0 0;
        }

        .risks-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .risks-modal-new-icon {
          width: 44px;
          height: 44px;
          background: #dbeafe;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .risks-modal-new-svg {
          width: 22px;
          height: 22px;
          color: #3b82f6;
        }

        .risks-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .risks-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: none;
          background: #f1f5f9;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .risks-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .risks-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        .risks-modal-form {
          padding: 24px;
        }

        .risks-form-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
        }

        .risks-form-main {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .risks-form-sidebar {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .risks-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .risks-form-label {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
        }

        .risks-form-required {
          color: #ef4444;
        }

        .risks-form-input,
        .risks-form-select,
        .risks-form-textarea {
          padding: 8px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          color: #0f172a;
        }

        .risks-form-input:focus,
        .risks-form-select:focus,
        .risks-form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .risks-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .risks-severity-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .risks-severity-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
          font-weight: 500;
          color: #475569;
        }

        .risks-severity-btn:hover {
          transform: translateY(-1px);
        }

        .risks-severity-btn.risks-severity-active {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .risks-severity-critical { color: #ef4444; }
        .risks-severity-critical.risks-severity-active { border-color: #ef4444; background: #fef2f2; }
        .risks-severity-high { color: #f97316; }
        .risks-severity-high.risks-severity-active { border-color: #f97316; background: #fff7ed; }
        .risks-severity-medium { color: #eab308; }
        .risks-severity-medium.risks-severity-active { border-color: #eab308; background: #fffbeb; }
        .risks-severity-low { color: #22c55e; }
        .risks-severity-low.risks-severity-active { border-color: #22c55e; background: #f0fdf4; }

        .risks-severity-icon {
          width: 14px;
          height: 14px;
        }

        .risks-severity-label {
          font-size: 11px;
        }

        .risks-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
          position: sticky;
          bottom: 0;
          background: #ffffff;
          border-radius: 0 0 16px 16px;
        }

        .risks-modal-cancel {
          padding: 8px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .risks-modal-cancel:hover {
          background: #f1f5f9;
        }

        .risks-modal-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .risks-modal-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        .risks-modal-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .risks-submit-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: risksSpin 0.8s linear infinite;
        }

        .risks-modal::-webkit-scrollbar {
          width: 6px;
        }

        .risks-modal::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }

        .risks-modal::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }

        .risks-modal::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .risks-form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .risks-container {
            padding: 16px;
          }

          .risks-header {
            flex-direction: column;
            align-items: stretch;
          }

          .risks-header-right {
            flex-wrap: wrap;
          }

          .risks-btn-primary {
            flex: 1;
            justify-content: center;
          }

          .risks-filters {
            flex-direction: column;
          }

          .risks-search-wrapper {
            width: 100%;
          }

          .risks-filter-select {
            width: 100%;
          }

          .risks-sort-wrapper {
            width: 100%;
          }

          .risks-sort-wrapper .risks-filter-select {
            flex: 1;
          }

          .risks-stats {
            grid-template-columns: 1fr 1fr;
          }

          .risks-title {
            font-size: 22px;
          }

          .risks-header-icon {
            width: 40px;
            height: 40px;
          }

          .risks-header-svg {
            width: 20px;
            height: 20px;
          }

          .risks-modal {
            margin: 16px;
            max-height: 95vh;
          }

          .risks-modal-lg {
            max-width: 100%;
          }

          .risks-card-header {
            flex-wrap: wrap;
          }

          .risks-severity-selector {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .risks-container {
            padding: 12px;
          }

          .risks-header-right {
            flex-direction: column;
          }

          .risks-btn-primary {
            width: 100%;
          }

          .risks-btn-icon {
            align-self: flex-end;
          }

          .risks-title {
            font-size: 20px;
          }

          .risks-subtitle {
            font-size: 13px;
          }

          .risks-stats {
            grid-template-columns: 1fr;
          }

          .risks-modal {
            padding: 0;
          }

          .risks-modal-header {
            padding: 16px 18px;
          }

          .risks-modal-form {
            padding: 16px;
          }

          .risks-modal-footer {
            flex-direction: column;
          }

          .risks-modal-cancel,
          .risks-modal-submit {
            width: 100%;
            justify-content: center;
          }

          .risks-severity-selector {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Risks;