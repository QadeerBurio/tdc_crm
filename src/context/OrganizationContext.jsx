// context/OrganizationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const OrganizationContext = createContext(null);

const API_URL = 'https://crmserver-production-4a42.up.railway.app/api';

export const OrganizationProvider = ({ children, token }) => {
  const [company, setCompany] = useState(null);
  const [segments, setSegments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const getHeaders = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  // ============================================
  // COMPANY OPERATIONS
  // ============================================
  const fetchCompany = async () => {
    try {
      // FIX: Use /companies (plural) to match backend routes
      const response = await axios.get(`${API_URL}/organization/companies`, getHeaders());
      
      // Handle different response formats
      const data = response.data.data || response.data;
      
      // If it's an array, get the first company
      if (Array.isArray(data) && data.length > 0) {
        setCompany(data[0]);
        return data[0];
      } 
      // If it's a single object
      else if (data && !Array.isArray(data)) {
        setCompany(data);
        return data;
      } 
      // No company found
      else {
        setCompany(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching company:', error);
      // Don't show toast error if it's just not found - it might be a new company
      if (error.response?.status !== 404) {
        toast.error('Failed to load company');
      }
      return null;
    }
  };

  const updateCompany = async (data) => {
    try {
      setLoading(true);
      
      // FIX: Use the correct endpoint with company ID
      if (!company || !company._id) {
        toast.error('No company found to update');
        return null;
      }
      
      const response = await axios.put(
        `${API_URL}/organization/companies/${company._id}`, 
        data, 
        getHeaders()
      );
      setCompany(response.data.data);
      toast.success('Company updated successfully');
      return response.data.data;
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error(error.response?.data?.message || 'Failed to update company');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SEGMENT OPERATIONS
  // ============================================
  const fetchSegments = async () => {
    try {
      const response = await axios.get(`${API_URL}/organization/segments`, getHeaders());
      setSegments(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching segments:', error);
      toast.error('Failed to load segments');
      return [];
    }
  };

  const createSegment = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/organization/segments`, data, getHeaders());
      setSegments(prev => [...prev, response.data.data]);
      toast.success('Segment created successfully');
      await fetchHierarchy();
      return response.data.data;
    } catch (error) {
      console.error('Error creating segment:', error);
      toast.error('Failed to create segment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSegment = async (id, data) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/organization/segments/${id}`, data, getHeaders());
      setSegments(prev => prev.map(s => s._id === id ? response.data.data : s));
      toast.success('Segment updated successfully');
      await fetchHierarchy();
      return response.data.data;
    } catch (error) {
      console.error('Error updating segment:', error);
      toast.error('Failed to update segment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSegment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this segment? This will also delete all departments and teams under it.')) return false;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/organization/segments/${id}`, getHeaders());
      setSegments(prev => prev.filter(s => s._id !== id));
      toast.success('Segment deleted successfully');
      await fetchHierarchy();
      return true;
    } catch (error) {
      console.error('Error deleting segment:', error);
      toast.error('Failed to delete segment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DEPARTMENT OPERATIONS
  // ============================================
  const fetchDepartments = async (segmentId = null) => {
    try {
      const url = segmentId 
        ? `${API_URL}/organization/departments?segmentId=${segmentId}`
        : `${API_URL}/organization/departments`;
      const response = await axios.get(url, getHeaders());
      setDepartments(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
      return [];
    }
  };

  const createDepartment = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/organization/departments`, data, getHeaders());
      setDepartments(prev => [...prev, response.data.data]);
      toast.success('Department created successfully');
      await fetchHierarchy();
      return response.data.data;
    } catch (error) {
      console.error('Error creating department:', error);
      toast.error('Failed to create department');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (id, data) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/organization/departments/${id}`, data, getHeaders());
      setDepartments(prev => prev.map(d => d._id === id ? response.data.data : d));
      toast.success('Department updated successfully');
      await fetchHierarchy();
      return response.data.data;
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error('Failed to update department');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? This will also delete all teams under it.')) return false;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/organization/departments/${id}`, getHeaders());
      setDepartments(prev => prev.filter(d => d._id !== id));
      toast.success('Department deleted successfully');
      await fetchHierarchy();
      return true;
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // TEAM OPERATIONS
  // ============================================
  const fetchTeams = async (departmentId = null) => {
    try {
      const url = departmentId 
        ? `${API_URL}/organization/teams?departmentId=${departmentId}`
        : `${API_URL}/organization/teams`;
      const response = await axios.get(url, getHeaders());
      setTeams(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
      return [];
    }
  };

  const createTeam = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/organization/teams`, data, getHeaders());
      setTeams(prev => [...prev, response.data.data]);
      toast.success('Team created successfully');
      await fetchHierarchy();
      return response.data.data;
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (id, data) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/organization/teams/${id}`, data, getHeaders());
      setTeams(prev => prev.map(t => t._id === id ? response.data.data : t));
      toast.success('Team updated successfully');
      await fetchHierarchy();
      return response.data.data;
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return false;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/organization/teams/${id}`, getHeaders());
      setTeams(prev => prev.filter(t => t._id !== id));
      toast.success('Team deleted successfully');
      await fetchHierarchy();
      return true;
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HIERARCHY OPERATIONS
  // ============================================
  const fetchHierarchy = async () => {
    try {
      const response = await axios.get(`${API_URL}/organization/hierarchy`, getHeaders());
      setHierarchy(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
      return null;
    }
  };

  // ============================================
  // BULK OPERATIONS
  // ============================================
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCompany(),
        fetchSegments(),
        fetchDepartments(),
        fetchTeams(),
        fetchHierarchy()
      ]);
    } catch (error) {
      console.error('Error loading all data:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // State
    company,
    segments,
    departments,
    teams,
    hierarchy,
    loading,
    selectedSegment,
    selectedDepartment,
    
    // Setters
    setSelectedSegment,
    setSelectedDepartment,
    
    // Company
    fetchCompany,
    updateCompany,
    
    // Segments
    fetchSegments,
    createSegment,
    updateSegment,
    deleteSegment,
    
    // Departments
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    
    // Teams
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    
    // Hierarchy
    fetchHierarchy,
    
    // Bulk
    loadAllData
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};