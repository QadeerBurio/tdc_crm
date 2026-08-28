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
  Eye
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
import Modal from '../../components/common/Modal';
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
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // API base URL
  const API_URL ='https://crmserver-production-4a42.up.railway.app/api';

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
      'Approved': { bg: '#D1FAE5', text: '#065F46', icon: CheckCircle },
      'approved': { bg: '#D1FAE5', text: '#065F46', icon: CheckCircle },
      'Rejected': { bg: '#FEE2E2', text: '#991B1B', icon: XCircle },
      'rejected': { bg: '#FEE2E2', text: '#991B1B', icon: XCircle },
      'Pending': { bg: '#FEF3C7', text: '#92400E', icon: Clock },
      'pending': { bg: '#FEF3C7', text: '#92400E', icon: Clock },
    };
    return styles[status] || styles.Pending;
  };

  const totalHours = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
  const billableHours = timeLogs.filter(l => l.billable).reduce((sum, log) => sum + (log.duration || 0), 0);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading timesheet...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Timesheet</h1>
          <p style={styles.pageSubtitle}>Track your working hours and manage time entries</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.iconButton} onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          {runningTimer ? (
            <button
              style={styles.stopTimerButton}
              onClick={() => handleStopTimer(runningTimer._id)}
              disabled={actionLoading}
            >
              <Square size={16} />
              <span>Stop Timer <span style={styles.timerBadge}>{getTimerRunningTime()}</span></span>
            </button>
          ) : (
            <button
              style={styles.startTimerButton}
              onClick={() => setShowTimerModal(true)}
              disabled={actionLoading}
            >
              <Play size={16} />
              Start Timer
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperBlue}>
            <Clock size={18} style={styles.statIconBlue} />
          </div>
          <div>
            <p style={styles.statNumber}>{formatDurationShort(totalHours)}</p>
            <p style={styles.statLabel}>Total Hours</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperGreen}>
            <DollarSign size={18} style={styles.statIconGreen} />
          </div>
          <div>
            <p style={styles.statNumber}>{formatDurationShort(billableHours)}</p>
            <p style={styles.statLabel}>Billable</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperYellow}>
            <BarChart3 size={18} style={styles.statIconYellow} />
          </div>
          <div>
            <p style={styles.statNumber}>{formatDurationShort(totalHours - billableHours)}</p>
            <p style={styles.statLabel}>Non-Billable</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapperPurple}>
            <Timer size={18} style={styles.statIconPurple} />
          </div>
          <div>
            <p style={styles.statNumber}>{timeLogs.length}</p>
            <p style={styles.statLabel}>Entries</p>
          </div>
        </div>
      </div>

      {/* Timer Running Indicator */}
      {runningTimer && (
        <div style={styles.timerRunningCard}>
          <div style={styles.timerRunningContent}>
            <div style={styles.timerRunningLeft}>
              <div style={styles.timerDot} />
              <span style={styles.timerRunningLabel}>Timer Running</span>
              <span style={styles.timerRunningTask}>
                {runningTimer.taskId?.title || 'Task'}
              </span>
              <span style={styles.timerRunningTime}>
                <Clock size={14} />
                {getTimerRunningTime()}
              </span>
            </div>
            <button
              style={styles.timerRunningStop}
              onClick={() => handleStopTimer(runningTimer._id)}
              disabled={actionLoading}
            >
              <Square size={14} />
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filtersSection}>
        <div style={styles.filtersRow}>
          <div style={styles.dateRangeContainer}>
            <div style={styles.dateInputWrapper}>
              <Calendar size={16} style={styles.dateIcon} />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                style={styles.dateInput}
              />
            </div>
            <span style={styles.dateRangeSeparator}>to</span>
            <div style={styles.dateInputWrapper}>
              <Calendar size={16} style={styles.dateIcon} />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                style={styles.dateInput}
              />
            </div>
          </div>
          <div style={styles.filterControls}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div style={styles.viewToggle}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  ...styles.viewButton,
                  ...(viewMode === 'table' ? styles.viewButtonActive : styles.viewButtonInactive)
                }}
                title="Table View"
              >
                <Briefcase size={14} />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                style={{
                  ...styles.viewButton,
                  ...(viewMode === 'compact' ? styles.viewButtonActive : styles.viewButtonInactive)
                }}
                title="Compact View"
              >
                <BarChart3 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Time Logs Table */}
      <div style={styles.tableWrapper}>
        <div style={styles.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Date</TableHeadCell>
                <TableHeadCell>Task</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Duration</TableHeadCell>
                <TableHeadCell style={{ textAlign: 'center' }}>Billable</TableHeadCell>
                <TableHeadCell style={{ textAlign: 'center' }}>Status</TableHeadCell>
                <TableHeadCell style={{ textAlign: 'center' }}>Actions</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timeLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="7" style={styles.emptyState}>
                    <div style={styles.emptyContent}>
                      <Clock size={48} style={styles.emptyIcon} />
                      <p style={styles.emptyText}>No time entries found</p>
                      <p style={styles.emptySubtext}>Start tracking your time or add a manual entry</p>
                      <button style={styles.emptyButton} onClick={() => setShowTimerModal(true)}>
                        <Play size={16} />
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
                    <TableRow key={log._id} style={styles.tableRow}>
                      <TableCell>
                        <div style={styles.dateCell}>
                          <span style={styles.dateMain}>{formatDate(log.startTime)}</span>
                          <span style={styles.dateTime}>{formatTime(log.startTime)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span style={styles.taskName}>
                          {log.taskId?.title || 'N/A'}
                        </span>
                        {log.taskId?.projectId?.projectName && (
                          <span style={styles.projectName}>
                            {log.taskId.projectId.projectName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span style={styles.descriptionText}>
                          {log.description || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={styles.durationText}>
                          {formatDuration(log.duration)}
                        </span>
                      </TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        {log.billable ? (
                          <CheckCircle size={16} style={styles.billableIcon} />
                        ) : (
                          <XCircle size={16} style={styles.nonBillableIcon} />
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                        }}>
                          <StatusIcon size={10} style={styles.statusIcon} />
                          {log.approvalStatus || 'Pending'}
                        </span>
                      </TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        <div style={styles.actionButtons}>
                          {(user?.role === 'admin' || user?.role === 'manager') && 
                           (log.approvalStatus === 'Pending' || !log.approvalStatus) && (
                            <button
                              style={styles.approveButton}
                              onClick={() => handleApprove(log._id)}
                              disabled={actionLoading}
                              title="Approve"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            style={styles.viewButtonAction}
                            onClick={() => {
                              setSelectedLog(log);
                              setShowEditModal(true);
                            }}
                            title="View Details"
                          >
                            <Eye size={14} />
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

      {/* Start Timer Modal */}
      <Modal
        isOpen={showTimerModal}
        onClose={() => {
          setShowTimerModal(false);
          setSelectedTask('');
          setDescription('');
        }}
        title="Start Timer"
        size="md"
      >
        <div style={styles.modalContent}>
          <div style={styles.modalIconWrapper}>
            <Play size={24} style={styles.modalIcon} />
          </div>
          <div style={styles.modalForm}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Select Task *</label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                style={styles.formSelect}
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
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={styles.formTextarea}
                placeholder="What are you working on?"
                disabled={actionLoading}
              />
            </div>
            <div style={styles.modalActions}>
              <button
                style={styles.modalCancelButton}
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
                style={styles.modalStartButton}
                onClick={handleStartTimer}
                disabled={actionLoading || !selectedTask}
              >
                {actionLoading ? (
                  <>
                    <span style={styles.spinnerSmall} />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    Start Timer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLog(null);
        }}
        title="Time Entry Details"
        size="sm"
      >
        {selectedLog && (
          <div style={styles.detailContent}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Date</span>
              <span style={styles.detailValue}>{formatDate(selectedLog.startTime)}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Time</span>
              <span style={styles.detailValue}>{formatTime(selectedLog.startTime)}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Task</span>
              <span style={styles.detailValue}>{selectedLog.taskId?.title || 'N/A'}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Project</span>
              <span style={styles.detailValue}>{selectedLog.taskId?.projectId?.projectName || 'N/A'}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Duration</span>
              <span style={styles.detailValue}>{formatDuration(selectedLog.duration)}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Description</span>
              <span style={styles.detailValue}>{selectedLog.description || '—'}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Billable</span>
              <span style={styles.detailValue}>
                {selectedLog.billable ? (
                  <CheckCircle size={16} style={styles.billableIcon} />
                ) : (
                  <XCircle size={16} style={styles.nonBillableIcon} />
                )}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Status</span>
              <span style={styles.detailValue}>
                <span style={{
                  ...styles.statusBadge,
                  ...getStatusBadge(selectedLog.approvalStatus)
                }}>
                  {selectedLog.approvalStatus || 'Pending'}
                </span>
              </span>
            </div>
            <div style={styles.detailActions}>
              <button
                style={styles.detailCloseButton}
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedLog(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64vh',
    gap: '16px',
  },
  loadingText: {
    color: '#64748B',
    fontSize: '14px',
    fontWeight: '500',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
  },
  spinnerSmall: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '2px solid #FFFFFF',
    borderTopColor: 'transparent',
    animation: 'spin 0.6s linear infinite',
    marginRight: '8px',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#64748B',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    color: '#64748B',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  startTimerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
  },
  stopTimerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
  },
  timerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px 20px',
    border: '1px solid #E2E8F0',
    transition: 'all 0.2s ease',
  },
  statIconWrapperBlue: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statIconWrapperGreen: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#ECFDF5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statIconWrapperYellow: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#FFFBEB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statIconWrapperPurple: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#F5F3FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statIconBlue: {
    color: '#3B82F6',
  },
  statIconGreen: {
    color: '#10B981',
  },
  statIconYellow: {
    color: '#F59E0B',
  },
  statIconPurple: {
    color: '#8B5CF6',
  },
  statNumber: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
    fontWeight: '500',
  },
  timerRunningCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: '10px',
    border: '1px solid #BFDBFE',
    padding: '12px 20px',
    marginBottom: '16px',
  },
  timerRunningContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  timerRunningLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  timerDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#EF4444',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  timerRunningLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1E40AF',
  },
  timerRunningTask: {
    fontSize: '13px',
    color: '#3B82F6',
    padding: '2px 10px',
    backgroundColor: '#DBEAFE',
    borderRadius: '4px',
  },
  timerRunningTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1E40AF',
  },
  timerRunningStop: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 16px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filtersSection: {
    marginBottom: '16px',
  },
  filtersRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  dateRangeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: '200px',
  },
  dateInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '0 12px',
    flex: 1,
  },
  dateIcon: {
    color: '#94A3B8',
  },
  dateInput: {
    flex: 1,
    padding: '8px 10px',
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    backgroundColor: 'transparent',
    color: '#0F172A',
  },
  dateRangeSeparator: {
    color: '#94A3B8',
    fontSize: '13px',
    fontWeight: '500',
  },
  filterControls: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  filterSelect: {
    padding: '8px 14px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '13px',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    outline: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    minWidth: '140px',
  },
  viewToggle: {
    display: 'flex',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 10px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  viewButtonActive: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
  },
  viewButtonInactive: {
    backgroundColor: '#FFFFFF',
    color: '#94A3B8',
  },
  tableWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  tableRow: {
    transition: 'background-color 0.2s ease',
  },
  dateCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  dateMain: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#0F172A',
  },
  dateTime: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  taskName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#0F172A',
    display: 'block',
  },
  projectName: {
    fontSize: '11px',
    color: '#94A3B8',
    display: 'block',
  },
  descriptionText: {
    fontSize: '13px',
    color: '#475569',
  },
  durationText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0F172A',
  },
  billableIcon: {
    color: '#22C55E',
  },
  nonBillableIcon: {
    color: '#94A3B8',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
  },
  statusIcon: {
    marginRight: '2px',
  },
  actionButtons: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
  },
  approveButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#D1FAE5',
    color: '#10B981',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  viewButtonAction: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#EFF6FF',
    color: '#3B82F6',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 16px',
  },
  emptyContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  emptyIcon: {
    color: '#94A3B8',
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0F172A',
    margin: 0,
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#94A3B8',
    margin: 0,
  },
  emptyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '4px',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '8px 0',
  },
  modalIconWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIcon: {
    color: '#3B82F6',
  },
  modalForm: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  formLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0F172A',
  },
  formSelect: {
    padding: '9px 14px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
  },
  formTextarea: {
    padding: '9px 14px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingTop: '16px',
    borderTop: '1px solid #E2E8F0',
  },
  modalCancelButton: {
    padding: '9px 20px',
    backgroundColor: 'transparent',
    color: '#475569',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modalStartButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 24px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '4px 0',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #F1F5F9',
  },
  detailLabel: {
    fontSize: '13px',
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#0F172A',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  detailActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '12px',
    borderTop: '1px solid #E2E8F0',
  },
  detailCloseButton: {
    padding: '8px 20px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

// Add keyframe and hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  .start-timer-button:hover:not(:disabled) {
    background-color: #2563EB !important;
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.35) !important;
    transform: translateY(-1px);
  }

  .stop-timer-button:hover:not(:disabled) {
    background-color: #DC2626 !important;
    box-shadow: 0 4px 8px rgba(239, 68, 68, 0.35) !important;
    transform: translateY(-1px);
  }

  .icon-button:hover:not(:disabled) {
    background-color: #F1F5F9 !important;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
  }

  .filter-select:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }

  .date-input:focus {
    border-color: #3B82F6 !important;
  }

  .date-input-wrapper:focus-within {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }

  .view-button-inactive:hover:not(:disabled) {
    background-color: #F1F5F9 !important;
  }

  .table-row:hover {
    background-color: #F8FAFC !important;
  }

  .approve-button:hover:not(:disabled) {
    background-color: #A7F3D0 !important;
  }

  .view-button-action:hover:not(:disabled) {
    background-color: #DBEAFE !important;
  }

  .empty-button:hover {
    background-color: #2563EB !important;
  }

  .modal-cancel-button:hover:not(:disabled) {
    background-color: #F1F5F9 !important;
  }

  .modal-start-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }

  .detail-close-button:hover:not(:disabled) {
    background-color: #E2E8F0 !important;
  }

  .timer-running-stop:hover:not(:disabled) {
    background-color: #DC2626 !important;
  }

  @media (max-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 16px !important;
    }

    .page-header {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .header-actions {
      flex-direction: column !important;
    }

    .start-timer-button,
    .stop-timer-button {
      width: 100% !important;
      justify-content: center !important;
    }

    .icon-button {
      align-self: flex-start !important;
    }

    .stats-grid {
      grid-template-columns: 1fr 1fr !important;
    }

    .filters-row {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .date-range-container {
      flex-direction: column !important;
    }

    .date-input-wrapper {
      width: 100% !important;
    }

    .filter-controls {
      width: 100% !important;
    }

    .filter-select {
      flex: 1 !important;
    }

    .timer-running-content {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .timer-running-left {
      justify-content: center !important;
    }

    .timer-running-stop {
      width: 100% !important;
      justify-content: center !important;
    }

    .modal-actions {
      flex-direction: column !important;
    }

    .modal-cancel-button,
    .modal-start-button {
      width: 100% !important;
      justify-content: center !important;
    }

    .action-buttons {
      flex-wrap: wrap !important;
      justify-content: center !important;
    }

    .detail-row {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 4px !important;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 12px !important;
    }

    .stats-grid {
      grid-template-columns: 1fr !important;
    }

    .stat-card {
      padding: 12px 16px !important;
    }

    .stat-number {
      font-size: 18px !important;
    }

    .page-title {
      font-size: 22px !important;
    }

    .filter-controls {
      flex-direction: column !important;
    }

    .filter-select {
      width: 100% !important;
    }

    .view-toggle {
      width: 100% !important;
    }

    .view-button {
      flex: 1 !important;
      justify-content: center !important;
    }

    .empty-content {
      padding: 20px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Timesheet;