// pages/employees/Attendance.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import Table, { TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '../../components/common/Table';
import { Loader } from '../../components/common/Loader';
import axios from 'axios';
import toast from 'react-hot-toast';

const Attendance = () => {
  const { token, user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clocking, setClocking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);

  // API base URL
  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth]);

  useEffect(() => {
    // Check if user is currently clocked in
    const today = new Date();
    const todayRecord = attendance.find(a => 
      new Date(a.date).toDateString() === today.toDateString()
    );
    if (todayRecord) {
      setIsClockedIn(!!todayRecord.clockIn && !todayRecord.clockOut);
      setCurrentStatus(todayRecord.status || 'Not Clocked In');
    }
  }, [attendance]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const response = await axios.get(`${API_URL}/employees/attendance`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setAttendance(response.data.data || []);
        
        // Check if user is clocked in today
        const today = new Date();
        const todayRecord = (response.data.data || []).find(a => 
          new Date(a.date).toDateString() === today.toDateString()
        );
        if (todayRecord) {
          setIsClockedIn(!!todayRecord.clockIn && !todayRecord.clockOut);
          setCurrentStatus(todayRecord.status);
        }
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      let errorMessage = 'Failed to load attendance data.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view attendance.';
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

  const handleClockIn = async () => {
    setClocking(true);
    try {
      // Get current position
      let position = null;
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (geoError) {
        console.warn('Geolocation not available:', geoError);
        // Continue without location
      }

      const response = await axios.post(`${API_URL}/employees/attendance/clock-in`, 
        position ? { location: position } : {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        toast.success('Clocked in successfully');
        setIsClockedIn(true);
        setCurrentStatus('Present');
        await fetchAttendance();
      }
    } catch (err) {
      console.error('Error clocking in:', err);
      let errorMessage = 'Failed to clock in.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Already clocked in today.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setClocking(false);
    }
  };

  const handleClockOut = async () => {
    setClocking(true);
    try {
      const response = await axios.post(`${API_URL}/employees/attendance/clock-out`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        toast.success('Clocked out successfully');
        setIsClockedIn(false);
        setCurrentStatus('Clocked Out');
        await fetchAttendance();
      }
    } catch (err) {
      console.error('Error clocking out:', err);
      let errorMessage = 'Failed to clock out.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Not clocked in yet.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setClocking(false);
    }
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

  const getStatusStyle = (status) => {
    const statusStyles = {
      'Present': {
        backgroundColor: '#d1fae5',
        color: '#065f46',
      },
      'present': {
        backgroundColor: '#d1fae5',
        color: '#065f46',
      },
      'Late': {
        backgroundColor: '#fef3c7',
        color: '#92400e',
      },
      'late': {
        backgroundColor: '#fef3c7',
        color: '#92400e',
      },
      'Absent': {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
      },
      'absent': {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
      },
      'Half Day': {
        backgroundColor: '#ffedd5',
        color: '#9a3412',
      },
      'half_day': {
        backgroundColor: '#ffedd5',
        color: '#9a3412',
      },
      'Leave': {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
      },
      'leave': {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
      },
    };
    return statusStyles[status] || {
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
    };
  };

  const todayAttendance = attendance.find(a => 
    new Date(a.date).toDateString() === new Date().toDateString()
  );

  const statusSummary = {
    present: attendance.filter(a => 
      a.status === 'Present' || a.status === 'present'
    ).length,
    absent: attendance.filter(a => 
      a.status === 'Absent' || a.status === 'absent'
    ).length,
    late: attendance.filter(a => 
      a.status === 'Late' || a.status === 'late'
    ).length,
    halfDay: attendance.filter(a => 
      a.status === 'Half Day' || a.status === 'half_day'
    ).length,
    leave: attendance.filter(a => 
      a.status === 'Leave' || a.status === 'leave'
    ).length,
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Attendance</h1>
          <p style={styles.subtitle}>Track your daily attendance</p>
        </div>
        <div style={styles.headerActions}>
          {!isClockedIn ? (
            <button 
              style={styles.clockInButton}
              onClick={handleClockIn}
              disabled={clocking}
            >
              <Clock style={styles.buttonIcon} />
              {clocking ? 'Clocking In...' : 'Clock In'}
            </button>
          ) : (
            <button 
              style={styles.clockOutButton}
              onClick={handleClockOut}
              disabled={clocking}
            >
              <Clock style={styles.buttonIcon} />
              {clocking ? 'Clocking Out...' : 'Clock Out'}
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryContent}>
            <div>
              <p style={styles.summaryLabel}>Today's Status</p>
              <p style={styles.summaryValue}>
                {currentStatus || (todayAttendance ? todayAttendance.status : 'Not Clocked In')}
              </p>
            </div>
            {todayAttendance?.clockIn && (
              <div style={styles.clockInfo}>
                <p style={styles.clockLabel}>Clock In</p>
                <p style={styles.clockTime}>{formatTime(todayAttendance.clockIn)}</p>
              </div>
            )}
          </div>
          {todayAttendance?.clockOut && (
            <div style={styles.clockOutInfo}>
              <p style={styles.clockLabel}>Clock Out</p>
              <p style={styles.clockTime}>{formatTime(todayAttendance.clockOut)}</p>
            </div>
          )}
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Total Hours This Month</p>
          <p style={styles.summaryValue}>
            {attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0).toFixed(1)}h
          </p>
          <div style={styles.workingDays}>
            <span style={styles.workingDaysLabel}>Working Days:</span>
            <span style={styles.workingDaysValue}>{attendance.length}</span>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Monthly Summary</p>
          <div style={styles.summaryStats}>
            <div style={styles.summaryStat}>
              <p style={{...styles.statValue, color: '#22C55E'}}>{statusSummary.present}</p>
              <p style={styles.statLabel}>Present</p>
            </div>
            <div style={styles.summaryStat}>
              <p style={{...styles.statValue, color: '#F59E0B'}}>{statusSummary.late}</p>
              <p style={styles.statLabel}>Late</p>
            </div>
            <div style={styles.summaryStat}>
              <p style={{...styles.statValue, color: '#EF4444'}}>{statusSummary.absent}</p>
              <p style={styles.statLabel}>Absent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div style={styles.navigationContainer}>
        <div style={styles.navigationButtons}>
          <button
            style={styles.navButton}
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
          >
            Previous
          </button>
          <span style={styles.monthLabel}>
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button
            style={styles.navButton}
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
          >
            Next
          </button>
        </div>
        <button
          style={styles.todayButton}
          onClick={() => setCurrentMonth(new Date())}
        >
          Today
        </button>
      </div>

      {/* Attendance Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Date</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Clock In</TableHeadCell>
                <TableHeadCell>Clock Out</TableHeadCell>
                <TableHeadCell>Total Hours</TableHeadCell>
                <TableHeadCell>Overtime</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="6" style={styles.emptyState}>
                    No attendance records for this month
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>
                      <span style={{
                        ...styles.statusBadge,
                        ...getStatusStyle(record.status)
                      }}>
                        {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>{record.clockIn ? formatTime(record.clockIn) : '-'}</TableCell>
                    <TableCell>{record.clockOut ? formatTime(record.clockOut) : '-'}</TableCell>
                    <TableCell>{record.totalHours ? record.totalHours.toFixed(1) + 'h' : '-'}</TableCell>
                    <TableCell>{record.overtime ? record.overtime.toFixed(1) + 'h' : '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64vh',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
  },
  clockInButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  clockOutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  buttonIcon: {
    width: '16px',
    height: '16px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  summaryContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  summaryValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  clockInfo: {
    textAlign: 'right',
  },
  clockLabel: {
    fontSize: '12px',
    color: '#6B7280',
    margin: 0,
  },
  clockTime: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
  },
  clockOutInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #F3F4F6',
  },
  workingDays: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  workingDaysLabel: {
    fontSize: '14px',
    color: '#6B7280',
  },
  workingDaysValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  summaryStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginTop: '8px',
  },
  summaryStat: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
  },
  statLabel: {
    fontSize: '11px',
    color: '#6B7280',
    margin: 0,
  },
  navigationContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  navigationButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  navButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  monthLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    minWidth: '160px',
    textAlign: 'center',
  },
  todayButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#3B82F6',
    border: '1px solid #3B82F6',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
    color: '#6B7280',
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .clock-in-button:hover:not(:disabled) {
    background-color: #16A34A !important;
  }
  
  .clock-out-button:hover:not(:disabled) {
    background-color: #DC2626 !important;
  }
  
  .nav-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .today-button:hover:not(:disabled) {
    background-color: #EFF6FF !important;
  }
  
  .clock-in-button:disabled,
  .clock-out-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .header-actions {
      width: 100% !important;
    }
    
    .clock-in-button,
    .clock-out-button {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .summary-grid {
      grid-template-columns: 1fr !important;
    }
    
    .navigation-container {
      flex-direction: column !important;
    }
    
    .navigation-buttons {
      width: 100% !important;
      justify-content: space-between !important;
    }
    
    .today-button {
      width: 100% !important;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 16px !important;
    }
    
    .month-label {
      min-width: 100px !important;
      font-size: 14px !important;
    }
    
    .summary-stats {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Attendance;