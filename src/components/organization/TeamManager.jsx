import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import {
  UserPlus, Plus, Edit, Trash2, RefreshCw,
  Search, X, Users, Check, ArrowRight,
  Filter, Mail, Phone, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const TeamManager = () => {
  const { token } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  // Form state for team
  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    description: '',
    managerId: '',
    status: 'active'
  });

  // Form state for member
  const [memberData, setMemberData] = useState({
    userId: '',
    role: 'member'
  });

  const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

  // Get headers with token
  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchData();
  }, [search, filterDept]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsRes, deptsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/organization/teams`, {
          headers: getHeaders(),
          params: { search: search || undefined, departmentId: filterDept !== 'all' ? filterDept : undefined }
        }),
        axios.get(`${API_URL}/organization/departments`, {
          headers: getHeaders()
        }),
        axios.get(`${API_URL}/users`, {
          headers: getHeaders()
        })
      ]);
      setTeams(teamsRes.data.data || []);
      setDepartments(deptsRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Team name is required');
      return;
    }
    
    if (!formData.departmentId) {
      toast.error('Please select a department');
      return;
    }

    try {
      const url = editingTeam 
        ? `${API_URL}/organization/teams/${editingTeam._id}`
        : `${API_URL}/organization/teams`;
      
      const method = editingTeam ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: getHeaders()
      });
      
      toast.success(editingTeam ? 'Team updated successfully' : 'Team created successfully');
      setShowModal(false);
      setEditingTeam(null);
      setFormData({
        name: '',
        departmentId: '',
        description: '',
        managerId: '',
        status: 'active'
      });
      fetchData();
    } catch (error) {
      console.error('Error saving team:', error);
      toast.error(error.response?.data?.message || 'Failed to save team');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!memberData.userId) {
      toast.error('Please select a user');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/organization/teams/${selectedTeam._id}/members`,
        memberData,
        { headers: getHeaders() }
      );
      
      toast.success('Member added successfully');
      setShowMemberModal(false);
      setMemberData({ userId: '', role: 'member' });
      fetchData();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (teamId, memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return;
    
    try {
      await axios.delete(
        `${API_URL}/organization/teams/${teamId}/members/${memberId}`,
        { headers: getHeaders() }
      );
      
      toast.success('Member removed successfully');
      fetchData();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await axios.delete(`${API_URL}/organization/teams/${id}`, {
        headers: getHeaders()
      });
      toast.success('Team deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    }
  };

  const openModal = (team = null) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name || '',
        departmentId: team.departmentId || '',
        description: team.description || '',
        managerId: team.managerId?._id || team.managerId || '',
        status: team.status || 'active'
      });
    } else {
      setEditingTeam(null);
      setFormData({
        name: '',
        departmentId: '',
        description: '',
        managerId: '',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const openMemberModal = (team) => {
    setSelectedTeam(team);
    setMemberData({ userId: '', role: 'member' });
    setShowMemberModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-500',
      pending: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-500';
  };

  const getDeptName = (deptId) => {
    const dept = departments.find(d => d._id === deptId);
    return dept?.name || 'Unknown';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Unknown' : 'Unknown';
  };

  const getUserEmail = (userId) => {
    const user = users.find(u => u._id === userId);
    return user?.email || '';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvailableUsers = () => {
    const teamMemberIds = selectedTeam?.members?.map(m => m.userId) || [];
    return users.filter(user => !teamMemberIds.includes(user._id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Teams</h2>
          <p className="text-sm text-gray-500 mt-1">Manage teams across departments</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-56"
            />
          </div>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept._id}>{dept.name}</option>
            ))}
          </select>
          <button
            onClick={fetchData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button 
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Team
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => {
          const statusColor = getStatusColor(team.status);
          const memberCount = team.members?.length || 0;
          
          return (
            <div key={team._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{team.name}</h3>
                    <p className="text-sm text-gray-500">{getDeptName(team.departmentId)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => openMemberModal(team)}
                    title="Add Members"
                  >
                    <UserPlus className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                  </button>
                  <button 
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => openModal(team)}
                  >
                    <Edit className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                  </button>
                  <button 
                    className="p-1 hover:bg-red-50 rounded transition-colors"
                    onClick={() => handleDelete(team._id)}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
              
              {team.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{team.description}</p>
              )}
              
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                  {team.status || 'active'}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                  {memberCount} members
                </span>
                {team.managerId && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    Manager: {getUserName(team.managerId)}
                  </span>
                )}
              </div>

              {/* Member Avatars */}
              {team.members && team.members.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 flex-wrap">
                    {team.members.slice(0, 5).map((member, idx) => {
                      const userName = getUserName(member.userId);
                      return (
                        <div 
                          key={idx}
                          className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold relative group"
                          title={userName}
                        >
                          {getInitials(userName)}
                          {member.role && (
                            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-700 rounded-full text-[6px] flex items-center justify-center text-white">
                              {member.role === 'lead' ? 'L' : member.role === 'senior' ? 'S' : 'M'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {team.members.length > 5 && (
                      <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600">
                        +{team.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No Teams Found</h3>
          <p className="text-sm mt-1">Create your first team to get started</p>
          <button 
            onClick={() => openModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Team
          </button>
        </div>
      )}

      {/* Create/Edit Team Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTeam ? 'Edit Team' : 'Create New Team'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleTeamSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g., Frontend Team, SEO Team"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <select 
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  rows="3" 
                  placeholder="Brief description of this team"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Team Manager</label>
                <select 
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Team Manager</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {getUserName(user._id)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingTeam ? 'Update Team' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMemberModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Add Members to {selectedTeam.name}
              </h2>
              <button 
                onClick={() => setShowMemberModal(false)} 
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select User <span className="text-red-500">*</span>
                </label>
                <select 
                  value={memberData.userId}
                  onChange={(e) => setMemberData({ ...memberData, userId: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a user</option>
                  {getAvailableUsers().map(user => (
                    <option key={user._id} value={user._id}>
                      {getUserName(user._id)} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role in Team <span className="text-red-500">*</span>
                </label>
                <select 
                  value={memberData.role}
                  onChange={(e) => setMemberData({ ...memberData, role: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="lead">Team Lead</option>
                  <option value="senior">Senior</option>
                  <option value="member">Member</option>
                  <option value="junior">Junior</option>
                  <option value="intern">Intern</option>
                </select>
              </div>

              {/* Current Members */}
              {selectedTeam.members && selectedTeam.members.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Members ({selectedTeam.members.length})
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedTeam.members.map((member, idx) => {
                      const userName = getUserName(member.userId);
                      return (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(userName)}
                            </div>
                            <span className="text-sm text-gray-700">{userName}</span>
                            <span className="text-xs text-gray-400">{member.role}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(selectedTeam._id, member._id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;