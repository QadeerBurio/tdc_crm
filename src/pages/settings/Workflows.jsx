import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Edit, Trash2, Copy, Play,
  Settings, ArrowRight, Circle, CheckCircle,
  XCircle, AlertCircle, GripVertical
} from 'lucide-react';

const Workflows = () => {
  const { api } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await api.get('/workflows');
      setWorkflows(response.data.data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
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

  const getStageColor = (color) => {
    return color || '#3B82F6';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Workflows</h2>
          <p className="text-gray-500 mt-1">Define and manage customizable workflows</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <div key={workflow._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-800">{workflow.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    workflow.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                    {getEntityTypeLabel(workflow.entityType)}
                  </span>
                  {workflow.isDefault && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
                
                {/* Stages Preview */}
                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2">
                  {workflow.stages?.map((stage, idx) => (
                    <div key={idx} className="flex items-center">
                      <div 
                        className="px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1"
                        style={{ backgroundColor: getStageColor(stage.color) }}
                      >
                        <Circle className="w-3 h-3" />
                        {stage.name}
                      </div>
                      {idx < workflow.stages.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-gray-300 mx-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <Play className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1.5 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {workflows.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No workflows found</h3>
          <p className="text-gray-400 mt-1">Create your first workflow to automate processes</p>
        </div>
      )}
    </div>
  );
};

export default Workflows;