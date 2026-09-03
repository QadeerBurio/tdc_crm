// Hierarchy.jsx - Modern Design with #013E37, #FFEFB3, White
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { 
  Building2, Layers, Users, UserPlus, 
  ChevronRight, ChevronDown, Plus, Edit, Trash2,
  Search, Grid3x3, List, LayoutGrid,
  Activity, CheckCircle, Users as UsersIcon,
  RefreshCw, Sparkles, Zap, Shield, TrendingUp,
  Award, Star, Crown, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

// X icon component
const X = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Hierarchy = () => {
  const { token } = useContext(AuthContext);
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('tree');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [newNodeData, setNewNodeData] = useState({
    name: '',
    type: 'company',
    parentId: null,
    description: '',
    status: 'active'
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  // Find node in hierarchy
  const findNode = (node, id) => {
    if (!node) return null;
    if (node._id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  // Fetch hierarchy with cache-busting
  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const headers = token ? { 
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      } : {};
      
      const response = await axios.get(`${API_URL}/organization/hierarchy?t=${Date.now()}`, { headers });
      
      const data = response.data.data;
      if (Array.isArray(data) && data.length > 0) {
        setHierarchy({
          _id: 'virtual-root',
          name: 'All Companies',
          type: 'root',
          children: data,
          members: []
        });
      } else if (data && !Array.isArray(data)) {
        setHierarchy(data);
      } else {
        setHierarchy(null);
      }
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
      toast.error('Failed to load organization hierarchy');
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh
  const handleRefresh = async () => {
    toast.loading('Refreshing...');
    await fetchHierarchy();
    toast.dismiss();
    toast.success('Hierarchy refreshed');
  };

  // Add Node
  const handleAddNode = async () => {
    try {
      if (!newNodeData.name.trim()) {
        toast.error('Please enter a name');
        return;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(
        `${API_URL}/organization/nodes`,
        newNodeData,
        { headers }
      );
      
      if (response.data.success) {
        toast.success(`${newNodeData.type} created successfully`);
        setShowAddModal(false);
        setNewNodeData({ name: '', type: 'company', parentId: null, description: '', status: 'active' });
        await fetchHierarchy();
      }
    } catch (error) {
      console.error('Error adding node:', error);
      toast.error(error.response?.data?.message || 'Failed to create node');
    }
  };

  // Edit Node
  const handleEditNode = async () => {
    try {
      if (!editingNode || !editingNode.name.trim()) {
        toast.error('Please enter a name');
        return;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.put(
        `${API_URL}/organization/nodes/${editingNode._id}`,
        { name: editingNode.name, description: editingNode.description, status: editingNode.status },
        { headers }
      );
      
      if (response.data.success) {
        toast.success('Node updated successfully');
        setShowEditModal(false);
        setEditingNode(null);
        await fetchHierarchy();
      }
    } catch (error) {
      console.error('Error updating node:', error);
      toast.error(error.response?.data?.message || 'Failed to update node');
    }
  };

  // Delete Node
  const handleDeleteNode = async (nodeId) => {
    if (!window.confirm('Are you sure you want to delete this node and all its children?')) return;

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.delete(`${API_URL}/organization/nodes/${nodeId}`, { headers });
      
      if (response.data.success) {
        toast.success('Node deleted successfully');
        await fetchHierarchy();
      }
    } catch (error) {
      console.error('Error deleting node:', error);
      toast.error(error.response?.data?.message || 'Failed to delete node');
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const expandAllNodes = (node) => {
      if (!node) return {};
      let result = { [node._id]: true };
      if (node.children) {
        node.children.forEach(child => {
          result = { ...result, ...expandAllNodes(child) };
        });
      }
      return result;
    };
    if (hierarchy) {
      setExpanded(expandAllNodes(hierarchy));
    }
  };

  const collapseAll = () => {
    setExpanded({});
  };

  const getNodeStats = (node) => {
    if (!node) return { totalMembers: 0, totalChildren: 0, activeChildren: 0 };
    
    let totalMembers = node.members?.length || 0;
    let totalChildren = 0;
    let activeChildren = 0;

    const countChildren = (n) => {
      if (!n) return;
      if (n.children) {
        n.children.forEach(child => {
          totalChildren++;
          if (child.status === 'active') activeChildren++;
          countChildren(child);
        });
      }
    };
    countChildren(node);

    return { totalMembers, totalChildren, activeChildren };
  };

  // Helper functions
  const countAllNodes = (node) => {
    if (!node) return 0;
    let count = 1;
    if (node.children) {
      node.children.forEach(child => {
        count += countAllNodes(child);
      });
    }
    return count;
  };

  const getTotalMembers = (node) => {
    if (!node) return 0;
    let count = node.members?.length || 0;
    if (node.children) {
      node.children.forEach(child => {
        count += getTotalMembers(child);
      });
    }
    return count;
  };

  const getActiveNodes = (node) => {
    if (!node) return 0;
    let count = node.status === 'active' ? 1 : 0;
    if (node.children) {
      node.children.forEach(child => {
        count += getActiveNodes(child);
      });
    }
    return count;
  };

  const getMaxDepth = (node, depth = 0) => {
    if (!node) return depth;
    let maxDepth = depth;
    if (node.children) {
      node.children.forEach(child => {
        const childDepth = getMaxDepth(child, depth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      });
    }
    return maxDepth;
  };

  // Filter nodes by search term
  const filterNodes = (node, term) => {
    if (!term) return true;
    const searchLower = term.toLowerCase();
    if (node.name?.toLowerCase().includes(searchLower)) return true;
    if (node.description?.toLowerCase().includes(searchLower)) return true;
    if (node.type?.toLowerCase().includes(searchLower)) return true;
    if (node.children) {
      return node.children.some(child => filterNodes(child, term));
    }
    return false;
  };

  // Get node color
  const getNodeColor = (type) => {
    const colors = {
      company: { border: '#013E37', bg: '#FFEFB3', text: '#013E37', light: 'rgba(1, 62, 55, 0.08)' },
      segment: { border: '#013E37', bg: '#FFEFB3', text: '#013E37', light: 'rgba(1, 62, 55, 0.08)' },
      department: { border: '#013E37', bg: '#FFEFB3', text: '#013E37', light: 'rgba(1, 62, 55, 0.08)' },
      team: { border: '#013E37', bg: '#FFEFB3', text: '#013E37', light: 'rgba(1, 62, 55, 0.08)' },
      root: { border: '#013E37', bg: '#FFEFB3', text: '#013E37', light: 'rgba(1, 62, 55, 0.08)' }
    };
    return colors[type] || colors.company;
  };

  const getNodeIcon = (type) => {
    const icons = {
      company: Building2,
      segment: Layers,
      department: Users,
      team: UserPlus,
      root: Building2
    };
    return icons[type] || Building2;
  };

  // Render Node
  const renderNode = (node, level = 0) => {
    if (!node) return null;
    
    if (searchTerm && !filterNodes(node, searchTerm)) return null;
    
    const isExpanded = expanded[node._id];
    const hasChildren = node.children && node.children.length > 0;
    const stats = getNodeStats(node);
    const isSelected = selectedNode?._id === node._id;
    const isHovered = hoveredNode === node._id;
    const color = getNodeColor(node.type);
    const Icon = getNodeIcon(node.type);

    const statusColors = {
      active: { bg: '#013E37', text: '#FFFFFF' },
      inactive: { bg: '#FFEFB3', text: '#013E37' },
      pending: { bg: '#FFEFB3', text: '#013E37' },
      archived: { bg: '#FFEBEE', text: '#D32F2F' }
    };

    const status = statusColors[node.status] || statusColors.active;

    // Cards View
    if (viewMode === 'cards') {
      return (
        <div 
          key={node._id} 
          className="hierarchy-card-wrapper" 
          style={{ animationDelay: `${level * 0.05}s` }}
        >
          <div 
            className={`hierarchy-card ${isSelected ? 'hierarchy-card-selected' : ''}`}
            style={{ 
              borderLeft: `4px solid ${color.border}`,
              borderColor: isSelected ? color.border : '#FFEFB3'
            }}
            onClick={() => setSelectedNode(node)}
            onMouseEnter={() => setHoveredNode(node._id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <div className="hierarchy-card-inner">
              <div className="hierarchy-card-header">
                <div className="hierarchy-card-header-left">
                  <div className="hierarchy-icon-wrapper" style={{ backgroundColor: color.bg }}>
                    <Icon className="hierarchy-icon" style={{ color: color.text }} />
                  </div>
                  <div>
                    <h3 className="hierarchy-card-title">{node.name}</h3>
                    <span className="hierarchy-type-badge" style={{ backgroundColor: color.light, color: color.text }}>
                      {node.type}
                    </span>
                  </div>
                </div>
                <div className="hierarchy-card-actions">
                  <span className="hierarchy-status-badge" style={{ backgroundColor: status.bg, color: status.text }}>
                    {node.status || 'active'}
                  </span>
                  {node.type !== 'root' && (
                    <>
                      <button 
                        className="hierarchy-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNode(node);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="hierarchy-action-icon" />
                      </button>
                      <button 
                        className="hierarchy-action-btn hierarchy-action-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node._id);
                        }}
                      >
                        <Trash2 className="hierarchy-action-icon" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {node.description && (
                <p className="hierarchy-card-desc">{node.description}</p>
              )}
              
              <div className="hierarchy-card-stats">
                <div className="hierarchy-stat-item">
                  <UsersIcon className="hierarchy-stat-icon" color="#013E37" />
                  <span>{stats.totalMembers} members</span>
                </div>
                <div className="hierarchy-stat-item">
                  <Layers className="hierarchy-stat-icon" color="#013E37" />
                  <span>{stats.totalChildren} sub-items</span>
                </div>
                <div className="hierarchy-stat-item">
                  <CheckCircle className="hierarchy-stat-icon" color="#013E37" />
                  <span>{stats.activeChildren} active</span>
                </div>
              </div>

              {hasChildren && (
                <button
                  className="hierarchy-toggle-children"
                  style={{ color: color.text }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(node._id);
                  }}
                >
                  {isExpanded ? <ChevronDown className="hierarchy-toggle-icon" /> : <ChevronRight className="hierarchy-toggle-icon" />}
                  {isExpanded ? 'Hide' : 'Show'} children ({node.children.length})
                </button>
              )}

              {isHovered && node.type !== 'root' && (
                <div className="hierarchy-card-hover-indicator">
                  <ArrowRight size={18} />
                </div>
              )}
            </div>
          </div>
          
          {isExpanded && hasChildren && (
            <div className="hierarchy-children-grid">
              {node.children.map(child => renderNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // Compact View
    if (viewMode === 'compact') {
      return (
        <div key={node._id} className="hierarchy-compact-item">
          <div 
            className={`hierarchy-compact-row ${isSelected ? 'hierarchy-compact-selected' : ''}`}
            onClick={() => {
              setSelectedNode(node);
              if (hasChildren) toggleExpand(node._id);
            }}
          >
            {hasChildren && (
              <button 
                className="hierarchy-compact-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node._id);
                }}
              >
                {isExpanded ? <ChevronDown className="hierarchy-compact-toggle-icon" /> : <ChevronRight className="hierarchy-compact-toggle-icon" />}
              </button>
            )}
            {!hasChildren && <span className="hierarchy-compact-spacer" />}
            <Icon className="hierarchy-compact-icon" style={{ color: color.text }} />
            <span className="hierarchy-compact-name">{node.name}</span>
            <span className="hierarchy-compact-type">({node.type})</span>
            <span className="hierarchy-compact-status" style={{ backgroundColor: status.bg, color: status.text }}>
              {node.status || 'active'}
            </span>
            <span className="hierarchy-compact-members">{stats.totalMembers} members</span>
          </div>
          
          {isExpanded && hasChildren && (
            <div className="hierarchy-compact-children">
              {node.children.map(child => renderNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // Tree View (default)
    return (
      <div key={node._id} className="hierarchy-tree-item" style={{ animationDelay: `${level * 0.03}s` }}>
        <div 
          className={`hierarchy-tree-node ${isSelected ? 'hierarchy-tree-node-selected' : ''}`}
          style={{ 
            backgroundColor: isSelected ? color.bg : 'transparent',
            borderLeft: `4px solid ${isSelected ? color.border : 'transparent'}`
          }}
          onClick={() => {
            setSelectedNode(node);
            if (hasChildren) toggleExpand(node._id);
          }}
          onMouseEnter={() => setHoveredNode(node._id)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          {hasChildren && (
            <button 
              className="hierarchy-tree-toggle"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node._id);
              }}
            >
              {isExpanded ? <ChevronDown className="hierarchy-tree-toggle-icon" /> : <ChevronRight className="hierarchy-tree-toggle-icon" />}
            </button>
          )}
          {!hasChildren && <span className="hierarchy-tree-toggle-spacer" />}
          
          <div className="hierarchy-tree-icon-wrapper" style={{ backgroundColor: color.light }}>
            <Icon className="hierarchy-tree-icon" style={{ color: color.text }} />
          </div>
          
          <div className="hierarchy-tree-info">
            <div className="hierarchy-tree-name-row">
              <span className="hierarchy-tree-name">{node.name}</span>
              <span className="hierarchy-tree-type-badge" style={{ backgroundColor: color.bg, color: color.text }}>
                {node.type}
              </span>
              {node.status && (
                <span className="hierarchy-tree-status" style={{ backgroundColor: status.bg, color: status.text }}>
                  {node.status}
                </span>
              )}
            </div>
            {node.description && (
              <p className="hierarchy-tree-desc">{node.description}</p>
            )}
          </div>
          
          <div className="hierarchy-tree-stats">
            {node.members && node.members.length > 0 && (
              <div className="hierarchy-tree-stat">
                <UsersIcon className="hierarchy-tree-stat-icon" color="#013E37" />
                <span>{node.members.length}</span>
              </div>
            )}
            {stats.totalChildren > 0 && (
              <div className="hierarchy-tree-stat">
                <Layers className="hierarchy-tree-stat-icon" color="#013E37" />
                <span>{stats.totalChildren}</span>
              </div>
            )}
          </div>
          
          {node.type !== 'root' && (
            <div className="hierarchy-tree-actions">
              <button 
                className="hierarchy-tree-action"
                onClick={(e) => {
                  e.stopPropagation();
                  const childType = node.type === 'company' ? 'segment' :
                                   node.type === 'segment' ? 'department' :
                                   node.type === 'department' ? 'team' : 'team';
                  setNewNodeData({
                    name: '',
                    type: childType,
                    parentId: node._id,
                    description: '',
                    status: 'active'
                  });
                  setShowAddModal(true);
                }}
                title="Add child"
              >
                <Plus className="hierarchy-tree-action-icon" />
              </button>
              <button 
                className="hierarchy-tree-action"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingNode(node);
                  setShowEditModal(true);
                }}
                title="Edit"
              >
                <Edit className="hierarchy-tree-action-icon" />
              </button>
              <button 
                className="hierarchy-tree-action hierarchy-tree-action-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNode(node._id);
                }}
                title="Delete"
              >
                <Trash2 className="hierarchy-tree-action-icon" />
              </button>
            </div>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className="hierarchy-tree-children">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Add Modal
  const AddModal = () => (
    <div className="hierarchy-modal-overlay" onClick={() => setShowAddModal(false)}>
      <div className="hierarchy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hierarchy-modal-header">
          <h2 className="hierarchy-modal-title">
            <Plus className="hierarchy-modal-title-icon" />
            Create New {newNodeData.type}
          </h2>
          <button 
            onClick={() => setShowAddModal(false)}
            className="hierarchy-modal-close"
          >
            <X className="hierarchy-modal-close-icon" />
          </button>
        </div>
        
        <div className="hierarchy-modal-body">
          <div className="hierarchy-form-group">
            <label className="hierarchy-form-label">Name *</label>
            <input
              type="text"
              value={newNodeData.name}
              onChange={(e) => setNewNodeData({ ...newNodeData, name: e.target.value })}
              className="hierarchy-form-input"
              placeholder={`Enter ${newNodeData.type} name`}
              autoFocus
            />
          </div>
          
          <div className="hierarchy-form-group">
            <label className="hierarchy-form-label">Description</label>
            <textarea
              value={newNodeData.description}
              onChange={(e) => setNewNodeData({ ...newNodeData, description: e.target.value })}
              className="hierarchy-form-textarea"
              placeholder="Optional description"
              rows="2"
            />
          </div>
          
          <div className="hierarchy-form-group">
            <label className="hierarchy-form-label">Status</label>
            <select
              value={newNodeData.status}
              onChange={(e) => setNewNodeData({ ...newNodeData, status: e.target.value })}
              className="hierarchy-form-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          {newNodeData.parentId && hierarchy && (
            <div className="hierarchy-form-parent">
              Parent: <span className="hierarchy-form-parent-name">
                {findNode(hierarchy, newNodeData.parentId)?.name || 'Unknown'}
              </span>
            </div>
          )}
        </div>
        
        <div className="hierarchy-modal-footer">
          <button
            onClick={() => setShowAddModal(false)}
            className="hierarchy-modal-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleAddNode}
            className="hierarchy-modal-submit"
          >
            <Plus className="hierarchy-modal-submit-icon" />
            Create {newNodeData.type}
          </button>
        </div>
      </div>
    </div>
  );

  // Edit Modal
  const EditModal = () => (
    <div className="hierarchy-modal-overlay" onClick={() => setShowEditModal(false)}>
      <div className="hierarchy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hierarchy-modal-header">
          <h2 className="hierarchy-modal-title">
            <Edit className="hierarchy-modal-title-icon" />
            Edit {editingNode?.type}
          </h2>
          <button 
            onClick={() => setShowEditModal(false)}
            className="hierarchy-modal-close"
          >
            <X className="hierarchy-modal-close-icon" />
          </button>
        </div>
        
        {editingNode && (
          <div className="hierarchy-modal-body">
            <div className="hierarchy-form-group">
              <label className="hierarchy-form-label">Name *</label>
              <input
                type="text"
                value={editingNode.name}
                onChange={(e) => setEditingNode({ ...editingNode, name: e.target.value })}
                className="hierarchy-form-input"
              />
            </div>
            
            <div className="hierarchy-form-group">
              <label className="hierarchy-form-label">Description</label>
              <textarea
                value={editingNode.description || ''}
                onChange={(e) => setEditingNode({ ...editingNode, description: e.target.value })}
                className="hierarchy-form-textarea"
                rows="2"
              />
            </div>
            
            <div className="hierarchy-form-group">
              <label className="hierarchy-form-label">Status</label>
              <select
                value={editingNode.status || 'active'}
                onChange={(e) => setEditingNode({ ...editingNode, status: e.target.value })}
                className="hierarchy-form-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        )}
        
        <div className="hierarchy-modal-footer">
          <button
            onClick={() => setShowEditModal(false)}
            className="hierarchy-modal-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleEditNode}
            className="hierarchy-modal-submit"
          >
            <Edit className="hierarchy-modal-submit-icon" />
            Update
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="hierarchy-loading">
        <div className="hierarchy-loading-spinner"></div>
        <p className="hierarchy-loading-text">Loading organization structure...</p>
      </div>
    );
  }

  return (
    <>
      <div className="hierarchy-container">
        {/* Header */}
        <div className="hierarchy-header">
          <div className="hierarchy-header-inner">
            <div className="hierarchy-header-left">
              <div className="hierarchy-header-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
                <Building2 className="hierarchy-header-icon" color="#013E37" />
              </div>
              <div>
                <div className="hierarchy-header-title-row">
                  <h1 className="hierarchy-header-title">Organization Hierarchy</h1>
                  <span className="hierarchy-header-badge" style={{ backgroundColor: '#013E37', color: '#FFFFFF' }}>
                    {hierarchy ? countAllNodes(hierarchy) : 0} nodes
                  </span>
                </div>
                <p className="hierarchy-header-subtitle">
                  <Activity className="hierarchy-header-subtitle-icon" color="#013E37" />
                  View and manage your company structure
                </p>
              </div>
            </div>
            
            <div className="hierarchy-header-right">
              <button
                onClick={handleRefresh}
                className="hierarchy-refresh-btn"
                title="Refresh"
              >
                <RefreshCw className="hierarchy-refresh-icon" />
              </button>
              
              <div className="hierarchy-search-wrapper">
                <Search className="hierarchy-search-icon" color="#013E37" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="hierarchy-search-input"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hierarchy-search-clear"
                  >
                    <X className="hierarchy-search-clear-icon" />
                  </button>
                )}
              </div>
              
              <div className="hierarchy-view-toggle">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`hierarchy-view-btn ${viewMode === 'tree' ? 'hierarchy-view-active' : ''}`}
                  title="Tree View"
                >
                  <List className="hierarchy-view-icon" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`hierarchy-view-btn ${viewMode === 'cards' ? 'hierarchy-view-active' : ''}`}
                  title="Card View"
                >
                  <Grid3x3 className="hierarchy-view-icon" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`hierarchy-view-btn ${viewMode === 'compact' ? 'hierarchy-view-active' : ''}`}
                  title="Compact View"
                >
                  <LayoutGrid className="hierarchy-view-icon" />
                </button>
              </div>
              
              <button
                onClick={expandAll}
                className="hierarchy-expand-btn"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="hierarchy-collapse-btn"
              >
                Collapse All
              </button>
              <button 
                className="hierarchy-add-btn"
                onClick={() => {
                  setNewNodeData({ name: '', type: 'company', parentId: null, description: '', status: 'active' });
                  setShowAddModal(true);
                }}
              >
                <Plus className="hierarchy-add-icon" />
                Add Company
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="hierarchy-main">
          {/* Stats Bar */}
          {hierarchy && (
            <div className="hierarchy-stats">
              <div className="hierarchy-stat-card">
                <div className="hierarchy-stat-card-inner">
                  <div className="hierarchy-stat-icon-wrapper hierarchy-stat-blue" style={{ backgroundColor: '#FFEFB3' }}>
                    <Building2 className="hierarchy-stat-card-icon" color="#013E37" />
                  </div>
                  <div>
                    <p className="hierarchy-stat-value">{countAllNodes(hierarchy)}</p>
                    <p className="hierarchy-stat-label">Total Nodes</p>
                  </div>
                </div>
              </div>
              <div className="hierarchy-stat-card">
                <div className="hierarchy-stat-card-inner">
                  <div className="hierarchy-stat-icon-wrapper hierarchy-stat-green" style={{ backgroundColor: '#FFEFB3' }}>
                    <UsersIcon className="hierarchy-stat-card-icon" color="#013E37" />
                  </div>
                  <div>
                    <p className="hierarchy-stat-value">{getTotalMembers(hierarchy)}</p>
                    <p className="hierarchy-stat-label">Total Members</p>
                  </div>
                </div>
              </div>
              <div className="hierarchy-stat-card">
                <div className="hierarchy-stat-card-inner">
                  <div className="hierarchy-stat-icon-wrapper hierarchy-stat-purple" style={{ backgroundColor: '#FFEFB3' }}>
                    <CheckCircle className="hierarchy-stat-card-icon" color="#013E37" />
                  </div>
                  <div>
                    <p className="hierarchy-stat-value">{getActiveNodes(hierarchy)}</p>
                    <p className="hierarchy-stat-label">Active Nodes</p>
                  </div>
                </div>
              </div>
              <div className="hierarchy-stat-card">
                <div className="hierarchy-stat-card-inner">
                  <div className="hierarchy-stat-icon-wrapper hierarchy-stat-yellow" style={{ backgroundColor: '#FFEFB3' }}>
                    <Layers className="hierarchy-stat-card-icon" color="#013E37" />
                  </div>
                  <div>
                    <p className="hierarchy-stat-value">{getMaxDepth(hierarchy)}</p>
                    <p className="hierarchy-stat-label">Max Depth</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tree */}
          <div className="hierarchy-tree-container">
            {hierarchy ? (
              <div className="hierarchy-tree-content">
                {renderNode(hierarchy)}
              </div>
            ) : (
              <div className="hierarchy-empty">
                <div className="hierarchy-empty-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
                  <Building2 className="hierarchy-empty-icon" color="#013E37" />
                </div>
                <h3 className="hierarchy-empty-title">No Organization Structure</h3>
                <p className="hierarchy-empty-subtitle">Start by creating your company structure</p>
                <button 
                  className="hierarchy-empty-btn"
                  onClick={() => {
                    setNewNodeData({ name: '', type: 'company', parentId: null, description: '', status: 'active' });
                    setShowAddModal(true);
                  }}
                >
                  <Plus className="hierarchy-empty-btn-icon" />
                  Create Company
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="hierarchy-footer">
            <p>© 2024 Agency OS. All rights reserved.</p>
          </div>
        </div>

        {/* Modals */}
        {showAddModal && <AddModal />}
        {showEditModal && <EditModal />}
      </div>

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .hierarchy-container {
          min-height: 100vh;
          background: #FFFFFF;
          padding: 0;
        }

        /* ============================================
           HEADER
           ============================================ */
        .hierarchy-header {
          background: #FFFFFF;
          border-bottom: 1px solid #FFEFB3;
          position: sticky;
          top: 0;
          z-index: 30;
          box-shadow: 0 2px 12px rgba(1, 62, 55, 0.06);
        }

        .hierarchy-header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (min-width: 1024px) {
          .hierarchy-header-inner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .hierarchy-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          animation: fadeInLeft 0.6s ease;
        }

        .hierarchy-header-icon-wrapper {
          padding: 10px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        .hierarchy-header-icon-wrapper:hover {
          transform: scale(1.05) rotate(-5deg);
        }

        .hierarchy-header-icon {
          width: 24px;
          height: 24px;
        }

        .hierarchy-header-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .hierarchy-header-title {
          font-size: 22px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.3px;
        }

        @media (min-width: 640px) {
          .hierarchy-header-title {
            font-size: 26px;
          }
        }

        .hierarchy-header-badge {
          padding: 2px 12px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 9999px;
          animation: pulse 2s ease-in-out infinite;
        }

        .hierarchy-header-subtitle {
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
        }

        .hierarchy-header-subtitle-icon {
          width: 16px;
          height: 16px;
        }

        .hierarchy-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          animation: fadeInRight 0.6s ease;
        }

        .hierarchy-refresh-btn {
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
        .hierarchy-refresh-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: rotate(180deg);
        }
        .hierarchy-refresh-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          transition: transform 0.3s ease;
        }

        .hierarchy-search-wrapper {
          position: relative;
        }

        .hierarchy-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          opacity: 0.5;
        }

        .hierarchy-search-input {
          padding: 8px 34px 8px 34px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          width: 160px;
          transition: all 0.3s ease;
          outline: none;
          background: #ffffff;
          color: #013E37;
        }

        .hierarchy-search-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
          width: 200px;
        }

        .hierarchy-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
        }

        .hierarchy-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          background: none;
          border: none;
          cursor: pointer;
          color: #013E37;
          opacity: 0.4;
          transition: all 0.3s ease;
        }
        .hierarchy-search-clear:hover {
          opacity: 0.8;
          transform: translateY(-50%) scale(1.2);
        }
        .hierarchy-search-clear-icon {
          width: 16px;
          height: 16px;
        }

        @media (min-width: 640px) {
          .hierarchy-search-input {
            width: 190px;
          }
          .hierarchy-search-input:focus {
            width: 240px;
          }
        }

        .hierarchy-view-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #FFEFB3;
          border-radius: 8px;
          padding: 4px;
          transition: all 0.3s ease;
        }

        .hierarchy-view-btn {
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.5;
          display: flex;
          align-items: center;
        }

        .hierarchy-view-btn:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }

        .hierarchy-view-active {
          background: #013E37;
          color: #FFFFFF;
          opacity: 1;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.2);
          animation: popIn 0.3s ease;
        }

        .hierarchy-view-active:hover {
          opacity: 1;
          transform: scale(1);
        }

        .hierarchy-view-icon {
          width: 16px;
          height: 16px;
        }

        .hierarchy-expand-btn,
        .hierarchy-collapse-btn {
          padding: 8px 12px;
          font-size: 13px;
          color: #013E37;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .hierarchy-expand-btn:hover,
        .hierarchy-collapse-btn:hover {
          background: #FFEFB3;
          color: #013E37;
          transform: scale(1.02);
        }

        .hierarchy-add-btn {
          padding: 8px 20px;
          background: #013E37;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.25);
        }

        .hierarchy-add-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        .hierarchy-add-btn:active {
          transform: scale(0.95);
        }

        .hierarchy-add-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .hierarchy-add-btn:hover .hierarchy-add-icon {
          transform: rotate(90deg);
        }

        /* ============================================
           MAIN CONTENT
           ============================================ */
        .hierarchy-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px;
        }

        /* ============================================
           STATS
           ============================================ */
        .hierarchy-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
          animation: fadeInUp 0.8s ease;
        }

        @media (min-width: 768px) {
          .hierarchy-stats {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .hierarchy-stat-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 16px;
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
        }

        .hierarchy-stat-card:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          transform: translateY(-4px);
          border-color: #013E37;
        }

        .hierarchy-stat-card-inner {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hierarchy-stat-icon-wrapper {
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .hierarchy-stat-card:hover .hierarchy-stat-icon-wrapper {
          transform: scale(1.05);
        }

        .hierarchy-stat-card-icon {
          width: 20px;
          height: 20px;
        }

        .hierarchy-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          line-height: 1.2;
        }

        .hierarchy-stat-label {
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
          font-weight: 500;
        }

        /* ============================================
           TREE CONTAINER
           ============================================ */
        .hierarchy-tree-container {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #FFEFB3;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .hierarchy-tree-container:hover {
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }

        .hierarchy-tree-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* ============================================
           TREE VIEW
           ============================================ */
        .hierarchy-tree-item {
          animation: slideInRight 0.4s ease forwards;
          opacity: 0;
        }

        .hierarchy-tree-node {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .hierarchy-tree-node:hover {
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.08);
          background: #FFEFB3;
        }

        .hierarchy-tree-node-selected {
          background: #FFEFB3 !important;
          border-left: 4px solid #013E37 !important;
        }

        .hierarchy-tree-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: #013E37;
          opacity: 0.4;
          padding: 4px;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .hierarchy-tree-toggle:hover {
          opacity: 1;
          transform: scale(1.2);
        }

        .hierarchy-tree-toggle-icon {
          width: 20px;
          height: 20px;
        }

        .hierarchy-tree-toggle-spacer {
          width: 20px;
          flex-shrink: 0;
        }

        .hierarchy-tree-icon-wrapper {
          padding: 8px;
          border-radius: 8px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .hierarchy-tree-node:hover .hierarchy-tree-icon-wrapper {
          transform: scale(1.1) rotate(-5deg);
        }

        .hierarchy-tree-icon {
          width: 20px;
          height: 20px;
        }

        .hierarchy-tree-info {
          flex: 1;
          min-width: 0;
        }

        .hierarchy-tree-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .hierarchy-tree-name {
          font-weight: 600;
          color: #013E37;
          font-size: 15px;
          transition: color 0.3s ease;
        }

        .hierarchy-tree-node:hover .hierarchy-tree-name {
          color: #0A5C54;
        }

        .hierarchy-tree-type-badge {
          font-size: 11px;
          padding: 2px 10px;
          border-radius: 9999px;
          font-weight: 500;
        }

        .hierarchy-tree-status {
          font-size: 11px;
          padding: 2px 10px;
          border-radius: 9999px;
          font-weight: 500;
        }

        .hierarchy-tree-desc {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 4px 0 0 0;
        }

        .hierarchy-tree-stats {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .hierarchy-tree-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #013E37;
          opacity: 0.6;
          font-size: 13px;
        }

        .hierarchy-tree-stat-icon {
          width: 16px;
          height: 16px;
        }

        .hierarchy-tree-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .hierarchy-tree-action {
          padding: 6px;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.3;
          display: flex;
          align-items: center;
        }

        .hierarchy-tree-action:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }

        .hierarchy-tree-action-delete:hover {
          background: #FFEBEE;
          color: #D32F2F;
          opacity: 1;
        }

        .hierarchy-tree-action-icon {
          width: 16px;
          height: 16px;
        }

        .hierarchy-tree-children {
          margin-left: 24px;
          padding-left: 24px;
          border-left: 2px solid #FFEFB3;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* ============================================
           CARDS VIEW
           ============================================ */
        .hierarchy-card-wrapper {
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }

        .hierarchy-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          cursor: pointer;
          border: 1px solid #FFEFB3;
        }

        .hierarchy-card:hover {
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.1);
          transform: translateY(-4px);
          border-color: #013E37;
        }

        .hierarchy-card-selected {
          border-color: #013E37 !important;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.12);
        }

        .hierarchy-card-inner {
          padding: 20px;
          position: relative;
        }

        .hierarchy-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .hierarchy-card-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .hierarchy-icon-wrapper {
          padding: 8px;
          border-radius: 8px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .hierarchy-card:hover .hierarchy-icon-wrapper {
          transform: scale(1.1) rotate(-5deg);
        }

        .hierarchy-icon {
          width: 20px;
          height: 20px;
        }

        .hierarchy-card-title {
          font-weight: 600;
          color: #013E37;
          margin: 0;
          font-size: 16px;
          transition: color 0.3s ease;
        }

        .hierarchy-card:hover .hierarchy-card-title {
          color: #0A5C54;
        }

        .hierarchy-type-badge {
          font-size: 11px;
          padding: 2px 10px;
          border-radius: 9999px;
          font-weight: 500;
        }

        .hierarchy-card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .hierarchy-status-badge {
          font-size: 11px;
          padding: 2px 10px;
          border-radius: 9999px;
          font-weight: 500;
        }

        .hierarchy-action-btn {
          padding: 4px;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.3;
          display: flex;
          align-items: center;
        }

        .hierarchy-action-btn:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }

        .hierarchy-action-delete:hover {
          background: #FFEBEE;
          color: #D32F2F;
          opacity: 1;
        }

        .hierarchy-action-icon {
          width: 16px;
          height: 16px;
        }

        .hierarchy-card-desc {
          margin-top: 8px;
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
          line-height: 1.5;
        }

        .hierarchy-card-stats {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 20px;
          font-size: 13px;
          color: #013E37;
          opacity: 0.7;
        }

        .hierarchy-stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .hierarchy-stat-icon {
          width: 16px;
          height: 16px;
        }

        .hierarchy-toggle-children {
          margin-top: 12px;
          font-size: 13px;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.3s ease;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .hierarchy-toggle-children:hover {
          background: rgba(1, 62, 55, 0.05);
        }

        .hierarchy-toggle-icon {
          width: 16px;
          height: 16px;
        }

        .hierarchy-card-hover-indicator {
          position: absolute;
          bottom: 12px;
          right: 16px;
          color: #013E37;
          opacity: 0.3;
          animation: slideInRight 0.3s ease;
        }

        .hierarchy-children-grid {
          margin-left: 24px;
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 768px) {
          .hierarchy-children-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .hierarchy-children-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* ============================================
           COMPACT VIEW
           ============================================ */
        .hierarchy-compact-item {
          animation: slideInRight 0.3s ease forwards;
          opacity: 0;
        }

        .hierarchy-compact-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .hierarchy-compact-row:hover {
          background: #FFEFB3;
        }

        .hierarchy-compact-selected {
          background: #FFEFB3 !important;
        }

        .hierarchy-compact-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: #013E37;
          opacity: 0.4;
          padding: 2px;
          transition: all 0.3s ease;
        }

        .hierarchy-compact-toggle:hover {
          opacity: 1;
          transform: scale(1.2);
        }

        .hierarchy-compact-toggle-icon {
          width: 12px;
          height: 12px;
        }

        .hierarchy-compact-spacer {
          width: 12px;
        }

        .hierarchy-compact-icon {
          width: 16px;
          height: 16px;
        }

        .hierarchy-compact-name {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }

        .hierarchy-compact-type {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
        }

        .hierarchy-compact-status {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 9999px;
          font-weight: 500;
        }

        .hierarchy-compact-members {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
          margin-left: auto;
        }

        .hierarchy-compact-children {
          margin-left: 24px;
          padding-left: 12px;
          border-left: 2px solid #FFEFB3;
        }

        /* ============================================
           LOADING
           ============================================ */
        .hierarchy-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }

        .hierarchy-loading-spinner {
          width: 64px;
          height: 64px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .hierarchy-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .hierarchy-empty {
          text-align: center;
          padding: 64px 24px;
        }

        .hierarchy-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          animation: float 3s ease-in-out infinite;
        }

        .hierarchy-empty-icon {
          width: 40px;
          height: 40px;
        }

        .hierarchy-empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }

        .hierarchy-empty-subtitle {
          color: #013E37;
          opacity: 0.6;
          margin-top: 4px;
          font-size: 15px;
        }

        .hierarchy-empty-btn {
          margin-top: 20px;
          padding: 10px 24px;
          background: #013E37;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .hierarchy-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        .hierarchy-empty-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           MODAL
           ============================================ */
        .hierarchy-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(1, 62, 55, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          animation: fadeIn 0.3s ease;
        }

        .hierarchy-modal {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #FFEFB3;
          padding: 24px;
          max-width: 448px;
          width: 100%;
          margin: 0 16px;
          box-shadow: 0 24px 64px rgba(1, 62, 55, 0.2);
          max-height: 90vh;
          overflow-y: auto;
          animation: modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .hierarchy-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #FFEFB3;
        }

        .hierarchy-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hierarchy-modal-title-icon {
          width: 20px;
          height: 20px;
        }

        .hierarchy-modal-close {
          padding: 4px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.5;
        }

        .hierarchy-modal-close:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: rotate(90deg);
        }

        .hierarchy-modal-close-icon {
          width: 20px;
          height: 20px;
        }

        .hierarchy-modal-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .hierarchy-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .hierarchy-form-group:nth-child(1) { animation-delay: 0.05s; }
        .hierarchy-form-group:nth-child(2) { animation-delay: 0.1s; }
        .hierarchy-form-group:nth-child(3) { animation-delay: 0.15s; }

        .hierarchy-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }

        .hierarchy-form-input,
        .hierarchy-form-select,
        .hierarchy-form-textarea {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          outline: none;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          color: #013E37;
        }

        .hierarchy-form-input:focus,
        .hierarchy-form-select:focus,
        .hierarchy-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
          transform: scale(1.01);
        }

        .hierarchy-form-input::placeholder,
        .hierarchy-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.4;
        }

        .hierarchy-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .hierarchy-form-parent {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
        }

        .hierarchy-form-parent-name {
          font-weight: 500;
          color: #013E37;
          opacity: 1;
        }

        .hierarchy-modal-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #FFEFB3;
        }

        .hierarchy-modal-cancel {
          flex: 1;
          padding: 10px 16px;
          background: none;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          color: #013E37;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hierarchy-modal-cancel:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: scale(1.02);
        }

        .hierarchy-modal-submit {
          flex: 1;
          padding: 10px 16px;
          background: #013E37;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .hierarchy-modal-submit:hover {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        .hierarchy-modal-submit-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           FOOTER
           ============================================ */
        .hierarchy-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 12px;
          color: #013E37;
          opacity: 0.3;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .hierarchy-header-inner {
            padding: 12px 16px;
          }
          .hierarchy-header-title {
            font-size: 20px;
          }
          .hierarchy-main {
            padding: 16px;
          }
          .hierarchy-tree-container {
            padding: 16px;
          }
          .hierarchy-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .hierarchy-header-right {
            flex-wrap: wrap;
            gap: 6px;
          }
          .hierarchy-expand-btn,
          .hierarchy-collapse-btn {
            font-size: 12px;
            padding: 6px 10px;
          }
          .hierarchy-add-btn {
            padding: 6px 14px;
            font-size: 13px;
          }
          .hierarchy-search-input {
            width: 120px;
          }
          .hierarchy-search-input:focus {
            width: 150px;
          }
          .hierarchy-tree-node {
            padding: 10px 12px;
            gap: 8px;
          }
          .hierarchy-tree-children {
            margin-left: 12px;
            padding-left: 12px;
          }
          .hierarchy-card-inner {
            padding: 16px;
          }
          .hierarchy-modal {
            margin: 12px;
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .hierarchy-stats {
            grid-template-columns: 1fr 1fr;
          }
          .hierarchy-stat-card {
            padding: 12px;
          }
          .hierarchy-stat-value {
            font-size: 18px;
          }
          .hierarchy-tree-container {
            padding: 12px;
          }
          .hierarchy-tree-name {
            font-size: 14px;
          }
          .hierarchy-tree-stats {
            gap: 8px;
          }
          .hierarchy-card-stats {
            flex-wrap: wrap;
            gap: 8px;
          }
          .hierarchy-children-grid {
            margin-left: 0;
          }
          .hierarchy-header-title {
            font-size: 18px;
          }
          .hierarchy-view-toggle {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </>
  );
};

export default Hierarchy;