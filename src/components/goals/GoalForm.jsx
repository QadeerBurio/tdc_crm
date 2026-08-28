import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Plus, Trash2, Target, Calendar, Users, Layers, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const GoalForm = ({ goal, onSave, onCancel, isOpen }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'individual',
    category: 'growth',
    priority: 'medium',
    target: { value: 100, unit: 'percentage' },
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    period: 'monthly',
    ownerId: '',
    parentGoalId: '',
    segmentId: '',
    departmentId: '',
    teamId: '',
    employeeId: ''
  });
  const [segments, setSegments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    if (goal) {
      setFormData({
        ...goal,
        startDate: goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : '',
        endDate: goal.endDate ? new Date(goal.endDate).toISOString().split('T')[0] : '',
        target: goal.target || { value: 100, unit: 'percentage' }
      });
    }
    fetchOptions();
  }, [goal]);

  const fetchOptions = async () => {
    try {
      // Try to fetch from API
      let segmentsData = [];
      let departmentsData = [];
      let teamsData = [];
      let usersData = [];

      try {
        const [segmentsRes, deptsRes, teamsRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/organization/segments`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/organization/departments`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/organization/teams`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (segmentsRes.ok) {
          const data = await segmentsRes.json();
          segmentsData = data.data || [];
        }
        if (deptsRes.ok) {
          const data = await deptsRes.json();
          departmentsData = data.data || [];
        }
        if (teamsRes.ok) {
          const data = await teamsRes.json();
          teamsData = data.data || [];
        }
        if (usersRes.ok) {
          const data = await usersRes.json();
          usersData = data.data || [];
        }
      } catch (err) {
        console.warn('API not available, using mock data');
        // Use mock data if API fails
        segmentsData = getMockSegments();
        departmentsData = getMockDepartments();
        teamsData = getMockTeams();
        usersData = getMockUsers();
      }

      setSegments(segmentsData);
      setDepartments(departmentsData);
      setTeams(teamsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const getMockSegments = () => [
    { _id: 'seg1', name: 'Technology' },
    { _id: 'seg2', name: 'Marketing' },
    { _id: 'seg3', name: 'Operations' }
  ];

  const getMockDepartments = () => [
    { _id: 'dept1', name: 'Engineering' },
    { _id: 'dept2', name: 'Sales' },
    { _id: 'dept3', name: 'Design' }
  ];

  const getMockTeams = () => [
    { _id: 'team1', name: 'Frontend' },
    { _id: 'team2', name: 'Backend' },
    { _id: 'team3', name: 'SEO' }
  ];

  const getMockUsers = () => [
    { _id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    { _id: 'user2', firstName: 'Sarah', lastName: 'Smith', email: 'sarah@example.com' },
    { _id: 'user3', firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com' }
  ];

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
      newErrors.name = 'Goal name is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (!formData.ownerId) {
      newErrors.ownerId = 'Owner is required';
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
      try {
        const response = await fetch(`${API_URL}/goals`, {
          method: goal ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(goal ? 'Goal updated successfully!' : 'Goal created successfully!');
          await onSave(formData);
          return;
        }
      } catch (err) {
        console.warn('API not available, saving locally');
      }

      // Save locally if API fails
      toast.success(goal ? 'Goal updated locally!' : 'Goal created locally!');
      await onSave(formData);
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  const getLevelLabel = (level) => {
    const labels = {
      'company': '🏢 Company',
      'segment': '📊 Segment',
      'department': '🏛️ Department',
      'team': '👥 Team',
      'individual': '👤 Individual'
    };
    return labels[level] || level;
  };

  const getLevelColor = (level) => {
    const colors = {
      'company': '#3B82F6',
      'segment': '#8B5CF6',
      'department': '#10B981',
      'team': '#F59E0B',
      'individual': '#EF4444'
    };
    return colors[level] || '#6B7280';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="gf-modal-overlay" onClick={onCancel}>
        <div className="gf-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="gf-modal-header">
            <div className="gf-modal-title-wrapper">
              <div className="gf-modal-icon-wrapper">
                <Target className="gf-modal-icon" />
              </div>
              <div>
                <h2 className="gf-modal-title">
                  {goal ? 'Edit Goal' : 'Create New Goal'}
                </h2>
                <p className="gf-modal-subtitle">
                  {goal ? 'Update goal details and settings' : 'Define a new goal to track progress'}
                </p>
              </div>
            </div>
            <button onClick={onCancel} className="gf-modal-close">
              <X className="gf-modal-close-icon" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="gf-form">
            <div className="gf-form-body">
              {/* Basic Info */}
              <div className="gf-form-group">
                <label className="gf-form-label">
                  Goal Name <span className="gf-form-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`gf-form-input ${errors.name ? 'gf-form-input-error' : ''}`}
                  placeholder="Enter goal name"
                  autoFocus
                />
                {errors.name && <p className="gf-form-error">{errors.name}</p>}
              </div>

              <div className="gf-form-group">
                <label className="gf-form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="gf-form-textarea"
                  rows="3"
                  placeholder="Describe your goal in detail"
                />
              </div>

              {/* Level & Priority */}
              <div className="gf-form-row">
                <div className="gf-form-group">
                  <label className="gf-form-label">Level <span className="gf-form-required">*</span></label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleChange('level', e.target.value)}
                    className="gf-form-select"
                    style={{ borderColor: getLevelColor(formData.level) }}
                  >
                    <option value="company">🏢 Company</option>
                    <option value="segment">📊 Segment</option>
                    <option value="department">🏛️ Department</option>
                    <option value="team">👥 Team</option>
                    <option value="individual">👤 Individual</option>
                  </select>
                </div>
                <div className="gf-form-group">
                  <label className="gf-form-label">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="gf-form-select"
                  >
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🔵 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              {/* Target */}
              <div className="gf-form-row">
                <div className="gf-form-group">
                  <label className="gf-form-label">Target Value</label>
                  <input
                    type="number"
                    value={formData.target.value}
                    onChange={(e) => handleChange('target.value', parseFloat(e.target.value) || 0)}
                    className="gf-form-input"
                    placeholder="100"
                    min="0"
                  />
                </div>
                <div className="gf-form-group">
                  <label className="gf-form-label">Unit</label>
                  <select
                    value={formData.target.unit}
                    onChange={(e) => handleChange('target.unit', e.target.value)}
                    className="gf-form-select"
                  >
                    <option value="number">Number</option>
                    <option value="percentage">Percentage</option>
                    <option value="currency">Currency</option>
                    <option value="hours">Hours</option>
                    <option value="score">Score</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="gf-form-row">
                <div className="gf-form-group">
                  <label className="gf-form-label">Start Date</label>
                  <div className="gf-form-date-wrapper">
                    <Calendar className="gf-form-date-icon" />
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      className="gf-form-date"
                    />
                  </div>
                </div>
                <div className="gf-form-group">
                  <label className="gf-form-label">
                    End Date <span className="gf-form-required">*</span>
                  </label>
                  <div className="gf-form-date-wrapper">
                    <Calendar className="gf-form-date-icon" />
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      className={`gf-form-date ${errors.endDate ? 'gf-form-input-error' : ''}`}
                    />
                  </div>
                  {errors.endDate && <p className="gf-form-error">{errors.endDate}</p>}
                </div>
              </div>

              {/* Period */}
              <div className="gf-form-group">
                <label className="gf-form-label">Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => handleChange('period', e.target.value)}
                  className="gf-form-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              {/* Owner */}
              <div className="gf-form-group">
                <label className="gf-form-label">
                  Owner <span className="gf-form-required">*</span>
                </label>
                <select
                  value={formData.ownerId}
                  onChange={(e) => handleChange('ownerId', e.target.value)}
                  className={`gf-form-select ${errors.ownerId ? 'gf-form-input-error' : ''}`}
                >
                  <option value="">Select Owner</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
                {errors.ownerId && <p className="gf-form-error">{errors.ownerId}</p>}
              </div>

              {/* Parent Goal */}
              <div className="gf-form-group">
                <label className="gf-form-label">Parent Goal</label>
                <select
                  value={formData.parentGoalId}
                  onChange={(e) => handleChange('parentGoalId', e.target.value)}
                  className="gf-form-select"
                >
                  <option value="">None (Top Level)</option>
                  <option value="parent1">Q4 Revenue Goal</option>
                  <option value="parent2">2024 Growth Goal</option>
                </select>
                <p className="gf-form-hint">Link to a parent goal for hierarchy</p>
              </div>

              {/* Organization Context */}
              <div className="gf-form-section">
                <div className="gf-form-section-header">
                  <Layers className="gf-form-section-icon" />
                  <span className="gf-form-section-title">Organization Context</span>
                </div>
                <div className="gf-form-row">
                  <div className="gf-form-group">
                    <label className="gf-form-label">Segment</label>
                    <select
                      value={formData.segmentId}
                      onChange={(e) => handleChange('segmentId', e.target.value)}
                      className="gf-form-select"
                    >
                      <option value="">Select Segment</option>
                      {segments.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="gf-form-group">
                    <label className="gf-form-label">Department</label>
                    <select
                      value={formData.departmentId}
                      onChange={(e) => handleChange('departmentId', e.target.value)}
                      className="gf-form-select"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="gf-form-group">
                    <label className="gf-form-label">Team</label>
                    <select
                      value={formData.teamId}
                      onChange={(e) => handleChange('teamId', e.target.value)}
                      className="gf-form-select"
                    >
                      <option value="">Select Team</option>
                      {teams.map((t) => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="gf-form-actions">
              <button
                type="button"
                onClick={onCancel}
                className="gf-form-cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="gf-form-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="gf-form-spinner"></div>
                    {goal ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Target className="gf-btn-icon" />
                    {goal ? 'Update Goal' : 'Create Goal'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        /* ============================================
           MODAL OVERLAY
           ============================================ */
        .gf-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: gfFadeIn 0.3s ease;
        }

        @keyframes gfFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .gf-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 640px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: gfSlideUp 0.3s ease;
        }

        @keyframes gfSlideUp {
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
        .gf-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          flex-shrink: 0;
        }

        .gf-modal-title-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .gf-modal-icon-wrapper {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #dbeafe, #eff6ff);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gf-modal-icon {
          width: 22px;
          height: 22px;
          color: #3b82f6;
        }

        .gf-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.3;
        }

        .gf-modal-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .gf-modal-close {
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

        .gf-modal-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .gf-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        /* ============================================
           FORM
           ============================================ */
        .gf-form {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .gf-form-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .gf-form-body::-webkit-scrollbar {
          width: 4px;
        }

        .gf-form-body::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .gf-form-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .gf-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 16px;
        }

        .gf-form-group:last-child {
          margin-bottom: 0;
        }

        .gf-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
        }

        .gf-form-required {
          color: #ef4444;
        }

        .gf-form-hint {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
        }

        .gf-form-input,
        .gf-form-textarea,
        .gf-form-select {
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

        .gf-form-input:focus,
        .gf-form-textarea:focus,
        .gf-form-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .gf-form-input-error {
          border-color: #ef4444 !important;
        }

        .gf-form-input-error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }

        .gf-form-error {
          font-size: 12px;
          color: #ef4444;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .gf-form-error::before {
          content: '⚠';
        }

        .gf-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .gf-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .gf-form-date-wrapper {
          position: relative;
        }

        .gf-form-date-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #94a3b8;
          pointer-events: none;
        }

        .gf-form-date {
          width: 100%;
          padding: 10px 14px 10px 36px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #0f172a;
          font-family: inherit;
        }

        .gf-form-date:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .gf-form-section {
          margin-top: 8px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .gf-form-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .gf-form-section-icon {
          width: 16px;
          height: 16px;
          color: #64748b;
        }

        .gf-form-section-title {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
        }

        /* ============================================
           ACTIONS
           ============================================ */
        .gf-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
          flex-shrink: 0;
          border-radius: 0 0 16px 16px;
        }

        .gf-form-cancel {
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

        .gf-form-cancel:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .gf-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .gf-form-submit {
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

        .gf-form-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        .gf-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .gf-form-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: gfSpin 0.8s linear infinite;
        }

        @keyframes gfSpin {
          to { transform: rotate(360deg); }
        }

        .gf-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .gf-modal {
            max-width: 100%;
            margin: 16px;
            max-height: 95vh;
          }

          .gf-modal-header {
            padding: 16px 18px;
          }

          .gf-form-body {
            padding: 18px;
          }

          .gf-form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .gf-form-actions {
            padding: 14px 18px;
            flex-direction: column;
          }

          .gf-form-cancel,
          .gf-form-submit {
            width: 100%;
            justify-content: center;
          }

          .gf-modal-title {
            font-size: 18px;
          }

          .gf-modal-icon-wrapper {
            width: 38px;
            height: 38px;
          }

          .gf-modal-icon {
            width: 18px;
            height: 18px;
          }

          .gf-form-section {
            padding: 12px;
          }
        }

        @media (max-width: 480px) {
          .gf-modal {
            margin: 12px;
          }

          .gf-modal-header {
            padding: 14px 16px;
          }

          .gf-form-body {
            padding: 16px;
          }

          .gf-form-group {
            margin-bottom: 12px;
          }

          .gf-form-input,
          .gf-form-select,
          .gf-form-date {
            padding: 8px 12px;
            font-size: 13px;
          }

          .gf-form-textarea {
            padding: 8px 12px;
            font-size: 13px;
            min-height: 50px;
          }

          .gf-form-actions {
            padding: 12px 16px;
          }

          .gf-modal-title-wrapper {
            gap: 10px;
          }

          .gf-modal-title {
            font-size: 16px;
          }

          .gf-modal-subtitle {
            font-size: 13px;
          }

          .gf-form-section {
            padding: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default GoalForm;