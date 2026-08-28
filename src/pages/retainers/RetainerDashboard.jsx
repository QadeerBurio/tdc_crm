import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  DollarSign, Users, Calendar, CheckCircle,
  Clock, AlertCircle, TrendingUp, TrendingDown,
  BarChart3, PieChart, Activity, Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const RetainerDashboard = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [retainers, setRetainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, retainersRes] = await Promise.all([
        api.get('/retainers/summary'),
        api.get('/retainers?status=active')
      ]);
      setStats(statsRes.data.data);
      setRetainers(retainersRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Retainer Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of all retainers and client health</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Filter className="w-4 h-4 inline mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Retainers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-1 text-sm text-green-600">↑ 12% from last month</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Retainers</p>
              <p className="text-2xl font-bold text-green-600">{stats?.byStatus?.active || 0}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-1 text-sm text-green-600">↑ 5% from last month</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-purple-600">${stats?.totalMonthlyValue?.toLocaleString() || 0}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-1 text-sm text-green-600">↑ 8% from last month</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Health Score</p>
              <p className="text-2xl font-bold text-orange-600">{Math.round(stats?.averageHealth || 0)}%</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="mt-1 text-sm text-green-600">↑ 3% from last month</div>
        </div>
      </div>

      {/* Health Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Excellent</span>
                <span className="font-medium">{stats?.byHealth?.excellent || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${((stats?.byHealth?.excellent || 0) / (stats?.total || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Good</span>
                <span className="font-medium">{stats?.byHealth?.good || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${((stats?.byHealth?.good || 0) / (stats?.total || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fair</span>
                <span className="font-medium">{stats?.byHealth?.fair || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${((stats?.byHealth?.fair || 0) / (stats?.total || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Poor</span>
                <span className="font-medium">{stats?.byHealth?.poor || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${((stats?.byHealth?.poor || 0) / (stats?.total || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Critical</span>
                <span className="font-medium">{stats?.byHealth?.critical || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${((stats?.byHealth?.critical || 0) / (stats?.total || 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active</span>
                <span className="font-medium">{stats?.byStatus?.active || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${((stats?.byStatus?.active || 0) / (stats?.total || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium">{stats?.byStatus?.pending || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${((stats?.byStatus?.pending || 0) / (stats?.total || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Paused</span>
                <span className="font-medium">{stats?.byStatus?.paused || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${((stats?.byStatus?.paused || 0) / (stats?.total || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expired</span>
                <span className="font-medium">{stats?.byStatus?.expired || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${((stats?.byStatus?.expired || 0) / (stats?.total || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cancelled</span>
                <span className="font-medium">{stats?.byStatus?.cancelled || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${((stats?.byStatus?.cancelled || 0) / (stats?.total || 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Retainers List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Active Retainers</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700">View All →</button>
        </div>
        <div className="space-y-3">
          {retainers.slice(0, 5).map((retainer) => (
            <div key={retainer._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800">{retainer.name}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getHealthBadge(retainer.health?.score || 0)}`}>
                    {retainer.health?.status || 'Good'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{retainer.clientId?.companyName || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">${retainer.monthlyValue}</p>
                  <p className="text-xs text-gray-400">Monthly</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{retainer.health?.score || 0}%</p>
                  <p className="text-xs text-gray-400">Health</p>
                </div>
                <div className="w-16">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
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
              </div>
            </div>
          ))}
          {retainers.length === 0 && (
            <p className="text-center text-gray-500 py-8">No active retainers found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetainerDashboard;