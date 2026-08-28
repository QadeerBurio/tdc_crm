import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle, AlertCircle, AlertOctagon,
  CheckCircle, Filter, Search, Eye, Activity,
  Plus, X, Trash2, Edit, RefreshCw,
  ChevronDown, ChevronRight, Calendar, Users,
  Clock, Tag, ArrowRight, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RiskList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    type: 'all'
  });
  const [expanded, setExpanded] = useState({});
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchRisks();
  }, [search, filters, sortBy, sortOrder]);

  const fetchRisks = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.severity !== 'all') params.append('severity', filters.severity);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
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
        mitigationPlan: 'Implement security patches and conduct security audit'
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
        mitigationPlan: 'Reallocate resources and prioritize critical features'
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
        mitigationPlan: 'Updated data processing procedures and staff training completed'
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
        mitigationPlan: 'Cost optimization measures implemented'
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

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleViewRisk = (id) => {
    navigate(`/risks/${id}`);
  };

  const handleEditRisk = (id) => {
    navigate(`/risks/${id}/edit`);
  };

  const handleDeleteRisk = async (id) => {
    if (!window.confirm('Are you sure you want to delete this risk?')) return;

    try {
      const response = await fetch(`${API_URL}/risks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Risk deleted successfully');
        fetchRisks(true);
      } else {
        throw new Error('Failed to delete risk');
      }
    } catch (error) {
      console.error('Error deleting risk:', error);
      toast.error(error.message || 'Failed to delete risk');
    }
  };

  const handleMitigate = async (id) => {
    if (!window.confirm('Are you sure you want to start mitigating this risk?')) return;

    try {
      const response = await fetch(`${API_URL}/risks/${id}/mitigate`, {
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
      toast.error(error.message || 'Failed to start mitigation');
    }
  };

  const handleResolve = async (id) => {
    if (!window.confirm('Are you sure you want to resolve this risk?')) return;

    try {
      const response = await fetch(`${API_URL}/risks/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolution: 'Risk resolved' })
      });

      if (response.ok) {
        toast.success('Risk resolved successfully');
        fetchRisks(true);
      } else {
        throw new Error('Failed to resolve risk');
      }
    } catch (error) {
      console.error('Error resolving risk:', error);
      toast.error(error.message || 'Failed to resolve risk');
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'rl-severity-critical',
      'high': 'rl-severity-high',
      'medium': 'rl-severity-medium',
      'low': 'rl-severity-low'
    };
    return colors[severity] || 'rl-severity-default';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return <AlertOctagon className="rl-icon" />;
    if (severity === 'high') return <AlertCircle className="rl-icon" />;
    if (severity === 'medium') return <AlertTriangle className="rl-icon" />;
    return <CheckCircle className="rl-icon" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'detected': 'rl-status-detected',
      'in_progress': 'rl-status-progress',
      'mitigated': 'rl-status-mitigated',
      'resolved': 'rl-status-resolved',
      'ignored': 'rl-status-ignored'
    };
    return colors[status] || 'rl-status-default';
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
      'minimal': 'rl-impact-minimal',
      'moderate': 'rl-impact-moderate',
      'significant': 'rl-impact-significant',
      'critical': 'rl-impact-critical'
    };
    return colors[impact] || 'rl-impact-default';
  };

  const getTypeBadge = (type) => {
    const colors = {
      'security': 'rl-type-security',
      'operational': 'rl-type-operational',
      'compliance': 'rl-type-compliance',
      'financial': 'rl-type-financial',
      'strategic': 'rl-type-strategic'
    };
    return colors[type] || 'rl-type-default';
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

  const severityOptions = [
    { value: 'all', label: 'All Severity' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'detected', label: 'Detected' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'mitigated', label: 'Mitigated' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'ignored', label: 'Ignored' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'security', label: 'Security' },
    { value: 'operational', label: 'Operational' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'financial', label: 'Financial' },
    { value: 'strategic', label: 'Strategic' }
  ];

  if (loading) {
    return (
      <div className="rl-loading">
        <div className="rl-spinner"></div>
        <p className="rl-loading-text">Loading risks...</p>
      </div>
    );
  }

  return (
    <div className="rl-container">
      {/* Header */}
      <div className="rl-header">
        <div className="rl-header-left">
          <div className="rl-header-icon">
            <Shield className="rl-header-svg" />
          </div>
          <div>
            <h1 className="rl-title">Risks</h1>
            <p className="rl-subtitle">Manage and track organizational risks</p>
          </div>
          <span className="rl-count">{risks.length} risks</span>
        </div>
        <div className="rl-header-right">
          <button onClick={handleRefresh} disabled={refreshing} className="rl-icon-btn">
            <RefreshCw className={`rl-refresh-icon ${refreshing ? 'rl-spin' : ''}`} />
          </button>
          <button onClick={() => navigate('/risks/new')} className="rl-add-btn">
            <Plus className="rl-btn-icon" />
            New Risk
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rl-filters">
        <div className="rl-search-wrapper">
          <Search className="rl-search-icon" />
          <input
            type="text"
            placeholder="Search risks..."
            value={search}
            onChange={handleSearch}
            className="rl-search-input"
          />
          {search && (
            <button className="rl-search-clear" onClick={() => setSearch('')}>
              <X className="rl-search-clear-icon" />
            </button>
          )}
        </div>

        <select
          value={filters.severity}
          onChange={(e) => handleFilterChange('severity', e.target.value)}
          className="rl-filter-select"
        >
          {severityOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="rl-filter-select"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="rl-filter-select"
        >
          {typeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <div className="rl-sort-wrapper">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rl-filter-select"
          >
            <option value="createdAt">Created</option>
            <option value="riskScore">Risk Score</option>
            <option value="severity">Severity</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="rl-sort-btn"
          >
            {sortOrder === 'asc' ? <ChevronDown className="rl-sort-icon" /> : <ChevronUp className="rl-sort-icon" />}
          </button>
        </div>

        {(filters.severity !== 'all' || filters.status !== 'all' || filters.type !== 'all' || search) && (
          <button
            onClick={() => {
              setFilters({ severity: 'all', status: 'all', type: 'all' });
              setSearch('');
            }}
            className="rl-clear-btn"
          >
            <X className="rl-clear-icon" />
            Clear
          </button>
        )}
      </div>

      {/* Risk List */}
      <div className="rl-list-container">
        {risks.length === 0 ? (
          <div className="rl-empty">
            <div className="rl-empty-icon-wrapper">
              <AlertCircle className="rl-empty-icon" />
            </div>
            <h3 className="rl-empty-title">No risks found</h3>
            <p className="rl-empty-subtitle">Everything looks good! 🎉</p>
            <button onClick={() => navigate('/risks/new')} className="rl-empty-btn">
              <Plus className="rl-btn-icon" />
              Add Risk
            </button>
          </div>
        ) : (
          <div className="rl-list">
            {risks.map((risk) => (
              <div key={risk._id} className="rl-card">
                <div className="rl-card-header" onClick={() => toggleExpand(risk._id)}>
                  <div className="rl-card-left">
                    <div className="rl-expand-btn">
                      {expanded[risk._id] ? (
                        <ChevronDown className="rl-expand-icon" />
                      ) : (
                        <ChevronRight className="rl-expand-icon" />
                      )}
                    </div>

                    <div className={`rl-card-severity ${getSeverityColor(risk.severity)}`}>
                      {getSeverityIcon(risk.severity)}
                    </div>

                    <div className="rl-card-info">
                      <div className="rl-card-title-row">
                        <h4 className="rl-card-title">{risk.name}</h4>
                        <span className={`rl-card-status ${getStatusColor(risk.status)}`}>
                          {getStatusLabel(risk.status)}
                        </span>
                        <span className={`rl-card-type ${getTypeBadge(risk.type)}`}>
                          {risk.type}
                        </span>
                        <span className="rl-card-score">Score: {risk.riskScore}</span>
                      </div>

                      <p className="rl-card-description">{risk.description}</p>

                      <div className="rl-card-meta">
                        <span className="rl-card-meta-item">
                          <Tag className="rl-card-meta-icon" />
                          Impact: <span className={`rl-card-meta-badge ${getImpactBadge(risk.impact)}`}>
                            {risk.impact}
                          </span>
                        </span>
                        <span className="rl-card-meta-item">
                          Likelihood: {getLikelihoodLabel(risk.likelihood)}
                        </span>
                        <span className="rl-card-meta-item">
                          <Calendar className="rl-card-meta-icon" />
                          {new Date(risk.detectedAt).toLocaleDateString()}
                        </span>
                        {risk.assignedTo && (
                          <span className="rl-card-meta-item">
                            <Users className="rl-card-meta-icon" />
                            {risk.assignedTo.firstName} {risk.assignedTo.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rl-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleViewRisk(risk._id)} className="rl-action-btn rl-action-view" title="View">
                      <Eye className="rl-action-icon" />
                    </button>
                    <button onClick={() => handleEditRisk(risk._id)} className="rl-action-btn rl-action-edit" title="Edit">
                      <Edit className="rl-action-icon" />
                    </button>
                    <button onClick={() => handleDeleteRisk(risk._id)} className="rl-action-btn rl-action-delete" title="Delete">
                      <Trash2 className="rl-action-icon" />
                    </button>
                    {risk.status === 'detected' && (
                      <button onClick={() => handleMitigate(risk._id)} className="rl-action-mitigate">
                        Mitigate
                      </button>
                    )}
                    {risk.status === 'in_progress' && (
                      <button onClick={() => handleResolve(risk._id)} className="rl-action-resolve">
                        Resolve
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded[risk._id] && (
                  <div className="rl-card-expanded">
                    <div className="rl-expanded-content">
                      <div className="rl-expanded-grid">
                        <div className="rl-expanded-section">
                          <h5 className="rl-expanded-label">Risk Details</h5>
                          <div className="rl-expanded-details">
                            <div className="rl-expanded-item">
                              <span className="rl-expanded-key">Type</span>
                              <span className={`rl-expanded-value ${getTypeBadge(risk.type)}`}>{risk.type}</span>
                            </div>
                            <div className="rl-expanded-item">
                              <span className="rl-expanded-key">Severity</span>
                              <span className={`rl-expanded-value ${getSeverityColor(risk.severity)}`}>{risk.severity}</span>
                            </div>
                            <div className="rl-expanded-item">
                              <span className="rl-expanded-key">Impact</span>
                              <span className={`rl-expanded-value ${getImpactBadge(risk.impact)}`}>{risk.impact}</span>
                            </div>
                            <div className="rl-expanded-item">
                              <span className="rl-expanded-key">Likelihood</span>
                              <span className="rl-expanded-value">{getLikelihoodLabel(risk.likelihood)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="rl-expanded-section">
                          <h5 className="rl-expanded-label">Mitigation Plan</h5>
                          <p className="rl-expanded-text">
                            {risk.mitigationPlan || 'No mitigation plan defined'}
                          </p>
                          {risk.status === 'detected' && (
                            <button onClick={() => handleMitigate(risk._id)} className="rl-expanded-btn rl-expanded-btn-primary">
                              <Activity className="rl-btn-icon" />
                              Start Mitigation
                            </button>
                          )}
                          {risk.status === 'in_progress' && (
                            <button onClick={() => handleResolve(risk._id)} className="rl-expanded-btn rl-expanded-btn-success">
                              <CheckCircle className="rl-btn-icon" />
                              Resolve Risk
                            </button>
                          )}
                          {risk.status === 'mitigated' && (
                            <span className="rl-expanded-status">✓ Mitigated - Awaiting confirmation</span>
                          )}
                          {risk.status === 'resolved' && (
                            <span className="rl-expanded-status rl-expanded-status-resolved">✓ Resolved successfully</span>
                          )}
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

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .rl-container {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: rlFadeIn 0.4s ease;
        }

        @keyframes rlFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .rl-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .rl-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #ef4444;
          border-radius: 50%;
          animation: rlSpin 0.8s linear infinite;
        }

        @keyframes rlSpin {
          to { transform: rotate(360deg); }
        }

        .rl-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .rl-spin {
          animation: rlSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .rl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .rl-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .rl-header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
        }

        .rl-header-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .rl-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .rl-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .rl-count {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 14px;
          border-radius: 12px;
        }

        .rl-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rl-icon-btn {
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

        .rl-icon-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .rl-icon-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rl-refresh-icon {
          width: 16px;
          height: 16px;
        }

        .rl-btn-icon {
          width: 16px;
          height: 16px;
        }

        .rl-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
        }

        .rl-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .rl-filters {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .rl-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .rl-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .rl-search-input {
          width: 100%;
          padding: 8px 36px 8px 36px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
        }

        .rl-search-input:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .rl-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }

        .rl-search-clear:hover {
          background: #f1f5f9;
        }

        .rl-search-clear-icon {
          width: 14px;
          height: 14px;
        }

        .rl-filter-select {
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

        .rl-filter-select:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .rl-sort-wrapper {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rl-sort-btn {
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

        .rl-sort-btn:hover {
          background: #f1f5f9;
        }

        .rl-sort-icon {
          width: 16px;
          height: 16px;
        }

        .rl-clear-btn {
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

        .rl-clear-btn:hover {
          background: #e2e8f0;
        }

        .rl-clear-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           LIST
           ============================================ */
        .rl-list-container {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .rl-list {
          divide-y: 1px solid #e2e8f0;
        }

        .rl-card {
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.2s ease;
        }

        .rl-card:last-child {
          border-bottom: none;
        }

        .rl-card:hover {
          background: #fafafa;
        }

        .rl-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px 20px;
          cursor: pointer;
          gap: 12px;
        }

        .rl-card-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .rl-expand-btn {
          margin-top: 2px;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .rl-expand-btn:hover {
          background: #f1f5f9;
        }

        .rl-expand-icon {
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .rl-card-severity {
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rl-severity-critical { background: #ef4444; color: #ffffff; }
        .rl-severity-high { background: #f97316; color: #ffffff; }
        .rl-severity-medium { background: #eab308; color: #ffffff; }
        .rl-severity-low { background: #22c55e; color: #ffffff; }
        .rl-severity-default { background: #94a3b8; color: #ffffff; }

        .rl-icon {
          width: 20px;
          height: 20px;
        }

        .rl-card-info {
          flex: 1;
          min-width: 0;
        }

        .rl-card-title-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .rl-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .rl-card-status {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .rl-status-detected { background: #fef3c7; color: #92400e; }
        .rl-status-progress { background: #dbeafe; color: #1d4ed8; }
        .rl-status-mitigated { background: #f3e8ff; color: #6d28d9; }
        .rl-status-resolved { background: #d1fae5; color: #065f46; }
        .rl-status-ignored { background: #f1f5f9; color: #475569; }
        .rl-status-default { background: #f1f5f9; color: #475569; }

        .rl-card-type {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .rl-type-security { background: #fee2e2; color: #991b1b; }
        .rl-type-operational { background: #dbeafe; color: #1d4ed8; }
        .rl-type-compliance { background: #f3e8ff; color: #6d28d9; }
        .rl-type-financial { background: #d1fae5; color: #065f46; }
        .rl-type-strategic { background: #fef3c7; color: #92400e; }
        .rl-type-default { background: #f1f5f9; color: #475569; }

        .rl-card-score {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
        }

        .rl-card-description {
          font-size: 14px;
          color: #64748b;
          margin: 6px 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rl-card-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 6px;
          font-size: 12px;
          color: #64748b;
        }

        .rl-card-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rl-card-meta-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }

        .rl-card-meta-badge {
          padding: 1px 8px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
        }

        .rl-impact-minimal { background: #d1fae5; color: #065f46; }
        .rl-impact-moderate { background: #fef3c7; color: #92400e; }
        .rl-impact-significant { background: #ffedd5; color: #9a3412; }
        .rl-impact-critical { background: #fee2e2; color: #991b1b; }
        .rl-impact-default { background: #f1f5f9; color: #475569; }

        .rl-card-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .rl-action-btn {
          padding: 6px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #94a3b8;
          display: flex;
          align-items: center;
        }

        .rl-action-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .rl-action-view:hover { background: #eff6ff; color: #3b82f6; }
        .rl-action-edit:hover { background: #ecfdf5; color: #22c55e; }
        .rl-action-delete:hover { background: #fef2f2; color: #ef4444; }

        .rl-action-icon {
          width: 16px;
          height: 16px;
        }

        .rl-action-mitigate {
          padding: 4px 12px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rl-action-mitigate:hover {
          background: #2563eb;
        }

        .rl-action-resolve {
          padding: 4px 12px;
          background: #22c55e;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rl-action-resolve:hover {
          background: #16a34a;
        }

        /* ============================================
           EXPANDED
           ============================================ */
        .rl-card-expanded {
          padding: 0 20px 16px 20px;
          margin-left: 40px;
        }

        .rl-expanded-content {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }

        .rl-expanded-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .rl-expanded-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rl-expanded-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        .rl-expanded-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 16px;
        }

        .rl-expanded-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rl-expanded-key {
          font-size: 11px;
          color: #94a3b8;
        }

        .rl-expanded-value {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          width: fit-content;
        }

        .rl-expanded-text {
          font-size: 14px;
          color: #475569;
          margin: 0;
          line-height: 1.5;
        }

        .rl-expanded-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          width: fit-content;
          margin-top: 4px;
        }

        .rl-expanded-btn-primary {
          background: #3b82f6;
          color: #ffffff;
        }

        .rl-expanded-btn-primary:hover {
          background: #2563eb;
        }

        .rl-expanded-btn-success {
          background: #22c55e;
          color: #ffffff;
        }

        .rl-expanded-btn-success:hover {
          background: #16a34a;
        }

        .rl-expanded-status {
          font-size: 14px;
          color: #64748b;
          padding: 4px 12px;
          background: #f1f5f9;
          border-radius: 6px;
          display: inline-block;
          width: fit-content;
        }

        .rl-expanded-status-resolved {
          background: #d1fae5;
          color: #065f46;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .rl-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }

        .rl-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .rl-empty-icon {
          width: 36px;
          height: 36px;
          color: #94a3b8;
        }

        .rl-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .rl-empty-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 16px 0;
        }

        .rl-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
        }

        .rl-empty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .rl-container {
            padding: 16px;
          }

          .rl-header {
            flex-direction: column;
            align-items: stretch;
          }

          .rl-header-right {
            flex-wrap: wrap;
          }

          .rl-add-btn {
            flex: 1;
            justify-content: center;
          }

          .rl-filters {
            flex-direction: column;
          }

          .rl-search-wrapper {
            width: 100%;
          }

          .rl-filter-select {
            width: 100%;
          }

          .rl-sort-wrapper {
            width: 100%;
          }

          .rl-sort-wrapper .rl-filter-select {
            flex: 1;
          }

          .rl-card-header {
            flex-direction: column;
          }

          .rl-card-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 4px;
          }

          .rl-expanded-grid {
            grid-template-columns: 1fr;
          }

          .rl-expanded-details {
            grid-template-columns: 1fr;
          }

          .rl-title {
            font-size: 22px;
          }

          .rl-header-icon {
            width: 40px;
            height: 40px;
          }

          .rl-header-svg {
            width: 20px;
            height: 20px;
          }

          .rl-card-expanded {
            margin-left: 0;
            padding: 0 16px 12px 16px;
          }
        }

        @media (max-width: 480px) {
          .rl-container {
            padding: 12px;
          }

          .rl-header-right {
            flex-direction: column;
          }

          .rl-add-btn {
            width: 100%;
          }

          .rl-icon-btn {
            align-self: flex-end;
          }

          .rl-title {
            font-size: 20px;
          }

          .rl-subtitle {
            font-size: 13px;
          }

          .rl-card-title-row {
            flex-wrap: wrap;
          }

          .rl-card-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default RiskList;