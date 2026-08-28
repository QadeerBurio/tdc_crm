// Hierarchy.jsx
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { 
  Building2, Layers, Users, UserPlus, 
  ChevronRight, ChevronDown, Plus, Edit, Trash2,
  Search, Grid3x3, List, LayoutGrid,
  Activity, CheckCircle, Users as UsersIcon
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
  const [newNodeData, setNewNodeData] = useState({
    name: '',
    type: 'company',
    parentId: null,
    description: '',
    status: 'active'
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  // Find node in hierarchy - defined before use
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

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/organization/hierarchy`, { headers });
      setHierarchy(response.data.data);
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
      toast.error('Failed to load organization hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = async () => {
    try {
      if (!newNodeData.name.trim()) {
        toast.error('Please enter a name');
        return;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        `${API_URL}/organization/nodes`,
        newNodeData,
        { headers }
      );
      
      toast.success(`${newNodeData.type} created successfully`);
      setShowAddModal(false);
      setNewNodeData({ name: '', type: 'company', parentId: null, description: '', status: 'active' });
      fetchHierarchy();
    } catch (error) {
      console.error('Error adding node:', error);
      toast.error('Failed to create node');
    }
  };

  const handleEditNode = async () => {
    try {
      if (!editingNode || !editingNode.name.trim()) {
        toast.error('Please enter a name');
        return;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(
        `${API_URL}/organization/nodes/${editingNode._id}`,
        { name: editingNode.name, description: editingNode.description, status: editingNode.status },
        { headers }
      );
      
      toast.success('Node updated successfully');
      setShowEditModal(false);
      setEditingNode(null);
      fetchHierarchy();
    } catch (error) {
      console.error('Error updating node:', error);
      toast.error('Failed to update node');
    }
  };

  const handleDeleteNode = async (nodeId) => {
    if (!window.confirm('Are you sure you want to delete this node and all its children?')) return;

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_URL}/organization/nodes/${nodeId}`, { headers });
      
      toast.success('Node deleted successfully');
      fetchHierarchy();
    } catch (error) {
      console.error('Error deleting node:', error);
      toast.error('Failed to delete node');
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

  const renderNode = (node, level = 0) => {
    if (!node) return null;
    
    const isExpanded = expanded[node._id];
    const hasChildren = node.children && node.children.length > 0;
    const stats = getNodeStats(node);
    const isSelected = selectedNode?._id === node._id;

    const Icon = node.type === 'company' ? Building2 : 
                node.type === 'segment' ? Layers : 
                node.type === 'department' ? Users : UserPlus;

    const colors = {
      company: { 
        border: '#3b82f6', 
        bg: 'rgba(59, 130, 246, 0.08)', 
        text: '#3b82f6', 
        light: 'rgba(59, 130, 246, 0.12)',
      },
      segment: { 
        border: '#22c55e', 
        bg: 'rgba(34, 197, 94, 0.08)', 
        text: '#22c55e', 
        light: 'rgba(34, 197, 94, 0.12)',
      },
      department: { 
        border: '#8b5cf6', 
        bg: 'rgba(139, 92, 246, 0.08)', 
        text: '#8b5cf6', 
        light: 'rgba(139, 92, 246, 0.12)',
      },
      team: { 
        border: '#eab308', 
        bg: 'rgba(234, 179, 8, 0.08)', 
        text: '#eab308', 
        light: 'rgba(234, 179, 8, 0.12)',
      }
    };

    const color = colors[node.type] || colors.company;

    const statusColors = {
      active: { bg: '#dcfce7', text: '#16a34a', border: '#86efac' },
      inactive: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' },
      pending: { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' },
      archived: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' }
    };

    const status = statusColors[node.status] || statusColors.active;

    // Get margin based on level
    const getMarginLeft = (level) => {
      const margin = Math.min(level * 16, 64);
      return { marginLeft: `${margin}px` };
    };

    if (viewMode === 'cards') {
      return (
        <div key={node._id} className="hierarchy-card-wrapper" style={{ marginBottom: '16px' }}>
          <div 
            className="hierarchy-card"
            style={{ borderLeft: `4px solid ${color.border}` }}
            onClick={() => setSelectedNode(node)}
          >
            <div className="hierarchy-card-content">
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
                  <span className="hierarchy-status-badge" style={{ backgroundColor: status.bg, color: status.text, borderColor: status.border }}>
                    {node.status || 'active'}
                  </span>
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
                </div>
              </div>
              
              {node.description && (
                <p className="hierarchy-card-desc">{node.description}</p>
              )}
              
              <div className="hierarchy-card-stats">
                <div className="hierarchy-stat-item">
                  <UsersIcon className="hierarchy-stat-icon" />
                  <span>{stats.totalMembers} members</span>
                </div>
                <div className="hierarchy-stat-item">
                  <Layers className="hierarchy-stat-icon" />
                  <span>{stats.totalChildren} sub-items</span>
                </div>
                <div className="hierarchy-stat-item">
                  <CheckCircle className="hierarchy-stat-icon" />
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
      <div key={node._id} className="hierarchy-tree-item" style={getMarginLeft(level)}>
        <div 
          className="hierarchy-tree-node"
          style={{ backgroundColor: color.bg, borderLeft: `4px solid ${color.border}` }}
          onClick={() => {
            setSelectedNode(node);
            if (hasChildren) toggleExpand(node._id);
          }}
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
              <span className="hierarchy-tree-type-badge">{node.type}</span>
              {node.status && (
                <span className="hierarchy-tree-status" style={{ backgroundColor: status.bg, color: status.text, borderColor: status.border }}>
                  {node.status}
                </span>
              )}
            </div>
            {node.description && (
              <p className="hierarchy-tree-desc">{node.description}</p>
            )}
          </div>
          
          <div className="hierarchy-tree-stats">
            {node.members && (
              <div className="hierarchy-tree-stat">
                <UsersIcon className="hierarchy-tree-stat-icon" />
                <span>{node.members.length}</span>
              </div>
            )}
            {stats.totalChildren > 0 && (
              <div className="hierarchy-tree-stat">
                <Layers className="hierarchy-tree-stat-icon" />
                <span>{stats.totalChildren}</span>
              </div>
            )}
          </div>
          
          <div className="hierarchy-tree-actions">
            <button 
              className="hierarchy-tree-action"
              onClick={(e) => {
                e.stopPropagation();
                setNewNodeData({
                  name: '',
                  type: node.type === 'company' ? 'segment' :
                         node.type === 'segment' ? 'department' :
                         node.type === 'department' ? 'team' : 'team',
                  parentId: node._id,
                  description: '',
                  status: 'active'
                });
                setShowAddModal(true);
              }}
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
            >
              <Edit className="hierarchy-tree-action-icon" />
            </button>
            <button 
              className="hierarchy-tree-action hierarchy-tree-action-delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNode(node._id);
              }}
            >
              <Trash2 className="hierarchy-tree-action-icon" />
            </button>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="hierarchy-tree-children">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const AddModal = () => (
    <div className="hierarchy-modal-overlay">
      <div className="hierarchy-modal">
        <div className="hierarchy-modal-header">
          <h2 className="hierarchy-modal-title">Create New {newNodeData.type}</h2>
          <button 
            onClick={() => setShowAddModal(false)}
            className="hierarchy-modal-close"
          >
            <X className="hierarchy-modal-close-icon" />
          </button>
        </div>
        
        <div className="hierarchy-modal-body">
          <div className="hierarchy-form-group">
            <label className="hierarchy-form-label">Name</label>
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
          
          {newNodeData.parentId && (
            <div className="hierarchy-form-parent">
              Parent: <span className="hierarchy-form-parent-name">
                {hierarchy ? findNode(hierarchy, newNodeData.parentId)?.name || 'Unknown' : 'Loading...'}
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

  const EditModal = () => (
    <div className="hierarchy-modal-overlay">
      <div className="hierarchy-modal">
        <div className="hierarchy-modal-header">
          <h2 className="hierarchy-modal-title">Edit {editingNode?.type}</h2>
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
              <label className="hierarchy-form-label">Name</label>
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
              <div className="hierarchy-header-icon-wrapper">
                <Building2 className="hierarchy-header-icon" />
              </div>
              <div>
                <div className="hierarchy-header-title-row">
                  <h1 className="hierarchy-header-title">Organization Hierarchy</h1>
                  <span className="hierarchy-header-badge">
                    {hierarchy ? countAllNodes(hierarchy) : 0} nodes
                  </span>
                </div>
                <p className="hierarchy-header-subtitle">
                  <Activity className="hierarchy-header-subtitle-icon" />
                  View and manage your company structure
                </p>
              </div>
            </div>
            
            <div className="hierarchy-header-right">
              <div className="hierarchy-search-wrapper">
                <Search className="hierarchy-search-icon" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="hierarchy-search-input"
                />
              </div>
              
              <div className="hierarchy-view-toggle">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`hierarchy-view-btn ${viewMode === 'tree' ? 'hierarchy-view-active' : ''}`}
                >
                  <List className="hierarchy-view-icon" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`hierarchy-view-btn ${viewMode === 'cards' ? 'hierarchy-view-active' : ''}`}
                >
                  <Grid3x3 className="hierarchy-view-icon" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`hierarchy-view-btn ${viewMode === 'compact' ? 'hierarchy-view-active' : ''}`}
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
                Add New
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
                  <div className="hierarchy-stat-icon-wrapper hierarchy-stat-blue">
                    <Building2 className="hierarchy-stat-card-icon" />
                  </div>
                  <div>
                    <p className="hierarchy-stat-value">{countAllNodes(hierarchy)}</p>
                    <p className="hierarchy-stat-label">Total Nodes</p>
                  </div>
                </div>
              </div>
              <div className="hierarchy-stat-card">
                <div className="hierarchy-stat-card-inner">
                  <div className="hierarchy-stat-icon-wrapper hierarchy-stat-green">
                    <UsersIcon className="hierarchy-stat-card-icon" />
                  </div>
                  <div>
                    <p className="hierarchy-stat-value">{getTotalMembers(hierarchy)}</p>
                    <p className="hierarchy-stat-label">Total Members</p>
                  </div>
                </div>
              </div>
              <div className="hierarchy-stat-card">
                <div className="hierarchy-stat-card-inner">
                  <div className="hierarchy-stat-icon-wrapper hierarchy-stat-purple">
                    <CheckCircle className="hierarchy-stat-card-icon" />
                  </div>
                  <div>
                    <p className="hierarchy-stat-value">{getActiveNodes(hierarchy)}</p>
                    <p className="hierarchy-stat-label">Active Nodes</p>
                  </div>
                </div>
              </div>
              <div className="hierarchy-stat-card">
                <div className="hierarchy-stat-card-inner">
                  <div className="hierarchy-stat-icon-wrapper hierarchy-stat-yellow">
                    <Layers className="hierarchy-stat-card-icon" />
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
                <div className="hierarchy-empty-icon-wrapper">
                  <Building2 className="hierarchy-empty-icon" />
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

      {/* Styles - Using regular style tag */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .hierarchy-container {
          min-height: 100vh;
          background: #f8fafc;
        }

        /* ============================================
           HEADER
           ============================================ */
        .hierarchy-header {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 30;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .hierarchy-header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (min-width: 640px) {
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
        }

        .hierarchy-header-icon-wrapper {
          padding: 8px;
          background: #eff6ff;
          border-radius: 10px;
        }

        .hierarchy-header-icon {
          width: 24px;
          height: 24px;
          color: #3b82f6;
        }

        .hierarchy-header-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .hierarchy-header-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        @media (min-width: 640px) {
          .hierarchy-header-title {
            font-size: 24px;
          }
        }

        .hierarchy-header-badge {
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 500;
          background: #dbeafe;
          color: #1d4ed8;
          border-radius: 9999px;
        }

        .hierarchy-header-subtitle {
          color: #6b7280;
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
          color: #9ca3af;
        }

        .hierarchy-search-input {
          padding: 8px 12px 8px 34px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          width: 160px;
          transition: all 0.2s;
          outline: none;
          background: #ffffff;
        }

        .hierarchy-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        @media (min-width: 640px) {
          .hierarchy-search-input {
            width: 190px;
          }
        }

        .hierarchy-view-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 4px;
        }

        .hierarchy-view-btn {
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
          color: #6b7280;
          display: flex;
          align-items: center;
        }

        .hierarchy-view-btn:hover {
          color: #374151;
        }

        .hierarchy-view-active {
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          color: #111827;
        }

        .hierarchy-view-icon {
          width: 16px;
          height: 16px;
        }

        .hierarchy-expand-btn,
        .hierarchy-collapse-btn {
          padding: 8px 12px;
          font-size: 13px;
          color: #4b5563;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .hierarchy-expand-btn:hover,
        .hierarchy-collapse-btn:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .hierarchy-add-btn {
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
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
        }

        .hierarchy-add-btn:hover {
          background: #2563eb;
          box-shadow: 0 6px 8px rgba(59, 130, 246, 0.3);
          transform: translateY(-1px);
        }

        .hierarchy-add-icon {
          width: 16px;
          height: 16px;
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
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          border: 1px solid #f3f4f6;
          transition: all 0.2s;
        }

        .hierarchy-stat-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .hierarchy-stat-card-inner {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hierarchy-stat-icon-wrapper {
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hierarchy-stat-blue {
          background: #eff6ff;
        }

        .hierarchy-stat-green {
          background: #ecfdf5;
        }

        .hierarchy-stat-purple {
          background: #f5f3ff;
        }

        .hierarchy-stat-yellow {
          background: #fffbeb;
        }

        .hierarchy-stat-card-icon {
          width: 20px;
          height: 20px;
        }

        .hierarchy-stat-blue .hierarchy-stat-card-icon {
          color: #3b82f6;
        }

        .hierarchy-stat-green .hierarchy-stat-card-icon {
          color: #22c55e;
        }

        .hierarchy-stat-purple .hierarchy-stat-card-icon {
          color: #8b5cf6;
        }

        .hierarchy-stat-yellow .hierarchy-stat-card-icon {
          color: #eab308;
        }

        .hierarchy-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0;
          line-height: 1.2;
        }

        .hierarchy-stat-label {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        /* ============================================
           TREE CONTAINER
           ============================================ */
        .hierarchy-tree-container {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          border: 1px solid #f3f4f6;
          padding: 24px;
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
          transition: all 0.3s ease;
        }

        .hierarchy-tree-node {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .hierarchy-tree-node:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .hierarchy-tree-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          padding: 4px;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .hierarchy-tree-toggle:hover {
          color: #4b5563;
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
          color: #111827;
          font-size: 15px;
        }

        .hierarchy-tree-type-badge {
          font-size: 11px;
          padding: 2px 8px;
          background: #f3f4f6;
          color: #4b5563;
          border-radius: 9999px;
        }

        .hierarchy-tree-status {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1px solid;
        }

        .hierarchy-tree-desc {
          font-size: 13px;
          color: #6b7280;
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
          color: #6b7280;
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
          transition: all 0.2s;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }

        .hierarchy-tree-action:hover {
          background: rgba(255, 255, 255, 0.6);
          color: #4b5563;
        }

        .hierarchy-tree-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .hierarchy-tree-action-icon {
          width: 16px;
          height: 16px;
        }

        .hierarchy-tree-children {
          margin-left: 24px;
          padding-left: 24px;
          border-left: 2px solid rgba(229, 231, 235, 0.6);
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* ============================================
           CARDS VIEW
           ============================================ */
        .hierarchy-card-wrapper {
          margin-bottom: 16px;
        }

        .hierarchy-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid #f3f4f6;
        }

        .hierarchy-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .hierarchy-card-content {
          padding: 20px;
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
        }

        .hierarchy-icon {
          width: 20px;
          height: 20px;
        }

        .hierarchy-card-title {
          font-weight: 600;
          color: #111827;
          margin: 0;
          font-size: 16px;
        }

        .hierarchy-type-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .hierarchy-card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .hierarchy-status-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1px solid;
        }

        .hierarchy-action-btn {
          padding: 4px;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }

        .hierarchy-action-btn:hover {
          background: #f3f4f6;
          color: #4b5563;
        }

        .hierarchy-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .hierarchy-action-icon {
          width: 16px;
          height: 16px;
        }

        .hierarchy-card-desc {
          margin-top: 8px;
          font-size: 14px;
          color: #4b5563;
        }

        .hierarchy-card-stats {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 20px;
          font-size: 13px;
          color: #6b7280;
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
          transition: opacity 0.2s;
        }

        .hierarchy-toggle-children:hover {
          opacity: 0.8;
        }

        .hierarchy-toggle-icon {
          width: 16px;
          height: 16px;
        }

        .hierarchy-children-grid {
          margin-left: 32px;
          margin-top: 8px;
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
          margin-bottom: 4px;
        }

        .hierarchy-compact-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .hierarchy-compact-row:hover {
          background: #f9fafb;
        }

        .hierarchy-compact-selected {
          background: #eff6ff;
        }

        .hierarchy-compact-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          padding: 2px;
          transition: color 0.2s;
        }

        .hierarchy-compact-toggle:hover {
          color: #4b5563;
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
          color: #374151;
        }

        .hierarchy-compact-type {
          font-size: 12px;
          color: #9ca3af;
        }

        .hierarchy-compact-status {
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 9999px;
        }

        .hierarchy-compact-members {
          font-size: 12px;
          color: #9ca3af;
          margin-left: auto;
        }

        .hierarchy-compact-children {
          margin-left: 24px;
          padding-left: 12px;
          border-left: 1px solid #e5e7eb;
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
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .hierarchy-loading-text {
          margin-top: 16px;
          color: #6b7280;
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
          background: #eff6ff;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .hierarchy-empty-icon {
          width: 40px;
          height: 40px;
          color: #93c5fd;
        }

        .hierarchy-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .hierarchy-empty-subtitle {
          color: #6b7280;
          margin-top: 4px;
        }

        .hierarchy-empty-btn {
          margin-top: 16px;
          padding: 10px 24px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .hierarchy-empty-btn:hover {
          background: #2563eb;
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
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }

        .hierarchy-modal {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          max-width: 448px;
          width: 100%;
          margin: 0 16px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          max-height: 90vh;
          overflow-y: auto;
        }

        .hierarchy-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .hierarchy-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .hierarchy-modal-close {
          padding: 4px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .hierarchy-modal-close:hover {
          background: #f3f4f6;
        }

        .hierarchy-modal-close-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
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
        }

        .hierarchy-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .hierarchy-form-input,
        .hierarchy-form-select,
        .hierarchy-form-textarea {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
          outline: none;
          width: 100%;
          font-family: inherit;
        }

        .hierarchy-form-input:focus,
        .hierarchy-form-select:focus,
        .hierarchy-form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .hierarchy-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .hierarchy-form-parent {
          font-size: 14px;
          color: #6b7280;
        }

        .hierarchy-form-parent-name {
          font-weight: 500;
          color: #374151;
        }

        .hierarchy-modal-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
        }

        .hierarchy-modal-cancel {
          flex: 1;
          padding: 10px 16px;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: #4b5563;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .hierarchy-modal-cancel:hover {
          background: #f9fafb;
        }

        .hierarchy-modal-submit {
          flex: 1;
          padding: 10px 16px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .hierarchy-modal-submit:hover {
          background: #2563eb;
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
          color: #9ca3af;
        }
      `}</style>
    </>
  );
};

export default Hierarchy;