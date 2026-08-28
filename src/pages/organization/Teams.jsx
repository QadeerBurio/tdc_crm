// pages/organization/Teams.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import {
  Users, UserPlus, Plus, Edit, Trash2, RefreshCw,
  Search, X, Check, ArrowRight, Filter,
  Mail, Phone, Calendar, Eye, UserCheck,
  Grid3x3, List, AlertCircle, Crown, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const Teams = () => {
  const { token } = useAuth();
  const {
    teams,
    departments,
    loading,
    fetchTeams,
    fetchDepartments,
    createTeam,
    updateTeam,
    deleteTeam,
    loadAllData
  } = useOrganization();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [saving, setSaving] = useState(false);
  const [localTeams, setLocalTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    departmentId: '',
    managerId: '',
    status: 'active',
    members: []
  });
  const [memberFormData, setMemberFormData] = useState({
    userId: '',
    role: 'member'
  });

  // Load teams on mount and when filter changes
  useEffect(() => {
    loadTeams();
  }, [filterDept]);

  // Update local teams when context teams change
  useEffect(() => {
    if (teams && teams.length > 0) {
      setLocalTeams(teams);
    }
  }, [teams]);

  const loadTeams = async () => {
    try {
      if (filterDept !== 'all') {
        await fetchTeams(filterDept);
      } else {
        await fetchTeams();
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      toast.error('Failed to load teams');
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadAllData();
        // After loadAllData, fetch teams again
        if (filterDept !== 'all') {
          await fetchTeams(filterDept);
        } else {
          await fetchTeams();
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openCreateModal = () => {
    setEditingTeam(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      departmentId: '',
      managerId: '',
      status: 'active',
      members: []
    });
    setShowModal(true);
  };

  const openEditModal = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      slug: team.slug || '',
      description: team.description || '',
      departmentId: team.departmentId || '',
      managerId: team.managerId || '',
      status: team.status || 'active',
      members: team.members || []
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Please enter a team name');
        return;
      }
      if (!formData.departmentId) {
        toast.error('Please select a department');
        return;
      }

      setSaving(true);
      let result;
      if (editingTeam) {
        result = await updateTeam(editingTeam._id, formData);
      } else {
        result = await createTeam(formData);
      }
      
      if (result) {
        setShowModal(false);
        await loadTeams();
        toast.success(editingTeam ? 'Team updated successfully' : 'Team created successfully');
      }
    } catch (error) {
      console.error('Error saving team:', error);
      toast.error('Failed to save team');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    const success = await deleteTeam(id);
    if (success) {
      await loadTeams();
    }
  };

  const handleAddMember = async () => {
    try {
      if (!memberFormData.userId) {
        toast.error('Please select a user');
        return;
      }

      setSaving(true);
      // Mock API call - replace with actual API
      const updatedMembers = [...(selectedTeam.members || []), memberFormData];
      const updatedTeam = { ...selectedTeam, members: updatedMembers };
      await updateTeam(selectedTeam._id, updatedTeam);
      
      setShowMemberModal(false);
      await loadTeams();
      toast.success('Member added successfully');
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    if (!window.confirm('Remove this member from the team?')) return;
    try {
      const team = localTeams.find(t => t._id === teamId);
      const updatedMembers = (team.members || []).filter(m => m.userId !== userId);
      const updatedTeam = { ...team, members: updatedMembers };
      await updateTeam(teamId, updatedTeam);
      await loadTeams();
      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'team-status-active'
      : 'team-status-inactive';
  };

  const getDeptName = (deptId) => {
    const dept = departments.find(d => d._id === deptId);
    return dept?.name || 'Unknown';
  };

  const getMemberName = (userId) => {
    // Mock user names - replace with actual user data
    const users = {
      'user1': 'John Doe',
      'user2': 'Jane Smith',
      'user3': 'Mike Johnson',
      'user4': 'Sarah Williams',
      'user5': 'David Brown',
      'user6': 'Emily Davis'
    };
    return users[userId] || 'Unknown User';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Use localTeams for display
  const displayTeams = localTeams.length > 0 ? localTeams : teams;

  const filteredTeams = displayTeams.filter(team => {
    if (!team) return false;
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = team.name?.toLowerCase().includes(searchLower) || false;
    const descMatch = team.description?.toLowerCase().includes(searchLower) || false;
    const deptName = getDeptName(team.departmentId);
    const deptMatch = deptName.toLowerCase().includes(searchLower);
    return nameMatch || descMatch || deptMatch;
  });

  // Force refresh
  const handleRefresh = async () => {
    try {
      await loadAllData();
      await loadTeams();
      toast.success('Refreshed teams');
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error('Failed to refresh');
    }
  };

  if (loading && !displayTeams.length) {
    return (
      <div className="team-loading">
        <div className="team-loading-spinner"></div>
        <p className="team-loading-text">Loading teams...</p>
      </div>
    );
  }

  return (
    <>
      <div className="team-container">
        {/* Header */}
        <div className="team-header">
          <div className="team-header-left">
            <h1 className="team-title">
              <UserPlus className="team-title-icon" />
              Teams
            </h1>
            <p className="team-subtitle">Manage teams across departments</p>
          </div>
          <div className="team-header-right">
            <button
              onClick={handleRefresh}
              className="team-refresh-btn"
              title="Refresh"
            >
              <RefreshCw className="team-refresh-icon" />
            </button>
            <div className="team-view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`team-view-btn ${viewMode === 'grid' ? 'team-view-active' : ''}`}
              >
                <Grid3x3 className="team-view-icon" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`team-view-btn ${viewMode === 'list' ? 'team-view-active' : ''}`}
              >
                <List className="team-view-icon" />
              </button>
            </div>
            <button 
              onClick={openCreateModal}
              className="team-add-btn"
            >
              <Plus className="team-add-icon" />
              New Team
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="team-filters">
          <div className="team-search">
            <Search className="team-search-icon" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={handleSearch}
              className="team-search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="team-search-clear"
              >
                <X className="team-search-clear-icon" />
              </button>
            )}
          </div>
          <div className="team-filter-group">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="team-filter-select"
            >
              <option value="all">All Departments</option>
              {departments && departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
            <span className="team-count">
              {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Teams Grid/List */}
        {filteredTeams.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="team-grid">
              {filteredTeams.map((team) => (
                <div key={team._id} className="team-card">
                  <div className="team-card-header">
                    <div className="team-card-icon">
                      <UserPlus className="team-card-icon-svg" />
                    </div>
                    <div className="team-card-info">
                      <h3 className="team-card-title">{team.name}</h3>
                      <p className="team-card-dept">{getDeptName(team.departmentId)}</p>
                    </div>
                    <div className="team-card-actions">
                      <button 
                        onClick={() => {
                          setSelectedTeam(team);
                          setMemberFormData({ userId: '', role: 'member' });
                          setShowMemberModal(true);
                        }}
                        className="team-card-action team-card-action-add"
                        title="Add Member"
                      >
                        <UserPlus className="team-card-action-icon" />
                      </button>
                      <button 
                        onClick={() => openEditModal(team)}
                        className="team-card-action"
                        title="Edit"
                      >
                        <Edit className="team-card-action-icon" />
                      </button>
                      <button 
                        onClick={() => handleDelete(team._id)}
                        className="team-card-action team-card-action-delete"
                        title="Delete"
                      >
                        <Trash2 className="team-card-action-icon" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="team-card-desc">{team.description || 'No description'}</p>
                  
                  <div className="team-card-badges">
                    <span className={`team-status ${getStatusColor(team.status)}`}>
                      <span className="team-status-dot"></span>
                      {team.status || 'Active'}
                    </span>
                    <span className="team-member-count">
                      <Users className="team-member-count-icon" />
                      {team.members?.length || 0} members
                    </span>
                    {team.managerId && (
                      <span className="team-manager-badge">
                        <Crown className="team-manager-icon" />
                        Manager: {getMemberName(team.managerId)}
                      </span>
                    )}
                  </div>

                  {/* Member Avatars */}
                  {team.members && team.members.length > 0 && (
                    <div className="team-members">
                      {team.members.slice(0, 5).map((member, idx) => (
                        <div 
                          key={idx}
                          className="team-member-avatar"
                          title={`${getMemberName(member.userId)} (${member.role})`}
                        >
                          {getInitials(getMemberName(member.userId))}
                        </div>
                      ))}
                      {team.members.length > 5 && (
                        <div className="team-member-more">
                          +{team.members.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="team-list">
              {filteredTeams.map((team) => (
                <div key={team._id} className="team-list-item">
                  <div className="team-list-item-left">
                    <div className="team-list-icon">
                      <UserPlus className="team-list-icon-svg" />
                    </div>
                    <div className="team-list-info">
                      <div className="team-list-title-row">
                        <span className="team-list-name">{team.name}</span>
                        <span className="team-list-dept">{getDeptName(team.departmentId)}</span>
                        <span className={`team-status ${getStatusColor(team.status)}`}>
                          <span className="team-status-dot"></span>
                          {team.status || 'Active'}
                        </span>
                      </div>
                      <p className="team-list-desc">{team.description || 'No description'}</p>
                      <div className="team-list-meta">
                        <span className="team-member-count">
                          <Users className="team-member-count-icon" />
                          {team.members?.length || 0} members
                        </span>
                        {team.managerId && (
                          <span className="team-manager-badge">
                            <Crown className="team-manager-icon" />
                            Manager: {getMemberName(team.managerId)}
                          </span>
                        )}
                      </div>
                      {/* Member Avatars */}
                      {team.members && team.members.length > 0 && (
                        <div className="team-members team-members-list">
                          {team.members.slice(0, 8).map((member, idx) => (
                            <div 
                              key={idx}
                              className="team-member-avatar team-member-avatar-small"
                              title={`${getMemberName(member.userId)} (${member.role})`}
                            >
                              {getInitials(getMemberName(member.userId))}
                            </div>
                          ))}
                          {team.members.length > 8 && (
                            <div className="team-member-more team-member-more-small">
                              +{team.members.length - 8}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="team-list-item-right">
                    <button 
                      onClick={() => {
                        setSelectedTeam(team);
                        setMemberFormData({ userId: '', role: 'member' });
                        setShowMemberModal(true);
                      }}
                      className="team-list-action team-list-action-add"
                      title="Add Member"
                    >
                      <UserPlus className="team-list-action-icon" />
                    </button>
                    <button 
                      onClick={() => openEditModal(team)}
                      className="team-list-action"
                      title="Edit"
                    >
                      <Edit className="team-list-action-icon" />
                    </button>
                    <button 
                      onClick={() => handleDelete(team._id)}
                      className="team-list-action team-list-action-delete"
                      title="Delete"
                    >
                      <Trash2 className="team-list-action-icon" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="team-empty">
            <div className="team-empty-icon-wrapper">
              <UserPlus className="team-empty-icon" />
            </div>
            <h3 className="team-empty-title">No Teams Found</h3>
            <p className="team-empty-subtitle">
              {searchTerm || filterDept !== 'all' ? 'Try adjusting your filters' : 'Create your first team'}
            </p>
            {!searchTerm && filterDept === 'all' && (
              <button 
                onClick={openCreateModal}
                className="team-empty-btn"
              >
                <Plus className="team-empty-btn-icon" />
                Create Team
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Team Modal */}
      {showModal && (
        <div className="team-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="team-modal" onClick={(e) => e.stopPropagation()}>
            <div className="team-modal-header">
              <h2 className="team-modal-title">
                {editingTeam ? 'Edit Team' : 'Create New Team'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="team-modal-close"
              >
                <X className="team-modal-close-icon" />
              </button>
            </div>
            
            <div className="team-modal-body">
              <div className="team-form-group">
                <label className="team-form-label">Team Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="team-form-input" 
                  placeholder="e.g., Frontend Team, SEO Team"
                  autoFocus
                />
              </div>

              <div className="team-form-group">
                <label className="team-form-label">Slug</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  className="team-form-input" 
                  placeholder="frontend-team"
                />
              </div>
              
              <div className="team-form-group">
                <label className="team-form-label">Department *</label>
                <select 
                  value={formData.departmentId}
                  onChange={(e) => handleChange('departmentId', e.target.value)}
                  className="team-form-select"
                  required
                >
                  <option value="">Select Department</option>
                  {departments && departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="team-form-group">
                <label className="team-form-label">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="team-form-textarea" 
                  rows="3" 
                  placeholder="Brief description of this team"
                />
              </div>
              
              <div className="team-form-group">
                <label className="team-form-label">Team Manager</label>
                <select 
                  value={formData.managerId}
                  onChange={(e) => handleChange('managerId', e.target.value)}
                  className="team-form-select"
                >
                  <option value="">Select Team Manager</option>
                  <option value="user1">John Doe</option>
                  <option value="user2">Jane Smith</option>
                </select>
                <p className="team-form-hint">User management coming soon</p>
              </div>
              
              <div className="team-form-group">
                <label className="team-form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="team-form-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            
            <div className="team-modal-footer">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="team-modal-cancel"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !formData.name.trim() || !formData.departmentId}
                className="team-modal-submit"
              >
                {saving ? (
                  <>
                    <div className="team-modal-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="team-modal-submit-icon" />
                    {editingTeam ? 'Update Team' : 'Create Team'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && selectedTeam && (
        <div className="team-modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="team-modal" onClick={(e) => e.stopPropagation()}>
            <div className="team-modal-header">
              <h2 className="team-modal-title">
                Add Members to {selectedTeam.name}
              </h2>
              <button 
                onClick={() => setShowMemberModal(false)} 
                className="team-modal-close"
              >
                <X className="team-modal-close-icon" />
              </button>
            </div>
            
            <div className="team-modal-body">
              <div className="team-form-group">
                <label className="team-form-label">Select User</label>
                <select 
                  value={memberFormData.userId}
                  onChange={(e) => setMemberFormData(prev => ({ ...prev, userId: e.target.value }))}
                  className="team-form-select"
                >
                  <option value="">Select a user</option>
                  <option value="user1">John Doe</option>
                  <option value="user2">Jane Smith</option>
                  <option value="user3">Mike Johnson</option>
                  <option value="user4">Sarah Williams</option>
                </select>
                <p className="team-form-hint">User management coming soon</p>
              </div>
              
              <div className="team-form-group">
                <label className="team-form-label">Role in Team</label>
                <select 
                  value={memberFormData.role}
                  onChange={(e) => setMemberFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="team-form-select"
                >
                  <option value="lead">Team Lead</option>
                  <option value="senior">Senior</option>
                  <option value="member">Member</option>
                  <option value="junior">Junior</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
            </div>
            
            <div className="team-modal-footer">
              <button
                type="button"
                onClick={() => setShowMemberModal(false)}
                className="team-modal-cancel"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={saving || !memberFormData.userId}
                className="team-modal-submit"
              >
                {saving ? (
                  <>
                    <div className="team-modal-spinner"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="team-modal-submit-icon" />
                    Add Member
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles - Regular style tag without jsx attribute */}
      <style>{`
        .team-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }
        .team-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .team-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .team-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }
        .team-title-icon {
          width: 28px;
          height: 28px;
          color: #f59e0b;
        }
        .team-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }
        .team-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .team-refresh-btn {
          padding: 8px 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .team-refresh-btn:hover {
          background: #f9fafb;
        }
        .team-refresh-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }
        .team-view-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 4px;
        }
        .team-view-btn {
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          display: flex;
          align-items: center;
        }
        .team-view-btn:hover {
          color: #374151;
        }
        .team-view-active {
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          color: #111827;
        }
        .team-view-icon {
          width: 16px;
          height: 16px;
        }
        .team-add-btn {
          padding: 8px 16px;
          background: #f59e0b;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
        }
        .team-add-btn:hover {
          background: #d97706;
          box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);
          transform: translateY(-1px);
        }
        .team-add-icon {
          width: 16px;
          height: 16px;
        }
        .team-filters {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .team-search {
          flex: 1;
          min-width: 200px;
          position: relative;
        }
        .team-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }
        .team-search-input {
          width: 100%;
          padding: 8px 40px 8px 36px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
        }
        .team-search-input:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
        }
        .team-search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #9ca3af;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
        }
        .team-search-clear:hover {
          color: #6b7280;
        }
        .team-search-clear-icon {
          width: 16px;
          height: 16px;
        }
        .team-filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .team-filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #ffffff;
          min-width: 160px;
        }
        .team-filter-select:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
        }
        .team-count {
          font-size: 14px;
          color: #6b7280;
          white-space: nowrap;
        }
        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .team-card {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .team-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
          border-color: #e5e7eb;
        }
        .team-card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }
        .team-card-icon {
          width: 48px;
          height: 48px;
          background: #fef3c7;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .team-card-icon-svg {
          width: 24px;
          height: 24px;
          color: #f59e0b;
        }
        .team-card-info {
          flex: 1;
          min-width: 0;
        }
        .team-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        .team-card-dept {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }
        .team-card-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .team-card-action {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }
        .team-card-action:hover {
          background: #f3f4f6;
          color: #4b5563;
        }
        .team-card-action-add:hover {
          background: #dbeafe;
          color: #3b82f6;
        }
        .team-card-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }
        .team-card-action-icon {
          width: 16px;
          height: 16px;
        }
        .team-card-desc {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .team-card-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .team-status {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .team-status-active {
          background: #dcfce7;
          color: #16a34a;
        }
        .team-status-inactive {
          background: #f3f4f6;
          color: #6b7280;
        }
        .team-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .team-status-active .team-status-dot {
          background: #22c55e;
        }
        .team-status-inactive .team-status-dot {
          background: #9ca3af;
        }
        .team-member-count {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          background: #dbeafe;
          color: #1d4ed8;
          border-radius: 9999px;
        }
        .team-member-count-icon {
          width: 12px;
          height: 12px;
        }
        .team-manager-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          background: #fef3c7;
          color: #d97706;
          border-radius: 9999px;
        }
        .team-manager-icon {
          width: 12px;
          height: 12px;
        }
        .team-members {
          display: flex;
          align-items: center;
          gap: 4px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        }
        .team-member-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 11px;
          font-weight: 600;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .team-member-avatar-small {
          width: 28px;
          height: 28px;
          font-size: 10px;
        }
        .team-member-more {
          width: 32px;
          height: 32px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
        }
        .team-member-more-small {
          width: 28px;
          height: 28px;
          font-size: 10px;
        }
        .team-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .team-list-item {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 10px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
          flex-wrap: wrap;
          gap: 12px;
        }
        .team-list-item:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .team-list-item-left {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          flex: 1;
          min-width: 200px;
        }
        .team-list-icon {
          width: 40px;
          height: 40px;
          background: #fef3c7;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .team-list-icon-svg {
          width: 20px;
          height: 20px;
          color: #f59e0b;
        }
        .team-list-info {
          flex: 1;
          min-width: 0;
        }
        .team-list-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .team-list-name {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
        }
        .team-list-dept {
          font-size: 12px;
          color: #6b7280;
        }
        .team-list-desc {
          font-size: 13px;
          color: #6b7280;
          margin: 2px 0 0 0;
        }
        .team-list-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
          flex-wrap: wrap;
        }
        .team-members-list {
          border-top: none;
          padding-top: 4px;
        }
        .team-list-item-right {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .team-list-action {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }
        .team-list-action:hover {
          background: #f3f4f6;
          color: #4b5563;
        }
        .team-list-action-add:hover {
          background: #dbeafe;
          color: #3b82f6;
        }
        .team-list-action-delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }
        .team-list-action-icon {
          width: 16px;
          height: 16px;
        }
        .team-empty {
          background: #ffffff;
          border: 2px dashed #e5e7eb;
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
        }
        .team-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #fef3c7;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .team-empty-icon {
          width: 40px;
          height: 40px;
          color: #fbbf24;
        }
        .team-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        .team-empty-subtitle {
          color: #6b7280;
          margin-top: 4px;
        }
        .team-empty-btn {
          margin-top: 16px;
          padding: 10px 24px;
          background: #f59e0b;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .team-empty-btn:hover {
          background: #d97706;
          transform: translateY(-1px);
        }
        .team-empty-btn-icon {
          width: 16px;
          height: 16px;
        }
        .team-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 16px;
        }
        .team-modal {
          background: #ffffff;
          border-radius: 16px;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
          animation: modalIn 0.3s ease;
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .team-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
        }
        .team-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .team-modal-close {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          display: flex;
          align-items: center;
        }
        .team-modal-close:hover {
          background: #f3f4f6;
        }
        .team-modal-close-icon {
          width: 20px;
          height: 20px;
        }
        .team-modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .team-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .team-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        .team-form-hint {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
        }
        .team-form-input,
        .team-form-select,
        .team-form-textarea {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          font-family: inherit;
          background: #ffffff;
        }
        .team-form-input:focus,
        .team-form-select:focus,
        .team-form-textarea:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
        }
        .team-form-textarea {
          resize: vertical;
          min-height: 60px;
        }
        .team-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #f3f4f6;
        }
        .team-modal-cancel {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: transparent;
          color: #4b5563;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .team-modal-cancel:hover:not(:disabled) {
          background: #f9fafb;
        }
        .team-modal-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .team-modal-submit {
          padding: 8px 16px;
          background: #f59e0b;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .team-modal-submit:hover:not(:disabled) {
          background: #d97706;
          transform: translateY(-1px);
        }
        .team-modal-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .team-modal-submit-icon {
          width: 16px;
          height: 16px;
        }
        .team-modal-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .team-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .team-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #fef3c7;
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .team-loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
        }
        @media (max-width: 768px) {
          .team-grid {
            grid-template-columns: 1fr;
          }
          .team-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .team-header-right {
            width: 100%;
          }
          .team-filters {
            flex-direction: column;
            align-items: stretch;
          }
          .team-filter-group {
            flex-wrap: wrap;
          }
          .team-list-item {
            flex-direction: column;
            align-items: stretch;
          }
          .team-list-item-right {
            justify-content: flex-end;
            border-top: 1px solid #f3f4f6;
            padding-top: 12px;
          }
          .team-modal {
            margin: 16px;
            max-height: 95vh;
          }
        }
      `}</style>
    </>
  );
};

export default Teams;