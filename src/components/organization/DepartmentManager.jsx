import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import {
  Users, Plus, Edit, Trash2, RefreshCw,
  Search, X, Building2, UserPlus, Layers,
  Check, ArrowRight, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const DepartmentManager = () => {
  const { token } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSegment, setFilterSegment] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    segmentId: '',
    description: '',
    headId: '',
    status: 'active'
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  // Get headers with token
  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchData();
  }, [search, filterSegment]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptsRes, segsRes] = await Promise.all([
        axios.get(`${API_URL}/organization/departments`, {
          headers: getHeaders(),
          params: { search: search || undefined, segmentId: filterSegment !== 'all' ? filterSegment : undefined }
        }),
        axios.get(`${API_URL}/organization/segments`, {
          headers: getHeaders()
        })
      ]);
      setDepartments(deptsRes.data.data || []);
      setSegments(segsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Department name is required');
      return;
    }
    
    if (!formData.segmentId) {
      toast.error('Please select a segment');
      return;
    }

    try {
      const url = editingDept 
        ? `${API_URL}/organization/departments/${editingDept._id}`
        : `${API_URL}/organization/departments`;
      
      const method = editingDept ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: getHeaders()
      });
      
      toast.success(editingDept ? 'Department updated successfully' : 'Department created successfully');
      setShowModal(false);
      setEditingDept(null);
      setFormData({ name: '', segmentId: '', description: '', headId: '', status: 'active' });
      fetchData();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(error.response?.data?.message || 'Failed to save department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await axios.delete(`${API_URL}/organization/departments/${id}`, {
        headers: getHeaders()
      });
      toast.success('Department deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    }
  };

  const openModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name || '',
        segmentId: dept.segmentId || '',
        description: dept.description || '',
        headId: dept.headId?._id || dept.headId || '',
        status: dept.status || 'active'
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        segmentId: '',
        description: '',
        headId: '',
        status: 'active'
      });
    }
    setShowModal(true);
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

  const getSegmentName = (segmentId) => {
    const segment = segments.find(s => s._id === segmentId);
    return segment?.name || 'Unknown';
  };

  const getHeadName = (head) => {
    if (!head) return 'No Head';
    if (typeof head === 'object') {
      return `${head.firstName || ''} ${head.lastName || ''}`.trim() || head.name || 'Unknown';
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
          <h2 className="text-xl font-semibold text-gray-800">Departments</h2>
          <p className="text-sm text-gray-500 mt-1">Manage departments across segments</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-56"
            />
          </div>
          <select
            value={filterSegment}
            onChange={(e) => setFilterSegment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Segments</option>
            {segments.map(seg => (
              <option key={seg._id} value={seg._id}>{seg.name}</option>
            ))}
          </select>
          <button
            onClick={fetchData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button 
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Department
          </button>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                  <p className="text-sm text-gray-500">{getSegmentName(dept.segmentId)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  onClick={() => openModal(dept)}
                >
                  <Edit className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                </button>
                <button 
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                  onClick={() => handleDelete(dept._id)}
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
            
            {dept.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{dept.description}</p>
            )}
            
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(dept.status)}`}>
                {dept.status || 'active'}
              </span>
              {dept.headId && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                  Head: {getHeadName(dept.headId)}
                </span>
              )}
              {dept.members && dept.members.length > 0 && (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                  {dept.members.length} members
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No Departments Found</h3>
          <p className="text-sm mt-1">Create your first department to get started</p>
          <button 
            onClick={() => openModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Department
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
                {editingDept ? 'Edit Department' : 'Create New Department'}
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
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g., Engineering, Marketing, Sales"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Segment <span className="text-red-500">*</span>
                </label>
                <select 
                  value={formData.segmentId}
                  onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Segment</option>
                  {segments.map(seg => (
                    <option key={seg._id} value={seg._id}>{seg.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  rows="3" 
                  placeholder="Brief description of this department"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Department Head</label>
                <select 
                  value={formData.headId}
                  onChange={(e) => setFormData({ ...formData, headId: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department Head</option>
                  {/* Add users/employees list here */}
                </select>
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
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManager;