import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, PublicRoute, AdminProtectedRoute } from './components/ProtectedRoute';
import Landing from './public/landing/Landing';
import Navbar from './components/Navbar';
import PublicFooter from './components/PublicFooter';
import Login from './public/auth/Login';
import Register from './public/auth/Register';
import VerifyEmail from './public/auth/VerifyEmail';
import ForgotPassword from './public/auth/ForgotPassword';
import ResetPassword from './public/auth/ResetPassword';
import Settings from './client/settings/Settings';
import Dashboard from './client/dashboard/Dashboard';
import WebsiteList from './client/websites/WebsiteList';
import AddWebsite from './client/websites/AddWebsite';
import WebsiteDetail from './client/websites/WebsiteDetail';
import AuditList from './client/audits/AuditList';
import AuditDetail from './client/audits/AuditDetail';
import Transactions from './client/billing/Transactions';
import AdminDashboard from './admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <Landing />
                  <PublicFooter />
                </>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" element={<Navigate to="/settings?tab=profile" replace />} />
            <Route path="/billing" element={<Navigate to="/settings?tab=billing" replace />} />
            <Route path="/credits" element={<Navigate to="/settings?tab=billing" replace />} />
            <Route path="/change-password" element={<Navigate to="/settings?tab=security" replace />} />
            <Route path="/security" element={<Navigate to="/settings?tab=security" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
             <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/websites"
              element={
                <ProtectedRoute>
                  <WebsiteList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/websites/add"
              element={
                <ProtectedRoute>
                  <AddWebsite />
                </ProtectedRoute>
              }
            />
            <Route
              path="/websites/:id"
              element={
                <ProtectedRoute>
                  <WebsiteDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audits"
              element={
                <ProtectedRoute>
                  <AuditList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audits/:id"
              element={
                <ProtectedRoute>
                  <AuditDetail />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;