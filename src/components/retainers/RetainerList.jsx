import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign, Edit, Trash2, Eye, Plus,
  Search, Filter, Calendar, Users,
  CheckCircle, AlertCircle, Clock,
  Download, RefreshCw, MoreVertical,
  TrendingUp, TrendingDown, Activity
} from 'lucide-react';

const RetainerList = () => {
  const { api } = useAuth();
  const [retainers, setRetainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    clientId: 'all'
  });
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchRetainers();
    fetchClients();
  }, [search, filters]);

  const fetchRetainers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.clientId !== 'all') params.append('clientId', filters.clientId);
      
      const response = await api.get(`/retainers?${params.toString()}`);
      setRetainers(response.data.data);
    } catch (error) {
      console.error('Error fetching retainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'paused': 'bg-orange-100 text-orange-700',
      'expired': 'bg-red-100 text-red-700',
      'cancelled': 'bg-gray-100 text-gray-500'
    };
    return colors[status] || 'bg-gray-100 text-gray-500';
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthBadge = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    if (score >= 40) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusIcon = (status) => {
    if (status === 'active') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === 'pending') return <Clock className="w-4 h-4 text-yellow-600" />;
    if (status === 'paused') return <AlertCircle className="w-4 h-4 text-orange-600" />;
    if (status === 'expired') return <AlertCircle className="w-4 h-4 text-red-600" />;
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'paused', label: 'Paused' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Retainers</h3>
          <p className="text-sm text-gray-500">Manage client retainers and recurring revenue</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search retainers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={filters.clientId}
            onChange={(e) => setFilters(prev => ({ ...prev, clientId: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>{client.companyName}</option>
            ))}
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            New Retainer
          </button>
        </div>
      </div>

      {/* Retainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {retainers.map((retainer) => (
          <div 
            key={retainer._id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer"
            onClick={() => window.location.href = `/retainers/${retainer._id}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{retainer.name}</h4>
                  <p className="text-xs text-gray-500">{retainer.clientId?.companyName || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(retainer.status)}`}>
                  {retainer.status}
                </span>
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-400">Monthly Value</p>
                <p className="text-lg font-bold text-gray-800">${retainer.monthlyValue}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Health</p>
                <div className="flex items-center gap-1">
                  <span className={`text-lg font-bold ${getHealthColor(retainer.health?.score || 0)}`}>
                    {retainer.health?.score || 0}%
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getHealthBadge(retainer.health?.score || 0)}`}>
                    {retainer.health?.status || 'Good'}
                  </span>
                </div>
              </div>
            </div>

            {/* Deliverables Progress */}
            {retainer.monthlyDeliverables && retainer.monthlyDeliverables.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Deliverables:</span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ 
                          width: `${(retainer.monthlyDeliverables.filter(d => d.status === 'completed').length / retainer.monthlyDeliverables.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {retainer.monthlyDeliverables.filter(d => d.status === 'completed').length} / {retainer.monthlyDeliverables.length}
                  </span>
                </div>
              </div>
            )}
            
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Renews: {new Date(retainer.renewalDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-red-50 rounded">
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

export default RetainerList;