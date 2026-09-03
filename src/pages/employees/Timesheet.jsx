// pages/employees/Timesheet.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, 
  Play, 
  Square, 
  Plus, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Loader as LoaderIcon,
  Calendar,
  Search,
  ChevronDown,
  RefreshCw,
  BarChart3,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Timer,
  AlertCircle,
  Check,
  X,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Layers
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeadCell, 
  TableRow 
} from '../../components/common/Table';
import { Loader } from '../../components/common/Loader';
import axios from 'axios';
import toast from 'react-hot-toast';

const Timesheet = () => {
  const { token, user } = useAuth();
  const [timeLogs, setTimeLogs] = useState([]);
  const [runningTimer, setRunningTimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [description, setDescription] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [filterStatus, setFilterStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // API base URL
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchTimeLogs();
    fetchTasks();
    checkRunningTimer();
    
    const interval = setInterval(() => {
      if (runningTimer) {
        setRunningTimer({ ...runningTimer });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [dateRange, filterStatus]);

  const fetchTimeLogs = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${API_URL}/employees/timesheet`, {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end,
          status: filterStatus,
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setTimeLogs(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching time logs:', err);
      let errorMessage = 'Failed to load time logs.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view time logs.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setTasks(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const checkRunningTimer = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees/timesheet/running`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data?.data) {
        setRunningTimer(response.data.data);
      }
    } catch (err) {
      console.error('Error checking running timer:', err);
    }
  };

  const handleRefresh = () => {
    fetchTimeLogs(true);
    checkRunningTimer();
  };

  const handleStartTimer = async () => {
    if (!selectedTask) {
      toast.error('Please select a task');
      return;
    }

    setActionLoading(true);
    try {
      const response = await axios.post(`${API_URL}/employees/timesheet/start`, {
        taskId: selectedTask,
        description: description,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        toast.success('Timer started successfully');
        setRunningTimer(response.data.data);
        setShowTimerModal(false);
        setSelectedTask('');
        setDescription('');
        await fetchTimeLogs(true);
      }
    } catch (err) {
      console.error('Error starting timer:', err);
      let errorMessage = 'Failed to start timer.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid task selection.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopTimer = async (id) => {
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/employees/timesheet/${id}/stop`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Timer stopped successfully');
      setRunningTimer(null);
      await fetchTimeLogs(true);
    } catch (err) {
      console.error('Error stopping timer:', err);
      let errorMessage = 'Failed to stop timer.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Timer already stopped.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/employees/timesheet/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Time log approved successfully');
      await fetchTimeLogs(true);
    } catch (err) {
      console.error('Error approving time log:', err);
      let errorMessage = 'Failed to approve time log.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to approve time logs.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDuration = (hours) => {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDurationShort = (hours) => {
    if (!hours) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimerRunningTime = () => {
    if (!runningTimer) return '0m';
    const start = new Date(runningTimer.startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return `${diffMins}m`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Approved': { bg: '#013E37', text: '#FFEFB3', icon: CheckCircle },
      'approved': { bg: '#013E37', text: '#FFEFB3', icon: CheckCircle },
      'Rejected': { bg: '#FEE2E2', text: '#991B1B', icon: XCircle },
      'rejected': { bg: '#FEE2E2', text: '#991B1B', icon: XCircle },
      'Pending': { bg: '#FFEFB3', text: '#013E37', icon: Clock },
      'pending': { bg: '#FFEFB3', text: '#013E37', icon: Clock },
    };
    return styles[status] || styles.Pending;
  };

  const totalHours = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
  const billableHours = timeLogs.filter(l => l.billable).reduce((sum, log) => sum + (log.duration || 0), 0);

  if (loading) {
    return (
      <div className="timesheet-loading">
        <div className="timesheet-loading-spinner"></div>
        <p className="timesheet-loading-text">Loading timesheet...</p>
      </div>
    );
  }

  return (
    <>
      <div className="timesheet-container">
        {/* Header Section */}
        <div className="timesheet-header">
          <div className="timesheet-header-left">
            <h1 className="timesheet-title">
              <Clock className="timesheet-title-icon" />
              Timesheet
            </h1>
            <p className="timesheet-subtitle">Track your working hours and manage time entries</p>
          </div>
          <div className="timesheet-header-right">
            <button className="timesheet-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`timesheet-refresh-icon ${refreshing ? 'timesheet-spinning' : ''}`} />
            </button>
            {runningTimer ? (
              <button
                className="timesheet-stop-btn"
                onClick={() => handleStopTimer(runningTimer._id)}
                disabled={actionLoading}
              >
                <Square className="timesheet-btn-icon" />
                <span>Stop Timer <span className="timesheet-timer-badge">{getTimerRunningTime()}</span></span>
              </button>
            ) : (
              <button
                className="timesheet-start-btn"
                onClick={() => setShowTimerModal(true)}
                disabled={actionLoading}
              >
                <Play className="timesheet-btn-icon" />
                Start Timer
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="timesheet-stats">
          <div className="timesheet-stat-card">
            <div className="timesheet-stat-icon-wrapper timesheet-stat-icon-blue">
              <Clock className="timesheet-stat-icon" />
            </div>
            <div>
              <p className="timesheet-stat-number">{formatDurationShort(totalHours)}</p>
              <p className="timesheet-stat-label">Total Hours</p>
            </div>
          </div>
          <div className="timesheet-stat-card">
            <div className="timesheet-stat-icon-wrapper timesheet-stat-icon-green">
              <DollarSign className="timesheet-stat-icon" />
            </div>
            <div>
              <p className="timesheet-stat-number">{formatDurationShort(billableHours)}</p>
              <p className="timesheet-stat-label">Billable</p>
            </div>
          </div>
          <div className="timesheet-stat-card">
            <div className="timesheet-stat-icon-wrapper timesheet-stat-icon-yellow">
              <BarChart3 className="timesheet-stat-icon" />
            </div>
            <div>
              <p className="timesheet-stat-number">{formatDurationShort(totalHours - billableHours)}</p>
              <p className="timesheet-stat-label">Non-Billable</p>
            </div>
          </div>
          <div className="timesheet-stat-card">
            <div className="timesheet-stat-icon-wrapper timesheet-stat-icon-purple">
              <Timer className="timesheet-stat-icon" />
            </div>
            <div>
              <p className="timesheet-stat-number">{timeLogs.length}</p>
              <p className="timesheet-stat-label">Entries</p>
            </div>
          </div>
        </div>

        {/* Timer Running Indicator */}
        {runningTimer && (
          <div className="timesheet-timer-running">
            <div className="timesheet-timer-running-content">
              <div className="timesheet-timer-running-left">
                <div className="timesheet-timer-dot"></div>
                <span className="timesheet-timer-running-label">Timer Running</span>
                <span className="timesheet-timer-running-task">
                  {runningTimer.taskId?.title || 'Task'}
                </span>
                <span className="timesheet-timer-running-time">
                  <Clock className="timesheet-timer-running-icon" />
                  {getTimerRunningTime()}
                </span>
              </div>
              <button
                className="timesheet-timer-stop-btn"
                onClick={() => handleStopTimer(runningTimer._id)}
                disabled={actionLoading}
              >
                <Square className="timesheet-btn-icon" />
                Stop
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="timesheet-filters">
          <div className="timesheet-filters-row">
            <div className="timesheet-date-range">
              <div className="timesheet-date-input-wrapper">
                <Calendar className="timesheet-date-icon" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="timesheet-date-input"
                />
              </div>
              <span className="timesheet-date-separator">to</span>
              <div className="timesheet-date-input-wrapper">
                <Calendar className="timesheet-date-icon" />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="timesheet-date-input"
                />
              </div>
            </div>
            <div className="timesheet-filter-controls">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="timesheet-filter-select"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="timesheet-view-toggle">
                <button
                  onClick={() => setViewMode('table')}
                  className={`timesheet-view-btn ${viewMode === 'table' ? 'timesheet-view-active' : ''}`}
                  title="Table View"
                >
                  <Briefcase className="timesheet-view-icon" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`timesheet-view-btn ${viewMode === 'compact' ? 'timesheet-view-active' : ''}`}
                  title="Compact View"
                >
                  <BarChart3 className="timesheet-view-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Time Logs Table */}
        <div className="timesheet-table-wrapper">
          <div className="timesheet-table-container">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell className="timesheet-table-header">Date</TableHeadCell>
                  <TableHeadCell className="timesheet-table-header">Task</TableHeadCell>
                  <TableHeadCell className="timesheet-table-header">Description</TableHeadCell>
                  <TableHeadCell className="timesheet-table-header">Duration</TableHeadCell>
                  <TableHeadCell className="timesheet-table-header timesheet-table-center">Billable</TableHeadCell>
                  <TableHeadCell className="timesheet-table-header timesheet-table-center">Status</TableHeadCell>
                  <TableHeadCell className="timesheet-table-header timesheet-table-center">Actions</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="7" className="timesheet-empty">
                      <div className="timesheet-empty-content">
                        <Clock className="timesheet-empty-icon" size={48} />
                        <p className="timesheet-empty-text">No time entries found</p>
                        <p className="timesheet-empty-subtext">Start tracking your time or add a manual entry</p>
                        <button className="timesheet-empty-btn" onClick={() => setShowTimerModal(true)}>
                          <Play className="timesheet-empty-btn-icon" />
                          Start Timer
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  timeLogs.map((log) => {
                    const statusStyle = getStatusBadge(log.approvalStatus);
                    const StatusIcon = statusStyle.icon;
                    
                    return (
                      <TableRow key={log._id} className="timesheet-table-row">
                        <TableCell>
                          <div className="timesheet-date-cell">
                            <span className="timesheet-date-main">{formatDate(log.startTime)}</span>
                            <span className="timesheet-date-time">{formatTime(log.startTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="timesheet-task-name">
                            {log.taskId?.title || 'N/A'}
                          </span>
                          {log.taskId?.projectId?.projectName && (
                            <span className="timesheet-project-name">
                              {log.taskId.projectId.projectName}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="timesheet-desc-text">
                            {log.description || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="timesheet-duration-text">
                            {formatDuration(log.duration)}
                          </span>
                        </TableCell>
                        <TableCell className="timesheet-table-center">
                          {log.billable ? (
                            <CheckCircle className="timesheet-billable-icon" size={16} />
                          ) : (
                            <XCircle className="timesheet-non-billable-icon" size={16} />
                          )}
                        </TableCell>
                        <TableCell className="timesheet-table-center">
                          <span className="timesheet-status-badge" style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                          }}>
                            <StatusIcon className="timesheet-status-icon" size={10} />
                            {log.approvalStatus || 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell className="timesheet-table-center">
                          <div className="timesheet-actions">
                            {(user?.role === 'admin' || user?.role === 'manager') && 
                             (log.approvalStatus === 'Pending' || !log.approvalStatus) && (
                              <button
                                className="timesheet-approve-btn"
                                onClick={() => handleApprove(log._id)}
                                disabled={actionLoading}
                                title="Approve"
                              >
                                <Check className="timesheet-action-icon" size={14} />
                              </button>
                            )}
                            <button
                              className="timesheet-view-btn-action"
                              onClick={() => {
                                setSelectedLog(log);
                                setShowEditModal(true);
                              }}
                              title="View Details"
                            >
                              <Eye className="timesheet-action-icon" size={14} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Start Timer Modal - Centered like Segment modal */}
      {showTimerModal && (
        <div className="timesheet-modal-overlay" onClick={() => {
          setShowTimerModal(false);
          setSelectedTask('');
          setDescription('');
        }}>
          <div className="timesheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="timesheet-modal-header">
              <h2 className="timesheet-modal-title">
                <Play className="timesheet-modal-title-icon" />
                Start Timer
              </h2>
              <button 
                className="timesheet-modal-close"
                onClick={() => {
                  setShowTimerModal(false);
                  setSelectedTask('');
                  setDescription('');
                }}
              >
                <X className="timesheet-modal-close-icon" />
              </button>
            </div>
            
            <div className="timesheet-modal-body">
              <div className="timesheet-modal-icon-wrapper">
                <div className="timesheet-modal-icon-circle">
                  <Timer className="timesheet-modal-icon" size={28} />
                </div>
              </div>
              
              <div className="timesheet-modal-form">
                <div className="timesheet-form-group">
                  <label className="timesheet-form-label">Select Task <span className="timesheet-form-required">*</span></label>
                  <select
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="timesheet-form-select"
                    disabled={actionLoading}
                  >
                    <option value="">Select a task...</option>
                    {tasks.map((task) => (
                      <option key={task._id} value={task._id}>
                        {task.title} - {task.projectId?.projectName || 'No Project'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="timesheet-form-group">
                  <label className="timesheet-form-label">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="timesheet-form-textarea"
                    placeholder="What are you working on?"
                    disabled={actionLoading}
                  />
                </div>
              </div>
            </div>
            
            <div className="timesheet-modal-footer">
              <button
                className="timesheet-modal-cancel"
                onClick={() => {
                  setShowTimerModal(false);
                  setSelectedTask('');
                  setDescription('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="timesheet-modal-submit"
                onClick={handleStartTimer}
                disabled={actionLoading || !selectedTask}
              >
                {actionLoading ? (
                  <>
                    <div className="timesheet-modal-spinner"></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="timesheet-modal-submit-icon" size={16} />
                    Start Timer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showEditModal && selectedLog && (
        <div className="timesheet-modal-overlay" onClick={() => {
          setShowEditModal(false);
          setSelectedLog(null);
        }}>
          <div className="timesheet-modal timesheet-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="timesheet-modal-header timesheet-detail-header">
              <h2 className="timesheet-modal-title">
                <Eye className="timesheet-modal-title-icon" />
                Time Entry Details
              </h2>
              <button 
                className="timesheet-modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedLog(null);
                }}
              >
                <X className="timesheet-modal-close-icon" />
              </button>
            </div>
            
            <div className="timesheet-modal-body timesheet-detail-body">
              <div className="timesheet-detail-grid">
                <div className="timesheet-detail-item">
                  <span className="timesheet-detail-label">Date</span>
                  <span className="timesheet-detail-value">{formatDate(selectedLog.startTime)}</span>
                </div>
                <div className="timesheet-detail-item">
                  <span className="timesheet-detail-label">Time</span>
                  <span className="timesheet-detail-value">{formatTime(selectedLog.startTime)}</span>
                </div>
                <div className="timesheet-detail-item">
                  <span className="timesheet-detail-label">Task</span>
                  <span className="timesheet-detail-value">{selectedLog.taskId?.title || 'N/A'}</span>
                </div>
                <div className="timesheet-detail-item">
                  <span className="timesheet-detail-label">Project</span>
                  <span className="timesheet-detail-value">{selectedLog.taskId?.projectId?.projectName || 'N/A'}</span>
                </div>
                <div className="timesheet-detail-item">
                  <span className="timesheet-detail-label">Duration</span>
                  <span className="timesheet-detail-value timesheet-duration-value">{formatDuration(selectedLog.duration)}</span>
                </div>
                <div className="timesheet-detail-item">
                  <span className="timesheet-detail-label">Billable</span>
                  <span className="timesheet-detail-value">
                    {selectedLog.billable ? (
                      <CheckCircle className="timesheet-billable-icon" size={16} />
                    ) : (
                      <XCircle className="timesheet-non-billable-icon" size={16} />
                    )}
                  </span>
                </div>
                <div className="timesheet-detail-item timesheet-detail-full">
                  <span className="timesheet-detail-label">Description</span>
                  <span className="timesheet-detail-value">{selectedLog.description || '—'}</span>
                </div>
                <div className="timesheet-detail-item timesheet-detail-full">
                  <span className="timesheet-detail-label">Status</span>
                  <span className="timesheet-detail-value">
                    <span className="timesheet-status-badge" style={{
                      backgroundColor: getStatusBadge(selectedLog.approvalStatus).bg,
                      color: getStatusBadge(selectedLog.approvalStatus).text,
                    }}>
                      {selectedLog.approvalStatus || 'Pending'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="timesheet-modal-footer">
              <button
                className="timesheet-modal-cancel"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedLog(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .timesheet-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           LOADING
           ============================================ */
        .timesheet-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .timesheet-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .timesheet-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           HEADER
           ============================================ */
        .timesheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
          animation: fadeInDown 0.6s ease;
        }
        .timesheet-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .timesheet-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .timesheet-title-icon {
          width: 28px;
          height: 28px;
          color: #013E37;
          animation: pulse 2s ease-in-out infinite;
        }
        .timesheet-subtitle {
          color: #013E37;
          opacity: 0.6;
          font-size: 15px;
          margin: 0;
        }
        .timesheet-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .timesheet-refresh-btn {
          padding: 8px 10px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .timesheet-refresh-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
        }
        .timesheet-refresh-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          transition: transform 0.3s ease;
        }
        .timesheet-spinning {
          animation: spin 1s linear infinite;
        }

        /* ============================================
           BUTTONS
           ============================================ */
        .timesheet-start-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: #013E37;
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.25);
        }
        .timesheet-start-btn:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .timesheet-start-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .timesheet-stop-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: #EF4444;
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
        }
        .timesheet-stop-btn:hover:not(:disabled) {
          background: #DC2626;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
        }
        .timesheet-stop-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .timesheet-btn-icon {
          width: 16px;
          height: 16px;
        }
        .timesheet-timer-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        /* ============================================
           STATS
           ============================================ */
        .timesheet-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .timesheet-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 16px 20px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
        }
        .timesheet-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.08);
          border-color: #013E37;
        }
        .timesheet-stat-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .timesheet-stat-icon-blue {
          background: #E8F0FE;
        }
        .timesheet-stat-icon-green {
          background: #E6F7EC;
        }
        .timesheet-stat-icon-yellow {
          background: #FFF8E6;
        }
        .timesheet-stat-icon-purple {
          background: #F0ECFA;
        }
        .timesheet-stat-icon {
          width: 18px;
          height: 18px;
        }
        .timesheet-stat-icon-blue .timesheet-stat-icon {
          color: #2563EB;
        }
        .timesheet-stat-icon-green .timesheet-stat-icon {
          color: #10B981;
        }
        .timesheet-stat-icon-yellow .timesheet-stat-icon {
          color: #F59E0B;
        }
        .timesheet-stat-icon-purple .timesheet-stat-icon {
          color: #8B5CF6;
        }
        .timesheet-stat-number {
          font-size: 22px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          line-height: 1.2;
        }
        .timesheet-stat-label {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
          font-weight: 500;
        }

        /* ============================================
           TIMER RUNNING
           ============================================ */
        .timesheet-timer-running {
          background: #FFEFB3;
          border: 1px solid #013E37;
          border-radius: 10px;
          padding: 12px 20px;
          margin-bottom: 16px;
          animation: fadeIn 0.5s ease;
        }
        .timesheet-timer-running-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .timesheet-timer-running-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .timesheet-timer-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #EF4444;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .timesheet-timer-running-label {
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
        }
        .timesheet-timer-running-task {
          font-size: 13px;
          color: #013E37;
          padding: 2px 10px;
          background: rgba(1, 62, 55, 0.1);
          border-radius: 4px;
        }
        .timesheet-timer-running-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
          color: #013E37;
        }
        .timesheet-timer-running-icon {
          width: 14px;
          height: 14px;
        }
        .timesheet-timer-stop-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: #EF4444;
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .timesheet-timer-stop-btn:hover:not(:disabled) {
          background: #DC2626;
          transform: scale(1.02);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .timesheet-filters {
          margin-bottom: 16px;
        }
        .timesheet-filters-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .timesheet-date-range {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 200px;
        }
        .timesheet-date-input-wrapper {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          padding: 0 12px;
          flex: 1;
          transition: all 0.3s ease;
        }
        .timesheet-date-input-wrapper:focus-within {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .timesheet-date-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          opacity: 0.5;
        }
        .timesheet-date-input {
          flex: 1;
          padding: 8px 10px;
          border: none;
          outline: none;
          font-size: 13px;
          background: transparent;
          color: #013E37;
        }
        .timesheet-date-separator {
          color: #013E37;
          opacity: 0.5;
          font-size: 13px;
          font-weight: 500;
        }
        .timesheet-filter-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .timesheet-filter-select {
          padding: 8px 14px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 13px;
          background: #ffffff;
          color: #013E37;
          outline: none;
          transition: all 0.3s ease;
          cursor: pointer;
          min-width: 140px;
        }
        .timesheet-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .timesheet-view-toggle {
          display: flex;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #FFEFB3;
          background: #ffffff;
        }
        .timesheet-view-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 10px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #013E37;
          opacity: 0.5;
        }
        .timesheet-view-btn:hover {
          opacity: 0.8;
        }
        .timesheet-view-active {
          background: #013E37;
          color: #FFFFFF;
          opacity: 1;
        }
        .timesheet-view-active:hover {
          opacity: 1;
        }
        .timesheet-view-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           TABLE
           ============================================ */
        .timesheet-table-wrapper {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #FFEFB3;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .timesheet-table-container {
          overflow-x: auto;
        }
        .timesheet-table-header {
          color: #013E37 !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          padding: 14px 16px !important;
          border-bottom: 2px solid #013E37 !important;
          background: #FFEFB3 !important;
        }
        .timesheet-table-center {
          text-align: center !important;
        }
        .timesheet-table-row {
          transition: all 0.2s ease;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .timesheet-table-row:hover {
          background: #FFF9E6 !important;
        }
        .timesheet-table-row:nth-child(1) { animation-delay: 0.05s; }
        .timesheet-table-row:nth-child(2) { animation-delay: 0.1s; }
        .timesheet-table-row:nth-child(3) { animation-delay: 0.15s; }
        .timesheet-table-row:nth-child(4) { animation-delay: 0.2s; }
        .timesheet-table-row:nth-child(5) { animation-delay: 0.25s; }
        .timesheet-table-row td {
          padding: 12px 16px !important;
          border-bottom: 1px solid #FFEFB3 !important;
          color: #013E37 !important;
        }

        /* Date Cell */
        .timesheet-date-cell {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .timesheet-date-main {
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
        }
        .timesheet-date-time {
          font-size: 11px;
          color: #013E37;
          opacity: 0.5;
        }

        /* Task */
        .timesheet-task-name {
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
          display: block;
        }
        .timesheet-project-name {
          font-size: 11px;
          color: #013E37;
          opacity: 0.5;
          display: block;
        }

        /* Description */
        .timesheet-desc-text {
          font-size: 13px;
          color: #013E37;
          opacity: 0.7;
        }

        /* Duration */
        .timesheet-duration-text {
          font-size: 13px;
          font-weight: 600;
          color: #013E37;
        }

        /* Billable Icons */
        .timesheet-billable-icon {
          color: #10B981;
        }
        .timesheet-non-billable-icon {
          color: #013E37;
          opacity: 0.3;
        }

        /* Status Badge */
        .timesheet-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .timesheet-status-badge:hover {
          transform: scale(1.05);
        }
        .timesheet-status-icon {
          margin-right: 2px;
        }

        /* Actions */
        .timesheet-actions {
          display: flex;
          gap: 4px;
          justify-content: center;
        }
        .timesheet-approve-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          background: #E6F7EC;
          color: #10B981;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .timesheet-approve-btn:hover:not(:disabled) {
          background: #A7F3D0;
          transform: scale(1.05);
        }
        .timesheet-view-btn-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          background: #E8F0FE;
          color: #2563EB;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .timesheet-view-btn-action:hover:not(:disabled) {
          background: #DBEAFE;
          transform: scale(1.05);
        }
        .timesheet-action-icon {
          width: 14px;
          height: 14px;
        }

        /* Empty State */
        .timesheet-empty {
          text-align: center !important;
          padding: 48px 16px !important;
        }
        .timesheet-empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .timesheet-empty-icon {
          color: #FFEFB3;
        }
        .timesheet-empty-text {
          font-size: 18px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .timesheet-empty-subtext {
          font-size: 14px;
          color: #013E37;
          opacity: 0.5;
          margin: 0;
        }
        .timesheet-empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #013E37;
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 4px;
        }
        .timesheet-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .timesheet-empty-btn-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           MODAL - Centered like Segment modal
           ============================================ */
        .timesheet-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(1, 62, 55, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 16px;
          animation: fadeIn 0.3s ease;
        }
        .timesheet-modal {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #FFEFB3;
          max-width: 520px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(1, 62, 55, 0.2);
          animation: modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .timesheet-detail-modal {
          max-width: 560px;
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
        .timesheet-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
          border-radius: 16px 16px 0 0;
        }
        .timesheet-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .timesheet-modal-title-icon {
          width: 20px;
          height: 20px;
          color: #013E37;
        }
        .timesheet-modal-close {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.5;
          display: flex;
          align-items: center;
        }
        .timesheet-modal-close:hover {
          background: rgba(1, 62, 55, 0.1);
          opacity: 1;
          transform: rotate(90deg);
        }
        .timesheet-modal-close-icon {
          width: 20px;
          height: 20px;
        }
        .timesheet-modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .timesheet-modal-icon-wrapper {
          display: flex;
          justify-content: center;
        }
        .timesheet-modal-icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #E8F0FE;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s ease-in-out infinite;
        }
        .timesheet-modal-icon {
          color: #013E37;
        }
        .timesheet-modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .timesheet-form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .timesheet-form-group:nth-child(1) { animation-delay: 0.1s; }
        .timesheet-form-group:nth-child(2) { animation-delay: 0.2s; }
        .timesheet-form-label {
          font-size: 13px;
          font-weight: 600;
          color: #013E37;
        }
        .timesheet-form-required {
          color: #EF4444;
        }
        .timesheet-form-select,
        .timesheet-form-textarea {
          padding: 9px 14px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #013E37;
          font-family: inherit;
          width: 100%;
        }
        .timesheet-form-select:focus,
        .timesheet-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
          transform: scale(1.01);
        }
        .timesheet-form-textarea {
          resize: vertical;
          min-height: 60px;
        }
        .timesheet-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.4;
        }
        .timesheet-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #FFEFB3;
          background: #F8FAFC;
          border-radius: 0 0 16px 16px;
        }
        .timesheet-modal-cancel {
          padding: 8px 20px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: transparent;
          color: #013E37;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .timesheet-modal-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
          transform: scale(1.02);
        }
        .timesheet-modal-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .timesheet-modal-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          background: #013E37;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .timesheet-modal-submit:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .timesheet-modal-submit:active:not(:disabled) {
          transform: scale(0.95);
        }
        .timesheet-modal-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .timesheet-modal-submit-icon {
          width: 16px;
          height: 16px;
        }
        .timesheet-modal-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* ============================================
           DETAIL MODAL
           ============================================ */
        .timesheet-detail-header {
          background: #013E37;
          border-bottom: 1px solid #0A5C54;
        }
        .timesheet-detail-header .timesheet-modal-title {
          color: #FFEFB3;
        }
        .timesheet-detail-header .timesheet-modal-title-icon {
          color: #FFEFB3;
        }
        .timesheet-detail-header .timesheet-modal-close {
          color: #FFEFB3;
        }
        .timesheet-detail-header .timesheet-modal-close:hover {
          background: rgba(255, 239, 179, 0.2);
        }
        .timesheet-detail-body {
          padding: 24px;
        }
        .timesheet-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .timesheet-detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px 0;
          border-bottom: 1px solid #FFEFB3;
        }
        .timesheet-detail-full {
          grid-column: 1 / -1;
        }
        .timesheet-detail-label {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .timesheet-detail-value {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .timesheet-duration-value {
          font-size: 18px;
          font-weight: 700;
          color: #013E37;
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
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.9);
          }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 992px) {
          .timesheet-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .timesheet-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .timesheet-header-right {
            width: 100%;
            flex-wrap: wrap;
          }
          .timesheet-start-btn,
          .timesheet-stop-btn {
            flex: 1;
            justify-content: center;
          }
          .timesheet-stats {
            grid-template-columns: 1fr 1fr;
          }
          .timesheet-filters-row {
            flex-direction: column;
            align-items: stretch;
          }
          .timesheet-date-range {
            flex-direction: column;
          }
          .timesheet-date-input-wrapper {
            width: 100%;
          }
          .timesheet-filter-controls {
            width: 100%;
            flex-wrap: wrap;
          }
          .timesheet-filter-select {
            flex: 1;
          }
          .timesheet-timer-running-content {
            flex-direction: column;
            align-items: stretch;
          }
          .timesheet-timer-running-left {
            justify-content: center;
          }
          .timesheet-timer-stop-btn {
            width: 100%;
            justify-content: center;
          }
          .timesheet-modal {
            margin: 16px;
          }
          .timesheet-detail-grid {
            grid-template-columns: 1fr;
          }
          .timesheet-modal-footer {
            flex-direction: column-reverse;
          }
          .timesheet-modal-cancel,
          .timesheet-modal-submit {
            width: 100%;
            justify-content: center;
          }
          .timesheet-actions {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .timesheet-stats {
            grid-template-columns: 1fr;
          }
          .timesheet-stat-card {
            padding: 12px 16px;
          }
          .timesheet-stat-number {
            font-size: 18px;
          }
          .timesheet-title {
            font-size: 24px;
          }
          .timesheet-table-header {
            font-size: 11px !important;
            padding: 10px 12px !important;
          }
          .timesheet-table-row td {
            padding: 10px 12px !important;
            font-size: 12px !important;
          }
          .timesheet-modal-body {
            padding: 16px;
          }
          .timesheet-modal-header {
            padding: 16px 20px;
          }
          .timesheet-filter-controls {
            flex-direction: column;
          }
          .timesheet-filter-select {
            width: 100%;
          }
          .timesheet-view-toggle {
            width: 100%;
          }
          .timesheet-view-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default Timesheet;