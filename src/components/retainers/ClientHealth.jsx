import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Heart, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle, Clock, DollarSign, Users,
  Calendar, FileText, Activity, X,
  Plus, Edit, Trash2, Eye
} from 'lucide-react';

const ClientHealth = ({ clientId }) => {
  const { api } = useAuth();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchHealth();
    }
  }, [clientId]);

  const fetchHealth = async () => {
    try {
      const response = await api.get(`/clients/retainer/${clientId}`);
      setHealth(response.data.data);
    } catch (error) {
      console.error('Error fetching client health:', error);
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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!health) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p>No health data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Health */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold text-gray-800">Client Health</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(health.overallHealth?.status)}`}>
              {health.overallHealth?.status?.toUpperCase()}
            </span>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        </div>

        {/* Health Score */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle className="w-24 h-24 stroke-gray-200" strokeWidth="6" fill="transparent" r="42" cx="48" cy="48" />
              <circle 
                className={`stroke-current ${getStatusColor(health.overallHealth?.status)}`} 
                strokeWidth="6" 
                fill="transparent" 
                r="42" 
                cx="48" 
                cy="48"
                strokeDasharray={`${(health.overallHealth?.score || 0) / 100 * 263.89} 263.89`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{health.overallHealth?.score || 0}%</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-400">Trend</p>
              <p className="text-sm font-medium flex items-center gap-1">
                {health.overallHealth?.trend === 'improving' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : health.overallHealth?.trend === 'declining' ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : (
                  <Activity className="w-4 h-4 text-yellow-600" />
                )}
                {health.overallHealth?.trend || 'Stable'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Change</p>
              <p className={`text-sm font-medium ${health.scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {health.scoreChange >= 0 ? '+' : ''}{health.scoreChange || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Deliverables</p>
                <p className="text-xl font-bold text-gray-900">{Math.round(health.metrics?.deliverables?.completion || 0)}%</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <span>On Time: {Math.round(health.metrics?.deliverables?.onTime || 0)}%</span>
              <span>•</span>
              <span>Quality: {Math.round(health.metrics?.deliverables?.quality || 0)}%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Hours</p>
                <p className="text-xl font-bold text-gray-900">{Math.round(health.metrics?.hours?.utilization || 0)}%</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <span>Efficiency: {Math.round(health.metrics?.hours?.efficiency || 0)}%</span>
              <span>•</span>
              <span>Remaining: {health.metrics?.hours?.remaining || 0}h</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Approvals</p>
                <p className="text-xl font-bold text-gray-900">{Math.round(health.metrics?.approvals?.approvalRate || 0)}%</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <span>Revisions: {Math.round(health.metrics?.approvals?.revisionRate || 0)}%</span>
              <span>•</span>
              <span>Avg Time: {health.metrics?.approvals?.averageTime || 0}h</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Client</p>
                <p className="text-xl font-bold text-gray-900">{Math.round(health.metrics?.client?.satisfaction || 0)}%</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <span>Communication: {Math.round(health.metrics?.client?.communication || 0)}%</span>
              <span>•</span>
              <span>Retention Risk: {Math.round(health.metrics?.client?.retentionRisk || 0)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {health.warnings && health.warnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-700">Warnings</p>
              <div className="mt-1 space-y-1">
                {health.warnings.map((warning, idx) => (
                  <p key={idx} className="text-sm text-yellow-600">• {warning.description}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {health.recommendations && health.recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-start gap-2">
            <Heart className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700">Recommendations</p>
              <div className="mt-1 space-y-1">
                {health.recommendations.map((rec, idx) => (
                  <p key={idx} className="text-sm text-blue-600">• {rec.description}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 flex items-center justify-center gap-1">
          <Heart className="w-4 h-4" />
          Refresh Health
        </button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 flex items-center justify-center gap-1">
          <FileText className="w-4 h-4" />
          View Report
        </button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 flex items-center justify-center gap-1">
          <Calendar className="w-4 h-4" />
          Schedule Review
        </button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 flex items-center justify-center gap-1">
          <Users className="w-4 h-4" />
          Contact Client
        </button>
      </div>
    </div>
  );
};

export default ClientHealth;