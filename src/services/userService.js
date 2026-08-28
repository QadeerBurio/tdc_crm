// src/services/userService.js
import axios from 'axios';

const API_URL ='https://crmserver-production-4a42.up.railway.app/api';

export const userService = {
  // Get all users
  getAllUsers: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle different response structures
      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        if (response.data.users && Array.isArray(response.data.users)) {
          return response.data.users;
        }
        if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get user by ID
  getUserById: async (id, token) => {
    try {
      const response = await axios.get(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create user
  createUser: async (userData, token) => {
    try {
      const response = await axios.post(`${API_URL}/users`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData, token) => {
    try {
      const response = await axios.put(`${API_URL}/users/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id, token) => {
    try {
      const response = await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};