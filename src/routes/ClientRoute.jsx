import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ClientRoute = () => {
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

  if (user?.role !== 'client') {
    const roleRoutes = {
      'super_admin': '/dashboard',
      'admin': '/dashboard',
      'segment_admin': '/dashboard',
      'manager': '/dashboard',
      'employee': '/dashboard'
    };
    return <Navigate to={roleRoutes[user?.role] || '/dashboard'} replace />;
  }

  return <Outlet />;
};

export default ClientRoute;