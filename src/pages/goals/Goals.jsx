// pages/goals/Goals.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GoalList from '../../components/goals/GoalList';
import { 
  Plus, Filter, Download, X, TrendingUp, 
  Target, Zap, Calendar, Users, CheckCircle,
  AlertCircle, Clock, Award, BarChart3,
  ChevronRight, Search, RefreshCw, Layers
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Goals = () => {
  const { token } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    onTrack: 0,
    atRisk: 0,
    averageProgress: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'company',
    priority: 'medium',
    startDate: '',
    endDate: '',
    targetValue: '',
    progress: 0
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/goals/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        const data = response.data.data;
        setStats({
          total: data.total || 0,
          inProgress: data.byStatus?.find(s => s._id === 'in_progress')?.count || 0,
          completed: data.byStatus?.find(s => s._id === 'completed')?.count || 0,
          onTrack: data.onTrack || 0,
          atRisk: data.atRisk || 0,
          averageProgress: data.averageProgress || 0
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Don't show error toast for stats, just use defaults
    } finally {
      setStatsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a goal name');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/goals`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        toast.success('Goal created successfully!');
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          level: 'company',
          priority: 'medium',
          startDate: '',
          endDate: '',
          targetValue: '',
          progress: 0
        });
        // Refresh stats and goal list
        await fetchStats();
        // Refresh goal list by reloading the GoalList component
        window.location.reload();
      } else {
        throw new Error(response.data?.message || 'Failed to create goal');
      }
    } catch (err) {
      console.error('Error creating goal:', err);
      toast.error(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      company: '#013E37',
      segment: '#0A5C54',
      department: '#1A7A6E',
      team: '#FFEFB3',
      individual: '#2A9A8A'
    };
    return colors[level] || '#6B7280';
  };

  const getLevelLabel = (level) => {
    const labels = {
      company: 'Company',
      segment: 'Segment',
      department: 'Department',
      team: 'Team',
      individual: 'Individual'
    };
    return labels[level] || level;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#EF4444',
      high: '#F59E0B',
      medium: '#013E37',
      low: '#0A5C54'
    };
    return colors[priority] || '#6B7280';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    };
    return labels[priority] || priority;
  };

  return (
    <>
      <div className="goals-container">
        {/* Header */}
        <div className="goals-header">
          <div className="goals-header-left">
            <div className="goals-title-wrapper">
              <div className="goals-title-icon">
                <Layers className="goals-icon" />
              </div>
              <div>
                <h1 className="goals-title">Goals</h1>
                <p className="goals-subtitle">Track and manage company goals</p>
              </div>
            </div>
          </div>
          <div className="goals-header-right">
            <button className="goals-export-btn">
              <Download className="goals-btn-icon" />
              Export
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="goals-create-btn"
            >
              <Plus className="goals-btn-icon" />
              New Goal
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="goals-stats">
          <div className="goals-stat-card goals-stat-card-blue">
            <div className="goals-stat-icon-wrapper">
              <Target className="goals-stat-icon" />
            </div>
            <div>
              <p className="goals-stat-number">{stats.total}</p>
              <p className="goals-stat-label">Total Goals</p>
            </div>
          </div>
          <div className="goals-stat-card goals-stat-card-purple">
            <div className="goals-stat-icon-wrapper">
              <Zap className="goals-stat-icon" />
            </div>
            <div>
              <p className="goals-stat-number">{stats.inProgress}</p>
              <p className="goals-stat-label">In Progress</p>
            </div>
          </div>
          <div className="goals-stat-card goals-stat-card-green">
            <div className="goals-stat-icon-wrapper">
              <CheckCircle className="goals-stat-icon" />
            </div>
            <div>
              <p className="goals-stat-number">{stats.completed}</p>
              <p className="goals-stat-label">Completed</p>
            </div>
          </div>
          <div className="goals-stat-card goals-stat-card-yellow">
            <div className="goals-stat-icon-wrapper">
              <TrendingUp className="goals-stat-icon" />
            </div>
            <div>
              <p className="goals-stat-number">{stats.onTrack}</p>
              <p className="goals-stat-label">On Track</p>
            </div>
          </div>
        </div>

        {/* Goal List */}
        <div className="goals-list-wrapper">
          <GoalList />
        </div>
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="goals-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="goals-modal" onClick={(e) => e.stopPropagation()}>
            <div className="goals-modal-header">
              <div className="goals-modal-title-wrapper">
                <Target className="goals-modal-icon" />
                <h2 className="goals-modal-title">Create New Goal</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="goals-modal-close"
              >
                <X className="goals-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="goals-modal-form">
              <div className="goals-form-group">
                <label className="goals-form-label">
                  Goal Name <span className="goals-form-required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="goals-form-input"
                  placeholder="Enter goal name"
                  autoFocus
                />
              </div>

              <div className="goals-form-group">
                <label className="goals-form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="goals-form-textarea"
                  rows="3"
                  placeholder="Enter goal description"
                />
              </div>

              <div className="goals-form-row">
                <div className="goals-form-group">
                  <label className="goals-form-label">Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="goals-form-select"
                    style={{ borderColor: getLevelColor(formData.level) }}
                  >
                    <option value="company">🏢 Company</option>
                    <option value="segment">📊 Segment</option>
                    <option value="department">🏛️ Department</option>
                    <option value="team">👥 Team</option>
                    <option value="individual">👤 Individual</option>
                  </select>
                </div>
                <div className="goals-form-group">
                  <label className="goals-form-label">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="goals-form-select"
                    style={{ borderColor: getPriorityColor(formData.priority) }}
                  >
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🔵 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div className="goals-form-row">
                <div className="goals-form-group">
                  <label className="goals-form-label">Start Date</label>
                  <div className="goals-form-date-wrapper">
                    <Calendar className="goals-form-date-icon" />
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="goals-form-date"
                    />
                  </div>
                </div>
                <div className="goals-form-group">
                  <label className="goals-form-label">End Date</label>
                  <div className="goals-form-date-wrapper">
                    <Calendar className="goals-form-date-icon" />
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="goals-form-date"
                    />
                  </div>
                </div>
              </div>

              <div className="goals-form-group">
                <label className="goals-form-label">Target Value</label>
                <input
                  type="number"
                  name="targetValue"
                  value={formData.targetValue}
                  onChange={handleChange}
                  className="goals-form-input"
                  placeholder="Enter target value"
                  min="0"
                />
              </div>

              <div className="goals-form-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="goals-form-cancel"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="goals-form-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="goals-form-spinner"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="goals-btn-icon" />
                      Create Goal
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .goals-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           HEADER
           ============================================ */
        .goals-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeInDown 0.6s ease;
        }

        .goals-header-left {
          display: flex;
          align-items: center;
        }

        .goals-title-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .goals-title-icon {
          width: 48px;
          height: 48px;
          background: #013E37;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.25);
          animation: pulse 2s ease-in-out infinite;
        }

        .goals-icon {
          width: 24px;
          height: 24px;
          color: #FFEFB3;
        }

        .goals-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .goals-subtitle {
          font-size: 15px;
          color: #013E37;
          opacity: 0.6;
          margin: 2px 0 0 0;
        }

        .goals-header-right {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .goals-export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #ffffff;
          color: #013E37;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .goals-export-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(1, 62, 55, 0.08);
        }

        .goals-create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(1, 62, 55, 0.3);
        }

        .goals-create-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.4);
        }

        .goals-create-btn:active {
          transform: translateY(0);
        }

        .goals-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           STATS
           ============================================ */
        .goals-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .goals-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #ffffff;
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid #FFEFB3;
          transition: all 0.3s ease;
          cursor: pointer;
          animation: slideUp 0.5s ease both;
        }

        .goals-stat-card:nth-child(1) { animation-delay: 0.05s; }
        .goals-stat-card:nth-child(2) { animation-delay: 0.1s; }
        .goals-stat-card:nth-child(3) { animation-delay: 0.15s; }
        .goals-stat-card:nth-child(4) { animation-delay: 0.2s; }

        .goals-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }

        .goals-stat-card-blue { border-left: 4px solid #013E37; }
        .goals-stat-card-purple { border-left: 4px solid #0A5C54; }
        .goals-stat-card-green { border-left: 4px solid #1A7A6E; }
        .goals-stat-card-yellow { border-left: 4px solid #FFEFB3; }

        .goals-stat-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .goals-stat-card-blue .goals-stat-icon-wrapper {
          background: #E8F0FE;
        }

        .goals-stat-card-purple .goals-stat-icon-wrapper {
          background: #F0ECFA;
        }

        .goals-stat-card-green .goals-stat-icon-wrapper {
          background: #E6F7EC;
        }

        .goals-stat-card-yellow .goals-stat-icon-wrapper {
          background: #FFF8E6;
        }

        .goals-stat-icon {
          width: 20px;
          height: 20px;
        }

        .goals-stat-card-blue .goals-stat-icon { color: #013E37; }
        .goals-stat-card-purple .goals-stat-icon { color: #0A5C54; }
        .goals-stat-card-green .goals-stat-icon { color: #1A7A6E; }
        .goals-stat-card-yellow .goals-stat-icon { color: #013E37; }

        .goals-stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          line-height: 1.2;
        }

        .goals-stat-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
          font-weight: 500;
        }

        /* ============================================
           LIST WRAPPER
           ============================================ */
        .goals-list-wrapper {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }

        .goals-list-wrapper:hover {
          border-color: #013E37;
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06);
        }

        /* ============================================
           MODAL
           ============================================ */
        .goals-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(1, 62, 55, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: fadeIn 0.3s ease;
        }

        .goals-modal {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #FFEFB3;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(1, 62, 55, 0.2);
          animation: modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .goals-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
          border-radius: 16px 16px 0 0;
        }

        .goals-modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .goals-modal-icon {
          width: 28px;
          height: 28px;
          color: #013E37;
        }

        .goals-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }

        .goals-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: none;
          background: transparent;
          border-radius: 8px;
          color: #013E37;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0.5;
        }

        .goals-modal-close:hover {
          background: rgba(1, 62, 55, 0.1);
          opacity: 1;
          transform: rotate(90deg);
        }

        .goals-modal-close-icon {
          width: 18px;
          height: 18px;
        }

        .goals-modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ============================================
           FORM
           ============================================ */
        .goals-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }

        .goals-form-group:nth-child(1) { animation-delay: 0.05s; }
        .goals-form-group:nth-child(2) { animation-delay: 0.1s; }
        .goals-form-group:nth-child(3) { animation-delay: 0.15s; }
        .goals-form-group:nth-child(4) { animation-delay: 0.2s; }
        .goals-form-group:nth-child(5) { animation-delay: 0.25s; }
        .goals-form-group:nth-child(6) { animation-delay: 0.3s; }

        .goals-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }

        .goals-form-required {
          color: #EF4444;
        }

        .goals-form-input,
        .goals-form-textarea,
        .goals-form-select {
          padding: 10px 14px;
          border: 1.5px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          color: #013E37;
        }

        .goals-form-input:focus,
        .goals-form-textarea:focus,
        .goals-form-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .goals-form-input::placeholder,
        .goals-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.4;
        }

        .goals-form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .goals-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .goals-form-date-wrapper {
          position: relative;
        }

        .goals-form-date-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.4;
          pointer-events: none;
        }

        .goals-form-date {
          width: 100%;
          padding: 10px 14px 10px 36px;
          border: 1.5px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #013E37;
          font-family: inherit;
        }

        .goals-form-date:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }

        .goals-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #FFEFB3;
          margin-top: 4px;
        }

        .goals-form-cancel {
          padding: 10px 24px;
          background: transparent;
          color: #013E37;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .goals-form-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
        }

        .goals-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .goals-form-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #013E37;
          color: #FFEFB3;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(1, 62, 55, 0.25);
        }

        .goals-form-submit:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(1, 62, 55, 0.35);
        }

        .goals-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .goals-form-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 239, 179, 0.3);
          border-top-color: #FFEFB3;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 768px) {
          .goals-header {
            flex-direction: column;
            align-items: stretch;
          }

          .goals-header-right {
            width: 100%;
          }

          .goals-export-btn,
          .goals-create-btn {
            flex: 1;
            justify-content: center;
          }

          .goals-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .goals-form-row {
            grid-template-columns: 1fr;
          }

          .goals-modal {
            margin: 16px;
            max-height: 95vh;
          }

          .goals-title {
            font-size: 22px;
          }

          .goals-title-icon {
            width: 40px;
            height: 40px;
          }

          .goals-stat-card {
            padding: 14px 16px;
          }

          .goals-stat-number {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .goals-stats {
            grid-template-columns: 1fr;
          }

          .goals-header-right {
            flex-direction: column;
          }

          .goals-export-btn,
          .goals-create-btn {
            width: 100%;
          }

          .goals-title-wrapper {
            gap: 10px;
          }

          .goals-title {
            font-size: 20px;
          }

          .goals-subtitle {
            font-size: 13px;
          }

          .goals-modal {
            padding: 0;
          }

          .goals-modal-header {
            padding: 16px 18px;
          }

          .goals-modal-form {
            padding: 18px;
          }

          .goals-form-actions {
            flex-direction: column;
          }

          .goals-form-cancel,
          .goals-form-submit {
            width: 100%;
            justify-content: center;
          }
        }

        /* Scrollbar styling */
        .goals-modal::-webkit-scrollbar {
          width: 6px;
        }

        .goals-modal::-webkit-scrollbar-track {
          background: #FFEFB3;
          border-radius: 8px;
        }

        .goals-modal::-webkit-scrollbar-thumb {
          background: #013E37;
          border-radius: 8px;
        }

        .goals-modal::-webkit-scrollbar-thumb:hover {
          background: #0A5C54;
        }
      `}</style>
    </>
  );
};

export default Goals;