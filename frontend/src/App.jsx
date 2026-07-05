import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';
import PublicFooter from './components/footer/PublicFooter';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Settings from './pages/dashboard/Settings';
import Dashboard from './pages/dashboard/Dashboard';
import WebsiteList from './pages/dashboard/WebsiteList';
import AddWebsite from './pages/dashboard/AddWebsite';
import WebsiteDetail from './pages/dashboard/WebsiteDetail';

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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;