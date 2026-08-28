import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle, AlertCircle, AlertOctagon,
  CheckCircle, Clock, Filter, Eye, Activity,
  TrendingUp, TrendingDown, BarChart3,
  PieChart, Download, RefreshCw, ArrowRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';

const RiskDashboard = () => {
  const { api } = useAuth();
  const [summary, setSummary] = useState(null);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    type: 'all'
  });

  const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];

  useEffect(() => {
    fetchDashboardData();
  }, [period, filters]);

  const fetchDashboardData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.severity !== 'all') params.append('severity', filters.severity);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
      
      const [summaryRes, risksRes] = await Promise.all([
        api.get(`/risks/dashboard?${params.toString()}`),
        api.get(`/risks?${params.toString()}`)
      ]);
      setSummary(summaryRes.data.data.summary);
      setRisks(risksRes.data.data);
    } catch (error) {
      console.error('Error fetching risk dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'bg-red-500 text-white',
      'high': 'bg-orange-500 text-white',
      'medium': 'bg-yellow-500 text-white',
      'low': 'bg-green-500 text-white'
    };
    return colors[severity] || 'bg-gray-500 text-white';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return <AlertOctagon className="w-5 h-5" />;
    if (severity === 'high') return <AlertCircle className="w-5 h-5" />;
    if (severity === 'medium') return <AlertTriangle className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'detected': 'bg-yellow-100 text-yellow-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'mitigated': 'bg-purple-100 text-purple-700',
      'resolved': 'bg-green-100 text-green-700',
      'ignored': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
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
          <h3 className="text-lg font-semibold text-gray-800">Risk Dashboard</h3>
          <p className="text-sm text-gray-500">Monitor and manage organizational risks</p>
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
              <p className="text-sm text-gray-500">Total Risks</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.total || 0}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <div className="mt-1 text-sm text-green-600">↑ 5% from last {period}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Critical</p>
              <p className="text-2xl font-bold text-red-600">{summary?.bySeverity?.critical || 0}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertOctagon className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="mt-1 text-sm text-red-600">↑ 2% from last {period}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{summary?.byStatus?.in_progress || 0}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-1 text-sm text-green-600">↑ 8% from last {period}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Risk Score</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(summary?.averageScore || 0)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-1 text-sm text-green-600">↓ 3% from last {period}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Risk Severity Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Critical', value: summary?.bySeverity?.critical || 0 },
                    { name: 'High', value: summary?.bySeverity?.high || 0 },
                    { name: 'Medium', value: summary?.bySeverity?.medium || 0 },
                    { name: 'Low', value: summary?.bySeverity?.low || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Risk Type Distribution</h4>
          <div className="space-y-3">
            {summary?.byType && Object.entries(summary.byType).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-0.5">
                  <div 
                    className="h-1.5 rounded-full"
                    style={{ 
                      width: `${(count / (summary?.total || 1)) * 100}%`,
                      backgroundColor: type === 'overdue' ? '#EF4444' :
                                     type === 'delayed' ? '#F59E0B' :
                                     type === 'underperforming' ? '#3B82F6' :
                                     type === 'budget' ? '#8B5CF6' :
                                     '#6B7280'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Risks */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">Recent Risks</h4>
          <button className="text-sm text-blue-600 hover:text-blue-700">View All →</button>
        </div>
        <div className="space-y-3">
          {risks.slice(0, 5).map((risk) => (
            <div key={risk._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${getSeverityColor(risk.severity)}`}>
                  {getSeverityIcon(risk.severity)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{risk.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="capitalize">{risk.type}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(risk.status)}`}>
                      {risk.status}
                    </span>
                    <span>•</span>
                    <span>Score: {risk.riskScore}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {new Date(risk.detectedAt).toLocaleDateString()}
                </span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
          {risks.length === 0 && (
            <p className="text-center text-gray-500 py-4">No risks found</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <span className="text-sm text-gray-700">Report Risk</span>
        </button>
        <button className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center">
          <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <span className="text-sm text-gray-700">View All Risks</span>
        </button>
        <button className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center">
          <BarChart3 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <span className="text-sm text-gray-700">Risk Analysis</span>
        </button>
        <button className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center">
          <Download className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <span className="text-sm text-gray-700">Export Report</span>
        </button>
      </div>
    </div>
  );
};

export default RiskDashboard;