import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Plus, Edit, Trash2, GripVertical,
  Check, X, ArrowUp, ArrowDown,
  Circle, Eye, Copy, MoveVertical
} from 'lucide-react';

const StageManager = ({ 
  stages, 
  onStagesChange, 
  readOnly = false,
  className = '' 
}) => {
  const [editingStage, setEditingStage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStage, setNewStage] = useState({
    name: '',
    description: '',
    order: stages.length,
    color: '#3B82F6'
  });

  const handleAddStage = () => {
    if (!newStage.name.trim()) {
      alert('Stage name is required');
      return;
    }
    const stage = {
      id: `stage-${Date.now()}`,
      ...newStage,
      order: stages.length
    };
    onStagesChange([...stages, stage]);
    setNewStage({ name: '', description: '', order: stages.length, color: '#3B82F6' });
    setShowAddModal(false);
  };

  const handleDeleteStage = (id) => {
    if (stages.length <= 2) {
      alert('Workflow must have at least 2 stages');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this stage?')) return;
    onStagesChange(stages.filter(s => s.id !== id));
  };

  const handleUpdateStage = (id, updates) => {
    onStagesChange(stages.map(s => s.id === id ? { ...s, ...updates } : s));
    setEditingStage(null);
  };

  const moveStage = (id, direction) => {
    const index = stages.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === stages.length - 1) return;
    
    const newStages = [...stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
    // Update order
    newStages.forEach((s, i) => s.order = i);
    onStagesChange(newStages);
  };

  const getStageColor = (color) => {
    return color || '#3B82F6';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Stage Manager</h3>
          {!readOnly && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Stage
            </button>
          )}
        </div>
      </div>

      {/* Stage List */}
      <div className="p-4 space-y-2">
        {stages.sort((a, b) => a.order - b.order).map((stage, index) => (
          <div 
            key={stage.id} 
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              editingStage === stage.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Drag Handle */}
            <div className="cursor-move text-gray-400 hover:text-gray-600">
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Color Indicator */}
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getStageColor(stage.color) }}
            />

            {/* Content */}
            {editingStage === stage.id ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  defaultValue={stage.name}
                  placeholder="Stage name"
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateStage(stage.id, { name: e.target.value });
                    }
                    if (e.key === 'Escape') {
                      setEditingStage(null);
                    }
                  }}
                />
                <input
                  type="color"
                  defaultValue={stage.color}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  onChange={(e) => handleUpdateStage(stage.id, { color: e.target.value })}
                />
                <button
                  onClick={() => handleUpdateStage(stage.id, { name: stage.name })}
                  className="p-1 hover:bg-green-100 rounded text-green-600"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingStage(null)}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{stage.name}</span>
                  <span className="text-xs text-gray-400">#{index + 1}</span>
                </div>
                {stage.description && (
                  <p className="text-xs text-gray-500">{stage.description}</p>
                )}
              </div>
            )}

            {/* Actions */}
            {!readOnly && editingStage !== stage.id && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveStage(stage.id, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => moveStage(stage.id, 'down')}
                  disabled={index === stages.length - 1}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowDown className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setEditingStage(stage.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => handleDeleteStage(stage.id)}
                  className="p-1 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Stage Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Stage</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Stage Name *</label>
                <input
                  type="text"
                  value={newStage.name}
                  onChange={(e) => setNewStage(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter stage name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newStage.description}
                  onChange={(e) => setNewStage(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Stage description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <input
                  type="color"
                  value={newStage.color}
                  onChange={(e) => setNewStage(prev => ({ ...prev, color: e.target.value }))}
                  className="mt-1 w-20 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Stage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageManager;