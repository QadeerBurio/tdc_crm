import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Settings, Plus, Edit, Trash2, Copy,
  Play, Pause, Eye, Search, Filter,
  ChevronDown, ChevronRight, ArrowRight,
  CheckCircle, AlertCircle, Clock
} from 'lucide-react';

const WorkflowList = () => {
  const { api } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState('all');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchWorkflows();
  }, [search, filterEntity]);

  const fetchWorkflows = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterEntity !== 'all') params.append('entityType', filterEntity);
      
      const response = await api.get(`/workflows?${params.toString()}`);
      setWorkflows(response.data.data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/workflows/${id}`, { isActive: !currentStatus });
      fetchWorkflows();
    } catch (error) {
      console.error('Error toggling workflow status:', error);
    }
  };

  const deleteWorkflow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      fetchWorkflows();
    } catch (error) {
      console.error('Error deleting workflow:', error);
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
      'goal': 'Goal'
    };
    return labels[type] || type;
  };

  const getEntityTypeColor = (type) => {
    const colors = {
      'task': 'bg-blue-100 text-blue-700',
      'project': 'bg-purple-100 text-purple-700',
      'lead': 'bg-green-100 text-green-700',
      'client': 'bg-yellow-100 text-yellow-700',
      'retainer': 'bg-orange-100 text-orange-700',
      'partner': 'bg-pink-100 text-pink-700',
      'goal': 'bg-indigo-100 text-indigo-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Workflows</h3>
            <span className="text-sm text-gray-500">({workflows.length})</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {entityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
          </div>
        </div>
      </div>

      {/* Workflow List */}
      <div className="divide-y divide-gray-200">
        {workflows.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No workflows found. Create your first workflow!</p>
          </div>
        ) : (
          workflows.map((workflow) => (
            <div key={workflow._id} className="p-4 hover:bg-gray-50 transition-colors">
              <div 
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => toggleExpand(workflow._id)}
              >
                {/* Expand Icon */}
                <div className="mt-1">
                  {expanded[workflow._id] ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-gray-800">{workflow.name}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getEntityTypeColor(workflow.entityType)}`}>
                      {getEntityTypeLabel(workflow.entityType)}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      workflow.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {workflow.isDefault && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
                  
                  {/* Stage Preview */}
                  <div className="mt-2 flex items-center gap-2">
                    {workflow.stages?.sort((a, b) => a.order - b.order).map((stage, idx) => (
                      <div key={idx} className="flex items-center">
                        <div 
                          className="px-2 py-0.5 text-xs rounded-full text-white"
                          style={{ backgroundColor: getStageColor(stage.color) }}
                        >
                          {stage.name}
                        </div>
                        {idx < workflow.stages.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-gray-300 mx-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => toggleStatus(workflow._id, workflow.isActive)}
                    className="p-1.5 hover:bg-gray-100 rounded"
                  >
                    {workflow.isActive ? (
                      <Pause className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded">
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded">
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button 
                    onClick={() => deleteWorkflow(workflow._id)}
                    className="p-1.5 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expanded[workflow._id] && (
                <div className="ml-8 mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 mb-1">Stages</h5>
                      <div className="space-y-1">
                        {workflow.stages?.sort((a, b) => a.order - b.order).map((stage, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getStageColor(stage.color) }}
                            />
                            <span className="text-gray-700">{stage.name}</span>
                            <span className="text-xs text-gray-400">(Order: {stage.order})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 mb-1">Transitions</h5>
                      <div className="space-y-1">
                        {workflow.transitions?.map((transition, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-700">{transition.fromStage}</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-700">{transition.toStage}</span>
                            <span className="text-xs text-gray-400">({transition.label})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkflowList;