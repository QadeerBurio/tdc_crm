import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Edit, Trash2, Layout, Grid,
  BarChart2, PieChart, Activity, Users,
  Target, Clock, CheckCircle, AlertCircle,
  Eye, Copy, Save, X
} from 'lucide-react';

const DashboardBuilderSettings = () => {
  const { api } = useAuth();
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    try {
      const response = await api.get('/dashboards');
      setDashboards(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAudienceLabel = (audience) => {
    const labels = {
      'all': 'Company Wide',
      'segment': 'Segment',
      'department': 'Department',
      'team': 'Team',
      'individual': 'Individual'
    };
    return labels[audience] || audience;
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
          <h2 className="text-xl font-semibold text-gray-800">Dashboard Builder</h2>
          <p className="text-gray-500 mt-1">Create and manage custom dashboards</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Dashboard
        </button>
      </div>

      {/* Dashboard List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboards.map((dashboard) => (
          <div key={dashboard._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Layout className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{dashboard.name}</h3>
                  <p className="text-xs text-gray-500">{getAudienceLabel(dashboard.audience)}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                dashboard.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {dashboard.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 mt-2">{dashboard.description}</p>
            
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {dashboard.isDefault && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
                  Default
                </span>
              )}
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                {dashboard.widgets?.length || 0} widgets
              </span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Created:</span>
                <span className="text-sm text-gray-600">
                  {new Date(dashboard.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {dashboards.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No dashboards found</h3>
          <p className="text-gray-400 mt-1">Create your first custom dashboard</p>
        </div>
      )}
    </div>
  );
};

export default DashboardBuilderSettings;