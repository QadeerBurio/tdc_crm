import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Play, Pause, Check, X, ArrowRight,
  Clock, AlertCircle, CheckCircle,
  RefreshCw, Eye, Settings, Zap
} from 'lucide-react';

const WorkflowExecutor = ({ 
  entityType, 
  entityId, 
  workflowId,
  onComplete,
  className = '' 
}) => {
  const { api } = useAuth();
  const [workflow, setWorkflow] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [availableTransitions, setAvailableTransitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (entityType && entityId) {
      fetchWorkflowStatus();
    }
  }, [entityType, entityId, workflowId]);

  const fetchWorkflowStatus = async () => {
    try {
      const response = await api.get(`/workflows/status/${entityType}/${entityId}`);
      const data = response.data.data;
      setWorkflow(data);
      setCurrentStage(data.currentStage);
      setAvailableTransitions(data.availableTransitions || []);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching workflow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeTransition = async (fromStage, toStage) => {
    setExecuting(true);
    try {
      await api.post('/workflows/transition', {
        workflowId: workflow?.workflow?.id,
        fromStage,
        toStage,
        entityType,
        entityId
      });
      
      // Refresh status
      await fetchWorkflowStatus();
      
      if (onComplete) {
        onComplete({ fromStage, toStage });
      }
    } catch (error) {
      console.error('Error executing transition:', error);
      alert('Failed to execute transition');
    } finally {
      setExecuting(false);
    }
  };

  const getStageColor = (color) => {
    return color || '#6B7280';
  };

  const getTransitionStatus = (fromStage, toStage) => {
    const completed = history.some(h => h.fromStage === fromStage && h.toStage === toStage);
    return completed ? 'completed' : 'pending';
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p>No workflow configured for this entity</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-800">{workflow.workflow?.name || 'Workflow'}</h3>
              <p className="text-xs text-gray-500">{entityType} workflow</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchWorkflowStatus}
              className="p-1.5 hover:bg-gray-100 rounded"
              disabled={executing}
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${executing ? 'animate-spin' : ''}`} />
            </button>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              workflow.workflow?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {workflow.workflow?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Workflow Visual */}
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {workflow.stages?.sort((a, b) => a.order - b.order).map((stage, index) => {
            const isCurrent = currentStage === stage.name;
            const isCompleted = history.some(h => h.toStage === stage.name);
            const transitions = workflow.transitions?.filter(t => t.fromStage === stage.name) || [];
            
            return (
              <div key={stage.id} className="flex items-center">
                <div 
                  className={`p-4 rounded-lg border-2 min-w-[120px] text-center transition-all ${
                    isCurrent ? 'border-blue-500 shadow-md bg-blue-50' :
                    isCompleted ? 'border-green-500 bg-green-50' :
                    'border-gray-200 bg-white'
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: getStageColor(stage.color) }}
                  />
                  <div className="font-medium text-gray-800 text-sm">{stage.name}</div>
                  <div className="text-xs text-gray-400 mt-1">#{index + 1}</div>
                  {isCurrent && (
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-500">Current</span>
                    </div>
                  )}
                  {isCompleted && !isCurrent && (
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">Completed</span>
                    </div>
                  )}
                </div>

                {/* Transitions to next stages */}
                {index < workflow.stages.length - 1 && (
                  <div className="flex flex-col items-center mx-2">
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                    {transitions.map((transition, idx) => {
                      const status = getTransitionStatus(transition.fromStage, transition.toStage);
                      return (
                        <button
                          key={idx}
                          onClick={() => executeTransition(transition.fromStage, transition.toStage)}
                          disabled={executing || status === 'completed' || !isCurrent}
                          className={`mt-1 px-2 py-0.5 text-xs rounded-full transition-colors ${
                            status === 'completed' ? 'bg-green-100 text-green-700 cursor-default' :
                            isCurrent ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer' :
                            'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {status === 'completed' ? (
                            <Check className="w-3 h-3 inline" />
                          ) : (
                            transition.label || 'Transition'
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {currentStage ? (
              <span>Current stage: <span className="font-medium text-gray-600">{currentStage}</span></span>
            ) : (
              <span>Workflow not started</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentStage && (
              <button
                onClick={() => {
                  // View entity details
                  window.location.href = `/${entityType}s/${entityId}`;
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                View Entity
              </button>
            )}
            <button
              onClick={fetchWorkflowStatus}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
              disabled={executing}
            >
              <RefreshCw className={`w-4 h-4 ${executing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="px-4 pb-4">
          <div className="text-xs text-gray-500 mb-2">Workflow History</div>
          <div className="space-y-1">
            {history.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">{item.fromStage}</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">{item.toStage}</span>
                {item.user && (
                  <span className="text-gray-400">by {item.user}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowExecutor;