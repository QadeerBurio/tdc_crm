import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import {
  Building2, Layers, Users, UserPlus,
  ChevronRight, ChevronDown, Plus, RefreshCw,
  Download, Printer, ZoomIn, ZoomOut,
  Maximize, Minimize, Grid, List
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrganizationChart = () => {
  const { token } = useContext(AuthContext);
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'grid'
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState({});

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  // Get headers with token
  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/organization/hierarchy`, {
        headers: getHeaders()
      });
      setHierarchy(response.data.data);
      if (response.data.data) {
        setExpanded({ [response.data.data._id]: true });
      }
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
      toast.error('Failed to load organization chart');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    if (!hierarchy) return;
    const expandAllNodes = (node) => {
      const newExpanded = { ...expanded };
      const traverse = (n) => {
        newExpanded[n._id] = true;
        if (n.children) {
          n.children.forEach(child => traverse(child));
        }
      };
      traverse(hierarchy);
      setExpanded(newExpanded);
    };
    expandAllNodes(hierarchy);
  };

  const collapseAll = () => {
    setExpanded({});
  };

  const getNodeColor = (type) => {
    const colors = {
      'company': 'border-blue-500 bg-blue-50',
      'segment': 'border-green-500 bg-green-50',
      'department': 'border-purple-500 bg-purple-50',
      'team': 'border-orange-500 bg-orange-50'
    };
    return colors[type] || 'border-gray-300 bg-gray-50';
  };

  const getNodeIcon = (type) => {
    const icons = {
      'company': Building2,
      'segment': Layers,
      'department': Users,
      'team': UserPlus
    };
    const Icon = icons[type] || Building2;
    return Icon;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-500',
      pending: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-500';
  };

  const getMemberCount = (node) => {
    let count = node.members?.length || 0;
    if (node.children) {
      node.children.forEach(child => {
        count += getMemberCount(child);
      });
    }
    return count;
  };

  const renderTreeNode = (node, level = 0) => {
    if (!node) return null;
    
    const isExpanded = expanded[node._id];
    const hasChildren = node.children && node.children.length > 0;
    const Icon = getNodeIcon(node.type);
    const colorClass = getNodeColor(node.type);
    const statusColor = getStatusColor(node.status);
    const memberCount = getMemberCount(node);

    return (
      <div key={node._id} className={`${level > 0 ? 'ml-8' : ''} relative`}>
        {level > 0 && (
          <div className="absolute left-[-20px] top-0 bottom-0 w-px bg-gray-300" />
        )}
        
        <div 
          className={`
            flex items-center gap-3 p-3 rounded-lg border-l-4 cursor-pointer
            transition-all duration-200 hover:shadow-md
            ${colorClass}
          `}
          onClick={() => hasChildren && toggleExpand(node._id)}
        >
          {hasChildren && (
            <span className="text-gray-400 hover:text-gray-600">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
          {!hasChildren && <span className="w-4" />}
          
          <Icon className="text-gray-600 w-5 h-5" />
          
          <div className="flex-1">
            <span className="font-medium text-gray-800">{node.name}</span>
            <span className="ml-2 text-xs text-gray-500 capitalize">({node.type})</span>
          </div>
          
          {node.status && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${statusColor}`}>
              {node.status}
            </span>
          )}
          
          {memberCount > 0 && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {memberCount}
            </span>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-2 space-y-2">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderGridNode = (node, level = 0) => {
    if (!node) return null;
    
    const hasChildren = node.children && node.children.length > 0;
    const Icon = getNodeIcon(node.type);
    const colorClass = getNodeColor(node.type);
    const memberCount = getMemberCount(node);

    return (
      <div key={node._id} className="flex flex-col items-center">
        <div 
          className={`
            p-4 rounded-lg border-2 min-w-[120px] text-center cursor-pointer
            transition-all duration-200 hover:shadow-lg
            ${colorClass}
          `}
          onClick={() => hasChildren && toggleExpand(node._id)}
        >
          <div className="flex justify-center mb-2">
            <Icon className="w-6 h-6 text-gray-600" />
          </div>
          <div className="font-medium text-gray-800 text-sm">{node.name}</div>
          <div className="text-xs text-gray-500 capitalize">{node.type}</div>
          {memberCount > 0 && (
            <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              {memberCount} members
            </div>
          )}
          {node.status && (
            <div className={`mt-2 px-2 py-0.5 text-xs rounded-full inline-block ${getStatusColor(node.status)}`}>
              {node.status}
            </div>
          )}
        </div>
        
        {hasChildren && expanded[node._id] && (
          <div className="flex flex-wrap justify-center gap-4 mt-4 p-4 border-t-2 border-gray-200">
            {node.children.map(child => renderGridNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleDownload = () => {
    toast.info('Download functionality coming soon');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Organization Chart</h2>
          <p className="text-sm text-gray-500 mt-1">Visual org chart view</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'tree' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Tree View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Expand/Collapse */}
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Collapse All
          </button>
          
          {/* Zoom Controls */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
              className="px-2 py-1 hover:bg-gray-50 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
            <span className="px-2 py-1 text-sm text-gray-600 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
              className="px-2 py-1 hover:bg-gray-50 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-2 py-1 hover:bg-gray-50 transition-colors border-l border-gray-300"
              title="Reset Zoom"
            >
              <Maximize className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          {/* Actions */}
          <button
            onClick={fetchHierarchy}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 text-gray-500" />
          </button>
          <button 
            onClick={handlePrint}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Print"
          >
            <Printer className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div 
        className="overflow-auto max-h-[600px]"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        {hierarchy ? (
          viewMode === 'tree' 
            ? renderTreeNode(hierarchy)
            : renderGridNode(hierarchy)
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No Organization Structure</h3>
            <p className="text-sm mt-1">Start by creating your company</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                // Navigate to hierarchy creation or show modal
                toast.info('Create your company structure');
              }}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Company
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      {hierarchy && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="text-gray-500">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-gray-600">Company</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-gray-600">Segment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded" />
              <span className="text-gray-600">Department</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded" />
              <span className="text-gray-600">Team</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="w-3 h-3 bg-green-100 border border-green-700 rounded" />
              <span className="text-gray-600">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-500 rounded" />
              <span className="text-gray-600">Inactive</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationChart;