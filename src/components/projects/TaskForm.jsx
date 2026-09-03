// components/projects/TaskForm.jsx - MODERN MODAL DESIGN LIKE SEGMENTS

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Check, Users, Clock, Flag, Calendar, FileText, Tag, User, Briefcase, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TaskForm = ({ initialData = null, projectId = null, onSuccess, onCancel }) => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [taskId, setTaskId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    projectId: initialData?.projectId?._id || projectId || '',
    assignedTo: initialData?.assignedTo?._id || '',
    reviewerId: initialData?.reviewerId?._id || '',
    priority: initialData?.priority || 'Medium',
    status: initialData?.status || 'Backlog',
    estimatedHours: initialData?.estimatedHours || '',
    deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
    if (initialData?._id) {
      setTaskId(initialData._id);
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`, {
        params: { limit: 100 },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        const projectsData = response.data.data || [];
        setProjects(projectsData);
        
        if (formData.projectId) {
          const project = projectsData.find(p => p._id === formData.projectId);
          setSelectedProject(project);
        }
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      toast.error('Failed to load projects');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let users = [];
      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          users = response.data.data;
        } else if (response.data.users && Array.isArray(response.data.users)) {
          users = response.data.users;
        } else if (Array.isArray(response.data)) {
          users = response.data;
        }
      }
      users = users.filter(u => u.status !== 'inactive');
      setTeamMembers(users);
    } catch (err) {
      console.error('Error fetching team members:', err);
      toast.error('Failed to load team members');
      setTeamMembers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'projectId') {
      const project = projects.find(p => p._id === value);
      setSelectedProject(project);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.title.trim()) {
      toast.error('Task title is required');
      setLoading(false);
      return;
    }

    if (!formData.assignedTo) {
      toast.error('Please assign this task to someone');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        projectId: formData.projectId || undefined,
        assignedTo: formData.assignedTo,
        assignees: [formData.assignedTo],
        reviewerId: formData.reviewerId || undefined,
        priority: formData.priority,
        status: formData.status,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : 0,
        deadline: formData.deadline || undefined,
        createdBy: user?._id
      };

      let response;
      const url = `${API_URL}/tasks`;
      
      if (initialData?._id) {
        response = await axios.put(`${url}/${initialData._id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Task updated successfully');
      } else {
        response = await axios.post(url, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Task created successfully');
      }

      if (onSuccess) {
        onSuccess(response.data.data || response.data);
      }
    } catch (err) {
      console.error('Error saving task:', err);
      let errorMsg = 'Failed to save task';
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-container">
      <form onSubmit={handleSubmit} className="task-form">
        {/* Title */}
        <div className="task-form-group">
          <label className="task-form-label">
            <FileText className="task-form-label-icon" />
            Task Title <span className="task-form-required">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="task-form-input"
            placeholder="Enter task title"
            disabled={loading}
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="task-form-group">
          <label className="task-form-label">
            <FileText className="task-form-label-icon" />
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="task-form-textarea"
            placeholder="Enter task description..."
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Row: Project & Status */}
        <div className="task-form-row">
          <div className="task-form-group">
            <label className="task-form-label">
              <Briefcase className="task-form-label-icon" />
              Project
            </label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className="task-form-select"
              disabled={loading || !!projectId}
            >
              <option value="">Select project...</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.projectName}
                </option>
              ))}
            </select>
          </div>

          <div className="task-form-group">
            <label className="task-form-label">
              <Tag className="task-form-label-icon" />
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="task-form-select"
              disabled={loading}
            >
              <option value="Backlog">📋 Backlog</option>
              <option value="In Progress">🔄 In Progress</option>
              <option value="Internal QA">🔍 Internal QA</option>
              <option value="Client Review">👀 Client Review</option>
              <option value="Approved">✅ Approved</option>
              <option value="Completed">🎉 Completed</option>
            </select>
          </div>
        </div>

        {/* Row: Priority & Hours */}
        <div className="task-form-row">
          <div className="task-form-group">
            <label className="task-form-label">
              <Flag className="task-form-label-icon" />
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="task-form-select"
              disabled={loading}
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🟠 High</option>
              <option value="Urgent">🔴 Urgent</option>
            </select>
          </div>

          <div className="task-form-group">
            <label className="task-form-label">
              <Clock className="task-form-label-icon" />
              Estimated Hours
            </label>
            <input
              type="number"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={handleChange}
              className="task-form-input"
              placeholder="0"
              min="0"
              step="0.5"
              disabled={loading}
            />
          </div>
        </div>

        {/* Row: Assigned To & Reviewer */}
        <div className="task-form-row">
          <div className="task-form-group">
            <label className="task-form-label">
              <User className="task-form-label-icon" />
              Assigned To <span className="task-form-required">*</span>
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="task-form-select"
              disabled={loading}
              required
            >
              <option value="">Select team member...</option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.firstName} {member.lastName} ({member.role || 'Employee'})
                </option>
              ))}
            </select>
            {teamMembers.length === 0 && (
              <p className="task-form-helper">No team members found. Please add users first.</p>
            )}
          </div>

          <div className="task-form-group">
            <label className="task-form-label">
              <Users className="task-form-label-icon" />
              Reviewer
            </label>
            <select
              name="reviewerId"
              value={formData.reviewerId}
              onChange={handleChange}
              className="task-form-select"
              disabled={loading}
            >
              <option value="">No reviewer</option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Deadline */}
        <div className="task-form-group">
          <label className="task-form-label">
            <Calendar className="task-form-label-icon" />
            Deadline
          </label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="task-form-input"
            disabled={loading}
          />
        </div>

        {/* Actions */}
        <div className="task-form-actions">
          <button
            type="button"
            className="task-form-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="task-form-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="task-form-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <Check className="task-form-submit-icon" />
                {initialData ? 'Update Task' : 'Create Task'}
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .task-form-container {
          padding: 0;
          max-width: 100%;
        }

        .task-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .task-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: taskFadeIn 0.4s ease forwards;
          opacity: 0;
        }
        .task-form-group:nth-child(1) { animation-delay: 0.05s; }
        .task-form-group:nth-child(2) { animation-delay: 0.1s; }
        .task-form-group:nth-child(3) { animation-delay: 0.15s; }
        .task-form-group:nth-child(4) { animation-delay: 0.2s; }
        .task-form-group:nth-child(5) { animation-delay: 0.25s; }
        .task-form-group:nth-child(6) { animation-delay: 0.3s; }
        .task-form-group:nth-child(7) { animation-delay: 0.35s; }

        .task-form-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #013E37;
        }

        .task-form-label-icon {
          width: 14px;
          height: 14px;
          opacity: 0.6;
        }

        .task-form-required {
          color: #EF4444;
        }

        .task-form-input,
        .task-form-select,
        .task-form-textarea {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
          color: #013E37;
        }

        .task-form-input:focus,
        .task-form-select:focus,
        .task-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.08);
          transform: scale(1.01);
        }

        .task-form-input::placeholder,
        .task-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.4;
        }

        .task-form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .task-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .task-form-helper {
          font-size: 12px;
          color: #EF4444;
          margin-top: 4px;
        }

        .task-form-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #FFEFB3;
          margin-top: 4px;
        }

        .task-form-cancel {
          padding: 8px 16px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: transparent;
          color: #013E37;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .task-form-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
          transform: scale(1.02);
        }

        .task-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .task-form-submit {
          padding: 8px 20px;
          background: #013E37;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.2);
        }

        .task-form-submit:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }

        .task-form-submit:active:not(:disabled) {
          transform: scale(0.95);
        }

        .task-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .task-form-submit-icon {
          width: 16px;
          height: 16px;
        }

        .task-form-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: taskSpin 0.8s linear infinite;
        }

        @keyframes taskSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes taskFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .task-form-row {
            grid-template-columns: 1fr;
          }
          .task-form-actions {
            flex-direction: column-reverse;
          }
          .task-form-cancel,
          .task-form-submit {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .task-form-container {
            padding: 0;
          }
          .task-form-group {
            margin-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskForm;