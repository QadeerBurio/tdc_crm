// pages/projects/TaskDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Edit, Trash2, User, Clock, Calendar, CheckCircle, Send, Users, Tag
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import TaskForm from '../../components/projects/TaskForm';
import axios from 'axios';
import toast from 'react-hot-toast';

const TaskDetails = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setTask(response.data.data || response.data);
      }
    } catch (err) {
      console.error('Error fetching task:', err);
      if (err.response?.status === 403) {
        toast.error('You do not have permission to view this task');
        navigate('/tasks');
      } else {
        toast.error('Failed to load task details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (err) {
      toast.error('Failed to delete task');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/tasks/${id}/comments`, 
        { comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Comment added');
      setCommentText('');
      await fetchTask();
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleChecklist = async (itemIndex) => {
    if (!task.checklist || !task.checklist[itemIndex]) return;
    const updatedChecklist = [...task.checklist];
    updatedChecklist[itemIndex].completed = !updatedChecklist[itemIndex].completed;
    try {
      await axios.put(`${API_URL}/tasks/${id}/checklist`, 
        { checklist: updatedChecklist },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchTask();
    } catch (err) {
      toast.error('Failed to update checklist');
    }
  };

  // ✅ NEW: Handle status change
  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      await axios.patch(
        `${API_URL}/tasks/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Task status updated to ${newStatus}`);
      await fetchTask();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.message || 'Failed to update task status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Backlog': { backgroundColor: '#f3f4f6', color: '#374151' },
      'In Progress': { backgroundColor: '#dbeafe', color: '#1e40af' },
      'Internal QA': { backgroundColor: '#ede9fe', color: '#5b21b6' },
      'Client Review': { backgroundColor: '#fef3c7', color: '#92400e' },
      'Approved': { backgroundColor: '#ccfbf1', color: '#0f766e' },
      'Completed': { backgroundColor: '#d1fae5', color: '#065f46' },
    };
    return styles[status] || styles.Backlog;
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      'Urgent': { backgroundColor: '#fee2e2', color: '#991b1b' },
      'High': { backgroundColor: '#ffedd5', color: '#9a3412' },
      'Medium': { backgroundColor: '#fef3c7', color: '#92400e' },
      'Low': { backgroundColor: '#d1fae5', color: '#065f46' },
    };
    return styles[priority] || styles.Medium;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'N/A';
    const diff = Math.floor((new Date() - new Date(date)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  // ✅ Check if user can edit (admin/manager/super_admin or assigned to task)
  const canEdit = () => {
    const userRole = user?.role;
    const isAdmin = ['admin', 'super_admin', 'manager'].includes(userRole);
    if (isAdmin) return true;
    
    const userId = user?._id || user?.id;
    const isAssigned = task?.assignedTo?._id?.toString() === userId?.toString();
    const isInAssignees = task?.assignees?.some(a => a._id?.toString() === userId?.toString());
    const isCreator = task?.createdBy?._id?.toString() === userId?.toString();
    
    return isAssigned || isInAssignees || isCreator;
  };

  // ✅ Check if user can delete (admin/manager/super_admin only)
  const canDelete = () => {
    const userRole = user?.role;
    return ['admin', 'super_admin', 'manager'].includes(userRole);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p>Loading task...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div style={styles.notFoundContainer}>
        <p>Task not found</p>
        <Link to="/tasks" style={styles.notFoundLink}>Back to Tasks</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/tasks" style={styles.backButton}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={styles.title}>{task.title}</h1>
            <div style={styles.metaContainer}>
              <span style={{...styles.statusBadge, ...getStatusStyle(task.status)}}>
                {task.status || 'Backlog'}
              </span>
              <span style={{...styles.priorityBadge, ...getPriorityStyle(task.priority)}}>
                {task.priority || 'Medium'}
              </span>
              <span style={styles.projectName}>
                {task.projectId?.projectName || 'No Project'}
              </span>
              {task.taskId && (
                <span style={styles.taskIdBadge}>
                  #{task.taskId}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={styles.headerActions}>
          {/* ✅ Status Dropdown - Available to all users with access */}
          <div style={styles.statusDropdownContainer}>
            <select
              value={task.status || 'Backlog'}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={styles.statusDropdown}
              disabled={actionLoading || !canEdit()}
              className="status-dropdown"
            >
              <option value="Backlog">📋 Backlog</option>
              <option value="In Progress">🔄 In Progress</option>
              <option value="Internal QA">🔍 Internal QA</option>
              <option value="Client Review">👀 Client Review</option>
              <option value="Approved">✅ Approved</option>
              <option value="Completed">🎉 Completed</option>
            </select>
          </div>
          
          {/* ✅ Edit button - Only for users with edit permission */}
          {canEdit() && (
            <button style={styles.editButton} onClick={() => setShowEditModal(true)}>
              <Edit size={16} /> Edit
            </button>
          )}
          
          {/* ✅ Delete button - Only for admin/manager/super_admin */}
          {canDelete() && (
            <button style={styles.deleteButton} onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.mainContent}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Description</h3>
            </div>
            <div style={styles.cardContent}>
              <p style={styles.descriptionText}>
                {task.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {task.checklist && task.checklist.length > 0 && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Checklist</h3>
              </div>
              <div style={styles.cardContent}>
                {task.checklist.map((item, index) => (
                  <div key={index} style={styles.checklistItem}>
                    <input
                      type="checkbox"
                      checked={item.completed || false}
                      onChange={() => handleToggleChecklist(index)}
                      style={styles.checkbox}
                      disabled={!canEdit()}
                    />
                    <span style={{...styles.checklistText, ...(item.completed ? styles.checklistCompleted : {})}}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Comments</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.commentsContainer}>
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((comment, index) => (
                    <div key={index} style={styles.commentItem}>
                      <div style={styles.commentAvatar}>
                        {comment.user?.firstName?.[0] || '?'}
                      </div>
                      <div style={styles.commentContent}>
                        <div style={styles.commentHeader}>
                          <span style={styles.commentUser}>
                            {comment.user?.firstName} {comment.user?.lastName}
                          </span>
                          <span style={styles.commentTime}>
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p style={styles.commentText}>{comment.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={styles.emptyComments}>No comments yet</p>
                )}
                {canEdit() && (
                  <div style={styles.addCommentContainer}>
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      style={styles.commentInput}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      disabled={submitting}
                      className="comment-input"
                    />
                    <button 
                      style={styles.postButton}
                      onClick={handleAddComment}
                      disabled={submitting || !commentText.trim()}
                      className="post-button"
                    >
                      <Send size={16} /> Post
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.sidebar}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Details</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.detailItem}>
                <User size={16} style={styles.detailIcon} />
                <div>
                  <p style={styles.detailLabel}>Assigned To</p>
                  <p style={styles.detailValue}>
                    {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}
                  </p>
                </div>
              </div>
              <div style={styles.detailItem}>
                <Users size={16} style={styles.detailIcon} />
                <div>
                  <p style={styles.detailLabel}>Reviewer</p>
                  <p style={styles.detailValue}>
                    {task.reviewerId ? `${task.reviewerId.firstName} ${task.reviewerId.lastName}` : 'Not assigned'}
                  </p>
                </div>
              </div>
              <div style={styles.detailItem}>
                <Clock size={16} style={styles.detailIcon} />
                <div>
                  <p style={styles.detailLabel}>Estimated Hours</p>
                  <p style={styles.detailValue}>{task.estimatedHours || 0}h</p>
                </div>
              </div>
              <div style={styles.detailItem}>
                <Calendar size={16} style={styles.detailIcon} />
                <div>
                  <p style={styles.detailLabel}>Deadline</p>
                  <p style={styles.detailValue}>{formatDate(task.deadline)}</p>
                </div>
              </div>
              <div style={styles.detailItem}>
                <Tag size={16} style={styles.detailIcon} />
                <div>
                  <p style={styles.detailLabel}>Tags</p>
                  <div style={styles.tagsContainer}>
                    {task.tags && task.tags.length > 0 ? (
                      task.tags.map((tag, index) => (
                        <span key={index} style={styles.tagItem}>{tag}</span>
                      ))
                    ) : (
                      <span style={styles.noTags}>No tags</span>
                    )}
                  </div>
                </div>
              </div>
              {task.createdBy && (
                <div style={styles.detailItem}>
                  <User size={16} style={styles.detailIcon} />
                  <div>
                    <p style={styles.detailLabel}>Created By</p>
                    <p style={styles.detailValue}>
                      {task.createdBy.firstName} {task.createdBy.lastName}
                    </p>
                  </div>
                </div>
              )}
              {task.createdAt && (
                <div style={styles.detailItem}>
                  <Calendar size={16} style={styles.detailIcon} />
                  <div>
                    <p style={styles.detailLabel}>Created At</p>
                    <p style={styles.detailValue}>{formatDate(task.createdAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Task"
        size="lg"
      >
        <TaskForm
          initialData={task}
          onSuccess={() => {
            setShowEditModal(false);
            fetchTask();
          }}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Task"
      >
        <div style={styles.modalContent}>
          <p style={styles.modalText}>
            Are you sure you want to delete <strong>{task.title}</strong>?
          </p>
          <div style={styles.modalActions}>
            <button
              style={styles.modalCancelButton}
              onClick={() => setShowDeleteModal(false)}
              disabled={actionLoading}
              className="modal-cancel-button"
            >
              Cancel
            </button>
            <button
              style={styles.modalDeleteButton}
              onClick={handleDelete}
              disabled={actionLoading}
              className="modal-delete-button"
            >
              {actionLoading ? 'Deleting...' : 'Delete Task'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  container: { 
    padding: '24px', 
    maxWidth: '1400px', 
    margin: '0 auto',
    backgroundColor: '#f9fafb',
    minHeight: '100vh'
  },
  loadingContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '64vh', 
    gap: '16px' 
  },
  spinner: { 
    width: '40px', 
    height: '40px', 
    borderRadius: '50%', 
    border: '3px solid #E5E7EB', 
    borderTopColor: '#3B82F6', 
    animation: 'spin 0.8s linear infinite' 
  },
  notFoundContainer: { 
    textAlign: 'center', 
    padding: '48px 0' 
  },
  notFoundLink: { 
    color: '#3B82F6', 
    textDecoration: 'none' 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '24px', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  headerLeft: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px' 
  },
  backButton: { 
    padding: '8px', 
    borderRadius: '8px', 
    border: 'none', 
    cursor: 'pointer', 
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: { 
    fontSize: '24px', 
    fontWeight: '700', 
    color: '#111827', 
    margin: 0 
  },
  metaContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    marginTop: '4px', 
    flexWrap: 'wrap' 
  },
  statusBadge: { 
    display: 'inline-flex', 
    padding: '4px 8px', 
    borderRadius: '9999px', 
    fontSize: '12px', 
    fontWeight: '500' 
  },
  priorityBadge: { 
    display: 'inline-flex', 
    padding: '4px 8px', 
    borderRadius: '9999px', 
    fontSize: '12px', 
    fontWeight: '500' 
  },
  projectName: { 
    fontSize: '14px', 
    color: '#6B7280' 
  },
  taskIdBadge: {
    display: 'inline-flex',
    padding: '4px 8px',
    backgroundColor: '#E5E7EB',
    color: '#374151',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500'
  },
  headerActions: { 
    display: 'flex', 
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  statusDropdownContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusDropdown: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '150px',
    transition: 'border-color 0.2s, box-shadow 0.2s'
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
    cursor: 'pointer' 
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
    cursor: 'pointer' 
  },
  contentGrid: { 
    display: 'grid', 
    gridTemplateColumns: '2fr 1fr', 
    gap: '24px' 
  },
  mainContent: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '24px' 
  },
  sidebar: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '24px' 
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: '12px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
    overflow: 'hidden' 
  },
  cardHeader: { 
    padding: '16px 20px', 
    borderBottom: '1px solid #F3F4F6' 
  },
  cardTitle: { 
    fontSize: '16px', 
    fontWeight: '600', 
    color: '#111827', 
    margin: 0 
  },
  cardContent: { 
    padding: '16px 20px' 
  },
  descriptionText: { 
    color: '#374151', 
    margin: 0,
    whiteSpace: 'pre-wrap'
  },
  checklistItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '8px', 
    borderRadius: '6px' 
  },
  checkbox: { 
    width: '16px', 
    height: '16px', 
    cursor: 'pointer' 
  },
  checklistText: { 
    flex: 1, 
    color: '#374151' 
  },
  checklistCompleted: { 
    textDecoration: 'line-through', 
    color: '#9CA3AF' 
  },
  commentsContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px' 
  },
  commentItem: { 
    display: 'flex', 
    gap: '12px', 
    paddingBottom: '12px', 
    borderBottom: '1px solid #F3F4F6' 
  },
  commentAvatar: { 
    width: '32px', 
    height: '32px', 
    borderRadius: '50%', 
    backgroundColor: '#3B82F6', 
    color: '#FFFFFF', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '14px', 
    fontWeight: '500', 
    flexShrink: 0 
  },
  commentContent: { 
    flex: 1 
  },
  commentHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px' 
  },
  commentUser: { 
    fontSize: '14px', 
    fontWeight: '500', 
    color: '#111827' 
  },
  commentTime: { 
    fontSize: '12px', 
    color: '#6B7280' 
  },
  commentText: { 
    fontSize: '14px', 
    color: '#374151', 
    marginTop: '4px', 
    margin: '4px 0 0 0' 
  },
  emptyComments: { 
    textAlign: 'center', 
    padding: '16px 0', 
    color: '#6B7280' 
  },
  addCommentContainer: { 
    display: 'flex', 
    gap: '8px', 
    marginTop: '8px' 
  },
  commentInput: { 
    flex: 1, 
    padding: '8px 12px', 
    border: '1px solid #D1D5DB', 
    borderRadius: '8px', 
    fontSize: '14px', 
    outline: 'none' 
  },
  postButton: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '4px', 
    padding: '8px 16px', 
    backgroundColor: '#3B82F6', 
    color: '#FFFFFF', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '14px', 
    fontWeight: '500', 
    cursor: 'pointer' 
  },
  detailItem: { 
    display: 'flex', 
    alignItems: 'flex-start', 
    gap: '12px', 
    padding: '8px 0', 
    borderBottom: '1px solid #F3F4F6' 
  },
  detailIcon: { 
    color: '#9CA3AF', 
    marginTop: '2px', 
    flexShrink: 0 
  },
  detailLabel: { 
    fontSize: '12px', 
    color: '#6B7280', 
    margin: 0 
  },
  detailValue: { 
    fontSize: '14px', 
    color: '#111827', 
    margin: 0 
  },
  tagsContainer: { 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: '4px', 
    marginTop: '4px' 
  },
  tagItem: { 
    display: 'inline-flex', 
    padding: '2px 8px', 
    backgroundColor: '#F3F4F6', 
    color: '#374151', 
    borderRadius: '9999px', 
    fontSize: '12px', 
    fontWeight: '500' 
  },
  noTags: { 
    fontSize: '14px', 
    color: '#6B7280' 
  },
  modalContent: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px' 
  },
  modalText: { 
    color: '#374151', 
    margin: 0 
  },
  modalActions: { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '8px' 
  },
  modalCancelButton: { 
    padding: '8px 16px', 
    backgroundColor: 'transparent', 
    color: '#374151', 
    border: '1px solid #D1D5DB', 
    borderRadius: '6px', 
    fontSize: '14px', 
    fontWeight: '500', 
    cursor: 'pointer' 
  },
  modalDeleteButton: { 
    padding: '8px 16px', 
    backgroundColor: '#EF4444', 
    color: '#FFFFFF', 
    border: 'none', 
    borderRadius: '6px', 
    fontSize: '14px', 
    fontWeight: '500', 
    cursor: 'pointer' 
  },
};

// Inject CSS styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { 
    from { transform: rotate(0deg); } 
    to { transform: rotate(360deg); } 
  }
  
  .back-button:hover { 
    background-color: #F3F4F6 !important; 
  }
  
  .status-dropdown:hover {
    border-color: #3B82F6 !important;
  }
  .status-dropdown:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  .status-dropdown:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .edit-button:hover:not(:disabled) { 
    background-color: #F9FAFB !important; 
  }
  
  .delete-button:hover:not(:disabled) { 
    background-color: #DC2626 !important; 
  }
  
  .checklist-item:hover { 
    background-color: #F9FAFB !important; 
  }
  
  .comment-input:focus { 
    border-color: #3B82F6 !important; 
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important; 
  }
  
  .post-button:hover:not(:disabled) { 
    background-color: #2563EB !important; 
  }
  
  .modal-cancel-button:hover:not(:disabled) { 
    background-color: #F9FAFB !important; 
  }
  
  .modal-delete-button:hover:not(:disabled) { 
    background-color: #DC2626 !important; 
  }
  
  .post-button:disabled, 
  .modal-delete-button:disabled,
  .edit-button:disabled,
  .delete-button:disabled { 
    opacity: 0.6; 
    cursor: not-allowed; 
  }
  
  @media (max-width: 1024px) { 
    .content-grid { 
      grid-template-columns: 1fr !important; 
    } 
  }
  
  @media (max-width: 768px) {
    .header { 
      flex-direction: column !important; 
      align-items: stretch !important; 
    }
    .header-left { 
      flex-direction: column !important; 
      align-items: flex-start !important; 
    }
    .header-actions { 
      width: 100% !important; 
      flex-direction: column !important;
    }
    .status-dropdown-container {
      width: 100% !important;
    }
    .status-dropdown {
      width: 100% !important;
    }
    .edit-button, 
    .delete-button { 
      width: 100% !important; 
      justify-content: center !important; 
    }
    .add-comment-container { 
      flex-direction: column !important; 
    }
    .post-button { 
      width: 100% !important; 
      justify-content: center !important; 
    }
  }
  
  @media (max-width: 480px) {
    .container { 
      padding: 16px !important; 
    }
    .modal-actions { 
      flex-direction: column !important; 
    }
    .modal-cancel-button, 
    .modal-delete-button { 
      width: 100% !important; 
      justify-content: center !important; 
    }
  }
`;
document.head.appendChild(styleSheet);

export default TaskDetails;