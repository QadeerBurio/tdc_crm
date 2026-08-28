import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, DollarSign, Calendar, Users, 
  CheckCircle, AlertCircle, Clock, Edit, Trash2
} from 'lucide-react';

const Retainers = () => {
  const { api } = useAuth();
  const [retainers, setRetainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRetainers();
  }, [search]);

  const fetchRetainers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await api.get(`/retainers?${params.toString()}`);
      setRetainers(response.data.data);
    } catch (error) {
      console.error('Error fetching retainers:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Retainers</h1>
          <p className="text-gray-500 mt-1">Manage recurring client retainers</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Retainer
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search retainers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Retainers List */}
      <div className="space-y-4">
        {retainers.map((retainer) => (
          <div key={retainer._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-800">{retainer.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(retainer.status)}`}>
                    {retainer.status}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getHealthColor(retainer.health?.score || 0)}`}>
                    Health: {retainer.health?.score || 0}%
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mt-1">
                  Client: {retainer.clientId?.companyName || 'N/A'}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    {retainer.monthlyValue} {retainer.currency}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Started: {new Date(retainer.startDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Renews: {new Date(retainer.renewalDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    {retainer.team?.length || 0} team members
                  </span>
                </div>

                {/* Deliverables Progress */}
                {retainer.monthlyDeliverables && retainer.monthlyDeliverables.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Monthly Deliverables:</span>
                      <div className="flex-1 max-w-xs">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ 
                              width: `${(retainer.monthlyDeliverables.filter(d => d.status === 'completed').length / retainer.monthlyDeliverables.length) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {retainer.monthlyDeliverables.filter(d => d.status === 'completed').length} / {retainer.monthlyDeliverables.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  View
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1.5 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {retainers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No retainers found</h3>
          <p className="text-gray-400 mt-1">Start by creating your first retainer</p>
        </div>
      )}
    </div>
  );
};

export default Retainers;