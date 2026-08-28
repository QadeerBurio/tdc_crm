import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign, Users, Calendar, CheckCircle,
  Clock, AlertCircle, TrendingUp, TrendingDown,
  BarChart3, PieChart, Activity, Filter,
  Download, RefreshCw, ArrowRight
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const RetainerDashboard = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [retainers, setRetainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, retainersRes] = await Promise.all([
        api.get(`/retainers/summary?period=${period}`),
        api.get('/retainers?status=active')
      ]);
      setStats(statsRes.data.data);
      setRetainers(retainersRes.data.data);
      
      // Generate trend data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trend = months.slice(0, 6).map((month, i) => ({
        month,
        revenue: Math.floor(Math.random() * 50000) + 30000,
        retainers: Math.floor(Math.random() * 10) + 5,
        health: Math.floor(Math.random() * 30) + 70
      }));
      setTrendData(trend);
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
          <h3 className="text-lg font-semibold text-gray-800">Retainer Dashboard</h3>
          <p className="text-sm text-gray-500">Monitor retainer performance and client health</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 text-gray-500" />
          </button>
          <button 
            onClick={fetchDashboardData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
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
          <div className="mt-1 text-sm text-green-600">↑ 12% from last {period}</div>
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
          <div className="mt-1 text-sm text-green-600">↑ 8% from last {period}</div>
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
          <div className="mt-1 text-sm text-green-600">↑ 15% from last {period}</div>
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
          <div className="mt-1 text-sm text-green-600">↑ 5% from last {period}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Revenue Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Health Distribution</h4>
          <div className="space-y-3">
            {stats?.byHealth && Object.entries(stats.byHealth).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-0.5">
                  <div 
                    className="h-1.5 rounded-full"
                    style={{ 
                      width: `${(count / (stats?.total || 1)) * 100}%`,
                      backgroundColor: status === 'excellent' ? '#10B981' : 
                                     status === 'good' ? '#3B82F6' :
                                     status === 'fair' ? '#F59E0B' :
                                     status === 'poor' ? '#EF4444' :
                                     '#6B7280'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Retainers */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">Active Retainers</h4>
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
                  <p className={`text-sm font-medium ${getHealthColor(retainer.health?.score || 0)}`}>
                    {retainer.health?.score || 0}%
                  </p>
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
            <p className="text-center text-gray-500 py-4">No active retainers found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetainerDashboard;