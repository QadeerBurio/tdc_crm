import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const API_URL ='https://crmserver-production-4a42.up.railway.app/api';

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardRoute, setDashboardRoute] = useState('/dashboard');

  // Helper functions for localStorage
  const getToken = () => localStorage.getItem('auth_token');
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('auth_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };
  const removeToken = () => {
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
  };
  const getUser = () => {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  };
  const setUser = (userData) => {
    if (userData) {
      localStorage.setItem('auth_user', JSON.stringify(userData));
    }
  };
  const clearAuth = () => {
    removeToken();
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_dashboard');
  };

  useEffect(() => {
    const token = getToken();
    const savedUser = getUser();
    const savedDashboard = localStorage.getItem('auth_dashboard');
    
    if (token && savedUser) {
      setUserState(savedUser);
      setDashboardRoute(savedDashboard || '/dashboard');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim(),
        password
      });

      const { token, user, dashboardRoute: route } = response.data;

      if (token && user) {
        setToken(token);
        setUser(user);
        setUserState(user);
        setDashboardRoute(route || '/dashboard');
        
        if (route) {
          localStorage.setItem('auth_dashboard', route);
        }

        return {
          success: true,
          user,
          dashboardRoute: route || '/dashboard',
          role: user.role
        };
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (err.response.status === 404) {
          errorMessage = 'Server not found. Please check if the backend is running.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check your network.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const { firstName, lastName, email, password, role } = userData;

      const response = await axios.post(`${API_URL}/auth/register`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role: role || 'employee'
      });

      if (response.data.success) {
        toast.success('Registration successful! Please login.');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response) {
        if (err.response.status === 409) {
          errorMessage = 'Email already registered. Please login instead.';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid registration data.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check your network.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = getToken();
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
      setUserState(null);
      setDashboardRoute('/dashboard');
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    setUserState(userData);
  };

  const clearError = () => setError(null);

  const getDashboardRoute = () => {
    return dashboardRoute || '/dashboard';
  };

  const hasRole = (roleOrRoles) => {
    if (!user) return false;
    const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    return roles.includes(user.role);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'admin') return true;
    return user.permissions?.includes(permission) || false;
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    token: getToken(),
    dashboardRoute,
    login,
    register,
    logout,
    updateUser,
    clearError,
    getDashboardRoute,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;