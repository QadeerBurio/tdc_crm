// components/kpi/KPIForm.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, BarChart2, Plus, Trash2, HelpCircle, CheckCircle, AlertCircle, Target, Zap, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const KPIForm = ({ kpi, onSave, onCancel, isOpen }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'productivity',
    appliesTo: 'employee',
    applicableRoles: ['employee'],
    formula: '',
    target: { value: 80, operator: '>=', unit: 'percentage' },
    weight: 1,
    frequency: 'weekly',
    dataSource: 'task',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formulaPreview, setFormulaPreview] = useState('');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    if (kpi) {
      setFormData({
        ...kpi,
        target: kpi.target || { value: 80, operator: '>=', unit: 'percentage' }
      });
    }
  }, [kpi]);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'KPI name is required';
    }
    if (!formData.formula.trim()) {
      newErrors.formula = 'Formula is required';
    }
    if (!formData.target.value || formData.target.value <= 0) {
      newErrors['target.value'] = 'Target value must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      // Try to save to API
      const url = kpi 
        ? `${API_URL}/kpis/definitions/${kpi._id}`
        : `${API_URL}/kpis/definitions`;
      
      const method = kpi ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success(kpi ? 'KPI updated successfully!' : 'KPI created successfully!');
          await onSave(formData);
        } else {
          throw new Error(result.message || 'Failed to save KPI');
        }
      } else {
        throw new Error('Failed to save KPI');
      }
    } catch (error) {
      console.error('Error saving KPI:', error);
      toast.error(error.message || 'Failed to save KPI');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      productivity: 'Productivity',
      quality: 'Quality',
      efficiency: 'Efficiency',
      satisfaction: 'Satisfaction',
      growth: 'Growth',
      retention: 'Retention',
      financial: 'Financial'
    };
    return labels[category] || category;
  };

  if (!isOpen) return null;

  return (
    <div className="kf-modal-overlay" onClick={onCancel}>
      <div className="kf-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="kf-modal-header">
          <div className="kf-modal-title-wrapper">
            <div className="kf-modal-icon-wrapper">
              <BarChart2 className="kf-modal-icon" />
            </div>
            <div>
              <h2 className="kf-modal-title">
                {kpi ? 'Edit KPI' : 'Create New KPI'}
              </h2>
              <p className="kf-modal-subtitle">
                {kpi ? 'Update KPI details and settings' : 'Define a new Key Performance Indicator'}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="kf-modal-close">
            <X className="kf-modal-close-icon" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="kf-form">
          <div className="kf-form-body">
            {/* Basic Info */}
            <div className="kf-form-grid">
              <div className="kf-form-group">
                <label className="kf-form-label">
                  Name <span className="kf-form-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`kf-form-input ${errors.name ? 'kf-form-input-error' : ''}`}
                  placeholder="e.g., Task Completion Rate"
                  autoFocus
                />
                {errors.name && <p className="kf-form-error">{errors.name}</p>}
              </div>
              <div className="kf-form-group">
                <label className="kf-form-label">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  className="kf-form-input"
                  placeholder="e.g., task-completion-rate"
                />
                <p className="kf-form-hint">URL-friendly identifier (auto-generated if empty)</p>
              </div>
            </div>

            <div className="kf-form-group">
              <label className="kf-form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="kf-form-textarea"
                rows="2"
                placeholder="Describe what this KPI measures"
              />
            </div>

            {/* Category & Applies To */}
            <div className="kf-form-grid">
              <div className="kf-form-group">
                <label className="kf-form-label">Category <span className="kf-form-required">*</span></label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="kf-form-select"
                >
                  <option value="productivity">📊 Productivity</option>
                  <option value="quality">✅ Quality</option>
                  <option value="efficiency">⚡ Efficiency</option>
                  <option value="satisfaction">😊 Satisfaction</option>
                  <option value="growth">📈 Growth</option>
                  <option value="retention">🔄 Retention</option>
                  <option value="financial">💰 Financial</option>
                </select>
              </div>
              <div className="kf-form-group">
                <label className="kf-form-label">Applies To <span className="kf-form-required">*</span></label>
                <select
                  value={formData.appliesTo}
                  onChange={(e) => handleChange('appliesTo', e.target.value)}
                  className="kf-form-select"
                >
                  <option value="company">🏢 Company</option>
                  <option value="segment">📊 Segment</option>
                  <option value="department">🏛️ Department</option>
                  <option value="team">👥 Team</option>
                  <option value="employee">👤 Employee</option>
                  <option value="project">📋 Project</option>
                  <option value="client">🤝 Client</option>
                </select>
              </div>
            </div>

            {/* Formula */}
            <div className="kf-form-group">
              <label className="kf-form-label">
                Formula <span className="kf-form-required">*</span>
              </label>
              <input
                type="text"
                value={formData.formula}
                onChange={(e) => handleChange('formula', e.target.value)}
                className={`kf-form-input ${errors.formula ? 'kf-form-input-error' : ''}`}
                placeholder="e.g., (completed_tasks / total_tasks) * 100"
              />
              {errors.formula && <p className="kf-form-error">{errors.formula}</p>}
              <p className="kf-form-hint">
                Use variables like: completed_tasks, total_tasks, billable_hours, total_hours
              </p>
            </div>

            {/* Target */}
            <div className="kf-form-grid kf-form-grid-3">
              <div className="kf-form-group">
                <label className="kf-form-label">Operator</label>
                <select
                  value={formData.target.operator}
                  onChange={(e) => handleChange('target.operator', e.target.value)}
                  className="kf-form-select"
                >
                  <option value=">=">≥ (Greater than or equal)</option>
                  <option value="<=">≤ (Less than or equal)</option>
                  <option value="==">= (Equal to)</option>
                </select>
              </div>
              <div className="kf-form-group">
                <label className="kf-form-label">
                  Target Value <span className="kf-form-required">*</span>
                </label>
                <input
                  type="number"
                  value={formData.target.value}
                  onChange={(e) => handleChange('target.value', parseFloat(e.target.value) || 0)}
                  className={`kf-form-input ${errors['target.value'] ? 'kf-form-input-error' : ''}`}
                  placeholder="80"
                  min="0"
                  step="0.1"
                />
                {errors['target.value'] && <p className="kf-form-error">{errors['target.value']}</p>}
              </div>
              <div className="kf-form-group">
                <label className="kf-form-label">Unit</label>
                <select
                  value={formData.target.unit}
                  onChange={(e) => handleChange('target.unit', e.target.value)}
                  className="kf-form-select"
                >
                  <option value="percentage">Percentage</option>
                  <option value="number">Number</option>
                  <option value="currency">Currency</option>
                  <option value="score">Score</option>
                  <option value="hours">Hours</option>
                </select>
              </div>
            </div>

            {/* Weight & Frequency */}
            <div className="kf-form-grid">
              <div className="kf-form-group">
                <label className="kf-form-label">Weight</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 1)}
                  className="kf-form-input"
                  placeholder="1"
                  min="0"
                  max="100"
                  step="0.5"
                />
                <p className="kf-form-hint">Relative importance (1-10)</p>
              </div>
              <div className="kf-form-group">
                <label className="kf-form-label">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => handleChange('frequency', e.target.value)}
                  className="kf-form-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>

            {/* Data Source */}
            <div className="kf-form-group">
              <label className="kf-form-label">Data Source</label>
              <select
                value={formData.dataSource}
                onChange={(e) => handleChange('dataSource', e.target.value)}
                className="kf-form-select"
              >
                <option value="task">📋 Tasks</option>
                <option value="time">⏱️ Time Logs</option>
                <option value="attendance">📅 Attendance</option>
                <option value="qa">✅ QA</option>
                <option value="client">🤝 Clients</option>
                <option value="project">📊 Projects</option>
                <option value="custom">⚙️ Custom</option>
              </select>
            </div>

            {/* Applicable Roles */}
            <div className="kf-form-group">
              <label className="kf-form-label">Applicable Roles</label>
              <div className="kf-form-roles">
                {['super_admin', 'admin', 'manager', 'employee', 'client'].map((role) => (
                  <label key={role} className="kf-form-role">
                    <input
                      type="checkbox"
                      checked={formData.applicableRoles?.includes(role) || false}
                      onChange={(e) => {
                        const roles = e.target.checked 
                          ? [...(formData.applicableRoles || []), role]
                          : (formData.applicableRoles || []).filter(r => r !== role);
                        handleChange('applicableRoles', roles);
                      }}
                      className="kf-form-checkbox"
                    />
                    <span className="kf-form-role-label">{role.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
              <p className="kf-form-hint">Roles that can view and manage this KPI</p>
            </div>

            {/* Active Status */}
            <div className="kf-form-active">
              <label className="kf-form-switch">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="kf-form-switch-input"
                />
                <span className="kf-form-switch-slider"></span>
                <span className="kf-form-switch-label">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
              <p className="kf-form-hint">Inactive KPIs won't be tracked or displayed</p>
            </div>
          </div>

          {/* Actions */}
          <div className="kf-form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="kf-form-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="kf-form-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="kf-form-spinner"></div>
                  {kpi ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <BarChart2 className="kf-btn-icon" />
                  {kpi ? 'Update KPI' : 'Create KPI'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           MODAL OVERLAY
           ============================================ */
        .kf-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: kfFadeIn 0.3s ease;
        }

        @keyframes kfFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .kf-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 680px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: kfSlideUp 0.3s ease;
        }

        @keyframes kfSlideUp {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* ============================================
           HEADER
           ============================================ */
        .kf-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          flex-shrink: 0;
        }

        .kf-modal-title-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .kf-modal-icon-wrapper {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #dbeafe, #eff6ff);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kf-modal-icon {
          width: 22px;
          height: 22px;
          color: #3b82f6;
        }

        .kf-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.3;
        }

        .kf-modal-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .kf-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: none;
          background: #f1f5f9;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .kf-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .kf-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        /* ============================================
           FORM
           ============================================ */
        .kf-form {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .kf-form-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .kf-form-body::-webkit-scrollbar {
          width: 4px;
        }

        .kf-form-body::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .kf-form-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .kf-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 16px;
        }

        .kf-form-group:last-child {
          margin-bottom: 0;
        }

        .kf-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .kf-form-required {
          color: #ef4444;
        }

        .kf-form-hint {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
        }

        .kf-form-error {
          font-size: 12px;
          color: #ef4444;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .kf-form-error::before {
          content: '⚠';
        }

        .kf-form-input,
        .kf-form-textarea,
        .kf-form-select {
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

        .kf-form-input:focus,
        .kf-form-textarea:focus,
        .kf-form-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .kf-form-input-error {
          border-color: #ef4444 !important;
        }

        .kf-form-input-error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }

        .kf-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .kf-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .kf-form-grid-3 {
          grid-template-columns: 1fr 1fr 1fr;
        }

        /* ============================================
           ROLES
           ============================================ */
        .kf-form-roles {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding-top: 4px;
        }

        .kf-form-role {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px 4px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #ffffff;
        }

        .kf-form-role:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .kf-form-checkbox {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          border: 1.5px solid #d1d5db;
          accent-color: #3b82f6;
          cursor: pointer;
        }

        .kf-form-role-label {
          font-size: 13px;
          color: #0f172a;
          text-transform: capitalize;
        }

        /* ============================================
           ACTIVE SWITCH
           ============================================ */
        .kf-form-active {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin-top: 4px;
        }

        .kf-form-switch {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .kf-form-switch-input {
          display: none;
        }

        .kf-form-switch-slider {
          width: 44px;
          height: 24px;
          background: #cbd5e1;
          border-radius: 12px;
          position: relative;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .kf-form-switch-slider::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: #ffffff;
          border-radius: 50%;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .kf-form-switch-input:checked + .kf-form-switch-slider {
          background: #3b82f6;
        }

        .kf-form-switch-input:checked + .kf-form-switch-slider::after {
          left: 22px;
        }

        .kf-form-switch-label {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        /* ============================================
           ACTIONS
           ============================================ */
        .kf-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
          flex-shrink: 0;
          border-radius: 0 0 16px 16px;
        }

        .kf-form-cancel {
          padding: 10px 24px;
          background: #ffffff;
          color: #475569;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .kf-form-cancel:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .kf-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .kf-form-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 28px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }

        .kf-form-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        .kf-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .kf-form-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: kfSpin 0.8s linear infinite;
        }

        @keyframes kfSpin {
          to { transform: rotate(360deg); }
        }

        .kf-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .kf-modal {
            max-width: 100%;
            margin: 16px;
            max-height: 95vh;
          }

          .kf-modal-header {
            padding: 16px 18px;
          }

          .kf-form-body {
            padding: 18px;
          }

          .kf-form-grid {
            grid-template-columns: 1fr;
          }

          .kf-form-grid-3 {
            grid-template-columns: 1fr;
          }

          .kf-form-actions {
            padding: 14px 18px;
            flex-direction: column;
          }

          .kf-form-cancel,
          .kf-form-submit {
            width: 100%;
            justify-content: center;
          }

          .kf-modal-title {
            font-size: 18px;
          }

          .kf-modal-icon-wrapper {
            width: 38px;
            height: 38px;
          }

          .kf-modal-icon {
            width: 18px;
            height: 18px;
          }

          .kf-form-roles {
            gap: 6px;
          }

          .kf-form-role {
            padding: 3px 10px 3px 6px;
          }

          .kf-form-role-label {
            font-size: 12px;
          }

          .kf-form-active {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }

        @media (max-width: 480px) {
          .kf-modal {
            margin: 12px;
          }

          .kf-modal-header {
            padding: 14px 16px;
          }

          .kf-form-body {
            padding: 16px;
          }

          .kf-form-group {
            margin-bottom: 12px;
          }

          .kf-form-input,
          .kf-form-select,
          .kf-form-textarea {
            padding: 8px 12px;
            font-size: 13px;
          }

          .kf-form-actions {
            padding: 12px 16px;
          }

          .kf-modal-title-wrapper {
            gap: 10px;
          }

          .kf-modal-title {
            font-size: 16px;
          }

          .kf-modal-subtitle {
            font-size: 13px;
          }

          .kf-form-roles {
            flex-direction: column;
          }

          .kf-form-role {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default KPIForm;