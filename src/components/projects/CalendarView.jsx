// components/projects/CalendarView.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  List
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CalendarView = ({ projectId, onTaskClick }) => {
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // month, week, day
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignee: ''
  });

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId, currentDate, view]);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/projects/tasks`, {
        params: {
          projectId,
          startDate: getDateRangeStart(currentDate, view),
          endDate: getDateRangeEnd(currentDate, view),
          limit: 200
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        const tasksData = response.data.data || [];
        const eventsData = tasksData.map(task => ({
          id: task._id,
          title: task.title,
          description: task.description,
          start: new Date(task.startDate || task.deadline || task.createdAt),
          end: new Date(task.deadline || task.startDate || task.createdAt),
          status: task.status,
          priority: task.priority,
          assignee: task.assignedTo,
          project: task.projectId,
          estimatedHours: task.estimatedHours,
          actualHours: task.actualHours
        }));
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      }
    } catch (err) {
      console.error('Error fetching tasks for calendar:', err);
      let errorMessage = 'Failed to load calendar events.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view these tasks.';
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

  const getDateRangeStart = (date, viewType) => {
    const d = new Date(date);
    if (viewType === 'week') {
      const day = d.getDay();
      d.setDate(d.getDate() - day);
    } else if (viewType === 'day') {
      // Just use the current day
    } else {
      d.setDate(1);
    }
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  };

  const getDateRangeEnd = (date, viewType) => {
    const d = new Date(date);
    if (viewType === 'week') {
      const day = d.getDay();
      d.setDate(d.getDate() + (6 - day));
    } else if (viewType === 'day') {
      // Just use the current day
    } else {
      d.setMonth(d.getMonth() + 1);
      d.setDate(0);
    }
    d.setHours(23, 59, 59, 999);
    return d.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getEventsForDay = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Urgent': 'bg-red-100 text-red-800 border-red-300',
      'High': 'bg-orange-100 text-orange-800 border-orange-300',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Low': 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      'Urgent': { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' },
      'High': { backgroundColor: '#ffedd5', color: '#9a3412', borderColor: '#fdba74' },
      'Medium': { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' },
      'Low': { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#6ee7b7' }
    };
    return styles[priority] || { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' };
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Backlog': 'bg-gray-100 text-gray-800',
      'Internal QA': 'bg-purple-100 text-purple-800',
      'Client Review': 'bg-orange-100 text-orange-800',
      'Approved': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Completed': { backgroundColor: '#d1fae5', color: '#065f46' },
      'In Progress': { backgroundColor: '#dbeafe', color: '#1e40af' },
      'Backlog': { backgroundColor: '#f3f4f6', color: '#374151' },
      'Internal QA': { backgroundColor: '#ede9fe', color: '#5b21b6' },
      'Client Review': { backgroundColor: '#ffedd5', color: '#9a3412' },
      'Approved': { backgroundColor: '#d1fae5', color: '#065f46' }
    };
    return styles[status] || styles.Backlog;
  };

  const applyFilters = () => {
    let filtered = [...events];
    
    if (filters.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(e => e.priority === filters.priority);
    }
    if (filters.assignee) {
      filtered = filtered.filter(e => e.assignee?._id === filters.assignee);
    }
    
    setFilteredEvents(filtered);
  };

  const renderEvent = (event) => (
    <div 
      key={event.id}
      style={{
        ...styles.eventCard,
        ...getPriorityStyle(event.priority),
        borderLeftWidth: '4px',
        borderLeftStyle: 'solid',
      }}
      onClick={() => onTaskClick ? onTaskClick(event.id) : window.location.href = `/tasks/${event.id}`}
    >
      <div style={styles.eventTitle}>{event.title}</div>
      <div style={styles.eventMeta}>
        <span style={{
          ...styles.eventStatus,
          ...getStatusStyle(event.status)
        }}>
          {event.status || 'N/A'}
        </span>
        {event.assignee && (
          <span style={styles.eventAssignee}>
            <Users style={styles.eventAssigneeIcon} />
            {event.assignee.firstName?.[0]}{event.assignee.lastName?.[0]}
          </span>
        )}
      </div>
    </div>
  );

  const renderDay = (day) => {
    const dayEvents = getEventsForDay(day);
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const isTodayDay = isToday(date);

    return (
      <div 
        key={day}
        style={{
          ...styles.dayCell,
          ...(isTodayDay ? styles.dayCellToday : {}),
        }}
        onClick={() => setSelectedDate(date)}
      >
        <div style={{
          ...styles.dayHeader,
          ...(isTodayDay ? styles.dayHeaderToday : {})
        }}>
          <span>{day}</span>
          {isTodayDay && (
            <span style={styles.todayBadge}>Today</span>
          )}
        </div>
        <div style={styles.dayEvents}>
          {dayEvents.slice(0, 3).map(renderEvent)}
          {dayEvents.length > 3 && (
            <div style={styles.moreEvents}>
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const today = new Date(currentDate);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div style={styles.weekGrid}>
        {weekDays.map((day, index) => {
          const dayEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.getDate() === day.getDate() &&
                   eventDate.getMonth() === day.getMonth() &&
                   eventDate.getFullYear() === day.getFullYear();
          });
          const isTodayDay = isToday(day);

          return (
            <div key={index} style={{
              ...styles.weekDayCell,
              ...(isTodayDay ? styles.weekDayCellToday : {})
            }}>
              <div style={{
                ...styles.weekDayHeader,
                ...(isTodayDay ? styles.weekDayHeaderToday : {})
              }}>
                {day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                {isTodayDay && <span style={styles.todayDot}>●</span>}
              </div>
              <div style={styles.weekDayEvents}>
                {dayEvents.slice(0, 4).map(renderEvent)}
                {dayEvents.length > 4 && (
                  <div style={styles.moreEvents}>+{dayEvents.length - 4} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Calendar style={styles.headerIcon} />
          <span style={styles.headerTitle}>Project Calendar</span>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.viewToggle}>
            <button
              style={{
                ...styles.viewButton,
                ...(view === 'month' ? styles.viewButtonActive : styles.viewButtonInactive)
              }}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button
              style={{
                ...styles.viewButton,
                ...(view === 'week' ? styles.viewButtonActive : styles.viewButtonInactive)
              }}
              onClick={() => setView('week')}
            >
              Week
            </button>
          </div>
          <button style={styles.navButton} onClick={() => navigate(-1)}>
            <ChevronLeft style={styles.navIcon} />
          </button>
          <span style={styles.dateLabel}>
            {view === 'month' && currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            {view === 'week' && (
              <>
                {new Date(currentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                {new Date(new Date(currentDate).setDate(currentDate.getDate() + 6)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </>
            )}
          </span>
          <button style={styles.navButton} onClick={() => navigate(1)}>
            <ChevronRight style={styles.navIcon} />
          </button>
          <button style={styles.todayButton} onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersBar}>
        <Filter style={styles.filterIcon} />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="">All Status</option>
          <option value="Backlog">Backlog</option>
          <option value="In Progress">In Progress</option>
          <option value="Internal QA">Internal QA</option>
          <option value="Client Review">Client Review</option>
          <option value="Approved">Approved</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="">All Priority</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        {(filters.status || filters.priority) && (
          <button
            style={styles.clearFiltersButton}
            onClick={() => setFilters({ status: '', priority: '', assignee: '' })}
          >
            Clear Filters
          </button>
        )}
        <span style={styles.eventCount}>
          {filteredEvents.length} events
        </span>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendGroup}>
          <span style={styles.legendLabel}>Priority:</span>
          {['Urgent', 'High', 'Medium', 'Low'].map((priority) => (
            <span key={priority} style={{
              ...styles.legendBadge,
              ...getPriorityStyle(priority)
            }}>
              {priority}
            </span>
          ))}
        </div>
        <div style={styles.legendGroup}>
          <span style={styles.legendLabel}>Status:</span>
          {['Completed', 'In Progress', 'Backlog', 'Internal QA', 'Client Review'].map((status) => (
            <span key={status} style={{
              ...styles.legendBadge,
              ...getStatusStyle(status)
            }}>
              {status}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      {view === 'month' ? (
        <>
          <div style={styles.dayHeaders}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} style={styles.dayHeaderCell}>{day}</div>
            ))}
          </div>
          <div style={styles.monthGrid}>
            {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
              <div key={`empty-${index}`} style={styles.emptyDay} />
            ))}
            {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => (
              renderDay(index + 1)
            ))}
          </div>
        </>
      ) : (
        renderWeekView()
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #E5E7EB',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerIcon: {
    width: '20px',
    height: '20px',
    color: '#3B82F6',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  viewToggle: {
    display: 'flex',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #D1D5DB',
  },
  viewButton: {
    padding: '6px 12px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  viewButtonActive: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
  },
  viewButtonInactive: {
    backgroundColor: 'transparent',
    color: '#374151',
  },
  navButton: {
    padding: '6px 8px',
    backgroundColor: 'transparent',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: '16px',
    height: '16px',
    color: '#374151',
  },
  dateLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    minWidth: '120px',
    textAlign: 'center',
  },
  todayButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#3B82F6',
    border: '1px solid #3B82F6',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filtersBar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderBottom: '1px solid #E5E7EB',
  },
  filterIcon: {
    width: '16px',
    height: '16px',
    color: '#6B7280',
  },
  filterSelect: {
    padding: '4px 8px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    outline: 'none',
  },
  clearFiltersButton: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#EF4444',
    fontSize: '13px',
    cursor: 'pointer',
  },
  eventCount: {
    fontSize: '13px',
    color: '#6B7280',
    marginLeft: 'auto',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '12px 24px',
    backgroundColor: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
  },
  legendGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap',
  },
  legendLabel: {
    fontSize: '13px',
    color: '#6B7280',
    marginRight: '4px',
  },
  legendBadge: {
    display: 'inline-flex',
    padding: '2px 6px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '500',
  },
  dayHeaders: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0',
    marginBottom: '0',
  },
  dayHeaderCell: {
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    padding: '8px',
    borderBottom: '1px solid #D1D5DB',
  },
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0',
  },
  emptyDay: {
    minHeight: '100px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
  },
  dayCell: {
    minHeight: '100px',
    border: '1px solid #E5E7EB',
    padding: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    backgroundColor: '#FFFFFF',
  },
  dayCellToday: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  dayHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px',
  },
  dayHeaderToday: {
    color: '#3B82F6',
  },
  todayBadge: {
    fontSize: '10px',
    color: '#3B82F6',
    backgroundColor: '#DBEAFE',
    padding: '1px 6px',
    borderRadius: '9999px',
  },
  dayEvents: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  eventCard: {
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  eventTitle: {
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  eventMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '2px',
  },
  eventStatus: {
    padding: '0px 4px',
    borderRadius: '4px',
    fontSize: '8px',
    fontWeight: '500',
  },
  eventAssignee: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '8px',
    color: '#6B7280',
  },
  eventAssigneeIcon: {
    width: '10px',
    height: '10px',
  },
  moreEvents: {
    textAlign: 'center',
    fontSize: '10px',
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
    borderRadius: '4px',
    padding: '2px',
  },
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    backgroundColor: '#E5E7EB',
  },
  weekDayCell: {
    minHeight: '150px',
    backgroundColor: '#FFFFFF',
    padding: '4px',
  },
  weekDayCellToday: {
    backgroundColor: '#EFF6FF',
  },
  weekDayHeader: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px',
    paddingBottom: '4px',
    borderBottom: '1px solid #E5E7EB',
  },
  weekDayHeaderToday: {
    color: '#3B82F6',
  },
  weekDayEvents: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  todayDot: {
    color: '#3B82F6',
    marginLeft: '4px',
  },
};

// Add keyframe and hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .view-button-inactive:hover {
    background-color: #F9FAFB !important;
  }
  
  .nav-button:hover {
    background-color: #F9FAFB !important;
  }
  
  .today-button:hover {
    background-color: #EFF6FF !important;
  }
  
  .day-cell:hover:not(.day-cell-today) {
    background-color: #F9FAFB !important;
  }
  
  .event-card:hover {
    opacity: 0.8 !important;
  }
  
  .filter-select:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
  }
  
  .clear-filters-button:hover {
    text-decoration: underline !important;
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .header-right {
      justify-content: center !important;
    }
    
    .filters-bar {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .filter-select {
      width: 100% !important;
    }
    
    .event-count {
      margin-left: 0 !important;
      text-align: center !important;
    }
    
    .legend {
      flex-direction: column !important;
      gap: 8px !important;
    }
    
    .day-cell {
      min-height: 60px !important;
    }
    
    .week-day-cell {
      min-height: 100px !important;
    }
  }
  
  @media (max-width: 480px) {
    .day-header-cell {
      font-size: 11px !important;
      padding: 4px !important;
    }
    
    .day-header {
      font-size: 11px !important;
    }
    
    .event-card {
      font-size: 8px !important;
    }
    
    .date-label {
      font-size: 12px !important;
      min-width: 80px !important;
    }
    
    .view-button {
      font-size: 11px !important;
      padding: 4px 8px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default CalendarView;