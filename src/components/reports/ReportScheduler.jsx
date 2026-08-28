import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, Clock, Users, Mail,
  Plus, Edit, Trash2, Eye,
  RefreshCw, X, Check, AlertCircle,
  ChevronDown, ChevronRight, Filter,
  Play, Pause, StopCircle
} from 'lucide-react';

const ReportScheduler = () => {
  const { api } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/reports/schedules');
      setSchedules(response.data.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/reports/schedules/${id}`, { 
        status: currentStatus === 'active' ? 'paused' : 'active' 
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  const deleteSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await api.delete(`/reports/schedules/${id}`);
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'biweekly': 'Bi-Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly'
    };
    return labels[frequency] || frequency;
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-700',
      'paused': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-blue-100 text-blue-700',
      'failed': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getNextRun = (schedule) => {
    // Simple calculation based on frequency
    const now = new Date();
    let next = new Date(now);
    switch (schedule.frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      default:
        next.setDate(next.getDate() + 1);
    }
    return next.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Report Scheduler</h3>
          <p className="text-sm text-gray-500">Schedule automated report generation</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchSchedules}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button 
            onClick={() => {
              setEditingSchedule(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Schedule
          </button>
        </div>
      </div>

      {/* Schedule List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="divide-y divide-gray-200">
          {schedules.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>No schedules found</p>
              <p className="text-sm">Create your first schedule</p>
            </div>
          ) : (
            schedules.map((schedule) => (
              <div 
                key={schedule._id} 
                className="hover:bg-gray-50 transition-colors"
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpand(schedule._id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Expand Icon */}
                    <div className="mt-1">
                      {expanded[schedule._id] ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium text-gray-800">{schedule.name}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                          {getFrequencyLabel(schedule.frequency)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-1">{schedule.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Next: {getNextRun(schedule)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {schedule.recipients?.length || 0} recipients
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Format: {schedule.format}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleStatus(schedule._id, schedule.status)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {schedule.status === 'active' ? (
                          <Pause className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Play className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button 
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={() => {
                          setEditingSchedule(schedule);
                          setShowModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        className="p-1 hover:bg-red-50 rounded"
                        onClick={() => deleteSchedule(schedule._id)}
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded[schedule._id] && (
                  <div className="px-4 pb-4 ml-8">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-xs font-medium text-gray-500">Schedule Details</h5>
                          <div className="mt-2 space-y-1 text-sm">
                            <p><span className="text-gray-500">Frequency:</span> {getFrequencyLabel(schedule.frequency)}</p>
                            <p><span className="text-gray-500">Time:</span> {schedule.time}</p>
                            <p><span className="text-gray-500">Format:</span> {schedule.format}</p>
                            <p><span className="text-gray-500">Last Run:</span> {schedule.lastRun || 'Never'}</p>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-gray-500">Recipients</h5>
                          <div className="mt-2 space-y-1">
                            {schedule.recipients?.map((recipient, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600">{recipient}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportScheduler;