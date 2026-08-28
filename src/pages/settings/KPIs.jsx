import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Edit, Trash2, BarChart2,
  Target, TrendingUp, Filter, Search,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const KPISettings = () => {
  const { api } = useAuth();
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchKPIs();
  }, [search, filterCategory]);

  const fetchKPIs = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      
      const response = await api.get(`/kpis/definitions?${params.toString()}`);
      setKpis(response.data.data);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      productivity: 'bg-blue-100 text-blue-700',
      quality: 'bg-green-100 text-green-700',
      efficiency: 'bg-purple-100 text-purple-700',
      satisfaction: 'bg-yellow-100 text-yellow-700',
      growth: 'bg-emerald-100 text-emerald-700',
      retention: 'bg-orange-100 text-orange-700',
      financial: 'bg-red-100 text-red-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'quality', label: 'Quality' },
    { value: 'efficiency', label: 'Efficiency' },
    { value: 'satisfaction', label: 'Satisfaction' },
    { value: 'growth', label: 'Growth' },
    { value: 'retention', label: 'Retention' },
    { value: 'financial', label: 'Financial' }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">KPI Settings</h2>
          <p className="text-gray-500 mt-1">Define and manage Key Performance Indicators</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New KPI
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search KPIs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI List */}
      <div className="space-y-3">
        {kpis.map((kpi) => (
          <div key={kpi._id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{kpi.name}</h4>
                    <p className="text-sm text-gray-500">{kpi.description}</p>
                  </div>
                </div>
                
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(kpi.category)}`}>
                    {kpi.category}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                    {kpi.appliesTo}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                    {kpi.frequency}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    kpi.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {kpi.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Formula:</span> {kpi.formula}
                </div>
                
                <div className="mt-1 text-sm text-gray-600">
                  <span className="font-medium">Target:</span> {kpi.target?.operator} {kpi.target?.value}
                  <span className="ml-3 font-medium">Weight:</span> {kpi.weight || 1}
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-4">
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

      {kpis.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No KPIs found</h3>
          <p className="text-gray-400 mt-1">Create your first KPI to start tracking performance</p>
        </div>
      )}
    </div>
  );
};

export default KPISettings;