import api from './api';

export const getAdminAnalytics = async () => {
  try {
    const res = await api.get('/api/v1/payments/admin/analytics/');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to load analytics.' };
  }
};

export const getAdminUsers = async () => {
  try {
    const res = await api.get('/api/v1/payments/admin/users/');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to load users.' };
  }
};

export const adjustUserCredits = async (userId, balance) => {
  try {
    const res = await api.put(`/api/v1/payments/admin/users/${userId}/credits/`, { balance });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to adjust credits.' };
  }
};

export const getAdminAuditLogs = async () => {
  try {
    const res = await api.get('/api/v1/payments/admin/audit-logs/');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to load audit logs.' };
  }
};
