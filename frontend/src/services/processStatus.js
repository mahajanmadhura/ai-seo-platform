import api from './api';

export const getAuditProcessStatus = async (auditId) => {
  try {
    const res = await api.get(`/api/v1/process-status/audit/${auditId}/`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to load process status.' };
  }
};
