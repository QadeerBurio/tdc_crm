import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Heart, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle, Clock, DollarSign, Users,
  Calendar, FileText, Activity
} from 'lucide-react';

const RetainerHealth = () => {
  const { id } = useParams();
  const { api } = useAuth();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
  }, [id]);

  const fetchHealth = async () => {
    try {
      const response = await api.get(`/retainers/${id}/health`);
      setHealth(response.data.data);
    } catch (error) {
      console.error('Error fetching health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'excellent': 'text-green-600',
      'good': 'text-blue-600',
      'fair': 'text-yellow-600',
      'poor': 'text-orange-600',
      'critical': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const getStatusBadge = (status) => {
    const colors = {
      'excellent': 'bg-green-100 text-green-700',
      'good': 'bg-blue-100 text-blue-700',
      'fair': 'bg-yellow-100 text-yellow-700',
      'poor': 'bg-orange-100 text-orange-700',
      'critical': 'bg-red-100 text-red-700'
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

  if (!health) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Health data not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Retainer Health</h1>
          <p className="text-gray-500 mt-1">Detailed health metrics and analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(health.overallHealth?.status)}`}>
            {health.overallHealth?.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Overall Health */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle className="w-32 h-32 stroke-gray-200" strokeWidth="8" fill="transparent" r="56" cx="64" cy="64" />
                <circle 
                  className={`stroke-current ${getStatusColor(health.overallHealth?.status)}`} 
                  strokeWidth="8" 
                  fill="transparent" 
                  r="56" 
                  cx="64" 
                  cy="64"
                  strokeDasharray={`${(health.overallHealth?.score || 0) / 100 * 351.86} 351.86`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <span className="text-3xl font-bold text-gray-900">{health.overallHealth?.score || 0}%</span>
                  <p className="text-xs text-gray-500">Health Score</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`text-lg font-semibold ${getStatusColor(health.overallHealth?.status)}`}>
                  {health.overallHealth?.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trend</p>
                <p className="text-lg font-semibold flex items-center gap-1">
                  {health.overallHealth?.trend === 'improving' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : health.overallHealth?.trend === 'declining' ? (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  ) : (
                    <Activity className="w-5 h-5 text-yellow-600" />
                  )}
                  {health.overallHealth?.trend}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Previous Score</p>
                <p className="text-lg font-semibold text-gray-800">{health.previousScore || 0}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Change</p>
                <p className={`text-lg font-semibold ${health.scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {health.scoreChange >= 0 ? '+' : ''}{health.scoreChange || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Deliverables</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(health.metrics?.deliverables?.completion || 0)}%</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>On Time: {Math.round(health.metrics?.deliverables?.onTime || 0)}%</span>
            <span>•</span>
            <span>Quality: {Math.round(health.metrics?.deliverables?.quality || 0)}%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hours</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(health.metrics?.hours?.utilization || 0)}%</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>Efficiency: {Math.round(health.metrics?.hours?.efficiency || 0)}%</span>
            <span>•</span>
            <span>Remaining: {health.metrics?.hours?.remaining || 0}h</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(health.metrics?.approvals?.approvalRate || 0)}%</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>Revisions: {Math.round(health.metrics?.approvals?.revisionRate || 0)}%</span>
            <span>•</span>
            <span>Avg Time: {health.metrics?.approvals?.averageTime || 0}h</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Client</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(health.metrics?.client?.satisfaction || 0)}%</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>Communication: {Math.round(health.metrics?.client?.communication || 0)}%</span>
            <span>•</span>
            <span>Retention Risk: {Math.round(health.metrics?.client?.retentionRisk || 0)}%</span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {health.warnings && health.warnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Warnings
          </h3>
          <div className="space-y-2">
            {health.warnings.map((warning, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${
                warning.severity === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-4 h-4 ${warning.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                  <span className="text-sm font-medium text-gray-800">{warning.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {health.recommendations && health.recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>
          <div className="space-y-2">
            {health.recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {rec.priority}
                  </span>
                  <span className="text-sm text-gray-800">{rec.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetainerHealth;