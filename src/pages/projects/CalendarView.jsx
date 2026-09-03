// pages/projects/CalendarView.jsx - MODERN DESIGN WITH YOUR COLOR PALETTE

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
  Clock, Users, Tag, X, RefreshCw, Filter, Search, ChevronDown,
  CheckCircle, AlertCircle, FileText, MapPin, Briefcase, Star,
  Flag, Eye
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
      const tasksRes = await axios.get(`${API_URL}/tasks`, {
        params: {
          ...(filterType && { type: filterType }),
          ...(searchTerm && { search: searchTerm })
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      const tasksData = tasksRes.data?.data || [];
      
      const projectsRes = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const projectsData = projectsRes.data?.data || [];
      setProjects(projectsData);

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
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
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
      'task': '#013E37',
      'deadline': '#EF4444',
      'meeting': '#8B5CF6',
      'review': '#F59E0B',
      'default': '#013E37'
    };
    return colors[type] || colors.default;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': '#013E37',
      'high': '#F59E0B',
      'medium': '#3B82F6',
      'low': '#22C55E'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Backlog': { bg: '#F3F4F6', color: '#374151' },
      'Todo': { bg: '#F3F4F6', color: '#374151' },
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
      days.push(<div key={`empty-${i}`} style={styles.emptyDay} />);
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
          style={{
            ...styles.day,
            ...(isToday ? styles.dayToday : {}),
            ...(isSelected ? styles.daySelected : {}),
            ...(isWeekend ? styles.dayWeekend : {})
          }}
          onClick={() => {
            setSelectedDate(date);
            setSelectedEvent(null);
          }}
        >
          <div style={styles.dayHeader}>
            <span style={{
              ...styles.dayNumber,
              ...(isToday ? styles.dayNumberToday : {})
            }}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span style={styles.eventCount}>{dayEvents.length}</span>
            )}
          </div>
          <div style={styles.eventsContainer}>
            {dayEvents.slice(0, 3).map((event) => (
              <div 
                key={event._id}
                style={{
                  ...styles.eventChip,
                  backgroundColor: getEventColor(event.type || 'task')
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                  setSelectedDate(date);
                }}
                title={event.title}
              >
                <span style={styles.eventChipText}>{event.title}</span>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div style={styles.moreEvents}>
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
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Calendar</h1>
          <p style={styles.subtitle}>View your project tasks and deadlines</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.iconBtn} onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button style={styles.filterBtn} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filters
            <ChevronDown size={12} style={{
              transform: showFilters ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease'
            }} />
          </button>
          <button style={styles.primaryBtn} onClick={showAddTaskInfo}>
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={{...styles.statIcon, backgroundColor: '#FFEFB3'}}>
            <CalendarIcon size={14} style={{color: '#013E37'}} />
          </div>
          <div><p style={styles.statNumber}>{stats.total}</p><p style={styles.statLabel}>Total</p></div>
        </div>
        <div style={styles.stat}>
          <div style={{...styles.statIcon, backgroundColor: '#FFEFB3'}}>
            <AlertCircle size={14} style={{color: '#013E37'}} />
          </div>
          <div><p style={styles.statNumber}>{stats.backlog}</p><p style={styles.statLabel}>Backlog</p></div>
        </div>
        <div style={styles.stat}>
          <div style={{...styles.statIcon, backgroundColor: '#FFEFB3'}}>
            <Clock size={14} style={{color: '#013E37'}} />
          </div>
          <div><p style={styles.statNumber}>{stats.inProgress}</p><p style={styles.statLabel}>In Progress</p></div>
        </div>
        <div style={styles.stat}>
          <div style={{...styles.statIcon, backgroundColor: '#FFEFB3'}}>
            <CheckCircle size={14} style={{color: '#013E37'}} />
          </div>
          <div><p style={styles.statNumber}>{stats.completed}</p><p style={styles.statLabel}>Completed</p></div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={styles.filterPanel}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Types</option>
                <option value="task">Task</option>
                <option value="deadline">Deadline</option>
                <option value="meeting">Meeting</option>
                <option value="review">Review</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search</label>
              <div style={styles.search}>
                <Search size={14} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                {searchTerm && (
                  <button style={styles.searchClear} onClick={() => setSearchTerm('')}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
            <button style={styles.clearFilters} onClick={() => {
              setFilterType('');
              setSearchTerm('');
            }}>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Calendar Controls */}
      <div style={styles.controls}>
        <div style={styles.controlsLeft}>
          <button style={styles.navBtn} onClick={() => navigateMonth(-1)}>
            <ChevronLeft size={16} />
          </button>
          <span style={styles.monthLabel}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button style={styles.navBtn} onClick={() => navigateMonth(1)}>
            <ChevronRight size={16} />
          </button>
        </div>
        <div style={styles.controlsRight}>
          <button style={styles.todayBtn} onClick={navigateToday}>
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={styles.wrapper}>
        <div style={styles.grid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{
              ...styles.dayHeader,
              ...((day === 'Sun' || day === 'Sat') ? styles.dayHeaderWeekend : {})
            }}>
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>
      </div>

      {/* Event Details Panel */}
      {selectedDate && (
        <div style={styles.details}>
          <div style={styles.detailsHeader}>
            <h3 style={styles.detailsTitle}>{formatDate(selectedDate)}</h3>
            <button style={styles.detailsAdd} onClick={showAddTaskInfo}>
              <Plus size={14} />
              Add Task
            </button>
          </div>
          
          {selectedEvent ? (
            <div style={styles.eventDetail}>
              <div style={styles.eventDetailHeader}>
                <div style={{...styles.eventColorBar, backgroundColor: getEventColor(selectedEvent.type || 'task')}} />
                <div style={styles.eventDetailInfo}>
                  <h4 style={styles.eventDetailTitle}>{selectedEvent.title}</h4>
                  <span style={styles.eventDetailType}>
                    {selectedEvent.type || 'Task'} • {selectedEvent._projectName || 'Project'}
                  </span>
                </div>
                <button style={styles.eventDelete} onClick={() => handleDeleteTask(selectedEvent._id)}>
                  <X size={14} />
                </button>
              </div>
              
              {selectedEvent.description && (
                <p style={styles.eventDescription}>{selectedEvent.description}</p>
              )}
              
              <div style={styles.eventMeta}>
                <div style={styles.eventMetaItem}>
                  <Clock size={12} />
                  <span>{formatTime(selectedEvent.deadline || selectedEvent.dueDate)}</span>
                </div>
                {selectedEvent.status && (
                  <div style={styles.eventMetaItem}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusBadge(selectedEvent.status).bg,
                      color: getStatusBadge(selectedEvent.status).color
                    }}>
                      {selectedEvent.status}
                    </span>
                  </div>
                )}
                {selectedEvent.priority && (
                  <div style={styles.eventMetaItem}>
                    <span style={{
                      ...styles.priorityBadge,
                      backgroundColor: getPriorityColor(selectedEvent.priority),
                    }}>
                      <Flag size={10} />
                      {selectedEvent.priority}
                    </span>
                  </div>
                )}
                {selectedEvent._projectName && (
                  <div style={styles.eventMetaItem}>
                    <Briefcase size={12} />
                    <span>{selectedEvent._projectName}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={styles.noEvents}>
              <div style={styles.noEventsIconWrapper}>
                <CalendarIcon size={24} style={{color: '#013E37', opacity: 0.4}} />
              </div>
              <p style={styles.noEventsText}>No tasks scheduled</p>
              <p style={styles.noEventsSubtext}>Click "Add Task" to create one</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
    minHeight: '100vh',
    borderRadius: '24px',
    boxShadow: '0 2px 12px rgba(1, 62, 55, 0.04)',
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
    color: '#013E37',
    fontSize: '14px',
    fontWeight: '500',
  },
  spinner: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '3px solid #FFEFB3',
    borderTopColor: '#013E37',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#013E37',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#013E37',
    opacity: 0.7,
    marginTop: '2px',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 10px',
    background: '#FFFFFF',
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    color: '#013E37',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    background: '#FFFFFF',
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#013E37',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 20px',
    background: '#013E37',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.2)',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '12px 16px',
    border: '1px solid #FFEFB3',
    transition: 'all 0.2s ease',
  },
  statIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statNumber: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#013E37',
    margin: 0,
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: '11px',
    color: '#013E37',
    opacity: 0.6,
    margin: 0,
    fontWeight: '500',
  },
  filterPanel: {
    background: '#FFFFFF',
    border: '1px solid #FFEFB3',
    borderRadius: '12px',
    padding: '14px 18px',
    marginBottom: '16px',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: '120px',
  },
  filterLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#013E37',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  filterSelect: {
    padding: '6px 12px',
    border: '1px solid #FFEFB3',
    borderRadius: '8px',
    fontSize: '13px',
    background: '#FFFFFF',
    color: '#013E37',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  search: {
    display: 'flex',
    alignItems: 'center',
    background: '#FFFFFF',
    border: '1px solid #FFEFB3',
    borderRadius: '8px',
    padding: '0 10px',
    transition: 'all 0.2s ease',
  },
  searchIcon: {
    color: '#013E37',
    opacity: 0.5,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    padding: '6px 8px',
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    background: 'transparent',
    color: '#013E37',
  },
  searchClear: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px',
    background: 'none',
    border: 'none',
    color: '#013E37',
    opacity: 0.5,
    cursor: 'pointer',
    borderRadius: '4px',
  },
  clearFilters: {
    padding: '6px 16px',
    background: '#FFEFB3',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#013E37',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    alignSelf: 'center',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  controlsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  controlsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    background: '#FFFFFF',
    border: '1px solid #FFEFB3',
    borderRadius: '8px',
    color: '#013E37',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  monthLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#013E37',
    minWidth: '140px',
    textAlign: 'center',
  },
  todayBtn: {
    padding: '6px 16px',
    background: '#FFFFFF',
    color: '#013E37',
    border: '1px solid #FFEFB3',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  wrapper: {
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #FFEFB3',
    overflow: 'hidden',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(1, 62, 55, 0.04)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    background: '#FFEFB3',
  },
  dayHeader: {
    background: '#FFFFFF',
    padding: '10px',
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: '#013E37',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  dayHeaderWeekend: {
    opacity: 0.4,
  },
  emptyDay: {
    background: '#FFFFFF',
    minHeight: '80px',
  },
  day: {
    background: '#FFFFFF',
    minHeight: '80px',
    padding: '6px 8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  dayToday: {
    background: '#FFFDF5',
  },
  daySelected: {
    background: '#FFEFB3',
    border: '2px solid #013E37',
    margin: '-1px',
    borderRadius: '4px',
  },
  dayWeekend: {
    background: '#FFFDF5',
  },
  dayHeaderCal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2px',
  },
  dayNumber: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#013E37',
    opacity: 0.7,
  },
  dayNumberToday: {
    color: '#013E37',
    fontWeight: '700',
    opacity: 1,
  },
  eventCount: {
    fontSize: '9px',
    background: '#013E37',
    color: '#FFFFFF',
    padding: '1px 6px',
    borderRadius: '9999px',
    fontWeight: '600',
  },
  eventsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  eventChip: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '9px',
    color: '#FFFFFF',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  eventChipText: {
    fontSize: '9px',
  },
  moreEvents: {
    fontSize: '9px',
    color: '#013E37',
    opacity: 0.5,
    padding: '1px 4px',
    fontWeight: '500',
  },
  details: {
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #FFEFB3',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(1, 62, 55, 0.04)',
  },
  detailsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  detailsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#013E37',
    margin: 0,
  },
  detailsAdd: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 14px',
    background: '#FFEFB3',
    color: '#013E37',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  eventDetail: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  eventDetailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    background: '#FFFDF5',
    borderRadius: '8px',
    border: '1px solid #FFEFB3',
  },
  eventColorBar: {
    width: '3px',
    height: '32px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  eventDetailInfo: {
    flex: 1,
  },
  eventDetailTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#013E37',
    margin: 0,
  },
  eventDetailType: {
    fontSize: '11px',
    color: '#013E37',
    opacity: 0.6,
  },
  eventDelete: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    background: '#FEF2F2',
    color: '#EF4444',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  eventDescription: {
    fontSize: '13px',
    color: '#013E37',
    opacity: 0.8,
    margin: 0,
    padding: '0 4px',
  },
  eventMeta: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    padding: '0 4px',
  },
  eventMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#013E37',
    opacity: 0.6,
  },
  statusBadge: {
    padding: '2px 10px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: '600',
  },
  priorityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 10px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  noEvents: {
    textAlign: 'center',
    padding: '24px 0',
  },
  noEventsIconWrapper: {
    display: 'inline-flex',
    padding: '12px',
    background: '#FFEFB3',
    borderRadius: '50%',
    marginBottom: '8px',
  },
  noEventsText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#013E37',
    margin: 0,
  },
  noEventsSubtext: {
    fontSize: '12px',
    color: '#013E37',
    opacity: 0.5,
    margin: '2px 0 0 0',
  },
};

