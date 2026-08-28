import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle, Clock, AlertCircle, Plus,
  Edit, Trash2, Eye, Download,
  Filter, Search, Calendar, Users,
  FileText, X, Save
} from 'lucide-react';

const DeliverableTracker = ({ retainerId }) => {
  const { api } = useAuth();
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    assignedTo: 'all'
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (retainerId) {
      fetchDeliverables();
      fetchUsers();
    }
  }, [retainerId, filters]);

  const fetchDeliverables = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.assignedTo !== 'all') params.append('assignedTo', filters.assignedTo);
      
      const response = await api.get(`/retainers/${retainerId}/deliverables?${params.toString()}`);
      setDeliverables(response.data.data);
    } catch (error) {
      console.error('Error fetching deliverables:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'submitted': 'bg-yellow-100 text-yellow-700',
      'approved': 'bg-green-100 text-green-700',
      'revision_requested': 'bg-red-100 text-red-700',
      'completed': 'bg-emerald-100 text-emerald-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed' || status === 'approved') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === 'submitted') return <Clock className="w-4 h-4 text-yellow-600" />;
    if (status === 'revision_requested') return <AlertCircle className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'revision_requested', label: 'Revision Requested' },
    { value: 'completed', label: 'Completed' }
  ];

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/retainers/deliverables/${id}`, { status: newStatus });
      fetchDeliverables();
    } catch (error) {
      console.error('Error updating deliverable status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-800">Deliverables</h4>
            <span className="text-sm text-gray-400">({deliverables.length})</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search deliverables..."
                className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setEditingDeliverable(null);
                setShowModal(true);
              }}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Deliverables List */}
      <div className="divide-y divide-gray-200">
        {deliverables.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No deliverables found</p>
            <p className="text-sm">Add your first deliverable</p>
          </div>
        ) : (
          deliverables.map((deliverable) => (
            <div key={deliverable._id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1">{getStatusIcon(deliverable.status)}</div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="font-medium text-gray-800">{deliverable.name}</h5>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(deliverable.status)}`}>
                      {deliverable.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-1">{deliverable.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {deliverable.assignedTo?.firstName} {deliverable.assignedTo?.lastName || 'Unassigned'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                    </span>
                    {deliverable.quantity && (
                      <span>Qty: {deliverable.quantity} {deliverable.unit}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <select
                    value={deliverable.status}
                    onChange={(e) => handleStatusChange(deliverable._id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.filter(s => s.value !== 'all').map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                  <button 
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => {
                      setEditingDeliverable(deliverable);
                      setShowModal(true);
                    }}
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>

              {/* Revision Notes */}
              {deliverable.revisionNotes && deliverable.revisionNotes.length > 0 && (
                <div className="mt-2 ml-8">
                  <div className="text-xs text-gray-400 mb-1">Revision Notes:</div>
                  {deliverable.revisionNotes.map((note, idx) => (
                    <div key={idx} className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200 mb-1">
                      {note.note}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">
                {editingDeliverable ? 'Edit Deliverable' : 'Add Deliverable'}
              </h4>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  defaultValue={editingDeliverable?.name}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  defaultValue={editingDeliverable?.description}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                  <select
                    defaultValue={editingDeliverable?.assignedTo}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                  <input
                    type="date"
                    defaultValue={editingDeliverable?.dueDate?.split('T')[0]}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    defaultValue={editingDeliverable?.quantity || 1}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    defaultValue={editingDeliverable?.unit}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., posts, hours"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingDeliverable ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverableTracker;