// components/goals/GoalHierarchy.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Target, ChevronRight, ChevronDown, Plus,
  Edit, Trash2, Eye, Users, Calendar,
  TrendingUp, AlertCircle, CheckCircle,
  Clock, RefreshCw, Search, Filter,
  Layers, Zap, Star, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const GoalHierarchy = () => {
  const { token } = useAuth();
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let hierarchyData = null;
      try {
        const response = await fetch(`${API_URL}/goals/hierarchy`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          hierarchyData = data.data;
        }
      } catch (err) {
        console.warn('API not available, using mock data');
        hierarchyData = getMockHierarchy();
      }

      setHierarchy(hierarchyData);
      if (hierarchyData) {
        setExpanded({ [hierarchyData._id]: true });
      }
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
      toast.error('Failed to load goal hierarchy');
      setHierarchy(getMockHierarchy());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockHierarchy = () => ({
    _id: 'root1',
    name: 'Company Goals 2024',
    description: 'Strategic goals for the year',
    level: 'company',
    status: 'in_progress',
    progress: 45,
    ownerId: { firstName: 'John', lastName: 'Doe' },
    endDate: '2024-12-31',
    children: [
      {
        _id: 'child1',
        name: 'Increase Revenue by 25%',
        description: 'Grow revenue through new clients and expansion',
        level: 'segment',
        status: 'on_track',
        progress: 65,
        ownerId: { firstName: 'Sarah', lastName: 'Smith' },
        endDate: '2024-10-15',
        children: [
          {
            _id: 'child1_1',
            name: 'Acquire 50 New Clients',
            description: 'Target new business clients',
            level: 'department',
            status: 'in_progress',
            progress: 40,
            ownerId: { firstName: 'Mike', lastName: 'Johnson' },
            endDate: '2024-09-30',
            children: []
          },
          {
            _id: 'child1_2',
            name: 'Expand to New Markets',
            description: 'Enter 3 new geographical markets',
            level: 'department',
            status: 'at_risk',
            progress: 25,
            ownerId: { firstName: 'Emma', lastName: 'Wilson' },
            endDate: '2024-11-01',
            children: []
          }
        ]
      },
      {
        _id: 'child2',
        name: 'Improve Customer Satisfaction',
        description: 'Increase CSAT to 95%',
        level: 'segment',
        status: 'in_progress',
        progress: 55,
        ownerId: { firstName: 'Lisa', lastName: 'Davis' },
        endDate: '2024-12-15',
        children: [
          {
            _id: 'child2_1',
            name: 'Reduce Response Time',
            description: 'Decrease support response time to < 2 hours',
            level: 'department',
            status: 'on_track',
            progress: 70,
            ownerId: { firstName: 'David', lastName: 'Brown' },
            endDate: '2024-08-31',
            children: []
          }
        ]
      }
    ]
  });

  const handleRefresh = () => {
    fetchHierarchy(true);
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'not_started': 'gh-status-not-started',
      'in_progress': 'gh-status-in-progress',
      'on_track': 'gh-status-on-track',
      'at_risk': 'gh-status-at-risk',
      'behind': 'gh-status-behind',
      'completed': 'gh-status-completed'
    };
    return colors[status] || 'gh-status-default';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="gh-status-icon gh-icon-green" />;
    if (status === 'at_risk' || status === 'behind') return <AlertCircle className="gh-status-icon gh-icon-red" />;
    if (status === 'on_track') return <TrendingUp className="gh-status-icon gh-icon-green" />;
    if (status === 'in_progress') return <Zap className="gh-status-icon gh-icon-blue" />;
    return <Clock className="gh-status-icon gh-icon-gray" />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'not_started': 'Not Started',
      'in_progress': 'In Progress',
      'on_track': 'On Track',
      'at_risk': 'At Risk',
      'behind': 'Behind',
      'completed': 'Completed'
    };
    return labels[status] || status;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'gh-progress-green';
    if (progress >= 60) return 'gh-progress-blue';
    if (progress >= 40) return 'gh-progress-yellow';
    return 'gh-progress-red';
  };

  const getLevelLabel = (level) => {
    const labels = {
      'company': '🏢 Company',
      'segment': '📊 Segment',
      'department': '🏛️ Department',
      'team': '👥 Team',
      'individual': '👤 Individual'
    };
    return labels[level] || level;
  };

  const filterNode = (node) => {
    if (!node) return null;
    
    const matchesSearch = node.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel === 'all' || node.level === filterLevel;
    
    let filteredChildren = [];
    if (node.children) {
      filteredChildren = node.children
        .map(child => filterNode(child))
        .filter(Boolean);
    }
    
    if (matchesSearch && matchesLevel) {
      return { ...node, children: filteredChildren };
    }
    
    if (filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }
    
    return null;
  };

  const renderNode = (node, level = 0) => {
    if (!node) return null;
    
    const isExpanded = expanded[node._id];
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedGoal === node._id;
    const statusClass = getStatusColor(node.status);

    return (
      <div key={node._id} className={`gh-node gh-level-${level}`} style={{ animationDelay: `${level * 0.05}s` }}>
        <div 
          className={`gh-node-content ${isSelected ? 'gh-node-selected' : ''} ${statusClass}`}
          onClick={() => {
            if (hasChildren) toggleExpand(node._id);
            setSelectedGoal(node._id);
          }}
        >
          <div className="gh-node-left">
            {hasChildren && (
              <button 
                className="gh-node-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node._id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="gh-toggle-icon" />
                ) : (
                  <ChevronRight className="gh-toggle-icon" />
                )}
              </button>
            )}
            
            <div className="gh-node-icon-wrapper">
              {getStatusIcon(node.status)}
            </div>
            
            <div className="gh-node-info">
              <div className="gh-node-header">
                <span className="gh-node-name">{node.name}</span>
                <span className={`gh-node-status ${statusClass}`}>
                  {getStatusLabel(node.status)}
                </span>
                <span className="gh-node-level">{getLevelLabel(node.level)}</span>
              </div>
              <div className="gh-node-meta">
                <span className="gh-node-owner">
                  <Users className="gh-meta-icon" />
                  {node.ownerId?.firstName || 'Unassigned'}
                </span>
                <span className="gh-node-date">
                  <Calendar className="gh-meta-icon" />
                  {node.endDate ? new Date(node.endDate).toLocaleDateString() : 'No date'}
                </span>
                {node.description && (
                  <span className="gh-node-desc">{node.description}</span>
                )}
              </div>
            </div>
          </div>

          <div className="gh-node-right">
            <div className="gh-node-progress">
              <div className="gh-progress-bar">
                <div 
                  className={`gh-progress-fill ${getProgressColor(node.progress)}`}
                  style={{ width: `${node.progress}%` }}
                />
              </div>
              <span className="gh-progress-text">{node.progress}%</span>
            </div>

            <div className="gh-node-actions">
              <button className="gh-action-btn gh-action-view" title="View">
                <Eye className="gh-action-icon" />
              </button>
              <button className="gh-action-btn gh-action-edit" title="Edit">
                <Edit className="gh-action-icon" />
              </button>
              <button className="gh-action-btn gh-action-delete" title="Delete">
                <Trash2 className="gh-action-icon" />
              </button>
            </div>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="gh-children">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredHierarchy = filterNode(hierarchy);
  const totalGoals = countNodes(hierarchy);
  const completedGoals = countNodesByStatus(hierarchy, 'completed');

  function countNodes(node) {
    if (!node) return 0;
    let count = 1;
    if (node.children) {
      node.children.forEach(child => count += countNodes(child));
    }
    return count;
  }

  function countNodesByStatus(node, status) {
    if (!node) return 0;
    let count = node.status === status ? 1 : 0;
    if (node.children) {
      node.children.forEach(child => count += countNodesByStatus(child, status));
    }
    return count;
  }

  if (loading) {
    return (
      <div className="gh-loading">
        <div className="gh-loading-spinner"></div>
        <p className="gh-loading-text">Loading goal hierarchy...</p>
      </div>
    );
  }

  return (
    <>
      <div className="gh-container">
        {/* Header */}
        <div className="gh-header">
          <div className="gh-header-left">
            <div className="gh-title-wrapper">
              <div className="gh-title-icon">
                <Layers className="gh-title-svg" />
              </div>
              <div>
                <h2 className="gh-title">Goal Hierarchy</h2>
                <p className="gh-subtitle">Visual representation of goal structure</p>
              </div>
            </div>
          </div>
          <div className="gh-header-right">
            <div className="gh-stats">
              <span className="gh-stat">
                <Target className="gh-stat-icon" />
                {totalGoals} Goals
              </span>
              <span className="gh-stat">
                <CheckCircle className="gh-stat-icon gh-icon-green" />
                {completedGoals} Completed
              </span>
            </div>
            <button className="gh-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`gh-refresh-icon ${refreshing ? 'gh-spin' : ''}`} />
            </button>
            <button className="gh-create-btn">
              <Plus className="gh-btn-icon" />
              New Goal
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="gh-filters">
          <div className="gh-search-wrapper">
            <Search className="gh-search-icon" />
            <input
              type="text"
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gh-search-input"
            />
          </div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="gh-filter-select"
          >
            <option value="all">All Levels</option>
            <option value="company">Company</option>
            <option value="segment">Segment</option>
            <option value="department">Department</option>
            <option value="team">Team</option>
            <option value="individual">Individual</option>
          </select>
        </div>

        {/* Hierarchy */}
        <div className="gh-tree">
          {filteredHierarchy ? (
            renderNode(filteredHierarchy)
          ) : (
            <div className="gh-empty">
              <div className="gh-empty-icon-wrapper">
                <Target className="gh-empty-icon" />
              </div>
              <h3 className="gh-empty-title">No Goals Found</h3>
              <p className="gh-empty-subtitle">
                {searchTerm || filterLevel !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first goal to get started'}
              </p>
              {!searchTerm && filterLevel === 'all' && (
                <button className="gh-empty-btn">
                  <Plus className="gh-btn-icon" />
                  Create Goal
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .gh-container {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          animation: ghFadeIn 0.4s ease;
          transition: all 0.3s ease;
        }

        .gh-container:hover {
          border-color: #013E37;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }

        @keyframes ghFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .gh-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 0;
          gap: 16px;
        }

        .gh-loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: ghSpin 0.8s linear infinite;
        }

        .gh-loading-text {
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes ghSpin {
          to { transform: rotate(360deg); }
        }

        .gh-spin {
          animation: ghSpin 1s linear infinite;
        }

        /* ============================================
           HEADER
           ============================================ */
        .gh-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .gh-header-left {
          display: flex;
          align-items: center;
        }

        .gh-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .gh-title-icon {
          width: 44px;
          height: 44px;
          background: #013E37;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.2);
        }

        .gh-title-svg {
          width: 22px;
          height: 22px;
          color: #FFEFB3;
        }

        .gh-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .gh-subtitle {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }

        .gh-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .gh-stats {
          display: flex;
          gap: 16px;
          padding: 6px 14px;
          background: #FFEFB3;
          border-radius: 8px;
        }

        .gh-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
        }

        .gh-stat-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.6;
        }

        .gh-icon-green { color: #0A5C54; }
        .gh-icon-red { color: #EF4444; }
        .gh-icon-blue { color: #013E37; }
        .gh-icon-gray { color: #013E37; opacity: 0.3; }

        .gh-refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
        }

        .gh-refresh-btn:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .gh-refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .gh-refresh-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .gh-create-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(1, 62, 55, 0.25);
        }

        .gh-create-btn:hover {
          background: #0A5C54;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
        }

        .gh-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           FILTERS
           ============================================ */
        .gh-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .gh-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .gh-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.4;
        }

        .gh-search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          color: #013E37;
          transition: all 0.3s ease;
        }

        .gh-search-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .gh-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }

        .gh-filter-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #013E37;
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 140px;
        }

        .gh-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .gh-filter-select:hover {
          border-color: #013E37;
        }

        /* ============================================
           TREE
           ============================================ */
        .gh-tree {
          margin-top: 4px;
        }

        .gh-node {
          position: relative;
          margin-bottom: 8px;
          animation: ghSlideUp 0.3s ease both;
          opacity: 0;
        }

        .gh-node:nth-child(1) { animation-delay: 0.05s; }
        .gh-node:nth-child(2) { animation-delay: 0.1s; }
        .gh-node:nth-child(3) { animation-delay: 0.15s; }
        .gh-node:nth-child(4) { animation-delay: 0.2s; }

        @keyframes ghSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gh-node:last-child {
          margin-bottom: 0;
        }

        .gh-level-1 { margin-left: 32px; }
        .gh-level-2 { margin-left: 64px; }
        .gh-level-3 { margin-left: 96px; }
        .gh-level-4 { margin-left: 128px; }

        .gh-node-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #FFEFB3;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          gap: 12px;
          flex-wrap: wrap;
        }

        .gh-node-content:hover {
          border-color: #013E37;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.08);
          transform: translateX(2px);
        }

        .gh-node-selected {
          background: #FFF9E6;
          border-color: #013E37;
          box-shadow: 0 0 0 2px rgba(1, 62, 55, 0.1);
        }

        .gh-node-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .gh-node-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #013E37;
          opacity: 0.4;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .gh-node-toggle:hover {
          opacity: 1;
        }

        .gh-toggle-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .gh-node-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gh-status-icon {
          width: 18px;
          height: 18px;
        }

        .gh-node-info {
          flex: 1;
          min-width: 0;
        }

        .gh-node-header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .gh-node-name {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
        }

        .gh-node-status {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .gh-node-status:hover {
          transform: scale(1.05);
        }

        .gh-status-not-started { background: #FFEFB3; color: #013E37; }
        .gh-status-in-progress { background: #013E37; color: #FFEFB3; }
        .gh-status-on-track { background: #0A5C54; color: #FFEFB3; }
        .gh-status-at-risk { background: #FFEFB3; color: #013E37; }
        .gh-status-behind { background: #FEE2E2; color: #991B1B; }
        .gh-status-completed { background: #013E37; color: #FFEFB3; }

        .gh-node-level {
          font-size: 11px;
          font-weight: 500;
          color: #013E37;
          background: #FFEFB3;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .gh-node-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
          flex-wrap: wrap;
        }

        .gh-node-owner {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .gh-node-date {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .gh-node-desc {
          opacity: 0.5;
          font-style: italic;
        }

        .gh-meta-icon {
          width: 14px;
          height: 14px;
          color: #013E37;
          opacity: 0.4;
        }

        .gh-node-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .gh-node-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 100px;
        }

        .gh-progress-bar {
          flex: 1;
          height: 4px;
          background: #FFEFB3;
          border-radius: 4px;
          overflow: hidden;
          min-width: 60px;
        }

        .gh-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .gh-progress-green { background: #013E37; }
        .gh-progress-blue { background: #0A5C54; }
        .gh-progress-yellow { background: #FFEFB3; }
        .gh-progress-red { background: #EF4444; }

        .gh-progress-text {
          font-size: 12px;
          font-weight: 600;
          color: #013E37;
          min-width: 36px;
        }

        .gh-node-actions {
          display: flex;
          gap: 2px;
        }

        .gh-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.3;
        }

        .gh-action-btn:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }

        .gh-action-view:hover { background: #FFEFB3; color: #013E37; }
        .gh-action-edit:hover { background: #FFEFB3; color: #013E37; }
        .gh-action-delete:hover { background: #FEE2E2; color: #EF4444; }

        .gh-action-icon {
          width: 14px;
          height: 14px;
        }

        /* Children */
        .gh-children {
          margin-top: 8px;
          padding-left: 24px;
          border-left: 2px solid #FFEFB3;
          animation: ghSlideDown 0.3s ease;
        }

        @keyframes ghSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .gh-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }

        .gh-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #FFEFB3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .gh-empty-icon {
          width: 36px;
          height: 36px;
          color: #013E37;
          opacity: 0.5;
        }

        .gh-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .gh-empty-subtitle {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 4px 0 16px 0;
        }

        .gh-empty-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(1, 62, 55, 0.25);
        }

        .gh-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .gh-level-2 { margin-left: 48px; }
          .gh-level-3 { margin-left: 72px; }
          .gh-level-4 { margin-left: 96px; }
        }

        @media (max-width: 768px) {
          .gh-container {
            padding: 16px;
          }

          .gh-header {
            flex-direction: column;
            align-items: stretch;
          }

          .gh-header-right {
            flex-wrap: wrap;
          }

          .gh-stats {
            flex: 1;
            justify-content: center;
          }

          .gh-create-btn {
            flex: 1;
            justify-content: center;
          }

          .gh-filters {
            flex-direction: column;
          }

          .gh-search-wrapper {
            width: 100%;
          }

          .gh-filter-select {
            width: 100%;
          }

          .gh-node-content {
            flex-direction: column;
            align-items: stretch;
            padding: 12px;
          }

          .gh-node-left {
            flex-wrap: wrap;
          }

          .gh-node-right {
            justify-content: space-between;
            width: 100%;
          }

          .gh-node-progress {
            flex: 1;
          }

          .gh-node-actions {
            justify-content: flex-end;
          }

          .gh-children {
            padding-left: 12px;
          }

          .gh-level-1 { margin-left: 16px; }
          .gh-level-2 { margin-left: 32px; }
          .gh-level-3 { margin-left: 48px; }
          .gh-level-4 { margin-left: 64px; }

          .gh-title-wrapper {
            gap: 10px;
          }

          .gh-title-icon {
            width: 38px;
            height: 38px;
          }

          .gh-title-svg {
            width: 18px;
            height: 18px;
          }

          .gh-title {
            font-size: 18px;
          }

          .gh-node-name {
            font-size: 13px;
          }

          .gh-node-meta {
            font-size: 11px;
            gap: 8px;
          }
        }

        @media (max-width: 480px) {
          .gh-container {
            padding: 12px;
          }

          .gh-header-right {
            flex-direction: column;
          }

          .gh-stats {
            width: 100%;
            justify-content: center;
          }

          .gh-create-btn {
            width: 100%;
          }

          .gh-refresh-btn {
            align-self: flex-end;
          }

          .gh-node-content {
            padding: 10px;
          }

          .gh-node-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .gh-node-actions {
            gap: 4px;
          }

          .gh-progress-text {
            min-width: 28px;
            font-size: 11px;
          }

          .gh-node-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .gh-empty-icon-wrapper {
            width: 60px;
            height: 60px;
          }

          .gh-empty-icon {
            width: 28px;
            height: 28px;
          }

          .gh-empty-title {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default GoalHierarchy;