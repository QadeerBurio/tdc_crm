// pages/reports/ReportBuilder.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Save, X, Plus, Edit, Trash2,
  Eye, Copy, RefreshCw, Calendar, Filter,
  BarChart2, PieChart, Activity, Users,
  Target, Clock, CheckCircle, AlertCircle,
  ChevronDown, ChevronRight, Settings,
  GripVertical, Maximize, Minimize,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReportBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'custom',
    category: 'operations',
    format: 'pdf',
    period: 'monthly',
    startDate: '',
    endDate: '',
    metrics: [],
    chartType: 'bar',
    // ✅ FIX: Use valid enum value from model
    groupBy: 'none',  // Changed from 'day' to 'none' (valid enum)
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

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reports/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const data = result.data;
          // ✅ Ensure groupBy has valid value
          const validGroupBy = ['department', 'team', 'client', 'project', 'user', 'none'];
          if (data.groupBy && !validGroupBy.includes(data.groupBy)) {
            data.groupBy = 'none';
          }
          setFormData(data);
          setSelectedMetrics(data.metrics || []);
        } else {
          throw new Error(result.message || 'Failed to fetch report');
        }
      } else {
        throw new Error('Failed to fetch report');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error(error.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScheduleChange = (field, value) => {
    setFormData(prev => ({
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

  const handleSave = async () => {
    // ✅ Validate required fields
    if (!formData.name || !formData.name.trim()) {
      toast.error('Report name is required');
      return;
    }

    setSaving(true);
    try {
      // ✅ Ensure all enum values are valid
      const validGroupBy = ['department', 'team', 'client', 'project', 'user', 'none'];
      const validCategory = ['operations', 'financial', 'crm', 'productivity', 'client', 'custom'];
      const validType = ['performance', 'revenue', 'activity', 'user', 'project', 'task', 'custom'];
      const validFormat = ['pdf', 'excel', 'csv', 'json', 'html'];
      const validPeriod = ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom'];
      const validChartType = ['bar', 'line', 'pie', 'area'];
      const validStatus = ['active', 'pending', 'completed', 'failed'];
      const validScheduleFrequency = ['none', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly'];
      const validScheduleFormat = ['pdf', 'excel', 'csv'];

      const data = {
        name: formData.name.trim(),
        description: formData.description || '',
        category: validCategory.includes(formData.category) ? formData.category : 'operations',
        type: validType.includes(formData.type) ? formData.type : 'custom',
        status: validStatus.includes(formData.status) ? formData.status : 'active',
        format: validFormat.includes(formData.format) ? formData.format : 'pdf',
        period: validPeriod.includes(formData.period) ? formData.period : 'monthly',
        groupBy: validGroupBy.includes(formData.groupBy) ? formData.groupBy : 'none',
        chartType: validChartType.includes(formData.chartType) ? formData.chartType : 'bar',
        includeCharts: formData.includeCharts !== false,
        includeTables: formData.includeTables !== false,
        includeSummary: formData.includeSummary !== false,
        metrics: selectedMetrics || [],
        recipients: formData.recipients || [],
        schedule: {
          frequency: validScheduleFrequency.includes(formData.schedule?.frequency) 
            ? formData.schedule.frequency 
            : 'none',
          day: formData.schedule?.day || 1,
          time: formData.schedule?.time || '09:00',
          format: validScheduleFormat.includes(formData.schedule?.format) 
            ? formData.schedule.format 
            : 'pdf'
        }
      };

      const url = id ? `${API_URL}/reports/${id}` : `${API_URL}/reports`;
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success(id ? 'Report updated successfully!' : 'Report created successfully!');
          navigate('/reports');
        } else {
          // ✅ Show detailed validation errors
          const errorMsg = result.message || 'Failed to save report';
          if (result.errors) {
            const errorDetails = Object.values(result.errors).map(e => e.message).join(', ');
            toast.error(`${errorMsg}: ${errorDetails}`);
          } else {
            toast.error(errorMsg);
          }
          throw new Error(errorMsg);
        }
      } else {
        // ✅ Parse error response
        let errorMsg = 'Failed to save report';
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMsg = errorData.message;
          }
          if (errorData.errors) {
            const details = Object.values(errorData.errors).map(e => e.message).join(', ');
            toast.error(`${errorMsg}: ${details}`);
          } else {
            toast.error(errorMsg);
          }
        } catch (e) {
          toast.error(`Server error: ${response.status}`);
        }
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error saving report:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rb-loading">
        <div className="rb-spinner"></div>
        <p className="rb-loading-text">Loading report...</p>
      </div>
    );
  }

  return (
    <div className="rb-container">
      {/* Header */}
      <div className="rb-header">
        <div className="rb-header-left">
          <button onClick={() => navigate('/reports')} className="rb-back-btn">
            <ArrowLeft className="rb-back-icon" />
          </button>
          <div className="rb-header-icon">
            <FileText className="rb-header-svg" />
          </div>
          <div>
            <h1 className="rb-title">
              {id ? 'Edit Report' : 'Create New Report'}
            </h1>
            <p className="rb-subtitle">Design and configure your report</p>
          </div>
        </div>
        <div className="rb-header-right">
          <button
            onClick={() => navigate('/reports')}
            className="rb-btn-cancel"
          >
            <X className="rb-btn-svg" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rb-btn-save"
          >
            {saving ? (
              <>
                <div className="rb-save-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="rb-btn-svg" />
                Save Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="rb-section">
        <h3 className="rb-section-title">Basic Information</h3>
        <div className="rb-section-grid">
          <div className="rb-form-group">
            <label className="rb-form-label">
              Report Name <span className="rb-form-required">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="rb-form-input"
              placeholder="Monthly Performance Report"
            />
          </div>
          <div className="rb-form-group">
            <label className="rb-form-label">Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="rb-form-select"
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
        <div className="rb-form-group">
          <label className="rb-form-label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="rb-form-textarea"
            rows="3"
            placeholder="Brief description of the report"
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="rb-section">
        <h3 className="rb-section-title">Metrics</h3>
        <div className="rb-metrics-grid">
          {availableMetrics.map((metric) => (
            <label
              key={metric.id}
              className={`rb-metric-item ${selectedMetrics.includes(metric.id) ? 'rb-metric-selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedMetrics.includes(metric.id)}
                onChange={() => toggleMetric(metric.id)}
                className="rb-metric-checkbox"
              />
              <span className="rb-metric-icon">{metric.icon}</span>
              <span className="rb-metric-name">{metric.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Configuration */}
      <div className="rb-section">
        <h3 className="rb-section-title">Report Configuration</h3>
        <div className="rb-config-grid">
          <div className="rb-form-group">
            <label className="rb-form-label">Period</label>
            <select
              value={formData.period}
              onChange={(e) => handleChange('period', e.target.value)}
              className="rb-form-select"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="rb-form-group">
            <label className="rb-form-label">Format</label>
            <select
              value={formData.format}
              onChange={(e) => handleChange('format', e.target.value)}
              className="rb-form-select"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="html">HTML</option>
            </select>
          </div>
          <div className="rb-form-group">
            <label className="rb-form-label">Chart Type</label>
            <select
              value={formData.chartType}
              onChange={(e) => handleChange('chartType', e.target.value)}
              className="rb-form-select"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="area">Area Chart</option>
            </select>
          </div>
        </div>
      </div>

      {/* Group By - Fixed with valid values */}
      <div className="rb-section">
        <h3 className="rb-section-title">Group By</h3>
        <div className="rb-form-group">
          <label className="rb-form-label">Group Report By</label>
          <select
            value={formData.groupBy}
            onChange={(e) => handleChange('groupBy', e.target.value)}
            className="rb-form-select"
          >
            <option value="none">None</option>
            <option value="department">Department</option>
            <option value="team">Team</option>
            <option value="client">Client</option>
            <option value="project">Project</option>
            <option value="user">User</option>
          </select>
          <p className="rb-form-hint">Choose how to group the report data</p>
        </div>
      </div>

      {/* Schedule */}
      <div className="rb-section">
        <h3 className="rb-section-title">Schedule</h3>
        <div className="rb-schedule-grid">
          <div className="rb-form-group">
            <label className="rb-form-label">Frequency</label>
            <select
              value={formData.schedule.frequency}
              onChange={(e) => handleScheduleChange('frequency', e.target.value)}
              className="rb-form-select"
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div className="rb-form-group">
            <label className="rb-form-label">Day</label>
            <input
              type="number"
              value={formData.schedule.day}
              onChange={(e) => handleScheduleChange('day', parseInt(e.target.value) || 1)}
              className="rb-form-input"
              min="1"
              max="31"
            />
          </div>
          <div className="rb-form-group">
            <label className="rb-form-label">Time</label>
            <input
              type="time"
              value={formData.schedule.time}
              onChange={(e) => handleScheduleChange('time', e.target.value)}
              className="rb-form-input"
            />
          </div>
          <div className="rb-form-group">
            <label className="rb-form-label">Format</label>
            <select
              value={formData.schedule.format}
              onChange={(e) => handleScheduleChange('format', e.target.value)}
              className="rb-form-select"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .rb-container {
          padding: 24px 32px;
          max-width: 1200px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          animation: rbFadeIn 0.4s ease;
        }

        @keyframes rbFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes rbSpin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           LOADING
           ============================================ */
        .rb-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }

        .rb-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: rbSpin 0.8s linear infinite;
        }

        .rb-loading-text {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        /* ============================================
           HEADER
           ============================================ */
        .rb-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .rb-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rb-back-btn {
          padding: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .rb-back-btn:hover {
          background: #f1f5f9;
        }

        .rb-back-icon {
          width: 20px;
          height: 20px;
          color: #64748b;
        }

        .rb-header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .rb-header-svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .rb-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .rb-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .rb-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rb-btn-svg {
          width: 16px;
          height: 16px;
        }

        .rb-btn-cancel {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rb-btn-cancel:hover {
          background: #f1f5f9;
        }

        .rb-btn-save {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }

        .rb-btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .rb-btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .rb-save-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: rbSpin 0.8s linear infinite;
        }

        /* ============================================
           SECTIONS
           ============================================ */
        .rb-section {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .rb-section:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .rb-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 16px 0;
        }

        .rb-section-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* ============================================
           FORM
           ============================================ */
        .rb-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rb-form-label {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
        }

        .rb-form-required {
          color: #ef4444;
        }

        .rb-form-hint {
          font-size: 12px;
          color: #94a3b8;
          margin: 2px 0 0 0;
        }

        .rb-form-input,
        .rb-form-select,
        .rb-form-textarea {
          padding: 10px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          color: #0f172a;
        }

        .rb-form-input:focus,
        .rb-form-select:focus,
        .rb-form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .rb-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        /* ============================================
           METRICS
           ============================================ */
        .rb-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 8px;
        }

        .rb-metric-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #ffffff;
        }

        .rb-metric-item:hover {
          border-color: #94a3b8;
          background: #f8fafc;
        }

        .rb-metric-selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .rb-metric-selected:hover {
          border-color: #2563eb;
          background: #dbeafe;
        }

        .rb-metric-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #3b82f6;
          cursor: pointer;
        }

        .rb-metric-icon {
          font-size: 18px;
        }

        .rb-metric-name {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
        }

        /* ============================================
           CONFIG GRID
           ============================================ */
        .rb-config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }

        /* ============================================
           SCHEDULE GRID
           ============================================ */
        .rb-schedule-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 16px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .rb-schedule-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .rb-container {
            padding: 16px;
          }

          .rb-header {
            flex-direction: column;
            align-items: stretch;
          }

          .rb-header-right {
            flex-wrap: wrap;
          }

          .rb-btn-cancel,
          .rb-btn-save {
            flex: 1;
            justify-content: center;
          }

          .rb-section-grid {
            grid-template-columns: 1fr;
          }

          .rb-config-grid {
            grid-template-columns: 1fr;
          }

          .rb-schedule-grid {
            grid-template-columns: 1fr;
          }

          .rb-metrics-grid {
            grid-template-columns: 1fr 1fr;
          }

          .rb-title {
            font-size: 22px;
          }

          .rb-header-icon {
            width: 40px;
            height: 40px;
          }

          .rb-header-svg {
            width: 20px;
            height: 20px;
          }
        }

        @media (max-width: 480px) {
          .rb-container {
            padding: 12px;
          }

          .rb-header-right {
            flex-direction: column;
          }

          .rb-btn-cancel,
          .rb-btn-save {
            width: 100%;
          }

          .rb-title {
            font-size: 20px;
          }

          .rb-subtitle {
            font-size: 13px;
          }

          .rb-section {
            padding: 16px;
          }

          .rb-metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportBuilder;