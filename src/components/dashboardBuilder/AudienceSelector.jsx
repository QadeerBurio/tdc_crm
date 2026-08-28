import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Building2, Layers, User,
  ChevronDown, X, Check, Globe
} from 'lucide-react';

const AudienceSelector = ({ value, onChange, className = '' }) => {
  const { api } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [segments, setSegments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const audienceOptions = [
    { value: 'all', label: 'Company Wide', icon: Globe },
    { value: 'segment', label: 'Segment', icon: Layers },
    { value: 'department', label: 'Department', icon: Building2 },
    { value: 'team', label: 'Team', icon: Users },
    { value: 'individual', label: 'Individual', icon: User }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const [segmentsRes, deptsRes, teamsRes, usersRes] = await Promise.all([
        api.get('/organization/segments'),
        api.get('/organization/departments'),
        api.get('/organization/teams'),
        api.get('/users')
      ]);
      setSegments(segmentsRes.data.data || []);
      setDepartments(deptsRes.data.data || []);
      setTeams(teamsRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedLabel = () => {
    const option = audienceOptions.find(o => o.value === value);
    if (!option) return 'Select Audience';
    return option.label;
  };

  const getSelectedIcon = () => {
    const option = audienceOptions.find(o => o.value === value);
    if (!option) return Globe;
    return option.icon;
  };

  const SelectedIcon = getSelectedIcon();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
      >
        <SelectedIcon className="w-4 h-4 text-gray-400" />
        <span className="flex-1 text-sm text-gray-700">{getSelectedLabel()}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {audienceOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="flex-1 text-sm">{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>

          {/* Additional options based on selection */}
          {value === 'segment' && segments.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              <div className="text-xs text-gray-400 px-3 py-1">Select Segment</div>
              {segments.map(segment => (
                <button
                  key={segment._id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  onClick={() => {
                    onChange(value);
                    setIsOpen(false);
                  }}
                >
                  <Layers className="w-4 h-4 text-gray-400" />
                  {segment.name}
                </button>
              ))}
            </div>
          )}

          {value === 'department' && departments.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              <div className="text-xs text-gray-400 px-3 py-1">Select Department</div>
              {departments.map(dept => (
                <button
                  key={dept._id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  onClick={() => {
                    onChange(value);
                    setIsOpen(false);
                  }}
                >
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {dept.name}
                </button>
              ))}
            </div>
          )}

          {value === 'team' && teams.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              <div className="text-xs text-gray-400 px-3 py-1">Select Team</div>
              {teams.map(team => (
                <button
                  key={team._id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  onClick={() => {
                    onChange(value);
                    setIsOpen(false);
                  }}
                >
                  <Users className="w-4 h-4 text-gray-400" />
                  {team.name}
                </button>
              ))}
            </div>
          )}

          {value === 'individual' && users.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              <div className="text-xs text-gray-400 px-3 py-1">Select User</div>
              {users.map(user => (
                <button
                  key={user._id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  onClick={() => {
                    onChange(value);
                    setIsOpen(false);
                  }}
                >
                  <User className="w-4 h-4 text-gray-400" />
                  {user.firstName} {user.lastName}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudienceSelector;