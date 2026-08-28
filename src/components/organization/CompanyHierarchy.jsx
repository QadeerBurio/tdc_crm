import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { 
  Building2, Layers, Users, UserPlus, 
  ChevronRight, ChevronDown, Plus, Edit, Trash2,
  RefreshCw, Eye, MoreVertical, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

const CompanyHierarchy = () => {
  const { token } = useContext(AuthContext);
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [showActions, setShowActions] = useState(false);

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
      // Auto-expand first level
      if (response.data.data) {
        setExpanded({ [response.data.data._id]: true });
      }
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
      toast.error('Failed to load organization hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const expandAllNodes = (node) => {
      const newExpanded = { ...expanded };
      const traverse = (n) => {
        newExpanded[n._id] = true;
        if (n.children) {
          n.children.forEach(child => traverse(child));
        }
      };
      if (node) traverse(node);
      setExpanded(newExpanded);
    };
    if (hierarchy) expandAllNodes(hierarchy);
  };

  const collapseAll = () => {
    setExpanded({});
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

  const getNodeColor = (type) => {
    const colors = {
      'company': 'border-blue-500 bg-blue-50 hover:bg-blue-100',
      'segment': 'border-green-500 bg-green-50 hover:bg-green-100',
      'department': 'border-purple-500 bg-purple-50 hover:bg-purple-100',
      'team': 'border-orange-500 bg-orange-50 hover:bg-orange-100'
    };
    return colors[type] || 'border-gray-300 bg-gray-50 hover:bg-gray-100';
  };

  const getNodeIconColor = (type) => {
    const colors = {
      'company': 'text-blue-600',
      'segment': 'text-green-600',
      'department': 'text-purple-600',
      'team': 'text-orange-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const getTypeLabel = (type) => {
    const labels = {
      'company': 'Company',
      'segment': 'Segment',
      'department': 'Department',
      'team': 'Team'
    };
    return labels[type] || type;
  };

  const renderNode = (node, level = 0) => {
    if (!node) return null;
    
    const isExpanded = expanded[node._id];
    const hasChildren = node.children && node.children.length > 0;
    const Icon = getNodeIcon(node.type);
    const colorClass = getNodeColor(node.type);
    const iconColor = getNodeIconColor(node.type);
    const typeLabel = getTypeLabel(node.type);
    const isSelected = selectedNode === node._id;

    return (
      <div key={node._id} className={`${level > 0 ? 'ml-8' : ''} relative`}>
        {/* Vertical line for hierarchy */}
        {level > 0 && (
          <div className="absolute left-[-20px] top-0 bottom-0 w-px bg-gray-300" />
        )}
        
        <div 
          className={`
            flex items-center gap-2 p-3 rounded-lg border-l-4 cursor-pointer
            transition-all duration-200
            ${colorClass}
            ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''}
            ${level === 0 ? 'text-lg' : ''}
          `}
          onClick={() => {
            if (hasChildren) toggleExpand(node._id);
            setSelectedNode(node._id);
          }}
        >
          {/* Expand/Collapse */}
          {hasChildren && (
            <span className="text-gray-400 hover:text-gray-600">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
          
          {/* Icon */}
          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white' : ''}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-medium text-gray-800 ${level === 0 ? 'text-xl' : ''}`}>
                {node.name}
              </span>
              <span className="px-2 py-0.5 text-xs bg-white/50 rounded-full text-gray-600">
                {typeLabel}
              </span>
              {node.status && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  node.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : node.status === 'inactive'
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {node.status}
                </span>
              )}
            </div>
            
            {node.description && (
              <p className="text-sm text-gray-500 truncate">{node.description}</p>
            )}
            
            {node.members && node.members.length > 0 && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                <Users className="w-3 h-3" />
                <span>{node.members.length} members</span>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            {node._id && (
              <button 
                className="p-1 hover:bg-white/50 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node._id);
                  setShowActions(!showActions);
                }}
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        
        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-2">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Organization Hierarchy</h2>
          <p className="text-sm text-gray-500 mt-1">Visual representation of your company structure</p>
        </div>
        <div className="flex items-center gap-2">
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
          <button
            onClick={fetchHierarchy}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="space-y-2">
        {hierarchy ? renderNode(hierarchy) : (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No Organization Structure</h3>
            <p className="text-sm mt-1">Start by creating your company</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyHierarchy;