// pages/organization/Teams.jsx - Modern Design with #013E37, #FFEFB3, White

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import {
  Users, UserPlus, Plus, Edit, Trash2, RefreshCw,
  Search, X, Check, ArrowRight, Filter,
  Mail, Phone, Calendar, Eye, UserCheck,
  Grid3x3, List, AlertCircle, Crown, Star,
  Building2, Sparkles, Zap, Shield, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

const Teams = () => {
  const { token } = useAuth();
  const {
    teams,
    departments,
    loading: contextLoading,
    fetchTeams,
    fetchDepartments,
    createTeam,
    updateTeam,
    deleteTeam,
    loadAllData
  } = useOrganization();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [companies, setCompanies] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [saving, setSaving] = useState(false);
  const [localTeams, setLocalTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
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

  const getHeaders = () => ({
    headers: token ? { 
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    } : {}
  });

  // Load companies
  const loadCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/organization/companies?t=${Date.now()}`, getHeaders());
      const comps = response.data.data || [];
      setCompanies(comps);
      return comps;
    } catch (error) {
      console.error('Error loading companies:', error);
      return [];
    }
  };

  // Load teams with filters
  const loadTeamsData = async (deptId = null, companyId = null) => {
    try {
      setLoading(true);
      let url = `${API_URL}/organization/teams?t=${Date.now()}`;
      
      if (deptId && deptId !== 'all') {
        url = `${API_URL}/organization/teams?departmentId=${deptId}&t=${Date.now()}`;
      } else if (companyId && companyId !== 'all') {
        url = `${API_URL}/organization/teams?companyId=${companyId}&t=${Date.now()}`;
      }
      
      const response = await axios.get(url, getHeaders());
      const data = response.data.data || [];
      setLocalTeams(data);
      return data;
    } catch (error) {
      console.error('Error loading teams:', error);
      toast.error('Failed to load teams');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load departments with company filter
  const loadDepartmentsData = async (companyId = null) => {
    try {
      let url = `${API_URL}/organization/departments?t=${Date.now()}`;
      if (companyId && companyId !== 'all') {
        url = `${API_URL}/organization/departments?companyId=${companyId}&t=${Date.now()}`;
      }
      const response = await axios.get(url, getHeaders());
      const data = response.data.data || [];
      if (fetchDepartments) {
        await fetchDepartments();
      }
      return data;
    } catch (error) {
      console.error('Error loading departments:', error);
      return [];
    }
  };

  // Load all data
  const loadAllDataWithFilters = async () => {
    try {
      setLoading(true);
      await loadCompanies();
      await loadDepartmentsData(filterCompany !== 'all' ? filterCompany : null);
      
      let deptId = filterDept !== 'all' ? filterDept : null;
      let companyId = filterCompany !== 'all' ? filterCompany : null;
      
      if (deptId) {
        await loadTeamsData(deptId, null);
      } else if (companyId) {
        await loadTeamsData(null, companyId);
      } else {
        await loadTeamsData(null, null);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadAllDataWithFilters();
  }, [filterDept, filterCompany]);

  // Handle company filter change
  const handleCompanyChange = async (companyId) => {
    setFilterCompany(companyId);
    setFilterDept('all');
  };

  // Handle department filter change
  const handleDeptChange = async (deptId) => {
    setFilterDept(deptId);
  };

  // Manual refresh
  const handleRefresh = async () => {
    toast.loading('Refreshing...');
    await loadAllDataWithFilters();
    toast.dismiss();
    toast.success('Teams refreshed');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openCreateModal = () => {
    setEditingTeam(null);
    const defaultDept = departments && departments.length > 0 ? departments[0]._id : '';
    setFormData({
      name: '',
      slug: '',
      description: '',
      departmentId: defaultDept,
      managerId: '',
      status: 'active',
      members: []
    });
    setShowModal(true);
  };

  const openEditModal = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name || '',
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
      
      const submitData = {
        name: formData.name.trim(),
        slug: formData.slug || formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description || '',
        departmentId: formData.departmentId,
        status: formData.status || 'active'
      };

      if (formData.managerId && formData.managerId !== '' && formData.managerId !== 'user1' && formData.managerId !== 'user2') {
        submitData.managerId = formData.managerId;
      }

      let result;
      if (editingTeam) {
        result = await updateTeam(editingTeam._id, submitData);
      } else {
        result = await createTeam(submitData);
      }
      
      if (result) {
        setShowModal(false);
        await loadAllDataWithFilters();
        toast.success(editingTeam ? 'Team updated successfully' : 'Team created successfully');
      }
    } catch (error) {
      console.error('Error saving team:', error);
      toast.error(error.response?.data?.message || 'Failed to save team');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    const success = await deleteTeam(id);
    if (success) {
      await loadAllDataWithFilters();
    }
  };

  const handleAddMember = async () => {
    try {
      if (!memberFormData.userId) {
        toast.error('Please enter a user ID');
        return;
      }

      setSaving(true);
      const updatedMembers = [...(selectedTeam.members || []), memberFormData];
      const updatedTeam = { ...selectedTeam, members: updatedMembers };
      await updateTeam(selectedTeam._id, updatedTeam);
      
      setShowMemberModal(false);
      await loadAllDataWithFilters();
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
      await loadAllDataWithFilters();
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
    const dept = departments?.find(d => d._id === deptId);
    return dept?.name || 'Unknown';
  };

  const getCompanyName = (deptId) => {
    const dept = departments?.find(d => d._id === deptId);
    if (!dept) return 'Unknown Company';
    const segment = dept.segmentId;
    if (segment && typeof segment === 'object') {
      const companyId = segment.companyId;
      const company = companies.find(c => c._id === companyId);
      return company?.name || 'Unknown Company';
    }
    return 'Unknown Company';
  };

  const getMemberName = (userId) => {
    if (selectedTeam) {
      const member = selectedTeam.members?.find(m => m.userId === userId);
      if (member && member.userId && typeof member.userId === 'object') {
        return `${member.userId.firstName || ''} ${member.userId.lastName || ''}`.trim() || 'Unknown';
      }
    }
    return 'Unknown User';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get filtered departments based on selected company
  const getFilteredDepartments = () => {
    if (!departments) return [];
    if (filterCompany === 'all') return departments;
    return departments.filter(dept => {
      const segment = dept.segmentId;
      if (segment && typeof segment === 'object') {
        return segment.companyId === filterCompany;
      }
      return true;
    });
  };

  const filteredDepartments = getFilteredDepartments();

  // Filter teams by search term
  const filteredTeams = localTeams.filter(team => {
    if (!team) return false;
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = team.name?.toLowerCase().includes(searchLower) || false;
    const descMatch = team.description?.toLowerCase().includes(searchLower) || false;
    const deptName = getDeptName(team.departmentId);
    const deptMatch = deptName.toLowerCase().includes(searchLower);
    return nameMatch || descMatch || deptMatch;
  });

  // Use context teams if local is empty
  const displayTeams = localTeams.length > 0 ? localTeams : teams;

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
              <Users className="team-title-icon" color="#013E37" />
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
            <Search className="team-search-icon" color="#013E37" />
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
              value={filterCompany}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="team-filter-select"
            >
              <option value="all">All Companies</option>
              {companies.map(comp => (
                <option key={comp._id} value={comp._id}>{comp.name}</option>
              ))}
            </select>
            <select
              value={filterDept}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="team-filter-select"
            >
              <option value="all">All Departments</option>
              {filteredDepartments.map(dept => (
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
              {filteredTeams.map((team, index) => (
                <div 
                  key={team._id} 
                  className="team-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onMouseEnter={() => setHoveredCard(team._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="team-card-inner">
                    <div className="team-card-header">
                      <div className="team-card-icon" style={{ backgroundColor: '#FFEFB3' }}>
                        <Users className="team-card-icon-svg" color="#013E37" />
                      </div>
                      <div className="team-card-info">
                        <h3 className="team-card-title">{team.name}</h3>
                        <p className="team-card-dept">{getDeptName(team.departmentId)}</p>
                        <p className="team-card-company">
                          <Building2 className="team-card-company-icon" />
                          {getCompanyName(team.departmentId)}
                        </p>
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
                            style={{ 
                              background: `linear-gradient(135deg, #013E37, #0A5C54)`,
                              borderColor: '#FFEFB3'
                            }}
                            title={`${getMemberName(member.userId)} (${member.role})`}
                          >
                            {getInitials(getMemberName(member.userId))}
                          </div>
                        ))}
                        {team.members.length > 5 && (
                          <div className="team-member-more" style={{ backgroundColor: '#FFEFB3', color: '#013E37' }}>
                            +{team.members.length - 5}
                          </div>
                        )}
                      </div>
                    )}

                    {hoveredCard === team._id && (
                      <div className="team-card-hover-indicator">
                        <ArrowRight size={18} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="team-list">
              {filteredTeams.map((team, index) => (
                <div 
                  key={team._id} 
                  className="team-list-item"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="team-list-item-left">
                    <div className="team-list-icon" style={{ backgroundColor: '#FFEFB3' }}>
                      <Users className="team-list-icon-svg" color="#013E37" />
                    </div>
                    <div className="team-list-info">
                      <div className="team-list-title-row">
                        <span className="team-list-name">{team.name}</span>
                        <span className="team-list-dept">{getDeptName(team.departmentId)}</span>
                        <span className="team-list-company">
                          <Building2 className="team-list-company-icon" />
                          {getCompanyName(team.departmentId)}
                        </span>
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
                              style={{ 
                                background: `linear-gradient(135deg, #013E37, #0A5C54)`,
                                borderColor: '#FFEFB3'
                              }}
                              title={`${getMemberName(member.userId)} (${member.role})`}
                            >
                              {getInitials(getMemberName(member.userId))}
                            </div>
                          ))}
                          {team.members.length > 8 && (
                            <div className="team-member-more team-member-more-small" style={{ backgroundColor: '#FFEFB3', color: '#013E37' }}>
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
            <div className="team-empty-icon-wrapper" style={{ backgroundColor: '#FFEFB3' }}>
              <Users className="team-empty-icon" color="#013E37" />
            </div>
            <h3 className="team-empty-title">No Teams Found</h3>
            <p className="team-empty-subtitle">
              {searchTerm ? 'Try adjusting your search' :
               filterDept !== 'all' ? 'No teams in this department' :
               filterCompany !== 'all' ? 'Create your first team for this company' :
               'Create your first team'}
            </p>
            {!searchTerm && (
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
                  {filteredDepartments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
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
                <div className="team-form-hint-text">
                  <p className="team-form-hint">User management coming soon. Leave empty for now.</p>
                  <input 
                    type="text" 
                    value={formData.managerId}
                    onChange={(e) => handleChange('managerId', e.target.value)}
                    className="team-form-input" 
                    placeholder="Enter user ID (optional)"
                  />
                </div>
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
                <label className="team-form-label">User ID</label>
                <input 
                  type="text" 
                  value={memberFormData.userId}
                  onChange={(e) => setMemberFormData(prev => ({ ...prev, userId: e.target.value }))}
                  className="team-form-input" 
                  placeholder="Enter user ID"
                />
                <p className="team-form-hint">Enter a valid user ID (coming from user management)</p>
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

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .team-container {
          padding: 0 0 24px 0;
          max-width: 100%;
        }

        /* ============================================
           HEADER
           ============================================ */
        .team-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
          animation: fadeInDown 0.6s ease;
        }
        .team-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .team-title {
          font-size: 28px;
          font-weight: 700;
          color: #013E37;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .team-title-icon {
          width: 28px;
          height: 28px;
          animation: pulse 2s ease-in-out infinite;
        }
        .team-subtitle {
          color: #013E37;
          opacity: 0.6;
          font-size: 15px;
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
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .team-refresh-btn:hover {
          background: #FFEFB3;
          border-color: #013E37;
          transform: rotate(180deg);
        }
        .team-refresh-icon {
          width: 16px;
          height: 16px;
          color: #013E37;
          transition: transform 0.3s ease;
        }
        .team-view-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #FFEFB3;
          border-radius: 8px;
          padding: 4px;
          transition: all 0.3s ease;
        }
        .team-view-btn {
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.5;
          display: flex;
          align-items: center;
        }
        .team-view-btn:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }
        .team-view-active {
          background: #013E37;
          color: #FFFFFF;
          opacity: 1;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.2);
          animation: popIn 0.3s ease;
        }
        .team-view-active:hover {
          opacity: 1;
          transform: scale(1);
        }
        .team-view-icon {
          width: 16px;
          height: 16px;
        }
        .team-add-btn {
          padding: 8px 20px;
          background: #013E37;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(1, 62, 55, 0.25);
        }
        .team-add-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .team-add-btn:active {
          transform: scale(0.95);
        }
        .team-add-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        .team-add-btn:hover .team-add-icon {
          transform: rotate(90deg);
        }

        /* ============================================
           FILTERS
           ============================================ */
        .team-filters {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          animation: fadeIn 0.8s ease;
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
          opacity: 0.5;
          transition: all 0.3s ease;
        }
        .team-search-input {
          width: 100%;
          padding: 8px 40px 8px 36px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #013E37;
        }
        .team-search-input:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
          transform: scale(1.01);
        }
        .team-search-input::placeholder {
          color: #013E37;
          opacity: 0.4;
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
          color: #013E37;
          opacity: 0.4;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }
        .team-search-clear:hover {
          opacity: 0.8;
          transform: translateY(-50%) scale(1.2);
        }
        .team-search-clear-icon {
          width: 16px;
          height: 16px;
        }
        .team-filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .team-filter-select {
          padding: 8px 12px;
          border: 1px solid #FFEFB3;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          background: #ffffff;
          min-width: 160px;
          color: #013E37;
          cursor: pointer;
        }
        .team-filter-select:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
        }
        .team-filter-select:hover {
          border-color: #013E37;
        }
        .team-count {
          font-size: 14px;
          color: #013E37;
          opacity: 0.6;
          white-space: nowrap;
          font-weight: 500;
        }

        /* ============================================
           GRID VIEW
           ============================================ */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .team-card {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.5s ease forwards;
          opacity: 0;
          position: relative;
          overflow: hidden;
        }
        .team-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #013E37, #0A5C54, #013E37);
          transform: scaleX(0);
          transition: transform 0.4s ease;
          transform-origin: left;
        }
        .team-card:hover::before {
          transform: scaleX(1);
        }
        .team-card:hover {
          box-shadow: 0 8px 30px rgba(1, 62, 55, 0.12);
          transform: translateY(-6px) scale(1.01);
          border-color: #013E37;
        }
        .team-card-inner {
          position: relative;
          z-index: 1;
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
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .team-card:hover .team-card-icon {
          transform: scale(1.05) rotate(-5deg);
        }
        .team-card-icon-svg {
          width: 24px;
          height: 24px;
          transition: transform 0.3s ease;
        }
        .team-card:hover .team-card-icon-svg {
          transform: scale(1.1);
        }
        .team-card-info {
          flex: 1;
          min-width: 0;
        }
        .team-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
          transition: color 0.3s ease;
        }
        .team-card:hover .team-card-title {
          color: #0A5C54;
        }
        .team-card-dept {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
          margin: 0;
        }
        .team-card-company {
          font-size: 12px;
          color: #013E37;
          font-weight: 500;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 4px;
          background: #FFEFB3;
          padding: 2px 8px;
          border-radius: 9999px;
          display: inline-flex;
          transition: all 0.3s ease;
        }
        .team-card:hover .team-card-company {
          background: #013E37;
          color: #ffffff;
        }
        .team-card-company-icon {
          width: 12px;
          height: 12px;
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
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.4;
          display: flex;
          align-items: center;
        }
        .team-card-action:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }
        .team-card-action-add:hover {
          background: #FFEFB3;
          color: #013E37;
        }
        .team-card-action-delete:hover {
          background: #FFEBEE;
          color: #D32F2F;
          opacity: 1;
        }
        .team-card-action-icon {
          width: 16px;
          height: 16px;
        }
        .team-card-desc {
          font-size: 14px;
          color: #013E37;
          opacity: 0.7;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
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
          transition: all 0.3s ease;
        }
        .team-status-active {
          background: #013E37;
          color: #ffffff;
        }
        .team-status-inactive {
          background: #FFEFB3;
          color: #013E37;
        }
        .team-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s ease-in-out infinite;
        }
        .team-status-active .team-status-dot {
          background: #ffffff;
        }
        .team-status-inactive .team-status-dot {
          background: #013E37;
        }
        .team-member-count {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          background: #FFEFB3;
          color: #013E37;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }
        .team-card:hover .team-member-count {
          background: #013E37;
          color: #ffffff;
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
          background: #FFEFB3;
          color: #013E37;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }
        .team-card:hover .team-manager-badge {
          background: #013E37;
          color: #ffffff;
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
          border-top: 1px solid #FFEFB3;
          transition: border-color 0.3s ease;
        }
        .team-card:hover .team-members {
          border-color: #013E37;
        }
        .team-member-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 11px;
          font-weight: 600;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(1, 62, 55, 0.15);
          transition: all 0.3s ease;
        }
        .team-member-avatar:hover {
          transform: scale(1.15);
          z-index: 1;
        }
        .team-member-avatar-small {
          width: 28px;
          height: 28px;
          font-size: 10px;
        }
        .team-member-more {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .team-member-more:hover {
          transform: scale(1.1);
        }
        .team-member-more-small {
          width: 28px;
          height: 28px;
          font-size: 10px;
        }
        .team-card-hover-indicator {
          position: absolute;
          bottom: 12px;
          right: 16px;
          color: #013E37;
          opacity: 0.5;
          animation: slideInRight 0.3s ease;
        }

        /* ============================================
           LIST VIEW
           ============================================ */
        .team-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .team-list-item {
          background: #ffffff;
          border: 1px solid #FFEFB3;
          border-radius: 10px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          flex-wrap: wrap;
          gap: 12px;
          animation: slideInRight 0.5s ease forwards;
          opacity: 0;
          position: relative;
          overflow: hidden;
        }
        .team-list-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #013E37;
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }
        .team-list-item:hover::before {
          transform: scaleY(1);
        }
        .team-list-item:hover {
          border-color: #013E37;
          box-shadow: 0 4px 20px rgba(1, 62, 55, 0.08);
          transform: translateX(4px);
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
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .team-list-item:hover .team-list-icon {
          transform: scale(1.05) rotate(-5deg);
        }
        .team-list-icon-svg {
          width: 20px;
          height: 20px;
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
          color: #013E37;
          transition: color 0.3s ease;
        }
        .team-list-item:hover .team-list-name {
          color: #0A5C54;
        }
        .team-list-dept {
          font-size: 12px;
          color: #013E37;
          opacity: 0.6;
        }
        .team-list-company {
          font-size: 12px;
          color: #013E37;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #FFEFB3;
          padding: 2px 8px;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }
        .team-list-item:hover .team-list-company {
          background: #013E37;
          color: #ffffff;
        }
        .team-list-company-icon {
          width: 12px;
          height: 12px;
        }
        .team-list-desc {
          font-size: 13px;
          color: #013E37;
          opacity: 0.6;
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
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.4;
          display: flex;
          align-items: center;
        }
        .team-list-action:hover {
          background: #FFEFB3;
          opacity: 1;
          transform: scale(1.1);
        }
        .team-list-action-add:hover {
          background: #FFEFB3;
          color: #013E37;
        }
        .team-list-action-delete:hover {
          background: #FFEBEE;
          color: #D32F2F;
          opacity: 1;
        }
        .team-list-action-icon {
          width: 16px;
          height: 16px;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .team-empty {
          background: #ffffff;
          border: 2px dashed #FFEFB3;
          border-radius: 16px;
          padding: 60px 24px;
          text-align: center;
          animation: fadeIn 0.8s ease;
        }
        .team-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          transition: all 0.3s ease;
          animation: float 3s ease-in-out infinite;
        }
        .team-empty-icon {
          width: 40px;
          height: 40px;
        }
        .team-empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #013E37;
          margin: 0;
        }
        .team-empty-subtitle {
          color: #013E37;
          opacity: 0.6;
          margin-top: 4px;
          font-size: 15px;
        }
        .team-empty-btn {
          margin-top: 20px;
          padding: 10px 24px;
          background: #013E37;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        .team-empty-btn:hover {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .team-empty-btn:active {
          transform: scale(0.95);
        }
        .team-empty-btn-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        .team-empty-btn:hover .team-empty-btn-icon {
          transform: rotate(90deg);
        }

        /* ============================================
           MODAL
           ============================================ */
        .team-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(1, 62, 55, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 16px;
          animation: fadeIn 0.3s ease;
        }
        .team-modal {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #FFEFB3;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(1, 62, 55, 0.2);
          animation: modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
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
          border-bottom: 1px solid #FFEFB3;
          background: #FFEFB3;
        }
        .team-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #013E37;
          margin: 0;
        }
        .team-modal-close {
          padding: 4px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #013E37;
          opacity: 0.5;
          display: flex;
          align-items: center;
        }
        .team-modal-close:hover {
          background: rgba(1, 62, 55, 0.1);
          opacity: 1;
          transform: rotate(90deg);
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
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .team-form-group:nth-child(1) { animation-delay: 0.05s; }
        .team-form-group:nth-child(2) { animation-delay: 0.1s; }
        .team-form-group:nth-child(3) { animation-delay: 0.15s; }
        .team-form-group:nth-child(4) { animation-delay: 0.2s; }
        .team-form-group:nth-child(5) { animation-delay: 0.25s; }
        .team-form-group:nth-child(6) { animation-delay: 0.3s; }
        .team-form-label {
          font-size: 14px;
          font-weight: 500;
          color: #013E37;
        }
        .team-form-hint-text {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .team-form-hint {
          font-size: 12px;
          color: #013E37;
          opacity: 0.5;
          margin: 0;
        }
        .team-form-input,
        .team-form-select,
        .team-form-textarea {
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
        .team-form-input:focus,
        .team-form-select:focus,
        .team-form-textarea:focus {
          border-color: #013E37;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.1);
          transform: scale(1.01);
        }
        .team-form-input::placeholder,
        .team-form-textarea::placeholder {
          color: #013E37;
          opacity: 0.4;
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
          border-top: 1px solid #FFEFB3;
          background: #F8FAFC;
        }
        .team-modal-cancel {
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
        .team-modal-cancel:hover:not(:disabled) {
          background: #FFEFB3;
          border-color: #013E37;
          transform: scale(1.02);
        }
        .team-modal-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .team-modal-submit {
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
        }
        .team-modal-submit:hover:not(:disabled) {
          background: #0A5C54;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px rgba(1, 62, 55, 0.3);
        }
        .team-modal-submit:active:not(:disabled) {
          transform: scale(0.95);
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

        /* ============================================
           LOADING
           ============================================ */
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
          border: 4px solid #FFEFB3;
          border-top-color: #013E37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .team-loading-text {
          margin-top: 16px;
          color: #013E37;
          opacity: 0.6;
          font-size: 14px;
        }

        /* ============================================
           ANIMATIONS
           ============================================ */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes popIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 992px) {
          .team-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
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
            flex-wrap: wrap;
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
            border-top: 1px solid #FFEFB3;
            padding-top: 12px;
          }
          .team-modal {
            margin: 16px;
            max-height: 95vh;
          }
          .team-title {
            font-size: 24px;
          }
          .team-add-btn {
            flex: 1;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .team-container {
            padding: 0 8px 16px 8px;
          }
          .team-card {
            padding: 16px;
          }
          .team-card-header {
            flex-wrap: wrap;
          }
          .team-card-badges {
            flex-wrap: wrap;
          }
          .team-list-item {
            padding: 12px 16px;
          }
          .team-list-item-left {
            flex-wrap: wrap;
          }
          .team-list-title-row {
            flex-wrap: wrap;
          }
          .team-modal-body {
            padding: 16px;
          }
          .team-modal-footer {
            flex-direction: column-reverse;
          }
          .team-modal-cancel,
          .team-modal-submit {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default Teams;