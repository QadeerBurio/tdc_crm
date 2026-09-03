// pages/projects/ProjectDetails.jsx - FULLY RESPONSIVE WITH PROPER FORM DISPLAY

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Edit, Trash2, Users, Calendar, Clock, DollarSign,
  CheckCircle, BarChart, Plus, Save, X, UserPlus, Briefcase,
  Target, TrendingUp, Award, MoreHorizontal, FileText, Tag, UserCheck,
  ChevronDown, AlertCircle
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
  const [activeSection, setActiveSection] = useState('basic');
  
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
  const [focusedField, setFocusedField] = useState(null);

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
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      let users = [];
      
      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          users = response.data.data;
        } else if (response.data.users && Array.isArray(response.data.users)) {
          users = response.data.users;
        } else if (Array.isArray(response.data)) {
          users = response.data;
        } else if (response.data.data && response.data.data.users) {
          users = response.data.data.users;
        } else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          users = response.data.data.data;
        } else {
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              users = response.data[key];
              break;
            }
          }
        }
      }
      
      setTeamMembers(users);
      
    } catch (err) {
      console.error('Error fetching team members:', err);
      toast.error('Failed to load team members.');
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
    if (!formData.projectName.trim()) {
      toast.error('Project name is required');
      return;
    }
    
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
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading project details...</p>
      </div>
    );
  }

  // Create mode render with modern modal-style design
  if (isCreateMode) {
    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Link to="/projects" style={styles.backButton}>
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 style={styles.title}>Create New Project</h1>
              <p style={styles.subtitle}>Fill in the details to create a new project</p>
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

        {/* Mobile Section Tabs */}
        <div style={styles.mobileTabs}>
          <button
            onClick={() => setActiveSection('basic')}
            style={{
              ...styles.mobileTab,
              ...(activeSection === 'basic' ? styles.mobileTabActive : {})
            }}
          >
            <FileText size={16} />
            Basic Info
          </button>
          <button
            onClick={() => setActiveSection('timeline')}
            style={{
              ...styles.mobileTab,
              ...(activeSection === 'timeline' ? styles.mobileTabActive : {})
            }}
          >
            <Clock size={16} />
            Timeline
          </button>
          <button
            onClick={() => setActiveSection('team')}
            style={{
              ...styles.mobileTab,
              ...(activeSection === 'team' ? styles.mobileTabActive : {})
            }}
          >
            <Users size={16} />
            Team
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateProject} style={styles.form}>
          <div style={styles.formGrid}>
            {/* Left Column - Basic Info */}
            <div style={{
              ...styles.formCard,
              ...(activeSection !== 'basic' ? styles.formCardHidden : {})
            }}>
              <div style={styles.cardHeader}>
                <FileText size={18} style={styles.cardHeaderIcon} />
                <h3 style={styles.cardTitle}>Basic Information</h3>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Project Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('projectName')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...styles.input,
                      ...(focusedField === 'projectName' ? styles.inputFocused : {})
                    }}
                    placeholder="Enter project name"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Tag size={14} style={styles.labelIcon} />
                    Project Type <span style={styles.required}>*</span>
                  </label>
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
                  <label style={styles.label}>
                    <Briefcase size={14} style={styles.labelIcon} />
                    Client
                  </label>
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
            <div style={{
              ...styles.formCard,
              ...(activeSection !== 'timeline' ? styles.formCardHidden : {})
            }}>
              <div style={styles.cardHeader}>
                <Clock size={18} style={styles.cardHeaderIcon} />
                <h3 style={styles.cardTitle}>Timeline & Budget</h3>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Calendar size={14} style={styles.labelIcon} />
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Calendar size={14} style={styles.labelIcon} />
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Select end date"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <DollarSign size={14} style={styles.labelIcon} />
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter budget amount"
                    min="0"
                    step="1000"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Clock size={14} style={styles.labelIcon} />
                    Estimated Hours
                  </label>
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
            <div style={{
              ...styles.formCard,
              ...(activeSection !== 'team' ? styles.formCardHidden : {})
            }}>
              <div style={styles.cardHeader}>
                <Users size={18} style={styles.cardHeaderIcon} />
                <h3 style={styles.cardTitle}>Team & Status</h3>
              </div>
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
                  <label style={styles.label}>
                    <UserCheck size={14} style={styles.labelIcon} />
                    Project Manager
                  </label>
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
                  <label style={styles.label}>
                    <Users size={14} style={styles.labelIcon} />
                    Team Members
                  </label>
                  <select
                    name="teamMembers"
                    multiple
                    value={formData.teamMembers}
                    onChange={handleTeamMembersChange}
                    style={{...styles.select, ...styles.selectMultiple}}
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
        </form>

        {/* Form Actions */}
        <div style={styles.formActions}>
          <button style={styles.cancelButtonLarge} onClick={() => navigate('/projects')}>
            Cancel
          </button>
          <button style={styles.submitButton} onClick={handleCreateProject} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div style={styles.submitSpinner} />
                Creating...
              </>
            ) : (
              <>
                <Save size={18} />
                Create Project
              </>
            )}
          </button>
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

  const getStatusColor = (status) => {
    const colors = {
      'Active': '#013E37',
      'Planning': '#3B82F6',
      'On Hold': '#F59E0B',
      'Completed': '#10B981',
      'Archived': '#6B7280',
    };
    return colors[status] || '#013E37';
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Active': { backgroundColor: '#FFEFB3', color: '#013E37' },
      'Planning': { backgroundColor: '#E8F0FE', color: '#1E40AF' },
      'On Hold': { backgroundColor: '#FEF3C7', color: '#92400E' },
      'Completed': { backgroundColor: '#D1FAE5', color: '#065F46' },
      'Archived': { backgroundColor: '#F3F4F6', color: '#374151' },
    };
    return styles[status] || styles.Active;
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
            <div style={styles.titleRow}>
              <h1 style={styles.title}>{project.projectName}</h1>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: getStatusStyle(project.status).backgroundColor,
                color: getStatusStyle(project.status).color,
              }}>
                {project.status || 'Planning'}
              </span>
            </div>
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
          <div style={styles.statIconWrapper}><Target size={20} color="#013E37" /></div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Progress</p>
            <p style={styles.statValue}>{project.completionPercentage || 0}%</p>
          </div>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${project.completionPercentage || 0}%`}} />
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapper}><CheckCircle size={20} color="#013E37" /></div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Tasks</p>
            <p style={styles.statValue}>{taskStats.completed}/{taskStats.total}</p>
          </div>
          <p style={styles.statSubtext}>
            {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}% Complete
          </p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapper}><DollarSign size={20} color="#013E37" /></div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Budget</p>
            <p style={styles.statValue}>{formatCurrency(project.budget || 0)}</p>
          </div>
          <p style={styles.statSubtext}>Est. Hours: {project.estimatedHours || 0}h</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapper}><Users size={20} color="#013E37" /></div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Team</p>
            <p style={styles.statValue}>{project.teamMembers?.length || 0}</p>
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
                  <div style={styles.teamMemberInfo}>
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
    padding: '24px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
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
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid #FFEFB3',
    borderTopColor: '#013E37',
    animation: 'spin 0.8s linear infinite',
  },
  notFoundContainer: {
    textAlign: 'center',
    padding: '48px 0',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
  },
  notFoundText: {
    color: '#013E37',
    marginBottom: '8px',
    opacity: 0.7,
  },
  notFoundLink: {
    color: '#013E37',
    textDecoration: 'none',
    fontWeight: '500',
  },
  // Header Styles
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  backButton: {
    padding: '8px',
    borderRadius: '10px',
    border: '1px solid #FFEFB3',
    cursor: 'pointer',
    background: '#FFFFFF',
    color: '#013E37',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.25s ease',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#013E37',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  subtitle: {
    fontSize: '15px',
    color: '#013E37',
    opacity: 0.7,
    margin: '4px 0 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  // Button Styles
  addTaskButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.2)',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#FFFFFF',
    color: '#013E37',
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#FFFFFF',
    color: '#013E37',
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.2)',
  },
  actionLink: {
    textDecoration: 'none',
  },
  // Mobile Tabs
  mobileTabs: {
    display: 'none',
    gap: '8px',
    marginBottom: '20px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  mobileTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#013E37',
    opacity: 0.6,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    whiteSpace: 'nowrap',
  },
  mobileTabActive: {
    opacity: 1,
    backgroundColor: '#FFEFB3',
    borderColor: '#013E37',
  },
  // Form Styles
  form: {
    marginTop: '8px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #FFEFB3',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(1, 62, 55, 0.04)',
    transition: 'all 0.3s ease',
  },
  formCardHidden: {
    display: 'block',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 24px',
    borderBottom: '1px solid #FFEFB3',
    backgroundColor: '#FFFDF5',
  },
  cardHeaderIcon: {
    color: '#013E37',
    opacity: 0.7,
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#013E37',
    margin: 0,
  },
  cardContent: {
    padding: '24px',
  },
  formGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#013E37',
    opacity: 0.8,
    marginBottom: '6px',
  },
  labelIcon: {
    opacity: 0.6,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#013E37',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.25s ease',
  },
  inputFocused: {
    borderColor: '#013E37',
    boxShadow: '0 0 0 3px rgba(1, 62, 55, 0.08)',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#013E37',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.25s ease',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23013E37' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '36px',
  },
  selectMultiple: {
    minHeight: '100px',
    backgroundImage: 'none',
    paddingRight: '14px',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#013E37',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'all 0.25s ease',
  },
  hint: {
    display: 'block',
    fontSize: '12px',
    color: '#013E37',
    opacity: 0.5,
    marginTop: '4px',
  },
  // Form Actions
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #FFEFB3',
  },
  cancelButtonLarge: {
    padding: '10px 28px',
    backgroundColor: '#FFFFFF',
    color: '#013E37',
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 28px',
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(1, 62, 55, 0.2)',
  },
  submitSpinner: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid #FFFFFF',
    borderTopColor: 'transparent',
    animation: 'spin 0.6s linear infinite',
  },
  // Stats Styles
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '16px 20px',
    border: '1px solid #FFEFB3',
    transition: 'all 0.25s ease',
    boxShadow: '0 2px 8px rgba(1, 62, 55, 0.04)',
  },
  statIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: '#FFEFB3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  statContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '13px',
    color: '#013E37',
    opacity: 0.7,
    margin: 0,
    fontWeight: '500',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#013E37',
    margin: '4px 0 0 0',
  },
  progressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: '#FFEFB3',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginTop: '12px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#013E37',
    borderRadius: '9999px',
    transition: 'width 0.6s ease',
  },
  statSubtext: {
    fontSize: '13px',
    color: '#013E37',
    opacity: 0.6,
    margin: '8px 0 0 0',
  },
  // Tabs Styles
  tabsContainer: {
    display: 'flex',
    gap: '4px',
    borderBottom: '2px solid #FFEFB3',
    marginBottom: '24px',
  },
  tabButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    background: 'transparent',
    transition: 'all 0.25s ease',
    color: '#013E37',
    opacity: 0.6,
  },
  tabButtonActive: {
    color: '#013E37',
    borderBottomColor: '#013E37',
    opacity: 1,
    fontWeight: '600',
  },
  tabButtonInactive: {
    color: '#013E37',
    opacity: 0.5,
  },
  // Tab Content
  tabCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #FFEFB3',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(1, 62, 55, 0.04)',
  },
  tabContent: {
    padding: '16px',
  },
  // Team List
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
    backgroundColor: '#FFFFFF',
    border: '1px solid #FFEFB3',
    borderRadius: '12px',
    transition: 'all 0.25s ease',
  },
  teamMemberAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
    flexShrink: 0,
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#013E37',
    margin: 0,
  },
  teamMemberPosition: {
    fontSize: '13px',
    color: '#013E37',
    opacity: 0.6,
    margin: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 0',
    color: '#013E37',
    opacity: 0.5,
  },
  // Modal Styles
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalText: {
    color: '#013E37',
    margin: 0,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  modalCancelButton: {
    padding: '8px 20px',
    backgroundColor: '#FFFFFF',
    color: '#013E37',
    border: '1px solid #FFEFB3',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  modalDeleteButton: {
    padding: '8px 20px',
    backgroundColor: '#013E37',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
};

// Add keyframe animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .back-button:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
    transform: translateX(-2px);
  }

  .add-task-button:hover:not(:disabled) {
    background-color: #025a50 !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(1, 62, 55, 0.25) !important;
  }

  .edit-button:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
  }

  .delete-button:hover:not(:disabled) {
    background-color: #025a50 !important;
  }

  .cancel-button:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
  }

  .create-button:hover:not(:disabled) {
    background-color: #025a50 !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(1, 62, 55, 0.25) !important;
  }

  .cancel-button-large:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
  }

  .submit-button:hover:not(:disabled) {
    background-color: #025a50 !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(1, 62, 55, 0.25) !important;
  }

  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(1, 62, 55, 0.08) !important;
  }

  .tab-button:hover:not(.tab-button-active) {
    opacity: 0.8 !important;
  }

  .team-member:hover {
    background-color: #FFEFB3 !important;
  }

  .modal-cancel-button:hover:not(:disabled) {
    background-color: #FFEFB3 !important;
  }

  .modal-delete-button:hover:not(:disabled) {
    background-color: #025a50 !important;
  }

  .input:focus, .select:focus, .textarea:focus {
    border-color: #013E37 !important;
    box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.08) !important;
  }

  .form-card:hover {
    box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06) !important;
  }

  .mobile-tab:hover {
    background-color: #FFEFB3 !important;
  }

  @media (max-width: 1024px) {
    .form-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .mobile-tabs {
      display: flex !important;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 16px !important;
    }
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .header-left {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .header-actions {
      width: 100% !important;
    }
    .header-actions button,
    .header-actions a {
      flex: 1 !important;
      justify-content: center !important;
    }
    .stats-grid {
      grid-template-columns: 1fr 1fr !important;
    }
    .form-grid {
      grid-template-columns: 1fr !important;
    }
    .form-card-hidden {
      display: none !important;
    }
    .form-card {
      display: block !important;
    }
    .title-row {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .form-actions {
      flex-direction: column !important;
    }
    .form-actions button {
      width: 100% !important;
      justify-content: center !important;
    }
    .mobile-tabs {
      display: flex !important;
    }
    .card-content {
      padding: 16px !important;
    }
    .card-header {
      padding: 12px 16px !important;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 12px !important;
    }
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    .stat-card {
      padding: 12px 16px !important;
    }
    .stat-value {
      font-size: 18px !important;
    }
    .title {
      font-size: 22px !important;
    }
    .header-actions {
      flex-direction: column !important;
    }
    .header-actions button,
    .header-actions a {
      width: 100% !important;
    }
    .mobile-tabs {
      gap: 6px !important;
    }
    .mobile-tab {
      flex: 1 !important;
      justify-content: center !important;
      padding: 8px 12px !important;
      font-size: 12px !important;
    }
    .modal-actions {
      flex-direction: column !important;
    }
    .modal-cancel-button,
    .modal-delete-button {
      width: 100% !important;
      justify-content: center !important;
    }
    .form-group {
      margin-bottom: 14px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ProjectDetails;