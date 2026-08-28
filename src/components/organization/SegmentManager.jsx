import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import {
  Layers, Plus, Edit, Trash2, Eye,
  Building2, Users, Briefcase, Check,
  X, RefreshCw, Filter, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const SegmentManager = () => {
  const { token } = useContext(AuthContext);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [search, setSearch] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'service',
    businessModel: 'project_based',
    color: '#3B82F6',
    status: 'active'
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  // Get headers with token
  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchSegments();
  }, [search]);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/organization/segments`, {
        headers: getHeaders(),
        params: { search: search || undefined }
      });
      setSegments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching segments:', error);
      toast.error('Failed to load segments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Segment name is required');
      return;
    }

    try {
      const url = editingSegment 
        ? `${API_URL}/organization/segments/${editingSegment._id}`
        : `${API_URL}/organization/segments`;
      
      const method = editingSegment ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: getHeaders()
      });
      
      toast.success(editingSegment ? 'Segment updated successfully' : 'Segment created successfully');
      setShowModal(false);
      setEditingSegment(null);
      setFormData({
        name: '',
        description: '',
        type: 'service',
        businessModel: 'project_based',
        color: '#3B82F6',
        status: 'active'
      });
      fetchSegments();
    } catch (error) {
      console.error('Error saving segment:', error);
      toast.error(error.response?.data?.message || 'Failed to save segment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this segment?')) return;
    try {
      await axios.delete(`${API_URL}/organization/segments/${id}`, {
        headers: getHeaders()
      });
      toast.success('Segment deleted successfully');
      fetchSegments();
    } catch (error) {
      console.error('Error deleting segment:', error);
      toast.error('Failed to delete segment');
    }
  };

  const openModal = (segment = null) => {
    if (segment) {
      setEditingSegment(segment);
      setFormData({
        name: segment.name || '',
        description: segment.description || '',
        type: segment.type || 'service',
        businessModel: segment.businessModel || 'project_based',
        color: segment.color || '#3B82F6',
        status: segment.status || 'active'
      });
    } else {
      setEditingSegment(null);
      setFormData({
        name: '',
        description: '',
        type: 'service',
        businessModel: 'project_based',
        color: '#3B82F6',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const getBusinessModelBadge = (model) => {
    const colors = {
      'project_based': 'bg-blue-100 text-blue-700',
      'retainer_based': 'bg-green-100 text-green-700',
      'product_based': 'bg-purple-100 text-purple-700',
      'hybrid': 'bg-yellow-100 text-yellow-700'
    };
    return colors[model] || 'bg-gray-100 text-gray-700';
  };

  const getBusinessModelLabel = (model) => {
    const labels = {
      'project_based': 'Project Based',
      'retainer_based': 'Retainer Based',
      'product_based': 'Product Based',
      'hybrid': 'Hybrid'
    };
    return labels[model] || model;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'agency': Building2,
      'product': Briefcase,
      'service': Layers,
      'app': Users,
      'outreach': Users,
      'other': Layers
    };
    const Icon = icons[type] || Layers;
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

  const getAdminName = (admin) => {
    if (!admin) return 'No Admin';
    if (typeof admin === 'object') {
      return `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.name || 'Unknown';
    }
    return 'Unknown';
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
          <h2 className="text-xl font-semibold text-gray-800">Segments</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your business segments</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search segments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-56"
            />
          </div>
          <button
            onClick={fetchSegments}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button 
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Segment
          </button>
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((segment) => {
          const Icon = getTypeIcon(segment.type);
          const statusColor = getStatusColor(segment.status);
          
          return (
            <div 
              key={segment._id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: segment.color || '#3B82F6' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{segment.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{segment.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => openModal(segment)}
                  >
                    <Edit className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                  </button>
                  <button 
                    className="p-1 hover:bg-red-50 rounded transition-colors"
                    onClick={() => handleDelete(segment._id)}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
              
              {segment.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{segment.description}</p>
              )}
              
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {segment.businessModel && (
                  <span className={`px-2 py-1 text-xs rounded-full ${getBusinessModelBadge(segment.businessModel)}`}>
                    {getBusinessModelLabel(segment.businessModel)}
                  </span>
                )}
                <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                  {segment.status || 'active'}
                </span>
              </div>
              
              {segment.adminId && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Admin: {getAdminName(segment.adminId)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No Segments Found</h3>
          <p className="text-sm mt-1">Create your first business segment to get started</p>
          <button 
            onClick={() => openModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Segment
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSegment ? 'Edit Segment' : 'Create New Segment'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Segment Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g., Technology, Marketing, Operations"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  rows="3" 
                  placeholder="Brief description of this segment"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="agency">Agency</option>
                    <option value="product">Product</option>
                    <option value="service">Service</option>
                    <option value="app">App</option>
                    <option value="outreach">Outreach</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Business Model <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.businessModel}
                    onChange={(e) => setFormData({ ...formData, businessModel: e.target.value })}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="project_based">Project Based</option>
                    <option value="retainer_based">Retainer Based</option>
                    <option value="product_based">Product Based</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <div className="flex items-center gap-3 mt-1">
                  <input 
                    type="color" 
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer p-1"
                  />
                  <span className="text-sm text-gray-500">{formData.color}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="archived">Archived</option>
                </select>
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
                  <Check className="w-4 h-4" />
                  {editingSegment ? 'Update Segment' : 'Create Segment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentManager;