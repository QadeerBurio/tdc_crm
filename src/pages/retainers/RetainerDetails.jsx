import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Edit, Trash2, DollarSign, Calendar,
  Users, CheckCircle, Clock, AlertCircle,
  FileText, Download, Plus, X
} from 'lucide-react';

const RetainerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [retainer, setRetainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);

  useEffect(() => {
    fetchRetainer();
  }, [id]);

  const fetchRetainer = async () => {
    try {
      const response = await api.get(`/retainers/${id}`);
      setRetainer(response.data.data);
    } catch (error) {
      console.error('Error fetching retainer:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    if (score >= 40) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'paused': 'bg-orange-100 text-orange-700',
      'expired': 'bg-red-100 text-red-700',
      'cancelled': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getDeliverableStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-700',
      'submitted': 'bg-blue-100 text-blue-700',
      'in_progress': 'bg-yellow-100 text-yellow-700',
      'pending': 'bg-gray-100 text-gray-700',
      'approved': 'bg-emerald-100 text-emerald-700',
      'revision_requested': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!retainer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Retainer not found</p>
        <button onClick={() => navigate('/retainers')} className="mt-4 text-blue-600 hover:text-blue-700">
          ← Back to Retainers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/retainers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{retainer.name}</h1>
            <p className="text-gray-500 mt-1">
              Client: {retainer.clientId?.companyName || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${retainer.monthlyValue} {retainer.currency}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(retainer.status)}`}>
                {retainer.status}
              </span>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Health Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {retainer.health?.score || 0}%
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${
                retainer.health?.score >= 80 ? 'bg-green-500' :
                retainer.health?.score >= 60 ? 'bg-yellow-500' :
                retainer.health?.score >= 40 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${retainer.health?.score || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{retainer.team?.length || 0}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Deliverables Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Deliverables</h3>
          <button 
            onClick={() => setShowDeliverableModal(true)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Deliverable
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">Assigned To</th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">Due Date</th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {retainer.deliverables?.map((deliverable) => (
                <tr key={deliverable._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 text-sm text-gray-800">{deliverable.name}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getDeliverableStatusColor(deliverable.status)}`}>
                      {deliverable.status}
                    </span>
                  </td>
                  <td className="py-2 text-sm text-gray-600">
                    {deliverable.assignedTo?.firstName} {deliverable.assignedTo?.lastName || 'Unassigned'}
                  </td>
                  <td className="py-2 text-sm text-gray-600">
                    {new Date(deliverable.dueDate).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <FileText className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!retainer.deliverables || retainer.deliverables.length === 0) && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No deliverables found. Add your first deliverable.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Timeline</h3>
        <div className="flex items-center gap-8 text-sm">
          <div>
            <span className="text-gray-500">Started:</span>
            <span className="ml-2 font-medium text-gray-800">
              {new Date(retainer.startDate).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Renewal:</span>
            <span className="ml-2 font-medium text-gray-800">
              {new Date(retainer.renewalDate).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Days Remaining:</span>
            <span className="ml-2 font-medium text-gray-800">
              {Math.ceil((new Date(retainer.renewalDate) - new Date()) / (1000 * 60 * 60 * 24))} days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetainerDetails;