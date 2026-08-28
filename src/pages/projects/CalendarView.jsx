// pages/projects/CalendarView.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
  Clock, Users, Tag, X, RefreshCw, Filter, Search, ChevronDown,
  CheckCircle, AlertCircle, FileText, MapPin, Briefcase, Star
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CalendarView = () => {
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('month');

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchTasks();
  }, [currentDate, filterType, searchTerm]);

  const fetchTasks = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch all tasks directly from task routes
      const tasksRes = await axios.get(`${API_URL}/tasks`, {
        params: {
          ...(filterType && { type: filterType }),
          ...(searchTerm && { search: searchTerm })
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      const tasksData = tasksRes.data?.data || [];
      
      // Also fetch projects to get project names
      const projectsRes = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const projectsData = projectsRes.data?.data || [];
      setProjects(projectsData);

      // Map project names to tasks
      const tasksWithProjectNames = tasksData.map(task => {
        const project = projectsData.find(p => p._id === task.projectId);
        return {
          ...task,
          _projectName: project?.projectName || 'Unknown Project',
          _projectId: task.projectId
        };
      });

      setTasks(tasksWithProjectNames);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      let errorMessage = 'Failed to load calendar data.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view calendar.';
        } else if (err.response.status === 404) {
          errorMessage = 'Task routes not found. Please check backend configuration.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
      // Set empty arrays to show empty state
      setTasks([]);
      setProjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchTasks(true);
  };

  const showAddTaskInfo = () => {
    toast('Please use the Projects page to create tasks', {
      icon: 'ℹ️',
      duration: 4000,
    });
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Task deleted successfully');
      setSelectedEvent(null);
      await fetchTasks(true);
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.deadline && !task.dueDate) return false;
      const taskDate = new Date(task.deadline || task.dueDate);
      const taskDateStr = taskDate.toISOString().split('T')[0];
      return taskDateStr === dateStr;
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'All day';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventColor = (type) => {
    const colors = {
      'task': '#3B82F6',
      'deadline': '#EF4444',
      'meeting': '#8B5CF6',
      'review': '#F59E0B',
      'default': '#6B7280'
    };
    return colors[type] || colors.default;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': '#EF4444',
      'high': '#F59E0B',
      'medium': '#3B82F6',
      'low': '#22C55E'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Backlog': { bg: '#F3F4F6', color: '#6B7280' },
      'Todo': { bg: '#F3F4F6', color: '#6B7280' },
      'In Progress': { bg: '#DBEAFE', color: '#1D4ED8' },
      'Review': { bg: '#EDE9FE', color: '#6D28D9' },
      'Approved': { bg: '#FEF3C7', color: '#D97706' },
      'Completed': { bg: '#D1FAE5', color: '#065F46' }
    };
    return styles[status] || styles.Backlog;
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const days = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="cal-empty-day" />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      const dayEvents = getEventsForDate(date);
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      days.push(
        <div 
          key={day} 
          className={`cal-day ${isToday ? 'cal-day-today' : ''} ${isSelected ? 'cal-day-selected' : ''} ${isWeekend ? 'cal-day-weekend' : ''}`}
          onClick={() => {
            setSelectedDate(date);
            setSelectedEvent(null);
          }}
        >
          <div className="cal-day-header-cal">
            <span className={`cal-day-number ${isToday ? 'cal-day-number-today' : ''}`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span className="cal-event-count">{dayEvents.length}</span>
            )}
          </div>
          <div className="cal-events-container">
            {dayEvents.slice(0, 3).map((event) => (
              <div 
                key={event._id}
                className="cal-event-chip"
                style={{ backgroundColor: getEventColor(event.type || 'task') }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                  setSelectedDate(date);
                }}
                title={event.title}
              >
                <span className="cal-event-chip-text">{event.title}</span>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="cal-more-events">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const stats = {
    total: tasks.length,
    backlog: tasks.filter(t => t.status === 'Backlog' || t.status === 'backlog').length,
    inProgress: tasks.filter(t => t.status === 'In Progress' || t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'Completed' || t.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="cal-loading">
        <div className="cal-spinner"></div>
        <p className="cal-loading-text">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="cal-container">
      {/* Header */}
      <div className="cal-header">
        <div>
          <h1 className="cal-title">Calendar</h1>
          <p className="cal-subtitle">View your project tasks and deadlines</p>
        </div>
        <div className="cal-header-actions">
          <button className="cal-icon-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'cal-spin' : ''} />
          </button>
          <button className="cal-filter-btn" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filters
            <ChevronDown size={12} className={`cal-chevron ${showFilters ? 'cal-chevron-open' : ''}`} />
          </button>
          <button className="cal-primary-btn" onClick={showAddTaskInfo}>
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="cal-stats">
        <div className="cal-stat">
          <div className="cal-stat-icon cal-stat-icon-blue"><CalendarIcon size={14} /></div>
          <div><p className="cal-stat-number">{stats.total}</p><p className="cal-stat-label">Total</p></div>
        </div>
        <div className="cal-stat">
          <div className="cal-stat-icon cal-stat-icon-yellow"><AlertCircle size={14} /></div>
          <div><p className="cal-stat-number">{stats.backlog}</p><p className="cal-stat-label">Backlog</p></div>
        </div>
        <div className="cal-stat">
          <div className="cal-stat-icon cal-stat-icon-blue"><Clock size={14} /></div>
          <div><p className="cal-stat-number">{stats.inProgress}</p><p className="cal-stat-label">In Progress</p></div>
        </div>
        <div className="cal-stat">
          <div className="cal-stat-icon cal-stat-icon-green"><CheckCircle size={14} /></div>
          <div><p className="cal-stat-number">{stats.completed}</p><p className="cal-stat-label">Completed</p></div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="cal-filter-panel">
          <div className="cal-filter-row">
            <div className="cal-filter-group">
              <label className="cal-filter-label">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="cal-filter-select"
              >
                <option value="">All Types</option>
                <option value="task">Task</option>
                <option value="deadline">Deadline</option>
                <option value="meeting">Meeting</option>
                <option value="review">Review</option>
              </select>
            </div>
            <div className="cal-filter-group">
              <label className="cal-filter-label">Search</label>
              <div className="cal-search">
                <Search size={14} className="cal-search-icon" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="cal-search-input"
                />
                {searchTerm && (
                  <button className="cal-search-clear" onClick={() => setSearchTerm('')}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
            <button className="cal-clear-filters" onClick={() => {
              setFilterType('');
              setSearchTerm('');
            }}>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Calendar Controls */}
      <div className="cal-controls">
        <div className="cal-controls-left">
          <button className="cal-nav-btn" onClick={() => navigateMonth(-1)}>
            <ChevronLeft size={16} />
          </button>
          <span className="cal-month-label">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button className="cal-nav-btn" onClick={() => navigateMonth(1)}>
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="cal-controls-right">
          <button className="cal-today-btn" onClick={navigateToday}>
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="cal-wrapper">
        <div className="cal-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={`cal-day-header ${day === 'Sun' || day === 'Sat' ? 'cal-day-header-weekend' : ''}`}>
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>
      </div>

      {/* Event Details Panel */}
      {selectedDate && (
        <div className="cal-details">
          <div className="cal-details-header">
            <h3 className="cal-details-title">{formatDate(selectedDate)}</h3>
            <button className="cal-details-add" onClick={showAddTaskInfo}>
              <Plus size={14} />
              Add Task
            </button>
          </div>
          
          {selectedEvent ? (
            <div className="cal-event-detail">
              <div className="cal-event-detail-header">
                <div className="cal-event-color-bar" style={{ backgroundColor: getEventColor(selectedEvent.type || 'task') }} />
                <div className="cal-event-detail-info">
                  <h4 className="cal-event-detail-title">{selectedEvent.title}</h4>
                  <span className="cal-event-detail-type">
                    {selectedEvent.type || 'Task'} • {selectedEvent._projectName || 'Project'}
                  </span>
                </div>
                <button className="cal-event-delete" onClick={() => handleDeleteTask(selectedEvent._id)}>
                  <X size={14} />
                </button>
              </div>
              
              {selectedEvent.description && (
                <p className="cal-event-description">{selectedEvent.description}</p>
              )}
              
              <div className="cal-event-meta">
                <div className="cal-event-meta-item">
                  <Clock size={12} />
                  <span>{formatTime(selectedEvent.deadline || selectedEvent.dueDate)}</span>
                </div>
                {selectedEvent.status && (
                  <div className="cal-event-meta-item">
                    <span className="cal-status-badge" style={{
                      backgroundColor: getStatusBadge(selectedEvent.status).bg,
                      color: getStatusBadge(selectedEvent.status).color
                    }}>
                      {selectedEvent.status}
                    </span>
                  </div>
                )}
                {selectedEvent.priority && (
                  <div className="cal-event-meta-item">
                    <span className="cal-priority-badge" style={{
                      backgroundColor: getPriorityColor(selectedEvent.priority),
                    }}>
                      {selectedEvent.priority}
                    </span>
                  </div>
                )}
                {selectedEvent._projectName && (
                  <div className="cal-event-meta-item">
                    <Briefcase size={12} />
                    <span>{selectedEvent._projectName}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="cal-no-events">
              <div className="cal-no-events-icon-wrapper">
                <CalendarIcon size={24} />
              </div>
              <p className="cal-no-events-text">No tasks scheduled</p>
              <p className="cal-no-events-subtext">Click "Add Task" to create one</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .cal-container {
          padding: 20px 24px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
        }

        .cal-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 64vh;
          gap: 16px;
        }

        .cal-loading-text { color: #64748b; font-size: 14px; font-weight: 500; }
        .cal-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid #e5e7eb; border-top-color: #3b82f6;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .cal-spin { animation: spin 1s linear infinite; }

        .cal-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
        }

        .cal-title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }
        .cal-subtitle { font-size: 14px; color: #64748b; margin-top: 2px; }

        .cal-header-actions {
          display: flex; gap: 8px; flex-wrap: wrap;
        }

        .cal-icon-btn {
          display: flex; align-items: center; justify-content: center;
          padding: 8px; background: #fff; border: 1px solid #e2e8f0;
          border-radius: 8px; color: #64748b; cursor: pointer; transition: all 0.2s;
        }

        .cal-icon-btn:hover { background: #f1f5f9; }

        .cal-filter-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 8px 14px; background: #fff; border: 1px solid #e2e8f0;
          border-radius: 8px; font-size: 13px; font-weight: 500;
          color: #475569; cursor: pointer; transition: all 0.2s;
        }

        .cal-filter-btn:hover { background: #f1f5f9; }

        .cal-chevron { transition: transform 0.2s; }
        .cal-chevron-open { transform: rotate(180deg); }

        .cal-primary-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px; background: #3b82f6; color: #fff;
          border: none; border-radius: 8px; font-size: 13px;
          font-weight: 600; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.25);
        }

        .cal-primary-btn:hover { background: #2563eb; }

        .cal-stats {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px; margin-bottom: 20px;
        }

        .cal-stat {
          display: flex; align-items: center; gap: 10px;
          background: #fff; border-radius: 10px; padding: 12px 16px;
          border: 1px solid #e2e8f0; transition: all 0.2s;
        }

        .cal-stat:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

        .cal-stat-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .cal-stat-icon-blue { background: #eff6ff; }
        .cal-stat-icon-yellow { background: #fef3c7; }
        .cal-stat-icon-green { background: #ecfdf5; }

        .cal-stat-number { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.2; }
        .cal-stat-label { font-size: 11px; color: #64748b; margin: 0; font-weight: 500; }

        .cal-filter-panel {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 14px 18px; margin-bottom: 16px;
        }

        .cal-filter-row {
          display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap;
        }

        .cal-filter-group {
          display: flex; flex-direction: column; gap: 4px;
          flex: 1; min-width: 120px;
        }

        .cal-filter-label {
          font-size: 11px; font-weight: 600; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.3px;
        }

        .cal-filter-select {
          padding: 6px 10px; border: 1px solid #e2e8f0;
          border-radius: 6px; font-size: 13px; background: #fff;
          color: #0f172a; outline: none; cursor: pointer;
        }

        .cal-filter-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }

        .cal-search {
          display: flex; align-items: center; background: #fff;
          border: 1px solid #e2e8f0; border-radius: 6px; padding: 0 10px;
        }

        .cal-search:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }

        .cal-search-icon { color: #94a3b8; flex-shrink: 0; }
        .cal-search-input {
          flex: 1; padding: 6px 8px; border: none; outline: none;
          font-size: 13px; background: transparent; color: #0f172a;
        }

        .cal-search-clear {
          display: flex; align-items: center; justify-content: center;
          padding: 2px; background: none; border: none; color: #94a3b8;
          cursor: pointer; border-radius: 4px;
        }

        .cal-search-clear:hover { background: #f1f5f9; }

        .cal-clear-filters {
          padding: 6px 14px; background: #f1f5f9; border: none;
          border-radius: 6px; font-size: 12px; font-weight: 500;
          color: #475569; cursor: pointer; transition: all 0.2s;
          white-space: nowrap; align-self: center;
        }

        .cal-clear-filters:hover { background: #e2e8f0; }

        .cal-controls {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px; flex-wrap: wrap; gap: 10px;
        }

        .cal-controls-left { display: flex; align-items: center; gap: 10px; }
        .cal-controls-right { display: flex; align-items: center; gap: 10px; }

        .cal-nav-btn {
          display: flex; align-items: center; justify-content: center;
          padding: 6px; background: #fff; border: 1px solid #e2e8f0;
          border-radius: 6px; color: #475569; cursor: pointer;
          transition: all 0.2s;
        }

        .cal-nav-btn:hover { background: #f1f5f9; }

        .cal-month-label {
          font-size: 16px; font-weight: 600; color: #0f172a;
          min-width: 140px; text-align: center;
        }

        .cal-today-btn {
          padding: 6px 14px; background: #fff; color: #3b82f6;
          border: 1px solid #e2e8f0; border-radius: 6px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all 0.2s;
        }

        .cal-today-btn:hover { background: #f1f5f9; }

        .cal-wrapper {
          background: #fff; border-radius: 10px; border: 1px solid #e2e8f0;
          overflow: hidden; margin-bottom: 20px;
        }

        .cal-grid {
          display: grid; grid-template-columns: repeat(7, 1fr);
          gap: 1px; background: #e2e8f0;
        }

        .cal-day-header {
          background: #f8fafc; padding: 8px; text-align: center;
          font-size: 11px; font-weight: 600; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.3px;
        }

        .cal-day-header-weekend { color: #94a3b8; }

        .cal-empty-day { background: #fff; min-height: 80px; }

        .cal-day {
          background: #fff; min-height: 80px; padding: 6px;
          cursor: pointer; transition: all 0.2s;
          display: flex; flex-direction: column;
        }

        .cal-day:hover { background: #f8fafc; }
        .cal-day-today { background: #f0f9ff; }
        .cal-day-selected { background: #eff6ff; border: 2px solid #3b82f6; margin: -1px; border-radius: 2px; }
        .cal-day-weekend { background: #fafbfc; }

        .cal-day-header-cal {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;
        }

        .cal-day-number { font-size: 13px; font-weight: 500; color: #475569; }
        .cal-day-number-today { color: #3b82f6; font-weight: 700; }

        .cal-event-count {
          font-size: 9px; background: #3b82f6; color: #fff;
          padding: 1px 5px; border-radius: 9999px; font-weight: 600;
        }

        .cal-events-container {
          display: flex; flex-direction: column; gap: 2px; flex: 1;
        }

        .cal-event-chip {
          padding: 2px 6px; border-radius: 3px; font-size: 9px;
          color: #fff; overflow: hidden; text-overflow: ellipsis;
          white-space: nowrap; cursor: pointer; font-weight: 500;
          transition: all 0.2s;
        }

        .cal-event-chip:hover { transform: scale(1.02); opacity: 0.9; }
        .cal-event-chip-text { font-size: 9px; }

        .cal-more-events {
          font-size: 9px; color: #64748b; padding: 1px 4px; font-weight: 500;
        }

        .cal-details {
          background: #fff; border-radius: 10px; border: 1px solid #e2e8f0;
          padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .cal-details-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px; flex-wrap: wrap; gap: 10px;
        }

        .cal-details-title { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; }

        .cal-details-add {
          display: flex; align-items: center; gap: 4px;
          padding: 4px 12px; background: #eff6ff; color: #3b82f6;
          border: none; border-radius: 6px; font-size: 12px;
          font-weight: 500; cursor: pointer; transition: all 0.2s;
        }

        .cal-details-add:hover { background: #dbeafe; }

        .cal-event-detail { display: flex; flex-direction: column; gap: 8px; }

        .cal-event-detail-header {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; background: #f8fafc;
          border-radius: 6px; border: 1px solid #f1f5f9;
        }

        .cal-event-color-bar {
          width: 3px; height: 32px; border-radius: 3px; flex-shrink: 0;
        }

        .cal-event-detail-info { flex: 1; }
        .cal-event-detail-title { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0; }
        .cal-event-detail-type { font-size: 11px; color: #64748b; }

        .cal-event-delete {
          display: flex; align-items: center; justify-content: center;
          padding: 4px; background: #fef2f2; color: #ef4444;
          border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s;
        }

        .cal-event-delete:hover { background: #fee2e2; }

        .cal-event-description { font-size: 13px; color: #475569; margin: 0; padding: 0 4px; }

        .cal-event-meta {
          display: flex; gap: 12px; flex-wrap: wrap; padding: 0 4px;
        }

        .cal-event-meta-item {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; color: #64748b;
        }

        .cal-status-badge {
          padding: 1px 8px; border-radius: 3px; font-size: 10px; font-weight: 600;
        }

        .cal-priority-badge {
          padding: 1px 8px; border-radius: 3px; font-size: 10px;
          font-weight: 600; color: #fff; text-transform: uppercase;
        }

        .cal-no-events { text-align: center; padding: 24px 0; }

        .cal-no-events-icon-wrapper {
          display: inline-flex; padding: 12px; background: #f1f5f9;
          border-radius: 50%; margin-bottom: 8px;
          color: #94a3b8;
        }

        .cal-no-events-text { font-size: 14px; font-weight: 500; color: #0f172a; margin: 0; }
        .cal-no-events-subtext { font-size: 12px; color: #94a3b8; margin: 2px 0 0 0; }

        @media (max-width: 768px) {
          .cal-container { padding: 16px; }
          .cal-header { flex-direction: column; align-items: stretch; }
          .cal-header-actions { width: 100%; justify-content: flex-start; }
          .cal-primary-btn { flex: 1; justify-content: center; }
          .cal-filter-btn { flex: 1; justify-content: center; }
          .cal-stats { grid-template-columns: repeat(2, 1fr); }
          .cal-controls { flex-direction: column; align-items: stretch; }
          .cal-controls-left { justify-content: center; }
          .cal-controls-right { justify-content: center; width: 100%; }
          .cal-today-btn { width: 100%; justify-content: center; }
          .cal-day { min-height: 60px; padding: 4px; }
          .cal-event-chip { display: none; }
          .cal-event-count { display: inline-block; }
          .cal-filter-row { flex-direction: column; align-items: stretch; }
          .cal-filter-group { min-width: unset; }
          .cal-clear-filters { align-self: stretch; }
          .cal-details-header { flex-direction: column; align-items: stretch; }
          .cal-details-add { width: 100%; justify-content: center; }
          .cal-event-detail-header { flex-wrap: wrap; }
          .cal-event-meta { flex-direction: column; }
          .cal-day-header { font-size: 10px; padding: 6px; }
          .cal-day-number { font-size: 12px; }
        }

        @media (max-width: 480px) {
          .cal-container { padding: 12px; }
          .cal-stats { grid-template-columns: 1fr; }
          .cal-stat { padding: 10px 14px; }
          .cal-stat-number { font-size: 16px; }
          .cal-title { font-size: 20px; }
          .cal-month-label { font-size: 14px; min-width: 100px; }
          .cal-day { min-height: 50px; padding: 2px; }
          .cal-day-number { font-size: 11px; }
          .cal-header-actions { flex-wrap: wrap; }
          .cal-primary-btn, .cal-filter-btn { flex: 1; min-width: 100px; }
          .cal-icon-btn { padding: 6px; }
        }
      `}</style>
    </div>
  );
};

export default CalendarView;