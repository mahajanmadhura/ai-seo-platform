import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdminUser, viewMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF5F1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#053D34]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If administrator is in default 'admin' mode and visits a user route directly,
  // redirect to admin panel. If viewMode is 'user', allow full customer workspace usage.
  if (isAdminUser && viewMode === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdminUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#36E682]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdminUser, viewMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF5F1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#053D34]" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (isAdminUser && viewMode === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
