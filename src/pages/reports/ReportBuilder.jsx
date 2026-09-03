// pages/reports/ReportBuilder.jsx
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
  ArrowLeft, Layers
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
    groupBy: 'none',
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
    if (!formData.name || !formData.name.trim()) {
      toast.error('Report name is required');
      return;
    }

    setSaving(true);
    try {
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
      <div className="rb-modal-overlay">
        <div className="rb-loading-modal">
          <div className="rb-loading-spinner"></div>
          <p className="rb-loading-text">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rb-modal-overlay" onClick={() => navigate('/reports')}>
      <div className="rb-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rb-modal-header">
          <div className="rb-modal-header-left">
            <div className="rb-modal-header-icon">
              <Layers className="rb-modal-header-svg" />
            </div>
            <div>
              <h1 className="rb-modal-title">
                {id ? 'Edit Report' : 'Create New Report'}
              </h1>
              <p className="rb-modal-subtitle">Design and configure your report</p>
            </div>
          </div>
          <button onClick={() => navigate('/reports')} className="rb-modal-close">
            <X className="rb-modal-close-icon" />
          </button>
        </div>

        <div className="rb-modal-body">
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

          {/* Group By */}
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
        </div>

        {/* Footer */}
        <div className="rb-modal-footer">
          <button
            onClick={() => navigate('/reports')}
            className="rb-modal-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rb-modal-save"
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

      <style>{`
        /* ============================================
           MODAL OVERLAY
           ============================================ */
        .rb-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(1, 62, 55, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: rbFadeIn 0.3s ease;
        }

        @keyframes rbFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ============================================
           MODAL
           ============================================ */
        .rb-modal {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid #FFEFB3;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 32px 80px rgba(1, 62, 55, 0.25);
          animation: rbModalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes rbModalIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* ============================================
           LOADING MODAL
           ============================================ */
        .rb-loading-modal {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid #FFEFB3;
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          box-shadow: 0 32px 80px rgba(1, 62, 55, 0.25);
          animation: rbModalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .rb-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(1, 62, 55, 0.06);
          border-top-color: #013E37;
          border-radius: 50%;
          animation: rbSpin 0.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        .rb-loading-text {
          color: #013E37;
          opacity: 0.5;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        @keyframes rbSpin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           HEADER
           ============================================ */
        .rb-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
          border-radius: 20px 20px 0 0;
          flex-shrink: 0;
        }

        .rb-modal-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .rb-modal-header-icon {
          width: 48px;
          height: 48px;
          background: #013E37;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.25);
        }

        .rb-modal-header-svg {
          width: 24px;
          height: 24px;
          color: #FFEFB3;
        }

        .rb-modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .rb-modal-subtitle {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }

        .rb-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: none;
          background: transparent;
          border-radius: 10px;
          color: #013E37;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0.5;
        }

        .rb-modal-close:hover {
          background: rgba(1, 62, 55, 0.08);
          opacity: 1;
          transform: rotate(90deg);
        }

        .rb-modal-close-icon {
          width: 20px;
          height: 20px;
        }

        /* ============================================
           BODY
           ============================================ */
        .rb-modal-body {
          padding: 24px 28px;
          overflow-y: auto;
          flex: 1;
        }

        .rb-modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .rb-modal-body::-webkit-scrollbar-track {
          background: #FFEFB3;
          border-radius: 8px;
        }

        .rb-modal-body::-webkit-scrollbar-thumb {
          background: #013E37;
          border-radius: 8px;
        }

        .rb-modal-body::-webkit-scrollbar-thumb:hover {
          background: #0A5C54;
        }

        /* ============================================
           SECTIONS
           ============================================ */
        .rb-section {
          background: #FFF9E6;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          padding: 20px;
          margin-bottom: 16px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }

        .rb-section:nth-child(1) { animation-delay: 0.05s; }
        .rb-section:nth-child(2) { animation-delay: 0.1s; }
        .rb-section:nth-child(3) { animation-delay: 0.15s; }
        .rb-section:nth-child(4) { animation-delay: 0.2s; }
        .rb-section:nth-child(5) { animation-delay: 0.25s; }

        .rb-section:hover {
          border-color: #013E37;
          box-shadow: 0 2px 12px rgba(1, 62, 55, 0.06);
        }

        .rb-section-title {
          font-size: 15px;
          font-weight: 600;
          color: #013E37;
          margin: 0 0 14px 0;
        }

        .rb-section-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
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
          color: #013E37;
        }

        .rb-form-required {
          color: #EF4444;
        }

        .rb-form-hint {
          font-size: 12px;
          color: #013E37;
          opacity: 0.4;
          margin: 2px 0 0 0;
        }

        .rb-form-input,
        .rb-form-select,
        .rb-form-textarea {
          padding: 10px 14px;
          border: 1.5px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          font-family: inherit;
          background: #FFFFFF;
          color: #013E37;
        }

        .rb-form-input:focus,
        .rb-form-select:focus,
        .rb-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.06);
        }

        .rb-form-input::placeholder,
        .rb-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.3;
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
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 8px;
        }

        .rb-metric-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border: 2px solid #FFEFB3;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          background: #FFFFFF;
        }

        .rb-metric-item:hover {
          border-color: #013E37;
          background: #FFF9E6;
          transform: translateY(-1px);
        }

        .rb-metric-selected {
          border-color: #013E37;
          background: #FFEFB3;
        }

        .rb-metric-selected:hover {
          border-color: #0A5C54;
          background: #FFEFB3;
        }

        .rb-metric-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #013E37;
          cursor: pointer;
        }

        .rb-metric-icon {
          font-size: 18px;
        }

        .rb-metric-name {
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
        }

        /* ============================================
           CONFIG GRID
           ============================================ */
        .rb-config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
        }

        /* ============================================
           SCHEDULE GRID
           ============================================ */
        .rb-schedule-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 14px;
        }

        /* ============================================
           FOOTER
           ============================================ */
        .rb-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 28px 24px;
          border-top: 1px solid #FFEFB3;
          background: #FFF9E6;
          border-radius: 0 0 20px 20px;
          flex-shrink: 0;
        }

        .rb-modal-cancel {
          padding: 10px 24px;
          background: transparent;
          color: #013E37;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rb-modal-cancel:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: translateY(-1px);
        }

        .rb-modal-save {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 28px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.25);
        }

        .rb-modal-save:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.35);
        }

        .rb-modal-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .rb-save-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 239, 179, 0.3);
          border-top-color: #FFEFB3;
          border-radius: 50%;
          animation: rbSpin 0.8s linear infinite;
        }

        .rb-btn-svg {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          .rb-modal {
            max-width: 100%;
            max-height: 95vh;
            border-radius: 16px;
          }

          .rb-modal-header {
            padding: 18px 20px;
            border-radius: 16px 16px 0 0;
          }

          .rb-modal-body {
            padding: 18px 20px;
          }

          .rb-modal-footer {
            padding: 14px 20px 20px;
            border-radius: 0 0 16px 16px;
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

          .rb-modal-title {
            font-size: 20px;
          }

          .rb-modal-header-icon {
            width: 40px;
            height: 40px;
          }

          .rb-modal-header-svg {
            width: 20px;
            height: 20px;
          }

          .rb-modal-cancel,
          .rb-modal-save {
            flex: 1;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .rb-modal-footer {
            flex-direction: column;
          }

          .rb-modal-cancel,
          .rb-modal-save {
            width: 100%;
          }

          .rb-modal-title {
            font-size: 18px;
          }

          .rb-modal-subtitle {
            font-size: 13px;
          }

          .rb-section {
            padding: 16px;
          }

          .rb-metrics-grid {
            grid-template-columns: 1fr;
          }

          .rb-form-input,
          .rb-form-select,
          .rb-form-textarea {
            font-size: 13px;
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportBuilder;