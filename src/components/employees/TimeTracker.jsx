// components/timer/TimeTracker.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  Play, 
  Pause, 
  Square, 
  Clock,
  Timer,
  CheckCircle,
  AlertCircle,
  FileText,
  Plus,
  History
} from 'lucide-react';

const TimeTracker = () => {
  const { token } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedTask, setSelectedTask] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [timerId, setTimerId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualLog, setManualLog] = useState({
    taskId: '',
    startTime: '',
    endTime: '',
    description: '',
    billable: true
  });
  const [runningTimer, setRunningTimer] = useState(null);

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchTasks();
    fetchRunningTimer();
    const interval = setInterval(() => {
      if (isRunning) {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showHistory) {
      fetchTimeLogs();
    }
  }, [showHistory]);

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const response = await axios.get(`${API_URL}/projects/tasks`, {
        params: { limit: 100, status: ['In Progress', 'Backlog'] },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setTasks(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchRunningTimer = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees/timer/running`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.data) {
        const timer = response.data.data;
        setRunningTimer(timer);
        const startTime = new Date(timer.startTime);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
        setIsRunning(true);
        setTimerId(timer._id);
        setSelectedTask(timer.taskId?._id || timer.taskId);
      }
    } catch (err) {
      console.error('Error fetching running timer:', err);
    }
  };

  const fetchTimeLogs = async () => {
    try {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      const response = await axios.get(`${API_URL}/employees/timer/logs`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
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
      toast.error('Failed to load time logs');
    }
  };

  const handleStartTimer = async () => {
    if (!selectedTask) {
      toast.error('Please select a task');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/employees/timer/start`, 
        { taskId: selectedTask },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        setIsRunning(true);
        setTimerId(response.data.data?._id);
        toast.success('Timer started successfully');
        await fetchRunningTimer();
      }
    } catch (err) {
      console.error('Error starting timer:', err);
      let errorMessage = 'Failed to start timer.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to start timer.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStopTimer = async () => {
    if (!timerId) return;

    setLoading(true);
    try {
      await axios.post(`${API_URL}/employees/timer/${timerId}/stop`, {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setIsRunning(false);
      setElapsedTime(0);
      setTimerId(null);
      toast.success('Timer stopped successfully');
      await fetchRunningTimer();
      await fetchTimeLogs();
    } catch (err) {
      console.error('Error stopping timer:', err);
      let errorMessage = 'Failed to stop timer.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to stop timer.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLog = async (e) => {
    e.preventDefault();
    
    if (!manualLog.taskId) {
      toast.error('Please select a task');
      return;
    }
    if (!manualLog.startTime || !manualLog.endTime) {
      toast.error('Please select start and end times');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/employees/timer/manual`, manualLog, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        toast.success('Time log created successfully');
        setShowModal(false);
        setManualLog({
          taskId: '',
          startTime: '',
          endTime: '',
          description: '',
          billable: true
        });
        await fetchTimeLogs();
      }
    } catch (err) {
      console.error('Error creating manual log:', err);
      let errorMessage = 'Failed to create time log.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to create time logs.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this time log?')) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/employees/timer/logs/${logId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Time log deleted');
      await fetchTimeLogs();
    } catch (err) {
      console.error('Error deleting time log:', err);
      toast.error('Failed to delete time log');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTaskOptions = () => {
    if (!tasks) return [];
    return tasks.map(task => ({
      value: task._id,
      label: `${task.title} - ${task.projectId?.projectName || 'No Project'}`
    }));
  };

  return (
    <div style={styles.container}>
      {/* Timer Card */}
      <div style={styles.timerCard}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderLeft}>
            <Timer style={styles.cardHeaderIcon} />
            <span style={styles.cardTitle}>Time Tracker</span>
          </div>
          <button style={styles.historyButton} onClick={() => setShowHistory(!showHistory)}>
            <History style={styles.buttonIcon} />
            {showHistory ? 'Hide History' : 'View History'}
          </button>
        </div>
        <div style={styles.cardContent}>
          <div style={styles.timerDisplay}>
            <div style={styles.timerValue}>{formatTime(elapsedTime)}</div>

            <div style={styles.taskSelectWrapper}>
              <Select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                options={[
                  { value: '', label: 'Select a task...' },
                  ...getTaskOptions()
                ]}
                disabled={isRunning || tasksLoading}
                style={styles.taskSelect}
                placeholder="Select task to track..."
              />
            </div>

            <div style={styles.timerControls}>
              {!isRunning ? (
                <button 
                  style={styles.startButton}
                  onClick={handleStartTimer}
                  disabled={!selectedTask || loading}
                >
                  <Play style={styles.buttonIcon} />
                  {loading ? 'Starting...' : 'Start Timer'}
                </button>
              ) : (
                <button 
                  style={styles.stopButton}
                  onClick={handleStopTimer}
                  disabled={loading}
                >
                  <Square style={styles.buttonIcon} />
                  {loading ? 'Stopping...' : 'Stop Timer'}
                </button>
              )}
              <button 
                style={styles.manualButton}
                onClick={() => setShowModal(true)}
              >
                <Clock style={styles.buttonIcon} />
                Manual Entry
              </button>
            </div>

            {isRunning && (
              <div style={styles.runningIndicator}>
                <div style={styles.runningDot} />
                <span>Timer running</span>
              </div>
            )}

            {!isRunning && elapsedTime === 0 && !timerId && (
              <div style={styles.helperText}>
                Select a task and start the timer to track your work
              </div>
            )}

            {isRunning && selectedTask && tasks.length > 0 && (
              <div style={styles.trackingInfo}>
                Tracking: {tasks.find(t => t._id === selectedTask)?.title || 'Task'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Log History */}
      {showHistory && (
        <div style={styles.historyCard}>
          <div style={styles.cardHeader}>
            <Clock style={styles.cardHeaderIcon} />
            <span style={styles.cardTitle}>Today's Time Logs</span>
          </div>
          <div style={styles.cardContent}>
            {timeLogs.length === 0 ? (
              <div style={styles.emptyState}>No time logs for today</div>
            ) : (
              <div style={styles.logsList}>
                {timeLogs.map((log) => (
                  <div key={log._id} style={styles.logItem}>
                    <div style={styles.logInfo}>
                      <div style={styles.logHeader}>
                        <span style={styles.logTaskTitle}>
                          {log.taskId?.title || 'Unknown Task'}
                        </span>
                        <span style={styles.logProject}>
                          {log.projectId?.projectName || 'No Project'}
                        </span>
                        {log.billable && (
                          <span style={styles.billableBadge}>Billable</span>
                        )}
                      </div>
                      <div style={styles.logTimes}>
                        <span>{formatDate(log.startTime)}</span>
                        <span>→</span>
                        <span>{log.endTime ? formatDate(log.endTime) : 'Running'}</span>
                        <span style={styles.logDuration}>
                          {formatDuration(log.duration)}
                        </span>
                      </div>
                      {log.description && (
                        <div style={styles.logDescription}>{log.description}</div>
                      )}
                    </div>
                    <div style={styles.logActions}>
                      {log.approvalStatus === 'Pending' && (
                        <span style={styles.pendingBadge}>Pending Approval</span>
                      )}
                      {log.approvalStatus === 'Approved' && (
                        <span style={styles.approvedBadge}>Approved</span>
                      )}
                      {log.approvalStatus === 'Rejected' && (
                        <span style={styles.rejectedBadge}>Rejected</span>
                      )}
                      {!log.isRunning && log.approvalStatus === 'Pending' && (
                        <button
                          style={styles.deleteLogButton}
                          onClick={() => handleDeleteLog(log._id)}
                        >
                          <AlertCircle style={styles.buttonIcon} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Time Log Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Manual Time Entry"
        size="lg"
      >
        <form onSubmit={handleManualLog} style={styles.modalForm}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Task</label>
            <Select
              value={manualLog.taskId}
              onChange={(e) => setManualLog({ ...manualLog, taskId: e.target.value })}
              options={[
                { value: '', label: 'Select a task...' },
                ...getTaskOptions()
              ]}
              required
            />
          </div>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                Start Time <span style={styles.requiredStar}>*</span>
              </label>
              <Input
                type="datetime-local"
                value={manualLog.startTime}
                onChange={(e) => setManualLog({ ...manualLog, startTime: e.target.value })}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                End Time <span style={styles.requiredStar}>*</span>
              </label>
              <Input
                type="datetime-local"
                value={manualLog.endTime}
                onChange={(e) => setManualLog({ ...manualLog, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Description</label>
            <textarea
              value={manualLog.description}
              onChange={(e) => setManualLog({ ...manualLog, description: e.target.value })}
              style={styles.textarea}
              rows="3"
              placeholder="What did you work on?"
            />
          </div>

          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              checked={manualLog.billable}
              onChange={(e) => setManualLog({ ...manualLog, billable: e.target.checked })}
              style={styles.checkbox}
            />
            <label style={styles.checkboxLabel}>Billable</label>
          </div>

          <div style={styles.modalActions}>
            <button
              type="button"
              style={styles.modalCancelButton}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.modalSubmitButton}
              disabled={loading}
            >
              <FileText style={styles.buttonIcon} />
              {loading ? 'Creating...' : 'Create Time Log'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  timerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #E5E7EB',
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardHeaderIcon: {
    width: '20px',
    height: '20px',
    color: '#3B82F6',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  },
  historyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cardContent: {
    padding: '24px',
  },
  timerDisplay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  timerValue: {
    fontSize: '48px',
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#111827',
  },
  taskSelectWrapper: {
    width: '100%',
    maxWidth: '400px',
  },
  taskSelect: {
    width: '100%',
  },
  timerControls: {
    display: 'flex',
    gap: '12px',
  },
  startButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 32px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  stopButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 32px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  manualButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonIcon: {
    width: '16px',
    height: '16px',
  },
  runningIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#16A34A',
    animation: 'pulse 2s infinite',
  },
  runningDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#16A34A',
    borderRadius: '50%',
  },
  helperText: {
    fontSize: '14px',
    color: '#6B7280',
  },
  trackingInfo: {
    fontSize: '14px',
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
    padding: '8px 16px',
    borderRadius: '8px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 0',
    color: '#6B7280',
  },
  logsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  logItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease',
    flexWrap: 'wrap',
    gap: '8px',
  },
  logInfo: {
    flex: 1,
  },
  logHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  logTaskTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
  },
  logProject: {
    fontSize: '13px',
    color: '#6B7280',
  },
  billableBadge: {
    fontSize: '11px',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    padding: '2px 8px',
    borderRadius: '9999px',
  },
  logTimes: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#6B7280',
    marginTop: '4px',
    flexWrap: 'wrap',
  },
  logDuration: {
    fontWeight: '500',
    color: '#111827',
  },
  logDescription: {
    fontSize: '13px',
    color: '#6B7280',
    marginTop: '4px',
  },
  logActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  pendingBadge: {
    fontSize: '11px',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    padding: '2px 8px',
    borderRadius: '9999px',
  },
  approvedBadge: {
    fontSize: '11px',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    padding: '2px 8px',
    borderRadius: '9999px',
  },
  rejectedBadge: {
    fontSize: '11px',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    padding: '2px 8px',
    borderRadius: '9999px',
  },
  deleteLogButton: {
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#EF4444',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  requiredStar: {
    color: '#EF4444',
    marginLeft: '4px',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
  },
  modalCancelButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modalSubmitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};

// Add keyframe and hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  .start-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .stop-button:hover:not(:disabled) {
    background-color: #DC2626 !important;
  }
  
  .manual-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .history-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .log-item:hover {
    background-color: #F3F4F6 !important;
  }
  
  .delete-log-button:hover {
    background-color: #FEE2E2 !important;
  }
  
  .modal-cancel-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .modal-submit-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .textarea:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  .start-button:disabled,
  .stop-button:disabled,
  .modal-submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .timer-controls {
      flex-direction: column !important;
      width: 100% !important;
    }
    
    .start-button,
    .stop-button,
    .manual-button {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .form-grid {
      grid-template-columns: 1fr !important;
    }
    
    .log-item {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .log-actions {
      justify-content: flex-start !important;
    }
    
    .modal-actions {
      flex-direction: column !important;
    }
    
    .modal-cancel-button,
    .modal-submit-button {
      width: 100% !important;
      justify-content: center !important;
    }
  }
  
  @media (max-width: 480px) {
    .card-header {
      flex-direction: column !important;
      gap: 8px !important;
    }
    
    .timer-value {
      font-size: 36px !important;
    }
    
    .task-select-wrapper {
      max-width: 100% !important;
    }
    
    .log-header {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    
    .log-times {
      flex-wrap: wrap !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default TimeTracker;