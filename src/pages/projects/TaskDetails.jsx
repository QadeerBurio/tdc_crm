// pages/projects/TaskDetails.jsx - MODERN DESIGN WITH YOUR COLOR PALETTE

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Edit, Trash2, User, Clock, Calendar, CheckCircle, Send, Users, Tag,
  Flag, MessageSquare, Paperclip, AlertCircle, MoreHorizontal
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
      'Backlog': { backgroundColor: '#F3F4F6', color: '#374151' },
      'In Progress': { backgroundColor: '#DBEAFE', color: '#1E40AF' },
      'Internal QA': { backgroundColor: '#EDE9FE', color: '#5B21B6' },
      'Client Review': { backgroundColor: '#FEF3C7', color: '#92400E' },
      'Approved': { backgroundColor: '#CCFBF1', color: '#0F766E' },
      'Completed': { backgroundColor: '#D1FAE5', color: '#065F46' },
    };
    return styles[status] || styles.Backlog;
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      'Urgent': { backgroundColor: '#013E37', color: '#FFFFFF' },
      'High': { backgroundColor: '#FEF3C7', color: '#92400E' },
      'Medium': { backgroundColor: '#FFEFB3', color: '#013E37' },
      'Low': { backgroundColor: '#D1FAE5', color: '#065F46' },
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

  const canDelete = () => {
    const userRole = user?.role;
    return ['admin', 'super_admin', 'manager'].includes(userRole);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading task details...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div style={styles.notFoundContainer}>
        <p style={styles.notFoundText}>Task not found</p>
        <Link to="/tasks" style={styles.notFoundLink}>Back to Tasks</Link>
      </div>
    );
  }

  const completedChecklist = task.checklist?.filter(item => item.completed).length || 0;
  const totalChecklist = task.checklist?.length || 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/tasks" style={styles.backButton}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div style={styles.titleRow}>
              <h1 style={styles.title}>{task.title}</h1>
              {task.taskId && (
                <span style={styles.taskIdBadge}>
                  #{task.taskId}
                </span>
              )}
            </div>
            <div style={styles.metaContainer}>
              <span style={{...styles.statusBadge, ...getStatusStyle(task.status)}}>
                {task.status || 'Backlog'}
              </span>
              <span style={{...styles.priorityBadge, ...getPriorityStyle(task.priority)}}>
                <Flag size={12} style={styles.badgeIcon} />
                {task.priority || 'Medium'}
              </span>
              <span style={styles.projectName}>
                {task.projectId?.projectName || 'No Project'}
              </span>
            </div>
          </div>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.statusDropdownContainer}>
            <select
              value={task.status || 'Backlog'}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={styles.statusDropdown}
              disabled={actionLoading || !canEdit()}
            >
              <option value="Backlog">📋 Backlog</option>
              <option value="In Progress">🔄 In Progress</option>
              <option value="Internal QA">🔍 Internal QA</option>
              <option value="Client Review">👀 Client Review</option>
              <option value="Approved">✅ Approved</option>
              <option value="Completed">🎉 Completed</option>
            </select>
          </div>
          
          {canEdit() && (
            <button style={styles.editButton} onClick={() => setShowEditModal(true)}>
              <Edit size={16} /> Edit
            </button>
          )}
          
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
                <div style={styles.cardHeaderWithCount}>
                  <h3 style={styles.cardTitle}>Checklist</h3>
                  <span style={styles.checklistCount}>
                    {completedChecklist}/{totalChecklist} done
                  </span>
                </div>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.checklistProgress}>
                  <div style={styles.checklistProgressBar}>
                    <div style={{
                      ...styles.checklistProgressFill,
                      width: totalChecklist > 0 ? `${(completedChecklist / totalChecklist) * 100}%` : '0%'
                    }} />
                  </div>
                </div>
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
              <h3 style={styles.cardTitle}>
                <MessageSquare size={16} style={styles.cardIcon} />
                Comments
              </h3>
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
                    />
                    <button 
                      style={styles.postButton}
                      onClick={handleAddComment}
                      disabled={submitting || !commentText.trim()}
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
                <div style={styles.detailIconWrapper}>
                  <User size={16} style={styles.detailIcon} />
                </div>
                <div>
                  <p style={styles.detailLabel}>Assigned To</p>
                  <p style={styles.detailValue}>
                    {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}
                  </p>
                </div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailIconWrapper}>
                  <Users size={16} style={styles.detailIcon} />
                </div>
                <div>
                  <p style={styles.detailLabel}>Reviewer</p>
                  <p style={styles.detailValue}>
                    {task.reviewerId ? `${task.reviewerId.firstName} ${task.reviewerId.lastName}` : 'Not assigned'}
                  </p>
                </div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailIconWrapper}>
                  <Clock size={16} style={styles.detailIcon} />
                </div>
                <div>
                  <p style={styles.detailLabel}>Estimated Hours</p>
                  <p style={styles.detailValue}>{task.estimatedHours || 0}h</p>
                </div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailIconWrapper}>
                  <Calendar size={16} style={styles.detailIcon} />
                </div>
                <div>
                  <p style={styles.detailLabel}>Deadline</p>
                  <p style={styles.detailValue}>{formatDate(task.deadline)}</p>
                </div>
              </div>
              {task.tags && task.tags.length > 0 && (
                <div style={styles.detailItem}>
                  <div style={styles.detailIconWrapper}>
                    <Tag size={16} style={styles.detailIcon} />
                  </div>
                  <div>
                    <p style={styles.detailLabel}>Tags</p>
                    <div style={styles.tagsContainer}>
                      {task.tags.map((tag, index) => (
                        <span key={index} style={styles.tagItem}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {task.createdBy && (
                <div style={styles.detailItem}>
                  <div style={styles.detailIconWrapper}>
                    <User size={16} style={styles.detailIcon} />
                  </div>
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
                  <div style={styles.detailIconWrapper}>
                    <Calendar size={16} style={styles.detailIcon} />
                  </div>
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
          <div style={styles.modalIconWrapper}>
            <AlertCircle size={40} style={styles.modalIcon} />
          </div>
          <h3 style={styles.modalTitle}>Delete Task?</h3>
          <p style={styles.modalText}>
            Are you sure you want to delete <strong>“{task.title}”</strong>?
          </p>
          <p style={styles.modalSubtext}>
            This action cannot be undone. All comments and progress will be permanently removed.
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
    gap: '16px' 
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
    animation: 'spin 0.8s linear infinite' 
  },
  notFoundContainer: { 
    textAlign: 'center', 
    padding: '48px 0',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
  },
  notFoundText: {
    color: '#013E37',
    opacity: 0.7,
    marginBottom: '8px',
  },
  notFoundLink: { 
    color: '#013E37', 
    textDecoration: 'none',
    fontWeight: '500',
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '28px', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  headerLeft: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px' 
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
    fontSize: '24px', 
    fontWeight: '700', 
    color: '#013E37', 
    margin: 0,
    letterSpacing: '-0.02em',
  },
  taskIdBadge: {
    display: 'inline-flex',
    padding: '4px 12px',
    backgroundColor: '#FFEFB3',
    color: '#013E37',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
  },
  metaContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginTop: '6px', 
    flexWrap: 'wrap' 
  },
  statusBadge: { 
    display: 'inline-flex', 
    padding: '4px 12px', 
    borderRadius: '8px', 
    fontSize: '12px', 
    fontWeight: '500' 
  },
  priorityBadge: { 
    display: 'inline-flex', 
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px', 
    borderRadius: '8px', 
    fontSize: '12px', 
    fontWeight: '500' 
  },
  badgeIcon: {
    opacity: 0.7,
  },
  projectName: { 
    fontSize: '14px', 
    color: '#013E37',
    opacity: 0.7,
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
    padding: '8px 16px',
    borderRadius: '10px',
    border: '1px solid #FFEFB3',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: '#FFFFFF',
    color: '#013E37',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '160px',
    transition: 'all 0.25s ease',
  },
  editButton: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '8px 16px', 
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
    padding: '8px 16px', 
    backgroundColor: '#013E37', 
    color: '#FFFFFF', 
    border: 'none', 
    borderRadius: '10px', 
    fontSize: '14px', 
    fontWeight: '500', 
    cursor: 'pointer',
    transition: 'all 0.25s ease',
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
    borderRadius: '16px', 
    border: '1px solid #FFEFB3',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(1, 62, 55, 0.04)',
  },
  cardHeader: { 
    padding: '16px 20px', 
    borderBottom: '1px solid #FFEFB3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderWithCount: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardTitle: { 
    fontSize: '16px', 
    fontWeight: '600', 
    color: '#013E37', 
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardIcon: {
    color: '#013E37',
    opacity: 0.6,
  },
  cardContent: { 
    padding: '16px 20px' 
  },
  descriptionText: { 
    color: '#013E37', 
    opacity: 0.8,
    margin: 0,
    whiteSpace: 'pre-wrap',
    lineHeight: 1.6,
  },
  checklistCount: {
    fontSize: '12px',
    color: '#013E37',
    opacity: 0.6,
    fontWeight: '500',
  },
  checklistProgress: {
    marginBottom: '12px',
  },
  checklistProgressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#FFEFB3',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  checklistProgressFill: {
    height: '100%',
    backgroundColor: '#013E37',
    borderRadius: '4px',
    transition: 'width 0.6s ease',
  },
  checklistItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '8px 12px', 
    borderRadius: '8px',
    transition: 'background-color 0.2s ease',
  },
  checkbox: { 
    width: '18px', 
    height: '18px', 
    cursor: 'pointer',
    accentColor: '#013E37',
  },
  checklistText: { 
    flex: 1, 
    color: '#013E37',
    fontSize: '14px',
  },
  checklistCompleted: { 
    textDecoration: 'line-through', 
    opacity: 0.5,
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
    borderBottom: '1px solid #FFEFB3' 
  },
  commentAvatar: { 
    width: '36px', 
    height: '36px', 
    borderRadius: '50%', 
    backgroundColor: '#013E37', 
    color: '#FFFFFF', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '14px', 
    fontWeight: '600', 
    flexShrink: 0 
  },
  commentContent: { 
    flex: 1 
  },
  commentHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    flexWrap: 'wrap',
  },
  commentUser: { 
    fontSize: '14px', 
    fontWeight: '600', 
    color: '#013E37' 
  },
  commentTime: { 
    fontSize: '12px', 
    color: '#013E37',
    opacity: 0.5,
  },
  commentText: { 
    fontSize: '14px', 
    color: '#013E37',
    opacity: 0.8,
    marginTop: '4px', 
    margin: '4px 0 0 0' 
  },
  emptyComments: { 
    textAlign: 'center', 
    padding: '16px 0', 
    color: '#013E37',
    opacity: 0.5,
  },
  addCommentContainer: { 
    display: 'flex', 
    gap: '8px', 
    marginTop: '8px' 
  },
  commentInput: { 
    flex: 1, 
    padding: '10px 14px', 
    border: '1px solid #FFEFB3', 
    borderRadius: '10px', 
    fontSize: '14px', 
    outline: 'none',
    color: '#013E37',
    backgroundColor: '#FFFFFF',
    transition: 'all 0.25s ease',
  },
  postButton: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '10px 20px', 
    backgroundColor: '#013E37', 
    color: '#FFFFFF', 
    border: 'none', 
    borderRadius: '10px', 
    fontSize: '14px', 
    fontWeight: '500', 
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    whiteSpace: 'nowrap',
  },
  detailItem: { 
    display: 'flex', 
    alignItems: 'flex-start', 
    gap: '12px', 
    padding: '10px 0', 
    borderBottom: '1px solid #FFEFB3' 
  },
  detailIconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#FFEFB3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailIcon: { 
    color: '#013E37',
    opacity: 0.7,
  },
  detailLabel: { 
    fontSize: '12px', 
    color: '#013E37',
    opacity: 0.6,
    margin: 0,
    fontWeight: '500',
  },
  detailValue: { 
    fontSize: '14px', 
    color: '#013E37', 
    margin: 0,
    fontWeight: '500',
  },
  tagsContainer: { 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: '4px', 
    marginTop: '4px' 
  },
  tagItem: { 
    display: 'inline-flex', 
    padding: '2px 10px', 
    backgroundColor: '#FFEFB3', 
    color: '#013E37', 
    borderRadius: '6px', 
    fontSize: '12px', 
    fontWeight: '500' 
  },
  modalContent: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
  },
  modalIconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#FFEFB3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIcon: {
    color: '#013E37',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#013E37',
    margin: '0',
  },
  modalText: { 
    color: '#013E37',
    opacity: 0.8,
    margin: 0,
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: '13px',
    color: '#013E37',
    opacity: 0.5,
    margin: 0,
    textAlign: 'center',
  },
  modalActions: { 
    display: 'flex', 
    justifyContent: 'center', 
    gap: '10px',
    marginTop: '8px',
    width: '100%',
  },
  modalCancelButton: { 
    padding: '8px 24px', 
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
    padding: '8px 24px', 
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

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { 
    from { transform: rotate(0deg); } 
    to { transform: rotate(360deg); } 
  }
  
  .back-button:hover { 
    background-color: #FFEFB3 !important; 
    transform: translateX(-2px);
  }
  
  .status-dropdown:hover {
    border-color: #013E37 !important;
  }
  .status-dropdown:focus {
    border-color: #013E37 !important;
    box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.08) !important;
  }
  .status-dropdown:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .edit-button:hover:not(:disabled) { 
    background-color: #FFEFB3 !important; 
  }
  
  .delete-button:hover:not(:disabled) { 
    background-color: #025a50 !important; 
  }
  
  .checklist-item:hover { 
    background-color: #FFFDF5 !important; 
  }
  
  .comment-input:focus { 
    border-color: #013E37 !important; 
    box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.08) !important; 
  }
  
  .post-button:hover:not(:disabled) { 
    background-color: #025a50 !important; 
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(1, 62, 55, 0.2) !important;
  }
  
  .modal-cancel-button:hover:not(:disabled) { 
    background-color: #FFEFB3 !important; 
  }
  
  .modal-delete-button:hover:not(:disabled) { 
    background-color: #025a50 !important; 
  }
  
  .post-button:disabled, 
  .modal-delete-button:disabled,
  .edit-button:disabled,
  .delete-button:disabled { 
    opacity: 0.6; 
    cursor: not-allowed; 
  }

  .card {
    transition: all 0.25s ease;
  }
  
  .card:hover {
    box-shadow: 0 4px 16px rgba(1, 62, 55, 0.06) !important;
  }
  
  @media (max-width: 1024px) { 
    .content-grid { 
      grid-template-columns: 1fr !important; 
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
    .title-row {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
  }
  
  @media (max-width: 480px) {
    .container { 
      padding: 12px !important; 
    }
    .title {
      font-size: 20px !important;
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