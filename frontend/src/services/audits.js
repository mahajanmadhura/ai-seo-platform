import api from './api';

export const startAudit = async (data) => {
  try {
    const res = await api.post('/api/v1/audits/start/', data);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to start audit.' };
  }
};

export const getAudits = async () => {
  try {
    const res = await api.get('/api/v1/audits/');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to load audits.' };
  }
};

export const getAuditDetail = async (id) => {
  try {
    const res = await api.get(`/api/v1/audits/${id}/`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to load audit details.' };
  }
};

export const getAuditStatus = async (id) => {
  try {
    const res = await api.get(`/api/v1/audits/${id}/status/`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to load audit status.' };
  }
};

export const getAuditPages = async (id) => {
  try {
    const res = await api.get(`/api/v1/audits/${id}/pages/`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to load pages.' };
  }
};

export const getAuditIssues = async (id) => {
  try {
    const res = await api.get(`/api/v1/audits/${id}/issues/`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to load issues.' };
  }
};

export const getDashboardStats = async () => {
  try {
    const res = await api.get('/api/v1/audits/dashboard-stats/');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to load dashboard stats.' };
  }
};
