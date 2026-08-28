import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, Layers, Users, UserPlus,
  Edit, Save, X, Plus, Trash2
} from 'lucide-react';

const Organization = () => {
  const { api } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      const response = await api.get('/organization/hierarchy');
      setOrganization(response.data.data);
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoading(false);
    }
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
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Organization Settings</h2>
        <p className="text-gray-500 mt-1">Manage your company structure and hierarchy</p>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Company Information</h3>
          <button 
            onClick={() => setEditing(!editing)}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            {editing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input 
              type="text" 
              defaultValue={organization?.name || ''}
              disabled={!editing}
              className={`mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                editing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Industry</label>
            <input 
              type="text" 
              defaultValue={organization?.industry || ''}
              disabled={!editing}
              className={`mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                editing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
              }`}
            />
          </div>
        </div>
        
        {editing && (
          <div className="mt-4 flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Structure Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Organization Structure</h3>
        
        <div className="space-y-4">
          {/* Company */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-800">{organization?.name || 'Company'}</span>
              </div>
              <span className="text-xs text-gray-500">Company</span>
            </div>
          </div>
          
          {/* Segments */}
          <div className="ml-6 space-y-3">
            <div className="text-sm font-medium text-gray-500">Segments</div>
            {organization?.children?.map((segment) => (
              <div key={segment._id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-800">{segment.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">Segment</span>
                </div>
                
                {/* Departments */}
                <div className="ml-6 mt-3 space-y-2">
                  <div className="text-xs font-medium text-gray-400">Departments</div>
                  {segment.children?.map((dept) => (
                    <div key={dept._id} className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-gray-800">{dept.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">Department</span>
                      </div>
                      
                      {/* Teams */}
                      <div className="ml-6 mt-2 space-y-2">
                        <div className="text-xs font-medium text-gray-400">Teams</div>
                        {dept.children?.map((team) => (
                          <div key={team._id} className="border border-orange-200 rounded-lg p-2 bg-orange-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <UserPlus className="w-4 h-4 text-orange-600" />
                              <span className="font-medium text-gray-800">{team.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">Team</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Organization;