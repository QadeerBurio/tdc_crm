import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Plus, Save, X, Edit, Trash2, Copy,
  ArrowRight, ArrowLeft, Settings, Eye,
  GripVertical, Check, AlertCircle,
  MoveHorizontal, MoveVertical, ZoomIn, ZoomOut,
  Undo, Redo, Play, Pause
} from 'lucide-react';

const WorkflowBuilder = ({ 
  workflow, 
  onSave, 
  onCancel, 
  isOpen,
  readOnly = false
}) => {
  const { api } = useAuth();
  const [stages, setStages] = useState(workflow?.stages || [
    { id: 'stage-1', name: 'Start', order: 0, color: '#10B981', description: 'Beginning of workflow' },
    { id: 'stage-2', name: 'In Progress', order: 1, color: '#3B82F6', description: 'Work in progress' },
    { id: 'stage-3', name: 'Review', order: 2, color: '#F59E0B', description: 'Under review' },
    { id: 'stage-4', name: 'Complete', order: 3, color: '#10B981', description: 'Workflow completed' }
  ]);
  const [transitions, setTransitions] = useState(workflow?.transitions || [
    { from: 'stage-1', to: 'stage-2', label: 'Start Work', condition: '' },
    { from: 'stage-2', to: 'stage-3', label: 'Submit for Review', condition: '' },
    { from: 'stage-3', to: 'stage-4', label: 'Approve', condition: '' },
    { from: 'stage-3', to: 'stage-2', label: 'Request Changes', condition: '' }
  ]);
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedTransition, setSelectedTransition] = useState(null);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [stageIdCounter, setStageIdCounter] = useState(5);

  const addStage = () => {
    const newStage = {
      id: `stage-${stageIdCounter}`,
      name: `Stage ${stageIdCounter}`,
      order: stages.length,
      color: '#6B7280',
      description: 'New stage'
    };
    setStages([...stages, newStage]);
    setStageIdCounter(stageIdCounter + 1);
  };

  const updateStage = (id, updates) => {
    setStages(stages.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteStage = (id) => {
    if (stages.length <= 2) {
      alert('Workflow must have at least 2 stages');
      return;
    }
    setStages(stages.filter(s => s.id !== id));
    setTransitions(transitions.filter(t => t.from !== id && t.to !== id));
  };

  const addTransition = () => {
    const newTransition = {
      from: stages[0]?.id || '',
      to: stages[1]?.id || '',
      label: 'Transition',
      condition: ''
    };
    setTransitions([...transitions, newTransition]);
  };

  const updateTransition = (index, updates) => {
    const newTransitions = [...transitions];
    newTransitions[index] = { ...newTransitions[index], ...updates };
    setTransitions(newTransitions);
  };

  const deleteTransition = (index) => {
    setTransitions(transitions.filter((_, i) => i !== index));
  };

  const getStageColor = (color) => {
    return color || '#6B7280';
  };

  const getStagesByOrder = () => {
    return [...stages].sort((a, b) => a.order - b.order);
  };

  const getStageName = (id) => {
    const stage = stages.find(s => s.id === id);
    return stage?.name || 'Unknown';
  };

  const validateWorkflow = () => {
    // Check if all stages have names
    const unnamedStages = stages.filter(s => !s.name.trim());
    if (unnamedStages.length > 0) {
      alert('All stages must have names');
      return false;
    }

    // Check if all transitions have valid stages
    const invalidTransitions = transitions.filter(
      t => !stages.find(s => s.id === t.from) || !stages.find(s => s.id === t.to)
    );
    if (invalidTransitions.length > 0) {
      alert('Some transitions reference invalid stages');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateWorkflow()) return;
    const workflowData = {
      ...workflow,
      stages,
      transitions,
      isActive: true
    };
    onSave(workflowData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">
            {workflow ? 'Edit Workflow' : 'Create New Workflow'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button className="px-3 py-1.5 hover:bg-gray-50 transition-colors">
              <Undo className="w-4 h-4 text-gray-500" />
            </button>
            <button className="px-3 py-1.5 hover:bg-gray-50 transition-colors border-l border-gray-300">
              <Redo className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button 
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="px-2 py-1.5 hover:bg-gray-50 transition-colors border-r border-gray-300"
            >
              <ZoomOut className="w-4 h-4 text-gray-500" />
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="px-2 py-1.5 hover:bg-gray-50 transition-colors border-l border-gray-300"
            >
              <ZoomIn className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Workflow
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar - Stage List */}
          <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-700">Stages</h3>
                <button
                  onClick={addStage}
                  className="p-1 hover:bg-gray-100 rounded"
                  disabled={readOnly}
                >
                  <Plus className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>
            <div className="p-2 space-y-2">
              {getStagesByOrder().map((stage) => (
                <div
                  key={stage.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedStage === stage.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedStage(stage.id)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getStageColor(stage.color) }}
                    />
                    <span className="font-medium text-gray-800 flex-1">{stage.name}</span>
                    <button
                      className="p-1 hover:bg-gray-200 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStage(stage.id);
                        setShowStageModal(true);
                      }}
                      disabled={readOnly}
                    >
                      <Edit className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      className="p-1 hover:bg-red-50 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStage(stage.id);
                      }}
                      disabled={readOnly}
                    >
                      <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stage.description}</p>
                  <div className="text-xs text-gray-400 mt-1">Order: {stage.order}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas - Workflow Visualization */}
          <div className="flex-1 p-6 overflow-auto">
            <div 
              className="relative min-h-[500px] bg-white rounded-xl shadow-inner border border-gray-200 p-6"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
              {/* Stage Nodes */}
              <div className="flex flex-wrap justify-center items-center gap-8 min-h-[400px]">
                {getStagesByOrder().map((stage, index) => (
                  <div key={stage.id} className="flex items-center">
                    <div 
                      className="w-48 p-4 rounded-lg border-2 shadow-sm cursor-pointer hover:shadow-md transition-all"
                      style={{ 
                        borderColor: getStageColor(stage.color),
                        backgroundColor: `${getStageColor(stage.color)}10`
                      }}
                      onClick={() => setSelectedStage(stage.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getStageColor(stage.color) }}
                          />
                          <span className="font-medium text-gray-800">{stage.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">#{stage.order + 1}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stage.description}</p>
                    </div>
                    
                    {/* Arrow to next stage */}
                    {index < getStagesByOrder().length - 1 && (
                      <div className="flex items-center mx-2">
                        <ArrowRight className="w-6 h-6 text-gray-300" />
                        {/* Show transition label */}
                        {transitions.find(t => 
                          t.from === stage.id && 
                          t.to === getStagesByOrder()[index + 1].id
                        ) && (
                          <div className="absolute mt-8 text-xs text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {transitions.find(t => 
                              t.from === stage.id && 
                              t.to === getStagesByOrder()[index + 1].id
                            )?.label || 'Transition'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Stage Button */}
              <button
                onClick={addStage}
                className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                disabled={readOnly}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Edit Modal */}
      {showStageModal && selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowStageModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Stage</h3>
              <button onClick={() => setShowStageModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {(() => {
              const stage = stages.find(s => s.id === selectedStage);
              if (!stage) return null;
              
              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stage Name</label>
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => updateStage(selectedStage, { name: e.target.value })}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={stage.description}
                      onChange={(e) => updateStage(selectedStage, { description: e.target.value })}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Color</label>
                    <input
                      type="color"
                      value={stage.color}
                      onChange={(e) => updateStage(selectedStage, { color: e.target.value })}
                      className="mt-1 w-20 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order</label>
                    <input
                      type="number"
                      value={stage.order}
                      onChange={(e) => updateStage(selectedStage, { order: parseInt(e.target.value) })}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => setShowStageModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;