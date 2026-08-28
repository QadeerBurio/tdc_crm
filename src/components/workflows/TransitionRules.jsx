import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight, Plus, Edit, Trash2,
  Check, X, Settings, Users,
  AlertCircle, Clock, Zap
} from 'lucide-react';

const TransitionRules = ({ 
  transitions, 
  stages,
  onTransitionsChange,
  readOnly = false,
  className = '' 
}) => {
  const [editingTransition, setEditingTransition] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransition, setNewTransition] = useState({
    fromStage: '',
    toStage: '',
    label: '',
    condition: '',
    requiredPermissions: []
  });

  const handleAddTransition = () => {
    if (!newTransition.fromStage || !newTransition.toStage) {
      alert('From and To stages are required');
      return;
    }
    if (newTransition.fromStage === newTransition.toStage) {
      alert('From and To stages must be different');
      return;
    }
    const transition = {
      id: `transition-${Date.now()}`,
      ...newTransition,
      requiredPermissions: newTransition.requiredPermissions || []
    };
    onTransitionsChange([...transitions, transition]);
    setNewTransition({ fromStage: '', toStage: '', label: '', condition: '', requiredPermissions: [] });
    setShowAddModal(false);
  };

  const handleDeleteTransition = (id) => {
    if (!window.confirm('Are you sure you want to delete this transition?')) return;
    onTransitionsChange(transitions.filter(t => t.id !== id));
  };

  const handleUpdateTransition = (id, updates) => {
    onTransitionsChange(transitions.map(t => t.id === id ? { ...t, ...updates } : t));
    setEditingTransition(null);
  };

  const getStageName = (id) => {
    const stage = stages.find(s => s.id === id);
    return stage?.name || 'Unknown';
  };

  const getStageColor = (id) => {
    const stage = stages.find(s => s.id === id);
    return stage?.color || '#6B7280';
  };

  const permissionOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'employee', label: 'Employee' },
    { value: 'client', label: 'Client' }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Transition Rules</h3>
          {!readOnly && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Transition
            </button>
          )}
        </div>
      </div>

      {/* Transitions List */}
      <div className="p-4 space-y-3">
        {transitions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ArrowRight className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No transitions defined</p>
            <p className="text-sm">Add transitions to define workflow paths</p>
          </div>
        ) : (
          transitions.map((transition) => (
            <div 
              key={transition.id} 
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                editingTransition === transition.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* From Stage */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStageColor(transition.fromStage) }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {getStageName(transition.fromStage)}
                </span>
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-gray-400" />
                {transition.label && (
                  <span className="text-xs text-gray-400">{transition.label}</span>
                )}
              </div>

              {/* To Stage */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStageColor(transition.toStage) }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {getStageName(transition.toStage)}
                </span>
              </div>

              {/* Condition */}
              {transition.condition && (
                <div className="flex-1 text-xs text-gray-500 truncate max-w-xs">
                  <span className="font-medium">Condition:</span> {transition.condition}
                </div>
              )}

              {/* Permissions */}
              {transition.requiredPermissions && transition.requiredPermissions.length > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <Users className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-500">
                    {transition.requiredPermissions.map(p => p.replace('_', ' ')).join(', ')}
                  </span>
                </div>
              )}

              {/* Actions */}
              {!readOnly && editingTransition !== transition.id && (
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => setEditingTransition(transition.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteTransition(transition.id)}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              )}

              {/* Edit Mode */}
              {editingTransition === transition.id && (
                <div className="flex-1 flex items-center gap-2">
                  <select
                    value={transition.fromStage}
                    onChange={(e) => handleUpdateTransition(transition.id, { fromStage: e.target.value })}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {stages.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <select
                    value={transition.toStage}
                    onChange={(e) => handleUpdateTransition(transition.id, { toStage: e.target.value })}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {stages.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={transition.label || ''}
                    onChange={(e) => handleUpdateTransition(transition.id, { label: e.target.value })}
                    placeholder="Label"
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                  />
                  <button
                    onClick={() => setEditingTransition(null)}
                    className="p-1 hover:bg-green-100 rounded text-green-600"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingTransition(null)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Transition Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Transition</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">From Stage *</label>
                <select
                  value={newTransition.fromStage}
                  onChange={(e) => setNewTransition(prev => ({ ...prev, fromStage: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select stage</option>
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">To Stage *</label>
                <select
                  value={newTransition.toStage}
                  onChange={(e) => setNewTransition(prev => ({ ...prev, toStage: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select stage</option>
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Label</label>
                <input
                  type="text"
                  value={newTransition.label}
                  onChange={(e) => setNewTransition(prev => ({ ...prev, label: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Approve, Reject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Condition</label>
                <input
                  type="text"
                  value={newTransition.condition}
                  onChange={(e) => setNewTransition(prev => ({ ...prev, condition: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., task.completed === true"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Required Permissions</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {permissionOptions.map(perm => (
                    <label key={perm.value} className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={newTransition.requiredPermissions?.includes(perm.value)}
                        onChange={(e) => {
                          const perms = e.target.checked 
                            ? [...(newTransition.requiredPermissions || []), perm.value]
                            : (newTransition.requiredPermissions || []).filter(p => p !== perm.value);
                          setNewTransition(prev => ({ ...prev, requiredPermissions: perms }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTransition}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Transition
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransitionRules;