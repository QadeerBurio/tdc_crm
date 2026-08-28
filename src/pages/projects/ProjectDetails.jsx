// pages/projects/ProjectDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Edit, Trash2, Users, Calendar, Clock, DollarSign,
  CheckCircle, BarChart, Plus, Save, X,
} from 'lucide-react';
import { Loader } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import TaskBoard from '../../components/projects/TaskBoard';
import TaskForm from '../../components/projects/TaskForm';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const isCreateMode = id === 'new' || !id;
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [actionLoading, setActionLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: 'SEO',
    clientId: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budget: '',
    estimatedHours: '',
    status: 'Planning',
    projectManager: '',
    teamMembers: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    if (isCreateMode) {
      setLoading(false);
      fetchClients();
      fetchTeamMembers();
    } else {
      fetchProject();
      fetchTasks();
      fetchClients();
      fetchTeamMembers();
    }
  }, [id]);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/crm/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setClients(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
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
      
      setTeamMembers(users);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setTeamMembers([]);
    }
  };

  const fetchProject = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setProject(response.data.data || response.data);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      toast.error('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${id}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setTasks(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeamMembersChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, teamMembers: selected }));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const projectData = {
        projectName: formData.projectName,
        projectType: formData.projectType,
        clientId: formData.clientId || undefined,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        status: formData.status,
        projectManager: formData.projectManager || undefined,
        teamMembers: formData.teamMembers || [],
      };

      const response = await axios.post(`${API_URL}/projects`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Project created successfully!');
      const newProject = response.data.data || response.data;
      navigate(`/projects/${newProject._id}`);
    } catch (err) {
      console.error('Error creating project:', err);
      toast.error(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error('Failed to delete project.');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleTaskCreated = () => {
    setShowTaskModal(false);
    fetchTasks();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader size="lg" />
      </div>
    );
  }

  // Create mode render
  if (isCreateMode) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Link to="/projects" style={styles.backButton}>
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 style={styles.title}>Create New Project</h1>
              <p style={styles.subtitle}>Add a new project to manage</p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.cancelButton} onClick={() => navigate('/projects')}>
              <X size={16} />
              Cancel
            </button>
            <button style={styles.createButton} onClick={handleCreateProject} disabled={isSubmitting}>
              <Save size={16} />
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </div>

        <div style={styles.formGrid}>
          {/* Left Column - Basic Info */}
          <div style={styles.formCard}>
            <h3 style={styles.cardTitle}>Basic Information</h3>
            <div style={styles.cardContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Project Name *</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter project name"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Project Type *</label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="SEO">SEO</option>
                  <option value="SMM">SMM</option>
                  <option value="PPC">PPC</option>
                  <option value="Content">Content</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Client (Optional)</label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="">No Client (Internal Project)</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.companyName || client.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="Enter project description..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Middle Column - Timeline & Budget */}
          <div style={styles.formCard}>
            <h3 style={styles.cardTitle}>Timeline & Budget</h3>
            <div style={styles.cardContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Budget ($)</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter budget amount"
                  min="0"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Estimated Hours</label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter estimated hours"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Team & Status */}
          <div style={styles.formCard}>
            <h3 style={styles.cardTitle}>Team & Status</h3>
            <div style={styles.cardContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Project Manager</label>
                <select
                  name="projectManager"
                  value={formData.projectManager}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="">Select Manager</option>
                  {teamMembers
                    .filter(m => ['manager', 'admin', 'super_admin'].includes(m.role))
                    .map(member => (
                      <option key={member._id} value={member._id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Team Members</label>
                <select
                  name="teamMembers"
                  multiple
                  value={formData.teamMembers}
                  onChange={handleTeamMembersChange}
                  style={{...styles.select, minHeight: '100px'}}
                >
                  {teamMembers
                    .filter(m => m.status !== 'inactive')
                    .map(member => (
                      <option key={member._id} value={member._id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                </select>
                <small style={styles.hint}>Hold Ctrl/Cmd to select multiple</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If project not found
  if (!project) {
    return (
      <div style={styles.notFoundContainer}>
        <p style={styles.notFoundText}>Project not found</p>
        <Link to="/projects" style={styles.notFoundLink}>Back to Projects</Link>
      </div>
    );
  }

  const taskStats = {
    total: tasks.length,
    backlog: tasks.filter(t => t.status === 'Backlog' || t.status === 'backlog').length,
    inProgress: tasks.filter(t => t.status === 'In Progress' || t.status === 'in_progress' || t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'Completed' || t.status === 'completed').length,
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/projects" style={styles.backButton}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={styles.title}>{project.projectName}</h1>
            <p style={styles.subtitle}>
              {project.clientId?.companyName || 'Internal Project'} • {project.projectType || 'N/A'}
            </p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.addTaskButton} onClick={() => setShowTaskModal(true)}>
            <Plus size={16} />
            Add Task
          </button>
          <Link to={`/projects/${id}/edit`} style={styles.actionLink}>
            <button style={styles.editButton}>
              <Edit size={16} />
              Edit
            </button>
          </Link>
          <button style={styles.deleteButton} onClick={() => setShowDeleteModal(true)}>
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Progress</p>
              <p style={styles.statValue}>{project.completionPercentage || 0}%</p>
            </div>
            <BarChart size={32} color="#3B82F6" />
          </div>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${project.completionPercentage || 0}%`}} />
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Tasks</p>
              <p style={styles.statValue}>{taskStats.completed}/{taskStats.total}</p>
            </div>
            <CheckCircle size={32} color="#22C55E" />
          </div>
          <p style={styles.statSubtext}>
            {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}% Complete
          </p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Budget</p>
              <p style={styles.statValue}>{formatCurrency(project.budget || 0)}</p>
            </div>
            <DollarSign size={32} color="#F59E0B" />
          </div>
          <p style={styles.statSubtext}>Est. Hours: {project.estimatedHours || 0}h</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div>
              <p style={styles.statLabel}>Team</p>
              <p style={styles.statValue}>{project.teamMembers?.length || 0}</p>
            </div>
            <Users size={32} color="#8B5CF6" />
          </div>
          <p style={styles.statSubtext}>
            PM: {project.projectManager?.firstName || 'Unassigned'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab('tasks')}
          style={{...styles.tabButton, ...(activeTab === 'tasks' ? styles.tabButtonActive : styles.tabButtonInactive)}}
        >
          Tasks ({taskStats.total})
        </button>
        <button
          onClick={() => setActiveTab('team')}
          style={{...styles.tabButton, ...(activeTab === 'team' ? styles.tabButtonActive : styles.tabButtonInactive)}}
        >
          Team
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'tasks' && (
        <div style={styles.tabCard}>
          <div style={styles.tabContent}>
            <TaskBoard projectId={id} />
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div style={styles.tabCard}>
          <div style={styles.tabContent}>
            <div style={styles.teamList}>
              {project.teamMembers?.map((member) => (
                <div key={member._id} style={styles.teamMember}>
                  <div style={styles.teamMemberAvatar}>
                    {member.firstName?.[0]}{member.lastName?.[0]}
                  </div>
                  <div>
                    <p style={styles.teamMemberName}>
                      {member.firstName} {member.lastName}
                    </p>
                    <p style={styles.teamMemberPosition}>
                      {member.position || 'Team Member'}
                    </p>
                  </div>
                </div>
              ))}
              {(!project.teamMembers || project.teamMembers.length === 0) && (
                <p style={styles.emptyState}>No team members assigned</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
      >
        <div style={styles.modalContent}>
          <p style={styles.modalText}>
            Are you sure you want to delete <strong>{project.projectName}</strong>? This action cannot be undone.
          </p>
          <div style={styles.modalActions}>
            <button
              style={styles.modalCancelButton}
              onClick={() => setShowDeleteModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              style={styles.modalDeleteButton}
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete Project'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Create Task"
        size="lg"
      >
        <TaskForm
          projectId={id}
          onSuccess={handleTaskCreated}
          onCancel={() => setShowTaskModal(false)}
        />
      </Modal>
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
  notFoundContainer: {
    textAlign: 'center',
    padding: '48px 0',
  },
  notFoundText: {
    color: '#6B7280',
    marginBottom: '8px',
  },
  notFoundLink: {
    color: '#3B82F6',
    textDecoration: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backButton: {
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    background: 'transparent',
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
    margin: '4px 0 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  addTaskButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  actionLink: {
    textDecoration: 'none',
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: '4px 0 0 0',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#E5E7EB',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginTop: '12px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: '9999px',
    transition: 'width 0.3s ease',
  },
  statSubtext: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '8px 0 0 0',
  },
  tabsContainer: {
    display: 'flex',
    gap: '4px',
    borderBottom: '1px solid #E5E7EB',
    marginBottom: '24px',
  },
  tabButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    background: 'transparent',
  },
  tabButtonActive: {
    color: '#3B82F6',
    borderBottomColor: '#3B82F6',
  },
  tabButtonInactive: {
    color: '#6B7280',
  },
  tabCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  tabContent: {
    padding: '16px',
  },
  teamList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  teamMember: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
  },
  teamMemberAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    fontSize: '14px',
  },
  teamMemberName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
  },
  teamMemberPosition: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 0',
    color: '#6B7280',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalText: {
    color: '#374151',
    margin: 0,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
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
  },
  modalDeleteButton: {
    padding: '8px 16px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    padding: '16px 24px',
    borderBottom: '1px solid #E5E7EB',
  },
  cardContent: {
    padding: '24px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  hint: {
    display: 'block',
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '4px',
  },
};

export default ProjectDetails;