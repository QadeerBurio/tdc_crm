// components/projects/TaskForm.jsx - COMPLETE FIXED VERSION

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
    // ✅ Set taskId if editing
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
      // ✅ Filter to only show active users
      users = users.filter(u => u.status !== 'inactive');
      console.log('📋 Team members fetched:', users.length);
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

    // ✅ Validation
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
      // ✅ CRITICAL FIX: Ensure both assignedTo and assignees are set
      const submitData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        projectId: formData.projectId || undefined,
        assignedTo: formData.assignedTo,
        assignees: [formData.assignedTo], // ✅ Always set assignees array
        reviewerId: formData.reviewerId || undefined,
        priority: formData.priority,
        status: formData.status,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : 0,
        deadline: formData.deadline || undefined,
        createdBy: user?._id
      };

      console.log('📋 Submitting task data:', submitData);
      console.log('👤 Created by:', user?._id);
      console.log('👤 Assigned to:', formData.assignedTo);

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

      console.log('✅ Task saved:', response.data);

      // ✅ After saving, immediately fetch the task to verify it was saved correctly
      if (response.data?.data?._id) {
        try {
          const verifyResponse = await axios.get(`${API_URL}/tasks/${response.data.data._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('🔍 Verified task:', verifyResponse.data);
          console.log('🔍 assignedTo:', verifyResponse.data.data?.assignedTo);
          console.log('🔍 assignees:', verifyResponse.data.data?.assignees);
        } catch (verifyErr) {
          console.error('Could not verify task:', verifyErr);
        }
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
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Task Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          style={styles.input}
          placeholder="Enter task title"
          disabled={loading}
          required
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          style={styles.textarea}
          placeholder="Enter task description..."
          rows={3}
          disabled={loading}
        />
      </div>

      <div style={styles.row}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Project</label>
          <select
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            style={styles.select}
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

        <div style={styles.formGroup}>
          <label style={styles.label}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={styles.select}
            disabled={loading}
          >
            <option value="Backlog">Backlog</option>
            <option value="In Progress">In Progress</option>
            <option value="Internal QA">Internal QA</option>
            <option value="Client Review">Client Review</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            style={styles.select}
            disabled={loading}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Estimated Hours</label>
          <input
            type="number"
            name="estimatedHours"
            value={formData.estimatedHours}
            onChange={handleChange}
            style={styles.input}
            placeholder="0"
            min="0"
            step="0.5"
            disabled={loading}
          />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Assigned To *</label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            style={styles.select}
            disabled={loading}
            required
          >
            <option value="">Select team member...</option>
            {teamMembers.map((member) => (
              <option key={member._id} value={member._id}>
                {member.firstName} {member.lastName} ({member.email}) - {member.role || 'Employee'}
              </option>
            ))}
          </select>
          {teamMembers.length === 0 && (
            <p style={styles.helperText}>No team members found. Please add users first.</p>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Reviewer</label>
          <select
            name="reviewerId"
            value={formData.reviewerId}
            onChange={handleChange}
            style={styles.select}
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

      <div style={styles.formGroup}>
        <label style={styles.label}>Deadline</label>
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          style={styles.input}
          disabled={loading}
        />
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.cancelButton}
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Saving...' : (initialData ? 'Update Task' : 'Create Task')}
        </button>
      </div>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  helperText: {
    fontSize: '12px',
    color: '#EF4444',
    marginTop: '4px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .cancel-button:hover:not(:disabled) { background-color: #F9FAFB !important; }
  .submit-button:hover:not(:disabled) { background-color: #2563EB !important; }
  .input:focus, .select:focus, .textarea:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  .cancel-button:disabled, .submit-button:disabled { opacity: 0.6; cursor: not-allowed; }
  @media (max-width: 768px) {
    .row { grid-template-columns: 1fr !important; }
    .actions { flex-direction: column !important; }
    .cancel-button, .submit-button { width: 100% !important; justify-content: center !important; }
  }
`;
document.head.appendChild(styleSheet);

export default TaskForm;