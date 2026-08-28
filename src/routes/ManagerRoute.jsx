import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ManagerRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isManager = user?.role === 'super_admin' || 
                    user?.role === 'admin' || 
                    user?.role === 'segment_admin' ||
                    user?.role === 'manager';
                    
  if (!isManager) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ManagerRoute;