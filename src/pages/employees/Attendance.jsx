// pages/employees/Attendance.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
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
        backgroundColor: '#013E37',
        color: '#FFEFB3',
      },
      'present': {
        backgroundColor: '#013E37',
        color: '#FFEFB3',
      },
      'Late': {
        backgroundColor: '#FFEFB3',
        color: '#013E37',
      },
      'late': {
        backgroundColor: '#FFEFB3',
        color: '#013E37',
      },
      'Absent': {
        backgroundColor: '#e74c3c',
        color: '#FFFFFF',
      },
      'absent': {
        backgroundColor: '#e74c3c',
        color: '#FFFFFF',
      },
      'Half Day': {
        backgroundColor: '#f39c12',
        color: '#FFFFFF',
      },
      'half_day': {
        backgroundColor: '#f39c12',
        color: '#FFFFFF',
      },
      'Leave': {
        backgroundColor: '#3498db',
        color: '#FFFFFF',
      },
      'leave': {
        backgroundColor: '#3498db',
        color: '#FFFFFF',
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
      <div className="loading-container">
        <Loader size="lg" />
        <p className="loading-text">Loading your attendance...</p>
      </div>
    );
  }

  return (
    <div className="attendance-container">
      {/* Header Section */}
      <div className="attendance-header">
        <div className="header-left">
          <h1 className="attendance-title">Attendance</h1>
          <p className="attendance-subtitle">Track your daily attendance with ease</p>
        </div>
        <div className="header-actions">
          {!isClockedIn ? (
            <button 
              className="clock-in-button"
              onClick={handleClockIn}
              disabled={clocking}
            >
              <Clock size={18} />
              {clocking ? 'Clocking In...' : 'Clock In'}
            </button>
          ) : (
            <button 
              className="clock-out-button"
              onClick={handleClockOut}
              disabled={clocking}
            >
              <Clock size={18} />
              {clocking ? 'Clocking Out...' : 'Clock Out'}
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card summary-card-hover">
          <div className="summary-content">
            <div>
              <p className="summary-label">Today's Status</p>
              <p className="summary-value summary-value-pulse">
                {currentStatus || (todayAttendance ? todayAttendance.status : 'Not Clocked In')}
              </p>
            </div>
            {todayAttendance?.clockIn && (
              <div className="clock-info">
                <p className="clock-label">Clock In</p>
                <p className="clock-time">{formatTime(todayAttendance.clockIn)}</p>
              </div>
            )}
          </div>
          {todayAttendance?.clockOut && (
            <div className="clock-out-info">
              <p className="clock-label">Clock Out</p>
              <p className="clock-time">{formatTime(todayAttendance.clockOut)}</p>
            </div>
          )}
        </div>

        <div className="summary-card summary-card-hover">
          <p className="summary-label">Total Hours This Month</p>
          <p className="summary-value summary-value-scale">
            {attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0).toFixed(1)}h
          </p>
          <div className="working-days">
            <span className="working-days-label">Working Days:</span>
            <span className="working-days-value">{attendance.length}</span>
          </div>
        </div>

        <div className="summary-card summary-card-hover">
          <p className="summary-label">Monthly Summary</p>
          <div className="summary-stats">
            <div className="summary-stat summary-stat-hover">
              <p className="stat-value" style={{ color: '#013E37' }}>
                {statusSummary.present}
              </p>
              <p className="stat-label">Present</p>
            </div>
            <div className="summary-stat summary-stat-hover">
              <p className="stat-value" style={{ color: '#FFEFB3' }}>
                {statusSummary.late}
              </p>
              <p className="stat-label">Late</p>
            </div>
            <div className="summary-stat summary-stat-hover">
              <p className="stat-value" style={{ color: '#e74c3c' }}>
                {statusSummary.absent}
              </p>
              <p className="stat-label">Absent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="navigation-container">
        <div className="navigation-buttons">
          <button
            className="nav-button"
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
          >
            Previous
          </button>
          <span className="month-label">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button
            className="nav-button"
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
          >
            Next
          </button>
        </div>
        <button
          className="today-button"
          onClick={() => setCurrentMonth(new Date())}
        >
          Today
        </button>
      </div>

      {/* Attendance Table */}
      <div className="table-card table-card-hover">
        <div className="table-container">
          <Table>
            <TableHead className="table-head">
              <TableRow>
                <TableHeadCell className="table-header-cell">Date</TableHeadCell>
                <TableHeadCell className="table-header-cell">Status</TableHeadCell>
                <TableHeadCell className="table-header-cell">Clock In</TableHeadCell>
                <TableHeadCell className="table-header-cell">Clock Out</TableHeadCell>
                <TableHeadCell className="table-header-cell">Total Hours</TableHeadCell>
                <TableHeadCell className="table-header-cell">Overtime</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.length === 0 ? (
                <tr className="empty-state">
                  <td colSpan="6">
                    <div className="empty-state-content">
                      <AlertCircle size={40} color="#FFEFB3" />
                      <p>No attendance records for this month</p>
                    </div>
                  </td>
                </tr>
              ) : (
                attendance.map((record, index) => (
                  <tr key={record._id} className="table-row table-row-hover" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className="table-cell">{formatDate(record.date)}</td>
                    <td className="table-cell">
                      <span
                        className="status-badge status-badge-hover"
                        style={getStatusStyle(record.status)}
                      >
                        {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="table-cell">{record.clockIn ? formatTime(record.clockIn) : '-'}</td>
                    <td className="table-cell">{record.clockOut ? formatTime(record.clockOut) : '-'}</td>
                    <td className="table-cell">{record.totalHours ? record.totalHours.toFixed(1) + 'h' : '-'}</td>
                    <td className="table-cell">{record.overtime ? record.overtime.toFixed(1) + 'h' : '-'}</td>
                  </tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Inject CSS */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
    </div>
  );
};

const styles = `
  /* Container */
  .attendance-container {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    background-color: #FFFFFF;
    min-height: 100vh;
    animation: fadeIn 0.5s ease-out;
  }

  /* Loading */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 64vh;
    background-color: #FFFFFF;
  }

  .loading-text {
    margin-top: 16px;
    color: #013E37;
    font-size: 16px;
    font-weight: 500;
    animation: pulse 1.5s ease-in-out infinite;
  }

  /* Header */
  .attendance-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .header-left {
    flex: 1;
  }

  .attendance-title {
    font-size: 32px;
    font-weight: 700;
    color: #013E37;
    margin: 0;
    letter-spacing: -0.02em;
    animation: slideInLeft 0.5s ease-out;
  }

  .attendance-subtitle {
    font-size: 14px;
    color: #6B7280;
    margin-top: 4px;
    margin: 4px 0 0 0;
    font-weight: 400;
    animation: slideInLeft 0.5s ease-out 0.1s both;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  /* Buttons */
  .clock-in-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background-color: #013E37;
    color: #FFEFB3;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(1, 62, 55, 0.3);
    min-width: 140px;
    justify-content: center;
  }

  .clock-in-button:hover:not(:disabled) {
    background-color: #013E37;
    box-shadow: 0 6px 20px rgba(1, 62, 55, 0.4);
    transform: translateY(-2px);
  }

  .clock-out-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background-color: #e74c3c;
    color: #FFFFFF;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
    min-width: 140px;
    justify-content: center;
  }

  .clock-out-button:hover:not(:disabled) {
    background-color: #c0392b;
    box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
    transform: translateY(-2px);
  }

  .clock-in-button:disabled,
  .clock-out-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Summary Cards */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .summary-card {
    background-color: #FFFFFF;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(1, 62, 55, 0.08);
    border: 1px solid rgba(1, 62, 55, 0.05);
    transition: all 0.3s ease;
  }

  .summary-card-hover {
    transition: all 0.3s ease;
  }

  .summary-card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(1, 62, 55, 0.15);
  }

  .summary-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .summary-label {
    font-size: 14px;
    color: #6B7280;
    margin: 0;
    font-weight: 500;
  }

  .summary-value {
    font-size: 24px;
    font-weight: 700;
    color: #013E37;
    margin-top: 4px;
    margin: 4px 0 0 0;
  }

  .summary-value-pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  .summary-value-scale {
    animation: scaleIn 0.5s ease-out;
  }

  .clock-info {
    text-align: right;
  }

  .clock-label {
    font-size: 12px;
    color: #6B7280;
    margin: 0;
  }

  .clock-time {
    font-size: 15px;
    font-weight: 600;
    color: #013E37;
    margin: 0;
  }

  .clock-out-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(1, 62, 55, 0.08);
    animation: slideDown 0.3s ease-out;
  }

  .working-days {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }

  .working-days-label {
    font-size: 14px;
    color: #6B7280;
  }

  .working-days-value {
    font-size: 14px;
    font-weight: 600;
    color: #013E37;
  }

  .summary-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 8px;
  }

  .summary-stat {
    text-align: center;
    padding: 8px;
    border-radius: 8px;
    background-color: #FFF9E6;
    transition: all 0.3s ease;
  }

  .summary-stat-hover:hover {
    transform: scale(1.05);
  }

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    margin: 0;
  }

  .stat-label {
    font-size: 11px;
    color: #6B7280;
    margin: 4px 0 0 0;
    font-weight: 500;
  }

  /* Navigation */
  .navigation-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .navigation-buttons {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .nav-button {
    padding: 8px 16px;
    background-color: transparent;
    color: #013E37;
    border: 2px solid #013E37;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .nav-button:hover:not(:disabled) {
    background-color: #013E37;
    color: #FFEFB3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(1, 62, 55, 0.2);
  }

  .month-label {
    font-size: 18px;
    font-weight: 700;
    color: #013E37;
    min-width: 180px;
    text-align: center;
    animation: fadeIn 0.3s ease-out;
  }

  .today-button {
    padding: 8px 16px;
    background-color: #FFEFB3;
    color: #013E37;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .today-button:hover:not(:disabled) {
    background-color: #013E37;
    color: #FFEFB3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(1, 62, 55, 0.2);
  }

  /* Table */
  .table-card {
    background-color: #FFFFFF;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(1, 62, 55, 0.08);
    border: 1px solid rgba(1, 62, 55, 0.05);
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .table-card-hover:hover {
    box-shadow: 0 8px 30px rgba(1, 62, 55, 0.12);
  }

  .table-container {
    overflow-x: auto;
    padding: 4px;
  }

  .table-head {
    background-color: #FFF9E6;
  }

  .table-header-cell {
    color: #013E37;
    font-weight: 700;
    font-size: 14px;
    padding: 16px;
    border-bottom: 2px solid #013E37;
  }

  .table-row {
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(1, 62, 55, 0.05);
    animation: slideInRight 0.3s ease-out both;
  }

  .table-row-hover:hover {
    background-color: #FFF9E6;
  }

  .table-cell {
    padding: 16px;
    color: #1F2937;
    font-size: 14px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .status-badge-hover:hover {
    transform: scale(1.05);
  }

  .empty-state {
    text-align: center;
    padding: 48px 16px;
  }

  .empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #6B7280;
    animation: bounce 2s ease-in-out infinite;
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
      height: 0;
    }
    to {
      opacity: 1;
      transform: translateY(0);
      height: auto;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #FFF9E6;
    border-radius: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: #013E37;
    border-radius: 8px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #013E37;
    opacity: 0.8;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .attendance-header {
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
      align-items: stretch !important;
    }
    
    .navigation-buttons {
      width: 100% !important;
      justify-content: space-between !important;
    }
    
    .today-button {
      width: 100% !important;
    }

    .attendance-title {
      font-size: 28px !important;
    }
  }
  
  @media (max-width: 480px) {
    .attendance-container {
      padding: 16px !important;
    }
    
    .month-label {
      min-width: 100px !important;
      font-size: 14px !important;
    }
    
    .summary-stats {
      grid-template-columns: repeat(3, 1fr) !important;
    }

    .summary-card {
      padding: 16px !important;
    }

    .table-cell {
      padding: 12px !important;
      font-size: 13px !important;
    }

    .status-badge {
      padding: 4px 10px !important;
      font-size: 12px !important;
    }
  }
`;

export default Attendance;