import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Plus, Save, X, Edit, Trash2,
  Copy, Eye, RefreshCw, Download, Calendar,
  Filter, BarChart2, PieChart, Activity,
  Users, Target, Clock, CheckCircle,
  ChevronDown, ChevronRight, Settings,
  GripVertical, Maximize, Minimize
} from 'lucide-react';

const ReportBuilder = ({ 
  report, 
  onSave, 
  onCancel, 
  isOpen,
  readOnly = false 
}) => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    type: 'custom',
    category: 'operations',
    format: 'pdf',
    period: 'monthly',
    startDate: '',
    endDate: '',
    metrics: [],
    filters: {},
    chartType: 'bar',
    groupBy: 'day',
    sortBy: 'date',
    sortOrder: 'desc',
    includeCharts: true,
    includeTables: true,
    includeSummary: true,
    recipients: [],
    schedule: {
      frequency: 'none',
      day: 1,
      time: '09:00',
      format: 'pdf',
      recipients: []
    }
  });
  const [availableMetrics, setAvailableMetrics] = useState([
    { id: 'revenue', name: 'Revenue', category: 'financial', icon: '💰' },
    { id: 'leads', name: 'Leads', category: 'crm', icon: '👤' },
    { id: 'conversions', name: 'Conversions', category: 'crm', icon: '🔄' },
    { id: 'projects', name: 'Projects', category: 'operations', icon: '📋' },
    { id: 'tasks', name: 'Tasks', category: 'operations', icon: '✅' },
    { id: 'completion', name: 'Task Completion', category: 'productivity', icon: '📊' },
    { id: 'hours', name: 'Hours Logged', category: 'productivity', icon: '⏱️' },
    { id: 'productivity', name: 'Productivity Score', category: 'productivity', icon: '📈' },
    { id: 'satisfaction', name: 'Client Satisfaction', category: 'client', icon: '⭐' },
    { id: 'retention', name: 'Client Retention', category: 'client', icon: '🔄' }
  ]);

  const [selectedMetrics, setSelectedMetrics] = useState([]);

  useEffect(() => {
    if (report) {
      setReportConfig({
        ...report,
        startDate: report.startDate || '',
        endDate: report.endDate || ''
      });
      setSelectedMetrics(report.metrics || []);
    }
  }, [report]);

  const handleChange = (field, value) => {
    setReportConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleScheduleChange = (field, value) => {
    setReportConfig(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [field]: value }
    }));
  };

  const toggleMetric = (metricId) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...reportConfig,
        metrics: selectedMetrics
      };
      await onSave(data);
    } catch (error) {
      console.error('Error saving report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">
            {report ? 'Edit Report' : 'Create New Report'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {report ? 'Update Report' : 'Create Report'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <form className="space-y-6 max-w-4xl">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Report Name *</label>
                <input
                  type="text"
                  value={reportConfig.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Monthly Performance Report"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={reportConfig.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="operations">Operations</option>
                  <option value="financial">Financial</option>
                  <option value="crm">CRM</option>
                  <option value="productivity">Productivity</option>
                  <option value="client">Client</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={reportConfig.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Brief description of the report"
              />
            </div>
          </div>

          {/* Metrics Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableMetrics.map((metric) => (
                <label
                  key={metric.id}
                  className={`
                    flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors
                    ${selectedMetrics.includes(metric.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric.id)}
                    onChange={() => toggleMetric(metric.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-lg">{metric.icon}</span>
                  <span className="text-sm text-gray-700">{metric.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Period</label>
                <select
                  value={reportConfig.period}
                  onChange={(e) => handleChange('period', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Format</label>
                <select
                  value={reportConfig.format}
                  onChange={(e) => handleChange('format', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Chart Type</label>
                <select
                  value={reportConfig.chartType}
                  onChange={(e) => handleChange('chartType', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="scatter">Scatter Plot</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Group By</label>
                <select
                  value={reportConfig.groupBy}
                  onChange={(e) => handleChange('groupBy', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="quarter">Quarter</option>
                  <option value="year">Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={reportConfig.sortBy}
                  onChange={(e) => handleChange('sortBy', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="value">Value</option>
                  <option value="name">Name</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                <select
                  value={reportConfig.sortOrder}
                  onChange={(e) => handleChange('sortOrder', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                <select
                  value={reportConfig.schedule.frequency}
                  onChange={(e) => handleScheduleChange('frequency', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Day</label>
                <input
                  type="number"
                  value={reportConfig.schedule.day}
                  onChange={(e) => handleScheduleChange('day', parseInt(e.target.value))}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="31"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  value={reportConfig.schedule.time}
                  onChange={(e) => handleScheduleChange('time', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Format</label>
                <select
                  value={reportConfig.schedule.format}
                  onChange={(e) => handleScheduleChange('format', e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportBuilder;