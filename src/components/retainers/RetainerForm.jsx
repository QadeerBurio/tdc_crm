import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X, Plus, Trash2, DollarSign, Calendar,
  Users, Save, FileText, Clock, AlertCircle
} from 'lucide-react';

const RetainerForm = ({ 
  retainer, 
  onSave, 
  onCancel, 
  isOpen 
}) => {
  const { api } = useAuth();
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    description: '',
    monthlyValue: 0,
    currency: 'USD',
    startDate: new Date().toISOString().split('T')[0],
    renewalDate: '',
    services: [{ name: '', description: '', value: 0 }],
    monthlyDeliverables: [{ name: '', quantity: 1, unit: '', dueDate: '' }],
    accountManagerId: '',
    team: []
  });

  useEffect(() => {
    fetchClients();
    fetchUsers();
    if (retainer) {
      setFormData({
        ...retainer,
        startDate: retainer.startDate ? new Date(retainer.startDate).toISOString().split('T')[0] : '',
        renewalDate: retainer.renewalDate ? new Date(retainer.renewalDate).toISOString().split('T')[0] : ''
      });
    }
  }, [retainer]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index][field] = value;
    setFormData(prev => ({ ...prev, services: newServices }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { name: '', description: '', value: 0 }]
    }));
  };

  const removeService = (index) => {
    if (formData.services.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleDeliverableChange = (index, field, value) => {
    const newDeliverables = [...formData.monthlyDeliverables];
    newDeliverables[index][field] = value;
    setFormData(prev => ({ ...prev, monthlyDeliverables: newDeliverables }));
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      monthlyDeliverables: [...prev.monthlyDeliverables, { name: '', quantity: 1, unit: '', dueDate: '' }]
    }));
  };

  const removeDeliverable = (index) => {
    if (formData.monthlyDeliverables.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      monthlyDeliverables: prev.monthlyDeliverables.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving retainer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {retainer ? 'Edit Retainer' : 'Create New Retainer'}
            </h2>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Retainer Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Monthly SEO Package"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Client *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleChange('clientId', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>{client.companyName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe the retainer scope and services"
              />
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Value *</label>
                <input
                  type="number"
                  value={formData.monthlyValue}
                  onChange={(e) => handleChange('monthlyValue', parseFloat(e.target.value))}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="PKR">PKR</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Renewal Date</label>
                <input
                  type="date"
                  value={formData.renewalDate}
                  onChange={(e) => handleChange('renewalDate', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Services</label>
                <button
                  type="button"
                  onClick={addService}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Service
                </button>
              </div>
              <div className="space-y-2">
                {formData.services.map((service, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Service name"
                    />
                    <input
                      type="number"
                      value={service.value}
                      onChange={(e) => handleServiceChange(index, 'value', parseFloat(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="p-1 hover:bg-red-50 rounded text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Deliverables */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Monthly Deliverables</label>
                <button
                  type="button"
                  onClick={addDeliverable}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Deliverable
                </button>
              </div>
              <div className="space-y-2">
                {formData.monthlyDeliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={deliverable.name}
                      onChange={(e) => handleDeliverableChange(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Deliverable name"
                    />
                    <input
                      type="number"
                      value={deliverable.quantity}
                      onChange={(e) => handleDeliverableChange(index, 'quantity', parseInt(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Qty"
                    />
                    <input
                      type="text"
                      value={deliverable.unit}
                      onChange={(e) => handleDeliverableChange(index, 'unit', e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Unit"
                    />
                    <input
                      type="date"
                      value={deliverable.dueDate}
                      onChange={(e) => handleDeliverableChange(index, 'dueDate', e.target.value)}
                      className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeDeliverable(index)}
                      className="p-1 hover:bg-red-50 rounded text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Team */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Manager</label>
              <select
                value={formData.accountManagerId}
                onChange={(e) => handleChange('accountManagerId', e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Account Manager</option>
                {users.filter(u => u.role === 'manager' || u.role === 'admin').map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {retainer ? 'Update Retainer' : 'Create Retainer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RetainerForm;