import React, { createContext, useContext, useState, useEffect } from 'react';
import { login, getMe, logout } from '../services/auth';
import { getCreditBalance } from '../services/payments';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(null);
  
  // Future-Ready View Modes: 'admin' | 'user' | 'support' | 'auditor'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('admin_view_mode') || 'admin';
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        try {
          const res = await getMe();
          if (res?.success && res?.data) {
            setUser(res.data);
            setIsAuthenticated(true);

            const balanceRes = await getCreditBalance();
            if (balanceRes.success && balanceRes.data) {
              setCredits(balanceRes.data.balance);
            }
          } else {
            handleLocalLogout();
          }
        } catch (error) {
          handleLocalLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLocalLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('admin_view_mode');
    setUser(null);
    setIsAuthenticated(false);
  };

  const switchViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('admin_view_mode', mode);
  };

  const loginUser = async (email, password) => {
    const res = await login(email, password);
    if (res?.success && res?.data) {
      const { access_token, refresh_token, user: userData } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setUser(userData);
      setIsAuthenticated(true);
    }
    return res;
  };

  const logoutUser = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    handleLocalLogout();
    if (refreshToken) {
      try {
        await logout(refreshToken);
      } catch (error) {
        // Ignore API failures on logout
      }
    }
  };

  const refreshUserProfile = async () => {
    try {
      const res = await getMe();
      if (res?.success && res?.data) {
        setUser(res.data);
      }
    } catch (error) {
      // Profile sync error
    }
  };

  const refreshCredits = async () => {
    try {
      const balanceRes = await getCreditBalance();
      if (balanceRes.success && balanceRes.data) {
        setCredits(balanceRes.data.balance);
      }
    } catch (error) {
      // Profile sync error
    }
  };

  const isAdminUser = Boolean(
    user?.is_staff || user?.is_superuser || user?.role === 'ADMIN' || user?.role === 'admin'
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        credits,
        viewMode,
        switchViewMode,
        isAdminUser,
        refreshCredits,
        loginUser,
        logoutUser,
        refreshUserProfile,
      }}
    >
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