// Add keyframe animations and hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .icon-btn:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
  }

  .filter-btn:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
  }

  .primary-btn:hover:not(:disabled) {
    background-color: #025a50 !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(1, 62, 55, 0.25) !important;
  }

  .stat:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(1, 62, 55, 0.06) !important;
  }

  .day:hover {
    background-color: #FFFDF5 !important;
  }

  .event-chip:hover {
    transform: scale(1.04) !important;
    opacity: 0.9 !important;
  }

  .details-add:hover:not(:disabled) {
    background-color: #e6d69e !important;
  }

  .event-delete:hover {
    background-color: #FEE2E2 !important;
  }

  .clear-filters:hover:not(:disabled) {
    background-color: #e6d69e !important;
  }

  .search:focus-within {
    border-color: #013E37 !important;
    box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.08) !important;
  }

  .filter-select:focus {
    border-color: #013E37 !important;
    box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.08) !important;
  }

  .search-clear:hover {
    background-color: #FFEFB3 !important;
  }

  .nav-btn:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
  }

  .today-btn:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
  }

  @media (max-width: 768px) {
    .container { padding: 16px !important; }
    .header { flex-direction: column; align-items: stretch; }
    .header-actions { width: 100%; justify-content: flex-start; }
    .primary-btn { flex: 1; justify-content: center; }
    .filter-btn { flex: 1; justify-content: center; }
    .stats { grid-template-columns: repeat(2, 1fr); }
    .controls { flex-direction: column; align-items: stretch; }
    .controls-left { justify-content: center; }
    .controls-right { justify-content: center; width: 100%; }
    .today-btn { width: 100%; justify-content: center; }
    .day { min-height: 60px; padding: 4px; }
    .event-chip { display: none; }
    .event-count { display: inline-block; }
    .filter-row { flex-direction: column; align-items: stretch; }
    .filter-group { min-width: unset; }
    .clear-filters { align-self: stretch; }
    .details-header { flex-direction: column; align-items: stretch; }
    .details-add { width: 100%; justify-content: center; }
    .event-detail-header { flex-wrap: wrap; }
    .event-meta { flex-direction: column; }
    .day-header { font-size: 10px; padding: 6px; }
    .day-number { font-size: 12px; }
  }

  @media (max-width: 480px) {
    .container { padding: 12px !important; }
    .stats { grid-template-columns: 1fr; }
    .stat { padding: 10px 14px; }
    .stat-number { font-size: 16px; }
    .title { font-size: 22px; }
    .month-label { font-size: 14px; min-width: 100px; }
    .day { min-height: 50px; padding: 2px; }
    .day-number { font-size: 11px; }
    .header-actions { flex-wrap: wrap; }
    .primary-btn, .filter-btn { flex: 1; min-width: 100px; }
    .icon-btn { padding: 6px; }
  }
`;
document.head.appendChild(styleSheet);

export default CalendarView;